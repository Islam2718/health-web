import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { HospitalProfile } from "@/components/hospitals/hospital-profile";
import { getHospitalById, hospitals } from "@/lib/hospitals-data";

export function generateStaticParams() {
  return hospitals.map((hospital) => ({ id: hospital.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const hospital = getHospitalById(id);
  if (!hospital) return { title: "Hospital Not Found | Ibnocare" };
  return {
    title: `${hospital.name} | Ibnocare`,
    description: hospital.description,
  };
}

export default async function HospitalDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const hospital = getHospitalById(id);

  if (!hospital) notFound();

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/hospitals"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
            Back to all hospitals
          </Link>

          <div className="mt-6">
            <HospitalProfile hospital={hospital} />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
