import { IconMail, IconBrandWhatsapp, IconMapPin } from "@tabler/icons-react";

export const metadata = {
  title: "Hubungi Kami | Ngekoz",
  description: "Punya pertanyaan atau kendala? Tim Ngekoz siap membantu Anda kapan saja.",
};

export default function HubungiKamiPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24 w-full">
      <div className="text-center mb-16">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Hubungi Kami</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Punya pertanyaan seputar layanan Ngekoz? Jangan ragu untuk menghubungi tim kami melalui kontak di bawah ini.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center flex flex-col items-center hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center text-green-600 mb-4">
            <IconBrandWhatsapp size={28} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">WhatsApp</h3>
          <p className="text-gray-500 mb-4 text-sm">Respon cepat untuk kendala pemesanan & bantuan langsung.</p>
          <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" className="mt-auto font-semibold text-green-600 hover:text-green-700">
            +62 812-3456-7890 &rarr;
          </a>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center flex flex-col items-center hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 mb-4">
            <IconMail size={28} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Email</h3>
          <p className="text-gray-500 mb-4 text-sm">Untuk keperluan kerjasama, kemitraan kos, atau keluhan bisnis.</p>
          <a href="mailto:support@ngekoz.id" className="mt-auto font-semibold text-purple-600 hover:text-purple-700">
            support@ngekoz.id &rarr;
          </a>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center flex flex-col items-center hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-4">
            <IconMapPin size={28} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Kantor Pusat</h3>
          <p className="text-gray-500 mb-4 text-sm">Jl. Raya Madiun Selatan No. 123, Jawa Timur, Indonesia.</p>
          <span className="mt-auto font-semibold text-gray-400">Senin - Jumat (09:00 - 17:00)</span>
        </div>
      </div>
    </div>
  );
}