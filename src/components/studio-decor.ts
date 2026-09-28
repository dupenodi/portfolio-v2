import * as THREE from "three";
import { ClothSolver, type ClothSetup } from "./cloth-solver";
import { bitmapTexture } from "./studio-scene";
import { addCloth, post, removeCloth, studioWorker, type ClothFrame } from "./studio-worker";

// Wall decor for the studio: a printed polyester wall flag (the painting is a GLB, see character-stage).
// Built in local space where the wall surface is the z = 0 plane and +z points into the room.

// ---------------------------------------------------------------------------------------------
// Wall flag
// ---------------------------------------------------------------------------------------------

type Rand = () => number;
const seeded = (seed: number): Rand => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

// The flag's print: the artwork dye-sublimated onto polyester. The polyester-white tint and knit grain are
// baked into the image offline, so it just loads (and decodes off the main thread).
function flagPrint(url: string) {
  const tex = new THREE.Texture();
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 16;
  const loaded = bitmapTexture(url, true, tex).then(
    () => {},
    () => {},
  );
  return { tex, loaded };
}

// Plain-weave normal map: over/under threads in both directions, tiled across the cloth.
function weaveNormalMap() {
  const n = 256;
  const threads = 16;
  const height = new Float32Array(n * n);
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const u = (x / n) * threads;
      const v = (y / n) * threads;
      const cu = Math.floor(u);
      const cv = Math.floor(v);
      const fu = u - cu;
      const fv = v - cv;
      const warp = Math.sin(fu * Math.PI); // thread running along y
      const weft = Math.sin(fv * Math.PI); // thread running along x
      const over = (cu + cv) % 2 === 0;
      height[y * n + x] = over ? Math.max(warp * 1.0, weft * 0.6) : Math.max(weft * 1.0, warp * 0.6);
    }
  }
  const data = new Uint8Array(n * n * 4);
  const strength = 2.2;
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const hL = height[y * n + ((x - 1 + n) % n)];
      const hR = height[y * n + ((x + 1) % n)];
      const hD = height[((y - 1 + n) % n) * n + x];
      const hU = height[((y + 1) % n) * n + x];
      const nx = (hL - hR) * strength;
      const ny = (hD - hU) * strength;
      const len = Math.hypot(nx, ny, 1);
      const i = (y * n + x) * 4;
      data[i] = ((nx / len) * 0.5 + 0.5) * 255;
      data[i + 1] = ((ny / len) * 0.5 + 0.5) * 255;
      data[i + 2] = ((1 / len) * 0.5 + 0.5) * 255;
      data[i + 3] = 255;
    }
  }
  const tex = new THREE.DataTexture(data, n, n, THREE.RGBAFormat);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  return tex;
}

// `print` is the artwork image, stretched across the whole flag (so match its aspect ratio).
type FlagOptions = { print: string; width: number; height: number; cols: number; rows: number; standoff: number };

// How far apart the grommets hang, relative to the flag's width; under 1 lets the top edge sag
// and pulls diagonal tension folds out of the corners.
const SPREAD = 0.985;
// How far a pulled point may get from each hanging corner, as a multiple of its distance across the flat fabric.
// A little give (polyester stretches a few percent), no more: past this the pointer drags on, the cloth stays put.
const MAX_STRETCH = 1.08;

// Verlet cloth flag hung by its two top-corner grommets on wires: gravity, a slow indoor draft,
// wall collision, and a grab handle so the pointer can pull it around.
export class ClothFlag {
  /** Resolves once the print has loaded, so the first frame can include it (no upload hitch later). */
  ready: Promise<void> = Promise.resolve();
  readonly group = new THREE.Group();
  readonly mesh: THREE.Mesh;
  private readonly geometry: THREE.BufferGeometry;
  // The cloth's current shape: the geometry's own position array, refreshed from the solver each frame.
  private readonly pos: Float32Array;
  private readonly pinned: Uint8Array;
  private readonly count: number;
  private readonly standoff: number;
  // Simulated in the studio worker: one step request in flight at a time, the frame time in between saved up.
  private readonly setup: ClothSetup;
  private readonly clothId: number | null;
  private inFlight = false;
  private owedDt = 0;
  // In the page instead, where there are no workers (or it failed).
  private local: ClothSolver | null = null;
  private speed = 0;
  private grabbed = -1;
  private readonly grabTarget = new THREE.Vector3();
  private readonly grabPlane = new THREE.Plane();
  private readonly disposables: { dispose(): void }[] = [];
  // Grommets in the free bottom corners ride on the cloth: [grommet, corner vertex, diagonal neighbour, blend].
  private readonly looseGrommets: [THREE.Mesh, number, number, number][] = [];
  // Each particle's spot on the flat flag, and the corners it hangs from, for limiting how far a pull can reach.
  private readonly flat: Float32Array;
  private readonly corners: number[];

