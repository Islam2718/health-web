"use client";

import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import { motion } from "motion/react";
import {
  BadgeCheck,
  Banknote,
  Building2,
  CalendarOff,
  Clock,
  GraduationCap,
  Languages,
  Save,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TagInput } from "@/components/admin/tag-input";
import { AdminCalendar } from "@/components/admin/date-picker";
import { useAdminResource } from "@/hooks/use-admin-resource";
import { doctors, specialties, type Doctor } from "@/lib/doctors-data";
import { slugify } from "@/lib/utils";

const doctorSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  specialty: Yup.string().required("Specialty is required"),
  photo: Yup.string().url("Enter a valid image URL").required("Photo URL is required"),
  experience: Yup.number().min(0, "Must be 0 or more").required("Experience is required"),
  fee: Yup.number().min(0, "Must be 0 or more").required("Fee is required"),
  chamber: Yup.object({
    hospital: Yup.string().required("Hospital is required"),
    address: Yup.string().required("Address is required"),
    days: Yup.string().required("Visiting days are required"),
    time: Yup.string().required("Visiting time is required"),
  }),
  bio: Yup.string().required("Bio is required").max(600, "Keep it under 600 characters"),
});

export function DoctorForm({ doctorId }: { doctorId?: string }) {
  const router = useRouter();
  const { getById, create, update } = useAdminResource<Doctor>("admin_doctors", doctors);
  const existing = doctorId ? getById(doctorId) : undefined;

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: existing?.name ?? "",
      specialty: existing?.specialty ?? specialties[1],
      photo: existing?.photo ?? "",
      experience: existing?.experience ?? 0,
      fee: existing?.fee ?? 0,
      verified: existing?.verified ?? false,
      consultationMode: existing?.consultationMode ?? "Offline",
      chamber: {
        hospital: existing?.chamber.hospital ?? "",
        address: existing?.chamber.address ?? "",
        days: existing?.chamber.days ?? "",
        time: existing?.chamber.time ?? "",
      },
      bio: existing?.bio ?? "",
      education: existing?.education ?? [],
      languages: existing?.languages ?? [],
      availableSlots: existing?.availableSlots ?? [],
      leaveDates: existing?.leaveDates ?? [],
    },
    validationSchema: doctorSchema,
    onSubmit: (values) => {
      const payload: Doctor = {
        id: existing?.id ?? slugify(values.name),
        name: values.name,
        specialty: values.specialty,
        photo: values.photo,
        rating: existing?.rating ?? 0,
        reviews: existing?.reviews ?? 0,
        experience: Number(values.experience),
        fee: Number(values.fee),
        verified: values.verified,
        chamber: values.chamber,
        bio: values.bio,
        education: values.education,
        languages: values.languages,
        availableSlots: values.availableSlots,
        consultationMode: values.consultationMode as Doctor["consultationMode"],
        leaveDates: values.leaveDates,
      };

      if (existing) {
        update(existing.id, payload);
        toast.success("Doctor profile updated");
      } else {
        create(payload);
        toast.success("Doctor added");
      }
      router.push("/admin/doctors");
    },
  });

  const err = (field: keyof typeof formik.values) =>
    formik.touched[field] && formik.errors[field] ? (
      <p className="mt-1 text-xs text-destructive">{formik.errors[field] as string}</p>
    ) : null;

  return (
    <form onSubmit={formik.handleSubmit} className="mx-auto max-w-4xl space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <Card className="border-border/60 p-6">
          <h2 className="font-semibold text-foreground">Basic Information</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" className="mt-1.5" value={formik.values.name} onChange={formik.handleChange} onBlur={formik.handleBlur} placeholder="Dr. Jane Doe" />
              {err("name")}
            </div>
            <div>
              <Label>Specialty</Label>
              <Select value={formik.values.specialty} onValueChange={(v) => formik.setFieldValue("specialty", v)}>
                <SelectTrigger className="mt-1.5 w-full">
                  <SelectValue placeholder="Select specialty" />
                </SelectTrigger>
                <SelectContent>
                  {specialties.filter((s) => s !== "All").map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="photo">Photo URL</Label>
              <Input id="photo" name="photo" className="mt-1.5" value={formik.values.photo} onChange={formik.handleChange} onBlur={formik.handleBlur} placeholder="https://..." />
              {err("photo")}
            </div>
            <div>
              <Label htmlFor="experience">Experience (years)</Label>
              <Input id="experience" name="experience" type="number" min={0} className="mt-1.5" value={formik.values.experience} onChange={formik.handleChange} onBlur={formik.handleBlur} />
              {err("experience")}
            </div>
            <div>
              <Label htmlFor="fee" className="flex items-center gap-1">
                <Banknote className="size-3.5" /> Consultation Fee (৳)
              </Label>
              <Input id="fee" name="fee" type="number" min={0} className="mt-1.5" value={formik.values.fee} onChange={formik.handleChange} onBlur={formik.handleBlur} />
              {err("fee")}
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between rounded-xl bg-secondary/60 p-4">
            <div className="flex items-center gap-2">
              <BadgeCheck className="size-4 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Verified Doctor</p>
                <p className="text-xs text-muted-foreground">Shows a verified badge on the public profile</p>
              </div>
            </div>
            <Switch checked={formik.values.verified} onCheckedChange={(v) => formik.setFieldValue("verified", v)} />
          </div>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}>
        <Card className="border-border/60 p-6">
          <h2 className="flex items-center gap-2 font-semibold text-foreground">
            <Building2 className="size-4 text-primary" />
            Chamber & Consultation
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="chamber.hospital">Hospital / Clinic</Label>
              <Input id="chamber.hospital" name="chamber.hospital" className="mt-1.5" value={formik.values.chamber.hospital} onChange={formik.handleChange} onBlur={formik.handleBlur} />
              {formik.touched.chamber?.hospital && formik.errors.chamber?.hospital && (
                <p className="mt-1 text-xs text-destructive">{formik.errors.chamber.hospital}</p>
              )}
            </div>
            <div>
              <Label htmlFor="chamber.address">Address</Label>
              <Input id="chamber.address" name="chamber.address" className="mt-1.5" value={formik.values.chamber.address} onChange={formik.handleChange} onBlur={formik.handleBlur} />
            </div>
            <div>
              <Label htmlFor="chamber.days">Visiting Days</Label>
              <Input id="chamber.days" name="chamber.days" className="mt-1.5" value={formik.values.chamber.days} onChange={formik.handleChange} onBlur={formik.handleBlur} placeholder="Sun – Thu" />
            </div>
            <div>
              <Label htmlFor="chamber.time">Visiting Time</Label>
              <Input id="chamber.time" name="chamber.time" className="mt-1.5" value={formik.values.chamber.time} onChange={formik.handleChange} onBlur={formik.handleBlur} placeholder="5:00 PM – 8:00 PM" />
            </div>
            <div>
              <Label>Consultation Mode</Label>
              <Select value={formik.values.consultationMode} onValueChange={(v) => formik.setFieldValue("consultationMode", v)}>
                <SelectTrigger className="mt-1.5 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Offline">Offline (chamber visit)</SelectItem>
                  <SelectItem value="Online">Online (video consultation)</SelectItem>
                  <SelectItem value="Both">Both Online & Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }}>
        <Card className="border-border/60 p-6">
          <h2 className="font-semibold text-foreground">Bio & Credentials</h2>
          <div className="mt-4">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" name="bio" className="mt-1.5" rows={4} value={formik.values.bio} onChange={formik.handleChange} onBlur={formik.handleBlur} />
            {err("bio")}
          </div>

          <Separator className="my-5" />

          <div>
            <Label className="flex items-center gap-1.5">
              <GraduationCap className="size-3.5" /> Education
            </Label>
            <div className="mt-1.5">
              <TagInput value={formik.values.education} onChange={(v) => formik.setFieldValue("education", v)} placeholder="MBBS – Dhaka Medical College" />
            </div>
          </div>

          <div className="mt-5">
            <Label className="flex items-center gap-1.5">
              <Languages className="size-3.5" /> Languages
            </Label>
            <div className="mt-1.5">
              <TagInput value={formik.values.languages} onChange={(v) => formik.setFieldValue("languages", v)} placeholder="English" />
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.15 }}>
        <Card className="border-border/60 p-6">
          <h2 className="flex items-center gap-2 font-semibold text-foreground">
            <Clock className="size-4 text-primary" />
            Schedule
          </h2>

          <div className="mt-4">
            <Label>Available Time Slots</Label>
            <div className="mt-1.5">
              <TagInput value={formik.values.availableSlots} onChange={(v) => formik.setFieldValue("availableSlots", v)} placeholder="10:00" />
            </div>
          </div>

          <Separator className="my-5" />

          <div>
            <Label className="flex items-center gap-1.5">
              <CalendarOff className="size-3.5" /> Leave / Unavailable Dates
            </Label>
            <p className="mt-1 text-xs text-muted-foreground">
              Select dates the doctor will not be available for appointments.
            </p>
            <div className="mt-3 rounded-xl border border-border/60">
              <AdminCalendar
                mode="multiple"
                selected={formik.values.leaveDates.map((d) => new Date(d))}
                onSelect={(dates) =>
                  formik.setFieldValue(
                    "leaveDates",
                    (dates ?? []).map((d) => d.toISOString().slice(0, 10))
                  )
                }
              />
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.push("/admin/doctors")}>
          Cancel
        </Button>
        <Button type="submit" disabled={formik.isSubmitting}>
          <Save />
          {existing ? "Save Changes" : "Add Doctor"}
        </Button>
      </div>
    </form>
  );
}
