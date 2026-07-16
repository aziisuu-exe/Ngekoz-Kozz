"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateKosApproval } from "@/features/admin/actions";
import { IconCheck, IconX, IconInfoCircle } from "@tabler/icons-react";

interface VerifyActionsProps {
  kosId: number | string;
  currentStatus: "pending" | "approved" | "rejected";
}

export function VerifyActions({ kosId, currentStatus }: VerifyActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approved" | "rejected" | null>(null);

  const handleAction = async (status: "approved" | "rejected") => {
    setLoading(status);
    try {
      await updateKosApproval(kosId, status);
      router.push("/admin/kos/list");
      router.refresh();
    } catch (err) {
      alert("Gagal memproses moderasi properti");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-col gap-2.5 w-full">
      {currentStatus === "approved" && (
        <div className="flex items-start gap-2 p-3 bg-green-50 text-green-700 rounded-xl text-xs font-medium border border-green-100 mb-1">
          <IconInfoCircle size={16} className="shrink-0 mt-0.5" />
          <span>Properti ini telah disetujui dan aktif tayang di platform Ngekoz.</span>
        </div>
      )}

      {currentStatus === "rejected" && (
        <div className="flex items-start gap-2 p-3 bg-red-50 text-red-700 rounded-xl text-xs font-medium border border-red-100 mb-1">
          <IconInfoCircle size={16} className="shrink-0 mt-0.5" />
          <span>Properti ini telah ditolak dan dinonaktifkan dari publikasi.</span>
        </div>
      )}

      {currentStatus !== "approved" && (
        <button
          onClick={() => handleAction("approved")}
          disabled={loading !== null}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors shadow-sm disabled:opacity-50"
        >
          <IconCheck size={16} />
          {loading === "approved" ? "Memproses..." : "Setujui & Tayangkan"}
        </button>
      )}

      {currentStatus !== "rejected" && (
        <button
          onClick={() => handleAction("rejected")}
          disabled={loading !== null}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors disabled:opacity-50"
        >
          <IconX size={16} />
          {loading === "rejected" ? "Memproses..." : "Tolak Properti"}
        </button>
      )}
    </div>
  );
}