"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { UserAvatar } from "@/components/user-avatar";
import { normalizeGenderLabel, type PublicBloodDonor } from "@/lib/blood-donor";

export function DonorCard({ donor, index = 0 }: { donor: PublicBloodDonor; index?: number }) {
  const gender = normalizeGenderLabel(donor.gender);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, delay: (index % 6) * 0.05 }}
    >
      <Link href={`/blood-donors/${donor.id}`}>
        <Card className="group h-full border-border/60 p-5 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-teal/10">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <UserAvatar name={donor.name} gender={donor.gender} className="size-12 rounded-xl" imageClassName="rounded-xl" />
              <div>
                <p className="font-semibold text-foreground">{donor.name}</p>
                {gender && <p className="text-xs text-muted-foreground">{gender}</p>}
              </div>
            </div>
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-base font-bold text-destructive">
              {donor.blood_group ?? "—"}
            </div>
          </div>

          <div className="mt-4 space-y-2 border-t border-border/60 pt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <MapPin className="size-4 shrink-0 text-primary" />
              {donor.address ?? "Address not provided"}
            </div>
          </div>

          {donor.donor_interest && (
            <div className="mt-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                <span className="size-1.5 rounded-full bg-primary" />
                Open to donate
              </span>
            </div>
          )}
        </Card>
      </Link>
    </motion.div>
  );
}
