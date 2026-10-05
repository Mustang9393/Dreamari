"use client";

// Shared pieces for the five District Leader screens.
// DEMO-ONLY v2 data (2 Oct 2026), v4 design (6 Oct 2026).
//
// v4 rebuild (6 Oct 2026). WHY: these helpers drew the v2 look (bold chips
// with a glowing dot, extrabold numbers, uppercase table heads, a heavy
// gradient bar). Direct instruction from the user: make the leader roles
// "like this version" (the counselor's v4) "in every aspect, design,
// layout, structure everything... graphics, spacing, the premium look". So:
//   - Status is a dot and a word (the kit's StatusMark) in v4's tones: the
//     positive tone for above target, the one blue for meeting, ochre for
//     support. No chip box, no glow, no --cd-* colours.
//   - A school row is Today's lane: name and caption, a soft track with
//     25/50/75 ticks, the launch-baseline tick, and (new here) a dashed
//     district line, the value in a light weight. One component for every
//     ranked school list on every District screen.
//   - The quadrant scatter keeps every behaviour (thresholds, attention
//     wash, labels, hover/focus/tap card, keyboard open) and takes v4's
//     drawing: hairline axes and grid, light 10px labels, blue for within
//     range and ochre for higher load, a card-coloured tip.
// Still one place that decides how a school opens (useOpenSchool) and how a
// KPI drills (kpiDrill).

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { Drill } from "../../Drill";
import { openSchoolFromDistrict } from "../context";
import { SCHOOL_TONE, StatusMark } from "../kit";
import {
  DISTRICT_TOTALS,
  SCHOOLS,
  SCHOOL_STATUS_LABELS,
  schoolLocation,
  type DistrictKpi,
  type LeaderSchool,
  type SchoolStatus,
} from "@/lib/leaderData";
import "./district.css";

/** 13058 -> "13,058". */
export const int = (n: number): string => n.toLocaleString("en-US");
/** 18 -> "+18.0 pts" (the Replit prints one decimal on every delta). */
export const pts = (n: number): string => `+${n.toFixed(1)} pts`;

/** v4 status tones (the kit's SCHOOL_TONE): positive, blue, ochre. */
export const STATUS_COLOR: Record<SchoolStatus, string> = SCHOOL_TONE;

/** Above / Meeting / Support as a dot and a word. */
export function SchoolStatusMark({ status }: { status: SchoolStatus }) {
  return <StatusMark color={STATUS_COLOR[status]}>{SCHOOL_STATUS_LABELS[status].filter}</StatusMark>;
}

/** A District route inside v4. */
export function useDistrictGo() {
  const router = useRouter();
  return useCallback((view: string) => router.push(`/counselor?view=${view}&v=4`), [router]);
}

/** Opens a school: every school row on every District screen goes through
 *  here (decision, 2 Oct 2026). `team` lands on that school's Counseling Team. */
export function useOpenSchool() {
  const router = useRouter();
  // The view is a query param on the same route, so the page would keep the
  // district screen's scroll; the school opens at its top instead.
  return useCallback((schoolId: string, view: "overview" | "team" = "overview") => { openSchoolFromDistrict(router.push, schoolId, view); window.scrollTo({ top: 0 }); }, [router]);
}

/** School name over "City, NY · N students" (Today's person block). */
export function SchoolName({ school, students, status }: { school: LeaderSchool; students?: number; status?: SchoolStatus }) {
  return (
    <span className="v4-district-name">
      {status && <i aria-hidden style={{ background: STATUS_COLOR[status] }} />}
      <span className="v4-person"><strong>{school.name}</strong><small>{schoolLocation(school)} · {int(students ?? school.enrollment)} students</small></span>
    </span>
  );
}

/** Today's lane track, with the launch-baseline tick and an optional dashed
 *  district line. 0 to 100 so every list compares honestly. */
export function DistrictTrack({ value, baseline, district, color = "var(--v4-chart-1)", thin = false }: { value: number; baseline?: number; district?: number; color?: string; thin?: boolean }) {
  const reduce = useReducedMotion();
  const pct = (n: number) => `${Math.max(0, Math.min(100, n))}%`;
  return (
    <span className={`v4-district-track ${thin ? "is-thin" : ""}`} aria-hidden>
      <motion.span className="v4-district-fill" initial={reduce ? false : { width: "0%" }} animate={{ width: pct(value) }} transition={{ duration: reduce ? 0 : 0.8, ease: [0.22, 1, 0.36, 1] }} style={{ background: color }} />
      {!thin && [25, 50, 75].map((t) => <i key={t} style={{ left: `${t}%` }} />)}
      {baseline !== undefined && <b className="v4-district-base" style={{ left: pct(baseline) }} />}
      {district !== undefined && <em className="v4-district-line" style={{ left: pct(district) }} />}
    </span>
  );
}

