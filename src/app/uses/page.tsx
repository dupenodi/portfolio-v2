import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Uses — Sharath",
  description: "The tools and gear I use every day.",
};

const stack: { category: string; items: { name: string; desc: string; badge?: string; href: string }[] }[] = [
  {
    category: "Editor",
    items: [
      {
        name: "Cursor",
        desc: "VS Code but with AI that actually understands context. Hard to go back.",
        badge: "daily driver",
        href: "https://cursor.sh",
      },
    ],
  },
  {
    category: "AI",
    items: [
      {
        name: "Claude Code",
        desc: "AI pair programmer that lives in the terminal. The one I actually trust for real work.",
        badge: "favourite",
        href: "https://claude.ai/code",
      },
      {
        name: "Claude",
        desc: "For thinking out loud, drafting, and anything that needs a second brain.",
        href: "https://claude.ai",
      },
    ],
  },
  {
    category: "Browser",
    items: [
      {
        name: "Brave",
        desc: "Fast, private, no nonsense. Ad blocking built in.",
        badge: "daily driver",
        href: "https://brave.com",
      },
    ],
  },
  {
    category: "Hardware",
    items: [
      {
        name: "MacBook Pro M2",
        desc: "Handles everything — compiling, running local models, never gets loud. The machine just works.",
        badge: "essential",
        href: "https://apple.com/macbook-pro",
      },
    ],
  },
  {
    category: "Infra & Deploy",
    items: [
      {
        name: "Vercel",
        desc: "Push to deploy. The frontend hosting that gets out of your way.",
        href: "https://vercel.com",
      },
      {
        name: "Supabase",
        desc: "Postgres with a great DX. Auth, storage, realtime — all in one.",
        href: "https://supabase.com",
      },
    ],
  },
];

export default function Uses() {
  return (
    <main style={{ minHeight: "100vh", paddingTop: 56 }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "5rem 3rem" }}>

        <p style={{ fontFamily: "var(--dm-sans), system-ui, sans-serif", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--accent)", marginBottom: "0.75rem" }}>
          Uses
        </p>
        <h1 style={{ fontFamily: "var(--fraunces), Georgia, serif", fontStyle: "italic", fontWeight: 900, fontSize: "clamp(2.5rem, 6vw, 4rem)", lineHeight: 0.95, letterSpacing: "-0.03em", color: "var(--ink)", marginBottom: "1rem" }}>
          The stuff I use.
        </h1>
        <p style={{ fontSize: "0.9rem", color: "var(--ink-mid)", lineHeight: 1.7, marginBottom: "4rem", maxWidth: "44ch" }}>
          Tools I actually reach for every day. No sponsorships, no fluff.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "3.5rem" }}>
          {stack.map(({ category, items }) => (
            <div key={category}>
              <p style={{ fontFamily: "var(--dm-sans), system-ui, sans-serif", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-soft)", marginBottom: "0.75rem" }}>
                {category}
              </p>
              <div style={{ borderTop: "1px solid var(--border)" }}>
                {items.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="uses-row"
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.3rem" }}>
                        <p style={{ fontFamily: "var(--fraunces), Georgia, serif", fontWeight: 700, fontSize: "1rem", color: "var(--ink)", letterSpacing: "-0.01em" }}>
                          {item.name}
                        </p>
                        {item.badge && (
                          <span style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--accent)", border: "1px solid var(--accent)", borderRadius: 20, padding: "0.1rem 0.5rem", opacity: 0.8 }}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: "0.875rem", color: "var(--ink-mid)", lineHeight: 1.65 }}>
                        {item.desc}
                      </p>
                    </div>
                    <span style={{ fontSize: "0.8125rem", color: "var(--ink-soft)", flexShrink: 0, marginTop: "0.25rem" }}>↗</span>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <style>{`
          .uses-row {
            display: flex;
            align-items: flex-start;
            gap: 1rem;
            padding: 1.25rem 0.5rem;
            border-bottom: 1px solid var(--border);
            text-decoration: none;
            transition: background 0.12s;
            border-radius: 4px;
          }
          .uses-row:hover { background: var(--hover-bg); }
        `}</style>

        <div style={{ marginTop: "4rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <Link href="/" style={{ fontSize: "0.875rem", color: "var(--accent)", textDecoration: "none" }}>
            ← Back home
          </Link>
          <p style={{ fontSize: "0.8125rem", color: "var(--ink-soft)" }}>
            Inspired by{" "}
            <a href="https://uses.tech" target="_blank" rel="noreferrer" style={{ color: "var(--ink-soft)", textDecoration: "underline", textUnderlineOffset: 3 }}>
              uses.tech
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
