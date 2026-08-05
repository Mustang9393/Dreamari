"use client";

import { useEffect, useRef, useState } from "react";
import { HowItWorksSection } from "./HowItWorksSection";

export function HowItWorksScroller() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const snapLockRef = useRef(false);
  const activeSnapIndexRef = useRef(-1);
  const lastScrollYRef = useRef(0);
  const scrollDirectionRef = useRef<1 | -1>(1);
  const touchStartRef = useRef<{ clientY: number } | null>(null);
  // Raw px scrolled past this wrapper's own top edge — NOT normalized to 0..1 here.
  // HowItWorksSection now holds three back-to-back phases (the five chapters, CONNECT's
  // exit, then the finale), each with its own scroll distance in vh, so a single
  // wrapper-wide 0..1 fraction cannot drive them without one phase distorting another.
  // Handing down the raw offset lets the section derive each phase independently.
  const [offsetPx, setOffsetPx] = useState(0);

  useEffect(() => {
    let rafId = 0;
    let scheduled = false;
    let snapUnlockTimer = 0;
    let scrollSettleTimer = 0;

    function isTouchLayout() {
      return window.matchMedia("(max-width: 1023px)").matches;
    }

    function snapOffsets() {
      const el = wrapperRef.current;
      if (!el) return [];
      return [...el.querySelectorAll<HTMLElement>("[data-how-it-works-snap-target]")].map((target) => {
        const bounds = target.getBoundingClientRect();
        const documentTop = bounds.top + window.scrollY;
        return target.dataset.howItWorksSnapTarget === "end"
          ? documentTop + bounds.height - window.innerHeight
          : documentTop + bounds.height / 2 - window.innerHeight / 2;
      });
    }

    function sectionCanTakeGesture(direction: 1 | -1) {
      const el = wrapperRef.current;
      if (!el) return false;
      const bounds = el.getBoundingClientRect();
      return direction > 0
        ? bounds.top <= window.innerHeight && bounds.bottom > 0
        : bounds.top < window.innerHeight && bounds.bottom >= window.innerHeight * 0.25;
    }

    function snapOneStage(direction: 1 | -1) {
      const offsets = snapOffsets();
      if (!offsets.length) return false;
      const nextIndex = activeSnapIndexRef.current + direction;
      if (nextIndex < 0 || nextIndex >= offsets.length) return false;
      const destination = offsets[nextIndex];

      activeSnapIndexRef.current = nextIndex;
      // Native CSS snapping may already have landed exactly on this target before the
      // scroll-settle fallback runs. Register the stage, but do not lock: no new smooth
      // scroll means there would be no follow-up scroll event to release that lock.
      if (Math.abs(destination - window.scrollY) < 8) return true;
      snapLockRef.current = true;
      window.scrollTo({ top: Math.max(0, destination), behavior: "smooth" });
      window.clearTimeout(snapUnlockTimer);
      snapUnlockTimer = window.setTimeout(() => {
        snapLockRef.current = false;
      }, 900);
      return true;
    }

    function onScrollSettled() {
      if (snapLockRef.current) {
        snapLockRef.current = false;
        return;
      }
      const direction = scrollDirectionRef.current;
      if (sectionCanTakeGesture(direction)) snapOneStage(direction);
    }

    function update() {
      scheduled = false;
      const el = wrapperRef.current;
      if (!el) return;
      const bounds = el.getBoundingClientRect();
      const wrapperTop = bounds.top + window.scrollY;
      if (window.scrollY > lastScrollYRef.current + 1) scrollDirectionRef.current = 1;
      else if (window.scrollY < lastScrollYRef.current - 1) scrollDirectionRef.current = -1;
      lastScrollYRef.current = window.scrollY;
      setOffsetPx(Math.max(0, window.scrollY - wrapperTop));
      if (bounds.top >= window.innerHeight * 0.95) activeSnapIndexRef.current = -1;

      // Document-level snapping is enabled only while the How It Works sequence is
      // entering/inside the viewport. Leaving it permanently enabled makes a fresh page
      // load choose BUILD as the nearest mandatory target and skip the hero. Turning it
      // on as the section approaches gives the intended first gesture → BUILD behavior
      // without changing normal scrolling elsewhere.
      const snapActive =
        bounds.top <= window.innerHeight * 0.75 &&
        bounds.bottom >= window.innerHeight * 0.25;
      if (snapActive) document.documentElement.dataset.howItWorksSnap = "true";
      else delete document.documentElement.dataset.howItWorksSnap;
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
      window.clearTimeout(scrollSettleTimer);
      scrollSettleTimer = window.setTimeout(onScrollSettled, 260);
    }

    function onWheel(event: WheelEvent) {
      if (Math.abs(event.deltaY) < 8) return;
      const direction: 1 | -1 = event.deltaY > 0 ? 1 : -1;
      if (!sectionCanTakeGesture(direction)) return;
      if (snapLockRef.current) {
        event.preventDefault();
        return;
      }
      if (snapOneStage(direction)) event.preventDefault();
    }

    function onTouchStart(event: TouchEvent) {
      if (!isTouchLayout() || event.touches.length !== 1) return;
      touchStartRef.current = { clientY: event.touches[0].clientY };
    }

    function onTouchEnd(event: TouchEvent) {
      const start = touchStartRef.current;
      touchStartRef.current = null;
      if (!start || event.changedTouches.length !== 1) return;
      const delta = start.clientY - event.changedTouches[0].clientY;
      if (Math.abs(delta) < 32) return;
      const direction: 1 | -1 = delta > 0 ? 1 : -1;
      if (sectionCanTakeGesture(direction)) snapOneStage(direction);
    }

    update();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      cancelAnimationFrame(rafId);
      window.clearTimeout(snapUnlockTimer);
      window.clearTimeout(scrollSettleTimer);
      delete document.documentElement.dataset.howItWorksSnap;
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
