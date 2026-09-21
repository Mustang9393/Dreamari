"use client";

import { useCallback, useSyncExternalStore } from "react";
import { picksSnapshot, serverPicksSnapshot, subscribePicks, writePicks, type Picks } from "./picks";

/** Add-to-Top-3 / swap-when-full, directly against the shared picks store --
 *  the same decision ProfileExperience's locker shelf makes ("Add to Top 3"
 *  / swap-picker when full), now reusable from any screen (Career Detail's
 *  "+" button, direct feedback 21 Sept 2026: "'+' should mean Add to Top 3").
 *  ProfileExperience's OWN top3 additionally overlays a demo default when
 *  storage is empty and edits before they're written -- that's Profile-page
 *  scaffolding on top of this, not duplicated here. */
export function useTop3() {
  const picks = useSyncExternalStore(subscribePicks, picksSnapshot, serverPicksSnapshot);

  const addToTop3 = useCallback((id: string): "added" | "already" | "full" => {
    const current = picksSnapshot();
    if (current.ids.includes(id)) return "already";
    if (current.ids.length < 3) {
      writePicks({ ids: [...current.ids, id], focus: current.focus });
      return "added";
    }
    return "full";
  }, []);

  const confirmSwap = useCallback((outgoingId: string, incomingId: string) => {
    const current = picksSnapshot();
    const ids = current.ids.map((id) => (id === outgoingId ? incomingId : id));
    const focus = current.focus === outgoingId ? incomingId : current.focus;
    writePicks({ ids, focus });
  }, []);

  /** Tapping "+" again removes -- every add has an obvious way back (direct
   *  feedback, 21 Sept 2026). Returns the prior picks so the caller can offer
   *  Undo; restore(before) puts it back exactly as it was. */
  const removeFromTop3 = useCallback((id: string): Picks => {
    const before = picksSnapshot();
    const ids = before.ids.filter((existing) => existing !== id);
    const focus = before.focus === id ? null : before.focus;
    writePicks({ ids, focus });
    return before;
  }, []);

  const restore = useCallback((before: Picks) => {
    writePicks(before);
  }, []);

  return { ids: picks.ids, addToTop3, confirmSwap, removeFromTop3, restore };
}
