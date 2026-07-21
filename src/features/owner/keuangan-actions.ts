"use server";

import { createClient } from "@supabase/supabase-js";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

async function verifyOwnerSession() {
  const session = await auth();
  if (!session || session.user.role !== "owner") {
    redirect("/");
  }
  return session.user;
}

export async function getOwnerFinancialSummary(monthFilter?: string, yearFilter?: string) {
  const user = await verifyOwnerSession();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

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
    return {
      stats: { grossRevenue: 0, platformFee: 0, nettRevenue: 0, pendingRevenue: 0, totalTransactions: 0 },
      monthlyBreakdown: [],
      recentTransactions: []
    };
  }

  const kosIds = myKos.map(k => k.id);

  const { data: rawReservasi, error } = await supabase
    .from("reservasi")
    .select("id, kode_reservasi, id_detail_kos, harga_sewa, biaya_admin, total_harga, status, created_at")
    .in("id_detail_kos", kosIds)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  let grossRevenue = 0;
  let platformFee = 0;
  let nettRevenue = 0;
  let pendingRevenue = 0;
  let totalTransactions = 0;

  const validPaidStatus = ["paid", "completed", "approved", "disetujui"];
  const validPendingStatus = ["pending", "waiting_payment", "menunggu"];

  const filteredReservasi = (rawReservasi || []).filter((res: any) => {
    if (!monthFilter || monthFilter === "all") return true;
    const date = new Date(res.created_at);
    return date.getMonth() + 1 === Number(monthFilter);
  });

  filteredReservasi.forEach((res: any) => {
    const st = String(res.status || "").toLowerCase();
    const tot = Number(res.total_harga || 0);
    const adm = Number(res.biaya_admin || 0);

    if (validPaidStatus.includes(st)) {
      grossRevenue += tot;
      platformFee += adm;
      nettRevenue += (tot - adm);
      totalTransactions += 1;
    } else if (validPendingStatus.includes(st)) {
      pendingRevenue += tot;
    }
  });

  const recentTransactions = filteredReservasi.slice(0, 5).map((res: any) => {
    const kos = myKos.find(k => k.id === res.id_detail_kos);
    return {
      id: res.id,
      kode_reservasi: res.kode_reservasi || `RES-${res.id}`,
      nama_kos: kos ? kos.nama_kos : "Properti Kos",
      total_harga: Number(res.total_harga || 0),
      biaya_admin: Number(res.biaya_admin || 0),
      nett: Number(res.total_harga || 0) - Number(res.biaya_admin || 0),
      status: res.status,
      created_at: res.created_at
    };
  });

  return {
    stats: {
      grossRevenue,
      platformFee,
      nettRevenue,
      pendingRevenue,
      totalTransactions
    },
    recentTransactions
  };
}