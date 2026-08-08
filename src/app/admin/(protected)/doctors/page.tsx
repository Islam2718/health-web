"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { BadgeCheck, Pencil, Plus, Search, Stethoscope, Trash2 } from "lucide-react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAdminResource } from "@/hooks/use-admin-resource";
import { doctors, specialties, type Doctor } from "@/lib/doctors-data";
import { toast } from "sonner";

export default function AdminDoctorsPage() {
  const { items, remove } = useAdminResource<Doctor>("admin_doctors", doctors);
  const [query, setQuery] = useState("");
  const [specialty, setSpecialty] = useState("All");
  const [deleteTarget, setDeleteTarget] = useState<Doctor | null>(null);

  const filtered = useMemo(() => {
    return items.filter((d) => {
      const matchesSpecialty = specialty === "All" || d.specialty === specialty;
      const q = query.trim().toLowerCase();
      const matchesQuery = !q || d.name.toLowerCase().includes(q) || d.chamber.hospital.toLowerCase().includes(q);
      return matchesSpecialty && matchesQuery;
    });
  }, [items, query, specialty]);

  return (
    <div className="mx-auto max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Doctors</h1>
          <p className="mt-1 text-sm text-muted-foreground">{items.length} doctors registered</p>
        </div>
        <Button render={<Link href="/admin/doctor/new" />} nativeButton={false}>
          <Plus /> Add Doctor
        </Button>
      </motion.div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or hospital..." className="h-10 pl-10" />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-2">
        {specialties.map((s) => (
          <button
            key={s}
            onClick={() => setSpecialty(s)}
            className={
              "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors " +
              (specialty === s
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground")
            }
          >
            {s}
          </button>
        ))}
      </div>

      <Card className="mt-5 overflow-hidden border-border/60 p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Doctor</TableHead>
                <TableHead>Specialty</TableHead>
                <TableHead>Chamber</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((doctor) => (
                <TableRow key={doctor.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={doctor.photo} alt={doctor.name} className="size-9 rounded-full object-cover" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <p className="truncate text-sm font-medium text-foreground">{doctor.name}</p>
                          {doctor.verified && <BadgeCheck className="size-3.5 shrink-0 text-primary" />}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{doctor.specialty}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{doctor.chamber.hospital}</TableCell>
                  <TableCell className="text-sm text-foreground">৳{doctor.fee}</TableCell>
                  <TableCell className="text-sm text-foreground">{doctor.rating || "—"}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1.5">
                      <Link
                        href={`/admin/doctor/${doctor.id}`}
                        className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
                        aria-label="Edit"
                      >
                        <Pencil />
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleteTarget(doctor)}
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

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-primary">
              <Stethoscope className="size-5" />
            </div>
            <p className="mt-3 font-semibold text-foreground">No doctors found</p>
            <p className="mt-1 text-sm text-muted-foreground">Try a different search or specialty.</p>
          </div>
        )}
      </Card>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete doctor?</DialogTitle>
            <DialogDescription>
              This will remove <strong>{deleteTarget?.name}</strong> from the directory. This can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteTarget) {
                  remove(deleteTarget.id);
                  toast.success("Doctor removed");
                }
                setDeleteTarget(null);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
