import * as THREE from "three";
import { FullScreenQuad } from "three/addons/postprocessing/Pass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { HorizontalBlurShader } from "three/addons/shaders/HorizontalBlurShader.js";
import { VerticalBlurShader } from "three/addons/shaders/VerticalBlurShader.js";
import { NOISE_SIZE } from "./studio-noise";
import { studioNoise } from "./studio-worker";

// Studio surfaces, light and finishing for the character stage: procedural plaster and floor textures,
// dappled window light, real contact shadows and a film finish. Everything is generated, so no extra downloads.

// ---------------------------------------------------------------------------------------------
// Procedural surfaces
// ---------------------------------------------------------------------------------------------

function dataTexture(data: Uint8Array, size: number, repeat: [number, number], colorSpace: THREE.ColorSpace = THREE.NoColorSpace) {
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(...repeat);
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.generateMipmaps = true;
  tex.anisotropy = 8;
  tex.colorSpace = colorSpace;
  tex.needsUpdate = true;
  return tex;
}

// Hand-trowelled plaster normal map (see studio-noise), generated in the studio worker: the texture is returned
// at once and filled in when `ready` resolves.
export function plasterNormalMap(repeat: [number, number]) {
  const texture = dataTexture(new Uint8Array(NOISE_SIZE * NOISE_SIZE * 4), NOISE_SIZE, repeat);
  const ready = studioNoise("plaster").then(([data]) => fill(texture, data));
  return { texture, ready };
}

// Seamless studio floor: faint cloudy tone variation (albedo) and patchy satin/matte roughness, filled in likewise.
export function floorMaps(repeat: [number, number]) {
  const map = dataTexture(new Uint8Array(NOISE_SIZE * NOISE_SIZE * 4), NOISE_SIZE, repeat, THREE.SRGBColorSpace);
  const roughnessMap = dataTexture(new Uint8Array(NOISE_SIZE * NOISE_SIZE * 4), NOISE_SIZE, repeat);
  const ready = studioNoise("floor").then(([albedo, rough]) => {
    fill(map, albedo);
    fill(roughnessMap, rough);
  });
  return { maps: { map, roughnessMap }, ready };
}

function fill(texture: THREE.DataTexture, data: Uint8Array) {
  texture.image.data = data;
  texture.needsUpdate = true;
}

// ---------------------------------------------------------------------------------------------
// Character surface
// ---------------------------------------------------------------------------------------------

