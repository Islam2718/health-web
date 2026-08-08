"use client";

import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import { motion } from "motion/react";
import { Save } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminResource } from "@/hooks/use-admin-resource";
import { patients, bloodGroupOptions, type Patient } from "@/lib/patients-data";
import { doctors } from "@/lib/doctors-data";
import { slugify } from "@/lib/utils";

const patientSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  age: Yup.number().min(0, "Must be 0 or more").max(130, "Enter a realistic age").required("Age is required"),
  phone: Yup.string().required("Phone is required"),
  email: Yup.string().email("Enter a valid email").required("Email is required"),
  address: Yup.string().required("Address is required"),
  lastVisit: Yup.string().required("Last visit date is required"),
});

export function PatientForm({ patientId }: { patientId?: string }) {
  const router = useRouter();
  const { getById, create, update } = useAdminResource<Patient>("admin_patients", patients);
  const existing = patientId ? getById(patientId) : undefined;

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: existing?.name ?? "",
      age: existing?.age ?? 0,
      gender: existing?.gender ?? "Male",
      bloodGroup: existing?.bloodGroup ?? "O+",
      phone: existing?.phone ?? "",
      email: existing?.email ?? "",
      address: existing?.address ?? "",
      assignedDoctorId: existing?.assignedDoctorId ?? "",
      lastVisit: existing?.lastVisit ?? new Date().toISOString().slice(0, 10),
      active: existing ? existing.status === "Active" : true,
    },
    validationSchema: patientSchema,
    onSubmit: (values) => {
      const payload: Patient = {
        id: existing?.id ?? slugify(values.name),
        name: values.name,
        age: Number(values.age),
        gender: values.gender as Patient["gender"],
        bloodGroup: values.bloodGroup,
        phone: values.phone,
        email: values.email,
        address: values.address,
        assignedDoctorId: values.assignedDoctorId || undefined,
        lastVisit: values.lastVisit,
        status: values.active ? "Active" : "Inactive",
      };
      if (existing) {
        update(existing.id, payload);
        toast.success("Patient updated");
      } else {
        create(payload);
        toast.success("Patient added");
      }
      router.push("/admin/patients");
    },
  });

  const err = (field: keyof typeof formik.values) =>
    formik.touched[field] && formik.errors[field] ? (
      <p className="mt-1 text-xs text-destructive">{formik.errors[field] as string}</p>
    ) : null;

  return (
    <form onSubmit={formik.handleSubmit} className="mx-auto max-w-3xl space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <Card className="border-border/60 p-6">
          <h2 className="font-semibold text-foreground">Patient Information</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" className="mt-1.5" value={formik.values.name} onChange={formik.handleChange} onBlur={formik.handleBlur} />
              {err("name")}
            </div>
            <div>
              <Label htmlFor="age">Age</Label>
              <Input id="age" name="age" type="number" min={0} className="mt-1.5" value={formik.values.age} onChange={formik.handleChange} onBlur={formik.handleBlur} />
              {err("age")}
            </div>
            <div>
              <Label>Gender</Label>
              <Select value={formik.values.gender} onValueChange={(v) => formik.setFieldValue("gender", v)}>
                <SelectTrigger className="mt-1.5 w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Blood Group</Label>
              <Select value={formik.values.bloodGroup} onValueChange={(v) => formik.setFieldValue("bloodGroup", v)}>
                <SelectTrigger className="mt-1.5 w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {bloodGroupOptions.map((bg) => (
                    <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" className="mt-1.5" value={formik.values.phone} onChange={formik.handleChange} onBlur={formik.handleBlur} />
              {err("phone")}
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" className="mt-1.5" value={formik.values.email} onChange={formik.handleChange} onBlur={formik.handleBlur} />
              {err("email")}
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" name="address" className="mt-1.5" value={formik.values.address} onChange={formik.handleChange} onBlur={formik.handleBlur} />
              {err("address")}
            </div>
            <div>
              <Label>Assigned Doctor</Label>
              <Select value={formik.values.assignedDoctorId} onValueChange={(v) => formik.setFieldValue("assignedDoctorId", v)}>
                <SelectTrigger className="mt-1.5 w-full"><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>
                  {doctors.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name} — {d.specialty}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="lastVisit">Last Visit</Label>
              <Input id="lastVisit" name="lastVisit" type="date" className="mt-1.5" value={formik.values.lastVisit} onChange={formik.handleChange} onBlur={formik.handleBlur} />
              {err("lastVisit")}
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between rounded-xl bg-secondary/60 p-4">
            <div>
              <p className="text-sm font-medium text-foreground">Active Patient</p>
              <p className="text-xs text-muted-foreground">Inactive patients are hidden from quick search</p>
            </div>
            <Switch checked={formik.values.active} onCheckedChange={(v) => formik.setFieldValue("active", v)} />
          </div>
        </Card>
      </motion.div>

      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.push("/admin/patients")}>
          Cancel
        </Button>
        <Button type="submit" disabled={formik.isSubmitting}>
          <Save />
          {existing ? "Save Changes" : "Add Patient"}
        </Button>
      </div>
    </form>
  );
}
