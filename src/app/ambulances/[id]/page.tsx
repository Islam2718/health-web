import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AmbulanceProfile } from "@/components/ambulances/ambulance-profile";
import { ambulanceTypeLabel, fetchPublicAmbulance } from "@/lib/ambulances";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const ambulance = await fetchPublicAmbulance(id);
  if (!ambulance) return { title: "Ambulance Not Found | Ibnocare" };
  const name = ambulance.brand_model || "Ambulance";
  const typeLabel = ambulanceTypeLabel(ambulance.ambulance_type);
  return {
    title: `${name}${typeLabel ? ` — ${typeLabel}` : ""} | Ibnocare`,
    description: ambulance.description ?? `View this ambulance's details on Ibnocare.`,
  };
}

export default async function AmbulanceDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ambulance = await fetchPublicAmbulance(id);

  if (!ambulance) notFound();

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/ambulances"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
            Back to all ambulances
          </Link>

          <div className="mt-6">
            <AmbulanceProfile ambulance={ambulance} />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
