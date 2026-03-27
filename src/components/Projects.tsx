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
      "Creates, A/B tests, and optimizes marketing copy with GPT-4. Supports multi-channel output with brand voice consistency via fine-tuned prompts.",
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
    <section id="projects" style={{ borderBottom: "1px solid var(--border)" }}>
      {/* Header */}
      <div
        style={{ display: "grid", gridTemplateColumns: "200px 1fr", borderBottom: "1px solid var(--border)" }}
        className="proj-header-grid"
      >
        <div style={{ padding: "2rem 2.5rem", borderRight: "1px solid var(--border)" }}>
          <p className="label">Projects</p>
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
            Things I&apos;ve built.
          </motion.h2>
          <a
            href="https://github.com/dupenodi"
            target="_blank"
            rel="noreferrer"
            style={{ fontSize: "0.8125rem", color: "var(--accent)", textDecoration: "none" }}
          >
            All on GitHub ↗
          </a>
        </div>
      </div>

      {/* Grid */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}
        className="proj-grid"
      >
        {projects.map((p, i) => (
          <motion.div
            key={p.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: (i % 2) * 0.08 }}
            style={{
              padding: "2.5rem",
              borderRight: i % 2 === 0 ? "1px solid var(--border)" : "none",
              borderBottom: i < 2 ? "1px solid var(--border)" : "none",
            }}
            className="proj-card"
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.5rem" }}>
              <span
                style={{
                  fontFamily: "var(--dm-sans)",
                  fontSize: "0.625rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  color: p.accent,
                }}
              >
                {p.num}
              </span>
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "var(--ink-soft)",
                  opacity: 0.6,
                }}
              >
                ↗
              </span>
            </div>

            <h3
              style={{
                fontFamily: "var(--fraunces)",
                fontWeight: 700,
                fontSize: "1.25rem",
                color: "var(--ink)",
                marginBottom: "0.375rem",
                letterSpacing: "-0.01em",
              }}
            >
              {p.name}
            </h3>

            <p
              style={{
                fontFamily: "var(--fraunces)",
                fontStyle: "italic",
                fontSize: "0.875rem",
                color: "var(--accent)",
                marginBottom: "0.875rem",
              }}
            >
              {p.tagline}
            </p>

            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--ink-mid)",
                lineHeight: 1.75,
                marginBottom: "1.5rem",
              }}
            >
              {p.description}
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
              {p.tags.map((t) => (
                <span
                  key={t}
                  style={{
                    padding: "0.2rem 0.625rem",
                    fontSize: "0.7rem",
                    border: "1px solid var(--border)",
                    borderRadius: 4,
                    color: "var(--ink-soft)",
                    background: "var(--surface)",
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <style>{`
        @media (max-width: 640px) {
          .proj-header-grid { grid-template-columns: 1fr !important; }
          .proj-header-grid > div:first-child { border-right: none !important; border-bottom: 1px solid var(--border); }
          .proj-grid { grid-template-columns: 1fr !important; }
          .proj-card { border-right: none !important; border-bottom: 1px solid var(--border) !important; }
        }
      `}</style>
    </section>
  );
}