/** One school as a lane: name, track, value, change, arrow. The whole row
 *  opens the school. */
export function SchoolLane({ school, students, value, baseline, district, display, sub, color, onOpen, aria, status }: {
  school: LeaderSchool; students?: number; value: number; baseline?: number; district?: number; display: React.ReactNode; sub?: React.ReactNode; color?: string; onOpen: () => void; aria: string; status?: SchoolStatus;
}) {
  return (
    <button type="button" className="v4-district-lane" onClick={onOpen} aria-label={aria}>
      <SchoolName school={school} students={students} status={status ?? school.status} />
      <DistrictTrack value={value} baseline={baseline} district={district} color={color} />
      <b>{display}</b>
      <small>{sub}</small>
      <ArrowUpRight size={14} aria-hidden className="v4-district-go" />
    </button>
  );
}

/** The key under a column of lanes: what the tick and the dashed line mean. */
export function LaneLegend({ district, baseline = "Launch baseline" }: { district?: string; baseline?: string }) {
  return (
    <span className="v4-district-legend">
      {baseline && <span><b aria-hidden />{baseline}</span>}
      {district && <span><em aria-hidden />{district}</span>}
    </span>
  );
}

/** The 0 to 100 scale under a column of school lanes. */
export function DistrictAxis() {
  return <div className="v4-district-axis" aria-hidden><span /><div>{["0", "25", "50", "75", "100%"].map((t) => <i key={t} style={{ fontStyle: "normal" }}>{t}</i>)}</div></div>;
}

/** Value of one outcome measure for a school (professional exposure
 *  included). Capacity has no per-school outcome value, see `kpiDrill`. */
type OutcomeId = "career" | "postsecondary" | "experiential" | "professional" | "planning";

/**
 * The drill behind a District measure. The Replit's (i) tooltip becomes the
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
// QuadrantScatter: plain SVG, no chart library (2 Oct 2026), v4 drawing
// (6 Oct 2026).
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

/** Ochre for higher load (attention), the one blue for within range. */
export const QUADRANT_TONE = { negative: "var(--v4-chart-3)", positive: "var(--v4-chart-1)" } as const;

