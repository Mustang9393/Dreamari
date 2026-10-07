"use client";

// The counselor v4 Platform Engagement charts, shared (8 Oct 2026): the
// smooth logins line chart with its hover column, and the small sparkline
// under a stat. Copied whole from counselor/v4/PlatformEngagement.tsx so
// Connect's United Way boards can use them without importing the whole
// counselor app (Chandu: "use the wide variety and beautiful graphs like
// we have used in the counselor dashboards (v4)... we have some pretty good
// graphs in engagement"). TODO: point PlatformEngagement at this module once
// the counselor branch's open work there lands, so there is one copy.
// Colours come from --v4-chart-1 and --v4-chart-2, with the app's primary
// and success as the fallback outside the counselor app.

import { motion, useReducedMotion } from "framer-motion";
import { useId, useLayoutEffect, useRef, useState } from "react";

const TOTAL_COLOR = "var(--v4-chart-1, var(--primary))";
const UNIQUE_COLOR = "var(--v4-chart-2, var(--color-feedback-success))";
export type EngagementPoint = { label: string; total: number; unique: number; avg: number };
type Point = EngagementPoint;

// Monotone cubic (Fritsch-Carlson) through the points: a smooth curve like
// the reference's, which never overshoots a month's real value the way a
// plain Catmull-Rom spline can.
export function smoothPath(pts: { x: number; y: number }[]) {
  const n = pts.length;
  if (n < 2) return "";
  const dx = pts.slice(1).map((p, i) => p.x - pts[i].x);
  const m = pts.slice(1).map((p, i) => (p.y - pts[i].y) / dx[i]);
  const t = pts.map((_, i) => (i === 0 ? m[0] : i === n - 1 ? m[n - 2] : m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2));
  for (let i = 0; i < n - 1; i++) {
    if (m[i] === 0) { t[i] = 0; t[i + 1] = 0; continue; }
    const a = t[i] / m[i];
    const b = t[i + 1] / m[i];
    const h = Math.hypot(a, b);
    if (h > 3) { t[i] = (3 / h) * a * m[i]; t[i + 1] = (3 / h) * b * m[i]; }
  }
  let d = `M${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < n - 1; i++) {
    const c = dx[i] / 3;
    d += ` C${(pts[i].x + c).toFixed(1)} ${(pts[i].y + c * t[i]).toFixed(1)} ${(pts[i + 1].x - c).toFixed(1)} ${(pts[i + 1].y - c * t[i + 1]).toFixed(1)} ${pts[i + 1].x.toFixed(1)} ${pts[i + 1].y.toFixed(1)}`;
  }
  return d;
}


/** A tiny trend line under a stat: the months' shape, no axes. */
export function Sparkline({ values }: { values: number[] }) {
  const reduce = useReducedMotion();
  const id = useId().replace(/:/g, "");
  const W = 120;
  const H = 34;
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const pts = values.map((v, i) => ({ x: (i / (values.length - 1)) * W, y: 3 + (1 - (v - lo) / Math.max(1e-9, hi - lo)) * (H - 6) }));
  const d = smoothPath(pts);
  const last = pts[pts.length - 1];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-[34px] w-full max-w-[140px] overflow-visible" aria-hidden>
      <defs><linearGradient id={`sp-${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={TOTAL_COLOR} stopOpacity="0.3" /><stop offset="100%" stopColor={TOTAL_COLOR} stopOpacity="0" /></linearGradient></defs>
      <motion.path d={`${d} L${W} ${H} L0 ${H} Z`} fill={`url(#sp-${id})`} initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.4 }} />
      <motion.path d={d} fill="none" stroke={TOTAL_COLOR} strokeWidth="2" strokeLinecap="round" initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} />
      <circle cx={last.x} cy={last.y} r="3" fill={TOTAL_COLOR} stroke="var(--card)" strokeWidth="1.5" />
    </svg>
  );
}


