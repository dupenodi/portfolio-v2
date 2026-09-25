"use client";

import dynamic from "next/dynamic";
import { IntroCopy, type LinkData } from "./intro-copy";

// The studio (three.js and everything on top of it) loads as its own chunk after the page hydrates, so the
// page's links and text are there and interactive right away; the studio fades in behind them.
const CharacterStage = dynamic(() => import("./character-stage").then((m) => m.CharacterStage), { ssr: false });

export function StageLoader({ links }: { links: LinkData }) {
  return (
    <section className="stage">
      <CharacterStage />
      <IntroCopy data={links} />
    </section>
  );
}
