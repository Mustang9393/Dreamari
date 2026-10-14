"use client";

// DEMO-ONLY: which audience a professional profile is shown to -- High
// School (today's model: Follow, public boards, no messages) or College
// (adds the Message option this feature builds). A real account already
// knows its own stage (src/lib/stage.ts); this is a separate, page-local
// override so the pro profile can be demoed either way without touching the
// app-wide stage flag mentorship/other features depend on (28 Sept 2026,
// Harvard team feedback via Joshua).
//
// Mechanics copied from the Resume Builder's own version chip
// (resume/v2.tsx): in-memory state, seeded once from a read-only URL param
// (`?pov=college`), mirrored into the URL via `history.replaceState` on
// pick, never written to storage -- a fresh link always starts on High
// School unless the URL itself says otherwise. See docs/HANDOFF_INDEX.md's
// Demo vs Production section.

import { useEffect, useSyncExternalStore } from "react";
import { GraduationCap } from "lucide-react";

export type ConnectPov = "hs" | "college";

let pov: ConnectPov = "hs";
const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}
function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}
function snapshot(): ConnectPov {
  return pov;
}
function serverSnapshot(): ConnectPov {
  return "hs";
}

export function setConnectPov(next: ConnectPov) {
  pov = next;
  if (typeof window !== "undefined") {
    const url = new URL(window.location.href);
    if (next === "college") url.searchParams.set("pov", "college");
    else url.searchParams.delete("pov");
    window.history.replaceState(null, "", url.pathname + url.search);
  }
  emit();
}

export function useConnectPov(): ConnectPov {
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}

export function useInitConnectPovFromUrl() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("pov") === "college" && pov !== "college") {
      pov = "college";
      emit();
    }
  }, []);
}

/** Small muted segmented control, same visual language as the AT&T board's
 *  VersionChip / Resume's ResumeVersionChip -- never styled like a real
 *  product control. */
export function PovChip() {
  const value = useConnectPov();
  useInitConnectPovFromUrl();
  return (
    <div role="tablist" aria-label="Demo: viewer type" className="flex flex-none items-center gap-[2px] rounded-[var(--radius-sm)] border p-[2px]" style={{ borderColor: "var(--glass-border)" }}>
      {([["hs", "High school"], ["college", "College"]] as const).map(([key, label]) => {
        const on = key === value;
        return (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => setConnectPov(key)}
            className="dm-quiet flex cursor-pointer items-center gap-[4px] rounded-[4px] px-[8px] py-[3px] text-[10.5px] leading-[16px] font-semibold tracking-[0.02em]"
            style={{ color: on ? "var(--foreground)" : "var(--muted-foreground)", background: on ? "var(--glass-surface-2)" : "transparent" }}
          >
            {key === "college" && <GraduationCap className="h-3 w-3" aria-hidden />}
            {label}
          </button>
        );
      })}
    </div>
  );
}
