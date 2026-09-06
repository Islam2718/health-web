"use client";

import { motion } from "motion/react";
import { Droplet, HeartHandshake, MapPin, PhoneCall, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { normalizeGenderLabel, type PublicBloodDonorDetail } from "@/lib/blood-donor";

function formatDonationDate(dateStr: string): string {
  const d = new Date(`${dateStr.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function DonorProfile({ donor }: { donor: PublicBloodDonorDetail }) {
  const gender = normalizeGenderLabel(donor.gender);
  const donations = donor.blood_donations ?? [];

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <Card className="border-border/60 p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <UserAvatar
                name={donor.name}
                gender={donor.gender}
                className="size-24 shrink-0 rounded-2xl"
                imageClassName="rounded-2xl"
              />
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-bold text-foreground">{donor.name}</h1>
                {gender && <p className="mt-0.5 font-medium text-primary">{gender}</p>}
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  {donor.address && (
                    <span className="flex items-center gap-1">
                      <MapPin className="size-4" />
                      {donor.address}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <HeartHandshake className="size-4" />
                    {donations.length} donation{donations.length === 1 ? "" : "s"} on record
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
        >
          <Card className="mt-6 border-border/60 p-6">
            <h2 className="flex items-center gap-2 font-semibold text-foreground">
              <HeartHandshake className="size-4 text-primary" />
              Donation History
            </h2>

            {donations.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">No donations recorded yet.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {donations.map((d) => (
                  <div key={d.id} className="rounded-xl border border-border/60 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                        {d.patient_name}
                        {d.patient_blood_group && (
                          <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground">
                            {d.patient_blood_group}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDonationDate(d.donation_date)}</p>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {[d.patient_disease, d.hospital_name].filter(Boolean).join(" · ")}
                      {d.hospital_name && ` · ${d.units} unit${d.units === 1 ? "" : "s"}`}
                    </p>
                    {d.notes && <p className="mt-1 text-xs text-muted-foreground italic">&ldquo;{d.notes}&rdquo;</p>}
                  </div>
                ))}
              </div>
            )}
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
          <Card className="border-border/60 p-6 text-center">
            <ShieldCheck className="mx-auto size-8 text-primary" />
            <p className="mt-3 text-sm font-semibold text-foreground">
              {donor.donor_interest ? "Open to donate" : "Not currently available"}
            </p>
            <div className="mt-2 flex justify-center">
              <span className="flex size-12 items-center justify-center rounded-xl bg-destructive/10 text-lg font-bold text-destructive">
                {donor.blood_group ?? "—"}
              </span>
            </div>

            {donor.phone && (
              <div className="mt-4 space-y-2 rounded-lg bg-secondary/60 p-3 text-left text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <PhoneCall className="size-4 shrink-0 text-primary" />
                  {donor.phone}
                </div>
              </div>
            )}

            {donor.phone && (
              <Button className="mt-4 w-full" nativeButton={false} render={<a href={`tel:${donor.phone}`} />}>
                <Droplet />
                Call {donor.name.split(" ")[0]}
              </Button>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
