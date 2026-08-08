"use client";

import { motion } from "motion/react";
import {
  Ambulance,
  BedDouble,
  Building2,
  Calendar,
  CheckCircle2,
  Layers,
  MapPin,
  Phone,
  Star,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Hospital } from "@/lib/hospitals-data";

export function HospitalProfile({ hospital }: { hospital: Hospital }) {
  const bedPercent =
    hospital.totalBeds > 0 ? Math.round((hospital.bedsAvailable / hospital.totalBeds) * 100) : 0;

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative h-56 overflow-hidden rounded-3xl sm:h-72"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={hospital.image} alt={hospital.name} className="size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-white/80">{hospital.type}</p>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">{hospital.name}</h1>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-white/90">
              <MapPin className="size-4" />
              {hospital.address}
            </div>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
            <Star className="size-4 fill-happy-sky text-happy-sky" />
            {hospital.rating} ({hospital.reviews} reviews)
          </div>
        </div>
        {hospital.hasEmergency && (
          <Badge className="absolute top-4 right-4 gap-1 bg-white/90 text-destructive hover:bg-white/90">
            <Ambulance className="size-3.5" />
            24/7 Emergency
          </Badge>
        )}
      </motion.div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
          >
            <Card className="border-border/60 p-6">
              <h2 className="font-semibold text-foreground">About</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {hospital.description}
              </p>

              <Separator className="my-5" />

              <h2 className="flex items-center gap-2 font-semibold text-foreground">
                <Layers className="size-4 text-primary" />
                Departments
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {hospital.departments.map((dept) => (
                  <span
                    key={dept}
                    className="rounded-full bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground"
                  >
                    {dept}
                  </span>
                ))}
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
          >
            <Card className="mt-6 border-border/60 p-6">
              <h2 className="font-semibold text-foreground">Facilities</h2>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-xl bg-secondary/60 p-4 text-center">
                  <BedDouble className="mx-auto size-5 text-primary" />
                  <p className="mt-2 text-lg font-bold text-foreground">{hospital.totalBeds}</p>
                  <p className="text-xs text-muted-foreground">Total Beds</p>
                </div>
                <div className="rounded-xl bg-secondary/60 p-4 text-center">
                  <CheckCircle2 className="mx-auto size-5 text-primary" />
                  <p className="mt-2 text-lg font-bold text-foreground">{hospital.otRooms}</p>
                  <p className="text-xs text-muted-foreground">OT Rooms</p>
                </div>
                <div className="rounded-xl bg-secondary/60 p-4 text-center">
                  <Calendar className="mx-auto size-5 text-primary" />
                  <p className="mt-2 text-lg font-bold text-foreground">{hospital.established}</p>
                  <p className="text-xs text-muted-foreground">Established</p>
                </div>
                <div className="rounded-xl bg-secondary/60 p-4 text-center">
                  <Building2 className="mx-auto size-5 text-primary" />
                  <p className="mt-2 text-lg font-bold text-foreground">{hospital.departments.length}</p>
                  <p className="text-xs text-muted-foreground">Departments</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="lg:sticky lg:top-24"
          >
            <Card className="border-border/60 p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">Bed Availability</p>
                <p className="text-sm text-muted-foreground">
                  {hospital.bedsAvailable}/{hospital.totalBeds}
                </p>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${bedPercent}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                {bedPercent}% beds currently available
              </p>

              <Separator className="my-5" />

              <div className="space-y-2.5 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="size-4 text-primary" />
                  {hospital.phone}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Ambulance className="size-4 text-primary" />
                  {hospital.hasAmbulance ? "Ambulance service available" : "No ambulance service"}
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-2">
                <Button size="lg" className="w-full">
                  <Calendar />
                  Book an Appointment
                </Button>
                {hospital.hasAmbulance && (
                  <Button size="lg" variant="outline" className="w-full">
                    <Ambulance />
                    Request Ambulance
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
