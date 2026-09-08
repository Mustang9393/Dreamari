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
  // Increments every time the section crosses INTO view (never back down) — unlike
  // everPlayed (sticky true forever, so it can only ever gate a first-time reveal),
  // this changes on every single visit, including the first. A chapter with its own
  // interactive state (a picked answer, a swiped deck, a carousel position) can key a
  // "reset to initial + replay the entrance cue" effect off this value so the whole
  // demo starts fresh each time a reader scrolls back onto it, not just once ever.
  const [visitId, setVisitId] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        clearTimeout(timeout);
        if (entry.isIntersecting) {
          setEverPlayed(true);
          setVisitId((v) => v + 1);
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
  return [ref, playing, everPlayed, visitId] as const;
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

// Which of N rows is "active" for a sticky-column scrollytelling section (the
// Schools page's five stages): a row becomes active the moment it crosses a
// thin band centered in the viewport, tracked by one IntersectionObserver
// shared across all N rows. This replaces an earlier version that crossfaded
// the sticky graphic on its own timer, decoupled from the copy's actual
// scroll position -- direct feedback, 7 Sept 2026, "doesn't work properly
// when scrolling": the copy could sit screens away from the graphic it no
// longer matched. Deriving "active" straight from each row's real bounding
// box on every crossing means there is no independent clock to fall out of
// step with -- the graphic can only ever reflect where the reader actually is.
export function useScrollActiveStage(count: number) {
  const elsRef = useRef<(HTMLElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const setRef = (i: number) => (el: HTMLElement | null) => {
    elsRef.current[i] = el;
  };
  useEffect(() => {
    const els = elsRef.current;
    const io = new IntersectionObserver(
      (entries) => {
        // Several rows can report simultaneously (a short one fully inside
        // the band while a tall neighbour still straddles it) -- prefer
        // whichever is intersecting AND closest to dead center, so a short
        // stage doesn't lose the active state to a merely-adjacent tall one.
        let best: { i: number; dist: number } | null = null;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const i = els.indexOf(entry.target as HTMLElement);
          if (i === -1) continue;
          const center = entry.boundingClientRect.top + entry.boundingClientRect.height / 2;
          const dist = Math.abs(center - window.innerHeight / 2);
          if (!best || dist < best.dist) best = { i, dist };
        }
        if (best) setActive(best.i);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    els.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [count]);
  return [setRef, active] as const;
}

/** Scroll to a chapter from code (a finished interaction, the side rail).
 *  On phones the document snaps y-mandatory; a smooth scroll fights that and
 *  gets pulled back to the chapter it started in (seen on an iPhone). So the
 *  snap is switched off for the ride and restored once the scroll settles. */
export function advanceTo(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  const html = document.documentElement;
  html.dataset.snapOff = "1";
  target.scrollIntoView({ behavior: "smooth", block: "start" });
  let settled: ReturnType<typeof setTimeout> | undefined;
  const done = () => {
    window.removeEventListener("scroll", onScroll);
    delete html.dataset.snapOff;
    // The browser keeps the LAST snapped element as the one it re-snaps to
    // when layout changes (a card growing after a tap). The ride happened
    // with snap off, so that element is still the chapter we left; one
    // instant scroll onto the target with snap back on makes the target the
    // snapped element. Without this, tapping Enter Community after Play's
    // advance snapped the page back to Play (seen on an iPhone).
    requestAnimationFrame(() => {
      const top = target.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top, behavior: "instant" as ScrollBehavior });
    });
  };
  const onScroll = () => {
    if (settled) clearTimeout(settled);
    settled = setTimeout(done, 140);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  settled = setTimeout(done, 1200);
}
