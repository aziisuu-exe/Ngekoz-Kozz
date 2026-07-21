import { getOwnerFinancialSummary } from "@/features/owner/keuangan-actions";
import { KeuanganFilter } from "./_components/keuangan-filter";
import { 
  IconWallet, 
  IconTrendingUp, 
  IconReceipt, 
  IconClock 
} from "@tabler/icons-react";

interface PageProps {
  searchParams: Promise<{
    month?: string;
  }>;
}

export default async function OwnerKeuanganPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const currentMonth = resolvedParams.month || "all";

  const { stats, recentTransactions } = await getOwnerFinancialSummary(currentMonth);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Laporan Keuangan</h1>
          <p className="text-sm text-gray-500 mt-0.5">Ringkasan pendapatan kotor, biaya platform, dan pendapatan bersih aset kos Anda</p>
        </div>

        <KeuanganFilter currentMonth={currentMonth} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pendapatan Bersih</span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <IconWallet size={20} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-emerald-600">
              Rp {stats.nettRevenue.toLocaleString("id-ID")}
            </h3>
            <p className="text-[10px] text-gray-400 mt-1 font-medium">Siap dicairkan ke rekening mitra</p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pendapatan Kotor</span>
            <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
              <IconTrendingUp size={20} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-gray-900">
              Rp {stats.grossRevenue.toLocaleString("id-ID")}
            </h3>
            <p className="text-[10px] text-gray-400 mt-1 font-medium">Dari {stats.totalTransactions} transaksi berhasil</p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Biaya Layanan Platform</span>
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <IconReceipt size={20} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-gray-900">
              Rp {stats.platformFee.toLocaleString("id-ID")}
            </h3>
            <p className="text-[10px] text-gray-400 mt-1 font-medium">Potongan komisi platform Ngekoz</p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pendapatan Pending</span>
            <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <IconClock size={20} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-amber-600">
              Rp {stats.pendingRevenue.toLocaleString("id-ID")}
            </h3>
            <p className="text-[10px] text-gray-400 mt-1 font-medium">Menunggu penyelesaian pembayaran</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-50 pb-3">
          <h3 className="text-base font-bold text-gray-900">Rincian Transaksi Terbaru</h3>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mutasi Masuk</span>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-xs font-medium">
            Belum ada mutasi keuangan untuk periode ini.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Kode Transaksi</th>
                  <th className="py-3 px-4">Properti Kos</th>
                  <th className="py-3 px-4">Total Bruto</th>
                  <th className="py-3 px-4">Potongan Layanan</th>
                  <th className="py-3 px-4">Pendapatan Netto</th>
                  <th className="py-3 px-4 text-right">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-medium text-gray-700">
                {recentTransactions.map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-purple-600">
                      {tx.kode_reservasi}
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-900">
                      {tx.nama_kos}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      Rp {tx.total_harga.toLocaleString("id-ID")}
                    </td>
                    <td className="py-3 px-4 text-red-500 font-semibold">
                      - Rp {tx.biaya_admin.toLocaleString("id-ID")}
                    </td>
                    <td className="py-3 px-4 font-black text-emerald-600">
                      Rp {tx.nett.toLocaleString("id-ID")}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-400">
                      {new Date(tx.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}