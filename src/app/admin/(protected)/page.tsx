"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  Ambulance,
  Building2,
  CalendarDays,
  FlaskConical,
  Pill,
  Stethoscope,
  TrendingUp,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { doctors } from "@/lib/doctors-data";
import { hospitals } from "@/lib/hospitals-data";
import { ambulances } from "@/lib/ambulances-data";
import { medicalStores } from "@/lib/pharmacy-data";
import { diagnosticCenters } from "@/lib/diagnostics-data";
import { appointments } from "@/lib/dashboard-data";
import { AppointmentsTrendChart } from "@/components/admin/charts/appointments-trend-chart";
import { SpecialtyBarChart } from "@/components/admin/charts/specialty-bar-chart";
import { AmbulanceStatusPieChart } from "@/components/admin/charts/ambulance-status-pie-chart";
import { RevenueBarChart } from "@/components/admin/charts/revenue-bar-chart";

const stats = [
  { label: "Doctors", value: doctors.length, icon: Stethoscope, href: "/admin/doctors" },
  { label: "Hospitals", value: hospitals.length, icon: Building2, href: "/admin/hospitals" },
  { label: "Diagnostic Centres", value: diagnosticCenters.length, icon: FlaskConical, href: "/admin/diagnostic-centres" },
  { label: "Ambulances", value: ambulances.length, icon: Ambulance, href: "/admin/ambulances" },
  { label: "Pharmacies", value: medicalStores.length, icon: Pill, href: "/admin/medical-stores" },
];

const specialtyData = Object.entries(
  doctors.reduce<Record<string, number>>((acc, doc) => {
    acc[doc.specialty] = (acc[doc.specialty] ?? 0) + 1;
    return acc;
  }, {})
).map(([specialty, count]) => ({ specialty, count }));

const ambulanceStatusData = Object.entries(
  ambulances.reduce<Record<string, number>>((acc, amb) => {
    acc[amb.status] = (acc[amb.status] ?? 0) + 1;
    return acc;
  }, {})
).map(([status, count]) => ({ status, count }));

export default function AdminDashboardPage() {
  const upcoming = appointments.filter((a) => a.status === "Upcoming");

  return (
    <div className="mx-auto max-w-7xl">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Overview of your Ibnocare platform.</p>
      </motion.div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.05 }}
          >
            <Link href={stat.href}>
              <Card className="border-border/60 p-4 transition-colors hover:border-primary/40">
                <div className="flex size-9 items-center justify-center rounded-lg bg-secondary text-primary">
                  <stat.icon className="size-4.5" />
                </div>
                <p className="mt-3 text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </Card>
            </Link>
          </motion.div>
        ))}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.25 }}
        >
          <Card className="border-border/60 p-4">
            <div className="flex size-9 items-center justify-center rounded-lg bg-secondary text-primary">
              <CalendarDays className="size-4.5" />
            </div>
            <p className="mt-3 text-2xl font-bold text-foreground">{upcoming.length}</p>
            <p className="text-xs text-muted-foreground">Appointments Today</p>
          </Card>
        </motion.div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <Card className="border-border/60 p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground">Appointments Trend</h2>
              <span className="flex items-center gap-1 text-xs font-medium text-primary">
                <TrendingUp className="size-3.5" /> Last 14 days
              </span>
            </div>
            <AppointmentsTrendChart />
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
          <Card className="border-border/60 p-5">
            <h2 className="font-semibold text-foreground">Doctors by Specialty</h2>
            <SpecialtyBarChart data={specialtyData} />
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
          <Card className="border-border/60 p-5">
            <h2 className="font-semibold text-foreground">Ambulance Fleet Status</h2>
            <AmbulanceStatusPieChart data={ambulanceStatusData} />
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 }}>
          <Card className="border-border/60 p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground">Revenue</h2>
              <span className="text-xs text-muted-foreground">Illustrative</span>
            </div>
            <RevenueBarChart />
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Card className="mt-6 border-border/60 p-5">
          <h2 className="font-semibold text-foreground">Recent Appointments</h2>
          <div className="mt-3 divide-y divide-border/60">
            {appointments.slice(0, 5).map((apt) => (
              <div key={apt.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium text-foreground">{apt.doctorName}</p>
                  <p className="text-xs text-muted-foreground">{apt.specialty} · {apt.hospital}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-foreground">{apt.date}</p>
                  <p className="text-xs text-muted-foreground">{apt.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
