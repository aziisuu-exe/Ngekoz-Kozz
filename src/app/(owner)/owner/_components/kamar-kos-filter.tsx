"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface KamarKosFilterProps {
  currentKosFilter: string;
  kosOptions: { id: number | string; nama_kos: string }[];
}

export function KamarKosFilter({ currentKosFilter, kosOptions }: KamarKosFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleKosChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    const selectedValue = e.target.value;

    if (selectedValue && selectedValue !== "all") {
      params.set("kosId", selectedValue);
    } else {
      params.delete("kosId");
    }

    // Reset pagination ke halaman 1 setiap kali filter berubah
    params.set("page", "1");

    router.push(`/owner/kamar?${params.toString()}`);
  };

  return (
    <div className="w-full sm:w-64">
      <select
        value={currentKosFilter}
        onChange={handleKosChange}
        className="w-full px-3 py-1.5 text-xs font-semibold bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 text-gray-800 cursor-pointer"
      >
        <option value="all">Semua Properti ({kosOptions.length})</option>
        {kosOptions.map((k) => (
          <option key={k.id} value={k.id}>
            {k.nama_kos}
          </option>
        ))}
      </select>
    </div>
  );
}