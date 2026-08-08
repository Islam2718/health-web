"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Pencil, Plus, Search, Trash2, UserRound } from "lucide-react";
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
import { patients, type Patient } from "@/lib/patients-data";
import { doctors } from "@/lib/doctors-data";
import { toast } from "sonner";

export default function AdminPatientsPage() {
  const { items, remove } = useAdminResource<Patient>("admin_patients", patients);
  const [query, setQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Patient | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((p) => !q || p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q));
  }, [items, query]);

  const doctorName = (id?: string) => doctors.find((d) => d.id === id)?.name ?? "—";

  return (
    <div className="mx-auto max-w-7xl">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Patients</h1>
          <p className="mt-1 text-sm text-muted-foreground">{items.length} patients registered</p>
        </div>
        <Button render={<Link href="/admin/patient/new" />} nativeButton={false}>
          <Plus /> Add Patient
        </Button>
      </motion.div>

      <div className="mt-5 relative">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or email..." className="h-10 pl-10" />
      </div>

      <Card className="mt-5 overflow-hidden border-border/60 p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Age / Gender</TableHead>
                <TableHead>Blood Group</TableHead>
                <TableHead>Assigned Doctor</TableHead>
                <TableHead>Last Visit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell>
                    <p className="text-sm font-medium text-foreground">{patient.name}</p>
                    <p className="text-xs text-muted-foreground">{patient.email}</p>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{patient.age} · {patient.gender}</TableCell>
                  <TableCell className="text-sm text-foreground">{patient.bloodGroup}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{doctorName(patient.assignedDoctorId)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{patient.lastVisit}</TableCell>
                  <TableCell>
                    <Badge variant={patient.status === "Active" ? "default" : "secondary"}>{patient.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1.5">
                      <Link href={`/admin/patient/${patient.id}`} className={buttonVariants({ variant: "ghost", size: "icon-sm" })} aria-label="Edit">
                        <Pencil />
                      </Link>
                      <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-destructive" onClick={() => setDeleteTarget(patient)} aria-label="Delete">
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
              <UserRound className="size-5" />
            </div>
            <p className="mt-3 font-semibold text-foreground">No patients found</p>
          </div>
        )}
      </Card>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete patient?</DialogTitle>
            <DialogDescription>
              This will remove <strong>{deleteTarget?.name}</strong> from the directory. This can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { if (deleteTarget) { remove(deleteTarget.id); toast.success("Patient removed"); } setDeleteTarget(null); }}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
