"use server";

import { createClient } from "@supabase/supabase-js";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

async function verifyOwnerSession() {
  const session = await auth();
  if (!session || session.user.role !== "owner") {
    redirect("/");
  }
  return session.user;
}

export async function getOwnerReservasiList(
  statusFilter?: string,
  search?: string,
  page: number = 1,
  pageSize: number = 8
) {
  const user = await verifyOwnerSession();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data: sampleKos } = await supabase.from("detail_kos").select("*").limit(1);
  let ownerKey = "id_user";
  if (sampleKos && sampleKos.length > 0) {
    ownerKey = Object.keys(sampleKos[0]).find(k => 
      ["id_user", "user_id", "owner_id", "id_owner"].includes(k)
    ) || "id_user";
  }

  const { data: myKos } = await supabase
    .from("detail_kos")
    .select("id, nama_kos")
    .eq(ownerKey, user.id);

  if (!myKos || myKos.length === 0) {
    return { data: [], totalPages: 0, totalItems: 0 };
  }

  const kosIds = myKos.map(k => k.id);
  const kosMap = new Map(myKos.map(k => [k.id, k.nama_kos]));

  let query = supabase
    .from("reservasi")
    .select("id, kode_reservasi, id_user, id_detail_kos, id_kamar, tanggal_check_in, tanggal_check_out, duration_values, durasi, tambahan_keterangan, harga_sewa, biaya_admin, total_harga, status, created_at", { count: "exact" })
    .in("id_detail_kos", kosIds);

  if (statusFilter && statusFilter !== "all") {
    if (statusFilter === "approved" || statusFilter === "disetujui" || statusFilter === "paid") {
      query = query.in("status", ["paid", "completed"]);
    } else if (statusFilter === "rejected" || statusFilter === "ditolak" || statusFilter === "cancelled") {
      query = query.eq("status", "cancelled");
    } else if (statusFilter === "pending" || statusFilter === "menunggu") {
      query = query.in("status", ["pending", "waiting_payment"]);
    } else {
      query = query.eq("status", statusFilter);
    }
  }

  const { data: rawReservasi, count, error } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);

  const userIds = Array.from(new Set((rawReservasi || []).map((r: any) => r.id_user).filter(Boolean)));
  const kamarIds = Array.from(new Set((rawReservasi || []).map((r: any) => r.id_kamar).filter(Boolean)));

  const [{ data: users }, { data: kamars }] = await Promise.all([
    userIds.length > 0
      ? supabase.from("users").select("*").in("id", userIds)
      : Promise.resolve({ data: [] }),
    kamarIds.length > 0
      ? supabase.from("kamar_kos").select("id, nomor_kamar, ukuran").in("id", kamarIds)
      : Promise.resolve({ data: [] })
  ]);

  const userMap = new Map((users || []).map((u: any) => [String(u.id), u]));
  const kamarMap = new Map((kamars || []).map((k: any) => [String(k.id), k]));

  const mappedData = (rawReservasi || []).map((res: any) => {
    const userInfo = userMap.get(String(res.id_user));
    const kamarInfo = kamarMap.get(String(res.id_kamar));
    const dbStatus = String(res.status || "pending").toLowerCase();

    let uiStatus = "pending";
    if (["paid", "completed"].includes(dbStatus)) {
      uiStatus = "approved";
    } else if (dbStatus === "cancelled") {
      uiStatus = "rejected";
    }

    const namaPenyewa = userInfo?.nama || userInfo?.name || userInfo?.username || "Penyewa";
    const emailPenyewa = userInfo?.email || "-";
    const phonePenyewa = userInfo?.phone || userInfo?.telepon || userInfo?.no_hp || "-";
    const fotoPenyewa = userInfo?.profile_photo || userInfo?.image || userInfo?.avatar_url || null;

    return {
      id: res.id,
      kode_reservasi: res.kode_reservasi || `RES-${res.id}`,
      id_detail_kos: res.id_detail_kos,
      nama_kos: kosMap.get(res.id_detail_kos) || "Properti Kos",
      nama_penyewa: namaPenyewa,
      email_penyewa: emailPenyewa,
      phone_penyewa: phonePenyewa,
      foto_penyewa: fotoPenyewa,
      nomor_kamar: kamarInfo?.nomor_kamar || "Standard Room",
      durasi: Number(res.durasi || 1),
      duration_values: res.duration_values || "Bulan",
      tanggal_check_in: res.tanggal_check_in || res.created_at || null,
      tanggal_check_out: res.tanggal_check_out || null,
      harga_sewa: Number(res.harga_sewa || 0),
      biaya_admin: Number(res.biaya_admin || 0),
      total_harga: Number(res.total_harga || 0),
      status: uiStatus,
      raw_status: dbStatus,
      created_at: res.created_at
    };
  });

  let filteredData = mappedData;
  if (search) {
    const s = search.toLowerCase();
    filteredData = mappedData.filter(
      r => r.nama_penyewa.toLowerCase().includes(s) || 
           r.nama_kos.toLowerCase().includes(s) ||
           r.kode_reservasi.toLowerCase().includes(s)
    );
  }

  return {
    data: filteredData,
    totalPages: count ? Math.ceil(count / pageSize) : 0,
    totalItems: count || 0
  };
}

export async function updateStatusReservasiAction(reservasiId: number, targetStatus: "approved" | "rejected") {
  await verifyOwnerSession();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: reservasi, error: fetchErr } = await supabase
    .from("reservasi")
    .select("id, id_kamar, status")
    .eq("id", reservasiId)
    .single();

  if (fetchErr || !reservasi) {
    throw new Error("Data reservasi tidak ditemukan.");
  }

  const dbStatusValue = targetStatus === "approved" ? "paid" : "cancelled";

  const { error: updateErr } = await supabase
    .from("reservasi")
    .update({ 
      status: dbStatusValue,
      ...(targetStatus === "rejected" ? { cancelled_at: new Date().toISOString(), cancel_reason: "Ditolak oleh pemilik kos" } : {})
    })
    .eq("id", reservasiId);

  if (updateErr) throw new Error(updateErr.message);

  if (reservasi.id_kamar) {
    const { data: kamar } = await supabase
      .from("kamar_kos")
      .select("kamar_tersedia")
      .eq("id", reservasi.id_kamar)
      .single();

    if (kamar) {
      let currentStock = Number(kamar.kamar_tersedia || 0);

      if (targetStatus === "approved" && reservasi.status !== "paid") {
        currentStock = Math.max(0, currentStock - 1);
      } else if (targetStatus === "rejected" && (reservasi.status === "paid" || reservasi.status === "completed")) {
        currentStock = currentStock + 1;
      }

      await supabase
        .from("kamar_kos")
        .update({ kamar_tersedia: currentStock })
        .eq("id", reservasi.id_kamar);
    }
  }

  revalidatePath("/owner/reservasi");
  revalidatePath("/owner/kamar");
  revalidatePath("/owner/dashboard");

  return { success: true };
}