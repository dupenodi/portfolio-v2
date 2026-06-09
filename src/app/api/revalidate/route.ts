import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { GITHUB_CONTRIBUTIONS_TAG } from "@/lib/github-contributions";
import { GITHUB_REPOS_TAG } from "@/lib/github";
import { getPublishedPosts } from "@/lib/posts";

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  const expected = process.env.REVALIDATE_SECRET;

  if (!expected || secret !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const slug = request.nextUrl.searchParams.get("slug");
  const paths = new Set([
    "/",
    "/projects",
    "/writing",
    "/travel",
    "/rss.xml",
    "/sitemap.xml",
  ]);

  revalidateTag(GITHUB_REPOS_TAG, { expire: 0 });
  revalidateTag(GITHUB_CONTRIBUTIONS_TAG, { expire: 0 });

  for (const path of paths) {
    revalidatePath(path);
  }

  revalidatePath("/writing", "layout");

  for (const post of getPublishedPosts()) {
    paths.add(`/writing/${post.slug}`);
    revalidatePath(`/writing/${post.slug}`);
  }

  if (slug) {
    paths.add(`/writing/${slug}`);
    revalidatePath(`/writing/${slug}`);
  }

  return NextResponse.json({
    revalidated: true,
    paths: [...paths],
    at: new Date().toISOString(),
  });
}
