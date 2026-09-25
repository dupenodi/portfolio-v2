"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ClothFlag } from "./studio-decor";
import {
  ContactShadow,
  LeafGobo,
  characterRoughnessMap,
  createFinishPass,
  disposeMaterial,
  floorMaps,
  plasterNormalMap,
  primeTextures,
  smoothNormals,
  smoothShadowFiltering,
} from "./studio-scene";
import { CharacterLife } from "./character-life";
import { bind as bindCues, setEnabled as setCues, setVolume as setCueVolume } from "cuelume";
import { StudioSound } from "./studio-sound";
import { Plant, Sofa, Spring } from "./studio-props";
import { PhoneProp } from "./phone-prop";
import { AdaptiveResolution } from "./adaptive-resolution";
import { SMALL_SCREEN, sized } from "./studio-assets";
import { PhoneChat } from "./phone-chat";
import { PaintingView } from "./painting-view";
import { Lantern, PictureLight, GLOWS, SunsetGlow, lightingAt, type Glow, type Daylight, type Mode } from "./daylight";
import { pageToneFor, setPageTone, toneKey } from "./page-tone";

const STUDIO = 0xf4f3f0;
const WALL = 0xebe8e2;
const BASE = "/character";
// The painting GLB is ~0.45 x 1.03 m; a modest ~0.43 x 0.98 m piece at eye level.
const PAINTING_SCALE = 0.95;
// The character is also drawn on this layer, so the contact shadow can render it alone.
const CHARACTER_LAYER = 1;
// The props that stand on the floor (sofa, plant, lantern), for their own, mostly static, contact shadow.
const PROPS_LAYER = 2;

// What he says. Lowercase, like the rest of the page.
const LINES = {
  poke1: ["hey.", "hi!", "yes?", "that tickles.", "can i help you?", "oh, hello."],
  poke2: ["ok ok.", "hehe. stop.", "i'm resting.", "alright, alright.", "you again."],
  poke3: ["i'm not moving.", "comfy here, thanks.", "ok, that's enough.", "you should check my phone instead."],
  wake: ["huh?", "i wasn't sleeping.", "five more minutes…", "oh. hi.", "i'm up, i'm up."],
  back: ["oh. you're back.", "welcome back.", "missed you."],
  lampOff: ["hey, who turned off the light?", "it's dark in here now."],
  phone: [
    "that's my phone. go ahead, tap it.",
    "oh, a text. you can answer it.",
    "psst. tap my phone, ask me anything.",
    "someone's texting. can you get that?",
    "unread message. it's for you, actually.",
  ],
};
const pick = (list: string[]) => list[Math.floor(Math.random() * list.length)];
// Leave him alone this long (ms) and he nods off.
const DOZE_AFTER = 25000;
// The sofa's width: a little over two metres, so it reads right next to him.
const SOFA_WIDTH = 2.1;
// Along the wall: the sofa a little right of centre (the upper left is kept clear for the intro copy), and
// the spot he sits against the wall, under the painting, to its left.
const SOFA_X = 0.45;
const FLOOR_X = -1.35;
// Where he sits: under the painting, 3.38 m back from the middle of the floor (the wall is placed against him).
const SEAT = new THREE.Vector3(FLOOR_X, 0, -3.38);
// The sunset glow's radius on the wall.
const GLOW_RADIUS = 1.05;

// Camera orbits him when dragged, within limits so the wall always fills the background. Raised to look down
// ~20° so the open floor between him and the camera stays visible; aimed a little toward him along the wall.
const CAMERA_TARGET = new THREE.Vector3(SEAT.x * 0.3, 0.75, -0.8 + SEAT.z * 0.6);
const CAMERA_OFFSET = new THREE.Vector3(0, 1.9, 6.6);
// Default view is a slight three-quarter angle so the floor depth and the lean against the wall read.
const BASE_AZIMUTH = 0.35;
const MAX_AZIMUTH = 0.7;
// Radians of orbit per pixel dragged, and how quickly a flick's spin dies out (per second).
const DRAG_SPEED = 0.005;
const SPIN_DAMPING = 4;

// The seated pose (see scripts/seated-pose.mjs) stores the hips' horizontal position relative to their rest spot.
function seatedPose(clip: THREE.AnimationClip, hipsRest: THREE.Vector3) {
  const v = clip.tracks.find((t) => /hips\.position$/i.test(t.name))?.values;
  if (v) {
    v[0] += hipsRest.x;
    v[2] += hipsRest.z;
  }
  return clip;
}

// Light or dark: ?mode= forces one, else the visitor's last choice, else light.
function initialMode(): Mode {
  const forced = new URLSearchParams(location.search).get("mode");
  if (forced === "light" || forced === "dark") return forced;
  try {
    const saved = localStorage.getItem("studio-mode");
    if (saved === "light" || saved === "dark") return saved;
  } catch {}
  return "light";
}

