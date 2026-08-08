"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal, UserRound } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DoctorCard } from "@/components/doctors/doctor-card";
import { commonSpecialties, fetchPublicDoctors, type PublicDoctorRecord } from "@/lib/public-doctors";

const PER_PAGE = 12;
const SPECIALTY_OPTIONS = ["All", ...commonSpecialties];

export function DoctorDirectory() {
  const [query, setQuery] = useState("");
  const [specialty, setSpecialty] = useState("All");
  const [page, setPage] = useState(1);
  const [doctors, setDoctors] = useState<PublicDoctorRecord[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Any filter change resets pagination back to page 1.
  useEffect(() => {
    setPage(1);
  }, [query, specialty]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const handle = setTimeout(async () => {
      const { doctors: results, meta } = await fetchPublicDoctors({
        search: query.trim() || undefined,
        department: specialty !== "All" ? specialty : undefined,
        per_page: PER_PAGE,
        page,
      });
      if (cancelled) return;
      setDoctors(results);
      setTotal(meta?.total ?? results.length);
      setLastPage(meta?.last_page ?? 1);
      setLoading(false);
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [query, specialty, page]);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by doctor name, title, or specialty..."
            className="h-11 pl-10"
          />
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-2">
        <SlidersHorizontal className="mr-1 size-4 shrink-0 text-muted-foreground" />
        {SPECIALTY_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setSpecialty(s)}
            className={
              "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors " +
              (specialty === s
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground")
            }
          >
            {s}
          </button>
        ))}
      </div>

      <p className="mt-5 text-sm text-muted-foreground">
        {loading
          ? "Searching..."
          : `${total ?? doctors.length} doctor${(total ?? doctors.length) !== 1 ? "s" : ""} found`}
      </p>

      <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {doctors.map((doctor, i) => (
            <DoctorCard key={doctor.id} doctor={doctor} index={i} />
          ))}
        </AnimatePresence>
      </div>

      {!loading && doctors.length === 0 && (
        <div className="mt-16 flex flex-col items-center justify-center text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-primary">
            <UserRound className="size-6" />
          </div>
          <p className="mt-4 font-semibold text-foreground">No doctors found</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Try a different search term or choose another specialty.
          </p>
        </div>
      )}

      {lastPage > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft />
            Prev
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {lastPage}
          </span>
          <Button variant="outline" size="sm" disabled={page >= lastPage} onClick={() => setPage((p) => p + 1)}>
            Next
            <ChevronRight />
          </Button>
        </div>
      )}
    </div>
  );
}
