import { IconTicket, IconArrowRight } from "@tabler/icons-react";
import Link from "next/link";

export function PromoBanner() {
  return (
    <section className="w-full py-10 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="relative bg-gradient-to-br from-purple-700 via-purple-600 to-indigo-800 rounded-3xl overflow-hidden shadow-xl flex flex-col md:flex-row items-center justify-between p-8 md:p-12 border border-purple-500/20">
          
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-80 h-80 bg-purple-400 opacity-20 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex-1 text-center md:text-left mb-8 md:mb-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-sm font-semibold mb-5 backdrop-blur-sm border border-white/20 shadow-sm">
              <IconTicket size={16} className="text-yellow-300" />
              Promo Pengguna Baru
            </div>
            
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight">
              Diskon Spesial Hingga <br className="hidden md:block" />
              <span className="text-yellow-300 drop-shadow-md">Rp 200.000</span>
            </h2>
            
            <p className="text-purple-100 text-base md:text-lg max-w-lg mx-auto md:mx-0">
              Pesan kos idamanmu sekarang dan gunakan kode promo <strong className="text-purple-900 bg-yellow-300 px-2 py-0.5 rounded shadow-sm">NGEKOZBARU</strong> saat melakukan pembayaran.
            </p>
          </div>

          <div className="relative z-10 flex-shrink-0">
            <Link 
              href="/search" 
              className="inline-flex items-center gap-2 bg-white text-purple-700 hover:bg-gray-50 hover:text-purple-800 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 active:translate-y-0"
            >
              Cari Kos Sekarang
              <IconArrowRight size={20} />
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}