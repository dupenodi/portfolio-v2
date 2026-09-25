"use client";

import { useEffect, useRef } from "react";

// A hairline across the top of an essay that fills as you read it.
export function ReadingProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - innerHeight;
        el.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 1})`;
      });
    };
    update();
    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", update);
      removeEventListener("resize", update);
    };
  }, []);

  return <div ref={ref} className="reading-progress" aria-hidden="true" />;
}
