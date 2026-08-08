"use client";

import { motion } from "motion/react";
import { stats } from "@/lib/mock-data";

export function Stats() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 gap-6 rounded-3xl bg-primary px-8 py-12 text-primary-foreground sm:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="text-center"
          >
            <p className="text-3xl font-bold sm:text-4xl">{stat.value}</p>
            <p className="mt-1 text-sm text-primary-foreground/80">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
