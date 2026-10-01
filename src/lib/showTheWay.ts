// Navigation that shows the way (1 Oct 2026). A "View saved" or "See Top 3"
// should not just swap pages: the page you are on slides left, the Profile
// slides in from the right, and the destination tab's panel follows a beat
// later, so you feel where the thing went (Chandu: "staggered and smooth
// transitions that seem like they are showing the way"). Two classes on
// <html>, set for the length of the animation only; the arriving page
// reads a short-lived sessionStorage note to know it should play.

import type { useRouter } from "next/navigation";

const ARRIVE_KEY = "dm-arrive";
const LEAVE_MS = 190;

export function showTheWay(router: ReturnType<typeof useRouter>, href: string) {
  if (typeof window === "undefined") return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  try { window.sessionStorage.setItem(ARRIVE_KEY, String(Date.now())); } catch { /* no storage */ }
  if (reduce) { router.push(href); return; }
  document.documentElement.classList.add("dm-leaving");
  window.setTimeout(() => { router.push(href); }, LEAVE_MS);
}

/** Call once on the arriving page's mount: plays the arrival if a departure
 *  happened in the last few seconds, and clears the note. */
export function playArrival(): boolean {
  if (typeof window === "undefined") return false;
  document.documentElement.classList.remove("dm-leaving");
  let at = 0;
  try { at = Number(window.sessionStorage.getItem(ARRIVE_KEY) ?? 0); window.sessionStorage.removeItem(ARRIVE_KEY); } catch { /* no storage */ }
  if (!at || Date.now() - at > 4000) return false;
  const html = document.documentElement;
  html.classList.add("dm-arriving");
  window.setTimeout(() => html.classList.remove("dm-arriving"), 900);
  return true;
}
