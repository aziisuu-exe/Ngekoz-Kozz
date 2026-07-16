import { getPaginatedLaporan } from "@/features/admin/actions";
import Link from "next/link";
import { LaporanActions } from "./_components/laporan-actions";
import { LaporanDetailModal } from "./_components/laporan-detail-modal";
import { IconSearch, IconChevronLeft, IconChevronRight, IconMessageReport, IconEye } from "@tabler/icons-react";

interface PageProps {
  searchParams: Promise<{
    status?: string;
    search?: string;
    page?: string;
    show?: string;
  }>;
}

export default async function AdminLaporanPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const currentStatus = resolvedParams.status || "menunggu";
  const currentSearch = resolvedParams.search || "";
  const currentPage = Number(resolvedParams.page) || 1;
  const showDetailId = resolvedParams.show || "";

  const { data = [], totalPages = 0, totalItems = 0 } = await getPaginatedLaporan(
    currentStatus,
    currentSearch,
    currentPage,
    10
  );

  const selectedLaporan = showDetailId ? data.find((l: any) => String(l.id) === String(showDetailId)) : null;
  const cleanParamsString = `status=${currentStatus}&search=${currentSearch}&page=${currentPage}`;

  const tabs = [
    { label: "Menunggu Review", value: "menunggu" },
    { label: "Selesai Ditindak", value: "selesai" },
    { label: "Ditolak / Diabaikan", value: "ditolak" }
  ];

  return (
    <div className="p-6 md:p-8 w-full max-w-7xl mx-auto space-y-6 relative">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Pusat Pengaduan & Laporan</h1>
          <p className="text-sm text-gray-500 mt-0.5">Moderasi aduan pengguna demi keamanan ekosistem: {totalItems} data</p>
        </div>

        <form method="GET" className="relative w-full sm:w-72">
          <IconSearch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            name="search"
            defaultValue={currentSearch}
            placeholder="Cari pelapor atau nama kos..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 placeholder-gray-400"
          />
          <input type="hidden" name="status" value={currentStatus} />
        </form>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {tabs.map((tab) => {
          const isActive = currentStatus === tab.value;
          return (
            <Link
              key={tab.value}
              href={`/admin/laporan?status=${tab.value}${currentSearch ? `&search=${currentSearch}` : ""}`}
              className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-colors whitespace-nowrap border ${
                isActive
                  ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="py-4 px-6 w-36">ID / Tanggal</th>
                <th className="py-4 px-6">Pelapor aduan</th>
                <th className="py-4 px-6">Properti Terlapor</th>
                <th className="py-4 px-6">Kategori Pelanggaran</th>
                <th className="py-4 px-6 text-right w-36">Aksi Moderasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-gray-400 font-medium">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <IconMessageReport size={28} className="text-gray-300" />
                      <span>Tidak ada laporan pelanggaran dalam kategori ini</span>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((l: any) => (
                  <tr key={l.id} className="hover:bg-gray-50/40 transition-colors">
                    <td className="py-4 px-6 font-medium text-gray-900">
                      <div>
                        <span className="block text-xs font-mono text-purple-600">#LAP-{l.id}</span>
                        <span className="block text-xs text-gray-400 font-normal mt-0.5">
                          {new Date(l.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-gray-900">{l.pelapor}</td>
                    <td className="py-4 px-6 text-gray-700 font-medium max-w-xs truncate">{l.nama_kos}</td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-100 capitalize">
                        {l.kategori.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right flex items-center justify-end gap-1.5">
                      <Link
                        href={`/admin/laporan?show=${l.id}&${cleanParamsString}`}
                        className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-50 transition-colors"
                        title="Lihat Detail"
                      >
                        <IconEye size={16} />
                      </Link>
                      {l.status === "menunggu" && (
                        <LaporanActions laporanId={l.id} kosId={l.id_kos} />
                      )}
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
                href={`/admin/laporan?status=${currentStatus}&page=${currentPage - 1}${currentSearch ? `&search=${currentSearch}` : ""}`}
                className={`p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors ${
                  currentPage <= 1 ? "pointer-events-none opacity-50" : "hover:bg-gray-50"
                }`}
              >
                <IconChevronLeft size={16} />
              </Link>
              <Link
                href={`/admin/laporan?status=${currentStatus}&page=${currentPage + 1}${currentSearch ? `&search=${currentSearch}` : ""}`}
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

      {selectedLaporan && (
        <LaporanDetailModal selectedLaporan={selectedLaporan} cleanParamsString={cleanParamsString} />
      )}

    </div>
  );
}