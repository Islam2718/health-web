"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { day: "Jul 5", appointments: 32 },
  { day: "Jul 6", appointments: 41 },
  { day: "Jul 7", appointments: 38 },
  { day: "Jul 8", appointments: 52 },
  { day: "Jul 9", appointments: 47 },
  { day: "Jul 10", appointments: 61 },
  { day: "Jul 11", appointments: 55 },
  { day: "Jul 12", appointments: 68 },
  { day: "Jul 13", appointments: 59 },
  { day: "Jul 14", appointments: 73 },
  { day: "Jul 15", appointments: 66 },
  { day: "Jul 16", appointments: 80 },
  { day: "Jul 17", appointments: 74 },
  { day: "Jul 18", appointments: 88 },
];

export function AppointmentsTrendChart() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="appointmentsFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1AA2A0" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#1AA2A0" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="day"
          tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
          interval={2}
        />
        <YAxis tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={30} />
        <Tooltip
          contentStyle={{
            background: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 12,
            color: "var(--popover-foreground)",
          }}
        />
        <Area
          type="monotone"
          dataKey="appointments"
          stroke="#1AA2A0"
          strokeWidth={2.5}
          fill="url(#appointmentsFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
