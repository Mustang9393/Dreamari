// Progress "level-up" chime — a warm three-note rising arpeggio, synthesized like
// the aurora feedback blips (no audio assets). Played when the progress bar grows;
// distinct from the select tick and CTA ding so filling the bar feels like its own
// reward moment.
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
  gain.gain.exponentialRampToValueAtTime(peakGain, startTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.02);
}

// One soft rising chime for LANDMARK moments only (50% milestone, completion).
// The per-step progress sound is deliberately gone: audio on every step of an
// 8-step flow reads as noise by step three; the bar's fill + spark fan carry
// the reward visually, and sound stays special because it is rare.
export function playMilestoneChime() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  tone(ctx, 523.25, now, 0.22, 0.16);
  tone(ctx, 659.25, now + 0.09, 0.22, 0.16);
  tone(ctx, 783.99, now + 0.18, 0.3, 0.18);
  tone(ctx, 1567.98, now + 0.22, 0.24, 0.05);
}
