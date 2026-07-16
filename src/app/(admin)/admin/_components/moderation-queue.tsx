import { formatISO, parseISO, format } from "date-fns";
import { id } from "date-fns/locale";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconEye, IconLayoutList } from "@tabler/icons-react";

interface PendingKos {
  id: string | number;
  nama_kos: string;
  created_at: string;
}

interface ModerationQueueProps {
  data: PendingKos[];
}

export function ModerationQueue({ data }: ModerationQueueProps) {
  return (
    <Card className="shadow-sm border-gray-100 w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-50">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
            <IconLayoutList size={20} />
          </div>
          <div>
            <CardTitle className="text-lg font-bold text-gray-900">Antrean Moderasi Properti</CardTitle>
            <p className="text-xs text-gray-500 mt-0.5">Kos baru yang memerlukan persetujuan Admin</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200">
          {data.length} Menunggu
        </span>
      </CardHeader>
      
      <CardContent className="pt-4">
        {data.length === 0 ? (
          <div className="py-8 flex flex-col items-center justify-center text-center">
            <p className="text-sm font-medium text-gray-500">Semua bersih! ✨</p>
            <p className="text-xs text-gray-400 mt-1">Tidak ada properti baru yang mengantre saat ini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="pb-3 pl-2">Nama Properti</th>
                  <th className="pb-3">Tanggal Diajukan</th>
                  <th className="pb-3 text-right pr-2">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                {data.map((kos) => (
                  <tr key={kos.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="py-3.5 pl-2 font-medium text-gray-900 group-hover:text-purple-600 transition-colors">
                      {kos.nama_kos}
                    </td>
                    <td className="py-3.5 text-gray-500">
                      {format(parseISO(kos.created_at), "dd MMMM yyyy HH:mm", { locale: id })}
                    </td>
                    <td className="py-3.5 text-right pr-2">
                      {/* 🔥 Tombol review mengarah ke menu detail verifikasi kos */}
                      <Link
                        href={`/admin/kos/${kos.id}/verify`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-all"
                      >
                        <IconEye size={14} />
                        Tinjau
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}