import { FaqSection } from "@/features/landing/components/faq-section";
import { GuideSection } from "@/features/landing/components/guide-section";
import { HeroSlider } from "@/features/landing/components/hero-slider";
import { PromoBanner } from "@/features/landing/components/promo-banner";
import { getRecommendedKos } from "@/features/properties/actions";
import { KosCard } from "@/features/properties/components/kos-card";
import { IconFlame } from "@tabler/icons-react";

export default async function LandingPage() {
  const kosList = await getRecommendedKos();

  return (
    <div className="flex flex-col w-full">
      <HeroSlider />

      <section className="w-full py-16 md:py-24 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <IconFlame className="text-orange-500" size={24} />
                <h2 className="text-sm font-bold text-orange-500 uppercase tracking-wider">Paling Dicari</h2>
              </div>
              <h3 className="text-3xl font-bold text-gray-900">Rekomendasi Kos Pilihan</h3>
              <p className="text-gray-500 mt-2">Temukan kos dengan rating terbaik dan fasilitas lengkap di sekitarmu.</p>
            </div>
            
            <a href="/search" className="text-sm font-semibold text-purple-700 hover:text-purple-800 transition-colors">
              Lihat Semua Kos &rarr;
            </a>
          </div>

          {kosList.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {kosList.map((kos) => (
                <KosCard key={kos.id} kos={kos} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 border-dashed">
              <p className="text-gray-500 font-medium">Belum ada data kos yang tersedia saat ini.</p>
            </div>
          )}

        </div>
      </section>
      <PromoBanner />
      <GuideSection />
      <FaqSection />
    </div>
  );
}