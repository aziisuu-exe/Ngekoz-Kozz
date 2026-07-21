"use client";

import { useState } from "react";
import { deleteProvinsi, deleteKota, deleteKecamatan } from "@/features/admin/actions";
import { IconTrash } from "@tabler/icons-react";
import Swal from "sweetalert2";

interface DeleteActionProps {
  id: string | number;
  type: "provinsi" | "kota" | "kecamatan";
}

export function DeleteAction({ id, type }: DeleteActionProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: `Data ${type} ini akan dihapus secara permanen dari sistem.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#9333ea",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
      customClass: {
        popup: "rounded-2xl font-sans text-sm",
        title: "text-base font-bold text-gray-900",
      }
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    try {
      if (type === "provinsi") await deleteProvinsi(id);
      else if (type === "kota") await deleteKota(id);
      else await deleteKecamatan(id);

      Swal.fire({
        title: "Terhapus!",
        text: `Data ${type} berhasil dibersihkan.`,
        icon: "success",
        confirmButtonColor: "#9333ea",
        customClass: { popup: "rounded-2xl font-sans text-sm" }
      });
    } catch (err: any) {
      Swal.fire({
        title: "Gagal!",
        text: err.message || "Terjadi kesalahan saat menghapus data.",
        icon: "error",
        confirmButtonColor: "#9333ea",
        customClass: { popup: "rounded-2xl font-sans text-sm" }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40 cursor-pointer"
    >
      <IconTrash size={16} />
    </button>
  );
}