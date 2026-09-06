"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "motion/react";
import { Save } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAdminAuth } from "@/context/admin-auth-context";
import { ApiError } from "@/lib/api-client";
import {
  createMedicineCompany,
  fetchMedicineCompany,
  updateMedicineCompany,
  type MedicineCompanyPayload,
} from "@/lib/medicines";

function extractErrorMessage(err: unknown, fallback: string) {
  if (err instanceof ApiError) {
    const body = err.body as { errors?: Record<string, string[]> } | null;
    const firstFieldError = body?.errors ? Object.values(body.errors)[0]?.[0] : undefined;
    return firstFieldError ?? err.message;
  }
  return fallback;
}

export function MedicineCompanyForm({ companyId }: { companyId?: string }) {
  const router = useRouter();
  const { token } = useAdminAuth();
  const isEditing = Boolean(companyId);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [logo, setLogo] = useState("");
  const [address, setAddress] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [about, setAbout] = useState("");

  useEffect(() => {
    if (!companyId || !token) return;
    let cancelled = false;
    (async () => {
      const company = await fetchMedicineCompany(token, companyId);
      if (cancelled) return;
      if (!company) {
        toast.error("Could not load this company.");
        setLoading(false);
        return;
      }
      setName(company.name ?? "");
      setLogo(company.logo ?? "");
      setAddress(company.address ?? "");
      setLicenseNumber(company.license_number ?? "");
      setAbout(company.about ?? "");
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [companyId, token]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!name.trim()) {
      toast.error("Enter the company name.");
      return;
    }

    const payload: MedicineCompanyPayload = {
      name: name.trim(),
      logo: logo.trim() || undefined,
      address: address.trim() || undefined,
      license_number: licenseNumber.trim() || undefined,
      about: about.trim() || undefined,
    };

    setSaving(true);
    try {
      if (isEditing && companyId) {
        await updateMedicineCompany(token, companyId, payload);
        toast.success("Company updated");
      } else {
        await createMedicineCompany(token, payload);
        toast.success("Company added");
      }
      router.push("/admin/medicine-companies");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not save this company."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto flex max-w-2xl justify-center py-16">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="size-8 rounded-full border-2 border-primary border-t-transparent"
        />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <Card className="border-border/60 p-6">
          <h2 className="font-semibold text-foreground">Company Information</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="name">Company Name</Label>
              <Input id="name" className="mt-1.5" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="licenseNumber">License Number</Label>
              <Input
                id="licenseNumber"
                className="mt-1.5"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="logo">Logo URL</Label>
              <Input id="logo" className="mt-1.5" value={logo} onChange={(e) => setLogo(e.target.value)} placeholder="https://..." />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" className="mt-1.5" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="about">About</Label>
              <Textarea id="about" className="mt-1.5" rows={3} value={about} onChange={(e) => setAbout(e.target.value)} />
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.push("/admin/medicine-companies")}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          <Save />
          {saving ? "Saving..." : isEditing ? "Save Changes" : "Add Company"}
        </Button>
      </div>
    </form>
  );
}
