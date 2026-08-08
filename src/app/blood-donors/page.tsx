import type { Metadata } from "next";
import { Droplet } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { DonorDirectory } from "@/components/blood-donors/donor-directory";

export const metadata: Metadata = {
  title: "Blood Donors | Ibnocare",
  description:
    "Find blood donors by group and location, and see real-time 90-day donation eligibility on Ibnocare.",
};

export default function BloodDonorsPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border/60 bg-linear-to-br from-destructive/90 to-dark-teal px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
              <Droplet className="size-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Find a blood donor near you
            </h1>
            <p className="max-w-xl text-white/85">
              Search by blood group and area, and see who&apos;s eligible to
              donate — donors need a 90-day gap between donations.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <DonorDirectory />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
