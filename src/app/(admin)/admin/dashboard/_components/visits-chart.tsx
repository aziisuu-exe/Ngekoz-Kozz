"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useVisitsChart } from "./use-visits-chart";

export function VisitsChart({ rawData }: { rawData: any[] }) {
  const { timeframe, setTimeframe, chartData } = useVisitsChart(rawData);

  return (
    <Card className="shadow-sm border-gray-100 flex flex-col h-full">
      <CardHeader className="flex flex-col xl:flex-row items-start xl:items-center justify-between pb-6 gap-4">
        <CardTitle className="text-lg font-bold text-gray-900">Grafik Kunjungan</CardTitle>
        
        <div className="flex items-center bg-gray-50 p-1 rounded-xl border border-gray-200">
          {["7d", "30d", "90d"].map((tf) => (
             <button
               key={tf}
               onClick={() => setTimeframe(tf as any)}
               className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all ${timeframe === tf ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
             >
               {tf === "7d" ? "1 Mgg" : tf === "30d" ? "30 Hari" : "3 Bln"}
             </button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1">
        {chartData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-gray-400 text-sm">
            Belum ada data kunjungan.
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                <Tooltip 
                  formatter={(value: any) => [Number(value) || 0, "Kunjungan"]}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#f8fafc' }} 
                />
                <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}