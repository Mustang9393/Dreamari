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
// Unlike the AT&T chip (URL-only, rebuilt into every link), this one is
// remembered in localStorage: the dashboard navigates through dozens of
// `router.push("/counselor?view=...")` calls and hrefs, and threading
// `v=2` through all of them would spread demo plumbing across every
// screen. `?v=2` / `?v=1` in the URL still wins on load so a demo link can
// land on either build directly.
export type CounselorVersion = "v1" | "v2";

const STORAGE_KEY = "dreamari:counselor-version";

const CounselorVersionContext = createContext<{ version: CounselorVersion; setVersion: (v: CounselorVersion) => void }>({
  version: "v1",
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
  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get("v");
    const fromUrl: CounselorVersion | null = param === "2" ? "v2" : param === "1" ? "v1" : null;
    const next = fromUrl ?? readStored() ?? "v1";
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading client-only storage/URL after mount, same justification as CounselorApp's hydrated flag
    setVersionState(next);
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

  return <CounselorVersionContext.Provider value={{ version, setVersion }}>{children}</CounselorVersionContext.Provider>;
}

// The chip itself. Fixed, bottom-center, out of the way of every real
// control; pointer-events only on the pill so the full-width dock never
// blocks clicks on the page around it.
export function CounselorVersionChip() {
  const { version, setVersion } = useCounselorVersion();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-3 z-20 flex justify-center px-4">
      <div
        role="tablist"
        aria-label="Dashboard version"
        className="pointer-events-auto flex flex-none items-center gap-[2px] rounded-full border p-[2px] backdrop-blur-[8px]"
        style={{ borderColor: "var(--glass-border)", background: "color-mix(in srgb, var(--background) 72%, transparent)" }}
      >
        {([["v1", "v1"], ["v2", "v2"]] as const).map(([key, label]) => {
          const on = key === version;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setVersion(key)}
              className="dm-quiet cursor-pointer rounded-full px-[9px] py-[2px] text-[10.5px] leading-[16px] font-semibold tracking-[0.06em] uppercase"
              style={{ color: on ? "var(--foreground)" : "var(--muted-foreground)", background: on ? "var(--glass-surface-2)" : "transparent" }}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
