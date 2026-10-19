"use client";

// The control-teaching nudge (Top 3's "Move to #1", "Remove from Top 3"):
// the control itself glows (.dm-spot / .dm-spot-ring, app.css) and the
// house tooltip (.dm-tip) says what it does, one beat at a time. Shared by
// Top 3, Career Goal, My schools and My Build (Chandu, 19 Oct 2026: "lets
// also have the tooltip nudges to teach the controls on my schools/ career
// goal etc.").

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useEffect, useRef, useState, type RefObject } from "react";
import { DEMO_ALWAYS_SHOW_SPLASH, demoSeenThisSession, markDemoSeenThisSession } from "@/components/app/WelcomeSplash";

/** The words a lit control already carries in its tooltip, shown once
 *  beside it while the first-visit highlight points at it. */
export function SpotTip({ side, top = 48, children }: { side: "left" | "right"; /** px below the anchor's top; negative sits above */ top?: number; children: React.ReactNode }) {
  return (
    <motion.span
      role="status"
      data-side={side}
      data-above={top < 0 ? "" : undefined}
      initial={{ opacity: 0, y: -8, scale: 0.85 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 520, damping: 22 }}
      style={{ top }}
      className={`dm-tip dm-spot-tip pointer-events-none absolute z-[8] flex items-center gap-[6px] rounded-[10px] px-[12px] py-[8px] text-[13.5px] leading-[18px] font-bold whitespace-nowrap ${side === "left" ? "left-0 origin-top-left" : "right-0 origin-top-right"}`}
    >
      <Sparkles className="h-[14px] w-[14px] flex-none" aria-hidden />
      {children}
    </motion.span>
  );
}

function seen(key: string): boolean {
  // DEMO-ONLY: every fresh visit replays the nudges, like the other first-use cues
  if (DEMO_ALWAYS_SHOW_SPLASH) return demoSeenThisSession(key);
  try { return window.localStorage.getItem(key) === "1"; } catch { return true; }
}
function markSeen(key: string) {
  if (DEMO_ALWAYS_SHOW_SPLASH) markDemoSeenThisSession(key);
  else { try { window.localStorage.setItem(key, "1"); } catch { /* nothing to persist to */ } }
}

/**
 * Plays `beats` in order, ~2.5s each, the first time `anchor` is properly
 * on screen (clear of the nav bars), then retires for good (the demo: for
 * the visit). Returns the beat now showing (null when none) and `stop`, for
 * the moment the student uses one of the controls: they've got it.
 * Polls for the anchor rather than observing it once, because the anchor
 * often mounts after the hook (data loads, a view switch).
 */
export function useSpotSequence<B extends string>(key: string, beats: readonly B[], anchor: RefObject<HTMLElement | null>, enabled = true, beatMs = 2500): [B | null, () => void] {
  const [beat, setBeat] = useState<B | null>(null);
  const timers = useRef<number[]>([]);
  const started = useRef(false);
  const stop = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    if (started.current) markSeen(key);
    setBeat(null);
  };
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);
  useEffect(() => {
    if (!enabled || started.current || seen(key)) return;
    const check = () => {
      const el = anchor.current;
      if (started.current || !el || document.visibilityState !== "visible") return;
      const r = el.getBoundingClientRect();
      if (r.width === 0) return;
      const visible = Math.min(r.bottom, window.innerHeight - 80) - Math.max(r.top, 88);
      // nearly all of a short panel (its first row can sit at the bottom), or a good 220px of a tall one
      if (visible < Math.min(r.height * 0.9, 220)) return;
      started.current = true;
      window.clearInterval(poll);
      beats.forEach((b, i) => timers.current.push(window.setTimeout(() => setBeat(b), 500 + i * beatMs)));
      timers.current.push(window.setTimeout(() => { setBeat(null); markSeen(key); }, 500 + beats.length * beatMs));
    };
    const poll = window.setInterval(check, 250);
    check();
    return () => window.clearInterval(poll);
    // beats is a fixed list per call site
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, key]);
  return [beat, stop];
}

/** The house tooltip as a badge inside a glowing card ("Start here", "Next
 *  step"): it stays until the step is done, so it never times out, and it
 *  sits inside the card so it covers nothing around it. */
export function SpotBadge({ children }: { children: React.ReactNode }) {
  return (
    <motion.span
      aria-hidden
      initial={{ opacity: 0, y: -6, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 520, damping: 22, delay: 0.3 }}
      className="dm-tip pointer-events-none absolute top-[var(--space-4)] left-[var(--space-4)] z-[3] flex items-center gap-[6px] rounded-[10px] px-[12px] py-[7px] text-[13.5px] leading-[18px] font-bold whitespace-nowrap"
      style={{ textShadow: "none" }}
    >
      <Sparkles className="h-[14px] w-[14px] flex-none" aria-hidden />
      {children}
    </motion.span>
  );
}
