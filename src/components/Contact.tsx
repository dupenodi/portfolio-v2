"use client";
import { useState } from "react";
import { motion } from "framer-motion";

const socials = [
  { label: "GitHub", href: "https://github.com/dupenodi", handle: "@dupenodi" },
  { label: "LinkedIn", href: "https://linkedin.com/in/sarath-donepudi", handle: "sarath-donepudi" },
  { label: "Blog", href: "https://reminiscence.bearblog.dev", handle: "reminiscence" },
  { label: "Email", href: "mailto:hi@dupenodi.dev", handle: "hi@dupenodi.dev" },
];

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus("sent");
        setForm({ name: "", email: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <section id="contact" className="py-32 md:py-40 px-6 relative overflow-hidden">
      {/* Glows */}
      <div className="absolute right-0 top-0 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute left-0 bottom-0 w-96 h-96 bg-cyan-500/8 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="section-label mb-5"
        >
          // contact
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="font-display font-black text-5xl md:text-7xl lg:text-8xl tracking-tighter leading-none mb-6"
        >
          Let&apos;s build
          <br />
          <span className="gradient-text">something great.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="text-slate-500 text-lg mb-16 max-w-xl"
        >
          Whether it&apos;s a collaboration, a project, or just a conversation — I&apos;m always
          open. Drop a message below or reach out directly.
        </motion.p>

        <div className="grid md:grid-cols-2 gap-12 md:gap-20">
          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs text-slate-500 mb-2 tracking-wide">Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Your name"
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.07] rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.05] transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-2 tracking-wide">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.07] rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.05] transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-2 tracking-wide">Message</label>
              <textarea
                required
                rows={6}
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                placeholder="What's on your mind?"
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.07] rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.05] transition-all duration-200 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={status === "sending" || status === "sent"}
              className="w-full py-4 bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
            >
              {status === "sending"
                ? "Sending..."
                : status === "sent"
                ? "Message sent ✓"
                : status === "error"
                ? "Failed — try email directly"
                : "Send Message"}
            </button>
          </motion.form>

          {/* Socials + info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="space-y-8"
          >
            <div>
              <p className="text-slate-500 text-sm mb-2">Or email me directly</p>
              <a
                href="mailto:hi@dupenodi.dev"
                className="text-2xl font-display font-bold text-white hover:text-violet-300 transition-colors duration-200"
              >
                hi@dupenodi.dev
              </a>
            </div>

            <div className="h-px bg-white/[0.05]" />

            <div className="space-y-4">
              <p className="text-xs text-slate-600 tracking-widest uppercase">Find me on</p>
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between group py-3 border-b border-white/[0.04] hover:border-white/[0.1] transition-colors duration-200"
                >
                  <span className="text-slate-400 group-hover:text-white transition-colors text-sm font-medium">
                    {s.label}
                  </span>
                  <div className="flex items-center gap-2 text-slate-600 group-hover:text-slate-300 transition-colors text-xs">
                    <span>{s.handle}</span>
                    <span className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200">
                      ↗
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="max-w-7xl mx-auto mt-24 pt-8 border-t border-white/[0.04] flex flex-wrap items-center justify-between gap-4"
      >
        <p className="text-slate-700 text-sm">
          © 2025 Sarath Donepudi. Built with Next.js & Tailwind.
        </p>
        <p className="text-slate-700 text-sm">
          Bengaluru, India
        </p>
      </motion.div>
    </section>
  );
}
