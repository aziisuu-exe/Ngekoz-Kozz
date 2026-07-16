import { getPaginatedTransactions } from "@/features/admin/actions";
import { formatRupiah } from "@/lib/utils";
import Link from "next/link";
import { IconChevronLeft, IconChevronRight, IconReceipt, IconSearch } from "@tabler/icons-react";

interface PageProps {
  searchParams: Promise<{
    status?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function AdminTransaksiPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const currentStatus = resolvedParams.status || "";
  const currentSearch = resolvedParams.search || "";
  const currentPage = Number(resolvedParams.page) || 1;

  const { data = [], totalPages = 0, totalItems = 0 } = await getPaginatedTransactions(
    currentStatus || undefined,
    currentSearch,
    currentPage,
    10
  );

  const statuses = [
    { label: "Semua", value: "" },
    { label: "Paid", value: "paid" },
    { label: "Pending", value: "pending" },
    { label: "Completed", value: "completed" },
    { label: "Cancelled", value: "cancelled" }
  ];

  return (
    <div className="p-6 md:p-8 w-full max-w-7xl mx-auto space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Log Transaksi</h1>
          <p className="text-sm text-gray-500 mt-0.5">Total riwayat pembayaran reservasi: {totalItems} data</p>
        </div>

        <form method="GET" className="relative w-full sm:w-72">
          <IconSearch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            name="search"
            defaultValue={currentSearch}
            placeholder="Cari penghuni atau nama kos..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 placeholder-gray-400"
          />
          {currentStatus && <input type="hidden" name="status" value={currentStatus} />}
        </form>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {statuses.map((tab) => {
          const isActive = currentStatus === tab.value;
          return (
            <Link
              key={tab.label}
              href={`/admin/transactions?status=${tab.value}${currentSearch ? `&search=${currentSearch}` : ""}`}
              className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-colors whitespace-nowrap border ${
                isActive
                  ? "bg-purple-600 text-white border-purple-600 shadow-sm shadow-purple-100"
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
                <th className="py-4 px-6">ID / Tanggal</th>
                <th className="py-4 px-6">Nama Penghuni</th>
                <th className="py-4 px-6">Properti Kos</th>
                <th className="py-4 px-6">Rincian Finansial</th>
                <th className="py-4 px-6">Total Pembayaran</th>
                <th className="py-4 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-gray-400 font-medium">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <IconReceipt size={28} className="text-gray-300" />
                      <span>Tidak ada log transaksi pembayaran yang ditemukan</span>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((res: any) => (
                  <tr key={res.id} className="hover:bg-gray-50/40 transition-colors">
                    <td className="py-4 px-6 font-medium text-gray-900">
                      <div>
                        <span className="block text-xs font-mono text-purple-600">#RES-{res.id}</span>
                        <span className="block text-xs text-gray-400 font-normal mt-0.5">
                          {new Date(res.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-700 font-semibold">{res.pencari}</td>
                    <td className="py-4 px-6 text-gray-600 max-w-xs truncate">{res.nama_kos}</td>
                    <td className="py-4 px-6 text-xs text-gray-500 space-y-0.5">
                      <div>Sewa: <span className="text-gray-800 font-medium">{formatRupiah(res.harga_sewa)}</span></div>
                      <div>Admin: <span className="text-gray-800 font-medium">{formatRupiah(res.biaya_admin)}</span></div>
                    </td>
                    <td className="py-4 px-6 font-bold text-gray-900">
                      {formatRupiah(res.total)}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-full border uppercase tracking-wider ${
                        res.status === "paid" ? "bg-green-50 text-green-700 border-green-200" :
                        res.status === "completed" ? "bg-blue-50 text-blue-700 border-blue-200" :
                        res.status === "pending" ? "bg-amber-50 text-amber-700 border-amber-200" :
                        "bg-red-50 text-red-700 border-red-200"
                      }`}>
                        {res.status}
                      </span>
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
                href={`/admin/transactions?page=${currentPage - 1}${currentStatus ? `&status=${currentStatus}` : ""}${currentSearch ? `&search=${currentSearch}` : ""}`}
                className={`p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors ${
                  currentPage <= 1 ? "pointer-events-none opacity-50" : "hover:bg-gray-50"
                }`}
              >
                <IconChevronLeft size={16} />
              </Link>
              <Link
                href={`/admin/transactions?page=${currentPage + 1}${currentStatus ? `&status=${currentStatus}` : ""}${currentSearch ? `&search=${currentSearch}` : ""}`}
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