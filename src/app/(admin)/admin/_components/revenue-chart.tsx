"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRevenueChart } from "./use-revenue-chart";
import { formatRupiah } from "@/lib/utils"; 

interface ChartDataProps {
  rawData: { created_at: string; biaya_admin: number }[];
}

export function RevenueChart({ rawData }: ChartDataProps) {
  const { timeframe, setTimeframe, chartData } = useRevenueChart(rawData);

  return (
    <Card className="shadow-sm border-gray-100 flex flex-col h-full">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 gap-4">
        <div>
          <CardTitle className="text-lg font-bold text-gray-900">Grafik Pendapatan</CardTitle>
        </div>
        
        {/* Panel Filter Waktu */}
        <div className="flex items-center bg-gray-50 p-1 rounded-xl border border-gray-200">
          <button
            onClick={() => setTimeframe("7d")}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${timeframe === "7d" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            1 Minggu
          </button>
          <button
            onClick={() => setTimeframe("30d")}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${timeframe === "30d" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            30 Hari
          </button>
          <button
            onClick={() => setTimeframe("90d")}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${timeframe === "90d" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            3 Bulan
          </button>
        </div>
      </CardHeader>
      
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-gray-400 text-sm">
            Belum ada data pendapatan di rentang waktu ini.
          </div>
        ) : (
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9333ea" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#9333ea" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={formatRupiah} tick={{ fontSize: 12, fill: "#64748b" }} />
                <Tooltip 
                  formatter={(value: any) => [formatRupiah(Number(value) || 0), "Pendapatan"]}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="total" stroke="#9333ea" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}