// The Meshy export only has a colour map, so every surface was equally matte. Classify its texels into the
// materials they show and derive a roughness map: dark nylon, leather and hair catch soft highlights, skin is
// satin, cotton and canvas stay matte. (No normal map: the UV atlas is fragmented, so derivatives would draw seams.)
// The export is flat-shaded: every triangle has its own copies of its corners, each carrying that face's normal,
// so the low-poly body shows every facet. Re-smooth in place: each corner takes the area-weighted normal of all
// faces around its position that turn less than `crease` away from its own face (real hard edges stay hard).
// Indexed geometry, UVs and skin weights are left as they are.
export function smoothNormals(geometry: THREE.BufferGeometry, crease = THREE.MathUtils.degToRad(70)) {
  const pos = geometry.getAttribute("position");
  const nor = geometry.getAttribute("normal");
  const index = geometry.getIndex();
  if (!pos || !nor || !index) return;
  const idx = index.array;
  const faces = idx.length / 3;
  // Unit face normals, and the area-weighted ones (the raw cross product) that get summed.
  const unit = new Float32Array(faces * 3);
  const weighted = new Float32Array(faces * 3);
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  for (let f = 0; f < faces; f++) {
    a.fromBufferAttribute(pos, idx[f * 3]);
    b.fromBufferAttribute(pos, idx[f * 3 + 1]);
    c.fromBufferAttribute(pos, idx[f * 3 + 2]);
    c.sub(b);
    a.sub(b);
    c.cross(a);
    weighted.set([c.x, c.y, c.z], f * 3);
    c.normalize();
    unit.set([c.x, c.y, c.z], f * 3);
  }
  // Corners at the same position (to well under a millimetre) share a welded id.
  const ids = new Int32Array(pos.count);
  const byKey = new Map<string, number>();
  for (let v = 0; v < pos.count; v++) {
    const key = `${Math.round(pos.getX(v) * 1e5)},${Math.round(pos.getY(v) * 1e5)},${Math.round(pos.getZ(v) * 1e5)}`;
    let id = byKey.get(key);
    if (id === undefined) byKey.set(key, (id = byKey.size));
    ids[v] = id;
  }
  const facesAt: number[][] = Array.from({ length: byKey.size }, () => []);
  // Each vertex's own face (flat shading gives it one); its smoothing looks for neighbours within the crease of it.
  const home = new Int32Array(pos.count).fill(-1);
  for (let f = 0; f < faces; f++) {
    for (let k = 0; k < 3; k++) {
      const v = idx[f * 3 + k];
      facesAt[ids[v]].push(f);
      if (home[v] < 0) home[v] = f;
    }
  }
  const limit = Math.cos(crease);
  const out = new THREE.Vector3();
  for (let v = 0; v < pos.count; v++) {
    const h = home[v];
    if (h < 0) continue;
    out.set(0, 0, 0);
    for (const f of facesAt[ids[v]]) {
      const dot = unit[f * 3] * unit[h * 3] + unit[f * 3 + 1] * unit[h * 3 + 1] + unit[f * 3 + 2] * unit[h * 3 + 2];
      if (dot < limit) continue;
      out.x += weighted[f * 3];
      out.y += weighted[f * 3 + 1];
      out.z += weighted[f * 3 + 2];
    }
    if (out.lengthSq() === 0) continue;
    out.normalize();
    nor.setXYZ(v, out.x, out.y, out.z);
  }
  nor.needsUpdate = true;
}

/**
 * Uploads the textures on `root`'s materials (at `anisotropy`), one per task. Called as each asset arrives, so the
 * uploads interleave with the other downloads instead of all landing in one long first frame.
 */
