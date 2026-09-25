// The wall flag's cloth: Verlet particles joined by distance links, with gravity, a slow indoor draft and the
// wall to lean on. Pure maths on typed arrays, so it runs in the studio worker (or, without workers, in the page).

export type ClothSetup = {
  pos: Float32Array;
  pinned: Uint8Array;
  // Pairs of particle indices, in solve order.
  links: Int32Array;
  rest: Float32Array;
  // Each end's share of a link's correction (0 for a pinned end), times its stiffness.
  shareA: Float32Array;
  shareB: Float32Array;
  // Triangles, for the normals.
  index: Uint16Array | Uint32Array;
};

const STEP = 1 / 90;

export class ClothSolver {
  readonly pos: Float32Array;
  readonly normal: Float32Array;
  private readonly prev: Float32Array;
  private readonly count: number;
  private acc = 0;
  private time = 0;
  private motionSum = 0;

  constructor(private readonly s: ClothSetup) {
    this.pos = s.pos.slice();
    this.prev = s.pos.slice();
    this.count = s.pos.length / 3;
    this.normal = new Float32Array(s.pos.length);
    this.computeNormals();
  }

  /**
   * Advances by `dt` at a fixed 90 Hz (at most two steps a call: on a slow device the cloth runs a little slow
   * rather than falling behind), pulling particle `grabbed` (if any) toward `target`, then refreshes the normals.
   */
  step(dt: number, grabbed: number, target: ArrayLike<number>) {
    this.acc = Math.min(this.acc + dt, STEP * 2);
    while (this.acc >= STEP) {
      this.simulate(STEP, grabbed, target);
      this.acc -= STEP;
    }
    this.computeNormals();
  }

  /** Mean speed of the cloth in m/s (sampled), for the rustle sound. */
  get motion() {
    return this.motionSum;
  }

  private simulate(dt: number, grabbed: number, target: ArrayLike<number>) {
    this.time += dt;
    const { pos, prev } = this;
    const { pinned, links, rest, shareA, shareB } = this.s;
    const t = this.time;
    // Slow indoor draft: a gentle outward push that swells and fades, varying across the cloth.
    const swell = 0.3 + 0.2 * Math.sin(t * 0.7) + 0.12 * Math.sin(t * 1.9 + 1.3);
    const damping = 0.985;
    const dt2 = dt * dt;
    for (let i = 0; i < this.count; i++) {
      if (pinned[i]) continue;
      const k = i * 3;
      const x = pos[k];
      const y = pos[k + 1];
      const z = pos[k + 2];
      const wind = swell * (0.6 + 0.4 * Math.sin(x * 5 + t * 1.3) * Math.sin(y * 4 - t * 0.9));
      const vx = (x - prev[k]) * damping;
      const vy = (y - prev[k + 1]) * damping;
      const vz = (z - prev[k + 2]) * damping;
      prev[k] = x;
      prev[k + 1] = y;
      prev[k + 2] = z;
      pos[k] = x + vx + 0.08 * Math.sin(t * 0.5 + y * 3) * dt2;
      pos[k + 1] = y + vy - 9.8 * dt2;
      pos[k + 2] = z + vz + wind * dt2;
    }

    if (grabbed >= 0) {
      const k = grabbed * 3;
      pos[k] += (target[0] - pos[k]) * 0.6;
      pos[k + 1] += (target[1] - pos[k + 1]) * 0.6;
      pos[k + 2] += (target[2] - pos[k + 2]) * 0.6;
    }

    const n = rest.length;
    for (let iter = 0; iter < 16; iter++) {
      for (let l = 0; l < n; l++) {
        const ka = links[2 * l] * 3;
        const kb = links[2 * l + 1] * 3;
        const dx = pos[kb] - pos[ka];
        const dy = pos[kb + 1] - pos[ka + 1];
        const dz = pos[kb + 2] - pos[ka + 2];
        const len = Math.sqrt(dx * dx + dy * dy + dz * dz) + 1e-9;
        const diff = (len - rest[l]) / len;
        const ca = diff * shareA[l];
        const cb = diff * shareB[l];
        pos[ka] += dx * ca;
        pos[ka + 1] += dy * ca;
        pos[ka + 2] += dz * ca;
        pos[kb] -= dx * cb;
        pos[kb + 1] -= dy * cb;
        pos[kb + 2] -= dz * cb;
      }
      // Keep the cloth in front of the wall.
      for (let k = 2; k < pos.length; k += 3) if (pos[k] < 0.006) pos[k] = 0.006;
    }

    let sum = 0;
    let samples = 0;
    for (let i = 0; i < this.count; i += 7, samples++) {
      const k = i * 3;
      sum += Math.hypot(pos[k] - prev[k], pos[k + 1] - prev[k + 1], pos[k + 2] - prev[k + 2]);
    }
    this.motionSum = (sum / Math.max(samples, 1)) / dt;
  }

  // Area-weighted vertex normals, as three's computeVertexNormals.
  private computeNormals() {
    const { pos, normal } = this;
    const index = this.s.index;
    normal.fill(0);
    for (let f = 0; f < index.length; f += 3) {
      const a = index[f] * 3;
      const b = index[f + 1] * 3;
      const c = index[f + 2] * 3;
      const e1x = pos[c] - pos[b];
      const e1y = pos[c + 1] - pos[b + 1];
      const e1z = pos[c + 2] - pos[b + 2];
      const e2x = pos[a] - pos[b];
      const e2y = pos[a + 1] - pos[b + 1];
      const e2z = pos[a + 2] - pos[b + 2];
      const nx = e1y * e2z - e1z * e2y;
      const ny = e1z * e2x - e1x * e2z;
      const nz = e1x * e2y - e1y * e2x;
      normal[a] += nx;
      normal[a + 1] += ny;
      normal[a + 2] += nz;
      normal[b] += nx;
      normal[b + 1] += ny;
      normal[b + 2] += nz;
      normal[c] += nx;
      normal[c + 1] += ny;
      normal[c + 2] += nz;
    }
    for (let k = 0; k < normal.length; k += 3) {
      const l = Math.hypot(normal[k], normal[k + 1], normal[k + 2]) || 1;
      normal[k] /= l;
      normal[k + 1] /= l;
      normal[k + 2] /= l;
    }
  }
}
