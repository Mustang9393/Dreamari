"use client";

import { useLayoutEffect, useRef, useState } from "react";
import usaMapModule from "@svg-maps/usa";
import { CardHud, Citation, GLASS_PANEL_BG, GLASS_PANEL_BORDER, GLASS_PANEL_CLASS, GlassCard, QuestionHeading, StepFooter } from "./ui";
import type { StepProps } from "./steps";

// Location — a REAL USA map (actual state shapes via @svg-maps/usa path data, not
// the reference's grid of abbreviation chips, per direct instruction) plus a
// List view with the same single dropdown. Choose exactly one state.

type UsaMap = { viewBox: string; locations: { id: string; name: string; path: string }[] };
const USA = (usaMapModule as unknown as { default?: UsaMap }).default ?? (usaMapModule as unknown as UsaMap);

// Reposition the outliers: Alaska shrinks to 55% and tucks under the Southwest
// (the stock layout strands it far bottom-left); the viewBox then crops to the
// tightened composition so the mainland renders ~15% larger for free.
// final point = translate + scale * point; labels get the same math in render.
const REPOSITION: Record<string, { s: number; tx: number; ty: number }> = {
  Alaska: { s: 0.55, tx: 229.6, ty: 299.9 },
};
const TIGHT_VIEWBOX = "283 3 944 722";

// The dropdowns list "Washington, D.C." (the map data calls it "District of
// Columbia") — display per the reference.
function displayName(name: string): string {
  return name === "District of Columbia" ? "Washington, D.C." : name;
}

const STATE_NAMES = USA.locations.map((location) => displayName(location.name)).sort((a, b) => a.localeCompare(b));


// USPS codes keyed by map-data name, for on-map labels per the Figma map design.
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

const GREEN = "var(--color-world-food-farming-nature)";

