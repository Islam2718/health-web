"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import type { ColumnDef } from "@tanstack/react-table";
import { ClipboardList, Printer, RefreshCw, Store } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable } from "@/components/dashboard/store/data-table";
import { orderStatusStyles, ORDER_STATUS_LABELS } from "@/components/dashboard/store/order-status";
import { useStore } from "@/context/store-context";
import { ORDER_STATUS_OPTIONS, type OrderRecord, type OrderStatus } from "@/lib/stores";
import { formatDateForDisplay } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function OrdersPage() {
  const {
    myStore,
    myStoreLoading,
    storeOrders,
    storeOrdersLoading,
    storeOrdersFailed,
    refreshStoreOrders,
    changeOrderStatus,
    printOrder,
  } = useStore();

  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [orderDetailsView, setOrderDetailsView] = useState<OrderRecord | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const filtered = statusFilter === "all" ? storeOrders : storeOrders.filter((o) => o.status === statusFilter);

  const columns = useMemo<ColumnDef<OrderRecord>[]>(
    () => [
      {
        accessorKey: "order_number",
        header: "Order",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", orderStatusStyles[row.original.status])}>
            {ORDER_STATUS_LABELS[row.original.status] ?? row.original.status}
          </span>
        ),
      },
      {
        id: "items",
        accessorFn: (o) => o.items.length,
        header: "Items",
      },
      {
        id: "date",
        accessorFn: (o) => o.placed_at ?? o.created_at ?? "",
        header: "Date",
        cell: ({ row }) => {
          const raw = row.original.placed_at ?? row.original.created_at;
          return raw ? formatDateForDisplay(raw.slice(0, 10)) : "—";
        },
      },
      {
        accessorKey: "total",
        header: "Total",
        cell: ({ row }) => <span className="font-semibold text-foreground">৳{Number(row.original.total).toFixed(2)}</span>,
      },
    ],
    []
  );

  if (!myStoreLoading && !myStore) {
    return (
      <Card className="mx-auto flex max-w-md flex-col items-center gap-3 border-dashed border-border/60 p-10 text-center">
        <Store className="size-8 text-muted-foreground" />
        <p className="font-semibold text-foreground">No store yet</p>
        <p className="text-sm text-muted-foreground">Register a store to start seeing orders here.</p>
        <Button render={<Link href="/dashboard/store/shop" />} nativeButton={false} size="sm">
          Go to Shop
        </Button>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">Orders placed at your store.</p>
      </motion.div>

      <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-2">
        {(["all", ...ORDER_STATUS_OPTIONS.map((o) => o.value)] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              statusFilter === s
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
            )}
          >
            {s === "all" ? "All" : ORDER_STATUS_OPTIONS.find((o) => o.value === s)?.label}
          </button>
        ))}
      </div>

      <Card className="mt-4 border-border/60 p-5">
        {storeOrdersLoading ? (
          <div className="flex items-center justify-center py-16">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="size-8 rounded-full border-2 border-primary border-t-transparent"
            />
          </div>
        ) : filtered.length === 0 && storeOrdersFailed ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <p className="text-sm font-semibold text-foreground">Couldn&apos;t load orders</p>
            <p className="text-xs text-muted-foreground">We couldn&apos;t reach the server.</p>
            <Button variant="outline" size="sm" onClick={refreshStoreOrders}>
              <RefreshCw />
              Retry
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <ClipboardList className="size-8 text-muted-foreground" />
            <p className="font-semibold text-foreground">No orders yet</p>
          </div>
        ) : (
          <DataTable columns={columns} data={filtered} searchPlaceholder="Search orders…" onRowClick={setOrderDetailsView} />
        )}
      </Card>

      <Dialog open={orderDetailsView != null} onOpenChange={(open) => !open && setOrderDetailsView(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Order {orderDetailsView?.order_number}</DialogTitle>
          </DialogHeader>
          {orderDetailsView && (
            <div className="-mx-1.5 max-h-[65vh] space-y-4 overflow-y-auto px-1.5 py-1">
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Status</Label>
                  <Select
                    value={orderDetailsView.status}
                    onValueChange={async (v) => {
                      if (!v) return;
                      setUpdatingStatus(true);
                      const ok = await changeOrderStatus(orderDetailsView, v as OrderStatus);
                      setUpdatingStatus(false);
                      if (ok) setOrderDetailsView((current) => (current ? { ...current, status: v as OrderStatus } : current));
                    }}
                  >
                    <SelectTrigger className="w-44">
                      <SelectValue>
                        {(value: OrderStatus) => ORDER_STATUS_OPTIONS.find((o) => o.value === value)?.label ?? value}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {ORDER_STATUS_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {updatingStatus && <p className="text-xs text-muted-foreground">Saving…</p>}
              </div>

              <div className="space-y-2 rounded-xl border border-border/60 p-3">
                {orderDetailsView.items.map((item, i) => (
                  <div key={item.id ?? i} className="flex items-center justify-between gap-2 text-sm">
                    <span className="text-foreground">
                      {item.medicine_name ?? `Item #${item.store_product_id}`} × {item.quantity}
                    </span>
                    <span className="text-muted-foreground">৳{Number(item.total_price).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1 text-sm">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>৳{Number(orderDetailsView.subtotal).toFixed(2)}</span>
                </div>
                {Number(orderDetailsView.discount) > 0 && (
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Discount</span>
                    <span>−৳{Number(orderDetailsView.discount).toFixed(2)}</span>
                  </div>
                )}
                {Number(orderDetailsView.delivery_fee) > 0 && (
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Delivery Fee</span>
                    <span>৳{Number(orderDetailsView.delivery_fee).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between font-semibold text-foreground">
                  <span>Total</span>
                  <span>৳{Number(orderDetailsView.total).toFixed(2)}</span>
                </div>
              </div>

              {orderDetailsView.payment_method && (
                <p className="text-xs text-muted-foreground">
                  Payment: {orderDetailsView.payment_method} · {orderDetailsView.payment_status}
                </p>
              )}
              {orderDetailsView.notes && (
                <p className="text-xs text-muted-foreground italic">&ldquo;{orderDetailsView.notes}&rdquo;</p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOrderDetailsView(null)}>
              Close
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (orderDetailsView) printOrder(orderDetailsView, null, "80mm");
              }}
            >
              <Printer />
              Print 80mm
            </Button>
            <Button
              onClick={() => {
                if (orderDetailsView) printOrder(orderDetailsView, null, "a4");
              }}
            >
              <Printer />
              Print A4
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
