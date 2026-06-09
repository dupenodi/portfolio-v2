import { notFound } from "next/navigation";
import { BackLink } from "@/components/back-link";
import { GListRow } from "@/components/g-list-row";
import { SectionHead } from "@/components/section-head";
import { isBookmarksEnabled } from "@/lib/env";
import { getBookmarks } from "@/lib/raindrop";
import type { Bookmark } from "@/lib/raindrop";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "bookmarks",
  description: "links sharath has saved — articles, tools, and rabbit holes.",
  path: "/bookmarks",
  noIndex: !isBookmarksEnabled(),
});

export default async function BookmarksPage() {
  if (!isBookmarksEnabled()) notFound();

  const bookmarks = await getBookmarks();

  const groups: Record<string, Bookmark[]> = {};
  for (const b of bookmarks) {
    const key = b.tags.find((t) => t !== "portfolio") ?? "misc";
    if (!groups[key]) groups[key] = [];
    groups[key].push(b);
  }

  return (
    <div className="page-enter">
      <BackLink href="/">index</BackLink>
      <SectionHead>bookmarks</SectionHead>
      <p className="d-body" style={{ marginBottom: "2rem" }}>
        things i&apos;ve found interesting — no curation strategy, just stuff i liked.
      </p>
      {Object.keys(groups).length === 0 ? (
        <p className="ref">nothing saved yet.</p>
      ) : (
        Object.entries(groups).map(([tag, items]) => (
          <section key={tag} className="block">
            <SectionHead>{tag}</SectionHead>
            <div className="glist">
              {items.map((b) => (
                <GListRow
                  key={b._id}
                  href={b.link}
                  index={b.domain}
                  title={b.title}
                  meta={b.excerpt}
                  external
                />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
