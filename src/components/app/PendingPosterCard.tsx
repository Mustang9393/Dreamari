"use client";

import { Lock } from "lucide-react";
import type { PendingCareer } from "./catalog";
import { posterTitleFont, WORLD_COLORS } from "./worlds";

// A trending slot whose career is not in the catalog yet (4 Oct 2026: Joshua's
// Top 10 names Nurse Practitioner, Physician Assistant and Data Analyst, and
// none of them has a poster photo or a Career Detail profile). Built from
// docs/COMPONENT_STATES_PLAYBOOK.md's "a card represents something not built
// yet" default: the same footprint as the real card, a lock in the same dark
// glass chip as CornerBadge, and the literal "Coming soon". Not a button and
// no hover lift, because there is no page to open. Keeps the rank honest
// instead of renumbering the careers around it. Flagged for a design pass.

function placeholderTitleSize(title: string, narrow: boolean): { fontSize: number; lineHeight: string } {
  const longest = Math.max(...title.split(/\s+/).map((word) => word.length));
  if (narrow && longest >= 12) return { fontSize: 17, lineHeight: "21px" };
  if (longest >= 10) return { fontSize: 20, lineHeight: "24px" };
  return { fontSize: 24, lineHeight: "28px" };
}

function PendingFace({ career, narrow }: { career: PendingCareer; narrow: boolean }) {
  const worldColor = WORLD_COLORS[career.world] ?? "var(--muted-foreground)";
  const size = placeholderTitleSize(career.title, narrow);
  return (
    <div
      role="img"
      aria-label={`${career.title}, coming soon`}
      className="relative flex h-full w-full flex-col items-center justify-end overflow-hidden rounded-[var(--radius-lg)] border text-center uppercase"
      style={{ borderColor: "var(--glass-border)", background: `linear-gradient(155deg, color-mix(in srgb, ${worldColor} 30%, var(--card)) 0%, var(--card) 100%)` }}
    >
      <span aria-hidden className="absolute top-[38%] left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-[8px]">
        <span className="flex size-[44px] items-center justify-center rounded-full border backdrop-blur-[6px]" style={{ background: "rgba(0,0,0,0.45)", borderColor: "rgba(255,255,255,0.4)" }}>
          <Lock className="h-[18px] w-[18px]" style={{ color: "#FFFFFF" }} />
        </span>
        <span className="text-[12px] leading-[16px] font-semibold normal-case" style={{ fontFamily: "var(--font-body)", color: "var(--muted-foreground)" }}>
          Coming soon
        </span>
      </span>
      <span aria-hidden className="relative z-[1] flex w-full flex-col items-center justify-end gap-[6px] px-[var(--space-1)] pb-[var(--space-4)]">
        <span className="w-full [overflow-wrap:normal] [word-break:keep-all]" style={{ ...posterTitleFont(career.world), fontSize: size.fontSize, lineHeight: size.lineHeight, color: "var(--poster-title)" }}>
          {career.title}
        </span>
        <span className="w-full text-[10px] leading-[14px] font-semibold tracking-[0.6px]" style={{ fontFamily: "var(--font-body)", color: worldColor }}>
          {career.world}
        </span>
      </span>
    </div>
  );
}

/** The ranked row's slot: same 220x250 box and outlined numeral as RankedPosterCard. */
export function PendingRankedCard({ career, rank }: { career: PendingCareer; rank: number }) {
  return (
    <div className="relative h-[250px] w-[220px] flex-none">
      <p
        aria-hidden
        className="absolute top-[40px] left-[34px] -translate-x-1/2 text-center text-[180px] leading-[155px] font-extrabold tracking-[-5px] whitespace-nowrap select-none"
        style={{
          fontFamily: "var(--font-display)",
          fontVariationSettings: '"opsz" 14, "wdth" 100',
          color: "var(--background)",
          WebkitTextStroke: "1.5px color-mix(in srgb, var(--foreground) 18%, transparent)",
        }}
      >
        {rank}
      </p>
      <div className="absolute top-0 left-[45px] h-[250px] w-[175px]">
        <PendingFace career={career} narrow />
      </div>
    </div>
  );
}

/** A grid cell (a row opened with View all), same box as PosterCard's `fill`. */
export function PendingPosterCard({ career }: { career: PendingCareer }) {
  return (
    <div className="relative aspect-[210/297] w-full">
      <PendingFace career={career} narrow={false} />
    </div>
  );
}
