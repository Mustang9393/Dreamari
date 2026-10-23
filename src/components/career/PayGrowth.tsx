"use client";

// Career Detail's "Pay & Growth" tab: two panels, Pay by state and Job
// growth, each with one focal figure.
//
// Why (22 Oct 2026, Chandu): "check the pay tab ... make it super easy to
// scan and understand. We dont need to show a huge table thats distracting
// we need to figure out how to present the data better like the other
// tabs", then, on the first pass (one column of three figures, each with an
// arrow against the US): "the trend arrows apparently are giving too many
// signals at once and it seems confusing. We can also even split pay part
// into one section and growth into another if that makes sense, but dont
// listen to me. Please do your own research, hierarchy, UI, UX everything
// to make this as useful and low cognitive load as possible."
//
// What was wrong with the arrows: one glyph carried two meanings. Next to
// pay it meant "above the US"; next to growth, a trend line, it read as
// "going up", so a state growing +2% against a US +4% showed a positive
// number beside a falling line. Three figures, three arrows, three US
// comparators: nine signals for one state.
//
// What the field does instead (BLS Occupational Outlook, CareerOneStop,
// O*NET, Indeed, Glassdoor): one number, one plain-English verdict, and a
// comparison said in words ("12% above the national average"), never as
// an arrow; a range as a bar with the value marked. So:
//   Pay by state   the shown state's pay as the one big figure, one line
//                  of words against the US ("$11K more than the US
//                  typical"), the house LightRange from the lowest-paying
//                  state to the highest with this state as the point, and
//                  the map, coloured by pay. Hover or tap a state and the
//                  column follows. No arrows.
//   Job growth     three cells in the fact strip's own shape (label over
//                  figure): growth by the forecast year with the one
//                  trend icon on the page and the profile's verdict
//                  ("Growing about as fast as most jobs"), openings a
//                  year in the US, openings a year in the student's state.
// Two panels because they answer two questions, "What would I make?" and
// "Will there be jobs?", and a reader can stop after the first.
// Cut: the per-state growth percent. It is seeded demo data (outlook.ts)
// and it was the figure whose arrow contradicted its sign. Real state
// projections (Projections Central) can bring it back as one line in the
// state's openings cell.
// A career with no state pay gets the Pay panel without a map: US pay with
// the starting-to-top range from the What it pays figures.

import { useState } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { DISPLAY, Section } from "@/components/career/CareerDetail";
import { LightRange } from "@/components/app/LightRange";
import { formatPay, parsePay, PayMap, payValues } from "./PayMap";
import { count, pct, stateOutlook, type NationalOutlook } from "./outlook";

const MUTED = { color: "var(--muted-foreground)" } as const;
const num = (s: string) => Number(s.replace(/[^0-9.]/g, ""));

