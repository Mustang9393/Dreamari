"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import usaMapModule from "@svg-maps/usa";

// "Whole country" view of Pay by state (production reference, 2026-09-03): the
// USA shaded by what the career pays in each state, in the career's world
// accent, the student's own state outlined in white. Hover, focus or tap a
// state to read its figure. Same map data and layout as Build's Location step
// (@svg-maps/usa, Alaska tucked under the Southwest, tight viewBox).
//
// Real data (4 Oct 2026): careers with OEWS state figures pass every state
// (`complete`), and a state BLS did not publish is left blank. Careers
// without them still get the old DEMO fill: the listed states, and every
// other state from the career's typical pay with a small deterministic
// spread (seeded by career + state, so it never flickers between renders).

type UsaMap = { viewBox: string; locations: { id: string; name: string; path: string }[] };
const USA = (usaMapModule as unknown as { default?: UsaMap }).default ?? (usaMapModule as unknown as UsaMap);

const REPOSITION: Record<string, { s: number; tx: number; ty: number }> = {
  Alaska: { s: 0.55, tx: 229.6, ty: 299.9 },
};
const TIGHT_VIEWBOX = "283 3 944 722";

const STATE_CODES: Record<string, string> = {
  Alabama: "AL", Alaska: "AK", Arizona: "AZ", Arkansas: "AR", California: "CA",
  Colorado: "CO", Connecticut: "CT", Delaware: "DE", Florida: "FL", Georgia: "GA",
  Hawaii: "HI", Idaho: "ID", Illinois: "IL", Indiana: "IN", Iowa: "IA",
  Kansas: "KS", Kentucky: "KY", Louisiana: "LA", Maine: "ME", Maryland: "MD",
  Massachusetts: "MA", Michigan: "MI", Minnesota: "MN", Mississippi: "MS",
  Missouri: "MO", Montana: "MT", Nebraska: "NE", Nevada: "NV",
  "New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY",
  "North Carolina": "NC", "North Dakota": "ND", Ohio: "OH", Oklahoma: "OK",
  Oregon: "OR", Pennsylvania: "PA", "Rhode Island": "RI", "South Carolina": "SC",
  "South Dakota": "SD", Tennessee: "TN", Texas: "TX", Utah: "UT", Vermont: "VT",
  Virginia: "VA", Washington: "WA", "West Virginia": "WV", Wisconsin: "WI",
  Wyoming: "WY", "District of Columbia": "DC", "Washington, DC": "DC",
};

// the map file names DC "Washington, DC"; the app's state lists (Build,
// statePay, outlook) say "Washington, D.C.", so DC matched no data and read
// NA for everything (found 21 Oct 2026)
function displayName(name: string): string {
  return name === "District of Columbia" || name === "Washington, DC" ? "Washington, D.C." : name;
}

