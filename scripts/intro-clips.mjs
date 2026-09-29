// Builds public/character/anims/Landing.glb: he drops in from above the frame, lands in a crouch, drops onto one knee,
// sits down and stretches his legs out, ending in exactly the pose Seated.glb holds. Run after grounding the sources,
// then ground the result: node scripts/intro-clips.mjs && node scripts/ground-clips.mjs public/character/anims/Landing.glb
//
// The dive is Dive_Down_and_Land_2 up to its landing crouch. The sit is Stand_Up played backwards, but only from its
// kneel (which the crouch blends into): before that it has him standing and shuffling his feet, which backwards reads
// as a moonwalk. And it's played at about its own speed, eased in and out, rather than sped up to fit.
//
// Like Seated.glb, the hips' horizontal position is stored relative to where the source clip has him standing
// (its last frame); the page adds the hips' rest position back.

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const SRC = join(ROOT, "assets-src/character/anims");
const OUT = join(ROOT, "public/character/anims/Landing.glb");
const FPS = 30;
const SIZE = { SCALAR: 1, VEC3: 3, VEC4: 4 };

// Seconds into the dive where it's settled in the landing crouch (it stands up after ~1.5 s).
const CROUCH = 1.4;
// Seconds into Stand_Up where he's up on one knee, a hand on the floor: the sit starts (backwards) from here.
const KNEEL = 2.6;
// How long the sit takes (about the source's own pace), and the blend from the crouch into the kneel at its start.
const SIT = 2.8;
const BLEND = 0.6;

function readClip(name) {
  const glb = readFileSync(join(SRC, `${name}.glb`));
  const jsonLength = glb.readUInt32LE(12);
  const json = JSON.parse(glb.subarray(20, 20 + jsonLength).toString());
  const bin = glb.subarray(20 + jsonLength + 8);
  const read = (index) => {
    const accessor = json.accessors[index];
    if (accessor.componentType !== 5126) throw new Error("expected float keyframes");
    const view = json.bufferViews[accessor.bufferView];
    const n = SIZE[accessor.type];
    const offset = (view.byteOffset ?? 0) + (accessor.byteOffset ?? 0);
    return Array.from({ length: accessor.count }, (_, k) => Array.from({ length: n }, (_, j) => bin.readFloatLE(offset + (k * n + j) * 4)));
  };
  const clip = json.animations[0];
  const channels = clip.channels.map((c) => {
    const sampler = clip.samplers[c.sampler];
    const times = read(sampler.input).map(([t]) => t);
    let values = read(sampler.output);
    if (c.target.path === "translation" && /Hips$/.test(json.nodes[c.target.node].name)) {
      const [lx, , lz] = values[values.length - 1];
      values = values.map(([x, y, z]) => [x - lx, y, z - lz]);
    }
    return { key: `${c.target.node}/${c.target.path}`, target: c.target, times, values };
  });
  return { json, channels, duration: Math.max(...channels.map((c) => c.times[c.times.length - 1])) };
}

const dot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0);
const normalize = (q) => {
  const l = Math.hypot(...q);
  return q.map((x) => x / l);
};
function slerp(a, b, t) {
  let d = dot(a, b);
  const bb = d < 0 ? b.map((x) => -x) : b;
  d = Math.abs(d);
  if (d > 0.9995) return normalize(a.map((x, i) => x + (bb[i] - x) * t));
  const th = Math.acos(d);
  const s = Math.sin(th);
  return a.map((x, i) => (Math.sin((1 - t) * th) * x + Math.sin(t * th) * bb[i]) / s);
}
// A channel's value at time t, interpolated like the player does (lerp, or slerp for rotations).
function sample(channel, t) {
  const { times, values, target } = channel;
  if (t <= times[0]) return values[0];
  if (t >= times[times.length - 1]) return values[values.length - 1];
  let i = 1;
  while (times[i] < t) i++;
  const u = (t - times[i - 1]) / (times[i] - times[i - 1]);
  const a = values[i - 1];
  const b = values[i];
  return target.path === "rotation" ? slerp(a, b, u) : a.map((x, k) => x + (b[k] - x) * u);
}
const smoothstep = (x) => x * x * (3 - 2 * x);

const dive = readClip("Dive_Down_and_Land_2");
const standUp = readClip("Stand_Up");
const standUpBy = new Map(standUp.channels.map((c) => [c.key, c]));
for (const c of dive.channels) if (!standUpBy.has(c.key)) throw new Error(`Stand_Up has no ${c.key}`);

const frames = Math.round(CROUCH * FPS) + Math.round(SIT * FPS) + 1;
const times = Array.from({ length: frames }, (_, i) => i / FPS);
const diveFrames = Math.round(CROUCH * FPS);
const tracks = dive.channels.map((c) => {
  const up = standUpBy.get(c.key);
  const rotation = c.target.path === "rotation";
  const crouch = sample(c, CROUCH);
  const hips = c.target.path === "translation" && /Hips$/.test(dive.json.nodes[c.target.node].name);
  const seatX = sample(up, 0)[0];
  const values = times.map((t, i) => {
    if (i <= diveFrames) return sample(c, t);
    const s = smoothstep((t - CROUCH) / SIT);
    const v = sample(up, KNEEL * (1 - s));
    // Sideways, the hips glide straight from the crouch to the seat. Backwards, the source swings them 60 cm over onto
    // the supporting hand and then, where it pushed off, snaps back 40 cm: a lurch to one side and a jerk back. (It
    // also skates that hand half a metre; a straight path leaves it far more still.)
    if (hips) v[0] = crouch[0] + (seatX - crouch[0]) * s;
    const w = smoothstep(Math.min((t - CROUCH) / BLEND, 1));
    return rotation ? slerp(crouch, v, w) : crouch.map((x, k) => x + (v[k] - x) * w);
  });
  return { target: c.target, values };
});

// ── write ──
const floats = [...times];
const accessors = [{ bufferView: 0, byteOffset: 0, componentType: 5126, count: frames, type: "SCALAR", min: [0], max: [times[frames - 1]] }];
const samplers = tracks.map(({ values }) => {
  accessors.push({ bufferView: 0, byteOffset: floats.length * 4, componentType: 5126, count: frames, type: values[0].length === 4 ? "VEC4" : "VEC3" });
  for (const v of values) floats.push(...v);
  return { input: 0, output: accessors.length - 1, interpolation: "LINEAR" };
});
const data = Buffer.alloc(floats.length * 4);
floats.forEach((f, i) => data.writeFloatLE(f, i * 4));
const { json } = dive;
const out = {
  asset: json.asset,
  scene: json.scene,
  scenes: json.scenes,
  // Just the skeleton: the mesh and skin come with the model.
  nodes: json.nodes.map((node) => {
    const rest = { ...node };
    delete rest.mesh;
    delete rest.skin;
    return rest;
  }),
  animations: [{ name: "Landing", channels: tracks.map((t, i) => ({ sampler: i, target: t.target })), samplers }],
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
console.log(`${OUT}: ${12 + body.length} bytes, ${tracks.length} tracks, ${times[frames - 1].toFixed(2)} s`);
