import * as THREE from "three";

// Two looks for the studio. Light: soft morning sun raking through a window with a tree outside, long leafy
// shadows across the floor and up the wall. Dark: ten at night, cool moonlight, the paper lantern, the picture
// light and a sunset projection lamp glowing on the wall. `lightingAt(t)` blends them (0 light, 1 dark) so a
// switch fades rather than cuts.

export type Mode = "light" | "dark";

export type Daylight = {
  key: THREE.Color;
  keyIntensity: number;
  // Where the sun (or moon) sits outside the window: height and how far to the side (lower = longer shadows).
  keyY: number;
  keyX: number;
  sky: THREE.Color;
  ground: THREE.Color;
  hemi: number;
  rim: THREE.Color;
  rimIntensity: number;
  env: number;
  exposure: number;
  // Practical lamps (lantern, picture light, sunset lamp): 0 off, 1 fully on.
  lamps: number;
};

type Preset = { key: number; keyIntensity: number; keyY: number; keyX: number; sky: number; ground: number; hemi: number; rim: number; rimIntensity: number; env: number; exposure: number; lamps: number };

const PRESETS: Record<Mode, Preset> = {
  // A mid-morning sun, warm but not golden, low enough that the window patch and leaves stretch up the wall;
  // the sky fill a touch lower than midday so the shadows keep some depth.
  light: {
    key: 0xffe4c4,
    keyIntensity: 3.1,
    keyY: 4.2,
    keyX: 5.6,
    sky: 0xf6f1e9,
    ground: 0xdcd3c6,
    hemi: 0.56,
    rim: 0xd6e0ff,
    rimIntensity: 0.5,
    env: 0.3,
    exposure: 0.97,
    lamps: 0,
  },
  // 10 pm: faint cool moonlight through the window, the room lit by its lamps.
  dark: {
    key: 0xb6c0de,
    keyIntensity: 0.42,
    keyY: 7.4,
    keyX: 3.5,
    sky: 0x31353f,
    ground: 0x241f1b,
    hemi: 0.07,
    rim: 0x8c9fff,
    rimIntensity: 0.16,
    env: 0.025,
    exposure: 0.95,
    lamps: 1,
  },
};

const lerpColor = (a: number, b: number, t: number) =>
  new THREE.Color(a).convertSRGBToLinear().lerp(new THREE.Color(b).convertSRGBToLinear(), t).convertLinearToSRGB();

/** The studio's light `t` of the way from light (0) to dark (1). */
export function lightingAt(t: number): Daylight {
  const a = PRESETS.light;
  const b = PRESETS.dark;
  const n = (k: keyof Preset) => THREE.MathUtils.lerp(a[k], b[k], t);
  return {
    key: lerpColor(a.key, b.key, t),
    keyIntensity: n("keyIntensity"),
    keyY: n("keyY"),
    keyX: n("keyX"),
    sky: lerpColor(a.sky, b.sky, t),
    ground: lerpColor(a.ground, b.ground, t),
    hemi: n("hemi"),
    rim: lerpColor(a.rim, b.rim, t),
    rimIntensity: n("rimIntensity"),
    env: n("env"),
    exposure: n("exposure"),
    lamps: n("lamps"),
  };
}

// ── practical lamps ─────────────────────────────────────────────────────────────────────────────────────────

