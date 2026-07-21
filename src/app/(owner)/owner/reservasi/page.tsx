import { getOwnerReservasiList } from "@/features/owner/reservasi-actions";
import { ReservasiFilter } from "./_components/reservasi-filter";

import { UserAvatar } from "./_components/user-avatar";
import Link from "next/link";
import { 
  IconCalendarCheck, 
  IconSearch, 
  IconChevronLeft, 
  IconChevronRight,
  IconArrowRight
} from "@tabler/icons-react";
import { ReservasiActionButtons } from "./_components/reservasi-action-button";

interface PageProps {
  searchParams: Promise<{
    status?: string;
    search?: string;
    page?: string;
  }>;
}

function formatDateSafe(dateStr: string | null) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export default async function OwnerReservasiPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const currentStatus = resolvedParams.status || "all";
  const currentSearch = resolvedParams.search || "";
  const currentPage = Number(resolvedParams.page) || 1;

  const { data = [], totalPages = 0, totalItems = 0 } = await getOwnerReservasiList(
    currentStatus,
    currentSearch,
    currentPage,
    8
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Reservasi Masuk</h1>
        <p className="text-sm text-gray-500 mt-0.5">Kelola dan konfirmasi booking sewa dari calon penyewa kos Anda</p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <ReservasiFilter currentStatus={currentStatus} />

        <form method="GET" className="relative w-full sm:w-64 shrink-0">
          <IconSearch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            name="search"
            defaultValue={currentSearch}
            placeholder="Cari kode/penyewa/kos..."
            className="w-full pl-10 pr-4 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 font-medium text-gray-900"
          />
          {currentStatus !== "all" && <input type="hidden" name="status" value={currentStatus} />}
        </form>
      </div>

      {data.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center shadow-xs max-w-xl mx-auto mt-6">
          <div className="h-12 w-12 bg-purple-50 text-purple-600 flex items-center justify-center rounded-xl mx-auto border border-purple-100 mb-3">
            <IconCalendarCheck size={24} />
          </div>
          <h3 className="text-base font-bold text-gray-900">Belum Ada Reservasi</h3>
          <p className="text-sm text-gray-400 mt-1 max-w-sm mx-auto leading-relaxed">
            Belum ada data transaksi booking yang masuk sesuai dengan filter yang Anda pilih.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Penyewa & Kontak</th>
                  <th className="py-3.5 px-4">Properti & Kamar</th>
                  <th className="py-3.5 px-4">Durasi & Periode Sewa</th>
                  <th className="py-3.5 px-4">Total Tagihan</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-medium text-gray-700">
                {data.map((res) => {
                  const checkInStr = formatDateSafe(res.tanggal_check_in);
                  const checkOutStr = formatDateSafe(res.tanggal_check_out);

                  return (
                    <tr key={res.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <UserAvatar src={res.foto_penyewa} name={res.nama_penyewa} />
                          <div>
                            <span className="font-bold text-gray-900 block leading-tight">{res.nama_penyewa}</span>
                            <span className="text-[10px] text-gray-400 block mt-0.5">{res.email_penyewa}</span>
                            <span className="text-[10px] text-purple-600 font-mono font-bold block mt-0.5">{res.kode_reservasi}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-gray-800 block">{res.nama_kos}</span>
                        <span className="text-[10px] text-gray-500 font-semibold block mt-0.5">Kamar: {res.nomor_kamar}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-gray-900 block capitalize">
                          {res.durasi} {res.duration_values}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-gray-500 font-medium mt-0.5">
                          <span>{checkInStr}</span>
                          <IconArrowRight size={10} className="text-gray-400 shrink-0" />
                          <span>{checkOutStr}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-black text-emerald-600">
                        Rp {res.total_harga.toLocaleString("id-ID")}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md border ${
                          res.status === "approved"
                            ? "bg-green-50 text-green-700 border-green-100"
                            : res.status === "rejected"
                            ? "bg-red-50 text-red-700 border-red-100"
                            : "bg-amber-50 text-amber-700 border-amber-100"
                        }`}>
                          {res.raw_status === "paid" || res.raw_status === "completed"
                            ? "Disetujui"
                            : res.raw_status === "cancelled"
                            ? "Ditolak / Batal"
                            : res.raw_status === "waiting_payment"
                            ? "Menunggu Bayar"
                            : "Pending"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <ReservasiActionButtons
                          reservasiId={res.id}
                          currentStatus={res.status}
                          phonePenyewa={res.phone_penyewa}
                          namaPenyewa={res.nama_penyewa}
                          namaKos={res.nama_kos}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="px-6 py-4 bg-white border border-gray-100 rounded-2xl shadow-xs flex items-center justify-between mt-6">
          <span className="text-xs text-gray-500 font-medium">
            Halaman {currentPage} dari {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Link
              href={`/owner/reservasi?status=${currentStatus}&page=${currentPage - 1}${currentSearch ? `&search=${currentSearch}` : ""}`}
              className={`p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors ${
                currentPage <= 1 ? "pointer-events-none opacity-50" : "hover:bg-gray-50"
              }`}
            >
              <IconChevronLeft size={16} />
            </Link>
            <Link
              href={`/owner/reservasi?status=${currentStatus}&page=${currentPage + 1}${currentSearch ? `&search=${currentSearch}` : ""}`}
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