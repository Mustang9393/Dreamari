"use client";

// My Impact's three new sections (9 Oct 2026, Maisha's Insights notes):
//
// Use of Time: "Bring 'Use of Time' from V5 into V4 My Impact: a clear,
// digestible visualization of where counselor time goes, categories like
// Student Meetings, Career/Postsecondary Support, Reviews, Group
// Programming, Administrative Work." v5 drew it three ways at once (a donut,
// day columns and a split bar, v5/ImpactView.tsx); here it is the one
// question a principal asks: how much of the week went to students (ASCA's
// 80% goal), and where the rest went, as one bar of Maisha's five
// categories with the hours beside each. The day-by-day and every entry are
// one click away in each category's drill.
//
// ASCA Alignment: "Keep ASCA Alignment, but use the V5 design direction (the
// V4 content direction is good, the V5 visual treatment is cleaner). Remove
// Social-Emotional from Dreamari's ASCA section." v4's wording and figures,
// v5's open columns of rings and counts, Academic and Career only.
//
// My Work: "Keep 'My Work' but make it visually secondary to student impact
// (Reviews completed, Student questions answered, Meetings held, Letters
// generated/sent)." Four small figures in one quiet strip below the student
// sections; each opens its detail.

import { BookOpen, Briefcase, CheckCircle2, Clock } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { ASCA_TARGET_PCT, hoursLabel, type TimeEntry, type TimeSummary } from "@/lib/counselorTimeLog";
import { openLog } from "../v5/LogSheet";
import { DrawRing } from "../v5/charts";
import type { Drill } from "./Drill";
import { Go } from "./chips";

export const TIME_CATEGORIES = ["Student Meetings", "Career & Postsecondary Support", "Reviews", "Group Programming", "Administrative Work"] as const;
export type TimeCategory = (typeof TIME_CATEGORIES)[number];

/** Which of Maisha's five categories an entry belongs to. The log keeps
 *  ASCA's three kinds (direct, indirect, school support); the activity
 *  name says which of the five it was. School support is always
 *  Administrative Work (proctoring, duties, scheduling, paperwork). */
export function timeCategory(e: TimeEntry): TimeCategory {
  const a = e.activity.toLowerCase();
  if (e.kind === "support") return "Administrative Work";
  if (/review/.test(a)) return "Reviews";
  if (/small group|classroom|lesson|workshop|assembly|group/.test(a)) return "Group Programming";
  if (/college|fafsa|scholarship|letter|career|postsecondary|application|financial aid/.test(a)) return "Career & Postsecondary Support";
  return "Student Meetings";
}

// One blue stepping lighter by size, Administrative Work the neutral (the
// time that is not with or for students).
const SHADE: Record<TimeCategory, string> = {
  "Student Meetings": "var(--v4-step-1)",
  "Career & Postsecondary Support": "var(--v4-step-2)",
  Reviews: "var(--v4-step-3)",
  "Group Programming": "var(--v4-step-4)",
  "Administrative Work": "color-mix(in srgb, var(--foreground) 24%, transparent)",
};

const CARD = "v4-surface rounded-[var(--radius-md)] border p-[var(--space-4)] sm:p-[var(--space-6)]";
const CARD_STYLE = { background: "var(--card)", borderColor: "var(--glass-border)" } as const;

