"use server";

import { createClient } from "@supabase/supabase-js";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { insertKosSchema, InsertKosInput } from "./schema";
import { revalidatePath } from "next/cache";

async function verifyOwnerSession() {
  const session = await auth();
  if (!session || session.user.role !== "owner") {
    redirect("/");
  }
  return session.user;
}

export async function getOwnerDashboardStats() {
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

  const { data: listKos, error: kosError } = await supabase
    .from("detail_kos")
    .select("id, nama_kos")
    .eq(ownerKey, user.id);

  if (kosError || !listKos || listKos.length === 0) {
    return { totalKos: 0, totalKamar: 0, pendapatanBersih: 0, reservasiPending: 0, listKos: [] };
  }

  const kosIds = listKos.map(k => k.id);

  const [{ data: kamars }, { data: reservasis }] = await Promise.all([
    supabase.from("kamar_kos").select("stok_kamar").in("id_detail_kos", kosIds),
    supabase.from("reservasi").select("*").in("id_detail_kos", kosIds)
  ]);

  const totalKamar = (kamars || []).reduce((acc, curr) => acc + (curr.stok_kamar || 0), 0);

  let pendapatanBersih = 0;
  let reservasiPending = 0;

  if (reservasis && reservasis.length > 0) {
    const statusKey = Object.keys(reservasis[0]).find(k => ["status", "status_reservasi"].includes(k)) || "status";
    const priceKey = Object.keys(reservasis[0]).find(k => ["total_harga", "harga", "nominal", "amount"].includes(k)) || "total_harga";

    reservasis.forEach((res: any) => {
      const currentStatus = String(res[statusKey]).toLowerCase();
      if (["paid", "success", "selesai", "approved"].includes(currentStatus)) {
        pendapatanBersih += Number(res[priceKey] || 0);
      } else if (["pending", "menunggu", "waiting"].includes(currentStatus)) {
        reservasiPending += 1;
      }
    });
  }

  return {
    totalKos: listKos.length,
    totalKamar,
    pendapatanBersih,
    reservasiPending,
    listKos
  };
}

export async function getOwnerKosList(search?: string, page: number = 1, pageSize: number = 6) {
  const user = await verifyOwnerSession();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data: sampleKos } = await supabase.from("detail_kos").select("*").limit(1);
  let ownerKey = "id_user";
  let kecamatanFk = "id_kecamatan";
  if (sampleKos && sampleKos.length > 0) {
    ownerKey = Object.keys(sampleKos[0]).find(k => 
      ["id_user", "user_id", "owner_id", "id_owner"].includes(k)
    ) || "id_user";
    
    kecamatanFk = Object.keys(sampleKos[0]).find(k => 
      ["id_kecamatan", "kecamatan_id", "id_kec", "kec_id"].includes(k)
    ) || "id_kecamatan";
  }

  let query = supabase
    .from("detail_kos")
    .select(`id, nama_kos, alamat, approval_status, is_active, created_at, ${kecamatanFk}`, { count: "exact" })
    .eq(ownerKey, user.id);

  if (search) {
    query = query.ilike("nama_kos", `%${search}%`);
  }

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);

  const kecIds = Array.from(new Set((data || []).map((k: any) => k[kecamatanFk]).filter(Boolean)));
  let kecMap: Record<string, string> = {};
  
  if (kecIds.length > 0) {
    const { data: sampleKec } = await supabase.from("kecamatan").select("*").limit(1);
    let kecNameKey = "nama";
    if (sampleKec && sampleKec.length > 0) {
      kecNameKey = Object.keys(sampleKec[0]).find(k => 
        ["nama", "name", "nama_kecamatan"].includes(k)
      ) || "nama";
    }

    const { data: kecData } = await supabase.from("kecamatan").select(`id, ${kecNameKey}`).in("id", kecIds);
    (kecData || []).forEach((k: any) => {
      kecMap[k.id] = k[kecNameKey];
    });
  }

  const kosIds = (data || []).map((k: any) => k.id);
  let kamarCountMap: Record<string, number> = {};
  
  if (kosIds.length > 0) {
    const { data: kamars } = await supabase
      .from("kamar_kos")
      .select("id_detail_kos, stok_kamar")
      .in("id_detail_kos", kosIds);

    (kamars || []).forEach((kam: any) => {
      kamarCountMap[kam.id_detail_kos] = (kamarCountMap[kam.id_detail_kos] || 0) + (kam.stok_kamar || 0);
    });
  }

  const mappedData = (data || []).map((k: any) => ({
    id: k.id,
    nama_kos: k.nama_kos,
    alamat: k.alamat,
    status: k.approval_status || "pending",
    isActive: k.is_active ?? true,
    kecamatan: kecMap[k[kecamatanFk]] || "-",
    totalKamar: kamarCountMap[k.id] || 0
  }));

  return {
    data: mappedData,
    totalPages: count ? Math.ceil(count / pageSize) : 0,
    totalItems: count || 0
  };
}

export async function getKosFormMasterData() {
  await verifyOwnerSession();
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  const [{ data: fasilitasRaw }, { data: aturanRaw }, { data: provinsiRaw }] = await Promise.all([
    supabase.from("fasilitas").select("*").order("id", { ascending: true }),
    supabase.from("aturan").select("*").order("id", { ascending: true }),
    supabase.from("provinsi").select("*").order("id", { ascending: true })
  ]);

  const fasilitas = (fasilitasRaw || []).map((item: any) => ({
    id: item.id,
    nama: item.nama || item.name || item.nama_fasilitas || "Fasilitas"
  }));

  const aturan = (aturanRaw || []).map((item: any) => ({
    id: item.id,
    nama: item.nama || item.name || item.nama_aturan || "Aturan"
  }));

  const provinsi = (provinsiRaw || []).map((item: any) => ({
    id: item.id,
    nama: item.nama || item.name || item.nama_provinsi || "Provinsi"
  }));

  return { fasilitas, aturan, provinsi };
}

