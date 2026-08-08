"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PharmacyForm } from "@/components/admin/pharmacy/pharmacy-form";

export default function NewMedicalStorePage() {
  return (
    <div>
      <Link href="/admin/medical-stores" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" />
        Back to medical stores
      </Link>
      <div className="mx-auto mb-6 max-w-3xl">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Add Medical Store</h1>
        <p className="mt-1 text-sm text-muted-foreground">Register a new pharmacy.</p>
      </div>
      <PharmacyForm />
    </div>
  );
}
