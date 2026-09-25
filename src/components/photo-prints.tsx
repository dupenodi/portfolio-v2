"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { TravelPhoto } from "@/lib/travel";

// A few prints laid loosely on the table: each sits at a small tilt, straightens when you
// reach for it, and opens full size on click.
const TILTS = [-2.4, 1.6, -0.8, 2.2, -1.8, 1.1];

export function PhotoPrints({ photos, caption }: { photos: TravelPhoto[]; caption: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState<TravelPhoto | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <>
      <div className="prints">
        {photos.map((photo, i) => (
          <button
            key={photo.src}
            type="button"
            className="print"
            style={{ "--tilt": `${TILTS[i % TILTS.length]}deg` } as React.CSSProperties}
            onClick={() => setOpen(photo)}
            aria-label={`open photo ${i + 1} from ${caption}`}
          >
            <Image src={photo.src} alt={photo.alt || caption} width={567} height={1008} sizes="(max-width: 640px) 44vw, 220px" />
          </button>
        ))}
      </div>
      <dialog ref={dialogRef} className="lightbox" onClose={() => setOpen(null)} onClick={() => setOpen(null)}>
        {open ? (
          <Image src={open.src} alt={open.alt || caption} width={1134} height={2016} sizes="(max-width: 640px) 92vw, 50vh" />
        ) : null}
      </dialog>
    </>
  );
}
