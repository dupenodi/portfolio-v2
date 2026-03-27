"use client";
import { motion } from "framer-motion";

const posts = [
  { title: "Building in public: lessons from shipping at a startup", tag: "Startups" },
  { title: "Why I write: documenting thought as a developer", tag: "Writing" },
  { title: "The human side of building AI products", tag: "AI" },
];

export default function Blog() {
  return (
    <section id="blog" style={{ borderBottom: "1px solid var(--border)" }}>
      {/* Header */}
      <div
        style={{ display: "grid", gridTemplateColumns: "200px 1fr", borderBottom: "1px solid var(--border)" }}
        className="blog-header-grid"
      >
        <div style={{ padding: "2rem 2.5rem", borderRight: "1px solid var(--border)" }}>
          <p className="label">Writing</p>
        </div>
        <div style={{ padding: "2rem 2.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            style={{
              fontFamily: "var(--fraunces), Georgia, serif",
              fontStyle: "italic",
              fontWeight: 700,
              fontSize: "clamp(1.4rem, 3vw, 2.25rem)",
              color: "var(--ink)",
              letterSpacing: "-0.02em",
            }}
          >
            Thoughts & words.
          </motion.h2>
          <a
            href="https://reminiscence.bearblog.dev"
            target="_blank"
            rel="noreferrer"
            style={{ fontSize: "0.8125rem", color: "var(--accent)", textDecoration: "none" }}
          >
            Read all posts ↗
          </a>
        </div>
      </div>

      {/* Featured */}
      <motion.a
        href="https://reminiscence.bearblog.dev"
        target="_blank"
        rel="noreferrer"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55 }}
        style={{
          display: "grid",
          gridTemplateColumns: "200px 1fr",
          borderBottom: "1px solid var(--border)",
          textDecoration: "none",
          transition: "background 0.15s ease",
        }}
        className="blog-featured-grid"
        onMouseEnter={e => (e.currentTarget.style.background = "var(--hover-bg)")}
        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
      >
        <div style={{ padding: "2.5rem 2.5rem", borderRight: "1px solid var(--border)" }}>
          <p style={{ fontFamily: "var(--fraunces)", fontStyle: "italic", fontWeight: 700, fontSize: "1.25rem", color: "var(--ink)" }}>
            Reminiscence
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--ink-soft)", marginTop: "0.25rem" }}>Blog</p>
        </div>
        <div style={{ padding: "2.5rem 2.5rem" }}>
          <p
            style={{
              fontFamily: "var(--fraunces)",
              fontStyle: "italic",
              fontSize: "1.5rem",
              fontWeight: 600,
              color: "var(--ink)",
              lineHeight: 1.35,
              letterSpacing: "-0.01em",
              marginBottom: "1rem",
              maxWidth: "40ch",
            }}
          >
            Writing on building, thinking, and traveling.
          </p>
          <p style={{ color: "var(--ink-mid)", fontSize: "0.9rem", maxWidth: "52ch", lineHeight: 1.75 }}>
            Personal essays and notes from the intersection of technology, travel, and reflection.
            Documenting thought as a developer and a human.
          </p>
          <p style={{ color: "var(--accent)", fontSize: "0.8125rem", marginTop: "1rem" }}>
            reminiscence.bearblog.dev ↗
          </p>
        </div>
      </motion.a>

      {/* Post list */}
      {posts.map((post, i) => (
        <motion.a
          key={post.title}
          href="https://reminiscence.bearblog.dev"
          target="_blank"
          rel="noreferrer"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: i * 0.06 }}
          style={{
            display: "grid",
            gridTemplateColumns: "200px 1fr",
            borderBottom: i < posts.length - 1 ? "1px solid var(--border)" : "none",
            textDecoration: "none",
            transition: "background 0.15s ease",
          }}
          className="blog-post-grid"
          onMouseEnter={e => (e.currentTarget.style.background = "var(--hover-bg)")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
          <div style={{ padding: "1.5rem 2.5rem", borderRight: "1px solid var(--border)" }}>
            <span
              style={{
                fontSize: "0.7rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--accent)",
              }}
            >
              {post.tag}
            </span>
          </div>
          <div style={{ padding: "1.5rem 2.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ fontFamily: "var(--fraunces)", fontSize: "0.9375rem", color: "var(--ink)", lineHeight: 1.5 }}>
              {post.title}
            </p>
            <span style={{ color: "var(--ink-soft)", fontSize: "0.875rem", flexShrink: 0, marginLeft: "1rem" }}>↗</span>
          </div>
        </motion.a>
      ))}

      <style>{`
        @media (max-width: 640px) {
          .blog-header-grid, .blog-featured-grid, .blog-post-grid {
            grid-template-columns: 1fr !important;
          }
          .blog-header-grid > div:first-child,
          .blog-featured-grid > div:first-child,
          .blog-post-grid > div:first-child {
            border-right: none !important;
            border-bottom: 1px solid var(--border);
          }
        }
      `}</style>
    </section>
  );
}
