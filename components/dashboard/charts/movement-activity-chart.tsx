"use client";

import { useMemo } from "react";
import { useInventoryStore } from "@/lib/store";
import { MovementType } from "@/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export function MovementActivityChart() {
  const { movements } = useInventoryStore();

  const data = useMemo(() => {
    const last7Days: Record<string, { entries: number; exits: number }> = {};

    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toLocaleDateString("pt-BR", {
        month: "2-digit",
        day: "2-digit",
      });
      last7Days[key] = { entries: 0, exits: 0 };
    }

    // Count movements by day
    movements.forEach((movement) => {
      const movementDate = typeof movement.date === 'string' 
        ? new Date(movement.date) 
        : movement.date;
      
      const key = movementDate.toLocaleDateString("pt-BR", {
        month: "2-digit",
        day: "2-digit",
      });
      if (key in last7Days) {
        if (movement.type === MovementType.ENTRY) {
          last7Days[key].entries += movement.quantity;
        } else {
          last7Days[key].exits += movement.quantity;
        }
      }
    });

    return Object.entries(last7Days).map(([date, data]) => ({
      date,
      Entradas: data.entries,
      Saídas: data.exits,
    }));
  }, [movements]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="Entradas" fill="#10b981" />
        <Bar dataKey="Saídas" fill="#ef4444" />
      </BarChart>
    </ResponsiveContainer>
  );
}
