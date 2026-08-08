"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { HospitalForm } from "@/components/admin/hospitals/hospital-form";

export default function EditHospitalPage() {
  const params = useParams<{ id: string }>();
  return (
    <div>
      <Link href="/admin/hospitals" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" />
        Back to hospitals
      </Link>
      <div className="mx-auto mb-6 max-w-3xl">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Edit Hospital</h1>
        <p className="mt-1 text-sm text-muted-foreground">Update this hospital&apos;s details.</p>
      </div>
      <HospitalForm hospitalId={params.id} />
    </div>
  );
}
