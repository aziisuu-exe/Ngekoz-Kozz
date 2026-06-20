import { getKosDetailBySlug } from "@/features/properties/actions";
import { notFound } from "next/navigation";
import { 
  IconMapPin, 
  IconStarFilled, 
  IconEye, 
  IconShare, 
  IconFlag, 
  IconCamera 
} from "@tabler/icons-react";
import Image from "next/image";
import { KosPhotoGallery } from "@/features/properties/components/kos-photo-gallery";
import { KosFacilities } from "@/features/properties/components/kos-facilities";
import { KosRules } from "@/features/properties/components/kos-rules";
import { KosLocation } from "@/features/properties/components/kos-location";
import { KosReviews } from "@/features/properties/components/kos-reviews";
import { BookingCard } from "@/features/properties/components/booking-card";
import { ReportModal } from "@/features/reports/components/report-modal";

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

  const photos = kos.foto_kos || [];
  const mainPhoto = photos[0]; 
  const otherPhotos = photos.slice(1, 5); 
  const remainingCount = photos.length > 5 ? photos.length - 5 : 0; 

  return (
    <div className="w-full bg-white pb-24">
      
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
            <ReportModal idDetailKos={kos.id} namaKos={kos.nama_kos} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <KosPhotoGallery photos={kos.foto_kos} kosName={kos.nama_kos} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Tentang Kos Ini</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{kos.deskripsi}</p>
            </section>
            <KosFacilities fasilitas={kos.fasilitas} />
            <KosRules aturan={kos.aturan} />
            <KosLocation 
              latitude={kos.latitude}
              longitude={kos.longitude}
              alamat={`${kos.alamat}, ${kos.kecamatan}, ${kos.kota}`}
              namaKos={kos.nama_kos}
            />
            <KosReviews 
              reviews={kos.reviews}
              ratingAvg={kos.rating_avg}
              totalReview={kos.total_review}
            />
          </div>

          <div className="lg:col-span-1">
            <BookingCard 
              idDetailKos={kos.id}
              kamarKos={kos.kamar_kos} 
              owner={kos.owner} 
              namaKos={kos.nama_kos}
            />
          </div>

        </div>
      </div>

    </div>
  );
}