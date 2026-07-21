"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  getKotaOptionsByProvinsi, 
  getKecamatanOptionsByKota, 
  createKosPropertiAction, 
  uploadKosPhotoAction 
} from "@/features/owner/actions";
import { IconCheck, IconPhotoPlus, IconX, IconLoader2, IconMapPin } from "@tabler/icons-react";
import Link from "next/link";
import Swal from "sweetalert2";
import { InsertKosInput } from "@/features/owner/schema";

interface KosFormClientProps {
  masterData: {
    fasilitas: any[];
    aturan: any[];
    provinsi: any[];
  };
}

export function KosFormClient({ masterData }: KosFormClientProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);

  const [namaKos, setNamaKos] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [alamat, setAlamat] = useState("");
  const [jenisKos, setJenisKos] = useState<"putra" | "putri" | "campur" | "">("");

  const [selectedProv, setSelectedProv] = useState("");
  const [selectedKota, setSelectedKota] = useState("");
  const [selectedKec, setSelectedKec] = useState("");

  const [latitude, setLatitude] = useState("-7.6298");
  const [longitude, setLongitude] = useState("111.5239");

  const [kotaList, setKotaList] = useState<any[]>([]);
  const [kecamatanList, setKecamatanList] = useState<any[]>([]);

  const [chosenFasilitas, setChosenFasilitas] = useState<number[]>([]);
  const [chosenAturan, setChosenAturan] = useState<number[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const handleProvinsiChange = async (provId: string) => {
    setSelectedProv(provId);
    setSelectedKota("");
    setSelectedKec("");
    setKecamatanList([]);
    if (!provId) {
      setKotaList([]);
      return;
    }
    try {
      const res = await getKotaOptionsByProvinsi(provId);
      setKotaList(res);
    } catch {
      setKotaList([]);
    }
  };

  const handleKotaChange = async (kotaId: string) => {
    setSelectedKota(kotaId);
    setSelectedKec("");
    if (!kotaId) {
      setKecamatanList([]);
      return;
    }
    try {
      const res = await getKecamatanOptionsByKota(kotaId);
      setKecamatanList(res);
    } catch {
      setKecamatanList([]);
    }
  };

  const toggleFasilitas = (id: number) => {
    setChosenFasilitas(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleAturan = (id: number) => {
    setChosenAturan(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);

        const res = await uploadKosPhotoAction(formData);
        if (res?.url) {
          setUploadedImages(prev => [...prev, res.url]);
        }
      }
    } catch (err: any) {
      Swal.fire({
        title: "Gagal Mengunggah",
        text: err.message || "Terjadi kesalahan saat mengunggah gambar ke server.",
        icon: "error",
        confirmButtonColor: "#9333ea"
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeUploadedImage = (indexNum: number) => {
    setUploadedImages(prev => prev.filter((_, idx) => idx !== indexNum));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!namaKos || !deskripsi || !alamat || !jenisKos || !selectedKec || !latitude || !longitude) {
      Swal.fire({ title: "Validasi Gagal", text: "Harap lengkapi semua data wajib pada formulir.", icon: "warning", confirmButtonColor: "#9333ea" });
      return;
    }

    if (uploadedImages.length === 0) {
      Swal.fire({ title: "Media Wajib", text: "Unggah minimal 1 foto properti kos Anda.", icon: "warning", confirmButtonColor: "#9333ea" });
      return;
    }

    const payload: InsertKosInput = {
      nama_kos: namaKos,
      deskripsi: deskripsi,
      alamat: alamat,
      id_kecamatan: Number(selectedKec),
      jenis_kos: jenisKos as any,
      latitude: Number(latitude),
      longitude: Number(longitude),
      fasilitasIds: chosenFasilitas,
      aturanIds: chosenAturan,
      fotoUrls: uploadedImages
    };

    startTransition(async () => {
      try {
        await createKosPropertiAction(payload);
        
        await Swal.fire({
          title: "Pendaftaran Sukses!",
          text: "Properti kos baru Anda berhasil diajukan dan sedang menunggu review persetujuan admin.",
          icon: "success",
          confirmButtonColor: "#9333ea",
          customClass: { popup: "rounded-2xl font-sans text-sm" }
        });

        router.push("/owner/kos");
        router.refresh();
      } catch (err: any) {
        Swal.fire({ title: "Gagal Mendaftar", text: err.message || "Terjadi kendala sistem.", icon: "error", confirmButtonColor: "#9333ea" });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-sm">
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-gray-900 border-b border-gray-50 pb-2">1. Data Umum Properti</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Nama Properti Kos</label>
            <input
              type="text"
              value={namaKos}
              onChange={(e) => setNamaKos(e.target.value)}
              placeholder="Contoh: Rumah Kos Eksklusif Melati"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 font-medium text-gray-900 bg-white"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Klasifikasi Penghuni (Jenis Kos)</label>
            <select
              value={jenisKos}
              onChange={(e) => setJenisKos(e.target.value as any)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 font-medium text-gray-900 bg-white"
              required
            >
              <option value="">-- Pilih Kategori --</option>
              <option value="putra">Khusus Putra</option>
              <option value="putri">Khusus Putri</option>
              <option value="campur">Campur (Putra & Putri)</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Deskripsi Detail</label>
          <textarea
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            placeholder="Jelaskan mengenai keunggulan bangunan kos, akses lingkungan, dan info pendukung lainnya..."
            rows={4}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 font-medium text-gray-900 bg-white resize-none"
            required
          />
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-gray-900 border-b border-gray-50 pb-2">2. Lokasi Operasional</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Provinsi</label>
            <select
              value={selectedProv}
              onChange={(e) => handleProvinsiChange(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 font-medium text-gray-900 bg-white"
              required
            >
              <option value="">-- Pilih Provinsi --</option>
              {masterData.provinsi.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Kota / Kabupaten</label>
            <select
              value={selectedKota}
              onChange={(e) => handleKotaChange(e.target.value)}
              disabled={!selectedProv}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 font-medium text-gray-900 bg-white disabled:opacity-50"
              required
            >
              <option value="">-- Pilih Kota --</option>
              {kotaList.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Kecamatan Sektor</label>
            <select
              value={selectedKec}
              onChange={(e) => setSelectedKec(e.target.value)}
              disabled={!selectedKota}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 font-medium text-gray-900 bg-white disabled:opacity-50"
              required
            >
              <option value="">-- Pilih Kecamatan --</option>
              {kecamatanList.map(kc => <option key={kc.id} value={kc.id}>{kc.nama}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Nama Jalan & Nomor Bangunan (Alamat)</label>
          <input
            type="text"
            value={alamat}
            onChange={(e) => setAlamat(e.target.value)}
            placeholder="Contoh: Jl. Diponegoro No. 45, RT 02/RW 04"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 font-medium text-gray-900 bg-white"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block flex items-center gap-1">
              <IconMapPin size={14} className="text-purple-600" /> Latitude Koordinat
            </label>
            <input
              type="text"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="-7.629800"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 font-medium text-gray-900 bg-white"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block flex items-center gap-1">
              <IconMapPin size={14} className="text-purple-600" /> Longitude Koordinat
            </label>
            <input
              type="text"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="111.523900"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 font-medium text-gray-900 bg-white"
              required
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-gray-900 border-b border-gray-50 pb-2">3. Fasilitas & Aturan Kos (Terpusat)</h3>
        
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Pilih Fasilitas yang Tersedia</label>
          {masterData.fasilitas.length === 0 ? (
            <p className="text-xs text-gray-400 italic">Tidak ada master data fasilitas.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {masterData.fasilitas.map(f => {
                const isChecked = chosenFasilitas.includes(f.id);
                return (
                  <button
                    type="button"
                    key={f.id}
                    onClick={() => toggleFasilitas(f.id)}
                    className={`px-3 py-2 rounded-xl border text-xs font-semibold text-left flex items-center justify-between transition-all cursor-pointer ${
                      isChecked ? "bg-purple-50 text-purple-600 border-purple-200" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <span className="truncate">{f.nama}</span>
                    {isChecked && <IconCheck size={14} strokeWidth={3} className="text-purple-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-2 pt-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Pilih Regulasi Tata Tertib Kos</label>
          {masterData.aturan.length === 0 ? (
            <p className="text-xs text-gray-400 italic">Tidak ada master data aturan.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {masterData.aturan.map(a => {
                const isChecked = chosenAturan.includes(a.id);
                return (
                  <button
                    type="button"
                    key={a.id}
                    onClick={() => toggleAturan(a.id)}
                    className={`px-3 py-2 rounded-xl border text-xs font-semibold text-left flex items-center justify-between transition-all cursor-pointer ${
                      isChecked ? "bg-purple-50 text-purple-600 border-purple-200" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <span className="truncate">{a.nama}</span>
                    {isChecked && <IconCheck size={14} strokeWidth={3} className="text-purple-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-gray-900 border-b border-gray-50 pb-2">4. Galeri Media Properti</h3>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
        />

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
          {uploadedImages.map((img, idx) => (
            <div key={idx} className="aspect-video sm:aspect-square bg-gray-50 rounded-xl border border-gray-100 overflow-hidden relative group">
              <img src={img} alt="Preview kos" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeUploadedImage(idx)}
                className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-lg opacity-90 hover:opacity-100 transition-opacity cursor-pointer shadow-xs"
              >
                <IconX size={12} strokeWidth={3} />
              </button>
            </div>
          ))}

          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="aspect-video sm:aspect-square rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 hover:bg-gray-50 text-gray-400 hover:text-purple-600 hover:border-purple-300 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer p-4 text-center disabled:opacity-50"
          >
            {isUploading ? (
              <IconLoader2 size={22} className="animate-spin text-purple-600" />
            ) : (
              <IconPhotoPlus size={22} />
            )}
            <span className="text-[10px] font-bold uppercase tracking-wide">
              {isUploading ? "Mengunggah..." : "Tambah Gambar"}
            </span>
          </button>
        </div>
      </div>

      <div className="pt-2 flex items-center gap-3">
        <Link
          href="/owner/kos"
          className="px-5 py-2.5 border border-gray-200 bg-white text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors text-center cursor-pointer"
        >
          Kembali
        </Link>
        
        <button
          type="submit"
          disabled={isPending || isUploading}
          className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 shadow-sm text-center cursor-pointer"
        >
          {isPending ? "Mendaftarkan Properti Kos..." : "Kirim Pengajuan Properti"}
        </button>
      </div>
    </form>
  );
}