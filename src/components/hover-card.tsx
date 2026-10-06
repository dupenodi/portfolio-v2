"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

// ── shared by every hover card on the page ──

// Only one card is ever open, across the inline link and the link list: which one, and how to close it.
let active: { id: string; close: () => void } | null = null;

export function claimHover(id: string, close: () => void) {
  if (active && active.id !== id) active.close();
  active = { id, close };
}

export function releaseHover(id: string) {
  if (active?.id === id) active = null;
}

// Long enough to cross from a link to its card without the card closing behind you.
export const CLOSE_DELAY = 220;
export const EDGE = 12;

// Fetches images once the page has loaded and gone idle, so a card's first appearance isn't a blank frame. Not before:
// the studio's models are downloading then. And not at all where cards never open (touch screens) or on a data saver.
export function useWarm(srcs: string[]) {
  const key = srcs.join("|");
  useEffect(() => {
    if (!key || !window.matchMedia("(hover: hover)").matches) return;
    if ((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData) return;
    let cancelled = false;
    const warm = () => {
      if (cancelled) return;
      for (const src of key.split("|")) new Image().src = src;
    };
    const idle = () =>
      window.requestIdleCallback ? window.requestIdleCallback(warm, { timeout: 4000 }) : window.setTimeout(warm, 1200);
    const afterLoad = () => window.setTimeout(idle, 1500);
    if (document.readyState === "complete") afterLoad();
    else addEventListener("load", afterLoad, { once: true });
    return () => {
      cancelled = true;
      removeEventListener("load", afterLoad);
    };
  }, [key]);
}

// ── an inline link whose card hangs below it and trails the cursor along it ──

type Props = {
  href: string;
  // The card itself. It's mounted on first hover and kept around after, so its images stay decoded.
  card: ReactNode;
  width: number;
  warm?: string[];
  className?: string;
  children: ReactNode;
};

const GAP = 14;

// The card can be moved onto and clicked: it stays open while the pointer is on the link (or the strip under it that
// bridges the gap) or the card, and closes a beat after it leaves both. Touch screens just get the link.
export function HoverCard({ href, card, width, warm = [], className, children }: Props) {
  const id = useId();
  const linkRef = useRef<HTMLAnchorElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const pointer = useRef<number | null>(null);
  const closeTimer = useRef(0);
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  useWarm(warm);

  useEffect(() => {
    if (!open) return;
    const link = linkRef.current;
    const card = cardRef.current;
    if (!link || !card) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = link.getBoundingClientRect();
    let x = pointer.current ?? start.left + start.width / 2;
    let tilt = 0;
    let frame = 0;

    const tick = () => {
      const rect = link.getBoundingClientRect();
      const target = pointer.current ?? rect.left + rect.width / 2;
      const prev = x;
      x = still ? target : x + (target - x) * 0.16;
      const lean = Math.max(-9, Math.min(9, (x - prev) * 0.9));
      tilt = still ? 0 : tilt + (lean - tilt) * 0.2;
      const left = Math.max(EDGE, Math.min(window.innerWidth - width - EDGE, x - width / 2));
      card.style.transform = `translate3d(${left}px, ${rect.bottom + GAP}px, 0) rotate(${tilt.toFixed(2)}deg)`;
      // Anything marked as drifting inside shifts a touch the other way, so the card reads as glass over it.
      const along = (target - (rect.left + rect.width / 2)) / Math.max(rect.width, 1);
      card.style.setProperty("--drift", `${(-along * 14).toFixed(2)}px`);
      frame = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(frame);
  }, [open, width]);

  const close = useCallback(() => {
    window.clearTimeout(closeTimer.current);
    pointer.current = null;
    setOpen(false);
    releaseHover(id);
  }, [id]);

  const show = (viaKeyboard = false) => {
    if (!viaKeyboard && !window.matchMedia("(hover: hover)").matches) return;
    window.clearTimeout(closeTimer.current);
    claimHover(id, close);
    if (!mounted) {
      setMounted(true);
      // Mount closed first so the spring-in transition has a start state to run from.
      requestAnimationFrame(() => requestAnimationFrame(() => setOpen(true)));
    } else setOpen(true);
  };
  const hide = () => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(close, CLOSE_DELAY);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  return (
    <>
      <a
        ref={linkRef}
        href={href}
        className="hover-link"
        data-cuelume-hover="tick"
        data-placement="below"
        {...(href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
        onPointerEnter={(e) => {
          if (e.pointerType !== "mouse") return;
          pointer.current = e.clientX;
          show();
        }}
        onPointerMove={(e) => {
          if (e.pointerType === "mouse") pointer.current = e.clientX;
        }}
        onPointerLeave={hide}
        onFocus={(e) => e.currentTarget.matches(":focus-visible") && show(true)}
        onBlur={hide}
      >
        {children}
      </a>
      {mounted &&
        createPortal(
          <div
            ref={cardRef}
            className={`hover-card ${className ?? ""}`}
            data-placement="below"
            data-open={open || undefined}
            style={{ width }}
            aria-hidden="true"
            onPointerEnter={() => window.clearTimeout(closeTimer.current)}
            onPointerLeave={hide}
            // The card is aria-hidden, so clicking its controls mustn't pull focus into it; clicks still go through.
            onPointerDown={(e) => e.preventDefault()}
          >
            <div className="pop-card" data-active={open || undefined}>
              {card}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
