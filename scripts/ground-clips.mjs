// Grounds the character's animation clips: bakes a vertical correction into each clip's hips track so that,
// at every frame, the lowest point of the actual skinned mesh rests on the floor (y = 0), except while the
// character is genuinely in the air.
//
// Why: the clips were authored with different root heights. Measured on the mesh, Happy_Jump and
// Short_Breathe_and_Look_Around hovered 7 cm above the floor, the handstand's hand never reached it,
// Jump_Push_Up sat 74 cm under it, and sitting down against the wall sank the hips 20 cm into it. They also
// touch down with different parts (feet, a hand, the seat), so grounding by the ankle bones can't work.
//
// How: sample the clip on the real model at each hips keyframe and record the mesh's lowest point. The floor
// contact level is the morphological opening of that curve (a min filter, then a max filter, over a window a
// little longer than the longest jump). The opening follows valleys and level changes, like sitting down, exactly,
// and leaves only the peaks narrower than the window standing above it. A peak is kept as a jump only if it's
// ballistic, i.e. about as high as its airtime implies under gravity (h = g·T²/8). A slow 7 cm rise in a crouch is
// hovering, not jumping. Everywhere else the lowest point goes exactly onto the floor.
//
// Idempotent: a grounded clip measures ~0 and is left alone. Run after adding or replacing a clip:
//   node scripts/ground-clips.mjs [public/character/anims/Name.glb ...]

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const ROOT = new URL("..", import.meta.url).pathname;
// The uncompressed source: the served copy is meshopt-compressed, which this parser has no decoder for.
const MODEL = join(ROOT, "assets-src/character/model.glb");
const ANIMS = join(ROOT, "assets-src/character/anims");
// The longest airborne moment kept as a jump, in seconds (Jump_Push_Up's is ~0.7 s).
const JUMP = 0.8;
// A clip starting this far above its lowest point falls in from the air (the dive); it keeps its landing level
// until it lands.
const FALLS_IN = 0.5;
// A peak counts as a jump if it reaches at least this share of the height its airtime implies.
const BALLISTIC = 0.6;
// Leave a clip alone if no keyframe needs more than this (metres, at the character's 1.8 m height).
const TOLERANCE = 0.002;

// ── GLB in and out ─────────────────────────────────────────────────────────────────────────────────────────────

function readGlb(path) {
  const buf = readFileSync(path);
  const jsonLength = buf.readUInt32LE(12);
  const json = JSON.parse(buf.subarray(20, 20 + jsonLength).toString("utf8"));
  const binStart = 20 + jsonLength;
  const bin = binStart < buf.length ? buf.subarray(binStart + 8, binStart + 8 + buf.readUInt32LE(binStart)) : Buffer.alloc(0);
  return { json, bin: Buffer.from(bin) };
}

function writeGlb({ json, bin }) {
  const pad = (b, fill) => Buffer.concat([b, Buffer.alloc((4 - (b.length % 4)) % 4, fill)]);
  const jsonChunk = pad(Buffer.from(JSON.stringify(json)), 0x20);
  const binChunk = pad(bin, 0);
  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x46546c67, 0);
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(12 + 8 + jsonChunk.length + (binChunk.length ? 8 + binChunk.length : 0), 8);
  const chunk = (data, type) => {
    const h = Buffer.alloc(8);
    h.writeUInt32LE(data.length, 0);
    h.writeUInt32LE(type, 4);
    return Buffer.concat([h, data]);
  };
  return Buffer.concat([header, chunk(jsonChunk, 0x4e4f534a), ...(binChunk.length ? [chunk(binChunk, 0x004e4942)] : [])]);
}

// three can't decode images in Node, and only the geometry and skeleton matter here: drop textures before parsing.
async function parse(glb) {
  const json = structuredClone(glb.json);
  delete json.images;
  delete json.textures;
  delete json.samplers;
  for (const m of json.materials ?? []) {
    delete m.normalTexture;
    delete m.occlusionTexture;
    delete m.emissiveTexture;
    delete m.extensions;
    if (m.pbrMetallicRoughness) {
      delete m.pbrMetallicRoughness.baseColorTexture;
      delete m.pbrMetallicRoughness.metallicRoughnessTexture;
    }
  }
  json.extensionsUsed = (json.extensionsUsed ?? []).filter((e) => !/texture|materials/.test(e));
  json.extensionsRequired = (json.extensionsRequired ?? []).filter((e) => !/texture|materials/.test(e));
  const buf = writeGlb({ json, bin: glb.bin });
  return new GLTFLoader().parseAsync(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength), "");
}

