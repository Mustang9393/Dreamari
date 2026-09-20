"use client";

// Shared version of the "discovery nudge" -- a text-sweep + corner-spark
// (dm-text-nudge/dm-nudge-spark in app.css) shown on a feature's label
// until the student has used it once, then gone for good via localStorage.
// Extracted from Explore's own For You nudge (ExploreExperience.tsx's
// useForYouNudge) once a second and third call site needed the identical
// seen/mark logic (direct instruction, 20 Sept 2026: find more site-wide
// candidates for the pattern the user loves).

import { useEffect, useState } from "react";

function readNudgeSeen(key: string): boolean {
  try {
    return window.localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

export function markNudgeSeen(key: string): void {
  try {
    window.localStorage.setItem(key, "1");
  } catch {
    /* no storage */
  }
}

/** true while the nudge should show: the feature hasn't been opened this
 *  render (`active` is false) and it's never been marked seen before.
 *  Marks it seen the instant `active` flips true, so it never shows again
 *  once the student actually uses the feature. `seen` starts true so SSR
 *  never flashes the sweep before the client can check localStorage. */
export function useDiscoveryNudge(key: string, active: boolean): boolean {
  const [seen, setSeen] = useState(true);
  useEffect(() => {
    if (active) markNudgeSeen(key);
    // deliberate: syncing a client-only store into state after mount
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSeen(active ? true : readNudgeSeen(key));
  }, [key, active]);
  return !active && !seen;
}
