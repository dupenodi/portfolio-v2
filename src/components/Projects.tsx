"use client";
import { useRef } from "react";
import { motion } from "framer-motion";

const projects = [
  {
    index: "01",
    name: "Retain Engine",
    description:
      "AI-powered customer retention automation platform. Segments users using vector embeddings, predicts churn with LLM reasoning, and deploys hyper-personalized campaigns automatically across channels.",
    tags: ["Next.js", "Python", "LangChain", "Pinecone", "PostgreSQL", "Supabase"],
    color: "from-violet-600/20 to-transparent",
    accent: "#8b5cf6",
  },
  {
    index: "02",
    name: "CampaignForge",
    description:
      "LLM-driven campaign generation tool that creates, A/B tests, and optimizes marketing copy at scale. Supports multi-channel output with brand voice consistency enforced via fine-tuned prompts.",
    tags: ["React", "FastAPI", "OpenAI", "Redis", "Tailwind CSS"],
    color: "from-cyan-600/20 to-transparent",
    accent: "#22d3ee",
  },
  {
    index: "03",
    name: "AgentFlow",
    description:
      "Visual multi-agent orchestration system for building and deploying AI pipelines. Drag-and-drop agent graph editor with real-time execution tracing and rollback capabilities.",
    tags: ["Next.js", "Go", "LangChain", "WebSockets", "Supabase"],
    color: "from-violet-600/15 to-transparent",
    accent: "#a78bfa",
  },
  {
    index: "04",
    name: "DataPulse",
    description:
      "Real-time cohort analytics dashboard for tracking user behavior and retention metrics. Supports custom event tracking, funnel analysis, and AI-generated insights with natural language queries.",
    tags: ["Next.js", "PostgreSQL", "Recharts", "Python", "Supabase"],
    color: "from-cyan-600/15 to-transparent",
    accent: "#06b6d4",
  },
];

function TiltCard({ project, index }: { project: typeof projects[0]; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(1000px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg) scale(1.01)`;
  };

  const handleMouseLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = "perspective(1000px) rotateX(0) rotateY(0) scale(1)";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="tilt-card glass rounded-2xl p-7 group hover:border-white/[0.12] transition-colors duration-300 flex flex-col"
    >
      {/* Top */}
      <div className="flex items-start justify-between mb-6">
        <span className="font-display font-black text-5xl text-white/[0.04] select-none leading-none">
          {project.index}
        </span>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span className="text-xs text-slate-500 tracking-wider">View</span>
          <div
            className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/50 group-hover:border-white/30 group-hover:text-white transition-all duration-200"
          >
            ↗
          </div>
        </div>
      </div>

      {/* Gradient line */}
      <div
        className={`w-12 h-0.5 rounded-full mb-5 bg-gradient-to-r ${project.color}`}
        style={{ background: `linear-gradient(to right, ${project.accent}80, transparent)` }}
      />

      <h3 className="font-display font-bold text-xl text-white mb-3 group-hover:text-violet-100 transition-colors duration-200">
        {project.name}
      </h3>

      <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-1">
        {project.description}
      </p>

      <div className="flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="px-2.5 py-1 text-xs bg-white/[0.04] border border-white/[0.06] text-slate-500 rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

export default function Projects() {
  return (
    <section id="projects" className="py-32 md:py-40 px-6 relative">
      <div className="absolute right-0 bottom-0 w-96 h-96 bg-violet-600/8 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="section-label mb-5"
        >
          // selected_work
        </motion.p>

        <div className="flex flex-wrap items-end justify-between gap-6 mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="font-display font-bold text-4xl md:text-6xl tracking-tight"
          >
            Things I&apos;ve{" "}
            <span className="gradient-text">built.</span>
          </motion.h2>

          <motion.a
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            href="https://github.com/dupenodi"
            target="_blank"
            rel="noreferrer"
            className="text-sm text-slate-400 hover:text-white transition-colors border-b border-slate-700 hover:border-slate-400 pb-0.5"
          >
            All on GitHub ↗
          </motion.a>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          {projects.map((p, i) => (
            <TiltCard key={p.name} project={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
