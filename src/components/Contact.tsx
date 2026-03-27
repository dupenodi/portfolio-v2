"use client";
import { useState } from "react";
import { motion } from "framer-motion";

const socials = [
  { label: "GitHub", handle: "@dupenodi", href: "https://github.com/dupenodi" },
  { label: "LinkedIn", handle: "sarath-donepudi", href: "https://linkedin.com/in/sarath-donepudi" },
  { label: "Blog", handle: "reminiscence.bearblog.dev", href: "https://reminiscence.bearblog.dev" },
];

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const r = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setStatus(r.ok ? "sent" : "error");
      if (r.ok) setForm({ name: "", email: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.625rem 0.875rem",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 6,
    color: "var(--ink)",
    fontFamily: "var(--dm-sans), system-ui, sans-serif",
    fontSize: "0.875rem",
    outline: "none",
    transition: "border-color 0.15s ease",
  };

  return (
    <section id="contact" style={{ borderBottom: "1px solid var(--border)" }}>
      {/* Header */}
      <div
        style={{ display: "grid", gridTemplateColumns: "200px 1fr", borderBottom: "1px solid var(--border)" }}
        className="contact-header-grid"
      >
        <div style={{ padding: "2rem 2.5rem", borderRight: "1px solid var(--border)" }}>
          <p className="label">Contact</p>
        </div>
        <div style={{ padding: "2rem 2.5rem" }}>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            style={{
              fontFamily: "var(--fraunces), Georgia, serif",
              fontStyle: "italic",
              fontWeight: 700,
              fontSize: "clamp(1.8rem, 4vw, 3rem)",
              color: "var(--ink)",
              letterSpacing: "-0.02em",
              lineHeight: 1.15,
            }}
          >
            Let&apos;s build something great together.
          </motion.h2>
        </div>
      </div>

      {/* Body */}
      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr 1fr" }} className="contact-body-grid">
        <div style={{ borderRight: "1px solid var(--border)" }} />

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          onSubmit={submit}
          style={{
            padding: "2.5rem 2.5rem 3rem",
            borderRight: "1px solid var(--border)",
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", color: "var(--ink-soft)", marginBottom: "0.375rem", letterSpacing: "0.04em" }}>Name</label>
              <input
                type="text"
                required
                placeholder="Your name"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = "var(--accent)")}
                onBlur={e => (e.target.style.borderColor = "var(--border)")}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", color: "var(--ink-soft)", marginBottom: "0.375rem", letterSpacing: "0.04em" }}>Email</label>
              <input
                type="email"
                required
                placeholder="your@email.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = "var(--accent)")}
                onBlur={e => (e.target.style.borderColor = "var(--border)")}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.75rem", color: "var(--ink-soft)", marginBottom: "0.375rem", letterSpacing: "0.04em" }}>Message</label>
            <textarea
              required
              rows={5}
              placeholder="What's on your mind?"
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              style={{ ...inputStyle, resize: "none" }}
              onFocus={e => (e.target.style.borderColor = "var(--accent)")}
              onBlur={e => (e.target.style.borderColor = "var(--border)")}
            />
          </div>

          <button
            type="submit"
            disabled={status === "sending" || status === "sent"}
            className="btn-primary"
            style={{ alignSelf: "flex-start", opacity: status === "sending" || status === "sent" ? 0.6 : 1 }}
          >
            {status === "sending" ? "Sending…" : status === "sent" ? "Sent ✓" : status === "error" ? "Failed — email me directly" : "Send Message"}
          </button>
        </motion.form>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.1 }}
          style={{ padding: "2.5rem 2.5rem 3rem", display: "flex", flexDirection: "column", gap: "2rem" }}
        >
          <div>
            <p className="label" style={{ marginBottom: "0.5rem" }}>Email</p>
            <a
              href="mailto:hi@dupenodi.dev"
              style={{
                fontFamily: "var(--fraunces)",
                fontWeight: 600,
                fontSize: "1.125rem",
                color: "var(--ink)",
                textDecoration: "none",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--accent)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--ink)")}
            >
              hi@dupenodi.dev
            </a>
          </div>

          <div>
            <p className="label" style={{ marginBottom: "0.875rem" }}>Elsewhere</p>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.75rem 0",
                    borderBottom: "1px solid var(--border)",
                    textDecoration: "none",
                    transition: "color 0.12s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--hover-bg)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--ink-mid)" }}>{s.label}</span>
                  <span style={{ fontSize: "0.75rem", color: "var(--ink-soft)" }}>{s.handle} ↗</span>
                </a>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "200px 1fr",
          borderTop: "1px solid var(--border)",
        }}
        className="footer-grid"
      >
        <div style={{ borderRight: "1px solid var(--border)" }} />
        <div
          style={{
            padding: "1.5rem 2.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.5rem",
          }}
        >
          <p style={{ fontSize: "0.8125rem", color: "var(--ink-soft)" }}>
            © 2025 Sarath Donepudi
          </p>
          <p style={{ fontSize: "0.8125rem", color: "var(--ink-soft)" }}>
            Bengaluru, India
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .contact-header-grid { grid-template-columns: 1fr !important; }
          .contact-header-grid > div:first-child { border-right: none !important; border-bottom: 1px solid var(--border); }
          .contact-body-grid { grid-template-columns: 1fr !important; }
          .contact-body-grid > div:first-child { display: none; }
          .contact-body-grid > div { border-right: none !important; }
          .footer-grid { grid-template-columns: 1fr !important; }
          .footer-grid > div:first-child { display: none; }
        }
      `}</style>
    </section>
  );
}
