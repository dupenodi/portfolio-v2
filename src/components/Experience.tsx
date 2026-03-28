"use client";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

const inView = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.55, delay },
});

export default function Experience() {
  return (
    <section id="experience" style={{ borderBottom: "1px solid var(--border)", padding: "5rem 3rem" }} className="exp-section">
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        <motion.p {...inView(0)} className="label" style={{ marginBottom: "0.75rem" }}>
          Experience
        </motion.p>

        <motion.h2
          {...inView(0.05)}
          style={{
            fontFamily: "var(--fraunces), Georgia, serif",
            fontStyle: "italic",
            fontWeight: 700,
            fontSize: "clamp(1.6rem, 3vw, 2.25rem)",
            color: "var(--ink)",
            letterSpacing: "-0.02em",
            marginBottom: "3rem",
          }}
        >
          Where I work.
        </motion.h2>

        {/* Niti AI */}
        <motion.div
          {...inView(0.1)}
          style={{
            borderTop: "1px solid var(--border)",
            paddingTop: "2.5rem",
            paddingBottom: "2.5rem",
            borderBottom: "1px solid var(--border)",
            marginBottom: "2rem",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "3rem" }} className="exp-row-grid">
            {/* Left — company meta */}
            <div>
              <a
                href="https://niti.ai"
                target="_blank"
                rel="noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", fontFamily: "var(--fraunces)", fontWeight: 700, fontSize: "1.125rem", color: "var(--ink)", marginBottom: "0.25rem", textDecoration: "none" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--accent)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--ink)")}
              >
                Niti AI <ExternalLink size={14} />
              </a>
              <p style={{ fontSize: "0.8125rem", color: "var(--ink-soft)", marginBottom: "0.75rem" }}>Aug 2023 — Present · 2 yrs+</p>
              <p style={{ fontSize: "0.8125rem", color: "var(--ink-soft)" }}>Bengaluru, India</p>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", marginTop: "0.875rem", padding: "0.25rem 0.625rem", background: "rgba(74,124,107,0.1)", border: "1px solid rgba(74,124,107,0.2)", borderRadius: 20 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#4A7C6B", display: "inline-block" }} />
                <span style={{ fontSize: "0.6875rem", color: "#4A7C6B", fontWeight: 600 }}>Current role</span>
              </div>
            </div>

            {/* Right — details */}
            <div>
              <p style={{ fontFamily: "var(--fraunces)", fontStyle: "italic", fontWeight: 600, fontSize: "1.25rem", color: "var(--ink)", marginBottom: "1.5rem" }}>
                Founding Engineer — Full Stack Developer
              </p>

              <ul style={{ display: "flex", flexDirection: "column", gap: "0.875rem", marginBottom: "2rem" }}>
                {[
                  "Designed and shipped foundational AI infrastructure supporting agent architecture, internal tooling, and customer-facing workflows.",
                  "Integrated LLMs via LangChain, OpenAI, and vector databases to automate audience targeting, campaign generation, and execution.",
                  "Built interfaces in Next.js/React alongside Python/Go backends with Supabase & PostgreSQL.",
                  "Wore every hat — infra planning, customer onboarding, live demos, and product strategy.",
                ].map((h, i) => (
                  <li key={i} style={{ display: "flex", gap: "0.75rem", color: "var(--ink-mid)", fontSize: "0.9rem", lineHeight: 1.7, listStyle: "none" }}>
                    <span style={{ color: "var(--accent)", flexShrink: 0, marginTop: "0.2em" }}>—</span>
                    {h}
                  </li>
                ))}
              </ul>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {["Next.js", "React", "Python", "Go", "LangChain", "OpenAI", "Supabase", "PostgreSQL"].map((t) => (
                  <span key={t} style={{ padding: "0.2rem 0.625rem", fontSize: "0.75rem", border: "1px solid var(--border)", borderRadius: 4, color: "var(--ink-soft)", background: "var(--surface)" }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>


      </div>

      <style>{`
        @media (max-width: 640px) {
          .exp-section { padding: 3.5rem 1.5rem !important; }
          .exp-row-grid { grid-template-columns: 1fr !important; gap: 1.25rem !important; }
        }
      `}</style>
    </section>
  );
}
