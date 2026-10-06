"use client";

// Per-chart colour choice (7 Oct 2026). Charts default to the calm palette
// (Maisha: side-by-side bars in one colour "so there isn't too much competing
// for our attention"). The brighter, one-colour-per-bar version stays
// available, but in context: a small "Multicolor" control in the chart's own
// header that recolours that chart only (Chandu: "leave this there but in
// context, not a master toggle where I don't know what it does"). It swaps
// the --v4-cat / --v4-step series tokens on the chart's wrapper (v4.css).

import { useState } from "react";

export function useChartColors() {
  const [multi, setMulti] = useState(false);
  return {
    multi,
    /** Spread onto the chart's wrapper element. */
    attrs: { "data-colors": multi ? "multi" : "one" } as const,
    toggle: <ChartColorsToggle multi={multi} onChange={setMulti} />,
  };
}

export function ChartColorsToggle({ multi, onChange }: { multi: boolean; onChange: (multi: boolean) => void }) {
  return (
    <button type="button" className="v4-colors-toggle" aria-pressed={multi} onClick={() => onChange(!multi)} title={multi ? "Show this chart in one colour" : "Give each bar in this chart its own colour"}>
      <span aria-hidden className="v4-colors-swatch"><i /><i /><i /></span>
      Multicolor
    </button>
  );
}
