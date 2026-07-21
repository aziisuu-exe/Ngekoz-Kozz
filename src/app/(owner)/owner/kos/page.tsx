import { getOwnerKosList } from "@/features/owner/actions";
import Link from "next/link";
import { IconPlus, IconSearch, IconBuildingStore, IconMapPin, IconBed, IconChevronLeft, IconChevronRight, IconAlertCircle } from "@tabler/icons-react";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    page?: string;
  }>;
}

export default async function OwnerKosPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const currentSearch = resolvedParams.search || "";
  const currentPage = Number(resolvedParams.page) || 1;

  const { data = [], totalPages = 0, totalItems = 0 } = await getOwnerKosList(currentSearch, currentPage, 6);

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Kelola Properti Kos</h1>
          <p className="text-sm text-gray-500 mt-0.5">Daftar dan manajemen status pemasaran seluruh aset properti Anda</p>
        </div>

        <Link
          href="/owner/kos/tambah"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors shadow-xs shrink-0 cursor-pointer"
        >
          <IconPlus size={16} strokeWidth={3} />
          Daftarkan Kos Baru
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-100/70 border border-gray-200/50 px-3 py-1.5 rounded-lg">
          Menampilkan {totalItems} Properti
        </span>

        <form method="GET" className="relative w-full sm:w-72 shrink-0">
          <IconSearch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            name="search"
            defaultValue={currentSearch}
            placeholder="Cari nama properti kos..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 placeholder-gray-400 transition-colors font-medium"
          />
        </form>
      </div>

      {data.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center shadow-xs max-w-2xl mx-auto mt-6">
          <div className="h-12 w-12 bg-purple-50 text-purple-600 flex items-center justify-center rounded-xl mx-auto border border-purple-100 mb-3">
            <IconBuildingStore size={24} />
          </div>
          <h3 className="text-base font-bold text-gray-900">Belum Ada Properti Terdaftar</h3>
          <p className="text-sm text-gray-400 mt-1 max-w-sm mx-auto leading-relaxed">
            Mulailah memasarkan properti kos Anda untuk menjangkau ribuan calon penyewa potensial di platform kami.
          </p>
          <Link
            href="/owner/kos/tambah"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 text-xs font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 border border-purple-100 rounded-xl transition-colors"
          >
            Mulai Registrasi Kos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {data.map((kos) => (
            <div key={kos.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-purple-200 transition-all group">
              <div className="space-y-3.5">
                <div className="flex items-start justify-between gap-4">
                  <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
                    <IconBuildingStore size={20} />
                  </div>
                  
                  <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md border ${
                    kos.status === "approved" || kos.status === "disetujui"
                      ? "bg-green-50 text-green-700 border-green-100"
                      : kos.status === "rejected" || kos.status === "ditolak"
                      ? "bg-red-50 text-red-700 border-red-100"
                      : "bg-amber-50 text-amber-700 border-amber-100"
                  }`}>
                    {kos.status === "approved" || kos.status === "disetujui" ? "Aktif Tayang" : kos.status === "rejected" || kos.status === "ditolak" ? "Ditolak Admin" : "Menunggu Review"}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 text-base line-clamp-1 group-hover:text-purple-600 transition-colors">
                    {kos.nama_kos}
                  </h3>
                  <div className="flex items-center gap-1.5 text-gray-400 text-xs mt-1.5 font-medium">
                    <IconMapPin size={14} className="text-gray-400 shrink-0" />
                    <span className="truncate">{kos.kecamatan}, {kos.alamat}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-50 pt-4 mt-5 flex items-center justify-between text-xs font-bold">
                <div className="flex items-center gap-1.5 text-gray-600 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-lg">
                  <IconBed size={14} className="text-gray-400" />
                  <span>{kos.totalKamar} Tipe Kamar</span>
                </div>

                <Link
                  href={`/owner/kos/edit/${kos.id}`}
                  className="text-purple-600 hover:text-purple-700 bg-purple-50/50 hover:bg-purple-50 border border-purple-100/50 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Kelola Properti
                </Link>
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
              href={`/owner/kos?page=${currentPage - 1}${currentSearch ? `&search=${currentSearch}` : ""}`}
              className={`p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors ${
                currentPage <= 1 ? "pointer-events-none opacity-50" : "hover:bg-gray-50"
              }`}
            >
              <IconChevronLeft size={16} />
            </Link>
            <Link
              href={`/owner/kos?page=${currentPage + 1}${currentSearch ? `&search=${currentSearch}` : ""}`}
              className={`p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors ${
                currentPage >= totalPages ? "pointer-events-none opacity-50" : "hover:bg-gray-50"
              }`}
            >
              <IconChevronRight size={16} />
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}