"use client";

import { AVATAR_PRESETS } from "@/lib/avatar-presets";
import { cn } from "@/lib/utils";

interface AvatarPickerProps {
  value: string | null;
  onChange: (url: string) => void;
}

const GROUPS = [
  { label: "Male avatars", gender: "Male" as const },
  { label: "Female avatars", gender: "Female" as const },
];

export function AvatarPicker({ value, onChange }: AvatarPickerProps) {
  return (
    <div className="space-y-3">
      {GROUPS.map((group) => (
        <div key={group.gender} className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">{group.label}</p>
          <div className="flex flex-wrap gap-2">
            {AVATAR_PRESETS.filter((preset) => preset.gender === group.gender).map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => onChange(preset.url)}
                aria-label={`Use this ${preset.gender.toLowerCase()} avatar`}
                aria-pressed={value === preset.url}
                className={cn(
                  "size-11 shrink-0 overflow-hidden rounded-full ring-2 ring-offset-2 ring-offset-background transition-all",
                  value === preset.url ? "ring-primary" : "ring-transparent hover:ring-border"
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preset.url} alt="" className="size-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
