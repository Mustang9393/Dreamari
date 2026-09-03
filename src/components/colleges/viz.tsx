"use client";

import { SMALL } from "@/components/career/CareerDetailExperience";
import { ACCENT, RULE } from "./shared";

// Small data pictures for the college page. One hue (the app's primary),
// thin marks, values as text in text tokens, a 2px surface gap between
// touching fills. Nothing here is decorative: each picture replaces a list
// of numbers a student would otherwise have to read.

const TRACK = "rgba(255,255,255,0.1)";
const SHADE = `color-mix(in srgb, ${ACCENT} 45%, rgba(255,255,255,0.18))`;
const MUTED = { color: "var(--muted-foreground)" } as const;
const INK = { color: "var(--foreground)" } as const;

/** Horizontal bars, one hue, value at the tip. `note` sits under the label
 *  in small muted text; `marker` draws a hairline reference with its own label. */
export function HBars({ rows, max, marker, unit = "" }: { rows: { label: string; value: number; display: string; note?: string }[]; max?: number; marker?: { value: number; label: string }; unit?: string }) {
  const top = Math.max(max ?? 0, marker?.value ?? 0, ...rows.map((r) => r.value)) || 1;
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
                <span className="flex min-w-0 flex-col">
                  <span className={SMALL} style={INK}>{r.label}</span>
                  {r.note && <span className="text-[12.5px] leading-[16px]" style={MUTED}>{r.note}</span>}
                </span>
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

/** Two parts of one whole on a single bar, two shades of the one hue, a 2px
 *  surface gap between them, both parts named in a legend with their share. */
export function SplitBar({ title, a, b }: { title: string; a: { label: string; value: number }; b: { label: string; value: number } }) {
  const total = a.value + b.value || 1;
  const pa = Math.round((a.value / total) * 100);
  const pb = 100 - pa;
  return (
    <div className="flex flex-col gap-[6px]" role="img" aria-label={`${title}: ${a.label} ${pa}%, ${b.label} ${pb}%`}>
      <span className={SMALL} style={INK}>{title}</span>
      <div className="flex h-[12px] w-full gap-[2px] overflow-hidden rounded-[3px]" aria-hidden>
        <span className="h-full rounded-l-[3px]" style={{ width: `${pa}%`, background: ACCENT }} />
        <span className="h-full rounded-r-[3px]" style={{ width: `${pb}%`, background: SHADE }} />
      </div>
      <div className="flex flex-wrap items-center gap-x-[var(--space-4)] gap-y-[2px] text-[13px] leading-[17px]" style={MUTED}>
        <span className="flex items-center gap-[6px]"><span aria-hidden className="size-[9px] rounded-[2px]" style={{ background: ACCENT }} /><strong className="font-bold tabular-nums" style={INK}>{pa}%</strong> {a.label} · {a.value.toLocaleString("en-US")}</span>
        <span className="flex items-center gap-[6px]"><span aria-hidden className="size-[9px] rounded-[2px]" style={{ background: SHADE }} /><strong className="font-bold tabular-nums" style={INK}>{pb}%</strong> {b.label} · {b.value.toLocaleString("en-US")}</span>
      </div>
    </div>
  );
}

/** A middle-half range on a fixed scale (SAT 400 to 1600, ACT 1 to 36). */
export function RangeBar({ label, min, max, lo, hi, note }: { label: string; min: number; max: number; lo: number; hi: number; note?: string }) {
  const p = (v: number) => `${((v - min) / (max - min)) * 100}%`;
  return (
    <div className="flex flex-col gap-[5px]" role="img" aria-label={`${label}: ${lo} to ${hi}, on a scale of ${min} to ${max}`}>
      <div className="flex items-baseline justify-between gap-[var(--space-3)]">
        <span className={SMALL} style={INK}>{label}</span>
        <span className={`${SMALL} font-bold tabular-nums`} style={INK}>{lo} to {hi}</span>
      </div>
      <div className="relative h-[12px] w-full rounded-[3px]" style={{ background: TRACK }} aria-hidden>
        <span className="absolute inset-y-0 rounded-[3px]" style={{ left: p(lo), width: `calc(${p(hi)} - ${p(lo)})`, background: ACCENT }} />
      </div>
      <div className="flex justify-between text-[12px] leading-[15px] tabular-nums" style={MUTED}><span>{min}</span>{note && <span>{note}</span>}<span>{max}</span></div>
    </div>
  );
}

/** One hundred people, some of them let in. The picture a 13-year-old reads
 *  fastest: "58 of every 100". */
export function DotGrid({ pct, caption }: { pct: number; caption: string }) {
  const on = Math.round(pct);
  return (
    <figure className="m-0 flex flex-col gap-[10px]">
      <div className="grid w-fit grid-cols-10 gap-[5px]" role="img" aria-label={caption}>
        {Array.from({ length: 100 }, (_, i) => (
          <span key={i} className="size-[12px] rounded-full sm:size-[14px]" style={{ background: i < on ? ACCENT : TRACK }} />
        ))}
      </div>
      <figcaption className={SMALL} style={MUTED}>{caption}</figcaption>
    </figure>
  );
}

/** A share of a whole as one thin meter with the figure beside it. */
export function MeterRow({ label, pct, note, last = false }: { label: string; pct: number | null; note?: string; last?: boolean }) {
  return (
    <div className={`flex flex-col gap-[5px] py-[10px] ${last ? "" : "border-b"}`} style={{ borderColor: RULE }}>
      <div className="flex items-baseline justify-between gap-[var(--space-3)]">
        <span className="flex min-w-0 flex-col">
          <span className={SMALL} style={INK}>{label}</span>
          {note && <span className="text-[12.5px] leading-[16px]" style={MUTED}>{note}</span>}
        </span>
        <span className={`${SMALL} flex-none font-bold tabular-nums`} style={INK}>{pct === null ? "Not published" : `${pct}%`}</span>
      </div>
      <div className="h-[8px] w-full overflow-hidden rounded-[3px]" style={{ background: TRACK }} aria-hidden>
        <span className="block h-full rounded-r-[4px]" style={{ width: `${Math.max(0, Math.min(100, pct ?? 0))}%`, background: ACCENT }} />
      </div>
    </div>
  );
}
