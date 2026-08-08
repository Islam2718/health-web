import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PharmacyDirectory } from "@/components/pharmacy/pharmacy-directory";

export const metadata: Metadata = {
  title: "Medical Store & Pharmacy | Ibnocare",
  description:
    "Search medical stores and pharmacies by area, browse medicines, and order with fast delivery on Ibnocare.",
};

export default function MedicalStorePage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border/60 bg-secondary/30 px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              Medicines, delivered
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Find a medical store near you
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Filter by area, browse medicines and prices, and order online
              with doorstep or in-store pickup.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <PharmacyDirectory />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
