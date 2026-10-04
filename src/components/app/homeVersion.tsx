"use client";

// DEMO-ONLY: which Home layout shows, for A/B-ing Home as the student
// dashboard (1 Oct 2026; Chandu: "we had that idea for the HOME tab to be
// more of a dashboard like Overview is for students... build it as v2 or
// whatever number toggles for both My Profile and Home").
// - v1: today's Home. The carousel, Continue playing, Recommended careers,
//   the three "Your Next Moves" cards.
// - v2: the carousel (kept for partner promos and announcements), then
//   "Your week": Top 3, My Plan, Saved and the next deadline as composed
//   tiles built from real data. Next Moves is gone (its destinations are in
//   the tiles). Same mechanics as the Profile switch (layoutVersion.tsx):
//   in-memory, seeded from `?v=2`, mirrored into the URL, never stored.

import { useEffect, useSyncExternalStore } from "react";

export type HomeVersion = "v1" | "v2";

let mode: HomeVersion = "v1";
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };

export function setHomeVersion(v: HomeVersion) {
  mode = v;
  if (typeof window !== "undefined") {
    const url = new URL(window.location.href);
    if (v === "v1") url.searchParams.delete("v");
    else url.searchParams.set("v", "2");
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
  }
  emit();
}

export function useHomeVersion(): HomeVersion {
  return useSyncExternalStore(subscribe, () => mode, () => "v1");
}

export function useInitHomeVersionFromUrl() {
  useEffect(() => {
    const v = new URLSearchParams(window.location.search).get("v");
    if (v === "2" && mode !== "v2") { mode = "v2"; emit(); }
  }, []);
}

/** The demo switch: a small muted tablist, never styled like a product
 *  control (same language as the Profile, Resume and AT&T chips). */
export function HomeVersionChip() {
  const v = useHomeVersion();
  const opts: { key: HomeVersion; label: string }[] = [{ key: "v1", label: "v1" }, { key: "v2", label: "v2 Dashboard" }];
  return (
    <div role="tablist" aria-label="Home layout" className="flex flex-none items-center gap-[2px] rounded-[var(--radius-sm)] border p-[2px]" style={{ borderColor: "var(--glass-border)", background: "color-mix(in srgb, var(--foreground) 4%, transparent)" }}>
      {opts.map((o) => (
        <button key={o.key} type="button" role="tab" aria-selected={o.key === v} onClick={() => setHomeVersion(o.key)} className="dm-quiet cursor-pointer rounded-[4px] px-[7px] py-[3px] text-[10px] leading-[14px] font-bold tracking-[0.04em] uppercase" style={{ background: o.key === v ? "color-mix(in srgb, var(--foreground) 12%, transparent)" : "transparent", color: o.key === v ? "var(--foreground)" : "var(--muted-foreground)" }}>
          {o.label}
        </button>
      ))}
    </div>
  );
}
