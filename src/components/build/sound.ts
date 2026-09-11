import { bellTone, getAudioContext, tone, whenRunning } from "@/components/flow/aurora/feedback";

// Progress "level-up" chime — a warm three-note rising arpeggio. Played when the
// progress bar grows; distinct from the select tick and CTA ding so filling the bar
// feels like its own reward moment. Shares feedback.ts's bellTone (fundamental + a
// quieter, faster-decaying inharmonic partial + a soft mallet-strike click) instead of
// a plain sine sweep, and its AudioContext, rather than duplicating both.

// One soft rising chime for LANDMARK moments only (50% milestone, completion).
// The per-step progress sound is deliberately gone: audio on every step of an
// 8-step flow reads as noise by step three; the bar's fill + spark fan carry
// the reward visually, and sound stays special because it is rare.
export function playMilestoneChime() {
  const ctx = getAudioContext();
  if (!ctx) return;
  // This fires from a setTimeout in an effect, not a gesture -- if the context
  // was suspended in between (backgrounded tab, iOS idle), schedule only once
  // it's actually running again rather than against a stopped clock.
  whenRunning(ctx, (running) => {
    const now = running.currentTime;
    bellTone(running, 523.25, now, 0.24, 0.15);
    bellTone(running, 659.25, now + 0.09, 0.24, 0.15);
    bellTone(running, 783.99, now + 0.18, 0.32, 0.17);
  });
}


// The Dream Score count-up (direct feedback, 5 Sept 2026): a Game Boy style
// square wave that starts low and heavy and climbs only a little as the
// number rises, never sharp. Two squares an octave apart, soft lowpass.
export function playXpRise(durationMs: number) {
  const ctx = getAudioContext();
  if (!ctx) return;
  whenRunning(ctx, (running) => {
    const now = running.currentTime;
    const dur = Math.max(0.3, durationMs / 1000);
    const filter = running.createBiquadFilter();
    filter.type = "lowpass";
    filter.Q.value = 1.2;
    filter.frequency.setValueAtTime(700, now);
    filter.frequency.linearRampToValueAtTime(1400, now + dur);
    const gain = running.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.07, now + 0.08);
    gain.gain.setValueAtTime(0.07, now + dur * 0.9);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur + 0.18);
    filter.connect(gain).connect(running.destination);
    // low-heavy start, a modest climb: about an octave and a half in total
    const curve = new Float32Array([62, 66, 74, 88, 108, 132, 160, 185]);
    for (const [ratio, level] of [[1, 1], [2, 0.35]] as const) {
      const osc = running.createOscillator();
      osc.type = "square";
      osc.frequency.setValueCurveAtTime(curve.map((f) => f * ratio), now, dur);
      const g = running.createGain();
      g.gain.value = level;
      osc.connect(g).connect(filter);
      osc.start(now);
      osc.stop(now + dur + 0.2);
    }
  });
}

// GPA slider: one short, crisp, treble click per tenth crossed while
// dragging (direct feedback, 11 Sept 2026: "how Apple's time picker etc
// sound... more of a treble high sound like a satisfying clicking") --
// almost all attack and next to no sustain (14ms total), pitched well up
// where a mechanical click actually lives rather than the warmer tone a
// bell/chime uses; a square wave for the extra harmonic edge. A hint of
// pitch keeps direction (higher GPA ticks a hair brighter) without turning
// it into a melody. Fires once per step change, from a real
// pointer/keyboard interaction only.
export function playGpaTick(index: number, totalSteps: number) {
  const ctx = getAudioContext();
  if (!ctx) return;
  whenRunning(ctx, (running) => {
    const now = running.currentTime;
    const t = totalSteps <= 1 ? 0 : index / (totalSteps - 1);
    const freq = 3300 + t * 600;
    tone(running, freq, now, 0.014, 0.2, "square");
  });
}
