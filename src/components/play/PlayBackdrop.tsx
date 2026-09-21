// Play's own background -- deliberately NOT AppBackdrop (direct feedback,
// Joshua Pierce via Slack, 21 Sept 2026: "it shouldn't have a similar
// background color as the Explore/my profile etc, it'll feel redundant...
// when playing a game it should feel like we are entering a new world,
// similar to how the career simulations are extremely immersive... the
// change of color will spike the neurological pleasure reward"). Same
// structure and technique as AppBackdrop (radial wash + linear base + the
// app's own starfield, fixed to the viewport so it never moves with the
// page), but swaps --hero-accent-teal for --hero-accent-pink -- the design
// system's own third "hero accent" token, already defined, just unused
// until now -- so Play reads as its own place without inventing a color
// outside the token set or copying the Replit reference's palette (direct
// instruction: "not a direct replication of the Replit's colors"). A very
// faint diagonal hairline texture rides on top -- barely visible, the
// "subtle pattern" asked for, never competing with card art.
export function PlayBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{
        background: [
          "radial-gradient(120% 85% at 88% -12%, color-mix(in srgb, var(--hero-accent-purple) var(--backdrop-wash-1, 50%), transparent), transparent 58%)",
          "radial-gradient(95% 70% at -12% 30%, color-mix(in srgb, var(--hero-accent-pink) var(--backdrop-wash-2, 26%), transparent), transparent 60%)",
          "radial-gradient(90% 60% at 60% 55%, color-mix(in srgb, var(--hero-accent-pink) var(--backdrop-wash-3, 12%), transparent), transparent 62%)",
          "radial-gradient(110% 80% at 75% 115%, color-mix(in srgb, var(--hero-accent-pink) var(--backdrop-wash-4, 46%), transparent), transparent 62%)",
          "linear-gradient(160deg, color-mix(in srgb, var(--hero-accent-purple) var(--backdrop-wash-5, 14%), var(--background)) 0%, var(--background) 48%, color-mix(in srgb, var(--hero-accent-pink) var(--backdrop-wash-6, 20%), var(--background)) 100%)",
        ].join(", "),
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt="" src="/images/app/background-space.svg" data-space-backdrop className="absolute inset-0 h-full w-full max-w-none object-cover" />
      <span
        aria-hidden
        className="absolute inset-0"
        style={{ background: "repeating-linear-gradient(135deg, rgba(255,255,255,0.022) 0 2px, transparent 2px 16px)" }}
      />
    </div>
  );
}
