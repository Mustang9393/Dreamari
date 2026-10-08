"use client";

// Every modal dialog is one step on the browser's Back (8 Oct 2026, Chandu:
// "ALWAYS EVERYTHING SHOULD GO ONLY ONE STEP BACK... every single
// interaction or screen"). Watches the page for [role=dialog][aria-modal]
// as they appear and gives each one a history entry (lib/backStep.ts), so
// the dozens of sheets and dialogs across the app get the same Back without
// each wiring it. Back closes the top dialog the way its own X does: its
// Close button when it has one, otherwise Escape. A dialog that manages its
// own history can opt out with data-own-history.

import { useEffect } from "react";
import { installHistory, openLayer } from "@/lib/backStep";

const ARIA = '[role="dialog"][aria-modal="true"]:not([data-own-history])';
// native <dialog>s opened with showModal(); :modal is missing on older
// Chromebooks, where those are left out rather than breaking the rest
const SELECTOR = `${ARIA}, dialog[open]:modal:not([data-own-history])`;
const dialogs = (): HTMLElement[] => {
  try { return [...document.querySelectorAll<HTMLElement>(SELECTOR)]; } catch { return [...document.querySelectorAll<HTMLElement>(ARIA)]; }
};

/** Close a dialog the way the student would: its own Close, else Escape. */
function closeDialog(el: HTMLElement): void {
  const own = [...el.querySelectorAll<HTMLElement>("button[aria-label]")].find(
    (b) => /^(close|dismiss)\b/i.test(b.getAttribute("aria-label") ?? "") && b.closest('[role="dialog"], dialog') === el && !b.hasAttribute("disabled"),
  );
  if (own) own.click();
  else if (el instanceof HTMLDialogElement) el.close();
  else el.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", code: "Escape", bubbles: true, cancelable: true }));
}

const shown = (el: HTMLElement) => el.isConnected && el.getClientRects().length > 0;

export function HistoryHost() {
  useEffect(() => {
    installHistory();
    const open = new Map<HTMLElement, () => void>();
    const track = (el: HTMLElement) => {
      const release = openLayer(() => {
        open.delete(el);
        closeDialog(el);
        // still up once any exit animation is done: it didn't close, so it
        // keeps a step of its own again (animations stand still in a hidden
        // tab, so wait until the student is looking)
        const check = () => {
          if (document.visibilityState !== "visible") { window.setTimeout(check, 900); return; }
          if (shown(el) && !open.has(el)) track(el);
        };
        window.setTimeout(check, 900);
      });
      open.set(el, release);
    };
    let t = 0;
    const scan = () => {
      t = 0;
      for (const [el, release] of open) {
        if (!shown(el)) {
          open.delete(el);
          release();
        }
      }
      // document order puts an inner dialog after its outer one
      dialogs().forEach((el) => {
        if (!open.has(el) && shown(el)) track(el);
      });
    };
    const mo = new MutationObserver(() => {
      if (!t) t = window.setTimeout(scan, 30);
    });
    mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["role", "aria-modal", "hidden", "open"] });
    scan();
    return () => {
      mo.disconnect();
      window.clearTimeout(t);
    };
  }, []);
  return null;
}
