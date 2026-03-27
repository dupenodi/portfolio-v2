"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const links = [
  { label: "About", href: "#about" },
  { label: "Experience", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Blog", href: "#blog" },
  { label: "Contact", href: "#contact" },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: 0.6 }}
        className={`fixed top-0 inset-x-0 z-50 px-6 py-5 transition-all duration-500 ${
          scrolled ? "bg-[#060608]/80 backdrop-blur-xl border-b border-white/[0.05]" : ""
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="#" className="font-display font-black text-xl tracking-tighter">
            <span className="gradient-text">SD</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm text-slate-400 hover:text-white transition-colors duration-200 tracking-wide"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <Link
            href="#contact"
            className="hidden md:inline-flex items-center px-5 py-2 text-sm font-semibold bg-violet-600 hover:bg-violet-500 text-white rounded-full transition-colors duration-200"
          >
            Hire Me
          </Link>

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden flex flex-col justify-center gap-[5px] w-8 h-8"
            aria-label="Toggle menu"
          >
            <span
              className={`block h-[1.5px] bg-white rounded transition-all duration-300 origin-center ${
                open ? "rotate-45 translate-y-[6.5px]" : ""
              }`}
            />
            <span
              className={`block h-[1.5px] bg-white rounded transition-all duration-300 ${
                open ? "opacity-0 scale-x-0" : ""
              }`}
            />
            <span
              className={`block h-[1.5px] bg-white rounded transition-all duration-300 origin-center ${
                open ? "-rotate-45 -translate-y-[6.5px]" : ""
              }`}
            />
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-[#060608]/95 backdrop-blur-2xl flex flex-col items-center justify-center gap-8 md:hidden"
          >
            {links.map((l, i) => (
              <motion.div
                key={l.href}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 24 }}
                transition={{ delay: i * 0.06 }}
              >
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="text-4xl font-display font-bold text-white hover:text-violet-400 transition-colors"
                >
                  {l.label}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
