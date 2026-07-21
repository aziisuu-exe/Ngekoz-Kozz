import { getKosFormMasterData } from "@/features/owner/actions";

import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";
import { KosFormClient } from "../../_components/kos-form-client";

export default async function OwnerTambahKosPage() {
  const masterData = await getKosFormMasterData();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      <div className="flex items-center gap-3">
        <Link
          href="/owner/kos"
          className="p-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 hover:text-gray-900 rounded-xl transition-colors shadow-xs"
        >
          <IconArrowLeft size={16} strokeWidth={2.5} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Daftarkan Kos Baru</h1>
          <p className="text-sm text-gray-500 mt-0.5">Isi rincian informasi aset properti dengan lengkap dan valid</p>
        </div>
      </div>

      <KosFormClient masterData={masterData} />

    </div>
  );
}