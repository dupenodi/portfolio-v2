"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Project } from "@/lib/projects";
import { EDGE, claimHover, releaseHover, useWarm } from "./hover-card";
import { SiteCard } from "./link-cards";

const FIRST = 6;
const external = { target: "_blank", rel: "noreferrer" } as const;

// The preview window: how wide it is, and how far it sits from the cursor.
const PEEK_WIDTH = 340;
const OFFSET = 22;

function host(url: string | null) {
  if (!url) return "";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

// Project cards, two to a row. The first few show; the rest wait behind a button. A card with a link opens it; a
// source link (when there's a separate one) sits on top. Hovering a card with a picture floats the product itself next
// to the cursor, in a little browser window; on touch screens the picture sits in the card instead.
export function ProjectGrid({ projects }: { projects: Project[] }) {
  const [all, setAll] = useState(false);
  // Which product the window shows (kept while it closes, so it fades out on the last one), and whether it's up.
  const [peek, setPeek] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const wanted = useRef(false);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const hoverId = useId();
  const shown = all ? projects : projects.slice(0, FIRST);
  useWarm(projects.flatMap((p) => (p.image ? [p.image] : [])));

  const close = useCallback(() => {
    wanted.current = false;
    setOpen(false);
    releaseHover(hoverId);
  }, [hoverId]);

  const track = (e: React.PointerEvent, p: Project) => {
    if (e.pointerType !== "mouse" || !window.matchMedia("(hover: hover)").matches) return;
    pointer.current = { x: e.clientX, y: e.clientY };
    if (!p.image) return close();
    setPeek(p.id);
    if (wanted.current) return;
    wanted.current = true;
    claimHover(hoverId, close);
    if (mounted) return setOpen(true);
    setMounted(true);
    // Mount closed first so the spring-in has a start state to run from.
    requestAnimationFrame(() => requestAnimationFrame(() => wanted.current && setOpen(true)));
  };

  return (
    <>
      <ul className="projects" onPointerLeave={close}>
        {shown.map((p) => {
          const body = (
            <>
              {p.image ? (
                <span className="project-shot" aria-hidden="true">
                  {/* eslint-disable-next-line @next/next/no-img-element -- straight from storage */}
                  <img src={p.image} alt="" width={640} height={360} loading="lazy" decoding="async" />
                </span>
              ) : null}
              <span className="project-name">
                {p.name}
                {p.url ? (
                  <span className="project-arrow" aria-hidden="true">
                    ↗
                  </span>
                ) : null}
              </span>
              {p.description ? <span className="project-blurb">{p.description}</span> : null}
            </>
          );
          return (
            <li key={p.id} className="project" onPointerEnter={(e) => track(e, p)} onPointerMove={(e) => track(e, p)}>
              {p.url ? (
                <a href={p.url} {...external} className="project-link" data-cuelume-hover="tick">
                  {body}
                </a>
              ) : (
                <div className="project-link">{body}</div>
              )}
              <span className="project-meta">
                {p.url ? <span>{host(p.url)}</span> : null}
                {p.year ? <span>{p.year}</span> : null}
                {p.sourceUrl ? (
                  <a href={p.sourceUrl} {...external} className="project-source">
                    source
                  </a>
                ) : null}
              </span>
            </li>
          );
        })}
      </ul>
      {projects.length > FIRST ? (
        <button type="button" className="projects-more" onClick={() => setAll((a) => !a)} data-cuelume-hover="tick">
          {all ? "show fewer" : `show all ${projects.length}`}
        </button>
      ) : null}
      {mounted ? <ProjectPeek projects={projects} active={peek} open={open} pointer={pointer} onClose={close} /> : null}
    </>
  );
}

// One window for the whole grid. It trails the cursor on a spring and leans into the motion; moving from card to card
// keeps it up and crossfades to the next product. It sits beside the cursor, flipping sides near the viewport's edges,
// and never takes the pointer: the card under it is the link.
function ProjectPeek({
  projects,
  active,
  open,
  pointer,
  onClose,
}: {
  projects: Project[];
  active: string | null;
  open: boolean;
  pointer: React.RefObject<{ x: number; y: number } | null>;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const withImages = projects.filter((p) => p.image);

  useEffect(() => {
    if (!open) return;
    const card = ref.current;
    const start = pointer.current;
    if (!card || !start) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const place = (p: { x: number; y: number }) => {
      const h = card.offsetHeight;
      const right = p.x + OFFSET + PEEK_WIDTH <= window.innerWidth - EDGE;
      const below = p.y + OFFSET + h <= window.innerHeight - EDGE;
      return {
        x: right ? p.x + OFFSET : Math.max(EDGE, p.x - OFFSET - PEEK_WIDTH),
        y: below ? p.y + OFFSET : Math.max(EDGE, p.y - OFFSET - h),
      };
    };
    let at = place(start);
    let tilt = 0;
    let frame = 0;

    const tick = () => {
      const target = place(pointer.current ?? start);
      const prev = at.x;
      at = still ? target : { x: at.x + (target.x - at.x) * 0.18, y: at.y + (target.y - at.y) * 0.18 };
      const lean = Math.max(-7, Math.min(7, (at.x - prev) * 0.5));
      tilt = still ? 0 : tilt + (lean - tilt) * 0.18;
      card.style.transform = `translate3d(${at.x.toFixed(1)}px, ${at.y.toFixed(1)}px, 0) rotate(${tilt.toFixed(2)}deg)`;
      card.style.setProperty("--drift", `${(-tilt * 1.6).toFixed(2)}px`);
      frame = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(frame);
  }, [open, pointer]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const current = withImages.find((p) => p.id === active) ?? null;
  return createPortal(
    <div
      ref={ref}
      className="hover-card project-peek"
      data-open={open || undefined}
      style={{ width: PEEK_WIDTH }}
      aria-hidden="true"
    >
      <div className="pop-card" data-active={open || undefined}>
        <div className="project-peek-shots">
          {withImages.map((p) => (
            <div key={p.id} className="project-peek-shot" data-on={p.id === current?.id || undefined}>
              <SiteCard host={host(p.url) || p.name} image={p.image!} />
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}
