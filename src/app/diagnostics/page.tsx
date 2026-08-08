import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { DiagnosticDirectory } from "@/components/diagnostics/diagnostic-directory";

export const metadata: Metadata = {
  title: "Diagnostic Centres | Ibnocare",
  description:
    "Search diagnostic and pathology centres by area, compare tests and prices, and get digital reports on Ibnocare.",
};

export default function DiagnosticsPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border/60 bg-secondary/30 px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              Lab tests & imaging
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Find a diagnostic centre near you
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Filter by area, compare tests and prices, and get digital
              reports delivered straight to your dashboard.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <DiagnosticDirectory />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