/** Width of the element, kept in state so the SVG viewBox equals the pixel
 *  size: text stays 10 to 11px on a phone instead of shrinking with a fixed
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
 * is the one that needs attention, marked with a very faint ochre wash and a
 * short label. One focusable dot per point; labels are always drawn for the
 * attention-quadrant dots and the extremes, and for any dot on hover or focus.
 * On touch the first tap shows the card and a second tap opens the school.
 * The card is drawn inside the SVG and clamped to its edges (no unclamped
 * absolute tooltip).
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
  const m = { l: compact ? 42 : 52, r: compact ? 12 : 20, t: 18, b: compact ? 48 : 50 };
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
  const estWidth = (t: string, size: number) => t.length * size * 0.56;
  const label = { fontSize: 11, fontWeight: 400, fill: "var(--muted-foreground)" } as const;

  const handleOpen = (id: string) => {
    if (touch && armed !== id) { setArmed(id); return; }
    onOpen(id);
  };

  /** A label card above (or below, near the top edge) a dot, clamped inside the SVG. */
  const tip = (p: QuadrantPoint) => {
    const r = rOf(p);
    const line2 = p.detail;
    const wTip = Math.min(w - 8, Math.max(estWidth(p.name, 12) + 22, estWidth(line2, 10.5) + 22));
    const hTip = touch ? 56 : 42;
    const cx = Math.max(4 + wTip / 2, Math.min(w - 4 - wTip / 2, px(p.x)));
    const above = py(p.y) - r - hTip - 8 > 2;
    const y = above ? py(p.y) - r - hTip - 8 : py(p.y) + r + 8;
    return (
      <g pointerEvents="none">
        <rect x={cx - wTip / 2} y={y} width={wTip} height={hTip} rx={11} fill="var(--card)" stroke="var(--v4-edge)" />
        <text x={cx} y={y + 18} textAnchor="middle" fontSize={12} fontWeight={550} fill="var(--foreground)">{p.name}</text>
        <text x={cx} y={y + 33} textAnchor="middle" fontSize={10.5} fill="var(--muted-foreground)">{line2}</text>
        {touch && <text x={cx} y={y + 48} textAnchor="middle" fontSize={10.5} fontWeight={600} fill="var(--primary)">Tap again to open</text>}
      </g>
    );
  };

  return (
    <div ref={boxRef} className="w-full">
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} role="group" aria-label={ariaLabel} className="block overflow-visible" style={{ height: "auto", maxWidth: "100%" }} onMouseLeave={() => setHover(null)} onClick={() => setArmed(null)}>
        {/* the attention quadrant: past the load line and under the coverage line */}
        <rect x={qx} y={qy} width={Math.max(0, m.l + pw - qx)} height={Math.max(0, m.t + ph - qy)} rx={6} fill="var(--v4-chart-3)" fillOpacity={0.1} />
        {/* hairline grid, light labels */}
        {yTicks.map((v) => (
          <g key={`y${v}`}>
            <line x1={m.l} x2={m.l + pw} y1={py(v)} y2={py(v)} stroke="var(--v4-line)" strokeDasharray="2 5" />
            <text x={m.l - 10} y={py(v) + 3.5} textAnchor="end" {...label} className="tabular-nums">{v}{yUnit}</text>
          </g>
        ))}
        {xTicks.map((v) => (
          <text key={`x${v}`} x={px(v)} y={m.t + ph + 18} textAnchor="middle" {...label} className="tabular-nums">{v}</text>
        ))}
        <line x1={m.l} x2={m.l + pw} y1={m.t + ph} y2={m.t + ph} stroke="var(--v4-line)" />
        <text x={m.l + pw / 2} y={h - 6} textAnchor="middle" {...label}>{xTitle}</text>
        <text transform={`translate(11 ${m.t + ph / 2}) rotate(-90)`} textAnchor="middle" {...label}>{yTitle}</text>

        {/* thresholds */}
        <line x1={qx} x2={qx} y1={m.t} y2={m.t + ph} stroke="var(--muted-foreground)" strokeOpacity={0.55} strokeDasharray="4 4" />
        <line x1={m.l} x2={m.l + pw} y1={qy} y2={qy} stroke="var(--muted-foreground)" strokeOpacity={0.55} strokeDasharray="4 4" />
        <text x={qx + 6} y={m.t + 10} {...label}>{xThresholdLabel}</text>
        <text x={m.l + pw - 4} y={qy - 7} textAnchor="end" {...label}>{yThresholdLabel}</text>
        <g>
          <rect x={m.l + pw - 4 - estWidth(attentionLabel, 11) - 15} y={qy + 13} width={7} height={7} rx={2} fill="var(--v4-chart-3)" />
          <text x={m.l + pw - 4} y={qy + 20} textAnchor="end" fontSize={11} fontWeight={550} fill="var(--foreground)">{attentionLabel}</text>
        </g>

        {/* dots: biggest first so small ones stay clickable on top */}
        {ordered.map((p, i) => {
          const r = rOf(p);
          const cx = px(p.x), cy = py(p.y);
          const color = QUADRANT_TONE[p.tone];
          const on = p.id === active;
          const showName = labelled.has(p.id) && !on;
          // Below the dot by default; above when the dot sits just over the coverage line (its label would hit the line's label) or near the bottom edge.
          const below = cy + r + 14 < m.t + ph + 4 && !(cy < qy && qy - cy < 58);
          const name = compact ? p.name.replace(/ (Academy|High School|Preparatory|Technical High School)$/, "") : p.name;
          const nameW = estWidth(name, 11);
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
              <circle cx={cx} cy={cy} r={r} fill={color} fillOpacity={on ? 0.9 : 0.62} stroke="var(--card)" strokeOpacity={0.9} strokeWidth={1.5} />
              {on && <circle cx={cx} cy={cy} r={r + 4} fill="none" stroke="var(--foreground)" strokeOpacity={0.7} strokeWidth={1.25} />}
              {showName && (
                <text x={lx} y={below ? cy + r + 13 : cy - r - 6} textAnchor="middle" fontSize={11} fontWeight={500} fill="var(--foreground)" stroke="var(--card)" strokeWidth={3} strokeOpacity={0.85} paintOrder="stroke" pointerEvents="none">{name}</text>
              )}
            </motion.g>
          );
        })}
        {tipPoint && tip(tipPoint)}
      </svg>
    </div>
  );
}
