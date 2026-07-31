"use client";

import { useEffect, useRef, useState } from "react";
import { HowItWorksSection } from "./HowItWorksSection";

export function HowItWorksScroller() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  // Raw px scrolled past this wrapper's own top edge — NOT normalized to 0..1 here.
  // HowItWorksSection now holds two back-to-back phases (the five chapters, then the
  // finale), each with its own scroll distance in vh, so a single wrapper-wide 0..1
  // fraction can't drive both without one phase distorting the other's math whenever
  // the finale's height changes. Handing down the raw offset lets the section derive
  // each phase's own progress against its own fixed vh distance instead.
  const [offsetPx, setOffsetPx] = useState(0);

  useEffect(() => {
    let rafId = 0;
    let scheduled = false;

    function update() {
      scheduled = false;
      const el = wrapperRef.current;
      if (!el) return;
      const wrapperTop = el.getBoundingClientRect().top + window.scrollY;
      setOffsetPx(Math.max(0, window.scrollY - wrapperTop));
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
      <HowItWorksSection scrollOffsetPx={offsetPx} />
    </div>
  );
}