function parsePay(text: string): number | null {
  const m = text.replace(/,/g, "").match(/\$?\s*([\d.]+)\s*(K)?/i);
  if (!m) return null;
  const n = parseFloat(m[1]) * (m[2] ? 1000 : 1);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function formatPay(n: number): string {
  return `$${Math.round(n / 1000)}K`;
}

// Small string hash to [0, 1): the demo spread for states we have no figure for.
function hash01(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 10000;
}

/** Pay per state, as the map shades it: the published figure, or (for a
 *  career without every state published) a small seeded spread around the
 *  typical pay, so it never flickers between renders. */
export function payValues(typical: string, rows: { state: string; pay: string }[], complete: boolean, seed: string) {
  const base = parsePay(typical) ?? 60000;
  const known = new Map<string, number>();
  for (const row of rows) {
    const v = parsePay(row.pay);
    if (v) known.set(row.state, v);
  }
  const values = new Map<string, number>();
  for (const location of USA.locations) {
    const name = displayName(location.name);
    const real = known.get(name);
    if (real !== undefined) values.set(name, real);
    else if (!complete) values.set(name, base * (0.78 + 0.44 * hash01(`${seed}:${name}`)));
  }
  return values;
}

export { parsePay, formatPay };

export function PayMap({
  typical,
  rows,
  yourState,
  accent,
  seed,
  complete = false,
  figures,
  active: activeProp,
  onActive,
  renderReadout,
}: {
  /** the career's typical pay, e.g. "$60,580/year" */
  typical: string;
  /** every state we have a real figure for (Your states + Best states) */
  rows: { state: string; pay: string }[];
  yourState?: string;
  accent: string;
  seed: string;
  /** rows hold every state BLS published (statePay.ts): a state missing from
   *  them is left blank, never filled with a made-up figure */
  complete?: boolean;
  /** Pay & Outlook (20 Oct 2026): shade by another per-state figure (job
   *  growth or openings) instead of pay. A state missing from `values` reads
   *  NA, as an unpublished pay state does. `rows`/`typical` are ignored. */
  figures?: { values: Record<string, number>; format: (n: number) => string; prompt: string; label: string; icon?: (n: number) => ReactNode };
  /** controlled hovered/chosen state, so a list beside the map can drive it */
  active?: string | null;
  onActive?: (state: string | null) => void;
  /** Pay & Growth (21 Oct 2026): the caller draws the readout row (the
   *  shown state's pay, growth and openings together) */
  renderReadout?: (shown: string | null, isYours: boolean) => ReactNode;
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [ownActive, setOwnActive] = useState<string | null>(null);
  const active = activeProp !== undefined ? activeProp : ownActive;
  const setActive = (s: string | null) => {
    setOwnActive(s);
    onActive?.(s);
  };
  const [labelPos, setLabelPos] = useState<Record<string, { x: number; y: number }>>({});

  useLayoutEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const next: Record<string, { x: number; y: number }> = {};
    svg.querySelectorAll("path[data-code]").forEach((node) => {
      const path = node as SVGPathElement;
      const box = path.getBBox();
      if (box.width < 26 || box.height < 20) return;
      next[path.dataset.code!] = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    });
    setLabelPos(next);
  }, []);

  const values = figures ? new Map(Object.entries(figures.values)) : payValues(typical, rows, complete, seed);
  const fmt = figures?.format ?? formatPay;
  const all = [...values.values()];
  const min = Math.min(...all);
  const max = Math.max(...all);
  // clamped to the palette, so no value can fall off its dark end
  const shade = (v: number) => {
    const t = max === min ? 0.6 : Math.min(1, Math.max(0, (v - min) / (max - min)));
    // the low end starts at 45% of the accent, so the lowest-paying state
    // still reads as the map's colour, never as black
    return `color-mix(in srgb, ${accent} ${Math.round(45 + t * 55)}%, #14121f)`;
  };
  // A state with no published pay (14 Oct 2026, Chandu: "some states ...
  // are shown as black. Don't do that. Use the same colors and just say NA
  // as the hover text"): a mid tone from the same palette, read as NA.
  const NA = "NA";
  const missingFill = shade((min + max) / 2);

  return (
    <div className="relative">
      {/* readout (20 Oct 2026, Chandu: the hover stat was "hard to see,
         especially on tablet and mobile it overlaps the map"): its own row
         above the map, never on it, at display size. It shows the student's
         state until another is hovered or tapped, so it is never empty. */}
      {renderReadout ? (
        <div className="mb-[var(--space-3)] border-b pb-[var(--space-3)]" style={{ borderColor: "var(--glass-border)" }} aria-live="polite">
          {renderReadout(active ?? yourState ?? null, !active && !!yourState)}
        </div>
      ) : (() => {
        const shown = active ?? yourState ?? null;
        const v = shown ? values.get(shown) : undefined;
        return (
          <div className="mb-[var(--space-3)] flex min-h-[56px] flex-wrap items-end justify-between gap-x-[var(--space-4)] gap-y-[4px] border-b pb-[var(--space-3)]" style={{ borderColor: "var(--glass-border)" }} aria-live="polite">
            {shown ? (
              <span className="flex min-w-0 flex-col">
                <span className="text-[14px] leading-[20px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{shown}{!active && shown === yourState ? " (your state)" : ""}</span>
                <span className="flex items-center gap-[8px] text-[26px] leading-[30px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: v === undefined ? "var(--muted-foreground)" : accent }}>{v === undefined ? NA : fmt(v)}{v !== undefined && figures?.icon?.(v)}</span>
              </span>
            ) : <span />}
            <span className="text-[13px] leading-[18px]" style={{ color: "var(--muted-foreground)" }}>{figures?.prompt ?? "Tap or hover a state to see what it pays there"}</span>
          </div>
        );
      })()}

      <svg ref={svgRef} viewBox={TIGHT_VIEWBOX} role="group" aria-label={figures?.label ?? "Pay by state across the United States"} className="w-full" style={{ maxHeight: 560 }} onMouseLeave={() => setActive(null)}>
        {USA.locations.map((location) => {
          const name = displayName(location.name);
          const value = values.get(name);
          const label = value === undefined ? `${name}: ${NA}` : `${name}: ${fmt(value)}`;
          const isActive = active === name;
          const isYours = yourState === name;
          const move = REPOSITION[location.name];
          return (
            <path
              key={location.id}
              data-code={STATE_CODES[location.name] ?? ""}
              d={location.path}
              transform={move ? `translate(${move.tx} ${move.ty}) scale(${move.s})` : undefined}
              role="button"
              tabIndex={0}
              aria-label={label}
              onMouseEnter={() => setActive(name)}
              onFocus={() => setActive(name)}
              onClick={() => setActive(name)}
              className="cursor-pointer outline-none transition-[fill,opacity] duration-150"
              style={{
                fill: value === undefined ? missingFill : shade(value),
                opacity: active && !isActive ? 0.72 : 1,
                stroke: isYours ? "#ffffff" : isActive ? `color-mix(in srgb, ${accent} 70%, #ffffff)` : "rgba(10,9,20,0.75)",
                strokeWidth: isYours ? 2.5 : isActive ? 1.5 : 0.75,
                strokeLinejoin: "round",
              }}
            >
              <title>{label}</title>
            </path>
          );
        })}
        {/* your state's outline drawn last so neighbours never cover it */}
        {USA.locations
          .filter((location) => displayName(location.name) === yourState)
          .map((location) => {
            const move = REPOSITION[location.name];
            return <path key={`yours-${location.id}`} aria-hidden d={location.path} transform={move ? `translate(${move.tx} ${move.ty}) scale(${move.s})` : undefined} style={{ fill: "none", stroke: "#ffffff", strokeWidth: 2.5, strokeLinejoin: "round", pointerEvents: "none" }} />;
          })}
        {USA.locations.map((location) => {
          const code = STATE_CODES[location.name];
          const raw = code ? labelPos[code] : undefined;
          if (!raw) return null;
          const move = REPOSITION[location.name];
          const pos = move ? { x: move.tx + move.s * raw.x, y: move.ty + move.s * raw.y } : raw;
          return (
            <text key={`label-${location.id}`} x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="central" className="pointer-events-none select-none" style={{ fontSize: 15, fontWeight: 700, fill: "rgba(255,255,255,0.82)", fontFamily: "var(--font-body)" }}>
              {code}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
