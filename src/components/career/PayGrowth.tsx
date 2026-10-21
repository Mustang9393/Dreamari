"use client";

// Career Detail's "Pay & Growth" tab: one section, one map.
//
// Why (21 Oct 2026, Chandu, on the two-section Pay & Outlook tab): "can we
// combine pay and outlook somehow? just one map by default and pay and growth
// instead of outlook and somehow lets just show 1 or 2 main line that
// describes the growth of the career. We can have a dropdown for by growth or
// by opening or when we hover we can show pay, growth and openings with an
// arrow to show increase/decrease where we show the pay now", plus "use your
// own judgment to give me the best possible solution".
//
// What that became, after "this is way too cluttered", "Remove all
// redundant and extra copy" and "the highlight border thing isnt needed":
//   (No US growth line or chart: Chandu, "remove the 5% more jobs in US
//   thing"; the arrows already read each state against the US.)
//   1. One map, coloured by the dropdown: pay, growth or openings.
//   2. Above the map, the chosen state's three figures, each with an arrow
//      against the US (openings against the state's share of US jobs:
//      "give the openings a year a trend arrow"; each arrow's label says so to
//      screen readers), in the gradient numeral. CareerOneStop ties wages and
//      projections to one location the same way; Indeed and LinkedIn mark a
//      local figure against the national one with an arrow.
// No top-states list, no captions, no hint line: the map and readout say it.
// Sparse data (Usman): a state without a forecast reads "NA"
// in the readout; a career whose states publish none offers Pay only.

import { useState } from "react";
import { ArrowDown, ArrowUp, Minus, TrendingDown, TrendingUp } from "lucide-react";
import { Listbox } from "@/components/app/Listbox";
import { DISPLAY, Section } from "@/components/actions-lab/CareerDetailLab";
import { formatPay, parsePay, PayMap, payValues } from "./PayMap";
import { count, expectedOpenings, pct, stateOutlook, type NationalOutlook } from "./outlook";

