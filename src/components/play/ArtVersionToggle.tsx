"use client";

import type { ArtVersion } from "./ib-v2-scenes";

// DEMO-ONLY: v1/v2 comparison. The "v1 | v2" switch for a simulation's scene
// art (ib-v2-scenes.ts): on the start screen it sets the version for the run,
// and in the HUD it flips the CURRENT screen in place, so the team can compare
// sprites over rooms (v1) with Joshua's painted scenes (v2) without losing
// their place. Never part of the product: remove with ib-v2-scenes.ts once
// the team picks one.

// Renamed 14 Oct 2026 (Chandu: "make v2 > v1 and v1 > v2 and rename the new
// v2 to v0"): the painted scenes (internal 2) are now "v1" and the default;
// sprites over rooms (internal 1) are "v0". Only the labels and the default
// moved, so the internal 1 | 2 values stay as they were.
const OPTIONS: ArtVersion[] = [1, 2];
const LABEL: Record<ArtVersion, string> = { 1: "v0", 2: "v1" };

export function ArtVersionToggle({
  version,
  onChange,
  accent,
  size = "hud",
}: {
  version: ArtVersion;
  onChange: (version: ArtVersion) => void;
  accent: string;
  /** `start`: the start screen's glass pill, sized like its Back button.
   *  `hud`: the compact in-game pill on the progress row. */
  size?: "start" | "hud";
}) {
  const start = size === "start";
  return (
    <div
      role="radiogroup"
      aria-label="Scene art version"
      className={`flex flex-none items-center rounded-[11px] border ${start ? "gap-[2px] p-[3px]" : "gap-[1px] p-[2px]"}`}
      style={{
        borderColor: start ? "color-mix(in srgb, var(--foreground) 14%, transparent)" : "var(--color-glass-border-raised)",
        background: start
          ? "linear-gradient(180deg, color-mix(in srgb, var(--card) 74%, transparent), color-mix(in srgb, var(--card) 54%, transparent))"
          : "color-mix(in srgb, var(--background) 62%, transparent)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
    >
      {OPTIONS.map((option) => {
        const on = option === version;
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => {
              if (!on) onChange(option);
            }}
            className={`dm-quiet cursor-pointer rounded-[8px] font-extrabold tracking-[0.04em] tabular-nums ${
              start ? "min-h-[32px] px-[14px] text-[12.5px] leading-none" : "min-h-[22px] px-[9px] text-[10.5px] leading-none"
            }`}
            style={{
              background: on ? `linear-gradient(100deg, ${accent}, color-mix(in srgb, ${accent} 64%, white))` : "transparent",
              color: on ? "#05070f" : "var(--muted-foreground)",
            }}
          >
            {LABEL[option]}
          </button>
        );
      })}
    </div>
  );
}
