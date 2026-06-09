import type { MetadataRoute } from "next";
import { isBookmarksEnabled } from "@/lib/env";
import { getPublishedPosts } from "@/lib/posts";
import { site } from "@/lib/site";

const staticRoutes: {
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
}[] = [
  { path: "", priority: 1, changeFrequency: "weekly" },
  { path: "/work", priority: 0.8, changeFrequency: "monthly" },
  { path: "/projects", priority: 0.8, changeFrequency: "weekly" },
  { path: "/writing", priority: 0.9, changeFrequency: "weekly" },
  { path: "/travel", priority: 0.7, changeFrequency: "monthly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getPublishedPosts();

  const routes = isBookmarksEnabled()
    ? [...staticRoutes, { path: "/bookmarks", priority: 0.4, changeFrequency: "weekly" as const }]
    : staticRoutes;

  const staticEntries = routes.map(({ path, priority, changeFrequency }) => ({
    url: `${site.url}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));

  const postEntries = posts.map((post) => ({
    url: `${site.url}/writing/${post.slug}`,
    lastModified: new Date(post.metadata.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticEntries, ...postEntries];
}
