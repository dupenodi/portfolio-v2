import type { Metadata } from "next";
import { Fraunces, DM_Sans } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--fraunces",
  display: "swap",
  style: ["normal", "italic"],
  weight: ["300", "400", "500", "600", "700", "900"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sarath Donepudi — Full Stack AI Developer",
  description:
    "Founding Engineer at Niti AI. Building AI-first infrastructure for the future of retention marketing.",
  authors: [{ name: "Sarath Donepudi" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${dmSans.variable}`}>
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
      </body>
    </html>
  );
}
