import * as THREE from "three";

// Procedural life layered on top of whatever the animation mixer produced this frame: breathing, looking at
// things, nodding off, and flinching when poked. Every effect is a small world-space rotation of a spine or
// head bone, applied after `mixer.update`. The mixer only writes a bone when its animated value changes, so
// while a pose is held it would leave our offsets in place and they'd pile up: `restore()` puts the bones back
// to the clip's pose before each mixer update.

const WORLD_X = new THREE.Vector3(1, 0, 0);
const WORLD_Y = new THREE.Vector3(0, 1, 0);
const WORLD_Z = new THREE.Vector3(0, 0, 1);
const IDENTITY = new THREE.Quaternion();

const _parent = new THREE.Quaternion();
const _local = new THREE.Quaternion();
const _turn = new THREE.Quaternion();
const _head = new THREE.Quaternion();
const _full = new THREE.Quaternion();
const _from = new THREE.Vector3();
const _to = new THREE.Vector3();
const _pos = new THREE.Vector3();

// Rotate a bone by a world-space rotation about its own pivot, then refresh it and its children.
function rotateWorld(bone: THREE.Object3D, turn: THREE.Quaternion) {
  bone.parent!.getWorldQuaternion(_parent);
  _local.copy(_parent).invert().multiply(turn).multiply(_parent);
  bone.quaternion.premultiply(_local);
  bone.updateMatrixWorld(true);
}

function rotateAxis(bone: THREE.Object3D, axis: THREE.Vector3, angle: number) {
  if (Math.abs(angle) < 1e-5) return;
  rotateWorld(bone, _turn.setFromAxisAngle(axis, angle));
}

const find = (root: THREE.Object3D, re: RegExp) => {
  let hit: THREE.Object3D | null = null;
  root.traverse((o) => {
    if (!hit && re.test(o.name)) hit = o;
  });
  return hit as THREE.Object3D | null;
};

export class CharacterLife {
  /** Current share of the pose given to looking at `lookAt` (eased toward the requested amount). */
  gaze = 0;
  /** 0 awake, 1 fast asleep. */
  sleep = 0;

  private spine1: THREE.Object3D;
  private spine2: THREE.Object3D;
  private neck: THREE.Object3D;
  private head: THREE.Object3D;
  private bones: THREE.Object3D[];
  private base: THREE.Quaternion[];
  // The face's forward direction in the head bone's own frame, measured in the bind pose (facing +z).
  private faceLocal = new THREE.Vector3();
  private look = new THREE.Vector3();
  private lookReady = false;
  private breath = 0;
  // A damped spring for flinches: offset, velocity, and which way to recoil.
  private jolt = 0;
  private joltVel = 0;
  private joltSide = 1;

  constructor(model: THREE.Object3D) {
    const need = (re: RegExp) => {
      const bone = find(model, re);
      if (!bone) throw new Error(`rig is missing ${re}`);
      return bone;
    };
    this.spine1 = need(/Spine1$/);
    this.spine2 = need(/Spine2$/);
    this.neck = need(/Neck$/);
    this.head = need(/Head$/);
    this.bones = [this.spine1, this.spine2, this.neck, this.head];
    this.base = this.bones.map((b) => b.quaternion.clone());
    model.updateMatrixWorld(true);
    this.head.getWorldQuaternion(_head);
    this.faceLocal.copy(WORLD_Z).applyQuaternion(_head.invert());
  }

  /** Call before `mixer.update`: undo last frame's offsets. */
  restore() {
    this.bones.forEach((b, i) => b.quaternion.copy(this.base[i]));
  }

  /** -1..1 through each breath (1 = full inhale). */
  get inhale() {
    return Math.sin(this.breath);
  }

  headPosition(out: THREE.Vector3) {
    return this.head.getWorldPosition(out);
  }

  /** Recoil away from `side` (-1 poked from his left, +1 from his right). */
  flinch(side: number, strength = 1) {
    this.joltSide = side >= 0 ? 1 : -1;
    this.joltVel += 9 * strength;
  }

  apply(
    dt: number,
    opts: {
      lookAt: THREE.Vector3;
      /** How much he should be looking (0-1); sleep overrides it. */
      gaze: number;
      /** 1 to doze off, 0 to be awake. */
      sleep: number;
      /** Breathing amount: full while seated still, off while a clip is doing the moving. */
      breathe: number;
    },
  ) {
    // Remember the clip's pose for `restore()`.
    this.bones.forEach((b, i) => this.base[i].copy(b.quaternion));

    // Nodding off is slow; waking up is a start.
    const sleepRate = opts.sleep > this.sleep ? 0.45 : 5;
    this.sleep += (opts.sleep - this.sleep) * (1 - Math.exp(-dt * sleepRate));
    const sleepy = THREE.MathUtils.smoothstep(this.sleep, 0, 1);
    this.gaze += (opts.gaze * (1 - sleepy) - this.gaze) * (1 - Math.exp(-dt * 3));

    // Eyes lead, the head follows a beat behind.
    if (!this.lookReady) {
      this.look.copy(opts.lookAt);
      this.lookReady = true;
    }
    this.look.lerp(opts.lookAt, 1 - Math.exp(-dt * 5));

    // Breathing: the chest rises and settles; deeper and slower when asleep.
    this.breath += (dt * Math.PI * 2) / THREE.MathUtils.lerp(4.2, 6.2, sleepy);
    const inhale = Math.sin(this.breath) * opts.breathe;
    rotateAxis(this.spine1, WORLD_X, -0.018 * inhale * (1 + 0.6 * sleepy));
    rotateAxis(this.spine2, WORLD_X, -0.01 * inhale);

    // Asleep: chin drops to the chest and the head lolls to one side, bobbing with each breath.
    if (sleepy > 0.001) {
      rotateAxis(this.neck, WORLD_X, (0.34 + 0.025 * inhale) * sleepy);
      rotateAxis(this.head, WORLD_X, 0.14 * sleepy);
      rotateAxis(this.head, WORLD_Z, 0.2 * sleepy);
    }

    if (this.gaze > 0.001) {
      // Spread the turn down the spine so it reads as the body following the eyes, not a swivelling head.
      this.aim(this.spine2, 0.18);
      this.aim(this.neck, 0.4);
      this.aim(this.head, 1);
    }

    this.joltVel += (-90 * this.jolt - 11 * this.joltVel) * dt;
    this.jolt += this.joltVel * dt;
    if (Math.abs(this.jolt) > 1e-4 || Math.abs(this.joltVel) > 1e-3) {
      rotateAxis(this.spine2, WORLD_Y, this.joltSide * 0.16 * this.jolt);
      rotateAxis(this.spine2, WORLD_X, -0.08 * this.jolt);
      rotateAxis(this.head, WORLD_Y, this.joltSide * 0.22 * this.jolt);
      rotateAxis(this.head, WORLD_X, -0.12 * this.jolt);
    }
  }

  // Turn `bone` a fraction of the way toward pointing the face at the look target (never more than ~65°).
  private aim(bone: THREE.Object3D, share: number) {
    this.head.getWorldQuaternion(_head);
    _from.copy(this.faceLocal).applyQuaternion(_head);
    _to.copy(this.look).sub(this.head.getWorldPosition(_pos)).normalize();
    const angle = _from.angleTo(_to);
    if (angle < 1e-4) return;
    const limit = angle > 1.15 ? 1.15 / angle : 1;
    _full.setFromUnitVectors(_from, _to);
    _turn.slerpQuaternions(IDENTITY, _full, share * this.gaze * limit);
    rotateWorld(bone, _turn);
  }
}
