import type { MetadataRoute } from "next";
import { getPublishedPosts } from "@/lib/posts";
import { absoluteUrl, site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: site.url,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...getPublishedPosts().map((post) => ({
      url: absoluteUrl(`/writing/${post.slug}`),
      lastModified: new Date(post.metadata.date),
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}
