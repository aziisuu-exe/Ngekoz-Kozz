"use client";

import { useState } from "react";
import { deleteKamarAction } from "@/features/owner/kamar-actions";
import { IconTrash } from "@tabler/icons-react";
import Swal from "sweetalert2";

export function DeleteKamarAction({ kamarId }: { kamarId: number }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const res = await Swal.fire({
      title: "Hapus Tipe Kamar?",
      text: "Data kamar ini akan dihapus permanen. Penghuni atau booking terkait mungkin akan terpengaruh.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
      customClass: { popup: "rounded-2xl font-sans text-sm" }
    });

    if (!res.isConfirmed) return;

    setLoading(true);
    try {
      await deleteKamarAction(kamarId);
      Swal.fire({ title: "Terhapus!", text: "Tipe kamar berhasil dibersihkan.", icon: "success", confirmButtonColor: "#9333ea" });
    } catch (err: any) {
      Swal.fire({ title: "Gagal!", text: err.message || "Terjadi kesalahan.", icon: "error", confirmButtonColor: "#9333ea" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-40"
      title="Hapus Kamar"
    >
      <IconTrash size={16} />
    </button>
  );
}