// The one app background, fixed to the viewport. The colour field and the
// star map are sized to the screen, not to the page, so they never shift when
// a tab makes the page taller or shorter (direct feedback: "keep the background
// static throughout the app"). Every app screen renders this once behind a
// transparent root.
export function AppBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{
        // the app's own field (the one the screens had before), quieter than the
        // landing page: a purple corner top-right, blue everywhere else, no
        // pink or purple through the middle. Fixed to the viewport, so it is
        // the same on every screen and never moves with the page.
        // The mix percentages are CSS vars, not literals: dark mode's own
        // pale tokens (hero-accent-purple/teal) already carry enough
        // richness at these stock percentages, but light mode's tokens are
        // deliberately pale (kept low so text sitting directly on a hero
        // wash never loses contrast) -- at the SAME percentage that reads
        // as almost flat white, which is why glass panels floating over it
        // had no colour or contrast underneath to actually blur (direct
        // feedback, 17 Sept 2026: "the glassy effects and frosting arent
        // even visible on light mode"). --backdrop-wash-* boosts the mix
        // percentage in light mode only (globals.css), independent of the
        // token values themselves, so nothing else that reads
        // hero-accent-purple/teal is affected.
        background: [
          "radial-gradient(120% 85% at 88% -12%, color-mix(in srgb, var(--hero-accent-purple) var(--backdrop-wash-1, 50%), transparent), transparent 58%)",
          "radial-gradient(95% 70% at -12% 30%, color-mix(in srgb, var(--primary) var(--backdrop-wash-2, 22%), transparent), transparent 60%)",
          "radial-gradient(90% 60% at 60% 55%, color-mix(in srgb, var(--primary) var(--backdrop-wash-3, 10%), transparent), transparent 62%)",
          "radial-gradient(110% 80% at 75% 115%, color-mix(in srgb, var(--hero-accent-teal) var(--backdrop-wash-4, 40%), transparent), transparent 62%)",
          "linear-gradient(160deg, color-mix(in srgb, var(--primary) var(--backdrop-wash-5, 12%), var(--background)) 0%, var(--background) 48%, color-mix(in srgb, var(--hero-accent-teal) var(--backdrop-wash-6, 16%), var(--background)) 100%)",
        ].join(", "),
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt="" src="/images/app/background-space.svg" data-space-backdrop className="absolute inset-0 h-full w-full max-w-none object-cover" />
    </div>
  );
}
