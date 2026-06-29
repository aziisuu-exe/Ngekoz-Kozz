import { IconSearch, IconCreditCard, IconKey } from "@tabler/icons-react";

export const metadata = {
  title: "Panduan Pengguna | Ngekoz",
  description: "Pelajari cara mudah mencari, memesan, dan mengelola kos di Ngekoz.",
};

export default function PanduanPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24 w-full">
      <div className="text-center mb-16">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Panduan Ngekoz</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Langkah demi langkah menggunakan platform Ngekoz untuk pengalaman mencari hunian yang bebas ribet.
        </p>
      </div>

      <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">

        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
          <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-purple-600 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
            <IconSearch size={18} />
          </div>
          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 text-lg mb-2">1. Cari Kos Idaman</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Gunakan fitur pencarian dan filter pintar kami untuk menemukan kos berdasarkan lokasi terdekat kampus, harga bulanan, hingga fasilitas spesifik seperti AC atau WiFi.
            </p>
          </div>
        </div>

        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
          <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-purple-600 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
            <IconCreditCard size={18} />
          </div>
          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 text-lg mb-2">2. Reservasi & Pembayaran</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Pilih tanggal check-in dan durasi sewa. Lakukan pembayaran dengan aman melalui gateway resmi Xendit. Tersedia metode QRIS, Virtual Account, hingga e-Wallet.
            </p>
          </div>
        </div>

        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
          <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-purple-600 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
            <IconKey size={18} />
          </div>
          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 text-lg mb-2">3. Konfirmasi & Pindahan</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Setelah pembayaran berhasil, Anda akan menerima Struk Digital. Anda bisa langsung menghubungi pemilik kos via WhatsApp melalui halaman riwayat reservasi untuk serah terima kunci.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}