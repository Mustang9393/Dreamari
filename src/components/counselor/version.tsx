"use client";

import { createContext, useContext, useEffect, useState, useSyncExternalStore } from "react";
import { COUNSELOR_ROLES, counselorAccountSnapshot, serverCounselorAccountSnapshot, subscribeCounselorAccount, writeCounselorAccount, type CounselorRole } from "@/lib/counselorAccount";
import { roleOrDefault } from "./roles";

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
// Unlike the AT&T chip (URL-only, rebuilt into every link), this one is
// remembered in localStorage: the dashboard navigates through dozens of
// `router.push("/counselor?view=...")` calls and hrefs, and threading
// `v=2` through all of them would spread demo plumbing across every
// screen. `?v=2` / `?v=1` in the URL still wins on load so a demo link can
// land on either build directly.
export type CounselorVersion = "v1" | "v2";

const STORAGE_KEY = "dreamari:counselor-version";

// `ready` flips once the real value has been read after mount. Anything
// that would redirect based on the version (CounselorApp's role-gated view
// check) waits for it: the pre-hydration render always says v1, and a
// v2-only view opened by URL must not be bounced to Overview on that
// placeholder value.
const CounselorVersionContext = createContext<{ version: CounselorVersion; ready: boolean; setVersion: (v: CounselorVersion) => void }>({
  version: "v1",
  ready: false,
  setVersion: () => {},
});

export function useCounselorVersion() {
  return useContext(CounselorVersionContext);
}

function readStored(): CounselorVersion | null {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v === "v2" || v === "v1" ? v : null;
  } catch {
    return null;
  }
}

function syncUrl(version: CounselorVersion) {
  const url = new URL(window.location.href);
  if (version === "v2") url.searchParams.set("v", "2");
  else url.searchParams.delete("v");
  window.history.replaceState(window.history.state, "", url.toString());
}

export function CounselorVersionProvider({ children }: { children: React.ReactNode }) {
  // Server and first client render always say v1 (localStorage/URL are
  // client-only), then the real value is read once after mount -- same
  // hydration-safe shape CounselorApp uses for its own signed-in gate.
  const [version, setVersionState] = useState<CounselorVersion>("v1");
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get("v");
    const fromUrl: CounselorVersion | null = param === "2" ? "v2" : param === "1" ? "v1" : null;
    const next = fromUrl ?? readStored() ?? "v1";
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

// DEMO-ONLY: short labels for the role switcher pill. The real role names
// (Settings' dropdown) are long; the pill is a demo control, not the
// product's vocabulary.
const ROLE_PILL_LABELS: Record<CounselorRole, string> = {
  "School Counselor": "Counselor",
  "Lead Counselor": "Lead",
  "School Administrator": "School admin",
  "District Administrator": "District",
};

// The dock itself. Fixed, bottom-center, out of the way of every real
// control; pointer-events only on the pills so the full-width dock never
// blocks clicks on the page around it. On v2 a second pill switches the
// signed-in role: it writes the same account record Settings' Role dropdown
// writes (src/lib/counselorAccount.ts), so the two never disagree and the
// sidebar re-renders from one source. DEMO-ONLY, like the version pill: a
// real account has one role, and this is how a demo shows all four without
// four sign-ins (same idea as Connect's role switcher).
export function CounselorVersionChip() {
  const { version, setVersion } = useCounselorVersion();
  const account = useSyncExternalStore(subscribeCounselorAccount, counselorAccountSnapshot, serverCounselorAccountSnapshot);
  const role = roleOrDefault(account.role);
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-3 z-20 flex flex-wrap justify-center gap-[6px] px-4">
      <Pills label="Dashboard version" options={[{ key: "v1", label: "v1" }, { key: "v2", label: "v2" }] as const} value={version} onChange={setVersion} />
      {version === "v2" && (
        <Pills
          label="Signed-in role"
          options={COUNSELOR_ROLES.map((r) => ({ key: r, label: ROLE_PILL_LABELS[r] }))}
          value={role}
          onChange={(r) => writeCounselorAccount({ role: r })}
        />
      )}
    </div>
  );
}
