"use client";
import { motion } from "framer-motion";

const groups = [
  { category: "Frontend", skills: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Framer Motion"] },
  { category: "Backend", skills: ["Python", "Go", "FastAPI", "Node.js", "WebSockets"] },
  { category: "AI & LLMs", skills: ["LangChain", "OpenAI API", "Vector DBs", "Pinecone", "RAG", "Agent Design"] },
  { category: "Data & Infra", skills: ["PostgreSQL", "Supabase", "Redis", "Docker", "Vercel", "Git"] },
];

export default function Skills() {
  return (
    <section id="skills" style={{ borderBottom: "1px solid var(--border)", padding: "5rem 3rem" }} className="skills-section">
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="label"
          style={{ marginBottom: "0.75rem" }}
        >
          Skills
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
            marginBottom: "3.5rem",
          }}
        >
          My toolkit.
        </motion.h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0px", borderTop: "1px solid var(--border)", borderLeft: "1px solid var(--border)" }} className="skills-grid">
          {groups.map((g, gi) => (
            <motion.div
              key={g.category}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: gi * 0.07 }}
              style={{
                padding: "2rem 1.75rem",
                borderRight: "1px solid var(--border)",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <p className="label" style={{ marginBottom: "1.25rem" }}>{g.category}</p>
              <ul style={{ display: "flex", flexDirection: "column", gap: "0.625rem", listStyle: "none" }}>
                {g.skills.map((s) => (
                  <li key={s} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "var(--ink-mid)" }}>
                    <span style={{ color: "var(--accent)", fontSize: "0.5rem" }}>●</span>
                    {s}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .skills-section { padding: 3.5rem 1.5rem !important; }
          .skills-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          .skills-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
