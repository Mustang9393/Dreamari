"use client";

import { useEffect, useRef, useState } from "react";
import { HowItWorksSection, THRESHOLDS } from "./HowItWorksSection";

// How many viewport-heights of scroll room the wrapper reserves — this just needs to be
// enough room for position: sticky to stay pinned through the whole interaction; the actual
// pacing is driven by the step-jacking logic below, not by how far the user physically scrolls.
const HIW_SCROLL_FACTOR = 5;
const LAST_STEP = THRESHOLDS.length - 1;
// Below this many pixels of vertical drag/wheel delta, treat it as a tap/jitter, not a swipe.
const SWIPE_THRESHOLD = 12;

export function HowItWorksScroller() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let rafId = 0;
    let scheduled = false;
    // Which of the 5 checkpoints we're currently sitting at/animating toward. Synced from
    // the live scroll position the first time the user interacts, so entering mid-section
    // (e.g. a deep link, or a very fast initial scroll) doesn't assume step 0.
    let stepIndex = 0;
    let stepIndexSynced = false;

    function measure() {
      const el = wrapperRef.current;
      if (!el) return null;
      const wrapperTop = el.getBoundingClientRect().top + window.scrollY;
      // Same 0.94 safety margin as before — see the note on scrollableDistance further down.
      const scrollableDistance = (HIW_SCROLL_FACTOR - 1) * window.innerHeight * 0.94;
      const wrapperHeight = HIW_SCROLL_FACTOR * window.innerHeight;
      return { wrapperTop, scrollableDistance, wrapperHeight };
    }

    function currentProgress(m: { wrapperTop: number; scrollableDistance: number }) {
      const raw = (window.scrollY - m.wrapperTop) / m.scrollableDistance;
      return Math.max(0, Math.min(1, raw));
    }

    function nearestStepIndex(p: number) {
      let best = 0;
      let bestDist = Infinity;
      THRESHOLDS.forEach((t, i) => {
        const d = Math.abs(t - p);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      });
      return best;
    }

    // Mobile Safari can fire many 'scroll' events per frame during momentum/smooth-scroll
    // animation. Calling setState directly on each one competes with the browser's own scroll
    // compositing for the main thread. Coalescing into at most one update per animation frame
    // keeps the re-render aligned with the browser's own paint budget, and also lets the
    // programmatic scrollTo() jumps below animate the road smoothly rather than snapping.
    function syncProgressFromScroll() {
      scheduled = false;
      const m = measure();
      if (!m) return;
      setProgress(currentProgress(m));
    }

    function onScrollOrResize() {
      if (scheduled) return;
      scheduled = true;
      rafId = requestAnimationFrame(syncProgressFromScroll);
    }

    // "Engaged" = currently inside the wrapper's scrollable range, i.e. the section is the
    // one pinned via position: sticky right now. Step-jacking only applies while engaged;
    // outside this range the page scrolls completely normally.
    function isEngaged(m: { wrapperTop: number; wrapperHeight: number }) {
      const start = m.wrapperTop;
      const end = m.wrapperTop + m.wrapperHeight - window.innerHeight;
      return window.scrollY > start - 2 && window.scrollY < end + 2;
    }

    function ensureStepSynced(m: { wrapperTop: number; scrollableDistance: number }) {
      if (stepIndexSynced) return;
      stepIndexSynced = true;
      stepIndex = nearestStepIndex(currentProgress(m));
    }

    function goToStep(index: number, m: { wrapperTop: number; scrollableDistance: number }) {
      stepIndex = Math.max(0, Math.min(LAST_STEP, index));
      const top = m.wrapperTop + THRESHOLDS[stepIndex] * m.scrollableDistance;
      window.scrollTo({ top, behavior: "smooth" });
    }

    // One step further than the road actually needs, and past the wrapper's own bottom edge —
    // scrolling past the last node exits the whole section in a single motion, the same way
    // arriving at the road at all takes one motion per node.
    function exitForward(m: { wrapperTop: number; wrapperHeight: number }) {
      stepIndexSynced = false;
      window.scrollTo({ top: m.wrapperTop + m.wrapperHeight, behavior: "smooth" });
    }

    // Scrolling back up from anywhere inside the section exits it entirely in one motion,
    // rather than retreating one node at a time.
    function exitBackward(m: { wrapperTop: number }) {
      stepIndexSynced = false;
      window.scrollTo({ top: m.wrapperTop - 1, behavior: "smooth" });
    }

    function handleStep(goingDown: boolean) {
      const m = measure();
      if (!m || !isEngaged(m)) return false;
      ensureStepSynced(m);
      if (goingDown) {
        if (stepIndex < LAST_STEP) goToStep(stepIndex + 1, m);
        else exitForward(m);
      } else {
        exitBackward(m);
      }
      return true;
    }

    // Desktop: a mouse wheel/trackpad notch is a discrete, already-quantized unit — treat
    // each one as "advance one step" rather than accumulating a continuous scroll distance.
    function onWheel(event: WheelEvent) {
      if (Math.abs(event.deltaY) < 1) return;
      if (handleStep(event.deltaY > 0)) event.preventDefault();
    }

    // Mobile: touch scrolling has no discrete "notch" — track the drag distance directly and
    // decide the step jump only once the finger lifts, so a single swipe reads as one step.
    let touchActive = false;
    let touchStartY = 0;

    function onTouchStart(event: TouchEvent) {
      const m = measure();
      if (!m || !isEngaged(m)) {
        touchActive = false;
        return;
      }
      touchActive = true;
      touchStartY = event.touches[0].clientY;
    }

    function onTouchMove(event: TouchEvent) {
      if (!touchActive) return;
      // Prevented while engaged: the section drives its own position via scrollTo() on
      // release rather than following the finger continuously, matching "one swipe, one step."
      event.preventDefault();
    }

    function onTouchEnd(event: TouchEvent) {
      if (!touchActive) return;
      touchActive = false;
      const endY = event.changedTouches[0].clientY;
      const delta = touchStartY - endY;
      if (Math.abs(delta) < SWIPE_THRESHOLD) return;
      handleStep(delta > 0);
    }

    syncProgressFromScroll();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
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
