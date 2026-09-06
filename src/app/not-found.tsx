import type { Metadata } from "next";
import Link from "next/link";
import { HeartPulse, House, Stethoscope } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page Not Found | Ibnocare",
  description: "The page you're looking for doesn't exist or may have moved.",
};

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto flex min-h-[calc(100vh-4rem-14rem)] max-w-2xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6 lg:px-8">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-linear-to-br from-dark-teal via-teal to-aqua-mint text-white shadow-lg shadow-teal/20">
            <HeartPulse className="size-8" />
          </div>

          <p className="mt-6 text-sm font-semibold tracking-[0.2em] text-primary uppercase">Error 404</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            This page flatlined
          </h1>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">
            We couldn&apos;t find the page you&apos;re looking for. It may have been moved, renamed, or never
            existed.
          </p>

          {/* A flatline that recovers into a heartbeat — echoes the pulse
              accent in the logo mark, tying the empty state back to the
              brand instead of a generic error graphic. */}
          <svg
            className="mt-8 w-full max-w-xs text-primary/40"
            height="48"
            viewBox="0 0 320 48"
            fill="none"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M0 24H110L122 8L136 40L148 24H320"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/" className={buttonVariants({ size: "lg" })}>
              <House />
              Back to Home
            </Link>
            <Link href="/doctors" className={buttonVariants({ variant: "outline", size: "lg" })}>
              <Stethoscope />
              Browse Doctors
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
