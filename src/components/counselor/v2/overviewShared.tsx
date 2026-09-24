"use client";

// Shared pieces for the role Overviews (Lead Counselor, School Administrator,
// District Administrator). Rebuilt 24 Sept 2026 under a hard budget after
// direct feedback ("so much copy and red ... everything looks super
// overwhelming. v2 ... needs to be super intuitive, skimmable, glanceable"):
//
// - One verdict per card, a phrase, not a sentence. Text stays in the
//   foreground color; only its leading dot carries the status color.
// - One line per row: name, value, bar. No chips, no distance sentences, no
//   footnotes. The bar's target tick says where 80% is.
// - Color means "below target." A row that meets its target is quiet
//   (primary-blue bar, foreground value). Amber within 10 points, red
//   further (`targetBand` in src/lib/counselorOrg.ts). Green is not painted
//   on rows at all: the absence of alarm is the signal.
// - One hero per screen carries a tint; every other card is plain glass.

import { HoverBeam } from "@/components/app/HoverBeam";
import { CardLink } from "../chips";
import { GLASS_CARD, GLASS_CARD_HERO, glowBackdrop } from "../surfaces";
import { STATUS_COLORS } from "./Overview";
import { targetBand, type TargetBand } from "@/lib/counselorOrg";

export const BAND_COLORS: Record<TargetBand, string> = {
  met: STATUS_COLORS["On Track"],
  near: STATUS_COLORS["Needs Attention"],
  missed: STATUS_COLORS["At Risk"],
};

/** The color a value wears: nothing when it meets its target. */
export function alertColor(value: number, target: number): string | undefined {
  const band = targetBand(value, target);
  return band === "met" ? undefined : BAND_COLORS[band];
}

export function OverviewCard({ title, unit, hero, tint, aside, children }: { title: string; /** one short muted qualifier, only when the title needs a unit */ unit?: string; hero?: boolean; tint?: string; aside?: React.ReactNode; children: React.ReactNode }) {
  const base = hero ? GLASS_CARD_HERO : GLASS_CARD;
  const surface = hero && tint ? { ...base, borderColor: `color-mix(in srgb, ${tint} 38%, var(--glass-border))` } : base;
  return (
    <HoverBeam strength={hero ? 0.7 : 0.6} className="h-full">
      <div className="group relative flex h-full flex-col gap-[var(--space-4)] overflow-hidden rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={surface}>
        {hero && <span aria-hidden className="pointer-events-none absolute inset-0" style={{ background: glowBackdrop(tint ?? "var(--primary)", 0.26) }} />}
        <div className="relative flex flex-wrap items-baseline justify-between gap-x-[8px] gap-y-[4px]">
          <h2 className="text-[15px] leading-[1.3] font-bold" style={{ color: "var(--foreground)" }}>
            {title}
            {unit && <span className="ml-[6px] text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{unit}</span>}
          </h2>
          {aside}
        </div>
        <div className="relative flex flex-1 flex-col gap-[var(--space-4)]">{children}</div>
      </div>
    </HoverBeam>
  );
}

/** The one line a card exists to say. Neutral text, a colored dot. */
export function Verdict({ band, children }: { band: TargetBand; children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-[8px] text-[13.5px] leading-[18px] font-bold" style={{ color: "var(--foreground)" }}>
      <span aria-hidden className="size-[8px] flex-none rounded-full" style={{ background: BAND_COLORS[band], boxShadow: `0 0 8px ${BAND_COLORS[band]}` }} />
      <span>{children}</span>
    </p>
  );
}

export { CardLink as SeeLink };

/** A thin track, a fill, a target tick. Quiet blue unless the value is
 *  below its target. */
export function RankBar({ value, target, height = 6 }: { value: number; target?: number; height?: number }) {
  const v = Math.max(0, Math.min(100, value));
  const color = (typeof target === "number" && alertColor(value, target)) || "var(--primary)";
  return (
    <span className="relative block w-full rounded-full" style={{ height, background: "rgba(255,255,255,0.08)" }} aria-hidden>
      {/* Same family as the column charts: strongest at the value end,
         fading toward the start (direct question, 25 Sept 2026). */}
      <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${v}%`, background: `linear-gradient(90deg, color-mix(in srgb, ${color} 35%, transparent), ${color})` }} />
      {typeof target === "number" && <span className="absolute top-[-3px] bottom-[-3px] w-[2px] rounded-[1px]" style={{ left: `calc(${target}% - 1px)`, background: "rgba(255,255,255,0.55)" }} />}
    </span>
  );
}

/** One row: label (and an optional muted note) left, value right, bar under.
 *  The value wears the alert color only when below target. Click-through is
 *  optional; the row looks the same either way. */
export function MetricRow({ label, note, value, target, leading, onClick }: { label: string; note?: string; value: number | null; target: number; leading?: React.ReactNode; onClick?: () => void }) {
  const color = value === null ? "var(--muted-foreground)" : alertColor(value, target) ?? "var(--foreground)";
  const body = (
    <>
      {leading}
      <span className="flex min-w-0 flex-1 flex-col gap-[6px]">
        <span className="flex items-baseline justify-between gap-[10px]">
          {/* Wraps so a long school name keeps its note under it on a phone
             instead of truncating to "Washington High S...". */}
          <span className="flex min-w-0 flex-wrap items-baseline gap-x-[6px]">
            <span className="text-[13px] font-bold" style={{ color: "var(--foreground)" }}>{label}</span>
            {note && <span className="flex-none text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{note}</span>}
          </span>
          <span className="flex-none text-[15px] leading-[1] font-extrabold tabular-nums" style={{ color }}>{value === null ? "n/a" : `${value}%`}</span>
        </span>
        <RankBar value={value ?? 0} target={target} />
      </span>
    </>
  );
  if (!onClick) return <div className="flex items-center gap-[12px]">{body}</div>;
  return (
    <button type="button" onClick={onClick} className="dm-quiet -mx-[6px] flex w-[calc(100%+12px)] cursor-pointer items-center gap-[12px] rounded-[var(--radius-sm)] px-[6px] py-[4px] text-left">
      {body}
    </button>
  );
}

/** A headline stat inside a card: number first, label under. */
export function Stat({ value, label, color }: { value: string; label: string; color?: string }) {
  return (
    <span className="flex flex-col gap-[2px]">
      <span className="text-[26px] leading-[1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: color ?? "var(--foreground)" }}>{value}</span>
      <span className="text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{label}</span>
    </span>
  );
}

/** Initials in a primary-tinted circle, for a counselor or a school. */
export function InitialsBadge({ name, size = 32 }: { name: string; size?: number }) {
  const initials = name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <span className="flex flex-none items-center justify-center rounded-full text-[11.5px] font-extrabold" style={{ width: size, height: size, background: "color-mix(in srgb, var(--primary) 22%, transparent)", color: "var(--primary)" }}>{initials}</span>
  );
}
