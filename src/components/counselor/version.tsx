"use client";

import { createContext, useContext, useEffect, useState } from "react";

// DEMO-ONLY: which build of the Counselor Dashboard is showing. v1 is the
// screen-by-screen port of the Replit reference plus the three passes
// already landed on it (Overview, Students, Milestone Tracker); v2 is where
// the 24 Sept 2026 audit's changes go (docs/AI_HANDOFF.md, same date) so
// the two can be shown side by side without touching v1. Same idea as
// Connect's AT&T chip (att/VersionChip.tsx) and the Glossary Game's
// background chip, and docked bottom-center the way the Glossary Game's
// DemoControlsDock is, per the standing feedback that a demo switch in the
// top bar "gets confused with actual UI". Never part of the product.
//
// v3 (added 25 Sept 2026, direct instruction: "move our current version to
// a backup or a v3 toggle and implement the changes") is a byte-for-byte
// snapshot of v2 taken that day, before the content-audit fixes below --
// `src/components/counselor/v3/` is a straight directory copy of v2 at
// that point, never edited again. v2 keeps being where active work lands
// (as it has all session); v3 is a frozen comparison point, the same role
// "v1" plays for the Replit reference, one step later. Shell-level
// behavior (no page-title caption, the (i) button, role-based Overview)
// treats v2 and v3 identically -- both are "the new design"; only v1 is
// the old Replit-styled build -- so every such check below reads
// `version === "v1"` / `!== "v1"` rather than naming "v2" specifically.
//
// Unlike the AT&T chip (URL-only, rebuilt into every link), this one is
// remembered in localStorage: the dashboard navigates through dozens of
// `router.push("/counselor?view=...")` calls and hrefs, and threading
// `v=2` through all of them would spread demo plumbing across every
// screen. `?v=2` / `?v=1` in the URL still wins on load so a demo link can
// land on either build directly.
export type CounselorVersion = "v1" | "v2" | "v3";

// Hidden 26 Sept 2026, direct instruction ("hide v3... make sure you can
// bring it back as is on my say so"): v3 itself (every file under
// `v3/`, CounselorApp's V3View, this file's own v3 plumbing below) is
// completely untouched. Flipping this one flag back to `true` is the
// entire "bring it back": the dock's third pill reappears and `?v=3` /
// a stale `dreamari:counselor-version` of "v3" both resolve to v3 again
// exactly as they did before.
const V3_ENABLED = false;

// Hidden the same way, same day, direct instruction ("Hide v1"): v1's own
// files, CounselorApp's V1View, RoutedView's REFERENCE_VIEWS gating, all
// completely untouched. The dock's first pill is gone and `?v=1` / a
// stale stored "v1" both resolve to v2 instead; the default version
// (unset, no URL param) is v2 for the same reason. Flip back to `true`
// to bring the pill and the v1 default back exactly as they were.
const V1_ENABLED = false;
const DEFAULT_VERSION: CounselorVersion = V1_ENABLED ? "v1" : "v2";

const STORAGE_KEY = "dreamari:counselor-version";

// `ready` flips once the real value has been read after mount. Anything
// that would redirect based on the version (CounselorApp's role-gated view
// check) waits for it: the pre-hydration render always says DEFAULT_VERSION,
// and a v2-only view opened by URL must not be bounced to Overview on that
// placeholder value.
const CounselorVersionContext = createContext<{ version: CounselorVersion; ready: boolean; setVersion: (v: CounselorVersion) => void }>({
  version: DEFAULT_VERSION,
  ready: false,
  setVersion: () => {},
});

export function useCounselorVersion() {
  return useContext(CounselorVersionContext);
}

function readStored(): CounselorVersion | null {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    if (v === "v3") return V3_ENABLED ? "v3" : null;
    if (v === "v1") return V1_ENABLED ? "v1" : null;
    return v === "v2" ? v : null;
  } catch {
    return null;
  }
}

function syncUrl(version: CounselorVersion) {
  const url = new URL(window.location.href);
  if (version === DEFAULT_VERSION) url.searchParams.delete("v");
  else url.searchParams.set("v", version === "v3" ? "3" : version === "v1" ? "1" : "2");
  window.history.replaceState(window.history.state, "", url.toString());
}

