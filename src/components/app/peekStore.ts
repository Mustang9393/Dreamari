// The open sheet, and where to come back to (8 Oct 2026). Split out of
// peek.tsx so the sheets themselves can read it without importing the host
// that renders them.
//
// Chandu: "the full screen button can be the full screen icon instead, and
// when I close that it should return me to where I was in the scroll
// position etc." So opening the full page from a sheet remembers the page
// under it (path, scroll, which sheet and which card in its row); when the
// student comes back to that path, the host scrolls there and reopens the
// same sheet. In sessionStorage, so it survives the route change and dies
// with the tab.

import type { College } from "@/components/colleges/data";

export type Open = { kind: "career"; ids: string[]; index: number } | { kind: "school"; list: College[]; index: number };

let current: Open | null = null;
const listeners = new Set<() => void>();
export const peekSubscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
export const peekSnapshot = () => current;
export const peekSet = (next: Open | null) => { current = next; listeners.forEach((l) => l()); };

const KEY = "dreamari-peek-return";
const SLIDE = "dreamari-peek-slide";
type Return = { path: string; y: number; open: Open | null };

/** Sheets are for desktop. Phones and tablets open the real page, which
 *  slides up like a sheet and keeps its header photo (8 Oct 2026, Chandu:
 *  "on mobile and tablet it can still just open the detail page and when
 *  you x out it shouldn't lose the scroll position... I like having the
 *  header image so tablet and mobile should have them"). */
export const sheetsOn = () => typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches;

function remember(open: Open | null, slide: boolean): void {
  try {
    const r: Return = { path: window.location.pathname + window.location.search, y: window.scrollY, open };
    window.sessionStorage.setItem(KEY, JSON.stringify(r));
    if (slide) window.sessionStorage.setItem(SLIDE, "1");
  } catch { /* private mode: the page still opens */ }
}

/** Called as the full page opens from a sheet: Back reopens the sheet. */
export function rememberReturn(): void {
  if (current) remember(current, false);
}

/** Called as a phone or tablet opens a detail page instead of a sheet:
 *  Back lands on the same spot, and the page slides up. */
export function rememberSpot(): void {
  remember(null, true);
}

/** True once, on the detail page a phone or tablet just slid into. */
export function takeSlide(): boolean {
  try {
    if (window.sessionStorage.getItem(SLIDE) !== "1") return false;
    window.sessionStorage.removeItem(SLIDE);
    return true;
  } catch { return false; }
}

/** A callback ref for a detail page's main column: slides it up when a
 *  phone or tablet just opened it from a list. Applied on attach (before
 *  paint, and with no server/client class mismatch). */
export const slideUpRef = (el: HTMLElement | null) => { if (el && takeSlide()) el.classList.add("dm-sheet-up"); };

/** The host's router, so a sheet opener with no router of its own can still
 *  navigate on a phone. */
let navigate: ((href: string) => void) | null = null;
export const setNavigate = (fn: ((href: string) => void) | null) => { navigate = fn; };
export const goTo = (href: string) => (navigate ? navigate(href) : window.location.assign(href));

/** The saved spot for this path, once; null when there is none. */
export function takeReturn(path: string): Return | null {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return null;
    const r = JSON.parse(raw) as Return;
    if (r.path !== path) return null;
    window.sessionStorage.removeItem(KEY);
    return r;
  } catch { return null; }
}
