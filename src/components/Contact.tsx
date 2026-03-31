"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ExternalLink } from "lucide-react";

const socials = [
  { label: "GitHub", handle: "@dupenodi", href: "https://github.com/dupenodi", icon: <ExternalLink size={13} /> },
  { label: "LinkedIn", handle: "sarath-donepudi", href: "https://linkedin.com/in/sarath-donepudi", icon: <ExternalLink size={13} /> },
  { label: "Blog", handle: "reminiscence.bearblog.dev", href: "https://reminiscence.bearblog.dev", icon: <ArrowUpRight size={13} /> },
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
    transition: "border-color 0.15s",
  };

  return (
    <section id="contact" style={{ borderBottom: "1px solid var(--border)", padding: "5rem 3rem" }} className="contact-section">
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="label"
          style={{ marginBottom: "0.75rem" }}
        >
          Contact
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.05 }}
          style={{
            fontFamily: "var(--fraunces), Georgia, serif",
            fontStyle: "italic",
            fontWeight: 700,
            fontSize: "clamp(1.6rem, 3vw, 2.25rem)",
            color: "var(--ink)",
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
            marginBottom: "3rem",
          }}
        >
          Let&apos;s build something great together.
        </motion.h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "5rem", alignItems: "start" }} className="contact-grid">

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            onSubmit={submit}
            style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "var(--ink-soft)", marginBottom: "0.375rem" }}>Name</label>
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
                <label style={{ display: "block", fontSize: "0.75rem", color: "var(--ink-soft)", marginBottom: "0.375rem" }}>Email</label>
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
              <label style={{ display: "block", fontSize: "0.75rem", color: "var(--ink-soft)", marginBottom: "0.375rem" }}>Message</label>
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
            <div>
              <button
                type="submit"
                disabled={status === "sending" || status === "sent"}
                className="btn-primary"
                style={{ opacity: status === "sending" || status === "sent" ? 0.6 : 1 }}
              >
                {status === "sending" ? "Sending…" : status === "sent" ? "Sent ✓" : status === "error" ? "Failed — email me directly" : "Send Message"}
              </button>
            </div>
          </motion.form>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.1 }}
            style={{ display: "flex", flexDirection: "column", gap: "2rem" }}
          >
            <div>
              <p className="label" style={{ marginBottom: "0.5rem" }}>Email directly</p>
              <a
                href="mailto:hi@dupenodi.dev"
                style={{ fontFamily: "var(--fraunces)", fontWeight: 600, fontSize: "1.0625rem", color: "var(--ink)", textDecoration: "none" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--accent)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--ink)")}
              >
                hi@dupenodi.dev
              </a>
            </div>

            <div>
              <p className="label" style={{ marginBottom: "0.875rem" }}>Elsewhere</p>
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem 0", borderBottom: "1px solid var(--border)", textDecoration: "none", transition: "background 0.12s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--hover-bg)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--ink-mid)" }}>{s.label}</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", color: "var(--ink-soft)" }}>{s.handle} {s.icon}</span>
                </a>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: "4rem", paddingTop: "1.5rem", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
          <p style={{ fontSize: "0.8125rem", color: "var(--ink-soft)" }}>© 2025 Sharath</p>
          <div style={{ display: "flex", gap: "1.25rem", alignItems: "center" }}>
            <a href="/now" style={{ fontSize: "0.8125rem", color: "var(--ink-soft)", textDecoration: "none" }} onMouseEnter={e => (e.currentTarget.style.color = "var(--accent)")} onMouseLeave={e => (e.currentTarget.style.color = "var(--ink-soft)")}>Now</a>
            <a href="/uses" style={{ fontSize: "0.8125rem", color: "var(--ink-soft)", textDecoration: "none" }} onMouseEnter={e => (e.currentTarget.style.color = "var(--accent)")} onMouseLeave={e => (e.currentTarget.style.color = "var(--ink-soft)")}>Uses</a>
            <a href="/bookmarks" style={{ fontSize: "0.8125rem", color: "var(--ink-soft)", textDecoration: "none" }} onMouseEnter={e => (e.currentTarget.style.color = "var(--accent)")} onMouseLeave={e => (e.currentTarget.style.color = "var(--ink-soft)")}>Bookmarks</a>
            <p style={{ fontSize: "0.8125rem", color: "var(--ink-soft)" }}>Bengaluru, India</p>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .contact-section { padding: 3.5rem 1.5rem !important; }
          .contact-grid { grid-template-columns: 1fr !important; gap: 2.5rem !important; }
        }
      `}</style>
    </section>
  );
}
