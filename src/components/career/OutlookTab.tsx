"use client";

// Career Detail's "Pay & Outlook" tab. Built 19 Oct 2026 as the hamburger-only
// Career outlook lab; live on /career since 20 Oct 2026, when Maisha's Slack
// review of dreamari.com asked for People Doing It, Jobs Open Each Year and
// Projected Growth to get their own place instead of the pay pop-up, and
// Chandu: "lets push it to main. Not in a hamburger link". The state
// projections below are still seeded (DEMO-ONLY in outlook.ts).
//
// Why one tab and not a sixth "Job Outlook" tab (Chandu's recommendation in
// Slack, same day): pay by state and growth by state answer the same
// question, "what does this job look like where I live?"; and six tabs no
// longer fit a Chromebook or phone tab row. CareerOneStop's occupation
// profile does the same (one location drives wages and projections); the
// BLS Occupational Outlook Handbook's split Pay / State & Area Data / Job
// Outlook tabs are the pattern avoided.
//
// The tab, top to bottom (19 Oct 2026, after Chandu's review rounds):
//   0. Pay by state: the approved live section, unchanged, rendered by
//      CareerDetailLab ("where did our pay by state/whole country map go?
//      ... that was approved so lets not edit that too much").
//   1. Outlook by state (this file): the same Your states / Whole country
//      switch as Pay by state (20 Oct 2026). Your states: growth and openings
//      tiles per state, said against the US, then the top five states for
//      one figure at a time ("the table looks very cluttered and hard to
//      read": no list shows more than one figure per row). Whole country:
//      PayMap shaded by growth or openings. Growth carries the usual up/down
//      trend arrow wherever it shows (Chandu: "just a representative icon").
//   2. Job outlook (US): the verdict and jobs over the projection years as
//      the lit line, now with real axes ("use the pretty sparkline graph we
//      did before but give it an x and y axis and more visual detail without
//      making it clutter"); the openings split bar it briefly had is gone.
//
// Sparse state data (Usman): a tile with no forecast says "No forecast yet";
// a career whose states publish none says so in one line instead of a list.

import { DISPLAY, LABEL, MEDIUM, PayViewToggle, SMALL, Section } from "@/components/actions-lab/CareerDetailLabV2";
import { PayMap } from "./PayMap";
import { Listbox } from "@/components/app/Listbox";
import { LightPoint } from "@/components/app/LightRange";
import { DEMO_HOME_STATE } from "@/components/career/statePay";
import { US_STATES } from "@/lib/studentProfile";
import { useId, useState } from "react";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { count, pct, stateOutlook, type NationalOutlook } from "./outlook";

