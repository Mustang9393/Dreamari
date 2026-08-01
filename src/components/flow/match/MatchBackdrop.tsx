const STARS: { x: number; y: number; size: number; opacity: number }[] = [
  { x: 8, y: 17, size: 8, opacity: 0.4 },
  { x: 24, y: 70, size: 5, opacity: 0.25 },
  { x: 47, y: 12, size: 6, opacity: 0.3 },
  { x: 64, y: 88, size: 10, opacity: 0.5 },
  { x: 90, y: 27, size: 7, opacity: 0.35 },
  { x: 80, y: 72, size: 5, opacity: 0.2 },
];

// Dark mode reproduces the Figma "Screen - Desktop/Mobile Match" background exactly:
// bg-gradient-to-b from-[#040b21] via-[#081540] to-[#020714] plus a handful of static
// "Cosmic Star" dots. Light mode reuses the same Figma-matched wash already built for
// the Build flow's light background, for a consistent site-wide light look — Figma
// itself only specs a dark version of this screen.
export function MatchBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <div
        className="absolute inset-0 hidden dark:block"
        style={{
          backgroundImage:
            "linear-gradient(180deg, var(--color-match-backdrop-1) 0%, var(--color-match-backdrop-2) 50%, var(--color-match-backdrop-3) 100%)",
        }}
      >
        {STARS.map((star, index) => (
          <span
            key={index}
            className="absolute rounded-full bg-white"
            style={{ left: `${star.x}%`, top: `${star.y}%`, width: star.size, height: star.size, opacity: star.opacity }}
          />
        ))}
      </div>
      <div className="absolute inset-0 dark:hidden" style={{ backgroundImage: "linear-gradient(242.096deg, rgba(127, 168, 255, 0.4) 64.584%, rgb(238, 244, 255) 116.1%)" }} />
    </div>
  );
}
