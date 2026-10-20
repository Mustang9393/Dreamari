"use client";

// DEMO-ONLY: the Career outlook lab's "Pay & Outlook" tab (19 Oct 2026),
// reached only from the hamburger's lab links (/outlook-lab/<slug>). The live
// Career Detail page and its Pay tab are untouched.
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
//   1. Outlook by state (this file): two tiles for the chosen state, growth
//      and openings, each said against the US; then the top five states for
//      one of them at a time ("the table looks very cluttered and hard to
//      read": no list shows more than one figure per row).
//   2. Job outlook (US): the verdict and jobs over the projection years as
//      the lit line, now with real axes ("use the pretty sparkline graph we
//      did before but give it an x and y axis and more visual detail without
//      making it clutter"); the openings split bar it briefly had is gone.
//
// Sparse state data (Usman): a tile with no forecast says "No forecast yet";
// a career whose states publish none says so in one line instead of a list.

import { DISPLAY, LABEL, SMALL, Section } from "@/components/actions-lab/CareerDetailLab";
import { Listbox } from "@/components/app/Listbox";
import { Aurora, GlowStroke, Orb } from "@/components/counselor/v4/charts/glow";
import { DEMO_HOME_STATE } from "@/components/career/statePay";
import { US_STATES } from "@/lib/studentProfile";
import { useState } from "react";
import { count, pct, stateOutlook, type NationalOutlook } from "@/components/career/outlook";

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
  const [state, setState] = useState(picked[0] ?? DEMO_HOME_STATE);
  const [metric, setMetric] = useState<Metric>("growth");
  const o = stateOutlook(slug, state, national);
  const any = US_STATES.some((s) => stateOutlook(slug, s, national));
  const growVs = o ? (Math.abs(o.growthPct - national.growthPct) < 1 ? "About the same as the US" : o.growthPct > national.growthPct ? "Faster than the US" : "Slower than the US") : undefined;

  const value = (s: string) => {
    const so = stateOutlook(slug, s, national);
    return so ? (metric === "growth" ? so.growthPct : so.openings) : undefined;
  };
  const show = (n: number) => (metric === "growth" ? pct(n) : count(n));
  const ranked = US_STATES.map((s) => ({ s, v: value(s) })).filter((r): r is { s: string; v: number } => r.v !== undefined).sort((a, b) => b.v - a.v);
  const at = ranked.findIndex((r) => r.s === state);
  const pinned = at >= 5 ? ranked[at] : null;

  const row = (r: { s: string; v: number }, rank: number) => {
    const mine = r.s === state;
    return (
      <li key={r.s} className="flex min-w-0 items-center gap-[var(--space-3)] border-t py-[12px] first:border-t-0" style={{ borderColor: "var(--glass-border)" }}>
        <span className="w-[28px] flex-none text-[13px] leading-[18px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>#{rank}</span>
        <span className={`${SMALL} min-w-0 flex-1 truncate ${mine ? "font-semibold" : ""}`}>{r.s}</span>
        <span className={CELL} style={mine ? { color: accent } : undefined}>{show(r.v)}</span>
      </li>
    );
  };

  return (
    <Section
      id="outlook-states"
      title="Outlook by state"
      action={
        <Listbox
          ariaLabel="State"
          value={state}
          onChange={setState}
          options={US_STATES.map((s) => ({ value: s, label: s }))}
          className={`${PICKER} w-[176px]`}
          style={PICKER_STYLE}
          panelClassName="p-[6px]"
        />
      }
    >
      <div className="grid grid-cols-2 gap-[var(--space-2)] sm:gap-[var(--space-3)]">
        <Stat label={`Growth by ${national.year}`} accent={accent} value={o ? pct(o.growthPct) : undefined} note={growVs} />
        <Stat label="Openings" accent={accent} value={o ? count(o.openings) : undefined} note={o ? "Each year" : undefined} />
      </div>

      {any ? (
        <div className="flex flex-col gap-[var(--space-2)]">
          <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
            <h3 className={LABEL} style={{ ...DISPLAY, color: accent }}>Top states</h3>
            <Listbox
              ariaLabel="Rank states by"
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
          </div>
          <ol className="flex flex-col">{ranked.slice(0, 5).map((r, i) => row(r, i + 1))}</ol>
          {pinned && (
            <ol className="flex flex-col border-t border-dashed pt-[var(--space-1)]" style={{ borderColor: "var(--glass-border)" }}>
              {row(pinned, at + 1)}
            </ol>
          )}
        </div>
      ) : (
        <p className={TINY} style={{ color: "var(--muted-foreground)" }}>States haven&apos;t shared job forecasts for this career yet.</p>
      )}
    </Section>
  );
}

function Stat({ label, value, note, accent }: { label: string; value?: string; note?: string; accent: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-[6px] rounded-[var(--radius-md)] border p-[var(--space-3)] sm:p-[var(--space-4)]" style={{ borderColor: "var(--glass-border)", background: "color-mix(in srgb, var(--foreground) 3%, transparent)" }}>
      <span className={`${TINY} font-semibold`} style={{ color: "var(--muted-foreground)" }}>{label}</span>
      {value ? (
        <span className={STAT} style={{ ...DISPLAY, color: accent }}>{value}</span>
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
          {/* the glow kit's light tokens are scoped to this attribute
             (glow.css); borrowing the scope keeps one kit, not a copy */}
          <svg data-counselor-version="v4" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
            {ticks.map((t) => (
              <line key={t} x1={0} x2={W} y1={Y(t)} y2={Y(t)} stroke="var(--glass-border)" strokeWidth={1} vectorEffect="non-scaling-stroke" strokeDasharray={t === yMin ? undefined : "3 5"} />
            ))}
            <Aurora d={area} box={{ x: 0, y: Math.min(y0, y1), w: W, h: H - Math.min(y0, y1) }} colors={[accent]} strength={0.4} />
            <GlowStroke d={line} color={accent} width={3} />
          </svg>
          {/* the two published points, in square boxes so the stretched
             plot can't squash them, each with its figure */}
          <Point x="0%" y={pctY(y0)} accent={accent} dim />
          <Point x="100%" y={pctY(y1)} accent={accent} />
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

function Point({ x, y, accent, dim }: { x: string; y: string; accent: string; dim?: boolean }) {
  return (
    <svg data-counselor-version="v4" viewBox="-42 -42 84 84" className="pointer-events-none absolute h-[84px] w-[84px] -translate-x-1/2 -translate-y-1/2 overflow-visible" style={{ left: x, top: y, opacity: dim ? 0.6 : 1 }} aria-hidden>
      <Orb cx={0} cy={0} r={dim ? 4 : 6} color={accent} />
    </svg>
  );
}
