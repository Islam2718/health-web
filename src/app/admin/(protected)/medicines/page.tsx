"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Pencil, PillBottle, Plus, RefreshCw, Search, Trash2, WifiOff } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAdminAuth } from "@/context/admin-auth-context";
import {
  deleteMedicine,
  fetchMedicineCompanies,
  fetchMedicines,
  type MedicineCompany,
  type PublicMedicineRecord,
} from "@/lib/medicines";
import { toast } from "sonner";

export default function AdminMedicinesPage() {
  const { token } = useAdminAuth();
  const [medicines, setMedicines] = useState<PublicMedicineRecord[]>([]);
  const [companies, setCompanies] = useState<MedicineCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [retryToken, setRetryToken] = useState(0);
  const [query, setQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<PublicMedicineRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([fetchMedicines(token), fetchMedicineCompanies(token)]).then(([medRes, companyRes]) => {
      if (cancelled) return;
      setMedicines(medRes.medicines);
      setCompanies(companyRes.companies);
      setLoadFailed(medRes.failed);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [token, retryToken]);

  const retry = useCallback(() => setRetryToken((n) => n + 1), []);

  const companyName = useCallback(
    (m: PublicMedicineRecord) => m.company?.name ?? companies.find((c) => c.id === m.company_id)?.name ?? "—",
    [companies]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return medicines.filter(
      (m) =>
        !q ||
        m.name.toLowerCase().includes(q) ||
        (m.generic_name ?? "").toLowerCase().includes(q) ||
        companyName(m).toLowerCase().includes(q)
    );
  }, [medicines, query, companyName]);

  const confirmDelete = async () => {
    if (!token || !deleteTarget) return;
    setDeleting(true);
    try {
      await deleteMedicine(token, deleteTarget.id);
      setMedicines((list) => list.filter((m) => m.id !== deleteTarget.id));
      toast.success("Medicine removed");
    } catch {
      toast.error("Could not remove that medicine.");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Medicines</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {loading ? "Loading…" : `${medicines.length} medicines listed`}
          </p>
        </div>
        <Button render={<Link href="/admin/medicine/new" />} nativeButton={false}>
          <Plus /> Add Medicine
        </Button>
      </motion.div>

      {!loading && companies.length === 0 && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
          No medicine companies yet —{" "}
          <Link href="/admin/medicine-company/new" className="font-medium underline">
            add one first
          </Link>{" "}
          before you can add a medicine.
        </p>
      )}

      <div className="mt-5 relative">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name, generic name, or company..." className="h-10 pl-10" />
      </div>

      <Card className="mt-5 overflow-hidden border-border/60 p-0">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="size-8 rounded-full border-2 border-primary border-t-transparent"
            />
          </div>
        ) : (
          <>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medicine</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((medicine) => (
                <TableRow key={medicine.id}>
                  <TableCell>
                    <p className="text-sm font-medium text-foreground">{medicine.name}</p>
                    {medicine.generic_name && (
                      <p className="text-xs text-muted-foreground">{medicine.generic_name}</p>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{companyName(medicine)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{medicine.weight ?? "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{medicine.type ?? "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {medicine.suggestion_price != null ? `৳${medicine.suggestion_price}` : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1.5">
                      <Link
                        href={`/admin/medicine/${medicine.id}`}
                        className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
                        aria-label="Edit"
                      >
                        <Pencil />
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleteTarget(medicine)}
                        aria-label="Delete"
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filtered.length === 0 && loadFailed && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <WifiOff className="size-5" />
            </div>
            <p className="mt-3 font-semibold text-foreground">Couldn&apos;t load medicines</p>
            <p className="mt-1 text-sm text-muted-foreground">We couldn&apos;t reach the server.</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={retry}>
              <RefreshCw />
              Retry
            </Button>
          </div>
        )}

        {filtered.length === 0 && !loadFailed && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-primary">
              <PillBottle className="size-5" />
            </div>
            <p className="mt-3 font-semibold text-foreground">No medicines found</p>
          </div>
        )}
          </>
        )}
      </Card>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete medicine?</DialogTitle>
            <DialogDescription>
              This will remove <strong>{deleteTarget?.name}</strong>. This can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleting}>
              {deleting ? "Removing..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
