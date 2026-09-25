"use client";

import { useState } from "react";

export type ProjectRow = {
  id: number;
  name: string;
  href: string;
  source?: string;
  blurb: string;
  language: string | null;
  year: number;
};

const FIRST = 6;
const external = { target: "_blank", rel: "noreferrer" } as const;

// Project cards, two to a row. The first few show; the rest wait behind a button.
export function ProjectGrid({ projects }: { projects: ProjectRow[] }) {
  const [all, setAll] = useState(false);
  const shown = all ? projects : projects.slice(0, FIRST);

  return (
    <>
      <ul className="projects">
        {shown.map((p) => (
          <li key={p.id} className="project">
            <a href={p.href} {...external} className="project-link" data-cuelume-hover="tick">
              <span className="project-name">
                {p.name}
                <span className="project-arrow" aria-hidden="true">
                  ↗
                </span>
              </span>
              {p.blurb ? <span className="project-blurb">{p.blurb}</span> : null}
            </a>
            <span className="project-meta">
              {p.language ? <span>{p.language}</span> : null}
              <span>{p.year}</span>
              {p.source ? (
                <a href={p.source} {...external} className="project-source">
                  source
                </a>
              ) : null}
            </span>
          </li>
        ))}
      </ul>
      {projects.length > FIRST ? (
        <button type="button" className="projects-more" onClick={() => setAll((a) => !a)} data-cuelume-hover="tick">
          {all ? "show fewer" : `show all ${projects.length}`}
        </button>
      ) : null}
    </>
  );
}
