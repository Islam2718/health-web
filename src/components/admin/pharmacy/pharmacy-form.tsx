"use client";

import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import { motion } from "motion/react";
import { Plus, Save, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { TagInput } from "@/components/admin/tag-input";
import { useAdminResource } from "@/hooks/use-admin-resource";
import { medicalStores, pharmacyAreas, type MedicalStore } from "@/lib/pharmacy-data";
import { slugify } from "@/lib/utils";

const schema = Yup.object({
  name: Yup.string().required("Name is required"),
  type: Yup.string().required("Type is required"),
  area: Yup.string().required("Area is required"),
  address: Yup.string().required("Address is required"),
  image: Yup.string().url("Enter a valid image URL").required("Image URL is required"),
  phone: Yup.string().required("Phone is required"),
  openHours: Yup.string().required("Open hours are required"),
  description: Yup.string().required("Description is required"),
});

export function PharmacyForm({ storeId }: { storeId?: string }) {
  const router = useRouter();
  const { getById, create, update } = useAdminResource<MedicalStore>("admin_pharmacies", medicalStores);
  const existing = storeId ? getById(storeId) : undefined;

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: existing?.name ?? "",
      type: existing?.type ?? "Retail Pharmacy",
      area: existing?.area ?? pharmacyAreas[1],
      address: existing?.address ?? "",
      image: existing?.image ?? "",
      phone: existing?.phone ?? "",
      deliveryAvailable: existing?.deliveryAvailable ?? true,
      deliveryTime: existing?.deliveryTime ?? "30–45 min",
      openHours: existing?.openHours ?? "",
      description: existing?.description ?? "",
      categories: existing?.categories ?? [],
      medicines: existing?.medicines ?? [],
    },
    validationSchema: schema,
    onSubmit: (values) => {
      const payload: MedicalStore = {
        id: existing?.id ?? slugify(values.name),
        name: values.name,
        type: values.type,
        area: values.area,
        address: values.address,
        image: values.image,
        rating: existing?.rating ?? 0,
        reviews: existing?.reviews ?? 0,
        deliveryAvailable: values.deliveryAvailable,
        deliveryTime: values.deliveryTime,
        openHours: values.openHours,
        phone: values.phone,
        description: values.description,
        categories: values.categories,
        medicines: values.medicines.filter((m) => m.name.trim()),
      };
      if (existing) {
        update(existing.id, payload);
        toast.success("Store updated");
      } else {
        create(payload);
        toast.success("Store added");
      }
      router.push("/admin/medical-stores");
    },
  });

  const err = (field: keyof typeof formik.values) =>
    formik.touched[field] && formik.errors[field] ? (
      <p className="mt-1 text-xs text-destructive">{formik.errors[field] as string}</p>
    ) : null;

  const updateMedicine = (index: number, key: string, value: string | boolean) => {
    const next = [...formik.values.medicines];
    next[index] = {
      ...next[index],
      [key]: key === "price" ? Number(value) : value,
    };
    formik.setFieldValue("medicines", next);
  };

  return (
    <form onSubmit={formik.handleSubmit} className="mx-auto max-w-3xl space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <Card className="border-border/60 p-6">
          <h2 className="font-semibold text-foreground">Store Information</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Store Name</Label>
              <Input id="name" name="name" className="mt-1.5" value={formik.values.name} onChange={formik.handleChange} onBlur={formik.handleBlur} />
              {err("name")}
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <Input id="type" name="type" className="mt-1.5" value={formik.values.type} onChange={formik.handleChange} onBlur={formik.handleBlur} />
            </div>
            <div>
              <Label htmlFor="area">Area</Label>
              <Input id="area" name="area" className="mt-1.5" value={formik.values.area} onChange={formik.handleChange} onBlur={formik.handleBlur} />
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
              <Input id="image" name="image" className="mt-1.5" value={formik.values.image} onChange={formik.handleChange} onBlur={formik.handleBlur} />
              {err("image")}
            </div>
            <div>
              <Label htmlFor="openHours">Open Hours</Label>
              <Input id="openHours" name="openHours" className="mt-1.5" value={formik.values.openHours} onChange={formik.handleChange} onBlur={formik.handleBlur} />
              {err("openHours")}
            </div>
            <div>
              <Label htmlFor="deliveryTime">Delivery Time</Label>
              <Input id="deliveryTime" name="deliveryTime" className="mt-1.5" value={formik.values.deliveryTime} onChange={formik.handleChange} onBlur={formik.handleBlur} />
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between rounded-xl bg-secondary/60 p-4">
            <p className="text-sm font-medium text-foreground">Delivery Available</p>
            <Switch checked={formik.values.deliveryAvailable} onCheckedChange={(v) => formik.setFieldValue("deliveryAvailable", v)} />
          </div>

          <Separator className="my-5" />

          <div>
            <Label>Categories</Label>
            <div className="mt-1.5">
              <TagInput value={formik.values.categories} onChange={(v) => formik.setFieldValue("categories", v)} placeholder="Prescription" />
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}>
        <Card className="border-border/60 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Medicines</h2>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() =>
                formik.setFieldValue("medicines", [
                  ...formik.values.medicines,
                  { name: "", category: "", price: 0, inStock: true, requiresPrescription: false },
                ])
              }
            >
              <Plus /> Add Medicine
            </Button>
          </div>
          <div className="mt-4 space-y-3">
            {formik.values.medicines.map((med, i) => (
              <div key={i} className="grid grid-cols-2 gap-2 rounded-xl border border-border/60 p-3 sm:grid-cols-6">
                <Input className="sm:col-span-2" placeholder="Medicine name" value={med.name} onChange={(e) => updateMedicine(i, "name", e.target.value)} />
                <Input placeholder="Category" value={med.category} onChange={(e) => updateMedicine(i, "category", e.target.value)} />
                <Input type="number" placeholder="Price" value={med.price} onChange={(e) => updateMedicine(i, "price", e.target.value)} />
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Switch checked={med.inStock} onCheckedChange={(v) => updateMedicine(i, "inStock", v)} size="sm" />
                  In stock
                </label>
                <div className="flex items-center justify-between gap-2">
                  <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Switch checked={med.requiresPrescription} onCheckedChange={(v) => updateMedicine(i, "requiresPrescription", v)} size="sm" />
                    Rx
                  </label>
                  <Button type="button" variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-destructive" onClick={() => formik.setFieldValue("medicines", formik.values.medicines.filter((_, idx) => idx !== i))}>
                    <Trash2 />
                  </Button>
                </div>
              </div>
            ))}
            {formik.values.medicines.length === 0 && (
              <p className="text-sm text-muted-foreground">No medicines added yet.</p>
            )}
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
        <Button type="button" variant="outline" onClick={() => router.push("/admin/medical-stores")}>Cancel</Button>
        <Button type="submit" disabled={formik.isSubmitting}>
          <Save />
          {existing ? "Save Changes" : "Add Store"}
        </Button>
      </div>
    </form>
  );
}
