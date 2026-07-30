import { memo, useMemo } from "react";

function hash(seed: number): number {
  const s = Math.sin(seed) * 43758.5453;
  return s - Math.floor(s);
}

type StarsProps = { count?: number };

// A minimal, sparse twinkling starfield — deliberately understated (small dots, slow
// independent fade), just enough to keep the space vibe going behind the road graphic
// without competing with it.
//
// Memoized: the parent (HowItWorksSection) re-renders on every scroll-driven progress
// update, and `count` never changes — without this, the whole starfield (positions,
// inline style objects, 18-26 DOM nodes) was being rebuilt and rewritten to the DOM on
// every single frame of scroll, which is pure wasted work that competes with the
// browser's own scroll handling on lower-power mobile devices.
function StarsImpl({ count = 26 }: StarsProps) {
  const stars = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: hash(i * 12.9898) * 100,
        y: hash(i * 78.233) * 100,
        size: 1 + hash(i * 37.719) * 1.6,
        duration: 2.6 + hash(i * 91.345) * 3.2,
        delay: hash(i * 51.917) * 4,
      })),
    [count],
  );

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }} aria-hidden="true">
      {stars.map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            borderRadius: "50%",
            background: "white",
            animation: `star-twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

export const Stars = memo(StarsImpl);
