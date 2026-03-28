"use client";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Hero() {
  return (
    <section
      id="home"
      style={{
        paddingTop: 56,
        borderBottom: "1px solid var(--border)",
        height: "100vh",
        display: "flex",
        alignItems: "center",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          width: "100%",
          margin: "0 auto",
          padding: "0 3rem",
        }}
        className="hero-inner"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", marginBottom: "2.5rem" }}
        >
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4A7C6B", display: "inline-block" }} />
          <span style={{ fontFamily: "var(--dm-sans)", fontSize: "0.8rem", color: "var(--ink-soft)" }}>
            Available for opportunities
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          style={{
            fontFamily: "var(--fraunces), Georgia, serif",
            fontWeight: 900,
            fontStyle: "italic",
            fontSize: "clamp(4.5rem, 11vw, 9rem)",
            lineHeight: 0.92,
            color: "var(--ink)",
            letterSpacing: "-0.03em",
            marginBottom: "2.5rem",
          }}
        >
          Sarath<br />Donepudi.
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          style={{ marginBottom: "2.5rem" }}
        >
          <p style={{ fontFamily: "var(--dm-sans)", fontSize: "1rem", color: "var(--ink-mid)", marginBottom: "0.3rem" }}>
            Full Stack AI Developer
          </p>
          <p style={{ fontFamily: "var(--dm-sans)", fontSize: "0.9375rem", color: "var(--ink-soft)" }}>
            Founding Engineer{" "}
            <a
              href="https://niti.ai"
              target="_blank"
              rel="noreferrer"
              style={{ color: "var(--accent)", textDecoration: "none" }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
            >
              @ Niti AI
            </a>
            {" · "}Bengaluru, India
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Link href="/#contact" className="btn-outline">Get in Touch</Link>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .hero-inner { padding: 0 1.5rem !important; }
        }
      `}</style>
    </section>
  );
}
