// Figma "Background Space" (Build flow dev handoff Step 4): nebula ellipses positioned
// proportionally, colored by pipeline tokens. Sits UNDER AuroraBackground's canvas (-z-20
// vs -z-10) -- this is the colorful glow AuroraBackground's dark-mode fill is designed to
// blend into (see the "transparent clear, not an opaque fillRect" comment in
// AuroraBackground.tsx). Shared by every flow screen that mounts AuroraBackground (Build,
// Match) so they all get the same bright, non-flat backdrop instead of each screen
// re-deriving its own (often opaque, often near-black) stand-in.
export function BackgroundSpace() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-20 overflow-hidden" style={{ background: "var(--color-night-background)" }}>
      {/* Radial-gradient nebulas, NOT filter:blur() -- giant blur() layers blow iOS
         Safari's GPU memory and crash the tab ("a problem repeatedly occurred"), which is
         exactly what happened in prod. Gradients give the same soft wash for free. px
         floors keep phones from going flat black. */}
      <div className="absolute" style={{ width: "max(90vw, 900px)", aspectRatio: "1", left: "50%", top: "-30vh", transform: "translateX(-40%)", background: "radial-gradient(circle, color-mix(in srgb, var(--color-brand-500) 34%, transparent) 0%, color-mix(in srgb, var(--color-brand-500) 14%, transparent) 40%, transparent 68%)" }} />
      <div className="absolute" style={{ width: "max(100vw, 980px)", aspectRatio: "1", left: "min(-30vw, -220px)", top: "40vh", background: "radial-gradient(circle, color-mix(in srgb, var(--color-accent-purple) 24%, transparent) 0%, transparent 66%)" }} />
      <div className="absolute" style={{ width: "max(75vw, 700px)", aspectRatio: "1", left: "4vw", top: "18vh", background: "radial-gradient(circle, color-mix(in srgb, var(--color-decorative-pink-glow) 14%, transparent) 0%, transparent 64%)" }} />
      <div className="absolute" style={{ width: "max(95vw, 820px)", height: "max(45vh, 380px)", left: "0", top: "-4vh", background: "radial-gradient(ellipse at 50% 40%, rgba(255,255,255,0.07) 0%, transparent 62%)" }} />
    </div>
  );
}
