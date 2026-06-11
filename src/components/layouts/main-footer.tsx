import Link from "next/link";
import { 
  IconHomeShield, 
  IconBrandInstagram, 
  IconBrandFacebook, 
  IconBrandTwitter, 
  IconBrandYoutube,
  IconMapPin,
  IconMail,
  IconPhone,
  IconBrandWhatsapp
} from "@tabler/icons-react";

export function MainFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-950 text-gray-400 border-t border-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
        <div className="lg:col-span-2 space-y-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-purple-800 shadow-sm text-white">
              <IconHomeShield size={20} />
            </div>
            Ngekoz
          </Link>
          <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
            Platform pencarian dan pemesanan kos modern terlengkap di Indonesia (Madiun Selatan aja sih). Kami berkomitmen memberikan kemudahan dan keamanan bagi pemilik kos maupun pencari kos.
          </p>
          <div className="flex items-center gap-4 text-gray-500">
            <a href="https://www.instagram.com/_azxlm" className="hover:text-purple-400 transition-colors"><IconBrandInstagram size={20} /></a>
            <a href="#" className="hover:text-purple-400 transition-colors"><IconBrandFacebook size={20} /></a>
            <a href="https://wa.me/+6281331660928" className="hover:text-purple-400 transition-colors"><IconBrandWhatsapp size={20} /></a>
            <a href="https://www.youtube.com/@Pppp-yr6iq" className="hover:text-purple-400 transition-colors"><IconBrandYoutube size={20} /></a>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Layanan</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/search" className="hover:text-white transition-colors">Pencarian Kos</Link></li>
            <li><Link href="#" className="hover:text-white transition-colors">Kos Unggulan</Link></li>
            <li><Link href="#" className="hover:text-white transition-colors">Promo Diskon</Link></li>
            <li><Link href="#" className="hover:text-white transition-colors">Kos Terdekat Kampus</Link></li>
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Perusahaan</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="#guide" className="hover:text-white transition-colors">Tentang Kami</Link></li>
            <li><Link href="#" className="hover:text-white transition-colors">Karir & Magang</Link></li>
            <li><Link href="#" className="hover:text-white transition-colors">Menjadi Mitra Owner</Link></li>
            <li><Link href="#faq" className="hover:text-white transition-colors">Pusat Bantuan</Link></li>
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Hubungi Kami</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <IconMapPin size={18} className="text-purple-500 flex-shrink-0" />
              <span>Jl. jalan di Madiun Selatan, Jawa Timur, Indonesia</span>
            </li>
            <li className="flex items-center gap-2">
              <IconPhone size={18} className="text-purple-500 flex-shrink-0" />
              <span>+62 812-3456-7890</span>
            </li>
            <li className="flex items-center gap-2">
              <IconMail size={18} className="text-purple-500 flex-shrink-0" />
              <span>azisalam0@ngekoz.id</span>
            </li>
          </ul>
        </div>

      </div>

      <div className="border-t border-gray-900 bg-gray-950/50 py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>&copy; {currentYear} Ngekoz.id. Hanya untuk penugasan aja kok.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">Syarat & Ketentuan</a>
            <a href="#" className="hover:text-white transition-colors">Kebijakan Privasi</a>
          </div>
        </div>
      </div>
    </footer>
  );
}