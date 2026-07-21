"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function KeuanganFilter({ currentMonth }: { currentMonth: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleMonthChange = (month: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (month !== "all") {
      params.set("month", month);
    } else {
      params.delete("month");
    }
    router.push(`/owner/keuangan?${params.toString()}`);
  };

  const months = [
    { label: "Semua Bulan", value: "all" },
    { label: "Januari", value: "1" },
    { label: "Februari", value: "2" },
    { label: "Maret", value: "3" },
    { label: "April", value: "4" },
    { label: "Mei", value: "5" },
    { label: "Juni", value: "6" },
    { label: "Juli", value: "7" },
    { label: "Agustus", value: "8" },
    { label: "September", value: "9" },
    { label: "Oktober", value: "10" },
    { label: "November", value: "11" },
    { label: "Desember", value: "12" },
  ];

  return (
    <select
      value={currentMonth}
      onChange={(e) => handleMonthChange(e.target.value)}
      className="px-3 py-2 text-xs font-bold bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 text-gray-800 cursor-pointer shadow-2xs"
    >
      {months.map((m) => (
        <option key={m.value} value={m.value}>
          {m.label}
        </option>
      ))}
    </select>
  );
}