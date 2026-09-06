"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { MessageCircle, Star, Stethoscope } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/user-avatar";
import { POST_TYPE_LABELS, type PostRecord } from "@/lib/posts";
import { stripHtmlToText } from "@/lib/safe-html";
import { displayNameWithTitle } from "@/lib/doctor-profile";

function formatPostDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function averageRating(post: PostRecord): number | null {
  if (!post.ratings || post.ratings.length === 0) return null;
  return post.ratings.reduce((sum, r) => sum + r.rating, 0) / post.ratings.length;
}

export function PostCard({ post, index = 0 }: { post: PostRecord; index?: number }) {
  const rawAuthorName = post.user?.name?.trim() || "Community Member";
  const authorName = displayNameWithTitle(rawAuthorName, post.user?.type);
  const isDoctorPost = post.type === "DOCTOR_POST";
  const avgRating = averageRating(post);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, delay: (index % 6) * 0.05 }}
    >
      <Link href={`/community/${post.id}`}>
        <Card className="group h-full border-border/60 p-5 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-teal/10">
          <div className="flex items-center justify-between gap-2">
            <Badge variant={isDoctorPost ? "default" : "secondary"} className="gap-1">
              {isDoctorPost && <Stethoscope className="size-3" />}
              {post.type && POST_TYPE_LABELS[post.type as keyof typeof POST_TYPE_LABELS]
                ? POST_TYPE_LABELS[post.type as keyof typeof POST_TYPE_LABELS]
                : "Discussion"}
            </Badge>
            {post.created_at && (
              <span className="text-xs text-muted-foreground">{formatPostDate(post.created_at)}</span>
            )}
          </div>

          <h3 className="mt-3 line-clamp-2 font-semibold text-foreground">
            {post.title?.trim() || "Untitled post"}
          </h3>
          {post.body && (
            <p className="mt-1.5 line-clamp-3 text-sm text-muted-foreground">{stripHtmlToText(post.body)}</p>
          )}

          <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-4">
            <div className="flex min-w-0 items-center gap-2">
              <UserAvatar name={rawAuthorName} imageUrl={post.user?.profile_image} gender={post.user?.gender} className="size-7" />
              <span className="truncate text-xs font-medium text-foreground">{authorName}</span>
            </div>
            <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
              {avgRating != null && (
                <span className="flex items-center gap-1">
                  <Star className="size-3.5 fill-amber-400 text-amber-400" />
                  {avgRating.toFixed(1)}
                </span>
              )}
              <span className="flex items-center gap-1">
                <MessageCircle className="size-3.5" />
                {post.comments?.length ?? 0}
              </span>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}
