"use client";
import { motion } from "framer-motion";
import { ArrowUpRight, ExternalLink } from "lucide-react";

const inView = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.55, delay },
});

export default function About() {
  return (
    <section id="about" style={{ borderBottom: "1px solid var(--border)", padding: "5rem 3rem" }} className="about-section">
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Section label */}
        <motion.p {...inView(0)} className="label" style={{ marginBottom: "0.75rem" }}>
          About
        </motion.p>

        {/* Two column: quote + bio */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5rem", alignItems: "start", marginTop: "3rem" }} className="about-grid">

          {/* Left — big statement */}
          <motion.div {...inView(0.1)}>
            <h2
              style={{
                fontFamily: "var(--fraunces), Georgia, serif",
                fontStyle: "italic",
                fontWeight: 700,
                fontSize: "clamp(1.6rem, 3vw, 2.25rem)",
                color: "var(--ink)",
                lineHeight: 1.2,
                letterSpacing: "-0.02em",
                marginBottom: "2rem",
              }}
            >
              I write code, ship products, and wear every hat in between.
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem", marginBottom: "2rem" }}>
              {[
                "Full stack across frontend, backend, and infra",
                "LLM pipelines, RAG, and agent architectures",
                "Shipping fast in early-stage startup environments",
                "Turning vague ideas into working products",
              ].map((item) => (
                <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: "0.625rem", fontSize: "0.875rem", color: "var(--ink-mid)", lineHeight: 1.6 }}>
                  <span style={{ color: "var(--accent)", flexShrink: 0, marginTop: "0.3em", fontSize: "0.5rem" }}>●</span>
                  {item}
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: "1.25rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
              {[
                { label: "GitHub", href: "https://github.com/dupenodi", icon: <ExternalLink size={13} /> },
                { label: "LinkedIn", href: "https://linkedin.com/in/sarath-donepudi", icon: <ExternalLink size={13} /> },
                { label: "Blog", href: "https://reminiscence.bearblog.dev", icon: <ArrowUpRight size={13} /> },
              ].map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", fontSize: "0.875rem", color: "var(--accent)", textDecoration: "none" }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = "0.7")}
                  onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                >
                  {l.icon}{l.label}
                </a>
              ))}
            </div>
          </motion.div>

          {/* Right — bio paragraphs */}
          <motion.div {...inView(0.2)} style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }}>
            <p style={{ color: "var(--ink-mid)", lineHeight: 1.8, fontSize: "0.9375rem" }}>
              I&apos;m Sharath — a full stack AI developer and founding engineer at{" "}
              <a
                href="https://niti.ai"
                target="_blank"
                rel="noreferrer"
                style={{ color: "var(--accent)", fontWeight: 600, textDecoration: "none" }}
              >
                Niti AI
              </a>
              , building AI-first infrastructure to power the future of retention marketing.
            </p>
            <p style={{ color: "var(--ink-mid)", lineHeight: 1.8, fontSize: "0.9375rem" }}>
              Being early means wearing every hat — building while listening, pitching
              while debugging, and shaping both the product and the platform behind it.
            </p>
            <p style={{ color: "var(--ink-mid)", lineHeight: 1.8, fontSize: "0.9375rem" }}>
              Outside code, I write, travel, and explore creative technology. I&apos;m
              drawn to long conversations, language learning, and documenting thought on{" "}
              <a
                href="https://reminiscence.bearblog.dev"
                target="_blank"
                rel="noreferrer"
                style={{ color: "var(--accent)", textDecoration: "none" }}
              >
                Reminiscence
              </a>.
            </p>
          </motion.div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .about-section { padding: 3.5rem 1.5rem !important; }
          .about-grid { grid-template-columns: 1fr !important; gap: 2.5rem !important; }
        }
      `}</style>
    </section>
  );
}
