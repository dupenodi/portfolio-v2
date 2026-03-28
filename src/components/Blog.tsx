"use client";
import { motion } from "framer-motion";

const posts = [
  { title: "Building in public: lessons from shipping at a startup", tag: "Startups" },
  { title: "Why I write: documenting thought as a developer", tag: "Writing" },
  { title: "The human side of building AI products", tag: "AI" },
];

export default function Blog() {
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
          <a href="https://reminiscence.bearblog.dev" target="_blank" rel="noreferrer"
            style={{ fontSize: "0.8125rem", color: "var(--accent)", textDecoration: "none" }}>
            Read all posts ↗
          </a>
        </div>

        {/* Featured blog link */}
        <motion.a
          href="https://reminiscence.bearblog.dev"
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
            marginBottom: "1px",
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
          <p style={{ color: "var(--accent)", fontSize: "0.8125rem" }}>reminiscence.bearblog.dev ↗</p>
        </motion.a>

        {/* Post list */}
        <div style={{ borderTop: "1px solid var(--border)" }}>
          {posts.map((post, i) => (
            <motion.a
              key={post.title}
              href="https://reminiscence.bearblog.dev"
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
                padding: "1.25rem 0",
                borderBottom: "1px solid var(--border)",
                textDecoration: "none",
                gap: "1rem",
                transition: "background 0.12s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--hover-bg)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
                <span style={{ fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--accent)", flexShrink: 0 }}>
                  {post.tag}
                </span>
                <p style={{ fontFamily: "var(--fraunces)", fontSize: "0.9375rem", color: "var(--ink)", lineHeight: 1.4 }}>
                  {post.title}
                </p>
              </div>
              <span style={{ color: "var(--ink-soft)", flexShrink: 0 }}>↗</span>
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
