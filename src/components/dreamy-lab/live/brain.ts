// DEMO-ONLY: Dreamy's behaviour for the live 3D lab page. A tiny state
// machine: idle (float, random blinks, gaze darts, follows the pointer)
// and one-shot reactions that play a short script of targets and hand
// back to idle. Every control is smoothed by a damped spring, so targets
// can change at any moment (a new reaction interrupting an old one, the
// pointer moving) without a pop. This is the same shape a real app
// integration takes: the app sends events, the brain picks the reaction.

import { NEUTRAL, type Controls } from "./dreamyRig";

type Partial_ = Partial<Controls> & { waving?: boolean; eyesClosed?: boolean };
type Step = [at: number, targets: Partial_];

export const REACTIONS: Record<string, { label: string; hint: string; steps: Step[] }> = {
  happy: { label: "Happy", hint: "Hops with a big smile and a warm glow.", steps: [
    [0, { squash: 0.25, hop: -0.03 }],
    [0.16, { joy: 1, smile: 1, mouthOpen: 1, squash: -0.2, hop: 0.12, glow: 0.3 }],
    [0.38, { squash: 0.06, hop: 0 }],
    [1.8, {}],
  ] },
  curious: { label: "Curious", hint: "Tilts, peers to the side, a question mark pops up.", steps: [
    [0, { lean: 0.03, lookX: -0.2 }],
    [0.2, { curious: 1, surprise: 0.2, mouthOpen: 0.55, smile: 0.15, lookX: 0.6, lookY: 0.25, lean: -0.11, yaw: 0.18, question: 1 }],
    [1.0, { lookX: 0.35 }],
    [1.5, { lookX: 0.6 }],
    [2.2, {}],
  ] },
  nervous: { label: "Nervous", hint: "Shrinks a little, glances around, sweat drop.", steps: [
    [0, { concern: 0.6, squash: 0.08, hop: -0.02 }],
    [0.2, { concern: 1, mouthOpen: 0.5, smile: 0, squash: 0.12, lookX: -0.4, drop: 1 }],
    [0.6, { lookX: 0.3, lean: 0.02 }],
    [0.95, { lookX: -0.35, lean: -0.02 }],
    [1.3, { lookX: 0.2, lean: 0.015 }],
    [2.1, {}],
  ] },
  alert: { label: "Alert", hint: "Jolts up, eyes wide, mouth round.", steps: [
    [0, { squash: 0.3, hop: -0.04, blinkL: 0.6, blinkR: 0.6 }],
    [0.12, { surprise: 1, mouthOpen: 1, smile: 0, squash: -0.3, hop: 0.16, blinkL: 0, blinkR: 0, pitch: -0.08, alert: 1 }],
    [0.35, { squash: -0.1, hop: 0.07 }],
    [1.7, {}],
  ] },
  idea: { label: "Idea", hint: "Looks up, thinks, then lights up with a bulb.", steps: [
    [0, { lookY: 0.7, lookX: 0.25, curious: 0.4, mouthOpen: 0.6, pitch: -0.05 }],
    [0.6, { joy: 0.7, smile: 1, mouthOpen: 1, glow: 0.6, lookY: 0.25, squash: -0.2, hop: 0.1, curious: 0, bulb: 1 }],
    [0.85, { squash: 0.05, hop: 0, glow: 0.4 }],
    [2.2, {}],
  ] },
  love: { label: "Love", hint: "Eyes close happily, sways, a heart pops up.", steps: [
    [0, { eyesClosed: true, smile: 0.8 }],
    [0.18, { joy: 0.6, smile: 1, mouthOpen: 1, glow: 0.5, squash: -0.1, lean: -0.06, heart: 1 }],
    [0.6, { lean: 0.06, squash: 0.05 }],
    [1.05, { lean: -0.04, squash: -0.05 }],
    [1.5, { lean: 0 }],
    [2.0, { eyesClosed: false }],
    [2.2, {}],
  ] },
  party: { label: "Party", hint: "Bounces with confetti.", steps: [
    [0, { squash: 0.3, hop: -0.04, eyesClosed: true, smile: 0.8 }],
    ...[0.15, 0.45, 0.75, 1.05].flatMap((t, i) => [
      [t, { joy: 0.8, smile: 1, mouthOpen: 1, glow: 0.45, squash: -0.24, hop: 0.16, lean: i % 2 ? -0.07 : 0.07, confetti: 1 }] as Step,
      [t + 0.15, { squash: 0.18, hop: 0 }] as Step,
    ]),
    [1.6, { eyesClosed: false }],
    [2.0, {}],
  ] },
  smart: { label: "Smart", hint: "Puts on glasses and nods.", steps: [
    [0, { curious: 0.3, lookY: 0.2, pitch: 0.04, glasses: 1 }],
    [0.3, { joy: 0.35, smile: 0.9, mouthOpen: 0.9, pitch: -0.08, hop: 0.03, glow: 0.12 }],
    [0.6, { pitch: 0.04 }],
    [0.9, { pitch: -0.03 }],
    [2.0, {}],
  ] },
  wave: { label: "Wave", hint: "A stub puffs out of his side and waves.", steps: [
    [0, { squash: 0.25, hop: -0.02, lean: 0.03, lookX: 0.15 }],
    [0.2, { stub: 1.12, joy: 0.9, smile: 1, mouthOpen: 1, glow: 0.25, squash: -0.15, hop: 0.06, lean: -0.08, lookX: 0.4, lookY: 0.1 }],
    [0.4, { stub: 1, squash: 0.03, waving: true }],
    [2.0, { waving: false }],
    [2.15, { eyesClosed: true }],
    [2.3, { eyesClosed: false }],
    [2.45, { stub: 0.25, joy: 0.5, squash: 0.12, lean: 0.015 }],
    [2.7, { stub: 0, squash: -0.05 }],
    [3.0, {}],
  ] },
};

