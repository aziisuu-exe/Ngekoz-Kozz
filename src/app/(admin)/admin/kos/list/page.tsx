import { getPaginatedKos } from "@/features/admin/actions";
import { formatRupiah } from "@/lib/utils";
import Link from "next/link";
import { IconChevronLeft, IconChevronRight, IconEye } from "@tabler/icons-react";
import { StatusToggle } from "../../_components/status-toggle";

interface PageProps {
  searchParams: Promise<{
    status?: "pending" | "approved" | "rejected";
    search?: string;
    page?: string;
  }>;
}

export default async function AdminKosListPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const currentStatus = resolvedParams.status || undefined;
  const currentSearch = resolvedParams.search || "";
  const currentPage = Number(resolvedParams.page) || 1;

  const { data = [], totalPages = 0, totalItems = 0 } = await getPaginatedKos(
    currentStatus,
    currentSearch,
    currentPage,
    10
  );

  return (
    <div className="p-6 md:p-8 w-full max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Daftar Properti</h1>
          <p className="text-sm text-gray-500 mt-0.5">Total properti terdaftar: {totalItems} kos</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="py-4 px-6">Nama Properti</th>
                <th className="py-4 px-6">Pemilik</th>
                <th className="py-4 px-6">Harga Bulanan</th>
                <th className="py-4 px-6">Moderasi</th>
                <th className="py-4 px-6">Visibilitas</th>
                <th className="py-4 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400 font-medium">
                    Tidak ada properti kos yang ditemukan
                  </td>
                </tr>
              ) : (
                data.map((kos: any) => (
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
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${
                        kos.approval_status === "approved" ? "bg-green-50 text-green-700 border-green-200" :
                        kos.approval_status === "rejected" ? "bg-red-50 text-red-700 border-red-200" :
                        "bg-amber-50 text-amber-700 border-amber-200"
                      }`}>
                        {kos.approval_status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <StatusToggle kosId={kos.id} initialStatus={kos.is_active} />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        href={`/admin/kos/${kos.id}/verify`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                      >
                        <IconEye size={14} />
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))
              )}
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
                href={`/admin/kos/list?page=${currentPage - 1}`}
                className={`p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors ${
                  currentPage <= 1 ? "pointer-events-none opacity-50" : "hover:bg-gray-50"
                }`}
              >
                <IconChevronLeft size={16} />
              </Link>
              <Link
                href={`/admin/kos/list?page=${currentPage + 1}`}
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
    </div>
  );
}