export function CharacterStage() {
  const mountRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const zzzRef = useRef<HTMLDivElement>(null);
  const toggleModeRef = useRef<() => void>(null);
  // The phone and painting open from a click in the 3D scene; these let a keyboard open them too.
  const openChatRef = useRef<() => void>(null);
  const openPaintingRef = useRef<() => void>(null);
  const [mode, setMode] = useState<Mode>(initialMode);
  const soundToggleRef = useRef<() => void>(null);
  const [soundOn, setSoundOn] = useState(false);
  // The phone on the floor opens a chat; it zooms up from where the phone is on screen.
  const [chatOpen, setChatOpen] = useState(false);
  const [chatOrigin, setChatOrigin] = useState<{ x: number; y: number } | null>(null);
  const chatOpenRef = useRef(false);
  // Whatever had focus when the chat or painting opened gets it back when they close.
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const restoreFocus = useCallback(() => {
    returnFocusRef.current?.focus({ preventScroll: true });
    returnFocusRef.current = null;
  }, []);
  const closeChat = useCallback(() => {
    setChatOpen(false);
    chatOpenRef.current = false;
    restoreFocus();
  }, [restoreFocus]);
  // The painting opens up the same way, to be looked at properly.
  const [paintingOpen, setPaintingOpen] = useState(false);
  const [paintingOrigin, setPaintingOrigin] = useState<{ x: number; y: number } | null>(null);
  const paintingOpenRef = useRef(false);
  const closePainting = useCallback(() => {
    setPaintingOpen(false);
    paintingOpenRef.current = false;
    restoreFocus();
  }, [restoreFocus]);
  // First frame rendered: fade the canvas in from the page colour instead of popping.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const mount = mountRef.current!;
    let disposed = false;
    let timer: THREE.Timer | null = null;

    // Soft shadow edges without grain (fewer samples where the screen is small).
    smoothShadowFiltering();
    // Antialiasing comes from the composer's multisampled target instead of the default framebuffer.
    const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
    let pixelRatio = Math.min(devicePixelRatio, 2);
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.toneMappingExposure = 0.96;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    // Rendered once per frame by hand: the AO and contact-shadow passes re-render the scene and would redo it.
    renderer.shadowMap.autoUpdate = false;
    // Reading back every program's info log forces each shader to finish compiling on the spot, which undoes
    // the driver's parallel compile (hundreds of ms at load). Errors only matter while developing.
    renderer.debug.checkShaderErrors = process.env.NODE_ENV !== "production";
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(STUDIO);

    const camera = new THREE.PerspectiveCamera(35, mount.clientWidth / mount.clientHeight, 0.05, 100);
    // Narrow (portrait) screens: pull back and open the lens a little so the room still fits across,
    // and raise the aim so the character sits in the lower half, under the copy.
    let fit = 1;
    const fitCamera = () => {
      const aspect = mount.clientWidth / mount.clientHeight;
      fit = aspect >= 1.2 ? 1 : Math.pow(1.2 / aspect, 0.5);
      camera.aspect = aspect;
      camera.fov = THREE.MathUtils.lerp(35, 46, THREE.MathUtils.clamp((fit - 1) / 0.8, 0, 1));
      camera.updateProjectionMatrix();
    };
    fitCamera();
    let azimuth = BASE_AZIMUTH;
    const target = CAMERA_TARGET.clone();
    const aim = new THREE.Vector3();
    const placeCamera = () => {
      aim.copy(target).setY(target.y + (fit - 1) * 0.55);
      camera.position.copy(CAMERA_OFFSET).multiplyScalar(fit).applyAxisAngle(THREE.Object3D.DEFAULT_UP, azimuth).add(aim);
      camera.lookAt(aim);
      camera.updateMatrixWorld();
    };
    placeCamera();

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envMap;
    scene.environmentIntensity = 0.4;

    // Soft sky fill from above, warm bounce from the pale floor.
    const hemi = new THREE.HemisphereLight(0xf7f8fb, 0xd8d2c8, 0.85);
    scene.add(hemi);
    // Key: late-morning sun through a window with a tree outside. A warm spot that throws soft shadows and,
    // through a swaying leaf cookie, a dappled pool across the floor and wall.
    const gobo = new LeafGobo();
    // Narrow enough that the window lands as a patch on the wall behind him, not a wash over the whole frame.
    const key = new THREE.SpotLight(0xfff1e2, 2.7, 0, 0.42, 0.35, 0);
    key.map = gobo.texture;
    key.position.set(4.2, 6.8, 5.2);
    key.target.position.set(0.3, 0.9, -3.3);
    key.castShadow = true;
    // 2048 with a 2.5-texel filter: the same softness as 4096 at 5 texels (nothing sharper than the penumbra
    // survives the filter anyway), a quarter of the shadow rendering, and the filter's taps land closer together.
    key.shadow.mapSize.setScalar(2048);
    key.shadow.radius = 2.5;
    key.shadow.bias = -0.00015;
    key.shadow.normalBias = 0.018;
    key.shadow.camera.near = 4;
    key.shadow.camera.far = 20;
    scene.add(key, key.target);
    // Cool rim from behind-left to separate the dark jacket and hair from the pale wall.
    const rim = new THREE.DirectionalLight(0xd4e0ff, 0.7);
    rim.position.set(-4, 3.5, -5);
    scene.add(rim);
    // Practical lamps for the evening: a paper lantern on the floor and a picture light over the painting.
    const lantern = new Lantern();
    lantern.group.position.set(-2.75, 0, 0.42);

    // White studio: a floor and a slightly greyer back wall (moved into place once the seated pose is known),
    // with a soft shadow where they meet so the corner reads.
    // Seamless painted studio floor: faint tonal clouding and a satin sheen that breaks up the reflections.
    // The floor and plaster textures are generated in the studio worker; the first frame waits for them.
    const floorTextures = floorMaps([100, 100]);
    const plaster = plasterNormalMap([120, 12]);
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 200),
      new THREE.MeshStandardMaterial({ color: STUDIO, metalness: 0, envMapIntensity: 0.6, ...floorTextures.maps }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);
    // Shape-accurate soft shadow where the character meets the floor.
    const contact = new ContactShadow();
    scene.add(contact.group);
    // One wide contact shadow under the props along the wall: rendered once they've loaded, and again only when
    // something moves (the lantern rocking, the sofa swapping to full quality).
    const propShadow = new ContactShadow(6.4, 0.6, 1.4, 1.5, 0.7);
    scene.add(propShadow.group);
    let propShadowDirty = true;
    const wall = new THREE.Group();
    // Matte plaster: the trowel texture only shows where the sun rakes across it.
    const wallFace = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 20),
      new THREE.MeshStandardMaterial({
        color: WALL,
        roughness: 0.94,
        metalness: 0,
        normalMap: plaster.texture,
        normalScale: new THREE.Vector2(0.08, 0.08),
      }),
    );
    wallFace.position.y = 10;
    wallFace.receiveShadow = true;
    wall.add(wallFace);
    // Slim satin skirting board, a shade brighter than the wall.
    const skirting = new THREE.Mesh(
      new THREE.BoxGeometry(200, 0.08, 0.012),
      new THREE.MeshStandardMaterial({ color: 0xf3f1ec, roughness: 0.45, metalness: 0 }),
    );
    skirting.position.set(0, 0.04, 0.006);
    skirting.castShadow = true;
    skirting.receiveShadow = true;
    wall.add(skirting);
    const cornerCanvas = document.createElement("canvas");
    cornerCanvas.width = 1;
    cornerCanvas.height = 128;
    const ctx = cornerCanvas.getContext("2d")!;
    const gradient = ctx.createLinearGradient(0, 0, 0, 128);
    // Light touch: GTAO does the real occlusion, this only carries it a little further than its radius.
    gradient.addColorStop(0, "rgba(40,34,26,0.1)");
    gradient.addColorStop(0.35, "rgba(40,34,26,0.03)");
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1, 128);
    const cornerTexture = new THREE.CanvasTexture(cornerCanvas);
    const cornerMaterial = new THREE.MeshBasicMaterial({ map: cornerTexture, transparent: true, depthWrite: false });
    // Up the wall from the floor, and out across the floor from the wall.
    const wallShade = new THREE.Mesh(new THREE.PlaneGeometry(200, 0.45), cornerMaterial);
    wallShade.rotation.z = Math.PI;
    wallShade.position.set(0, 0.225, 0.002);
    wall.add(wallShade);
    const floorShade = new THREE.Mesh(new THREE.PlaneGeometry(200, 0.45), cornerMaterial);
    floorShade.rotation.x = -Math.PI / 2;
    floorShade.position.set(0, 0.002, 0.225);
    wall.add(floorShade);
    wall.position.z = -2;
    scene.add(wall);

    // Decor hangs on the wall group, so it moves with the wall once that is placed.
    // The painting GLB is added here once loaded. Its frame sits only 3 cm proud of the wall, so the key light's
    // shadow is a thin sliver; a soft occlusion halo (offset away from the light) grounds it like a real hung frame.
    const painting = new THREE.Group();
    // Over where he sits on the floor.
    painting.position.set(FLOOR_X, 1.62, 0);
    wall.add(painting);
    // The art and its shadow halo (the picture light sits beside them, on `painting`).
    const paintingHang = new THREE.Group();
    painting.add(paintingHang);
    wall.add(lantern.group);
    // The lantern rocks on its legs when knocked; two springs for the two tilt axes.
    const lanternTilt = { x: new Spring(70, 3.2), z: new Spring(70, 3.2) };
    let lanternFlicker = 1;
    let flickerUntil = 0;

    // The rest of the room, along the wall: his sofa under the flag (pushed back against the wall once its depth
    // is known) and a plant at the end of it.
    const sofa = new Sofa();
    sofa.group.position.set(SOFA_X, 0, 0.45);
    wall.add(sofa.group);
    // At night, a sunset lamp's glow on the wall behind the sofa (the lamp itself is out of shot, across the room).
    const glowAim = new THREE.Object3D();
    glowAim.position.set(SOFA_X, 1.7, 0);
    wall.add(glowAim);
    const savedGlow = (() => {
      try {
        const g = localStorage.getItem("studio-glow");
        return g && g in GLOWS ? (g as Glow) : "sunset";
      } catch {
        return "sunset";
      }
    })();
    const sunsetGlow = new SunsetGlow(new THREE.Vector3(SOFA_X + 0.3, 1.1, 5.2), glowAim, GLOW_RADIUS, savedGlow);
    wall.add(sunsetGlow.spot);
    // The three night lights (lantern, picture light, sunset lamp) are left out of the scene altogether while
    // they're all dark: three shades every pixel for every light, lit or not, and the sunset lamp's includes a
    // shadow lookup.
    let nightLights = true;
    const setNightLights = (on: boolean) => {
      if (on === nightLights) return;
      nightLights = on;
      lantern.light.visible = on;
      pictureLight.spot.visible = on;
      sunsetGlow.spot.visible = on;
    };
    const plant = new Plant();
    plant.group.position.set(2.2, 0, 0.36);
    wall.add(plant.group);
    const pictureAim = new THREE.Object3D();
    pictureAim.position.set(0, -0.15, 0);
    painting.add(pictureAim);
    const pictureLight = new PictureLight(0.36, pictureAim);
    pictureLight.group.position.set(0, 0.56, 0);
    painting.add(pictureLight.group);
    // The brass bar is a thin target: click anywhere around it.
    const pictureLightHit = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.14, 0.3),
      new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false }),
    );
    pictureLightHit.position.set(0, 0.01, 0.1);
    pictureLight.group.add(pictureLightHit);

    // Light or dark (see `initialMode`); the room fades between the two looks rather than cutting.
    const applyDaylight = (d: Daylight) => {
      key.color.copy(d.key);
      key.intensity = d.keyIntensity;
      key.position.set(d.keyX, d.keyY, 5.2);
      hemi.color.copy(d.sky);
      hemi.groundColor.copy(d.ground);
      hemi.intensity = d.hemi;
      rim.color.copy(d.rim);
      rim.intensity = d.rimIntensity;
      scene.environmentIntensity = d.env;
      renderer.toneMappingExposure = d.exposure;
      autoLamps = d.lamps;
      sunsetGlow.setGlow(d.lamps);
    };
    // The lamps follow the mode unless someone has clicked them on or off.
    let autoLamps = 0;
    const lampOverride: { lantern: boolean | null; picture: boolean | null } = { lantern: null, picture: null };
    let lanternLevel = -1;
    let pictureLevel = -1;
    const easeLamps = (dt: number) => {
      const k = 1 - Math.exp(-dt * 7);
      const lt = lampOverride.lantern === null ? autoLamps : Number(lampOverride.lantern);
      const pt = lampOverride.picture === null ? autoLamps : Number(lampOverride.picture);
      const moved = Math.abs(lt - lanternLevel) > 0.002 || Math.abs(pt - pictureLevel) > 0.002;
      lanternLevel = lanternLevel < 0 ? lt : lanternLevel + (lt - lanternLevel) * k;
      pictureLevel = pictureLevel < 0 ? pt : pictureLevel + (pt - pictureLevel) * k;
      lantern.setGlow(lanternLevel * lanternFlicker);
      pictureLight.setGlow(pictureLevel);
      return moved;
    };
    let mode = initialMode();
    // 0 light, 1 dark; eased toward the chosen mode.
    let darkness = mode === "dark" ? 1 : 0;
    let retoneWanted = true;
    let daylightDirty = true;
    applyDaylight(lightingAt(darkness));
    // Which side of halfway the room is on: the ink flips as it crosses, not when the fade has finished.
    let darkSide = darkness > 0.5;
    toggleModeRef.current = () => {
      mode = mode === "dark" ? "light" : "dark";
      setMode(mode);
      lampOverride.lantern = null;
      lampOverride.picture = null;
      // The page heads for the new mode's colour straight away (its CSS transition runs alongside the room's fade);
      // the room's own measurement corrects it once the light settles.
      document.documentElement.style.setProperty("--studio", pageToneFor(mode));
      try {
        localStorage.setItem("studio-mode", mode);
      } catch {}
    };

    // Sound, synthesized; off until asked for. Remembered per visitor, but still needs a gesture to start.
    const sound = new StudioSound();
    // Interaction sounds (hovers, presses, copies) follow the same switch, so the page is silent until asked.
    bindCues();
    setCues(false);
    setCueVolume(0.55);
    let soundWanted = false;
    try {
      soundWanted = localStorage.getItem("studio-sound") === "on";
    } catch {}
    const setSound = (on: boolean) => {
      soundWanted = on;
      if (on) sound.enable().catch(() => {});
      else sound.disable();
      setCues(on);
      setSoundOn(on);
      try {
        localStorage.setItem("studio-sound", on ? "on" : "off");
      } catch {}
    };
    soundToggleRef.current = () => setSound(!sound.enabled);
    const onFirstGesture = () => {
      if (soundWanted && !sound.enabled) setSound(true);
    };
    addEventListener("pointerdown", onFirstGesture, { once: true });
    addEventListener("keydown", onFirstGesture, { once: true });
    const haloCanvas = document.createElement("canvas");
    haloCanvas.width = 128;
    haloCanvas.height = 256;
    const hg = haloCanvas.getContext("2d")!;
    hg.filter = "blur(10px)";
    hg.fillStyle = "rgba(40,36,32,0.5)";
    hg.fillRect(22, 22, 84, 212);
    const paintingHalo = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(haloCanvas), transparent: true, depthWrite: false }),
    );
    paintingHalo.position.z = 0.001;
    paintingHang.add(paintingHalo);
    // Printed tweet flag, 5:3 like its artwork.
    const flag = new ClothFlag({
      print: `${BASE}/decor/tweet-flag.webp`,
      width: 1.5,
      height: 0.9,
      cols: 50,
      rows: 30,
      standoff: 0.07,
    });
    flag.group.position.set(2.25, 2.35, 0);
    wall.add(flag.group);

    // Post: multisampled HDR render -> tone map -> finish. (No screen-space AO: it isn't antialiased and left
    // a noisy, jagged halo around the character; the contact shadow and corner shading cover occlusion.)
    const composer = new EffectComposer(
      renderer,
      new THREE.WebGLRenderTarget(mount.clientWidth, mount.clientHeight, {
        type: THREE.HalfFloatType,
        // Samples per device pixel: 4, or 2 at retina density, where a CSS pixel already spans four device pixels
        // (8 samples each); 4x there doubles the cost of the half-float target for no visible difference.
        samples: Math.min(pixelRatio >= 1.75 ? 2 : 4, renderer.capabilities.maxSamples),
      }),
    );
    composer.addPass(new RenderPass(scene, camera));
    const finish = createFinishPass();
    composer.addPass(finish);
    const sizeComposer = () => {
      composer.setPixelRatio(pixelRatio);
      composer.setSize(mount.clientWidth, mount.clientHeight);
      finish.uniforms.aspect.value = mount.clientWidth / mount.clientHeight;
    };
    sizeComposer();

    const onResize = () => {
      fitCamera();
      placeCamera();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      sizeComposer();
    };
    addEventListener("resize", onResize);
    // Match the page to the floor at the bottom of the frame, so the studio runs straight into the page below
    // at any hour (and flip the ink to light when the room is dark).
    // Read back asynchronously: a strip of pixels copied into a buffer on the GPU, collected a frame or two later
    // once a fence says it's done. (A plain readPixels waits for the whole frame to finish rendering: a visible
    // hitch at retina size, several times a second while the light changes.)
    const gl = renderer.getContext() as WebGL2RenderingContext;
    const TONE_WIDTH = 32;
    const toneBytes = new Uint8Array(TONE_WIDTH * 4);
    const toneBuffer = gl.createBuffer();
    let toneFence: WebGLSync | null = null;
    // False while an earlier read is still in flight (ask again next frame).
    const requestPageTone = () => {
      if (toneFence) return false;
      gl.bindBuffer(gl.PIXEL_PACK_BUFFER, toneBuffer);
      gl.bufferData(gl.PIXEL_PACK_BUFFER, toneBytes.byteLength, gl.STREAM_READ);
      gl.readPixels(Math.floor(gl.drawingBufferWidth / 2 - TONE_WIDTH / 2), 1, TONE_WIDTH, 1, gl.RGBA, gl.UNSIGNED_BYTE, 0);
      gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);
      toneFence = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      return true;
    };
    const collectPageTone = () => {
      if (!toneFence) return;
      const status = gl.clientWaitSync(toneFence, 0, 0);
      if (status === gl.TIMEOUT_EXPIRED) return;
      gl.deleteSync(toneFence);
      toneFence = null;
      if (status === gl.WAIT_FAILED) return;
      gl.bindBuffer(gl.PIXEL_PACK_BUFFER, toneBuffer);
      gl.getBufferSubData(gl.PIXEL_PACK_BUFFER, 0, toneBytes);
      gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);
      let r = 0;
      let g = 0;
      let b = 0;
      for (let i = 0; i < TONE_WIDTH; i++) {
        r += toneBytes[i * 4];
        g += toneBytes[i * 4 + 1];
        b += toneBytes[i * 4 + 2];
      }
      r = Math.round(r / TONE_WIDTH);
      g = Math.round(g / TONE_WIDTH);
      b = Math.round(b / TONE_WIDTH);
      // Stale if the mode changed while this was in flight: the next settle measures again.
      if ((mode === "dark" ? 1 : 0) !== darkness) return;
      const color = `rgb(${r} ${g} ${b})`;
      setPageTone(color, 0.2126 * r + 0.7152 * g + 0.0722 * b < 118 ? "dark" : "light");
      try {
        localStorage.setItem(toneKey(mode), color);
      } catch {}
    };
    let onScreen = true;
    const visibility = new IntersectionObserver(([entry]) => (onScreen = entry.isIntersecting));
    visibility.observe(mount);

    // Drag on the flag to pull the cloth; drag anywhere else to orbit the camera (a flick keeps it drifting).
    const raycaster = new THREE.Raycaster();
    const rayFrom = (e: PointerEvent) => {
      const r = renderer.domElement.getBoundingClientRect();
      raycaster.setFromCamera(
        new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1),
        camera,
      );
      return raycaster;
    };
    // Where the visitor's pointer is (for him to look at), and when they last did anything (for dozing off).
    const pointer = new THREE.Vector2();
    let pointerSeen = -Infinity;
    let lastActivity = performance.now();
    let pokeHandler: ((e: PointerEvent) => void) | null = null;
    let hoverHandler: ((e: PointerEvent) => void) | null = null;
    let wakeHandler: (() => void) | null = null;
    const onActivity = () => {
      lastActivity = performance.now();
      wakeHandler?.();
    };
    const onWindowPointer = (e: PointerEvent) => {
      const r = renderer.domElement.getBoundingClientRect();
      const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      if (inside) {
        pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
        pointerSeen = performance.now();
      }
      onActivity();
    };
    const onLeave = () => (pointerSeen = -Infinity);
    addEventListener("pointermove", onWindowPointer);
    addEventListener("pointerdown", onWindowPointer);
    addEventListener("keydown", onActivity);
    addEventListener("wheel", onActivity, { passive: true });
    addEventListener("scroll", onActivity, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    // Away from the tab for a while: he falls asleep, and says hi when you come back.
    const baseTitle = document.title;
    let hiddenAt = 0;
    let awayHandler: ((ms: number) => void) | null = null;
    const onVisibility = () => {
      if (document.hidden) {
        hiddenAt = performance.now();
        document.title = `zzz · ${baseTitle}`;
      } else {
        document.title = baseTitle;
        awayHandler?.(performance.now() - hiddenAt);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    let dragging = false;
    let downX = 0;
    let downY = 0;
    let downT = 0;
    let lastX = 0;
    let lastT = 0;
    let spin = 0;
    const onPointerDown = (e: PointerEvent) => {
      // Only drags that start on the canvas; capturing from the button would swallow its click.
      if (e.target !== renderer.domElement) return;
      mount.setPointerCapture(e.pointerId);
      downX = e.clientX;
      downY = e.clientY;
      downT = e.timeStamp;
      if (flag.grab(rayFrom(e))) {
        mount.style.cursor = "grabbing";
        return;
      }
      dragging = true;
      spin = 0;
      lastX = e.clientX;
      lastT = e.timeStamp;
      mount.style.cursor = "grabbing";
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging && !flag.dragging) hoverHandler?.(e);
      if (flag.dragging) {
        flag.drag(rayFrom(e));
        return;
      }
      if (!dragging) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      azimuth = THREE.MathUtils.clamp(azimuth - dx * DRAG_SPEED, BASE_AZIMUTH - MAX_AZIMUTH, BASE_AZIMUTH + MAX_AZIMUTH);
      spin = ((-dx * DRAG_SPEED) / Math.max(e.timeStamp - lastT, 8)) * 1000;
      lastT = e.timeStamp;
    };
    const onPointerUp = (e: PointerEvent) => {
      if (flag.dragging) {
        flag.release();
        mount.style.cursor = "grab";
        return;
      }
      if (!dragging) return;
      dragging = false;
      // A click rather than a drag: maybe it landed on him.
      if (Math.hypot(e.clientX - downX, e.clientY - downY) < 6 && e.timeStamp - downT < 450) {
        spin = 0;
        pokeHandler?.(e);
      }
      // Released after holding still: no flick.
      if (e.timeStamp - lastT > 80) spin = 0;
      mount.style.cursor = "grab";
    };
    mount.addEventListener("pointerdown", onPointerDown);
    mount.addEventListener("pointermove", onPointerMove);
    mount.addEventListener("pointerup", onPointerUp);
    mount.addEventListener("pointercancel", onPointerUp);

    // Moves the character around the studio (the walk back to the wall); the clips themselves play in place.
    const stage = new THREE.Group();
    scene.add(stage);
    // His phone, left on the sofa (placed once the sofa is).
    const phone = new PhoneProp();
    scene.add(phone.group);

    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);

    (async () => {
      const aniso = renderer.capabilities.getMaxAnisotropy();
      // Full or half-resolution textures by screen size (the same choice the page preloaded).
      const assets = sized(matchMedia(SMALL_SCREEN).matches);
      // Each asset's textures go up to the GPU as soon as it arrives (see `primeTextures`).
      const primed = <T,>(load: Promise<T>, root: (v: T) => THREE.Object3D | THREE.Texture) =>
        load.then(async (v) => (await primeTextures(renderer, root(v), aniso), v));
      const [roughnessMap, , , , gltf, paintingGltf, , , poseGltf] = await Promise.all([
        primed(characterRoughnessMap(assets.roughness, aniso), (t) => t),
        flag.ready.then(() => primeTextures(renderer, flag.group, 16)),
        primed(sofa.load(loader, assets.sofa, aniso, SOFA_WIDTH), () => sofa.group),
        primed(plant.load(loader, assets.plant, aniso, 1.0), () => plant.group),
        primed(loader.loadAsync(assets.model), (g) => g.scene),
        primed(loader.loadAsync(`${BASE}/decor/painting.glb`), (g) => g.scene),
        floorTextures.ready,
        plaster.ready,
        loader.loadAsync(`${BASE}/anims/Seated.glb`),
      ]);
      if (disposed) return;
      for (const g of [sofa.group, plant.group, lantern.group]) g.traverse((o) => o.layers.enable(PROPS_LAYER));

      // Painting: authored in metres, facing +z with its back at z = 0, so it hangs flat on the wall.
      const art = paintingGltf.scene;
      art.scale.setScalar(PAINTING_SCALE);
      art.traverse((o) => {
        if (!(o instanceof THREE.Mesh)) return;
        o.castShadow = true;
        o.receiveShadow = true;
        const mat = o.material as THREE.MeshStandardMaterial;
        // Single-sided: the back faces only add shadow acne against the wall.
        mat.side = THREE.FrontSide;
        if (mat.map) mat.map.anisotropy = renderer.capabilities.getMaxAnisotropy();
        // The export's pure red mat and glossy black frame read as neon plastic under the studio lights;
        // settle them into a madder-red cloth mat and a satin black frame.
        if (mat.name === "MatRed") {
          mat.color.set(0x8f1d22);
          mat.roughness = 0.95;
        } else if (mat.name === "FrameBlack") {
          mat.color.set(0x1a1a1c);
          mat.roughness = 0.6;
        }
      });
      const artBox = new THREE.Box3().setFromObject(art);
      const artSize = artBox.getSize(new THREE.Vector3());
      paintingHalo.scale.set(artSize.x * 1.45, artSize.y * 1.15, 1);
      paintingHalo.position.set(-0.03, -0.04, 0.001);
      paintingHang.add(art);

      const model = gltf.scene;
      let skinned: THREE.SkinnedMesh | null = null;
      // Meshy's export uses the colour map as a full-strength emissive; swap for a properly lit cloth material:
      // per-texel roughness (glossy nylon and boots, satin skin, matte cotton) and a soft fabric sheen.
      model.traverse((o) => {
        o.layers.enable(CHARACTER_LAYER);
        if (!(o instanceof THREE.Mesh)) return;
        if (o instanceof THREE.SkinnedMesh) skinned = o;
        o.castShadow = true;
        o.receiveShadow = true;
        o.frustumCulled = false;
        smoothNormals(o.geometry);
        const map = o.material.map as THREE.Texture;
        map.anisotropy = renderer.capabilities.getMaxAnisotropy();
        // The mesh's UVs are quantized (meshopt), undone by a transform on the colour map; the roughness map is
        // laid out on the same atlas, so it takes the same transform.
        roughnessMap.offset.copy(map.offset);
        roughnessMap.repeat.copy(map.repeat);
        roughnessMap.rotation = map.rotation;
        roughnessMap.center.copy(map.center);
        o.material.dispose();
        o.material = new THREE.MeshPhysicalMaterial({
          map,
          roughnessMap,
          roughness: 1,
          metalness: 0,
          sheen: 0.35,
          sheenRoughness: 0.7,
          sheenColor: new THREE.Color(0xf2efe8),
          envMapIntensity: 0.8,
          side: THREE.DoubleSide,
        });
      });

      // Normalize: stand on the floor, centred, ~1.8 units tall.
      const box = new THREE.Box3().setFromObject(model);
      model.scale.multiplyScalar(1.8 / box.getSize(new THREE.Vector3()).y);
      box.setFromObject(model);
      model.position.x -= (box.min.x + box.max.x) / 2;
      model.position.z -= (box.min.z + box.max.z) / 2;
      model.position.y -= box.min.y;
      stage.add(model);
      const life = new CharacterLife(model);

      let hips: THREE.Object3D | null = null;
      model.traverse((o) => {
        if (!hips && /Hips$/.test(o.name)) hips = o;
      });
      const hipsPos = new THREE.Vector3();

      // He sits against the wall, holding one pose; everything alive about him is procedural (see CharacterLife).
      const mixer = new THREE.AnimationMixer(model);
      const hipsRest = (hips as THREE.Object3D | null)?.position.clone() ?? new THREE.Vector3();
      mixer.clipAction(seatedPose(poseGltf.animations[0], hipsRest)).play();
      stage.position.copy(SEAT);
      mixer.update(0);
      stage.updateMatrixWorld(true);
      // Put the wall right behind him: measure the posed skinned mesh, so his back (not just the bones) rests on it.
      const mesh = skinned as THREE.SkinnedMesh | null;
      if (mesh) {
        mesh.computeBoundingBox();
        wall.position.z = mesh.boundingBox!.clone().applyMatrix4(mesh.matrixWorld).min.z - 0.005;
      }
      // The sofa, pushed back against the wall, with his phone lying out in the open on its left cushion.
      sofa.group.position.z = sofa.size.z / 2 + 0.03;
      wall.updateMatrixWorld(true);
      phone.group.position.copy(sofa.group.localToWorld(new THREE.Vector3(-sofa.size.x * 0.12, sofa.seat + 0.04, sofa.size.z * 0.22)));
      phone.group.rotation.y = -0.3;
      // The props' contact shadow: centred on the row of props, reaching a little in front of the sofa.
      const propShadowCentre = new THREE.Vector3(-0.2, 0, wall.position.z + 1.2);

      // ── being alive ──
      let bubbleTimer = 0;
      // Measured when a line is set, to keep the bubble inside the frame on narrow screens.
      let bubbleWidth = 0;
      let bubbleOn = false;
      const say = (text: string) => {
        const el = bubbleRef.current;
        if (!el) return;
        el.textContent = text;
        bubbleWidth = el.offsetWidth;
        el.classList.add("is-on");
        sound.talk(text);
        bubbleOn = true;
        clearTimeout(bubbleTimer);
        bubbleTimer = window.setTimeout(() => {
          el.classList.remove("is-on");
          bubbleOn = false;
        }, 1400 + text.length * 55);
      };
      let sleepWanted = 0;
      let greetOnWake = false;
      let wokeAt = -Infinity;
      const wake = () => {
        sleepWanted = 0;
        if (life.sleep < 0.5) return;
        wokeAt = performance.now();
        life.flinch(Math.random() < 0.5 ? -1 : 1, 1.3);
        sound.startle();
        say(pick(greetOnWake ? LINES.back : LINES.wake));
        greetOnWake = false;
      };
      wakeHandler = wake;
      awayHandler = (ms) => {
        if (ms < 8000) return;
        // He dozed off while you were away.
        life.sleep = 1;
        sleepWanted = 1;
        greetOnWake = true;
        lastActivity = performance.now() - DOZE_AFTER;
      };
      let pokes = 0;
      let lastPoke = -Infinity;
      // Spheres riding on his bones, for clicking on him.
      const colliderFor = (re: RegExp, radius: number) => {
        let bone: THREE.Object3D | null = null;
        model.traverse((o) => {
          if (!bone && re.test(o.name)) bone = o;
        });
        return bone ? [{ bone: bone as THREE.Object3D, radius }] : [];
      };
      const colliders = [
        ...colliderFor(/Head$/, 0.13),
        ...colliderFor(/Spine2$/, 0.17),
        ...colliderFor(/Spine$/, 0.16),
        ...colliderFor(/Hips$/, 0.16),
        ...colliderFor(/LeftLeg$/, 0.1),
        ...colliderFor(/RightLeg$/, 0.1),
        ...colliderFor(/LeftFoot$/, 0.09),
        ...colliderFor(/RightFoot$/, 0.09),
        ...colliderFor(/LeftForeArm$/, 0.07),
        ...colliderFor(/RightForeArm$/, 0.07),
      ];
      // What's under the pointer: a lamp, the painting (its light), him, or nothing. He's tested against the
      // spheres on his bones: raycasting the skinned mesh means skinning every vertex on the CPU, which at hover
      // rate caused visible hitches.
      const sphere = new THREE.Sphere();
      const hitPoint = new THREE.Vector3();
      const pickHim = (ray: THREE.Ray): THREE.Intersection | undefined => {
        let best: THREE.Intersection | undefined;
        for (const c of colliders) {
          c.bone.getWorldPosition(sphere.center);
          sphere.radius = c.radius;
          if (!ray.intersectSphere(sphere, hitPoint)) continue;
          const distance = hitPoint.distanceTo(ray.origin);
          if (!best || distance < best.distance) best = { distance, point: hitPoint.clone(), object: model };
        }
        return best;
      };
      const pick3d = (e: PointerEvent) => {
        const ray = rayFrom(e);
        const hits: [string, THREE.Intersection | undefined][] = [
          ["lantern", ray.intersectObject(lantern.group, true)[0]],
          ["painting", ray.intersectObject(paintingHang, true)[0]],
          ["pictureLight", ray.intersectObject(pictureLightHit, false)[0]],
          ["plant", ray.intersectObject(plant.group, true)[0]],
        ];
        // The sunset glow on the wall, at night: click it for another gradient.
        if (darkness > 0.5) {
          const centre = glowAim.getWorldPosition(new THREE.Vector3());
          const point = ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 0, 1), -centre.z), new THREE.Vector3());
          if (point && point.distanceTo(centre) < GLOW_RADIUS) hits.push(["glow", { distance: point.distanceTo(ray.ray.origin), point, object: wall }]);
        }
        hits.push(["phone", ray.intersectObject(phone.hitArea, false)[0]]);
        hits.push(["him", pickHim(ray.ray)]);
        let best: { what: string; hit: THREE.Intersection } | null = null;
        for (const [what, hit] of hits) if (hit && (!best || hit.distance < best.hit.distance)) best = { what, hit };
        return best;
      };
      let lastHover = 0;
      hoverHandler = (e) => {
        if (e.timeStamp - lastHover < 90) return;
        lastHover = e.timeStamp;
        mount.style.cursor = pick3d(e) ? "pointer" : "grab";
      };
      const openChat = () => {
        phone.markSeen();
        const p = phone.group.getWorldPosition(new THREE.Vector3()).project(camera);
        const r = renderer.domElement.getBoundingClientRect();
        setChatOrigin({ x: r.left + ((p.x + 1) / 2) * r.width, y: r.top + ((1 - p.y) / 2) * r.height });
        returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        setChatOpen(true);
        chatOpenRef.current = true;
        sound.click(true);
      };
      openChatRef.current = openChat;
      // Until someone picks it up, the phone buzzes now and then.
      let nextBuzz = Infinity;
      let buzzes = 0;
      // A nudge: he looks over at the buzzing phone for a moment, even if you're pointing somewhere else.
      let nudgeUntil = 0;
      // Someone's messing with his stuff: he comments if he's sitting there awake to see it.
      const remark = (lines: string[], delay = 500, chance = 1) => {
        if (Math.random() > chance) return;
        if (life.sleep > 0.4) return wake();
        setTimeout(() => say(pick(lines)), delay);
      };
      const toggleLamp = (which: "lantern" | "picture") => {
        const on = (which === "lantern" ? lanternLevel : pictureLevel) < 0.5;
        lampOverride[which] = on;
        sound.click(on);
        // Paper lanterns take a moment to catch: the bulb stutters on.
        if (which === "lantern" && on) flickerUntil = performance.now() + 450;
        const dark = autoLamps > 0.5 && !on && (which === "lantern" ? pictureLevel : lanternLevel) < 0.5;
        if (dark) remark(LINES.lampOff, 600, 0.6);
      };
      // Pushing the lantern rocks it away from you; `strength` in rad/s.
      const knockLantern = (dir: THREE.Vector3, strength: number) => {
        lanternTilt.x.kick(dir.z * strength);
        lanternTilt.z.kick(-dir.x * strength);
      };
      const screenOf = (o: THREE.Object3D) => {
        const p = o.getWorldPosition(new THREE.Vector3()).project(camera);
        const r = renderer.domElement.getBoundingClientRect();
        return { x: r.left + ((p.x + 1) / 2) * r.width, y: r.top + ((1 - p.y) / 2) * r.height };
      };
      const openPainting = () => {
        setPaintingOrigin(screenOf(painting));
        returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        setPaintingOpen(true);
        paintingOpenRef.current = true;
      };
      openPaintingRef.current = openPainting;
      pokeHandler = (e) => {
        const found = pick3d(e);
        if (!found) return;
        if (found.what === "phone") return openChat();
        if (found.what === "glow") {
          const glow = sunsetGlow.next();
          sound.click(true);
          try {
            localStorage.setItem("studio-glow", glow);
          } catch {}
          return;
        }
        if (found.what === "lantern") {
          knockLantern(rayFrom(e).ray.direction.clone().setY(0).normalize(), 0.35);
          return toggleLamp("lantern");
        }
        if (found.what === "pictureLight") return toggleLamp("picture");
        if (found.what === "painting") {
          return openPainting();
        }
        if (found.what === "plant") {
          plant.sway.kick((Math.random() < 0.5 ? -1 : 1) * 2.5);
          sound.paper(3);
          return;
        }
        const hit = found.hit;
        sound.poke();
        if (life.sleep > 0.4) return wake();
        const now = performance.now();
        pokes = now - lastPoke < 4000 ? pokes + 1 : 1;
        lastPoke = now;
        const head = life.headPosition(new THREE.Vector3());
        life.flinch(Math.sign(hit.point.x - head.x) || 1, pokes === 1 ? 0.8 : 1.1);
        say(pick(pokes === 1 ? LINES.poke1 : pokes === 2 ? LINES.poke2 : LINES.poke3));
        if (pokes >= 3) pokes = 0;
      };
      let lastZ = 0;
      // Things he glances at when nobody's pointing anywhere: you (the camera), the painting, the flag.
      const glanceTarget = new THREE.Vector3();
      let glanceUntil = 0;
      const pickGlance = () => {
        const r = Math.random();
        if (r < 0.4) glanceTarget.copy(camera.position);
        else if (r < 0.55) phone.group.getWorldPosition(glanceTarget);
        else if (r < 0.75) painting.getWorldPosition(glanceTarget);
        else flag.group.getWorldPosition(glanceTarget).y -= 0.5;
        glanceUntil = performance.now() + 2200 + Math.random() * 3200;
      };
      const lookAt = new THREE.Vector3();
      const headPos = new THREE.Vector3();
      const anchor = new THREE.Vector3();
      const placeBubbles = () => {
        life.headPosition(anchor);
        anchor.y += 0.3;
        anchor.x += 0.12;
        anchor.project(camera);
        const x = ((anchor.x + 1) / 2) * mount.clientWidth;
        const y = ((1 - anchor.y) / 2) * mount.clientHeight;
        const t = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
        // The bubble sits 8px right of the anchor; slide it back in if it would run off the right edge.
        const bx = Math.max(0, Math.min(x, mount.clientWidth - bubbleWidth - 20));
        if (bubbleRef.current) bubbleRef.current.style.transform = `translate(${bx.toFixed(1)}px, ${y.toFixed(1)}px)`;
        if (zzzRef.current) zzzRef.current.style.transform = t;
      };
      const spawnZ = () => {
        const box = zzzRef.current;
        if (!box) return;
        const z = document.createElement("span");
        z.textContent = "z";
        z.style.fontSize = `${12 + Math.random() * 7}px`;
        z.style.setProperty("--drift", `${10 + Math.random() * 22}px`);
        z.addEventListener("animationend", () => z.remove());
        box.appendChild(z);
      };

      // The dive opens with the character far above the frame and falls into view within ~0.5s.
      // Compile shaders and upload textures before the clock starts, otherwise that first-frame
      // stall is fed to the mixer as one big step and the fall is skipped.
      // The contact shadows render this scene through cameras on other layers. Lights on layer 0 alone would drop
      // out of those renders, which changes the lighting setup twice a frame and makes three re-derive every lit
      // material's program each frame. The depth-only passes ignore them anyway.
      scene.traverse((o) => {
        if (o instanceof THREE.Light) o.layers.enableAll();
      });
      // Compiles `root`'s programs for both sets of lights (lamps on and off), in parallel, so switching modes or
      // lamps never waits on a compile. three builds a program for the render target bound at the time, so bind the
      // composer's (HDR, not yet tone mapped): against the screen, every program would be the wrong variant and the
      // real ones would compile, synchronously, on first use.
      const precompile = (root: THREE.Object3D) => {
        const on = nightLights;
        renderer.setRenderTarget(composer.readBuffer);
        setNightLights(!on);
        const other = renderer.compileAsync(root, camera, scene);
        setNightLights(on);
        const current = renderer.compileAsync(root, camera, scene);
        renderer.setRenderTarget(null);
        return Promise.all([current, other]);
      };
      setNightLights(darkness > 0);
      await precompile(scene);
      if (disposed) return;
      // The first frame, drawn in full before the canvas shows, so every pass has compiled and uploaded by then
      // (the contact shadows' depth and blur shaders aren't covered by `precompile`).
      gobo.update(0, renderer);
      if (hips) (hips as THREE.Object3D).getWorldPosition(hipsPos);
      contact.render(renderer, scene, CHARACTER_LAYER, hipsPos);
      propShadow.render(renderer, scene, PROPS_LAYER, propShadowCentre);
      propShadowDirty = false;
      renderer.shadowMap.needsUpdate = true;
      // Start the fade from exactly the colour the page shows behind the canvas.
      const behind = getComputedStyle(mount).backgroundColor.match(/[\d.]+/g)?.map(Number) ?? [244, 243, 240];
      (finish.uniforms.page.value as THREE.Color).setRGB(behind[0] / 255, behind[1] / 255, behind[2] / 255, THREE.NoColorSpace);
      finish.uniforms.reveal.value = 0;
      composer.render(0);
      setReady(true);
      lastActivity = performance.now();
      // A first buzz from his phone shortly after you arrive.
      nextBuzz = lastActivity + 3500;
      // The full-quality sofa, fetched now and swapped in once he's sitting still.
      // Only where its 4K textures can show: a phone-sized frame never samples past the light model's 2K ones,
      // and it's 5 MB that a data saver shouldn't pay for.
      let swapSofa: (() => boolean) | null = null;
      const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
      if (mount.clientWidth * pixelRatio >= 1600 && !saveData) {
        // After the studio has faded in, so its decode and uploads don't compete with the first frames.
        setTimeout(() => {
          if (disposed) return;
          sofa
            .fetchFull(loader, aniso, renderer, camera, scene, precompile, composer.readBuffer)
            .then((swap) => (swapSofa = swap))
            .catch(() => {});
        }, 1200);
      }

      // Resolution: the screen's own density (up to 2x), lowered only on sustained slowness (see
      // AdaptiveResolution). The first seconds (shader and texture warm-up) aren't counted.
      const resolution = new AdaptiveResolution(pixelRatio, pixelRatio);
      let sceneTime = 0;
      const setRatio = (r: number) => {
        pixelRatio = r;
        renderer.setPixelRatio(r);
        sizeComposer();
      };

      const clock = (timer = new THREE.Timer());
      clock.connect(document);
      renderer.setAnimationLoop(() => {
        clock.update();
        // Scrolled past the studio, or covered by the chat: keep the clock ticking but don't spend the GPU on it.
        if (!onScreen || chatOpenRef.current || paintingOpenRef.current) {
          clock.getDelta();
          return;
        }
        collectPageTone();
        // Clamp so a dropped frame or GC pause slows the animation instead of skipping it.
        const rawDt = Math.max(clock.getDelta(), 0);
        const dt = Math.min(rawDt, 1 / 30);
        sceneTime += dt;
        const now = performance.now();
        if (sceneTime > 3) {
          const ratio = resolution.frame(rawDt * 1000);
          if (ratio !== null) setRatio(ratio);
        }
        // One strip of its textures a frame, then the swap.
        if (swapSofa && swapSofa()) {
          swapSofa = null;
          sofa.group.traverse((o) => o.layers.enable(PROPS_LAYER));
          propShadowDirty = true;
        }

        // Procedural life on the held pose: looking at you, breathing, dozing, flinching. (No mixer update: the
        // pose never changes, and `restore` puts back the bones life moved last frame.)
        life.restore();
        model.updateMatrixWorld(true);
        if (flag.dragging) flag.group.getWorldPosition(lookAt).y -= 0.4;
        else if (now < nudgeUntil) phone.group.getWorldPosition(lookAt);
        else if (now - pointerSeen < 4000) {
          // A point out in front of him, under the cursor.
          raycaster.setFromCamera(pointer, camera);
          const ray = raycaster.ray;
          life.headPosition(headPos);
          const t = (headPos.z + 2.2 - ray.origin.z) / ray.direction.z;
          lookAt.copy(ray.direction).multiplyScalar(Math.max(t, 0.5)).add(ray.origin);
        } else {
          if (now > glanceUntil) pickGlance();
          lookAt.copy(glanceTarget);
        }
        if (now - lastActivity > DOZE_AFTER && now - wokeAt > 4000) sleepWanted = 1;
        life.apply(dt, { lookAt, gaze: 1, sleep: sleepWanted, breathe: 1 });
        sound.update({ rustle: flag.motion, sleep: life.sleep, inhale: life.inhale, night: darkness });
        if (life.sleep > 0.8 && now - lastZ > 1500) {
          lastZ = now;
          spawnZ();
        }
        if (bubbleOn || life.sleep > 0.05) placeBubbles();

        if (!dragging && spin !== 0) {
          azimuth = THREE.MathUtils.clamp(azimuth + spin * dt, BASE_AZIMUTH - MAX_AZIMUTH, BASE_AZIMUTH + MAX_AZIMUTH);
          spin *= Math.exp(-SPIN_DAMPING * dt);
          if (Math.abs(spin) < 0.01) spin = 0;
        }
        placeCamera();
        flag.update(dt);
        lanternTilt.x.update(dt);
        lanternTilt.z.update(dt);
        lantern.group.rotation.set(lanternTilt.x.value, 0, lanternTilt.z.value);
        if (lanternTilt.x.moving || lanternTilt.z.moving) propShadowDirty = true;
        lanternFlicker = now < flickerUntil ? 0.25 + 0.75 * Math.round(Math.random()) : 1;
        plant.update(dt);
        phone.update(dt, now);
        if (now > nextBuzz && !chatOpenRef.current) {
          nextBuzz = now + 12000 + Math.random() * 6000;
          if (phone.buzz()) {
            sound.buzz();
            // He glances over at it every time, and points it out the first time and every third after that.
            if (life.sleep < 0.4) {
              nudgeUntil = now + 2600;
              if (buzzes % 3 === 0) setTimeout(() => say(pick(LINES.phone)), 1100);
            }
            buzzes++;
          } else nextBuzz = Infinity;
        }
        // Fade toward the chosen mode over about a second and a half.
        const wantDark = mode === "dark" ? 1 : 0;
        if (Math.abs(wantDark - darkness) > 0.001) {
          darkness += (wantDark - darkness) * (1 - Math.exp(-dt * 3));
          if (Math.abs(wantDark - darkness) <= 0.001) darkness = wantDark;
          daylightDirty = true;
          if (darkness > 0.5 !== darkSide) {
            darkSide = darkness > 0.5;
            document.documentElement.dataset.tone = darkSide ? "dark" : "light";
          }
        }
        gobo.update(sceneTime, renderer);
        // The light is changing (a mode fade, a lamp easing on or off): the floor's colour with it.
        let lightChanging = daylightDirty;
        if (daylightDirty) {
          daylightDirty = false;
          applyDaylight(lightingAt(darkness));
        }
        if (easeLamps(dt)) lightChanging = true;
        if (lightChanging) retoneWanted = true;
        setNightLights(lanternLevel > 0.001 || pictureLevel > 0.001 || sunsetGlow.spot.intensity > 0.001);
        // Re-match the page once the light has settled: every change to the page's colour restyles and repaints the
        // whole document, which dropped frames when it ran several times a second through a fade.
        // Not while the studio is still fading in from the page's colour: that's what the read would see.
        const retone = retoneWanted && !lightChanging && sceneTime > 1;
        if (hips) (hips as THREE.Object3D).getWorldPosition(hipsPos);
        contact.render(renderer, scene, CHARACTER_LAYER, hipsPos);
        if (propShadowDirty) {
          propShadowDirty = false;
          propShadow.render(renderer, scene, PROPS_LAYER, propShadowCentre);
        }
        renderer.shadowMap.needsUpdate = true;
        // The sunset lamp's shadow map only carries its projection: don't redraw it while the lamp is off (once
        // it exists; a light skipped before its first shadow render has no map to sample, and draws fail).
        const glowShadow = sunsetGlow.spot.shadow;
        glowShadow.autoUpdate = sunsetGlow.spot.intensity > 0 || glowShadow.map === null;
        finish.uniforms.time.value = sceneTime;
        // Fade in over ~0.9 s, eased.
        finish.uniforms.reveal.value = THREE.MathUtils.smoothstep(sceneTime, 0, 0.9);
        composer.render(dt);
        if (retone && requestPageTone()) retoneWanted = false;
      });
    })();

    return () => {
      disposed = true;
      removeEventListener("resize", onResize);
      visibility.disconnect();
      removeEventListener("pointermove", onWindowPointer);
      removeEventListener("pointerdown", onWindowPointer);
      removeEventListener("keydown", onActivity);
      removeEventListener("wheel", onActivity);
      removeEventListener("scroll", onActivity);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      document.title = baseTitle;
      removeEventListener("pointerdown", onFirstGesture);
      removeEventListener("keydown", onFirstGesture);
      sound.dispose();
      sunsetGlow.dispose();
      phone.dispose();
      mount.removeEventListener("pointerdown", onPointerDown);
      mount.removeEventListener("pointermove", onPointerMove);
      mount.removeEventListener("pointerup", onPointerUp);
      mount.removeEventListener("pointercancel", onPointerUp);
      renderer.setAnimationLoop(null);
      if (toneFence) gl.deleteSync(toneFence);
      gl.deleteBuffer(toneBuffer);
      timer?.dispose();
      flag.dispose();
      contact.dispose();
      propShadow.dispose();
      gobo.dispose();
      composer.dispose();
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose();
          disposeMaterial(o.material);
        }
      });
      envMap.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  // Rendered inside the page's .stage section (see StageLoader), under the intro copy.
  return (
    <>
      <div
        ref={mountRef}
        style={{
          position: "absolute",
          inset: 0,
          background: "var(--studio)",
          cursor: "grab",
          // Vertical swipes scroll the page; horizontal drags turn the camera.
          touchAction: "pan-y",
          // Always visible: until the studio is ready the canvas is either blank (showing this background) or drawn
          // as exactly this colour, and the finish pass fades the studio in from it. (Switching the element from
          // hidden to shown instead set up its compositor layer in the middle of the fade: a dropped frame or two.)
        }}
      />
      <div ref={bubbleRef} className="speech" aria-live="polite" />
      {/* Hidden until tabbed to: the keyboard's way into what a pointer clicks in the scene. */}
      {ready ? (
        <div className="stage-keys">
          <button type="button" onClick={() => openChatRef.current?.()}>
            text me from my phone
          </button>
          <button type="button" onClick={() => openPaintingRef.current?.()}>
            look at the painting
          </button>
        </div>
      ) : null}
      <PaintingView open={paintingOpen} origin={paintingOrigin} onClose={closePainting} />
      <PhoneChat open={chatOpen} origin={chatOrigin} onClose={closeChat} />
      <div ref={zzzRef} className="zzz" aria-hidden />
      <button
        type="button"
        className="stage-sound"
        data-cuelume-toggle
        aria-pressed={soundOn}
        onClick={() => soundToggleRef.current?.()}
        style={{ opacity: ready ? 1 : 0, pointerEvents: ready ? "auto" : "none" }}
      >
        {soundOn ? "sound on" : "sound off"}
      </button>
      <button
        type="button"
        className="stage-mode"
        data-cuelume-toggle
        aria-label={mode === "dark" ? "switch to light mode" : "switch to dark mode"}
        onClick={() => toggleModeRef.current?.()}
        style={{ opacity: ready ? 1 : 0, pointerEvents: ready ? "auto" : "none" }}
      >
        <span data-on={mode === "light" ? "" : undefined}>light</span> · <span data-on={mode === "dark" ? "" : undefined}>dark</span>
      </button>
    </>
  );
}
