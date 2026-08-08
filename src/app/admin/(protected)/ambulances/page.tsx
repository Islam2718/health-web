"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Ambulance as AmbulanceIcon, Pencil, Plus, Search, Trash2 } from "lucide-react";
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
import { ambulances, type Ambulance } from "@/lib/ambulances-data";
import { toast } from "sonner";

const statusVariant: Record<Ambulance["status"], "default" | "secondary"> = {
  "Available Now": "default",
  "En Route": "secondary",
  "On Duty": "secondary",
};

export default function AdminAmbulancesPage() {
  const { items, remove } = useAdminResource<Ambulance>("admin_ambulances", ambulances);
  const [query, setQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Ambulance | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((a) => !q || a.provider.toLowerCase().includes(q) || a.driver.name.toLowerCase().includes(q));
  }, [items, query]);

  return (
    <div className="mx-auto max-w-7xl">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Ambulance Service</h1>
          <p className="mt-1 text-sm text-muted-foreground">{items.length} vehicles registered</p>
        </div>
        <Button render={<Link href="/admin/ambulance/new" />} nativeButton={false}>
          <Plus /> Add Ambulance
        </Button>
      </motion.div>

      <div className="mt-5 relative">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by provider or driver..." className="h-10 pl-10" />
      </div>

      <Card className="mt-5 overflow-hidden border-border/60 p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Provider</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Area</TableHead>
                <TableHead>Vehicle No.</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((ambulance) => (
                <TableRow key={ambulance.id}>
                  <TableCell>
                    <p className="text-sm font-medium text-foreground">{ambulance.provider}</p>
                    <p className="text-xs text-muted-foreground">{ambulance.type}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={ambulance.driver.photo} alt={ambulance.driver.name} className="size-8 rounded-full object-cover" />
                      <span className="text-sm text-foreground">{ambulance.driver.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{ambulance.area}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{ambulance.vehicleNumber}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[ambulance.status]}>{ambulance.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1.5">
                      <Link href={`/admin/ambulance/${ambulance.id}`} className={buttonVariants({ variant: "ghost", size: "icon-sm" })} aria-label="Edit">
                        <Pencil />
                      </Link>
                      <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-destructive" onClick={() => setDeleteTarget(ambulance)} aria-label="Delete">
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
              <AmbulanceIcon className="size-5" />
            </div>
            <p className="mt-3 font-semibold text-foreground">No ambulances found</p>
          </div>
        )}
      </Card>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete ambulance?</DialogTitle>
            <DialogDescription>
              This will remove <strong>{deleteTarget?.vehicleNumber}</strong>. This can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { if (deleteTarget) { remove(deleteTarget.id); toast.success("Ambulance removed"); } setDeleteTarget(null); }}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
