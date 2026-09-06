"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Pencil, Plus, RefreshCw, Search, Trash2, Users as UsersIcon, WifiOff } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/user-avatar";
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
import { deleteUser, fetchUsers, roleLabel, ROLE_OPTIONS } from "@/lib/admin-users";
import type { ApiUser } from "@/lib/api-client";
import { toast } from "sonner";

export default function AdminUsersPage() {
  const { token } = useAdminAuth();
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [retryToken, setRetryToken] = useState(0);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("All");
  const [deleteTarget, setDeleteTarget] = useState<ApiUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setLoading(true);
    fetchUsers(token).then(({ users: results, failed }) => {
      if (cancelled) return;
      setUsers(results);
      setLoadFailed(failed);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [token, retryToken]);

  const retry = useCallback(() => setRetryToken((n) => n + 1), []);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchesRole = role === "All" || roleLabel(u.type) === role;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q || u.name.toLowerCase().includes(q) || (u.email ?? "").toLowerCase().includes(q);
      return matchesRole && matchesQuery;
    });
  }, [users, query, role]);

  const confirmDelete = async () => {
    if (!token || !deleteTarget) return;
    setDeleting(true);
    try {
      await deleteUser(token, deleteTarget.id);
      setUsers((list) => list.filter((u) => u.id !== deleteTarget.id));
      toast.success("User removed");
    } catch {
      toast.error("Could not remove that user.");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Users</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {loading ? "Loading…" : `${users.length} accounts registered`}
          </p>
        </div>
        <Button render={<Link href="/admin/user/new" />} nativeButton={false}>
          <Plus /> Add User
        </Button>
      </motion.div>

      <div className="mt-5 relative">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or email..." className="h-10 pl-10" />
      </div>

      <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-2">
        {["All", ...ROLE_OPTIONS.map((r) => r.label)].map((r) => (
          <button
            key={r}
            onClick={() => setRole(r)}
            className={
              "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors " +
              (role === r
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground")
            }
          >
            {r}
          </button>
        ))}
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
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <UserAvatar name={user.name} imageUrl={user.profile_image} gender={user.gender} size="sm" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{user.email ?? user.phone}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{roleLabel(user.type)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{user.phone ?? "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user.created_at ? user.created_at.slice(0, 10) : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.is_active ? "default" : "destructive"}>
                      {user.is_active ? "Active" : "Suspended"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1.5">
                      <Link href={`/admin/user/${user.id}`} className={buttonVariants({ variant: "ghost", size: "icon-sm" })} aria-label="Edit">
                        <Pencil />
                      </Link>
                      <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-destructive" onClick={() => setDeleteTarget(user)} aria-label="Delete">
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
            <p className="mt-3 font-semibold text-foreground">Couldn&apos;t load users</p>
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
              <UsersIcon className="size-5" />
            </div>
            <p className="mt-3 font-semibold text-foreground">No users found</p>
          </div>
        )}
          </>
        )}
      </Card>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete user?</DialogTitle>
            <DialogDescription>
              This will remove <strong>{deleteTarget?.name}</strong>&apos;s account. This can&apos;t be undone.
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
