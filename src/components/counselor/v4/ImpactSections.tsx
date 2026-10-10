"use client";

// 10 Oct 2026, Chandu: "try better types of graphs, more beautiful ones ...
// be creative with the graphs, don't be traditional, as long as they convey
// the information sensibly." Visuals only, same sections and data: Use of
// Time's single bar is now a waffle of 100 cells with the ASCA 80% line
// drawn across it (the gap to target is visible, not just stated), and each
// ASCA measure's ring is now a dumbbell from last semester to now, so the
// change reads as a distance (charts/impactViz.tsx). Same day, the user's
// follow-up: "ASCA Alignment and District goals need better graphs. Think
// beyond bars and donuts please." The dumbbells became two slopegraphs (one
// per domain): each measure is a line from last semester to now, labelled
// at its right end, on one shared scale that says where it starts.
// My Impact's shared sections (9 Oct 2026, Maisha's Insights notes, then her
// My Impact image the same day: "I want to change some of the info here
// because it's repetitive and present in other sections since our last
// changes. This is for the content change only.").
//
// Use of Time: "Bring 'Use of Time' from V5 into V4 My Impact: a clear,
// digestible visualization of where counselor time goes." One bar of the
// week, the hours beside each category. Her image names four categories
// (Student Meetings, Career & Postsecondary Support, Reviews, Administrative
// Work), so Group Programming is gone: a classroom lesson or small group is
// time with students, so it counts as Student Meetings. The headline is the
// ASCA share and its target ("72% direct + indirect student services, ASCA
// target: 80%").
//
// ASCA Alignment: her image's four measures, two per domain, each a ring
// with the change since last semester under it. The deltas are DEMO-ONLY
// seeded until semester snapshots are stored.

import { useState } from "react";
import { ChevronRight, Clock, Info } from "lucide-react";
import { IconTip } from "@/components/app/IconTip";
import { ASCA_TARGET_PCT, hoursLabel, type TimeEntry, type TimeSummary } from "@/lib/counselorTimeLog";
import { openLog } from "../v5/LogSheet";
import { SlopeGraph, TimeWaffle } from "./charts/impactViz";
import { Go } from "./chips";
import type { StudentsDrill } from "./InsightStudents";
import "./insights2.css";

export const TIME_CATEGORIES = ["Student Meetings", "Career & Postsecondary Support", "Reviews", "Administrative Work"] as const;
export type TimeCategory = (typeof TIME_CATEGORIES)[number];

/** Which of the four categories an entry belongs to. The log keeps ASCA's
 *  three kinds (direct, indirect, school support); the activity name says
 *  which of the four it was. School support is always Administrative Work
 *  (proctoring, duties, scheduling, paperwork); anything in person with
 *  students, lessons and groups included, is Student Meetings. */
export function timeCategory(e: TimeEntry): TimeCategory {
  const a = e.activity.toLowerCase();
  if (e.kind === "support") return "Administrative Work";
  if (/review/.test(a)) return "Reviews";
  if (/college|fafsa|scholarship|letter|career|postsecondary|application|financial aid|shared/.test(a)) return "Career & Postsecondary Support";
  return "Student Meetings";
}

// One blue stepping lighter by category, Administrative Work the neutral
// (the time that is not with or for students).
export const TIME_SHADE: Record<TimeCategory, string> = {
  "Student Meetings": "var(--v4-step-1)",
  "Career & Postsecondary Support": "var(--v4-step-2)",
  Reviews: "var(--v4-step-3)",
  "Administrative Work": "color-mix(in srgb, var(--foreground) 24%, transparent)",
};

const CARD = "v4-surface rounded-[var(--radius-md)] border p-[var(--space-4)] sm:p-[var(--space-6)]";
const CARD_STYLE = { background: "var(--card)", borderColor: "var(--glass-border)" } as const;

/** A section title with its (i). */
export function SectionTitle({ title, info, unit }: { title: string; info: string; unit?: string }) {
  return (
    <h2 className="v4-r2-title" style={{ fontSize: 14, fontWeight: 600 }}>
      {title}
      <IconTip label={info}><button type="button" aria-label={`About ${title}`} className="v4-r2-info dm-quiet"><Info size={14} aria-hidden /></button></IconTip>
      {unit && <span className="ml-[4px] text-[12px] font-normal" style={{ color: "var(--muted-foreground)" }}>{unit}</span>}
    </h2>
  );
}

/** The time by category, as a drill of its entries. */
export function timeGroups(week: TimeSummary) {
  const total = Math.max(1, week.entries.reduce((n, e) => n + e.minutes, 0));
  return { total, groups: TIME_CATEGORIES.map((c) => { const entries = week.entries.filter((e) => timeCategory(e) === c); const minutes = entries.reduce((n, e) => n + e.minutes, 0); return { c, entries, minutes, pct: Math.round((minutes / total) * 100) }; }) };
}

