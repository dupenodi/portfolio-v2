"use client";
import { motion } from "framer-motion";

const experiences = [
  {
    company: "Niti AI",
    role: "Full Stack Developer",
    type: "Full-time",
    period: "Aug 2023 — Present",
    duration: "2 yrs 8 mos",
    location: "Bengaluru, India",
    highlights: [
      "Designed and shipped foundational AI infrastructure supporting agent architecture, internal tooling, and customer-facing workflows.",
      "Integrated LLMs via LangChain, OpenAI, and vector databases to automate audience targeting, campaign generation, and execution.",
      "Built sleek interfaces in Next.js and React alongside robust Python/Go backends with Supabase & PostgreSQL.",
      "Wore multiple hats from infra planning and customer onboarding to live demos and product strategy.",
    ],
    tags: ["Next.js", "Python", "Go", "LangChain", "OpenAI", "Supabase", "PostgreSQL"],
    current: true,
  },
];

const education = [
  {
    school: "SSN College of Engineering",
    degree: "Bachelor of Engineering — Computer Science",
    period: "2020 — 2024",
    location: "Chennai, India",
  },
];

export default function Experience() {
  return (
    <section id="experience" className="py-32 md:py-40 px-6 relative">
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500/6 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="section-label mb-5"
        >
          // experience
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="font-display font-bold text-4xl md:text-6xl tracking-tight mb-16"
        >
          Where I&apos;ve{" "}
          <span className="gradient-text">worked.</span>
        </motion.h2>

        <div className="grid md:grid-cols-[1fr_2fr] gap-16">
          {/* Timeline */}
          <div className="relative">
            <div className="absolute left-3 top-3 bottom-0 w-px bg-gradient-to-b from-violet-500/50 to-transparent" />

            {experiences.map((exp, i) => (
              <motion.div
                key={exp.company}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="relative pl-10 mb-8"
              >
                <div className={`absolute left-0 top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  exp.current
                    ? "border-violet-500 bg-violet-500/20"
                    : "border-slate-700 bg-[#0d0d12]"
                }`}>
                  {exp.current && (
                    <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                  )}
                </div>
                <p className="text-white font-semibold">{exp.company}</p>
                <p className="text-slate-500 text-sm">{exp.period}</p>
              </motion.div>
            ))}

            {education.map((edu, i) => (
              <motion.div
                key={edu.school}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: (experiences.length + i) * 0.1 }}
                className="relative pl-10"
              >
                <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full border-2 border-slate-700 bg-[#0d0d12]" />
                <p className="text-white font-semibold">{edu.school}</p>
                <p className="text-slate-500 text-sm">{edu.period}</p>
              </motion.div>
            ))}
          </div>

          {/* Detail cards */}
          <div className="space-y-6">
            {experiences.map((exp, i) => (
              <motion.div
                key={exp.company}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                className="glass rounded-2xl p-8 hover:border-violet-500/15 transition-all duration-300 group"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-display font-bold text-xl text-white">{exp.role}</h3>
                      {exp.current && (
                        <span className="px-2 py-0.5 text-xs bg-green-500/10 text-green-400 border border-green-500/20 rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-violet-400 font-medium">{exp.company}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 text-sm">{exp.period}</p>
                    <p className="text-slate-600 text-xs">{exp.location}</p>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {exp.highlights.map((h, j) => (
                    <li key={j} className="flex gap-3 text-slate-400 text-sm leading-relaxed">
                      <span className="text-violet-500 mt-1 shrink-0">▸</span>
                      {h}
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap gap-2">
                  {exp.tags.map((t) => (
                    <span
                      key={t}
                      className="px-3 py-1 text-xs bg-white/[0.04] border border-white/[0.07] text-slate-400 rounded-full"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}

            {education.map((edu) => (
              <motion.div
                key={edu.school}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                className="glass rounded-2xl p-8 hover:border-cyan-500/10 transition-all duration-300"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="section-label mb-2">Education</p>
                    <h3 className="font-display font-bold text-lg text-white mb-1">{edu.degree}</h3>
                    <p className="text-cyan-400 font-medium">{edu.school}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 text-sm">{edu.period}</p>
                    <p className="text-slate-600 text-xs">{edu.location}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
