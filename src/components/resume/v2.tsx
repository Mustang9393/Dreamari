"use client";

// DEMO-ONLY: which build of the Resume Builder shows -- v1 is the live
// default (Joshua's Replit flow, byte-identical); a chip or `?v=2` opens
// the restored-quality build (six upgrades that were removed in earlier
// "1:1 Replit parity" passes) so Joshua can compare the two side by side.
// Mechanics copied from the AT&T board's own switch (VersionChip.tsx /
// ConnectExperience.tsx's attVersion): in-memory state, seeded once from a
// read-only URL param, kept in sync via `history.replaceState` on pick,
// never written to storage -- reload or a fresh link always starts back on
// v1 unless the URL itself says `?v=2`. See docs/HANDOFF_INDEX.md's Demo
// vs Production section. Resume v2, 28 Sept 2026.
import { useEffect, useSyncExternalStore } from "react";

export type ResumeVersionMode = "v1" | "v2";

let mode: ResumeVersionMode = "v1";
const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}
function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}
function snapshot(): ResumeVersionMode {
  return mode;
}
function serverSnapshot(): ResumeVersionMode {
  return "v1";
}

/** Chip onClick / any other picker -- flips the in-memory flag and mirrors
 *  it into the URL so a demo link can be shared already pointed at v2. */
export function setResumeVersionMode(v: ResumeVersionMode) {
  mode = v;
  if (typeof window !== "undefined") {
    const url = new URL(window.location.href);
    if (v === "v2") url.searchParams.set("v", "2");
    else url.searchParams.delete("v");
    window.history.replaceState(null, "", url.pathname + url.search);
  }
  emit();
}

export function useResumeVersionMode(): ResumeVersionMode {
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}

/** The one hook every v2-gated call site reads. */
export function useResumeV2(): boolean {
  return useResumeVersionMode() === "v2";
}

/** Reads `?v=2` once on mount -- an effect, not a lazy useState initializer,
 *  since `window.location.search` is only knowable client-side (same
 *  reasoning ConnectExperience.tsx uses for its own `?v=2` restore). Call
 *  once, near the top of the Resume Builder tree. */
export function useInitResumeVersionFromUrl() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("v") === "2" && mode !== "v2") {
      mode = "v2";
      emit();
    }
  }, []);
}

/** Same visual language as the AT&T board's VersionChip (connect/att/
 *  VersionChip.tsx) -- a small muted tablist pill, never styled like a
 *  product control. Kept local rather than importing that one directly:
 *  it's typed to AttVersion and its aria-label ("Board version") is
 *  specific to that feature, so re-labeling it here would mean forking it
 *  anyway. Placement mirrors the AT&T chip too: beside the other icon
 *  controls, never inline with real wizard actions. */
// Hidden below sm: in the tab bar it squeezed the phone tabs ("Builder"
// clipped, 28 Sept 2026). ?v=2 still switches on phones; it is a demo
// control, not something students need.
export function ResumeVersionChip() {
  const version = useResumeVersionMode();
  return (
    <div role="tablist" aria-label="Resume Builder version" className="hidden flex-none items-center gap-[2px] rounded-[var(--radius-sm)] border p-[2px] sm:flex" style={{ borderColor: "var(--glass-border)" }}>
      {([["v1", "v1"], ["v2", "v2.0"]] as const).map(([key, label]) => {
        const on = key === version;
        return (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => setResumeVersionMode(key)}
            className="dm-quiet cursor-pointer rounded-[6px] px-[9px] py-[4px] text-[10.5px] leading-[16px] font-semibold tracking-[0.06em] uppercase"
            style={{ color: on ? "var(--foreground)" : "var(--muted-foreground)", background: on ? "var(--glass-surface-2)" : "transparent" }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Per-resume "seen once this session" gate -- shared by upgrade 2 (the ATS
// check stage shows only on a resume's first check) and any other v2
// moment that should surface once per resume rather than once per app
// session. sessionStorage, not localStorage: a fresh tab/demo reset should
// see every moment again, matching how the rest of this app's one-time
// nudges are scoped to a single visit where that's the intent. Resume v2,
// 28 Sept 2026.
// ---------------------------------------------------------------------------
function seenKey(scope: string, id: string) {
  return `dreamari:resume-v2:${scope}:${id}`;
}

export function hasSeenOnce(scope: string, id: string): boolean {
  try {
    return window.sessionStorage.getItem(seenKey(scope, id)) === "1";
  } catch {
    return false;
  }
}

export function markSeenOnce(scope: string, id: string): void {
  try {
    window.sessionStorage.setItem(seenKey(scope, id), "1");
  } catch {
    /* no storage */
  }
}
