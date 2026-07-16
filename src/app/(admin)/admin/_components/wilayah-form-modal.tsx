"use client";

import { useState, useTransition, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { upsertProvinsi, upsertKota, upsertKecamatan } from "@/features/admin/actions";
import { IconX, IconChevronDown, IconSearch, IconCheck } from "@tabler/icons-react";
import Swal from "sweetalert2";

interface WilayahFormModalProps {
  type: "provinsi" | "kota" | "kecamatan";
  editItem?: any;
  provinsiList: any[];
  kotaList: any[];
  closeUrl: string;
}

export function WilayahFormModal({ type, editItem, provinsiList, kotaList, closeUrl }: WilayahFormModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [nama, setNama] = useState(editItem ? editItem.nama : "");
  
  const [parentId, setParentId] = useState(() => {
    if (!editItem) return "";
    return type === "kota" ? editItem.id_provinsi || "" : editItem.id_kota || "";
  });

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentOptions = useMemo(() => {
    return type === "kota" ? provinsiList : kotaList;
  }, [type, provinsiList, kotaList]);

  const filteredOptions = useMemo(() => {
    return currentOptions.filter((opt) =>
      opt.nama.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [currentOptions, searchQuery]);

  const selectedLabel = useMemo(() => {
    if (!parentId) return "";
    const found = currentOptions.find((opt) => String(opt.id) === String(parentId));
    return found ? found.nama : "";
  }, [parentId, currentOptions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) return;
    
    if (type !== "provinsi" && !parentId) {
      Swal.fire({
        title: "Peringatan!",
        text: `Harap pilih wilayah ${type === "kota" ? "provinsi" : "kota"} induk terlebih dahulu.`,
        icon: "warning",
        confirmButtonColor: "#9333ea",
        customClass: { popup: "rounded-2xl font-sans text-sm" }
      });
      return;
    }

    startTransition(async () => {
      try {
        if (type === "provinsi") {
          await upsertProvinsi(editItem ? editItem.id : null, nama);
        } else if (type === "kota") {
          await upsertKota(editItem ? editItem.id : null, nama, parentId);
        } else if (type === "kecamatan") {
          await upsertKecamatan(editItem ? editItem.id : null, nama, parentId);
        }

        Swal.fire({
          title: "Berhasil!",
          text: "Data wilayah berhasil disimpan ke database.",
          icon: "success",
          confirmButtonColor: "#9333ea",
          customClass: { popup: "rounded-2xl font-sans text-sm" }
        });

        router.push(closeUrl);
        router.refresh();
      } catch (err: any) {
        Swal.fire({
          title: "Gagal Menyimpan!",
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
          
          {type !== "provinsi" && (
            <div className="space-y-1 relative" ref={dropdownRef}>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                Pilih {type === "kota" ? "Provinsi" : "Kota"} Induk
              </label>
              
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`w-full flex items-center justify-between px-4 py-2.5 bg-white border rounded-xl font-medium text-left transition-all ${
                  dropdownOpen ? "border-purple-500 shadow-xs ring-1 ring-purple-500" : "border-gray-200"
                } ${!parentId ? "text-gray-400" : "text-gray-900"}`}
              >
                <span className="truncate">
                  {selectedLabel || `-- Pilih ${type === "kota" ? "Provinsi" : "Kota"} --`}
                </span>
                <IconChevronDown size={16} className={`text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute left-0 right-0 mt-1.5 bg-white border border-gray-100 rounded-xl shadow-lg z-50 max-h-60 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="p-2 border-b border-gray-50 relative flex items-center">
                    <IconSearch size={14} className="absolute left-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari lokasi induk..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50/70 border border-gray-100 rounded-lg focus:outline-none focus:border-purple-500 focus:bg-white transition-colors"
                    />
                  </div>
                  
                  <div className="flex-1 overflow-y-auto py-1">
                    {filteredOptions.length === 0 ? (
                      <span className="block px-4 py-3 text-xs text-gray-400 text-center">
                        Tidak ada wilayah yang cocok
                      </span>
                    ) : (
                      filteredOptions.map((opt) => {
                        const isSelected = String(opt.id) === String(parentId);
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              setParentId(opt.id);
                              setDropdownOpen(false);
                              setSearchQuery("");
                            }}
                            className={`w-full flex items-center justify-between px-4 py-2 text-xs text-left font-medium transition-colors ${
                              isSelected 
                                ? "bg-purple-50 text-purple-600 font-bold" 
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            }`}
                          >
                            <span className="truncate">{opt.nama}</span>
                            {isSelected && <IconCheck size={14} strokeWidth={3} className="text-purple-600" />}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Nama {type}</label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder={`Masukkan nama ${type}...`}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 placeholder-gray-400 transition-all font-medium text-gray-900"
              required
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
              {isPending ? "Menyimpan..." : "Simpan Data"}
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
}