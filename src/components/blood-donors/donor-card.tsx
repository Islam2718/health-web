"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Droplet, HeartHandshake, MapPin, Phone, PhoneCall } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { getAvailability, type BloodDonor } from "@/lib/blood-donors-data";

export function DonorCard({ donor, index = 0 }: { donor: BloodDonor; index?: number }) {
  const [requested, setRequested] = useState(false);
  const availability = getAvailability(donor.lastDonation);

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
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={donor.photo}
              alt={donor.name}
              className="size-12 rounded-xl object-cover"
            />
            <div>
              <p className="font-semibold text-foreground">{donor.name}</p>
              <p className="text-xs text-muted-foreground">
                {donor.age} yrs · {donor.gender}
              </p>
            </div>
          </div>
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-base font-bold text-destructive">
            {donor.bloodGroup}
          </div>
        </div>

        <div className="mt-4 space-y-2 border-t border-border/60 pt-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="size-4 shrink-0 text-primary" />
            {donor.area} · {donor.address}
          </div>
          <div className="flex items-center gap-2">
            <HeartHandshake className="size-4 shrink-0 text-primary" />
            {donor.totalDonations} donations so far
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <span
            className={
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium " +
              (availability.available
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground")
            }
          >
            <span
              className={
                "size-1.5 rounded-full " +
                (availability.available ? "bg-primary" : "bg-muted-foreground")
              }
            />
            {availability.label}
          </span>

          <div className="flex gap-2">
            <Button variant="outline" size="icon" nativeButton={false} render={<a href={`tel:${donor.phone}`} />}>
              <Phone />
            </Button>

            <Dialog>
              <DialogTrigger render={<Button size="sm" disabled={!availability.available} />}>
                <Droplet />
                Request
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Send a blood request</DialogTitle>
                  <DialogDescription>
                    {donor.name} will be notified of your request.
                  </DialogDescription>
                </DialogHeader>

                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={donor.photo}
                    alt={donor.name}
                    className="size-14 rounded-xl object-cover"
                  />
                  <div>
                    <p className="font-semibold text-foreground">{donor.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {donor.bloodGroup} · {donor.area}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Droplet className="size-4 text-primary" />
                    Blood Group {donor.bloodGroup}
                  </div>
                  <div className="flex items-center gap-2">
                    <PhoneCall className="size-4 text-primary" />
                    {donor.phone}
                  </div>
                </div>

                <DialogFooter>
                  <Button onClick={() => setRequested(true)} className="w-full sm:w-auto">
                    {requested ? "Request Sent ✓" : "Send Request"}
                  </Button>
                </DialogFooter>

                {requested && (
                  <p className="text-center text-xs text-muted-foreground">
                    This is a demo request — no real notification has been sent.
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
