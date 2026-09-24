"use client";

// Shared pieces for the role Overviews (Lead Counselor, School Administrator,
// District Administrator; 24 Sept 2026). Every "how does this compare to
// its target" reading on those screens goes through here so the rule is
// stated once: met = the dashboard's On Track green, within 10 points =
// Needs Attention amber, further = At Risk red (`targetBand` in
// src/lib/counselorOrg.ts), always with an icon and a word, never color
// alone. The card frame is the same glass, glow and title block the
// counselor Overview's cards already use, so the four Overviews read as one
// product with different questions, not four products.

import { CircleAlert, CircleCheck, TriangleAlert, ChevronRight } from "lucide-react";
import { HoverBeam } from "@/components/app/HoverBeam";
import { GLASS_CARD, GLASS_CARD_HERO, glowBackdrop } from "../surfaces";
import { STATUS_COLORS } from "./Overview";
import { targetBand, type TargetBand } from "@/lib/counselorOrg";

export const BAND_COLORS: Record<TargetBand, string> = {
  met: STATUS_COLORS["On Track"],
  near: STATUS_COLORS["Needs Attention"],
  missed: STATUS_COLORS["At Risk"],
};
export const BAND_LABELS: Record<TargetBand, string> = { met: "On target", near: "Close", missed: "Behind" };
const BAND_ICONS = { met: CircleCheck, near: TriangleAlert, missed: CircleAlert } as const;
const BAND_RANK: Record<TargetBand, number> = { missed: 0, near: 1, met: 2 };

export function worstBand(bands: TargetBand[]): TargetBand {
  return bands.reduce<TargetBand>((worst, b) => (BAND_RANK[b] < BAND_RANK[worst] ? b : worst), "met");
}

/** Icon + word in the band's color. */
export function BandChip({ band, label }: { band: TargetBand; label?: string }) {
  const Icon = BAND_ICONS[band];
  const color = BAND_COLORS[band];
  return (
    <span className="inline-flex flex-none items-center gap-[4px] rounded-full px-[8px] py-[2px] text-[10.5px] font-extrabold tracking-[0.02em] uppercase whitespace-nowrap" style={{ color, background: `color-mix(in srgb, ${color} 16%, transparent)` }}>
      <Icon className="h-[11px] w-[11px]" aria-hidden />
      {label ?? BAND_LABELS[band]}
    </span>
  );
}

/** The one card frame every role-Overview card uses. `hero` spends the
 *  page's single saturated surface; `tint` colors the glow and border to
 *  the card's own reading (the worst band on it), the way the counselor
 *  Overview's Student Status hero glows its status color. */
