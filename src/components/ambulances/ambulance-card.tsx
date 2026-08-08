"use client";

import { useState } from "react";
import { motion } from "motion/react";
import {
  Ambulance as AmbulanceIcon,
  CalendarCheck,
  MapPin,
  Phone,
  PhoneCall,
  ShieldCheck,
  Star,
  Timer,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Ambulance } from "@/lib/ambulances-data";

const statusStyles: Record<Ambulance["status"], string> = {
  "Available Now": "bg-primary/10 text-primary",
  "En Route": "bg-happy-sky/20 text-dark-teal",
  "On Duty": "bg-muted text-muted-foreground",
};

const statusDot: Record<Ambulance["status"], string> = {
  "Available Now": "bg-primary",
  "En Route": "bg-happy-sky",
  "On Duty": "bg-muted-foreground",
};

export function AmbulanceCard({ ambulance, index = 0 }: { ambulance: Ambulance; index?: number }) {
  const [requested, setRequested] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, delay: (index % 6) * 0.05 }}
    >
      <Card className="h-full border-border/60 p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-foreground">{ambulance.provider}</p>
            <p className="text-sm text-primary">{ambulance.type}</p>
          </div>
          <span
            className={
              "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium " +
              statusStyles[ambulance.status]
            }
          >
            <span className={"size-1.5 rounded-full " + statusDot[ambulance.status]} />
            {ambulance.status}
          </span>
        </div>

        <div className="mt-4 flex items-center gap-3 border-t border-border/60 pt-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ambulance.driver.photo}
            alt={ambulance.driver.name}
            className="size-12 rounded-xl object-cover"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {ambulance.driver.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {ambulance.driver.experience} yrs driving · {ambulance.driver.license}
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="size-4 shrink-0 text-primary" />
            {ambulance.area} · Vehicle {ambulance.vehicleNumber}
          </div>
          <div className="flex items-center gap-2">
            <Timer className="size-4 shrink-0 text-primary" />
            ETA {ambulance.etaMinutes} min
            <span className="flex items-center gap-1 text-happy-sky">
              <Star className="size-3.5 fill-happy-sky text-happy-sky" />
              {ambulance.rating}
            </span>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {ambulance.equipment.map((eq) => (
            <span
              key={eq}
              className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
            >
              {eq}
            </span>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-foreground">
            ৳{ambulance.baseFare}{" "}
            <span className="font-normal text-muted-foreground">base fare</span>
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              nativeButton={false}
              render={<a href={`tel:${ambulance.driver.phone}`} />}
            >
              <Phone />
            </Button>

            <Dialog>
              <DialogTrigger render={<Button />}>
                <AmbulanceIcon />
                Request
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Confirm ambulance request</DialogTitle>
                  <DialogDescription>
                    Review the details below before requesting.
                  </DialogDescription>
                </DialogHeader>

                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ambulance.driver.photo}
                    alt={ambulance.driver.name}
                    className="size-14 rounded-xl object-cover"
                  />
                  <div>
                    <p className="font-semibold text-foreground">{ambulance.driver.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {ambulance.provider} · {ambulance.type}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="size-4 text-primary" />
                    {ambulance.area} · ETA {ambulance.etaMinutes} min
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="size-4 text-primary" />
                    Vehicle {ambulance.vehicleNumber} · License {ambulance.driver.license}
                  </div>
                  <div className="flex items-center gap-2">
                    <PhoneCall className="size-4 text-primary" />
                    {ambulance.driver.phone}
                  </div>
                </div>

                <DialogFooter>
                  <Button onClick={() => setRequested(true)} className="w-full sm:w-auto">
                    <CalendarCheck />
                    {requested ? "Request Sent ✓" : `Confirm · ৳${ambulance.baseFare}`}
                  </Button>
                </DialogFooter>

                {requested && (
                  <p className="text-center text-xs text-muted-foreground">
                    This is a demo request — no real ambulance has been dispatched.
                  </p>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
