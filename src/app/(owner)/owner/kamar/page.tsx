import { getPaginatedKamarList } from "@/features/owner/kamar-actions";
import Link from "next/link";

import { IconPlus, IconSearch, IconBed, IconBuildingStore, IconPencil, IconChevronLeft, IconChevronRight, IconMaximize } from "@tabler/icons-react";
import { KamarKosFilter } from "../_components/kamar-kos-filter";
import { DeleteKamarAction } from "../_components/delete-kamar";
import { KamarModal } from "../_components/kamar-modal";

interface PageProps {
  searchParams: Promise<{
    kosId?: string;
    search?: string;
    page?: string;
    add?: string;
    edit?: string;
  }>;
}

export default async function OwnerKamarPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const currentKosFilter = resolvedParams.kosId || "all";
  const currentSearch = resolvedParams.search || "";
  const currentPage = Number(resolvedParams.page) || 1;
  const intentAdd = resolvedParams.add === "true";
  const editId = resolvedParams.edit || "";

  const { data = [], totalPages = 0, totalItems = 0, kosOptions = [] } = await getPaginatedKamarList(
    currentKosFilter,
    currentSearch,
    currentPage,
    9
  );

  const selectedEditItem = editId ? data.find((item: any) => String(item.id) === String(editId)) : null;
  const cleanParamsString = `kosId=${currentKosFilter}&search=${currentSearch}&page=${currentPage}`;
  const modalCloseUrl = `/owner/kamar?${cleanParamsString}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Stok & Tipe Kamar Kos</h1>
          <p className="text-sm text-gray-500 mt-0.5">Atur variasi tipe kamar, dimensi, stok unit, dan penentuan tarif sewa bulanan</p>
        </div>

        {kosOptions.length > 0 && (
          <Link
            href={`/owner/kamar?add=true&${cleanParamsString}`}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors shadow-xs shrink-0 cursor-pointer"
          >
            <IconPlus size={16} strokeWidth={3} />
            Tambah Tipe Kamar
          </Link>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider shrink-0">Filter Kos:</span>
          <KamarKosFilter
            currentKosFilter={currentKosFilter}
            kosOptions={kosOptions}
          />
        </div>

        <form method="GET" className="relative w-full sm:w-64 shrink-0">
          <IconSearch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            name="search"
            defaultValue={currentSearch}
            placeholder="Cari tipe kamar..."
            className="w-full pl-10 pr-4 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 font-medium text-gray-900"
          />
          <input type="hidden" name="kosId" value={currentKosFilter} />
        </form>
      </div>

      {data.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center shadow-xs max-w-xl mx-auto mt-6">
          <div className="h-12 w-12 bg-purple-50 text-purple-600 flex items-center justify-center rounded-xl mx-auto border border-purple-100 mb-3">
            <IconBed size={24} />
          </div>
          <h3 className="text-base font-bold text-gray-900">Belum Ada Tipe Kamar Terdaftar</h3>
          <p className="text-sm text-gray-400 mt-1 max-w-sm mx-auto leading-relaxed">
            {kosOptions.length === 0 
              ? "Anda perlu mendaftarkan properti kos terlebih dahulu sebelum dapat menambahkan unit kamar."
              : "Tambahkan tipe kamar dan tentukan tarif sewa bulanan agar calon penyewa dapat melakukan booking."}
          </p>
          {kosOptions.length > 0 && (
            <Link
              href={`/owner/kamar?add=true&${cleanParamsString}`}
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 text-xs font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 border border-purple-100 rounded-xl transition-colors"
            >
              Tambah Kamar Sekarang
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {data.map((kam) => (
            <div key={kam.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-purple-200 transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-600 truncate">
                    <IconBuildingStore size={16} className="shrink-0" />
                    <span className="truncate">{kam.nama_kos}</span>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md bg-purple-50 text-purple-700 border border-purple-100 shrink-0">
                    {kam.kamar_tersedia} / {kam.total_kamar} UNIT TERSEDIA
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{kam.nomor_kamar}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500 font-medium mt-1">
                    <IconMaximize size={14} className="text-gray-400" />
                    <span>Ukuran: {kam.ukuran}</span>
                  </div>
                </div>

                {kam.deskripsi && (
                  <p className="text-xs text-gray-500 line-clamp-2 italic bg-gray-50/60 p-2.5 rounded-xl border border-gray-100/60">
                    "{kam.deskripsi}"
                  </p>
                )}
              </div>

              <div className="border-t border-gray-50 pt-4 mt-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Harga Bulanan</span>
                  <span className="text-base font-black text-emerald-600">
                    Rp {kam.harga_bulanan.toLocaleString("id-ID")}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <Link
                    href={`/owner/kamar?edit=${kam.id}&${cleanParamsString}`}
                    className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-50 transition-colors"
                    title="Edit Kamar"
                  >
                    <IconPencil size={16} />
                  </Link>
                  <DeleteKamarAction kamarId={kam.id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="px-6 py-4 bg-white border border-gray-100 rounded-2xl shadow-xs flex items-center justify-between mt-6">
          <span className="text-xs text-gray-500 font-medium">
            Halaman {currentPage} dari {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Link
              href={`/owner/kamar?kosId=${currentKosFilter}&page=${currentPage - 1}${currentSearch ? `&search=${currentSearch}` : ""}`}
              className={`p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors ${
                currentPage <= 1 ? "pointer-events-none opacity-50" : "hover:bg-gray-50"
              }`}
            >
              <IconChevronLeft size={16} />
            </Link>
            <Link
              href={`/owner/kamar?kosId=${currentKosFilter}&page=${currentPage + 1}${currentSearch ? `&search=${currentSearch}` : ""}`}
              className={`p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors ${
                currentPage >= totalPages ? "pointer-events-none opacity-50" : "hover:bg-gray-50"
              }`}
            >
              <IconChevronRight size={16} />
            </Link>
          </div>
        </div>
      )}

      {(intentAdd || selectedEditItem) && (
        <KamarModal
          kosOptions={kosOptions}
          editItem={selectedEditItem}
          closeUrl={modalCloseUrl}
        />
      )}
    </div>
  );
}