export function OverviewCard({ title, sub, hero, tint, aside, children, className = "" }: { title: string; sub?: string; hero?: boolean; tint?: string; aside?: React.ReactNode; children: React.ReactNode; className?: string }) {
  const base = hero ? GLASS_CARD_HERO : GLASS_CARD;
  const surface = tint ? { ...base, borderColor: `color-mix(in srgb, ${tint} ${hero ? 38 : 26}%, var(--glass-border))` } : base;
  const glow = tint ?? "var(--primary)";
  return (
    <HoverBeam strength={hero ? 0.7 : 0.6} className={`h-full ${className}`}>
      <div className="relative flex h-full flex-col gap-[var(--space-4)] overflow-hidden rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={surface}>
        <span aria-hidden className="pointer-events-none absolute inset-0" style={{ background: glowBackdrop(glow, hero ? 0.28 : 0.12) }} />
        <div className="relative flex flex-wrap items-start justify-between gap-[8px]">
          <span className="flex min-w-0 flex-col gap-[2px]">
            <h2 className="text-[15px] leading-[1.3] font-bold" style={{ color: "var(--foreground)" }}>{title}</h2>
            {sub && <span className="text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{sub}</span>}
          </span>
          {aside}
        </div>
        <div className="relative flex flex-1 flex-col gap-[var(--space-4)]">{children}</div>
      </div>
    </HoverBeam>
  );
}

/** The one sentence a card exists to say, in the band's color with its
 *  icon: "Grade 11 is behind: 77% on track, 6 need attention." */
export function Verdict({ band, children }: { band: TargetBand; children: React.ReactNode }) {
  const Icon = BAND_ICONS[band];
  const color = BAND_COLORS[band];
  return (
    <p className="flex items-start gap-[6px] text-[13px] leading-[18px] font-bold" style={{ color }}>
      <Icon className="mt-[2px] h-[14px] w-[14px] flex-none" aria-hidden />
      <span>{children}</span>
    </p>
  );
}

/** A "see" affordance in the same pill language as Overview's "See all". */
export function SeeLink({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="dm-quiet flex flex-none cursor-pointer items-center gap-[2px] text-[12.5px] font-bold" style={{ color: "var(--primary)" }}>
      {children} <ChevronRight className="h-[13px] w-[13px]" aria-hidden />
    </button>
  );
}

/** A thin track with a fill and, optionally, a target tick. Single hue for
 *  the fill (magnitude is one hue); the tick is the same bronze the
 *  readiness charts use for their target line. */
export function RankBar({ value, target, color, height = 8 }: { value: number; target?: number; color: string; height?: number }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <span className="relative block w-full overflow-visible rounded-full" style={{ height, background: "rgba(255,255,255,0.08)" }} aria-hidden>
      <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${v}%`, background: `linear-gradient(90deg, color-mix(in srgb, ${color} 72%, transparent), ${color})`, boxShadow: `0 0 8px color-mix(in srgb, ${color} 45%, transparent)` }} />
      {typeof target === "number" && (
        <span className="absolute top-[-3px] bottom-[-3px] w-[2px] rounded-[1px]" style={{ left: `calc(${target}% - 1px)`, background: "#A67C2E" }} />
      )}
    </span>
  );
}

/** One metric against its target: label and value on top, the bar with the
 *  target tick under it, then the distance from target in words. `value`
 *  null means the filter left nothing to measure (no seniors in Grade 9),
 *  stated as such rather than shown as 0%. */
export function TargetRow({ label, value, target, detail, compact = false }: { label: string; value: number | null; target: number; detail?: string; compact?: boolean }) {
  const band = value === null ? "near" : targetBand(value, target);
  const color = value === null ? "var(--muted-foreground)" : BAND_COLORS[band];
  const diff = value === null ? 0 : value - target;
  const distance = value === null ? "Not measurable under this filter" : diff >= 0 ? `${diff} pts above the ${target}% target` : `${-diff} pts below the ${target}% target`;
  return (
    <div className="flex flex-col gap-[6px]">
      <div className="flex items-baseline justify-between gap-[8px]">
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-[13px] font-bold" style={{ color: "var(--foreground)" }}>{label}</span>
          {detail && !compact && <span className="truncate text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{detail}</span>}
        </span>
        <span className={`${compact ? "text-[20px]" : "text-[26px]"} leading-[1] font-extrabold tabular-nums`} style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{value === null ? "n/a" : `${value}%`}</span>
      </div>
      <RankBar value={value ?? 0} target={target} color={value === null ? "rgba(255,255,255,0.25)" : color} height={compact ? 6 : 8} />
      <span className="flex items-center gap-[6px] text-[11.5px] leading-[15px] font-bold" style={{ color }}>
        {value !== null && <BandChip band={band} />}
        <span className="font-semibold" style={{ color: value === null ? color : "var(--muted-foreground)" }}>{distance}</span>
      </span>
    </div>
  );
}

/** A three-segment status bar (On Track / Needs Attention / At Risk) with
 *  2px gaps, the same distribution mark Career Pathways uses. */
export function StatusBar({ onTrack, needsAttention, atRisk, height = 8 }: { onTrack: number; needsAttention: number; atRisk: number; height?: number }) {
  const total = Math.max(1, onTrack + needsAttention + atRisk);
  const seg = (v: number, color: string, key: string) => (v > 0 ? <span key={key} className="h-full flex-none first:rounded-l-full last:rounded-r-full" style={{ width: `${(v / total) * 100}%`, background: color }} /> : null);
  return (
    <span className="flex w-full gap-[2px] overflow-hidden rounded-full" style={{ height, background: "rgba(255,255,255,0.06)" }} aria-hidden>
      {seg(onTrack, STATUS_COLORS["On Track"], "a")}
      {seg(needsAttention, STATUS_COLORS["Needs Attention"], "b")}
      {seg(atRisk, STATUS_COLORS["At Risk"], "c")}
    </span>
  );
}

/** Initials in a primary-tinted circle, for a counselor or a school (no
 *  portrait set exists for staff, and none should be invented). */
export function InitialsBadge({ name, size = 34 }: { name: string; size?: number }) {
  const initials = name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <span className="flex flex-none items-center justify-center rounded-full text-[12px] font-extrabold" style={{ width: size, height: size, background: "color-mix(in srgb, var(--primary) 22%, transparent)", color: "var(--primary)" }}>{initials}</span>
  );
}
