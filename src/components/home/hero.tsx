"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, CalendarCheck, ShieldCheck, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroSlider } from "@/components/home/hero-slider";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Live animated background */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute -top-32 -right-32 size-96 rounded-full bg-happy-sky/30 blur-3xl"
          animate={{ x: [0, 30, -10, 0], y: [0, 20, -20, 0], scale: [1, 1.08, 0.96, 1] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-40 -left-40 size-96 rounded-full bg-aqua-mint/20 blur-3xl"
          animate={{ x: [0, -20, 15, 0], y: [0, -25, 15, 0], scale: [1, 0.94, 1.06, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 size-72 rounded-full bg-robins-blue/25 blur-3xl"
          animate={{ x: [0, 15, -25, 0], y: [0, -15, 10, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />

        {/* traveling pulse line */}
        <svg
          className="absolute top-1/2 left-0 w-full -translate-y-1/2 opacity-[0.15]"
          height="80"
          viewBox="0 0 1200 80"
          fill="none"
          preserveAspectRatio="none"
        >
          <motion.path
            d="M0 40 H420 L450 10 L480 70 L510 40 H700 L730 15 L760 65 L790 40 H1200"
            stroke="var(--teal)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            initial={{ pathLength: 0, pathOffset: 0 }}
            animate={{ pathLength: [0, 1], pathOffset: [0, 1] }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          />
        </svg>
      </div>

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:py-28 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3.5 py-1.5 text-xs font-medium text-secondary-foreground">
            <span className="size-1.5 rounded-full bg-primary" />
            One platform for patients, doctors & hospitals
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Healthcare, connected and
            <span className="text-primary"> cared for.</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Ibnocare brings doctors, hospitals, diagnostic labs, pharmacies, and
            emergency ambulance services onto a single, secure platform — so
            every patient gets timely, coordinated care.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              className="group"
              nativeButton={false}
              render={<Link href="/doctors" />}
            >
              <CalendarCheck />
              Book an Appointment
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button size="lg" variant="outline">
              <Stethoscope />
              I&apos;m a Doctor / Hospital
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" />
              Secure & role-based access
            </div>
            <div className="flex items-center gap-2">
              <CalendarCheck className="size-4 text-primary" />
              Instant appointment booking
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
        >
          <HeroSlider />
        </motion.div>
      </div>
    </section>
  );
}