// Rebuilt 26 Sept 2026 (direct feedback: "the logins by month is better in
// replit... everything in that graph seems squished down"). The old SVG
// stretched a 600x220 drawing to the card with preserveAspectRatio="none",
// flattening the curve and smearing the text; this one measures its own
// width and draws at real pixels, 280 tall. From the reference: smooth
// curves, a labelled y-axis on round steps, a dot on every month, the
// unique line in its own green so the two series never read as one. Ours
// adds a soft area under the total, lines that draw in on load, and a
// hover column that reads all three of the month's numbers at once.
export function LoginsChart({ data, labels = ["Total Logins", "Active students"] }: { data: Point[]; /** the two legend labels: the total line, then the students line */ labels?: [string, string] }) {
  const MONTHS = data;
  const reduce = useReducedMotion();
  const id = useId().replace(/:/g, "");
  const wrapRef = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const H = 280;
  const padLeft = 40;
  const padRight = 16;
  const padTop = 16;
  const padBottom = 28;
  const peak = Math.max(...MONTHS.map((m) => m.total));
  const step = [2, 5, 10, 20, 25, 50, 100].find((st) => peak / st <= 5) ?? 100;
  const max = Math.ceil(peak / step) * step;
  const ticks = Array.from({ length: max / step + 1 }, (_, i) => i * step);
  const plotW = Math.max(1, W - padLeft - padRight);
  const plotH = H - padTop - padBottom;
  const x = (i: number) => padLeft + (i / (MONTHS.length - 1)) * plotW;
  const y = (v: number) => padTop + (1 - v / max) * plotH;
  const pts = (key: "total" | "unique") => MONTHS.map((m, i) => ({ x: x(i), y: y(m[key]) }));
  const totalD = smoothPath(pts("total"));
  const uniqueD = smoothPath(pts("unique"));
  const baseline = padTop + plotH;
  const draw = { duration: 1.1, ease: [0.22, 1, 0.36, 1] as const };
  const hm = hover !== null ? MONTHS[hover] : null;
  // Beside the hover line, never on it: centred, it covered the month's own peak.
  const tipRight = hover !== null && x(hover) > W / 2;
  const tipLeft = hover !== null ? x(hover) + (tipRight ? -12 : 12) : 0;

  return (
    <figure className="m-0 flex flex-col gap-[12px]">
      <div ref={wrapRef} className="relative w-full" style={{ height: H }} onMouseLeave={() => setHover(null)}>
        {W > 0 && (
          <svg width={W} height={H} role="img" aria-label="Total logins and unique student logins" className="block overflow-visible">
            <defs>
              <linearGradient id={`pe-area-${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={TOTAL_COLOR} stopOpacity="0.28" /><stop offset="100%" stopColor={TOTAL_COLOR} stopOpacity="0" /></linearGradient>
            </defs>
            {ticks.map((v) => (
              <g key={v}>
                <line x1={padLeft} x2={W - padRight} y1={y(v)} y2={y(v)} stroke="color-mix(in srgb, var(--foreground) 9%, transparent)" strokeWidth="1" strokeDasharray={v === 0 ? undefined : "3 4"} />
                <text x={padLeft - 10} y={y(v) + 4} textAnchor="end" style={{ fontSize: 11, fontWeight: 600, fill: "var(--muted-foreground)", fontFamily: "var(--font-body)" }}>{v}</text>
              </g>
            ))}
            {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={padTop} y2={baseline} stroke="color-mix(in srgb, var(--foreground) 22%, transparent)" strokeWidth="1" />}
            <motion.path d={`${totalD} L${x(MONTHS.length - 1).toFixed(1)} ${baseline} L${padLeft} ${baseline} Z`} fill={`url(#pe-area-${id})`} initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.5 }} />
            <motion.path d={totalD} fill="none" stroke={TOTAL_COLOR} strokeWidth="2.5" strokeLinecap="round" initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={draw} style={{ filter: `drop-shadow(0 0 6px color-mix(in srgb, ${TOTAL_COLOR} 55%, transparent))` }} />
            <motion.path d={uniqueD} fill="none" stroke={UNIQUE_COLOR} strokeWidth="2.5" strokeLinecap="round" initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ ...draw, delay: 0.1 }} style={{ filter: `drop-shadow(0 0 6px color-mix(in srgb, ${UNIQUE_COLOR} 45%, transparent))` }} />
            {MONTHS.map((m, i) => (
              <g key={m.label}>
                {(["total", "unique"] as const).map((k) => (
                  <motion.circle key={k} cx={x(i)} cy={y(m[k])} r={hover === i ? 6 : 4.5} fill={k === "total" ? TOTAL_COLOR : UNIQUE_COLOR} stroke="var(--card)" strokeWidth="2" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: reduce ? 0 : 0.2 + (i / (MONTHS.length - 1)) * 0.9 }} />
                ))}
                {/* Every other label on a narrow chart, counted back from the latest
                   point, so labels never overlap at phone width. */}
                {((MONTHS.length <= 8 && W >= 520) || (MONTHS.length - 1 - i) % 2 === 0) && <text x={x(i)} y={H - 6} textAnchor={i === 0 ? "start" : i === MONTHS.length - 1 ? "end" : "middle"} style={{ fontSize: 11.5, fontWeight: 600, fill: hover === i ? "var(--foreground)" : "var(--muted-foreground)", fontFamily: "var(--font-body)" }}>{m.label}</text>}
                {/* One hover column per month, the full plot height, so the
                   pointer doesn't have to find a 9px dot. */}
                <rect x={x(i) - plotW / (MONTHS.length - 1) / 2} y={padTop} width={plotW / (MONTHS.length - 1)} height={plotH} fill="transparent" role="img" onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} onBlur={() => setHover(null)} tabIndex={0} aria-label={`${m.label}: ${m.total} total logins, ${m.unique} unique students, ${m.avg.toFixed(2)} logins each`} style={{ cursor: "pointer", outline: "none" }} />
              </g>
            ))}
          </svg>
        )}
        {hm && (
          <div className={`pointer-events-none absolute top-[8px] flex flex-col ${tipRight ? "-translate-x-full" : ""} gap-[4px] rounded-[var(--radius-sm)] border px-[10px] py-[8px] text-[12px] font-semibold whitespace-nowrap`} style={{ left: tipLeft, background: "var(--popover, var(--card))", borderColor: "var(--glass-border)", color: "var(--foreground)", boxShadow: "0 8px 24px rgba(0,0,0,0.35)" }}>
            <span className="font-bold">{hm.label}</span>
            <span className="flex items-center gap-[6px]"><span aria-hidden className="size-[8px] rounded-full" style={{ background: TOTAL_COLOR }} />{hm.total} total logins</span>
            <span className="flex items-center gap-[6px]"><span aria-hidden className="size-[8px] rounded-full" style={{ background: UNIQUE_COLOR }} />{hm.unique} unique students</span>
            <span style={{ color: "var(--muted-foreground)" }}>{hm.avg.toFixed(2)} logins each</span>
          </div>
        )}
      </div>
      <div className="flex flex-wrap justify-center gap-x-[18px] gap-y-[4px]">
        <span className="flex items-center gap-[6px] text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}><span aria-hidden className="size-[9px] flex-none rounded-full" style={{ background: TOTAL_COLOR }} />{labels[0]}</span>
        <span className="flex items-center gap-[6px] text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}><span aria-hidden className="size-[9px] flex-none rounded-full" style={{ background: UNIQUE_COLOR }} />{labels[1]}</span>
      </div>
    </figure>
  );
}

