import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Now — Sarath Donepudi",
  description: "What Sarath is up to right now.",
};

const updated = "March 2026";

const sections = [
  {
    label: "Where",
    content: "Bengaluru, India.",
    sub: "Living here, probably complaining about the traffic.",
  },
  {
    label: "Work",
    content: "Founding Engineer at Niti AI.",
    sub: "Building AI-first infrastructure for retention marketing. Still day one energy.",
  },
  {
    label: "Reading",
    content: "Infinite Jest — David Foster Wallace.",
    sub: "It's long. It's dense. It's worth it. Ask me again in a few months.",
  },
  {
    label: "Listening",
    content: "Radiohead.",
    sub: "On rotation constantly. There's a Radiohead song for every mood if you look hard enough.",
  },
  {
    label: "Writing",
    content: "Trying to write more.",
    sub: "Personal essays on Reminiscence — less polished, more honest. Still figuring out the rhythm.",
  },
];

export default function Now() {
  return (
    <main style={{ minHeight: "100vh", paddingTop: 56 }}>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "5rem 3rem" }}>

        {/* Header */}
        <p style={{ fontFamily: "var(--dm-sans), system-ui, sans-serif", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--accent)", marginBottom: "0.75rem" }}>
          Now
        </p>
        <h1 style={{ fontFamily: "var(--fraunces), Georgia, serif", fontStyle: "italic", fontWeight: 900, fontSize: "clamp(2.5rem, 6vw, 4rem)", lineHeight: 0.95, letterSpacing: "-0.03em", color: "var(--ink)", marginBottom: "1.25rem" }}>
          What I&apos;m up to.
        </h1>
        <p style={{ fontSize: "0.8125rem", color: "var(--ink-soft)", marginBottom: "4rem" }}>
          Last updated {updated} · Bengaluru, India ·{" "}
          <a href="https://nownownow.com/about" target="_blank" rel="noreferrer" style={{ color: "var(--ink-soft)", textDecoration: "underline", textUnderlineOffset: 3 }}>
            what is this?
          </a>
        </p>

        {/* Sections */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {sections.map((s, i) => (
            <div
              key={s.label}
              style={{
                display: "grid",
                gridTemplateColumns: "80px 1fr",
                gap: "2rem",
                paddingTop: i === 0 ? 0 : "2rem",
                paddingBottom: "2rem",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <span style={{ fontFamily: "var(--dm-sans), system-ui, sans-serif", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-soft)", paddingTop: "0.25rem" }}>
                {s.label}
              </span>
              <div>
                <p style={{ fontFamily: "var(--fraunces), Georgia, serif", fontWeight: 600, fontSize: "1.125rem", color: "var(--ink)", marginBottom: "0.375rem", letterSpacing: "-0.01em" }}>
                  {s.content}
                </p>
                <p style={{ fontSize: "0.9rem", color: "var(--ink-mid)", lineHeight: 1.7 }}>
                  {s.sub}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ marginTop: "3.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <Link
            href="/"
            style={{ fontSize: "0.875rem", color: "var(--accent)", textDecoration: "none" }}
          >
            ← Back home
          </Link>
          <p style={{ fontSize: "0.8125rem", color: "var(--ink-soft)" }}>
            This page is inspired by{" "}
            <a href="https://nownownow.com" target="_blank" rel="noreferrer" style={{ color: "var(--ink-soft)", textDecoration: "underline", textUnderlineOffset: 3 }}>
              nownownow.com
            </a>
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          div[style*="grid-template-columns: 80px"] {
            grid-template-columns: 1fr !important;
            gap: 0.5rem !important;
          }
        }
      `}</style>
    </main>
  );
}
