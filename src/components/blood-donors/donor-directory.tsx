"use client";

import { useMemo, useState } from "react";
import { AnimatePresence } from "motion/react";
import { Droplet, MapPin, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { bloodDonors, bloodGroups, donorAreas, getAvailability } from "@/lib/blood-donors-data";
import { DonorCard } from "@/components/blood-donors/donor-card";

export function DonorDirectory() {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("All");
  const [area, setArea] = useState("All Areas");
  const [availableOnly, setAvailableOnly] = useState(false);

  const filtered = useMemo(() => {
    return bloodDonors.filter((donor) => {
      const matchesGroup = group === "All" || donor.bloodGroup === group;
      const matchesArea = area === "All Areas" || donor.area === area;
      const matchesAvailability = !availableOnly || getAvailability(donor.lastDonation).available;
      const q = query.trim().toLowerCase();
      const matchesQuery = !q || donor.name.toLowerCase().includes(q) || donor.area.toLowerCase().includes(q);
      return matchesGroup && matchesArea && matchesAvailability && matchesQuery;
    });
  }, [query, group, area, availableOnly]);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by donor name or area..."
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
          <Droplet className="size-4" />
          Available Now Only
        </button>
      </div>

      <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-2">
        <Droplet className="mr-1 size-4 shrink-0 text-muted-foreground" />
        {bloodGroups.map((g) => (
          <button
            key={g}
            onClick={() => setGroup(g)}
            className={
              "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors " +
              (group === g
                ? "border-destructive bg-destructive text-white"
                : "border-border bg-background text-muted-foreground hover:border-destructive/40 hover:text-foreground")
            }
          >
            {g}
          </button>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-2">
        <MapPin className="mr-1 size-4 shrink-0 text-muted-foreground" />
        {donorAreas.map((a) => (
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
        {filtered.length} donor{filtered.length !== 1 ? "s" : ""} found
      </p>

      <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((donor, i) => (
            <DonorCard key={donor.id} donor={donor} index={i} />
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="mt-16 flex flex-col items-center justify-center text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-primary">
            <Droplet className="size-6" />
          </div>
          <p className="mt-4 font-semibold text-foreground">No donors found</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Try a different blood group, area, or search term.
          </p>
        </div>
      )}
    </div>
  );
}
