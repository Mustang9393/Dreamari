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
type Return = { path: string; y: number; open: Open };

/** Called as the full page opens from a sheet. */
export function rememberReturn(): void {
  if (!current) return;
  try {
    const r: Return = { path: window.location.pathname + window.location.search, y: window.scrollY, open: current };
    window.sessionStorage.setItem(KEY, JSON.stringify(r));
  } catch { /* private mode: the full page still opens */ }
}

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
