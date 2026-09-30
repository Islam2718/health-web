"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import type { ColumnDef } from "@tanstack/react-table";
import { Pill, Plus, Receipt, Store } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/dashboard/store/data-table";
import { useStore } from "@/context/store-context";
import { STOCK_TRANSACTION_TYPES, type StoreStockRecord } from "@/lib/stores";
import { formatDateForDisplay } from "@/lib/format";

const typeBadgeClass: Record<string, string> = {
  purchase: "bg-primary/10 text-primary",
  sale: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  adjustment: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
};

export default function StockPage() {
  const { myStore, myStoreLoading, storeProducts, storeStocks, storeStocksLoading } = useStore();

  const columns = useMemo<ColumnDef<StoreStockRecord>[]>(
    () => [
      {
        id: "product",
        accessorFn: (s) =>
          storeProducts.find((p) => p.id === s.store_product_id)?.medicine_name ?? `Product #${s.store_product_id}`,
        header: "Product",
      },
      {
        accessorKey: "transaction_type",
        header: "Type",
        cell: ({ row }) => {
          const type = row.original.transaction_type;
          const label = STOCK_TRANSACTION_TYPES.find((t) => t.value === type)?.label.split(" (")[0] ?? type;
          return (
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${typeBadgeClass[type] ?? ""}`}>
              {label}
            </span>
          );
        },
      },
      {
        accessorKey: "quantity",
        header: "Quantity",
      },
      {
        accessorKey: "unit_price",
        header: "Unit Price",
        cell: ({ row }) => <span>৳{row.original.unit_price}</span>,
      },
      {
        accessorKey: "total_price",
        header: "Total",
        cell: ({ row }) => <span>৳{row.original.total_price}</span>,
      },
      {
        accessorKey: "transaction_date",
        header: "Date",
        cell: ({ row }) => formatDateForDisplay(row.original.transaction_date.slice(0, 10)),
      },
      {
        accessorKey: "remarks",
        header: "Notes",
        enableSorting: false,
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground italic">{row.original.remarks ? `"${row.original.remarks}"` : "—"}</span>
        ),
      },
    ],
    [storeProducts]
  );

  if (!myStoreLoading && !myStore) {
    return (
      <Card className="mx-auto flex max-w-md flex-col items-center gap-3 border-dashed border-border/60 p-10 text-center">
        <Store className="size-8 text-muted-foreground" />
        <p className="font-semibold text-foreground">No store yet</p>
        <p className="text-sm text-muted-foreground">Register a store before logging stock.</p>
        <Button render={<Link href="/dashboard/store/shop" />} nativeButton={false} size="sm">
          Go to Shop
        </Button>
      </Card>
    );
  }

  if (myStore && storeProducts.length === 0) {
    return (
      <Card className="mx-auto flex max-w-md flex-col items-center gap-3 border-dashed border-border/60 p-10 text-center">
        <Pill className="size-8 text-muted-foreground" />
        <p className="font-semibold text-foreground">No products yet</p>
        <p className="text-sm text-muted-foreground">Add a product before logging stock.</p>
        <Button render={<Link href="/dashboard/store/products/new" />} nativeButton={false} size="sm">
          Go to Products
        </Button>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Stock History</h1>
          <p className="mt-1 text-sm text-muted-foreground">Track what came in, went out, or was adjusted.</p>
        </div>
        <Button render={<Link href="/dashboard/store/stock/new" />} nativeButton={false}>
          <Plus /> Update Stock
        </Button>
      </motion.div>

      <Card className="mt-5 border-border/60 p-5">
        {storeStocksLoading ? (
          <div className="flex items-center justify-center py-16">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="size-8 rounded-full border-2 border-primary border-t-transparent"
            />
          </div>
        ) : storeStocks.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <Receipt className="size-8 text-muted-foreground" />
            <p className="font-semibold text-foreground">No stock updates yet</p>
          </div>
        ) : (
          <DataTable columns={columns} data={storeStocks} searchPlaceholder="Search stock history…" />
        )}
      </Card>
    </div>
  );
}
