"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { CalendarCheck, MapPin, Phone, PhoneCall, ShieldCheck, Timer, Wrench } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { ambulanceTypeLabel, type PublicAmbulanceRecord } from "@/lib/ambulances";

export function AmbulanceProfile({ ambulance }: { ambulance: PublicAmbulanceRecord }) {
  const [requested, setRequested] = useState(false);
  const typeLabel = ambulanceTypeLabel(ambulance.ambulance_type);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <Card className="border-border/60 p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <UserAvatar
                name={ambulance.owner.name}
                imageUrl={ambulance.owner.profile_image}
                className="size-24 shrink-0 rounded-2xl"
                imageClassName="rounded-2xl"
              />
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-bold text-foreground">{ambulance.brand_model || "Ambulance"}</h1>
                {typeLabel && <p className="mt-0.5 font-medium text-primary">{typeLabel}</p>}
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="size-4" />
                    Vehicle {ambulance.license_plate_number}
                  </span>
                  {ambulance.address && (
                    <span className="flex items-center gap-1">
                      <MapPin className="size-4" />
                      {ambulance.address}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {ambulance.description && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
          >
            <Card className="mt-6 border-border/60 p-6">
              <h2 className="flex items-center gap-2 font-semibold text-foreground">
                <Timer className="size-4 text-primary" />
                About This Service
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{ambulance.description}</p>
            </Card>
          </motion.div>
        )}

        {ambulance.equipment_list && ambulance.equipment_list.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
          >
            <Card className="mt-6 border-border/60 p-6">
              <h2 className="flex items-center gap-2 font-semibold text-foreground">
                <Wrench className="size-4 text-primary" />
                Equipment
              </h2>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {ambulance.equipment_list.map((eq) => (
                  <span
                    key={eq}
                    className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
                  >
                    {eq}
                  </span>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </div>

      <div className="lg:col-span-1">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="lg:sticky lg:top-24"
        >
          <Card className="border-border/60 p-6 text-center">
            <ShieldCheck className="mx-auto size-8 text-primary" />
            <p className="mt-3 text-sm font-semibold text-foreground">{ambulance.owner.name}</p>
            <p className="text-xs text-muted-foreground">Registered owner / contact</p>

            <div className="mt-4 space-y-2 rounded-lg bg-secondary/60 p-3 text-left text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <PhoneCall className="size-4 shrink-0 text-primary" />
                {ambulance.phone_number}
              </div>
              {ambulance.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 shrink-0 text-primary" />
                  {ambulance.address}
                </div>
              )}
            </div>

            <div className="mt-4 space-y-2">
              <Button className="w-full" nativeButton={false} render={<a href={`tel:${ambulance.phone_number}`} />}>
                <Phone />
                Call Now
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setRequested(true)}
                disabled={requested}
              >
                <CalendarCheck />
                {requested ? "Request Sent ✓" : "Send a Request"}
              </Button>
            </div>

            {requested && (
              <p className="mt-3 text-xs text-muted-foreground">
                This is a demo request — no real ambulance has been dispatched. For a real emergency, use Call Now.
              </p>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
