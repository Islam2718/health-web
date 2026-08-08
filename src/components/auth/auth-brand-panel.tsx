"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  CalendarCheck,
  Droplet,
  HeartPulse,
  Pill,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

const bullets = [
  { icon: CalendarCheck, text: "Doctor appointments, booked in minutes" },
  { icon: Droplet, text: "Find verified blood donors near you, instantly" },
  { icon: Sparkles, text: "One simple solution for your family's whole care journey" },
];

const floatingIcons = [
  { icon: Stethoscope, top: "18%", left: "78%", duration: 9, delay: 0 },
  { icon: Pill, top: "68%", left: "82%", duration: 11, delay: 0.6 },
  { icon: HeartPulse, top: "78%", left: "20%", duration: 10, delay: 1.2 },
  { icon: ShieldCheck, top: "12%", left: "14%", duration: 12, delay: 0.3 },
];

export function AuthBrandPanel({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative hidden overflow-hidden bg-linear-to-br from-dark-teal via-teal to-aqua-mint px-10 py-12 lg:flex lg:flex-col lg:justify-between",
        className
      )}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute -top-24 -right-24 size-80 rounded-full bg-happy-sky/30 blur-3xl"
          animate={{ x: [0, 20, -10, 0], y: [0, 15, -15, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 left-0 size-72 rounded-full bg-robins-blue/20 blur-3xl"
          animate={{ x: [0, -15, 10, 0], y: [0, -10, 10, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />

        {floatingIcons.map((f, i) => (
          <motion.div
            key={i}
            className="absolute text-white/15"
            style={{ top: f.top, left: f.left }}
            animate={{ y: [0, -16, 0], rotate: [0, 8, 0] }}
            transition={{ duration: f.duration, repeat: Infinity, ease: "easeInOut", delay: f.delay }}
          >
            <f.icon className="size-14" />
          </motion.div>
        ))}

        <svg
          className="absolute top-1/2 left-0 w-full -translate-y-1/2 opacity-[0.12]"
          height="80"
          viewBox="0 0 600 80"
          fill="none"
          preserveAspectRatio="none"
        >
          <motion.path
            d="M0 40 H210 L225 10 L240 70 L255 40 H350 L365 15 L380 65 L395 40 H600"
            stroke="white"
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

      <Link href="/" className="relative w-fit">
        <Logo className="[&_span]:text-white [&_span:last-child]:text-white/80" />
      </Link>

      <div className="relative">
        <h2 className="max-w-sm text-3xl font-bold leading-tight text-white">
          Healthcare, connected and cared for.
        </h2>
        <div className="mt-8 space-y-4">
          {bullets.map((b) => (
            <div key={b.text} className="flex items-center gap-3 text-white/90">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/15">
                <b.icon className="size-4.5" />
              </div>
              <p className="text-sm">{b.text}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="relative text-xs text-white/60">
        © {new Date().getFullYear()} Ibnocare. All rights reserved.
      </p>
    </div>
  );
}
