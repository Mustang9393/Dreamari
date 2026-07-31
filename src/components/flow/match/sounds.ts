// Synthesized in-browser (no audio files to fetch/license) — same approach as
// aurora/feedback.ts's tick/ding, extended with a distinct sound per Match Experience
// action so likes, passes, undos, and a saved path each have their own read.
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

function tone(ctx: AudioContext, freq: number, startTime: number, duration: number, peakGain: number, type: OscillatorType = "sine") {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(peakGain, startTime + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.02);
}

// Bright, quick upward two-note chime — a small "yes" for every like.
export function playLikeSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  tone(ctx, 660, now, 0.08, 0.09);
  tone(ctx, 990, now + 0.05, 0.14, 0.11);
}

// Soft, low single tap — neutral/dismissive, not a "failure" sound, just a beat.
export function playPassSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  tone(ctx, 260, ctx.currentTime, 0.11, 0.07, "triangle");
}

// Short descending two-note — undoing a like/pass, something coming back off the list.
export function playRemovedSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  tone(ctx, 520, now, 0.07, 0.08);
  tone(ctx, 360, now + 0.05, 0.12, 0.08);
}

// Triumphant three-note ascending arpeggio — reserved for the "Path Saved!" moment,
// deliberately the richest of the four so it reads as a bigger deal than a single like.
export function playSavedSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  tone(ctx, 523, now, 0.1, 0.1);
  tone(ctx, 659, now + 0.09, 0.1, 0.11);
  tone(ctx, 784, now + 0.18, 0.22, 0.13);
}
