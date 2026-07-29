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
      const scrollableDistance = (HIW_SCROLL_FACTOR - 1) * window.innerHeight;
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
    <div ref={wrapperRef} style={{ height: `${HIW_SCROLL_FACTOR * 100}vh`, position: "relative" }}>
      <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}>
        <HowItWorksSection scrollProgress={progress} />
      </div>
    </div>
  );
}
