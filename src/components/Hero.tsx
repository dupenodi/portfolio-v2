"use client";
import { motion } from "framer-motion";
import Link from "next/link";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay },
});

const stack = ["Next.js", "React", "Python", "Go", "LangChain", "OpenAI", "Supabase"];

export default function Hero() {
  return (
    <section
      id="home"
      style={{ paddingTop: 56, borderBottom: "1px solid var(--border)", overflow: "hidden" }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }} className="hero-grid">

        {/* ── Left — headline + bio ───────────────── */}
        <div
          className="ruled-bg"
          style={{
            position: "relative",
            padding: "4.5rem 3rem 5rem",
            borderRight: "1px solid var(--border)",
          }}
        >
          <motion.p {...fadeUp(0)} className="label" style={{ marginBottom: "1.5rem" }}>
            Full Stack AI Developer
          </motion.p>

          <motion.h1
            {...fadeUp(0.1)}
            style={{
              fontFamily: "var(--fraunces), Georgia, serif",
              fontWeight: 700,
              fontStyle: "italic",
              fontSize: "clamp(2.2rem, 4.5vw, 3.75rem)",
              lineHeight: 1.12,
              color: "var(--ink)",
              letterSpacing: "-0.02em",
              marginBottom: "1.5rem",
              maxWidth: "20ch",
            }}
          >
            Building at the intersection of code and intelligence.
          </motion.h1>

          <motion.p
            {...fadeUp(0.2)}
            style={{
              color: "var(--ink-mid)",
              fontSize: "1rem",
              lineHeight: 1.75,
              maxWidth: "44ch",
              marginBottom: "2.5rem",
            }}
          >
            Founding engineer at Niti AI — shipping AI-first infrastructure across
            the full stack. From Next.js interfaces to Python/Go backends, LLM
            pipelines to agent architectures.
          </motion.p>

          <motion.div {...fadeUp(0.3)} style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <Link href="#projects" className="btn-primary">View Work</Link>
            <Link href="#contact" className="btn-outline">Get in Touch</Link>
          </motion.div>

          <motion.div
            {...fadeUp(0.45)}
            style={{
              display: "flex",
              gap: "2.5rem",
              marginTop: "4rem",
              paddingTop: "1.5rem",
              borderTop: "1px solid var(--border)",
              flexWrap: "wrap",
            }}
          >
            {[
              { value: "2+ yrs", label: "Founding Eng. @ Niti AI" },
              { value: "0→1", label: "Full ownership" },
              { value: "AI-first", label: "Full stack" },
            ].map((s) => (
              <div key={s.label}>
                <p style={{ fontFamily: "var(--fraunces)", fontWeight: 600, fontSize: "1.125rem", color: "var(--ink)" }}>{s.value}</p>
                <p style={{ fontSize: "0.75rem", color: "var(--ink-soft)" }}>{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── Right — profile card ─────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          style={{
            background: "var(--navy)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "3rem 2.5rem",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, rotate: -2 }}
            animate={{ opacity: 1, y: 0, rotate: -1.5 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            whileHover={{ rotate: 0, transition: { duration: 0.3 } }}
            style={{
              width: "100%",
              maxWidth: 320,
              background: "#FFFFFF",
              borderRadius: 12,
              overflow: "hidden",
              boxShadow: "0 4px 6px rgba(0,0,0,0.15), 0 24px 48px rgba(0,0,0,0.28)",
            }}
          >
            {/* Card top — dark header */}
            <div style={{ background: "#2C2925", padding: "1.25rem 1.375rem", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                <p style={{ fontFamily: "var(--dm-sans)", fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#EAA898" }}>
                  Currently
                </p>
                <span style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.625rem", color: "#86efac", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#86efac", display: "inline-block" }} />
                  Available
                </span>
              </div>
              <p style={{ fontFamily: "var(--fraunces)", fontWeight: 700, fontSize: "1rem", color: "#FFFFFF", marginBottom: "0.2rem" }}>
                Founding Engineer
              </p>
              <p style={{ fontFamily: "var(--dm-sans)", fontSize: "0.8125rem", color: "#EAA898" }}>
                Niti AI · Aug 2023 – Present
              </p>
            </div>

            {/* Card body — tech stack */}
            <div style={{ padding: "1.25rem 1.375rem", borderBottom: "1px solid #E6E1D9" }}>
              <p style={{ fontFamily: "var(--dm-sans)", fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#78716C", marginBottom: "0.75rem" }}>
                Stack
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
                {stack.map((t) => (
                  <span
                    key={t}
                    style={{
                      padding: "0.2rem 0.625rem",
                      background: "#F8F6F2",
                      border: "1px solid #E6E1D9",
                      borderRadius: 4,
                      fontSize: "0.7rem",
                      color: "#44403C",
                      fontFamily: "var(--dm-sans)",
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Card footer */}
            <div style={{ padding: "1rem 1.375rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontFamily: "var(--dm-sans)", fontSize: "0.75rem", color: "#44403C" }}>Bengaluru, India</p>
                <p style={{ fontFamily: "var(--dm-sans)", fontSize: "0.75rem", color: "#C05C42" }}>hi@dupenodi.dev</p>
              </div>
              <a
                href="https://github.com/dupenodi"
                target="_blank"
                rel="noreferrer"
                style={{
                  fontFamily: "var(--dm-sans)",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "#78716C",
                  textDecoration: "none",
                  padding: "0.375rem 0.75rem",
                  border: "1px solid #E6E1D9",
                  borderRadius: 6,
                }}
              >
                GitHub ↗
              </a>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .hero-grid > div:last-child { min-height: 340px; }
        }
      `}</style>
    </section>
  );
}