// ── measuring ──────────────────────────────────────────────────────────────────────────────────────────────────

// The export repeats each corner per face; skinning one copy of each position is enough.
function distinctVertices(geometry) {
  const pos = geometry.getAttribute("position");
  const seen = new Set();
  const out = [];
  for (let i = 0; i < pos.count; i++) {
    const key = `${Math.round(pos.getX(i) * 1e4)},${Math.round(pos.getY(i) * 1e4)},${Math.round(pos.getZ(i) * 1e4)}`;
    if (!seen.has(key)) {
      seen.add(key);
      out.push(i);
    }
  }
  return out;
}

// Min then max filter over ±radius seconds (the ends repeat their edge value).
function opening(times, values, radius) {
  const filter = (src, pickLow) =>
    src.map((_, i) => {
      let best = src[i];
      for (let j = i - 1; j >= 0 && times[i] - times[j] <= radius; j--) best = pickLow ? Math.min(best, src[j]) : Math.max(best, src[j]);
      for (let j = i + 1; j < src.length && times[j] - times[i] <= radius; j++) best = pickLow ? Math.min(best, src[j]) : Math.max(best, src[j]);
      return best;
    });
  return filter(filter(values, true), false);
}

// ── main ───────────────────────────────────────────────────────────────────────────────────────────────────────

const model = await parse(readGlb(MODEL));
const scene = model.scene;
let mesh = null;
scene.traverse((o) => {
  if (!mesh && o.isSkinnedMesh) mesh = o;
});
const hipsName = (name) => /hips$/i.test(name);
let hips = null;
scene.traverse((o) => {
  if (!hips && hipsName(o.name)) hips = o;
});
if (!mesh || !hips) throw new Error("model has no skinned mesh or hips bone");

// Everything is measured in the model's own units, then scaled so the tolerance and printout read in metres at
// the height the site shows him (the page scales him to 1.8 m).
scene.updateMatrixWorld(true);
const bindBox = new THREE.Box3().setFromObject(scene);
const toMetres = 1.8 / bindBox.getSize(new THREE.Vector3()).y;
const floorY = bindBox.min.y;
const vertices = distinctVertices(mesh.geometry);
const v = new THREE.Vector3();
const lowestPoint = () => {
  scene.updateMatrixWorld(true);
  mesh.skeleton.update();
  let low = Infinity;
  for (const i of vertices) {
    mesh.getVertexPosition(i, v);
    v.applyMatrix4(mesh.matrixWorld);
    if (v.y < low) low = v.y;
  }
  return low - floorY;
};

const files = process.argv.slice(2).length
  ? process.argv.slice(2).map((p) => join(ROOT, p))
  : readdirSync(ANIMS)
      .filter((f) => f.endsWith(".glb"))
      .map((f) => join(ANIMS, f));

