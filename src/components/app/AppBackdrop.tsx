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
        // the landing page's colour field (MarketingApp), composed for one
        // viewport: brand blue top-left, the hero purple top-right, the sky
        // blue mid-left, accent mid-right, blue and purple low. Light and
        // colourful, and identical on every screen.
        background: [
          "radial-gradient(ellipse 85% 30% at 15% 0%, color-mix(in srgb, var(--primary) 48%, transparent), transparent 62%)",
          "radial-gradient(ellipse 75% 26% at 100% 16%, color-mix(in srgb, var(--hero-accent-purple) 85%, transparent), transparent 60%)",
          "radial-gradient(ellipse 90% 30% at 0% 36%, color-mix(in srgb, var(--world-driving-flying-shipping) 42%, transparent), transparent 62%)",
          "radial-gradient(ellipse 85% 28% at 90% 56%, color-mix(in srgb, var(--accent) 45%, transparent), transparent 60%)",
          "radial-gradient(ellipse 100% 26% at 30% 76%, color-mix(in srgb, var(--primary) 42%, transparent), transparent 62%)",
          "radial-gradient(ellipse 90% 24% at 70% 92%, color-mix(in srgb, var(--hero-accent-purple) 55%, transparent), transparent 62%)",
          "var(--background)",
        ].join(", "),
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt="" src="/images/app/background-space.svg" data-space-backdrop className="absolute inset-0 h-full w-full max-w-none object-cover" />
    </div>
  );
}
