import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { z } from "zod";

const postsDirectory = path.join(process.cwd(), "content/posts");

const metadataSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z
    .union([z.string(), z.date()])
    .transform((value) =>
      value instanceof Date ? value.toISOString().slice(0, 10) : value
    ),
  draft: z.boolean().optional().default(false),
  highlight: z.boolean().optional().default(false),
  tags: z.array(z.string()).optional().default([]),
  answers: z.array(z.string()).optional().default([]),
});

export type PostMetadata = z.infer<typeof metadataSchema>;

export type Post = {
  slug: string;
  metadata: PostMetadata;
  content: string;
};

function getMdxFiles(): string[] {
  if (!fs.existsSync(postsDirectory)) return [];
  return fs.readdirSync(postsDirectory).filter((file) => file.endsWith(".mdx"));
}

function parsePost(filename: string): Post {
  const slug = path.basename(filename, ".mdx");
  const raw = fs.readFileSync(path.join(postsDirectory, filename), "utf-8");
  const { data, content } = matter(raw);
  const metadata = metadataSchema.parse(data);

  return { slug, metadata, content };
}

export function getAllPosts(): Post[] {
  return getMdxFiles()
    .map(parsePost)
    .sort(
      (a, b) =>
        new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime()
    );
}

export function getPublishedPosts(): Post[] {
  return getAllPosts().filter((post) => !post.metadata.draft);
}

export function getPostBySlug(slug: string): Post | undefined {
  return getAllPosts().find((post) => post.slug === slug);
}

export function getHighlightedPost(): Post | undefined {
  const published = getPublishedPosts();
  return published.find((post) => post.metadata.highlight) ?? published[0];
}

export function getAdjacentPosts(slug: string): {
  prev: Post | null;
  next: Post | null;
} {
  const posts = getPublishedPosts();
  const index = posts.findIndex((post) => post.slug === slug);
  return {
    prev: index > 0 ? (posts[index - 1] ?? null) : null,
    next: index < posts.length - 1 ? (posts[index + 1] ?? null) : null,
  };
}

export function getReadingTime(content: string): string {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 225));
  return `${minutes} min read`;
}
