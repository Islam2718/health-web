import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PostDetail } from "@/components/community/post-detail";
import { fetchPost } from "@/lib/posts";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const post = await fetchPost(id);
  if (!post) return { title: "Post Not Found | Ibnocare" };
  return {
    title: `${post.title?.trim() || "Community Post"} | Ibnocare`,
    description: post.body?.slice(0, 160) || "A community post on Ibnocare.",
  };
}

export default async function CommunityPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await fetchPost(id);

  if (!post) notFound();

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/community"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
            Back to Community
          </Link>

          <div className="mt-6">
            <PostDetail post={post} />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
