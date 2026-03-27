"use client";
import { motion } from "framer-motion";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay },
});

export default function About() {
  return (
    <section id="about" className="py-32 md:py-40 px-6 relative">
      {/* Background glow */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-violet-600/8 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-center">
          {/* Left */}
          <div>
            <motion.p {...fadeUp(0)} className="section-label mb-5">
              // about_me
            </motion.p>

            <motion.h2
              {...fadeUp(0.1)}
              className="font-display font-bold text-4xl md:text-6xl leading-tight tracking-tight mb-8"
            >
              Building the future,{" "}
              <span className="gradient-text">one layer at a time.</span>
            </motion.h2>

            <motion.div {...fadeUp(0.2)} className="space-y-4 text-slate-400 leading-relaxed">
              <p>
                I&apos;m Sharath — a full stack AI developer and founding engineer at{" "}
                <span className="text-white">Niti AI</span>, where I&apos;m helping build
                AI-first infrastructure to power the future of retention marketing.
              </p>
              <p>
                I work across the entire stack: building sleek interfaces in{" "}
                <span className="text-slate-300">Next.js</span> and{" "}
                <span className="text-slate-300">React</span>, robust backends in{" "}
                <span className="text-slate-300">Python</span> and{" "}
                <span className="text-slate-300">Go</span>, and integrating LLMs via{" "}
                <span className="text-slate-300">LangChain</span> and{" "}
                <span className="text-slate-300">OpenAI</span> for audience targeting,
                campaign generation, and agent orchestration.
              </p>
              <p>
                Being early means wearing every hat — building while listening, pitching
                while debugging, and shaping both the product and the platform behind it.
              </p>
              <p>
                Outside code, I write, travel, and explore creative technology. I&apos;m
                drawn to long conversations, language learning, and documenting thought.
              </p>
            </motion.div>

            <motion.div {...fadeUp(0.3)} className="mt-8 flex gap-4">
              <a
                href="https://reminiscence.bearblog.dev"
                target="_blank"
                rel="noreferrer"
                className="text-sm text-violet-400 hover:text-violet-300 transition-colors border-b border-violet-400/30 hover:border-violet-300/50 pb-0.5"
              >
                Read my writing ↗
              </a>
              <a
                href="https://github.com/dupenodi"
                target="_blank"
                rel="noreferrer"
                className="text-sm text-slate-400 hover:text-slate-300 transition-colors border-b border-slate-400/30 hover:border-slate-300/50 pb-0.5"
              >
                GitHub ↗
              </a>
            </motion.div>
          </div>

          {/* Right — stats */}
          <motion.div {...fadeUp(0.2)} className="grid grid-cols-2 gap-4">
            {[
              { value: "2+", label: "Years building", sub: "@ Niti AI" },
              { value: "0→1", label: "Founding engineer", sub: "Full ownership" },
              { value: "∞", label: "Hats worn", sub: "Infra to onboarding" },
              { value: "AI", label: "Native stack", sub: "LLMs, agents, RAG" },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, scale: 0.92 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * i, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                className="glass rounded-2xl p-6 hover:border-violet-500/20 transition-colors duration-300 group"
              >
                <p className="font-display font-black text-4xl gradient-text mb-2 group-hover:scale-105 transition-transform duration-300">
                  {s.value}
                </p>
                <p className="text-white text-sm font-medium mb-1">{s.label}</p>
                <p className="text-slate-500 text-xs">{s.sub}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
