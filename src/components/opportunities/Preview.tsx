"use client";

// The reading surface (1 Oct 2026): what a card opens into, as the main
// surface of the page (the Gmail / Apple Mail layout, chosen after a
// drawer, a side pane, a page, an in-row panel and an expanding card all
// failed: Chandu, "let's not do the pop up modals, try the reading
// layout"). Top to bottom:
//   the strip     previous, next, where you are; Close
//   the band      the field's world colour (fields map onto the career
//                 worlds, which own a colour everywhere else), the mark,
//                 World · kind, the name in the display face, who gives it
//   do            the award chip, Save, I applied, Apply
//   when          a deadline bar: opens, today, closes, how long is left
//   who           a grade strip with "you" on it; the eligibility sentence
//   why           the reasons it fits, and what to check
//   what to bring the documents as a checklist the student ticks, then
//                 "apply on their site by the date" (Chandu: "add the
//                 required documents or a how to apply thing for all of
//                 them"); the provider's own list, never invented
//   the award     the provider's own words when the chip cannot carry them
// Visual where the information is visual (dates, grades, progress), words
// everywhere else; no icon per fact (Chandu: "dates can be represented
// more visually, everything can, and I don't mean icons everywhere").

import { ArrowUpRight, Bookmark, BookmarkCheck, Check, ChevronLeft, ChevronRight, ClipboardCheck, Undo2, X } from "lucide-react";
import { DISPLAY } from "@/components/career/CareerDetailExperience";
import { ACCENT, SOFT } from "@/components/colleges/shared";
import { daysFromToday, shortDate } from "@/lib/localRecord";
import { opportunityStore, toggleCheck, type OpportunityStatus } from "@/lib/opportunities";
import { PAID, PROGRAM_KIND, SCHOLARSHIP_KIND } from "./types";
import { fieldWorld, stateName, type Timing } from "./match";
import { OrgMark, hostOf } from "./OrgMark";
import { AMBER, AwardChip, GREEN, MUTED, amountShort, costTone, type Enriched } from "./Card";

const LABEL = "text-[11.5px] leading-[14px] font-bold tracking-[0.06em] uppercase";
const H3 = "text-[15.5px] leading-[20px] font-bold";
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
function checkedOn(v: string): string { return /^\d{4}-\d{2}-\d{2}$/.test(v) ? shortDate(v) : v; }
function monthWord(v: string): string { const m = v.match(/^(\d{4})-(\d{2})$/); return m ? `${MONTHS[Number(m[2]) - 1]} ${m[1]}` : /^\d{4}-\d{2}-\d{2}$/.test(v) ? shortDate(v) : v; }
/** "in 9 days", "in 5 weeks", "in 4 months". */
function inWords(days: number): string {
  if (days <= 0) return "today";
  if (days < 14) return `in ${days} day${days === 1 ? "" : "s"}`;
  if (days < 60) return `in ${Math.round(days / 7)} weeks`;
  return `in ${Math.round(days / 30)} months`;
}

/** The world band: PosterCard's own gradient recipe, in the field's world colour. */
export function worldBand(color: string | null): React.CSSProperties {
  return color
    ? { background: `linear-gradient(155deg, color-mix(in srgb, ${color} 34%, var(--card)) 0%, color-mix(in srgb, ${color} 10%, var(--card)) 100%)` }
    : { background: "linear-gradient(155deg, color-mix(in srgb, var(--foreground) 9%, var(--card)) 0%, var(--card) 100%)" };
}

// ---- When: the deadline bar ------------------------------------------------------

/** Opens, today, closes, on one track. The filled part is the time already
 *  gone; the dot is today; the right end is the deadline. Dashed when the
 *  provider still shows last cycle's date. */
