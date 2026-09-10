"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Every screen opens at its top (direct feedback, 11 Sept 2026: "when I go to
// Explore I'm taken to a weird mid section, some screens open on their last
// section"). The browser's own scroll restoration and Next's per-route
// restore were putting the student wherever they last were; this turns that
// off and pins the start on every path change. A hash in the URL still wins
// (the landing's chapter anchors scroll themselves). Screens that want a
// different first position (Profile's Top Three handoff) scroll after this,
// in their own effects.
export function ScrollReset() {
  const pathname = usePathname();
  useEffect(() => {
    try {
      window.history.scrollRestoration = "manual";
    } catch {
      // not supported: fine
    }
    if (window.location.hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    // Inner scrollers that carry a page (For You feeds, Play hub) start at
    // their top too.
    for (const el of document.querySelectorAll<HTMLElement>("[data-scroll-reset]")) el.scrollTop = 0;
  }, [pathname]);
  return null;
}
