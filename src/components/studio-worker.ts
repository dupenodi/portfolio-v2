import type { ClothSetup } from "./cloth-solver";
import { floorData, plasterNormalData } from "./studio-noise";

// The page's side of the studio worker (studio.worker.ts): one shared worker for the page's lifetime. Without
// workers, the same code runs in the page instead.

export type ToWorker =
  | { type: "noise"; id: number; kind: NoiseKind }
  | { type: "cloth-init"; id: number; setup: ClothSetup }
  | { type: "cloth-step"; id: number; dt: number; grabbed: number; target: [number, number, number] }
  | { type: "cloth-dispose"; id: number };

export type ClothFrame = { pos: Float32Array; normal: Float32Array; motion: number };

type FromWorker = { type: "noise"; id: number; buffers: Uint8Array[] } | ({ type: "cloth"; id: number } & ClothFrame);

type NoiseKind = "plaster" | "floor";

let worker: Worker | null | undefined;
let nextId = 1;
const pending = new Map<number, { kind: NoiseKind; resolve: (buffers: Uint8Array[]) => void }>();
const cloths = new Map<number, (frame: ClothFrame) => void>();

/** The shared worker, started on first use; null where workers aren't available. */
export function studioWorker() {
  if (worker !== undefined) return worker;
  try {
    worker = new Worker(new URL("./studio.worker.ts", import.meta.url), { type: "module" });
    worker.addEventListener("message", ({ data }: MessageEvent<FromWorker>) => {
      if (data.type === "noise") {
        pending.get(data.id)?.resolve(data.buffers);
        pending.delete(data.id);
      } else cloths.get(data.id)?.(data);
    });
    // It failed to load or crashed: carry on in the page (cloths notice `studioWorker()` is gone).
    worker.addEventListener("error", () => {
      worker?.terminate();
      worker = null;
      for (const { kind, resolve } of pending.values()) resolve(noiseHere(kind));
      pending.clear();
    });
  } catch {
    worker = null;
  }
  return worker;
}

export function post(message: ToWorker, transfer: Transferable[] = []) {
  studioWorker()?.postMessage(message, transfer);
}

/** A procedural texture's pixels (see studio-noise), built off the main thread. */
export function studioNoise(kind: NoiseKind): Promise<Uint8Array[]> {
  if (!studioWorker()) return Promise.resolve(noiseHere(kind));
  const id = nextId++;
  return new Promise((resolve) => {
    pending.set(id, { kind, resolve });
    post({ type: "noise", id, kind });
  });
}

function noiseHere(kind: NoiseKind) {
  return kind === "plaster" ? [plasterNormalData()] : Object.values(floorData());
}

/** Registers a cloth in the worker; `onFrame` gets each simulated frame. Returns its id. */
export function addCloth(setup: ClothSetup, onFrame: (frame: ClothFrame) => void) {
  const id = nextId++;
  cloths.set(id, onFrame);
  post({ type: "cloth-init", id, setup });
  return id;
}

export function removeCloth(id: number) {
  cloths.delete(id);
  post({ type: "cloth-dispose", id });
}
