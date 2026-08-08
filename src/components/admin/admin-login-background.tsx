"use client";

import { motion } from "motion/react";

export function AdminLoginBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#08181c]">
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(rgba(79,186,173,0.35) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <motion.div
        className="absolute -top-40 -left-32 size-[32rem] rounded-full bg-teal/25 blur-[110px]"
        animate={{ x: [0, 40, -20, 0], y: [0, 30, -20, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/3 -right-32 size-[28rem] rounded-full bg-aqua-mint/20 blur-[110px]"
        animate={{ x: [0, -30, 20, 0], y: [0, -20, 25, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 left-1/3 size-[26rem] rounded-full bg-happy-sky/15 blur-[100px]"
        animate={{ x: [0, 25, -25, 0], y: [0, -15, 15, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute inset-x-0 h-1/3 bg-linear-to-b from-transparent via-white/5 to-transparent"
        animate={{ y: ["-30vh", "130vh"] }}
        transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
      />

      <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-[#08181c]" />
    </div>
  );
}
