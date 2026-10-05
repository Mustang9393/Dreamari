"use client";

// The v4 vocabulary for the School Leader and District Leader screens
// (6 Oct 2026). WHY: the leader screens were v2 card grids sitting inside v4's
// frame (bold display numbers, boxed KPI tiles, tab rows, one card per fact),
// so a principal opening v4 saw a different product from the counselor's.
// Direct instruction: "make those changes in every aspect, design, layout,
// structure everything... navigations, organisation, layouts, graphics,
// spacing, the premium look. EVERYTHING needs to be like this version."
//
// Every piece here is the counselor v4 screen's own pattern, reused rather
// than re-invented, so the two roles read as one system:
//   - Welcome + one primary action ............ Today (v4-welcome)
//   - Signal strip: numbers split by hairlines . Today (v4-signal-strip)
//   - Cover: serif story, orbit ring, aside .... Your impact (v4-impact-cover)
//   - "01 / Label" section heading ............. Your impact
//   - Glass sheets with one asymmetric corner .. Today (v4-focus-sheet)
//   - Lanes: track, 25/50/75 ticks, value ...... Today (v4-lane)
//   - Hairline rows with an index .............. Today (v4-priority-list)
//   - Disclosures for the secondary detail ..... Your impact
// Light weights for numbers (350 to 500), never extrabold; blue plus status
// colors only.

import { useId, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Go } from "../chips";
import "./leader.css";

export const pctText = (n: number, digits = 0) => `${n.toFixed(digits)}%`;

/** A quiet link with the v4 arrow: "Explore", "View all". */
export function TextAction({ children, onClick, label }: { children: React.ReactNode; onClick: () => void; label?: string }) {
  return <button type="button" className="v4-text-action" onClick={onClick} aria-label={label}>{children}<ArrowUpRight size={16} aria-hidden /></button>;
}

/** Today's welcome: overline, headline with the blue period, one sentence
 *  whose key numbers are links, and the one primary action. */
export function LeaderWelcome({ overline, title, sentence, action }: { overline: string; title: string; sentence: React.ReactNode; action?: { label: string; onClick: () => void } }) {
  return (
    <section className="v4-welcome">
      <div><span className="v4-overline">{overline}</span><h1>{title}<span className="v4-period">.</span></h1><p>{sentence}</p></div>
      {action && <button type="button" className="v4-primary-action" onClick={action.onClick}>{action.label}<ArrowUpRight size={18} aria-hidden /></button>}
    </section>
  );
}

