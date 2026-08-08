"use client";

import { motion } from "motion/react";
import { ArrowRight, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaBanner() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl bg-linear-to-br from-teal to-dark-teal px-8 py-16 text-center sm:px-16"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-20 -right-20 size-64 rounded-full bg-white/10 blur-3xl"
        />
        <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Ready to bring your care under one roof?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-white/80">
          Join patients, doctors, and hospitals already coordinating care on
          Ibnocare.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" variant="secondary" className="group">
            Get Started Free
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
          >
            <PhoneCall /> Talk to Sales
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
