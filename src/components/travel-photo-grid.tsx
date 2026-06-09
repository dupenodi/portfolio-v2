"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { TravelPhoto } from "@/lib/travel";

type TravelPhotoGridProps = {
  photos: TravelPhoto[];
  tripPlace: string;
};

export function TravelPhotoGrid({ photos, tripPlace }: TravelPhotoGridProps) {
  const [active, setActive] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  const close = useCallback(() => setActive(null), []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showPrev = useCallback(() => {
    setActive((index) =>
      index === null ? null : (index - 1 + photos.length) % photos.length
    );
  }, [photos.length]);

  const showNext = useCallback(() => {
    setActive((index) =>
      index === null ? null : (index + 1) % photos.length
    );
  }, [photos.length]);

  useEffect(() => {
    if (active === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") showPrev();
      if (event.key === "ArrowRight") showNext();
    };

    document.body.style.overflow = "hidden";
    document.body.classList.add("lightbox-open");
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.body.classList.remove("lightbox-open");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [active, close, showNext, showPrev]);

  if (photos.length === 0) return null;

  const current = active === null ? null : photos[active];

  return (
    <>
      <div className="pgrid">
        {photos.map((photo, index) => (
          <button
            key={`${photo.src}-${index}`}
            type="button"
            className="p-cell"
            onClick={() => setActive(index)}
            aria-label={`View photo ${index + 1} of ${photos.length}`}
          >
            <Image
              src={photo.src}
              alt={photo.alt || tripPlace}
              width={800}
              height={800}
              className="p-img"
              sizes="(max-width: 760px) 50vw, 33vw"
            />
          </button>
        ))}
      </div>

      {current && mounted
        ? createPortal(
            <div
              className="t-lightbox"
              role="dialog"
              aria-modal="true"
              aria-label={`${tripPlace} photo ${active! + 1} of ${photos.length}`}
              onClick={close}
            >
              <div
                className="t-lightbox-bar"
                onClick={(event) => event.stopPropagation()}
              >
                <span className="t-lightbox-count">
                  {active! + 1} / {photos.length}
                </span>
                <button
                  type="button"
                  className="t-lightbox-close t-lightbox-close--desktop"
                  onClick={close}
                  aria-label="Close preview"
                >
                  close
                </button>
              </div>

              <button
                type="button"
                className="t-lightbox-nav t-lightbox-nav--prev t-lightbox-nav--side"
                onClick={(event) => {
                  event.stopPropagation();
                  showPrev();
                }}
                aria-label="Previous photo"
              >
                ←
              </button>

              <div className="t-lightbox-stage">
                {/* eslint-disable-next-line @next/next/no-img-element -- full-size preview */}
                <img
                  src={current.src}
                  alt={current.alt || tripPlace}
                  className="t-lightbox-img"
                  onClick={(event) => event.stopPropagation()}
                />
              </div>

              <button
                type="button"
                className="t-lightbox-nav t-lightbox-nav--next t-lightbox-nav--side"
                onClick={(event) => {
                  event.stopPropagation();
                  showNext();
                }}
                aria-label="Next photo"
              >
                →
              </button>

              <div
                className="t-lightbox-foot"
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  type="button"
                  className="t-lightbox-nav t-lightbox-nav--foot t-lightbox-nav--prev"
                  onClick={(event) => {
                    event.stopPropagation();
                    showPrev();
                  }}
                  aria-label="Previous photo"
                >
                  ←
                </button>
                <button
                  type="button"
                  className="t-lightbox-close t-lightbox-close--mobile"
                  onClick={(event) => {
                    event.stopPropagation();
                    close();
                  }}
                  aria-label="Close preview"
                >
                  close
                </button>
                <button
                  type="button"
                  className="t-lightbox-nav t-lightbox-nav--foot t-lightbox-nav--next"
                  onClick={(event) => {
                    event.stopPropagation();
                    showNext();
                  }}
                  aria-label="Next photo"
                >
                  →
                </button>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
