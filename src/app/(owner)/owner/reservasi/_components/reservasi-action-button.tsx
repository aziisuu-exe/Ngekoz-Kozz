"use client";

import { useState } from "react";
import { updateStatusReservasiAction } from "@/features/owner/reservasi-actions";
import { IconCheck, IconX, IconBrandWhatsapp } from "@tabler/icons-react";
import Swal from "sweetalert2";

interface ActionProps {
  reservasiId: number;
  currentStatus: string;
  phonePenyewa: string;
  namaPenyewa: string;
  namaKos: string;
}

export function ReservasiActionButtons({
  reservasiId,
  currentStatus,
  phonePenyewa,
  namaPenyewa,
  namaKos
}: ActionProps) {
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (status: "approved" | "rejected") => {
    const actionText = status === "approved" ? "Setujui" : "Tolak";
    const res = await Swal.fire({
      title: `${actionText} Reservasi?`,
      text: `Konfirmasi pengajuan sewa dari ${namaPenyewa}?`,
      icon: status === "approved" ? "question" : "warning",
      showCancelButton: true,
      confirmButtonColor: status === "approved" ? "#9333ea" : "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: `Ya, ${actionText}!`,
      cancelButtonText: "Batal",
      customClass: { popup: "rounded-2xl font-sans text-sm" }
    });

    if (!res.isConfirmed) return;

    setLoading(true);
    try {
      await updateStatusReservasiAction(reservasiId, status);
      Swal.fire({
        title: "Status Diperbarui!",
        text: `Reservasi telah ${status === "approved" ? "disetujui" : "ditolak"}.`,
        icon: "success",
        confirmButtonColor: "#9333ea"
      });
    } catch (err: any) {
      Swal.fire({
        title: "Gagal!",
        text: err.message || "Terjadi kesalahan.",
        icon: "error",
        confirmButtonColor: "#9333ea"
      });
    } finally {
      setLoading(false);
    }
  };

  const formattedPhone = phonePenyewa.startsWith("0")
    ? `62${phonePenyewa.slice(1)}`
    : phonePenyewa;

  const waText = encodeURIComponent(
    `Halo ${namaPenyewa}, saya Owner dari ${namaKos} di Ngekoz. Terkait pengajuan sewa kos Anda...`
  );

  return (
    <div className="flex items-center gap-1.5">
      {phonePenyewa && phonePenyewa !== "-" && (
        <a
          href={`https://wa.me/${formattedPhone}?text=${waText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200/60 transition-colors"
          title="Hubungi WhatsApp Penyewa"
        >
          <IconBrandWhatsapp size={16} />
        </a>
      )}

      {currentStatus === "pending" && (
        <>
          <button
            onClick={() => handleUpdate("approved")}
            disabled={loading}
            className="p-1.5 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-200/60 transition-colors disabled:opacity-40 cursor-pointer"
            title="Setujui Reservasi"
          >
            <IconCheck size={16} strokeWidth={2.5} />
          </button>

          <button
            onClick={() => handleUpdate("rejected")}
            disabled={loading}
            className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200/60 transition-colors disabled:opacity-40 cursor-pointer"
            title="Tolak Reservasi"
          >
            <IconX size={16} strokeWidth={2.5} />
          </button>
        </>
      )}
    </div>
  );
}