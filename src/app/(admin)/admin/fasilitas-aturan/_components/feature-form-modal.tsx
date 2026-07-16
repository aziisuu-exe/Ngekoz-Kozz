"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { upsertFasilitas, upsertAturan } from "@/features/admin/actions";
import { IconX } from "@tabler/icons-react";
import Swal from "sweetalert2";

interface FeatureFormModalProps {
  type: "fasilitas" | "aturan";
  editItem?: any;
  closeUrl: string;
}

export function FeatureFormModal({ type, editItem, closeUrl }: FeatureFormModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [nama, setNama] = useState(editItem ? editItem.nama : "");
  const [icon, setIcon] = useState(editItem ? editItem.icon || "IconArmchair" : "IconArmchair");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) return;

    startTransition(async () => {
      try {
        if (type === "fasilitas") {
          await upsertFasilitas(editItem ? editItem.id : null, nama, icon);
        } else {
          await upsertAturan(editItem ? editItem.id : null, nama);
        }

        Swal.fire({
          title: "Berhasil!",
          text: `Data ${type} berhasil disimpan ke sistem.`,
          icon: "success",
          confirmButtonColor: "#9333ea",
          customClass: { popup: "rounded-2xl font-sans text-sm" }
        });

        router.push(closeUrl);
        router.refresh();
      } catch (err: any) {
        Swal.fire({
          title: "Gagal!",
          text: err.message || "Terjadi kesalahan internal pada sistem.",
          icon: "error",
          confirmButtonColor: "#9333ea",
          customClass: { popup: "rounded-2xl font-sans text-sm" }
        });
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl border border-gray-100 shadow-xl overflow-hidden p-6 space-y-4">
        
        <div className="flex items-center justify-between border-b border-gray-50 pb-3">
          <h3 className="text-base font-bold text-gray-900 capitalize">
            {editItem ? "Edit" : "Tambah"} {type}
          </h3>
          <button 
            onClick={() => router.push(closeUrl)}
            className="p-1 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition-colors"
          >
            <IconX size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
              Nama {type === "fasilitas" ? "Fasilitas" : "Aturan"} Kos
            </label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder={`Contoh: ${type === "fasilitas" ? "Kamar Mandi Dalam" : "Dilarang Membawa Hewan"}`}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 placeholder-gray-400 transition-all font-medium text-gray-900"
              required
            />
          </div>

          {type === "fasilitas" && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                Kode Icon (Tabler Icons)
              </label>
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="Contoh: IconWifi, IconAirConditioning"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 font-mono transition-all text-gray-900"
                required
              />
            </div>
          )}

          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push(closeUrl)}
              className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors text-center cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 shadow-sm text-center cursor-pointer"
            >
              {isPending ? "Menyimpan..." : "Simpan Data"}
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
}