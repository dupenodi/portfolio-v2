// Every sound in the studio is synthesized on the fly with Web Audio: no files to load. On by default
// (browsers still only allow audio after a gesture), and kept quiet: it should sound like a room, not a game.

type Ctx = AudioContext;

function noiseBuffer(ctx: Ctx, seconds: number, pink = false) {
  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  // Paul Kellet's economy pink filter: a softer, less hissy noise for room tone.
  let b0 = 0;
  let b1 = 0;
  let b2 = 0;
  for (let i = 0; i < data.length; i++) {
    const white = Math.random() * 2 - 1;
    if (!pink) {
      data[i] = white;
      continue;
    }
    b0 = 0.99765 * b0 + white * 0.099046;
    b1 = 0.963 * b1 + white * 0.2965164;
    b2 = 0.57 * b2 + white * 1.0526913;
    data[i] = (b0 + b1 + b2 + white * 0.1848) * 0.2;
  }
  return buffer;
}

export class StudioSound {
  enabled = false;
  private ctx: Ctx | null = null;
  private master!: GainNode;
  private noise!: AudioBuffer;
  private roomGain!: GainNode;
  private rustleGain!: GainNode;
  private snoreGain!: GainNode;
  private snoreFilter!: BiquadFilterNode;
  private night = 0;
  private nextCricket = 0;
  private nextBird = 0;

  /** Must be called from a user gesture the first time. */
  async enable() {
    if (!this.ctx) this.build();
    await this.ctx!.resume();
    this.enabled = true;
    this.master.gain.setTargetAtTime(0.9, this.ctx!.currentTime, 0.4);
  }

