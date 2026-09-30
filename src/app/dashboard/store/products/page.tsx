"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Pill, Plus, Store, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/dashboard/store/data-table";
import { useStore } from "@/context/store-context";
import { type StoreProductRecord } from "@/lib/stores";

export default function ProductsPage() {
  const { myStore, myStoreLoading, storeProducts, storeProductsLoading, removeProduct } = useStore();
  const [deleteTarget, setDeleteTarget] = useState<StoreProductRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const ok = await removeProduct(deleteTarget.id);
    setDeleting(false);
    if (ok) setDeleteTarget(null);
  };

  const columns = useMemo<ColumnDef<StoreProductRecord>[]>(
    () => [
      {
        id: "medicine",
        accessorFn: (p) => p.medicine_name ?? `Medicine #${p.medicine_id}`,
        header: "Medicine",
        cell: ({ row }) => (
          <div>
            <p className="text-sm font-medium text-foreground">
              {row.original.medicine_name ?? `Medicine #${row.original.medicine_id}`}
            </p>
            {row.original.medicine_generic_name && (
              <p className="text-xs text-muted-foreground">{row.original.medicine_generic_name}</p>
            )}
          </div>
        ),
      },
      {
        accessorKey: "buy_price",
        header: "Buy Price",
        cell: ({ row }) => <span className="text-sm text-muted-foreground">৳{row.original.buy_price}</span>,
      },
      {
        accessorKey: "sale_price",
        header: "Sale Price",
        cell: ({ row }) => <span className="text-sm text-muted-foreground">৳{row.original.sale_price}</span>,
      },
      {
        id: "stock",
        accessorFn: (p) => p.current_stock ?? 0,
        header: "Stock",
        cell: ({ row }) => {
          const p = row.original;
          const low = p.minimum_stock != null && (p.current_stock ?? 0) <= p.minimum_stock;
          return (
            <div className="flex items-center gap-2">
              <span className="text-sm text-foreground">{p.current_stock ?? 0}</span>
              {low && (
                <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-medium text-destructive">
                  Low stock
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "is_active",
        header: "Status",
        cell: ({ row }) => (
          <span
            className={
              row.original.is_active
                ? "rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary"
                : "rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
            }
          >
            {row.original.is_active ? "Active" : "Inactive"}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-1.5">
            <Link
              href={`/dashboard/store/products/${row.original.id}`}
              className={buttonVariants({ variant: "outline", size: "icon-sm" })}
              aria-label="Edit"
            >
              <Pencil />
            </Link>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-destructive"
              onClick={() => setDeleteTarget(row.original)}
              aria-label="Delete"
            >
              <Trash2 />
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  if (!myStoreLoading && !myStore) {
    return (
      <Card className="mx-auto flex max-w-md flex-col items-center gap-3 border-dashed border-border/60 p-10 text-center">
        <Store className="size-8 text-muted-foreground" />
        <p className="font-semibold text-foreground">No store yet</p>
        <p className="text-sm text-muted-foreground">Register a store before adding products.</p>
        <Button render={<Link href="/dashboard/store/shop" />} nativeButton={false} size="sm">
          Go to Shop
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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {storeProductsLoading ? "Loading…" : `${storeProducts.length} products listed`}
          </p>
        </div>
        <Button render={<Link href="/dashboard/store/products/new" />} nativeButton={false}>
          <Plus /> Add Product
        </Button>
      </motion.div>

      <Card className="mt-5 border-border/60 p-5">
        {storeProductsLoading ? (
          <div className="flex items-center justify-center py-16">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="size-8 rounded-full border-2 border-primary border-t-transparent"
            />
          </div>
        ) : storeProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <Pill className="size-8 text-muted-foreground" />
            <p className="font-semibold text-foreground">No products yet</p>
            <p className="text-sm text-muted-foreground">Add your first medicine to start tracking stock.</p>
          </div>
        ) : (
          <DataTable columns={columns} data={storeProducts} searchPlaceholder="Search products…" />
        )}
      </Card>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove product?</DialogTitle>
            <DialogDescription>
              This will remove <strong>{deleteTarget?.medicine_name ?? "this product"}</strong> from your store.
              This can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleting}>
              {deleting ? "Removing..." : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
