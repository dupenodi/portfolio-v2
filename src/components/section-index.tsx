"use client";

import { useEffect, useState } from "react";

// A small running index pinned to the corner once the studio has scrolled away: where you are, and a way to jump.
export function SectionIndex({ sections }: { sections: { id: string; label: string }[] }) {
  const [shown, setShown] = useState(false);
  const [current, setCurrent] = useState<string | null>(null);

  useEffect(() => {
    const stage = document.querySelector(".stage");
    const stageIo = stage
      ? new IntersectionObserver(([entry]) => setShown(!entry.isIntersecting), { rootMargin: "0px 0px -60% 0px" })
      : null;
    if (stage) stageIo?.observe(stage);

    // The current section is the last one whose top has crossed a line a third of the way down the screen.
    const els = sections.map((s) => document.getElementById(s.id)).filter((el): el is HTMLElement => el !== null);
    const pick = () => {
      const line = innerHeight / 3;
      let id: string | null = null;
      for (const el of els) if (el.getBoundingClientRect().top < line) id = el.id;
      setCurrent(id);
    };
    pick();
    addEventListener("scroll", pick, { passive: true });
    addEventListener("resize", pick);
    return () => {
      stageIo?.disconnect();
      removeEventListener("scroll", pick);
      removeEventListener("resize", pick);
    };
  }, [sections]);

  return (
    <nav className="section-index" data-shown={shown || undefined} aria-label="sections" inert={!shown}>
      <a href="#top" className="section-index-home" data-cuelume-hover="tick" aria-label="back to the studio">
        ↑
      </a>
      {sections.map((s) => (
        <a key={s.id} href={`#${s.id}`} data-on={current === s.id || undefined} data-cuelume-hover="tick">
          {s.label}
        </a>
      ))}
    </nav>
  );
}
