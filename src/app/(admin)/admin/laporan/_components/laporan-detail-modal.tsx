"use client";

import Link from "next/link";
import { resolveLaporanAction } from "@/features/admin/actions";
import { IconAlertTriangle, IconX, IconLink } from "@tabler/icons-react";
import Swal from "sweetalert2";
import { useTransition } from "react";

interface LaporanDetailModalProps {
  selectedLaporan: any;
  cleanParamsString: string;
}

export function LaporanDetailModal({ selectedLaporan, cleanParamsString }: LaporanDetailModalProps) {
  const [isPending, startTransition] = useTransition();

  const handleAction = (actionType: "ignore" | "takedown") => {
    const isTakeDown = actionType === "takedown";

    Swal.fire({
      title: isTakeDown ? "Take Down Properti?" : "Abaikan Laporan?",
      text: isTakeDown 
        ? "Kos terlapor akan ditarik dari listing platform secara publik."
        : "Arsipkan aduan tanpa menjatuhkan sanksi.",
      icon: isTakeDown ? "warning" : "question",
      showCancelButton: true,
      confirmButtonColor: isTakeDown ? "#ef4444" : "#6b7280",
      cancelButtonColor: "#e5e7eb",
      confirmButtonText: isTakeDown ? "Ya, Take Down!" : "Ya, Abaikan",
      cancelButtonText: "Batal",
      customClass: { popup: "rounded-2xl font-sans text-sm" }
    }).then((result) => {
      if (result.isConfirmed) {
        startTransition(async () => {
          try {
            await resolveLaporanAction(selectedLaporan.id, actionType, selectedLaporan.id_kos);
            
            await Swal.fire({
              title: "Selesai!",
              text: isTakeDown ? "Properti berhasil di-take down." : "Laporan sukses diabaikan.",
              icon: "success",
              confirmButtonColor: "#9333ea",
              customClass: { popup: "rounded-2xl font-sans text-sm" }
            });

            window.location.href = `/admin/laporan?${cleanParamsString}`;
          } catch (err: any) {
            Swal.fire({
              title: "Gagal!",
              text: err.message || "Terjadi kendala saat memproses tindakan moderasi.",
              icon: "error",
              confirmButtonColor: "#9333ea",
              customClass: { popup: "rounded-2xl font-sans text-sm" }
            });
          }
        });
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl border border-gray-100 shadow-xl overflow-hidden p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        
        <div className="flex items-center justify-between border-b border-gray-50 pb-3">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <IconAlertTriangle size={18} className="text-amber-500" />
            Rincian Laporan Pelanggaran
          </h3>
          <Link 
            href={`/admin/laporan?${cleanParamsString}`}
            className="p-1 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition-colors"
          >
            <IconX size={18} />
          </Link>
        </div>

        <div className="bg-gray-50/60 rounded-xl border border-gray-100 p-4 space-y-2 text-xs">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Pelapor</span>
            <span className="text-gray-900 font-semibold text-sm">{selectedLaporan.pelapor}</span>
          </div>
          <div className="pt-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Properti Terlapor</span>
            <span className="text-purple-600 font-bold text-sm">{selectedLaporan.nama_kos}</span>
          </div>
          <div className="pt-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Kategori Klasifikasi</span>
            <span className="text-amber-700 font-bold text-xs bg-amber-50 px-2 py-0.5 rounded-md capitalize inline-block mt-0.5">
              {selectedLaporan.kategori.replace(/_/g, " ")}
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Kronologi / Rincian</span>
          <p className="text-xs text-gray-700 bg-red-50/20 border border-red-100/50 p-4 rounded-xl leading-relaxed italic font-medium">
            "{selectedLaporan.deskripsi}"
          </p>
        </div>

        {selectedLaporan.bukti_url && (
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Lampiran Bukti Valid</span>
            <a
              href={selectedLaporan.bukti_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-xs font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 px-3 py-2 rounded-xl border border-purple-100 transition-colors w-full justify-center"
            >
              <IconLink size={14} />
              Buka Tautan Bukti Laporan
            </a>
          </div>
        )}

        <div className="pt-2 flex flex-col gap-2">
          {selectedLaporan.status === "menunggu" ? (
            <div className="border-t border-gray-100 pt-3 space-y-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Tindakan Cepat Moderasi</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleAction("ignore")}
                  disabled={isPending}
                  className="py-2.5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer text-center disabled:opacity-50"
                >
                  Abaikan Laporan
                </button>
                <button
                  onClick={() => handleAction("takedown")}
                  disabled={isPending}
                  className="py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors cursor-pointer text-center disabled:opacity-50"
                >
                  Take Down Properti
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-2 text-center">
              <span className={`inline-flex items-center px-4 py-1 text-xs font-extrabold rounded-full uppercase tracking-widest border ${
                selectedLaporan.status === "selesai" 
                  ? "bg-green-50 text-green-700 border-green-200" 
                  : "bg-gray-100 text-gray-500 border-gray-300"
              }`}>
                STATUS: {selectedLaporan.status === "selesai" ? "DITINDAK (RESOLVED)" : "DIABAIKAN (IGNORED)"}
              </span>
            </div>
          )}

          <Link
            href={`/admin/laporan?${cleanParamsString}`}
            className="w-full text-center py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 font-semibold rounded-xl border border-gray-200 transition-colors text-xs mt-1"
          >
            Tutup Jendela
          </Link>
        </div>

      </div>
    </div>
  );
}