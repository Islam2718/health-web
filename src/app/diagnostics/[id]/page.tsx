import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { DiagnosticProfile } from "@/components/diagnostics/diagnostic-profile";
import { getDiagnosticCenterById, diagnosticCenters } from "@/lib/diagnostics-data";

export function generateStaticParams() {
  return diagnosticCenters.map((center) => ({ id: center.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const center = getDiagnosticCenterById(id);
  if (!center) return { title: "Diagnostic Centre Not Found | Ibnocare" };
  return {
    title: `${center.name} | Ibnocare`,
    description: center.description,
  };
}

export default async function DiagnosticDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const center = getDiagnosticCenterById(id);

  if (!center) notFound();

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/diagnostics"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
            Back to all diagnostic centres
          </Link>

          <div className="mt-6">
            <DiagnosticProfile center={center} />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
