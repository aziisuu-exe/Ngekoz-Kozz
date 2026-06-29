import { useState, useMemo } from "react";
import { subDays, isAfter, format, parseISO } from "date-fns";
import { id } from "date-fns/locale";

type Timeframe = "7d" | "30d" | "90d";

export function useVisitsChart(rawData: { created_at: string; count?: number }[]) {
  const [timeframe, setTimeframe] = useState<Timeframe>("30d");

  const chartData = useMemo(() => {
    if (!rawData || rawData.length === 0) return [];
    
    const now = new Date();
    const days = timeframe === "7d" ? 7 : timeframe === "30d" ? 30 : 90;
    const startDate = subDays(now, days);

    const filtered = rawData.filter(d => isAfter(parseISO(d.created_at), startDate));

    const grouped = filtered.reduce((acc: Record<string, number>, curr) => {
      const dateStr = format(parseISO(curr.created_at), "yyyy-MM-dd");
      if (!acc[dateStr]) acc[dateStr] = 0;
      acc[dateStr] += 1; 
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([date, total]) => ({
        date: format(parseISO(date), "dd MMM", { locale: id }), 
        total,
        rawDate: date,
      }))
      .sort((a, b) => a.rawDate.localeCompare(b.rawDate)); 
  }, [rawData, timeframe]);

  return { timeframe, setTimeframe, chartData };
}