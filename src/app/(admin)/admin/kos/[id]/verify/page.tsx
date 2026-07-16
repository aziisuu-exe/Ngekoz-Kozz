import { getKosById } from "@/features/admin/actions";
import { VerifyActions } from "./_components/verify-actions";
import { formatRupiah } from "@/lib/utils";
import Link from "next/link";
import { IconArrowLeft, IconBuilding, IconMapPin, IconUser, IconCalendar } from "@tabler/icons-react";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdminKosVerifyPage({ params }: PageProps) {
  const resolvedParams = await params;
  const kos = await getKosById(resolvedParams.id);

  if (!kos) {
    redirect("/admin/kos/list");
  }

  return (
    <div className="p-6 md:p-8 w-full max-w-5xl mx-auto space-y-6">
      
      <div className="flex items-center gap-3">
        <Link
          href="/admin/kos/list"
          className="p-2 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <IconArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Formulir Moderasi Properti</h1>
          <p className="text-xs text-gray-500 mt-0.5">Periksa kelayakan berkas kos sebelum dipublikasikan</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 items-start">
        
        <div className="md:col-span-2 space-y-6">
          
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div>
              <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-md uppercase border ${
                kos.approval_status === "approved" ? "bg-green-50 text-green-700 border-green-200" :
                kos.approval_status === "rejected" ? "bg-red-50 text-red-700 border-red-200" :
                "bg-amber-50 text-amber-700 border-amber-200"
              }`}>
                {kos.approval_status}
              </span>
              <h2 className="text-xl font-bold text-gray-900 mt-3">{kos.nama_kos}</h2>
            </div>

            <div className="grid gap-3.5 border-t border-gray-100 pt-4 text-sm text-gray-600">
              <div className="flex items-start gap-2.5">
                <IconMapPin size={18} className="text-gray-400 shrink-0 mt-0.5" />
                <span>{kos.alamat}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <IconUser size={18} className="text-gray-400 shrink-0" />
                <span>Pemilik: <strong className="text-gray-900 font-semibold">{kos.owner_name}</strong></span>
              </div>
              <div className="flex items-center gap-2.5">
                <IconCalendar size={18} className="text-gray-400 shrink-0" />
                <span>Daftar pada: {new Date(kos.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-2">
              <h3 className="text-sm font-bold text-gray-900">Deskripsi Properti</h3>
              <p className="text-sm text-gray-600 leading-relaxed fabrics whitespace-pre-line">
                {kos.deskripsi || "Tidak ada deskripsi yang disediakan oleh pemilik."}
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
              <IconBuilding size={18} className="text-purple-600" />
              Daftar Tipe Kamar Tersedia
            </h3>
            
            <div className="divide-y divide-gray-100">
              {(!kos.kamar_kos || kos.kamar_kos.length === 0) ? (
                <p className="text-sm text-gray-400 py-2">Belum ada tipe kamar yang didaftarkan</p>
              ) : (
                kos.kamar_kos.map((kamar: any) => (
                  <div key={kamar.id} className="py-3.5 flex items-center justify-between text-sm first:pt-0 last:pb-0">
                    <div>
                      <span className="font-semibold text-gray-900 block">{kamar.nama_kamar}</span>
                      <span className="text-xs text-gray-400 block mt-0.5">Stok: {kamar.stok_kamar} kamar</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-purple-600 block">{formatRupiah(kamar.price_per_month)}</span>
                      <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-wider">Per Bulan</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4 sticky top-20">
          <h3 className="text-sm font-bold text-gray-900">Keputusan Moderasi</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Pastikan Anda telah memeriksa kesesuaian data alamat dan kontak pemilik sebelum menyetujui properti ini agar terhindar dari kos fiktif.
          </p>
          <div className="pt-2">
            <VerifyActions kosId={kos.id} currentStatus={kos.approval_status} />
          </div>
        </div>

      </div>
    </div>
  );
}