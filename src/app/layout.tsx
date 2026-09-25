import type { Metadata } from "next";
import { site } from "@/lib/site";
import { PAGE_TONE_SCRIPT } from "@/components/page-tone";
import "./globals.css";

export const metadata: Metadata = {
  title: site.name,
  description: "Welcome.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // The script below sets the page's colour and ink on <html> before React hydrates.
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: PAGE_TONE_SCRIPT }} />
      </head>
      <body>
        {/* Without scripts nothing fades in, so show the sections outright. */}
        <noscript>
          <style>{".reveal{opacity:1;transform:none}"}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
