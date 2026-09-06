import { apiFetch, type ApiUser } from "@/lib/api-client";

// The "Community" module — patients share problems/issues, doctors post
// advice/health tips; anyone can read, only signed-in users can comment or
// rate. Confirmed endpoints (from the real API docs, with example response
// bodies — those are trusted over the auto-generated schema panels, which
// were broken/empty for post.show):
//   GET  /posts                  — public, paginated (flat Laravel
//                                   paginator: {current_page, data, ...},
//                                   not wrapped in {data, meta} like the
//                                   other public/* list endpoints)
//   GET  /posts/{id}              — public, single post (schema panel was
//                                   empty in the docs, so this is handled
//                                   defensively — see fetchPost)
//   POST /posts                  — auth required, returns the created post
//                                   directly (not wrapped in {data})
//   POST /posts/{postId}/comments — auth required, returns the comment
//                                   directly
//   POST /posts/{postId}/ratings  — auth required, returns the rating
//                                   directly
// No update/delete/"my posts" endpoint is documented yet, so those aren't
// implemented — "My Posts" filters the public list client-side instead.

export type PostType = "PATIENT_ISSUE" | "DOCTOR_POST";

export const POST_TYPE_LABELS: Record<PostType, string> = {
  PATIENT_ISSUE: "Patient Issue",
  DOCTOR_POST: "Doctor Post",
};

// Confirmed via a real /posts response (not shown in the docs' example):
// each comment comes back with its commenter nested as `user`, and a
// `replies` array of the same shape for threaded replies.
export interface PostComment {
  id: number;
  post_id: number;
  user_id: number;
  parent_id: number | null;
  body: string;
  created_at?: string | null;
  updated_at?: string | null;
  user?: ApiUser | null;
  replies?: PostComment[];
}

export interface PostRating {
  id: number;
  post_id: number;
  user_id: number;
  rating: number;
  review: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  user?: ApiUser | null;
}

export interface PostRecord {
  id: number;
  user_id: number;
  title: string | null;
  body: string | null;
  type: PostType | string | null;
  is_public: boolean | number;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
  user?: ApiUser | null;
  comments?: PostComment[];
  ratings?: PostRating[];
}

export interface PostListMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface FetchPostsParams {
  search?: string;
  type?: PostType;
  per_page?: number;
  page?: number;
}

function buildQuery(params: FetchPostsParams): string {
  const q = new URLSearchParams();
  if (params.search) q.set("search", params.search);
  if (params.type) q.set("type", params.type);
  if (params.per_page) q.set("per_page", String(params.per_page));
  if (params.page) q.set("page", String(params.page));
  const s = q.toString();
  return s ? `?${s}` : "";
}

interface PostsIndexResponse {
  current_page: number;
  data: PostRecord[];
  last_page: number;
  per_page: number;
  total: number;
}

export async function fetchPosts(
  params: FetchPostsParams = {}
): Promise<{ posts: PostRecord[]; meta: PostListMeta | null; failed: boolean }> {
  try {
    const res = await apiFetch<PostsIndexResponse>(`/posts${buildQuery(params)}`);
    return {
      posts: res?.data ?? [],
      meta: res
        ? { current_page: res.current_page, per_page: res.per_page, total: res.total, last_page: res.last_page }
        : null,
      failed: false,
    };
  } catch {
    return { posts: [], meta: null, failed: true };
  }
}

// The docs' schema panel for this endpoint was empty (just "string"), so
// this defensively accepts either a bare PostRecord or a {data: PostRecord}
// wrapper — whichever the live API actually returns.
export async function fetchPost(id: string | number): Promise<PostRecord | null> {
  try {
    const res = await apiFetch<{ data?: PostRecord } & Partial<PostRecord>>(`/posts/${id}`);
    if (!res) return null;
    if ("data" in res && res.data && typeof res.data === "object") return res.data;
    return "id" in res ? (res as PostRecord) : null;
  } catch {
    return null;
  }
}

export interface CreatePostPayload {
  title?: string;
  body: string;
  type?: PostType;
  is_public?: boolean;
}

export async function createPost(token: string, payload: CreatePostPayload): Promise<PostRecord> {
  return apiFetch<PostRecord>("/posts", { method: "POST", token, body: payload });
}

export interface CreateCommentPayload {
  body: string;
  parent_id?: number | null;
}

export async function commentOnPost(
  token: string,
  postId: number,
  payload: CreateCommentPayload
): Promise<PostComment> {
  return apiFetch<PostComment>(`/posts/${postId}/comments`, { method: "POST", token, body: payload });
}

export interface CreateRatingPayload {
  rating: number;
  review?: string;
}

export async function ratePost(token: string, postId: number, payload: CreateRatingPayload): Promise<PostRating> {
  return apiFetch<PostRating>(`/posts/${postId}/ratings`, { method: "POST", token, body: payload });
}
