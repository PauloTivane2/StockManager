"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface ChartItem {
  date: string;
  Entradas: number;
  Saídas: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border/60 rounded-xl px-4 py-3 shadow-xl min-w-[140px]">
        <p className="text-xs font-medium text-muted-foreground mb-2">{label}</p>
        {payload.map((p: any) => (
          <div key={p.name} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: p.fill }} />
              <span className="text-xs text-muted-foreground">{p.name}</span>
            </div>
            <span className="text-sm font-bold text-foreground">{p.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function MovementActivityChart() {
  const [data, setData] = useState<ChartItem[]>([]);

  useEffect(() => {
    fetch("/api/stock?limit=200")
      .then((r) => r.json())
      .then((json) => {
        const movements = json.data ?? [];

        const last7Days: Record<string, { Entradas: number; Saídas: number }> = {};
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const key = date.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit" });
          last7Days[key] = { Entradas: 0, Saídas: 0 };
        }

        movements.forEach((m: any) => {
          const key = new Date(m.createdAt).toLocaleDateString("pt-BR", {
            weekday: "short",
            day: "2-digit",
          });
          if (key in last7Days) {
            if (m.type === "ENTRY") last7Days[key].Entradas += m.quantity;
            else if (m.type === "EXIT") last7Days[key].Saídas += m.quantity;
          }
        });

        setData(
          Object.entries(last7Days).map(([date, counts]) => ({ date, ...counts }))
        );
      });
  }, []);

  const maxValue = Math.max(...data.flatMap((d) => [d.Entradas, d.Saídas]), 1);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} barCategoryGap="35%" barGap={4}>
        <defs>
          <linearGradient id="entryGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
            <stop offset="100%" stopColor="#10b981" stopOpacity={0.6} />
          </linearGradient>
          <linearGradient id="exitGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ef4444" stopOpacity={1} />
            <stop offset="100%" stopColor="#ef4444" stopOpacity={0.6} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
          width={35}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }} />
        <Bar dataKey="Entradas" fill="url(#entryGradient)" radius={[6, 6, 0, 0]} maxBarSize={40} animationDuration={600} />
        <Bar dataKey="Saídas" fill="url(#exitGradient)" radius={[6, 6, 0, 0]} maxBarSize={40} animationDuration={800} />
      </BarChart>
    </ResponsiveContainer>
  );
}
