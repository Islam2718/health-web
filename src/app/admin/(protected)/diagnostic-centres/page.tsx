"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { FlaskConical, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAdminResource } from "@/hooks/use-admin-resource";
import { diagnosticCenters, type DiagnosticCenter } from "@/lib/diagnostics-data";
import { toast } from "sonner";

export default function AdminDiagnosticsPage() {
  const { items, remove } = useAdminResource<DiagnosticCenter>("admin_diagnostics", diagnosticCenters);
  const [query, setQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<DiagnosticCenter | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((c) => !q || c.name.toLowerCase().includes(q) || c.area.toLowerCase().includes(q));
  }, [items, query]);

  return (
    <div className="mx-auto max-w-7xl">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Diagnostic Centres</h1>
          <p className="mt-1 text-sm text-muted-foreground">{items.length} centres onboard</p>
        </div>
        <Button render={<Link href="/admin/diagnostic-centre/new" />} nativeButton={false}>
          <Plus /> Add Centre
        </Button>
      </motion.div>

      <div className="mt-5 relative">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or area..." className="h-10 pl-10" />
      </div>

      <Card className="mt-5 overflow-hidden border-border/60 p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Centre</TableHead>
                <TableHead>Area</TableHead>
                <TableHead>Report Delivery</TableHead>
                <TableHead>Home Sample</TableHead>
                <TableHead>Tests</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((center) => (
                <TableRow key={center.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={center.image} alt={center.name} className="size-10 rounded-lg object-cover" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{center.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{center.type}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{center.area}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{center.reportDelivery}</TableCell>
                  <TableCell>
                    <Badge variant={center.homeSampleCollection ? "default" : "secondary"}>
                      {center.homeSampleCollection ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-foreground">{center.tests.length}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1.5">
                      <Link href={`/admin/diagnostic-centre/${center.id}`} className={buttonVariants({ variant: "ghost", size: "icon-sm" })} aria-label="Edit">
                        <Pencil />
                      </Link>
                      <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-destructive" onClick={() => setDeleteTarget(center)} aria-label="Delete">
                        <Trash2 />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-primary">
              <FlaskConical className="size-5" />
            </div>
            <p className="mt-3 font-semibold text-foreground">No diagnostic centres found</p>
          </div>
        )}
      </Card>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete diagnostic centre?</DialogTitle>
            <DialogDescription>
              This will remove <strong>{deleteTarget?.name}</strong>. This can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { if (deleteTarget) { remove(deleteTarget.id); toast.success("Diagnostic centre removed"); } setDeleteTarget(null); }}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
