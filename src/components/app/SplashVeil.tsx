"use client";

// Welcome first, then the page (Chandu, 2 Oct 2026: "the profile welcome
// modal still loads after the page loads. We need to open on the modal
// everywhere. First the modal with the blurred background, then the page.
// Rule of thumb.")
//
// How it works:
// 1. An inline script in the root layout's <head> runs before first paint.
//    If this route's welcome is due (same session rule as demoSeenThisSession,
//    reload clears it), it sets html[data-splash="pending"], and globals.css
//    lays the splash's own blurred scrim over the page from the first frame.
// 2. Every welcome opens in a layout effect, before the browser paints, so on
//    client-side navigation there is no page frame first either.
// 3. The veil lifts the moment a welcome opens (its scrim takes over,
//    identical to the veil) or a page reports that its welcome is not due.
//    Some pages mount their welcome late (Play), so a fixed two-frame lift
//    flashed the page first. The inline script keeps a 4s safety lift.

import { useEffect, useRef, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

export const SPLASH_ROUTES: Record<string, string> = {
  "/profile": "dreamari:welcome:profile",
  "/explore": "dreamari:welcome:explore",
  "/play": "dreamari:welcome:play",
  "/connect": "dreamari:welcome:connect",
  "/resume-builder": "dreamari:welcome:resume",
  "/match-lab": "dreamari:welcome:match",
  // No "/match-grid": it renders Mini Explore now, which has no welcome
  // (MiniExploreMatch.tsx), so the veil had nothing to lift it and blurred
  // Match for its full 4s safety timeout on every visit (2 Oct 2026,
  // Chandu: "why is match not loading and sits on a blurred screen for
  // ages?"). Only list a route here if its page opens a welcome.
};

/** The pre-paint check, as a string for the layout's inline <script>. */
export const SPLASH_VEIL_SCRIPT = `(function(){try{var r=${JSON.stringify(SPLASH_ROUTES)};var p=location.pathname.replace(/\\/$/,"")||"/";var k=r[p];if(!k)return;var q=new URLSearchParams(location.search);var due=k==="always"||(p==="/profile"&&q.get("welcome")==="1");if(!due){var n=performance.getEntriesByType("navigation")[0];var reload=n&&n.type==="reload";due=reload||sessionStorage.getItem(k+":session")!=="1";}if(due){document.documentElement.setAttribute("data-splash","pending");setTimeout(function(){document.documentElement.removeAttribute("data-splash")},4000);}}catch(e){}})();`;

/** Client-side navigation away from a veiled page clears the veil. */
export function SplashVeilGuard() {
  const pathname = usePathname();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    document.documentElement.removeAttribute("data-splash");
  }, [pathname]);
  return null;
}

/** Called by a splash the moment it opens: its scrim replaces the veil. */
export function liftSplashVeil() {
  if (typeof document !== "undefined") document.documentElement.removeAttribute("data-splash");
  emit();
}

// "Is a welcome (or its veil) in front of the page?" Motion nudges wait on
// this so they play after the welcome is dismissed, not underneath it
// (Chandu, 2 Oct 2026: "the Explore side scroll nudge should play after the
// welcome modal is dismissed").
let openWelcomes = 0;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
export function markWelcomeOpen(open: boolean) {
  openWelcomes = Math.max(0, openWelcomes + (open ? 1 : -1));
  emit();
}
export function useWelcomeInFront(): boolean {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => { listeners.delete(l); }; },
    () => openWelcomes > 0 || document.documentElement.hasAttribute("data-splash"),
    // server render: assume a welcome may be in front, so no nudge starts early
    () => true,
  );
}