const mixer = new THREE.AnimationMixer(scene);
const cm = (x) => `${(x * toMetres * 100).toFixed(1)}cm`;
for (const file of files) {
  const glb = readGlb(file);
  const clip = (await parse(glb)).animations[0];
  const track = clip?.tracks.find((t) => /hips\.position$/i.test(t.name));
  if (!track) {
    console.log(`${file}: no hips track, skipped`);
    continue;
  }
  mixer.stopAllAction();
  mixer.uncacheRoot(scene);
  const action = mixer.clipAction(clip);
  action.setLoop(THREE.LoopOnce, 1);
  action.clampWhenFinished = true;
  action.play();
  const times = Array.from(track.times);
  const lowest = times.map((t) => {
    action.time = t;
    mixer.update(0);
    return lowestPoint();
  });

  const contact = opening(times, lowest, JUMP / 2);
  const low = Math.min(...lowest);
  if (lowest[0] - low > FALLS_IN / toMetres) {
    // Landed: the first frame the fall is over, i.e. nothing within the next jump's length goes much lower. (Not
    // "near the clip's lowest point": that can be something later dipping under the floor, which would hold the
    // whole landing at that dip's level.)
    const settled = (i) => lowest.every((y, j) => j < i || times[j] - times[i] > JUMP || y > lowest[i] - 0.05 / toMetres);
    const landed = lowest.findIndex((_, i) => settled(i));
    for (let i = 0; i < landed; i++) contact[i] = contact[landed];
  }
  // Keep the jumps; pin everything else to the floor.
  const g = 9.81 / toMetres;
  const eps = 0.01 / toMetres;
  for (let i = 0; i < times.length; ) {
    if (lowest[i] - contact[i] <= eps) {
      contact[i] = lowest[i];
      i++;
      continue;
    }
    let j = i;
    let peak = 0;
    for (; j < times.length && lowest[j] - contact[j] > eps; j++) peak = Math.max(peak, lowest[j] - contact[j]);
    const airtime = times[Math.min(j, times.length - 1)] - times[Math.max(i - 1, 0)];
    if (peak < (BALLISTIC * g * airtime ** 2) / 8) for (let k = i; k < j; k++) contact[k] = lowest[k];
    i = j;
  }
  const worst = Math.max(...contact.map(Math.abs));
  const name = file.split("/").pop();
  if (worst * toMetres < TOLERANCE) {
    console.log(`${name}: already grounded`);
    continue;
  }

  // The world-space lift, in the hips' parent space (the armature is scaled and turned from Z-up).
  scene.updateMatrixWorld(true);
  const toParent = hips.parent.matrixWorld.clone().invert();
  const origin = new THREE.Vector3().applyMatrix4(toParent);
  const deltaFor = (lift) => new THREE.Vector3(0, lift, 0).applyMatrix4(toParent).sub(origin);

  // The same channel in the file: the hips node's translation sampler.
  const { json, bin } = glb;
  const nodeIndex = json.nodes.findIndex((n) => THREE.PropertyBinding.sanitizeNodeName(n.name ?? "") === track.name.split(".")[0]);
  const animation = json.animations[0];
  const channel = animation.channels.find((c) => c.target.node === nodeIndex && c.target.path === "translation");
  const sampler = animation.samplers[channel.sampler];
  const shared = json.animations.some((a) => a.samplers.some((s) => s !== sampler && s.output === sampler.output));
  if (shared) throw new Error(`${name}: hips output accessor is shared`);
  const accessor = json.accessors[sampler.output];
  const view = json.bufferViews[accessor.bufferView];
  if (accessor.componentType !== 5126 || accessor.type !== "VEC3" || view.byteStride || accessor.count !== times.length) {
    throw new Error(`${name}: unexpected hips accessor layout`);
  }
  const base = (view.byteOffset ?? 0) + (accessor.byteOffset ?? 0);
  for (let i = 0; i < accessor.count; i++) {
    const d = deltaFor(-contact[i]);
    for (let k = 0; k < 3; k++) {
      const at = base + (i * 3 + k) * 4;
      bin.writeFloatLE(bin.readFloatLE(at) + d.getComponent(k), at);
    }
  }
  // Keep the accessor's bounds valid.
  if (accessor.min && accessor.max) {
    const min = [Infinity, Infinity, Infinity];
    const max = [-Infinity, -Infinity, -Infinity];
    for (let i = 0; i < accessor.count; i++) {
      for (let k = 0; k < 3; k++) {
        const x = bin.readFloatLE(base + (i * 3 + k) * 4);
        min[k] = Math.min(min[k], x);
        max[k] = Math.max(max[k], x);
      }
    }
    accessor.min = min;
    accessor.max = max;
  }
  writeFileSync(file, writeGlb({ json, bin }));
  const after = lowest.map((y, i) => y - contact[i]);
  console.log(
    `${name}: lowest point was ${cm(low)}..${cm(Math.max(...lowest))}, shifted by up to ${cm(worst)}; now ${cm(Math.min(...after))}..${cm(Math.max(...after))}`,
  );
}
