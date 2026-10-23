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
//   Job growth     cells in the fact strip's own shape (label over
//                  figure): growth by the forecast year with the one
//                  trend icon on the page and the profile's verdict
//                  ("Growing about as fast as most jobs"), people doing
//                  the job today, openings a year in the US, openings a
//                  year in the student's state.
// Two panels because they answer two questions, "What would I make?" and
// "Will there be jobs?", and a reader can stop after the first.
//
// 23 Oct 2026 (Chandu: "is there some decluttering that can be done on the
// pay and growth page ... without losing the content? Also are we showing
// all the necessary and useful data for a student from the dreamonna
// version?"). Against dreamonna's page, three of its figures were missing
// here, and they come back as one line each, not as a table:
//   - People doing it (dreamonna's third quick fact): a Job growth cell.
//   - Best states (dreamonna's top-three list): one line of words under
//     the pay figure, each state a quiet button that moves the column and
//     the map to it. The list of rows stays gone (22 Oct).
//   - Best states: the bar's "Highest" end already names the top state;
//     the map shows the rest. A first pass added a "Pays most in X, Y and
//     Z" line and an openings note; Chandu, same day: "theres so many
//     sentences to read right now ... I like the bar stuff but its the
//     other info im a bit worried about", so every sentence went. The US
//     comparison ("$11K more than the US typical") is a small second fact
//     beside the figure, a chip reading "19% above avg" (a US point on the
//     bar, "+19% vs the US", a state rank and a "▲ 19%" ticker chip were
//     tried first; see the note at `vsAvg` for the research and the
//     baseline).
//     The panel is a label, two figures, the bar and the map. Job growth
//     keeps one line of words, the verdict.
// Decluttered without dropping anything: the map's state codes are quiet
// wayfinding now, lit only on the shown state and the student's own
// (PayMap); the Job growth cells sit two to a row on a phone instead of
// stacking four deep; labels are three or four words.
// Cut earlier (22 Oct): the per-state growth percent. It is seeded demo data
// (outlook.ts) and it was the figure whose arrow contradicted its sign. Real
// state projections (Projections Central) can bring it back as one line in
// the state's openings cell. State openings are still seeded (DEMO-ONLY).
// A career with no state pay gets the Pay panel without a map: US pay with
// the starting-to-top range from the What it pays figures.

