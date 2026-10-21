"use client";

import { useEffect } from "react";

// Arrow keys for every tab row (WCAG 2.1.1 / 4.1.2, audit 21 Oct 2026). The
// app has ~50 hand-built role="tablist"s and most answered only to Tab and
// Enter, though a screen reader announces "tab, 1 of 4" and its user then
// reaches for the arrows. One listener here covers them all: Left/Right
// (Up/Down on a vertical list), Home and End move to the next tab and select
// it, the way a click would. A tablist that handles its own keys calls
// preventDefault, and this leaves it alone.
// Menus get the same treatment (WCAG 2.1.1 / 4.1.2, audit 21 Oct 2026): a
// role="menu" promises arrow keys. Down/Up/Home/End move between items,
// ArrowDown on an open menu's button enters it, Escape closes it and returns
// focus to the button. Returns true when it handled the key.
const ITEM = '[role="menuitem"], [role="menuitemradio"], [role="menuitemcheckbox"]';
function menuKeys(e: KeyboardEvent): boolean {
  const target = e.target as HTMLElement | null;
  if (!target) return false;
  const trigger = target.closest<HTMLElement>('[aria-haspopup="menu"][aria-expanded="true"]');
  if (trigger && e.key === "ArrowDown") {
    const menu = trigger.parentElement?.querySelector<HTMLElement>('[role="menu"]');
    const first = menu?.querySelector<HTMLElement>(ITEM);
    if (first) { e.preventDefault(); first.focus(); return true; }
    return false;
  }
  const item = target.closest<HTMLElement>(ITEM);
  const menu = item?.closest<HTMLElement>('[role="menu"]');
  if (!item || !menu) return false;
  if (e.key === "Escape") {
    const opener = menu.parentElement?.querySelector<HTMLElement>('[aria-haspopup="menu"][aria-expanded="true"]');
    if (!opener) return false;
    e.preventDefault();
    e.stopImmediatePropagation();
    opener.click();
    opener.focus();
    return true;
  }
  if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) return false;
  const items = Array.from(menu.querySelectorAll<HTMLElement>(ITEM)).filter((n) => n.closest('[role="menu"]') === menu && !n.hasAttribute("disabled") && n.getClientRects().length > 0);
  const i = items.indexOf(item);
  if (i < 0 || !items.length) return false;
  const to = e.key === "Home" ? 0 : e.key === "End" ? items.length - 1 : (i + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
  e.preventDefault();
  e.stopImmediatePropagation();
  items[to].focus();
  return true;
}

export function TabKeys() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      if (menuKeys(e)) return;
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