export function LocationStep({ state, patch, onBack, onNext, react, percent, almostDone, sprite }: StepProps) {
  const [view, setView] = useState<"map" | "list">("map");
  const selected = state.state;
  const svgRef = useRef<SVGSVGElement | null>(null);
  // Label anchor per state, measured from the real rendered path bounds (the path
  // data has no precomputed centroids). Tiny north-east states are skipped - at
  // this scale their labels would just collide into noise.
  const [labelPos, setLabelPos] = useState<Record<string, { x: number; y: number }>>({});

  useLayoutEffect(() => {
    if (view !== "map") return;
    const svg = svgRef.current;
    if (!svg) return;
    const next: Record<string, { x: number; y: number }> = {};
    svg.querySelectorAll("path[data-code]").forEach((node) => {
      const path = node as SVGPathElement;
      const code = path.dataset.code!;
      const box = path.getBBox();
      if (box.width < 26 || box.height < 20) return; // skip label-hostile slivers
      next[code] = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    });
    setLabelPos(next);
  }, [view]);

  function pickState(name: string) {
    react();
    // Tap the selected state again to clear it; otherwise it replaces
    // whatever was picked before — only one state at a time.
    patch({ state: selected === name ? "" : name });
  }

  return (
    <div className="flex h-full w-full flex-col">
      <CardHud percent={percent} almostDone={almostDone} />
      <div className="flex min-h-0 flex-1 flex-col" style={{ justifyContent: "safe center" }}>
      <GlassCard>
      <QuestionHeading sprite={sprite} title="Where are you open to going?" subtitle="Choose 1 state." />

      {/* Map | List segmented toggle. */}
      <div
        className={`mb-4 grid grid-cols-2 gap-1 rounded-xl border p-1 ${GLASS_PANEL_CLASS}`}
        style={{ background: GLASS_PANEL_BG, borderColor: GLASS_PANEL_BORDER }}
      >
        {(["map", "list"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            aria-pressed={view === tab}
            onClick={() => setView(tab)}
            className="rounded-lg py-2 text-[14px] font-bold capitalize transition-colors"
            style={{
              background: view === tab ? "var(--color-brand-500)" : "transparent",
              color: view === tab ? "#ffffff" : "var(--color-night-muted-foreground)",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {view === "map" ? (
        <div
          className="rounded-2xl border p-2.5 sm:p-3"
          // Solid, not the shared frosted-panel mix: this box holds ~51 small
          // state shapes that need to read as distinct regions, not text on
          // a background. A see-through card would let the ambient scene
          // bleed in behind it -- and since the flow's aurora now carries a
          // per-step trailing glow (see BuildFlowExperience.tsx), that
          // backdrop shifts hue as the student progresses. A solid map
          // surface keeps state edges reading the same regardless of what's
          // happening behind the card. Lightened well past night-card itself
          // (was 96% night-card, near-black) -- now that the aurora canvas is
          // correctly layered (its own z-index fix), the page behind this
          // card is visibly darker/moodier than before, and a near-black map
          // on a near-black page read as one indistinct mass with no edge.
          style={{ background: "color-mix(in srgb, var(--color-night-card) 78%, var(--color-night-foreground) 22%)", borderColor: GLASS_PANEL_BORDER }}
        >
          <div className="mb-2 flex items-center justify-between px-1">
            <span className="text-[11px] font-bold tracking-[0.18em] text-[var(--color-night-muted-foreground)] uppercase">United States</span>
            <span className="text-[12.5px] font-bold" style={{ color: selected ? GREEN : "var(--color-night-muted-foreground)" }}>
              {selected || "None selected"}
            </span>
          </div>

          <svg ref={svgRef} viewBox={TIGHT_VIEWBOX} role="group" aria-label="Map of the United States" className="-mx-1 max-h-[52vh] w-[calc(100%+8px)]">
            {USA.locations.map((location) => {
              const name = displayName(location.name);
              const isSelected = selected === name;
              const isFull = !!selected && !isSelected;
              return (
                <path
                  key={location.id}
                  data-code={STATE_CODES[location.name] ?? ""}
                  d={location.path}
                  transform={REPOSITION[location.name] ? `translate(${REPOSITION[location.name].tx} ${REPOSITION[location.name].ty}) scale(${REPOSITION[location.name].s})` : undefined}
                  role="button"
                  aria-label={name}
                  aria-pressed={isSelected}
                  tabIndex={0}
                  onClick={() => pickState(name)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      pickState(name);
                    }
                  }}
                  className="cursor-pointer outline-none transition-[fill] duration-150 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-brand-300)]"
                  style={{
                    fill: isSelected
                      ? "var(--color-brand-400)"
                      : isFull
                        ? "color-mix(in srgb, var(--color-night-card) 60%, black)"
                        : "color-mix(in srgb, var(--color-night-card) 85%, var(--color-brand-900))",
                    stroke: isSelected ? "var(--color-brand-300)" : "var(--color-glass-border-raised)",
                    strokeWidth: isSelected ? 1.5 : 0.75,
                    opacity: isFull ? 0.55 : 1,
                  }}
                >
                  <title>{name}</title>
                </path>
              );
            })}
            {/* Invisible hit-buffer per state, layered on top: the same path
               with a constant ON-SCREEN stroke width (non-scaling-stroke
               ignores the SVG's own zoom, so this stays ~16px regardless of
               card width). Sliver states in the Northeast render well under
               any reasonable touch-target size at the visible path's own
               geometry alone (Rhode Island is ~7x9 CSS px on a typical phone
               card) -- this widens what's clickable without changing what's
               painted. Not a11y-exposed; the visible path above is the one
               real control per state (role/aria/keyboard). */}
            {USA.locations.map((location) => {
              const name = displayName(location.name);
              return (
                <path
                  key={`hit-${location.id}`}
                  aria-hidden="true"
                  d={location.path}
                  transform={REPOSITION[location.name] ? `translate(${REPOSITION[location.name].tx} ${REPOSITION[location.name].ty}) scale(${REPOSITION[location.name].s})` : undefined}
                  onClick={() => pickState(name)}
                  className="cursor-pointer"
                  style={{ fill: "transparent", stroke: "transparent", strokeWidth: 16, vectorEffect: "non-scaling-stroke" }}
                />
              );
            })}
            {USA.locations.map((location) => {
              const code = STATE_CODES[location.name];
              const rawPos = code ? labelPos[code] : undefined;
              if (!rawPos) return null;
              const move = REPOSITION[location.name];
              const pos = move ? { x: move.tx + move.s * rawPos.x, y: move.ty + move.s * rawPos.y } : rawPos;
              const name = displayName(location.name);
              const isSelected = selected === name;
              return (
                <text
                  key={`label-${location.id}`}
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="pointer-events-none select-none"
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    fill: isSelected ? "#ffffff" : "var(--color-night-muted-foreground)",
                    opacity: isSelected ? 1 : 0.8,
                  }}
                >
                  {code}
                </text>
              );
            })}
          </svg>
          <p className="mt-2 px-1 text-[12px] font-medium text-[var(--color-night-muted-foreground)] opacity-70">Tap a state to select it.</p>
        </div>
      ) : (
        <select
          aria-label="Choose a state"
          value={selected}
          onChange={(e) => pickState(e.target.value)}
          className={`w-full rounded-xl border px-4 py-3 text-[15px] font-semibold text-[var(--color-night-foreground)] outline-none transition-colors focus:border-[var(--color-brand-400)] ${GLASS_PANEL_CLASS}`}
          style={{
            background: GLASS_PANEL_BG,
            borderColor: GLASS_PANEL_BORDER,
          }}
        >
          <option value="">Choose a state</option>
          {STATE_NAMES.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      )}

      <Citation>MIT CAPD Job Search + BLS OEWS</Citation>
      </GlassCard>
      </div>
      <StepFooter onBack={onBack} onNext={onNext} nextDisabled={!selected} />
    </div>
  );
}
