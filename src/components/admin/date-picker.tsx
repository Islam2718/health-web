"use client";

import { DayPicker, type DayPickerProps } from "react-day-picker";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminCalendar({ className, ...props }: DayPickerProps) {
  return (
    <DayPicker
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col gap-4",
        month: "flex flex-col gap-3",
        month_caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium text-foreground",
        nav: "flex items-center gap-1 absolute top-1 inset-x-0 justify-between",
        button_previous: cn(
          "size-7 rounded-md border border-border bg-background inline-flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        ),
        button_next: cn(
          "size-7 rounded-md border border-border bg-background inline-flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        ),
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "text-muted-foreground w-9 text-[0.8rem] font-normal text-center",
        weeks: "flex flex-col gap-1 mt-2",
        week: "flex w-full",
        day: "size-9 text-center text-sm p-0 relative",
        day_button:
          "size-9 rounded-lg inline-flex items-center justify-center font-normal text-foreground hover:bg-muted transition-colors",
        selected: "[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary/90",
        today: "[&>button]:font-semibold [&>button]:text-primary",
        outside: "text-muted-foreground/40",
        disabled: "text-muted-foreground/30 pointer-events-none",
        ...props.classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />,
      }}
      {...props}
    />
  );
}