/** A number inside the welcome sentence that opens what it counts. */
export function InlineLink({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return <button type="button" onClick={onClick}>{children}</button>;
}

export type Signal = { label: string; value: React.ReactNode; small: React.ReactNode; onClick?: () => void; aria?: string };

/** Numbers split by hairlines, no boxes (Today's strip). Any count of
 *  columns; on a phone they wrap two to a row. */
export function SignalStrip({ items, label }: { items: Signal[]; label: string }) {
  return (
    <div className="v4-signal-strip v4-leader-signals" aria-label={label} style={{ "--signal-cols": items.length } as React.CSSProperties}>
      {items.map((s, i) => {
        const body = <><span>{s.label}</span><strong>{s.value}</strong><small>{s.small}</small>{s.onClick && <ArrowUpRight size={16} aria-hidden />}</>;
        return s.onClick
          ? <button type="button" key={s.label} onClick={s.onClick} aria-label={s.aria} className={`v4-signal v4-signal-${i}`}>{body}</button>
          : <div key={s.label} className={`v4-signal v4-signal-${i}`}>{body}</div>;
      })}
    </div>
  );
}

/** The ring from Your impact: a gradient arc over a hairline track, two
 *  hairline ellipses around it, the figure in the middle. */
export function Orbit({ value, max = 100, figure, unit, caption, onOpen, label }: { value: number; max?: number; figure: React.ReactNode; unit?: string; caption: string; onOpen?: () => void; label: string }) {
  const id = useId().replace(/:/g, "");
  const share = Math.max(0, Math.min(100, (value / max) * 100));
  const art = (
    <>
      <svg viewBox="0 0 320 240" aria-hidden="true">
        <defs><linearGradient id={`orbit-${id}`} x1="0" y1="1" x2="1" y2="0"><stop stopColor="var(--v4-chart-1)" /><stop offset="1" stopColor="var(--v4-chart-2)" /></linearGradient></defs>
        <ellipse cx="160" cy="120" rx="147" ry="99" fill="none" stroke="var(--glass-border)" transform="rotate(-18 160 120)" />
        <ellipse cx="160" cy="120" rx="132" ry="114" fill="none" stroke="var(--glass-border)" transform="rotate(23 160 120)" />
        <circle cx="160" cy="120" r="92" fill="none" stroke="var(--glass-border)" strokeWidth="14" />
        <circle cx="160" cy="120" r="92" pathLength="100" fill="none" stroke={`url(#orbit-${id})`} strokeWidth="14" strokeLinecap="round" strokeDasharray={`${share} 100`} transform="rotate(-90 160 120)" />
      </svg>
      <span><strong>{figure}{unit && <small>{unit}</small>}</strong><em>{caption}</em></span>
    </>
  );
  return onOpen
    ? <button type="button" className="v4-momentum-orbit" onClick={onOpen} aria-label={label}>{art}</button>
    : <div className="v4-momentum-orbit" role="img" aria-label={label}>{art}</div>;
}

/** Your impact's cover: the story (serif, one blue italic phrase), the
 *  orbit, and one "next opportunity" aside split off by a hairline. */
export function LeaderCover({ story, orbit, aside }: {
  story: { overline: string; lead: string; accent: string; text: React.ReactNode; action?: { label: string; onClick: () => void } };
  orbit: React.ComponentProps<typeof Orbit>;
  aside?: { overline: string; value: React.ReactNode; text: React.ReactNode; action?: { label: string; onClick: () => void } };
}) {
  return (
    <section className="v4-impact-cover v4-leader-cover">
      <div className="v4-impact-story">
        <span className="v4-overline">{story.overline}</span>
        <h2>{story.lead}<br /><em>{story.accent}</em></h2>
        <p>{story.text}</p>
        {story.action && <TextAction onClick={story.action.onClick}>{story.action.label}</TextAction>}
      </div>
      <Orbit {...orbit} />
      {aside && (
        <div className="v4-impact-priority">
          <span className="v4-overline">{aside.overline}</span>
          <strong>{aside.value}</strong>
          <h3>{aside.text}</h3>
          {aside.action && <TextAction onClick={aside.action.onClick}>{aside.action.label}</TextAction>}
        </div>
      )}
    </section>
  );
}

/** "01 / Direction" over a sentence-case heading, with an optional link. */
export function SectionHeading({ index, label, title, action }: { index: number; label: string; title: string; action?: { label: string; onClick: () => void } }) {
  return (
    <div className="v4-section-heading">
      <div><span className="v4-overline">{String(index).padStart(2, "0")} / {label}</span><h2>{title}</h2></div>
      {action && <TextAction onClick={action.onClick}>{action.label}</TextAction>}
    </div>
  );
}

/** A v4 sheet. `glass` is Today's translucent sheet with one tucked corner;
 *  `flat` is Your impact's plain card. `corner` picks which corner tucks, so
 *  neighbours mirror each other the way Today's do. */
export function Sheet({ title, unit, aside, children, variant = "glass", corner = "br", className = "", overline }: {
  title?: React.ReactNode; unit?: string; aside?: React.ReactNode; children: React.ReactNode; variant?: "glass" | "flat"; corner?: "tl" | "tr" | "br" | "bl"; className?: string; overline?: string;
}) {
  return (
    <section className={`v4-leader-sheet is-${variant} corner-${corner} ${className}`}>
      {(title || aside || overline) && (
        <header className="v4-section-head">
          <div>{overline && <span className="v4-overline">{overline}</span>}{title && <h2>{title}{unit && <span className="v4-leader-unit">{unit}</span>}</h2>}</div>
          {aside}
        </header>
      )}
      {children}
    </section>
  );
}

/** A pill like Today's "18 need support". */
export function Pill({ children }: { children: React.ReactNode }) {
  return <span className="v4-pill">{children}</span>;
}

/** Today's lane: label, a track with 25/50/75 ticks, the value, a small
 *  caption. `baseline` adds the launch tick; `scale` is the track's top. */
export function Lane({ label, value, display, sub, color = "var(--v4-chart-1)", baseline, scale = 100, onClick, aria }: { label: React.ReactNode; value: number; display: React.ReactNode; sub?: React.ReactNode; color?: string; baseline?: number; scale?: number; onClick?: () => void; aria?: string }) {
  const reduce = useReducedMotion();
  const w = Math.max(0, Math.min(100, (value / scale) * 100));
  const inner = (
    <>
      <span className="v4-leader-lane-label">{label}</span>
      <div className="v4-lane-track">
        <motion.span initial={reduce ? false : { width: "0%" }} animate={{ width: `${w}%` }} transition={{ duration: reduce ? 0 : 0.8, ease: [0.22, 1, 0.36, 1] }} style={{ background: color }} />
        {[25, 50, 75].map((t) => <i key={t} style={{ left: `${t}%` }} />)}
        {baseline !== undefined && <b className="v4-leader-baseline" style={{ left: `${Math.min(100, (baseline / scale) * 100)}%` }} title={`Launch baseline ${baseline}`} />}
      </div>
      <b>{display}</b>
      <small>{sub}</small>
    </>
  );
  return onClick
    ? <button type="button" className="v4-lane v4-leader-lane" onClick={onClick} aria-label={aria}>{inner}</button>
    : <div className="v4-lane v4-leader-lane" aria-label={aria}>{inner}</div>;
}

/** The scale under a column of lanes. */
export function LaneAxis({ ticks = ["0", "25", "50", "75", "100%"] }: { ticks?: string[] }) {
  return <div className="v4-lane-axis v4-leader-lane-axis" aria-hidden>{ticks.map((t) => <span key={t}>{t}</span>)}</div>;
}

/** Today's numbered hairline list. */
export function Rows({ children, label }: { children: React.ReactNode; label?: string }) {
  return <div className="v4-priority-list v4-leader-rows" role={label ? "list" : undefined} aria-label={label}>{children}</div>;
}

export function Row({ index, title, sub, lead, trail, status, risk, onClick, aria }: { index?: number; title: React.ReactNode; sub?: React.ReactNode; lead?: React.ReactNode; trail?: React.ReactNode; status?: React.ReactNode; risk?: boolean; onClick?: () => void; aria?: string }) {
  const body = (
    <>
      {index !== undefined && <span className="v4-list-index">{String(index).padStart(2, "0")}</span>}
      {lead}
      <span className="v4-person"><strong>{title}</strong>{sub && <small>{sub}</small>}</span>
      {trail}
      {status && <span className={`v4-status-text ${risk ? "is-risk" : ""}`}>{status}</span>}
      {onClick && <Go />}
    </>
  );
  return onClick
    ? <button type="button" onClick={onClick} aria-label={aria}>{body}</button>
    : <div role="listitem" className="v4-leader-row-static">{body}</div>;
}

/** Your impact's closing disclosures: one hairline row each, a summary on
 *  the right, the detail inside. */
export function Ledger({ items }: { items: { title: string; summary: React.ReactNode; content: React.ReactNode }[] }) {
  return (
    <div className="v4-impact-disclosures">
      {items.map((it) => (
        <details key={it.title}><summary><span>{it.title}</span><span>{it.summary}</span><Go kind="expand" /></summary><div className="v4-leader-ledger-body">{it.content}</div></details>
      ))}
    </div>
  );
}

// Monotone cubic through the points (the Engagement chart's curve): smooth,
// and it never overshoots a month's real value.
function smoothPath(pts: { x: number; y: number }[]) {
  const n = pts.length;
  if (n < 2) return "";
  const dx = pts.slice(1).map((p, i) => p.x - pts[i].x);
  const m = pts.slice(1).map((p, i) => (p.y - pts[i].y) / dx[i]);
  const t = pts.map((_, i) => (i === 0 ? m[0] : i === n - 1 ? m[n - 2] : m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2));
  for (let i = 0; i < n - 1; i++) {
    if (m[i] === 0) { t[i] = 0; t[i + 1] = 0; continue; }
    const a = t[i] / m[i], b = t[i + 1] / m[i], h = Math.hypot(a, b);
    if (h > 3) { t[i] = (3 / h) * a * m[i]; t[i + 1] = (3 / h) * b * m[i]; }
  }
  let d = `M${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < n - 1; i++) {
    const c = dx[i] / 3;
    d += ` C${(pts[i].x + c).toFixed(1)} ${(pts[i].y + c * t[i]).toFixed(1)} ${(pts[i + 1].x - c).toFixed(1)} ${(pts[i + 1].y - c * t[i + 1]).toFixed(1)} ${pts[i + 1].x.toFixed(1)} ${pts[i + 1].y.toFixed(1)}`;
  }
  return d;
}

/** The Engagement page's line: a soft area, dots on every month, light
 *  gridlines, every month labelled, hover or focus shows the value. */
export function TrendLine({ points, format = (v) => `${Math.round(v)}%`, min, max, label, baseline }: { points: { label: string; value: number }[]; format?: (v: number) => string; min?: number; max?: number; label: string; baseline?: { value: number; label: string } }) {
  const reduce = useReducedMotion();
  const id = useId().replace(/:/g, "");
  const [hover, setHover] = useState<number | null>(null);
  const W = 720, H = 220, PX = 18, PT = 22, PB = 30;
  const vals = points.map((p) => p.value).concat(baseline ? [baseline.value] : []);
  const lo = min ?? Math.max(0, Math.floor((Math.min(...vals) - 8) / 10) * 10);
  const hi = max ?? Math.min(100, Math.ceil((Math.max(...vals) + 6) / 10) * 10);
  const x = (i: number) => PX + (i / Math.max(1, points.length - 1)) * (W - PX * 2);
  const y = (v: number) => PT + (1 - (v - lo) / Math.max(1e-9, hi - lo)) * (H - PT - PB);
  const pts = points.map((p, i) => ({ x: x(i), y: y(p.value) }));
  const d = smoothPath(pts);
  const grid = [0, 0.5, 1].map((f) => lo + f * (hi - lo));
  const last = points.length - 1;
  const shown = hover ?? last;
  return (
    <figure className="v4-leader-trend" aria-label={label}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${label}: ${points.map((p) => `${p.label} ${format(p.value)}`).join(", ")}`} preserveAspectRatio="none" onMouseLeave={() => setHover(null)}>
        <defs><linearGradient id={`trend-${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--v4-chart-1)" stopOpacity=".32" /><stop offset="100%" stopColor="var(--v4-chart-1)" stopOpacity="0" /></linearGradient></defs>
        {grid.map((g) => <line key={g} x1={PX} x2={W - PX} y1={y(g)} y2={y(g)} stroke="var(--glass-border)" strokeDasharray="2 5" vectorEffect="non-scaling-stroke" />)}
        {baseline && <line x1={PX} x2={W - PX} y1={y(baseline.value)} y2={y(baseline.value)} stroke="var(--muted-foreground)" strokeOpacity=".5" strokeDasharray="6 4" vectorEffect="non-scaling-stroke" />}
        <motion.path d={`${d} L${pts[last].x} ${H - PB} L${pts[0].x} ${H - PB} Z`} fill={`url(#trend-${id})`} initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.3 }} />
        <motion.path key={d} d={d} fill="none" stroke="var(--v4-chart-1)" strokeWidth="2.5" strokeLinecap="round" vectorEffect="non-scaling-stroke" initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} />
        {pts.map((p, i) => <rect key={i} x={p.x - (W / points.length) / 2} y={0} width={W / points.length} height={H} fill="transparent" onMouseEnter={() => setHover(i)} />)}
      </svg>
      {/* Dots and labels are HTML over the SVG so they stay round and crisp
         however the chart is stretched. */}
      <div className="v4-leader-trend-layer" aria-hidden>
        {pts.map((p, i) => <i key={i} className={i === shown ? "is-on" : ""} style={{ left: `${(p.x / W) * 100}%`, top: `${(p.y / H) * 100}%` }} />)}
        <span className="v4-leader-trend-tip" style={{ left: `${(pts[shown].x / W) * 100}%`, top: `${(pts[shown].y / H) * 100}%` }}>{format(points[shown].value)}</span>
        {baseline && <em className="v4-leader-trend-base" style={{ top: `${(y(baseline.value) / H) * 100}%` }}>{baseline.label}</em>}
      </div>
      <div className="v4-leader-trend-axis" aria-hidden>{points.map((p, i) => <span key={`${p.label}-${i}`} style={{ left: `${(x(i) / W) * 100}%` }}>{p.label}</span>)}</div>
    </figure>
  );
}

