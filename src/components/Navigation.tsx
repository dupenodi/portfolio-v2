"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const links = [
  { label: "About", href: "#about" },
  { label: "Experience", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Blog", href: "#blog" },
  { label: "Contact", href: "#contact" },
];

function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
    setDark(next);
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      style={{
        width: 36,
        height: 36,
        borderRadius: 6,
        border: "1px solid var(--border)",
        background: "transparent",
        color: "var(--ink-mid)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background 0.15s, color 0.15s",
        fontSize: "1rem",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.background = "var(--hover-bg)";
        (e.currentTarget as HTMLButtonElement).style.color = "var(--ink)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.background = "transparent";
        (e.currentTarget as HTMLButtonElement).style.color = "var(--ink-mid)";
      }}
    >
      {dark ? "☀︎" : "◑"}
    </button>
  );
}

export default function Navigation() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 2.5rem",
          background: "var(--parchment)",
          borderBottom: "1px solid var(--border)",
          zIndex: 100,
          transition: "background 0.25s ease",
        }}
      >
        {/* Logo */}
        <Link
          href="#"
          style={{
            fontFamily: "var(--fraunces), Georgia, serif",
            fontWeight: 700,
            fontSize: "1rem",
            color: "var(--ink)",
            textDecoration: "none",
            letterSpacing: "-0.01em",
          }}
        >
          Sarath Donepudi
        </Link>

        {/* Center links */}
        <nav
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            alignItems: "center",
            gap: "0.125rem",
          }}
          className="hidden-mobile"
        >
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              style={{
                fontFamily: "var(--dm-sans), system-ui, sans-serif",
                fontSize: "0.8125rem",
                fontWeight: 500,
                color: "var(--ink-mid)",
                textDecoration: "none",
                padding: "0.375rem 0.75rem",
                borderRadius: 4,
                transition: "color 0.12s, background 0.12s",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.color = "var(--ink)";
                (e.currentTarget as HTMLAnchorElement).style.background = "var(--hover-bg)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.color = "var(--ink-mid)";
                (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
              }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <ThemeToggle />
          <Link href="#contact" className="btn-primary" style={{ fontSize: "0.8125rem", padding: "0.375rem 0.875rem" }}>
            Hire Me
          </Link>
          {/* Hamburger */}
          <button
            onClick={() => setOpen(!open)}
            aria-label="Menu"
            className="show-mobile"
            style={{
              display: "none",
              flexDirection: "column",
              justifyContent: "center",
              gap: 5,
              width: 36,
              height: 36,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 4,
              borderRadius: 6,
            }}
          >
            <span style={{ display: "block", height: 1.5, background: "var(--ink)", borderRadius: 2, width: 20, transition: "transform 0.2s", transform: open ? "translateY(6.5px) rotate(45deg)" : "none" }} />
            <span style={{ display: "block", height: 1.5, background: "var(--ink)", borderRadius: 2, width: 20, transition: "opacity 0.2s", opacity: open ? 0 : 1 }} />
            <span style={{ display: "block", height: 1.5, background: "var(--ink)", borderRadius: 2, width: 20, transition: "transform 0.2s", transform: open ? "translateY(-6.5px) rotate(-45deg)" : "none" }} />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div
          style={{
            position: "fixed",
            top: 56,
            left: 0,
            right: 0,
            background: "var(--parchment)",
            borderBottom: "1px solid var(--border)",
            zIndex: 99,
            padding: "0.75rem 1.5rem 1.5rem",
          }}
        >
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              style={{
                display: "block",
                fontFamily: "var(--dm-sans), system-ui, sans-serif",
                fontSize: "1rem",
                fontWeight: 500,
                color: "var(--ink-mid)",
                textDecoration: "none",
                padding: "0.75rem 0.875rem",
                borderRadius: 6,
              }}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
      `}</style>
    </>
  );
}
