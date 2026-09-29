"use client";

// DEMO-ONLY: which My Profile layout shows, for A/B-ing where Saved lives
// (30 Sept 2026; Chandu: "The saved thing needs to be more prominent in the
// profile... too many tabs as is"; then "do 1 and 2 as v2 and v3").
// - v1: today's layout. Saved is the bookmark button beside Settings.
// - v2: Saved is a tab (TikTok's Favorites and Pinterest's Saved are
//   profile tabs); Preferences moves into the Settings menu, since it is
//   set once and tuned rarely, so there are still six tabs.
// - v3: Saved merges into Top Three ("Top 3 & Saved"): the three picks,
//   then everything saved below, since the Top 3 is picked from Saved.
// Same mechanics as the Resume Builder's v2 switch (resume/v2.tsx):
// in-memory, seeded once from `?v=2` / `?v=3`, mirrored into the URL on
// pick, never stored; v1 unless the URL says otherwise.

import { useEffect, useSyncExternalStore } from "react";

export type ProfileLayout = "v1" | "v2" | "v3";

let mode: ProfileLayout = "v1";
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };

export function getProfileLayout(): ProfileLayout {
  return mode;
}

export function setProfileLayout(v: ProfileLayout) {
  mode = v;
  if (typeof window !== "undefined") {
    const url = new URL(window.location.href);
    if (v === "v1") url.searchParams.delete("v");
    else url.searchParams.set("v", v.slice(1));
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
  }
  emit();
}

export function useProfileLayout(): ProfileLayout {
  return useSyncExternalStore(subscribe, () => mode, () => "v1");
}

export function useInitProfileLayoutFromUrl() {
  useEffect(() => {
    const v = new URLSearchParams(window.location.search).get("v");
    const next: ProfileLayout | null = v === "2" ? "v2" : v === "3" ? "v3" : null;
    if (next && next !== mode) { mode = next; emit(); }
  }, []);
}

/** Where "View saved" should go for the layout in play. */
export function savedHref(): string {
  return mode === "v3" ? "/profile?tab=top3&v=3#profile-saved" : mode === "v2" ? "/profile?tab=locker&v=2" : "/profile?tab=locker";
}
export function top3Href(): string {
  return mode === "v1" ? "/profile?tab=top3" : `/profile?tab=top3&v=${mode.slice(1)}`;
}

/** The demo switch: a small muted tablist, never styled like a product
 *  control (same language as the Resume and AT&T chips). */
export function ProfileLayoutChip() {
  const layout = useProfileLayout();
  const opts: { key: ProfileLayout; label: string }[] = [{ key: "v1", label: "v1" }, { key: "v2", label: "v2 Saved tab" }, { key: "v3", label: "v3 Top 3 + Saved" }];
  return (
    <div role="tablist" aria-label="Profile layout" className="flex flex-none items-center gap-[2px] rounded-[var(--radius-sm)] border p-[2px]" style={{ borderColor: "var(--glass-border)", background: "color-mix(in srgb, var(--background) 55%, transparent)" }}>
      {opts.map((o) => (
        <button key={o.key} type="button" role="tab" aria-selected={o.key === layout} onClick={() => setProfileLayout(o.key)} className="dm-quiet cursor-pointer rounded-[4px] px-[7px] py-[3px] text-[10px] leading-[14px] font-semibold tracking-[0.04em] whitespace-nowrap uppercase" style={{ background: o.key === layout ? "var(--primary)" : "transparent", color: o.key === layout ? "var(--primary-foreground)" : "var(--muted-foreground)" }}>
          {o.label}
        </button>
      ))}
    </div>
  );
}
