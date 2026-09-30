import { ORDER_STATUS_OPTIONS, type OrderStatus } from "@/lib/stores";

export const orderStatusStyles: Record<OrderStatus, string> = {
  pending: "bg-secondary text-secondary-foreground",
  confirmed: "bg-primary/10 text-primary",
  processing: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  shipped: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
  delivered: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  cancelled: "bg-destructive/10 text-destructive",
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = ORDER_STATUS_OPTIONS.reduce(
  (acc, o) => ({ ...acc, [o.value]: o.label }),
  {} as Record<OrderStatus, string>
);
