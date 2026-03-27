"use client";
import { motion } from "framer-motion";

const skillGroups = [
  {
    category: "Frontend",
    color: "#8b5cf6",
    skills: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Framer Motion", "Three.js"],
  },
  {
    category: "Backend",
    color: "#22d3ee",
    skills: ["Python", "Go", "FastAPI", "Node.js", "REST APIs", "WebSockets"],
  },
  {
    category: "AI & LLMs",
    color: "#a78bfa",
    skills: ["LangChain", "OpenAI API", "Vector DBs", "Pinecone", "RAG", "Prompt Engineering", "Agent Architectures"],
  },
  {
    category: "Data & Infra",
    color: "#06b6d4",
    skills: ["PostgreSQL", "Supabase", "Redis", "Docker", "Vercel", "Git", "CI/CD"],
  },
];

export default function Skills() {
  return (
    <section id="skills" className="py-32 md:py-40 px-6 relative overflow-hidden">
      <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="section-label mb-5"
        >
          // skills_&_tools
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="font-display font-bold text-4xl md:text-6xl tracking-tight mb-16"
        >
          My{" "}
          <span className="gradient-text">toolkit.</span>
        </motion.h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {skillGroups.map((group, gi) => (
            <motion.div
              key={group.category}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: gi * 0.08, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="glass rounded-2xl p-6 hover:border-white/[0.1] transition-colors duration-300"
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-2 h-6 rounded-full"
                  style={{ background: group.color }}
                />
                <p className="font-display font-semibold text-white text-sm tracking-wide">
                  {group.category}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {group.skills.map((skill, si) => (
                  <motion.span
                    key={skill}
                    initial={{ opacity: 0, scale: 0.85 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: gi * 0.06 + si * 0.04 }}
                    className="px-3 py-1.5 text-xs text-slate-400 rounded-full border border-white/[0.06] bg-white/[0.03] hover:border-white/[0.15] hover:text-slate-200 transition-all duration-200"
                    style={{ "--accent": group.color } as React.CSSProperties}
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
