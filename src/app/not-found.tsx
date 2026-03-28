"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

const pages = [
  { heading: "Wrong turn.", sub: "You've wandered somewhere that doesn't exist. Happens." },
  { heading: "Nothing here.", sub: "This page took a gap year and never came back." },
  { heading: "Even I don't\nknow this one.", sub: "And I built this thing." },
  { heading: "You broke it.", sub: "Just kidding. This page never existed." },
  { heading: "Huh.", sub: "Whatever you were looking for, it's not here." },
];

export default function NotFound() {
  const [page, setPage] = useState(pages[0]);

  useEffect(() => {
    setPage(pages[Math.floor(Math.random() * pages.length)]);
  }, []);

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem", textAlign: "center" }}>
      <p style={{ fontFamily: "var(--dm-sans), system-ui, sans-serif", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#C05C42", marginBottom: "1rem" }}>
        404
      </p>
      <h1 style={{ fontFamily: "var(--fraunces), Georgia, serif", fontStyle: "italic", fontWeight: 900, fontSize: "clamp(3rem, 8vw, 6rem)", lineHeight: 0.95, letterSpacing: "-0.03em", color: "var(--ink)", marginBottom: "1.5rem", whiteSpace: "pre-line" }}>
        {page.heading}
      </h1>
      <p style={{ fontSize: "0.9375rem", color: "var(--ink-mid)", marginBottom: "2.5rem", maxWidth: "32ch", lineHeight: 1.7 }}>
        {page.sub}
      </p>
      <Link href="/" className="btn-primary">
        Back home
      </Link>
    </main>
  );
}