// Washi lantern paper: warm, faintly mottled, with long fibres, and the bamboo rib showing through as one
// continuous spiral (the texture wraps once around the shade, so each line drops a pitch per turn). `ribs` is the
// rib alone, for a bump map so it stands a little proud of the paper.
const LANTERN_PITCH = 23;
function paperTextures() {
  const w = 256;
  const h = 512;
  let seed = 3;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const paper = document.createElement("canvas");
  paper.width = w;
  paper.height = h;
  const g = paper.getContext("2d")!;
  g.fillStyle = "#fff";
  g.fillRect(0, 0, w, h);
  // Mottling: soft patches where the paper is a little thicker.
  for (let i = 0; i < 90; i++) {
    const x = rand() * w;
    const y = rand() * h;
    const r = 6 + rand() * 22;
    const grad = g.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, `rgba(120,100,70,${0.025 + rand() * 0.03})`);
    grad.addColorStop(1, "rgba(120,100,70,0)");
    g.fillStyle = grad;
    for (const dx of [-w, 0, w]) {
      g.save();
      g.translate(dx, 0);
      g.fillRect(x - r, y - r, r * 2, r * 2);
      g.restore();
    }
  }
  // Fibres: fine, long and mostly vertical.
  g.lineWidth = 0.6;
  for (let i = 0; i < 260; i++) {
    const x = rand() * w;
    const y = rand() * h;
    const len = 8 + rand() * 30;
    const a = Math.PI / 2 + (rand() - 0.5) * 1.2;
    g.strokeStyle = `rgba(110,90,60,${0.05 + rand() * 0.08})`;
    g.beginPath();
    g.moveTo(x, y);
    g.quadraticCurveTo(x + Math.cos(a) * len * 0.5 + (rand() - 0.5) * 4, y + Math.sin(a) * len * 0.5, x + Math.cos(a) * len, y + Math.sin(a) * len);
    g.stroke();
  }
  const ribs = document.createElement("canvas");
  ribs.width = w;
  ribs.height = h;
  const rg = ribs.getContext("2d")!;
  rg.fillStyle = "#000";
  rg.fillRect(0, 0, w, h);
  const spiral = (ctx: CanvasRenderingContext2D, style: string, width: number) => {
    ctx.strokeStyle = style;
    ctx.lineWidth = width;
    for (let y = -LANTERN_PITCH; y < h + LANTERN_PITCH; y += LANTERN_PITCH) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y + LANTERN_PITCH);
      ctx.stroke();
    }
  };
  spiral(g, "rgba(70,55,35,0.2)", 2.2);
  rg.filter = "blur(1px)";
  spiral(rg, "#fff", 2.6);
  const tex = (c: HTMLCanvasElement, colour: boolean) => {
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = colour ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    t.wrapS = THREE.RepeatWrapping;
    t.anisotropy = 8;
    return t;
  };
  return { paper: tex(paper, true), ribs: tex(ribs, false) };
}

/** A tall floor-standing paper lantern (Akari-style) with a warm bulb inside. */
export class Lantern {
  group = new THREE.Group();
  light: THREE.PointLight;
  private shade: THREE.MeshStandardMaterial;

  constructor() {
    const height = 1.0;
    const radius = 0.19;
    // A softly barrelled cylinder.
    const profile: THREE.Vector2[] = [];
    for (let i = 0; i <= 24; i++) {
      const t = i / 24;
      profile.push(new THREE.Vector2(radius * (0.86 + 0.14 * Math.sin(Math.PI * t)), t * height));
    }
    const { paper, ribs } = paperTextures();
    this.shade = new THREE.MeshStandardMaterial({
      color: 0xf6f1e6,
      map: paper,
      bumpMap: ribs,
      bumpScale: 0.3,
      roughness: 0.9,
      emissive: 0xffb765,
      emissiveMap: paper,
      emissiveIntensity: 0,
      side: THREE.DoubleSide,
    });
    const shade = new THREE.Mesh(new THREE.LatheGeometry(profile, 48), this.shade);
    shade.position.y = 0.2;
    shade.castShadow = true;
    shade.receiveShadow = true;
    this.group.add(shade);

    // Three thin black legs and a slim ring under the shade.
    const metal = new THREE.MeshStandardMaterial({ color: 0x1b1b1c, roughness: 0.55, metalness: 0.4 });
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * Math.PI * 2 + 0.4;
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.24, 8), metal);
      leg.position.set(Math.cos(a) * radius * 0.7, 0.12, Math.sin(a) * radius * 0.7);
      leg.castShadow = true;
      this.group.add(leg);
    }
    const ring = new THREE.Mesh(new THREE.TorusGeometry(radius * 0.86, 0.005, 6, 48), metal);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.2;
    this.group.add(ring);

    this.light = new THREE.PointLight(0xffb56b, 0, 0, 2);
    this.light.position.y = 0.2 + height * 0.55;
    this.group.add(this.light);
  }

  setGlow(v: number) {
    this.shade.emissiveIntensity = 1.9 * v;
    this.light.intensity = 4 * v;
  }
}

/** A slim brass picture light over the painting, washing it from above. */
export class PictureLight {
  group = new THREE.Group();
  spot: THREE.SpotLight;
  private bulb: THREE.MeshStandardMaterial;

