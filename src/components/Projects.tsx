"use client";
import { motion } from "framer-motion";
import { ArrowUpRight, Star } from "lucide-react";
import type { GitHubRepo } from "@/lib/github";

const accents = ["#C05C42", "#4A7C6B"];

const fallback: Partial<GitHubRepo>[] = [
  { name: "Retain Engine", description: "AI-powered customer retention — segments users with vector embeddings, predicts churn, deploys personalized campaigns.", html_url: "https://github.com/dupenodi", language: "Python", topics: ["LangChain", "Pinecone", "Next.js"], stargazers_count: 0 },
  { name: "CampaignForge", description: "LLM-driven campaign generation at scale. A/B tests and optimizes marketing copy with GPT-4.", html_url: "https://github.com/dupenodi", language: "TypeScript", topics: ["OpenAI", "FastAPI", "Redis"], stargazers_count: 0 },
  { name: "AgentFlow", description: "Visual multi-agent orchestration — drag-and-drop graph editor for AI pipelines with real-time execution tracing.", html_url: "https://github.com/dupenodi", language: "Go", topics: ["LangChain", "WebSockets", "Supabase"], stargazers_count: 0 },
  { name: "DataPulse", description: "Real-time cohort analytics dashboard with funnel analysis and AI-generated insights via natural language.", html_url: "https://github.com/dupenodi", language: "Python", topics: ["Next.js", "PostgreSQL", "Recharts"], stargazers_count: 0 },
];

function RepoCard({ repo, index }: { repo: Partial<GitHubRepo>; index: number }) {
  const accent = accents[index % 2];
  const tags = (repo.topics && repo.topics.length > 0) ? repo.topics.slice(0, 4) : repo.language ? [repo.language] : [];

  return (
    <motion.a
      href={repo.html_url}
      target="_blank"
      rel="noreferrer"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: (index % 3) * 0.05 }}
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "1.5rem",
        background: "var(--parchment)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        textDecoration: "none",
        transition: "background 0.15s, border-color 0.15s",
        gap: "0.625rem",
      }}
      onMouseEnter={e => { e.currentTarget.style.background = "var(--surface)"; e.currentTarget.style.borderColor = accent; }}
      onMouseLeave={e => { e.currentTarget.style.background = "var(--parchment)"; e.currentTarget.style.borderColor = "var(--border)"; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <h3 style={{ fontFamily: "var(--fraunces)", fontWeight: 700, fontSize: "1rem", color: "var(--ink)", letterSpacing: "-0.01em" }}>
          {repo.name}
        </h3>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
          {(repo.stargazers_count ?? 0) > 0 && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.2rem", fontSize: "0.7rem", color: "var(--ink-soft)" }}>
              <Star size={11} /> {repo.stargazers_count}
            </span>
          )}
          <ArrowUpRight size={14} style={{ color: "var(--ink-soft)" }} />
        </div>
      </div>

      {repo.description && (
        <p style={{ fontSize: "0.8125rem", color: "var(--ink-mid)", lineHeight: 1.65, flex: 1 }}>
          {repo.description}
        </p>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem", marginTop: "auto" }}>
        {repo.language && (
          <span style={{ padding: "0.15rem 0.5rem", fontSize: "0.65rem", border: "1px solid var(--border)", borderRadius: 4, color: accent, background: "var(--surface)", fontWeight: 600 }}>
            {repo.language}
          </span>
        )}
        {tags.filter(t => t !== repo.language).map((t) => (
          <span key={t} style={{ padding: "0.15rem 0.5rem", fontSize: "0.65rem", border: "1px solid var(--border)", borderRadius: 4, color: "var(--ink-soft)", background: "var(--surface)" }}>
            {t}
          </span>
        ))}
      </div>
    </motion.a>
  );
}

export default function Projects({ repos }: { repos: GitHubRepo[] }) {
  const items = repos.length > 0 ? repos : fallback;

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
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", flexWrap: "wrap" }}>
            <a href="https://niti.ai" target="_blank" rel="noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", fontSize: "0.8125rem", color: "var(--accent)", textDecoration: "none" }}>
              Niti AI <ArrowUpRight size={13} />
            </a>
            <a href="https://github.com/dupenodi" target="_blank" rel="noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", fontSize: "0.8125rem", color: "var(--accent)", textDecoration: "none" }}>
              All on GitHub <ArrowUpRight size={13} />
            </a>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }} className="projects-grid">
          {items.map((repo, i) => (
            <RepoCard key={repo.name} repo={repo} index={i} />
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .projects-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 640px) {
          .projects-section { padding: 3.5rem 1.5rem !important; }
          .projects-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
