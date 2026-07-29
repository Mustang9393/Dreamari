import type { AuroraPulseKind } from "./pulse";

// Synthesized in-browser (no audio files to fetch/license) — short sine-tone
// blips in the Duolingo vein: a light "tick" for selections, a brighter
// two-note "ding" for forward-moving CTAs.
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
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

function tone(ctx: AudioContext, freq: number, startTime: number, duration: number, peakGain: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, startTime);
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(peakGain, startTime + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.02);
}

function playSelectSound(ctx: AudioContext) {
  tone(ctx, 720, ctx.currentTime, 0.08, 0.08);
}

function playCtaSound(ctx: AudioContext) {
  const now = ctx.currentTime;
  tone(ctx, 540, now, 0.09, 0.1);
  tone(ctx, 810, now + 0.06, 0.16, 0.12);
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
