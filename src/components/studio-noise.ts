// The studio's procedural surface textures, as raw RGBA: pure maths, so it runs in the studio worker (or, without
// workers, in the page).

// Tileable value-noise fBm: a lattice that wraps at every octave, so the texture repeats seamlessly.
function tileableNoise(size: number, baseCells: number, octaves: number, seed: number) {
  let s = seed;
  const rand = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const out = new Float32Array(size * size);
  let amp = 1;
  let total = 0;
  for (let o = 0, cells = baseCells; o < octaves; o++, cells *= 2, amp *= 0.5) {
    const lattice = Float32Array.from({ length: cells * cells }, rand);
    const at = (x: number, y: number) => lattice[(y % cells) * cells + (x % cells)];
    for (let y = 0; y < size; y++) {
      const fy = (y / size) * cells;
      const y0 = Math.floor(fy);
      const ty = fy - y0;
      const sy = ty * ty * (3 - 2 * ty);
      for (let x = 0; x < size; x++) {
        const fx = (x / size) * cells;
        const x0 = Math.floor(fx);
        const tx = fx - x0;
        const sx = tx * tx * (3 - 2 * tx);
        const top = at(x0, y0) + (at(x0 + 1, y0) - at(x0, y0)) * sx;
        const bottom = at(x0, y0 + 1) + (at(x0 + 1, y0 + 1) - at(x0, y0 + 1)) * sx;
        out[y * size + x] += (top + (bottom - top) * sy) * amp;
      }
    }
    total += amp;
  }
  for (let i = 0; i < out.length; i++) out[i] /= total;
  return out;
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export const NOISE_SIZE = 512;

// Hand-trowelled plaster: broad soft undulation plus fine grain, as a normal map (only shows under raking light).
export function plasterNormalData() {
  const size = NOISE_SIZE;
  const broad = tileableNoise(size, 6, 3, 11);
  const fine = tileableNoise(size, 64, 3, 29);
  const h = (x: number, y: number) => {
    const i = ((y + size) % size) * size + ((x + size) % size);
    return broad[i] * 1.2 + fine[i] * 0.2;
  };
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (h(x + 1, y) - h(x - 1, y)) * 6;
      const dy = (h(x, y + 1) - h(x, y - 1)) * 6;
      const len = Math.hypot(dx, dy, 1);
      const i = (y * size + x) * 4;
      data[i] = ((-dx / len) * 0.5 + 0.5) * 255;
      data[i + 1] = ((dy / len) * 0.5 + 0.5) * 255;
      data[i + 2] = ((1 / len) * 0.5 + 0.5) * 255;
      data[i + 3] = 255;
    }
  }
  return data;
}

// Seamless studio floor: faint cloudy tone variation (albedo) and patchy satin/matte roughness.
export function floorData() {
  const size = NOISE_SIZE;
  const clouds = tileableNoise(size, 4, 5, 7);
  const scuffs = tileableNoise(size, 24, 3, 53);
  const albedo = new Uint8Array(size * size * 4);
  const rough = new Uint8Array(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    const tone = 0.965 + (clouds[i] - 0.5) * 0.025;
    albedo[i * 4] = albedo[i * 4 + 1] = albedo[i * 4 + 2] = tone * 255;
    albedo[i * 4 + 3] = 255;
    // three reads roughness from the green channel.
    rough[i * 4 + 1] = clamp(0.62 + (scuffs[i] - 0.5) * 0.12 + (clouds[i] - 0.5) * 0.14, 0.45, 0.8) * 255;
    rough[i * 4 + 3] = 255;
  }
  return { albedo, rough };
}