export function UseOfTime({ week, onDrill }: { week: TimeSummary; onDrill: (d: Drill) => void }) {
  const reduce = useReducedMotion();
  const total = Math.max(1, week.entries.reduce((n, e) => n + e.minutes, 0));
  const groups = TIME_CATEGORIES.map((c) => {
    const entries = week.entries.filter((e) => timeCategory(e) === c);
    return { c, entries, minutes: entries.reduce((n, e) => n + e.minutes, 0) };
  });
  const met = week.studentPct >= ASCA_TARGET_PCT;
  const open = (g: (typeof groups)[number]) => onDrill({
    title: g.c,
    subtitle: `${hoursLabel(g.minutes)} · ${Math.round((g.minutes / total) * 100)}% of the last 7 days`,
    rowsLabel: "Logged",
    rows: g.entries.map((e) => ({ label: `${e.activity} · ${new Date(e.at).toLocaleDateString("en-US", { weekday: "short" })}`, value: hoursLabel(e.minutes), pct: (e.minutes / Math.max(1, g.minutes)) * 100 })),
    action: { label: "Log time", onClick: () => openLog({ mode: "time" }) },
  });
  return (
    <section className={`${CARD} v4-time-card flex flex-col gap-[var(--space-5)]`} style={CARD_STYLE}>
      <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
        <h2 className="text-[14px] leading-[20px] font-semibold" style={{ color: "var(--foreground)" }}>Use of Time <span className="ml-[8px] text-[12px] font-normal" style={{ color: "var(--muted-foreground)" }}>Last 7 days · {hoursLabel(total)} logged</span></h2>
        <button type="button" onClick={() => openLog({ mode: "time" })} className="v4-time-log dm-quiet"><Clock size={14} aria-hidden />Log time</button>
      </div>
      <div className="v4-time-body">
        <div className="v4-time-headline">
          <strong>{week.studentPct}<small>%</small></strong>
          <span>with or for students</span>
          <em className={met ? "is-met" : ""}>{met ? `ASCA goal of ${ASCA_TARGET_PCT}% met` : `${ASCA_TARGET_PCT - week.studentPct} pts under ASCA's ${ASCA_TARGET_PCT}%`}</em>
        </div>
        <div className="flex min-w-0 flex-col gap-[var(--space-4)]">
          <span className="v4-time-bar" role="img" aria-label={groups.map((g) => `${g.c} ${hoursLabel(g.minutes)}`).join(", ")}>
            {groups.filter((g) => g.minutes > 0).map((g, i) => (
              <motion.span key={g.c} initial={reduce ? false : { scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.6, delay: reduce ? 0 : i * 0.06, ease: [0.22, 1, 0.36, 1] }} style={{ flex: g.minutes, background: SHADE[g.c] }} />
            ))}
          </span>
          <ul className="v4-time-legend">
            {groups.map((g) => (
              <li key={g.c}>
                <button type="button" onClick={() => open(g)} disabled={!g.minutes} className="dm-quiet group">
                  <i style={{ background: SHADE[g.c] }} aria-hidden />
                  <span>{g.c}</span>
                  <b>{hoursLabel(g.minutes)}</b>
                  <small>{Math.round((g.minutes / total) * 100)}%</small>
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

type AscaItem = { ring?: number; count?: number; label: string };
/** Academic and Career, v4's figures in v5's columns. */
export function AscaAlignment({ caseload, academicPct, careerPct, withPlanPct, onOpen }: { caseload: number; academicPct: number; careerPct: number; withPlanPct: number; onOpen: () => void }) {
  const domains: { icon: typeof BookOpen; title: string; items: AscaItem[]; practice: string }[] = [
    { icon: BookOpen, title: "Academic Development", items: [{ count: caseload, label: "Students supported in academic planning" }, { ring: academicPct, label: "Four-year plans approved" }], practice: "Course and credit monitoring, ongoing" },
    { icon: Briefcase, title: "Career Development", items: [{ ring: careerPct, label: "Career reports completed" }, { ring: withPlanPct, label: "Declared a career pathway" }], practice: "Simulations and assessments on Dreamari" },
  ];
  return (
    <section className={`${CARD} group relative flex flex-col gap-[var(--space-5)] transition-colors hover:!border-[color-mix(in_srgb,var(--foreground)_24%,transparent)]`} style={CARD_STYLE}>
      <div className="flex items-center justify-between gap-[10px]">
        <h2 className="text-[14px] leading-[20px] font-semibold" style={{ color: "var(--foreground)" }}>ASCA Alignment <span className="ml-[8px] text-[12px] font-normal" style={{ color: "var(--muted-foreground)" }}>ASCA National Model, 4th edition</span></h2>
        <button type="button" onClick={onOpen} aria-label="ASCA Alignment: details" className="flex flex-none cursor-pointer items-center rounded-full p-[2px] outline-none before:absolute before:inset-0 before:content-['']">
          <Go kind="open" className="opacity-0 group-hover:opacity-100 group-has-[button:focus-visible]:opacity-100" />
        </button>
      </div>
      <div className="v4-asca-columns">
        {domains.map((d) => (
          <div key={d.title} className="flex flex-col gap-[var(--space-4)]">
            <span className="flex items-center gap-[8px] text-[14px] font-semibold" style={{ color: "var(--foreground)" }}><d.icon size={16} style={{ color: "var(--primary)" }} aria-hidden />{d.title}</span>
            <ul className="flex flex-col gap-[var(--space-3)]">
              {d.items.map((it) => (
                <li key={it.label} className="flex items-center gap-[var(--space-3)]">
                  {typeof it.ring === "number"
                    ? <DrawRing pct={it.ring} size={42} stroke={5} />
                    : <span className="flex size-[42px] flex-none items-center justify-center rounded-full text-[13px] font-bold tabular-nums" style={{ background: "color-mix(in srgb, var(--primary) 14%, transparent)", color: "var(--foreground)" }}>{it.count}</span>}
                  <span className="flex min-w-0 flex-col">
                    {typeof it.ring === "number" && <span className="text-[17px] leading-[22px] font-semibold tabular-nums" style={{ color: "var(--foreground)" }}>{it.ring}%</span>}
                    <span className="text-[12.5px] font-medium" style={{ color: "var(--muted-foreground)" }}>{it.label}</span>
                  </span>
                </li>
              ))}
              <li className="flex items-center gap-[var(--space-3)] text-[12.5px] font-medium" style={{ color: "var(--muted-foreground)" }}>
                <span className="flex size-[42px] flex-none items-center justify-center"><CheckCircle2 size={18} style={{ color: "var(--primary)" }} aria-hidden /></span>{d.practice}
              </li>
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

/** My Work: small figures, one quiet strip. */
export function MyWorkStrip({ items }: { items: { value: string; label: string; note: string; onOpen: () => void }[] }) {
  return (
    <section className="v4-mywork" aria-label="My Work">
      <div className={items.length === 4 ? "is-four" : ""}>
        {items.map((it) => (
          <button key={it.label} type="button" onClick={it.onOpen} className="dm-quiet group">
            <strong>{it.value}</strong>
            <span>{it.label}<Go kind="open" className="opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100" /></span>
            <small>{it.note}</small>
          </button>
        ))}
      </div>
    </section>
  );
}
