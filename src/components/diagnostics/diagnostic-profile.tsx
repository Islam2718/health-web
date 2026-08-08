"use client";

import { useState } from "react";
import { motion } from "motion/react";
import {
  CalendarCheck,
  Clock,
  FlaskConical,
  Home,
  MapPin,
  Phone,
  Star,
  TestTube,
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
} from "@/components/ui/dialog";
import type { DiagnosticCenter, DiagnosticTest } from "@/lib/diagnostics-data";

export function DiagnosticProfile({ center }: { center: DiagnosticCenter }) {
  const [selectedTest, setSelectedTest] = useState<DiagnosticTest | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative h-56 overflow-hidden rounded-3xl sm:h-72"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={center.image} alt={center.name} className="size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-white/80">{center.type}</p>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">{center.name}</h1>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-white/90">
              <MapPin className="size-4" />
              {center.address}
            </div>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
            <Star className="size-4 fill-happy-sky text-happy-sky" />
            {center.rating} ({center.reviews} reviews)
          </div>
        </div>
        {center.homeSampleCollection && (
          <Badge className="absolute top-4 right-4 gap-1 bg-white/90 text-primary hover:bg-white/90">
            <Home className="size-3.5" />
            Home Sample Collection
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
                {center.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {center.categories.map((cat) => (
                  <span
                    key={cat}
                    className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
                  >
                    {cat}
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
              <h2 className="flex items-center gap-2 font-semibold text-foreground">
                <TestTube className="size-4 text-primary" />
                Tests & Prices
              </h2>
              <div className="mt-4 divide-y divide-border/60">
                {center.tests.map((test) => (
                  <div
                    key={test.name}
                    className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{test.name}</p>
                      <p className="text-xs text-muted-foreground">Report in {test.duration}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <p className="text-sm font-semibold text-foreground">৳{test.price}</p>
                      <Button size="sm" variant="secondary" onClick={() => { setSelectedTest(test); setConfirmed(false); }}>
                        Book
                      </Button>
                    </div>
                  </div>
                ))}
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
              <h2 className="font-semibold text-foreground">Centre Info</h2>
              <div className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-primary" />
                  {center.openHours}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="size-4 text-primary" />
                  {center.phone}
                </div>
                <div className="flex items-center gap-2">
                  <FlaskConical className="size-4 text-primary" />
                  Reports in {center.reportDelivery}
                </div>
                <div className="flex items-center gap-2">
                  <Home className="size-4 text-primary" />
                  {center.homeSampleCollection
                    ? "Home sample collection available"
                    : "Visit centre for sample collection"}
                </div>
              </div>

              <Separator className="my-5" />

              <p className="text-xs text-muted-foreground">
                Select any test from the list to book a sample collection or
                centre visit slot.
              </p>
            </Card>
          </motion.div>
        </div>
      </div>

      <Dialog open={selectedTest !== null} onOpenChange={(open) => !open && setSelectedTest(null)}>
        <DialogContent className="sm:max-w-md">
          {selectedTest && (
            <>
              <DialogHeader>
                <DialogTitle>Confirm test booking</DialogTitle>
                <DialogDescription>Review the details before booking.</DialogDescription>
              </DialogHeader>

              <div className="rounded-xl bg-secondary/60 p-4">
                <p className="font-semibold text-foreground">{selectedTest.name}</p>
                <p className="text-sm text-muted-foreground">{center.name}</p>
              </div>

              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Report delivery</span>
                  <span className="font-medium text-foreground">{selectedTest.duration}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Price</span>
                  <span className="font-medium text-foreground">৳{selectedTest.price}</span>
                </div>
              </div>

              <DialogFooter>
                <Button className="w-full sm:w-auto" onClick={() => setConfirmed(true)}>
                  <CalendarCheck />
                  {confirmed ? "Booked ✓" : "Confirm Booking"}
                </Button>
              </DialogFooter>

              {confirmed && (
                <p className="text-center text-xs text-muted-foreground">
                  This is a demo booking — no real test has been scheduled.
                </p>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
