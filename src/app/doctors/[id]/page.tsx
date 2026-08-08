import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { DoctorProfile } from "@/components/doctors/doctor-profile";
import { doctorDisplayName, doctorTitleLine, fetchPublicDoctor } from "@/lib/public-doctors";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const doctor = await fetchPublicDoctor(id);
  if (!doctor) return { title: "Doctor Not Found | Ibnocare" };
  const name = doctorDisplayName(doctor);
  const titleLine = doctorTitleLine(doctor);
  return {
    title: `${name}${titleLine ? ` — ${titleLine}` : ""} | Ibnocare`,
    description: doctor.bio ?? `View ${name}'s profile on Ibnocare.`,
  };
}

export default async function DoctorDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const doctor = await fetchPublicDoctor(id);

  if (!doctor) notFound();

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/doctors"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
            Back to all doctors
          </Link>

          <div className="mt-6">
            <DoctorProfile doctor={doctor} />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
