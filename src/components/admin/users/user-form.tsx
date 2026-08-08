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
import { adminUsers, roleOptions, type AdminManagedUser } from "@/lib/admin-users-data";
import { slugify } from "@/lib/utils";

const schema = Yup.object({
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Enter a valid email").required("Email is required"),
  phone: Yup.string().required("Phone is required"),
});

export function UserForm({ userId }: { userId?: string }) {
  const router = useRouter();
  const { getById, create, update } = useAdminResource<AdminManagedUser>("admin_users", adminUsers);
  const existing = userId ? getById(userId) : undefined;

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: existing?.name ?? "",
      email: existing?.email ?? "",
      phone: existing?.phone ?? "",
      role: existing?.role ?? "Patient",
      active: existing ? existing.status === "Active" : true,
      avatar: existing?.avatar ?? "https://i.pravatar.cc/150?img=1",
    },
    validationSchema: schema,
    onSubmit: (values) => {
      const payload: AdminManagedUser = {
        id: existing?.id ?? slugify(values.name),
        name: values.name,
        email: values.email,
        phone: values.phone,
        role: values.role as AdminManagedUser["role"],
        status: values.active ? "Active" : "Suspended",
        avatar: values.avatar,
        joined: existing?.joined ?? new Date().toISOString().slice(0, 10),
      };
      if (existing) {
        update(existing.id, payload);
        toast.success("User updated");
      } else {
        create(payload);
        toast.success("User added");
      }
      router.push("/admin/users");
    },
  });

  const err = (field: keyof typeof formik.values) =>
    formik.touched[field] && formik.errors[field] ? (
      <p className="mt-1 text-xs text-destructive">{formik.errors[field] as string}</p>
    ) : null;

  return (
    <form onSubmit={formik.handleSubmit} className="mx-auto max-w-2xl space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <Card className="border-border/60 p-6">
          <h2 className="font-semibold text-foreground">Account Information</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" className="mt-1.5" value={formik.values.name} onChange={formik.handleChange} onBlur={formik.handleBlur} />
              {err("name")}
            </div>
            <div>
              <Label>Role</Label>
              <Select value={formik.values.role} onValueChange={(v) => formik.setFieldValue("role", v)}>
                <SelectTrigger className="mt-1.5 w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {roleOptions.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" className="mt-1.5" value={formik.values.email} onChange={formik.handleChange} onBlur={formik.handleBlur} />
              {err("email")}
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" className="mt-1.5" value={formik.values.phone} onChange={formik.handleChange} onBlur={formik.handleBlur} />
              {err("phone")}
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="avatar">Avatar URL</Label>
              <Input id="avatar" name="avatar" className="mt-1.5" value={formik.values.avatar} onChange={formik.handleChange} onBlur={formik.handleBlur} />
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between rounded-xl bg-secondary/60 p-4">
            <div>
              <p className="text-sm font-medium text-foreground">Active Account</p>
              <p className="text-xs text-muted-foreground">Suspended accounts cannot sign in</p>
            </div>
            <Switch checked={formik.values.active} onCheckedChange={(v) => formik.setFieldValue("active", v)} />
          </div>
        </Card>
      </motion.div>

      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.push("/admin/users")}>Cancel</Button>
        <Button type="submit" disabled={formik.isSubmitting}>
          <Save />
          {existing ? "Save Changes" : "Add User"}
        </Button>
      </div>
    </form>
  );
}
