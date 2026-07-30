"use client";

import { useEffect, useRef, useState } from "react";
import { HowItWorksSection } from "./HowItWorksSection";

// How many viewport-heights of scrolling it takes to reveal all 5 steps.
const HIW_SCROLL_FACTOR = 5;

export function HowItWorksScroller() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let rafId = 0;
    let scheduled = false;

    function update() {
      scheduled = false;
      const el = wrapperRef.current;
      if (!el) return;
      // Measured against this wrapper's own position rather than a precomputed
      // hero height, so it stays correct however tall the hero above it ends
      // up rendering (its content flows naturally and can vary by viewport).
      const wrapperTop = el.getBoundingClientRect().top + window.scrollY;
      // A slight safety margin (reach 1 at 94% of the nominal distance, not 100%):
      // mobile browsers resize the visible viewport live as the address bar
      // shows/hides mid-scroll, and `window.innerHeight` here can drift very slightly
      // out of sync with the actual rendered `dvh` heights during that animation. That
      // was enough for progress to fall just short of 1 at the true end of the page —
      // the gradient road never quite reaching the last step. This trades a few percent
      // of "dead scroll" at the very end (harmless) for reliably completing before that.
      const scrollableDistance = (HIW_SCROLL_FACTOR - 1) * window.innerHeight * 0.94;
      const raw = (window.scrollY - wrapperTop) / scrollableDistance;
      setProgress(Math.max(0, Math.min(1, raw)));
    }

    // Mobile Safari can fire many 'scroll' events per frame during momentum scrolling.
    // Calling setState (and re-rendering the whole road/step section) directly on each one
    // competes with the browser's own scroll compositing for the main thread — the scroll
    // itself visibly lags behind the finger. Coalescing into at most one update per animation
    // frame keeps the re-render aligned with the browser's own paint budget instead.
    //
    // Deliberately *not* a custom wheel/touch step-jacker: an earlier attempt at that used
    // non-passive `wheel`/`touchmove` listeners on `window`, which forces the browser to
    // synchronously run JS and check preventDefault on *every* scroll gesture *anywhere on
    // the page*, for as long as this component is mounted — not just within this section.
    // That's what made the whole page (including the hero, nowhere near this section) feel
    // sluggish, and fighting the browser's own momentum scrolling is what made it feel stuck.
    // Passive-only, scroll-position-driven progress avoids both problems.
    function onScrollOrResize() {
      if (scheduled) return;
      scheduled = true;
      rafId = requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    // dvh, not vh: on mobile browsers vh is historically pinned to the *largest*
    // possible viewport (address bar hidden), while `window.innerHeight` (used above,
    // in the scroll-progress math) tracks the *current* one — that mismatch is enough
    // to throw off a scroll-linked sticky effect. dvh tracks the same live value.
    <div ref={wrapperRef} style={{ height: `${HIW_SCROLL_FACTOR * 100}dvh`, position: "relative" }}>
      <div style={{ position: "sticky", top: 0, height: "100dvh", overflow: "hidden" }}>
        <HowItWorksSection scrollProgress={progress} />
      </div>
    </div>
  );
}
