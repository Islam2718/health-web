"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { LogIn, MessageCircle, Send, Star, Stethoscope } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/user-avatar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { ApiError, type ApiUser } from "@/lib/api-client";
import type { AppUser } from "@/lib/auth";
import { commentOnPost, ratePost, POST_TYPE_LABELS, type PostRecord } from "@/lib/posts";
import { renderSafeHtml } from "@/lib/safe-html";
import { displayNameWithTitle } from "@/lib/doctor-profile";

function formatPostDateTime(dateStr?: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

// The auth context's AppUser (camelCase, normalized) isn't the same shape
// as the raw ApiUser a comment/rating's nested `user` expects — map it so
// an optimistically-inserted comment/rating shows the right name/avatar
// immediately instead of falling back to "User #id" until the next refetch.
function toApiUserShape(user: AppUser): ApiUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    type: user.type,
    gender: user.gender,
    date_of_birth: user.dateOfBirth,
    profile_image: user.profileImage,
    address: user.address,
    blood_group: user.bloodGroup,
    marital_status: user.maritalStatus,
    is_active: true,
    email_verified_at: null,
    created_at: user.createdAt,
    updated_at: null,
  };
}

// Shown in place of the comment/rating forms for a signed-out visitor —
// same "come back after you log in" idea as the booking flow, just without
// the auto-resume complexity since a comment/rating isn't worth persisting
// across a redirect the way a booking is.
function LoginToParticipate({ from }: { from: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border/60 p-6 text-center">
      <p className="text-sm text-muted-foreground">Log in to join the conversation.</p>
      <Button size="sm" nativeButton={false} render={<Link href={`/login?from=${encodeURIComponent(from)}`} />}>
        <LogIn />
        Log In
      </Button>
    </div>
  );
}

