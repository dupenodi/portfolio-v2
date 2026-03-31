import type { Metadata } from "next";
import {
  Fraunces,
  DM_Sans,
  // ── Display font options ──────────────────────────────────────────────────
  // Swap `fraunces` below with any of these. Also update the className on <html>.
  Cormorant_Garamond,   // combo A: Cormorant Garamond + DM Sans  → sharp, high-contrast editorial
  DM_Serif_Display,     // combo B: DM Serif Display + DM Sans    → same family, clean & paired
  Instrument_Serif,     // combo C: Instrument Serif + DM Sans    → modern, stylish italic
  Playfair_Display,     // combo D: Playfair Display + DM Sans    → bold classic editorial
  // ── Body font alternatives ────────────────────────────────────────────────
  Inter,                // combo E: Fraunces + Inter               → neutral, very readable
  Libre_Baskerville,    // combo F: Libre Baskerville (both)       → full serif, literary
  // ─────────────────────────────────────────────────────────────────────────
} from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import { Analytics } from "@vercel/analytics/next";

// ── ACTIVE DISPLAY FONT — swap variable name in <html> className to switch ──
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--display",
  display: "swap",
  style: ["normal", "italic"],
  weight: ["300", "400", "500", "600", "700", "900"],
});

// ── Display font alternatives (uncomment one, comment fraunces above) ────────

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--display",
  display: "swap",
  style: ["normal", "italic"],
  weight: ["300", "400", "500", "600", "700"],
});

const dmSerifDisplay = DM_Serif_Display({
  subsets: ["latin"],
  variable: "--display",
  display: "swap",
  style: ["normal", "italic"],
  weight: ["400"],
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--display",
  display: "swap",
  style: ["normal", "italic"],
  weight: ["400"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--display",
  display: "swap",
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

// ── ACTIVE BODY FONT ─────────────────────────────────────────────────────────
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--body",
  display: "swap",
});

// ── Body font alternatives ────────────────────────────────────────────────────

const inter = Inter({
  subsets: ["latin"],
  variable: "--body",
  display: "swap",
});

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  variable: "--body",
  display: "swap",
  style: ["normal", "italic"],
  weight: ["400", "700"],
});

// ── HOW TO SWITCH ─────────────────────────────────────────────────────────────
// 1. Change the `variable: "--display"` font object used in <html> className
// 2. Change the `variable: "--body"` font object used in <html> className
// 3. Update globals.css: --fraunces → var(--display), --dm-sans → var(--body)
//
// COMBOS TO TRY:
//   A) cormorant.variable   + dmSans.variable          → sharp editorial
//   B) dmSerifDisplay.variable + dmSans.variable        → clean, paired
//   C) instrumentSerif.variable + dmSans.variable       → modern & stylish
//   D) playfair.variable    + dmSans.variable           → bold classic
//   E) fraunces.variable    + inter.variable            → warm display + neutral body
//   F) libreBaskerville.variable + libreBaskerville.variable → full serif, literary
// ─────────────────────────────────────────────────────────────────────────────

// suppress unused variable warnings — these are intentional options
void cormorant, dmSerifDisplay, instrumentSerif, playfair, inter, libreBaskerville;

export const metadata: Metadata = {
  title: "Sharath Donepudi — Full Stack AI Developer",
  description: "Founding Engineer at Niti AI. Building AI-first infrastructure — LLM pipelines, agent architectures, and everything in between.",
  authors: [{ name: "Sharath Donepudi" }],
  metadataBase: new URL("https://dupenodi.dev"),
  openGraph: {
    title: "Sharath Donepudi — Full Stack AI Developer",
    description: "Founding Engineer at Niti AI. Building AI-first infrastructure — LLM pipelines, agent architectures, and everything in between.",
    url: "https://dupenodi.dev",
    siteName: "Sharath Donepudi",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sharath Donepudi — Full Stack AI Developer",
    description: "Founding Engineer at Niti AI. Building AI-first infrastructure — LLM pipelines, agent architectures, and everything in between.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // To switch: replace fraunces.variable and/or dmSans.variable with another font's .variable
    <html
      lang="en"
      className={`${fraunces.variable} ${dmSans.variable}`}
    >
      {/* Prevent flash of wrong theme */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var s=localStorage.getItem('theme');var m=window.matchMedia('(prefers-color-scheme: dark)').matches;if(s==='dark'||(s===null&&m)){document.documentElement.classList.add('dark');}})();`,
          }}
        />
      </head>
      <body style={{ background: "var(--parchment)", color: "var(--ink)" }}>
        <Navigation />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
