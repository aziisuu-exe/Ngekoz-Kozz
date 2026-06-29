import { getSearchKos, getProvinces } from "@/features/properties/actions";
import { KosCard } from "@/features/properties/components/kos-card";
import { IconFilterOff, IconChevronLeft, IconChevronRight, IconFilter } from "@tabler/icons-react";
import Link from "next/link";
import { SearchForm } from "@/features/search/components/search-form";
import { ViewCounter } from "@/components/view-counter";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ 
    q?: string; 
    gender?: string; 
    provinsi?: string; 
    kota?: string; 
    page?: string 
  }>;
}) {
  const resolvedParams = await searchParams;
  const searchQuery = resolvedParams.q || "";
  const genderQuery = resolvedParams.gender || "semua";
  const provinsiQuery = resolvedParams.provinsi || "semua";
  const kotaQuery = resolvedParams.kota || "semua";
  const currentPage = Number(resolvedParams.page) || 1;
  const currentQuery = resolvedParams.q ? `?q=${resolvedParams.q}` : "";
  const dynamicUrl = `/search${currentQuery}`;
  
  const result = await getSearchKos(searchQuery, genderQuery, provinsiQuery, kotaQuery, currentPage, 15);
  const { data: kosList, totalPages, totalItems } = result;

  const provincesList = await getProvinces();

  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (genderQuery !== "semua") params.set("gender", genderQuery);
    if (provinsiQuery !== "semua") params.set("provinsi", provinsiQuery);
    if (kotaQuery !== "semua") params.set("kota", kotaQuery);
    params.set("page", pageNumber.toString());
    return `/search?${params.toString()}`;
  };

  return (
    <>
    <div className="w-full min-h-screen bg-gray-50/50 pb-24">
      <div className="bg-white border-b border-gray-100 py-8 md:py-12">
      
      <ViewCounter url={dynamicUrl} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-start gap-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Temukan Tempat Tinggal Terbaik</h1>
            <p className="text-gray-500 mt-1">Gunakan filter cerdas untuk membatasi pencarian kos sesuai kriteriamu.</p>
          </div>
          
          <SearchForm 
            initialQuery={searchQuery} 
            initialGender={genderQuery} 
            initialProvinsi={provinsiQuery}
            initialKota={kotaQuery}
            provinces={provincesList}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <IconFilter size={20} className="text-purple-600" />
            Hasil Pencarian Properti
          </h2>
          <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {totalItems} properti ditemukan
          </span>
        </div>

        {kosList.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
              {kosList.map((kos) => (
                <KosCard key={kos.id} kos={kos} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                {currentPage > 1 ? (
                  <Link href={createPageUrl(currentPage - 1)} className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-purple-50 hover:text-purple-700 transition-colors">
                    <IconChevronLeft size={20} />
                  </Link>
                ) : (
                  <span className="p-2 rounded-lg border border-gray-100 text-gray-300 cursor-not-allowed"><IconChevronLeft size={20} /></span>
                )}

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Link
                      key={page}
                      href={createPageUrl(page)}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg font-semibold transition-colors ${
                        page === currentPage 
                          ? "bg-purple-600 text-white shadow-md" 
                          : "text-gray-600 hover:bg-purple-50 hover:text-purple-700"
                      }`}
                    >
                      {page}
                    </Link>
                  ))}
                </div>

                {currentPage < totalPages ? (
                  <Link href={createPageUrl(currentPage + 1)} className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-purple-50 hover:text-purple-700 transition-colors">
                    <IconChevronRight size={20} />
                  </Link>
                ) : (
                  <span className="p-2 rounded-lg border border-gray-100 text-gray-300 cursor-not-allowed"><IconChevronRight size={20} /></span>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 border-dashed text-center px-4">
            <div className="h-16 w-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mb-4">
              <IconFilterOff size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Pencarian Tidak Ditemukan</h3>
            <p className="text-gray-500 max-w-md">Silakan coba ubah kata kunci atau longgarkan filter wilayah Anda.</p>
            <Link href="/search" className="mt-6 text-purple-600 font-semibold hover:text-purple-700">Reset Filter</Link>
          </div>
        )}
      </div>
    </div>  
    </>
  );
}