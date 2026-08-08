"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Home, MapPin, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import type { DiagnosticCenter } from "@/lib/diagnostics-data";

export function DiagnosticCard({
  center,
  index = 0,
}: {
  center: DiagnosticCenter;
  index?: number;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, delay: (index % 6) * 0.05 }}
    >
      <Link href={`/diagnostics/${center.id}`}>
        <Card className="group h-full overflow-hidden border-border/60 p-0 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-teal/10">
          <div className="relative h-36 w-full overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={center.image}
              alt={center.name}
              className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/50 to-transparent" />
            {center.homeSampleCollection && (
              <Badge className="absolute top-3 right-3 gap-1 bg-white/90 text-primary hover:bg-white/90">
                <Home className="size-3" />
                Home Sample
              </Badge>
            )}
            <p className="absolute bottom-2 left-3 text-xs font-medium text-white/90">
              {center.type}
            </p>
          </div>

          <div className="p-5">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-foreground">{center.name}</h3>
              <div className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                <Star className="size-3.5 fill-happy-sky text-happy-sky" />
                {center.rating}
              </div>
            </div>

            <div className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
              <span className="line-clamp-1">{center.address}</span>
            </div>

            <p className="mt-2 text-sm text-muted-foreground">
              Reports in <span className="font-medium text-foreground">{center.reportDelivery}</span>
            </p>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {center.categories.map((cat) => (
                <span
                  key={cat}
                  className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
                >
                  {cat}
                </span>
              ))}
            </div>

            <div
              className={buttonVariants({
                variant: "secondary",
                size: "sm",
                className: "pointer-events-none mt-4 w-full",
              })}
            >
              View Centre & Tests
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}
