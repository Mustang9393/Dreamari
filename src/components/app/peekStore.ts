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

import { useEffect } from "react";
import { useInSheet } from "./inSheet";
import type { College } from "@/components/colleges/data";

export type Open = { kind: "career"; ids: string[]; index: number } | { kind: "school"; list: College[]; index: number };

let current: Open | null = null;
const listeners = new Set<() => void>();
export const peekSubscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
export const peekSnapshot = () => current;
// where the open sheet was opened from: kept here, not in the host, since
// each page mounts its own host and the one that sees the route change is
// the next page's
let openedFrom: { path: string; y: number } | null = null;
export const peekOpenedFrom = () => openedFrom;
export const peekSet = (next: Open | null) => {
  if (next && !current) openedFrom = { path: window.location.pathname + window.location.search, y: window.scrollY };
  if (!next) openedFrom = null;
  current = next;
  listeners.forEach((l) => l());
};

const KEY = "dreamari-peek-return";
type Return = { path: string; y: number; open: Open | null };

function remember(open: Open | null): void {
  try {
    const r: Return = { path: window.location.pathname + window.location.search, y: window.scrollY, open };
    window.sessionStorage.setItem(KEY, JSON.stringify(r));
  } catch { /* private mode: the page still opens */ }
}

/** The student left `path` with a sheet open (Play, a link inside it):
 *  one Back brings them to that sheet, not to the bare page under it. */
export function rememberAt(path: string, y: number, open: Open): void {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify({ path, y, open } satisfies Return));
  } catch { /* private mode: the page still opens */ }
}

/** Called as the full page opens from a sheet: Back reopens the sheet. */
export function rememberReturn(): void {
  if (current) remember(current);
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

/** A detail page opens at its top (8 Oct 2026, Chandu: "when I open the
 *  full detail from the pop up modals it opens on the bottom of the detail
 *  page"). Scroll to the top on arrival, then keep it there for the first
 *  moments while the browser (Safari especially) may still restore an old
 *  position, unless the student starts scrolling themselves. A #hash link
 *  to a section is left alone. */
export function useOpenAtTop(key: string): void {
  // inside the page sheet the sheet scrolls, not the window, and it always
  // mounts at its own top
  const inSheet = useInSheet();
  useEffect(() => {
    if (inSheet || window.location.hash) return;
    let touched = false;
    const stop = () => { touched = true; };
    const opts = { passive: true } as AddEventListenerOptions;
    window.addEventListener("wheel", stop, opts);
    window.addEventListener("touchstart", stop, opts);
    window.addEventListener("keydown", stop);
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    const until = performance.now() + 900;
    let t = 0;
    const tick = () => {
      if (touched) return;
      if (window.scrollY > 0) window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
      if (performance.now() < until) t = window.setTimeout(tick, 50);
    };
    t = window.setTimeout(tick, 50);
    return () => { window.clearTimeout(t); window.removeEventListener("wheel", stop); window.removeEventListener("touchstart", stop); window.removeEventListener("keydown", stop); };
  }, [key, inSheet]);
}