// Spring per control: stiffness and damping ratio. Faster for eyes, softer
// for body motion, a little bouncy for props.
const SPRING: Partial<Record<keyof Controls, [number, number]>> = {
  blinkL: [900, 1], blinkR: [900, 1], lookX: [140, 0.9], lookY: [140, 0.9],
  squash: [170, 0.45], hop: [120, 0.55], lean: [70, 0.6], yaw: [60, 0.8], pitch: [70, 0.7], stub: [110, 0.5], wave: [260, 0.7],
  question: [180, 0.42], drop: [180, 0.42], alert: [220, 0.4], bulb: [180, 0.42], heart: [180, 0.4], confetti: [160, 0.45], glasses: [180, 0.5],
};
const DEFAULT_SPRING: [number, number] = [90, 0.85];

export class Brain {
  value: Controls = { ...NEUTRAL };
  private vel: Record<string, number> = {};
  private target: Controls = { ...NEUTRAL };
  private reaction: { name: string; start: number; next: number } | null = null;
  private waving = false;
  private eyesClosed = false;
  private nextBlink = 1.5;
  private blinkT = -1;
  private nextDart = 2;
  private dart = { x: 0, y: 0 };
  private pointer: { x: number; y: number; t: number } | null = null;
  drag = { yaw: 0, pitch: 0, active: false };
  onReactionEnd?: (name: string) => void;

  play(name: string, now: number) {
    if (!REACTIONS[name]) return;
    this.target = { ...NEUTRAL };
    this.waving = false;
    this.eyesClosed = false;
    this.reaction = { name, start: now, next: 0 };
  }
  get current() { return this.reaction?.name ?? "idle"; }
  setPointer(x: number, y: number, now: number) { this.pointer = { x, y, t: now }; }

  update(now: number, dt: number) {
    dt = Math.min(dt, 1 / 20);
    // ---- reaction script
    if (this.reaction) {
      const r = this.reaction, steps = REACTIONS[r.name].steps, local = now - r.start;
      while (r.next < steps.length && steps[r.next][0] <= local) {
        const { waving, eyesClosed, ...t } = steps[r.next][1];
        if (waving !== undefined) this.waving = waving;
        if (eyesClosed !== undefined) this.eyesClosed = eyesClosed;
        Object.assign(this.target, t);
        r.next++;
      }
      if (r.next >= steps.length) {
        const done = r.name;
        this.reaction = null; this.target = { ...NEUTRAL }; this.waving = false; this.eyesClosed = false;
        this.onReactionEnd?.(done);
      }
    }
    const tgt = { ...this.target };
    // ---- wave: a smooth sine while waving, the body leans into each swing
    if (this.waving) {
      const ph = Math.sin(now * Math.PI * 2 * 1.9);
      tgt.wave = 0.85 * ph;
      tgt.lean = (tgt.lean ?? 0) - 0.03 * ph;
      tgt.hop = (tgt.hop ?? 0) + 0.015 * Math.abs(ph);
    }
    // ---- gaze: pointer if recent, otherwise idle darts
    const idleGaze = !this.reaction || REACTIONS[this.reaction.name] === undefined;
    if (this.pointer && now - this.pointer.t < 2.5) {
      if (idleGaze || Math.abs(tgt.lookX) < 0.01) { tgt.lookX = this.pointer.x; tgt.lookY = this.pointer.y; }
      tgt.yaw = (tgt.yaw ?? 0) + this.pointer.x * 0.22;
      tgt.pitch = (tgt.pitch ?? 0) - this.pointer.y * 0.1;
    } else if (idleGaze) {
      if (now > this.nextDart) {
        this.dart = { x: (Math.random() - 0.5) * 0.5, y: (Math.random() - 0.5) * 0.3 };
        this.nextDart = now + 1.4 + Math.random() * 2.2;
      }
      tgt.lookX = this.dart.x; tgt.lookY = this.dart.y;
    }
    // ---- drag-to-rotate overrides yaw/pitch
    if (this.drag.active || Math.abs(this.drag.yaw) > 0.001) { tgt.yaw = this.drag.yaw; tgt.pitch = this.drag.pitch; }
    // ---- blinks: close 70 ms, hold 40 ms, open 120 ms; right lid one frame late
    if (this.eyesClosed) { tgt.blinkL = 1; tgt.blinkR = 1; }
    else {
      if (this.blinkT < 0 && now > this.nextBlink) { this.blinkT = now; this.nextBlink = now + 2 + Math.random() * 3.5; }
      if (this.blinkT >= 0) {
        const k = now - this.blinkT;
        const curve = (x: number) => (x < 0 ? 0 : x < 0.07 ? x / 0.07 : x < 0.11 ? 1 : x < 0.23 ? 1 - (x - 0.11) / 0.12 : 0);
        tgt.blinkL = Math.max(tgt.blinkL, curve(k)); tgt.blinkR = Math.max(tgt.blinkR, curve(k - 0.017));
        if (k > 0.26) this.blinkT = -1;
      }
    }
    // ---- integrate springs (blinks are driven directly: they are too fast for a spring)
    for (const key of Object.keys(this.value) as (keyof Controls)[]) {
      if (key === "blinkL" || key === "blinkR") { this.value[key] = tgt[key]; continue; }
      const [k, z] = SPRING[key] ?? DEFAULT_SPRING;
      const c = 2 * z * Math.sqrt(k);
      const x = this.value[key], v = this.vel[key] ?? 0;
      const a = k * (tgt[key] - x) - c * v;
      const nv = v + a * dt;
      this.vel[key] = nv;
      this.value[key] = x + nv * dt;
    }
    return this.value;
  }
}
