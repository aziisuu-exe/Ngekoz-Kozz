import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { IconArrowLeft, IconBrandWhatsapp, IconPrinter, IconCheck, IconHome } from "@tabler/icons-react";
import Link from "next/link";
import { PrintButton } from "@/components/ui/print-button";

const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka);
};

const formatTanggal = (tanggal: string) => {
  return new Date(tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
};

const formatNomorWA = (nomor: string) => {
  if (!nomor) return "";
  let cleanNum = nomor.replace(/\D/g, '');
  if (cleanNum.startsWith('0')) {
    cleanNum = '62' + cleanNum.substring(1);
  }
  return cleanNum;
};

export default async function DetailReservasiPage({ 
  params
 }: { 
  params: { id: string } 
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const resolvedParams = await params;

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: reservasi, error } = await supabaseAdmin
    .from('reservasi')
    .select(`
      *,
      detail_kos (
        nama_kos, 
        id_owner 
      ),
      kamar_kos (nomor_kamar)
    `)
    .eq('kode_reservasi', resolvedParams.id)
    .maybeSingle();

    if (error) {
      console.error("ERROR SUPABASE DETAIL:", error.message);
    }

    if (!reservasi) {
      return (
        <div className="max-w-3xl mx-auto px-4 py-12 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Data Reservasi Tidak Ditemukan</h2>
          <p className="text-gray-500 mb-6">Mungkin kode URL tidak valid atau reservasi telah dihapus.</p>
          <Link href="/profile/reservasi" className="text-purple-600 font-medium hover:underline">
            Kembali ke Riwayat Reservasi
          </Link>
        </div>
      );
    }

  let nomorOwner = "6281234567890"; 
  
  const ownerId = reservasi.detail_kos?.id_owner; 

  if (ownerId) {
    const { data: ownerData } = await supabaseAdmin
      .from('users')
      .select('phone')
      .eq('id', ownerId)
      .single();

    if (ownerData?.phone) {
      nomorOwner = formatNomorWA(ownerData.phone);
    }
  }

  const pesanWa = `Halo Pemilik Kos,
Saya ingin konfirmasi pembayaran reservasi dengan detail:

*No. Pesanan:* ${reservasi.kode_reservasi}
*Kos:* ${reservasi.detail_kos?.nama_kos}
*Kamar:* Kamar ${reservasi.kamar_kos?.nomor_kamar || reservasi.id_kamar}
*Check-in:* ${formatTanggal(reservasi.tanggal_check_in)}
*Durasi:* ${reservasi.durasi} ${reservasi.durasi_tipe}

Pembayaran telah *BERHASIL* sebesar ${formatRupiah(reservasi.total_harga)}.
Mohon info selanjutnya terkait pengambilan kunci. Terima kasih!`;

  const linkWhatsapp = `https://wa.me/${nomorOwner}?text=${encodeURIComponent(pesanWa)}`;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 w-full">
      <Link href="/profile/reservasi" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-purple-600 mb-6 transition-colors">
        <IconArrowLeft size={16} /> Kembali ke Riwayat
      </Link>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-purple-600 p-8 text-center text-white relative">
          <div className="absolute top-4 right-4 opacity-20">
            <IconHome size={80} />
          </div>
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 border border-white/30">
            <IconCheck size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-1">Pembayaran Berhasil</h1>
          <p className="text-purple-200 text-sm">Terima kasih telah menggunakan layanan Ngekoz</p>
        </div>

        <div className="p-6 sm:p-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-dashed border-gray-200 pb-6 mb-6 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Kode Reservasi</p>
              <p className="text-lg font-bold text-gray-900 tracking-wider uppercase">{reservasi.kode_reservasi}</p>
            </div>
            <div className="sm:text-right">
              <p className="text-sm text-gray-500 mb-1">Tanggal Transaksi</p>
              <p className="font-medium text-gray-900">{formatTanggal(reservasi.created_at)}</p>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-500">Nama Kos</span>
              <span className="font-semibold text-gray-900 text-right">{reservasi.detail_kos?.nama_kos}</span>
            </div>
            <div className="flex justify-between items-center py-2 bg-gray-50 px-3 rounded-lg">
              <span className="text-gray-500">Nomor Kamar</span>
              <span className="font-semibold text-gray-900">Kamar {reservasi.kamar_kos?.nomor_kamar || reservasi.id_kamar}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-500">Check-in</span>
              <span className="font-semibold text-gray-900">{formatTanggal(reservasi.tanggal_check_in)}</span>
            </div>
            <div className="flex justify-between items-center py-2 bg-gray-50 px-3 rounded-lg">
              <span className="text-gray-500">Durasi Sewa</span>
              <span className="font-semibold text-gray-900">{reservasi.durasi} {reservasi.durasi_tipe}</span>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-500">Harga Sewa</span>
              <span className="font-medium text-gray-900">{formatRupiah(reservasi.harga_sewa)}</span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-500">Biaya Admin</span>
              <span className="font-medium text-gray-900">{formatRupiah(reservasi.biaya_admin)}</span>
            </div>
            <div className="flex justify-between items-center bg-purple-50 p-4 rounded-xl">
              <span className="font-bold text-purple-900">Total Dibayar</span>
              <span className="text-2xl font-extrabold text-purple-700">{formatRupiah(reservasi.total_harga)}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <a 
              href={linkWhatsapp} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1 flex justify-center items-center gap-2 py-3.5 bg-[#25D366] hover:bg-[#1EBE5A] text-white font-bold rounded-xl transition-all shadow-sm"
            >
              <IconBrandWhatsapp size={20} /> Hubungi Pemilik Kos
            </a>
            
            <PrintButton />
          </div>
        </div>
      </div>
    </div>
  );
}