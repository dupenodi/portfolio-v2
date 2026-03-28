"use client";
import { motion } from "framer-motion";

const projects = [
  {
    num: "01",
    name: "Retain Engine",
    tagline: "AI-powered customer retention automation",
    description:
      "Segments users using vector embeddings, predicts churn with LLM reasoning, and deploys hyper-personalized campaigns automatically across channels.",
    tags: ["Next.js", "Python", "LangChain", "Pinecone", "PostgreSQL"],
    accent: "#C05C42",
  },
  {
    num: "02",
    name: "CampaignForge",
    tagline: "LLM-driven campaign generation at scale",
    description:
      "Creates, A/B tests, and optimizes marketing copy with GPT-4. Multi-channel output with brand voice consistency via fine-tuned prompts.",
    tags: ["React", "FastAPI", "OpenAI", "Redis"],
    accent: "#4A7C6B",
  },
  {
    num: "03",
    name: "AgentFlow",
    tagline: "Visual multi-agent orchestration system",
    description:
      "Drag-and-drop agent graph editor for building and deploying AI pipelines. Real-time execution tracing and rollback capabilities.",
    tags: ["Next.js", "Go", "LangChain", "WebSockets", "Supabase"],
    accent: "#C05C42",
  },
  {
    num: "04",
    name: "DataPulse",
    tagline: "Real-time cohort analytics dashboard",
    description:
      "Tracks user behavior and retention metrics with custom event tracking, funnel analysis, and AI-generated insights via natural language queries.",
    tags: ["Next.js", "PostgreSQL", "Recharts", "Python"],
    accent: "#4A7C6B",
  },
];

export default function Projects() {
  return (
    <section id="projects" style={{ borderBottom: "1px solid var(--border)", padding: "5rem 3rem" }} className="projects-section">
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
              Projects
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
              Things I&apos;ve built.
            </motion.h2>
          </div>
          <a
            href="https://github.com/dupenodi"
            target="_blank"
            rel="noreferrer"
            style={{ fontSize: "0.8125rem", color: "var(--accent)", textDecoration: "none" }}
          >
            All on GitHub ↗
          </a>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px", background: "var(--border)" }} className="projects-grid">
          {projects.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: (i % 2) * 0.07 }}
              style={{
                padding: "2.25rem",
                background: "var(--parchment)",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--surface)")}
              onMouseLeave={e => (e.currentTarget.style.background = "var(--parchment)")}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
                <span style={{ fontFamily: "var(--dm-sans)", fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.1em", color: p.accent }}>
                  {p.num}
                </span>
                <span style={{ fontSize: "0.875rem", color: "var(--ink-soft)" }}>↗</span>
              </div>

              <h3 style={{ fontFamily: "var(--fraunces)", fontWeight: 700, fontSize: "1.25rem", color: "var(--ink)", marginBottom: "0.25rem", letterSpacing: "-0.01em" }}>
                {p.name}
              </h3>

              <p style={{ fontFamily: "var(--fraunces)", fontStyle: "italic", fontSize: "0.875rem", color: p.accent, marginBottom: "0.875rem" }}>
                {p.tagline}
              </p>

              <p style={{ fontSize: "0.875rem", color: "var(--ink-mid)", lineHeight: 1.75, marginBottom: "1.5rem" }}>
                {p.description}
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
                {p.tags.map((t) => (
                  <span key={t} style={{ padding: "0.2rem 0.625rem", fontSize: "0.7rem", border: "1px solid var(--border)", borderRadius: 4, color: "var(--ink-soft)", background: "var(--surface)" }}>
                    {t}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .projects-section { padding: 3.5rem 1.5rem !important; }
          .projects-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
