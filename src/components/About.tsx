"use client";
import { motion } from "framer-motion";

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
        <motion.p {...inView(0)} className="label" style={{ marginBottom: "3rem" }}>
          About
        </motion.p>

        {/* Two column: quote + bio */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5rem", alignItems: "start" }} className="about-grid">

          {/* Left — big statement */}
          <motion.div {...inView(0.1)}>
            <h2
              style={{
                fontFamily: "var(--fraunces), Georgia, serif",
                fontStyle: "italic",
                fontWeight: 700,
                fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                color: "var(--ink)",
                lineHeight: 1.2,
                letterSpacing: "-0.02em",
                marginBottom: "2rem",
              }}
            >
              Building at the frontier — where the code ends and the product begins.
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {[
                { label: "Based in", value: "Bengaluru, India" },
                { label: "Currently", value: "Founding Engineer @ Niti AI" },
                { label: "Education", value: "BE Computer Science, SSN College" },
              ].map((item) => (
                <div key={item.label} style={{ display: "flex", gap: "1rem", paddingBottom: "0.75rem", borderBottom: "1px solid var(--border)", alignItems: "baseline" }}>
                  <span style={{ fontFamily: "var(--dm-sans)", fontSize: "0.75rem", color: "var(--ink-soft)", width: 80, flexShrink: 0 }}>{item.label}</span>
                  <span style={{ fontSize: "0.875rem", color: "var(--ink-mid)" }}>{item.value}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: "1.25rem", marginTop: "1.75rem", flexWrap: "wrap" }}>
              {[
                { label: "GitHub ↗", href: "https://github.com/dupenodi" },
                { label: "LinkedIn ↗", href: "https://linkedin.com/in/sarath-donepudi" },
                { label: "Blog ↗", href: "https://reminiscence.bearblog.dev" },
              ].map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: "0.875rem", color: "var(--accent)", textDecoration: "none" }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = "0.7")}
                  onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                >
                  {l.label}
                </a>
              ))}
            </div>
          </motion.div>

          {/* Right — bio paragraphs */}
          <motion.div {...inView(0.2)} style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }}>
            <p style={{ color: "var(--ink-mid)", lineHeight: 1.8, fontSize: "0.9375rem" }}>
              I&apos;m Sharath — a full stack AI developer and founding engineer at{" "}
              <strong style={{ color: "var(--ink)", fontWeight: 600 }}>Niti AI</strong>,
              building AI-first infrastructure to power the future of retention marketing.
            </p>
            <p style={{ color: "var(--ink-mid)", lineHeight: 1.8, fontSize: "0.9375rem" }}>
              I work across the entire stack — sleek interfaces in Next.js and React,
              robust backends in Python and Go, and LLM integration via LangChain,
              OpenAI, and vector databases for audience targeting, campaign generation,
              and agent orchestration.
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
