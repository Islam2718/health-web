"use client";

import { useMemo, useState } from "react";
import { AnimatePresence } from "motion/react";
import { FlaskConical, MapPin, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { diagnosticAreas, diagnosticCenters } from "@/lib/diagnostics-data";
import { DiagnosticCard } from "@/components/diagnostics/diagnostic-card";

export function DiagnosticDirectory() {
  const [query, setQuery] = useState("");
  const [area, setArea] = useState("All Areas");

  const filtered = useMemo(() => {
    return diagnosticCenters.filter((center) => {
      const matchesArea = area === "All Areas" || center.area === area;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        center.name.toLowerCase().includes(q) ||
        center.type.toLowerCase().includes(q) ||
        center.categories.some((c) => c.toLowerCase().includes(q)) ||
        center.tests.some((t) => t.name.toLowerCase().includes(q));
      return matchesArea && matchesQuery;
    });
  }, [query, area]);

  return (
    <div>
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by centre name, category, or test..."
          className="h-11 pl-10"
        />
      </div>

      <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-2">
        <MapPin className="mr-1 size-4 shrink-0 text-muted-foreground" />
        {diagnosticAreas.map((a) => (
          <button
            key={a}
            onClick={() => setArea(a)}
            className={
              "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors " +
              (area === a
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground")
            }
          >
            {a}
          </button>
        ))}
      </div>

      <p className="mt-5 text-sm text-muted-foreground">
        {filtered.length} centre{filtered.length !== 1 ? "s" : ""} found
      </p>

      <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((center, i) => (
            <DiagnosticCard key={center.id} center={center} index={i} />
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="mt-16 flex flex-col items-center justify-center text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-primary">
            <FlaskConical className="size-6" />
          </div>
          <p className="mt-4 font-semibold text-foreground">No diagnostic centres found</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Try a different search term or choose another area.
          </p>
        </div>
      )}
    </div>
  );
}
