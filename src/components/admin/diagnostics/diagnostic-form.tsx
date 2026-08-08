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
import { diagnosticCenters, diagnosticAreas, type DiagnosticCenter } from "@/lib/diagnostics-data";
import { slugify } from "@/lib/utils";

const schema = Yup.object({
  name: Yup.string().required("Name is required"),
  type: Yup.string().required("Type is required"),
  area: Yup.string().required("Area is required"),
  address: Yup.string().required("Address is required"),
  image: Yup.string().url("Enter a valid image URL").required("Image URL is required"),
  phone: Yup.string().required("Phone is required"),
  reportDelivery: Yup.string().required("Report delivery time is required"),
  openHours: Yup.string().required("Open hours are required"),
  description: Yup.string().required("Description is required"),
});

export function DiagnosticForm({ centerId }: { centerId?: string }) {
  const router = useRouter();
  const { getById, create, update } = useAdminResource<DiagnosticCenter>("admin_diagnostics", diagnosticCenters);
  const existing = centerId ? getById(centerId) : undefined;

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: existing?.name ?? "",
      type: existing?.type ?? "Diagnostic Centre",
      area: existing?.area ?? diagnosticAreas[1],
      address: existing?.address ?? "",
      image: existing?.image ?? "",
      phone: existing?.phone ?? "",
      homeSampleCollection: existing?.homeSampleCollection ?? true,
      reportDelivery: existing?.reportDelivery ?? "Same day",
      openHours: existing?.openHours ?? "",
      description: existing?.description ?? "",
      categories: existing?.categories ?? [],
      tests: existing?.tests ?? [],
    },
    validationSchema: schema,
    onSubmit: (values) => {
      const payload: DiagnosticCenter = {
        id: existing?.id ?? slugify(values.name),
        name: values.name,
        type: values.type,
        area: values.area,
        address: values.address,
        image: values.image,
        rating: existing?.rating ?? 0,
        reviews: existing?.reviews ?? 0,
        homeSampleCollection: values.homeSampleCollection,
        reportDelivery: values.reportDelivery,
        openHours: values.openHours,
        phone: values.phone,
        description: values.description,
        categories: values.categories,
        tests: values.tests.filter((t) => t.name.trim()),
      };
      if (existing) {
        update(existing.id, payload);
        toast.success("Diagnostic centre updated");
      } else {
        create(payload);
        toast.success("Diagnostic centre added");
      }
      router.push("/admin/diagnostic-centres");
    },
  });

  const err = (field: keyof typeof formik.values) =>
    formik.touched[field] && formik.errors[field] ? (
      <p className="mt-1 text-xs text-destructive">{formik.errors[field] as string}</p>
    ) : null;

  const updateTest = (index: number, key: "name" | "price" | "duration", value: string) => {
    const next = [...formik.values.tests];
    next[index] = { ...next[index], [key]: key === "price" ? Number(value) : value };
    formik.setFieldValue("tests", next);
  };

  return (
    <form onSubmit={formik.handleSubmit} className="mx-auto max-w-3xl space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <Card className="border-border/60 p-6">
          <h2 className="font-semibold text-foreground">Centre Information</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Centre Name</Label>
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
              <Input id="openHours" name="openHours" className="mt-1.5" value={formik.values.openHours} onChange={formik.handleChange} onBlur={formik.handleBlur} placeholder="7:00 AM – 10:00 PM" />
              {err("openHours")}
            </div>
            <div>
              <Label htmlFor="reportDelivery">Report Delivery</Label>
              <Input id="reportDelivery" name="reportDelivery" className="mt-1.5" value={formik.values.reportDelivery} onChange={formik.handleChange} onBlur={formik.handleBlur} placeholder="Same day" />
              {err("reportDelivery")}
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between rounded-xl bg-secondary/60 p-4">
            <p className="text-sm font-medium text-foreground">Home Sample Collection</p>
            <Switch checked={formik.values.homeSampleCollection} onCheckedChange={(v) => formik.setFieldValue("homeSampleCollection", v)} />
          </div>

          <Separator className="my-5" />

          <div>
            <Label>Categories</Label>
            <div className="mt-1.5">
              <TagInput value={formik.values.categories} onChange={(v) => formik.setFieldValue("categories", v)} placeholder="Pathology" />
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}>
        <Card className="border-border/60 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Tests &amp; Prices</h2>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => formik.setFieldValue("tests", [...formik.values.tests, { name: "", price: 0, duration: "Same day" }])}
            >
              <Plus /> Add Test
            </Button>
          </div>
          <div className="mt-4 space-y-3">
            {formik.values.tests.map((test, i) => (
              <div key={i} className="grid grid-cols-1 gap-2 rounded-xl border border-border/60 p-3 sm:grid-cols-[1fr_120px_140px_auto]">
                <Input placeholder="Test name" value={test.name} onChange={(e) => updateTest(i, "name", e.target.value)} />
                <Input type="number" placeholder="Price" value={test.price} onChange={(e) => updateTest(i, "price", e.target.value)} />
                <Input placeholder="Duration" value={test.duration} onChange={(e) => updateTest(i, "duration", e.target.value)} />
                <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => formik.setFieldValue("tests", formik.values.tests.filter((_, idx) => idx !== i))}>
                  <Trash2 />
                </Button>
              </div>
            ))}
            {formik.values.tests.length === 0 && (
              <p className="text-sm text-muted-foreground">No tests added yet.</p>
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
        <Button type="button" variant="outline" onClick={() => router.push("/admin/diagnostic-centres")}>Cancel</Button>
        <Button type="submit" disabled={formik.isSubmitting}>
          <Save />
          {existing ? "Save Changes" : "Add Centre"}
        </Button>
      </div>
    </form>
  );
}
