"use client";
import { motion } from "framer-motion";
import Link from "next/link";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay },
});

export default function Hero() {
  return (
    <section
      id="home"
      style={{
        paddingTop: 56,
        borderBottom: "1px solid var(--border)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
        }}
        className="hero-grid"
      >
        {/* ── Left ─────────────────────────────── */}
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
              fontSize: "clamp(2.4rem, 5vw, 4rem)",
              lineHeight: 1.12,
              color: "var(--ink)",
              letterSpacing: "-0.02em",
              marginBottom: "1.5rem",
              maxWidth: "22ch",
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

          <motion.div
            {...fadeUp(0.3)}
            style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}
          >
            <Link href="#projects" className="btn-primary">
              View Work
            </Link>
            <Link href="#contact" className="btn-outline">
              Get in Touch
            </Link>
          </motion.div>

          {/* Bottom stats bar */}
          <motion.div
            {...fadeUp(0.45)}
            style={{
              display: "flex",
              gap: "2.5rem",
              marginTop: "4rem",
              paddingTop: "1.5rem",
              borderTop: "1px solid var(--border)",
            }}
            className="hero-stats"
          >
            {[
              { value: "2+ yrs", label: "at Niti AI" },
              { value: "0→1", label: "Founding eng." },
              { value: "AI-first", label: "Full stack" },
            ].map((s) => (
              <div key={s.label}>
                <p style={{ fontFamily: "var(--fraunces)", fontWeight: 600, fontSize: "1.125rem", color: "var(--ink)" }}>{s.value}</p>
                <p style={{ fontSize: "0.75rem", color: "var(--ink-soft)" }}>{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── Right — profile card on dark bg ─── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          style={{
            background: "var(--navy)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "3rem 2.5rem",
            minHeight: "100%",
          }}
        >
          {/* Card */}
          <motion.div
            initial={{ opacity: 0, y: 20, rotate: -2 }}
            animate={{ opacity: 1, y: 0, rotate: -1.5 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            whileHover={{ rotate: 0, transition: { duration: 0.3 } }}
            style={{
              width: "100%",
              maxWidth: 340,
              background: "#FFFFFF",
              borderRadius: 12,
              overflow: "hidden",
              boxShadow: "0 4px 6px rgba(0,0,0,0.15), 0 24px 48px rgba(0,0,0,0.28)",
            }}
          >
            {/* Card header */}
            <div
              style={{
                background: "#2C2925",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                padding: "1.125rem 1.25rem",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--dm-sans), system-ui, sans-serif",
                  fontSize: "0.625rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#EAA898",
                  marginBottom: "0.4rem",
                }}
              >
                Next.js · Python · Go · LangChain
              </p>
              <p
                style={{
                  fontFamily: "var(--fraunces), Georgia, serif",
                  fontStyle: "italic",
                  fontSize: "0.875rem",
                  color: "rgba(255,255,255,0.72)",
                  lineHeight: 1.45,
                }}
              >
                Ships across the stack. Thinks in systems. Builds for the long game.
              </p>
            </div>

            {/* Card body */}
            <div style={{ padding: "1.25rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.875rem" }}>
                <span style={{ fontFamily: "var(--dm-sans)", fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.08em", color: "#C05C42" }}>01</span>
                <span style={{ fontFamily: "var(--fraunces)", fontSize: "0.9375rem", fontWeight: 600, color: "#1A1917" }}>Who Sharath Is</span>
              </div>
              <p style={{ fontSize: "0.8125rem", color: "#44403C", lineHeight: 1.65, marginBottom: "1rem" }}>
                Founding engineer building AI-first retention infrastructure.
                Works across every layer — from agent design to customer demos.
              </p>
              <blockquote
                style={{
                  borderLeft: "2px solid #C05C42",
                  paddingLeft: "0.875rem",
                  fontFamily: "var(--fraunces)",
                  fontStyle: "italic",
                  fontSize: "0.8125rem",
                  color: "#44403C",
                  lineHeight: 1.6,
                }}
              >
                &ldquo;Being early means wearing every hat — building while listening, pitching while debugging.&rdquo;
              </blockquote>
            </div>

            {/* Locked rows */}
            <div style={{ borderTop: "1px solid #E6E1D9" }}>
              {[
                { n: "02", t: "Experience & Work" },
                { n: "03", t: "Projects" },
                { n: "04", t: "Get in Touch" },
              ].map((row) => (
                <div
                  key={row.n}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.625rem",
                    padding: "0.75rem 1.25rem",
                    borderBottom: "1px solid #E6E1D9",
                    opacity: 0.5,
                  }}
                >
                  <span style={{ fontFamily: "var(--dm-sans)", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.08em", color: "#C05C42" }}>{row.n}</span>
                  <span style={{ fontFamily: "var(--fraunces)", fontSize: "0.875rem", color: "#44403C", flex: 1 }}>{row.t}</span>
                  <svg width="10" height="12" viewBox="0 0 10 12" fill="none">
                    <rect x="1" y="5" width="8" height="7" rx="1.5" stroke="#78716C" strokeWidth="1.25"/>
                    <path d="M3 5V3.5a2 2 0 1 1 4 0V5" stroke="#78716C" strokeWidth="1.25" strokeLinecap="round"/>
                  </svg>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .hero-stats { gap: 1.5rem !important; }
        }
      `}</style>
    </section>
  );
}
