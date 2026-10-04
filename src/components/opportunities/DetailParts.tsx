"use client";

// The pieces of an opportunity's detail page that are their own small
// designs (1 to 3 Oct 2026). They were the in-page reader's (the Gmail
// layout, Preview.tsx) until Joshua's 3 Oct redesign made every card open
// the full page instead ("remove the left list once one is opened"); the
// pieces Chandu had already signed off on moved here unchanged:
//   DeadlineBar   the deadline as a calendar leaf and the time left
//                 (Chandu: "a calendar date like we have on the homepage")
//   HowToApply    "What to bring" as a checklist the student ticks, ending
//                 with "apply on their site by the date"
//   worldBand     PosterCard's gradient in the field's world colour

import { ArrowUpRight, Check } from "lucide-react";
import { ACCENT, SOFT } from "@/components/colleges/shared";
import { SparkBar } from "@/components/flow/SparkBar";
import { isoDay, shortDate } from "@/lib/localRecord";
import { opportunityStore, toggleCheck } from "@/lib/opportunities";
import type { Timing } from "./match";
import { AMBER, GREEN, MUTED, type Enriched } from "./Card";

const H3 = "text-[15.5px] leading-[20px] font-bold";
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export function checkedOn(v: string): string { return /^\d{4}-\d{2}-\d{2}$/.test(v) ? shortDate(v) : v; }
export function monthWord(v: string): string {
  const m = v.match(/^(\d{4})-(\d{2})$/);
  if (m) return `${MONTHS[Number(m[2]) - 1]} ${m[1]}`;
  const season = v.match(/^(\d{4})-(spring|summer|fall|winter)$/i);
  if (season) return `${season[2].toLowerCase()} ${season[1]}`;
  return /^\d{4}-\d{2}-\d{2}$/.test(v) ? shortDate(v) : v;
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
/** How long is left, in the unit people use: days under a week, then
 *  weeks, then months (Chandu, 2 Oct 2026). */
export function timeLeft(days: number): string {
  if (days <= 0) return "Closes today";
  if (days < 7) return `${days} ${days === 1 ? "day" : "days"} left`;
  if (days < 35) { const w = Math.round(days / 7); return `${w} ${w === 1 ? "week" : "weeks"} left`; }
  if (days < 365) { const m = Math.round(days / 30.4); return `${m} ${m === 1 ? "month" : "months"} left`; }
  const y = Math.round(days / 365); return `${y} ${y === 1 ? "year" : "years"} left`;
}
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** The deadline as a calendar leaf and the time left, like Home's deadline
 *  card, instead of a long bar (Chandu, 2 Oct 2026: "a calendar date like
 *  we have on the homepage instead of a big progress bar, with the number of
 *  days left"). */
export function DeadlineBar({ time, opens }: { time: Timing; opens: string | null }) {
  if (time.status === "unknown") {
    return (
      <div className="flex items-center gap-[14px]">
        <span className="flex w-[58px] flex-none flex-col overflow-hidden rounded-[10px] border text-center" style={{ borderColor: "var(--glass-border)" }}>
          <span className="py-[3px] text-[10px] leading-[14px] font-bold tracking-[0.08em] uppercase" style={{ background: "color-mix(in srgb, var(--foreground) 12%, transparent)", color: "var(--muted-foreground)" }}>Date</span>
          <span className="py-[6px] text-[22px] leading-[26px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--muted-foreground)" }}>?</span>
        </span>
        <span className="flex flex-col gap-[2px] text-[13.5px] leading-[18px]"><span className="font-bold">No date yet</span><span style={MUTED}>{opens ? `Usually opens ${monthWord(opens)}` : "Check their page"}</span></span>
      </div>
    );
  }
  const end = time.iso!;
  const d = new Date(`${end}T12:00:00`);
  const left = Math.max(0, time.days ?? 0);
  const closed = time.status === "closed";
  const tone = closed ? "var(--muted-foreground)" : time.tone === "soon" ? AMBER : "var(--primary)";
  return (
    <div className="flex items-center gap-[14px]">
      <span className="flex w-[58px] flex-none flex-col overflow-hidden rounded-[10px] text-center" style={{ boxShadow: "0 8px 20px -10px rgba(0,0,0,0.6)" }}>
        <span className="py-[3px] text-[10px] leading-[14px] font-bold tracking-[0.08em] uppercase" style={{ background: tone, color: "#fff" }}>{MONTHS_SHORT[d.getMonth()]}</span>
        <span className="py-[5px] text-[24px] leading-[28px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", background: "color-mix(in srgb, var(--foreground) 10%, transparent)", color: "var(--foreground)" }}>{d.getDate()}</span>
      </span>
      <span className="flex min-w-0 flex-col gap-[2px]">
        <span className="text-[18px] leading-[22px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: closed ? "var(--muted-foreground)" : time.tone === "soon" ? AMBER : "var(--foreground)" }}>{closed ? "Closed" : timeLeft(left)}</span>
        <span className="text-[13px] leading-[18px]" style={MUTED}>{closed ? `Closed ${shortDate(end)}` : `${time.approx ? "Usually closes" : "Closes"} ${shortDate(end)}`}{opens && !closed && /^\d{4}-\d{2}(-\d{2})?$/.test(opens) ? ` · ${opens > isoDay(new Date()) ? "opens" : "opened"} ${monthWord(opens)}` : ""}</span>
      </span>
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

export function HowToApply({ e, host, titleClass = H3, titleStyle }: { e: Enriched; host: string; titleClass?: string; titleStyle?: React.CSSProperties }) {
  const { item, time } = e;
  const record = opportunityStore.useValue();
  const done = new Set(record.checks?.[item.id] ?? []);
  const list = item.requires.filter((r) => !/^online application$/i.test(r));
  const n = list.filter((s) => done.has(s)).length;
  const then = time.status === "open" ? `Then apply on ${host} by ${shortDate(time.iso!)}.` : time.status === "closed" ? `It closed ${shortDate(time.iso!)}. Apply on ${host} when it opens again.` : `Then apply on ${host} when it opens.`;
  return (
    <section className="flex flex-col gap-[12px]">
      <div className="flex items-baseline justify-between gap-[12px]">
        <h2 className={titleClass} style={titleStyle}>What to bring</h2>
        {list.length > 0 && <span className="text-[12.5px] leading-[16px] font-semibold tabular-nums" style={{ color: n === list.length ? GREEN : "var(--muted-foreground)" }}>{n} of {list.length} ready</span>}
      </div>
      {list.length > 0 ? (
        <>
          {/* The app's progress bar: the spark when a tick fills it and the
             occasional idle nudge, like every other bar (Chandu, 2 Oct 2026:
             "show the spark stuff we do for progress bars with the occasional
             nudges here too"); never empty, an 8% floor so it reads as a bar
             to fill ("don't start the progress bar at 0%"). */}
          <SparkBar percent={Math.round((n / list.length) * 100)} min={8} height={4} track="color-mix(in srgb, var(--foreground) 10%, transparent)" fill={n === list.length ? GREEN : ACCENT} glow={n === list.length ? GREEN : ACCENT} memoryKey={`bring-${item.id}`} idle />
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
        <p className="text-[14.5px] leading-[21px]" style={MUTED}>They do not list what to bring. You will make an account on their site and fill in the form.</p>
      )}
      <p className="flex items-start gap-[8px] text-[14px] leading-[20px] font-semibold"><ArrowUpRight className="mt-[3px] h-4 w-4 flex-none" aria-hidden style={{ color: SOFT }} />{then}</p>
    </section>
  );
}
