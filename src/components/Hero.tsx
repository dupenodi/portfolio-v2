"use client";
import { motion } from "framer-motion";
import Link from "next/link";

const stack = ["Next.js", "React", "Python", "Go", "LangChain", "OpenAI", "Supabase"];

export default function Hero() {
  return (
    <section
      id="home"
      style={{
        paddingTop: 56,
        borderBottom: "1px solid var(--border)",
        overflow: "hidden",
        minHeight: "calc(100vh - 56px)",
        display: "grid",
        gridTemplateColumns: "1fr 420px",
      }}
      className="hero-section"
    >
      {/* ── Left ─────────────────────────────────────── */}
      <div
        style={{
          padding: "5rem 3.5rem",
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
        className="hero-left"
      >
        {/* Top block */}
        <div>
          {/* Availability */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", marginBottom: "2.5rem" }}
          >
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4A7C6B", display: "inline-block", boxShadow: "0 0 0 2px rgba(74,124,107,0.2)" }} />
            <span style={{ fontFamily: "var(--dm-sans)", fontSize: "0.8rem", color: "var(--ink-soft)" }}>
              Available for opportunities
            </span>
          </motion.div>

          {/* Name — the hero */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            style={{
              fontFamily: "var(--fraunces), Georgia, serif",
              fontWeight: 900,
              fontStyle: "italic",
              fontSize: "clamp(3.5rem, 7vw, 6.5rem)",
              lineHeight: 0.95,
              color: "var(--ink)",
              letterSpacing: "-0.03em",
              marginBottom: "1.75rem",
            }}
          >
            Sarath<br />Donepudi.
          </motion.h1>

          {/* Role */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            style={{
              fontFamily: "var(--dm-sans)",
              fontSize: "1rem",
              color: "var(--ink-mid)",
              marginBottom: "0.375rem",
            }}
          >
            Full Stack AI Developer
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            style={{ fontFamily: "var(--dm-sans)", fontSize: "0.9rem", color: "var(--ink-soft)" }}
          >
            Founding Engineer{" "}
            <span style={{ color: "var(--accent)" }}>@ Niti AI</span>
            {" "}· Bengaluru, India
          </motion.p>
        </div>

        {/* Bottom block — bio + CTAs */}
        <div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            style={{
              color: "var(--ink-mid)",
              fontSize: "0.9375rem",
              lineHeight: 1.8,
              maxWidth: "46ch",
              marginBottom: "2rem",
              borderTop: "1px solid var(--border)",
              paddingTop: "2rem",
            }}
          >
            Building AI-first infrastructure from the ground up — LLM pipelines,
            agent architectures, and everything in between.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.55 }}
            style={{ display: "flex", gap: "0.75rem" }}
          >
            <Link href="#projects" className="btn-primary">View Work</Link>
            <Link href="#contact" className="btn-outline">Get in Touch</Link>
          </motion.div>
        </div>
      </div>

      {/* ── Right — info panel ────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        style={{
          padding: "4rem 2.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "0",
          borderLeft: "none",
        }}
      >
        {/* Currently */}
        <div style={{ paddingBottom: "2rem", borderBottom: "1px solid var(--border)", marginBottom: "2rem" }}>
          <p className="label" style={{ marginBottom: "0.75rem" }}>Currently</p>
          <p style={{ fontFamily: "var(--fraunces)", fontWeight: 700, fontSize: "1rem", color: "var(--ink)", marginBottom: "0.2rem" }}>
            Founding Engineer
          </p>
          <p style={{ fontSize: "0.875rem", color: "var(--accent)", marginBottom: "0.2rem" }}>Niti AI</p>
          <p style={{ fontSize: "0.8125rem", color: "var(--ink-soft)" }}>Aug 2023 – Present</p>
        </div>

        {/* Stack */}
        <div style={{ paddingBottom: "2rem", borderBottom: "1px solid var(--border)", marginBottom: "2rem" }}>
          <p className="label" style={{ marginBottom: "0.875rem" }}>Stack</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
            {stack.map((t) => (
              <span
                key={t}
                style={{
                  padding: "0.25rem 0.625rem",
                  fontSize: "0.75rem",
                  border: "1px solid var(--border)",
                  borderRadius: 4,
                  color: "var(--ink-mid)",
                  background: "var(--surface)",
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Links */}
        <div>
          <p className="label" style={{ marginBottom: "0.875rem" }}>Links</p>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {[
              { label: "GitHub", href: "https://github.com/dupenodi", sub: "@dupenodi" },
              { label: "LinkedIn", href: "https://linkedin.com/in/sarath-donepudi", sub: "sarath-donepudi" },
              { label: "Blog", href: "https://reminiscence.bearblog.dev", sub: "Reminiscence" },
              { label: "Email", href: "mailto:hi@dupenodi.dev", sub: "hi@dupenodi.dev" },
            ].map((l) => (
              <a
                key={l.label}
                href={l.href}
                target={l.href.startsWith("mailto") ? undefined : "_blank"}
                rel="noreferrer"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.625rem 0",
                  borderBottom: "1px solid var(--border)",
                  textDecoration: "none",
                  transition: "background 0.12s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--hover-bg)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <span style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--ink-mid)" }}>{l.label}</span>
                <span style={{ fontSize: "0.75rem", color: "var(--ink-soft)" }}>{l.sub} ↗</span>
              </a>
            ))}
          </div>
        </div>
      </motion.div>

      <style>{`
        @media (max-width: 768px) {
          .hero-section {
            grid-template-columns: 1fr !important;
            min-height: unset !important;
          }
          .hero-left { padding: 3rem 1.5rem !important; }
        }
      `}</style>
    </section>
  );
}
