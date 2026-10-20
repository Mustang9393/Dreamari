"use client";

// Keyboard focus for every modal dialog (WCAG 2.4.3 / 2.1.2, audit 21 Oct
// 2026), the way HistoryHost gives every one a Back step. The app has ~85
// hand-built [role=dialog][aria-modal] sheets; most left focus on the page
// behind them, so Tab walked the hidden page and a screen reader lost its
// place. This watches for them as they appear: focus moves into the newest
// (unless something inside already took it), Tab wraps inside it, and when
// it goes, focus returns to whatever opened it. Dialogs that run
// useDialogFocus (data-focus-managed) do all this themselves and are skipped.
// Escape stays each dialog's own job.

import { useEffect } from "react";

const SELECTOR = '[role="dialog"][aria-modal="true"]';
const FOCUSABLE = 'button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex]:not([tabindex="-1"])';
const shown = (el: HTMLElement) => el.isConnected && el.getClientRects().length > 0;
const managed = (el: HTMLElement) => el.hasAttribute("data-focus-managed");

export function DialogFocusHost() {
  useEffect(() => {
    // each open dialog, with the element that had focus when it appeared
    const open = new Map<HTMLElement, HTMLElement | null>();
    let lastOutside: HTMLElement | null = null;
    const onFocusIn = (e: FocusEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest?.(SELECTOR)) lastOutside = t;
    };
    const top = () => [...open.keys()].filter((el) => shown(el) && !managed(el)).pop();

    let timer = 0;
    const scan = () => {
      timer = 0;
      for (const [el, opener] of open) {
        if (shown(el)) continue;
        open.delete(el);
        const lost = !document.activeElement || document.activeElement === document.body || !document.activeElement.isConnected;
        if (lost && opener?.isConnected && !managed(el)) opener.focus({ preventScroll: true });
      }
      document.querySelectorAll<HTMLElement>(SELECTOR).forEach((el) => {
        if (open.has(el) || !shown(el)) return;
        const active = document.activeElement as HTMLElement | null;
        open.set(el, active && !el.contains(active) && active !== document.body ? active : lastOutside);
        if (managed(el) || el.contains(document.activeElement)) return;
        if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
        el.focus({ preventScroll: true });
      });
    };
    const mo = new MutationObserver(() => { if (!timer) timer = window.setTimeout(scan, 30); });
    mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["role", "aria-modal", "hidden", "open"] });

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || e.defaultPrevented) return;
      const el = top();
      if (!el) return;
      const items = [...el.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((n) => n.getClientRects().length > 0 && !n.closest("[inert]"));
      if (!items.length) { e.preventDefault(); el.focus(); return; }
      const first = items[0], last = items[items.length - 1];
      const at = document.activeElement as HTMLElement | null;
      const inside = !!at && el.contains(at);
      if (e.shiftKey && (!inside || at === first || at === el)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && (!inside || at === last || at === el)) { e.preventDefault(); first.focus(); }
    };

    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("keydown", onKey);
    scan();
    return () => {
      mo.disconnect();
      window.clearTimeout(timer);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("keydown", onKey);
    };
  }, []);
  return null;
}
