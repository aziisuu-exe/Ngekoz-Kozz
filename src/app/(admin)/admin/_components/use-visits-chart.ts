import { useState, useMemo } from "react";
import { subDays, format, parseISO, eachDayOfInterval } from "date-fns";
import { id } from "date-fns/locale";

type Timeframe = "7d" | "30d" | "90d";

export function useVisitsChart(rawData: { created_at: string; count?: number }[]) {
  const [timeframe, setTimeframe] = useState<Timeframe>("30d");

  const chartData = useMemo(() => {
    const now = new Date();
    const days = timeframe === "7d" ? 6 : timeframe === "30d" ? 29 : 89;
    const startDate = subDays(now, days);

    const allDays = eachDayOfInterval({ start: startDate, end: now });

    const grouped = allDays.reduce((acc: Record<string, number>, day) => {
      const dateStr = format(day, "yyyy-MM-dd");
      acc[dateStr] = 0;
      return acc;
    }, {});

    if (rawData && rawData.length > 0) {
      rawData.forEach((curr) => {
        const dateStr = format(parseISO(curr.created_at), "yyyy-MM-dd");
        if (grouped[dateStr] !== undefined) {
          grouped[dateStr] += curr.count || 1; 
        }
      });
    }

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