/** A colour key: dot plus label (Today's map key). */
export function Key({ items }: { items: { label: string; color: string }[] }) {
  return <div className="v4-map-key v4-leader-key">{items.map((k) => <span key={k.label}><i style={{ background: k.color }} />{k.label}</span>)}</div>;
}

/** A stacked share bar (Today's "Plans after graduation"). */
export function ShareBar({ parts, label }: { parts: { label: string; value: number; color: string }[]; label: string }) {
  const total = parts.reduce((n, p) => n + p.value, 0) || 1;
  return (
    <div className="v4-leader-share" role="img" aria-label={`${label}: ${parts.map((p) => `${p.label} ${p.value}`).join(", ")}`}>
      {parts.filter((p) => p.value > 0).map((p) => <span key={p.label} style={{ flex: p.value / total, background: p.color }} />)}
    </div>
  );
}

/** Status tones in v4's palette: blue for on track, ochre for attention, the
 *  review violet for an unfinished report, red only for risk. Green appears
 *  only as "above target", a status, as everywhere else in the app. */
export const SUPPORT_TONE: Record<string, string> = {
  "On Track": "var(--v4-chart-1)",
  "Needs Exploration": "var(--v4-chart-3)",
  "Incomplete Career + Postsecondary Report": "var(--v4-review)",
  "No Recent Activity": "var(--destructive)",
};
export const SCHOOL_TONE: Record<"above" | "meeting" | "support", string> = {
  above: "var(--v4-positive)",
  meeting: "var(--v4-chart-1)",
  support: "var(--v4-chart-3)",
};

/** A status as a dot and a word (Today's quiet status text, no chip box). */
export function StatusMark({ color, children }: { color: string; children: React.ReactNode }) {
  return <span className="v4-leader-status"><i style={{ background: color }} />{children}</span>;
}
