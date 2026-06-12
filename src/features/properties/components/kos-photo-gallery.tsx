"use client";

import { useState } from "react";
import Image from "next/image";
import { IconCamera, IconX, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

interface Photo {
  url: string;
  thumbnail: boolean;
}

interface KosPhotoGalleryProps {
  photos: Photo[];
  kosName: string;
}

export function KosPhotoGallery({ photos, kosName }: KosPhotoGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (!photos || photos.length === 0) return null;

  const mainPhoto = photos[0];
  const otherPhotos = photos.slice(1, 5);
  const remainingCount = photos.length > 5 ? photos.length - 5 : 0;

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (selectedIndex !== null) setSelectedIndex((selectedIndex + 1) % photos.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null) setSelectedIndex((selectedIndex - 1 + photos.length) % photos.length);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-2 h-[300px] sm:h-[400px] md:h-[480px] rounded-2xl md:rounded-3xl overflow-hidden group">
        
        <div 
          className="relative col-span-1 md:col-span-2 md:row-span-2 w-full h-full cursor-pointer overflow-hidden"
          onClick={() => setSelectedIndex(0)}
        >
          <Image src={mainPhoto.url} alt={`Foto utama ${kosName}`} fill className="object-cover hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 pointer-events-none" />
        </div>

        {otherPhotos.map((photo, idx) => {
          const actualIndex = idx + 1; 
          const isLastBox = idx === 3;
          const hasMorePhotos = isLastBox && remainingCount > 0;

          return (
            <div 
              key={idx} 
              className="relative hidden md:block col-span-1 row-span-1 w-full h-full cursor-pointer overflow-hidden"
              onClick={() => setSelectedIndex(actualIndex)}
            >
              <Image src={photo.url} alt={`Foto ${actualIndex + 1} ${kosName}`} fill className="object-cover hover:scale-110 transition-transform duration-500" />
              
              {hasMorePhotos && (
                <div className="absolute inset-0 bg-black/50 hover:bg-black/60 transition-colors flex flex-col items-center justify-center text-white z-10">
                  <IconCamera size={28} className="mb-1 opacity-90" />
                  <span className="font-semibold text-sm tracking-wide">+{remainingCount} FOTO</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedIndex !== null && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center backdrop-blur-sm" 
          onClick={() => setSelectedIndex(null)} 
        >
          <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex justify-between items-center text-white z-10">
            <span className="font-medium text-sm sm:text-base bg-black/50 px-4 py-2 rounded-full">
              {selectedIndex + 1} / {photos.length}
            </span>
            <button 
              onClick={() => setSelectedIndex(null)} 
              className="p-2 sm:p-3 bg-white/10 hover:bg-red-500 hover:text-white rounded-full transition-colors"
            >
              <IconX size={24} />
            </button>
          </div>

          <button 
            onClick={handlePrev}
            className="absolute left-2 sm:left-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-10"
          >
            <IconChevronLeft size={32} />
          </button>

          <div 
            className="relative w-full max-w-6xl h-[60vh] sm:h-[85vh] px-16 sm:px-24" 
            onClick={(e) => e.stopPropagation()} 
          >
            <Image 
              src={photos[selectedIndex].url} 
              alt={`Detail Foto ${selectedIndex + 1}`} 
              fill 
              className="object-contain" 
            />
          </div>

          <button 
            onClick={handleNext}
            className="absolute right-2 sm:right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-10"
          >
            <IconChevronRight size={32} />
          </button>
        </div>
      )}
    </>
  );
}