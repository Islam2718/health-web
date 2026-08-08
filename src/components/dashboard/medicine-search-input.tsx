"use client";

import { useEffect, useState } from "react";
import { Autocomplete } from "@base-ui/react/autocomplete";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchPublicMedicines, type PublicMedicineRecord } from "@/lib/medicines";

interface MedicineSearchInputProps {
  value: string;
  onValueChange: (value: string) => void;
  onSelectMedicine: (medicine: PublicMedicineRecord) => void;
  placeholder?: string;
  className?: string;
}

// A live search-as-you-type combobox against GET /medicines/public — the
// `search` param matches name/generic_name/company server-side, so this one
// field covers all three the way a doctor would actually look a drug up.
// mode="none" because filtering already happens on the server; Base UI's
// own client-side filtering would otherwise re-filter (and could hide) the
// server's fuzzy/generic-name matches.
export function MedicineSearchInput({
  value,
  onValueChange,
  onSelectMedicine,
  placeholder,
  className,
}: MedicineSearchInputProps) {
  const [results, setResults] = useState<PublicMedicineRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const query = value.trim();
    if (query.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const handle = setTimeout(async () => {
      const medicines = await fetchPublicMedicines({ search: query, per_page: 8 });
      if (cancelled) return;
      setResults(medicines);
      setLoading(false);
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [value]);

  return (
    <Autocomplete.Root
      items={results}
      mode="none"
      value={value}
      onValueChange={(v) => onValueChange(v)}
      itemToStringValue={(medicine: PublicMedicineRecord) => medicine.name}
      open={open}
      onOpenChange={setOpen}
      openOnInputClick
    >
      <div className={cn("relative", className)}>
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Autocomplete.Input
          placeholder={placeholder ?? "Search medicine by name, generic name, or company…"}
          className="flex h-9 w-full rounded-lg border border-input bg-transparent py-1.5 pr-3 pl-8 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
        />
      </div>
      <Autocomplete.Portal>
        <Autocomplete.Positioner side="bottom" sideOffset={4} align="start" className="isolate z-50 w-(--anchor-width)">
          <Autocomplete.Popup className="max-h-64 overflow-y-auto rounded-lg border border-border/60 bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10">
            {loading ? (
              <p className="p-3 text-center text-xs text-muted-foreground">Searching…</p>
            ) : (
              <>
                <Autocomplete.Empty className="p-3 text-center text-xs text-muted-foreground">
                  {value.trim().length < 2 ? "Type at least 2 characters to search." : "No medicines found."}
                </Autocomplete.Empty>
                <Autocomplete.List>
                  {(medicine: PublicMedicineRecord) => (
                    <Autocomplete.Item
                      key={medicine.id}
                      value={medicine}
                      onClick={() => {
                        onSelectMedicine(medicine);
                        setOpen(false);
                      }}
                      className={cn(
                        "flex cursor-default flex-col gap-0.5 px-3 py-2 text-sm outline-hidden select-none",
                        "hover:bg-accent hover:text-accent-foreground data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground"
                      )}
                    >
                      <span className="font-medium text-foreground">{medicine.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {[medicine.generic_name, medicine.weight, medicine.company?.name].filter(Boolean).join(" · ")}
                      </span>
                    </Autocomplete.Item>
                  )}
                </Autocomplete.List>
              </>
            )}
          </Autocomplete.Popup>
        </Autocomplete.Positioner>
      </Autocomplete.Portal>
    </Autocomplete.Root>
  );
}
