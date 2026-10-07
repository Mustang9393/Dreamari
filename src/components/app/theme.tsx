"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useSyncExternalStore } from "react";

// The selected surface owns its saved theme. Both classes on <html> allow
// route-specific dark and light materials to render before hydration.
const STORAGE_KEY = "dreamari-theme";

// The Counselor Dashboard defaults to light. V4 has a separate saved choice
// so its pearlescent default and optional dark mode do not alter v2/v3.
const COUNSELOR_KEY = "dreamari-theme:counselor";
const COUNSELOR_V4_KEY = "dreamari-theme:counselor:v4";
// v5 is built on the student design system, so it has the student light and
// dark, but its own saved choice (default light, like every counselor build).
const COUNSELOR_V5_KEY = "dreamari-theme:counselor:v5";
function isCounselorV5(pathname: string) {
  if (!isCounselorPath(pathname) || typeof window === "undefined") return false;
  const selected = new URLSearchParams(window.location.search).get("v");
  if (selected) return selected === "5";
  try { return localStorage.getItem("dreamari:counselor-version") === "v5"; } catch { return false; }
}
function isCounselorPath(pathname: string) {
  return pathname === "/counselor" || pathname.startsWith("/counselor/");
}
function isCounselorV4(pathname: string) {
  if (!isCounselorPath(pathname) || typeof window === "undefined") return false;
  const selected = new URLSearchParams(window.location.search).get("v");
  if (selected) return selected === "4";
  try { return localStorage.getItem("dreamari:counselor-version") === "v4"; } catch { return false; }
}
function keyFor(pathname: string) {
  return isCounselorV5(pathname) ? COUNSELOR_V5_KEY : isCounselorV4(pathname) ? COUNSELOR_V4_KEY : isCounselorPath(pathname) ? COUNSELOR_KEY : STORAGE_KEY;
}
/** The theme a page should open in: the saved choice for its surface, or
 *  that surface's default (light on the Counselor Dashboard, dark elsewhere). */
function themeFor(pathname: string): GlobalTheme {
  try {
    const saved = localStorage.getItem(keyFor(pathname));
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    // fall through to the default
  }
  return isCounselorPath(pathname) ? "light" : "dark";
}

export type GlobalTheme = "light" | "dark";

function applyTheme(theme: GlobalTheme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.classList.toggle("light", theme === "light");
}

/** Set the theme for this page view; persist only when the user chose it. */
export function setGlobalTheme(theme: GlobalTheme, persist = false) {
  applyTheme(theme);
  if (persist) {
    try {
      localStorage.setItem(keyFor(location.pathname), theme);
    } catch {
      // private browsing etc.
    }
  }
}

/** Reapply the selected build's own saved theme or default after a version switch. */
export function syncPageTheme() {
  applyTheme(themeFor(location.pathname));
}

export function hasSavedTheme(): boolean {
  try {
    const v = localStorage.getItem(keyFor(location.pathname));
    return v === "light" || v === "dark";
  } catch {
    return false;
  }
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
      localStorage.setItem(keyFor(location.pathname), next);
    } catch {
      // private browsing etc. — theme just won't persist
    }
  }, []);
  return { theme, toggle };
}

// Mounted once in the root layout: applies the saved choice for the page's
// surface (dark default; light on the Counselor Dashboard) on every page,
// and again on client-side navigation, so moving between the student app
// and the dashboard switches to each one's own theme.
export function ThemeBoot() {
  const pathname = usePathname();
  useEffect(() => {
    applyTheme(themeFor(pathname ?? location.pathname));
  }, [pathname]);
  return null;
}