export function PayGrowth({ slug, accent, typical, pay, range, national, yourState }: {
  slug: string;
  accent: string;
  /** the career's typical pay, e.g. "$98,540/year" */
  typical: string;
  pay: { title?: string; yourStates?: { state: string; pay: string }[]; best: { state: string; pay: string }[]; all?: { state: string; pay: string }[] } | null;
  /** the US starting-to-top range (the What it pays sheet's figures); the
   *  range line for a career with no state pay */
  range?: { starting: string; typical: string; top: string } | null;
  national: NationalOutlook | null;
  yourState?: string;
}) {
  const [active, setActive] = useState<string | null>(null);

  const usPay = parsePay(typical) ?? 0;
  const payBy = pay ? payValues(typical, pay.all ?? [...(pay.yourStates ?? []), ...pay.best], !!pay.all, slug) : new Map<string, number>();
  const states = [...payBy.keys()];
  const shown = pay ? (active ?? yourState ?? null) : null;
  const yours = !!pay && !active && !!yourState && shown === yourState;

  // the range across every state with a figure, lowest to highest
  const ranked = states.filter((s) => payBy.get(s) !== undefined).sort((a, b) => payBy.get(a)! - payBy.get(b)!);
  const lowest = ranked[0];
  const highest = ranked[ranked.length - 1];
  const lo = lowest ? payBy.get(lowest)! : 0;
  const hi = highest ? payBy.get(highest)! : 0;

  // the shown state's pay, or the US typical when there is no state
  const p = shown ? payBy.get(shown) : usPay || undefined;
  const at = shown
    ? p !== undefined && hi > lo ? ((p - lo) / (hi - lo)) * 100 : null
    : range && num(range.top) > num(range.starting) ? ((num(range.typical) - num(range.starting)) / (num(range.top) - num(range.starting))) * 100 : null;

  // the comparison, in words: within 3% of the US counts as the same
  const diff = shown && p !== undefined && usPay ? p - usPay : null;
  const versus =
    diff === null ? null
    : Math.abs(diff) <= usPay * 0.03 ? "About the same as the US typical"
    : `${formatPay(Math.abs(diff))} ${diff > 0 ? "more" : "less"} than the US typical`;

  const mine = yourState && national ? stateOutlook(slug, yourState, national) : null;

  return (
    <>
      <Section id="pay" title={pay ? (pay.title ?? "Pay by state") : "Pay"}>
        <div className={`grid gap-[var(--space-6)] ${pay ? "md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]" : ""}`}>
          {/* the scan column: one state's pay, the student's own by default */}
          <div className="flex min-w-0 flex-col gap-[var(--space-5)]" aria-live="polite">
            <div className="flex flex-col gap-[4px]">
              <h3 className="text-[18px] leading-[24px] font-semibold" style={{ ...DISPLAY, color: accent }}>
                {shown ?? "Across the US"}
                {yours && <span className="font-medium" style={MUTED}> (yours)</span>}
              </h3>
              <span className="flex flex-wrap items-baseline gap-x-[8px]">
                <Numeral accent={accent}>{p !== undefined ? formatPay(p) : "NA"}</Numeral>
                {p !== undefined && <span className="text-[15px] leading-[22px] font-semibold" style={MUTED}>a year</span>}
              </span>
              {versus && <span className="text-[15px] leading-[22px]" style={MUTED}>{versus}</span>}
            </div>

            {shown && lowest && highest && hi > lo ? (
              <LightRange
                accent={accent}
                at={at}
                from={{ label: `Lowest, ${lowest}`, value: formatPay(lo) }}
                to={{ label: `Highest, ${highest}`, value: formatPay(hi) }}
                ariaLabel={`Pay by state runs from ${formatPay(lo)} in ${lowest} to ${formatPay(hi)} in ${highest}${p !== undefined ? `; ${shown} pays ${formatPay(p)}` : ""}`}
              />
            ) : !shown && range ? (
              <LightRange
                accent={accent}
                at={at}
                from={{ label: "Starting out", value: range.starting }}
                to={{ label: "Top earners", value: range.top }}
                ariaLabel={`Starting out ${range.starting}, typical ${range.typical}, top earners ${range.top}`}
              />
            ) : null}
          </div>

          {pay && (
            <PayMap
              typical={typical}
              rows={[]}
              accent={accent}
              seed={slug}
              yourState={yourState}
              active={active}
              onActive={setActive}
              figures={{ values: Object.fromEntries(payBy), format: formatPay, prompt: "", label: "Pay by state" }}
              renderReadout={() => null}
            />
          )}
        </div>
      </Section>

      {national && (
        <Section id="growth" title="Job growth">
          <div className={`grid gap-[var(--space-5)] ${mine ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
            <Cell label={`${national.change < 0 ? "Fewer" : "More"} jobs by ${national.year}`}>
              <span className="flex items-center gap-[8px]">
                <Numeral accent={accent}>{pct(national.growthPct)}</Numeral>
                {/* the one trend icon on the page: a change over time (Chandu,
                   21 Oct 2026: "the trendline for growth") */}
                {national.change < 0 ? (
                  <TrendingDown aria-label="Fewer jobs" strokeWidth={2.5} className="size-[22px] flex-none" style={MUTED} />
                ) : (
                  <TrendingUp aria-label="More jobs" strokeWidth={2.5} className="size-[22px] flex-none" style={{ color: accent }} />
                )}
              </span>
              <span className="text-[15px] leading-[22px]" style={MUTED}>{national.verdict}</span>
            </Cell>
            <Cell label="Openings a year in the US">
              <Numeral accent={accent}>{count(national.openings)}</Numeral>
            </Cell>
            {mine && yourState && (
              <Cell label={`Openings a year in ${yourState}`}>
                <Numeral accent={accent}>{count(mine.openings)}</Numeral>
              </Cell>
            )}
          </div>
        </Section>
      )}
    </>
  );
}

/** The page's key-figure gradient numeral, as on the fact strip. */
function Numeral({ accent, children }: { accent: string; children: React.ReactNode }) {
  return (
    <span
      className="text-[28px] leading-[34px] font-extrabold tabular-nums sm:text-[32px] sm:leading-[38px]"
      style={{ ...DISPLAY, backgroundImage: `linear-gradient(135deg, color-mix(in srgb, ${accent} 55%, #ffffff) 0%, ${accent} 100%)`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}
    >
      {children}
    </span>
  );
}

/** A label over a figure, the fact strip's own shape. */
function Cell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-[4px]">
      <span className="text-[14px] leading-[20px] font-semibold" style={MUTED}>{label}</span>
      {children}
    </div>
  );
}
