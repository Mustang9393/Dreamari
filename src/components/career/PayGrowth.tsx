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
// What that became, top to bottom:
//   1. Two lines on growth, in words: the verdict with its trend arrow, then
//      the change by the projection year and the yearly openings. This
//      replaces the US jobs chart: BLS publishes only the two end points, so
//      the chart drew a straight line between two numbers the sentence
//      already says.
//   2. The map, one at a time, shaded by Pay, Growth or Openings (the
//      dropdown). The readout above it shows the chosen state's three
//      figures together, each with how it compares to the US (arrow up or
//      down), so a student reads "what does this job look like where I live"
//      in one place. CareerOneStop's occupation profile works the same way
//      (one location drives wages and projections together); Indeed and
//      LinkedIn salary pages mark a local figure against the national one
//      with an arrow.
//   3. The top three states for the figure the map shows. They are buttons:
//      choosing one fills the readout, which is the easy way in on a phone
//      where small states are hard to tap.
// The "Your states" list view is gone: the readout opens on the student's
// state, so the list said the same thing a second time.
//
// Sparse data (Usman): a state without a forecast reads "No forecast yet"
// in the readout; a career whose states publish none offers Pay only.

import { useState } from "react";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { Listbox } from "@/components/app/Listbox";
import { DISPLAY, Section } from "@/components/actions-lab/CareerDetailLab";
import { formatPay, parsePay, PayMap, payValues } from "./PayMap";
import { count, pct, stateOutlook, type NationalOutlook } from "./outlook";

type Metric = "pay" | "growth" | "openings";
const SMALL = "text-[15px] leading-[22px]";
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
  const top = Object.entries(shown).sort((a, b) => b[1] - a[1]).slice(0, 3);
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
      {national && (
        <div className="flex flex-col gap-[2px]">
          <p className="flex items-center gap-[8px] text-[18px] leading-[24px] font-semibold" style={{ ...DISPLAY, color: accent }}>
            <Trend dir={Math.sign(national.change)} accent={accent} size={20} />
            {national.verdict}
          </p>
          <p className={SMALL} style={MUTED}>
            {`${Math.abs(Math.round(national.growthPct))}% ${national.change >= 0 ? "more" : "fewer"} jobs by ${national.year}. About ${count(national.openings)} open up each year.`}
          </p>
        </div>
      )}

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
            if (!st) return <p className={SMALL} style={MUTED}>Tap or hover a state.</p>;
            const p = payBy.get(st);
            const o = national ? outlook(st) : null;
            const cells: { m: Metric; label: string; value?: string; dir?: number; note?: string }[] = [
              { m: "pay", label: "Pay", value: p !== undefined ? formatPay(p) : undefined, dir: p !== undefined && usPay ? vs(p, usPay, usPay * 0.03) : undefined, note: p !== undefined && usPay ? ["Below the US", "Same as the US", "Above the US"][vs(p, usPay, usPay * 0.03) + 1] : undefined },
            ];
            if (hasStates && national) {
              cells.push(
                { m: "growth", label: `Growth by ${national.year}`, value: o ? pct(o.growthPct) : undefined, dir: o ? Math.sign(Math.round(o.growthPct * 10)) : undefined, note: o ? ["Slower than the US", "Same as the US", "Faster than the US"][vs(o.growthPct, national.growthPct, 1) + 1] : undefined },
                { m: "openings", label: "Openings", value: o ? count(o.openings) : undefined, note: o ? "Each year" : undefined },
              );
            }
            return (
              <div className="flex flex-col gap-[var(--space-2)]">
                <div className="flex flex-wrap items-baseline justify-between gap-x-[var(--space-3)]">
                  <span className="text-[16px] leading-[22px] font-semibold">{st}{yours ? <span style={MUTED}> (your state)</span> : null}</span>
                  <span className="text-[13px] leading-[18px]" style={MUTED}>Tap or hover a state</span>
                </div>
                <div className={`grid gap-[var(--space-3)] ${cells.length === 3 ? "grid-cols-3" : "grid-cols-1"}`}>
                  {cells.map((c) => (
                    <button
                      key={c.m}
                      type="button"
                      disabled={!hasStates}
                      onClick={() => setMetric(c.m)}
                      aria-pressed={metric === c.m}
                      className={`flex min-w-0 flex-col gap-[2px] rounded-[var(--radius-md)] text-left ${hasStates ? "dm-quiet -m-[8px] cursor-pointer p-[8px]" : "cursor-default"}`}
                    >
                      <span className="truncate text-[13px] leading-[18px] font-semibold" style={MUTED}>{c.label}</span>
                      {c.value ? (
                        <span className="flex items-center gap-[6px] text-[20px] leading-[26px] font-extrabold tabular-nums sm:text-[24px] sm:leading-[30px]" style={{ ...DISPLAY, color: metric === c.m ? accent : "var(--foreground)" }}>
                          {c.value}
                          {c.dir !== undefined && <Trend dir={c.dir} accent={accent} size={18} />}
                        </span>
                      ) : (
                        <span className="text-[15px] leading-[26px] font-semibold sm:leading-[30px]" style={MUTED}>{c.m === "pay" ? "NA" : "No forecast yet"}</span>
                      )}
                      {c.note && <span className="truncate text-[12px] leading-[16px]" style={MUTED}>{c.note}</span>}
                    </button>
                  ))}
                </div>
              </div>
            );
          }}
        />
      )}

      {top.length > 0 && (
        <div className="flex flex-col gap-[var(--space-1)]">
          <h3 className="text-[16px] leading-[22px] font-semibold" style={{ ...DISPLAY, color: accent }}>Top states for {name}</h3>
          <ol className="flex flex-col">
            {top.map(([s, v], i) => (
              <li key={s} className="border-t first:border-t-0" style={{ borderColor: "var(--glass-border)" }}>
                <button type="button" onClick={() => setActive(s)} className="dm-quiet -mx-[8px] flex w-[calc(100%+16px)] min-w-0 cursor-pointer items-center gap-[var(--space-3)] rounded-[var(--radius-md)] px-[8px] py-[12px] text-left">
                  <span className="w-[24px] flex-none text-[13px] leading-[18px] font-semibold tabular-nums" style={MUTED}>#{i + 1}</span>
                  <span className={`${SMALL} min-w-0 flex-1 truncate ${active === s ? "font-semibold" : ""}`}>{s}</span>
                  <span className="text-[16px] leading-[22px] font-semibold tabular-nums" style={{ color: accent }}>{show(metric, v)}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      )}
    </Section>
  );
}

// The usual trend arrow: up in the accent, down muted, flat as a dash.
function Trend({ dir, accent, size }: { dir: number; accent: string; size: number }) {
  const Icon = dir === 0 ? Minus : dir > 0 ? TrendingUp : TrendingDown;
  return <Icon aria-label={dir === 0 ? "About the same" : dir > 0 ? "Up" : "Down"} strokeWidth={2.5} style={{ width: size, height: size, flex: "none", color: dir > 0 ? accent : "var(--muted-foreground)" }} />;
}
