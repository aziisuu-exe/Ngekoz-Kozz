"use client";

import { useState } from "react";
import { IconStarFilled, IconStar, IconRosetteDiscountCheckFilled, IconUser } from "@tabler/icons-react";
import Image from "next/image";

interface ReviewItem {
  id: number;
  rating: number;
  comment: string;
  is_verified: boolean;
  created_at: string;
  users: {
    nama: string;
    profile_photo: string;
  };
}

interface KosReviewsProps {
  reviews: ReviewItem[];
  ratingAvg: number;
  totalReview: number;
}

export function KosReviews({ reviews, ratingAvg, totalReview }: KosReviewsProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>("semua");

  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((rev) => {
    const floorRating = Math.floor(rev.rating) as 1 | 2 | 3 | 4 | 5;
    if (distribution[floorRating] !== undefined) {
      distribution[floorRating]++;
    }
  });

  const filteredReviews = reviews.filter((rev) => {
    if (selectedFilter === "semua") return true;
    if (selectedFilter === "verified") return rev.is_verified;
    return Math.floor(rev.rating) === parseInt(selectedFilter);
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Ulasan Penyewa ({totalReview})</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-gray-50/60 p-6 sm:p-8 rounded-3xl border border-gray-100 mb-8">
        <div className="flex flex-col items-center justify-center text-center md:border-r border-gray-200/60 md:pr-4">
          <h3 className="text-5xl font-black text-gray-900 mb-2">{ratingAvg.toFixed(1)}</h3>
          <div className="flex items-center gap-0.5 text-orange-500 mb-2">
            {[...Array(5)].map((_, i) => (
              <IconStarFilled key={i} size={20} className={i < Math.round(ratingAvg) ? "text-orange-500" : "text-gray-200"} />
            ))}
          </div>
          <p className="text-sm font-semibold text-gray-500">Rata-rata rating kos ini</p>
        </div>

        <div className="col-span-1 md:col-span-2 space-y-2.5 flex flex-col justify-center">
          {([5, 4, 3, 2, 1] as const).map((star) => {
            const count = distribution[star];
            const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-4 text-sm font-medium">
                <div className="flex items-center gap-1 w-12 text-gray-600">
                  <span className="w-3 text-right">{star}</span>
                  <IconStarFilled size={14} className="text-orange-500" />
                </div>
                <div className="flex-1 h-3 bg-gray-200/70 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-600 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-8 text-gray-400 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-100 pb-4">
        {[
          { id: "semua", label: `Semua (${reviews.length})` },
          { id: "verified", label: "Penyewa Terverifikasi" },
          { id: "5", label: "Bintang 5" },
          { id: "4", label: "Bintang 4" },
          { id: "3", label: "Bintang 3" },
        ].map((btn) => (
          <button
            key={btn.id}
            onClick={() => setSelectedFilter(btn.id)}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl border transition-all cursor-pointer ${
              selectedFilter === btn.id
                ? "bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-600/10"
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {filteredReviews.length === 0 ? (
        <div className="text-center py-12 bg-gray-50/30 border border-dashed border-gray-200 rounded-2xl text-gray-400 font-medium">
          Tidak ada ulasan kriteria ini.
        </div>
      ) : (
        <div className="space-y-6 divide-y divide-gray-100">
          {filteredReviews.map((item) => (
            <div key={item.id} className="pt-6 first:pt-0 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-purple-50 rounded-full overflow-hidden relative border border-purple-100 flex items-center justify-center text-purple-400">
                    {item.users.profile_photo ? (
                      <Image
                        src={item.users.profile_photo}
                        alt={item.users.nama}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <IconUser size={20} />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-gray-900 text-sm sm:text-base">{item.users.nama}</h4>
                      {item.is_verified && (
                        <div className="flex items-center gap-0.5 text-xs text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded-md">
                            <IconRosetteDiscountCheckFilled size={16} className="text-green-500" />
                            <span className="hidden sm:inline">Penyewa</span>
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 font-semibold">{formatDate(item.created_at)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-0.5 text-orange-500 bg-orange-50/60 px-2 py-1 rounded-lg">
                  <IconStarFilled size={14} />
                  <span className="text-xs font-bold">{item.rating.toFixed(1)}</span>
                </div>
              </div>

              <p className="text-gray-600 text-sm sm:text-base leading-relaxed whitespace-pre-line pl-[0px] md:pl-[56px]">
                {item.comment || "Penyewa tidak memberikan komentar tertulis."}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}