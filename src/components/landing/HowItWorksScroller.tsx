"use client";

import { useEffect, useRef, useState } from "react";
import { HowItWorksSection } from "./HowItWorksSection";

// Must match STEPS.length in HowItWorksSection — there's no shared export for it since
// the step data itself doesn't need to leave that file, only its count does.
const CHAPTER_COUNT = 5;
// How long the user has to stop scrolling before we treat it as "settled" and snap.
const SNAP_IDLE_MS = 90;
// The settle animation itself — short and deliberate, not a lingering native smooth
// scroll, per feedback that chapters should lock into place quickly.
const SNAP_DURATION_MS = 260;
// Small tolerance in the raw (unclamped) progress check right at the 0/1 ends, so
// floating point noise right at the section's boundary doesn't suppress a snap.
const EDGE_TOLERANCE_PX = 4;

function easeOutCubic(x: number): number {
  return 1 - Math.pow(1 - x, 3);
}

export function HowItWorksScroller() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let rafId = 0;
    let scheduled = false;
    let idleTimer: ReturnType<typeof setTimeout> | null = null;
    let snapRafId = 0;
    let isSnapping = false;

    function measure() {
      const el = wrapperRef.current;
      if (!el) return null;
      const wrapperTop = el.getBoundingClientRect().top + window.scrollY;
      const scrollableDistance = Math.max(1, el.offsetHeight - window.innerHeight);
      return { wrapperTop, scrollableDistance };
    }

    // Measured against this wrapper's own rendered height, not a hardcoded
    // viewport-multiple: the chapters below are real document-flow content now (each
    // its own min-height block), so the total scrollable distance is however tall they
    // actually render, which can vary slightly with font metrics/viewport.
    function update() {
      scheduled = false;
      const m = measure();
      if (!m) return;
      const raw = (window.scrollY - m.wrapperTop) / m.scrollableDistance;
      setProgress(Math.max(0, Math.min(1, raw)));
    }

    function cancelSnap() {
      if (snapRafId) cancelAnimationFrame(snapRafId);
      isSnapping = false;
    }

    // Locks the nearest chapter into the exact center of the viewport once scrolling
    // has settled — a free scroll (per feedback) would leave chapters stopped
    // half-lit between two words; this always finishes on one, fully lit.
    function trySnap() {
      const m = measure();
      if (!m) return;
      const raw = (window.scrollY - m.wrapperTop) / m.scrollableDistance;
      const edgeTolerance = EDGE_TOLERANCE_PX / m.scrollableDistance;
      // Only lock chapters into place while actually inside this section's own
      // scroll range — above or below it (hero, whatever follows), scrolling is
      // left completely untouched.
      if (raw < -edgeTolerance || raw > 1 + edgeTolerance) return;

      const clamped = Math.max(0, Math.min(1, raw));
      const nearestIndex = Math.round(clamped * (CHAPTER_COUNT - 1));
      const targetProgress = nearestIndex / (CHAPTER_COUNT - 1);
      const targetY = m.wrapperTop + targetProgress * m.scrollableDistance;
      const startY = window.scrollY;
      const delta = targetY - startY;
      if (Math.abs(delta) < 1) return;

      const startTime = performance.now();
      isSnapping = true;

      function step(now: number) {
        const elapsed = now - startTime;
        const t = Math.min(1, elapsed / SNAP_DURATION_MS);
        window.scrollTo(0, startY + delta * easeOutCubic(t));
        if (t < 1) {
          snapRafId = requestAnimationFrame(step);
        } else {
          isSnapping = false;
        }
      }
      snapRafId = requestAnimationFrame(step);
    }

    function scheduleSnap() {
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(trySnap, SNAP_IDLE_MS);
    }

    // Mobile Safari can fire many 'scroll' events per frame during momentum scrolling.
    // Calling setState (and re-rendering) directly on each one competes with the
    // browser's own scroll compositing for the main thread. Coalescing into at most one
    // update per animation frame keeps the re-render aligned with the browser's own
    // paint budget instead.
    function onScrollOrResize() {
      if (!scheduled) {
        scheduled = true;
        rafId = requestAnimationFrame(update);
      }
      // The snap animation's own per-frame scrollTo calls also fire 'scroll' events —
      // ignoring those (rather than cancelling+rescheduling on them) is what lets the
      // animation run to completion instead of endlessly re-triggering itself.
      if (!isSnapping) scheduleSnap();
    }

    update();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      cancelAnimationFrame(rafId);
      cancelSnap();
      if (idleTimer) clearTimeout(idleTimer);
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
