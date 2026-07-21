"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function ReservasiFilter({ currentStatus }: { currentStatus: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleStatusChange = (status: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (status !== "all") {
      params.set("status", status);
    } else {
      params.delete("status");
    }
    params.set("page", "1");
    router.push(`/owner/reservasi?${params.toString()}`);
  };

  const statuses = [
    { label: "Semua status", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Disetujui", value: "approved" },
    { label: "Ditolak", value: "rejected" },
  ];

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
      {statuses.map((item) => {
        const isActive = currentStatus === item.value;
        return (
          <button
            key={item.value}
            onClick={() => handleStatusChange(item.value)}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              isActive
                ? "bg-purple-600 text-white shadow-xs"
                : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-200/70"
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}