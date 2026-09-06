"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Autocomplete } from "@base-ui/react/autocomplete";
import { toast } from "sonner";
import { motion } from "motion/react";
import { AlertCircle, Save, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAdminAuth } from "@/context/admin-auth-context";
import { ApiError } from "@/lib/api-client";
import {
  createMedicine,
  fetchMedicine,
  fetchMedicineCompanies,
  updateMedicine,
  type MedicineCompany,
  type MedicinePayload,
} from "@/lib/medicines";

function extractErrorMessage(err: unknown, fallback: string) {
  if (err instanceof ApiError) {
    const body = err.body as { errors?: Record<string, string[]> } | null;
    const firstFieldError = body?.errors ? Object.values(body.errors)[0]?.[0] : undefined;
    return firstFieldError ?? err.message;
  }
  return fallback;
}

export function MedicineForm({ medicineId }: { medicineId?: string }) {
  const router = useRouter();
  const { token } = useAdminAuth();
  const isEditing = Boolean(medicineId);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [companies, setCompanies] = useState<MedicineCompany[]>([]);

  const [name, setName] = useState("");
  const [genericName, setGenericName] = useState("");
  const [weight, setWeight] = useState("");
  const [suggestionPrice, setSuggestionPrice] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [companyId, setCompanyId] = useState("");
  // Autocomplete's `value` is always the free-typed search text, never the
  // selected item — kept separate from companyId on purpose, and left
  // empty rather than pre-filled with the current selection's name, so
  // reopening the box to change companies shows the full list immediately
  // instead of filtering down to just the one already picked.
  const [companyQuery, setCompanyQuery] = useState("");
  const [companyOpen, setCompanyOpen] = useState(false);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      const [companyRes, medicine] = await Promise.all([
        fetchMedicineCompanies(token),
        medicineId ? fetchMedicine(token, medicineId) : Promise.resolve(null),
      ]);
      if (cancelled) return;
      setCompanies(companyRes.companies);

      if (medicineId) {
        if (!medicine) {
          toast.error("Could not load this medicine.");
        } else {
          setName(medicine.name ?? "");
          setGenericName(medicine.generic_name ?? "");
          setWeight(medicine.weight ?? "");
          setSuggestionPrice(medicine.suggestion_price != null ? String(medicine.suggestion_price) : "");
          setType(medicine.type ?? "");
          setDescription(medicine.description ?? "");
          if (medicine.company_id != null) setCompanyId(String(medicine.company_id));
        }
      } else if (companyRes.companies.length > 0) {
        setCompanyId(String(companyRes.companies[0].id));
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [medicineId, token]);

  const selectedCompany = companies.find((c) => String(c.id) === companyId) ?? null;

  const selectCompany = (company: MedicineCompany) => {
    setCompanyId(String(company.id));
    setCompanyQuery("");
    setCompanyOpen(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!name.trim()) {
      toast.error("Enter the medicine name.");
      return;
    }
    if (!companyId) {
      toast.error("Select the manufacturer company.");
      return;
    }

    const payload: MedicinePayload = {
      name: name.trim(),
      company_id: Number(companyId),
      generic_name: genericName.trim() || undefined,
      weight: weight.trim() || undefined,
      type: type.trim() || undefined,
      description: description.trim() || undefined,
      suggestion_price: suggestionPrice.trim() ? Number(suggestionPrice) : undefined,
    };

    setSaving(true);
    try {
      if (isEditing && medicineId) {
        await updateMedicine(token, medicineId, payload);
        toast.success("Medicine updated");
      } else {
        await createMedicine(token, payload);
        toast.success("Medicine added");
      }
      router.push("/admin/medicines");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not save this medicine."));
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

  if (companies.length === 0) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card className="flex flex-col items-center gap-3 border-dashed border-border/60 p-10 text-center">
          <AlertCircle className="size-8 text-amber-500" />
          <p className="font-semibold text-foreground">No medicine companies yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            A medicine must belong to a company. Add a medicine company first, then come back here.
          </p>
          <Button render={<Link href="/admin/medicine-company/new" />} nativeButton={false}>
            Add Medicine Company
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <Card className="border-border/60 p-6">
          <h2 className="font-semibold text-foreground">Medicine Information</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Medicine Name</Label>
              <Input id="name" className="mt-1.5" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label>Company</Label>
              <Autocomplete.Root
                items={companies}
                value={companyQuery}
                onValueChange={setCompanyQuery}
                itemToStringValue={(c: MedicineCompany) => c.name}
                open={companyOpen}
                onOpenChange={setCompanyOpen}
                openOnInputClick
              >
                <div className="relative mt-1.5">
                  <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Autocomplete.Input
                    placeholder={selectedCompany ? "Search to change company…" : "Search company…"}
                    className="flex h-8 w-full rounded-lg border border-input bg-transparent py-1.5 pr-3 pl-8 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                  />
                </div>
                <Autocomplete.Portal>
                  <Autocomplete.Positioner side="bottom" sideOffset={4} align="start" className="isolate z-50 w-(--anchor-width)">
                    <Autocomplete.Popup className="max-h-64 overflow-y-auto rounded-lg border border-border/60 bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10">
                      <Autocomplete.Empty className="p-3 text-center text-xs text-muted-foreground">
                        No matching companies.
                      </Autocomplete.Empty>
                      <Autocomplete.List>
                        {(company: MedicineCompany) => (
                          <Autocomplete.Item
                            key={company.id}
                            value={company}
                            onClick={() => selectCompany(company)}
                            className={cn(
                              "flex cursor-default items-center justify-between px-3 py-2 text-sm outline-hidden select-none",
                              "hover:bg-accent hover:text-accent-foreground data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground"
                            )}
                          >
                            {company.name}
                          </Autocomplete.Item>
                        )}
                      </Autocomplete.List>
                    </Autocomplete.Popup>
                  </Autocomplete.Positioner>
                </Autocomplete.Portal>
              </Autocomplete.Root>
              {selectedCompany && (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Selected: <span className="font-medium text-foreground">{selectedCompany.name}</span>
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="genericName">Generic Name</Label>
              <Input id="genericName" className="mt-1.5" value={genericName} onChange={(e) => setGenericName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <Input id="type" className="mt-1.5" value={type} onChange={(e) => setType(e.target.value)} placeholder="Tablet, Syrup, Injection..." />
            </div>
            <div>
              <Label htmlFor="weight">Weight / Strength</Label>
              <Input id="weight" className="mt-1.5" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="500mg" />
            </div>
            <div>
              <Label htmlFor="suggestionPrice">Suggestion Price (৳)</Label>
              <Input
                id="suggestionPrice"
                type="number"
                min={0}
                step="0.01"
                className="mt-1.5"
                value={suggestionPrice}
                onChange={(e) => setSuggestionPrice(e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" className="mt-1.5" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.push("/admin/medicines")}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          <Save />
          {saving ? "Saving..." : isEditing ? "Save Changes" : "Add Medicine"}
        </Button>
      </div>
    </form>
  );
}
