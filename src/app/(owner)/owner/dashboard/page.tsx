import { getOwnerDashboardStats } from "@/features/owner/actions";
import { IconBuildingStore, IconBed, IconWallet, IconHourglassHigh } from "@tabler/icons-react";

export default async function OwnerDashboardPage() {
  const stats = await getOwnerDashboardStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Overview Analytics</h1>
        <p className="text-sm text-gray-500 mt-0.5">Pantau ringkasan performa bisnis persewaan properti Anda</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-xs flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100/50">
            <IconBuildingStore size={22} />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-400 block uppercase tracking-wider">Kos Dimiliki</span>
            <span className="text-xl font-black text-gray-900 block mt-0.5">{stats.totalKos} Properti</span>
          </div>
        </div>

        <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-xs flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100/50">
            <IconBed size={22} />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-400 block uppercase tracking-wider">Total Kapasitas</span>
            <span className="text-xl font-black text-gray-900 block mt-0.5">{stats.totalKamar} Kamar</span>
          </div>
        </div>

        <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-xs flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100/50">
            <IconWallet size={22} />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-400 block uppercase tracking-wider">Pendapatan Sewa</span>
            <span className="text-xl font-black text-emerald-600 block mt-0.5">
              Rp {stats.pendapatanBersih.toLocaleString("id-ID")}
            </span>
          </div>
        </div>

        <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-xs flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100/50">
            <IconHourglassHigh size={22} />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-400 block uppercase tracking-wider">Aduan Pending</span>
            <span className="text-xl font-black text-amber-600 block mt-0.5">{stats.reservasiPending} Booking</span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs">
        <h3 className="text-base font-bold text-gray-900 mb-4">Daftar Aset Properti Terdaftar</h3>
        {stats.listKos.length === 0 ? (
          <p className="text-sm text-gray-400 italic">Belum ada kos terdaftar atas nama akun Anda.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {stats.listKos.map((kos: any) => (
              <div key={kos.id} className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/50 text-sm font-semibold text-gray-800 flex items-center gap-3 group hover:border-purple-200 transition-colors">
                <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 shrink-0">
                  <IconBuildingStore size={16} />
                </div>
                <span className="truncate">{kos.nama_kos}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}