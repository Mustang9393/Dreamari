"use client";

import { useEffect, useRef, useState } from "react";

// A "read the copy first" beat before the storyboard animation starts: the graphic's
// own container still fades/slides into place immediately (everPlayed, below), but the
// internal keyframe sequence (data-playing) waits this long past that so the title +
// oneliner have already landed by the time anything moves. Without this, the animation
// was racing the copy's own 700ms reveal transition and finishing before a reader's eye
// even got to the graphic.
const STORYBOARD_READ_DELAY_MS = 900;

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
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        clearTimeout(timeout);
        if (entry.isIntersecting) {
          setEverPlayed(true);
          timeout = setTimeout(() => setPlaying(true), STORYBOARD_READ_DELAY_MS);
        } else {
          setPlaying(false);
        }
      },
      // Each chapter section is min-h-dvh with scroll-snap-align: start, so arriving
      // at a chapter (via snap) already means the reader is "there" - a plain
      // percentage-visible threshold is enough now. (An earlier version of this used
      // a thin center-band rootMargin instead, back when sections were natural-height
      // and a short one could leave the next chapter's sliver clearing 35% while the
      // current one was still front and center. With full-screen snap sections and
      // graphics now sized to fill most of that height, that same rootMargin instead
      // meant a graphic taller than one screen never crossed the center band at all -
      // "revealed" stayed stuck false even after scrolling to the very top of its
      // section and waiting.)
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => {
      clearTimeout(timeout);
      io.disconnect();
    };
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