const TINY = "text-[14px] leading-[20px]";
const AXIS = "text-[12px] leading-[16px] tabular-nums";
const CELL = "text-[16px] leading-[22px] font-semibold tabular-nums";
// a tile's figure: the largest number in the tab, still under the section
// heading (BIG, 22/26 -> 26/30) per the page's type scale
const STAT = "text-[20px] leading-[24px] font-bold tabular-nums sm:text-[24px] sm:leading-[28px]";
const PICKER = "dm-quiet h-[36px] rounded-[var(--radius-md)] border pr-[10px] pl-[12px] text-[13px] leading-[18px] font-semibold";
const PICKER_STYLE = { background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" } as const;

type Metric = "growth" | "openings";

export function OutlookTab({ slug, accent, national, picked }: {
  slug: string;
  accent: string;
  national: NationalOutlook;
  /** the student's states from Build (New Jersey for the demo) */
  picked: string[];
}) {
  return (
    <>
      <OutlookByState slug={slug} accent={accent} national={national} picked={picked} />
      <UsOutlook national={national} accent={accent} />
    </>
  );
}

// ---- 1. Outlook by state ---------------------------------------------------

function OutlookByState({ slug, accent, national, picked }: { slug: string; accent: string; national: NationalOutlook; picked: string[] }) {
  // the same two views as Pay by state just above it (Chandu, 20 Oct 2026:
  // "For outlook by state please have the same your states/map views"); the
  // state picker went with it, since the map now reaches every state
  const [view, setView] = useState<"states" | "country">("states");
  const [metric, setMetric] = useState<Metric>("growth");
  const mine = (picked.length ? picked : [DEMO_HOME_STATE]).slice(0, 3);
  const any = US_STATES.some((s) => stateOutlook(slug, s, national));

  const value = (s: string) => {
    const so = stateOutlook(slug, s, national);
    return so ? (metric === "growth" ? so.growthPct : so.openings) : undefined;
  };
  const show = (n: number) => (metric === "growth" ? pct(n) : count(n));
  const ranked = US_STATES.map((s) => ({ s, v: value(s) })).filter((r): r is { s: string; v: number } => r.v !== undefined).sort((a, b) => b.v - a.v);

  const row = (r: { s: string; v: number }, rank: number) => {
    const yours = mine.includes(r.s);
    return (
      <li key={r.s} className="flex min-w-0 items-center gap-[var(--space-3)] border-t py-[12px] first:border-t-0" style={{ borderColor: "var(--glass-border)" }}>
        <span className="w-[28px] flex-none text-[13px] leading-[18px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>#{rank}</span>
        <span className={`${SMALL} min-w-0 flex-1 truncate ${yours ? "font-semibold" : ""}`}>{r.s}</span>
        <span className={`${CELL} flex items-center gap-[6px]`} style={yours ? { color: accent } : undefined}>{metric === "growth" && <Trend pct={r.v} accent={accent} size={16} />}{show(r.v)}</span>
      </li>
    );
  };

  const metricPicker = (
    <Listbox
      ariaLabel="Show states by"
      value={metric}
      onChange={(v) => setMetric(v as Metric)}
      options={[
        { value: "growth", label: "By growth" },
        { value: "openings", label: "By openings" },
      ]}
      className={`${PICKER} w-[140px]`}
      style={PICKER_STYLE}
      panelClassName="p-[6px]"
    />
  );

  return (
    <Section id="outlook-states" title="Outlook by state" action={any ? <PayViewToggle value={view} onChange={setView} label="Outlook by state view" pill="career-outlook-view-pill" /> : undefined}>
      {!any ? (
        <p className={TINY} style={{ color: "var(--muted-foreground)" }}>States haven&apos;t shared job forecasts for this career yet.</p>
      ) : view === "states" ? (
        <div className="flex flex-col gap-[var(--space-6)]">
          <div className="flex flex-col gap-[var(--space-3)]">
            <h3 className={MEDIUM} style={{ ...DISPLAY, color: accent }}>Your states</h3>
            {mine.map((st) => {
              const o = stateOutlook(slug, st, national);
              const growVs = o ? (Math.abs(o.growthPct - national.growthPct) < 1 ? "About the same as the US" : o.growthPct > national.growthPct ? "Faster than the US" : "Slower than the US") : undefined;
              return (
                <div key={st} className="flex flex-col gap-[var(--space-2)]">
                  {mine.length > 1 && <span className={`${SMALL} font-semibold`}>{st}</span>}
                  <div className="grid grid-cols-2 gap-[var(--space-2)] sm:gap-[var(--space-3)]">
                    <Stat label={`Growth by ${national.year}${mine.length > 1 ? "" : ` in ${st}`}`} accent={accent} value={o ? pct(o.growthPct) : undefined} trend={o?.growthPct} note={growVs} />
                    <Stat label="Openings each year" accent={accent} value={o ? count(o.openings) : undefined} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex flex-col gap-[var(--space-2)]">
            <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
              <h3 className={MEDIUM} style={{ ...DISPLAY, color: accent }}>Top states</h3>
              {metricPicker}
            </div>
            <ol className="flex flex-col">{ranked.slice(0, 5).map((r, i) => row(r, i + 1))}</ol>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-[var(--space-3)]">
          {metricPicker}
          <PayMap
            typical=""
            rows={[]}
            accent={accent}
            seed={slug}
            yourState={mine[0]}
            figures={{
              values: Object.fromEntries(ranked.map((r) => [r.s, r.v])),
              format: show,
              prompt: metric === "growth" ? "Tap or hover a state to see its job growth" : "Tap or hover a state to see its openings",
              label: metric === "growth" ? `Job growth by ${national.year} by state` : "Job openings each year by state",
              icon: metric === "growth" ? (n) => <Trend pct={n} accent={accent} size={24} /> : undefined,
            }}
          />
        </div>
      )}
    </Section>
  );
}

function Stat({ label, value, note, accent, trend }: { label: string; value?: string; note?: string; accent: string; trend?: number }) {
  return (
    <div className="flex min-w-0 flex-col gap-[6px] rounded-[var(--radius-md)] border p-[var(--space-3)] sm:p-[var(--space-4)]" style={{ borderColor: "var(--glass-border)", background: "color-mix(in srgb, var(--foreground) 3%, transparent)" }}>
      <span className={`${TINY} font-semibold`} style={{ color: "var(--muted-foreground)" }}>{label}</span>
      {value ? (
        <span className={`${STAT} flex items-center gap-[8px]`} style={{ ...DISPLAY, color: accent }}>{value}{trend !== undefined && <Trend pct={trend} accent={accent} size={22} />}</span>
      ) : (
        <span className={`${SMALL} font-semibold`} style={{ color: "var(--muted-foreground)" }}>No forecast yet</span>
      )}
      {value && note && <span className="mt-auto text-[13px] leading-[18px]" style={{ color: "var(--muted-foreground)" }}>{note}</span>}
    </div>
  );
}

// ---- 2. Job outlook (US) ---------------------------------------------------

function UsOutlook({ national, accent }: { national: NationalOutlook; accent: string }) {
  return (
    <Section id="outlook" title="Job outlook">
      <p className={LABEL} style={{ ...DISPLAY, color: accent }}>{national.verdict}</p>
      <JobsChart national={national} accent={accent} />
    </Section>
  );
}

/** A tick label with just enough decimals that neighbouring ticks differ. */
const compact = (n: number, step: number) => {
  const [div, unit] = n >= 1e6 ? [1e6, "M"] : n >= 1e3 ? [1e3, "K"] : [1, ""];
  const dp = Math.max(0, Math.min(2, Math.ceil(-Math.log10(step / div) - 1e-9)));
  return `${(n / div).toFixed(dp)}${unit}`;
};

/** Round y ticks that frame [lo, hi] with some air above and below; more
 *  below when `roomBelow`, so a figure under a falling line clears the axis. */
function yTicks(lo: number, hi: number, roomBelow = false) {
  const span = Math.max(hi - lo, hi * 0.04);
  const raw = span / 2;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw;
  const start = Math.floor((lo - span * (roomBelow ? 0.6 : 0.25)) / step) * step;
  const ticks = [start, start + step, start + 2 * step];
  while (ticks[ticks.length - 1] < hi + span * 0.15) ticks.push(ticks[ticks.length - 1] + step);
  return { ticks, step };
}

// People doing the job, from the projection's base year to its target, as
// the lit line on a real scale: y ticks are round job counts zoomed to the
// data (not from zero, or a 5% change is a flat line), x ticks are years.
// BLS publishes the two ends; the line between them is the straight path
// a ten-year projection implies, so it is drawn straight, not curved.
// Drawn as LightRange draws a range (20 Oct 2026, Chandu: "the same graph
// improvement we did for what it pays popup applies everywhere including
// the outlook sections here, and tone down the color/brightness of the
// area highlight under the line"): a thin gradient line, dim at the start
// and full at the end, with a soft glow and points of light, no white core
// or bloom band (the glow kit's tube read metallic). The fill under it is a
// faint wash that fades to nothing at the floor, not the bright aurora.
function JobsChart({ national, accent }: { national: NationalOutlook; accent: string }) {
  const from = national.year - 10;
  const now = national.employment;
  const later = national.employment + national.change;
  const up = later >= now;
  const { ticks, step } = yTicks(Math.min(now, later), Math.max(now, later), !up);
  const yMin = ticks[0];
  const yMax = ticks[ticks.length - 1];
  const W = 600;
  const H = 180;
  const X = (year: number) => ((year - from) / 10) * W;
  const Y = (v: number) => H - ((v - yMin) / (yMax - yMin)) * H;
  const y0 = Y(now);
  const y1 = Y(later);
  const line = `M 0 ${y0} L ${W} ${y1}`;
  const area = `${line} L ${W} ${H} L 0 ${H} Z`;
  const years = [from, from + 5, national.year];
  const pctY = (y: number) => `${(y / H) * 100}%`;
  const tint = (p: number) => `color-mix(in srgb, ${accent} ${p}%, transparent)`;
  const gid = useId().replace(/:/g, "");
  return (
    <figure className="flex flex-col gap-[var(--space-2)]" aria-label={`People doing this job: ${count(now)} in ${from}, about ${count(later)} by ${national.year}`}>
      <div className="flex">
        {/* y axis: job counts */}
        <div className="relative w-[44px] flex-none" aria-hidden>
          {ticks.map((t) => (
            <span key={t} className={`${AXIS} absolute right-[8px] -translate-y-1/2`} style={{ top: pctY(Y(t)), color: "var(--muted-foreground)" }}>{compact(t, step)}</span>
          ))}
        </div>
        <div className="relative h-[180px] min-w-0 flex-1">
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
            {ticks.map((t) => (
              <line key={t} x1={0} x2={W} y1={Y(t)} y2={Y(t)} stroke="var(--glass-border)" strokeWidth={1} vectorEffect="non-scaling-stroke" strokeDasharray={t === yMin ? undefined : "3 5"} />
            ))}
            <defs>
              <linearGradient id={`wash-${gid}`} gradientUnits="userSpaceOnUse" x1="0" y1={Math.min(y0, y1)} x2="0" y2={H}>
                <stop offset="0%" stopColor={accent} stopOpacity={0.12} />
                <stop offset="100%" stopColor={accent} stopOpacity={0} />
              </linearGradient>
              {/* userSpaceOnUse: a bounding-box gradient paints nothing on a flat line */}
              <linearGradient id={`line-${gid}`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={W} y2="0">
                <stop offset="0%" stopColor={tint(30)} />
                <stop offset="100%" stopColor={accent} />
              </linearGradient>
            </defs>
            <path d={area} fill={`url(#wash-${gid})`} />
            {/* the glow: two soft, wide strokes (LightRange's box-shadow, in SVG), no blur filter */}
            <path d={line} fill="none" stroke={accent} strokeOpacity={0.1} strokeWidth={22} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            <path d={line} fill="none" stroke={accent} strokeOpacity={0.22} strokeWidth={8} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            <path d={line} fill="none" stroke={`url(#line-${gid})`} strokeWidth={3} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          </svg>
          {/* the two published points, in square boxes so the stretched
             plot can't squash them, each with its figure */}
          <LightPoint x="0%" y={pctY(y0)} accent={accent} dim />
          <LightPoint x="100%" y={pctY(y1)} accent={accent} />
          {/* the start figure sits on the side away from the line, the end
             figure on the open side above (or below, when it falls) */}
          <span className={`absolute left-[10px] text-left ${up ? "translate-y-[12px]" : "-translate-y-[calc(100%+12px)]"}`} style={{ top: pctY(y0) }}>
            <span className={`${CELL} block`}>{count(now)}</span>
          </span>
          <span className={`absolute right-[10px] text-right ${up ? "-translate-y-[calc(100%+12px)]" : "translate-y-[12px]"}`} style={{ top: pctY(y1) }}>
            <span className={`${CELL} block`} style={{ color: accent }}>{count(later)}</span>
            <span className={`${AXIS} block`} style={{ color: "var(--muted-foreground)" }}>{national.change >= 0 ? "+" : "−"}{count(Math.abs(national.change))} jobs</span>
          </span>
        </div>
      </div>
      {/* x axis: years */}
      <div className="relative ml-[44px] h-[16px]" aria-hidden>
        {years.map((yr, i) => (
          <span key={yr} className={`${AXIS} absolute ${i === 0 ? "" : i === years.length - 1 ? "-translate-x-full" : "-translate-x-1/2"}`} style={{ left: `${(X(yr) / W) * 100}%`, color: "var(--muted-foreground)" }}>{yr}</span>
        ))}
      </div>
      <figcaption className={TINY} style={{ color: "var(--muted-foreground)" }}>People doing this job in the US</figcaption>
    </figure>
  );
}

// Growth's direction as the usual trend arrow (20 Oct 2026, Chandu: "just a
// representative icon ... Up or down or however its usually shown"): up in
// the accent, down muted, flat for under half a percent either way.
function Trend({ pct, accent, size }: { pct: number; accent: string; size: number }) {
  const Icon = Math.abs(pct) < 0.5 ? Minus : pct > 0 ? TrendingUp : TrendingDown;
  return <Icon aria-label={Math.abs(pct) < 0.5 ? "Flat" : pct > 0 ? "Growing" : "Shrinking"} strokeWidth={2.5} style={{ width: size, height: size, flex: "none", color: pct > 0 ? accent : "var(--muted-foreground)" }} />;
}
