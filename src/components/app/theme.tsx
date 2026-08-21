"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

// Global theme: ONE source of truth for every surface (landing, app chrome,
// build flow). The chosen theme lives in localStorage under the same key the
// flow's ThemeProvider has always used, and is expressed as BOTH classes on
// <html> — `dark` (night tokens, the flow) and `light` (explicit, so CSS can
// target chosen-light without colliding with the pre-hydration default state,
// which has neither class and must render dark).
const STORAGE_KEY = "dreamari-theme";

export type GlobalTheme = "light" | "dark";

function applyTheme(theme: GlobalTheme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.classList.toggle("light", theme === "light");
}

export function currentTheme(): GlobalTheme {
  return document.documentElement.classList.contains("light") ? "light" : "dark";
}

function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

export function useGlobalTheme() {
  const theme = useSyncExternalStore(subscribe, currentTheme, () => "dark" as GlobalTheme);
  const toggle = useCallback(() => {
    const next: GlobalTheme = currentTheme() === "dark" ? "light" : "dark";
    applyTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // private browsing etc. — theme just won't persist
    }
  }, []);
  return { theme, toggle };
}

// Mounted once in the root layout: applies the stored choice (dark default)
// on every page, so app/landing surfaces are themed even where the flow's
// ThemeProvider never mounts.
export function ThemeBoot() {
  useEffect(() => {
    let theme: GlobalTheme = "dark";
    try {
      if (localStorage.getItem(STORAGE_KEY) === "light") theme = "light";
    } catch {
      // fall through to dark
    }
    applyTheme(theme);
  }, []);
  return null;
}
