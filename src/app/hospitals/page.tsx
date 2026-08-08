import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { HospitalDirectory } from "@/components/hospitals/hospital-directory";

export const metadata: Metadata = {
  title: "Find a Hospital | Ibnocare",
  description:
    "Search hospitals by area, check department coverage, live bed availability, and emergency services on Ibnocare.",
};

export default function HospitalsPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border/60 bg-secondary/30 px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              180+ partner hospitals
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Find a hospital near you
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Filter by area, compare departments and live bed availability,
              and get emergency ambulance access in one place.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <HospitalDirectory />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
