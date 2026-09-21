"use client";

import { useEffect, useRef } from "react";

// A genuinely animated star layer -- not the static nebula SVG alone
// (direct feedback, 21 Sept 2026: "I think we're still using our old
// background... let's be creative, have some animations"). Inspired by the
// "Stars Background" reference the user shared (animated dots of varying
// size/speed, pointer-reactive) -- built first-party here rather than
// pulling in an unverified package, matching its behavior: each star
// twinkles on its own slow cycle, and the whole field drifts a few px
// opposite the pointer for a light parallax, the same trick premium
// marketing sites use. Deterministic seeding (no Math.random at module
// scope) keeps server and client markup identical -- a real hydration risk
// otherwise, since this renders on first paint.
type Star = { x: number; y: number; size: number; delay: number; duration: number; opacity: number };

function seededStars(count: number): Star[] {
  // A tiny mulberry32 PRNG, seeded with a fixed constant -- same star field
  // every load (server and client match exactly), not truly random each
  // visit. Good enough for decoration; nothing here needs cryptographic
  // randomness.
  let seed = 1337;
  function next() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  return Array.from({ length: count }, () => ({
    x: next() * 100,
    y: next() * 100,
    size: 1 + next() * 2.2,
    delay: next() * 6,
    duration: 3.5 + next() * 4.5,
    opacity: 0.25 + next() * 0.55,
  }));
}

const STARS = seededStars(70);

export function PlayStarfield() {
  const layerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // Pointer parallax only -- the per-star twinkle is pure CSS, gated by
    // the motion-safe: classes below, so it's already off under reduced
    // motion without any JS check.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let targetX = 0;
    let targetY = 0;
    let x = 0;
    let y = 0;
    function onMove(e: PointerEvent) {
      // Small, deliberately subtle offset -- a parallax hint, not a
      // distraction competing with the game content in front of it.
      targetX = (e.clientX / window.innerWidth - 0.5) * -10;
      targetY = (e.clientY / window.innerHeight - 0.5) * -10;
    }
    function tick() {
      x += (targetX - x) * 0.06;
      y += (targetY - y) * 0.06;
      if (layerRef.current) layerRef.current.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
      raf = requestAnimationFrame(tick);
    }
    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={layerRef} aria-hidden className="absolute -inset-[6%]">
      {STARS.map((s, i) => (
        <span
          key={i}
          className="motion-safe:[animation-name:star-twinkle] motion-safe:[animation-iteration-count:infinite] motion-safe:[animation-timing-function:ease-in-out] absolute rounded-full"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            background: "#fff",
            opacity: s.opacity,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
