"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Pencil, Pill, Plus, Search, Trash2 } from "lucide-react";
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
import { medicalStores, type MedicalStore } from "@/lib/pharmacy-data";
import { toast } from "sonner";

export default function AdminPharmaciesPage() {
  const { items, remove } = useAdminResource<MedicalStore>("admin_pharmacies", medicalStores);
  const [query, setQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<MedicalStore | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((s) => !q || s.name.toLowerCase().includes(q) || s.area.toLowerCase().includes(q));
  }, [items, query]);

  return (
    <div className="mx-auto max-w-7xl">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Medical Store</h1>
          <p className="mt-1 text-sm text-muted-foreground">{items.length} pharmacies onboard</p>
        </div>
        <Button render={<Link href="/admin/medical-store/new" />} nativeButton={false}>
          <Plus /> Add Store
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
                <TableHead>Store</TableHead>
                <TableHead>Area</TableHead>
                <TableHead>Delivery</TableHead>
                <TableHead>Medicines</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((store) => (
                <TableRow key={store.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={store.image} alt={store.name} className="size-10 rounded-lg object-cover" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{store.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{store.type}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{store.area}</TableCell>
                  <TableCell>
                    <Badge variant={store.deliveryAvailable ? "default" : "secondary"}>
                      {store.deliveryAvailable ? store.deliveryTime : "Pickup only"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-foreground">{store.medicines.length}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1.5">
                      <Link href={`/admin/medical-store/${store.id}`} className={buttonVariants({ variant: "ghost", size: "icon-sm" })} aria-label="Edit">
                        <Pencil />
                      </Link>
                      <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-destructive" onClick={() => setDeleteTarget(store)} aria-label="Delete">
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
              <Pill className="size-5" />
            </div>
            <p className="mt-3 font-semibold text-foreground">No stores found</p>
          </div>
        )}
      </Card>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete store?</DialogTitle>
            <DialogDescription>
              This will remove <strong>{deleteTarget?.name}</strong>. This can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { if (deleteTarget) { remove(deleteTarget.id); toast.success("Store removed"); } setDeleteTarget(null); }}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