  constructor(width: number, aimAt: THREE.Object3D) {
    const brass = new THREE.MeshStandardMaterial({ color: 0xb08a4e, roughness: 0.35, metalness: 0.9 });
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, width, 20), brass);
    bar.rotation.z = Math.PI / 2;
    bar.position.set(0, 0, 0.13);
    bar.castShadow = true;
    this.group.add(bar);
    this.bulb = new THREE.MeshStandardMaterial({ color: 0x3a3226, emissive: 0xffd49a, emissiveIntensity: 0 });
    const lens = new THREE.Mesh(new THREE.BoxGeometry(width * 0.92, 0.004, 0.018), this.bulb);
    lens.position.set(0, -0.018, 0.13);
    this.group.add(lens);
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.13, 10), brass);
    arm.rotation.x = Math.PI / 2;
    arm.position.set(0, 0.03, 0.065);
    arm.castShadow = true;
    this.group.add(arm);
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.008, 20), brass);
    plate.rotation.x = Math.PI / 2;
    plate.position.set(0, 0.03, 0.004);
    this.group.add(plate);

    this.spot = new THREE.SpotLight(0xffcf94, 0, 0, 0.75, 0.9, 2);
    this.spot.position.set(0, -0.02, 0.13);
    this.spot.target = aimAt;
    this.group.add(this.spot);
  }

  setGlow(v: number) {
    this.bulb.emissiveIntensity = 2.5 * v;
    this.spot.intensity = 2.2 * v;
  }
}

// A sunset projection lamp's glow on the wall at night (the lamp itself is out of shot): a big soft disc in one
// of a few gradients, centre to rim, clicked through by the visitor.
export const GLOWS = {
  // The classic: deep red-orange in the middle, warming out to a bright golden rim.
  sunset: ["#ff4a24", "#ff6a2a", "#ff9a3a", "#ffc24e", "#ffd66a"],
  // Golden halo: sunny yellow centre through orange to a pink rim.
  halo: ["#ffe08a", "#ffc05a", "#ff9442", "#ff6a5a", "#ff5c86"],
  // Rainbow: ice-blue centre, through blue and violet, to a hot pink rim.
  rainbow: ["#9ff3ff", "#5ecbff", "#5a74ff", "#b84cff", "#ff4f9a"],
} as const;
export type Glow = keyof typeof GLOWS;

function glowTexture(stops: readonly string[], size = 256) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  g.fillStyle = "#000";
  g.fillRect(0, 0, size, size);
  const r = size / 2;
  const grad = g.createRadialGradient(r, r, 0, r, r, r * 0.9);
  stops.forEach((colour, i) => grad.addColorStop((i / (stops.length - 1)) * 0.78, colour));
  // The rim blooms out softly rather than stopping dead.
  grad.addColorStop(0.88, "rgba(0,0,0,0.45)");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export class SunsetGlow {
  spot: THREE.SpotLight;
  glow: Glow;
  private textures = Object.fromEntries(Object.entries(GLOWS).map(([k, stops]) => [k, glowTexture(stops)])) as Record<Glow, THREE.CanvasTexture>;

  /**
   * `from`: where the (unseen) lamp sits; `aim`: the disc's centre on the wall; `radius`: the disc's size there.
   * The light is a real spot, so the room picks up the colour and anyone in front casts a shadow into it.
   */
  constructor(from: THREE.Vector3, aim: THREE.Object3D, radius: number, glow: Glow) {
    this.glow = glow;
    const distance = from.distanceTo(aim.position);
    // The map fills the cone's square; the disc is drawn out to 90% of it.
    const angle = Math.atan(radius / (0.9 * distance));
    this.spot = new THREE.SpotLight(0xffffff, 0, 0, angle, 0.12, 0);
    this.spot.position.copy(from);
    this.spot.map = this.textures[glow];
    // A projected map only works through the shadow machinery.
    this.spot.castShadow = true;
    this.spot.shadow.mapSize.setScalar(1024);
    this.spot.shadow.bias = -0.0004;
    this.spot.shadow.camera.near = 0.5;
    this.spot.shadow.camera.far = distance + 2;
    this.spot.target = aim;
  }

  /** Switch to the next gradient; returns its name. */
  next() {
    const names = Object.keys(GLOWS) as Glow[];
    this.glow = names[(names.indexOf(this.glow) + 1) % names.length];
    this.spot.map = this.textures[this.glow];
    return this.glow;
  }

  setGlow(v: number) {
    this.spot.intensity = 3.2 * v;
  }

  dispose() {
    for (const t of Object.values(this.textures)) t.dispose();
  }
}
