import { publicDb } from "@/lib/supabase";

// Essays live in Supabase (public.posts). The public client only ever sees non-drafts.

export type PostMetadata = {
  title: string;
  description: string;
  date: string;
  draft: boolean;
  tags: string[];
  answers: string[];
};

export type Post = {
  slug: string;
  metadata: PostMetadata;
  content: string;
};

type Row = {
  slug: string;
  title: string;
  description: string;
  body: string;
  published_at: string;
  draft: boolean;
  tags: string[];
  answers: string[];
};

const COLUMNS = "slug, title, description, body, published_at, draft, tags, answers";

function toPost(row: Row): Post {
  return {
    slug: row.slug,
    metadata: {
      title: row.title,
      description: row.description,
      date: row.published_at,
      draft: row.draft,
      tags: row.tags,
      answers: row.answers,
    },
    content: row.body,
  };
}

// Newest first.
export async function getPublishedPosts(): Promise<Post[]> {
  const db = publicDb();
  if (!db) return [];
  const { data, error } = await db.from("posts").select(COLUMNS).eq("draft", false).order("published_at", { ascending: false });
  if (error) {
    console.error("posts:", error.message);
    return [];
  }
  return (data as Row[]).map(toPost);
}

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  const posts = await getPublishedPosts();
  return posts.find((post) => post.slug === slug);
}

export async function getAdjacentPosts(slug: string): Promise<{ prev: Post | null; next: Post | null }> {
  const posts = await getPublishedPosts();
  const index = posts.findIndex((post) => post.slug === slug);
  return {
    prev: index > 0 ? (posts[index - 1] ?? null) : null,
    next: index >= 0 && index < posts.length - 1 ? (posts[index + 1] ?? null) : null,
  };
}

export function getReadingTime(content: string): string {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 225));
  return `${minutes} min read`;
}
