"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { upsertKamarAction } from "@/features/owner/kamar-actions";
import { IconX } from "@tabler/icons-react";
import Swal from "sweetalert2";

interface KamarModalProps {
  kosOptions: any[];
  editItem?: any;
  closeUrl: string;
}

export function KamarModal({ kosOptions, editItem, closeUrl }: KamarModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [idDetailKos, setIdDetailKos] = useState(editItem ? String(editItem.id_detail_kos) : (kosOptions[0]?.id ? String(kosOptions[0].id) : ""));
  const [nomorKamar, setNomorKamar] = useState(editItem ? editItem.nomor_kamar : "");
  const [pricePerMonth, setPricePerMonth] = useState(editItem ? String(editItem.harga_bulanan) : "1500000");
  const [totalKamar, setTotalKamar] = useState(editItem ? String(editItem.total_kamar) : "5");
  const [kamarTersedia, setKamarTersedia] = useState(editItem ? String(editItem.kamar_tersedia) : "5");
  const [ukuran, setUkuran] = useState(editItem ? editItem.ukuran : "3x4 m");
  const [deskripsi, setDeskripsi] = useState(editItem ? editItem.deskripsi : "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!idDetailKos || !nomorKamar || !pricePerMonth || !totalKamar) {
      Swal.fire({ title: "Validasi Gagal", text: "Harap lengkapi semua bidang wajib.", icon: "warning", confirmButtonColor: "#9333ea" });
      return;
    }

    startTransition(async () => {
      try {
        await upsertKamarAction(editItem ? editItem.id : null, {
          id_detail_kos: Number(idDetailKos),
          nomor_kamar: nomorKamar,
          price_per_month: Number(pricePerMonth),
          price_per_day: 0,
          total_kamar: Number(totalKamar),
          kamar_tersedia: Number(kamarTersedia),
          ukuran: ukuran,
          deskripsi: deskripsi,
          is_available: true
        });

        await Swal.fire({
          title: "Berhasil!",
          text: `Data tipe/unit kamar berhasil ${editItem ? "diperbarui" : "ditambahkan"}.`,
          icon: "success",
          confirmButtonColor: "#9333ea",
          customClass: { popup: "rounded-2xl font-sans text-sm" }
        });

        router.push(closeUrl);
        router.refresh();
      } catch (err: any) {
        Swal.fire({ title: "Gagal Simpan", text: err.message || "Terjadi kesalahan sistem.", icon: "error", confirmButtonColor: "#9333ea" });
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl border border-gray-100 shadow-xl overflow-hidden p-6 space-y-4">
        
        <div className="flex items-center justify-between border-b border-gray-50 pb-3">
          <h3 className="text-base font-bold text-gray-900">
            {editItem ? "Edit Tipe / Unit Kamar" : "Tambah Tipe / Unit Kamar"}
          </h3>
          <button 
            type="button"
            onClick={() => router.push(closeUrl)}
            className="p-1 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition-colors"
          >
            <IconX size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Pilih Properti Kos</label>
            <select
              value={idDetailKos}
              onChange={(e) => setIdDetailKos(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 font-medium text-gray-900 bg-white"
              required
            >
              {kosOptions.map(k => (
                <option key={k.id} value={k.id}>{k.nama_kos}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Nomor / Nama Tipe Kamar</label>
              <input
                type="text"
                value={nomorKamar}
                onChange={(e) => setNomorKamar(e.target.value)}
                placeholder="Contoh: Standard Room / A1"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 font-medium text-gray-900"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Ukuran Dimensi</label>
              <input
                type="text"
                value={ukuran}
                onChange={(e) => setUkuran(e.target.value)}
                placeholder="Contoh: 3x4 m"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 font-medium text-gray-900"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Harga Sewa Bulanan (Rp)</label>
            <input
              type="number"
              value={pricePerMonth}
              onChange={(e) => setPricePerMonth(e.target.value)}
              placeholder="1500000"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 font-medium text-gray-900"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Total Stok Unit Kamar</label>
              <input
                type="number"
                value={totalKamar}
                onChange={(e) => {
                  setTotalKamar(e.target.value);
                  if (!editItem) setKamarTersedia(e.target.value);
                }}
                placeholder="5"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 font-medium text-gray-900"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Sisa Kamar Kosong</label>
              <input
                type="number"
                value={kamarTersedia}
                onChange={(e) => setKamarTersedia(e.target.value)}
                placeholder="5"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 font-medium text-gray-900"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Deskripsi / Fasilitas Khusus</label>
            <textarea
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Contoh: Kamar luas dengan fasilitas AC, Water Heater, Smart TV, dan jendela luar."
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 font-medium text-gray-900 resize-none"
            />
          </div>

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
              {isPending ? "Menyimpan..." : "Simpan Kamar"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}