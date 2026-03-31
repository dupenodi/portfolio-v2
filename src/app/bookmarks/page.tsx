import type { Metadata } from "next";
import Link from "next/link";
import { getBookmarks } from "@/lib/raindrop";
import type { Bookmark } from "@/lib/raindrop";

export const metadata: Metadata = {
  title: "Bookmarks — Sharath",
  description: "Links I've found worth saving.",
};

export default async function Bookmarks() {
  const bookmarks = await getBookmarks();

  const groups: Record<string, Bookmark[]> = {};
  for (const b of bookmarks) {
    const key = b.tags.find((t) => t !== "portfolio") ?? "misc";
    if (!groups[key]) groups[key] = [];
    groups[key].push(b);
  }

  return (
    <main style={{ minHeight: "100vh", paddingTop: 56 }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "5rem 3rem" }}>

        <p style={{ fontFamily: "var(--dm-sans), system-ui, sans-serif", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--accent)", marginBottom: "0.75rem" }}>
          Bookmarks
        </p>
        <h1 style={{ fontFamily: "var(--fraunces), Georgia, serif", fontStyle: "italic", fontWeight: 900, fontSize: "clamp(2.5rem, 6vw, 4rem)", lineHeight: 0.95, letterSpacing: "-0.03em", color: "var(--ink)", marginBottom: "1rem" }}>
          Links worth saving.
        </h1>
        <p style={{ fontSize: "0.9rem", color: "var(--ink-mid)", lineHeight: 1.7, marginBottom: "4rem", maxWidth: "48ch" }}>
          Things I&apos;ve found interesting — articles, tools, talks, rabbit holes. No curation strategy, just stuff I liked.
        </p>

        {Object.keys(groups).length === 0 ? (
          <p style={{ fontSize: "0.9rem", color: "var(--ink-soft)" }}>Nothing saved yet. Check back soon.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>
            {Object.entries(groups).map(([tag, items]) => (
              <div key={tag}>
                <p style={{ fontFamily: "var(--dm-sans), system-ui, sans-serif", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-soft)", marginBottom: "0.5rem" }}>
                  {tag}
                </p>
                <div style={{ borderTop: "1px solid var(--border)" }}>
                  {items.map((b) => (
                    <a
                      key={b._id}
                      href={b.link}
                      target="_blank"
                      rel="noreferrer"
                      className="bookmark-row"
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: "var(--fraunces), Georgia, serif", fontSize: "0.9375rem", fontWeight: 600, color: "var(--ink)", marginBottom: "0.25rem", letterSpacing: "-0.01em" }}>
                          {b.title}
                        </p>
                        {b.excerpt && (
                          <p style={{ fontSize: "0.8125rem", color: "var(--ink-mid)", lineHeight: 1.6, marginBottom: "0.5rem" }}>
                            {b.excerpt}
                          </p>
                        )}
                        <span style={{ fontSize: "0.75rem", color: "var(--ink-soft)" }}>{b.domain}</span>
                      </div>
                      <span style={{ fontSize: "0.8125rem", color: "var(--ink-soft)", flexShrink: 0, marginTop: "0.125rem" }}>↗</span>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <style>{`
          .bookmark-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 1rem;
            padding: 1rem 0.5rem;
            border-bottom: 1px solid var(--border);
            text-decoration: none;
            transition: background 0.12s;
            border-radius: 4px;
          }
          .bookmark-row:hover { background: var(--hover-bg); }
        `}</style>

        <div style={{ marginTop: "4rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <Link href="/" style={{ fontSize: "0.875rem", color: "var(--accent)", textDecoration: "none" }}>
            ← Back home
          </Link>
          <p style={{ fontSize: "0.8125rem", color: "var(--ink-soft)" }}>
            Saved with{" "}
            <a href="https://raindrop.io" target="_blank" rel="noreferrer" style={{ color: "var(--ink-soft)", textDecoration: "underline", textUnderlineOffset: 3 }}>
              Raindrop.io
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
