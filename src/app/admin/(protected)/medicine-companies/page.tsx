"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Factory, Pencil, Plus, RefreshCw, Search, Trash2, WifiOff } from "lucide-react";
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
import { deleteMedicineCompany, fetchMedicineCompanies, type MedicineCompany } from "@/lib/medicines";
import { toast } from "sonner";

export default function AdminMedicineCompaniesPage() {
  const { token } = useAdminAuth();
  const [companies, setCompanies] = useState<MedicineCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [retryToken, setRetryToken] = useState(0);
  const [query, setQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<MedicineCompany | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setLoading(true);
    fetchMedicineCompanies(token).then(({ companies: results, failed }) => {
      if (cancelled) return;
      setCompanies(results);
      setLoadFailed(failed);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [token, retryToken]);

  const retry = useCallback(() => setRetryToken((n) => n + 1), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return companies.filter((c) => !q || c.name.toLowerCase().includes(q));
  }, [companies, query]);

  const confirmDelete = async () => {
    if (!token || !deleteTarget) return;
    setDeleting(true);
    try {
      await deleteMedicineCompany(token, deleteTarget.id);
      setCompanies((list) => list.filter((c) => c.id !== deleteTarget.id));
      toast.success("Medicine company removed");
    } catch {
      toast.error("Could not remove that company.");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Medicine Companies</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {loading ? "Loading…" : `${companies.length} companies registered`}
          </p>
        </div>
        <Button render={<Link href="/admin/medicine-company/new" />} nativeButton={false}>
          <Plus /> Add Company
        </Button>
      </motion.div>

      <div className="mt-5 relative">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by company name..." className="h-10 pl-10" />
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
                <TableHead>Company</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>License Number</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((company) => (
                <TableRow key={company.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {company.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={company.logo} alt={company.name} className="size-9 rounded-lg object-cover" />
                      ) : (
                        <div className="flex size-9 items-center justify-center rounded-lg bg-secondary text-primary">
                          <Factory className="size-4" />
                        </div>
                      )}
                      <p className="truncate text-sm font-medium text-foreground">{company.name}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{company.address ?? "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{company.license_number ?? "—"}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1.5">
                      <Link
                        href={`/admin/medicine-company/${company.id}`}
                        className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
                        aria-label="Edit"
                      >
                        <Pencil />
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleteTarget(company)}
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
            <p className="mt-3 font-semibold text-foreground">Couldn&apos;t load companies</p>
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
              <Factory className="size-5" />
            </div>
            <p className="mt-3 font-semibold text-foreground">No medicine companies found</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Add a company first — a medicine can&apos;t be created without one.
            </p>
          </div>
        )}
          </>
        )}
      </Card>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete company?</DialogTitle>
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