  disable() {
    this.enabled = false;
    if (!this.ctx) return;
    this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.15);
  }

  dispose() {
    this.ctx?.close();
    this.ctx = null;
  }

  private build() {
    const ctx = new AudioContext();
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = 0;
    // A touch of room: a short feedback delay gives the white studio its slightly live sound.
    const room = ctx.createDelay(0.2);
    room.delayTime.value = 0.045;
    const roomFb = ctx.createGain();
    roomFb.gain.value = 0.28;
    const roomLp = ctx.createBiquadFilter();
    roomLp.type = "lowpass";
    roomLp.frequency.value = 2400;
    this.master.connect(ctx.destination);
    this.master.connect(room);
    room.connect(roomLp).connect(roomFb).connect(room);
    const wet = ctx.createGain();
    wet.gain.value = 0.35;
    roomLp.connect(wet).connect(ctx.destination);

    this.noise = noiseBuffer(ctx, 2);

    // Room tone: low pink noise, a little like air handling in a quiet building.
    const tone = ctx.createBufferSource();
    tone.buffer = noiseBuffer(ctx, 4, true);
    tone.loop = true;
    const toneLp = ctx.createBiquadFilter();
    toneLp.type = "lowpass";
    toneLp.frequency.value = 380;
    this.roomGain = ctx.createGain();
    this.roomGain.gain.value = 0.05;
    tone.connect(toneLp).connect(this.roomGain).connect(this.master);
    tone.start();

    // Cloth rustle: band-passed noise, opened up by how fast the flag is moving.
    const rustle = ctx.createBufferSource();
    rustle.buffer = this.noise;
    rustle.loop = true;
    const rustleBp = ctx.createBiquadFilter();
    rustleBp.type = "bandpass";
    rustleBp.frequency.value = 2600;
    rustleBp.Q.value = 0.7;
    this.rustleGain = ctx.createGain();
    this.rustleGain.gain.value = 0;
    rustle.connect(rustleBp).connect(this.rustleGain).connect(this.master);
    rustle.start();

    // Snoring: breathy noise through a low resonant filter, swelling on each inhale.
    const snore = ctx.createBufferSource();
    snore.buffer = this.noise;
    snore.loop = true;
    this.snoreFilter = ctx.createBiquadFilter();
    this.snoreFilter.type = "bandpass";
    this.snoreFilter.frequency.value = 210;
    this.snoreFilter.Q.value = 5;
    this.snoreGain = ctx.createGain();
    this.snoreGain.gain.value = 0;
    snore.connect(this.snoreFilter).connect(this.snoreGain).connect(this.master);
    snore.start();
  }

  private get live() {
    return this.enabled && this.ctx && this.ctx.state === "running";
  }

  // A burst of filtered noise with a quick envelope.
  private burst(
    at: number,
    { gain, freq, q = 0.8, type = "lowpass", attack = 0.002, decay = 0.08 }: { gain: number; freq: number; q?: number; type?: BiquadFilterType; attack?: number; decay?: number },
  ) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = freq;
    filter.Q.value = q;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, at);
    env.gain.linearRampToValueAtTime(gain, at + attack);
    env.gain.exponentialRampToValueAtTime(0.0001, at + attack + decay);
    src.connect(filter).connect(env).connect(this.master);
    src.start(at, Math.random() * 1.5);
    src.stop(at + attack + decay + 0.05);
  }

  private tone(
    at: number,
    { from, to, gain, dur, type = "sine", attack = 0.005 }: { from: number; to: number; gain: number; dur: number; type?: OscillatorType; attack?: number },
  ) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(from, at);
    osc.frequency.exponentialRampToValueAtTime(to, at + dur);
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, at);
    env.gain.linearRampToValueAtTime(gain, at + attack);
    env.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    osc.connect(env).connect(this.master);
    osc.start(at);
    osc.stop(at + dur + 0.05);
  }

  /** A soft cloth "fwump" when he's poked. */
  poke() {
    if (!this.live) return;
    const at = this.ctx!.currentTime;
    this.burst(at, { gain: 0.14, freq: 900, q: 0.5, attack: 0.01, decay: 0.09 });
    this.tone(at, { from: 180, to: 120, gain: 0.06, dur: 0.08 });
  }

  /** A soft thud: him landing on the studio floor. */
  land() {
    if (!this.live) return;
    const at = this.ctx!.currentTime;
    this.tone(at, { from: 110, to: 45, gain: 0.16, dur: 0.22, attack: 0.005 });
    this.burst(at, { gain: 0.1, freq: 500, q: 0.6, attack: 0.004, decay: 0.12 });
  }

  /** Mumbled syllables for a speech bubble: one soft blip per syllable, pitched like a question if it is one. */
  talk(text: string) {
    if (!this.live) return;
    const syllables = Math.max(1, Math.min(9, (text.match(/[aeiouy]+/gi) ?? []).length));
    const base = 190 + Math.random() * 30;
    const question = text.trim().endsWith("?");
    let at = this.ctx!.currentTime + 0.02;
    for (let i = 0; i < syllables; i++) {
      const rise = question && i === syllables - 1 ? 1.35 : 1;
      const f = base * (0.9 + Math.random() * 0.25) * rise;
      this.tone(at, { from: f, to: f * (0.92 + Math.random() * 0.1), gain: 0.05, dur: 0.075, type: "triangle", attack: 0.012 });
      at += 0.075 + Math.random() * 0.04;
    }
  }

  /** A little rising "hm?" when he wakes up. */
  startle() {
    if (!this.live) return;
    const at = this.ctx!.currentTime;
    this.tone(at, { from: 170, to: 260, gain: 0.06, dur: 0.16, type: "triangle", attack: 0.02 });
  }

  /** Leaves brushed: a dry little crackle. */
  paper(speed: number) {
    if (!this.live) return;
    const at = this.ctx!.currentTime;
    const s = Math.min(1, speed / 5);
    this.burst(at, { gain: 0.03 + 0.08 * s, freq: 2800 + Math.random() * 1500, q: 1.2, type: "bandpass", decay: 0.03 });
    this.burst(at + 0.012, { gain: 0.02 + 0.04 * s, freq: 1800, q: 1, type: "bandpass", decay: 0.025 });
  }

  /** The phone vibrating on the floor: two short rattles. */
  buzz() {
    if (!this.live) return;
    const ctx = this.ctx!;
    for (const start of [0, 0.55]) {
      const at = ctx.currentTime + start;
      const osc = ctx.createOscillator();
      osc.type = "square";
      osc.frequency.value = 150;
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 900;
      const env = ctx.createGain();
      env.gain.setValueAtTime(0, at);
      env.gain.linearRampToValueAtTime(0.035, at + 0.02);
      env.gain.setValueAtTime(0.035, at + 0.3);
      env.gain.linearRampToValueAtTime(0, at + 0.35);
      osc.connect(lp).connect(env).connect(this.master);
      osc.start(at);
      osc.stop(at + 0.4);
    }
  }

  /** A lamp's switch. */
  click(on: boolean) {
    if (!this.live) return;
    const at = this.ctx!.currentTime;
    this.burst(at, { gain: 0.16, freq: on ? 3800 : 3200, type: "highpass", decay: 0.012 });
    this.burst(at + 0.018, { gain: 0.08, freq: on ? 2600 : 2200, type: "highpass", decay: 0.01 });
  }

  /** Per-frame: cloth speed, how asleep he is and where he is in his breath, how dark it is outside. */
  update(opts: { rustle: number; sleep: number; inhale: number; night: number }) {
    if (!this.ctx || !this.enabled) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    this.rustleGain.gain.setTargetAtTime(Math.min(0.12, opts.rustle * 0.05), now, 0.05);
    const snore = opts.sleep > 0.7 ? Math.max(0, opts.inhale) ** 3 * (opts.sleep - 0.7) * 0.5 : 0;
    this.snoreGain.gain.setTargetAtTime(snore, now, 0.08);
    this.snoreFilter.frequency.setTargetAtTime(170 + 70 * Math.max(0, opts.inhale), now, 0.1);
    this.night = opts.night;
    this.roomGain.gain.setTargetAtTime(0.035 + 0.02 * (1 - this.night), now, 0.5);

    // Outside the window: crickets at night, the odd bird in the day.
    if (now > this.nextCricket) {
      this.nextCricket = now + 0.6 + Math.random() * 1.6;
      if (this.night > 0.5) this.cricket(now, this.night);
    }
    if (now > this.nextBird) {
      this.nextBird = now + 5 + Math.random() * 11;
      if (this.night < 0.3) this.bird(now);
    }
  }

  private cricket(at: number, level: number) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    osc.frequency.value = 4300 + Math.random() * 500;
    const env = ctx.createGain();
    env.gain.value = 0;
    // Three or four quick pulses.
    const pulses = 3 + Math.floor(Math.random() * 2);
    for (let i = 0; i < pulses; i++) {
      const t = at + i * 0.045;
      env.gain.setValueAtTime(0, t);
      env.gain.linearRampToValueAtTime(0.012 * level, t + 0.008);
      env.gain.linearRampToValueAtTime(0, t + 0.03);
    }
    const pan = ctx.createStereoPanner();
    pan.pan.value = Math.random() * 1.6 - 0.8;
    osc.connect(env).connect(pan).connect(this.master);
    osc.start(at);
    osc.stop(at + pulses * 0.045 + 0.05);
  }

  private bird(at: number) {
    const ctx = this.ctx!;
    const notes = 2 + Math.floor(Math.random() * 3);
    const pan = ctx.createStereoPanner();
    pan.pan.value = 0.5 + Math.random() * 0.4;
    // Far away and outside: high-cut and quiet.
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 5200;
    pan.connect(lp).connect(this.master);
    let t = at;
    const base = 2600 + Math.random() * 900;
    for (let i = 0; i < notes; i++) {
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      const f = base * (0.9 + Math.random() * 0.3);
      osc.frequency.setValueAtTime(f, t);
      osc.frequency.exponentialRampToValueAtTime(f * (1.25 + Math.random() * 0.3), t + 0.06);
      env.gain.setValueAtTime(0, t);
      env.gain.linearRampToValueAtTime(0.01, t + 0.01);
      env.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
      osc.connect(env).connect(pan);
      osc.start(t);
      osc.stop(t + 0.12);
      t += 0.11 + Math.random() * 0.08;
    }
  }
}
