"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const patientData = [
  { month: "Feb", value: 2 },
  { month: "Mar", value: 3 },
  { month: "Apr", value: 3 },
  { month: "May", value: 4 },
  { month: "Jun", value: 4 },
  { month: "Jul", value: 5 },
];

const doctorData = [
  { month: "Feb", value: 15 },
  { month: "Mar", value: 18 },
  { month: "Apr", value: 20 },
  { month: "May", value: 24 },
  { month: "Jun", value: 27 },
  { month: "Jul", value: 24 },
];

export function DashboardActivityChart({ variant }: { variant: "patient" | "doctor" }) {
  const isDoctor = variant === "doctor";
  const data = isDoctor ? doctorData : patientData;
  const color = isDoctor ? "#D97706" : "#176E76";
  const label = isDoctor ? "Patients Seen" : "Appointments";

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={30} />
        <Tooltip
          cursor={{ fill: "var(--muted)" }}
          formatter={(value) => [value, label]}
          contentStyle={{
            background: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 12,
            color: "var(--popover-foreground)",
          }}
        />
        <Bar dataKey="value" name={label} fill={color} radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
