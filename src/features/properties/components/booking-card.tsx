"use client";

import { useState } from "react";
import { 
  IconBrandWhatsapp, 
  IconMessageCircle, 
  IconBed, 
  IconCalendarTime,
  IconLoader2,
  IconCalendarEvent
} from "@tabler/icons-react";
import Image from "next/image";

interface KamarItem {
  id: number | string;
  nomor_kamar: string;
  ukuran: string;
  price_per_month: number;
  price_per_day: number;
  kamar_tersedia: number;
}

interface OwnerInfo {
  id: string;
  nama: string;
  profile_photo: string;
  phone: string;
}

interface BookingCardProps {
  kamarKos: KamarItem[];
  owner: OwnerInfo;
  namaKos: string;
}

export function BookingCard({ kamarKos, owner, namaKos }: BookingCardProps) {
  const [selectedRoomIdx, setSelectedRoomIdx] = useState<number>(0);
  const [durationType, setDurationType] = useState<"bulanan" | "harian">("bulanan");
  const [durationValue, setDurationValue] = useState<number>(1);
  
  const [checkInDate, setCheckInDate] = useState<string>(() => {
    return new Date().toISOString().split("T")[0];
  });
  
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const activeRoom = kamarKos[selectedRoomIdx];
  const isRoomFull = !activeRoom || activeRoom.kamar_tersedia <= 0;

  const basePrice = activeRoom 
    ? (durationType === "bulanan" ? Number(activeRoom.price_per_month) : Number(activeRoom.price_per_day))
    : 0;
  const totalPrice = basePrice * durationValue;

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleWhatsAppRedirect = () => {
    let formattedPhone = owner.phone?.trim().replace(/[^0-9]/g, "") || "";
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "62" + formattedPhone.slice(1);
    }
    
    const message = `Halo Kak ${owner.nama}, saya tertarik dengan kos "${namaKos}" untuk kamar nomor ${activeRoom?.nomor_kamar || ""}. Rencana check-in tanggal ${checkInDate}. Apakah masih tersedia?`;
    const waUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  const handleReservation = () => {
    setIsLoading(true);
    
    const payload = {
      id_kamar: activeRoom.id,
      tanggal_check_in: checkInDate, 
      duration_values: durationType,
      durasi: durationValue,
      total_harga: totalPrice
    };
    
    console.log("Mempersiapkan pembuatan Invoice & Data Reservasi:", payload);
    
    setTimeout(() => {
      setIsLoading(false);
      alert("Payload reservasi siap dikirim ke server. Cek console!");
    }, 1500);
  };

  return (
    <div className="sticky top-28 bg-white p-6 rounded-3xl border border-gray-200 shadow-xl shadow-gray-200/40 space-y-6">
      
      {kamarKos.length > 0 && (
        <div className="space-y-3">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tipe Kamar</label>
          <div className="grid grid-cols-2 gap-4">
            {kamarKos.map((kamar, index) => {
              const isSelected = selectedRoomIdx === index;
              return (
                <button
                  key={kamar.id}
                  onClick={() => {
                    setSelectedRoomIdx(index);
                    setDurationValue(1);
                  }}
                  className={`flex flex-col justify-center items-start px-3.5 sm:px-4 py-3 rounded-2xl border transition-all cursor-pointer ${
                    isSelected 
                      ? "border-purple-600 bg-purple-50 shadow-sm shadow-purple-100" 
                      : "border-gray-200 bg-white hover:border-purple-200"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <IconBed size={16} className={`shrink-0 ${isSelected ? "text-purple-600" : "text-gray-400"}`} />
                    <span className={`text-sm font-bold truncate ${isSelected ? "text-purple-700" : "text-gray-700"}`}>
                      {kamar.nomor_kamar}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-gray-500 truncate w-full text-left">{kamar.ukuran}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Skema</label>
          <div className="flex p-1 bg-gray-100 rounded-xl border border-gray-200/30">
            <button
              onClick={() => { setDurationType("bulanan"); setDurationValue(1); }}
              className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                durationType === "bulanan" ? "bg-white text-purple-600 shadow-sm" : "text-gray-500"
              }`}
            >
              Bulanan
            </button>
            <button
              onClick={() => { setDurationType("harian"); setDurationValue(1); }}
              className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                durationType === "harian" ? "bg-white text-purple-600 shadow-sm" : "text-gray-500"
              }`}
            >
              Harian
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Durasi</label>
          <div className="flex items-center justify-between bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200/50 h-[44px]">
            <input 
              type="number" 
              min={1} max={durationType === "bulanan" ? 12 : 30}
              value={durationValue}
              onChange={(e) => setDurationValue(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-10 text-center bg-transparent font-bold text-gray-800 focus:outline-none text-sm"
            />
            <span className="text-xs font-bold text-gray-500">
              {durationType === "bulanan" ? "Bln" : "Hari"}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tanggal Check-in</label>
        <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200/50 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500 transition-all">
          <IconCalendarEvent size={20} className="text-purple-500 shrink-0" />
          <input 
            type="date" 
            min={new Date().toISOString().split("T")[0]} 
            value={checkInDate}
            onChange={(e) => setCheckInDate(e.target.value)}
            className="w-full bg-transparent text-sm font-semibold text-gray-800 outline-none cursor-pointer"
          />
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Pembayaran</span>
          <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
            {formatIDR(basePrice)} / {durationType === "bulanan" ? "bln" : "hari"}
          </span>
        </div>
        <div className="flex items-end justify-between">
          <h3 className="text-3xl font-black text-gray-900 leading-none mt-1">{formatIDR(totalPrice)}</h3>
          {isRoomFull ? (
            <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md mb-1">Kamar Penuh</span>
          ) : (
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md mb-1">Sisa {activeRoom.kamar_tersedia} Kamar</span>
          )}
        </div>
      </div>

      <button
        onClick={handleReservation}
        disabled={isRoomFull || isLoading}
        className="w-full py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-black rounded-2xl shadow-lg shadow-purple-600/20 active:scale-98 transition-all flex justify-center items-center cursor-pointer"
      >
        {isLoading ? <IconLoader2 className="animate-spin" size={20} /> : <span>{isRoomFull ? "Tidak Tersedia" : "Reservasi Sekarang"}</span>}
      </button>

      <div className="pt-5 border-t border-gray-100 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gray-100 rounded-full overflow-hidden relative border border-gray-200">
            {owner.profile_photo ? (
              <Image src={owner.profile_photo} alt={owner.nama} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-purple-100 text-purple-600 font-bold text-sm">
                {owner.nama?.charAt(0) || "O"}
              </div>
            )}
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">{owner.nama || "Owner"}</h4>
            <p className="text-xs font-medium text-gray-400">Pemilik Kos (Owner)</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => alert("Fitur Chat segera diintegrasikan")}
            className="flex justify-center items-center gap-1.5 py-2.5 rounded-xl border border-gray-200 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 text-gray-600 font-bold text-xs transition-all cursor-pointer"
          >
            <IconMessageCircle size={16} /> Chat
          </button>
          <button
            onClick={handleWhatsAppRedirect}
            className="flex justify-center items-center gap-1.5 py-2.5 rounded-xl border border-gray-200 hover:bg-green-50 hover:text-green-600 hover:border-green-200 text-gray-600 font-bold text-xs transition-all cursor-pointer"
          >
            <IconBrandWhatsapp size={16} /> WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}