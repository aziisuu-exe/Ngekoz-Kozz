"use client";

import * as React from "react";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { IconMapPin, IconSearch } from "@tabler/icons-react";

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?q=80&w=2070&auto=format&fit=crop"
];

export function HeroSlider() {
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  return (
    <section className="relative w-full h-[550px] lg:h-[650px] overflow-hidden">
      <Carousel
        plugins={[plugin.current]}
        className="absolute inset-0 w-full h-full"
        opts={{ loop: true }}
      >
        <CarouselContent className="h-full ml-0">
          {HERO_IMAGES.map((src, index) => (
            <CarouselItem key={index} className="relative w-full h-[550px] lg:h-[650px] pl-0">
              <Image
                src={src}
                alt={`Ngekoz Premium Space ${index + 1}`}
                fill
                priority={index === 0} 
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gray-900/60 mix-blend-multiply" />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-6 animate-in slide-in-from-bottom-4 duration-700">
          Temukan Kos Idamanmu <br className="hidden md:block" />
          <span className="text-purple-400">Lebih Cepat & Aman</span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl animate-in slide-in-from-bottom-5 duration-700 delay-100">
          Platform pencarian dan pemesanan kos terpercaya di Indonesia. Transparan, tanpa biaya tersembunyi.
        </p>

        <div className="w-full max-w-4xl bg-white/95 backdrop-blur-md rounded-2xl p-2 md:p-3 shadow-2xl animate-in zoom-in-95 duration-700 delay-200 flex flex-col md:flex-row gap-2 md:gap-3 items-center border border-white/20">
          <div className="flex-1 w-full flex items-center bg-gray-50/80 hover:bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 focus-within:ring-2 focus-within:ring-purple-600 focus-within:border-transparent transition-all">
            <IconMapPin className="text-gray-400 mr-3" size={24} />
            <input
              type="text"
              placeholder="Masukkan nama kota, kecamatan, atau kampus..."
              className="w-full bg-transparent text-gray-900 outline-none placeholder:text-gray-500 font-medium"
            />
          </div>
          <button className="w-full md:w-auto flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-8 py-3.5 rounded-xl font-bold transition-colors shadow-md shadow-purple-600/20">
            <IconSearch size={20} />
            Cari Kos
          </button>
        </div>

      </div>
    </section>
  );
}