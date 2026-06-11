"use client";

import { useState, useEffect, useTransition } from "react";
import { IconSearch, IconLoader2 } from "@tabler/icons-react";
import { getCitiesByProvince } from "@/features/properties/actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchFormProps {
  initialQuery: string;
  initialGender: string;
  initialProvinsi: string;
  initialKota: string;
  provinces: { id: number | string; nama_provinsi: string }[];
}

export function SearchForm({
  initialQuery,
  initialGender,
  initialProvinsi,
  initialKota,
  provinces,
}: SearchFormProps) {
  const [selectedProvince, setSelectedProvince] = useState(initialProvinsi);
  const [cities, setCities] = useState<{ id: number | string; nama_kota: string }[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (selectedProvince && selectedProvince !== "semua") {
      startTransition(async () => {
        const data = await getCitiesByProvince(selectedProvince);
        setCities(data);
      });
    } else {
      setCities([]);
    }
  }, [selectedProvince]);

  return (
    <form action="/search" method="GET" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 max-w-7xl w-full items-end bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
      
      <div className="relative lg:col-span-4 w-full">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Cari Kos</label>
        <div className="relative">
          <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            name="q"
            defaultValue={initialQuery}
            placeholder="Nama kos, daerah, jalan..."
            className="w-full h-14 pl-12 pr-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-600 outline-none transition-all font-medium text-gray-900 bg-gray-50/50 focus:bg-white"
          />
        </div>
      </div>

      <div className="lg:col-span-2 w-full">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Tipe</label>
        <Select name="gender" defaultValue={initialGender}>
          <SelectTrigger className="w-full !h-14 rounded-xl border-gray-200 bg-gray-50/50 font-medium text-gray-700 shadow-none transition-all">
            <SelectValue placeholder="Semua Tipe" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-gray-100 shadow-xl bg-white">
            <SelectItem value="semua" className="rounded-lg cursor-pointer hover:bg-purple-50 font-medium">Semua Tipe</SelectItem>
            <SelectItem value="putra" className="rounded-lg cursor-pointer hover:bg-purple-50 font-medium text-blue-700">Khusus Putra</SelectItem>
            <SelectItem value="putri" className="rounded-lg cursor-pointer hover:bg-purple-50 font-medium text-pink-700">Khusus Putri</SelectItem>
            <SelectItem value="campur" className="rounded-lg cursor-pointer hover:bg-purple-50 font-medium text-purple-700">Campur</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="lg:col-span-2 w-full">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Provinsi</label>
        <Select 
          name="provinsi" 
          defaultValue={initialProvinsi} 
          onValueChange={(val) => setSelectedProvince(val)}
        >
          <SelectTrigger className="w-full !h-14 rounded-xl border-gray-200 bg-gray-50/50 font-medium text-gray-700 shadow-none transition-all">
            <SelectValue placeholder="Pilih Provinsi" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-gray-100 shadow-xl bg-white max-h-60 overflow-y-auto">
            <SelectItem value="semua" className="rounded-lg cursor-pointer hover:bg-purple-50 font-medium">Semua Provinsi</SelectItem>
            {provinces.map((p) => (
              <SelectItem key={p.id} value={p.id.toString()} className="rounded-lg cursor-pointer hover:bg-purple-50 font-medium">
                {p.nama_provinsi}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="lg:col-span-2 w-full">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Kota</label>
        <Select 
          name="kota" 
          defaultValue={initialKota} 
          disabled={!selectedProvince || selectedProvince === "semua" || isPending}
        >
          <SelectTrigger className="w-full !h-14 rounded-xl border-gray-200 bg-gray-50/50 font-medium text-gray-700 shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            {isPending ? (
              <div className="flex items-center gap-2 text-gray-400"><IconLoader2 className="animate-spin" size={16} /> Memuat...</div>
            ) : (
              <SelectValue placeholder="Pilih Kota" />
            )}
          </SelectTrigger>
          <SelectContent className="rounded-xl border-gray-100 shadow-xl bg-white max-h-60 overflow-y-auto">
            <SelectItem value="semua" className="rounded-lg cursor-pointer hover:bg-purple-50 font-medium">Semua Kota</SelectItem>
            {cities.map((c) => (
              <SelectItem key={c.id} value={c.id.toString()} className="rounded-lg cursor-pointer hover:bg-purple-50 font-medium">
                {c.nama_kota}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="sm:col-span-2 lg:col-span-2 w-full">
        <button
          type="submit"
          className="w-full h-14 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-purple-100 flex items-center justify-center gap-2 text-base"
        >
          Cari Kos
        </button>
      </div>

    </form>
  );
}