  constructor({ print: printUrl, width, height, cols, rows, standoff }: FlagOptions) {
    this.standoff = standoff;
    this.count = cols * rows;
    this.pos = new Float32Array(this.count * 3);
    this.pinned = new Uint8Array(this.count);
    const idx = (c: number, r: number) => r * cols + c;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i = idx(c, r) * 3;
        this.pos[i] = (c / (cols - 1) - 0.5) * width;
        this.pos[i + 1] = -(r / (rows - 1)) * height;
        this.pos[i + 2] = standoff;
      }
    }

    this.flat = this.pos.slice();

    // Structural, shear and bend links; bend links are soft so the cloth folds rather than bending like card.
    const links: number[] = [];
    const stiff: number[] = [];
    const add = (a: number, b: number, k: number) => {
      links.push(a, b);
      stiff.push(k);
    };
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (c + 1 < cols) add(idx(c, r), idx(c + 1, r), 1);
        if (r + 1 < rows) add(idx(c, r), idx(c, r + 1), 1);
        if (c + 1 < cols && r + 1 < rows) {
          add(idx(c, r), idx(c + 1, r + 1), 0.6);
          add(idx(c + 1, r), idx(c, r + 1), 0.6);
        }
        if (c + 2 < cols) add(idx(c, r), idx(c + 2, r), 0.2);
        if (r + 2 < rows) add(idx(c, r), idx(c, r + 2), 0.2);
      }
    }
    // The top is a sewn hem: stiff along its length so it only sags a little between the grommets.
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c + 3 < cols; c++) add(idx(c, r), idx(c + 3, r), 1);
    }
    // Solve order: in the order built, each link reads the vertex the previous one just wrote, a serial chain the
    // CPU can't overlap (4x slower). Group them into batches where no two links share a vertex (greedy colouring).
    const n = stiff.length;
    const colour = new Int32Array(n);
    const taken: number[][] = Array.from({ length: this.count }, () => []);
    for (let k = 0; k < n; k++) {
      const a = taken[links[2 * k]];
      const b = taken[links[2 * k + 1]];
      let c = 0;
      while (a.includes(c) || b.includes(c)) c++;
      colour[k] = c;
      a.push(c);
      b.push(c);
    }
    const order = Array.from({ length: n }, (_, k) => k).sort((x, y) => colour[x] - colour[y] || x - y);
    // Hung by the two top corners.
    const corners = [idx(0, 0), idx(cols - 1, 0)];
    this.corners = corners;
    for (const i of corners) this.pinned[i] = 1;
    const setupLinks = new Int32Array(n * 2);
    const rest = new Float32Array(n);
    const shareA = new Float32Array(n);
    const shareB = new Float32Array(n);
    order.forEach((k, i) => {
      const a = links[2 * k];
      const b = links[2 * k + 1];
      setupLinks[2 * i] = a;
      setupLinks[2 * i + 1] = b;
      rest[i] = Math.hypot(this.pos[b * 3] - this.pos[a * 3], this.pos[b * 3 + 1] - this.pos[a * 3 + 1], this.pos[b * 3 + 2] - this.pos[a * 3 + 2]);
      // Each end's share of the correction (0 for a pinned end), times the link's stiffness.
      const wa = this.pinned[a] ? 0 : 1;
      const wb = this.pinned[b] ? 0 : 1;
      const w = wa + wb || 1;
      shareA[i] = (wa / w) * stiff[k];
      shareB[i] = (wb / w) * stiff[k];
    });

    // Rest lengths are the flat flag; now hang it from grommets a little closer together than its width.
    // Tiny random depth decides which way the folds buckle.
    const rand = seeded(5);
    for (let i = 0; i < this.count; i++) {
      this.pos[i * 3] *= SPREAD;
      this.pos[i * 3 + 2] = standoff + rand() * 0.01;
    }
    for (const i of corners) this.pos[i * 3 + 2] = standoff;

    const geometry = new THREE.PlaneGeometry(width, height, cols - 1, rows - 1);
    geometry.setAttribute("position", new THREE.BufferAttribute(this.pos, 3));
    geometry.computeVertexNormals();
    this.geometry = geometry;
    this.setup = {
      pos: this.pos.slice(),
      pinned: this.pinned,
      links: setupLinks,
      rest,
      shareA,
      shareB,
      index: geometry.index!.array as Uint16Array,
      anchors: new Int32Array(corners),
      tether: this.tetherLengths(),
    };
    this.clothId = studioWorker() ? addCloth(this.setup, (frame) => this.apply(frame)) : null;

    const { tex: print, loaded } = flagPrint(printUrl);
    this.ready = loaded;
    const normalMap = weaveNormalMap();
    normalMap.repeat.set(width * 160, height * 160);
    this.disposables.push(print, normalMap);
    const material = new THREE.MeshPhysicalMaterial({
      map: print,
      normalMap,
      normalScale: new THREE.Vector2(0.25, 0.25),
      roughness: 0.62,
      sheen: 0.6,
      sheenRoughness: 0.4,
      sheenColor: new THREE.Color(0xffffff),
      side: THREE.DoubleSide,
    });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.mesh.frustumCulled = false;
    this.group.add(this.mesh);

    // Grommets at the corners, and steel wires running up and out to the ceiling.
    const steel = new THREE.MeshStandardMaterial({ color: 0xc9ccd1, roughness: 0.3, metalness: 1 });
    for (const i of corners) {
      const x = this.pos[i * 3];
      const grommet = new THREE.Mesh(new THREE.TorusGeometry(0.012, 0.004, 12, 32), steel);
      grommet.position.set(x + Math.sign(x) * -0.025, -0.025, standoff + 0.001);
      grommet.castShadow = true;
      this.group.add(grommet);
      const from = new THREE.Vector3(x, 0, standoff);
      const to = new THREE.Vector3(x + Math.sign(x) * 0.9, 3, standoff);
      const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.0018, 0.0018, from.distanceTo(to), 8), steel);
      wire.position.copy(from).add(to).multiplyScalar(0.5);
      wire.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), to.clone().sub(from).normalize());
      wire.castShadow = true;
      this.group.add(wire);
    }
    // Bottom corners have grommets too (unused, as on the real flag); placed a grommet-inset in from the corner.
    const inset = 0.025 / (width / (cols - 1));
    for (const [corner, inner] of [
      [idx(0, rows - 1), idx(1, rows - 2)],
      [idx(cols - 1, rows - 1), idx(cols - 2, rows - 2)],
    ]) {
      const grommet = new THREE.Mesh(new THREE.TorusGeometry(0.012, 0.004, 12, 32), steel);
      grommet.castShadow = true;
      this.group.add(grommet);
      this.looseGrommets.push([grommet, corner, inner, inset]);
    }
    this.placeLooseGrommets();
  }

  private placeLooseGrommets() {
    const p = this.pos;
    for (const [grommet, a, b, t] of this.looseGrommets) {
      grommet.position.set(
        p[a * 3] + (p[b * 3] - p[a * 3]) * t,
        p[a * 3 + 1] + (p[b * 3 + 1] - p[a * 3 + 1]) * t,
        p[a * 3 + 2] + (p[b * 3 + 2] - p[a * 3 + 2]) * t + 0.001,
      );
    }
  }

  // Start a grab if the ray hits the cloth; returns whether it did.
  grab(ray: THREE.Raycaster) {
    // Bounds aren't kept up to date every frame (nothing else needs them); refit before testing.
    this.geometry.computeBoundingSphere();
    const hit = ray.intersectObject(this.mesh, false)[0];
    if (!hit) return false;
    const local = this.group.worldToLocal(hit.point.clone());
    let best = -1;
    let bestD = Infinity;
    for (let i = 0; i < this.count; i++) {
      if (this.pinned[i]) continue;
      const d = (this.pos[i * 3] - local.x) ** 2 + (this.pos[i * 3 + 1] - local.y) ** 2 + (this.pos[i * 3 + 2] - local.z) ** 2;
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    if (best < 0) return false;
    this.grabbed = best;
    this.grabTarget.copy(local);
    // Drag in a plane parallel to the wall through the grabbed point.
    this.grabPlane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 0, 1), local);
    return true;
  }

  drag(ray: THREE.Raycaster) {
    if (this.grabbed < 0) return;
    const localRay = ray.ray.clone().applyMatrix4(this.group.matrixWorld.clone().invert());
    const p = localRay.intersectPlane(this.grabPlane, new THREE.Vector3());
    if (p) {
      // Pull a little off the wall too, so it lifts like fabric being picked up.
      p.z = Math.max(p.z, this.standoff + 0.08);
      this.limitReach(p);
      this.grabTarget.copy(p);
    }
  }

  // For every particle, the farthest it may get from each hanging corner: its distance across the flat fabric, plus
  // the same small give a pull is allowed.
  private tetherLengths() {
    const out = new Float32Array(this.count * this.corners.length);
    for (let i = 0; i < this.count; i++) {
      this.corners.forEach((c, j) => {
        out[i * this.corners.length + j] =
          Math.hypot(this.flat[i * 3] - this.flat[c * 3], this.flat[i * 3 + 1] - this.flat[c * 3 + 1]) * MAX_STRETCH;
      });
    }
    return out;
  }

  // Keep a pull within what the fabric can reach from both hanging corners (a few rounds settles both limits).
  private limitReach(p: THREE.Vector3) {
    const g = this.grabbed * 3;
    for (let round = 0; round < 4; round++) {
      for (const c of this.corners) {
        const k = c * 3;
        const reach = Math.hypot(this.flat[g] - this.flat[k], this.flat[g + 1] - this.flat[k + 1]) * MAX_STRETCH;
        const dx = p.x - this.pos[k];
        const dy = p.y - this.pos[k + 1];
        const dz = p.z - this.pos[k + 2];
        const d = Math.hypot(dx, dy, dz);
        if (d > reach) p.set(this.pos[k] + (dx * reach) / d, this.pos[k + 1] + (dy * reach) / d, this.pos[k + 2] + (dz * reach) / d);
      }
      // Never through the wall behind it.
      p.z = Math.max(p.z, 0.02);
    }
  }

  release() {
    this.grabbed = -1;
  }

  get dragging() {
    return this.grabbed >= 0;
  }

  /** Mean speed of the cloth in m/s (sampled), for the rustle sound. */
  get motion() {
    return this.speed;
  }

  update(dt: number) {
    const target: [number, number, number] = [this.grabTarget.x, this.grabTarget.y, this.grabTarget.z];
    if (this.clothId !== null && studioWorker()) {
      this.owedDt += dt;
      if (this.inFlight) return;
      this.inFlight = true;
      post({ type: "cloth-step", id: this.clothId, dt: this.owedDt, grabbed: this.grabbed, target });
      this.owedDt = 0;
      return;
    }
    // Carries on from wherever the worker left it.
    this.local ??= new ClothSolver({ ...this.setup, pos: this.pos });
    this.local.step(dt, this.grabbed, target);
    this.apply({ pos: this.local.pos, normal: this.local.normal, motion: this.local.motion });
  }

  private apply({ pos, normal, motion }: ClothFrame) {
    this.inFlight = false;
    this.pos.set(pos);
    this.geometry.getAttribute("position").needsUpdate = true;
    const normals = this.geometry.getAttribute("normal") as THREE.BufferAttribute;
    (normals.array as Float32Array).set(normal);
    normals.needsUpdate = true;
    this.speed = motion;
    this.placeLooseGrommets();
  }

  dispose() {
    if (this.clothId !== null) removeCloth(this.clothId);
    for (const d of this.disposables) d.dispose();
  }
}
