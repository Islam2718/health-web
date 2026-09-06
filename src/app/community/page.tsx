import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PostDirectory } from "@/components/community/post-directory";

export const metadata: Metadata = {
  title: "Community | Ibnocare",
  description: "Patients share problems and solutions, doctors share advice and health tips — browse the Ibnocare community.",
};

export default function CommunityPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border/60 bg-secondary/30 px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl text-center">
            <p className="text-sm font-semibold tracking-wider text-primary uppercase">Community</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Health problems, solutions, and tips
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Patients share what they&apos;re going through, doctors share advice and health tips — browse, comment,
              and rate what helped.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <PostDirectory />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
