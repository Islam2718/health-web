"use client";

import { useMemo, useState } from "react";
import { AnimatePresence } from "motion/react";
import { Ambulance as AmbulanceIcon, MapPin, Search, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ambulanceAreas, ambulances } from "@/lib/ambulances-data";
import { AmbulanceCard } from "@/components/ambulances/ambulance-card";

export function AmbulanceDirectory() {
  const [query, setQuery] = useState("");
  const [area, setArea] = useState("All Areas");
  const [availableOnly, setAvailableOnly] = useState(false);

  const filtered = useMemo(() => {
    return ambulances.filter((ambulance) => {
      const matchesArea = area === "All Areas" || ambulance.area === area;
      const matchesAvailability = !availableOnly || ambulance.status === "Available Now";
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        ambulance.provider.toLowerCase().includes(q) ||
        ambulance.type.toLowerCase().includes(q) ||
        ambulance.driver.name.toLowerCase().includes(q);
      return matchesArea && matchesAvailability && matchesQuery;
    });
  }, [query, area, availableOnly]);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by provider, type, or driver name..."
            className="h-11 pl-10"
          />
        </div>
        <button
          onClick={() => setAvailableOnly((v) => !v)}
          className={
            "flex h-11 shrink-0 items-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors " +
            (availableOnly
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground")
          }
        >
          <Zap className="size-4" />
          Available Now Only
        </button>
      </div>

      <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-2">
        <MapPin className="mr-1 size-4 shrink-0 text-muted-foreground" />
        {ambulanceAreas.map((a) => (
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
        {filtered.length} ambulance{filtered.length !== 1 ? "s" : ""} found
      </p>

      <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((ambulance, i) => (
            <AmbulanceCard key={ambulance.id} ambulance={ambulance} index={i} />
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="mt-16 flex flex-col items-center justify-center text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-primary">
            <AmbulanceIcon className="size-6" />
          </div>
          <p className="mt-4 font-semibold text-foreground">No ambulances found</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Try a different search term, area, or turn off the availability filter.
          </p>
        </div>
      )}
    </div>
  );
}
