"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence } from "motion/react";
import { Droplet, RefreshCw, Search, WifiOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DonorCard } from "@/components/blood-donors/donor-card";
import { fetchPublicBloodDonors, type PublicBloodDonor } from "@/lib/blood-donor";

const bloodGroups = ["All", "A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

export function DonorDirectory() {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("All");
  const [donors, setDonors] = useState<PublicBloodDonor[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchPublicBloodDonors().then(({ donors: results, failed }) => {
      if (cancelled) return;
      setDonors(results);
      setLoadFailed(failed);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [retryToken]);

  const retry = useCallback(() => setRetryToken((n) => n + 1), []);

  const filtered = donors.filter((donor) => {
    const matchesGroup = group === "All" || donor.blood_group === group;
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q || donor.name.toLowerCase().includes(q) || (donor.address ?? "").toLowerCase().includes(q);
    return matchesGroup && matchesQuery;
  });

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by donor name or address..."
            className="h-11 pl-10"
          />
        </div>
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

      <p className="mt-5 text-sm text-muted-foreground">
        {loading ? "Searching..." : `${filtered.length} donor${filtered.length !== 1 ? "s" : ""} found`}
      </p>

      <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((donor, i) => (
            <DonorCard key={donor.id} donor={donor} index={i} />
          ))}
        </AnimatePresence>
      </div>

      {!loading && filtered.length === 0 && loadFailed && (
        <div className="mt-16 flex flex-col items-center justify-center text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <WifiOff className="size-6" />
          </div>
          <p className="mt-4 font-semibold text-foreground">Couldn&apos;t load donors</p>
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
            <Droplet className="size-6" />
          </div>
          <p className="mt-4 font-semibold text-foreground">No donors found</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Try a different blood group or search term.
          </p>
        </div>
      )}
    </div>
  );
}
