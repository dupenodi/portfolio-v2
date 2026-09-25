import Link from "next/link";
import { GListRow } from "@/retired/components/g-list-row";
import { SectionHead } from "@/retired/components/section-head";
import { formatPostDateShort } from "@/lib/format";
import { getPublishedPosts } from "@/lib/posts";
import { createMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = createMetadata({
  title: "writing",
  description: site.description,
  path: "/writing",
});

export default function WritingPage() {
  const posts = getPublishedPosts();

  return (
    <div className="page-enter">
      <SectionHead>writing</SectionHead>
      <div className="glist stagger">
        {posts.length === 0 ? (
          <p className="ref">essays coming soon.</p>
        ) : (
          posts.map((post) => (
            <GListRow
              key={post.slug}
              href={`/writing/${post.slug}`}
              index={formatPostDateShort(post.metadata.date)}
              title={post.metadata.title}
              meta={post.metadata.description}
            />
          ))
        )}
      </div>
      {posts.length > 0 ? (
        <p className="ref">
          subscribe via <Link href={site.writing.rssHref}>rss</Link>
        </p>
      ) : null}
    </div>
  );
}
