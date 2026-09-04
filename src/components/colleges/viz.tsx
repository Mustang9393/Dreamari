"use client";

import { ACCENT } from "./shared";

// Pictures for the college page, each only where its shape answers something a
// row cannot: who is there (ring, split bars), where a score sits on its scale
// (range strip), and what families pay against the full price (ladder).
// One hue, thin marks, values as text in text tokens. Everything else on
// the page is a label and a value, the cheapest thing on screen.

const MUTED = { color: "var(--muted-foreground)" } as const;
const INK = { color: "var(--foreground)" } as const;

/** A ring of who is there. Slices are tints of the one hue, largest first,
 *  a 2px surface gap between them, named in a legend with their share.
 *  Groups under `fold` percent fold into "Other" so the ring stays readable. */
export function Donut({ parts, fold = 3 }: { parts: { label: string; pct: number; n?: number }[]; fold?: number }) {
  const sorted = [...parts].sort((a, b) => b.pct - a.pct);
  const big = sorted.filter((p) => p.pct >= fold);
  const small = sorted.filter((p) => p.pct < fold);
  const rest = small.reduce((a, p) => a + p.pct, 0);
  const restN = small.every((p) => p.n !== undefined) ? small.reduce((a, p) => a + (p.n ?? 0), 0) : undefined;
  const slices = rest > 0 ? [...big, { label: "Other", pct: rest, n: restN }] : big;
  const total = slices.reduce((a, p) => a + p.pct, 0) || 100;
  const tints = [1, 0.78, 0.58, 0.42, 0.3, 0.2, 0.14];
  const size = 168, stroke = 26, r = (size - stroke) / 2, c = 2 * Math.PI * r;
  const gap = 2;
  // where each slice starts along the ring, computed up front
  const starts = slices.reduce<number[]>((acc, s, i) => { acc.push(i === 0 ? 0 : acc[i - 1] + (slices[i - 1].pct / total) * c); return acc; }, []);
  return (
    <div className="flex flex-col items-start gap-[var(--space-4)] sm:flex-row sm:items-center sm:gap-[var(--space-5)]">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={slices.map((s) => `${s.label} ${s.pct}%`).join(", ")} className="-rotate-90 flex-none">
        {slices.map((s, i) => {
          const len = Math.max(0, (s.pct / total) * c - gap);
          return <circle key={s.label} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={ACCENT} strokeOpacity={tints[Math.min(i, tints.length - 1)]} strokeWidth={stroke} strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-starts[i]} />;
        })}
      </svg>
      <ul className="flex w-full min-w-0 flex-col gap-[6px] sm:w-auto sm:flex-1">
        {slices.map((s, i) => (
          <li key={s.label} className="flex items-center gap-[8px] text-[13px] leading-[17px]" style={MUTED}>
            <span aria-hidden className="size-[10px] flex-none rounded-[2px]" style={{ background: ACCENT, opacity: tints[Math.min(i, tints.length - 1)] }} />
            <strong className="w-[38px] flex-none font-bold tabular-nums" style={INK}>{s.pct}%</strong>
            <span className="min-w-0">{s.label}{s.n !== undefined ? <span className="ml-[6px] tabular-nums" style={{ opacity: 0.7 }}>{s.n.toLocaleString("en-US")}</span> : null}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Two parts of one whole on one bar, two shades of the one hue, a 2px gap,
 *  both parts named with share and count. */
export function SplitBar({ title, a, b }: { title: string; a: { label: string; value: number }; b: { label: string; value: number } }) {
  const total = a.value + b.value || 1;
  const pa = Math.round((a.value / total) * 100);
  const pb = 100 - pa;
  const shade = `color-mix(in srgb, ${ACCENT} 45%, rgba(255,255,255,0.18))`;
  return (
    <div className="flex flex-col gap-[6px] py-[10px]" role="img" aria-label={`${title}: ${a.label} ${pa}%, ${b.label} ${pb}%`}>
      <span className="text-[15px] leading-[22px]" style={INK}>{title}</span>
      <div className="flex h-[10px] w-full gap-[2px] overflow-hidden rounded-[3px]" aria-hidden>
        <span className="h-full rounded-l-[3px]" style={{ width: `${pa}%`, background: ACCENT }} />
        <span className="h-full rounded-r-[3px]" style={{ width: `${pb}%`, background: shade }} />
      </div>
      <div className="flex flex-wrap items-center gap-x-[var(--space-4)] gap-y-[2px] text-[13px] leading-[17px]" style={MUTED}>
        <span className="flex items-center gap-[6px]"><span aria-hidden className="size-[9px] rounded-[2px]" style={{ background: ACCENT }} /><strong className="font-bold tabular-nums" style={INK}>{pa}%</strong> {a.label}, {a.value.toLocaleString("en-US")}</span>
        <span className="flex items-center gap-[6px]"><span aria-hidden className="size-[9px] rounded-[2px]" style={{ background: shade }} /><strong className="font-bold tabular-nums" style={INK}>{pb}%</strong> {b.label}, {b.value.toLocaleString("en-US")}</span>
      </div>
    </div>
  );
}

/** Where a score range sits on its scale. The numbers alone say "530 to 610";
 *  the strip says how much of the 800 that is, which is the question an
 *  eighth grader is really asking. Middle half of the students who sent one. */
export function RangeBar({ label, lo, hi, max, note, last = false }: { label: string; lo: number; hi: number; max: number; note?: string; last?: boolean }) {
  const l = (lo / max) * 100, w = ((hi - lo) / max) * 100;
  return (
    <div className={`flex flex-col gap-[6px] py-[10px] ${last ? "" : "border-b"}`} style={{ borderColor: "var(--glass-border)" }} role="img" aria-label={`${label}: ${lo} to ${hi} out of ${max}`}>
      <div className="flex items-baseline justify-between gap-[var(--space-4)]">
        <span className="flex min-w-0 flex-col">
          <span className="text-[15px] leading-[22px]" style={INK}>{label}</span>
          {note && <span className="text-[12.5px] leading-[16px]" style={MUTED}>{note}</span>}
        </span>
        <span className="shrink-0 text-[15px] leading-[22px] font-bold tabular-nums" style={INK}>{lo} to {hi}</span>
      </div>
      <div className="flex items-center gap-[8px] text-[11px] leading-[14px] tabular-nums" style={MUTED} aria-hidden>
        <span>0</span>
        <span className="relative h-[6px] flex-1 overflow-hidden rounded-[3px]" style={{ background: "rgba(255,255,255,0.1)" }}>
          <span className="absolute inset-y-0 rounded-[3px]" style={{ left: `${l}%`, width: `${w}%`, background: ACCENT }} />
        </span>
        <span>{max}</span>
      </div>
    </div>
  );
}

/** Amounts against one fixed ceiling, so a bar's length always means the same
 *  thing: the first row is the ceiling and every other row is a share of it. */
export function Ladder({ rows, ceiling, format }: { rows: { label: string; value: number; note?: string; top?: boolean }[]; ceiling: number; format: (n: number) => string }) {
  const max = Math.max(ceiling, ...rows.map((r) => r.value)) || 1;
  return (
    <div>
      {rows.map((r, i) => (
        <div key={r.label} className={`flex flex-col gap-[5px] py-[10px] ${i === rows.length - 1 ? "" : "border-b"}`} style={{ borderColor: "var(--glass-border)" }} role="img" aria-label={`${r.label}: ${format(r.value)}`}>
          <div className="flex items-baseline justify-between gap-[var(--space-4)]">
            <span className="flex min-w-0 flex-col">
              <span className="text-[15px] leading-[22px]" style={INK}>{r.label}</span>
              {r.note && <span className="text-[12.5px] leading-[16px]" style={MUTED}>{r.note}</span>}
            </span>
            <span className="shrink-0 text-[15px] leading-[22px] font-bold tabular-nums" style={INK}>{format(r.value)}</span>
          </div>
          <span className="block h-[6px] w-full overflow-hidden rounded-[3px]" style={{ background: "rgba(255,255,255,0.1)" }} aria-hidden>
            <span className="block h-full rounded-[3px]" style={{ width: `${(r.value / max) * 100}%`, background: r.top ? "rgba(255,255,255,0.35)" : ACCENT }} />
          </span>
        </div>
      ))}
    </div>
  );
}
