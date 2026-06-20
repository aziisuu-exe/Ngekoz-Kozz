"use server";

import { auth } from "@/auth";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const reservationSchema = z.object({
  id_detail_kos: z.number(),
  id_kamar: z.number().or(z.string()),
  tanggal_check_in: z.string(),
  durasi_tipe: z.enum(["bulanan", "harian"]),
  durasi: z.number().min(1),
  total_harga: z.number().min(10000),
  nomor_kamar: z.string()
});

export async function createReservationAction(payload: z.infer<typeof reservationSchema>) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Silakan login terlebih dahulu untuk melakukan reservasi." };
  }

  const validated = reservationSchema.safeParse(payload);
  if (!validated.success) {
    return { error: "Data reservasi tidak valid." };
  }

  const { id_detail_kos, id_kamar, tanggal_check_in, durasi_tipe, durasi, total_harga, nomor_kamar } = validated.data;

  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: userData, error: userError } = await supabaseAdmin
      .from('users') 
      .select('phone, kelamin') // sesuaikan nama kolomnya
      .eq('id', session.user.id)
      .single();

    if (userError || !userData) {
      return { error: "Gagal memverifikasi profil Anda." };
    }

    if (!userData.phone || !userData.kelamin) {
      return { 
        error: "PENDING_BIODATA", 
        message: "Anda harus melengkapi nomor telepon dan jenis kelamin di pengaturan profil sebelum melakukan reservasi." 
      };
    }

    const { data: kosData, error: kosError } = await supabaseAdmin
      .from('detail_kos') 
      .select('gender_type, nama_kos') 
      .eq('id', id_detail_kos)
      .single();

    if (kosError || !kosData) {
      return { error: "Data kos tidak ditemukan." };
    }

    const userGender = userData.kelamin.toLowerCase(); 
    const kosGenderRule = kosData.gender_type.toLowerCase(); 

    if (kosGenderRule !== "campur") {
      if (kosGenderRule === "putra" && userGender !== "laki-laki") {
        return { error: `Kos "${kosData.nama_kos}" hanya menerima penghuni Laki-laki.` };
      }
      if (kosGenderRule === "putri" && userGender !== "perempuan") {
        return { error: `Kos "${kosData.nama_kos}" hanya menerima penghuni Perempuan.` };
      }
    }

    const checkInDate = new Date(tanggal_check_in);
    const checkOutDate = new Date(checkInDate);
    if (durasi_tipe === "bulanan") {
      checkOutDate.setMonth(checkOutDate.getMonth() + durasi);
    } else {
      checkOutDate.setDate(checkOutDate.getDate() + durasi);
    }
    const tglCheckOutStr = checkOutDate.toISOString().split('T')[0];
    const kodeReservasi = `RES-${Date.now()}-${session.user.id.substring(0, 4)}`.toUpperCase();
    const biayaAdmin = 5000;
    const grandTotal = total_harga + biayaAdmin;

    const { data: resData, error: resError } = await supabaseAdmin
      .from('reservasi')
      .insert({
        kode_reservasi: kodeReservasi,
        id_user: session.user.id,
        id_detail_kos,
        id_kamar: Number(id_kamar),
        tanggal_check_in,
        tanggal_check_out: tglCheckOutStr,
        duration_value: durasi_tipe,
        durasi,
        harga_sewa: total_harga,
        biaya_admin: biayaAdmin,
        total_harga: grandTotal,
        status: 'pending'
      })
      .select('id')
      .single();

    if (resError) throw new Error(`DB Reservasi Error: ${resError.message}`);

    const xenditAuth = Buffer.from(process.env.XENDIT_SECRET_KEY + ":").toString("base64");
    const xenditPayload = {
      external_id: kodeReservasi,
      amount: grandTotal,
      payer_email: session.user.email || "user@ngekoz.com",
      description: `Reservasi Kamar ${nomor_kamar} - ${kosData.nama_kos}`,
      invoice_duration: 86400,
      success_redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/profile/reservasi`,
      failure_redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/profile/reservasi`
    };

    const xenditResponse = await fetch("https://api.xendit.co/v2/invoices", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${xenditAuth}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(xenditPayload)
    });

    const xenditData = await xenditResponse.json();
    if (!xenditResponse.ok) throw new Error("Gagal membuat tagihan pembayaran Xendit.");

    const { error: payError } = await supabaseAdmin
      .from('payment')
      .insert({
        id_reservasi: resData.id,
        id_user: session.user.id,
        external_id: xenditData.external_id,
        xendit_invoice_id: xenditData.id,
        xendit_invoice_url: xenditData.invoice_url,
        amount: grandTotal,
        payment_method: "XENDIT",
        status: "pending"
      });

    if (payError) throw new Error(`DB Payment Error: ${payError.message}`);

    return { success: true, invoice_url: xenditData.invoice_url };

  } catch (error: any) {
    console.error("Exception Create Reservation:", error);
    return { error: error.message || "Terjadi kesalahan internal server." };
  }
}