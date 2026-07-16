"use client";

import { useState } from "react";
import { resolveLaporanAction } from "@/features/admin/actions";
import { IconShieldOff, IconEyeOff } from "@tabler/icons-react";
import Swal from "sweetalert2";

interface LaporanActionsProps {
  laporanId: number | string;
  kosId: number | string;
}

export function LaporanActions({ laporanId, kosId }: LaporanActionsProps) {
  const [loading, setLoading] = useState(false);

  const handleAction = async (actionType: "ignore" | "takedown") => {
    const isTakeDown = actionType === "takedown";
    
    const result = await Swal.fire({
      title: isTakeDown ? "Take Down Properti?" : "Abaikan Laporan?",
      text: isTakeDown 
        ? "Properti kos ini akan otomatis dinonaktifkan dan ditarik dari listing platform secara publik."
        : "Laporan pengaduan ini akan diarsipkan tanpa menjatuhkan sanksi pada properti terkait.",
      icon: isTakeDown ? "warning" : "question",
      showCancelButton: true,
      confirmButtonColor: isTakeDown ? "#ef4444" : "#6b7280",
      cancelButtonColor: "#e5e7eb",
      confirmButtonText: isTakeDown ? "Ya, Take Down!" : "Ya, Abaikan",
      cancelButtonText: "Batal",
      customClass: { popup: "rounded-2xl font-sans text-sm" }
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    try {
      await resolveLaporanAction(laporanId, actionType, kosId);
      
      Swal.fire({
        title: "Selesai!",
        text: isTakeDown ? "Properti berhasil di-take down." : "Laporan sukses diabaikan.",
        icon: "success",
        confirmButtonColor: "#9333ea",
        customClass: { popup: "rounded-2xl font-sans text-sm" }
      });
    } catch (err: any) {
      Swal.fire({
        title: "Gagal!",
        text: err.message || "Terjadi kendala saat memproses tindakan moderasi.",
        icon: "error",
        confirmButtonColor: "#9333ea",
        customClass: { popup: "rounded-2xl font-sans text-sm" }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-end gap-1.5">
      <button
        onClick={() => handleAction("ignore")}
        disabled={loading}
        title="Abaikan Laporan"
        className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors cursor-pointer disabled:opacity-40"
      >
        <IconEyeOff size={16} />
      </button>
      
      <button
        onClick={() => handleAction("takedown")}
        disabled={loading}
        title="Take Down Properti"
        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-40"
      >
        <IconShieldOff size={16} />
      </button>
    </div>
  );
}