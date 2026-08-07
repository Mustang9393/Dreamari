"use client";

import { useEffect, useState } from "react";
import { ScrollHint } from "@/components/landing/ScrollHint";

export function ScrollNudge() {
  // Its only job is prompting the very first scroll, so it fades out almost as soon as
  // the user starts — no reason for it to linger once they're already scrolling.
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    function update() {
      const fadeDistance = 110;
      setOpacity(Math.max(0, Math.min(1, 1 - window.scrollY / fadeDistance)));
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  function scrollToNext() {
    window.scrollBy({ top: window.innerHeight * 0.95, behavior: "smooth" });
  }

  // In-flow (not absolutely positioned): it used to be pinned to the bottom edge of the
  // centered content group, which shrinks on shorter viewports and let this collide with
  // the CTA button above it. As a normal last flex child it just stacks below the CTA
  // with the column's own gap, so it can never overlap a sibling regardless of height.
  return <ScrollHint opacity={opacity} onClick={scrollToNext} />;
}
