import type { Metadata } from "next";
import { site } from "@/lib/site";
import { PAGE_TONE_SCRIPT } from "@/components/page-tone";
import "./globals.css";

export const metadata: Metadata = {
  title: site.name,
  description: "Sharath Donepudi. Former founding engineer at Niti AI. Built marketing intelligence for 20+ brands and Loop from zero to 100k+ daily users.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // The script below sets the page's colour and ink on <html> before React hydrates.
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: PAGE_TONE_SCRIPT }} />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
