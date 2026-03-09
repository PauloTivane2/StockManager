"use client";

import { useMemo } from "react";
import { useInventoryStore } from "@/lib/store";
import { Category } from "@/types";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b"];

export function InventoryOverviewChart() {
  const { products } = useInventoryStore();

  const data = useMemo(() => {
    const categories = Object.values(Category);
    return categories.map((category, index) => {
      const count = products.filter((p) => p.category === category).length;
      return {
        name: category,
        value: count,
      };
    });
  }, [products]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, value }) => `${name}: ${value}`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
