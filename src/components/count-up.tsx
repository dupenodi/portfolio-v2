"use client";

import { useEffect, useRef } from "react";

// A figure that runs up to its value the first time it scrolls into view. The server renders the final value, so it
// reads right without scripts and never shifts: the digits are tabular and only their text changes, frame by frame.
export function CountUp({ to, decimals = 0, prefix = "", suffix = "" }: { to: number; decimals?: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const format = (n: number) => `${prefix}${n.toFixed(decimals)}${suffix}`;
  const final = format(to);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Already on screen (a reload mid-page): leave the figure be.
    const box = el.getBoundingClientRect();
    if (box.top < innerHeight && box.bottom > 0) return;
    const show = (n: number) => (el.textContent = `${prefix}${n.toFixed(decimals)}${suffix}`);
    show(0);
    let frame = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / 1600);
          show(to * (1 - Math.pow(1 - t, 4)));
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
      show(to);
    };
  }, [to, decimals, prefix, suffix]);

  return (
    <>
      <span className="sr-only">{final}</span>
      <span ref={ref} aria-hidden="true">
        {final}
      </span>
    </>
  );
}
