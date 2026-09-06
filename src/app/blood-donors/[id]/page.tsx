import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { DonorProfile } from "@/components/blood-donors/donor-profile";
import { fetchPublicBloodDonor } from "@/lib/blood-donor";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const donor = await fetchPublicBloodDonor(id);
  if (!donor) return { title: "Donor Not Found | Ibnocare" };
  return {
    title: `${donor.name}${donor.blood_group ? ` — ${donor.blood_group}` : ""} | Ibnocare`,
    description: `View ${donor.name}'s blood donor profile on Ibnocare.`,
  };
}

export default async function DonorDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const donor = await fetchPublicBloodDonor(id);

  if (!donor) notFound();

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/blood-donors"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
            Back to all donors
          </Link>

          <div className="mt-6">
            <DonorProfile donor={donor} />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
