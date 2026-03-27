"use client";
import { motion } from "framer-motion";

const inView = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.55, delay },
});

export default function About() {
  return (
    <section id="about" style={{ borderBottom: "1px solid var(--border)" }}>
      {/* Section header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "200px 1fr",
          borderBottom: "1px solid var(--border)",
        }}
        className="about-header-grid"
      >
        <div style={{ padding: "2rem 2.5rem", borderRight: "1px solid var(--border)" }}>
          <p className="label">About</p>
        </div>
        <div style={{ padding: "2rem 2.5rem" }}>
          <motion.h2
            {...inView(0)}
            style={{
              fontFamily: "var(--fraunces), Georgia, serif",
              fontStyle: "italic",
              fontWeight: 700,
              fontSize: "clamp(1.6rem, 3.5vw, 2.5rem)",
              color: "var(--ink)",
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
              maxWidth: "36ch",
            }}
          >
            Building at the frontier — where the code ends and the product begins.
          </motion.h2>
        </div>
      </div>

      {/* Body */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "200px 1fr 1fr",
          minHeight: 320,
        }}
        className="about-body-grid"
      >
        {/* Empty left column */}
        <div style={{ borderRight: "1px solid var(--border)" }} />

        {/* Bio */}
        <div style={{ padding: "2.5rem 2.5rem 3rem", borderRight: "1px solid var(--border)" }}>
          <motion.div {...inView(0.1)} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <p style={{ color: "var(--ink-mid)", lineHeight: 1.8, fontSize: "0.9375rem" }}>
              I&apos;m Sharath — a full stack AI developer and founding engineer at{" "}
              <strong style={{ color: "var(--ink)", fontWeight: 600 }}>Niti AI</strong>,
              building AI-first infrastructure to power the future of retention marketing.
            </p>
            <p style={{ color: "var(--ink-mid)", lineHeight: 1.8, fontSize: "0.9375rem" }}>
              I work across the entire stack — sleek interfaces in{" "}
              <strong style={{ color: "var(--ink)", fontWeight: 500 }}>Next.js</strong> and React,
              robust backends in <strong style={{ color: "var(--ink)", fontWeight: 500 }}>Python</strong>{" "}
              and Go, and LLM integration via LangChain, OpenAI, and vector databases.
            </p>
            <p style={{ color: "var(--ink-mid)", lineHeight: 1.8, fontSize: "0.9375rem" }}>
              Being early means wearing every hat — building while listening, pitching while
              debugging, and shaping both the product and the platform behind it.
            </p>
            <p style={{ color: "var(--ink-mid)", lineHeight: 1.8, fontSize: "0.9375rem" }}>
              Outside code, I write, travel, and explore creative technology. Drawn to long
              conversations, language learning, and documenting thought.
            </p>
          </motion.div>
        </div>

        {/* Meta / links */}
        <div style={{ padding: "2.5rem 2.5rem 3rem" }}>
          <motion.div {...inView(0.2)} style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {/* Location */}
            <div>
              <p className="label" style={{ marginBottom: "0.375rem" }}>Based in</p>
              <p style={{ color: "var(--ink)", fontWeight: 500 }}>Bengaluru, India</p>
            </div>

            {/* Currently */}
            <div>
              <p className="label" style={{ marginBottom: "0.375rem" }}>Currently</p>
              <p style={{ color: "var(--ink)", fontWeight: 500 }}>
                Founding Engineer @ Niti AI
              </p>
              <p style={{ color: "var(--ink-soft)", fontSize: "0.875rem" }}>Aug 2023 — Present</p>
            </div>

            {/* Links */}
            <div>
              <p className="label" style={{ marginBottom: "0.75rem" }}>Links</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {[
                  { label: "GitHub", href: "https://github.com/dupenodi" },
                  { label: "LinkedIn", href: "https://linkedin.com/in/sarath-donepudi" },
                  { label: "Blog — Reminiscence", href: "https://reminiscence.bearblog.dev" },
                  { label: "Email", href: "mailto:hi@dupenodi.dev" },
                ].map((l) => (
                  <a
                    key={l.label}
                    href={l.href}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      color: "var(--accent)",
                      fontSize: "0.875rem",
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.375rem",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = "var(--ink)")}
                    onMouseLeave={e => (e.currentTarget.style.color = "var(--accent)")}
                  >
                    {l.label} ↗
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .about-header-grid { grid-template-columns: 1fr !important; }
          .about-header-grid > div:first-child { border-right: none !important; border-bottom: 1px solid var(--border); }
          .about-body-grid { grid-template-columns: 1fr !important; }
          .about-body-grid > div:first-child { display: none; }
          .about-body-grid > div { border-right: none !important; }
        }
      `}</style>
    </section>
  );
}
