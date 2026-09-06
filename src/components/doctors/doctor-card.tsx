"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, BadgeCheck, Stethoscope } from "lucide-react";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { doctorDisplayName, type PublicDoctorRecord } from "@/lib/public-doctors";

export function DoctorCard({ doctor, index = 0 }: { doctor: PublicDoctorRecord; index?: number }) {
  const name = doctorDisplayName(doctor);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, delay: (index % 6) * 0.05 }}
    >
      <Link href={`/doctors/${doctor.id}`}>
        <Card className="group h-full border-border/60 p-5 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-teal/10">
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <UserAvatar
                name={doctor.user?.name?.trim() || name}
                imageUrl={doctor.user?.profile_image}
                gender={doctor.user?.gender}
                className="size-16 rounded-2xl"
                imageClassName="rounded-2xl"
              />
              {Boolean(doctor.is_active) && (
                <span className="absolute -right-1 -bottom-1 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-card">
                  <BadgeCheck className="size-3.5" />
                </span>
              )}
            </div>
            <div className="min-w-0">
              <h3 className="truncate font-semibold text-foreground">{name}</h3>
              {doctor.title && <p className="truncate text-sm text-primary">{doctor.title}</p>}
              {doctor.specialization && (
                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <Stethoscope className="size-3.5 shrink-0 text-primary" />
                  <span className="truncate">{doctor.specialization}</span>
                </div>
              )}
            </div>
          </div>

          {doctor.bio && (
            <p className="mt-4 line-clamp-2 border-t border-border/60 pt-4 text-sm text-muted-foreground">
              {doctor.bio}
            </p>
          )}

          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {doctor.registration_year ? `Registered ${doctor.registration_year}` : " "}
            </p>
            <div
              className={buttonVariants({
                variant: "secondary",
                size: "sm",
                className: "pointer-events-none",
              })}
            >
              View Profile
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}
