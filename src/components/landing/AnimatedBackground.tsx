const BLOBS = [
  { w: 900, h: 900, left: "-8%", top: "-12%", right: undefined, bottom: undefined, color: "rgba(28,76,200,0.42)", blur: 90, animation: "blob1 22s ease-in-out infinite" },
  { w: 700, h: 700, right: "-4%", top: "6%", left: undefined, bottom: undefined, color: "rgba(48,96,220,0.32)", blur: 100, animation: "blob2 28s ease-in-out infinite" },
  { w: 800, h: 800, left: "28%", top: "34%", right: undefined, bottom: undefined, color: "rgba(78,46,176,0.26)", blur: 110, animation: "blob3 32s ease-in-out infinite" },
  { w: 700, h: 700, right: "6%", bottom: "8%", left: undefined, top: undefined, color: "rgba(18,76,154,0.28)", blur: 95, animation: "blob4 26s ease-in-out infinite" },
  { w: 600, h: 600, left: "2%", bottom: "2%", right: undefined, top: undefined, color: "rgba(96,56,186,0.20)", blur: 80, animation: "blob5 30s ease-in-out infinite" },
] as const;

/**
 * Fixed, full-viewport backdrop that sits behind the entire page (hero +
 * "How It Works" scroller). The hero's own background is opaque so this
 * stays hidden there, but "How It Works" uses a translucent overlay, so
 * these slow-drifting blobs show through continuously as the user scrolls —
 * one continuous backdrop rather than a hard cut between sections.
 */
export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse 120% 80% at 58% 28%, #0e2a6e 0%, #060d28 55%, #030712 100%)" }}
      />
      {BLOBS.map((b, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: b.w,
            height: b.h,
            left: b.left,
            top: b.top,
            right: b.right,
            bottom: b.bottom,
            background: `radial-gradient(circle, ${b.color} 0%, transparent 68%)`,
            filter: `blur(${b.blur}px)`,
            animation: b.animation,
          }}
        />
      ))}
    </div>
  );
}
