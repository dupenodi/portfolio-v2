"use client";

import { useEffect, useRef, useState } from "react";

export type ProjectRow = {
  id: number;
  name: string;
  href: string;
  source?: string;
  blurb: string;
  language: string | null;
  year: number;
  // GitHub's social card for the repo, shown trailing the cursor. Private repos have none.
  preview?: string;
};

const external = { target: "_blank", rel: "noreferrer" } as const;

// An index of everything: one row per project, the rest dim while you're on one, and on a mouse its social card
// floats beside the cursor, trailing it a little.
export function ProjectIndex({ projects }: { projects: ProjectRow[] }) {
  const listRef = useRef<HTMLOListElement>(null);
  const floatRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 900px)");
    const update = () => setHover(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // The card chases the pointer with a spring-ish lerp and leans into the direction it's moving.
  useEffect(() => {
    const list = listRef.current;
    const float = floatRef.current;
    if (!hover || !list || !float) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let tx = 0, ty = 0, x = 0, y = 0, frame = 0, seeded = false;
    const move = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!seeded) {
        x = tx;
        y = ty;
        seeded = true;
      }
    };
    const loop = () => {
      const k = still ? 1 : 0.14;
      const dx = tx - x;
      x += dx * k;
      y += (ty - y) * k;
      const lean = still ? 0 : Math.max(-6, Math.min(6, dx * 0.06));
      float.style.transform = `translate3d(${x + 28}px, ${y - 90}px, 0) rotate(${lean}deg)`;
      frame = requestAnimationFrame(loop);
    };
    list.addEventListener("pointermove", move);
    frame = requestAnimationFrame(loop);
    return () => {
      list.removeEventListener("pointermove", move);
      cancelAnimationFrame(frame);
    };
  }, [hover]);

  const shown = active === null ? null : projects[active];

  return (
    <>
      <ol ref={listRef} className="index" data-dim={active !== null || undefined} onPointerLeave={() => setActive(null)}>
        {projects.map((p, i) => (
          <li key={p.id} data-on={active === i || undefined} onPointerEnter={() => setActive(i)}>
            <a href={p.href} {...external} className="index-row" data-cuelume-hover="tick" onFocus={() => setActive(i)} onBlur={() => setActive(null)}>
              <span className="index-num">{String(i + 1).padStart(2, "0")}</span>
              <span className="index-name">{p.name}</span>
              <span className="index-blurb">{p.blurb}</span>
              <span className="index-meta">
                {p.language ? <span>{p.language}</span> : null}
                <span>{p.year}</span>
              </span>
              <span className="index-arrow" aria-hidden="true">
                ↗
              </span>
            </a>
            {p.source ? (
              <a href={p.source} {...external} className="index-source">
                source
              </a>
            ) : null}
          </li>
        ))}
      </ol>
      {hover ? (
        <div ref={floatRef} className="index-float" data-open={Boolean(shown?.preview) || undefined} aria-hidden="true">
          {projects.map((p, i) =>
            p.preview ? (
              // eslint-disable-next-line @next/next/no-img-element -- remote social cards, fetched only on hover
              <img key={p.id} src={active === i || loaded(p.id) ? p.preview : undefined} alt="" data-on={active === i || undefined} onLoad={() => seen.add(p.id)} />
            ) : null,
          )}
        </div>
      ) : null}
    </>
  );
}

// Once a card's been fetched it stays mounted with its src, so coming back to a row is instant.
const seen = new Set<number>();
const loaded = (id: number) => seen.has(id);
