"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence } from "motion/react";
import { Ambulance as AmbulanceIcon, RefreshCw, Search, SlidersHorizontal, WifiOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AmbulanceCard } from "@/components/ambulances/ambulance-card";
import { AMBULANCE_TYPE_OPTIONS, fetchPublicAmbulances, type PublicAmbulanceRecord } from "@/lib/ambulances";

const TYPE_FILTERS = ["All", ...AMBULANCE_TYPE_OPTIONS.map((t) => t.value)];

export function AmbulanceDirectory() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("All");
  const [ambulances, setAmbulances] = useState<PublicAmbulanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchPublicAmbulances().then(({ ambulances: results, failed }) => {
      if (cancelled) return;
      setAmbulances(results);
      setLoadFailed(failed);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [retryToken]);

  const retry = useCallback(() => setRetryToken((n) => n + 1), []);

  const filtered = ambulances.filter((a) => {
    const matchesType = type === "All" || a.ambulance_type === type;
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q ||
      (a.brand_model ?? "").toLowerCase().includes(q) ||
      a.owner.name.toLowerCase().includes(q) ||
      (a.address ?? "").toLowerCase().includes(q);
    return matchesType && matchesQuery;
  });

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by vehicle, owner, or address..."
            className="h-11 pl-10"
          />
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-2">
        <SlidersHorizontal className="mr-1 size-4 shrink-0 text-muted-foreground" />
        {TYPE_FILTERS.map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={
              "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors " +
              (type === t
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground")
            }
          >
            {t === "All" ? "All" : AMBULANCE_TYPE_OPTIONS.find((o) => o.value === t)?.label}
          </button>
        ))}
      </div>

      <p className="mt-5 text-sm text-muted-foreground">
        {loading ? "Searching..." : `${filtered.length} ambulance${filtered.length !== 1 ? "s" : ""} found`}
      </p>

      <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((ambulance, i) => (
            <AmbulanceCard key={ambulance.id} ambulance={ambulance} index={i} />
          ))}
        </AnimatePresence>
      </div>

      {!loading && filtered.length === 0 && loadFailed && (
        <div className="mt-16 flex flex-col items-center justify-center text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <WifiOff className="size-6" />
          </div>
          <p className="mt-4 font-semibold text-foreground">Couldn&apos;t load ambulances</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            We couldn&apos;t reach the server. Check your connection and try again.
          </p>
          <Button variant="outline" size="sm" className="mt-4" onClick={retry}>
            <RefreshCw />
            Retry
          </Button>
        </div>
      )}

      {!loading && filtered.length === 0 && !loadFailed && (
        <div className="mt-16 flex flex-col items-center justify-center text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-primary">
            <AmbulanceIcon className="size-6" />
          </div>
          <p className="mt-4 font-semibold text-foreground">No ambulances found</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Try a different search term or vehicle type.
          </p>
        </div>
      )}
    </div>
  );
}
