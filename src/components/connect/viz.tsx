"use client";

import { useId, useState } from "react";
import { motion } from "framer-motion";
import { TrendingDown, TrendingUp } from "lucide-react";

// Small data-visual primitives for Connect's dashboards (volunteer, partner).
// One metric tile, one area chart, one ring, one meter, one segmented control,
// so every number on every dashboard is drawn the same way. Colours come from
// the caller (the person's world accent); nothing here invents a palette.

export function Segmented<K extends string>({ options, value, onChange, ariaLabel, grow = false }: { options: { key: K; label: string; /** unread count, shown as a small badge after the label */ badge?: number }[]; value: K; onChange: (key: K) => void; ariaLabel: string; grow?: boolean }) {
  // The filled pill slides between options via a shared layoutId instead of
  // just appearing under whichever one is active (direct feedback: "have
  // whatever highlight we end up keeping for tabs... animate and slide over
  // when we switch"). `uid` scopes the layoutId to this one Segmented
  // instance -- this component is reused all over the app, sometimes two at
  // once on the same screen, and a shared string would make unrelated
  // pills animate into each other.
  const uid = useId();
  return (
    <div role="tablist" aria-label={ariaLabel} className={`flex max-w-full gap-[2px] overflow-x-auto rounded-[var(--radius-md)] border p-[3px] [scrollbar-width:none] ${grow ? "w-full" : "w-fit"}`} style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)" }}>
      {options.map((option) => {
        const on = option.key === value;
        return (
          <button
            key={option.key}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(option.key)}
            className={`dm-quiet relative flex min-h-[34px] cursor-pointer items-center justify-center rounded-[var(--radius-sm)] px-[14px] text-[13px] leading-[18px] font-semibold whitespace-nowrap ${grow ? "flex-1" : "flex-none"}`}
            style={{ color: on ? "#FFFFFF" : "var(--muted-foreground)" }}
          >
            {on && (
              <motion.span
                layoutId={`segmented-pill-${uid}`}
                aria-hidden
                className="absolute inset-0 rounded-[var(--radius-sm)]"
                style={{ background: "var(--primary)" }}
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
            <span className="relative flex items-center gap-[6px]">
              {option.label}
              {!!option.badge && <span aria-label={`${option.badge} unread`} className="flex h-[16px] min-w-[16px] items-center justify-center rounded-full px-[4px] text-[10.5px] leading-none font-extrabold tabular-nums" style={{ background: on ? "#FFFFFF" : "var(--primary)", color: on ? "var(--primary)" : "#FFFFFF" }}>{option.badge}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** Rules for one cell of a ruled metric grid: a hairline to the left of
 *  every cell that is not first in its row and above every cell that is
 *  not in the first row, at both column counts (2 below sm, `sm` at sm+).
 *  Each edge resolves to one class set, so the two breakpoints never fight. */
export function ruledCell(i: number, sm: number): string {
  const leftBase = i % 2 === 1;
  const leftSm = i % sm !== 0;
  const topBase = i >= 2;
  const topSm = i >= sm;
  const left = leftBase && leftSm ? "border-l" : leftBase ? "border-l sm:border-l-0" : leftSm ? "sm:border-l" : "";
  const top = topBase && topSm ? "border-t" : topBase ? "border-t sm:border-t-0" : topSm ? "sm:border-t" : "";
  return `px-[var(--space-3)] py-[var(--space-4)] ${left} ${top}`.trim();
}

type Icon = React.ComponentType<{ className?: string; "aria-hidden"?: boolean; style?: React.CSSProperties }>;

/** Value, label, and how it moved: the creator-analytics tile every volunteer
 *  already knows from Instagram and TikTok. The icon carries the accent so
 *  six tiles scan as six different things, not six numbers. */
export function MetricTile({ icon: TileIcon, value, label, delta, accent }: { icon: Icon; value: string; label: string; delta?: number; accent: string }) {
  const up = (delta ?? 0) >= 0;
  return (
    // one tight group: icon at the left, the figure with its change on one
    // line, the label under the figure. Nothing floats to the far corner.
    <div className="flex items-start gap-[12px]">
      <span
        className="mt-[2px] flex size-[36px] flex-none items-center justify-center rounded-[var(--radius-sm)]"
        style={{ background: `linear-gradient(155deg, color-mix(in srgb, ${accent} 30%, transparent), color-mix(in srgb, ${accent} 12%, transparent))`, boxShadow: `0 0 14px -2px color-mix(in srgb, ${accent} 55%, transparent), inset 0 1px 0 0 color-mix(in srgb, #FFFFFF 20%, transparent)`, color: accent }}
      >
        <TileIcon className="h-[18px] w-[18px]" aria-hidden />
      </span>
      <div className="flex min-w-0 flex-col gap-[2px]">
        {/* the change sits under the figure on phones and tablets and beside
           it from md up: one arrangement per width, so no tile ever wraps
           differently from its neighbours */}
        <span className="flex flex-col items-start gap-[1px] md:flex-row md:flex-nowrap md:items-baseline md:gap-x-[8px]">
          <span className="text-[24px] leading-[28px] font-extrabold tabular-nums whitespace-nowrap" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{value}</span>
          {typeof delta === "number" && (
            <span className="flex items-center gap-[3px] text-[12px] leading-[16px] font-bold tabular-nums whitespace-nowrap" style={{ color: up ? "var(--world-food-farming-nature)" : "var(--world-business-money-office)" }}>
              {up ? <TrendingUp className="h-3 w-3" aria-hidden /> : <TrendingDown className="h-3 w-3" aria-hidden />}
              {up ? "+" : ""}{delta}%
            </span>
          )}
        </span>
        <span className="text-[12.5px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{label}</span>
      </div>
    </div>
  );
}

/** Deterministic daily series for the demo: a gentle upward trend with a
 *  weekly rhythm, seeded so it never flickers between renders. */
export function demoSeries(seed: string, days: number, base: number): number[] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
  const out: number[] = [];
  for (let d = 0; d < days; d++) {
    h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0;
    const noise = ((h % 1000) / 1000 - 0.5) * base * 0.5;
    const week = Math.sin((d / 7) * Math.PI * 2) * base * 0.15;
    const trend = base * 0.6 + (d / Math.max(1, days - 1)) * base * 0.7;
    out.push(Math.max(2, Math.round(trend + week + noise)));
  }
  return out;
}

/** One area chart, no library: line, soft fill, the last point marked, the
 *  peak labelled, three time labels under it. */
export function AreaChart({ points, accent, height = 160, labels }: { points: number[]; accent: string; height?: number; labels: [string, string, string] }) {
  const id = useId().replace(/:/g, "");
  const W = 600;
  const H = height;
  const padX = 8;
  const padTop = 22;
  const padBottom = 8;
  const max = Math.max(...points);
  const min = 0;
  const x = (i: number) => padX + (i / Math.max(1, points.length - 1)) * (W - padX * 2);
  const y = (v: number) => padTop + (1 - (v - min) / Math.max(1, max - min)) * (H - padTop - padBottom);
  const line = points.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
  const area = `${line} L${x(points.length - 1).toFixed(1)} ${(H - padBottom).toFixed(1)} L${x(0).toFixed(1)} ${(H - padBottom).toFixed(1)} Z`;
  const peak = points.indexOf(max);
  const last = points.length - 1;
  const total = points.reduce((a, b) => a + b, 0);
  return (
    <figure className="m-0 flex flex-col gap-[6px]">
      {/* preserveAspectRatio="none" on a FIXED 600:H viewBox, rendered at a
         fluid w-full but a separately fixed pixel `height`, stretched the
         coordinate system non-uniformly on every render whose real aspect
         ratio didn't happen to match 600:H -- bars, the line, dots and text
         all skewed by different amounts on each axis (direct report: "the
         numbers, dots, lines etc seem squished or skewed"). Dropping the
         override (back to the SVG default, which preserves aspect ratio)
         and sizing the box with `aspect-ratio` instead of a fixed height
         keeps the whole chart scaling as ONE uniform shape at any width. */}
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${total.toLocaleString("en-US")} students reached; peak ${max} in one day`} className="h-auto w-full overflow-visible" style={{ aspectRatio: `${W} / ${H}` }}>
        <defs>
          <linearGradient id={`fill-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity="0.5" />
            <stop offset="55%" stopColor={accent} stopOpacity="0.12" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`line-${id}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={accent} stopOpacity="0.7" />
            <stop offset="100%" stopColor={accent} stopOpacity="1" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((t) => (
          <line key={t} x1={padX} x2={W - padX} y1={padTop + t * (H - padTop - padBottom)} y2={padTop + t * (H - padTop - padBottom)} stroke="color-mix(in srgb, var(--foreground) 10%, transparent)" strokeWidth="1" />
        ))}
        <path d={area} fill={`url(#fill-${id})`} />
        <path d={line} fill="none" stroke={`url(#line-${id})`} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" style={{ filter: `drop-shadow(0 0 6px color-mix(in srgb, ${accent} 60%, transparent))` }} />
        <circle cx={x(last)} cy={y(points[last])} r="9" fill={accent} opacity="0.25" />
        <circle cx={x(last)} cy={y(points[last])} r="5" fill={accent} stroke="#0e0c20" strokeWidth="2" vectorEffect="non-scaling-stroke" style={{ filter: `drop-shadow(0 0 5px ${accent})` }} />
        {/* Peak called out with a pinned label on a leader line down to a
           dot on the curve, not a bare number floating over the line --
           same device the Orbit reference uses for its own peak markers. */}
        {(() => {
          const px = x(peak);
          const py = y(max);
          const cx = Math.min(W - 44, Math.max(44, px));
          const boxY = Math.max(2, py - 28);
          return (
            <g>
              <line x1={px} x2={px} y1={boxY + 18} y2={py - 6} stroke={accent} strokeWidth="1.5" strokeDasharray="2 3" opacity="0.7" />
              {/* peak already has its own dot when it's also the latest
                 point (the end-dot above); a distinct in-between peak gets
                 one of its own, on the leader line down to the curve. */}
              {peak !== last && <circle cx={px} cy={py} r="4" fill={accent} stroke="#0e0c20" strokeWidth="1.5" vectorEffect="non-scaling-stroke" style={{ filter: `drop-shadow(0 0 4px ${accent})` }} />}
              <rect x={cx - 22} y={boxY} width="44" height="18" rx="5" fill="#0e0c20" stroke="rgba(255,255,255,0.14)" />
              <text x={cx} y={boxY + 12.5} textAnchor="middle" style={{ fontSize: 11, fontWeight: 800, fill: "var(--foreground)", fontFamily: "var(--font-body)" }}>{max}</text>
            </g>
          );
        })()}
      </svg>
      <figcaption className="flex justify-between text-[11.5px] leading-[15px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
        <span>{labels[0]}</span><span>{labels[1]}</span><span>{labels[2]}</span>
      </figcaption>
    </figure>
  );
}

/** Grouped vertical bars, no library -- the one chart shape AreaChart/Ring/
 *  Meter don't already cover (category-by-series comparisons: readiness by
 *  grade, logins by month). Each series gets its own accent and a swatch in
 *  the legend row below; bars are drawn to `max` (percent charts pass 100,
 *  count charts pass their own ceiling). A missing/zero value in a series
 *  just draws no bar for that slot -- matches the reference's own "Gr. 9"
 *  columns with nothing plotted yet. */
export function BarChart({ groups, series, height = 220, max = 100, valueSuffix = "%", barColors, targetLine, barStyle = "segmented" }: { groups: string[]; series: { label: string; accent: string; values: number[] }[]; height?: number; max?: number; valueSuffix?: string; barColors?: string[]; /** a soft, gradient-shaded "target zone" from this value to the top of the chart, with a dashed reference line -- e.g. a district benchmark */ targetLine?: { value: number; label: string; color?: string }; /** "segmented" is the equalizer stack Connect uses; "solid" is one rounded bar with a vertical gradient, bright at the top fading toward the baseline (the Counselor Dashboard's v2 mark). */ barStyle?: "segmented" | "solid" }) {
  const W = 600;
  const H = height;
  // Left margin wide enough for real y-axis tick labels (0/25/50/75/100%) --
  // the chart had no value axis at all before, just bare gridlines, which
  // read as unfinished (direct feedback: "why aren't you trying any changes
  // to... layout"). Right margin stays tighter since nothing anchors there.
  const padLeft = 34;
  const padRight = 12;
  const padTop = 22;
  const padBottom = 24;
  const plotH = H - padTop - padBottom;
  const plotW = W - padLeft - padRight;
  const groupW = plotW / Math.max(1, groups.length);
  const barGap = 4;
  // barColors: one full-width, distinctly colored bar per group instead of
  // series.length bars -- for a single-series chart where each category
  // (not each series) carries its own meaning/color, e.g. a status
  // breakdown (approved/pending/overdue). Only meaningful with one series.
  const perGroupColor = barColors && series.length === 1;
  // Capped, not stretched to fill the group's own slot -- bars were reading
  // as thick, wall-to-wall blocks with no air between groups (dataviz spec:
  // "cap it -- never fill the slot; let the band's leftover be air"). The
  // (now narrower) cluster is centered in the group instead of left-packed,
  // so the extra room becomes breathing space on both sides, not a gap on
  // one side only.
  const MAX_BAR_W = 34;
  const idealClusterW = perGroupColor ? groupW - barGap * 2 : groupW - barGap * (series.length + 1);
  const barCount = perGroupColor ? 1 : series.length;
  const barW = Math.max(4, Math.min(MAX_BAR_W, idealClusterW / barCount));
  const clusterW = barCount * barW + barGap * (barCount - 1);
  const clusterOffset = Math.max(barGap, (groupW - clusterW) / 2);
  const y = (v: number) => padTop + (1 - Math.max(0, Math.min(max, v)) / max) * plotH;
  const targetY = targetLine ? y(targetLine.value) : null;
  const targetColor = targetLine?.color ?? "var(--muted-foreground)";
  // Hover/focus layer -- a bar chart is interactive by default (dataviz
  // spec: "ship a per-mark hover tooltip on bar/dot/cell"), and the two
  // reference dashboards this was benchmarked against (Northline, Orbit)
  // both use exactly this: the active bar reads clearly against its
  // neighbours and a small tooltip states the precise value instead of
  // making the reader eyeball the axis. `si` is always 0 in perGroupColor
  // mode (one bar per group, not one per series).
  const [hover, setHover] = useState<{ gi: number; si: number } | null>(null);
  const hoveredBar = hover
    ? perGroupColor
      ? { value: series[0].values[hover.gi] ?? 0, color: barColors![hover.gi], groupLabel: groups[hover.gi], seriesLabel: null as string | null }
      : { value: series[hover.si].values[hover.gi] ?? 0, color: series[hover.si].accent, groupLabel: groups[hover.gi], seriesLabel: series.length > 1 ? series[hover.si].label : null }
    : null;
  const baseline = H - padBottom;
  // Segmented/equalizer bars, not a single solid rectangle -- pulled
  // directly from the reference dashboards (Crextio's mini progress
  // chart, Relatelwise's gradient task bar): a stack of small rounded
  // pill segments reads as a considered, textured mark instead of a flat
  // block, and it does the "brighter up top, fading down, never to zero"
  // request (direct feedback) as a real structural property of the bar
  // rather than a single CSS gradient. Unfilled segments above the value
  // stay lit at a faint tint of the same color -- a "track" showing the
  // bar's full possible range, same device Crextio uses.
  const SEG_H = 5;
  const SEG_GAP = 3;
  const SEG_PITCH = SEG_H + SEG_GAP;
  const segCount = Math.max(1, Math.floor(plotH / SEG_PITCH));
  // A plain function that RETURNS an element, called inline -- not a
  // `<SegmentedBar/>` used as a JSX component. Defining a component
  // function inside another component's body gives it a fresh identity on
  // every render, and React treats a fresh identity as a different
  // component TYPE -- so every hover-state change (which re-renders
  // BarChart) would unmount and remount every single bar's DOM, including
  // the hit-target rect currently under the cursor, breaking hover before
  // it could ever visually register. Calling this as a plain function
  // avoids that: React never sees it as its own component boundary.
  const gradId = useId().replace(/:/g, "");
  function renderSegmentedBar({ barX, barValueY, color, dim, onEnter, onLeave, ariaLabel }: { barX: number; barValueY: number; color: string; dim: boolean; onEnter: () => void; onLeave: () => void; ariaLabel: string }) {
    if (barStyle === "solid") {
      // One bar, one gradient: the series color at full strength at the
      // top of the bar, fading toward transparent at the baseline (direct
      // feedback, 25 Sept 2026:
      // "lose the equalizer style graphs, just do a blueish tinted one
      // with gradient running brighter to top and more transparent
      // towards bottom"). No track behind the bar: a faint full-height
      // column read as the old equalizer's ghost. The gradient is in
      // bar-space so a short bar and a tall bar both fade over their own
      // height.
      const id = `bar-${gradId}-${color.replace(/[^a-zA-Z0-9]/g, "")}`;
      const h = Math.max(2, baseline - barValueY);
      return (
        <g style={{ opacity: dim ? 0.4 : 1, transition: "opacity 120ms ease" }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="1" />
              <stop offset="100%" stopColor={color} stopOpacity="0.12" />
            </linearGradient>
          </defs>
          <rect x={barX} y={barValueY} width={barW} height={h} rx={4} fill={`url(#${id})`} />
          <rect
            x={barX} y={padTop} width={barW} height={plotH}
            fill="transparent" style={{ cursor: "pointer" }}
            tabIndex={0} role="button" aria-label={ariaLabel}
            onMouseEnter={onEnter} onMouseLeave={onLeave} onFocus={onEnter} onBlur={onLeave}
          />
        </g>
      );
    }
    const filled: number[] = [];
    for (let i = 0; i < segCount; i++) {
      const segBottom = baseline - i * SEG_PITCH;
      const segTop = segBottom - SEG_H;
      if (segTop >= barValueY - 0.5) filled.push(i);
    }
    return (
      <g style={{ opacity: dim ? 0.4 : 1, transition: "opacity 120ms ease" }}>
        {Array.from({ length: segCount }, (_, i) => {
          const segBottom = baseline - i * SEG_PITCH;
          const segTop = segBottom - SEG_H;
          const isFilled = filled.includes(i);
          const t = filled.length > 1 ? filled.indexOf(i) / (filled.length - 1) : 1;
          const opacity = isFilled ? 0.28 + t * 0.72 : 0.12;
          return <rect key={i} x={barX} y={segTop} width={barW} height={SEG_H} rx={2.5} fill={color} opacity={opacity} />;
        })}
        <rect
          x={barX} y={padTop} width={barW} height={plotH}
          fill="transparent" style={{ cursor: "pointer" }}
          tabIndex={0} role="button" aria-label={ariaLabel}
          onMouseEnter={onEnter} onMouseLeave={onLeave} onFocus={onEnter} onBlur={onLeave}
        />
      </g>
    );
  }
  return (
    <figure className="m-0 flex flex-col gap-[10px]">
      {/* Same preserveAspectRatio="none" distortion as AreaChart -- fixed
         here the same way, by aspect-ratio sizing instead of forcing a
         non-uniform stretch on every axis (direct report: "squished or
         skewed"). */}
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Bar chart: ${series.map((s) => s.label).join(", ")} by ${groups.join(", ")}${targetLine ? `; target ${targetLine.value}${valueSuffix}` : ""}`} className="h-auto w-full overflow-visible" style={{ aspectRatio: `${W} / ${H}` }}>
        {/* Y-axis: gridlines now carry their own value, not just faint
           unlabeled hairlines -- a chart with no axis reads as unfinished. */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <g key={t}>
            <line x1={padLeft} x2={W - padRight} y1={padTop + t * plotH} y2={padTop + t * plotH} stroke="color-mix(in srgb, var(--foreground) 10%, transparent)" strokeWidth="1" />
            <text x={padLeft - 8} y={padTop + t * plotH + 3.5} textAnchor="end" style={{ fontSize: 10, fontWeight: 600, fill: "var(--muted-foreground)", fontFamily: "var(--font-body)" }}>
              {Math.round(max * (1 - t))}{valueSuffix}
            </text>
          </g>
        ))}
        {/* Just the dashed reference line, named in the legend below --
           the gradient wash tried above it (twice) never sat right: an
           SVG rect can't be pinned to an HTML header's own border, and
           anchoring it inside the plot instead boxed in whatever bar
           label happened to be near the target value (direct reports:
           "getting clipped", then "the frame starts where the 100% number
           is", then "it looks really bad, maybe it should be removed").
           A precise line has no such alignment problem. */}
        {targetLine && targetY !== null && (
          <line x1={padLeft} x2={W - padRight} y1={targetY} y2={targetY} stroke={targetColor} strokeWidth="2" strokeDasharray="6 4" opacity="1" vectorEffect="non-scaling-stroke" />
        )}
        {groups.map((label, gi) => {
          const rawGroupX = padLeft + gi * groupW;
          const groupX = rawGroupX + clusterOffset;
          const labelCenterX = rawGroupX + groupW / 2;
          if (perGroupColor) {
            const v = series[0].values[gi] ?? 0;
            const color = barColors[gi];
            const barX = groupX + barGap;
            const barY = y(v);
            const dim = hover !== null && hover.gi !== gi;
            return (
              <g key={label}>
                {v > 0 && (
                  <>
                    {renderSegmentedBar({
                      barX, barValueY: barY, color, dim,
                      ariaLabel: `${label}: ${Math.round(v)}${valueSuffix}`,
                      onEnter: () => setHover({ gi, si: 0 }), onLeave: () => setHover(null),
                    })}
                    <text x={barX + barW / 2} y={barY - 6} textAnchor="middle" style={{ fontSize: 11, fontWeight: 800, fill: "var(--foreground)", fontFamily: "var(--font-body)" }}>
                      {Math.round(v)}{valueSuffix}
                    </text>
                  </>
                )}
                <text x={labelCenterX} y={H - 6} textAnchor="middle" style={{ fontSize: 11.5, fontWeight: 600, fill: "var(--muted-foreground)", fontFamily: "var(--font-body)" }}>
                  {label}
                </text>
              </g>
            );
          }
          return (
            <g key={label}>
              {series.map((s, si) => {
                const v = s.values[gi] ?? 0;
                if (v <= 0) return null;
                const barX = groupX + barGap + si * (barW + barGap);
                const barY = y(v);
                const dim = hover !== null && (hover.gi !== gi || hover.si !== si);
                return (
                  <g key={s.label}>
                    {renderSegmentedBar({
                      barX, barValueY: barY, color: s.accent, dim,
                      ariaLabel: `${label}, ${s.label}: ${Math.round(v)}${valueSuffix}`,
                      onEnter: () => setHover({ gi, si }), onLeave: () => setHover(null),
                    })}
                    <text x={barX + barW / 2} y={barY - 6} textAnchor="middle" style={{ fontSize: 11, fontWeight: 800, fill: "var(--foreground)", fontFamily: "var(--font-body)" }}>
                      {Math.round(v)}{valueSuffix}
                    </text>
                  </g>
                );
              })}
              <text x={labelCenterX} y={H - 6} textAnchor="middle" style={{ fontSize: 11.5, fontWeight: 600, fill: "var(--muted-foreground)", fontFamily: "var(--font-body)" }}>
                {label}
              </text>
            </g>
          );
        })}
        {/* Pinned callout above the hovered/focused bar -- same device as
           the Orbit reference's "$120K" peak label: a small rounded box on
           a leader line, naming exactly what's under the cursor instead of
           making the reader trace back to the axis. */}
        {hover && hoveredBar && (() => {
          const gX = padLeft + hover.gi * groupW + clusterOffset;
          const bX = perGroupColor ? gX + barGap : gX + barGap + hover.si * (barW + barGap);
          const bY = y(hoveredBar.value);
          const cx = Math.min(W - padRight - 62, Math.max(padLeft + 62, bX + barW / 2));
          const boxY = Math.max(2, bY - 34);
          const text = hoveredBar.seriesLabel ? `${hoveredBar.groupLabel} · ${hoveredBar.seriesLabel}` : hoveredBar.groupLabel;
          return (
            <g style={{ pointerEvents: "none" }}>
              <line x1={bX + barW / 2} x2={bX + barW / 2} y1={boxY + 20} y2={bY} stroke={hoveredBar.color} strokeWidth="1.5" strokeDasharray="2 3" opacity="0.7" />
              <circle cx={bX + barW / 2} cy={bY} r="3" fill={hoveredBar.color} stroke="var(--card)" strokeWidth="1.5" />
              <rect x={cx - 60} y={boxY} width="120" height="20" rx="6" fill="var(--card)" stroke="var(--glass-border)" />
              <text x={cx} y={boxY + 13.5} textAnchor="middle" style={{ fontSize: 10.5, fontWeight: 700, fill: "var(--foreground)", fontFamily: "var(--font-body)" }}>
                {text}: {Math.round(hoveredBar.value)}{valueSuffix}
              </text>
            </g>
          );
        })()}
      </svg>
      {(series.length > 1 || targetLine) && (
        <div className="flex flex-wrap gap-x-[16px] gap-y-[4px]">
          {series.length > 1 && series.map((s) => (
            <span key={s.label} className="flex items-center gap-[6px] text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
              <span aria-hidden className="size-[9px] flex-none rounded-[2px]" style={{ background: s.accent }} />
              {s.label}
            </span>
          ))}
          {targetLine && (
            <span className="flex items-center gap-[6px] text-[12px] leading-[16px] font-semibold" style={{ color: targetColor }}>
              <span aria-hidden className="h-0 w-[14px] flex-none border-t-2" style={{ borderColor: targetColor, borderStyle: "dashed" }} />
              {targetLine.label}: {targetLine.value}{valueSuffix}
            </span>
          )}
        </div>
      )}
    </figure>
  );
}

/** Progress toward a goal as a ring, the number inside. A soft glow and a
 *  gradient sweep (not a flat stroke) so the ring reads as lit, not drawn --
 *  the same "glassy/glow" language the rest of the dashboard uses. */
export function Ring({ pct, size = 84, stroke = 8, accent, children }: { pct: number; size?: number; stroke?: number; accent: string; children?: React.ReactNode }) {
  const id = useId().replace(/:/g, "");
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <span className="relative inline-flex flex-none items-center justify-center" style={{ width: size, height: size }} role="img" aria-label={`${Math.round(clamped)} percent`}>
      <span aria-hidden className="absolute inset-[-14%] rounded-full opacity-70 blur-[16px]" style={{ background: `radial-gradient(circle, color-mix(in srgb, ${accent} 45%, transparent), transparent 70%)` }} />
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 -rotate-90 overflow-visible">
        <defs>
          <linearGradient id={`ring-grad-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={accent} stopOpacity="0.65" />
            <stop offset="100%" stopColor={accent} stopOpacity="1" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#ring-grad-${id})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${(clamped / 100) * c} ${c}`}
          style={{ filter: `drop-shadow(0 0 6px color-mix(in srgb, ${accent} 70%, transparent))` }}
        />
      </svg>
      <span className="relative text-center">{children}</span>
    </span>
  );
}

/** A real multi-segment donut -- every category in the legend gets its own
 *  drawn arc, sized to its share of the total, each with its own gradient
 *  and glow. Replaces a single-value Ring wherever the number actually
 *  breaks down into more than one category (Student Status, Postsecondary
 *  Plans, Career Pathways, ...) -- a single green arc next to a 3-color
 *  legend was misleading: only one of the three values was ever drawn. */
export function SegmentedRing({ segments, size = 92, stroke = 10, children }: { segments: { value: number; color: string }[]; size?: number; stroke?: number; children?: React.ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const total = Math.max(1, segments.reduce((sum, s) => sum + Math.max(0, s.value), 0));
  // Widened from 2.5deg -- each arc's own glow blurs 5px outward, which at
  // the old gap (~2-3px on these ring sizes) was WIDER than the gap
  // itself, so two adjacent segments' glows always overlapped and blended
  // into a muddy, hard-to-place color at every seam (direct report: "the
  // overlapping colors are being too transparent so that causes
  // confusion"). The gap now clears the glow's own reach instead of
  // fighting it.
  const gapDeg = segments.filter((s) => s.value > 0).length > 1 ? 4.5 : 0;
  const arcs = segments
    .filter((s) => s.value > 0)
    .reduce<{ color: string; value: number; key: string; arcLen: number; offset: number; cursorDeg: number }[]>((acc, s, i) => {
      const cursorDeg = acc.length > 0 ? acc[acc.length - 1].cursorDeg : 0;
      const frac = s.value / total;
      const arcLen = Math.max(0, frac * c - (gapDeg / 360) * c);
      const offset = -(cursorDeg / 360) * c;
      acc.push({ ...s, key: `${s.color}-${i}`, arcLen, offset, cursorDeg: cursorDeg + frac * 360 });
      return acc;
    }, []);
  return (
    <span className="relative inline-flex flex-none items-center justify-center" style={{ width: size, height: size }} role="img" aria-label={segments.map((s) => `${s.value}`).join(", ")}>
      {arcs.length > 0 && (
        <span aria-hidden className="absolute inset-[-14%] rounded-full opacity-60 blur-[16px]" style={{ background: `radial-gradient(circle, color-mix(in srgb, ${arcs[0].color} 45%, transparent), transparent 70%)` }} />
      )}
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 -rotate-90 overflow-visible">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={stroke} />
        {arcs.map((a) => (
          <circle
            key={a.key}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            // Flat color, not the linear gradient this used to route
            // through -- a `linearGradient` is a flat diagonal projected
            // onto a ROTATED, CURVED stroke, so its opacity/color at any
            // point on the arc depended on that point's x/y position
            // relative to the diagonal, not on where it sits along the
            // arc. That's what was actually producing the pale patches
            // (direct report, with a screenshot: "this is transparency"),
            // not just the glow bleed already fixed above. A flat color
            // has no such geometry-dependent variation.
            stroke={a.color}
            strokeWidth={stroke}
            // Round caps + this filter's blur wash out disproportionately
            // on a small rounded tip vs. the arc's long straight body --
            // the same pale-blob artifact, worse once the gap widened
            // enough to show it in open space rather than tucked against
            // a neighbor. Flat (butt) caps at segment boundaries are the
            // standard treatment for a multi-category ring anyway (GitHub's
            // contribution ring, Apple's activity rings both do this) --
            // rounded pill-ends belong on a single unbroken arc (see
            // Ring, above), not between distinct categories.
            strokeLinecap="butt"
            strokeDasharray={`${a.arcLen} ${c}`}
            strokeDashoffset={a.offset}
            // Tighter and fainter than before (5px @ 65% -> 3px @ 45%) so
            // the glow's own reach stays inside the now-wider gap instead
            // of bridging it into the next segment's color.
            style={{ filter: `drop-shadow(0 0 3px color-mix(in srgb, ${a.color} 45%, transparent))` }}
          />
        ))}
      </svg>
      <span className="relative text-center">{children}</span>
    </span>
  );
}

/** A fill meter: value of max, as a bar with the figure beside it. A
 *  gradient fill plus a soft glow so even a small inline bar reads as part
 *  of the same lit-glass language as the bigger charts. */
export function Meter({ value, max, accent, label }: { value: number; max: number; accent: string; label?: string }) {
  const pct = Math.max(0, Math.min(100, Math.round((value / Math.max(1, max)) * 100)));
  return (
    <span className="flex items-center gap-[8px]" aria-label={`${label ? label + ": " : ""}${value} of ${max}`}>
      <span className="relative block h-[7px] w-[72px] overflow-hidden rounded-[4px]" style={{ background: "rgba(255,255,255,0.1)", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.3)" }} aria-hidden>
        <span
          className="absolute inset-y-0 left-0 rounded-[4px]"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, color-mix(in srgb, ${accent} 70%, transparent), ${accent})`, boxShadow: `0 0 8px color-mix(in srgb, ${accent} 65%, transparent)` }}
        />
      </span>
      <span className="text-[12px] leading-[16px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>
        <strong className="font-extrabold" style={{ color: "var(--foreground)" }}>{value}</strong>/{max}{label ? ` ${label}` : ""}
      </span>
    </span>
  );
}
