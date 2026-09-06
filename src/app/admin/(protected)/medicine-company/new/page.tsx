"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { MedicineCompanyForm } from "@/components/admin/medicine-companies/medicine-company-form";

export default function NewMedicineCompanyPage() {
  return (
    <div>
      <Link href="/admin/medicine-companies" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" />
        Back to medicine companies
      </Link>
      <div className="mx-auto mb-6 max-w-2xl">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Add Medicine Company</h1>
        <p className="mt-1 text-sm text-muted-foreground">Register a new medicine manufacturer.</p>
      </div>
      <MedicineCompanyForm />
    </div>
  );
}