export function PostDetail({ post: initialPost }: { post: PostRecord }) {
  const { isAuthenticated, token, user } = useAuth();
  const pathname = usePathname();
  const [post, setPost] = useState(initialPost);
  const [commentBody, setCommentBody] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingHover, setRatingHover] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submittingRating, setSubmittingRating] = useState(false);

  const rawAuthorName = post.user?.name?.trim() || "Community Member";
  const authorName = displayNameWithTitle(rawAuthorName, post.user?.type);
  const isDoctorPost = post.type === "DOCTOR_POST";
  const comments = post.comments ?? [];
  const ratings = post.ratings ?? [];
  const avgRating = ratings.length ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length : null;
  const myExistingRating = ratings.find((r) => r.user_id === user?.id);

  const submitComment = async () => {
    if (!token || !commentBody.trim()) return;
    setSubmittingComment(true);
    try {
      const comment = await commentOnPost(token, post.id, { body: commentBody.trim() });
      setPost((p) => ({
        ...p,
        comments: [...(p.comments ?? []), { ...comment, user: user ? toApiUserShape(user) : null }],
      }));
      setCommentBody("");
      toast.success("Comment posted");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not post your comment.");
    } finally {
      setSubmittingComment(false);
    }
  };

  const submitRating = async () => {
    if (!token || ratingValue < 1) {
      toast.error("Pick a star rating first.");
      return;
    }
    setSubmittingRating(true);
    try {
      const rating = await ratePost(token, post.id, { rating: ratingValue, review: reviewText.trim() || undefined });
      setPost((p) => ({
        ...p,
        ratings: [
          ...(p.ratings ?? []).filter((r) => r.user_id !== rating.user_id),
          { ...rating, user: user ? toApiUserShape(user) : null },
        ],
      }));
      toast.success("Rating submitted");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not submit your rating.");
    } finally {
      setSubmittingRating(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-6">
        <Card className="border-border/60 p-6">
          <div className="flex items-center justify-between gap-2">
            <Badge variant={isDoctorPost ? "default" : "secondary"} className="gap-1">
              {isDoctorPost && <Stethoscope className="size-3" />}
              {post.type && POST_TYPE_LABELS[post.type as keyof typeof POST_TYPE_LABELS]
                ? POST_TYPE_LABELS[post.type as keyof typeof POST_TYPE_LABELS]
                : "Discussion"}
            </Badge>
            {avgRating != null && (
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="size-4 fill-amber-400 text-amber-400" />
                {avgRating.toFixed(1)}
                <span className="text-xs">({ratings.length})</span>
              </span>
            )}
          </div>

          <h1 className="mt-3 text-2xl font-bold text-foreground">{post.title?.trim() || "Untitled post"}</h1>

          <div className="mt-3 flex items-center gap-2">
            <UserAvatar name={rawAuthorName} imageUrl={post.user?.profile_image} gender={post.user?.gender} className="size-9" />
            <div>
              <p className="text-sm font-medium text-foreground">{authorName}</p>
              {post.created_at && (
                <p className="text-xs text-muted-foreground">{formatPostDateTime(post.created_at)}</p>
              )}
            </div>
          </div>

          {post.body && <div className="mt-5 text-sm text-foreground/90">{renderSafeHtml(post.body)}</div>}
        </Card>

        <Card className="border-border/60 p-6">
          <h2 className="flex items-center gap-2 font-semibold text-foreground">
            <MessageCircle className="size-4 text-primary" />
            Comments ({comments.length})
          </h2>

          <div className="mt-4 space-y-4">
            {comments.length === 0 && (
              <p className="text-sm text-muted-foreground">No comments yet — be the first to reply.</p>
            )}
            {comments.map((c) => {
              const rawCommenterName = c.user?.name?.trim() || `User #${c.user_id}`;
              const commenterName = displayNameWithTitle(rawCommenterName, c.user?.type);
              return (
                <div key={c.id} className="flex items-start gap-3">
                  <UserAvatar name={rawCommenterName} imageUrl={c.user?.profile_image} gender={c.user?.gender} className="size-8 shrink-0" />
                  <div className="min-w-0 flex-1 rounded-xl bg-secondary/50 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">{commenterName}</p>
                      {c.created_at && (
                        <p className="text-xs text-muted-foreground">{formatPostDateTime(c.created_at)}</p>
                      )}
                    </div>
                    <p className="mt-1 text-sm whitespace-pre-wrap text-foreground/90">{c.body}</p>
                    {(c.replies ?? []).length > 0 && (
                      <div className="mt-3 space-y-2 border-t border-border/60 pt-2">
                        {(c.replies ?? []).map((reply) => {
                          const rawReplyName = reply.user?.name?.trim() || `User #${reply.user_id}`;
                          const replyName = displayNameWithTitle(rawReplyName, reply.user?.type);
                          return (
                            <div key={reply.id} className="flex items-start gap-2">
                              <UserAvatar
                                name={rawReplyName}
                                imageUrl={reply.user?.profile_image}
                                gender={reply.user?.gender}
                                className="size-6 shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <p className="text-xs font-medium text-foreground">{replyName}</p>
                                  {reply.created_at && (
                                    <p className="text-[11px] text-muted-foreground">
                                      {formatPostDateTime(reply.created_at)}
                                    </p>
                                  )}
                                </div>
                                <p className="mt-0.5 text-xs whitespace-pre-wrap text-foreground/90">{reply.body}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 border-t border-border/60 pt-5">
            {isAuthenticated ? (
              <div className="space-y-2">
                <Textarea
                  placeholder="Write a comment..."
                  value={commentBody}
                  onChange={(e) => setCommentBody(e.target.value)}
                  rows={3}
                />
                <div className="flex justify-end">
                  <Button size="sm" onClick={submitComment} disabled={submittingComment || !commentBody.trim()}>
                    <Send />
                    {submittingComment ? "Posting..." : "Post Comment"}
                  </Button>
                </div>
              </div>
            ) : (
              <LoginToParticipate from={pathname} />
            )}
          </div>
        </Card>
      </div>

      <div>
        <Card className="border-border/60 p-6 lg:sticky lg:top-24">
          <h2 className="font-semibold text-foreground">
            {myExistingRating ? "Update your rating" : "Rate this post"}
          </h2>
          {isAuthenticated ? (
            <div className="mt-3 space-y-3">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRatingValue(star)}
                    onMouseEnter={() => setRatingHover(star)}
                    onMouseLeave={() => setRatingHover(0)}
                    aria-label={`Rate ${star} star${star === 1 ? "" : "s"}`}
                  >
                    <Star
                      className={cn(
                        "size-6 transition-colors",
                        (ratingHover || ratingValue || myExistingRating?.rating || 0) >= star
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground"
                      )}
                    />
                  </button>
                ))}
              </div>
              <Textarea
                placeholder="Optional review..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={2}
              />
              <Button size="sm" className="w-full" onClick={submitRating} disabled={submittingRating}>
                {submittingRating ? "Submitting..." : myExistingRating ? "Update Rating" : "Submit Rating"}
              </Button>
            </div>
          ) : (
            <div className="mt-3">
              <LoginToParticipate from={pathname} />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
