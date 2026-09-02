import { bellTone, getAudioContext, whenRunning } from "@/components/flow/aurora/feedback";

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
