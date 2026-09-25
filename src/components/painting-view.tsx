"use client";

import { useEffect, useRef, useState } from "react";

// The painting on the studio wall, brought up close: it zooms out of its spot on the wall (like the phone
// chat), framed as it hangs. Click the art to look closer; the magnified view follows the pointer.

const ART = "/character/decor/painting.webp";

export function PaintingView({ open, origin, onClose }: { open: boolean; origin: { x: number; y: number } | null; onClose: () => void }) {
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const artRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Open: mount first, then flip to shown next frame so the zoom transition runs. Close: reverse.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setMounted(true);
    else setShown(false);
  }
  useEffect(() => {
    if (open) {
      const id = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
      return () => cancelAnimationFrame(id);
    }
    const t = setTimeout(() => {
      setMounted(false);
      setZoomed(false);
    }, 420);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!shown) return;
    closeRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [shown, onClose]);

  if (!mounted) return null;

  const from = origin ?? { x: innerWidth / 2, y: innerHeight / 2 };
  const dx = from.x - innerWidth / 2;
  const dy = from.y - innerHeight / 2;

  // Magnify around the pointer.
  const focus = (e: React.PointerEvent) => {
    const el = artRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    el.style.setProperty("--fx", `${Math.min(100, Math.max(0, x))}%`);
    el.style.setProperty("--fy", `${Math.min(100, Math.max(0, y))}%`);
  };

  return (
    <div className={`painting-overlay${shown ? " is-open" : ""}`} onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <figure
        className="painting-view"
        role="dialog"
        aria-modal="true"
        aria-label="the painting"
        style={{ transform: shown ? "none" : `translate(${dx}px, ${dy}px) scale(0.12)` }}
      >
        <div className="painting-frame">
          <div className="painting-mat">
            <div
              ref={artRef}
              className={`painting-art${zoomed ? " is-zoomed" : ""}`}
              onPointerMove={focus}
              onPointerDown={(e) => {
                focus(e);
                setZoomed((z) => !z);
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ART} alt="A madhubani painting: rows of fish on blue, circling a flower at the centre, inside a patterned border." draggable={false} />
            </div>
          </div>
        </div>
        <figcaption>
          <span>madhubani, mithila painting from bihar</span>
          <span className="painting-hint">{zoomed ? "click to step back" : "click to look closer"} · esc to close</span>
        </figcaption>
      </figure>
      <button ref={closeRef} type="button" className="painting-close" onClick={onClose} aria-label="close">
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
          <path d="M1 1l12 12M13 1 1 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
