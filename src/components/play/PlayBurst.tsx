"use client";

// Play/Glossary's own celebration burst -- replaces LocalBurst (Build's
// 10 uniform 6x6 squares in a fixed 4-color rotation) for moments here,
// direct feedback 21 Sept 2026: "not flat basic confetti, ever." Three
// shapes, varied sizes, a coordinated palette (the moment's own accent plus
// gold and white, not a random rainbow), staggered timing, and a quick
// origin flash so the pop reads as a genuine burst, not a a fixed fan of
// identical dots. LocalBurst itself is untouched -- Build flow keeps its
// own effect; this is scoped to where it was actually asked for.
type Shape = "dot" | "diamond" | "spark";

const PALETTE_FALLBACK = ["var(--glossary-accent)", "#ffd166", "#ffffff"];

function buildParticles(accent: string, count: number) {
  const colors = [accent, "#ffd166", "#ffffff", accent];
  const shapes: Shape[] = ["dot", "diamond", "spark"];
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 + (i % 3) * 0.35;
    const distance = 54 + ((i * 37) % 46);
    const size = 4 + ((i * 13) % 6);
    return {
      shape: shapes[i % shapes.length],
      size,
      color: colors[i % colors.length],
      bx: `${Math.round(Math.cos(angle) * distance)}px`,
      by: `${Math.round(Math.sin(angle) * distance) - 10}px`,
      br: `${i % 2 === 0 ? 260 : -220}deg`,
      delay: `${(i % 6) * 0.028}s`,
      duration: `${0.65 + (i % 4) * 0.09}s`,
    };
  });
}

function Particle({ shape, size, color }: { shape: Shape; size: number; color: string }) {
  if (shape === "spark") {
    return (
      <svg width={size * 1.8} height={size * 1.8} viewBox="0 0 24 24" fill="none" style={{ display: "block" }}>
        <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" fill={color} />
      </svg>
    );
  }
  if (shape === "diamond") {
    return <span style={{ display: "block", width: size, height: size, background: color, transform: "rotate(45deg)", borderRadius: 2 }} />;
  }
  return <span style={{ display: "block", width: size, height: size, borderRadius: "50%", background: color }} />;
}

export function PlayBurst({ nonce, accent = PALETTE_FALLBACK[0], count = 22 }: { nonce: number; accent?: string; count?: number }) {
  if (nonce === 0) return null;
  const particles = buildParticles(accent, count);
  return (
    <div key={nonce} aria-hidden className="pointer-events-none absolute inset-0 overflow-visible">
      <span
        className="motion-safe:animate-[play-burst-flash_0.5s_ease-out_forwards] absolute top-1/3 left-1/2 size-10 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: `radial-gradient(circle, color-mix(in srgb, ${accent} 70%, white) 0%, transparent 70%)` }}
      />
      {particles.map((p, i) => (
        <span
          key={i}
          className="motion-safe:[animation-name:play-burst] motion-safe:[animation-timing-function:cubic-bezier(0.16,1,0.3,1)] motion-safe:[animation-fill-mode:forwards] absolute top-1/3 left-1/2"
          style={{
            ["--bx" as string]: p.bx,
            ["--by" as string]: p.by,
            ["--br" as string]: p.br,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        >
          <Particle shape={p.shape} size={p.size} color={p.color} />
        </span>
      ))}
    </div>
  );
}
