"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { MapPin, Phone, Timer } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { ambulanceTypeLabel, type PublicAmbulanceRecord } from "@/lib/ambulances";

export function AmbulanceCard({ ambulance, index = 0 }: { ambulance: PublicAmbulanceRecord; index?: number }) {
  const typeLabel = ambulanceTypeLabel(ambulance.ambulance_type);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, delay: (index % 6) * 0.05 }}
    >
      <Link href={`/ambulances/${ambulance.id}`}>
        <Card className="group h-full border-border/60 p-5 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-teal/10">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-foreground">{ambulance.brand_model || "Ambulance"}</p>
              {typeLabel && <p className="text-sm text-primary">{typeLabel}</p>}
            </div>
            <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 font-mono text-xs font-medium text-secondary-foreground">
              {ambulance.license_plate_number}
            </span>
          </div>

          <div className="mt-4 flex items-center gap-3 border-t border-border/60 pt-4">
            <UserAvatar name={ambulance.owner.name} className="size-12 rounded-xl" imageClassName="rounded-xl" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{ambulance.owner.name}</p>
              {ambulance.address && (
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="size-3 shrink-0" />
                  {ambulance.address}
                </p>
              )}
            </div>
          </div>

          {ambulance.description && (
            <p className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
              <Timer className="mt-0.5 size-4 shrink-0 text-primary" />
              <span className="line-clamp-2">{ambulance.description}</span>
            </p>
          )}

          {ambulance.equipment_list && ambulance.equipment_list.length > 0 && (
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
          )}

          <div className="mt-4 flex justify-end">
            {/* A real <a href="tel:..."> nested inside the card's <Link>
                would be invalid HTML, so this stays a button that opens the
                dialer directly and stops the click from also navigating. */}
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = `tel:${ambulance.phone_number}`;
              }}
            >
              <Phone />
              Call Now
            </Button>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}
