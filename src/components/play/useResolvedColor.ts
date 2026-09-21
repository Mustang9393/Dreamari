"use client";

import { useEffect, useState } from "react";

// Resolves a CSS color expression (a var()/color-mix()/anything the
// cascade understands) to the actual rgb() string the browser computed for
// it. Needed anywhere a canvas needs to draw in a color that's really a
// design-system token reference (e.g. `var(--glossary-accent)`, itself
// often `var(--world-business-money-office)`) -- canvas fillStyle/
// strokeStyle can't parse `var(...)` directly, since canvas draws outside
// the CSS cascade. `getComputedStyle` on a real, standard property (here,
// `color`) DOES resolve the full var() chain; reading a custom property
// back out directly would not.
//
// The probe element matters as much as the technique: `--glossary-accent`
// is set as an INLINE style on the game's own root wrapper
// (GlossaryGameExperience.tsx), so it only exists in that element's own
// subtree -- a probe appended to `document.body` (a sibling ancestor, not
// a descendant) never sees it, and the color silently resolves to
// whatever body's own inherited text color happens to be instead (a real
// bug found live: PlayBackdropV3Dots's canvas dots rendered near-white
// instead of the intended gold, confirmed by sampling actual canvas pixel
// data). Appending inside `.marketing-v2` -- the class every screen that
// sets this token also carries -- puts the probe in the right scope.
export function useResolvedColor(cssColor: string): string | null {
  const [resolved, setResolved] = useState<string | null>(null);
  useEffect(() => {
    // Deferred one rAF tick so the setState call isn't synchronous inside
    // the effect body itself (react-hooks/set-state-in-effect).
    const raf = requestAnimationFrame(() => {
      const scope = document.querySelector(".marketing-v2") ?? document.body;
      const probe = document.createElement("span");
      probe.style.cssText = "position:absolute;visibility:hidden;pointer-events:none;";
      probe.style.color = cssColor;
      scope.appendChild(probe);
      setResolved(getComputedStyle(probe).color);
      scope.removeChild(probe);
    });
    return () => cancelAnimationFrame(raf);
  }, [cssColor]);
  return resolved;
}
