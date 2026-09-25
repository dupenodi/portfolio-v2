import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

// His phone, lying face up on the sofa. The lock screen glows with the time and an unread message, and a soft
// pool of screen light pulses around it; now and then it buzzes (a little shuffle, the glow flaring) until
// someone picks it up.

const W = 0.074;
const H = 0.156;
const T = 0.008;

export class PhoneProp {
  group = new THREE.Group();
  /** A generous invisible box around it: the phone itself is a tiny click target at this distance. */
  hitArea: THREE.Mesh;
  private screen: THREE.MeshStandardMaterial;
  private canvas = document.createElement("canvas");
  private texture: THREE.CanvasTexture;
  private body: THREE.Group;
  private buzzT = -1;
  private t = 0;
  // The unread glow's pulse, and its flare with each buzz (eased down afterwards).
  private halo: THREE.MeshBasicMaterial;
  private haloMesh: THREE.Mesh;
  private flare = 0;
  private lastMinute = 0;
  private seen = false;

  constructor() {
    this.body = new THREE.Group();
    this.group.add(this.body);
    const frame = new THREE.Mesh(
      new RoundedBoxGeometry(W, T, H, 4, 0.009),
      new THREE.MeshStandardMaterial({ color: 0x2b2b2e, roughness: 0.35, metalness: 0.6 }),
    );
    frame.position.y = T / 2;
    frame.castShadow = true;
    frame.receiveShadow = true;
    this.body.add(frame);

    this.canvas.width = 296;
    this.canvas.height = 624;
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.anisotropy = 8;
    this.screen = new THREE.MeshStandardMaterial({
      color: 0x000000,
      roughness: 0.15,
      metalness: 0,
      emissive: 0xffffff,
      emissiveMap: this.texture,
      emissiveIntensity: 0.9,
    });
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.006, H - 0.006), this.screen);
    glass.rotation.x = -Math.PI / 2;
    glass.position.y = T + 0.0003;
    this.body.add(glass);

    // Screen light spilling onto the cushion: a radial fade, added over whatever it lies on.
    const glow = document.createElement("canvas");
    glow.width = glow.height = 128;
    const gg = glow.getContext("2d")!;
    const fade = gg.createRadialGradient(64, 64, 0, 64, 64, 64);
    fade.addColorStop(0, "rgba(255,255,255,1)");
    fade.addColorStop(0.35, "rgba(255,255,255,0.45)");
    fade.addColorStop(1, "rgba(255,255,255,0)");
    gg.fillStyle = fade;
    gg.fillRect(0, 0, 128, 128);
    this.halo = new THREE.MeshBasicMaterial({
      map: new THREE.CanvasTexture(glow),
      color: 0x9db8ff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    });
    this.haloMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.56), this.halo);
    this.haloMesh.rotation.x = -Math.PI / 2;
    this.haloMesh.position.y = 0.006;
    this.haloMesh.renderOrder = 1;
    this.group.add(this.haloMesh);

    this.hitArea = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.08, 0.28),
      new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false }),
    );
    this.hitArea.position.y = 0.04;
    this.group.add(this.hitArea);

    this.draw(new Date());
  }

  /** Clock text in Bengaluru, like the rest of the page. */
  private draw(now: Date) {
    const time = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "2-digit", hourCycle: "h12" })
      .format(now)
      .replace(/\s?[ap]m$/i, "");
    const date = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", weekday: "long", day: "numeric", month: "long" }).format(now);
    const c = this.canvas;
    const g = c.getContext("2d")!;
    const w = c.width;
    const h = c.height;
    // Wallpaper: a deep dusk gradient.
    const bg = g.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, "#1b2340");
    bg.addColorStop(0.55, "#3b2f55");
    bg.addColorStop(1, "#6a3f4f");
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
    g.fillStyle = "rgba(255,255,255,0.92)";
    g.textAlign = "center";
    g.font = "500 20px system-ui, -apple-system, sans-serif";
    g.fillText(date, w / 2, 96);
    g.font = "600 92px system-ui, -apple-system, sans-serif";
    g.fillText(time, w / 2, 190);
    // Notification card.
    if (!this.seen) {
      const x = 16;
      const y = 250;
      const cw = w - 32;
      const ch = 92;
      g.fillStyle = "rgba(255,255,255,0.18)";
      g.beginPath();
      g.roundRect(x, y, cw, ch, 22);
      g.fill();
      g.fillStyle = "#34c759";
      g.beginPath();
      g.roundRect(x + 14, y + 16, 34, 34, 9);
      g.fill();
      g.fillStyle = "#fff";
      g.textAlign = "left";
      g.font = "600 18px system-ui, -apple-system, sans-serif";
      g.fillText("sharath", x + 60, y + 32);
      g.font = "400 16px system-ui, -apple-system, sans-serif";
      g.fillStyle = "rgba(255,255,255,0.85)";
      g.fillText("hey! tap to ask me anything", x + 60, y + 56);
      g.fillStyle = "rgba(255,255,255,0.55)";
      g.textAlign = "right";
      g.font = "400 14px system-ui, -apple-system, sans-serif";
      g.fillText("now", x + cw - 14, y + 32);
    }
    // Home indicator.
    g.fillStyle = "rgba(255,255,255,0.8)";
    g.beginPath();
    g.roundRect(w / 2 - 50, h - 22, 100, 6, 3);
    g.fill();
    this.texture.needsUpdate = true;
  }

  /** Once opened, the notification is cleared and it stops buzzing. */
  markSeen() {
    if (this.seen) return;
    this.seen = true;
    this.draw(new Date());
  }

  /** Starts a buzz; returns false if it's already been seen. */
  buzz() {
    if (this.seen) return false;
    this.buzzT = 0;
    this.flare = 1;
    return true;
  }

  /** `now`: performance.now(); the lock screen only redraws when the minute changes. */
  update(dt: number, now: number) {
    this.t += dt;
    // Unread: a slow breathing glow, flaring with each buzz. Read: it fades out for good.
    this.flare = Math.max(0, this.flare - dt * 0.8);
    const pulse = this.seen ? 0 : 0.3 + 0.18 * Math.sin(this.t * 2.4) + 0.6 * this.flare;
    this.halo.opacity += (pulse - this.halo.opacity) * (1 - Math.exp(-dt * 8));
    this.haloMesh.visible = this.halo.opacity > 0.005;
    // The screen brightens with the glow while it's unread.
    if (this.buzzT < 0) this.screen.emissiveIntensity = 0.9 + (this.seen ? 0 : 0.35 * this.halo.opacity);
    const minute = Math.floor((performance.timeOrigin + now) / 60000);
    if (minute !== this.lastMinute) {
      this.lastMinute = minute;
      this.draw(new Date());
    }
    // Buzz: two short rattles, the screen brightening with them.
    if (this.buzzT >= 0) {
      this.buzzT += dt;
      const t = this.buzzT;
      const on = (t < 0.35 || (t > 0.55 && t < 0.9)) as boolean;
      this.body.position.x = on ? (Math.random() - 0.5) * 0.003 : 0;
      this.body.rotation.y = on ? (Math.random() - 0.5) * 0.04 : 0;
      this.screen.emissiveIntensity = on ? 1.25 : 0.9;
      if (t > 1) {
        this.buzzT = -1;
        this.body.position.x = 0;
        this.body.rotation.y = 0;
        this.screen.emissiveIntensity = 0.9;
      }
    }
  }

  dispose() {
    this.texture.dispose();
    this.halo.map?.dispose();
  }
}
