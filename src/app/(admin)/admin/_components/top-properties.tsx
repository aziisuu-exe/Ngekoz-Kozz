import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconFlame } from "@tabler/icons-react";

interface PropertyView {
  nama_kos: string;
  views: number;
}

interface TopPropertiesProps {
  data: PropertyView[];
}

export function TopProperties({ data }: TopPropertiesProps) {
  // Cari nilai views tertinggi sebagai jangkar hitungan persen progress bar
  const maxViews = data.length > 0 ? Math.max(...data.map(item => item.views)) : 1;

  return (
    <Card className="shadow-sm border-gray-100 w-full h-full flex flex-col">
      <CardHeader className="flex flex-row items-center gap-2 pb-4 border-b border-gray-50">
        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
          <IconFlame size={20} />
        </div>
        <div>
          <CardTitle className="text-lg font-bold text-gray-900">Properti Terpopuler</CardTitle>
          <p className="text-xs text-gray-500 mt-0.5">Kos yang paling sering dilihat dalam 30 hari terakhir</p>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 flex-1">
        {data.length === 0 ? (
          <div className="h-full py-8 flex flex-col items-center justify-center text-center text-gray-400 text-sm">
            Belum ada data kunjungan kos yang tercatat.
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((item, index) => {
              // Hitung persentase bar relatif terhadap pemenang rank 1
              const percentage = Math.round((item.views / maxViews) * 100);

              return (
                <div key={index} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`font-bold text-xs h-5 w-5 rounded-md flex items-center justify-center ${
                        index === 0 ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-500"
                      }`}>
                        {index + 1}
                      </span>
                      <span className="font-semibold text-gray-800 truncate block">
                        {item.nama_kos}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md shrink-0">
                      {item.views} klik
                    </span>
                  </div>
                  
                  {/* Progress Bar Visual */}
                  <div className="w-full bg-gray-50 h-2 rounded-full overflow-hidden border border-gray-100/50">
                    <div 
                      className="bg-purple-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}