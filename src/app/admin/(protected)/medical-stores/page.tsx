"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { RefreshCw, Search, Store as StoreIcon, Trash2, WifiOff } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAdminAuth } from "@/context/admin-auth-context";
import { deleteStore, fetchStores, type StoreRecord } from "@/lib/stores";
import { toast } from "sonner";

export default function AdminMedicalStoresPage() {
  const { token } = useAdminAuth();
  const [stores, setStores] = useState<StoreRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [retryToken, setRetryToken] = useState(0);
  const [query, setQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<StoreRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setLoading(true);
    fetchStores(token).then(({ stores: results, failed }) => {
      if (cancelled) return;
      setStores(results);
      setLoadFailed(failed);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [token, retryToken]);

  const retry = useCallback(() => setRetryToken((n) => n + 1), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return stores.filter(
      (s) => !q || s.store_name.toLowerCase().includes(q) || s.store_address.toLowerCase().includes(q)
    );
  }, [stores, query]);

  const confirmDelete = async () => {
    if (!token || !deleteTarget) return;
    setDeleting(true);
    try {
      await deleteStore(token, deleteTarget.id);
      setStores((list) => list.filter((s) => s.id !== deleteTarget.id));
      toast.success("Store removed");
    } catch {
      toast.error("Could not remove that store.");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Medical Store</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {loading ? "Loading…" : `${stores.length} stores registered`}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Stores are registered by users from their own dashboard — this view is read-only.
        </p>
      </motion.div>

      <div className="mt-5 relative">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by store name or address..." className="h-10 pl-10" />
      </div>

      <Card className="mt-5 overflow-hidden border-border/60 p-0">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="size-8 rounded-full border-2 border-primary border-t-transparent"
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Store</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Trade License</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((store) => (
                    <TableRow key={store.id}>
                      <TableCell>
                        <p className="text-sm font-medium text-foreground">{store.store_name}</p>
                        <p className="text-xs text-muted-foreground">{store.store_address}</p>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{store.owner?.name ?? "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{store.trade_license_no}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {store.phone ?? store.email ?? "—"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            "rounded-full px-2 py-0.5 text-xs font-medium " +
                            (store.is_active
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground")
                          }
                        >
                          {store.is_active ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => setDeleteTarget(store)}
                            aria-label="Delete"
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filtered.length === 0 && loadFailed && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                  <WifiOff className="size-5" />
                </div>
                <p className="mt-3 font-semibold text-foreground">Couldn&apos;t load stores</p>
                <p className="mt-1 text-sm text-muted-foreground">We couldn&apos;t reach the server.</p>
                <Button variant="outline" size="sm" className="mt-4" onClick={retry}>
                  <RefreshCw />
                  Retry
                </Button>
              </div>
            )}

            {filtered.length === 0 && !loadFailed && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-primary">
                  <StoreIcon className="size-5" />
                </div>
                <p className="mt-3 font-semibold text-foreground">No stores found</p>
              </div>
            )}
          </>
        )}
      </Card>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete store?</DialogTitle>
            <DialogDescription>
              This will remove <strong>{deleteTarget?.store_name}</strong>. This can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleting}>
              {deleting ? "Removing..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
