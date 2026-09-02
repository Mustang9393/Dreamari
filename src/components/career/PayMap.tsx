"use client";

import { useLayoutEffect, useRef, useState } from "react";
import usaMapModule from "@svg-maps/usa";

// "Whole country" view of Pay by state (production reference, 2026-09-03): the
// USA shaded by what the career pays in each state, in the career's world
// accent, the student's own state outlined in white. Hover, focus or tap a
// state to read its figure. Same map data and layout as Build's Location step
// (@svg-maps/usa, Alaska tucked under the Southwest, tight viewBox).
//
// DEMO DATA: production carries a figure for every state. The prototype has
// the listed states only (Your states, Best states), so every other state is
// filled from the career's typical pay with a small deterministic spread
// (seeded by career + state, so it never flickers between renders).

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
  Wyoming: "WY", "District of Columbia": "DC",
};

function displayName(name: string): string {
  return name === "District of Columbia" ? "Washington, D.C." : name;
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

export function PayMap({
  typical,
  rows,
  yourState,
  accent,
  seed,
}: {
  /** the career's typical pay, e.g. "$60,580/year" */
  typical: string;
  /** every state we have a real figure for (Your states + Best states) */
  rows: { state: string; pay: string }[];
  yourState?: string;
  accent: string;
  seed: string;
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [active, setActive] = useState<string | null>(null);
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

  const base = parsePay(typical) ?? 60000;
  const known = new Map<string, number>();
  for (const row of rows) {
    const v = parsePay(row.pay);
    if (v) known.set(row.state, v);
  }
  const values = new Map<string, number>();
  for (const location of USA.locations) {
    const name = displayName(location.name);
    values.set(name, known.get(name) ?? base * (0.78 + 0.44 * hash01(`${seed}:${name}`)));
  }
  const all = [...values.values()];
  const min = Math.min(...all);
  const max = Math.max(...all);
  const shade = (v: number) => {
    const t = max === min ? 0.6 : (v - min) / (max - min);
    return `color-mix(in srgb, ${accent} ${Math.round(22 + t * 78)}%, #14121f)`;
  };
  const activeValue = active ? values.get(active) : undefined;

  return (
    <div className="relative">
      {/* readout: the hovered or chosen state and what it pays there */}
      <div className="absolute top-0 right-0 z-10 flex min-h-[44px] flex-col items-end text-right">
        {active && activeValue ? (
          <>
            <span className="text-[15px] leading-[22px] font-semibold">{active}</span>
            <span className="text-[15px] leading-[22px] font-bold tabular-nums" style={{ fontFamily: "var(--font-display)", color: accent }}>{formatPay(activeValue)}</span>
          </>
        ) : (
          <span className="text-[13px] leading-[18px]" style={{ color: "var(--muted-foreground)" }}>Hover a state to see what it pays there</span>
        )}
      </div>

      <svg ref={svgRef} viewBox={TIGHT_VIEWBOX} role="group" aria-label="Pay by state across the United States" className="w-full" style={{ maxHeight: 560 }} onMouseLeave={() => setActive(null)}>
        {USA.locations.map((location) => {
          const name = displayName(location.name);
          const value = values.get(name) ?? base;
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
              aria-label={`${name}: ${formatPay(value)}`}
              onMouseEnter={() => setActive(name)}
              onFocus={() => setActive(name)}
              onClick={() => setActive(name)}
              className="cursor-pointer outline-none transition-[fill,opacity] duration-150"
              style={{
                fill: shade(value),
                opacity: active && !isActive ? 0.72 : 1,
                stroke: isYours ? "#ffffff" : isActive ? `color-mix(in srgb, ${accent} 70%, #ffffff)` : "rgba(10,9,20,0.75)",
                strokeWidth: isYours ? 2.5 : isActive ? 1.5 : 0.75,
                strokeLinejoin: "round",
              }}
            >
              <title>{`${name}: ${formatPay(value)}`}</title>
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
