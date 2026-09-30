// Renders a plain "YYYY-MM-DD" date string (no time component) the way a
// human reads it — "Mon, Jan 5, 2026" — without the timezone-shift bug a
// bare `new Date(dateStr)` has (parsed as UTC midnight, which can display as
// the previous day in negative-offset timezones). Anchoring to local
// midnight via the explicit `T00:00:00` suffix avoids that.
export function formatDateForDisplay(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}
