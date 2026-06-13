"use client";

import { useState, useRef } from "react";
import { IconFlag, IconLoader2, IconAlertCircle, IconCamera, IconX } from "@tabler/icons-react";
import { submitReportAction } from "../actions";

interface ReportModalProps {
  idDetailKos: string | number;
  namaKos: string;
}

const CATEGORIES = [
  { id: "penipuan", label: "Penipuan / Scam" },
  { id: "informasi_tidak_sesuai", label: "Info Tidak Sesuai" },
  { id: "foto_tidak_sesuai", label: "Foto Palsu/Beda" },
  { id: "kos_tidak_tersedia", label: "Kos Penuh/Tutup" },
  { id: "perilaku_tidak_pantas", label: "Perilaku Buruk" },
  { id: "lainnya", label: "Lainnya" },
];

export function ReportModal({ idDetailKos, namaKos }: ReportModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileExt = file.name.toLowerCase().split('.').pop();
      if (fileExt !== 'jpg' && fileExt !== 'jpeg' && fileExt !== 'png') {
        setErrorMessage("Format file ditolak. Hanya file .jpg dan .png yang diperbolehkan.");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      setImagePreview(URL.createObjectURL(file));
      setErrorMessage("");
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    
    if (!selectedCategory) {
      setErrorMessage("Silakan pilih kategori pelanggaran terlebih dahulu.");
      setIsLoading(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    const result = await submitReportAction(formData);

    if (result.error) {
      setErrorMessage(result.error);
    } else if (result.success) {
      setSuccessMessage(result.message!);
      formRef.current?.reset();
      setSelectedCategory("");
      setImagePreview(null);
      
      setTimeout(() => {
        setIsOpen(false);
        setSuccessMessage("");
      }, 2000);
    }
    
    setIsLoading(false);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 font-semibold transition-colors cursor-pointer"
      >
        <IconFlag size={18} /> Laporkan
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            
            <h3 className="text-xl font-bold text-gray-900 mb-1">Laporkan Kos</h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Laporkan pelanggaran pada kos <span className="font-bold text-gray-700">"{namaKos}"</span>.
            </p>

            {errorMessage && (
              <div className="mb-5 p-3.5 bg-red-50 text-red-600 text-sm font-semibold rounded-xl flex items-center gap-2 border border-red-100">
                <IconAlertCircle size={18} className="shrink-0" /> {errorMessage}
              </div>
            )}
            
            {successMessage && (
              <div className="mb-5 p-3.5 bg-green-50 text-green-600 text-sm font-semibold rounded-xl flex items-center gap-2 border border-green-100">
                <IconAlertCircle size={18} className="shrink-0" /> {successMessage}
              </div>
            )}

            <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
              <input type="hidden" name="id_detail_kos" value={idDetailKos} />
              <input type="hidden" name="kategori" value={selectedCategory} />

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2.5">Kategori Pelanggaran <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-2 gap-2.5">
                  {CATEGORIES.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => { setSelectedCategory(cat.id); setErrorMessage(""); }}
                        className={`px-3 py-2.5 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center text-center ${
                          isSelected ? "bg-red-50 border-red-500 text-red-700 shadow-sm" : "bg-white border-gray-200 text-gray-600 hover:border-red-200 hover:bg-red-50/50"
                        }`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Judul Laporan Singkat <span className="text-red-500">*</span></label>
                <input type="text" name="jenis_laporan" required placeholder="Cth: Foto kamar mandi berbeda dengan aslinya" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:border-red-500 focus:bg-white outline-none transition-all" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Deskripsi Detail <span className="text-red-500">*</span></label>
                <textarea name="deskripsi" required rows={3} placeholder="Jelaskan secara detail masalah yang Anda temukan..." className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:border-red-500 focus:bg-white outline-none transition-all resize-none custom-scrollbar"></textarea>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Foto Bukti <span className="text-xs text-gray-400 font-semibold">(Opsional, Maks 3MB)</span></label>
                
                <input 
                  type="file" 
                  name="bukti_foto" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/jpeg, image/png" 
                  className="hidden" 
                />

                {!imagePreview ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-6 border-2 border-dashed border-gray-200 hover:border-red-400 hover:bg-red-50/10 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group"
                  >
                    <div className="w-10 h-10 bg-gray-100 group-hover:bg-red-50 rounded-full flex items-center justify-center text-gray-400 group-hover:text-red-500 transition-colors">
                      <IconCamera size={20} />
                    </div>
                    <span className="text-xs font-bold text-gray-600">Pilih Foto Bukti</span>
                    <span className="text-[10px] text-gray-400 font-semibold">Mendukung format .JPG atau .PNG</span>
                  </div>
                ) : (
                  <div className="w-full relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 h-40">
                    <img 
                      src={imagePreview} 
                      alt="Preview Bukti" 
                      className="w-full h-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-1.5 bg-gray-950/70 hover:bg-red-600 text-white rounded-full transition-colors cursor-pointer"
                    >
                      <IconX size={16} />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsOpen(false)} className="flex-1 py-3 px-4 font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer">Batal</button>
                <button type="submit" disabled={isLoading} className="flex-1 py-3 px-4 font-bold text-white bg-red-600 hover:bg-red-700 disabled:bg-red-300 rounded-xl shadow-lg shadow-red-600/20 transition-all flex justify-center items-center cursor-pointer">
                  {isLoading ? <IconLoader2 size={20} className="animate-spin" /> : "Kirim Laporan"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </>
  );
}