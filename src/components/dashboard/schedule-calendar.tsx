"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDateOnly } from "@/lib/schedule-recurrence";
import { getHolidayName, isWeekend } from "@/lib/bd-holidays";
import type { DoctorScheduleRecord } from "@/lib/doctor-profile";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export interface DateRange {
  start: string | null;
  end: string | null;
}

interface ScheduleCalendarProps {
  events: DoctorScheduleRecord[];
  range: DateRange;
  onRangeChange: (range: DateRange) => void;
}

function startOfDay(d: Date): Date {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

// Picks the month to land on when events exist somewhere other than the
// current month — the nearest upcoming event's month, or failing that the
// most recent past one, so existing slots are visible without the doctor
// having to click "previous month" dozens of times to find them.
function nearestEventMonth(events: DoctorScheduleRecord[], todayStr: string): Date | null {
  if (events.length === 0) return null;
  const dates = events.map((e) => e.date.slice(0, 10)).sort();
  const upcoming = dates.find((d) => d >= todayStr);
  const anchorStr = upcoming ?? dates[dates.length - 1];
  return new Date(`${anchorStr}T00:00:00`);
}

function buildMonthGrid(monthAnchor: Date): Date[] {
  const year = monthAnchor.getFullYear();
  const month = monthAnchor.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const gridStart = new Date(firstOfMonth);
  gridStart.setDate(firstOfMonth.getDate() - firstOfMonth.getDay());

  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    days.push(d);
  }
  return days;
}

// A drag-to-select month calendar, in the spirit of Google Calendar's month
// view: pointer-down on a day starts a selection, dragging over other days
// extends it, pointer-up commits the range. A plain click (no drag) just
// selects that single day — both feed the same onRangeChange.
export function ScheduleCalendar({ events, range, onRangeChange }: ScheduleCalendarProps) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [monthAnchor, setMonthAnchor] = useState(() => today);
  const [dragStart, setDragStart] = useState<string | null>(null);
  const [dragEnd, setDragEnd] = useState<string | null>(null);
  const hasAutoJumped = useRef(false);

  // Existing schedules can be fetched asynchronously after this component
  // first mounts (empty `events`) — jump to their month once, the first
  // time real data shows up, rather than leaving the doctor stuck looking
  // at "today" with nothing on it.
  useEffect(() => {
    if (hasAutoJumped.current || events.length === 0) return;
    const target = nearestEventMonth(events, formatDateOnly(today));
    if (target) setMonthAnchor(target);
    hasAutoJumped.current = true;
  }, [events, today]);

  const days = useMemo(() => buildMonthGrid(monthAnchor), [monthAnchor]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, DoctorScheduleRecord[]>();
    for (const e of events) {
      const key = e.date.slice(0, 10);
      const list = map.get(key) ?? [];
      list.push(e);
      map.set(key, list);
    }
    return map;
  }, [events]);

  const isDragging = dragStart != null;
  const previewStart = isDragging ? dragStart : range.start;
  const previewEnd = isDragging ? (dragEnd ?? dragStart) : range.end;
  const [rangeLo, rangeHi] =
    previewStart && previewEnd
      ? previewStart <= previewEnd
        ? [previewStart, previewEnd]
        : [previewEnd, previewStart]
      : [null, null];

  const commitDrag = () => {
    if (dragStart) {
      const end = dragEnd ?? dragStart;
      onRangeChange(dragStart <= end ? { start: dragStart, end } : { start: end, end: dragStart });
    }
    setDragStart(null);
    setDragEnd(null);
  };

  return (
    <div
      className="rounded-xl border border-border/60 p-4 select-none"
      onPointerUp={commitDrag}
      onPointerLeave={() => isDragging && commitDrag()}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="font-semibold text-foreground">
          {monthAnchor.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
        </p>
        <div className="flex items-center gap-1">
          <input
            type="month"
            aria-label="Jump to month"
            value={`${monthAnchor.getFullYear()}-${String(monthAnchor.getMonth() + 1).padStart(2, "0")}`}
            onChange={(e) => {
              const [y, m] = e.target.value.split("-").map(Number);
              if (y && m) setMonthAnchor(new Date(y, m - 1, 1));
            }}
            className="rounded-lg border border-border/60 bg-transparent px-2 py-1 text-xs text-foreground"
          />
          <button
            type="button"
            className="rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
            onClick={() => setMonthAnchor(today)}
          >
            Today
          </button>
          <button
            type="button"
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
            onClick={() => setMonthAnchor((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
            aria-label="Previous month"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
            onClick={() => setMonthAnchor((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
            aria-label="Next month"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-muted-foreground">
        {WEEKDAY_LABELS.map((w) => (
          <div key={w} className="py-1">
            {w}
          </div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {days.map((d) => {
          const dateStr = formatDateOnly(d);
          const inMonth = d.getMonth() === monthAnchor.getMonth();
          const isPast = d < today;
          const holiday = getHolidayName(dateStr);
          const dimmed = isWeekend(d) || holiday != null;
          const dayEvents = eventsByDate.get(dateStr) ?? [];
          const inRange = rangeLo && rangeHi && dateStr >= rangeLo && dateStr <= rangeHi;
          const isEndpoint = dateStr === rangeLo || dateStr === rangeHi;

          return (
            <button
              key={dateStr}
              type="button"
              disabled={isPast}
              title={
                holiday
                  ? holiday
                  : dayEvents.length > 0
                    ? dayEvents.map((e) => `${e.start_time?.slice(0, 5)}–${e.end_time?.slice(0, 5)}`).join(", ")
                    : undefined
              }
              onPointerDown={() => {
                if (isPast) return;
                setDragStart(dateStr);
                setDragEnd(dateStr);
              }}
              onPointerEnter={() => {
                if (isDragging) setDragEnd(dateStr);
              }}
              className={cn(
                "relative flex h-11 flex-col items-center justify-center rounded-lg text-xs transition-colors",
                !inMonth && "opacity-30",
                isPast && "cursor-not-allowed opacity-30",
                !isPast && dimmed && "opacity-50",
                !isPast && !inRange && "hover:bg-secondary",
                inRange && "bg-amber-500/20 text-amber-700 dark:text-amber-400",
                isEndpoint && "bg-amber-500 text-white dark:text-white"
              )}
            >
              <span className="font-medium">{d.getDate()}</span>
              {dayEvents.length > 0 && (
                <span
                  className={cn(
                    "mt-0.5 size-1.5 rounded-full",
                    isEndpoint ? "bg-white" : "bg-amber-500"
                  )}
                />
              )}
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-[11px] text-muted-foreground">
        Click a date, or drag across multiple dates to select a range. Dimmed dates are weekends or public holidays
        (Bangladesh, 2026) — still selectable if you want to schedule anyway.
      </p>
    </div>
  );
}
