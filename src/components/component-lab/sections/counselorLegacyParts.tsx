"use client";

// DeltaChip and DonutCard, kept for the component lab when the v2 dashboard
// was deleted (7 Oct 2026: "also delete the v2 and v3 code"). v4 has no
// equivalent of either; the lab still documents them as reference parts.
// Moved verbatim from counselor/v4/Overview.tsx.

import { TrendingDown, TrendingUp } from "lucide-react";
import { SegmentedRing } from "@/components/connect/viz";
import { HoverBeam } from "@/components/app/HoverBeam";
import { StatRow } from "@/components/counselor/chips";
import { CHART_STATUS, TREND_UP } from "@/components/counselor/palette";
import { GLASS_CARD, GLASS_CARD_HERO, glowBackdrop } from "@/components/counselor/surfaces";

export function DeltaChip({ pts }: { pts: number }) {
  const up = pts >= 0;
  // Green up (direct feedback, 26 Sept 2026: "trend chips can stay green.
  // Blue is hard to read on blue"): a trend is text on a blue-tinted card,
  // so it takes the one color that reads there. Same on Engagement.
  const color = up ? TREND_UP : CHART_STATUS["Needs Attention"];
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span className="flex items-center gap-[3px] text-[11.5px] leading-[15px] font-extrabold tabular-nums" style={{ color }}>
      <Icon className="h-[12px] w-[12px]" aria-hidden />
      {up ? "+" : ""}{pts} pts <span className="font-semibold" style={{ color: "var(--muted-foreground)" }}>vs last month</span>
    </span>
  );
}

// Ring on top, bigger, legend stacked below it -- not side-by-side at the
// old 92px size (direct instruction, 23 Sept 2026: "the graph has to be
// bigger and on top, the other info below"). Centered so the ring reads as
// the card's headline number, same job a hero stat does elsewhere in this
// dashboard, with the legend as supporting detail underneath it.
// `hero` spends the one saturated, glowing surface this page has on
// exactly one card (see the surfaces-import comment above). A hero card
// also ties its glow/border to `heroTint` -- the status color itself, not
// a generic brand tint -- so the card's own color communicates the
// reading at a glance (a healthy caseload glows green, a struggling one
// would glow amber/red), the way Boltshift's one saturated hero tile
// matches what it's actually reporting rather than just being "the loud
// one." Every other donut stays the plain glass and a smaller ring, so
// there's exactly one thing the eye lands on first.
export function DonutCard({ title, caption, centerPct, centerLabel, deltaPts, rows, hero, heroTint, aside }: { title: string; /** one muted line under the title, for a reading that has no trend delta */ caption?: string; centerPct: number; centerLabel: string; deltaPts?: number; rows: { label: string; value: number; color: string; onClick?: () => void }[]; hero?: boolean; heroTint?: string; /** the card's way in, a CardLink, visible at rest */ aside?: React.ReactNode }) {
  const surface = hero ? { ...GLASS_CARD_HERO, borderColor: heroTint ? `color-mix(in srgb, ${heroTint} 38%, var(--glass-border))` : GLASS_CARD_HERO.borderColor } : GLASS_CARD;
  // Student Status and Postsecondary Plans sit in an equal-width 2-column
  // row now (both cards the same width), so their rings should read the
  // same size too (direct instruction, 26 Sept 2026) -- `hero` still
  // controls the glow/tint surface treatment, just not ring geometry.
  const ringSize = 132;
  const ringStroke = 15;
  // A quiet version of the same glow, not just a flat plain box -- "no
  // upgrade at all" was a fair read of a sidekick card that got resized but
  // kept every pixel of its old self. Low enough opacity it never competes
  // with the hero's, but the card still reads as considered, not neglected.
  const glowColor = heroTint ?? rows[0]?.color ?? "var(--primary)";
  return (
    <HoverBeam strength={0.7} className="h-full">
      <div className="group relative flex h-full flex-col gap-[var(--space-5)] overflow-hidden rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={surface}>
        <span aria-hidden className="pointer-events-none absolute inset-0" style={{ background: glowBackdrop(glowColor, hero ? 0.3 : 0.12) }} />
        <div className="relative flex flex-col gap-[2px]">
          {/* Single line always: the title truncates before the pill is
             ever forced onto its own line -- a dropped-pill wrap read as
             broken in the narrow third-column card (direct feedback, 26
             Sept 2026: "wraps the students chip badly"). */}
          <span className="flex items-center justify-between gap-[8px]">
            <h2 className="min-w-0 truncate text-[15px] leading-[1.3] font-bold" style={{ color: "var(--foreground)" }}>{title}</h2>
            <span className="flex-none">{aside}</span>
          </span>
          {/* Hand-authored, deterministic vs. last month -- same "seeded
             demo data" convention the roster itself already uses, not a
             live computation (there's no historical snapshot to compute
             it from). Direct instruction: trend deltas on the donut cards. */}
          {typeof deltaPts === "number" && <DeltaChip pts={deltaPts} />}
          {caption && <span className="text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{caption}</span>}
        </div>
        {/* flex-1 + justify-center: when the row-stretch that keeps every
           card the same height (direct instruction) leaves a shorter card
           with room to spare, the ring+legend group centers in it instead
           of sitting glued to the title with dead air below (direct
           report: "badly aligned"). */}
        <div className="relative flex flex-1 flex-col items-center justify-center gap-[var(--space-5)]">
          {/* Every category in the legend below gets its own drawn arc here
             -- not a single accent-colored ring next to an unrelated
             multi-color legend (direct feedback: "only one color is being
             represented when there's more colors in the legend"). */}
          <SegmentedRing segments={rows.map((r) => ({ value: r.value, color: r.color }))} size={ringSize} stroke={ringStroke}>
            <span className="flex flex-col items-center">
              <span className={`${hero ? "text-[32px]" : "text-[24px]"} leading-[1] font-extrabold tabular-nums`} style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{Math.round(centerPct)}%</span>
              <span className="text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{centerLabel}</span>
            </span>
          </SegmentedRing>
          <div className="flex w-full flex-col gap-[4px]">
            {rows.map((r) => <StatRow key={r.label} {...r} />)}
          </div>
        </div>
      </div>
    </HoverBeam>
  );
}
