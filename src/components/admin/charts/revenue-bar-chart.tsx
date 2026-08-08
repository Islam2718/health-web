"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const data = [
  { month: "Feb", revenue: 182000 },
  { month: "Mar", revenue: 204000 },
  { month: "Apr", revenue: 198000 },
  { month: "May", revenue: 236000 },
  { month: "Jun", revenue: 251000 },
  { month: "Jul", revenue: 279000 },
];

export function RevenueBarChart() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
          width={45}
          tickFormatter={(v) => `৳${Math.round(v / 1000)}k`}
        />
        <Tooltip
          cursor={{ fill: "var(--muted)" }}
          formatter={(value) => [`৳${Number(value).toLocaleString()}`, "Revenue"]}
          contentStyle={{
            background: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 12,
            color: "var(--popover-foreground)",
          }}
        />
        <Bar dataKey="revenue" fill="#176E76" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
