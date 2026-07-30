"use client";

import { useEffect, useRef, useState } from "react";
import { HowItWorksSection } from "./HowItWorksSection";

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
      // Measured against this wrapper's own rendered height, not a hardcoded
      // viewport-multiple: the chapters below are real document-flow content now (each
      // its own min-height block), so the total scrollable distance is however tall they
      // actually render, which can vary slightly with font metrics/viewport.
      const wrapperTop = el.getBoundingClientRect().top + window.scrollY;
      const scrollableDistance = Math.max(1, el.offsetHeight - window.innerHeight);
      const raw = (window.scrollY - wrapperTop) / scrollableDistance;
      setProgress(Math.max(0, Math.min(1, raw)));
    }

    // Mobile Safari can fire many 'scroll' events per frame during momentum scrolling.
    // Calling setState (and re-rendering) directly on each one competes with the
    // browser's own scroll compositing for the main thread. Coalescing into at most one
    // update per animation frame keeps the re-render aligned with the browser's own
    // paint budget instead.
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

  // No fixed height on this wrapper — it's exactly as tall as the chapter content
  // inside HowItWorksSection makes it (real document flow), not an artificial
  // scroll-multiple. The rail/background/CTA layers inside stay pinned via their own
  // sticky positioning; only they need a viewport-height reference, not this wrapper.
  return (
    <div ref={wrapperRef} style={{ position: "relative" }}>
      <HowItWorksSection scrollProgress={progress} />
    </div>
  );
}
