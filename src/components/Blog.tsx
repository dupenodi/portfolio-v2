"use client";
import { motion } from "framer-motion";

const posts = [
  {
    title: "Building in public: lessons from shipping at a startup",
    tag: "Startups",
    readTime: "5 min",
  },
  {
    title: "Why I write: documenting thought as a developer",
    tag: "Writing",
    readTime: "3 min",
  },
  {
    title: "The human side of building AI products",
    tag: "AI",
    readTime: "6 min",
  },
];

export default function Blog() {
  return (
    <section id="blog" className="py-32 md:py-40 px-6 relative">
      <div className="absolute left-0 bottom-0 w-80 h-80 bg-cyan-500/6 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="section-label mb-5"
        >
          // writing
        </motion.p>

        <div className="flex flex-wrap items-end justify-between gap-6 mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="font-display font-bold text-4xl md:text-6xl tracking-tight"
          >
            Thoughts &amp;{" "}
            <span className="gradient-text">words.</span>
          </motion.h2>

          <motion.a
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            href="https://reminiscence.bearblog.dev"
            target="_blank"
            rel="noreferrer"
            className="text-sm text-slate-400 hover:text-white transition-colors border-b border-slate-700 hover:border-slate-400 pb-0.5"
          >
            All posts ↗
          </motion.a>
        </div>

        {/* Featured writing card */}
        <motion.a
          href="https://reminiscence.bearblog.dev"
          target="_blank"
          rel="noreferrer"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="block glass rounded-2xl p-8 md:p-12 hover:border-violet-500/15 transition-all duration-300 group mb-5"
        >
          <p className="section-label mb-6">Featured Blog</p>
          <h3 className="font-display font-bold text-2xl md:text-4xl text-white group-hover:text-violet-100 transition-colors mb-4 max-w-2xl leading-tight">
            Reminiscence — writing on building, thinking, and traveling.
          </h3>
          <p className="text-slate-500 mb-8 max-w-xl leading-relaxed">
            Personal essays and notes from the intersection of technology, travel, and reflection.
            Documenting thought as a developer and a human.
          </p>
          <div className="flex items-center gap-3 text-violet-400 group-hover:gap-4 transition-all duration-200">
            <span className="text-sm font-medium">reminiscence.bearblog.dev</span>
            <span>↗</span>
          </div>
        </motion.a>

        {/* Post list */}
        <div className="grid sm:grid-cols-3 gap-4">
          {posts.map((post, i) => (
            <motion.a
              key={post.title}
              href="https://reminiscence.bearblog.dev"
              target="_blank"
              rel="noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="glass rounded-xl p-5 hover:border-white/[0.1] transition-all duration-200 group"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs px-2.5 py-1 bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-full">
                  {post.tag}
                </span>
                <span className="text-xs text-slate-600">{post.readTime} read</span>
              </div>
              <p className="text-slate-300 text-sm font-medium leading-snug group-hover:text-white transition-colors">
                {post.title}
              </p>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