export function CounselorVersionProvider({ children }: { children: React.ReactNode }) {
  // Server and first client render always say DEFAULT_VERSION
  // (localStorage/URL are client-only), then the real value is read once
  // after mount -- same hydration-safe shape CounselorApp uses for its
  // own signed-in gate.
  const [version, setVersionState] = useState<CounselorVersion>(DEFAULT_VERSION);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get("v");
    const fromUrl: CounselorVersion | null = param === "3" ? (V3_ENABLED ? "v3" : null) : param === "2" ? "v2" : param === "1" ? (V1_ENABLED ? "v1" : null) : null;
    const next = fromUrl ?? readStored() ?? DEFAULT_VERSION;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading client-only storage/URL after mount, same justification as CounselorApp's hydrated flag
    setVersionState(next);
    setReady(true);
    if (fromUrl) {
      try {
        window.localStorage.setItem(STORAGE_KEY, fromUrl);
      } catch {
        // storage blocked; the URL still carries it for this load
      }
    }
  }, []);

  const setVersion = (v: CounselorVersion) => {
    setVersionState(v);
    try {
      window.localStorage.setItem(STORAGE_KEY, v);
    } catch {
      // ignore
    }
    syncUrl(v);
  };

  return <CounselorVersionContext.Provider value={{ version, ready, setVersion }}>{children}</CounselorVersionContext.Provider>;
}

// The pill style both chips share.
const PILL = { borderColor: "var(--glass-border)", background: "color-mix(in srgb, var(--background) 72%, transparent)" } as const;

function Pills<K extends string>({ label, options, value, onChange }: { label: string; options: readonly { key: K; label: string }[]; value: K; onChange: (k: K) => void }) {
  return (
    // `max-w-full` + horizontal scroll: the four-role pill is wider than a
    // phone screen, and a centered flex child wider than its container
    // overflows on BOTH sides, so the leftmost option was clipped off.
    <div role="tablist" aria-label={label} className="pointer-events-auto flex max-w-full flex-none items-center gap-[2px] overflow-x-auto rounded-full border p-[2px] backdrop-blur-[8px] [scrollbar-width:none]" style={PILL}>
      {options.map((o) => {
        const on = o.key === value;
        return (
          <button
            key={o.key}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(o.key)}
            className="dm-quiet cursor-pointer rounded-full px-[9px] py-[2px] text-[10.5px] leading-[16px] font-semibold tracking-[0.06em] uppercase whitespace-nowrap"
            style={{ color: on ? "var(--foreground)" : "var(--muted-foreground)", background: on ? "var(--glass-surface-2)" : "transparent" }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

// The dock itself. Fixed, bottom-center, out of the way of every real
// control; pointer-events only on the pill so the full-width dock never
// blocks clicks on the page around it.
//
// 26 Sept 2026: the role switcher that used to live here as a second pill
// row moved to the sidebar's own profile-name footer (direct instruction:
// "Make the user role switcher accessible from the profile name thing in
// the footer of the side menu as a menu that pops up when you click
// there") -- see `SidebarAccount` in shell.tsx. With v1 hidden the same
// day, this dock was left showing a single, unclickable "v2" pill with
// nothing to switch to -- removed from the shell entirely the same day
// ("Remove the v2 chip from the ui we dont need it anymore"). Kept here,
// unrendered, rather than deleted: re-enabling v1 or v3 (V1_ENABLED /
// V3_ENABLED above) makes this a real switcher again the moment
// shell.tsx renders `<CounselorVersionChip />` next to `noteOpen` again.
export function CounselorVersionChip() {
  const { version, setVersion } = useCounselorVersion();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-3 z-20 flex flex-wrap justify-center gap-[6px] px-4">
      <Pills label="Dashboard version" options={[...(V1_ENABLED ? [{ key: "v1", label: "v1" }] : []), { key: "v2", label: "v2" }, ...(V3_ENABLED ? [{ key: "v3", label: "v3" }] : [])] as { key: CounselorVersion; label: string }[]} value={version} onChange={setVersion} />
    </div>
  );
}