export function UseOfTime({ week, onDrill }: { week: TimeSummary; onDrill: (d: StudentsDrill) => void }) {
  const [lit, setLit] = useState<string | null>(null);
  const { total, groups } = timeGroups(week);
  const met = week.studentPct >= ASCA_TARGET_PCT;
  const open = (g: (typeof groups)[number]) => onDrill({
    title: g.c,
    subtitle: `${hoursLabel(g.minutes)} · ${g.pct}% of the last 7 days`,
    items: g.entries.map((e) => `${e.activity} · ${new Date(e.at).toLocaleDateString("en-US", { weekday: "short" })} · ${hoursLabel(e.minutes)}`),
    itemsLabel: "Logged",
    students: [],
    extra: { label: "Log time", onClick: () => openLog({ mode: "time" }) },
  });
  return (
    <section className={`${CARD} v4-time-card flex flex-col gap-[var(--space-5)]`} style={CARD_STYLE}>
      <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
        <SectionTitle title="Use of Time" info="Where the last 7 days went, from the time log. ASCA asks for 80% of a counselor's time in direct and indirect student services." unit={`Last 7 days · ${hoursLabel(total)} logged`} />
        <button type="button" onClick={() => openLog({ mode: "time" })} className="v4-time-log dm-quiet"><Clock size={14} aria-hidden />Log time</button>
      </div>
      <div className="v4-time-body">
        <div className="v4-time-headline">
          <strong>{week.studentPct}<small>%</small></strong>
          <span>direct and indirect student services</span>
          <em className={`v4-time-target ${met ? "is-met" : ""}`}>ASCA target: {ASCA_TARGET_PCT}%{met ? " · met" : ""}</em>
        </div>
        <div className="flex min-w-0 flex-col gap-[var(--space-4)]">
          <TimeWaffle groups={groups.map((g) => ({ c: g.c, pct: g.minutes, color: TIME_SHADE[g.c] }))} target={ASCA_TARGET_PCT} active={lit} onActive={setLit}
            onPick={(c) => { const g = groups.find((x) => x.c === c); if (g && g.minutes) open(g); }}
            label={`${groups.map((g) => `${g.c} ${hoursLabel(g.minutes)}`).join(", ")}. ASCA target ${ASCA_TARGET_PCT}%`} />
          <ul className="v4-time-legend" onPointerLeave={() => setLit(null)}>
            {groups.map((g) => (
              <li key={g.c}>
                <button type="button" onClick={() => open(g)} disabled={!g.minutes} className="dm-quiet group" onPointerEnter={() => setLit(g.c)} onFocus={() => setLit(g.c)} onBlur={() => setLit(null)}>
                  <i style={{ background: TIME_SHADE[g.c] }} aria-hidden />
                  <span>{g.c}</span>
                  <b>{hoursLabel(g.minutes)}</b>
                  <small>{g.pct}%</small>
                  <Go kind="open" className="opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export type AscaItem = { key: string; short: string; tip: string; pct: number; label: string; /** points since last semester (DEMO-ONLY seeded) */ delta: number; onOpen: () => void };

/** ASCA Alignment: Academic and Career, two rings each, the change since
 *  last semester under each. */
export function AscaAlignment({ academic, career, onAbout }: { academic: AscaItem[]; career: AscaItem[]; onAbout: () => void }) {
  // One shared scale for both groups, cropped to the decade below the
  // lowest value (and said so under the charts).
  const all = [...academic, ...career].flatMap((it) => [it.pct, it.pct - it.delta]);
  const lo = Math.max(0, Math.min(80, Math.floor((Math.min(...all) - 4) / 10) * 10));
  const domains = [
    { title: "Academic Development", items: academic },
    { title: "Career Development", items: career },
  ];
  return (
    <section className={`${CARD} flex flex-col gap-[var(--space-5)]`} style={CARD_STYLE}>
      <div className="flex flex-wrap items-center justify-between gap-[10px]">
        <SectionTitle title="ASCA Alignment" info="How the caseload lines up with the ASCA National Model's academic and career domains. The change is since last semester." />
        <button type="button" onClick={onAbout} className="v4-r2-link">About these metrics<ChevronRight size={14} aria-hidden /></button>
      </div>
      {/* Two slopegraphs on one shared scale: last semester on the left
         axis, now on the right, each line labelled at its end. A label
         opens the students behind it. */}
      <div className="iv-asca">
        {domains.map((d) => (
          <div key={d.title} className="iv-asca-group">
            <span className="iv-asca-domain">{d.title}</span>
            <SlopeGraph lo={lo} items={d.items.map((it) => ({ key: it.key, pct: it.pct, delta: it.delta, short: it.short, label: it.label, tip: it.tip, onOpen: it.onOpen }))} />
          </div>
        ))}
      </div>
      <p className="iv-asca-note">Change in points since last semester. Scale starts at {lo}%.</p>
    </section>
  );
}
