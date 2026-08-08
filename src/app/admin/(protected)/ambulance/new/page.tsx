"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { AmbulanceForm } from "@/components/admin/ambulances/ambulance-form";

export default function NewAmbulancePage() {
  return (
    <div>
      <Link href="/admin/ambulances" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" />
        Back to ambulances
      </Link>
      <div className="mx-auto mb-6 max-w-3xl">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Add Ambulance</h1>
        <p className="mt-1 text-sm text-muted-foreground">Register a new ambulance and driver.</p>
      </div>
      <AmbulanceForm />
    </div>
  );
}
