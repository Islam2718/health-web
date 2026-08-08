"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { DoctorForm } from "@/components/admin/doctors/doctor-form";

export default function NewDoctorPage() {
  return (
    <div>
      <Link
        href="/admin/doctors"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Back to doctors
      </Link>
      <div className="mx-auto mb-6 max-w-4xl">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Add Doctor</h1>
        <p className="mt-1 text-sm text-muted-foreground">Create a new doctor profile.</p>
      </div>
      <DoctorForm />
    </div>
  );
}
