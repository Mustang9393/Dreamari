import type { AuroraPulseKind } from "./pulse";

// Synthesized in-browser (no audio files to fetch/license) — but a single sine
// oscillator reads as a cheap electronic "beep," not the warm clink-ding these are
// modeled on. Real bells/mallet percussion aren't harmonic (their partials sit at
// non-integer multiples of the fundamental, e.g. a handbell's ~1, 2.76, 5.4 series) and
// their upper partials die away faster than the fundamental -- that combination is most
// of what makes a bell sound like a bell instead of an organ note. bellTone below layers
// a fundamental with one quieter, faster-decaying inharmonic partial, plus a very short
// higher-pitched click at the very onset (a soft "mallet strike" transient) so the sound
// has a percussive attack instead of smoothly swelling in like a synth pad.
let audioCtx: AudioContext | null = null;

// Exported so sound.ts's milestone chime shares this one context/tone-shaping instead of
// running its own duplicate synthesis (and a second, unnecessary AudioContext).
export function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    if (!audioCtx) audioCtx = new Ctor();
    if (audioCtx.state === "suspended") void audioCtx.resume();
    return audioCtx;
  } catch {
    return null;
  }
}

export function tone(ctx: AudioContext, freq: number, startTime: number, duration: number, peakGain: number, type: OscillatorType = "sine") {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(peakGain, startTime + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.02);
}

export function bellTone(ctx: AudioContext, freq: number, startTime: number, duration: number, peakGain: number) {
  // Fundamental, full duration.
  tone(ctx, freq, startTime, duration, peakGain);
  // Inharmonic partial (bell-series ratio, not a clean octave/fifth) at lower volume,
  // decaying in about half the time -- gives the "shimmer that settles into a warm tail"
  // character instead of a flat, buzzy single pitch.
  tone(ctx, freq * 2.76, startTime, duration * 0.45, peakGain * 0.22);
  // The mallet-strike click: a couple of milliseconds of a much higher, near-instantly
  // decaying tone right at the attack, felt more than heard, but it's what reads as
  // "struck" rather than "faded in."
  tone(ctx, freq * 4.2, startTime, 0.02, peakGain * 0.35, "triangle");
}

// Peak gains bumped well up from their original 0.08-0.12 — those read as basically
// silent on a phone's own speaker at normal system volume (as opposed to headphones or
// a quiet room), which is almost certainly why "no sound" was reported despite the
// audio graph itself running correctly.
function playSelectSound(ctx: AudioContext) {
  bellTone(ctx, 720, ctx.currentTime, 0.1, 0.22);
}

function playCtaSound(ctx: AudioContext) {
  const now = ctx.currentTime;
  bellTone(ctx, 540, now, 0.11, 0.24);
  bellTone(ctx, 810, now + 0.06, 0.2, 0.28);
}

function vibrate(pattern: number | number[]) {
  // No-op where unsupported (notably iOS Safari, which doesn't implement the
  // Vibration API at all) — feature-detected so it fails silently there.
  if (typeof navigator === "undefined" || !navigator.vibrate) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    // ignore
  }
}

export function playFeedback(kind: AuroraPulseKind) {
  const ctx = getAudioContext();

  if (kind === "cta") {
    if (ctx) playCtaSound(ctx);
    vibrate(18);
  } else {
    if (ctx) playSelectSound(ctx);
    vibrate(8);
  }
}
