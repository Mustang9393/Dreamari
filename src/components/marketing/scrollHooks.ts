"use client";

import { useEffect, useRef, useState } from "react";

// Toggles on/off every time the element crosses the viewport (no unobserve) — used by
// each chapter's graphic so its storyboard plays once per visit and replays only if the
// user scrolls away and back, never a background loop.
export function usePlayingOnScroll<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [playing, setPlaying] = useState(false);
  const [everPlayed, setEverPlayed] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setPlaying(entry.isIntersecting);
        if (entry.isIntersecting) setEverPlayed(true);
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  // Returned as a tuple (not { ref, playing }): the react-hooks/refs lint rule can't
  // tell a plain state field on an object apart from ref.current when both come back
  // together, and flags every access as "reading a ref during render." A tuple mirrors
  // useState's own shape and sidesteps that false positive.
  return [ref, playing, everPlayed] as const;
}

// Fires once, permanently — used by the side-aware chapter-copy reveal and the final CTA.
export function useRevealOnScroll<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          io.unobserve(el);
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, revealed] as const;
}
