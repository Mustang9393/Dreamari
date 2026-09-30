"use client";

// DEMO-ONLY: which Explore Schools "Browse all" shows (30 Sept 2026). v1 is
// the live one (search, quick-pick chips, the slide-in Filters sheet); v2
// is the SchooLinks-style filter bar Joshua asked for (BrowseV2.tsx). Same
// mechanics as the Resume and My Profile switches: in memory, seeded once
// from `?b=2`, mirrored into the URL on pick, never stored. `b`, not `v`:
// this page's own `?view=` already means For you / Browse all.

import { useEffect, useSyncExternalStore } from "react";

export type BrowseVersion = "v1" | "v2";
let mode: BrowseVersion = "v1";
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };

export function useBrowseVersion(): BrowseVersion {
  return useSyncExternalStore(subscribe, () => mode, () => "v1");
}
export function useInitBrowseVersion() {
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("b") === "2" && mode !== "v2") { mode = "v2"; emit(); }
  }, []);
}
function setBrowseVersion(v: BrowseVersion) {
  mode = v;
  const url = new URL(window.location.href);
  if (v === "v2") url.searchParams.set("b", "2");
  else url.searchParams.delete("b");
  window.history.replaceState(null, "", url.pathname + url.search);
  emit();
}

/** The quiet demo switch, sitting in the results header, never floating. */
export function BrowseVersionChip() {
  const v = useBrowseVersion();
  return (
    <div role="tablist" aria-label="Browse version" className="flex flex-none items-center gap-[2px] rounded-[var(--radius-sm)] border p-[2px]" style={{ borderColor: "var(--glass-border)", background: "color-mix(in srgb, var(--background) 55%, transparent)" }}>
      {(["v1", "v2"] as BrowseVersion[]).map((k) => (
        <button key={k} type="button" role="tab" aria-selected={k === v} onClick={() => setBrowseVersion(k)} className="dm-quiet cursor-pointer rounded-[4px] px-[7px] py-[3px] text-[10px] leading-[14px] font-semibold tracking-[0.04em] uppercase" style={{ background: k === v ? "var(--primary)" : "transparent", color: k === v ? "var(--primary-foreground)" : "var(--muted-foreground)" }}>
          {k === "v1" ? "v1" : "v2 Filter bar"}
        </button>
      ))}
    </div>
  );
}
