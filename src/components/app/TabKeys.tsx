"use client";

import { useEffect } from "react";

// Arrow keys for every tab row (WCAG 2.1.1 / 4.1.2, audit 21 Oct 2026). The
// app has ~50 hand-built role="tablist"s and most answered only to Tab and
// Enter, though a screen reader announces "tab, 1 of 4" and its user then
// reaches for the arrows. One listener here covers them all: Left/Right
// (Up/Down on a vertical list), Home and End move to the next tab and select
// it, the way a click would. A tablist that handles its own keys calls
// preventDefault, and this leaves it alone.
export function TabKeys() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      const tab = (e.target as HTMLElement | null)?.closest<HTMLElement>('[role="tab"]');
      const list = tab?.closest<HTMLElement>('[role="tablist"]');
      if (!tab || !list) return;
      const vertical = list.getAttribute("aria-orientation") === "vertical";
      const prev = vertical ? "ArrowUp" : "ArrowLeft";
      const next = vertical ? "ArrowDown" : "ArrowRight";
      if (![prev, next, "Home", "End"].includes(e.key)) return;
      const tabs = Array.from(list.querySelectorAll<HTMLElement>('[role="tab"]')).filter(
        (t) => t.closest('[role="tablist"]') === list && !t.hasAttribute("disabled") && t.getAttribute("aria-disabled") !== "true" && t.getClientRects().length > 0,
      );
      const i = tabs.indexOf(tab);
      if (i < 0 || tabs.length < 2) return;
      const to = e.key === "Home" ? 0 : e.key === "End" ? tabs.length - 1 : (i + (e.key === next ? 1 : -1) + tabs.length) % tabs.length;
      e.preventDefault();
      e.stopImmediatePropagation();
      tabs[to].focus();
      tabs[to].click();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  return null;
}
