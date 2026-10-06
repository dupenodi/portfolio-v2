// Builds public/character/anims/Seated.glb: his pose sitting against the wall, as a single keyframe per bone.
// It's the first frame of Stand_Up (which he used to play backwards to sit down), so the whole clip needn't be
// downloaded just to hold its first frame. Run: node scripts/seated-pose.mjs

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const SRC = join(ROOT, "assets-src/character/anims/Stand_Up.glb");
const OUT = join(ROOT, "public/character/anims/Seated.glb");

const glb = readFileSync(SRC);
const jsonLength = glb.readUInt32LE(12);
const json = JSON.parse(glb.subarray(20, 20 + jsonLength).toString());
const bin = glb.subarray(20 + jsonLength + 8);

const SIZE = { SCALAR: 1, VEC3: 3, VEC4: 4 };
const keyValue = (index, key) => {
  const accessor = json.accessors[index];
  if (accessor.componentType !== 5126) throw new Error("expected float keyframes");
  const view = json.bufferViews[accessor.bufferView];
  const n = SIZE[accessor.type];
  const at = key < 0 ? accessor.count + key : key;
  const offset = (view.byteOffset ?? 0) + (accessor.byteOffset ?? 0) + at * n * 4;
  return Array.from({ length: n }, (_, k) => bin.readFloatLE(offset + k * 4));
};
const firstValue = (index) => keyValue(index, 0);

const clip = json.animations[0];
const floats = [0]; // the one keyframe time, shared by every sampler
const accessors = [{ bufferView: 0, byteOffset: 0, componentType: 5126, count: 1, type: "SCALAR", min: [0], max: [0] }];
// The hips' horizontal position is stored relative to the clip's last frame, which is where the backwards clip was
// anchored (over the hips' rest position): the page adds the rest position back (see `seatedPose`).
const hipsSampler = clip.channels.find((c) => c.target.path === "translation" && /Hips$/.test(json.nodes[c.target.node].name))?.sampler;
const samplers = clip.samplers.map((sampler, i) => {
  const value = firstValue(sampler.output);
  if (i === hipsSampler) {
    const last = keyValue(sampler.output, -1);
    value[0] -= last[0];
    value[2] -= last[2];
  }
  accessors.push({ bufferView: 0, byteOffset: floats.length * 4, componentType: 5126, count: 1, type: value.length === 4 ? "VEC4" : "VEC3" });
  floats.push(...value);
  return { input: 0, output: accessors.length - 1, interpolation: "LINEAR" };
});

const data = Buffer.alloc(floats.length * 4);
floats.forEach((f, i) => data.writeFloatLE(f, i * 4));
const out = {
  asset: json.asset,
  scene: json.scene,
  scenes: json.scenes,
  nodes: json.nodes,
  animations: [{ name: "Seated", channels: clip.channels, samplers }],
  accessors,
  bufferViews: [{ buffer: 0, byteOffset: 0, byteLength: data.length }],
  buffers: [{ byteLength: data.length }],
};

let text = Buffer.from(JSON.stringify(out));
text = Buffer.concat([text, Buffer.alloc((4 - (text.length % 4)) % 4, 0x20)]);
const chunk = (body, type) => {
  const head = Buffer.alloc(8);
  head.writeUInt32LE(body.length, 0);
  head.writeUInt32LE(type, 4);
  return Buffer.concat([head, body]);
};
const body = Buffer.concat([chunk(text, 0x4e4f534a), chunk(data, 0x004e4942)]);
const header = Buffer.alloc(12);
header.writeUInt32LE(0x46546c67, 0);
header.writeUInt32LE(2, 4);
header.writeUInt32LE(12 + body.length, 8);
writeFileSync(OUT, Buffer.concat([header, body]));
console.log(`${OUT}: ${12 + body.length} bytes, ${samplers.length} tracks`);
