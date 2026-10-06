"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { CLOSE_DELAY, EDGE, claimHover, releaseHover, useWarm } from "./hover-card";

export type HoverItem = { label: string; href: string; width: number; card?: ReactNode; warm?: string[] };

// Gap between the list and the card column; each row's hover area reaches right across it (see `.hover-row::after`),
// so moving toward the card never leaves hover territory.
const COLUMN_GAP = 28;
// A spring, not a tween, moves the card: its velocity carries over when the target changes, so sweeping down the list
// reads as one continuous glide with a little overshoot, not a string of separate hops.
const STIFFNESS = 260;
const DAMPING = 25;
// When the pointer is heading right (toward the open card) and clips another row on the way, wait this long before
// switching, and don't if it reaches the card first.
const AIM_DELAY = 150;

// The hero's links, with one card beside them that glides from link to link, crossfading between each link's card.
export function HoverList({ items }: { items: HoverItem[] }) {
  const id = useId();
  const listRef = useRef<HTMLUListElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const rows = useRef<(HTMLAnchorElement | null)[]>([]);
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const activeRef = useRef<number | null>(null);
  const heading = useRef({ x: 0, y: 0, t: 0, vx: 0, vy: 0 });
  const closeTimer = useRef(0);
  const aimTimer = useRef(0);
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<number | null>(null);
  // Cards mount the first time they're shown, then stay, so their images and animations are ready on the way back.
  const [seen, setSeen] = useState<number[]>([]);
  useWarm(items.flatMap((item) => item.warm ?? []));

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  // Which way the pointer's going, smoothed, to tell "on the way to the card" from "moving down the list".
  useEffect(() => {
    if (!open) return;
    const onMove = (e: PointerEvent) => {
      const h = heading.current;
      const dt = Math.max(1, e.timeStamp - h.t);
      if (h.t) {
        h.vx = h.vx * 0.6 + ((e.clientX - h.x) / dt) * 0.4;
        h.vy = h.vy * 0.6 + ((e.clientY - h.y) / dt) * 0.4;
      }
      Object.assign(h, { x: e.clientX, y: e.clientY, t: e.timeStamp });
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [open]);

  // The glide. Starts where the first hovered row is (no flying in from nowhere) and keeps its momentum until closed.
  useEffect(() => {
    if (!open) return;
    const stack = stackRef.current;
    const list = listRef.current;
    if (!stack || !list) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let pos: { x: number; y: number } | null = null;
    const vel = { x: 0, y: 0 };
    let tilt = 0;
    let last = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const dt = Math.min(1 / 30, (now - last) / 1000);
      last = now;
      const i = activeRef.current;
      const row = i === null ? null : rows.current[i];
      const card = i === null ? null : cards.current[i];
      if (i !== null && row && card) {
        const width = items[i].width;
        const height = card.offsetHeight;
        stack.style.width = `${width}px`;
        stack.style.height = `${height}px`;
        const r = row.getBoundingClientRect();
        const tx = Math.min(window.innerWidth - width - EDGE, list.getBoundingClientRect().right + COLUMN_GAP);
        const ty = Math.max(EDGE, Math.min(window.innerHeight - height - EDGE, r.top - 18));
        if (!pos || still) {
          pos = { x: tx, y: ty };
        } else {
          vel.x += (STIFFNESS * (tx - pos.x) - DAMPING * vel.x) * dt;
          vel.y += (STIFFNESS * (ty - pos.y) - DAMPING * vel.y) * dt;
          pos.x += vel.x * dt;
          pos.y += vel.y * dt;
        }
        // Lean back against the direction of travel, like something with a little weight being pulled along.
        const lean = still ? 0 : Math.max(-4, Math.min(4, -vel.y * 0.006));
        tilt += (lean - tilt) * 0.2;
        stack.style.transform = `translate3d(${pos.x.toFixed(2)}px, ${pos.y.toFixed(2)}px, 0) rotate(${tilt.toFixed(2)}deg)`;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [open, items]);

  const close = useCallback(() => {
    window.clearTimeout(closeTimer.current);
    window.clearTimeout(aimTimer.current);
    setOpen(false);
    releaseHover(id);
  }, [id]);

  const enter = (i: number, viaKeyboard = false) => {
    if (!viaKeyboard && !window.matchMedia("(hover: hover)").matches) return;
    window.clearTimeout(closeTimer.current);
    window.clearTimeout(aimTimer.current);
    if (!items[i].card) return;

    const go = () => {
      claimHover(id, close);
      setSeen((s) => (s.includes(i) ? s : [...s, i]));
      setActive(i);
      if (!mounted) {
        setMounted(true);
        // Mount closed first so the spring-in transition has a start state to run from.
        requestAnimationFrame(() => requestAnimationFrame(() => setOpen(true)));
      } else setOpen(true);
    };

    const { vx, vy } = heading.current;
    const aiming = vx > 0.25 && vx > Math.abs(vy) * 0.8;
    if (open && activeRef.current !== null && activeRef.current !== i && aiming && !viaKeyboard) {
      aimTimer.current = window.setTimeout(go, AIM_DELAY);
    } else go();
  };

  const leave = () => {
    window.clearTimeout(aimTimer.current);
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
      <ul ref={listRef} className="hover-list">
        {items.map((item, i) => (
          <li key={item.label}>
            <a
              ref={(el) => {
                rows.current[i] = el;
              }}
              href={item.href}
              className="hover-row"
              data-cuelume-hover="tick"
              data-active={(open && active === i) || undefined}
              {...(item.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
              onPointerEnter={(e) => e.pointerType === "mouse" && enter(i)}
              onPointerLeave={leave}
              onFocus={(e) => e.currentTarget.matches(":focus-visible") && enter(i, true)}
              onBlur={leave}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
      {mounted &&
        createPortal(
          <div
            ref={stackRef}
            className="hover-card hover-stack"
            data-placement="side"
            data-open={open || undefined}
            aria-hidden="true"
            onPointerEnter={() => {
              window.clearTimeout(closeTimer.current);
              window.clearTimeout(aimTimer.current);
            }}
            onPointerLeave={leave}
            // The card is aria-hidden, so clicking its controls mustn't pull focus into it; clicks still go through.
            onPointerDown={(e) => e.preventDefault()}
          >
            <div className="pop-card">
              {items.map((item, i) =>
                item.card && seen.includes(i) ? (
                  <div
                    key={item.label}
                    ref={(el) => {
                      cards.current[i] = el;
                    }}
                    className="hover-stack-item"
                    style={{ width: item.width }}
                    data-pos={active === null || i === active ? "active" : i < active ? "before" : "after"}
                    data-active={(open && i === active) || undefined}
                  >
                    {item.card}
                  </div>
                ) : null,
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
