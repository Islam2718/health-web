"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { MedicineForm } from "@/components/admin/medicines/medicine-form";

export default function EditMedicinePage() {
  const params = useParams<{ id: string }>();
  return (
    <div>
      <Link href="/admin/medicines" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" />
        Back to medicines
      </Link>
      <div className="mx-auto mb-6 max-w-2xl">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Edit Medicine</h1>
        <p className="mt-1 text-sm text-muted-foreground">Update this medicine&apos;s details.</p>
      </div>
      <MedicineForm medicineId={params.id} />
    </div>
  );
}
