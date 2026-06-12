"use server";

import { createClient } from "@supabase/supabase-js";

export interface KosData {
  id: number | string;
  slug: string;
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
        slug,
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
        slug: kos.slug,
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
        slug,
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
        slug: kos.slug,
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

export interface KosDetailData {
  id: string | number;
  slug: string;
  nama_kos: string;
  deskripsi: string;
  alamat: string;
  latitude: string;
  longitude: string;
  rating_avg: number;
  total_review: number;
  view_count: number;
  gender_type: string;
  
  provinsi: string;
  kota: string;
  kecamatan: string;
  
  owner: {
    id: string;
    nama: string;
    profile_photo: string;
    phone: string;
  };

  foto_kos: { 
    url: string; 
    thumbnail: boolean 
  }[];

  kamar_kos: { 
    id: number | string;
    nomor_kamar: string;
    ukuran: string;
    price_per_month: number; 
    price_per_day: number; 
    kamar_tersedia: number 
  }[];

  fasilitas: { 
    id: number; 
    nama_fasilitas: string; 
    icon: string 
  }[];

  aturan: { 
    id: number; 
    nama_aturan: string 
  }[];

  reviews: { 
    id: number; 
    rating: number; 
    comment: string;
    is_verified: boolean; 
    created_at: string; 
    users: { 
      nama: string; 
      profile_photo: string 
    } }[];
}

export async function getKosDetailBySlug(slug: string): Promise<KosDetailData | null> {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabaseAdmin
      .from('detail_kos')
      .select(`
        *,
        provinsi:id_provinsi (nama_provinsi),
        kota:id_kota (nama_kota),
        kecamatan:id_kecamatan (nama_kecamatan),
        owner:users!id_owner (id, nama, profile_photo, phone), 
        foto_kos (image_url, thumbnail),
        kamar_kos (id, nomor_kamar, ukuran, price_per_month, price_per_day, kamar_tersedia, is_available), 
        fasilitas_kos ( fasilitas (id, nama_fasilitas, icon) ),
        aturan_kos ( aturan (id, nama_aturan) ),
        review (id, rating, comment, is_verified, created_at, users (nama, profile_photo))
      `)
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      console.error("Gagal mengambil detail kos:", error?.message);
      return null;
    }

    const rawFotoKos = (data.foto_kos || []).filter(
      (f: any) => f.url && f.url.trim() !== ""
    );

    const rawKamarPhotos = (data.kamar_kos || [])
      .filter((k: any) => k.image_url && k.image_url.trim() !== "")
      .map((k: any) => ({ url: k.image_url, thumbnail: false })); 

    const combinedPhotos = (data.foto_kos || [])
      .filter((f: any) => f.image_url && f.image_url.trim() !== "")
      .map((f: any) => ({
        url: f.image_url, 
        thumbnail: f.thumbnail
      }));

    combinedPhotos.sort((a: any, b: any) => (b.thumbnail ? 1 : 0) - (a.thumbnail ? 1 : 0));
    const rawOwner = data.owner;
    const formattedOwner = Array.isArray(rawOwner) ? rawOwner[0] : rawOwner;

    const formattedReviews = (data.review || []).map((rev: any) => {
      const rawUser = rev.users;
      return {
        id: rev.id,
        rating: Number(rev.rating) || 0,
        comment: rev.comment || "",
        is_verified: rev.is_verified || false,
        created_at: rev.created_at,
        users: Array.isArray(rawUser) ? rawUser[0] : (rawUser || { nama: "Anonymous", profile_photo: "" })
      };
    });

    return {
      id: data.id,
      slug: data.slug,
      nama_kos: data.nama_kos,
      deskripsi: data.deskripsi || "Belum ada deskripsi.",
      alamat: data.alamat,
      latitude: data.latitude || "",
      longitude: data.longitude || "",
      rating_avg: data.rating_avg || 0,
      total_review: data.total_review || data.review?.length || 0,
      view_count: data.view_count || 0,
      gender_type: data.gender_type || "campur",
      
      provinsi: data.provinsi?.nama_provinsi || "",
      kota: data.kota?.nama_kota || "",
      kecamatan: data.kecamatan?.nama_kecamatan || "",
      
      owner: formattedOwner || { id: "", nama: "Owner", profile_photo: "", phone: "" },
      
      foto_kos: combinedPhotos,
      
      kamar_kos: (data.kamar_kos || []).filter((k: any) => k.is_available),
      
      fasilitas: (data.fasilitas_kos || [])
        .map((fk: any) => fk.fasilitas)
        .filter((f: any) => f !== null),
        
      aturan: (data.aturan_kos || [])
        .map((ak: any) => ak.aturan)
        .filter((a: any) => a !== null),
        
      reviews: formattedReviews
    };

  } catch (error) {
    console.error("Exception di getKosDetailBySlug:", error);
    return null;
  }
}