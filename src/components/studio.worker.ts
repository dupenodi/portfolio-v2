/// <reference lib="webworker" />
// The studio's background thread: builds the procedural surface textures at load, then runs the wall flag's cloth
// every frame, so neither competes with rendering on the main thread. See studio-worker.ts for the page's side.

import { ClothSolver, type ClothSetup } from "./cloth-solver";
import { floorData, plasterNormalData } from "./studio-noise";
import type { ToWorker } from "./studio-worker";

const cloths = new Map<number, ClothSolver>();

addEventListener("message", ({ data }: MessageEvent<ToWorker>) => {
  switch (data.type) {
    case "noise": {
      const buffers = data.kind === "plaster" ? [plasterNormalData()] : Object.values(floorData());
      postMessage({ type: "noise", id: data.id, buffers }, { transfer: buffers.map((b) => b.buffer) });
      break;
    }
    case "cloth-init":
      cloths.set(data.id, new ClothSolver(data.setup as ClothSetup));
      break;
    case "cloth-step": {
      const cloth = cloths.get(data.id);
      if (!cloth) break;
      cloth.step(data.dt, data.grabbed, data.target);
      const pos = cloth.pos.slice();
      const normal = cloth.normal.slice();
      postMessage({ type: "cloth", id: data.id, pos, normal, motion: cloth.motion }, { transfer: [pos.buffer, normal.buffer] });
      break;
    }
    case "cloth-dispose":
      cloths.delete(data.id);
      break;
  }
});
