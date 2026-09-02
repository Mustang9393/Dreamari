// A tiny pub/sub, same shape as the aurora background's pulse.ts: StepFooter's Next
// button dispatches a "confirm" moment (and briefly holds navigation for it), and
// whichever selection is currently chosen -- a chip, a pill, a slider stop -- listens
// for it and plays its own shine-sweep + glow, without every step needing to thread a
// new prop through its own tree to make that happen.
import { useEffect, useState } from "react";

const EVENT_NAME = "build:confirm";
export const CONFIRM_GLOW_MS = 420;

export function dispatchConfirmPulse() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

/** True for CONFIRM_GLOW_MS right after a confirm pulse fires -- read this alongside
 * your own isSelected check so only the chosen option(s) animate. */
export function useConfirmGlow(active: boolean): boolean {
  const [glowing, setGlowing] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    function onConfirm() {
      if (!active) return;
      setGlowing(true);
      const timer = setTimeout(() => setGlowing(false), CONFIRM_GLOW_MS);
      return () => clearTimeout(timer);
    }
    window.addEventListener(EVENT_NAME, onConfirm);
    return () => window.removeEventListener(EVENT_NAME, onConfirm);
  }, [active]);

  return glowing;
}