import { useState } from "react";
import { MapPin, TrendingDown, TrendingUp } from "lucide-react";
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

  // The comparison as one small fact beside the figure, a percent against
  // the average. What the field does (Indeed, ZipRecruiter, Payscale,
  // Glassdoor): a state or city figure carries "19% above the national
  // average" / "below the national average" / "meets the national
  // average". Here "national" goes, since "US" confused the reading
  // (Chandu, 23 Oct 2026: "these are all IN the US right?"), and a rank
  // ("8th of 50 states") was turned down the same day ("no rank. Something
  // simpler. Maybe % above average").
  //
  // The average is the mean of the states' own figures when the career has
  // BLS state data, not the profile's Typical pay. Same day, Chandu, on
  // Investment Banking: "everything points down and I'm worried the whole
  // thing might not be accurate". It was the baseline: IB's headline is
  // the brief's $361,000 while its state figures are BLS wages for the
  // closest occupation (securities and financial services sales agents,
  // $59K to $185K), so every state read far below "average". Comparing a
  // state with the average of the same dataset keeps the chip honest with
  // the map and the bar whatever the headline says. (The headline-versus-
  // BLS question itself is Maisha's item 1 for Usman, 20 Oct 2026.)
  const average = pay?.all && states.length ? [...payBy.values()].reduce((a, b) => a + b, 0) / payBy.size : usPay;
  const vsAvg = shown && p !== undefined && average ? Math.round(((p - average) / average) * 100) : null;
  // "19% above avg", not a triangle: an arrow read as a trend over time
  // (Chandu: "im not sure if it confuses between a trending number or vs
  // US typical pay"); the one trend icon on the tab stays with Job growth
  const chip = vsAvg === null || Math.abs(vsAvg) <= 3 ? null : `${Math.abs(vsAvg)}% ${vsAvg > 0 ? "above" : "below"} avg`;
  const chipWords = vsAvg === null ? "" : Math.abs(vsAvg) <= 3 ? "about average for this job" : `${Math.abs(vsAvg)}% ${vsAvg > 0 ? "above" : "below"} the average state for this job`;

  const mine = yourState && national ? stateOutlook(slug, yourState, national) : null;

  return (
    <>
      <Section id="pay" title={pay ? (pay.title ?? "Pay by state") : "Pay"}>
        {/* Reimagined 23 Oct 2026 (Chandu: "Its still too much to read
           somehow. And the label above and number below might not make
           sense in terms of hierarchy here? We can re imagine the whole
           section"). Three things, top to bottom, each bigger than the
           next: the readout row (the figure, with a small stock-style chip
           for above or below average, and the pinned state it belongs to),
           the map at full width, and the bar under the map as its legend:
           the same dim-to-bright scale the map is coloured with, lowest
           state to highest, the shown state as the point of light. No
           label-over-number pairs, no sentence. */}
        {/* one column on a phone (readout, map, bar); two from md, the map
           on the right capped at 400px, so the whole panel sits on one
           screen (Chandu, 23 Oct 2026, on the full-width map: "now its too
           big and i cant interact with it on one screen and have to scroll") */}
        {/* One map, placed by the grid: a phone stacks readout, map, bar;
           from md the readout and the bar sit top-aligned on the left and
           the map spans both rows on the right. Two copies of the map used
           to swap at md, and the copy hidden at mount never measured its
           state codes, so the labels vanished after a resize (found 23 Oct
           2026). */}
        <div className={`grid gap-[var(--space-5)] ${pay ? "md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:grid-rows-[auto_1fr] md:gap-x-[var(--space-6)] md:gap-y-[var(--space-8)]" : ""}`}>
          {/* top-aligned, not centred against the map (Chandu, 23 Oct 2026:
             "aligned to the top rather than central and spaced out evenly") */}
          <div className="md:col-start-1 md:row-start-1 md:pt-[var(--space-2)]">
            <div className="flex flex-wrap items-center justify-between gap-x-[var(--space-6)] gap-y-[6px] md:flex-col md:items-start md:gap-y-[6px]" aria-live="polite">
              <span className="flex flex-wrap items-baseline gap-x-[10px]">
                <Numeral accent={accent}>{p !== undefined ? formatPay(p) : "NA"}</Numeral>
                {p !== undefined && <span className="text-[15px] leading-[22px] font-semibold" style={MUTED}>a year</span>}
                {chip && (
                  <span
                    // on the same baseline as "a year", not centred on the big
                  // figure (Chandu, 23 Oct 2026: "should align with the 'a
                  // year'. Otherwise things seem to be wobbly")
                  className="rounded-[8px] px-[8px] py-[2px] text-[13px] leading-[18px] font-bold tabular-nums"
                    style={vsAvg! > 0 ? { background: `color-mix(in srgb, ${accent} 18%, transparent)`, color: accent } : { background: "var(--glass-surface-1)", color: "var(--muted-foreground)" }}
                    title={chipWords}
                    aria-label={chipWords}
                  >
                    <span aria-hidden>{chip}</span>
                  </span>
                )}
              </span>
              {/* a pin before the name, so it reads as a place that changes
                 with the map (Chandu, 23 Oct 2026: "add a pin icon for the
                 state name so its obvious that its the state's name that's
                 changing there") */}
              <span className="flex items-center gap-[5px] text-[14px] leading-[20px] font-semibold" style={MUTED}>
                {shown && <MapPin aria-hidden className="size-[14px] flex-none" strokeWidth={2.25} style={{ color: accent }} />}
                <span>{shown ? (yours ? `${shown}, your state` : shown) : "Across the US"}</span>
              </span>
            </div>
          </div>

          {pay && (
            <div className="md:col-start-2 md:row-span-2 md:row-start-1">
              <PayMap typical={typical} rows={[]} accent={accent} seed={slug} yourState={yourState} active={active} onActive={setActive} figures={{ values: Object.fromEntries(payBy), format: formatPay, prompt: "", label: "Pay by state" }} renderReadout={() => null} maxHeight={400} />
            </div>
          )}

          <div className="md:col-start-1 md:row-start-2 md:self-start">
            {shown && lowest && highest && hi > lo ? (
              <LightRange
                accent={accent}
                at={at}
                // the ends name their states (Chandu, 23 Oct 2026: "highest
                // and lowest need to show the state names. But how do we do
                // that without clutter?"): the bar runs low to high, dim to
                // bright, like the map, so its ends already say lowest and
                // highest, and the one small word under each end is the state
                from={{ label: lowest, value: formatPay(lo) }}
                to={{ label: highest, value: formatPay(hi) }}
                ariaLabel={`Pay by state runs from ${formatPay(lo)} in ${lowest} to ${formatPay(hi)} in ${highest}${p !== undefined ? `; ${shown} pays ${formatPay(p)}` : ""}${chipWords ? `, ${chipWords}` : ""}`}
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
        </div>
      </Section>

      {national && (
        <Section id="growth" title="Job growth">
          {/* two to a row on a phone, one row from lg: the four cells are
             one reading, not a list to scroll */}
          <div className={`grid grid-cols-2 gap-x-[var(--space-5)] gap-y-[var(--space-5)] ${mine ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
            <Cell label={`Jobs by ${national.year}`}>
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
              {/* two words, never a wrapped sentence with one word hanging
                 (Chandu, 23 Oct 2026: "i dont want it to wrap and have a
                 single word hanging off it. We can even consider rephrasing
                 in simpler terms") */}
              <span className="text-[14px] leading-[20px] whitespace-nowrap" style={MUTED} title={national.verdict}>{shortVerdict(national)}</span>
            </Cell>
            <Cell label="People doing it">
              <Numeral accent={accent}>{count(national.employment)}</Numeral>
            </Cell>
            <Cell label="Openings a year, US">
              <Numeral accent={accent}>{count(national.openings)}</Numeral>
            </Cell>
            {mine && yourState && (
              <Cell label={`Openings a year, ${yourState}`}>
                <Numeral accent={accent}>{count(mine.openings)}</Numeral>
              </Cell>
            )}
          </div>
        </Section>
      )}
    </>
  );
}

/** The BLS verdict in two plain words. The profiles carry a sentence
 *  ("It is growing about as fast as most jobs", "Fewer of these jobs are
 *  expected, but most openings come from people moving on"); the cell has
 *  room for a short tag, and the full sentence stays on hover. Matched on
 *  the sentence first, then on the growth figure when the wording is new. */
function shortVerdict(n: NationalOutlook) {
  const v = n.verdict.toLowerCase();
  if (/much faster/.test(v)) return "Growing very fast";
  if (/faster/.test(v)) return "Growing fast";
  if (/about as fast/.test(v)) return "Steady growth";
  if (/slow/.test(v)) return "Slow growth";
  if (/steady/.test(v)) return "Holding steady";
  if (n.change < 0 || /declin|shrink|smaller|fewer/.test(v)) return "Fewer jobs ahead";
  return n.growthPct >= 8 ? "Growing very fast" : n.growthPct >= 5 ? "Growing fast" : n.growthPct >= 2 ? "Steady growth" : "Slow growth";
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
function Cell({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-[4px]">
      <span className="text-[14px] leading-[20px] font-semibold" style={MUTED}>{label}</span>
      {children}
    </div>
  );
}
