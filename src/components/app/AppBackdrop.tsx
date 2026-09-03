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
        background: [
          "radial-gradient(120% 85% at 88% -12%, color-mix(in srgb, var(--hero-accent-purple) 50%, transparent), transparent 58%)",
          "radial-gradient(95% 70% at -12% 30%, color-mix(in srgb, var(--primary) 22%, transparent), transparent 60%)",
          "radial-gradient(90% 60% at 60% 55%, color-mix(in srgb, var(--primary) 10%, transparent), transparent 62%)",
          "radial-gradient(110% 80% at 75% 115%, color-mix(in srgb, var(--hero-accent-teal) 40%, transparent), transparent 62%)",
          "linear-gradient(160deg, color-mix(in srgb, var(--primary) 12%, var(--background)) 0%, var(--background) 48%, color-mix(in srgb, var(--hero-accent-teal) 16%, var(--background)) 100%)",
        ].join(", "),
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt="" src="/images/app/background-space.svg" data-space-backdrop className="absolute inset-0 h-full w-full max-w-none object-cover" />
    </div>
  );
}
