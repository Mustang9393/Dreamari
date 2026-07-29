"use client";

import { useEffect, useRef, useState } from "react";
import { HowItWorksSection } from "./HowItWorksSection";

// How many viewport-heights of scrolling it takes to reveal all 5 steps.
const HIW_SCROLL_FACTOR = 5;

export function HowItWorksScroller() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function update() {
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

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
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
