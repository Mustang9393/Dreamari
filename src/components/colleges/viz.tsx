"use client";

import { SMALL } from "@/components/career/CareerDetailExperience";
import { ACCENT } from "./shared";

// Three data pictures for the college page, one per question a student
// brings: what it costs (bars), can I get in (dots), who is there (ring).
// One hue, thin marks, values as text in text tokens. Everything else on
// the page is a sentence, because a sentence is the cheapest thing on screen.

const TRACK = "rgba(255,255,255,0.1)";
const MUTED = { color: "var(--muted-foreground)" } as const;
const INK = { color: "var(--foreground)" } as const;

/** Horizontal bars, one hue, value at the tip; `marker` draws a hairline
 *  reference (the sticker price) with its own label. */
export function HBars({ rows, marker, unit = "" }: { rows: { label: string; value: number; display: string }[]; marker?: { value: number; label: string }; unit?: string }) {
  const top = Math.max(marker?.value ?? 0, ...rows.map((r) => r.value)) || 1;
  return (
    <div className="flex flex-col gap-[10px]">
      {marker && (
        <p className="text-[13px] leading-[17px]" style={MUTED}>
          <span aria-hidden className="mr-[6px] inline-block h-[10px] w-[2px] translate-y-[1px] rounded-[1px]" style={{ background: "rgba(255,255,255,0.55)" }} />
          {marker.label} {unit}{marker.value.toLocaleString("en-US")}
        </p>
      )}
      <ul className="flex flex-col gap-[8px]">
        {rows.map((r) => {
          const pct = Math.max(0, Math.min(100, (r.value / top) * 100));
          return (
            <li key={r.label} className="flex flex-col gap-[4px]" title={`${r.label}: ${r.display}`}>
              <div className="flex items-baseline justify-between gap-[var(--space-3)]">
                <span className={SMALL} style={INK}>{r.label}</span>
                <span className={`${SMALL} flex-none font-bold tabular-nums`} style={INK}>{r.display}</span>
              </div>
              <div className="relative h-[12px] w-full overflow-hidden rounded-[3px]" style={{ background: TRACK }} aria-hidden>
                <span className="absolute inset-y-0 left-0 rounded-r-[4px]" style={{ width: `${pct}%`, background: ACCENT }} />
                {marker && <span className="absolute inset-y-[-2px] w-[2px]" style={{ left: `calc(${Math.min(100, (marker.value / top) * 100)}% - 1px)`, background: "rgba(255,255,255,0.7)" }} />}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** One hundred people, some of them let in, spread across the card as a
 *  band that fills the card's width with whole rows: 25 across on phones
 *  (four rows), 50 across from tablet up (two rows). The figure follows. */
export function DotGrid({ pct, figure, note }: { pct: number; figure: string; note?: string }) {
  const on = Math.round(pct);
  return (
    <figure className="m-0 flex flex-col gap-[var(--space-3)]">
      <div className="grid w-full gap-[5px] grid-cols-[repeat(25,minmax(0,1fr))] md:gap-[6px] md:grid-cols-[repeat(50,minmax(0,1fr))]" role="img" aria-label={`${on} of every 100 who apply get in`}>
        {Array.from({ length: 100 }, (_, i) => (
          <span key={i} className="aspect-square w-full rounded-full" style={{ background: i < on ? ACCENT : TRACK }} />
        ))}
      </div>
      <figcaption className="flex min-w-0 flex-col gap-[2px]">
        <span className={`${SMALL} font-bold`} style={INK}>{figure}</span>
        {note && <span className="text-[13px] leading-[17px]" style={MUTED}>{note}</span>}
      </figcaption>
    </figure>
  );
}

/** A ring of who is there. Slices are tints of the one hue, largest first,
 *  a 2px surface gap between them, named in a legend with their share.
 *  Groups under `fold` percent fold into "Other" so the ring stays readable. */
export function Donut({ parts, fold = 3 }: { parts: { label: string; pct: number }[]; fold?: number }) {
  const sorted = [...parts].sort((a, b) => b.pct - a.pct);
  const big = sorted.filter((p) => p.pct >= fold);
  const rest = sorted.filter((p) => p.pct < fold).reduce((a, p) => a + p.pct, 0);
  const slices = rest > 0 ? [...big, { label: "Other", pct: rest }] : big;
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
            <span className="min-w-0">{s.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
