import { 
  IconSearch, 
  IconHomeCheck, 
  IconCreditCard, 
  IconKey 
} from "@tabler/icons-react";

export function GuideSection() {
  const steps = [
    {
      icon: <IconSearch size={32} />,
      title: "1. Cari Kos Idaman",
      description: "Gunakan filter pencarian cerdas kami untuk menemukan kos sesuai lokasi, harga, dan fasilitas yang kamu butuhkan."
    },
    {
      icon: <IconHomeCheck size={32} />,
      title: "2. Survey & Pilih",
      description: "Lihat detail kamar, foto resolusi tinggi, dan baca ulasan transparan dari penghuni sebelumnya."
    },
    {
      icon: <IconCreditCard size={32} />,
      title: "3. Booking & Bayar",
      description: "Lakukan pemesanan langsung dan bayar dengan aman melalui berbagai metode pembayaran resmi Ngekoz."
    },
    {
      icon: <IconKey size={32} />,
      title: "4. Mulai Ngekoz!",
      description: "Terima kunci digital atau konfirmasi langsung dari pemilik, dan selamat menikmati tempat tinggal barumu."
    }
  ];

  return (
    <section id="guide" className="w-full py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-sm font-bold text-purple-600 uppercase tracking-wider mb-2">Cara Kerja</h2>
          <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            Ngekoz Jadi Lebih Gampang
          </h3>
          <p className="text-lg text-gray-500">
            Hanya butuh 4 langkah mudah untuk menemukan dan menyewa kos idamanmu tanpa harus capek keliling kota.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gray-100 -z-10"></div>

          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center group">
              <div className="w-24 h-24 bg-white border-4 border-gray-50 rounded-full flex items-center justify-center text-purple-600 shadow-sm group-hover:scale-110 group-hover:border-purple-100 group-hover:shadow-purple-100 transition-all duration-300 mb-6 relative z-10">
                {step.icon}
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h4>
              <p className="text-sm text-gray-500 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}