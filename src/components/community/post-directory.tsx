"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, MessageSquarePlus, RefreshCw, Search, WifiOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/community/post-card";
import { fetchPosts, type PostRecord, type PostType } from "@/lib/posts";
import { useAuth } from "@/context/auth-context";

const PER_PAGE = 12;
const TYPE_OPTIONS: { value: PostType | "All"; label: string }[] = [
  { value: "All", label: "All" },
  { value: "PATIENT_ISSUE", label: "Patient Issues" },
  { value: "DOCTOR_POST", label: "Doctor Posts" },
];

export function PostDirectory() {
  const { isAuthenticated } = useAuth();
  const [query, setQuery] = useState("");
  const [type, setType] = useState<PostType | "All">("All");
  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState<PostRecord[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    setPage(1);
  }, [query, type]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const handle = setTimeout(async () => {
      const { posts: results, meta, failed } = await fetchPosts({
        search: query.trim() || undefined,
        type: type !== "All" ? type : undefined,
        per_page: PER_PAGE,
        page,
      });
      if (cancelled) return;
      setPosts(results);
      setTotal(meta?.total ?? results.length);
      setLastPage(meta?.last_page ?? 1);
      setLoadFailed(failed);
      setLoading(false);
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [query, type, page, retryToken]);

  const retry = useCallback(() => setRetryToken((n) => n + 1), []);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search posts by title or content..."
            className="h-11 pl-10"
          />
        </div>
        <Button
          nativeButton={false}
          render={<Link href={isAuthenticated ? "/dashboard?tab=posts" : "/login?from=%2Fdashboard%3Ftab%3Dposts"} />}
        >
          <MessageSquarePlus />
          Share a Post
        </Button>
      </div>

      <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-2">
        {TYPE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setType(opt.value)}
            className={
              "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors " +
              (type === opt.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground")
            }
          >
            {opt.label}
          </button>
        ))}
      </div>

      <p className="mt-5 text-sm text-muted-foreground">
        {loading ? "Searching..." : `${total ?? posts.length} post${(total ?? posts.length) !== 1 ? "s" : ""} found`}
      </p>

      <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {posts.map((post, i) => (
            <PostCard key={post.id} post={post} index={i} />
          ))}
        </AnimatePresence>
      </div>

      {!loading && posts.length === 0 && loadFailed && (
        <div className="mt-16 flex flex-col items-center justify-center text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <WifiOff className="size-6" />
          </div>
          <p className="mt-4 font-semibold text-foreground">Couldn&apos;t load posts</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            We couldn&apos;t reach the server. Check your connection and try again.
          </p>
          <Button variant="outline" size="sm" className="mt-4" onClick={retry}>
            <RefreshCw />
            Retry
          </Button>
        </div>
      )}

      {!loading && posts.length === 0 && !loadFailed && (
        <div className="mt-16 flex flex-col items-center justify-center text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-primary">
            <MessageSquarePlus className="size-6" />
          </div>
          <p className="mt-4 font-semibold text-foreground">No posts yet</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Be the first to share a problem, solution, or health tip with the community.
          </p>
        </div>
      )}

      {lastPage > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft />
            Prev
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {lastPage}
          </span>
          <Button variant="outline" size="sm" disabled={page >= lastPage} onClick={() => setPage((p) => p + 1)}>
            Next
            <ChevronRight />
          </Button>
        </div>
      )}
    </div>
  );
}
