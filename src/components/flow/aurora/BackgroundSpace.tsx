import { useTheme } from "@/components/flow/theme/ThemeProvider";

// Figma "Background Space" (Build flow dev handoff Step 4): nebula ellipses positioned
// proportionally, colored by pipeline tokens. Sits UNDER AuroraBackground's canvas (-z-20
// vs -z-10) -- this is the colorful glow AuroraBackground's dark-mode fill is designed to
// blend into (see the "transparent clear, not an opaque fillRect" comment in
// AuroraBackground.tsx). Shared by every flow screen that mounts AuroraBackground (Build,
// Match) so they all get the same bright, non-flat backdrop instead of each screen
// re-deriving its own (often opaque, often near-black) stand-in.
export function BackgroundSpace() {
  // `--color-brand-500`/`--color-accent-purple`/`--color-decorative-pink-glow` are the
  // exact same hex in both themes (by design -- not something to fork here). What
  // actually reads different is these same colors blended at the same alpha over a
  // near-BLACK fill (dark) vs a near-WHITE one (light): identical percentages land
  // far more washed-out on white, since white already carries most of the luminance
  // a glow would otherwise add. Boosted the light-mode mix percentages only, to read
  // as lighter AND a touch more vivid instead of flat (16 Sept 2026 direct feedback:
  // "the background can be lighter and the color a little more bright shade but
  // subtle") -- dark mode's own values are untouched.
  const { theme } = useTheme();
  const light = theme === "light";
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-20 overflow-hidden" style={{ background: "var(--color-night-background)" }}>
      {/* Radial-gradient nebulas, NOT filter:blur() -- giant blur() layers blow iOS
         Safari's GPU memory and crash the tab ("a problem repeatedly occurred"), which is
         exactly what happened in prod. Gradients give the same soft wash for free. px
         floors keep phones from going flat black. */}
      <div className="absolute" style={{ width: "max(calc(90vw / var(--vz, 1)), 900px)", aspectRatio: "1", left: "50%", top: "calc(-30vh / var(--vz, 1))", transform: "translateX(-40%)", background: `radial-gradient(circle, color-mix(in srgb, var(--color-brand-500) ${light ? 46 : 34}%, transparent) 0%, color-mix(in srgb, var(--color-brand-500) ${light ? 20 : 14}%, transparent) 40%, transparent 68%)` }} />
      <div className="absolute" style={{ width: "max(calc(100vw / var(--vz, 1)), 980px)", aspectRatio: "1", left: "min(calc(-30vw / var(--vz, 1)), -220px)", top: "calc(40vh / var(--vz, 1))", background: `radial-gradient(circle, color-mix(in srgb, var(--color-accent-purple) ${light ? 34 : 24}%, transparent) 0%, transparent 66%)` }} />
      <div className="absolute" style={{ width: "max(calc(75vw / var(--vz, 1)), 700px)", aspectRatio: "1", left: "calc(4vw / var(--vz, 1))", top: "calc(18vh / var(--vz, 1))", background: `radial-gradient(circle, color-mix(in srgb, var(--color-decorative-pink-glow) ${light ? 20 : 14}%, transparent) 0%, transparent 64%)` }} />
      {/* 0.55 (16 Sept 2026) was a mistake -- at that strength this box's own
         soft-but-real falloff edge became visible as a rectangle around
         Dreamy instead of reading as ambient wash, exactly the kind of hard
         edge the other three layers (much smaller boosts, ~35-50%) avoid.
         0.16 keeps proportion with those. */}
      <div className="absolute" style={{ width: "max(calc(95vw / var(--vz, 1)), 820px)", height: "max(calc(45vh / var(--vz, 1)), 380px)", left: "0", top: "calc(-4vh / var(--vz, 1))", background: light ? "radial-gradient(ellipse at 50% 40%, rgba(255,255,255,0.16) 0%, transparent 62%)" : "radial-gradient(ellipse at 50% 40%, rgba(255,255,255,0.07) 0%, transparent 62%)" }} />
    </div>
  );
}
