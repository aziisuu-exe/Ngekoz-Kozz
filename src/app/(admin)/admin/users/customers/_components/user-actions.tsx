"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toggleUserActive, deleteUserAccount } from "@/features/admin/actions";
import { IconTrash, IconPower } from "@tabler/icons-react";
import Swal from "sweetalert2";

interface UserActionsProps {
  userId: number | string;
  isActive: boolean;
  searchParamsString: string;
}

export function UserActions({ userId, isActive, searchParamsString }: UserActionsProps) {
  const router = useRouter();
  const [loadingToggle, setLoadingToggle] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const handleToggle = async () => {
    setLoadingToggle(true);
    try {
      await toggleUserActive(userId, isActive);
      
      Swal.fire({
        title: "Berhasil!",
        text: `Status akun berhasil diubah menjadi ${!isActive ? "Aktif" : "Non-aktif"}.`,
        icon: "success",
        confirmButtonColor: "#9333ea",
        customClass: { popup: "rounded-2xl font-sans text-sm" }
      });
      
      router.refresh();
    } catch (err) {
      Swal.fire({
        title: "Gagal!",
        text: "Gagal mengubah status keaktifan akun pengguna.",
        icon: "error",
        confirmButtonColor: "#9333ea",
        customClass: { popup: "rounded-2xl font-sans text-sm" }
      });
    } finally {
      setLoadingToggle(false);
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Hapus Akun Permanen?",
      text: "Seluruh riwayat transaksi dan data profil pengguna ini akan dihapus permanen dari basis data.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Hapus Permanen",
      cancelButtonText: "Batal",
      customClass: { popup: "rounded-2xl font-sans text-sm" }
    });

    if (!result.isConfirmed) return;

    setLoadingDelete(true);
    try {
      await deleteUserAccount(userId);
      
      await Swal.fire({
        title: "Terhapus!",
        text: "Akun pengguna telah dibersihkan secara permanen.",
        icon: "success",
        confirmButtonColor: "#9333ea",
        customClass: { popup: "rounded-2xl font-sans text-sm" }
      });

      router.push(`/admin/users/customers?${searchParamsString}`);
      router.refresh();
    } catch (err) {
      Swal.fire({
        title: "Gagal Menghapus!",
        text: "Terjadi gangguan server atau dependensi relasi data data aktif.",
        icon: "error",
        confirmButtonColor: "#9333ea",
        customClass: { popup: "rounded-2xl font-sans text-sm" }
      });
    } finally {
      setLoadingDelete(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full pt-2">
      <button
        onClick={handleToggle}
        disabled={loadingToggle || loadingDelete}
        className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-colors border disabled:opacity-50 cursor-pointer ${
          isActive
            ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
            : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
        }`}
      >
        <IconPower size={16} />
        {loadingToggle ? "Memproses..." : isActive ? "Nonaktifkan Akun" : "Aktifkan Akun"}
      </button>

      <button
        onClick={handleDelete}
        disabled={loadingToggle || loadingDelete}
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
      >
        <IconTrash size={16} />
        {loadingDelete ? "Menghapus..." : "Hapus Akun Permanen"}
      </button>
    </div>
  );
}