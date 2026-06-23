import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { IconReceipt2, IconCalendar, IconBed, IconCheck, IconClock, IconArrowRight } from "@tabler/icons-react"; // 🔥 Tambah IconBed & IconArrowRight
import Link from "next/link";

const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka);
};

const formatTanggalSingkat = (tanggal: string) => {
  return new Date(tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
};

const formatLabelDurasi = (durasi: number, tipe: string) => {
  if (!tipe) return `${durasi}`;
  if (tipe.toLowerCase() === 'bulanan') return `${durasi} Bulan`;
  if (tipe.toLowerCase() === 'harian') return `${durasi} Hari`;
  return `${durasi} ${tipe}`;
};

export default async function ReservasiPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: riwayatReservasi, error } = await supabaseAdmin
    .from('reservasi')
    .select(`
      *,
      detail_kos (nama_kos),
      kamar_kos (nomor_kamar) 
    `)
    .eq('id_user', session.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Gagal mengambil riwayat reservasi:", error);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <IconReceipt2 className="text-purple-600" /> Riwayat Reservasi
        </h1>
        <p className="text-sm text-gray-500 mt-1">Pantau status pembayaran dan detail penyewaan kos Anda di sini.</p>
      </div>

      {(!riwayatReservasi || riwayatReservasi.length === 0) ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <IconReceipt2 size={40} className="text-gray-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum ada reservasi</h3>
          <p className="text-gray-500 mb-6">Anda belum pernah melakukan pemesanan kos. Yuk, cari kos idamanmu sekarang!</p>
          <Link href="/" className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors">
            Cari Kos
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {riwayatReservasi.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row gap-6 items-start md:items-center hover:border-purple-200 transition-colors">
              
              <div className="flex-1 space-y-4 w-full">
              <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-start gap-3">
                  <div className="space-y-1.5">
                    <span className="inline-block text-[10px] sm:text-xs font-bold text-purple-600 tracking-wider uppercase bg-purple-50 px-2 py-1 rounded-md break-all">
                      Pesanan: {item.kode_reservasi}
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">
                      {item.detail_kos?.nama_kos || "Kos Tidak Diketahui"}
                    </h3>
                  </div>
                  
                  <div className="self-start">
                    {item.status === 'paid' ? (
                      <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-semibold flex items-center gap-1 shadow-sm">
                        <IconCheck size={14} /> Berhasil
                      </span>
                    ) : item.status === 'pending' ? (
                      <span className="px-3 py-1 bg-orange-50 text-orange-700 border border-orange-200 rounded-full text-xs font-semibold flex items-center gap-1 shadow-sm">
                        <IconClock size={14} /> Menunggu Pembayaran
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full text-xs font-semibold shadow-sm">
                        Dibatalkan
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
                    <IconBed size={18} className="text-gray-400" />
                    <span className="font-medium">Kamar {item.kamar_kos?.nomor_kamar || item.id_kamar}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
                    <IconCalendar size={18} className="text-gray-400" />
                    <div className="flex items-center gap-1.5 font-medium">
                      <span>{formatTanggalSingkat(item.tanggal_check_in)}</span>
                      <IconArrowRight size={14} className="text-gray-400" />
                      <span>{formatTanggalSingkat(item.tanggal_check_out)}</span>
                    </div>
                    <span className="text-gray-400 text-xs ml-auto">
                      ({formatLabelDurasi(item.durasi, item.durasi_tipe)})
                    </span>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-auto flex flex-col items-start md:items-end pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-gray-100 md:pl-6 min-w-[180px]">
                <span className="text-xs text-gray-500 mb-1 font-medium">Total Pembayaran</span>
                <span className="text-2xl font-extrabold text-gray-900 mb-4">{formatRupiah(item.total_harga)}</span>
                
                {item.status === 'pending' ? (
                  <button className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
                    Bayar Sekarang
                  </button>
                ) : (
                    <Link 
                        href={`/profile/reservasi/${item.kode_reservasi}`}
                        className="w-full block text-center px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-sm font-semibold rounded-xl transition-colors shadow-sm"
                    >
                        Lihat Detail
                    </Link>
                )}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}