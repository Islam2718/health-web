export type RecurrenceType = "day" | "weekly" | "monthly";

function toDateOnly(str: string): Date {
  return new Date(`${str}T00:00:00`);
}

export function formatDateOnly(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// The API rejects anything that isn't H:i:s — a bare "14:30" from a native
// <input type="time"> must gain seconds before it's sent.
export function toApiTime(hhmm: string): string {
  if (!hhmm) return hhmm;
  return hhmm.length === 5 ? `${hhmm}:00` : hhmm;
}

export function fromApiTime(hms: string | null | undefined): string {
  return hms ? hms.slice(0, 5) : "";
}

// For display only — never feed this into an <input type="time">, which
// needs fromApiTime's 24-hour "HH:MM" instead.
export function formatTimeDisplay(hms: string | null | undefined): string {
  if (!hms) return "";
  const [hStr, mStr] = hms.slice(0, 5).split(":");
  const h = Number(hStr);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${mStr} ${period}`;
}

export interface RecurrenceOptions {
  type: RecurrenceType;
  startDate: string; // YYYY-MM-DD, inclusive
  endDate: string; // YYYY-MM-DD, inclusive
  weekdays?: number[]; // 0 (Sun) .. 6 (Sat), required for "weekly"
  dayOfMonth?: number; // 1-31, required for "monthly"
}

// Expands a recurrence rule into the concrete list of dates the backend
// needs one doctor-schedule record per, since the API has no native concept
// of a repeating schedule — only date-specific rows.
export function expandScheduleDates({
  type,
  startDate,
  endDate,
  weekdays = [],
  dayOfMonth,
}: RecurrenceOptions): string[] {
  const start = toDateOnly(startDate);
  const end = toDateOnly(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) return [];

  const dates: string[] = [];

  if (type === "day") {
    const cursor = new Date(start);
    while (cursor <= end) {
      dates.push(formatDateOnly(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
  } else if (type === "weekly") {
    const days = new Set(weekdays);
    const cursor = new Date(start);
    while (cursor <= end) {
      if (days.has(cursor.getDay())) dates.push(formatDateOnly(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
  } else if (type === "monthly") {
    const dom = dayOfMonth ?? start.getDate();
    const cursor = new Date(start.getFullYear(), start.getMonth(), dom);
    if (cursor < start) cursor.setMonth(cursor.getMonth() + 1);
    while (cursor <= end) {
      // setMonth can overflow into the next month for days like 31 in a
      // 30-day month — skip those rather than silently drifting the date.
      if (cursor.getDate() === dom) dates.push(formatDateOnly(cursor));
      cursor.setMonth(cursor.getMonth() + 1);
    }
  }

  return dates;
}