export async function primeTextures(renderer: THREE.WebGLRenderer, root: THREE.Object3D | THREE.Texture, anisotropy: number) {
  const textures = new Set<THREE.Texture>();
  if (root instanceof THREE.Texture) textures.add(root);
  else {
    root.traverse((o) => {
      if (!(o instanceof THREE.Mesh)) return;
      for (const m of [o.material].flat()) for (const v of Object.values(m)) if (v instanceof THREE.Texture) textures.add(v);
    });
  }
  for (const t of textures) {
    t.anisotropy = anisotropy;
    renderer.initTexture(t);
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
}

/**
 * An image as a texture, decoded off the main thread (an <img> is decoded on it, synchronously, when uploaded).
 * `flipY` flips it at decode (ImageBitmaps ignore the texture's own flag).
 */
export async function bitmapTexture(url: string, flipY: boolean, target = new THREE.Texture()) {
  const loader = new THREE.ImageBitmapLoader();
  loader.setOptions({ premultiplyAlpha: "none", colorSpaceConversion: "none", ...(flipY ? { imageOrientation: "flipY" } : {}) });
  target.image = await loader.loadAsync(url);
  target.flipY = false;
  target.needsUpdate = true;
  return target;
}

// Per-texel roughness for the character (glossy nylon and boots, satin skin, matte cotton), classified from the
// colour map offline (see public/character/roughness.webp). Same orientation as the glTF colour map.
export async function characterRoughnessMap(url: string, anisotropy: number) {
  const tex = await bitmapTexture(url, false);
  tex.colorSpace = THREE.NoColorSpace;
  tex.anisotropy = anisotropy;
  return tex;
}

// ---------------------------------------------------------------------------------------------
// Dappled window light
// ---------------------------------------------------------------------------------------------

// A light cookie for sun through a window with a tree outside: a soft-edged, paned window patch that falls
// across the floor and up the wall, broken by two layers of leaf shadow that sway independently.
export class LeafGobo {
  readonly texture: THREE.Texture;
  // Composited on the GPU into a render target: redrawing a canvas and re-uploading it 30 times a second cost
  // a texture upload (and a readback of the canvas) every other frame.
  private readonly target: THREE.WebGLRenderTarget;
  private readonly sources: THREE.CanvasTexture[];
  private readonly material: THREE.ShaderMaterial;
  private readonly quad: FullScreenQuad;
  private last = -1;

  constructor(size = 512) {
    const window = LeafGobo.windowPatch(size);
    // At the throw distance one texel lands ~2.4cm in the room, so leaves come out ~15-30cm.
    const layers = [
      // Far branch: out of focus, so large and very soft.
      LeafGobo.foliage(size, 4, 0.45, size * 0.01, size * 0.02, 5),
      // Near branch: closer to the glass, crisper.
      LeafGobo.foliage(size, 5, 0.6, size * 0.003, size * 0.011, 13),
    ];
    this.sources = [window, ...layers].map((c) => {
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.NoColorSpace;
      t.generateMipmaps = false;
      t.minFilter = THREE.LinearFilter;
      return t;
    });
    // Half float: the result is stored linear, and 8 bits would band in the dim spill around the window.
    this.target = new THREE.WebGLRenderTarget(size, size, { type: THREE.HalfFloatType, depthBuffer: false });
    this.texture = this.target.texture;
    const pad = (layers[0].width - size) / 2;
    // Canvas "multiply" of the dark leaf colour over the window patch, in sRGB like the 2D canvas did, then decoded.
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        windowMap: { value: this.sources[0] },
        near: { value: this.sources[2] },
        far: { value: this.sources[1] },
        // Each layer's sway, in canvas pixels.
        offsets: { value: new THREE.Vector4() },
        size: { value: size },
        pad: { value: pad },
        layerSize: { value: layers[0].width },
      },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position.xy, 0.0, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform sampler2D windowMap;
        uniform sampler2D far;
        uniform sampler2D near;
        uniform vec4 offsets;
        uniform float size;
        uniform float pad;
        uniform float layerSize;
        varying vec2 vUv;
        const vec3 LEAF = vec3(20.0, 24.0, 16.0) / 255.0;
        float leaf(sampler2D layer, vec2 px, vec2 offset) {
          vec2 l = px + pad - offset;
          return texture2D(layer, vec2(l.x / layerSize, 1.0 - l.y / layerSize)).a;
        }
        vec3 toLinear(vec3 c) {
          return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c));
        }
        void main() {
          // Canvas pixel coordinates (y down), as the layers were drawn.
          vec2 px = vec2(vUv.x, 1.0 - vUv.y) * size;
          vec3 c = texture2D(windowMap, vUv).rgb;
          c = mix(c, c * LEAF, leaf(far, px, offsets.xy));
          c = mix(c, c * LEAF, leaf(near, px, offsets.zw));
          gl_FragColor = vec4(toLinear(c), 1.0);
        }`,
      depthTest: false,
      depthWrite: false,
    });
    this.quad = new FullScreenQuad(this.material);
  }

  // Two by three panes with slim mullions, sun-softened; outside the window only a little spill.
  private static windowPatch(size: number, blur = size * 0.008) {
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const g = c.getContext("2d")!;
    g.fillStyle = "rgb(58,58,58)";
    g.fillRect(0, 0, size, size);
    g.filter = `blur(${blur}px)`;
    const w = size * 0.5;
    const h = size * 0.6;
    const x0 = (size - w) / 2;
    const y0 = (size - h) / 2;
    const bar = size * 0.016;
    const cols = 2;
    const rows = 3;
    const pw = (w - bar * (cols - 1)) / cols;
    const ph = (h - bar * (rows - 1)) / rows;
    g.fillStyle = "#fff";
    for (let r = 0; r < rows; r++) {
      for (let col = 0; col < cols; col++) g.fillRect(x0 + col * (pw + bar), y0 + r * (ph + bar), pw, ph);
    }
    return c;
  }

  // Twigs reaching in from the upper right, each carrying pointed leaves; drawn dark on transparent and blurred.
  private static foliage(size: number, twigs: number, alpha: number, blur: number, leaf: number, seed: number) {
    let s = seed;
    const rand = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    const pad = size * 0.25;
    const c = document.createElement("canvas");
    c.width = c.height = size + pad * 2;
    const g = c.getContext("2d")!;
    g.filter = `blur(${blur}px)`;
    g.fillStyle = g.strokeStyle = `rgba(20, 24, 16, ${alpha})`;
    g.lineCap = "round";
    const drawLeaf = (x: number, y: number, len: number, angle: number) => {
      const w = len * (0.28 + rand() * 0.12);
      g.save();
      g.translate(x, y);
      g.rotate(angle);
      g.beginPath();
      g.moveTo(0, 0);
      g.quadraticCurveTo(len * 0.45, -w, len, 0);
      g.quadraticCurveTo(len * 0.45, w, 0, 0);
      g.fill();
      g.restore();
    };
    for (let k = 0; k < twigs; k++) {
      // Start beyond the upper-right of the window and droop across it.
      let x = c.width * (0.55 + rand() * 0.4);
      let y = c.height * (0.3 + rand() * 0.22);
      let heading = Math.PI * (0.8 + rand() * 0.35);
      const steps = 7 + Math.floor(rand() * 7);
      g.lineWidth = leaf * 0.12;
      for (let i = 0; i < steps; i++) {
        const nx = x + Math.cos(heading) * leaf * 1.6;
        const ny = y + Math.sin(heading) * leaf * 1.6;
        g.beginPath();
        g.moveTo(x, y);
        g.lineTo(nx, ny);
        g.stroke();
        // A leaf either side of each node, angled forward along the twig.
        drawLeaf(nx, ny, leaf * (1.4 + rand() * 1.2), heading - 0.9 + (rand() - 0.5) * 0.5);
        drawLeaf(nx, ny, leaf * (1.4 + rand() * 1.2), heading + 0.9 + (rand() - 0.5) * 0.5);
        x = nx;
        y = ny;
        heading += (rand() - 0.4) * 0.35;
      }
    }
    return c;
  }

  // Redraws at ~30fps; `t` in seconds.
  update(t: number, renderer: THREE.WebGLRenderer) {
    const frame = Math.floor(t * 30);
    if (frame === this.last) return;
    this.last = frame;
    const size = this.material.uniforms.size.value as number;
    const sway = (i: number) => size * (i ? 0.01 : 0.005);
    const dx = (i: number) => Math.sin(t * (0.37 + i * 0.21)) * sway(i) + Math.sin(t * (1.3 + i * 0.4)) * sway(i) * 0.3;
    const dy = (i: number) => Math.cos(t * (0.29 + i * 0.17)) * sway(i) * 0.6;
    (this.material.uniforms.offsets.value as THREE.Vector4).set(dx(0), dy(0), dx(1), dy(1));
    const previous = renderer.getRenderTarget();
    renderer.setRenderTarget(this.target);
    this.quad.render(renderer);
    renderer.setRenderTarget(previous);
  }

  dispose() {
    this.target.dispose();
    this.material.dispose();
    this.quad.dispose();
    for (const t of this.sources) t.dispose();
  }
}

// ---------------------------------------------------------------------------------------------
// Shadow filtering
// ---------------------------------------------------------------------------------------------

/**
 * three's PCF shadows take 5 samples and turn the pattern per pixel with noise, meant to be averaged away by
 * temporal anti-aliasing. Without TAA every soft edge renders as grain. This swaps in a fixed 3x3 grid of
 * hardware-filtered (2x2) compares, tent-weighted, spanning the shadow's radius: smooth, stable frame to frame, and
 * cheap (nine fetches, no per-pixel trigonometry). Call before any material compiles; it changes three's shader
 * source for the whole page.
 */
export function smoothShadowFiltering() {
  const noisy = /float phi = interleavedGradientNoise\( gl_FragCoord\.xy \) \* PI2;\s*shadow = \([\s\S]*?\) \* 0\.2;/;
  const chunk = THREE.ShaderChunk.shadowmap_pars_fragment;
  if (chunk.includes("studio: smooth shadows")) return;
  if (!noisy.test(chunk)) {
    if (process.env.NODE_ENV !== "production") console.warn("smoothShadowFiltering: three's PCF shader changed; not patched");
    return;
  }
  const tap = (x: number, y: number, w: number) =>
    `texture( shadowMap, vec3( shadowCoord.xy + vec2( ${x}.0, ${y}.0 ) * stride, shadowCoord.z ) ) * ${w}.0`;
  const taps = [-1, 0, 1].flatMap((y) => [-1, 0, 1].map((x) => tap(x, y, (2 - Math.abs(x)) * (2 - Math.abs(y)))));
  THREE.ShaderChunk.shadowmap_pars_fragment = chunk.replace(
    noisy,
    `// studio: smooth shadows
				vec2 stride = vec2( radius * 0.5 );
				shadow = (
					${taps.join(" +\n\t\t\t\t\t")}
				) / 16.0;`,
  );
}

// ---------------------------------------------------------------------------------------------
// Contact shadow
// ---------------------------------------------------------------------------------------------

// Shape-accurate contact shadow (after three's webgl_shadow_contact example): render the character's depth from
// below with an orthographic camera, blur it, and lay it on the floor. Near the floor it's dark and tight,
// higher parts of the body contribute a fainter, wider shadow, so feet and a seated body read as touching.
export class ContactShadow {
  readonly group = new THREE.Group();
  private readonly mesh: THREE.Mesh;
  private readonly camera: THREE.OrthographicCamera;
  private readonly target: THREE.WebGLRenderTarget;
  private readonly blurTarget: THREE.WebGLRenderTarget;
  private readonly depthMaterial: THREE.MeshDepthMaterial;
  // Own copies of the uniforms: the shader objects are shared module-wide.
  private readonly hBlur = new THREE.ShaderMaterial({
    ...HorizontalBlurShader,
    uniforms: THREE.UniformsUtils.clone(HorizontalBlurShader.uniforms),
  });
  private readonly vBlur = new THREE.ShaderMaterial({
    ...VerticalBlurShader,
    uniforms: THREE.UniformsUtils.clone(VerticalBlurShader.uniforms),
  });
  private readonly quad = new FullScreenQuad();

  constructor(
    private readonly size = 2.6,
    height = 0.9,
    private readonly blur = 2.2,
    darkness = 1.4,
    opacity = 0.62,
  ) {
    const res = 512;
    const opts = { generateMipmaps: false, type: THREE.HalfFloatType } as const;
    this.target = new THREE.WebGLRenderTarget(res, res, opts);
    this.blurTarget = new THREE.WebGLRenderTarget(res, res, opts);

    const geometry = new THREE.PlaneGeometry(size, size).rotateX(Math.PI / 2);
    this.mesh = new THREE.Mesh(
      geometry,
      new THREE.MeshBasicMaterial({ map: this.target.texture, transparent: true, opacity, depthWrite: false }),
    );
    // The render looks up from below, so flip it back to match the floor.
    this.mesh.scale.y = -1;
    this.mesh.renderOrder = 1;

    this.camera = new THREE.OrthographicCamera(-size / 2, size / 2, size / 2, -size / 2, 0, height);
    this.camera.rotation.x = Math.PI / 2;
    // Siblings, not parent/child: the plane's flip must not turn the camera to face down.
    this.group.add(this.mesh, this.camera);

    this.depthMaterial = new THREE.MeshDepthMaterial();
    this.depthMaterial.depthTest = false;
    this.depthMaterial.depthWrite = false;
    this.depthMaterial.onBeforeCompile = (shader) => {
      shader.uniforms.darkness = { value: darkness };
      shader.fragmentShader = `uniform float darkness;\n${shader.fragmentShader.replace(
        "gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );",
        // Tinted a touch warm-grey rather than pure black, like bounce light under a body.
        "gl_FragColor = vec4( vec3( 0.09, 0.085, 0.08 ), ( 1.0 - fragCoordZ ) * darkness );",
      )}`;
    };
  }

  // Renders only `layer` from the scene; call before the main render.
  render(renderer: THREE.WebGLRenderer, scene: THREE.Scene, layer: number, centre: THREE.Vector3) {
    this.group.position.set(centre.x, 0.003, centre.z);
    this.group.updateMatrixWorld(true);
    this.camera.layers.set(layer);

    const background = scene.background;
    const override = scene.overrideMaterial;
    const prevTarget = renderer.getRenderTarget();
    const prevClear = renderer.getClearAlpha();
    const prevClearColor = renderer.getClearColor(new THREE.Color());
    scene.background = null;
    scene.overrideMaterial = this.depthMaterial;
    renderer.setClearColor(0x000000, 0);
    renderer.setRenderTarget(this.target);
    renderer.clear();
    renderer.render(scene, this.camera);
    scene.overrideMaterial = override;
    scene.background = background;

    this.blurPass(renderer, this.blur);
    // A second, smaller pass smooths the steps between the blur's samples.
    this.blurPass(renderer, this.blur * 0.4);

    renderer.setRenderTarget(prevTarget);
    renderer.setClearColor(prevClearColor, prevClear);
  }

  private blurPass(renderer: THREE.WebGLRenderer, amount: number) {
    this.hBlur.uniforms.tDiffuse.value = this.target.texture;
    this.hBlur.uniforms.h.value = amount / 256;
    this.quad.material = this.hBlur;
    renderer.setRenderTarget(this.blurTarget);
    this.quad.render(renderer);

    this.vBlur.uniforms.tDiffuse.value = this.blurTarget.texture;
    this.vBlur.uniforms.v.value = amount / 256;
    this.quad.material = this.vBlur;
    renderer.setRenderTarget(this.target);
    this.quad.render(renderer);
  }

  dispose() {
    this.target.dispose();
    this.blurTarget.dispose();
    this.depthMaterial.dispose();
    this.hBlur.dispose();
    this.vBlur.dispose();
    this.quad.dispose();
    this.mesh.geometry.dispose();
    (this.mesh.material as THREE.Material).dispose();
  }
}

// ---------------------------------------------------------------------------------------------
// Film finish
// ---------------------------------------------------------------------------------------------

// The last pass, straight to the screen: tone mapping and the sRGB transfer (three supplies both to a material drawn
// to the screen), then a gentle vignette and a dither that removes banding in the large soft gradients of a white
// room, and the fade in from the page's colour on arrival (in the shader: fading the canvas element's opacity
// makes the compositor blend a full-screen layer every frame). One full-screen pass where OutputPass plus a finish pass took two.
export function createFinishPass() {
  return new ShaderPass({
    uniforms: {
      tDiffuse: { value: null },
      time: { value: 0 },
      aspect: { value: 1 },
      // Fading in from the page's colour (display-referred sRGB): 0 all page, 1 all studio.
      reveal: { value: 1 },
      page: { value: new THREE.Color() },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform sampler2D tDiffuse;
      uniform float time;
      uniform float aspect;
      uniform float reveal;
      uniform vec3 page;
      varying vec2 vUv;
      float hash(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }
      void main() {
        vec4 color = texture2D(tDiffuse, vUv);
        #ifdef TONE_MAPPING
          color.rgb = toneMapping(color.rgb);
        #endif
        color = linearToOutputTexel(color);
        vec2 d = (vUv - 0.5) * vec2(aspect, 1.0);
        float vignette = smoothstep(1.25, 0.35, length(d));
        color.rgb *= mix(0.9, 1.0, vignette);
        // Sub-LSB dither only (not visible grain): breaks up banding in the soft gradients.
        float dither = hash(vUv * vec2(1733.0, 977.0) + fract(time) * 61.0) - 0.5;
        color.rgb += dither / 255.0;
        color.rgb = mix(page, color.rgb, reveal);
        gl_FragColor = color;
      }`,
  });
}

// Frees every texture a material holds (maps of any kind), then the material.
export function disposeMaterial(material: THREE.Material) {
  for (const value of Object.values(material)) {
    if (value instanceof THREE.Texture) value.dispose();
  }
  material.dispose();
}
