"use client";

// DEMO-ONLY: the colour theme. Black & Blue (src/app/look-v2.css, keyed on
// html.look-v2) is the default; Classic when chosen with ?look=v1 or the
// bottom-left Color switch (ColorThemeSwitch.tsx), saved as "v1" in
// localStorage (layout.tsx applies it before paint). The hook is for the few
// places that need a value in JS (canvas colours); it follows the class
// after mount, so the switch applies live.
import { useSyncExternalStore } from "react";

const KEY = "dreamari-look";

function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

const read = () => document.documentElement.classList.contains("look-v2");

export function useLookV2(): boolean {
  // Server and first client render assume the default (Black & Blue); a saved
  // Classic corrects it right after mount.
  return useSyncExternalStore(subscribe, read, () => true);
}

export function setLookV2(on: boolean) {
  document.documentElement.classList.toggle("look-v2", on);
  try {
    localStorage.setItem(KEY, on ? "v2" : "v1");
  } catch {
    // private browsing: this tab only
  }
}
