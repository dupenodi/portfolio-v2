import * as THREE from "three";
import type { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

// The rest of the room: his sofa and a plant (the plant from Poly Haven, CC0), packed as meshopt GLBs with
// webp textures. Plus the spring that makes things wobble when knocked.

const PROPS = "/character/decor/props";

/** A damped spring toward `rest`, for things that swing or rock when knocked. */
export class Spring {
  value = 0;
  vel = 0;
  rest = 0;
  constructor(
    private stiffness: number,
    private damping: number,
  ) {}
  kick(v: number) {
    this.vel += v;
  }
  update(dt: number) {
    this.vel += (-this.stiffness * (this.value - this.rest) - this.damping * this.vel) * dt;
    this.value += this.vel * dt;
  }
  get moving() {
    return Math.abs(this.value - this.rest) > 1e-4 || Math.abs(this.vel) > 1e-3;
  }
}

// Decodes an image to raw RGBA off the main thread. An ImageBitmap can't be uploaded in parts cheaply (every
// partial upload pays for the whole image), raw pixels can.
const PIXELS_WORKER = `onmessage = ({ data: bitmap }) => {
  const { width, height } = bitmap;
  const g = new OffscreenCanvas(width, height).getContext("2d", { willReadFrequently: true });
  g.drawImage(bitmap, 0, 0);
  bitmap.close();
  const pixels = g.getImageData(0, 0, width, height).data;
  postMessage(pixels, [pixels.buffer]);
};`;

// Rows uploaded per frame: ~1 MB of a 4K texture (about two seconds for the lot, in the background).
const STRIP = 64;

/**
 * Swaps each (ImageBitmap) texture in `root`'s materials for an empty one of the same kind and returns, per
 * texture, a step function that uploads its next strip of rows (and the mipmaps with the last) and returns true
 * when done. Where workers or OffscreenCanvas aren't available, each texture uploads whole in a single step.
 */
async function stripUploads(root: THREE.Object3D) {
  const textures = new Map<THREE.Texture, THREE.Material[]>();
  root.traverse((o) => {
    if (!(o instanceof THREE.Mesh)) return;
    for (const t of Object.values(o.material as THREE.Material)) {
      if (t instanceof THREE.Texture) textures.set(t, [...(textures.get(t) ?? []), o.material]);
    }
  });
  if (typeof Worker === "undefined" || typeof OffscreenCanvas === "undefined") {
    return [...textures.keys()].map((t) => (renderer: THREE.WebGLRenderer) => (renderer.initTexture(t), true));
  }
  const url = URL.createObjectURL(new Blob([PIXELS_WORKER], { type: "text/javascript" }));
  const decode = (bitmap: ImageBitmap) =>
    new Promise<Uint8ClampedArray>((resolve, reject) => {
      const worker = new Worker(url);
      worker.onmessage = ({ data }) => (worker.terminate(), resolve(data));
      worker.onerror = (e) => (worker.terminate(), reject(e));
      worker.postMessage(bitmap, [bitmap]);
    });
  // One at a time: each is a 64 MB decode, and three at once competed with rendering for memory and cores.
  let queue: Promise<unknown> = Promise.resolve();
  const decodeInTurn = (bitmap: ImageBitmap) => {
    const next = queue.then(() => decode(bitmap));
    queue = next.catch(() => {});
    return next;
  };
  try {
    return await Promise.all(
      [...textures].map(async ([tex, materials]) => {
        const { width, height } = tex.image as ImageBitmap;
        const pixels = await decodeInTurn(tex.image as ImageBitmap);
        const source = new THREE.DataTexture(pixels, width, height);
        const target = new THREE.DataTexture(null, width, height);
        // Storage only: the pixels arrive a strip at a time.
        target.source.dataReady = false;
        target.needsUpdate = true;
        for (const key of ["colorSpace", "wrapS", "wrapT", "magFilter", "minFilter", "anisotropy", "channel", "flipY"] as const) {
          (target as unknown as Record<string, unknown>)[key] = tex[key];
        }
        target.offset.copy(tex.offset);
        target.repeat.copy(tex.repeat);
        target.generateMipmaps = true;
        for (const m of materials) {
          for (const [k, v] of Object.entries(m)) if (v === tex) (m as unknown as Record<string, unknown>)[k] = target;
        }
        tex.dispose();
        let row = -1;
        const region = new THREE.Box2();
        const at = new THREE.Vector2();
        return (renderer: THREE.WebGLRenderer) => {
          if (row < 0) {
            // Allocates the full mip chain, no pixels yet.
            renderer.initTexture(target);
            row = 0;
            return false;
          }
          const rows = Math.min(STRIP, height - row);
          const last = row + rows >= height;
          region.min.set(0, row);
          region.max.set(width, row + rows);
          at.set(0, row);
          // Mipmaps are built once, with the final strip.
          target.generateMipmaps = last;
          renderer.copyTextureToTexture(source, target, region, at);
          target.generateMipmaps = true;
          row += rows;
          if (last) source.image.data = null as unknown as Uint8ClampedArray;
          return last;
        };
      }),
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}

// `lighten` scales the albedo (above 1 brightens the texture, like a paler fabric).
async function loadProp(loader: GLTFLoader, url: string, anisotropy: number, lighten = 1) {
  const gltf = await loader.loadAsync(url);
  const root = gltf.scene;
  root.traverse((o) => {
    if (!(o instanceof THREE.Mesh)) return;
    o.castShadow = true;
    o.receiveShadow = true;
    const mat = o.material as THREE.MeshStandardMaterial;
    if (mat.map) mat.map.anisotropy = anisotropy;
    mat.envMapIntensity = 0.7;
    mat.color.multiplyScalar(lighten);
  });
  // Stand it on the floor, centred on its footprint.
  const box = new THREE.Box3().setFromObject(root);
  root.position.set(-(box.min.x + box.max.x) / 2, -box.min.y, -(box.min.z + box.max.z) / 2);
  const holder = new THREE.Group();
  holder.add(root);
  return { group: holder, size: box.getSize(new THREE.Vector3()) };
}

// The scan's fabric reads darker than the real sofa under the studio light: lift it a shade.
const SOFA_LIGHTEN = 2;

/**
 * His sofa (a Meshy model of the real one), scaled to `width`. The seat, back and arm heights are measured off
 * the model as fractions of its size, so they follow the scale.
 */
export class Sofa {
  group = new THREE.Group();
  size = new THREE.Vector3();
  private model: THREE.Object3D | null = null;
  private scale = 1;

  async load(loader: GLTFLoader, url: string, anisotropy: number, width: number) {
    const { group, size } = await loadProp(loader, url, anisotropy, SOFA_LIGHTEN);
    this.scale = width / size.x;
    group.scale.setScalar(this.scale);
    this.size.copy(size).multiplyScalar(this.scale);
    this.group.add(group);
    this.model = group;
  }

  /**
   * The full-quality model (4K textures, ~250k triangles, ~5 MB), downloaded in the background with its shaders
   * compiled. Uploading 4K textures in one go froze the frame for ~200 ms, so the returned `advance` does it a
   * strip at a time, one call per frame, and swaps the model in (returning true) once everything is on the GPU.
   * Same shape and origin as the light one, so the swap only sharpens it.
   */
  async fetchFull(
    loader: GLTFLoader,
    anisotropy: number,
    renderer: THREE.WebGLRenderer,
    camera: THREE.Camera,
    scene: THREE.Scene,
    // Compiles an object's shaders the way the stage renders it.
    precompile: (root: THREE.Object3D) => Promise<unknown>,
    // The target the stage renders the scene into (its contents are redrawn every frame).
    sceneTarget: THREE.WebGLRenderTarget,
  ) {
    const { group } = await loadProp(loader, `${PROPS}/sofa-hq.glb`, anisotropy, SOFA_LIGHTEN);
    group.scale.setScalar(this.scale);
    await precompile(group);
    const uploads = await stripUploads(group);
    // Then its vertex buffers (~250k triangles), in a frame of their own: the scene drawn once with the new model in
    // it, beside the light one, into the stage's own scene target (same format and samples, so the GPU pipelines the
    // real frames need get built here too; the next frame redraws the target anyway).
    let buffersUp = false;
    const uploadBuffers = () => {
      const previous = renderer.getRenderTarget();
      this.group.add(group);
      renderer.setRenderTarget(sceneTarget);
      renderer.render(scene, camera);
      renderer.setRenderTarget(previous);
      this.group.remove(group);
      buffersUp = true;
    };
    let next = 0;
    return () => {
      if (next < uploads.length) {
        if (uploads[next](renderer)) next++;
        return false;
      }
      if (!buffersUp) {
        uploadBuffers();
        return false;
      }
      // The light model stays as the shadow caster: the same silhouette at the shadows' blur, a fifth of the
      // triangles to redraw into the shadow map every frame. Unseen: it writes neither colour nor depth, and draws
      // after the opaque pass, so the full model in front of it rejects nearly all of its pixels early. (Material
      // flags, not a different material, so nothing recompiles.)
      this.model?.traverse((o) => {
        if (!(o instanceof THREE.Mesh)) return;
        o.receiveShadow = false;
        o.renderOrder = 1;
        const m = o.material as THREE.Material;
        m.colorWrite = false;
        m.depthWrite = false;
      });
      group.traverse((o) => {
        if (o instanceof THREE.Mesh) o.castShadow = false;
      });
      this.group.add(group);
      this.model = group;
      return true;
    };
  }

  /** Top of the seat cushions. */
  get seat() {
    return this.size.y * 0.49;
  }

  /** The seat, the back cushions and the two arms as boxes, in its own space (centred on the floor, facing +z). */
  parts() {
    const w = this.size.x / 2;
    const d = this.size.z / 2;
    const h = this.size.y;
    const arm = this.size.x * 0.165;
    const box = (x0: number, x1: number, top: number, z0: number, z1: number) =>
      new THREE.Box3(new THREE.Vector3(x0, 0, z0), new THREE.Vector3(x1, top, z1));
    return [
      box(-w, w, this.seat, -d, d),
      box(-w, w, h * 0.97, -d, -d + this.size.z * 0.26),
      box(-w, -w + arm, h * 0.79, -d, d - this.size.z * 0.14),
      box(w - arm, w, h * 0.79, -d, d - this.size.z * 0.14),
    ];
  }
}

/** A potted plant: its leaves shiver when clicked. */
export class Plant {
  group = new THREE.Group();
  size = new THREE.Vector3();
  readonly sway = new Spring(40, 2.2);
  private leaves = new THREE.Group();

  async load(loader: GLTFLoader, url: string, anisotropy: number, height: number) {
    const { group, size } = await loadProp(loader, url, anisotropy);
    const s = height / size.y;
    group.scale.setScalar(s);
    this.size.copy(size).multiplyScalar(s);
    this.leaves.add(group);
    this.group.add(this.leaves);
  }

  update(dt: number) {
    this.sway.update(dt);
    this.leaves.rotation.z = this.sway.value * 0.08;
    this.leaves.rotation.x = this.sway.value * 0.03;
  }
}
