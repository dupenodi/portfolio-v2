import type { Metadata } from "next";
import { Syne, Inter } from "next/font/google";
import "./globals.css";
import CustomCursor from "@/components/CustomCursor";
import Navigation from "@/components/Navigation";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sarath Donepudi — Full Stack AI Developer",
  description:
    "Founding Engineer at Niti AI. Building AI-first infrastructure for the future of retention marketing.",
  keywords: ["Full Stack Developer", "AI Developer", "Next.js", "React", "Python", "LangChain"],
  authors: [{ name: "Sarath Donepudi" }],
  openGraph: {
    title: "Sarath Donepudi — Full Stack AI Developer",
    description: "Founding Engineer at Niti AI. Building AI-first infrastructure.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${inter.variable}`}>
      <body className="bg-[#060608] text-slate-100 antialiased overflow-x-hidden">
        <CustomCursor />
        <Navigation />
        {children}
      </body>
    </html>
  );
}
