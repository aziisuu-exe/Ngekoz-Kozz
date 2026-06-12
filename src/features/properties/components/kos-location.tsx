"use client";

import { useState } from "react";
import { IconMapPin, IconRoute } from "@tabler/icons-react";

interface KosLocationProps {
  latitude: string;
  longitude: string;
  alamat: string;
  namaKos: string;
}

export function KosLocation({ latitude, longitude, alamat, namaKos }: KosLocationProps) {
  const [isNavigating, setIsNavigating] = useState(false);

  // Parse string koordinat dari database menjadi float number
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);

  // Fallback State jika koordinat kosong atau korup di database
  if (!latitude || !longitude || isNaN(lat) || isNaN(lng)) {
    return (
      <section className="py-8 border-b border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Lokasi Kos</h2>
        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-3 text-gray-500">
          <IconMapPin className="text-gray-400 flex-shrink-0" />
          <span className="text-sm font-medium">{alamat}</span>
        </div>
      </section>
    );
  }

  const handleOpenNavigation = () => {
    setIsNavigating(true);
    
    // Google Maps Universal Directions URL (Otomatis tracking dari lokasi saat ini ke tujuan)
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    
    window.open(googleMapsUrl, "_blank", "noopener,noreferrer");
    
    setTimeout(() => setIsNavigating(false), 1000);
  };

  // Gunakan Free Embed API untuk merender peta tanpa memakan kuota billing API key berbayar selama masa dev
  const mapEmbedUrl = `https://maps.google.com/maps?q=${lat},${lng}&z=16&output=embed`;

  return (
    <section className="py-8 border-b border-gray-100">
      {/* Header Lokasi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-gray-900">Lokasi Kos</h2>
          <div className="flex items-start gap-1.5 text-gray-600 text-sm font-medium">
            <IconMapPin size={18} className="text-purple-600 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">{alamat}</p>
          </div>
        </div>
        
        {/* Premium CTA Button untuk Rute Navigasi */}
        <button
          onClick={handleOpenNavigation}
          disabled={isNavigating}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-bold rounded-2xl shadow-lg shadow-purple-600/20 transition-all text-sm active:scale-98 cursor-pointer flex-shrink-0"
        >
          <IconRoute size={20} />
          <span>{isNavigating ? "Membuka Maps..." : "Petunjuk Rute"}</span>
        </button>
      </div>

      {/* Container Iframe Peta Premium */}
      <div className="w-full h-80 sm:h-96 rounded-3xl overflow-hidden border border-gray-200/60 shadow-sm bg-gray-50 relative group">
        <iframe
          src={mapEmbedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-full contrast-[105%] saturate-[95%] group-hover:contrast-100 transition-all duration-300"
        ></iframe>
      </div>
    </section>
  );
}