type Metric = "pay" | "growth" | "openings";
const MUTED = { color: "var(--muted-foreground)" } as const;
const PICKER = "dm-quiet h-[36px] rounded-[var(--radius-md)] border pr-[10px] pl-[12px] text-[13px] leading-[18px] font-semibold";
const PICKER_STYLE = { background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" } as const;

/** -1 below, 0 about the same, 1 above (within 3% counts as the same) */
const vs = (v: number, us: number, band: number) => (Math.abs(v - us) <= band ? 0 : v > us ? 1 : -1);

export function PayGrowth({ slug, accent, typical, pay, national, yourState }: {
  slug: string;
  accent: string;
  /** the career's typical pay, e.g. "$98,540/year" */
  typical: string;
  pay: { title?: string; yourStates?: { state: string; pay: string }[]; best: { state: string; pay: string }[]; all?: { state: string; pay: string }[] } | null;
  national: NationalOutlook | null;
  yourState?: string;
}) {
  const [metric, setMetric] = useState<Metric>("pay");
  const [active, setActive] = useState<string | null>(null);

  const usPay = parsePay(typical) ?? 0;
  const payBy = pay ? payValues(typical, pay.all ?? [...(pay.yourStates ?? []), ...pay.best], !!pay.all, slug) : new Map<string, number>();
  const outlook = (s: string) => stateOutlook(slug, s, national);
  const states = [...payBy.keys()];
  const hasStates = !!national && states.some((s) => outlook(s));
  const values = (m: Metric): Record<string, number> => {
    const out: Record<string, number> = {};
    for (const s of states) {
      const v = m === "pay" ? payBy.get(s) : m === "growth" ? outlook(s)?.growthPct : outlook(s)?.openings;
      if (v !== undefined) out[s] = v;
    }
    return out;
  };
  const shown = values(metric);
  const show = (m: Metric, n: number) => (m === "pay" ? formatPay(n) : m === "growth" ? pct(n) : count(n));
  const name = metric === "pay" ? "pay" : metric === "growth" ? "job growth" : "openings";

  return (
    <Section
      id="pay"
      title={hasStates ? "Pay and growth by state" : (pay?.title ?? "Pay by state")}
      action={
        hasStates ? (
          <Listbox
            ariaLabel="Color the map by"
            value={metric}
            onChange={(v) => setMetric(v as Metric)}
            options={[
              { value: "pay", label: "By pay" },
              { value: "growth", label: "By growth" },
              { value: "openings", label: "By openings" },
            ]}
            className={`${PICKER} w-[136px]`}
            style={PICKER_STYLE}
            panelClassName="p-[6px]"
          />
        ) : undefined
      }
    >

      {pay && (
        <PayMap
          typical={typical}
          rows={[]}
          accent={accent}
          seed={slug}
          yourState={yourState}
          active={active}
          onActive={setActive}
          figures={{
            values: shown,
            format: (n) => show(metric, n),
            prompt: "",
            label: `${name[0].toUpperCase()}${name.slice(1)} by state`,
          }}
          renderReadout={(st, yours) => {
            if (!st) return null;
            const p = payBy.get(st);
            const o = national ? outlook(st) : null;
            const cells: { m: Metric; label: string; value?: string; dir?: number; note?: string }[] = [
              { m: "pay", label: "Pay", value: p !== undefined ? formatPay(p) : undefined, dir: p !== undefined && usPay ? vs(p, usPay, usPay * 0.03) : undefined },
            ];
            if (hasStates && national) {
              cells.push(
                { m: "growth", label: "Growth", value: o ? pct(o.growthPct) : undefined, dir: o ? vs(o.growthPct, national.growthPct, 1) : undefined },
                { m: "openings", label: "Openings a year", value: o ? count(o.openings) : undefined, dir: o ? (() => { const fair = expectedOpenings(st, national); return fair ? vs(o.openings, fair, fair * 0.05) : undefined; })() : undefined },
              );
            }
            return (
              <div className="flex flex-col gap-[var(--space-2)]">
                <span className="text-[16px] leading-[22px] font-semibold">{st}{yours ? <span style={MUTED}> (yours)</span> : null}</span>
                <div className={`grid gap-[var(--space-3)] ${cells.length === 3 ? "grid-cols-3" : "grid-cols-1"}`}>
                  {cells.map((c) => (
                    <div key={c.m} className="flex min-w-0 flex-col gap-[2px]">
                      <span className="truncate text-[13px] leading-[18px] font-semibold" style={MUTED}>{c.label}</span>
                      {c.value ? (
                        <span className="flex items-center gap-[6px] text-[20px] leading-[26px] font-extrabold tabular-nums sm:text-[24px] sm:leading-[30px]" style={DISPLAY}>
                          {/* the page's key-figure gradient, as on the fact strip
                             ("give the numbers the gradient treatment in that row too") */}
                          <span style={{ backgroundImage: `linear-gradient(135deg, color-mix(in srgb, ${accent} 55%, #ffffff) 0%, ${accent} 100%)`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{c.value}</span>
                          {c.dir !== undefined && <Trend dir={c.dir} accent={accent} size={18} vsUs plain={c.m !== "growth"} />}
                        </span>
                      ) : (
                        <span className="text-[15px] leading-[26px] font-semibold sm:leading-[30px]" style={MUTED}>NA</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          }}
        />
      )}

    </Section>
  );
}

// The usual trend arrow: up in the accent, down muted, flat as a dash.
// Growth gets the trend line (it is a change over time); pay and openings a
// plain up or down arrow (Chandu: "just be an up or down arrow for openings
// and the trendline for growth").
function Trend({ dir, accent, size, vsUs, plain }: { dir: number; accent: string; size: number; vsUs?: boolean; plain?: boolean }) {
  const Icon = dir === 0 ? Minus : plain ? (dir > 0 ? ArrowUp : ArrowDown) : dir > 0 ? TrendingUp : TrendingDown;
  const said = vsUs ? (dir === 0 ? "Same as the US" : dir > 0 ? "Above the US" : "Below the US") : dir === 0 ? "Flat" : dir > 0 ? "Up" : "Down";
  return <Icon aria-label={said} strokeWidth={2.5} style={{ width: size, height: size, flex: "none", color: dir > 0 ? accent : "var(--muted-foreground)" }} />;
}