function DeadlineBar({ time, opens }: { time: Timing; opens: string | null }) {
  if (time.status === "unknown") {
    return (
      <div className="flex flex-col gap-[8px]">
        <div className="h-[6px] w-full rounded-full" style={{ backgroundImage: "repeating-linear-gradient(90deg, color-mix(in srgb, var(--foreground) 22%, transparent) 0 8px, transparent 8px 14px)" }} />
        <div className="flex items-baseline justify-between text-[13px] leading-[18px]"><span className="font-bold">Date not posted yet</span><span style={MUTED}>{opens ? `Usually opens ${monthWord(opens)}` : "Check the provider's page"}</span></div>
      </div>
    );
  }
  const end = time.iso!;
  const total = Math.max(1, opens && /^\d{4}-\d{2}(-\d{2})?$/.test(opens) ? daysFromToday(end, new Date(opens.length === 7 ? `${opens}-01T00:00:00` : `${opens}T00:00:00`)) : 120);
  const left = Math.max(0, time.days ?? 0);
  const pct = Math.min(100, Math.max(0, Math.round(((total - left) / total) * 100)));
  const closed = time.status === "closed";
  const tone = closed ? "var(--muted-foreground)" : time.tone === "soon" ? AMBER : SOFT;
  return (
    <div className="flex flex-col gap-[8px]">
      <div className="relative h-[6px] w-full rounded-full" style={{ background: "color-mix(in srgb, var(--foreground) 10%, transparent)", ...(time.approx ? { backgroundImage: "repeating-linear-gradient(90deg, color-mix(in srgb, var(--foreground) 16%, transparent) 0 8px, transparent 8px 14px)" } : {}) }}>
        <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${closed ? 100 : pct}%`, background: `color-mix(in srgb, ${tone} 55%, transparent)` }} />
        {!closed && <span aria-hidden className="absolute top-1/2 size-[14px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px]" style={{ left: `${pct}%`, background: "var(--background)", borderColor: tone }} />}
      </div>
      <div className="flex items-baseline justify-between gap-[12px] text-[13px] leading-[18px]">
        <span style={MUTED}>{opens ? `Opened ${monthWord(opens)}` : closed ? "" : "Today"}</span>
        <span className="text-right">
          <span className="font-bold" style={{ color: closed ? "var(--muted-foreground)" : tone }}>{closed ? `Closed ${shortDate(end)}` : `${time.approx ? "Usually closes" : "Closes"} ${shortDate(end)}`}</span>
          {!closed && <span style={MUTED}>{`, ${inWords(left)}`}</span>}
        </span>
      </div>
    </div>
  );
}

// ---- Who: the grade strip ----------------------------------------------------------

function GradeStrip({ grades, you }: { grades: number[]; you: number }) {
  if (!grades.length) return <p className="text-[13.5px] leading-[19px]" style={MUTED}>For college students, so this one is for later.</p>;
  return (
    <div className="flex items-end gap-[6px]">
      {[9, 10, 11, 12].map((g) => {
        const on = grades.includes(g);
        const me = g === you;
        return (
          <div key={g} className="flex flex-1 flex-col items-center gap-[5px]">
            <span className={`${LABEL} h-[14px]`} style={{ color: me ? SOFT : "transparent" }}>{me ? "You" : "."}</span>
            <span className="flex h-[36px] w-full items-center justify-center rounded-[9px] border text-[14px] font-bold tabular-nums" style={{ borderColor: me ? ACCENT : on ? "transparent" : "var(--glass-border)", background: on ? "color-mix(in srgb, var(--primary) 22%, transparent)" : "transparent", color: on ? "var(--foreground)" : "var(--muted-foreground)", opacity: on ? 1 : 0.6 }}>{g}</span>
          </div>
        );
      })}
    </div>
  );
}

// ---- What to bring: the checklist -------------------------------------------------
// One section, not two (Chandu: "I liked the What to bring section, is
// that better than How to apply, should there be both?"): the documents
// the provider asks for as a tickable list, named What to bring because
// that is what a student calls them, closing with the one thing that is
// not a document: apply on their site by the date. Nothing is invented;
// when a provider lists nothing, it says so.

function HowToApply({ e, host }: { e: Enriched; host: string }) {
  const { item, time } = e;
  const record = opportunityStore.useValue();
  const done = new Set(record.checks?.[item.id] ?? []);
  const list = item.requires.filter((r) => !/^online application$/i.test(r));
  const n = list.filter((s) => done.has(s)).length;
  const then = time.status === "open" ? `Then apply on ${host} by ${shortDate(time.iso!)}.` : time.status === "closed" ? `It closed ${shortDate(time.iso!)}; apply on ${host} when it opens again.` : `Then apply on ${host} when it opens.`;
  return (
    <section className="flex flex-col gap-[12px]">
      <div className="flex items-baseline justify-between gap-[12px]">
        <h3 className={H3}>What to bring</h3>
        {list.length > 0 && <span className="text-[12.5px] leading-[16px] font-semibold tabular-nums" style={{ color: n === list.length ? GREEN : "var(--muted-foreground)" }}>{n} of {list.length} ready</span>}
      </div>
      {list.length > 0 ? (
        <>
          <div className="h-[4px] w-full overflow-hidden rounded-full" style={{ background: "color-mix(in srgb, var(--foreground) 10%, transparent)" }}>
            <div className="h-full rounded-full transition-[width] duration-300" style={{ width: `${(n / list.length) * 100}%`, background: n === list.length ? GREEN : ACCENT }} />
          </div>
          <ul className="flex flex-col">
            {list.map((s) => {
              const on = done.has(s);
              return (
                <li key={s}>
                  <button type="button" role="checkbox" aria-checked={on} onClick={() => toggleCheck(item.id, s)} className="dm-quiet -mx-[8px] flex w-[calc(100%+16px)] cursor-pointer items-start gap-[12px] rounded-[10px] px-[8px] py-[8px] text-left">
                    <span aria-hidden className="mt-[2px] flex size-[20px] flex-none items-center justify-center rounded-[6px] border" style={{ borderColor: on ? GREEN : "color-mix(in srgb, var(--foreground) 30%, transparent)", background: on ? GREEN : "transparent" }}>{on && <Check className="h-3 w-3" strokeWidth={3} style={{ color: "#03211a" }} />}</span>
                    <span className="text-[14.5px] leading-[21px]" style={on ? { color: "var(--muted-foreground)", textDecoration: "line-through", textDecorationColor: "color-mix(in srgb, var(--foreground) 35%, transparent)" } : undefined}>{s}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <p className="text-[14.5px] leading-[21px]" style={MUTED}>The provider does not list documents. You will make an account on their site and fill in their form.</p>
      )}
      <p className="flex items-start gap-[8px] text-[14px] leading-[20px] font-semibold"><ArrowUpRight className="mt-[3px] h-4 w-4 flex-none" aria-hidden style={{ color: SOFT }} />{then}</p>
    </section>
  );
}

// ---- The surface -------------------------------------------------------------------

export function Expanded({ e, status, setStatus, undo, onClose, onPrev, onNext, position, grade }: {
  e: Enriched; status: OpportunityStatus | null; setStatus: (s: OpportunityStatus | null) => void; undo?: () => void; onClose: () => void;
  onPrev?: () => void; onNext?: () => void; position?: string; grade: number;
}) {
  const { item, fit, time } = e;
  const host = hostOf(item.url);
  const who = item.type === "scholarship" ? item.provider : item.org;
  const kind = item.type === "scholarship" ? SCHOLARSHIP_KIND[item.kind].label : PROGRAM_KIND[item.kind].label;
  const world = fieldWorld(item.fields);
  const applied = status === "applied" || status === "won";
  const reasons = [...fit.reasons.map((r) => ({ r, ok: true })), ...fit.checks.map((r) => ({ r, ok: false }))];
  const btn = "dm-quiet flex h-[42px] cursor-pointer items-center justify-center gap-[7px] rounded-[11px] border px-[14px] text-[14px] leading-[18px] font-semibold whitespace-nowrap";
  const outline = { borderColor: "var(--glass-border)", background: "var(--glass-surface-1)", color: "var(--foreground)" } as const;
  const onTone = { borderColor: ACCENT, background: "color-mix(in srgb, var(--primary) 20%, transparent)", color: "var(--foreground)" } as const;
  const nav = "dm-quiet flex size-[32px] cursor-pointer items-center justify-center rounded-full border disabled:cursor-default disabled:opacity-35";
  const rule = { borderColor: "var(--glass-border)" } as const;

  return (
    <div className="flex min-h-full flex-col">
      {/* The strip. Pinned while the surface scrolls. */}
      <div className="sticky top-0 z-[2] flex h-[48px] flex-none items-center justify-between gap-[10px] border-b px-[12px]" style={{ ...rule, background: "color-mix(in srgb, var(--background) 96%, var(--foreground))" }}>
        <span className="flex items-center gap-[6px]">
          <button type="button" aria-label="Previous" onClick={onPrev} disabled={!onPrev} className={nav} style={outline}><ChevronLeft className="h-4 w-4" aria-hidden /></button>
          <button type="button" aria-label="Next" onClick={onNext} disabled={!onNext} className={nav} style={outline}><ChevronRight className="h-4 w-4" aria-hidden /></button>
          {position && <span className="pl-[4px] text-[12.5px] font-semibold tabular-nums" style={MUTED}>{position}</span>}
        </span>
        <button type="button" onClick={onClose} className="dm-quiet flex h-[32px] cursor-pointer items-center gap-[5px] rounded-full border px-[10px] text-[13px] font-semibold" style={outline}><X className="h-3.5 w-3.5" aria-hidden />Close</button>
      </div>

      {/* The band. */}
      <header className="flex items-start gap-[16px] px-[24px] pt-[24px] pb-[22px] sm:px-[28px]" style={worldBand(world?.color ?? null)}>
        <OrgMark url={item.url} name={who} size={60} />
        <div className="flex min-w-0 flex-1 flex-col gap-[6px] pt-[2px]">
          <span className={LABEL} style={{ color: world ? `color-mix(in srgb, ${world.color} 70%, #fff)` : "var(--muted-foreground)" }}>
            {world ? world.name : "Any field"}<span style={MUTED}> · {item.type === "program" && item.postedBy ? `Posted by ${item.postedBy.org}` : kind}</span>
          </span>
          <h2 className="text-[26px] leading-[1.08] font-extrabold uppercase sm:text-[30px]" style={{ ...DISPLAY, textWrap: "balance" }}>{item.name}</h2>
          <p className="text-[14.5px] leading-[20px]" style={MUTED}>{who}{item.type === "program" ? ` · ${item.location.split("(")[0].trim()}` : ""}</p>
        </div>
      </header>

      {/* Do. */}
      <div className="flex flex-wrap items-center gap-x-[14px] gap-y-[10px] border-y px-[24px] py-[14px] sm:px-[28px]" style={{ ...rule, background: "color-mix(in srgb, var(--foreground) 4%, transparent)" }}>
        <AwardChip item={item} />
        {item.type === "program" && item.when && <span className="text-[13.5px] leading-[18px] font-semibold" style={MUTED}>{item.when.split(/[,;(]/)[0].trim()}</span>}
        <span className="ml-auto flex flex-wrap items-center gap-[8px]">
          <button type="button" aria-pressed={!!status} onClick={() => setStatus(status ? null : "saved")} className={btn} style={status ? onTone : outline}>
            {status ? <BookmarkCheck className="h-4 w-4" aria-hidden style={{ color: SOFT }} /> : <Bookmark className="h-4 w-4" aria-hidden />}{status ? "Saved" : "Save"}
          </button>
          <button type="button" aria-pressed={applied} onClick={() => setStatus(applied ? "saved" : "applied")} className={btn} style={applied ? onTone : outline}>
            <ClipboardCheck className="h-4 w-4" aria-hidden style={applied ? { color: SOFT } : undefined} />{status === "won" ? "Got it" : applied ? "Applied" : "I applied"}
          </button>
          <a href={item.url} target="_blank" rel="noreferrer" className={`${btn} dm-solid text-white`} style={{ background: ACCENT, borderColor: ACCENT }}>
            {host.length <= 22 ? `Apply on ${host}` : "Apply"} <ArrowUpRight className="h-4 w-4 flex-none" aria-hidden />
          </a>
        </span>
        {(status === "applied" || undo) && (
          <span className="flex w-full flex-wrap items-center gap-x-[10px] text-[13px] leading-[18px]" style={MUTED}>
            {status === "applied" && <>Heard back? <button type="button" onClick={() => setStatus("won")} className="dm-link cursor-pointer font-bold" style={{ color: SOFT }}>I got it</button></>}
            {undo && <button type="button" onClick={undo} className="dm-link flex cursor-pointer items-center gap-[4px] font-bold" style={{ color: SOFT }}><Undo2 className="h-3.5 w-3.5" aria-hidden />Undo</button>}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-[26px] px-[24px] py-[24px] sm:px-[28px]">
        {/* When and who, side by side. */}
        <div className="grid gap-[26px] sm:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <section className="flex flex-col gap-[12px]">
            <h3 className={H3}>When</h3>
            <DeadlineBar time={time} opens={item.opens} />
            {time.approx && <p className="text-[12.5px] leading-[17px]" style={MUTED}>{"Last cycle's date; the provider has not posted this year's yet."}</p>}
          </section>
          <section className="flex flex-col gap-[12px]">
            <h3 className={H3}>Who can apply</h3>
            <GradeStrip grades={item.grades} you={grade} />
          </section>
        </div>

        {/* Why it fits, and who it is for. */}
        <div className="grid gap-[24px] border-t pt-[24px] sm:grid-cols-2" style={rule}>
          <section className="flex flex-col gap-[10px]">
            <h3 className={H3}>Why it fits you</h3>
            {reasons.length ? (
              <ul className="flex flex-col gap-[7px]">
                {reasons.map(({ r, ok }) => <li key={r} className="flex items-start gap-[9px] text-[14.5px] leading-[21px]">{ok ? <Check className="mt-[4px] h-3.5 w-3.5 flex-none" strokeWidth={3} aria-hidden style={{ color: SOFT }} /> : <span aria-hidden className="mt-[8px] size-[6px] flex-none rounded-full" style={{ background: AMBER }} />}{r}</li>)}
              </ul>
            ) : <p className="text-[14.5px] leading-[21px]" style={MUTED}>Open to everyone in your grade.</p>}
          </section>
          <section className="flex flex-col gap-[10px]">
            <h3 className={H3}>Who it is for</h3>
            <p className="text-[14.5px] leading-[21px]">{item.eligibility}</p>
            {!item.states.includes("Any") && <p className="text-[13.5px] leading-[19px]" style={MUTED}>{item.states.includes("Remote") ? "Online, from anywhere." : `${item.states.map(stateName).join(", ")} only.`}</p>}
          </section>
        </div>

        {/* What to bring. */}
        <div className="border-t pt-[24px]" style={rule}>
          <HowToApply e={e} host={host} />
        </div>

        {/* The award or the cost, when the chip cannot carry it. */}
        {((item.type === "scholarship" && item.amount !== amountShort(item)) || (item.type === "program" && (item.costNote || item.paid !== "unknown"))) && (
          <section className="flex flex-col gap-[10px] border-t pt-[24px]" style={rule}>
            <h3 className={H3}>{item.type === "scholarship" ? "The award" : "The cost"}</h3>
            <p className="text-[14.5px] leading-[21px]" style={item.type === "program" && costTone(item.paid) === "good" ? { color: GREEN } : undefined}>{item.type === "scholarship" ? item.amount : item.costNote ?? PAID[item.paid]}</p>
            {item.type === "scholarship" && item.renewable !== null && <p className="text-[13.5px] leading-[19px]" style={MUTED}>{item.renewable ? "Renews each year." : "One time."}</p>}
          </section>
        )}

        <p className="text-[12.5px] leading-[17px]" style={MUTED}>
          {item.deadlineNote && time.status === "unknown" ? `${item.deadlineNote} ` : ""}Checked on {host}, {checkedOn(item.verifiedOn)}. Applying happens on their site, not here.{item.type === "scholarship" ? " A real scholarship never asks for a credit card." : ""}{item.type === "program" && item.postedBy ? " Posted by a Dreamari partner; details not checked by Dreamari." : ""}
        </p>
      </div>
    </div>
  );
}
