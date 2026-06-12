import { getKosDetailBySlug } from "@/features/properties/actions";
import { notFound } from "next/navigation";
import { 
  IconMapPin, 
  IconStarFilled, 
  IconEye, 
  IconShare, 
  IconFlag, // <-- Ganti IconHeart jadi IconFlag
  IconCamera // <-- Tambahkan icon kamera
} from "@tabler/icons-react";
import Image from "next/image";
import { KosPhotoGallery } from "@/features/properties/components/kos-photo-gallery";
import { KosFacilities } from "@/features/properties/components/kos-facilities";

export default async function DetailKosPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const kos = await getKosDetailBySlug(resolvedParams.slug);

  if (!kos) {
    notFound();
  }

  // Siapkan data foto untuk Grid Mozaik
  const photos = kos.foto_kos || [];
  const mainPhoto = photos[0]; // Foto utama (kiri besar)
  const otherPhotos = photos.slice(1, 5); // Maksimal 4 foto tambahan (kanan)
  const remainingCount = photos.length > 5 ? photos.length - 5 : 0; // Sisa foto jika lebih dari 5

  return (
    <div className="w-full bg-white pb-24">
      
      {/* 1. HEADER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">{kos.nama_kos}</h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
              <div className="flex items-center gap-1 text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md">
                <IconStarFilled size={16} />
                <span>{kos.rating_avg} ({kos.total_review} ulasan)</span>
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                <IconMapPin size={18} className="text-gray-400" />
                <span>{kos.alamat}, {kos.kecamatan}, {kos.kota}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-400">
                <IconEye size={18} />
                <span>Dilihat {kos.view_count} kali</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1 md:pt-0">
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold transition-colors">
              <IconShare size={18} /> Bagikan
            </button>
            {/* Ubah tombol Simpan menjadi Laporkan */}
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 font-semibold transition-colors">
              <IconFlag size={18} /> Laporkan
            </button>
          </div>
        </div>
      </div>

      {/* 2. AREA GALERI FOTO (GRID MOZAIK PREMIUM) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <KosPhotoGallery photos={kos.foto_kos} kosName={kos.nama_kos} />
      </div>

      {/* 3. GRID UTAMA (KIRI: DETAIL, KANAN: CARD PEMBAYARAN) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        {/* ... (Isi grid layout detail dan card pemesanan biarkan sama seperti sebelumnya) ... */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Tentang Kos Ini</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{kos.deskripsi}</p>
            </section>
            <KosFacilities fasilitas={kos.fasilitas} />
            <div className="p-8 border-2 border-dashed border-gray-200 rounded-2xl text-center text-gray-400">
              [Area Fasilitas, Aturan, Google Maps, dan Review akan dibangun di sini]
            </div>
          </div>

          <div className="lg:col-span-1">
             <div className="sticky top-28 p-8 border border-gray-200 rounded-3xl shadow-xl shadow-gray-200/50">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Pesan Kamar</h3>
                <p className="text-gray-500 mb-6">Mulai dari Rp 500.000 / bulan</p>
                <div className="h-48 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 mb-6">
                  [Card Pembayaran & Chat Owner]
                </div>
             </div>
          </div>

        </div>
      </div>

    </div>
  );
}