"use server";

import { createClient } from "@supabase/supabase-js";

export interface KosData {
  id: number | string;
  nama_kos: string;
  deskripsi: string;
  alamat: string;
  rating_avg: number;
  harga_termurah: number; 
  status_tersedia: boolean; 
  foto_utama: string;
  sisa_kamar: number;
  gender_type: string;
  view_count: number;
}

export async function getRecommendedKos(): Promise<KosData[]> {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabaseAdmin
      .from('detail_kos')
      .select(`
        id,
        nama_kos,
        deskripsi,
        alamat,
        rating_avg,
        gender_type,
        view_count,
        kamar_kos (
          price_per_month,
          is_available,
          kamar_tersedia
        ),
        foto_kos (
          image_url,
          thumbnail
        )
      `)
      .eq('is_active', true) 
      .limit(6);

    if (error) {
      console.error("Gagal mengambil data kos:", error.message);
      return [];
    }

    const formattedData: KosData[] = data.map((kos: any) => {
      const daftarKamar = kos.kamar_kos || [];

      const harga_termurah = daftarKamar.length > 0 
        ? Math.min(...daftarKamar.map((k: any) => k.price_per_month)) 
        : 0;
        
      const status_tersedia = daftarKamar.some((k: any) => k.is_available === true);
      const sisa_kamar = daftarKamar.reduce((total: number, kamar: any) => {
        return total + (Number(kamar.kamar_tersedia) || 0); 
      }, 0);

      const daftarFoto = kos.foto_kos || [];
      const fotoThumbnail = daftarFoto.find((f: any) => f.thumbnail === true);
      const foto_utama = fotoThumbnail?.image_url 
        ? fotoThumbnail.image_url 
        : "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=600&auto=format&fit=crop";

      return {
        id: kos.id,
        nama_kos: kos.nama_kos,
        deskripsi: kos.deskripsi || "Belum ada deskripsi",
        alamat: kos.alamat || "Lokasi belum ditentukan",
        rating_avg: kos.rating_avg || 0,
        harga_termurah,
        status_tersedia,
        foto_utama,
        sisa_kamar,
        gender_type: kos.gender_type || "campur",
        view_count: kos.view_count || 0
      };
    });

    return formattedData;
  } catch (error) {
    console.error("Terjadi kesalahan pada server:", error);
    return [];
  }
}

export async function getProvinces() {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data, error } = await supabaseAdmin
    .from('provinsi')
    .select('id, nama_provinsi')
    .order('nama_provinsi', { ascending: true });

  if (error) return [];
  return data;
}

export async function getCitiesByProvince(provinceId: string | number) {
  if (!provinceId) return [];
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data, error } = await supabaseAdmin
    .from('kota')
    .select('id, nama_kota')
    .eq('id_provinsi', provinceId)
    .order('nama_kota', { ascending: true });

  if (error) return [];
  return data;
}

export interface SearchResult {
  data: KosData[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
}

export async function getSearchKos(
  keyword: string = "",
  gender: string = "",
  provinsiId: string = "",
  kotaId: string = "",
  page: number = 1,
  limit: number = 15 
): Promise<SearchResult> {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    let query = supabaseAdmin
      .from('detail_kos')
      .select(`
        id,
        nama_kos,
        deskripsi,
        alamat,
        rating_avg,
        gender_type,
        view_count,
        kamar_kos (
          price_per_month,
          is_available,
          kamar_tersedia
        ),
        foto_kos (
          image_url,
          thumbnail
        )
      `, { count: 'exact' })
      .eq('is_active', true);

    if (keyword) {
      query = query.or(`nama_kos.ilike.%${keyword}%,alamat.ilike.%${keyword}%`);
    }

    if (gender && gender !== "semua") {
      query = query.eq('gender_type', gender);
    }

    if (provinsiId && provinsiId !== "semua") {
      query = query.eq('id_provinsi', provinsiId); 
    }

    if (kotaId && kotaId !== "semua") {
      query = query.eq('id_kota', kotaId);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (error) {
      console.error("Gagal mencari data kos:", error.message);
      return { data: [], totalPages: 0, currentPage: 1, totalItems: 0 };
    }

    const formattedData: KosData[] = data.map((kos: any) => {
      const daftarKamar = kos.kamar_kos || [];
      const harga_termurah = daftarKamar.length > 0 
        ? Math.min(...daftarKamar.map((k: any) => k.price_per_month)) 
        : 0;
      const status_tersedia = daftarKamar.some((k: any) => k.is_available === true);

      const sisa_kamar = daftarKamar.reduce((total: number, kamar: any) => {
        return total + (Number(kamar.kamar_tersedia) || 0);
      }, 0);

      const daftarFoto = kos.foto_kos || [];
      const fotoThumbnail = daftarFoto.find((f: any) => f.thumbnail === true);
      const foto_utama = fotoThumbnail?.image_url 
        ? fotoThumbnail.image_url 
        : "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=600&auto=format&fit=crop";

      return {
        id: kos.id,
        nama_kos: kos.nama_kos,
        deskripsi: kos.deskripsi || "Belum ada deskripsi",
        alamat: kos.alamat || "Lokasi belum ditentukan",
        rating_avg: kos.rating_avg || 0,
        harga_termurah,
        status_tersedia,
        foto_utama,
        sisa_kamar,
        gender_type: kos.gender_type || "campur",
        view_count: kos.view_count || 0
      };
    });

    const totalItems = count || 0;
    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: formattedData,
      totalPages,
      currentPage: page,
      totalItems
    };
  } catch (error) {
    console.error("Terjadi kesalahan pencarian:", error);
    return { data: [], totalPages: 0, currentPage: 1, totalItems: 0 };
  }
}