import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { DoctorDirectory } from "@/components/doctors/doctor-directory";
import { fetchPublicDoctors } from "@/lib/public-doctors";

export const metadata: Metadata = {
  title: "Find a Doctor | Ibnocare",
  description: "Search registered doctors by specialty and view their profiles on Ibnocare.",
};

// The hero's doctor count is fetched at render time — without this the page
// would statically bake in whatever count existed at the last build.
export const revalidate = 300;

export default async function DoctorsPage() {
  const { meta } = await fetchPublicDoctors({ per_page: 1 });
  const total = meta?.total ?? 0;

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border/60 bg-secondary/30 px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              {total > 0 ? `${total}+ registered doctors` : "Find the right doctor"}
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Find & book the right doctor
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Search by specialty and view registered doctor profiles on Ibnocare.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <DoctorDirectory />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
