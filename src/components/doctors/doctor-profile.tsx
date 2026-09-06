"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  BadgeCheck,
  Building2,
  CalendarCheck,
  Clock,
  GraduationCap,
  IdCard,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { useAuth } from "@/context/auth-context";
import { ApiError } from "@/lib/api-client";
import { createAppointment } from "@/lib/patient-lookup";
import { savePendingBooking } from "@/lib/pending-booking";
import { cn } from "@/lib/utils";
import {
  doctorDisplayName,
  doctorTitleLine,
  type PublicChamberRecord,
  type PublicDoctorRecord,
  type PublicDoctorScheduleRecord,
} from "@/lib/public-doctors";

function formatSlotDate(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

function formatSlotTime(time: string): string {
  return time.slice(0, 5);
}

interface SelectedSlot {
  chamber: PublicChamberRecord;
  schedule: PublicDoctorScheduleRecord;
}

export function DoctorProfile({ doctor }: { doctor: PublicDoctorRecord }) {
  const { isAuthenticated, token, user } = useAuth();
  const router = useRouter();
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
  const [booking, setBooking] = useState(false);

  const name = doctorDisplayName(doctor);
  const titleLine = doctorTitleLine(doctor);
  const isActive = Boolean(doctor.is_active);
  const todayStr = new Date().toISOString().slice(0, 10);
  const chambers = (doctor.chambers ?? []).filter((c) => c.is_active);

  const credentials = [
    { label: "Title", value: doctor.title },
    { label: "Specialization", value: doctor.specialization },
    { label: "License Number", value: doctor.license_number },
    { label: "Registration Year", value: doctor.registration_year },
  ].filter((c) => c.value);

  const handleBook = async () => {
    if (!selectedSlot) return;
    const { chamber, schedule } = selectedSlot;

    if (!isAuthenticated || !token || !user) {
      savePendingBooking({
        doctorId: doctor.id,
        doctorUserId: doctor.user_id,
        doctorName: name,
        chamberId: chamber.id,
        chamberName: chamber.name,
        doctorScheduleId: schedule.id,
        appointmentDate: schedule.date,
        appointmentTime: schedule.start_time,
        fee: schedule.consultation_fee,
      });
      router.push(`/login?from=${encodeURIComponent(`/doctors/${doctor.id}`)}`);
      return;
    }

    setBooking(true);
    try {
      await createAppointment(token, {
        user_doctor_id: doctor.user_id,
        chamber_id: chamber.id,
        doctor_schedule_id: schedule.id,
        fee: schedule.consultation_fee != null ? Number(schedule.consultation_fee) : undefined,
        appointment_type: "CHAMBER",
        appointment_date: schedule.date,
        appointment_time: schedule.start_time,
        status: "APPOINTED",
      });
      toast.success("Appointment booked — see it under My Appointments.");
      setSelectedSlot(null);
      router.push("/dashboard?tab=appointments");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not book this appointment.");
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <Card className="border-border/60 p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="relative shrink-0">
                <UserAvatar
                  name={doctor.user?.name?.trim() || name}
                  imageUrl={doctor.user?.profile_image}
                  gender={doctor.user?.gender}
                  className="size-24 rounded-2xl"
                  imageClassName="rounded-2xl"
                />
                {isActive && (
                  <span className="absolute -right-1 -bottom-1 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-card">
                    <BadgeCheck className="size-4" />
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-bold text-foreground">{name}</h1>
                {titleLine && <p className="mt-0.5 font-medium text-primary">{titleLine}</p>}
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  {doctor.registration_year && (
                    <span className="flex items-center gap-1">
                      <IdCard className="size-4" />
                      Registered {doctor.registration_year}
                    </span>
                  )}
                  {doctor.user?.address && (
                    <span className="flex items-center gap-1">
                      <MapPin className="size-4" />
                      {doctor.user.address}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {doctor.bio && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
          >
            <Card className="mt-6 border-border/60 p-6">
              <h2 className="font-semibold text-foreground">About</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{doctor.bio}</p>
            </Card>
          </motion.div>
        )}

        {credentials.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
          >
            <Card className="mt-6 border-border/60 p-6">
              <h2 className="flex items-center gap-2 font-semibold text-foreground">
                <GraduationCap className="size-4 text-primary" />
                Credentials
              </h2>
              <dl className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {credentials.map((c) => (
                  <div key={c.label}>
                    <dt className="text-xs text-muted-foreground">{c.label}</dt>
                    <dd className="text-sm font-medium text-foreground">{c.value}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          </motion.div>
        )}

        {chambers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15 }}
          >
            <Card className="mt-6 border-border/60 p-6">
              <h2 className="flex items-center gap-2 font-semibold text-foreground">
                <Building2 className="size-4 text-primary" />
                Chambers & Available Slots
              </h2>

              <div className="mt-4 space-y-5">
                {chambers.map((chamber) => {
                  const upcoming = chamber.doctor_schedules
                    .filter((s) => s.is_active && s.date >= todayStr)
                    .sort((a, b) => a.date.localeCompare(b.date));

                  return (
                    <div key={chamber.id} className="rounded-xl border border-border/60 p-4">
                      <p className="font-medium text-foreground">{chamber.name}</p>
                      {(chamber.address || chamber.area || chamber.city) && (
                        <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                          <MapPin className="size-3.5 shrink-0" />
                          {[chamber.address, chamber.area, chamber.city].filter(Boolean).join(", ")}
                        </p>
                      )}
                      {chamber.consultation_fee != null && (
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          Consultation fee: ৳{chamber.consultation_fee}
                        </p>
                      )}

                      {upcoming.length > 0 ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {upcoming.map((schedule) => {
                            const isSelected =
                              selectedSlot?.schedule.id === schedule.id && selectedSlot.chamber.id === chamber.id;
                            return (
                              <button
                                key={schedule.id}
                                type="button"
                                onClick={() => setSelectedSlot({ chamber, schedule })}
                                className={cn(
                                  "rounded-lg border px-3 py-2 text-left text-xs font-medium transition-colors",
                                  isSelected
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-border bg-background text-foreground hover:border-primary/40"
                                )}
                              >
                                <span className="flex items-center gap-1">
                                  <Clock className="size-3" />
                                  {formatSlotDate(schedule.date)}
                                </span>
                                <span className="mt-0.5 block">
                                  {formatSlotTime(schedule.start_time)}–{formatSlotTime(schedule.end_time)}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="mt-3 text-xs text-muted-foreground">No upcoming slots at this chamber.</p>
                      )}
                    </div>
                  );
                })}
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
            <p className="mt-3 text-sm font-semibold text-foreground">
              {isActive ? "Accepting patients" : "Currently unavailable"}
            </p>

            {selectedSlot ? (
              <div className="mt-4 space-y-3 text-left">
                <div className="rounded-lg bg-secondary/60 p-3 text-sm">
                  <p className="font-medium text-foreground">{selectedSlot.chamber.name}</p>
                  <p className="mt-1 text-muted-foreground">
                    {formatSlotDate(selectedSlot.schedule.date)} · {formatSlotTime(selectedSlot.schedule.start_time)}–
                    {formatSlotTime(selectedSlot.schedule.end_time)}
                  </p>
                  {selectedSlot.schedule.consultation_fee != null && (
                    <p className="mt-1 font-semibold text-foreground">৳{selectedSlot.schedule.consultation_fee}</p>
                  )}
                </div>
                <Button className="w-full" onClick={handleBook} disabled={booking}>
                  <CalendarCheck />
                  {booking ? "Booking..." : isAuthenticated ? "Confirm Booking" : "Sign In to Book"}
                </Button>
                <Button variant="ghost" className="w-full" onClick={() => setSelectedSlot(null)}>
                  Choose a different slot
                </Button>
              </div>
            ) : (
              <>
                <p className="mt-1 text-xs text-muted-foreground">
                  {chambers.length > 0
                    ? "Pick an available time slot to book an appointment."
                    : `Sign in to book an appointment with ${name} directly through Ibnocare.`}
                </p>
                {chambers.length === 0 && (
                  <Link
                    href={isAuthenticated ? "/dashboard" : "/login"}
                    className={buttonVariants({ className: "mt-5 w-full" })}
                  >
                    <CalendarCheck />
                    {isAuthenticated ? "Go to Dashboard" : "Sign In to Book"}
                  </Link>
                )}
              </>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
