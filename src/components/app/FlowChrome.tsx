"use client";

import { QuickLinksMenu, Wordmark } from "@/components/app/chrome";
import { Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDreamScore } from "@/lib/dreamScore";

// The header for focus flows (Build, Match, the games): the same wordmark and
// the same hamburger every other app screen carries, in the same corners, and
// nothing else. No destination tabs on purpose: a student in the middle of
// Build or Match should finish before the app offers somewhere else to go.
// The theme switch lives inside the hamburger's menu, as it does everywhere,
// so the old standalone sun/moon button is gone.
//
// Fixed and pointer-transparent as a bar, so the flow beneath keeps every
// swipe and scroll; only the two controls take pointer events. Carries the
// marketing-v2 token scope itself, since Build and Match do not wrap their
// pages in it.
const INTRO_KEY = "dreamari:dream-score:intro-seen";

export function FlowChrome() {
  // Dream Score carried through Build and Match: small, beside the menu,
  // visible but never competing with the task (Joshua Pierce, 5 Sept 2026)
  const score = useDreamScore();
  // First time the score appears (the Build landing), a short tooltip under
  // the chip says what it is, then fades away on its own. Shown once ever.
  const [intro, setIntro] = useState<"in" | "out" | null>(null);
  const prev = useRef(0);
  useEffect(() => {
    const wasZero = prev.current === 0;
    prev.current = score;
    if (!(score > 0 && wasZero)) return;
    let seen = false;
    try { seen = window.localStorage.getItem(INTRO_KEY) === "1"; } catch {}
    if (seen) return;
    try { window.localStorage.setItem(INTRO_KEY, "1"); } catch {}
    const show = setTimeout(() => setIntro("in"), 650);
    const leave = setTimeout(() => setIntro("out"), 4900);
    const gone = setTimeout(() => setIntro(null), 5400);
    return () => { clearTimeout(show); clearTimeout(leave); clearTimeout(gone); };
  }, [score]);
  return (
    <header className="marketing-v2 themeable pointer-events-none fixed inset-x-0 top-0 z-40 flex items-center justify-between px-5 pt-5 md:px-8" style={{ background: "transparent" }}>
      <span className="pointer-events-auto flex">
        <Wordmark />
      </span>
      <span className="pointer-events-auto relative flex items-center gap-[10px]">
        {/* re-keyed on every score change: the chip bounces in, a ring flashes
           off it and the sparkle spins once as the points slot in */}
        {score > 0 && (
          <span key={score} aria-label={`Dream Score ${score} XP`} className="flex h-9 items-center gap-[5px] rounded-[var(--radius-md)] px-[10px] text-[12.5px] leading-[16px] font-bold tabular-nums motion-safe:animate-[xp-slot-in_0.75s_cubic-bezier(0.16,1,0.3,1)_both]" style={{ background: "var(--glass-surface-2)", boxShadow: "inset 0 0 0 1px var(--glass-border)", color: "var(--foreground)", fontFamily: "var(--font-body)" }}>
            <Sparkles className="h-3.5 w-3.5 motion-safe:animate-[xp-spin_0.75s_ease-out_both]" aria-hidden style={{ color: "var(--accent-subtle)" }} /> {score.toLocaleString("en-US")} XP
          </span>
        )}
        <QuickLinksMenu />
        {intro && (
          <span role="status" className={`absolute top-[calc(100%+12px)] right-[50px] w-[232px] rounded-[var(--radius-md)] border px-[12px] py-[10px] text-left ${intro === "in" ? "motion-safe:animate-[fade-slide-up_0.45s_ease-out_both]" : "motion-safe:animate-[tip-out_0.5s_ease-in_both]"}`} style={{ background: "color-mix(in srgb, var(--background) 92%, var(--foreground))", borderColor: "color-mix(in srgb, var(--primary) 45%, var(--glass-border))", color: "var(--foreground)", boxShadow: "0 18px 40px -20px rgba(0,0,0,0.7), 0 0 30px -12px var(--primary)", fontFamily: "var(--font-body)" }}>
            <span aria-hidden className="absolute -top-[6px] right-[26px] block size-[12px] rotate-45 border-t border-l" style={{ background: "color-mix(in srgb, var(--background) 92%, var(--foreground))", borderColor: "color-mix(in srgb, var(--primary) 45%, var(--glass-border))" }} />
            <span className="block text-[12.5px] leading-[17px] font-bold">Your Dream Score</span>
            <span className="block text-[12.5px] leading-[17px]" style={{ color: "var(--muted-foreground)" }}>Every milestone you finish adds XP.</span>
          </span>
        )}
      </span>
    </header>
  );
}
