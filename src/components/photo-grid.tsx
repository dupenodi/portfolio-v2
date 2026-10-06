"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { TravelPhoto } from "@/lib/travel";

// A trip's photos in a plain grid; a click opens one full size.
export function PhotoGrid({ photos, caption }: { photos: TravelPhoto[]; caption: string }) {
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
      <ul className="photo-grid">
        {photos.map((photo, i) => (
          <li key={photo.src}>
            <button type="button" onClick={() => setOpen(photo)} aria-label={`open photo ${i + 1} from ${caption}`} data-cuelume-hover="tick">
              <Image src={photo.src} alt={photo.alt || caption} width={567} height={756} sizes="(max-width: 640px) 50vw, 240px" />
            </button>
          </li>
        ))}
      </ul>
      <dialog ref={dialogRef} className="lightbox" onClose={() => setOpen(null)} onClick={() => setOpen(null)}>
        {open ? <Image src={open.src} alt={open.alt || caption} width={1134} height={2016} sizes="(max-width: 640px) 92vw, 50vh" /> : null}
      </dialog>
    </>
  );
}
