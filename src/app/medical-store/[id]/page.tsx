import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PharmacyProfile } from "@/components/pharmacy/pharmacy-profile";
import { getMedicalStoreById, medicalStores } from "@/lib/pharmacy-data";

export function generateStaticParams() {
  return medicalStores.map((store) => ({ id: store.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const store = getMedicalStoreById(id);
  if (!store) return { title: "Store Not Found | Ibnocare" };
  return {
    title: `${store.name} | Ibnocare`,
    description: store.description,
  };
}

export default async function MedicalStoreDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const store = getMedicalStoreById(id);

  if (!store) notFound();

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/medical-store"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
            Back to all medical stores
          </Link>

          <div className="mt-6">
            <PharmacyProfile store={store} />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
