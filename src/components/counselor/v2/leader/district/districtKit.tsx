"use client";

// Shared pieces for the five District Leader screens (2 Oct 2026).
// DEMO-ONLY v2. Everything here exists so the screens read as one system:
// the same status chip, the same bar, the same school row, and one place
// that decides how a school is opened and how a KPI drills.
//
// Colour rule (the user's standing one): blue plus status colours. The
// Replit's purple / blue / orange status pills become green / blue / amber
// dots on a neutral chip: the text stays foreground, only the dot carries
// the status, as Verdict does in overviewShared.tsx.

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Go } from "../../../chips";
import { RankBar } from "../../overviewShared";
import type { Drill } from "../../Drill";
import { openSchoolFromDistrict } from "../context";
import {
  DISTRICT_TOTALS,
  SCHOOLS,
  SCHOOL_STATUS_LABELS,
  schoolLocation,
  type DistrictKpi,
  type LeaderSchool,
  type SchoolStatus,
} from "@/lib/leaderData";

/** 13058 -> "13,058". */
export const int = (n: number): string => n.toLocaleString("en-US");
/** 18 -> "+18.0 pts" (the Replit prints one decimal on every delta). */
export const pts = (n: number): string => `+${n.toFixed(1)} pts`;

export const STATUS_COLOR: Record<SchoolStatus, string> = {
  above: "var(--cd-green)",
  meeting: "var(--primary)",
  support: "var(--cd-amber)",
};

/** The leading dot every status wears. */
export function StatusDot({ color }: { color: string }) {
  return <span aria-hidden className="size-[8px] flex-none rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />;
}

/** Above / Meeting / Support: a neutral chip, a coloured dot. */
export function StatusChip({ status, short = false }: { status: SchoolStatus; short?: boolean }) {
  const l = SCHOOL_STATUS_LABELS[status];
  return (
    <span className="inline-flex w-fit flex-none items-center gap-[7px] rounded-full border px-[10px] py-[3px] text-[11.5px] leading-[16px] font-bold whitespace-nowrap" style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
      <StatusDot color={STATUS_COLOR[status]} />
      {short ? l.shortCaption : l.pill}
    </span>
  );
}

/** Opens a school: every school row on every District screen goes through
 *  here (decision, 2 Oct 2026). `team` lands on that school's Counseling Team. */
export function useOpenSchool() {
  const router = useRouter();
  return useCallback((schoolId: string, view: "overview" | "team" = "overview") => openSchoolFromDistrict(router.push, schoolId, view), [router]);
}

/** A thin gradient bar (the RankBar family) with an optional neutral
 *  reference tick, e.g. the district value or the launch baseline. `color`
 *  lets a status colour in; the default is the one blue. */
