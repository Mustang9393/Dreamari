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

// The fill swell: "voooooOOOM" — an oscillator gliding up in pitch while its gain
// swells, with duration scaled to how far the bar just grew, so a big jump earns a
// longer, bigger rise. A bright chime lands right at the crest as the arrival.
export function playProgressSwell(fromPercent: number, toPercent: number) {
  const ctx = getAudioContext();
  if (!ctx) return;
  const delta = Math.max(0, toPercent - fromPercent);
  const duration = 0.35 + (delta / 100) * 1.1; // 13% step ~0.5s, the 50% milestone ~0.9s
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(170 + fromPercent * 2.6, now);
  osc.frequency.exponentialRampToValueAtTime(170 + toPercent * 5.4, now + duration);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.3, now + duration * 0.82);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration + 0.12);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + duration + 0.15);

  // A soft octave-up partner an octave above gives the swell body without buzz.
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = "sine";
  osc2.frequency.setValueAtTime((170 + fromPercent * 2.6) * 2, now);
  osc2.frequency.exponentialRampToValueAtTime((170 + toPercent * 5.4) * 2, now + duration);
  gain2.gain.setValueAtTime(0.0001, now);
  gain2.gain.exponentialRampToValueAtTime(0.09, now + duration * 0.82);
  gain2.gain.exponentialRampToValueAtTime(0.0001, now + duration + 0.1);
  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  osc2.start(now);
  osc2.stop(now + duration + 0.15);

  // Arrival chime at the crest.
  tone(ctx, 783.99, now + duration * 0.85, 0.16, 0.24);
  tone(ctx, 1567.98, now + duration * 0.88, 0.16, 0.07);
  return duration;
}
