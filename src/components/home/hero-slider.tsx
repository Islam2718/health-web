"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Sparkles } from "lucide-react";
import { providerSlides } from "@/lib/mock-data";

const SLIDE_DURATION = 4200;

export function HeroSlider() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((i: number) => {
    setIndex(i);
  }, []);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % providerSlides.length);
    }, SLIDE_DURATION);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused]);

  const slide = providerSlides[index];

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative h-[440px] overflow-hidden rounded-3xl bg-linear-to-br from-dark-teal via-teal to-aqua-mint shadow-xl shadow-teal/20">
        {/* ambient decorative shapes, constant across slides */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-10 -right-10 size-56 rounded-full bg-white/10 blur-2xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-0 size-40 rounded-full bg-white/10 blur-2xl"
        />

        <div className="absolute top-5 left-6 z-10 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
          <Sparkles className="size-3.5" />
          For Providers
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -32 }}
            transition={{ duration: 0.45, ease: "easeInOut" }}
            className="absolute inset-0 flex flex-col justify-center px-8 pt-8 sm:px-10"
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="flex size-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm"
            >
              <slide.icon className="size-8 text-white" />
            </motion.div>

            <h3 className="mt-5 text-2xl font-bold text-white">{slide.category}</h3>
            <p className="mt-1 text-sm font-medium text-white/90">{slide.headline}</p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/75">
              {slide.description}
            </p>

            <div className="mt-6 flex items-center gap-6">
              <div>
                <p className="text-xl font-bold text-white">{slide.stat.value}</p>
                <p className="text-xs text-white/70">{slide.stat.label}</p>
              </div>
              <a
                href="#"
                className="group inline-flex items-center gap-1.5 text-sm font-semibold text-white underline-offset-4 hover:underline"
              >
                Create Profile
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* dot indicators */}
      <div className="mt-4 flex items-center justify-center gap-2">
        {providerSlides.map((s, i) => (
          <button
            key={s.category}
            aria-label={`Show ${s.category}`}
            onClick={() => goTo(i)}
            className={
              "h-1.5 rounded-full transition-all " +
              (i === index ? "w-7 bg-primary" : "w-1.5 bg-border hover:bg-muted-foreground/40")
            }
          />
        ))}
      </div>
    </div>
  );
}