export function Bar({ value, reference, color = "var(--primary)", height = 6 }: { value: number; /** percent of the full bar */ reference?: number; color?: string; height?: number }) {
  if (reference === undefined && color === "var(--primary)") return <RankBar value={value} height={height} />;
  const v = Math.max(0, Math.min(100, value));
  return (
    <span className="relative block w-full rounded-full" style={{ height, background: "color-mix(in srgb, var(--foreground) 12%, transparent)" }} aria-hidden>
      <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${v}%`, background: `linear-gradient(90deg, color-mix(in srgb, ${color} 35%, transparent), ${color})` }} />
      {reference !== undefined && <span className="absolute top-[-3px] bottom-[-3px] w-[2px] rounded-[1px]" style={{ left: `calc(${Math.max(0, Math.min(100, reference))}% - 1px)`, background: "color-mix(in srgb, var(--foreground) 55%, transparent)" }} />}
    </span>
  );
}

/** School name over "City, NY · N students". Wraps instead of truncating so
 *  a long name keeps its caption on a phone. */
export function SchoolCell({ school, students }: { school: LeaderSchool; students?: number }) {
  return (
    <span className="flex min-w-0 flex-col gap-[2px]">
      <span className="text-[13.5px] leading-[18px] font-bold" style={{ color: "var(--foreground)" }}>{school.name}</span>
      <span className="text-[11.5px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{schoolLocation(school)} · {int(students ?? school.enrollment)} students</span>
    </span>
  );
}

/** A tappable school row: a real button with an aria-label and the shared
 *  hover chevron. Children are inline-level (spans) so the markup stays
 *  valid inside a button. */
export function SchoolRow({ school, onOpen, children, view, label }: { school: LeaderSchool; onOpen: (id: string, view?: "overview" | "team") => void; children: React.ReactNode; view?: "overview" | "team"; /** a fuller aria-label (e.g. with the value the row charts) */ label?: string }) {
  return (
    <button type="button" onClick={() => onOpen(school.id, view)} aria-label={label ?? (view === "team" ? `Open ${school.name} counseling team` : `Open ${school.name}`)} className="dm-quiet group flex w-full cursor-pointer items-center gap-[12px] rounded-[var(--radius-sm)] px-[10px] py-[10px] text-left">
      <span className="min-w-0 flex-1">{children}</span>
      <Go />
    </button>
  );
}

/**
 * One ranked-bar track: a gradient bar for the current value, a short tick at
 * the launch baseline and a taller dashed line at the district value. The bar
 * grows in on mount and whenever the value changes (reduced motion: no
 * animation). Scale is 0 to 100 so bars compare honestly across tabs.
 */
export function MeasureTrack({ value, baseline, district }: { value: number; baseline: number; district: number }) {
  const reduce = useReducedMotion();
  const pct = (n: number) => `${Math.max(0, Math.min(100, n))}%`;
  return (
    <span className="relative flex h-[22px] w-full items-center" aria-hidden>
      <span className="relative block h-[10px] w-full rounded-full" style={{ background: "color-mix(in srgb, var(--foreground) 12%, transparent)" }}>
        <motion.span
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ background: "linear-gradient(90deg, color-mix(in srgb, var(--primary) 35%, transparent), var(--primary))" }}
          initial={reduce ? false : { width: 0 }}
          animate={{ width: pct(value) }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        />
      </span>
      <span className="absolute top-[4px] bottom-[4px] w-[2px] rounded-[1px]" style={{ left: `calc(${pct(baseline)} - 1px)`, background: "color-mix(in srgb, var(--foreground) 70%, transparent)" }} />
      <span className="absolute inset-y-0 w-0 border-l-[1.5px] border-dashed" style={{ left: `calc(${pct(district)} - 0.75px)`, borderColor: "color-mix(in srgb, var(--foreground) 85%, transparent)" }} />
    </span>
  );
}

/** Column heads for a school table; hidden below md, where rows stack. */
export function TableHead({ template, labels }: { template: string; labels: { label: string; align?: "right" }[] }) {
  return (
    <div className={`hidden gap-[12px] px-[10px] pr-[36px] pb-[8px] md:grid ${template}`} role="presentation">
      {labels.map((l) => (
        <span key={l.label} className={`text-[11px] font-bold tracking-[0.06em] uppercase ${l.align === "right" ? "text-right" : ""}`} style={{ color: "var(--muted-foreground)" }}>{l.label}</span>
      ))}
    </div>
  );
}

/** The divider rule between rows of a school list. */
export const ROWS = "flex flex-col [&>*+*]:border-t [&>*+*]:border-t-[var(--glass-border)]";

/** A muted one-line note under a card's content. */
export function Note({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] leading-[17px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{children}</p>;
}

/** Small-caps label above a control or a card section. */
export const EYEBROW = "text-[11px] font-bold tracking-[0.06em] uppercase";

/** Value of one outcome measure for a school (professional exposure
 *  included). Capacity has no per-school outcome value, see `kpiDrill`. */
type OutcomeId = "career" | "postsecondary" | "experiential" | "professional" | "planning";

/**
 * The drill behind a District KPI card. The Replit's (i) tooltip becomes the
 * lead; current / baseline / change become stats; and the breakdown it never
 * had: every school's value for this measure, highest first, so a
 * superintendent sees which schools are behind (decision, 2 Oct 2026).
 * Counselor capacity has no per-school outcome value; each school's
 * counselor efficiency (a relative %, not points) stands in for it, as the
 * Replit does on the drilled-in School Counseling Team.
 */
export function kpiDrill(kpi: DistrictKpi, onCompare: () => void): Drill {
  const isCapacity = kpi.id === "capacity";
  const valueOf = (s: LeaderSchool): number => (isCapacity ? s.counselorEfficiency.pct : s[kpi.id as OutcomeId].value);
  const sorted = [...SCHOOLS].sort((a, b) => valueOf(b) - valueOf(a));
  const top = valueOf(sorted[0]) || 1;
  const below = SCHOOLS.filter((s) => valueOf(s) < kpi.value).length;
  const baseline = isCapacity ? "0% relative" : `${kpi.baseline}%`;
  return {
    title: kpi.label,
    subtitle: `District rollup · ${int(DISTRICT_TOTALS.enrollment)} students · 2026–27`,
    lead: kpi.tooltip,
    stats: [
      { value: isCapacity ? "19% relative" : kpi.displayValue, label: "2026–27 current" },
      { value: baseline, label: "Launch baseline" },
      { value: isCapacity ? "+19% relative" : pts(kpi.delta), label: isCapacity ? "Change, not percentage points" : "Change vs launch" },
      { value: `${below} of ${SCHOOLS.length}`, label: "Schools below the district value" },
    ],
    rowsLabel: isCapacity ? "Counselor efficiency by school, relative % (highest first)" : "Every school, highest first",
    rows: sorted.map((s) => {
      const v = valueOf(s);
      return isCapacity
        ? { label: s.name, value: `+${v}% relative`, pct: (v / top) * 100 }
        : { label: s.name, value: `${v}% · ${pts(s[kpi.id as OutcomeId].delta)}`, pct: v };
    }),
    action: { label: "Compare in School performance", onClick: onCompare },
  };
}

/** Download a CSV built client-side. A BOM keeps the en dash intact in Excel. */
export function downloadCsv(filename: string, rows: (string | number)[][]) {
  const esc = (v: string | number) => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const body = rows.map((r) => r.map(esc).join(",")).join("\r\n");
  const blob = new Blob(["﻿", body], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// QuadrantScatter: plain SVG, no chart library (2 Oct 2026).
// ---------------------------------------------------------------------------

export interface QuadrantPoint {
  id: string;
  name: string;
  x: number;
  y: number;
  /** drives the dot's AREA (radius is the square root of this) */
  size: number;
  tone: "negative" | "positive";
  /** one line shown in the hover / focus card, after the name */
  detail: string;
  ariaLabel: string;
}

const TONE_COLOR = { negative: "var(--cd-amber)", positive: "var(--cd-green)" } as const;

/** Width of the element, kept in state so the SVG viewBox equals the pixel
 *  size: text stays 11 to 12px on a phone instead of shrinking with a fixed
 *  viewBox. */
function useElementWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(640);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () => setW(Math.max(260, Math.round(el.getBoundingClientRect().width)));
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

const niceFloor = (n: number, step: number) => Math.floor(n / step) * step;
const niceCeil = (n: number, step: number) => Math.ceil(n / step) * step;

/**
 * A quadrant scatter: x and y thresholds split the plot in four, and the
 * quadrant that is past BOTH (x above its threshold, y below its threshold)
 * is the one that needs attention, marked with a very faint amber wash and a
 * short label. One focusable dot per point; labels are always drawn for the
 * attention-quadrant dots and the extremes, and for any dot on hover or focus.
 * On touch the first tap shows the card and a second tap opens the school.
 */
export function QuadrantScatter({
  points,
  xThreshold,
  yThreshold,
  xTitle,
  yTitle,
  xThresholdLabel,
  yThresholdLabel,
  attentionLabel,
  yUnit = "",
  onOpen,
  ariaLabel,
}: {
  points: QuadrantPoint[];
  xThreshold: number;
  yThreshold: number;
  xTitle: string;
  yTitle: string;
  xThresholdLabel: string;
  yThresholdLabel: string;
  attentionLabel: string;
  yUnit?: string;
  onOpen: (id: string) => void;
  ariaLabel: string;
}) {
  const [boxRef, w] = useElementWidth();
  const reduce = useReducedMotion();
  const [hover, setHover] = useState<string | null>(null);
  const [focus, setFocus] = useState<string | null>(null);
  const [armed, setArmed] = useState<string | null>(null); // touch: first tap
  const [touch, setTouch] = useState(false); // last interaction was a touch
  const active = hover ?? focus ?? armed;

  const compact = w < 520;
  const h = compact ? Math.max(330, Math.round(w * 1.1)) : Math.min(440, Math.max(350, Math.round(w * 0.42)));
  const m = { l: compact ? 46 : 58, r: compact ? 12 : 20, t: 16, b: compact ? 50 : 52 };
  const pw = w - m.l - m.r;
  const ph = h - m.t - m.b;

  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const x0 = niceFloor(Math.min(...xs, xThreshold) - 40, 50);
  const x1 = niceCeil(Math.max(...xs, xThreshold) + 40, 50);
  const y0 = Math.floor(Math.min(...ys, yThreshold) - 1);
  const y1 = Math.ceil(Math.max(...ys, yThreshold) + 1);
  const px = (v: number) => m.l + ((v - x0) / (x1 - x0)) * pw;
  const py = (v: number) => m.t + (1 - (v - y0) / (y1 - y0)) * ph;
  const maxSize = Math.max(...points.map((p) => p.size), 1);
  const rMax = compact ? 13 : 20;
  const rOf = (p: QuadrantPoint) => Math.max(5, rMax * Math.sqrt(p.size / maxSize));

  const xTicks: number[] = [];
  for (let v = niceCeil(x0, 100); v <= x1; v += 100) xTicks.push(v);
  const yTicks: number[] = [];
  for (let v = y0; v <= y1; v += 1) yTicks.push(v);

  // Always labelled: the attention quadrant and the extremes.
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys);
  const labelled = new Set(points.filter((p) => (p.x > xThreshold && p.y < yThreshold) || p.x === minX || p.x === maxX || p.y === minY).map((p) => p.id));

  // Biggest first, a fixed order: re-ordering on hover would remount the dots.
  const ordered = [...points].sort((a, b) => b.size - a.size);
  const tipPoint = points.find((p) => p.id === active);

  const qx = px(xThreshold);
  const qy = py(yThreshold);
  const estWidth = (t: string, size: number) => t.length * size * 0.58;

  const handleOpen = (id: string) => {
    if (touch && armed !== id) { setArmed(id); return; }
    onOpen(id);
  };

  /** A label card above (or below, near the top edge) a dot, clamped inside the SVG. */
  const tip = (p: QuadrantPoint) => {
    const r = rOf(p);
    const line2 = p.detail;
    const wTip = Math.min(w - 8, Math.max(estWidth(p.name, 12) + 16, estWidth(line2, 11) + 16));
    const hTip = touch ? 54 : 40;
    const cx = Math.max(4 + wTip / 2, Math.min(w - 4 - wTip / 2, px(p.x)));
    const above = py(p.y) - r - hTip - 6 > 2;
    const y = above ? py(p.y) - r - hTip - 6 : py(p.y) + r + 6;
    return (
      <g pointerEvents="none">
        <rect x={cx - wTip / 2} y={y} width={wTip} height={hTip} rx={8} fill="var(--background)" stroke="var(--glass-border)" />
        <text x={cx} y={y + 17} textAnchor="middle" fontSize={12} fontWeight={700} fill="var(--foreground)">{p.name}</text>
        <text x={cx} y={y + 32} textAnchor="middle" fontSize={11} fontWeight={600} fill="var(--muted-foreground)">{line2}</text>
        {touch && <text x={cx} y={y + 47} textAnchor="middle" fontSize={11} fontWeight={700} fill="var(--primary)">Tap again to open</text>}
      </g>
    );
  };

  return (
    <div ref={boxRef} className="w-full">
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} role="group" aria-label={ariaLabel} className="block overflow-visible" style={{ height: "auto", maxWidth: "100%" }} onMouseLeave={() => setHover(null)} onClick={() => setArmed(null)}>
        {/* the attention quadrant: past the load line and under the coverage line */}
        <rect x={qx} y={qy} width={Math.max(0, m.l + pw - qx)} height={Math.max(0, m.t + ph - qy)} fill="var(--cd-amber)" fillOpacity={0.07} />
        {/* grid and axes */}
        {yTicks.map((v) => (
          <g key={`y${v}`}>
            <line x1={m.l} x2={m.l + pw} y1={py(v)} y2={py(v)} stroke="var(--foreground)" strokeOpacity={0.08} />
            <text x={m.l - 8} y={py(v) + 4} textAnchor="end" fontSize={11} fontWeight={600} fill="var(--muted-foreground)" className="tabular-nums">{v}{yUnit}</text>
          </g>
        ))}
        {xTicks.map((v) => (
          <g key={`x${v}`}>
            <line x1={px(v)} x2={px(v)} y1={m.t} y2={m.t + ph} stroke="var(--foreground)" strokeOpacity={0.05} />
            <text x={px(v)} y={m.t + ph + 16} textAnchor="middle" fontSize={11} fontWeight={600} fill="var(--muted-foreground)" className="tabular-nums">{v}</text>
          </g>
        ))}
        <line x1={m.l} x2={m.l + pw} y1={m.t + ph} y2={m.t + ph} stroke="var(--foreground)" strokeOpacity={0.25} />
        <text x={m.l + pw / 2} y={h - 6} textAnchor="middle" fontSize={11.5} fontWeight={700} fill="var(--muted-foreground)">{xTitle}</text>
        <text transform={`translate(12 ${m.t + ph / 2}) rotate(-90)`} textAnchor="middle" fontSize={11.5} fontWeight={700} fill="var(--muted-foreground)">{yTitle}</text>

        {/* thresholds */}
        <line x1={qx} x2={qx} y1={m.t} y2={m.t + ph} stroke="var(--foreground)" strokeOpacity={0.55} strokeDasharray="5 4" />
        <line x1={m.l} x2={m.l + pw} y1={qy} y2={qy} stroke="var(--foreground)" strokeOpacity={0.55} strokeDasharray="5 4" />
        <text x={qx + 5} y={m.t + 11} fontSize={11} fontWeight={700} fill="var(--muted-foreground)">{xThresholdLabel}</text>
        <text x={m.l + pw - 4} y={qy - 6} textAnchor="end" fontSize={11} fontWeight={700} fill="var(--muted-foreground)">{yThresholdLabel}</text>
        <g>
          <circle cx={m.l + pw - 4 - estWidth(attentionLabel, 11.5) - 10} cy={qy + 16} r={3.5} fill="var(--cd-amber)" />
          <text x={m.l + pw - 4} y={qy + 20} textAnchor="end" fontSize={11.5} fontWeight={800} fill="var(--foreground)">{attentionLabel}</text>
        </g>

        {/* dots: biggest first so small ones stay clickable on top */}
        {ordered.map((p, i) => {
          const r = rOf(p);
          const cx = px(p.x), cy = py(p.y);
          const color = TONE_COLOR[p.tone];
          const on = p.id === active;
          const showName = labelled.has(p.id) && !on;
          // Below the dot by default; above when the dot sits just over the coverage line (its label would hit the line's label) or near the bottom edge.
          const below = cy + r + 14 < m.t + ph + 4 && !(cy < qy && qy - cy < 58);
          const label = compact ? p.name.replace(/ (Academy|High School|Preparatory|Technical High School)$/, "") : p.name;
          const nameW = estWidth(label, 11.5);
          const lx = Math.max(4 + nameW / 2, Math.min(w - 4 - nameW / 2, cx));
          return (
            <motion.g
              key={p.id}
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: reduce ? 0 : 0.05 * i }}
              role="button"
              tabIndex={0}
              aria-label={p.ariaLabel}
              className="cursor-pointer outline-none"
              onPointerDown={(e) => setTouch(e.pointerType === "touch")}
              onMouseEnter={() => setHover(p.id)}
              onFocus={() => setFocus(p.id)}
              onBlur={() => setFocus((f) => (f === p.id ? null : f))}
              onClick={(e) => { e.stopPropagation(); handleOpen(p.id); }}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(p.id); } }}
            >
              {/* a generous invisible hit area for small dots */}
              <circle cx={cx} cy={cy} r={Math.max(r, 14)} fill="transparent" />
              <circle cx={cx} cy={cy} r={r} fill={color} fillOpacity={on ? 0.8 : 0.5} stroke={color} strokeWidth={1.5} />
              {on && <circle cx={cx} cy={cy} r={r + 4} fill="none" stroke="var(--foreground)" strokeWidth={1.5} />}
              {showName && (
                <text x={lx} y={below ? cy + r + 13 : cy - r - 6} textAnchor="middle" fontSize={11.5} fontWeight={700} fill="var(--foreground)" stroke="var(--background)" strokeWidth={3} paintOrder="stroke" pointerEvents="none">{label}</text>
              )}
            </motion.g>
          );
        })}
        {tipPoint && tip(tipPoint)}
      </svg>
    </div>
  );
}
