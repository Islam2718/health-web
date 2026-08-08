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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { TagInput } from "@/components/admin/tag-input";
import { useAdminResource } from "@/hooks/use-admin-resource";
import { hospitals, areas, type Hospital } from "@/lib/hospitals-data";
import { slugify } from "@/lib/utils";

const hospitalSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  type: Yup.string().required("Type is required"),
  area: Yup.string().required("Area is required"),
  address: Yup.string().required("Address is required"),
  image: Yup.string().url("Enter a valid image URL").required("Image URL is required"),
  phone: Yup.string().required("Phone is required"),
  totalBeds: Yup.number().min(0).required("Required"),
  bedsAvailable: Yup.number().min(0).required("Required"),
  otRooms: Yup.number().min(0).required("Required"),
  established: Yup.number().min(1800).max(new Date().getFullYear()).required("Required"),
  description: Yup.string().required("Description is required"),
});

export function HospitalForm({ hospitalId }: { hospitalId?: string }) {
  const router = useRouter();
  const { getById, create, update } = useAdminResource<Hospital>("admin_hospitals", hospitals);
  const existing = hospitalId ? getById(hospitalId) : undefined;

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: existing?.name ?? "",
      type: existing?.type ?? "General Hospital",
      area: existing?.area ?? areas[1],
      address: existing?.address ?? "",
      image: existing?.image ?? "",
      phone: existing?.phone ?? "",
      totalBeds: existing?.totalBeds ?? 0,
      bedsAvailable: existing?.bedsAvailable ?? 0,
      otRooms: existing?.otRooms ?? 0,
      established: existing?.established ?? new Date().getFullYear(),
      hasEmergency: existing?.hasEmergency ?? true,
      hasAmbulance: existing?.hasAmbulance ?? true,
      description: existing?.description ?? "",
      departments: existing?.departments ?? [],
    },
    validationSchema: hospitalSchema,
    onSubmit: (values) => {
      const payload: Hospital = {
        id: existing?.id ?? slugify(values.name),
        name: values.name,
        type: values.type,
        area: values.area,
        address: values.address,
        image: values.image,
        rating: existing?.rating ?? 0,
        reviews: existing?.reviews ?? 0,
        bedsAvailable: Number(values.bedsAvailable),
        totalBeds: Number(values.totalBeds),
        hasEmergency: values.hasEmergency,
        hasAmbulance: values.hasAmbulance,
        established: Number(values.established),
        phone: values.phone,
        description: values.description,
        departments: values.departments,
        otRooms: Number(values.otRooms),
      };
      if (existing) {
        update(existing.id, payload);
        toast.success("Hospital updated");
      } else {
        create(payload);
        toast.success("Hospital added");
      }
      router.push("/admin/hospitals");
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
          <h2 className="font-semibold text-foreground">Hospital Information</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Hospital Name</Label>
              <Input id="name" name="name" className="mt-1.5" value={formik.values.name} onChange={formik.handleChange} onBlur={formik.handleBlur} />
              {err("name")}
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <Input id="type" name="type" className="mt-1.5" value={formik.values.type} onChange={formik.handleChange} onBlur={formik.handleBlur} placeholder="Multi-Specialty Hospital" />
              {err("type")}
            </div>
            <div>
              <Label htmlFor="area">Area</Label>
              <Input id="area" name="area" className="mt-1.5" value={formik.values.area} onChange={formik.handleChange} onBlur={formik.handleBlur} />
              {err("area")}
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" className="mt-1.5" value={formik.values.phone} onChange={formik.handleChange} onBlur={formik.handleBlur} />
              {err("phone")}
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" name="address" className="mt-1.5" value={formik.values.address} onChange={formik.handleChange} onBlur={formik.handleBlur} />
              {err("address")}
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="image">Image URL</Label>
              <Input id="image" name="image" className="mt-1.5" value={formik.values.image} onChange={formik.handleChange} onBlur={formik.handleBlur} placeholder="https://..." />
              {err("image")}
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}>
        <Card className="border-border/60 p-6">
          <h2 className="font-semibold text-foreground">Facilities</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <Label htmlFor="totalBeds">Total Beds</Label>
              <Input id="totalBeds" name="totalBeds" type="number" min={0} className="mt-1.5" value={formik.values.totalBeds} onChange={formik.handleChange} onBlur={formik.handleBlur} />
            </div>
            <div>
              <Label htmlFor="bedsAvailable">Beds Available</Label>
              <Input id="bedsAvailable" name="bedsAvailable" type="number" min={0} className="mt-1.5" value={formik.values.bedsAvailable} onChange={formik.handleChange} onBlur={formik.handleBlur} />
            </div>
            <div>
              <Label htmlFor="otRooms">OT Rooms</Label>
              <Input id="otRooms" name="otRooms" type="number" min={0} className="mt-1.5" value={formik.values.otRooms} onChange={formik.handleChange} onBlur={formik.handleBlur} />
            </div>
            <div>
              <Label htmlFor="established">Established</Label>
              <Input id="established" name="established" type="number" className="mt-1.5" value={formik.values.established} onChange={formik.handleChange} onBlur={formik.handleBlur} />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-xl bg-secondary/60 p-4">
              <p className="text-sm font-medium text-foreground">24/7 Emergency</p>
              <Switch checked={formik.values.hasEmergency} onCheckedChange={(v) => formik.setFieldValue("hasEmergency", v)} />
            </div>
            <div className="flex items-center justify-between rounded-xl bg-secondary/60 p-4">
              <p className="text-sm font-medium text-foreground">Ambulance Service</p>
              <Switch checked={formik.values.hasAmbulance} onCheckedChange={(v) => formik.setFieldValue("hasAmbulance", v)} />
            </div>
          </div>

          <Separator className="my-5" />

          <div>
            <Label>Departments</Label>
            <div className="mt-1.5">
              <TagInput value={formik.values.departments} onChange={(v) => formik.setFieldValue("departments", v)} placeholder="Cardiology" />
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }}>
        <Card className="border-border/60 p-6">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" className="mt-1.5" rows={4} value={formik.values.description} onChange={formik.handleChange} onBlur={formik.handleBlur} />
          {err("description")}
        </Card>
      </motion.div>

      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.push("/admin/hospitals")}>Cancel</Button>
        <Button type="submit" disabled={formik.isSubmitting}>
          <Save />
          {existing ? "Save Changes" : "Add Hospital"}
        </Button>
      </div>
    </form>
  );
}
