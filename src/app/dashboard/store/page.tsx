"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ClipboardList, Pill, Receipt, Store, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStore } from "@/context/store-context";
import { orderStatusStyles, ORDER_STATUS_LABELS } from "@/components/dashboard/store/order-status";

export default function StoreDashboardPage() {
  const { myStore, myStoreLoading, storeProducts, storeOrders, storeOrdersLoading } = useStore();

  if (!myStoreLoading && !myStore) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-20 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-primary">
          <Store className="size-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Register your store</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Set up your medical store to start adding products, tracking stock, and selling through the POS.
          </p>
        </div>
        <Button render={<Link href="/dashboard/store/shop" />} nativeButton={false}>
          Register a Store
        </Button>
      </div>
    );
  }

  const todayKey = new Date().toISOString().slice(0, 10);
  const todaysOrders = storeOrders.filter((o) => (o.placed_at ?? o.created_at ?? "").slice(0, 10) === todayKey);
  const todaysRevenue = todaysOrders.reduce((sum, o) => sum + Number(o.total), 0);
  const lowStockCount = storeProducts.filter(
    (p) => p.minimum_stock != null && (p.current_stock ?? 0) <= p.minimum_stock
  ).length;

  const stats = [
    { label: "Products", value: storeProducts.length, icon: Pill, href: "/dashboard/store/products" },
    { label: "Low Stock", value: lowStockCount, icon: Receipt, href: "/dashboard/store/stock" },
    { label: "Orders Today", value: todaysOrders.length, icon: ClipboardList, href: "/dashboard/store/orders" },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {myStore?.store_name ?? "Store Dashboard"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Overview of your store.</p>
      </motion.div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.05 }}
          >
            <Link href={stat.href}>
              <Card className="border-border/60 p-4 transition-colors hover:border-primary/40">
                <div className="flex size-9 items-center justify-center rounded-lg bg-secondary text-primary">
                  <stat.icon className="size-4.5" />
                </div>
                <p className="mt-3 text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </Card>
            </Link>
          </motion.div>
        ))}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.15 }}>
          <Card className="border-border/60 p-4">
            <div className="flex size-9 items-center justify-center rounded-lg bg-secondary text-primary">
              <TrendingUp className="size-4.5" />
            </div>
            <p className="mt-3 text-2xl font-bold text-foreground">৳{todaysRevenue.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Revenue Today</p>
          </Card>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
        <Card className="mt-6 border-border/60 p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Recent Orders</h2>
            <Link href="/dashboard/store/orders" className="text-xs font-medium text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="mt-3 divide-y divide-border/60">
            {storeOrdersLoading ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Loading…</p>
            ) : storeOrders.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No orders yet.</p>
            ) : (
              storeOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                      {order.order_number}
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${orderStatusStyles[order.status]}`}>
                        {ORDER_STATUS_LABELS[order.status] ?? order.status}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.items.length} item{order.items.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-foreground">৳{Number(order.total).toFixed(2)}</p>
                </div>
              ))
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
