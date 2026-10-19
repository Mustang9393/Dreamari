"use client";

// DEMO-ONLY: the black-and-blue look preview (src/app/look-v2.css). Turned on
// by ?look=v2 (layout.tsx, before paint) or the bottom-left Color switch
// (ColorThemeSwitch.tsx: Classic / Black & Blue); remembered in localStorage.
// Most of the look is CSS keyed on html.look-v2. The hook is for the few places that need a value in JS
// (canvas colours). Server and first client render say false, so hydration
// matches; it follows the class after mount, so the switch applies live.
import { useSyncExternalStore } from "react";

const KEY = "dreamari-look";

function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

const read = () => document.documentElement.classList.contains("look-v2");

export function useLookV2(): boolean {
  return useSyncExternalStore(subscribe, read, () => false);
}

export function setLookV2(on: boolean) {
  document.documentElement.classList.toggle("look-v2", on);
  try {
    if (on) localStorage.setItem(KEY, "v2");
    else localStorage.removeItem(KEY);
  } catch {
    // private browsing: this tab only
  }
}
