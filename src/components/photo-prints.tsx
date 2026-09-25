"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { TravelPhoto } from "@/lib/travel";

// A few prints laid loosely on the table: each sits at a small tilt, straightens when you reach for it, can be
// picked up and dropped somewhere else, and opens full size on a click that isn't a drag.
const TILTS = [-2.4, 1.6, -0.8, 2.2, -1.8, 1.1];
const DRAG = 5;

type Spot = { x: number; y: number; tilt: number; z: number };

let lift = 10;

export function PhotoPrints({ photos, caption }: { photos: TravelPhoto[]; caption: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState<TravelPhoto | null>(null);
  const [spots, setSpots] = useState<Spot[]>(() => photos.map((_, i) => ({ x: 0, y: 0, tilt: TILTS[i % TILTS.length], z: 1 })));
  const [held, setHeld] = useState<number | null>(null);
  const grab = useRef<{ i: number; px: number; py: number; x: number; y: number; moved: boolean } | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const place = (i: number, patch: Partial<Spot>) => setSpots((all) => all.map((s, j) => (j === i ? { ...s, ...patch } : s)));

  const down = (i: number) => (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return;
    grab.current = { i, px: e.clientX, py: e.clientY, x: spots[i].x, y: spots[i].y, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const move = (e: React.PointerEvent<HTMLButtonElement>) => {
    const g = grab.current;
    if (!g) return;
    const dx = e.clientX - g.px;
    const dy = e.clientY - g.py;
    if (!g.moved && Math.hypot(dx, dy) < DRAG) return;
    if (!g.moved) {
      g.moved = true;
      setHeld(g.i);
      place(g.i, { z: ++lift });
    }
    // A held print swings a little with the hand, like paper does.
    place(g.i, { x: g.x + dx, y: g.y + dy, tilt: Math.max(-9, Math.min(9, e.movementX * 0.9)) });
  };

  const up = (e: React.PointerEvent<HTMLButtonElement>) => {
    const g = grab.current;
    grab.current = null;
    if (!g) return;
    if (!g.moved) {
      setOpen(photos[g.i]);
      return;
    }
    e.preventDefault();
    setHeld(null);
    // Dropped: it settles at a fresh loose angle.
    place(g.i, { tilt: Math.round((Math.random() * 6 - 3) * 10) / 10 });
  };

  return (
    <>
      <div className="prints">
        {photos.map((photo, i) => {
          const s = spots[i];
          return (
            <button
              key={photo.src}
              type="button"
              className="print"
              data-held={held === i || undefined}
              style={{ "--x": `${s.x}px`, "--y": `${s.y}px`, "--tilt": `${s.tilt}deg`, zIndex: s.z } as React.CSSProperties}
              onPointerDown={down(i)}
              onPointerMove={move}
              onPointerUp={up}
              onPointerCancel={() => {
                grab.current = null;
                setHeld(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setOpen(photo);
                }
              }}
              aria-label={`open photo ${i + 1} from ${caption}`}
            >
              <Image src={photo.src} alt={photo.alt || caption} width={567} height={1008} sizes="(max-width: 640px) 44vw, 240px" draggable={false} />
            </button>
          );
        })}
      </div>
      <dialog ref={dialogRef} className="lightbox" onClose={() => setOpen(null)} onClick={() => setOpen(null)}>
        {open ? (
          <Image src={open.src} alt={open.alt || caption} width={1134} height={2016} sizes="(max-width: 640px) 92vw, 50vh" />
        ) : null}
      </dialog>
    </>
  );
}
