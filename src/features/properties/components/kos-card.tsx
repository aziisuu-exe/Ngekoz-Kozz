import Link from "next/link";
import Image from "next/image";
import { IconMapPin, IconStarFilled, IconEye } from "@tabler/icons-react";
import type { KosData } from "../actions";

interface KosCardProps {
  kos: KosData;
}

export function KosCard({ kos }: KosCardProps) {
  const formattedPrice = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(kos.harga_termurah);

  const renderGenderBadge = (gender: string) => {
    const type = gender.toLowerCase();
    if (type === "putra") return <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Putra</span>;
    if (type === "putri") return <span className="bg-pink-100 text-pink-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Putri</span>;
    return <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Campur</span>;
  };

  return (
    <Link href={`/kos/${kos.slug}`} className="group block h-full">
      <div className="flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 h-full">
        
        <div className="relative h-48 w-full overflow-hidden bg-gray-100">
          <Image
            src={kos.foto_utama}
            alt={kos.nama_kos}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 left-3">
            {kos.sisa_kamar > 0 ? (
              <span className="bg-green-100/90 backdrop-blur-sm border border-green-200 text-green-700 text-xs font-bold px-2.5 py-1.5 rounded-md shadow-sm">
                Tersisa {kos.sisa_kamar} Kamar
              </span>
            ) : (
              <span className="bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-md shadow-sm">
                Penuh
              </span>
            )}
          </div>
        </div>

        <div className="p-4 flex flex-col flex-grow">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs font-medium text-gray-500 flex items-center gap-1 truncate max-w-[70%]">
              <IconMapPin size={14} className="text-purple-600 flex-shrink-0" />
              <span className="truncate">{kos.alamat}</span>
            </p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-xs font-medium text-gray-400" title="Dilihat">
                <IconEye size={14} />
                {kos.view_count}
              </div>
              <div className="flex items-center gap-1 bg-orange-50 px-1.5 py-0.5 rounded text-xs font-bold text-orange-600">
                <IconStarFilled size={12} />
                {kos.rating_avg}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start gap-1 mb-1">
            {renderGenderBadge(kos.gender_type)}
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-700 transition-colors line-clamp-1 w-full">
              {kos.nama_kos}
            </h3>
          </div>

          <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-grow">
            {kos.deskripsi}
          </p>

          <hr className="border-gray-100 mb-3" />

          <div className="flex items-end justify-between mt-auto">
            <div>
              <p className="text-xs text-gray-500 font-medium">Mulai dari</p>
              <p className="text-lg font-black text-gray-900">
                {formattedPrice}
                <span className="text-sm font-normal text-gray-500"> / bulan</span>
              </p>
            </div>
          </div>
        </div>

      </div>
    </Link>
  );
}