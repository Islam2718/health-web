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
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TagInput } from "@/components/admin/tag-input";
import { useAdminResource } from "@/hooks/use-admin-resource";
import { ambulances, ambulanceAreas, type Ambulance } from "@/lib/ambulances-data";
import { slugify } from "@/lib/utils";

const schema = Yup.object({
  provider: Yup.string().required("Provider is required"),
  type: Yup.string().required("Type is required"),
  area: Yup.string().required("Area is required"),
  vehicleNumber: Yup.string().required("Vehicle number is required"),
  etaMinutes: Yup.number().min(0).required("Required"),
  baseFare: Yup.number().min(0).required("Required"),
  driverName: Yup.string().required("Driver name is required"),
  driverPhone: Yup.string().required("Driver phone is required"),
  driverLicense: Yup.string().required("License is required"),
  driverExperience: Yup.number().min(0).required("Required"),
});

export function AmbulanceForm({ ambulanceId }: { ambulanceId?: string }) {
  const router = useRouter();
  const { getById, create, update } = useAdminResource<Ambulance>("admin_ambulances", ambulances);
  const existing = ambulanceId ? getById(ambulanceId) : undefined;

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      provider: existing?.provider ?? "",
      type: existing?.type ?? "Basic Life Support",
      area: existing?.area ?? ambulanceAreas[1],
      vehicleNumber: existing?.vehicleNumber ?? "",
      status: existing?.status ?? "Available Now",
      etaMinutes: existing?.etaMinutes ?? 10,
      baseFare: existing?.baseFare ?? 0,
      equipment: existing?.equipment ?? [],
      driverName: existing?.driver.name ?? "",
      driverPhoto: existing?.driver.photo ?? "https://i.pravatar.cc/150?img=15",
      driverPhone: existing?.driver.phone ?? "",
      driverLicense: existing?.driver.license ?? "",
      driverExperience: existing?.driver.experience ?? 0,
    },
    validationSchema: schema,
    onSubmit: (values) => {
      const payload: Ambulance = {
        id: existing?.id ?? slugify(values.provider + "-" + values.vehicleNumber),
        provider: values.provider,
        type: values.type,
        area: values.area,
        vehicleNumber: values.vehicleNumber,
        status: values.status as Ambulance["status"],
        etaMinutes: Number(values.etaMinutes),
        rating: existing?.rating ?? 4.5,
        baseFare: Number(values.baseFare),
        equipment: values.equipment,
        driver: {
          name: values.driverName,
          photo: values.driverPhoto,
          phone: values.driverPhone,
          license: values.driverLicense,
          experience: Number(values.driverExperience),
        },
      };
      if (existing) {
        update(existing.id, payload);
        toast.success("Ambulance updated");
      } else {
        create(payload);
        toast.success("Ambulance added");
      }
      router.push("/admin/ambulances");
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
          <h2 className="font-semibold text-foreground">Vehicle Information</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="provider">Provider / Company</Label>
              <Input id="provider" name="provider" className="mt-1.5" value={formik.values.provider} onChange={formik.handleChange} onBlur={formik.handleBlur} />
              {err("provider")}
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <Input id="type" name="type" className="mt-1.5" value={formik.values.type} onChange={formik.handleChange} onBlur={formik.handleBlur} placeholder="Advanced Life Support (ICU)" />
              {err("type")}
            </div>
            <div>
              <Label htmlFor="area">Area</Label>
              <Input id="area" name="area" className="mt-1.5" value={formik.values.area} onChange={formik.handleChange} onBlur={formik.handleBlur} />
              {err("area")}
            </div>
            <div>
              <Label htmlFor="vehicleNumber">Vehicle Number</Label>
              <Input id="vehicleNumber" name="vehicleNumber" className="mt-1.5" value={formik.values.vehicleNumber} onChange={formik.handleChange} onBlur={formik.handleBlur} />
              {err("vehicleNumber")}
            </div>
            <div>
              <Label>Status</Label>
              <Select value={formik.values.status} onValueChange={(v) => formik.setFieldValue("status", v)}>
                <SelectTrigger className="mt-1.5 w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Available Now">Available Now</SelectItem>
                  <SelectItem value="En Route">En Route</SelectItem>
                  <SelectItem value="On Duty">On Duty</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="etaMinutes">ETA (minutes)</Label>
              <Input id="etaMinutes" name="etaMinutes" type="number" min={0} className="mt-1.5" value={formik.values.etaMinutes} onChange={formik.handleChange} onBlur={formik.handleBlur} />
              {err("etaMinutes")}
            </div>
            <div>
              <Label htmlFor="baseFare">Base Fare (৳)</Label>
              <Input id="baseFare" name="baseFare" type="number" min={0} className="mt-1.5" value={formik.values.baseFare} onChange={formik.handleChange} onBlur={formik.handleBlur} />
              {err("baseFare")}
            </div>
          </div>

          <Separator className="my-5" />

          <div>
            <Label>Equipment</Label>
            <div className="mt-1.5">
              <TagInput value={formik.values.equipment} onChange={(v) => formik.setFieldValue("equipment", v)} placeholder="Oxygen Supply" />
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}>
        <Card className="border-border/60 p-6">
          <h2 className="font-semibold text-foreground">Driver Information</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="driverName">Driver Name</Label>
              <Input id="driverName" name="driverName" className="mt-1.5" value={formik.values.driverName} onChange={formik.handleChange} onBlur={formik.handleBlur} />
              {err("driverName")}
            </div>
            <div>
              <Label htmlFor="driverPhone">Driver Phone</Label>
              <Input id="driverPhone" name="driverPhone" className="mt-1.5" value={formik.values.driverPhone} onChange={formik.handleChange} onBlur={formik.handleBlur} />
              {err("driverPhone")}
            </div>
            <div>
              <Label htmlFor="driverLicense">License Number</Label>
              <Input id="driverLicense" name="driverLicense" className="mt-1.5" value={formik.values.driverLicense} onChange={formik.handleChange} onBlur={formik.handleBlur} />
              {err("driverLicense")}
            </div>
            <div>
              <Label htmlFor="driverExperience">Experience (years)</Label>
              <Input id="driverExperience" name="driverExperience" type="number" min={0} className="mt-1.5" value={formik.values.driverExperience} onChange={formik.handleChange} onBlur={formik.handleBlur} />
              {err("driverExperience")}
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="driverPhoto">Driver Photo URL</Label>
              <Input id="driverPhoto" name="driverPhoto" className="mt-1.5" value={formik.values.driverPhoto} onChange={formik.handleChange} onBlur={formik.handleBlur} />
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.push("/admin/ambulances")}>Cancel</Button>
        <Button type="submit" disabled={formik.isSubmitting}>
          <Save />
          {existing ? "Save Changes" : "Add Ambulance"}
        </Button>
      </div>
    </form>
  );
}
