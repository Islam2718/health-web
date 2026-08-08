import type { Metadata } from "next";
import { PhoneCall, Siren } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AmbulanceDirectory } from "@/components/ambulances/ambulance-directory";

export const metadata: Metadata = {
  title: "Emergency Ambulance | Ibnocare",
  description:
    "Find the nearest available ambulance, see driver and vehicle details, and request emergency transport in seconds on Ibnocare.",
};

export default function AmbulancesPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border/60 bg-linear-to-br from-dark-teal via-teal to-aqua-mint px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
              <Siren className="size-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Emergency? Request an ambulance now
            </h1>
            <p className="max-w-xl text-white/85">
              See real-time availability, driver details, and vehicle
              equipment before you request — or call our emergency hotline
              directly.
            </p>
            <a
              href="tel:999"
              className="mt-2 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-dark-teal shadow-lg transition-transform hover:-translate-y-0.5"
            >
              <PhoneCall className="size-4" />
              Call Emergency Hotline · 999
            </a>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <AmbulanceDirectory />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
