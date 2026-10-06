"use client";

// DEMO-ONLY: Calm vs Bright palettes for v4 (7 Oct 2026). Maisha: "Maybe keep a
// version of this and create another version with different colors. It might
// also be good for me to share both with some counselors and get their input
// on which they prefer." The pill sits where the v2/v3/v4 switcher used to.
// `?palette=bright` (or `calm`) opens a version directly, so each can be sent
// as its own link. Remove once counselors have picked one.

import { useSyncExternalStore } from "react";

export type V4Palette = "calm" | "bright";
const KEY = "dreamari:counselor-palette";
const listeners = new Set<() => void>();

function read(): V4Palette {
  try {
    const param = new URLSearchParams(window.location.search).get("palette");
    if (param === "bright" || param === "calm") {
      window.localStorage.setItem(KEY, param);
      return param;
    }
    return window.localStorage.getItem(KEY) === "bright" ? "bright" : "calm";
  } catch {
    return "calm";
  }
}

function write(p: V4Palette) {
  try { window.localStorage.setItem(KEY, p); } catch { /* storage blocked: this page only */ }
  const url = new URL(window.location.href);
  if (url.searchParams.has("palette")) { url.searchParams.set("palette", p); window.history.replaceState(window.history.state, "", url.toString()); }
  listeners.forEach((l) => l());
}

export function useV4Palette(): V4Palette {
  return useSyncExternalStore((l) => { listeners.add(l); return () => { listeners.delete(l); }; }, read, () => "calm");
}

export function PaletteDock() {
  const palette = useV4Palette();
  return (
    <div className="v4-palette-dock" role="group" aria-label="Color version">
      {(["calm", "bright"] as const).map((p) => (
        <button key={p} type="button" aria-pressed={palette === p} onClick={() => write(p)}>{p === "calm" ? "Calm" : "Bright"}</button>
      ))}
    </div>
  );
}
