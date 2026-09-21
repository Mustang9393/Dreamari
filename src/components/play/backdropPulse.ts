// A small event bus so game moments (a correct answer, a term unlocked, a
// lesson finished) can make PlayBackdrop itself react, not just the card in
// front of it (direct feedback, 21 Sept 2026: "interactive feedback
// animations that also reflect in the background"). Same shape as the
// Build/Match flow's own aurora pulse (`flow/aurora/pulse.ts`) for a
// consistent mental model, but deliberately not that system directly --
// AuroraBackground is a heavy canvas renderer built around Build's
// step-by-step "visited accents" model, which doesn't map onto Play/
// Glossary's own screens, and it needs its own ThemeProvider context this
// tree doesn't wrap. This is the lighter, CSS-driven equivalent, scoped to
// Play.
export type PlayPulseKind = "correct" | "wrong" | "celebrate";

export type PlayPulseDetail = { kind: PlayPulseKind };

const EVENT_NAME = "play:pulse";

export function dispatchPlayPulse(kind: PlayPulseKind) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<PlayPulseDetail>(EVENT_NAME, { detail: { kind } }));
}

export function onPlayPulse(handler: (detail: PlayPulseDetail) => void) {
  if (typeof window === "undefined") return () => {};
  const listener = (event: Event) => handler((event as CustomEvent<PlayPulseDetail>).detail);
  window.addEventListener(EVENT_NAME, listener);
  return () => window.removeEventListener(EVENT_NAME, listener);
}
