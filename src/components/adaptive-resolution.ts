// Render resolution that only gives way to sustained slowness. The screen's own density is the target; a frame
// interval is noisy (a GC pause, a busy tab, a texture upload), so decisions are made on the median of one-second
// windows against the display's refresh interval, and every change reallocates the render targets (a visible
// hitch of its own), so changes are rare: two slow windows in a row to step down, five good ones to step back
// up, and after three reversals it settles on the lower setting for good.

const WINDOW = 60;
const STEP = 0.25;

export class AdaptiveResolution {
  private samples: number[] = [];
  // The display's refresh interval: the fastest a frame can come round (8.3 ms at 120 Hz, 16.7 at 60).
  private vsync = Infinity;
  private slow = 0;
  private fast = 0;
  private lastDirection = 0;
  private reversals = 0;
  private skipWindows = 0;

  constructor(
    public ratio: number,
    private readonly max: number,
    private readonly min = 1,
  ) {}

  /** Feed the interval (ms) of each rendered frame; returns the ratio to switch to, or null to stay. */
  frame(ms: number): number | null {
    // Tab switches and the like say nothing about rendering cost.
    if (!(ms > 0 && ms < 250)) return null;
    this.samples.push(ms);
    if (this.samples.length < WINDOW) return null;
    const sorted = this.samples.sort((a, b) => a - b);
    const median = sorted[WINDOW >> 1];
    this.vsync = Math.min(this.vsync, Math.max(sorted[Math.floor(WINDOW * 0.1)], 4));
    this.samples = [];
    // The window after a change includes the reallocation.
    if (this.skipWindows > 0) {
      this.skipWindows--;
      return null;
    }
    this.slow = median > this.vsync * 1.4 ? this.slow + 1 : 0;
    this.fast = median < this.vsync * 1.12 ? this.fast + 1 : 0;
    if (this.slow >= 2 && this.ratio > this.min) return this.change(-1);
    if (this.fast >= 5 && this.ratio < this.max && this.reversals < 3) return this.change(1);
    return null;
  }

  private change(direction: 1 | -1) {
    if (this.lastDirection && direction !== this.lastDirection) this.reversals++;
    this.lastDirection = direction;
    this.slow = 0;
    this.fast = 0;
    this.skipWindows = 1;
    this.ratio = Math.min(this.max, Math.max(this.min, this.ratio + direction * STEP));
    return this.ratio;
  }
}
