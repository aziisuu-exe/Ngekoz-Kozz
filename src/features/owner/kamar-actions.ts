"use server";

import { createClient } from "@supabase/supabase-js";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { kamarSchema, KamarInput } from "./kamar-schema";

async function verifyOwnerSession() {
  const session = await auth();
  if (!session || session.user.role !== "owner") {
    redirect("/");
  }
  return session.user;
}

export async function getOwnerKosDropdownOptions() {
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

  const { data, error } = await supabase
    .from("detail_kos")
    .select("id, nama_kos")
    .eq(ownerKey, user.id)
    .order("nama_kos", { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function getPaginatedKamarList(
  kosIdFilter?: string,
  search?: string,
  page: number = 1,
  pageSize: number = 9
) {
  const user = await verifyOwnerSession();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const kosOptions = await getOwnerKosDropdownOptions();
  const myKosIds = kosOptions.map(k => k.id);

  if (myKosIds.length === 0) {
    return { data: [], totalPages: 0, totalItems: 0, kosOptions: [] };
  }

  let query = supabase
    .from("kamar_kos")
    .select("id, id_detail_kos, nomor_kamar, ukuran, deskripsi, price_per_month, price_per_day, total_kamar, kamar_tersedia, is_available", { count: "exact" });

  if (kosIdFilter && kosIdFilter !== "all") {
    query = query.eq("id_detail_kos", Number(kosIdFilter));
  } else {
    query = query.in("id_detail_kos", myKosIds);
  }

  if (search) {
    query = query.ilike("nomor_kamar", `%${search}%`);
  }

  const { data, count, error } = await query
    .order("id", { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);

  const mappedData = (data || []).map((item: any) => {
    const parentKos = kosOptions.find(k => String(k.id) === String(item.id_detail_kos));
    return {
      id: item.id,
      id_detail_kos: item.id_detail_kos,
      nama_kos: parentKos ? parentKos.nama_kos : "Properti Tidak Ditemukan",
      nomor_kamar: item.nomor_kamar || "Tipe Standard",
      harga_bulanan: Number(item.price_per_month || 0),
      harga_harian: Number(item.price_per_day || 0),
      total_kamar: Number(item.total_kamar || 0),
      kamar_tersedia: Number(item.kamar_tersedia ?? item.total_kamar ?? 0),
      ukuran: item.ukuran || "3x3 m",
      deskripsi: item.deskripsi || "",
      is_available: item.is_available ?? true
    };
  });

  return {
    data: mappedData,
    totalPages: count ? Math.ceil(count / pageSize) : 0,
    totalItems: count || 0,
    kosOptions
  };
}

export async function upsertKamarAction(id: number | null, input: KamarInput) {
  await verifyOwnerSession();
  const validated = kamarSchema.parse(input);
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const payload = {
    id_detail_kos: validated.id_detail_kos,
    nomor_kamar: validated.nomor_kamar,
    price_per_month: validated.price_per_month,
    price_per_day: validated.price_per_day,
    total_kamar: validated.total_kamar,
    kamar_tersedia: validated.kamar_tersedia,
    ukuran: validated.ukuran,
    deskripsi: validated.deskripsi,
    is_available: validated.is_available
  };

  let error;
  if (id) {
    const { error: err } = await supabase.from("kamar_kos").update(payload).eq("id", id);
    error = err;
  } else {
    const { error: err } = await supabase.from("kamar_kos").insert([payload]);
    error = err;
  }

  if (error) throw new Error(error.message);

  revalidatePath("/owner/kamar");
  revalidatePath("/owner/kos");
  revalidatePath("/owner/dashboard");

  return { success: true };
}

export async function deleteKamarAction(id: number) {
  await verifyOwnerSession();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  const { error } = await supabase.from("kamar_kos").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/owner/kamar");
  revalidatePath("/owner/kos");
  revalidatePath("/owner/dashboard");

  return { success: true };
}