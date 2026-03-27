"use client";
import { motion } from "framer-motion";

const inView = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.55, delay },
});

export default function Experience() {
  return (
    <section id="experience" style={{ borderBottom: "1px solid var(--border)" }}>
      {/* Header row */}
      <div
        style={{ display: "grid", gridTemplateColumns: "200px 1fr", borderBottom: "1px solid var(--border)" }}
        className="exp-header-grid"
      >
        <div style={{ padding: "2rem 2.5rem", borderRight: "1px solid var(--border)" }}>
          <p className="label">Experience</p>
        </div>
        <div style={{ padding: "2rem 2.5rem" }}>
          <motion.h2
            {...inView(0)}
            style={{
              fontFamily: "var(--fraunces), Georgia, serif",
              fontStyle: "italic",
              fontWeight: 700,
              fontSize: "clamp(1.4rem, 3vw, 2.25rem)",
              color: "var(--ink)",
              letterSpacing: "-0.02em",
            }}
          >
            Where I&apos;ve worked & learned.
          </motion.h2>
        </div>
      </div>

      {/* Niti AI */}
      <motion.div
        {...inView(0.1)}
        style={{ borderBottom: "1px solid var(--border)" }}
        className="exp-row"
      >
        <div style={{ display: "grid", gridTemplateColumns: "200px 1fr" }} className="exp-inner-grid">
          {/* Left */}
          <div
            style={{
              padding: "2.5rem 2.5rem",
              borderRight: "1px solid var(--border)",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
              <p style={{ fontFamily: "var(--fraunces)", fontWeight: 700, fontSize: "0.9375rem", color: "var(--ink)" }}>
                Niti AI
              </p>
              <p style={{ fontSize: "0.8125rem", color: "var(--ink-soft)" }}>Aug 2023 — Present</p>
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.375rem",
                marginTop: "0.5rem",
                fontSize: "0.7rem",
                color: "#4A7C6B",
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4A7C6B", display: "inline-block" }} />
                Current
              </span>
            </div>
          </div>

          {/* Right */}
          <div style={{ padding: "2.5rem 2.5rem 3rem" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
              <div>
                <h3 style={{ fontFamily: "var(--fraunces)", fontWeight: 700, fontSize: "1.25rem", color: "var(--ink)", marginBottom: "0.25rem" }}>
                  Full Stack Developer
                </h3>
                <p style={{ color: "var(--accent)", fontSize: "0.875rem", fontWeight: 500 }}>Full-time · Bengaluru, India</p>
              </div>
            </div>

            <ul style={{ display: "flex", flexDirection: "column", gap: "0.875rem", marginBottom: "2rem" }}>
              {[
                "Designed and shipped foundational AI infrastructure supporting agent architecture, internal tooling, and customer-facing workflows.",
                "Integrated LLMs via LangChain, OpenAI, and vector databases to automate audience targeting, campaign generation, and execution.",
                "Built sleek interfaces in Next.js and React alongside robust Python/Go backends with Supabase & PostgreSQL.",
                "Wore multiple hats from infra planning and customer onboarding to live demos and product strategy.",
              ].map((h, i) => (
                <li key={i} style={{ display: "flex", gap: "0.75rem", color: "var(--ink-mid)", fontSize: "0.9rem", lineHeight: 1.7 }}>
                  <span style={{ color: "var(--accent)", flexShrink: 0, marginTop: "0.1em" }}>—</span>
                  {h}
                </li>
              ))}
            </ul>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {["Next.js", "React", "Python", "Go", "LangChain", "OpenAI", "Supabase", "PostgreSQL"].map((t) => (
                <span
                  key={t}
                  style={{
                    padding: "0.25rem 0.75rem",
                    fontSize: "0.75rem",
                    border: "1px solid var(--border)",
                    borderRadius: 4,
                    color: "var(--ink-mid)",
                    background: "var(--surface)",
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Education */}
      <motion.div {...inView(0.2)} className="exp-row">
        <div style={{ display: "grid", gridTemplateColumns: "200px 1fr" }} className="exp-inner-grid">
          <div style={{ padding: "2.5rem 2.5rem", borderRight: "1px solid var(--border)" }}>
            <p style={{ fontFamily: "var(--fraunces)", fontWeight: 700, fontSize: "0.9375rem", color: "var(--ink)", marginBottom: "0.375rem" }}>
              SSN College of Engineering
            </p>
            <p style={{ fontSize: "0.8125rem", color: "var(--ink-soft)" }}>2020 — 2024</p>
          </div>
          <div style={{ padding: "2.5rem 2.5rem 3rem" }}>
            <p className="label" style={{ marginBottom: "0.5rem" }}>Education</p>
            <h3 style={{ fontFamily: "var(--fraunces)", fontWeight: 700, fontSize: "1.125rem", color: "var(--ink)", marginBottom: "0.25rem" }}>
              Bachelor of Engineering — Computer Science
            </h3>
            <p style={{ color: "var(--ink-soft)", fontSize: "0.875rem" }}>Chennai, India</p>
          </div>
        </div>
      </motion.div>

      <style>{`
        @media (max-width: 640px) {
          .exp-header-grid { grid-template-columns: 1fr !important; }
          .exp-header-grid > div:first-child { border-right: none !important; border-bottom: 1px solid var(--border); }
          .exp-inner-grid { grid-template-columns: 1fr !important; }
          .exp-inner-grid > div:first-child { border-right: none !important; border-bottom: 1px solid var(--border); }
        }
      `}</style>
    </section>
  );
}
