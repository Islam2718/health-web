"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { PatientForm } from "@/components/admin/patients/patient-form";

export default function EditPatientPage() {
  const params = useParams<{ id: string }>();
  return (
    <div>
      <Link href="/admin/patients" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" />
        Back to patients
      </Link>
      <div className="mx-auto mb-6 max-w-3xl">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Edit Patient</h1>
        <p className="mt-1 text-sm text-muted-foreground">Update this patient&apos;s record.</p>
      </div>
      <PatientForm patientId={params.id} />
    </div>
  );
}
