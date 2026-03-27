"use client";
import { motion } from "framer-motion";

const groups = [
  {
    category: "Frontend",
    skills: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Framer Motion"],
  },
  {
    category: "Backend",
    skills: ["Python", "Go", "FastAPI", "Node.js", "REST APIs", "WebSockets"],
  },
  {
    category: "AI & LLMs",
    skills: ["LangChain", "OpenAI API", "Vector DBs", "Pinecone", "RAG", "Agent Design"],
  },
  {
    category: "Data & Infra",
    skills: ["PostgreSQL", "Supabase", "Redis", "Docker", "Vercel", "Git"],
  },
];

export default function Skills() {
  return (
    <section id="skills" style={{ borderBottom: "1px solid var(--border)" }}>
      {/* Header */}
      <div
        style={{ display: "grid", gridTemplateColumns: "200px 1fr", borderBottom: "1px solid var(--border)" }}
        className="skills-header-grid"
      >
        <div style={{ padding: "2rem 2.5rem", borderRight: "1px solid var(--border)" }}>
          <p className="label">Skills</p>
        </div>
        <div style={{ padding: "2rem 2.5rem" }}>
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
            My toolkit.
          </motion.h2>
        </div>
      </div>

      {/* Skills grid */}
      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr 1fr 1fr 1fr" }} className="skills-body-grid">
        <div style={{ borderRight: "1px solid var(--border)" }} />
        {groups.map((g, gi) => (
          <motion.div
            key={g.category}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: gi * 0.07 }}
            style={{
              padding: "2.5rem 2rem 3rem",
              borderRight: gi < groups.length - 1 ? "1px solid var(--border)" : "none",
            }}
          >
            <p className="label" style={{ marginBottom: "1.25rem" }}>{g.category}</p>
            <ul style={{ display: "flex", flexDirection: "column", gap: "0.625rem", listStyle: "none" }}>
              {g.skills.map((s) => (
                <li
                  key={s}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontSize: "0.875rem",
                    color: "var(--ink-mid)",
                  }}
                >
                  <span style={{ color: "var(--accent)", fontSize: "0.6rem" }}>●</span>
                  {s}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .skills-header-grid { grid-template-columns: 1fr !important; }
          .skills-header-grid > div:first-child { border-right: none !important; border-bottom: 1px solid var(--border); }
          .skills-body-grid { grid-template-columns: 1fr 1fr !important; }
          .skills-body-grid > div:first-child { display: none; }
        }
        @media (max-width: 520px) {
          .skills-body-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
