"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

// Simple illustrated bust icons used as the avatar fallback when a user has
// no profile photo but does have a gender on file — nicer than a bare
// initial, without needing an uploaded/external image. Each draws its own
// inscribed circle as backdrop, so it looks right whether the parent Avatar
// is rounded-full (header) or rounded-2xl (dashboard banner) — the SVG's
// corners stay transparent either way, no separate clipping needed.
function MaleAvatarIcon() {
  return (
    <svg viewBox="0 0 64 64" className="size-full" aria-hidden="true">
      <circle cx="32" cy="32" r="32" className="fill-sky-100 dark:fill-sky-950/50" />
      <circle cx="32" cy="25" r="11" className="fill-sky-500/80 dark:fill-sky-400/80" />
      <path d="M9 58c0-13.8 10.3-23 23-23s23 9.2 23 23" className="fill-sky-500/80 dark:fill-sky-400/80" />
    </svg>
  );
}

function FemaleAvatarIcon() {
  return (
    <svg viewBox="0 0 64 64" className="size-full" aria-hidden="true">
      <circle cx="32" cy="32" r="32" className="fill-rose-100 dark:fill-rose-950/50" />
      <path
        d="M32 9c-9.94 0-18 7.16-18 16 0 5.2 1.9 9.35 4.3 12.4-.4 5.4 1.9 9.4 5.2 11.1 1.6 3 5 5 8.5 5s6.9-2 8.5-5c3.3-1.7 5.6-5.7 5.2-11.1C48.1 34.35 50 30.2 50 25c0-8.84-8.06-16-18-16z"
        className="fill-rose-400/90 dark:fill-rose-400/80"
      />
      <circle cx="32" cy="26" r="10" className="fill-rose-200 dark:fill-rose-300/60" />
      <path d="M9 58c0-13.8 10.3-23 23-23s23 9.2 23 23" className="fill-rose-400/90 dark:fill-rose-400/80" />
    </svg>
  );
}

interface UserAvatarProps {
  name: string;
  imageUrl?: string | null;
  gender?: string | null;
  className?: string;
  imageClassName?: string;
  fallbackClassName?: string;
  size?: "default" | "sm" | "lg";
}

export function UserAvatar({
  name,
  imageUrl,
  gender,
  className,
  imageClassName,
  fallbackClassName,
  size,
}: UserAvatarProps) {
  const normalizedGender = gender?.toLowerCase();
  const genderIcon =
    normalizedGender === "male" ? (
      <MaleAvatarIcon />
    ) : normalizedGender === "female" ? (
      <FemaleAvatarIcon />
    ) : null;

  return (
    <Avatar className={className} size={size}>
      {imageUrl && <AvatarImage src={imageUrl} alt={name} className={imageClassName} />}
      {genderIcon ? (
        <AvatarFallback className={cn("bg-transparent p-0", imageClassName)}>{genderIcon}</AvatarFallback>
      ) : (
        <AvatarFallback className={cn(imageClassName, fallbackClassName)}>
          {name.charAt(0).toUpperCase()}
        </AvatarFallback>
      )}
    </Avatar>
  );
}
