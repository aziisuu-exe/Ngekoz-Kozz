import { getPaginatedKos } from "@/features/admin/actions";
import { formatRupiah } from "@/lib/utils";
import Link from "next/link";
import { IconChevronLeft, IconChevronRight, IconEye, IconInbox, IconSearch } from "@tabler/icons-react";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    page?: string;
  }>;
}

export default async function AdminKosModerasiPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const currentSearch = resolvedParams.search || "";
  const currentPage = Number(resolvedParams.page) || 1;

  const { data = [], totalPages = 0, totalItems = 0 } = await getPaginatedKos(
    "pending",
    currentSearch,
    currentPage,
    10
  );

  return (
    <div className="p-6 md:p-8 w-full max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Antrean Moderasi Properti</h1>
          <p className="text-sm text-gray-500 mt-0.5">Menampilkan properti baru yang memerlukan persetujuan: {totalItems} kos</p>
        </div>
        
        <form method="GET" className="relative w-full sm:w-72">
          <IconSearch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            name="search"
            defaultValue={currentSearch}
            placeholder="Cari properti pending..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 placeholder-gray-400"
          />
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {data.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center px-4">
            <div className="h-12 w-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-4">
              <IconInbox size={24} />
            </div>
            <h3 className="text-base font-bold text-gray-900">Antrean Bersih!</h3>
            <p className="text-sm text-gray-400 max-w-sm mt-1">
              {currentSearch 
                ? `Tidak ada properti pending yang cocok dengan pencarian "${currentSearch}".`
                : "Semua pengajuan kos baru telah diproses. Tidak ada properti yang menunggu moderasi saat ini."
              }
            </p>
            {currentSearch && (
              <Link 
                href="/admin/kos/moderasi"
                className="mt-4 text-xs font-semibold text-purple-600 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                Reset Pencarian
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/70 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="py-4 px-6">Nama Properti</th>
                    <th className="py-4 px-6">Pemilik</th>
                    <th className="py-4 px-6">Harga Bulanan Terendah</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                  {data.map((kos: any) => (
                    <tr key={kos.id} className="hover:bg-gray-50/40 transition-colors">
                      <td className="py-4 px-6 font-semibold text-gray-900">
                        <div>
                          <span className="block">{kos.nama_kos}</span>
                          <span className="block text-xs text-gray-400 font-normal mt-0.5 truncate max-w-xs">
                            {kos.alamat}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-600">{kos.users?.name || "-"}</td>
                      <td className="py-4 px-6 font-medium text-gray-900">
                        {formatRupiah(kos.harga_bulanan)}
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border bg-amber-50 text-amber-700 border-amber-200 uppercase">
                          {kos.approval_status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          href={`/admin/kos/${kos.id}/verify`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                        >
                          <IconEye size={14} />
                          Tinjau
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between">
                <span className="text-xs text-gray-500 font-medium">
                  Halaman {currentPage} dari {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/kos/moderasi?page=${currentPage - 1}${currentSearch ? `&search=${currentSearch}` : ''}`}
                    className={`p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors ${
                      currentPage <= 1 ? "pointer-events-none opacity-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <IconChevronLeft size={16} />
                  </Link>
                  <Link
                    href={`/admin/kos/moderasi?page=${currentPage + 1}${currentSearch ? `&search=${currentSearch}` : ''}`}
                    className={`p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors ${
                      currentPage >= totalPages ? "pointer-events-none opacity-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <IconChevronRight size={16} />
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}