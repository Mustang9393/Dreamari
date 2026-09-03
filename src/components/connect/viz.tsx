"use client";

import { useId } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";

// Small data-visual primitives for Connect's dashboards (volunteer, partner).
// One metric tile, one area chart, one ring, one meter, one segmented control,
// so every number on every dashboard is drawn the same way. Colours come from
// the caller (the person's world accent); nothing here invents a palette.

export function Segmented<K extends string>({ options, value, onChange, ariaLabel, grow = false }: { options: { key: K; label: string }[]; value: K; onChange: (key: K) => void; ariaLabel: string; grow?: boolean }) {
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
            className={`dm-quiet flex min-h-[34px] cursor-pointer items-center justify-center rounded-[var(--radius-sm)] px-[14px] text-[13px] leading-[18px] font-semibold whitespace-nowrap ${grow ? "flex-1" : "flex-none"}`}
            style={on ? { background: "var(--primary)", color: "#FFFFFF" } : { color: "var(--muted-foreground)" }}
          >
            {option.label}
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
      <span className="mt-[2px] flex size-[36px] flex-none items-center justify-center rounded-[var(--radius-sm)]" style={{ background: `color-mix(in srgb, ${accent} 16%, transparent)`, color: accent }}>
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
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${total.toLocaleString("en-US")} students reached; peak ${max} in one day`} className="h-auto w-full" preserveAspectRatio="none" style={{ height }}>
        <defs>
          <linearGradient id={`fill-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity="0.38" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((t) => (
          <line key={t} x1={padX} x2={W - padX} y1={padTop + t * (H - padTop - padBottom)} y2={padTop + t * (H - padTop - padBottom)} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        ))}
        <path d={area} fill={`url(#fill-${id})`} />
        <path d={line} fill="none" stroke={accent} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        <circle cx={x(last)} cy={y(points[last])} r="5" fill={accent} stroke="#0e0c20" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        <text x={Math.min(W - 40, Math.max(28, x(peak)))} y={Math.max(12, y(max) - 8)} textAnchor="middle" style={{ fontSize: 12, fontWeight: 700, fill: "rgba(255,255,255,0.85)", fontFamily: "var(--font-body)" }}>{max}</text>
      </svg>
      <figcaption className="flex justify-between text-[11.5px] leading-[15px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
        <span>{labels[0]}</span><span>{labels[1]}</span><span>{labels[2]}</span>
      </figcaption>
    </figure>
  );
}

/** Progress toward a goal as a ring, the number inside. */
export function Ring({ pct, size = 84, stroke = 8, accent, children }: { pct: number; size?: number; stroke?: number; accent: string; children?: React.ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <span className="relative inline-flex flex-none items-center justify-center" style={{ width: size, height: size }} role="img" aria-label={`${Math.round(clamped)} percent`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={accent} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${(clamped / 100) * c} ${c}`} />
      </svg>
      <span className="relative text-center">{children}</span>
    </span>
  );
}

/** A fill meter: value of max, as a bar with the figure beside it. */
export function Meter({ value, max, accent, label }: { value: number; max: number; accent: string; label?: string }) {
  const pct = Math.max(0, Math.min(100, Math.round((value / Math.max(1, max)) * 100)));
  return (
    <span className="flex items-center gap-[8px]" aria-label={`${label ? label + ": " : ""}${value} of ${max}`}>
      <span className="relative block h-[6px] w-[72px] overflow-hidden rounded-[3px]" style={{ background: "rgba(255,255,255,0.12)" }} aria-hidden>
        <span className="absolute inset-y-0 left-0 rounded-[3px]" style={{ width: `${pct}%`, background: accent }} />
      </span>
      <span className="text-[12px] leading-[16px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>
        <strong className="font-extrabold" style={{ color: "var(--foreground)" }}>{value}</strong>/{max}{label ? ` ${label}` : ""}
      </span>
    </span>
  );
}
