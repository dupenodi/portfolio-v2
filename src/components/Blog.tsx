"use client";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { BlogPost } from "@/lib/blog-feed";

const BLOG_URL = "https://reminiscence.bearblog.dev";

const fallbackPosts: BlogPost[] = [
  { title: "Building in public: lessons from shipping at a startup", link: BLOG_URL, pubDate: "", description: "" },
  { title: "Why I write: documenting thought as a developer", link: BLOG_URL, pubDate: "", description: "" },
  { title: "The human side of building AI products", link: BLOG_URL, pubDate: "", description: "" },
];

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", year: "numeric" });
  } catch {
    return "";
  }
}

export default function Blog({ posts }: { posts: BlogPost[] }) {
  const items = posts.length > 0 ? posts : fallbackPosts;

  return (
    <section id="blog" style={{ borderBottom: "1px solid var(--border)", padding: "5rem 3rem" }} className="blog-section">
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "3rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="label"
              style={{ marginBottom: "0.75rem" }}
            >
              Writing
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.05 }}
              style={{
                fontFamily: "var(--fraunces), Georgia, serif",
                fontStyle: "italic",
                fontWeight: 700,
                fontSize: "clamp(1.6rem, 3vw, 2.25rem)",
                color: "var(--ink)",
                letterSpacing: "-0.02em",
              }}
            >
              Thoughts &amp; words.
            </motion.h2>
          </div>
          <a href={BLOG_URL} target="_blank" rel="noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", fontSize: "0.8125rem", color: "var(--accent)", textDecoration: "none" }}>
            Read all posts <ArrowUpRight size={13} />
          </a>
        </div>

        {/* Featured blog card */}
        <motion.a
          href={BLOG_URL}
          target="_blank"
          rel="noreferrer"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          style={{
            display: "block",
            padding: "2.5rem",
            border: "1px solid var(--border)",
            borderRadius: 10,
            textDecoration: "none",
            marginBottom: "2rem",
            transition: "background 0.15s, border-color 0.15s",
            background: "var(--surface)",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; }}
        >
          <p className="label" style={{ marginBottom: "1rem" }}>Personal blog</p>
          <p style={{ fontFamily: "var(--fraunces)", fontStyle: "italic", fontWeight: 700, fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)", color: "var(--ink)", lineHeight: 1.3, letterSpacing: "-0.01em", marginBottom: "0.875rem", maxWidth: "38ch" }}>
            Reminiscence — writing on building, thinking, and traveling.
          </p>
          <p style={{ color: "var(--ink-mid)", fontSize: "0.9rem", maxWidth: "52ch", lineHeight: 1.75, marginBottom: "1.25rem" }}>
            Personal essays and notes from the intersection of technology, travel, and reflection.
          </p>
          <p style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "var(--accent)", fontSize: "0.8125rem" }}>
            reminiscence.bearblog.dev <ArrowUpRight size={13} />
          </p>
        </motion.a>

        {/* Post list */}
        <div>
          {items.map((post, i) => (
            <motion.a
              key={post.title}
              href={post.link || BLOG_URL}
              target="_blank"
              rel="noreferrer"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.06 }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "1rem 0.5rem",
                borderTop: i === 0 ? "1px solid var(--border)" : "none",
                borderBottom: "1px solid var(--border)",
                textDecoration: "none",
                gap: "1rem",
                transition: "background 0.12s",
                borderRadius: 4,
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--hover-bg)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <p style={{ fontFamily: "var(--fraunces)", fontSize: "0.9375rem", color: "var(--ink)", lineHeight: 1.4 }}>
                {post.title}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexShrink: 0 }}>
                {post.pubDate && (
                  <span style={{ fontSize: "0.75rem", color: "var(--ink-soft)" }}>{formatDate(post.pubDate)}</span>
                )}
                <ArrowUpRight size={15} style={{ color: "var(--ink-soft)" }} />
              </div>
            </motion.a>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .blog-section { padding: 3.5rem 1.5rem !important; }
        }
      `}</style>
    </section>
  );
}
