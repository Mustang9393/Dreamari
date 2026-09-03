"use client";

import { QuickLinksMenu, Wordmark } from "@/components/app/chrome";

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
export function FlowChrome() {
  return (
    <header className="marketing-v2 themeable pointer-events-none fixed inset-x-0 top-0 z-40 flex items-center justify-between px-5 pt-5 md:px-8" style={{ background: "transparent" }}>
      <span className="pointer-events-auto flex">
        <Wordmark />
      </span>
      <span className="pointer-events-auto relative">
        <QuickLinksMenu />
      </span>
    </header>
  );
}