export async function getKotaOptionsByProvinsi(provinsiId: number | string) {
  await verifyOwnerSession();
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  
  const { data: sampleKota } = await supabase.from("kota").select("*").limit(1);
  let fkKey = "id_provinsi";
  let nameKey = "nama";

  if (sampleKota && sampleKota.length > 0) {
    const keys = Object.keys(sampleKota[0]);
    fkKey = keys.find(k => ["id_provinsi", "provinsi_id", "prov_id"].includes(k)) || "id_provinsi";
    nameKey = keys.find(k => ["nama", "name", "nama_kota", "nama_kabupaten"].includes(k)) || "nama";
  }

  const { data } = await supabase
    .from("kota")
    .select(`id, ${nameKey}`)
    .eq(fkKey, Number(provinsiId))
    .order("id", { ascending: true });
    
  return (data || []).map((item: any) => ({
    id: item.id,
    nama: item[nameKey] || item.nama || item.name
  }));
}

export async function getKecamatanOptionsByKota(kotaId: number | string) {
  await verifyOwnerSession();
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  
  const { data: sampleKec } = await supabase.from("kecamatan").select("*").limit(1);
  let fkKey = "id_kota";
  let nameKey = "nama";

  if (sampleKec && sampleKec.length > 0) {
    const keys = Object.keys(sampleKec[0]);
    fkKey = keys.find(k => ["id_kota", "kota_id", "kabupaten_id"].includes(k)) || "id_kota";
    nameKey = keys.find(k => ["nama", "name", "nama_kecamatan"].includes(k)) || "nama";
  }

  const { data } = await supabase
    .from("kecamatan")
    .select(`id, ${nameKey}`)
    .eq(fkKey, Number(kotaId))
    .order("id", { ascending: true });
    
  return (data || []).map((item: any) => ({
    id: item.id,
    nama: item[nameKey] || item.nama || item.name
  }));
}

export async function createKosPropertiAction(input: InsertKosInput) {
  const user = await verifyOwnerSession();
  const validated = insertKosSchema.parse(input);
  
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  const { data: sampleKos } = await supabase.from("detail_kos").select("*").limit(1);
  let ownerKey = "id_user";
  if (sampleKos && sampleKos.length > 0) {
    ownerKey = Object.keys(sampleKos[0]).find(k => 
      ["id_user", "user_id", "owner_id", "id_owner"].includes(k)
    ) || "id_user";
  }

  const { data: kosNew, error: kosError } = await supabase
    .from("detail_kos")
    .insert([{
      nama_kos: validated.nama_kos,
      deskripsi: validated.deskripsi,
      alamat: validated.alamat,
      id_kecamatan: validated.id_kecamatan,
      jenis_kos: validated.jenis_kos,
      latitude: validated.latitude,
      longitude: validated.longitude,
      [ownerKey]: user.id,
      approval_status: "pending",
      is_active: true
    }])
    .select("id")
    .single();

  if (kosError || !kosNew) throw new Error(kosError?.message || "Gagal menyimpan entitas properti kos utama.");

  const targetKosId = kosNew.id;
  const inserts: any[] = [];

  if (validated.fasilitasIds.length > 0) {
    const payloadFsl = validated.fasilitasIds.map(fId => ({ id_detail_kos: targetKosId, id_fasilitas: fId }));
    inserts.push(supabase.from("fasilitas_kos").insert(payloadFsl));
  }

  if (validated.aturanIds.length > 0) {
    const payloadAtr = validated.aturanIds.map(aId => ({ id_detail_kos: targetKosId, id_aturan: aId }));
    inserts.push(supabase.from("aturan_kos").insert(payloadAtr));
  }

  if (validated.fotoUrls.length > 0) {
    const payloadFoto = validated.fotoUrls.map(url => ({ id_detail_kos: targetKosId, url: url }));
    inserts.push(supabase.from("foto_kos").insert(payloadFoto));
  }

  await Promise.all(inserts);

  revalidatePath("/owner/kos");
  revalidatePath("/owner/dashboard");
  
  return { success: true, id: targetKosId };
}

export async function uploadKosPhotoAction(formData: FormData) {
  await verifyOwnerSession();
  const file = formData.get("file") as File;

  if (!file) {
    throw new Error("Berkas gambar tidak ditemukan.");
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Format berkas harus berupa JPG, PNG, atau WEBP.");
  }

  const maxSize = 2 * 1024 * 1024; // 2MB
  if (file.size > maxSize) {
    throw new Error("Ukuran berkas gambar maksimal 2MB.");
  }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
  const filePath = `kos-gallery/${fileName}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error } = await supabase.storage
    .from("foto-kos")
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: false
    });

  if (error) {
    const { data: publicData } = supabase.storage.from("foto-kos").getPublicUrl(filePath);
    if (!publicData?.publicUrl) {
      throw new Error(`Gagal mengunggah gambar ke Storage: ${error.message}`);
    }
  }

  const { data: publicUrlData } = supabase.storage
    .from("foto-kos")
    .getPublicUrl(filePath);

  return { url: publicUrlData.publicUrl };
}