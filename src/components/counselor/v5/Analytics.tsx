"use client";

// v5 Analytics (7 Oct 2026): "are students meeting the requirements that
// matter?" (Joshua). Joshua's six areas as tabs. Each is a few figures (a
// percentage and a two-word label); picking one lists the students who have
// not met it, because that list is the part a counselor acts on. Readiness
// and Risk read the SIS (OneRoster shape), Postsecondary and Career read the
// milestones, Engagement reads Dreamari. Outcomes needs National Student
// Clearinghouse data, not connected yet: it shows DEMO-ONLY figures so the
// screen can be discussed (Chandu, 7 Oct 2026: mock what we don't have).
// Charts rebuilt the same day on v4's language (charts.tsx): rings that
// draw in, a trend line per measure, bars by grade; bubbles removed.

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { PAGE_TITLE_CLASS, PAGE_TITLE_STYLE } from "@/components/app/chrome";
import { TextTabs } from "@/components/app/TextTabs";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { lastActiveLabel, milestonesForGrade, type CounselorStudent, type MilestoneKey } from "@/lib/counselorRoster";
import { sisFor } from "@/lib/counselorSis";
import { signalsFor } from "@/lib/studentSignals";
import { ABSwitch, useAB } from "../abTests";
import { StudentFace } from "./StudentFace";
import { DrawRing, GradientBars, TrendChart, historyFor } from "./charts";
import { ENGAGEMENT_YEARS, LoginsChart, SiteBars } from "@/components/counselor/v4/PlatformEngagement";
import { cv } from "@/lib/counselorBase";

type Area = "readiness" | "postsecondary" | "career" | "risk" | "engagement" | "outcomes";
const AREAS: { key: Area; label: string }[] = [
  { key: "readiness", label: "Readiness" },
  { key: "postsecondary", label: "Postsecondary" },
  { key: "career", label: "Career & WBL" },
  { key: "risk", label: "Risk" },
  { key: "engagement", label: "Engagement" },
  { key: "outcomes", label: "Outcomes" },
];
const RULE = "color-mix(in srgb, var(--foreground) 10%, transparent)";
const GAUGE_TRACK = "color-mix(in srgb, var(--foreground) 10%, transparent)";

/** A semicircle gauge (the v6 ring, flat): the arc fills by `pct` (0 to 100)
 *  and whatever sits in `children` is centered on its open side. The arc is
 *  decoration; the number in `children` is the readable value. Shared with
 *  Students > Progress. */
export function HalfGauge({ pct, width, stroke, color, children }: { pct: number; width: number; stroke: number; color: string; children?: React.ReactNode }) {
  const r = (width - stroke) / 2;
  const cy = r + stroke / 2;
  const height = cy + stroke / 2;
  const d = `M ${stroke / 2} ${cy} A ${r} ${r} 0 0 1 ${width - stroke / 2} ${cy}`;
  const fill = Math.max(0, Math.min(100, pct));
  return (
    <span className="relative block flex-none" style={{ width, height }}>
      <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} aria-hidden className="block overflow-visible">
        <path d={d} fill="none" stroke={GAUGE_TRACK} strokeWidth={stroke} strokeLinecap="round" pathLength={100} />
        <path d={d} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" pathLength={100} strokeDasharray={`${fill} 100`} opacity={fill > 0 ? 1 : 0}
          className="transition-[stroke-dasharray,stroke] duration-500 ease-out motion-reduce:transition-none" />
      </svg>
      <span className="absolute inset-x-0 bottom-0 flex justify-center">{children}</span>
    </span>
  );
}

/** One measure: who it applies to and who meets it. `bad` measures count a
 *  problem (Risk), so a higher number is worse and the list shows who has it. */
type Measure = { label: string; eligible: CounselorStudent[]; met: (s: CounselorStudent) => boolean; bad?: boolean };

const done = (s: CounselorStudent, k: MilestoneKey) => ["Approved", "Completed"].includes(s.milestones[k]);
const has = (s: CounselorStudent, k: MilestoneKey) => milestonesForGrade(s.grade).includes(k);
const daysAgo = (s: CounselorStudent) => {
  const l = lastActiveLabel(s.lastActive);
  return l === "Today" ? 0 : l === "Yesterday" ? 1 : parseInt(l, 10) || 99;
};

function measuresFor(area: Exclude<Area, "outcomes">, all: CounselorStudent[]): Measure[] {
  const sis = (s: CounselorStudent) => sisFor(s);
  const by = (k: MilestoneKey, label: string): Measure => ({ label, eligible: all.filter((s) => has(s, k)), met: (s) => done(s, k) });
  switch (area) {
    case "readiness": return [
      { label: "On track to graduate", eligible: all, met: (s) => sis(s).onTrackToGraduate },
      { label: "GPA 2.0 or higher", eligible: all, met: (s) => sis(s).gpa >= 2 },
      { label: "Attendance 90%+", eligible: all, met: (s) => sis(s).attendance.rate >= 90 },
      by("Academic Plan", "Academic plan done"),
    ];
    case "postsecondary": return [
      { label: "Has a plan", eligible: all, met: (s) => s.postsecondaryIntent !== "Undecided" },
      by("College List", "College list done"),
      by("Applications", "Applications in"),
      by("Financial Aid", "Financial aid done"),
    ];
    case "career": return [
      by("Career Pathway", "Pathway picked"),
      by("Resume", "Resume done"),
      { label: "CTE concentrator", eligible: all, met: (s) => sis(s).cte.concentrator },
      { label: "20+ WBL hours", eligible: all, met: (s) => sis(s).cte.wblHours >= 20 },
    ];
    case "risk": return [
      { label: "At risk", eligible: all, met: (s) => s.status === "At Risk", bad: true },
      { label: "Behind on credits", eligible: all, met: (s) => sis(s).credits.earned < sis(s).credits.expected, bad: true },
      { label: "Failing a class", eligible: all, met: (s) => sis(s).courses.some((c) => c.letter === "F"), bad: true },
      { label: "Missing 10%+ of days", eligible: all, met: (s) => sis(s).attendance.rate < 90, bad: true },
    ];
    case "engagement": return [
      { label: "Active this week", eligible: all, met: (s) => daysAgo(s) <= 7 },
      { label: "Top 3 picked", eligible: all, met: (s) => signalsFor(s).top3.length >= 3 },
      { label: "Saved a career", eligible: all, met: (s) => signalsFor(s).careersSaved > 0 },
      { label: "Played a simulation", eligible: all, met: (s) => signalsFor(s).simulationsCompleted > 0 },
    ];
  }
}

export function V5Analytics() {
  const [area, setArea] = useState<Area>("readiness");
  return (
    <div className="flex flex-col gap-[var(--space-8)] pt-[var(--space-2)] lg:pt-[var(--space-4)]">
      <header className="flex flex-col gap-[var(--space-5)]">
        <h1 className={PAGE_TITLE_CLASS} style={PAGE_TITLE_STYLE}>Analytics</h1>
        <TextTabs items={AREAS} value={area} onChange={setArea} ariaLabel="Analytics area" layoutId="v5-analytics-tabs" />
      </header>
      {area === "outcomes" ? <Outcomes /> : <AreaView key={area} area={area} />}
    </div>
  );
}

function Title({ children, aside }: { children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-[var(--space-4)] gap-y-[var(--space-2)]">
      <h2 className="text-[20px] leading-[26px] font-semibold sm:text-[22px] sm:leading-[28px]" style={{ fontFamily: "var(--font-display)" }}>{children}</h2>
      {aside}
    </div>
  );
}

/** The four measures: a ring that draws in beside the number (the number
 *  never sits inside the arc, which clipped it). Pick one to see its trend,
 *  its grades and its students. */
function MeasureTiles({ items, pick, onPick }: { items: { label: string; value: string; pct: number; bad?: boolean }[]; pick: number; onPick: (i: number) => void }) {
  return (
    <div role="tablist" aria-label="Measures" className="grid grid-cols-1 border-y sm:grid-cols-2 lg:grid-cols-4" style={{ borderColor: RULE }}>
      {items.map((x, i) => {
        const on = i === pick;
        return (
          <button key={x.label} type="button" role="tab" aria-selected={on} onClick={() => onPick(i)}
            className={`dm-quiet cc-figure relative flex min-w-0 cursor-pointer items-center gap-[var(--space-4)] px-[var(--space-2)] py-[var(--space-5)] text-left sm:px-[var(--space-5)] ${i ? "border-t sm:border-t-0" : ""} ${i % 2 === 1 ? "sm:border-l" : ""} ${i >= 2 ? "sm:border-t lg:border-t-0" : ""} lg:border-l lg:first:border-l-0`}
            style={{ borderColor: RULE }}>
            <DrawRing pct={x.pct} color={x.bad ? "var(--color-feedback-danger-solid)" : on ? "var(--primary)" : "color-mix(in srgb, var(--primary) 50%, var(--muted-foreground))"} />
            <span className="flex min-w-0 flex-col">
              <span className="cc-num text-[30px] leading-[34px] font-semibold tabular-nums" style={{ fontFamily: "var(--font-display)", color: on ? "var(--accent)" : "var(--foreground)" }}>{x.value}</span>
              <span className="truncate text-[14px] leading-[18px] font-semibold" style={{ color: on ? "var(--foreground)" : "var(--muted-foreground)" }}>{x.label}</span>
            </span>
            {on && <span aria-hidden className="absolute inset-x-[var(--space-5)] bottom-[-1px] h-[2px] rounded-full" style={{ background: "var(--accent)" }} />}
          </button>
        );
      })}
    </div>
  );
}

function AreaView({ area }: { area: Exclude<Area, "outcomes"> }) {
  const roster = useReviewedRoster();
  const measures = useMemo(() => measuresFor(area, roster), [area, roster]);
  const [pick, setPick] = useState(0);
  const m = measures[pick];
  // the students to act on: who has not met it, or who has the problem
  const list = m.eligible.filter((s) => (m.bad ? m.met(s) : !m.met(s)));
  const share = (x: Measure, set = x.eligible) => (set.length ? Math.round((set.filter(x.met).length / set.length) * 100) : 0);
  const tiles = measures.map((x) => ({ label: x.label, pct: share(x), bad: x.bad, value: x.bad ? String(x.eligible.filter(x.met).length) : `${share(x)}%` }));
  const grades = [9, 10, 11, 12].map((g) => {
    const set = m.eligible.filter((s) => s.grade === g);
    return { label: `Grade ${g}`, value: share(m, set), note: `${set.filter(m.met).length} of ${set.length}`, n: set.length };
  }).filter((r) => r.n > 0);
  return (
    <div className="flex flex-col gap-[48px]">
      <MeasureTiles items={tiles} pick={pick} onPick={setPick} />

      <div className="grid grid-cols-1 gap-[48px] lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-[var(--space-12)]">
        <section aria-label="Over the year" className="flex min-w-0 flex-col gap-[var(--space-4)]">
          <Title>{m.label}, Over the Year</Title>
          {/* DEMO-ONLY: monthly history is mocked (historyFor) until the
             school's snapshots are stored; the last point is today's real value. */}
          <TrendChart key={m.label} label={`${m.label} by month`} points={historyFor(`${area}-${m.label}`, share(m), m.bad)} max={100} />
        </section>
        <section aria-label="By grade" className="flex min-w-0 flex-col gap-[var(--space-4)]">
          <Title>By Grade</Title>
          <GradientBars key={m.label} rows={grades} tone={m.bad ? "danger" : "primary"} />
        </section>
      </div>

      {area === "engagement" && <Logins />}

      <section aria-label={m.bad ? m.label : `Not yet: ${m.label}`} className="flex flex-col gap-[var(--space-4)]">
        <Title aside={<span className="text-[14px] font-semibold whitespace-nowrap tabular-nums" style={{ color: "var(--muted-foreground)" }}>{list.length} students</span>}>{m.bad ? m.label : `Not Yet: ${m.label}`}</Title>
        {list.length ? (
          <ul className="grid grid-cols-1 sm:grid-cols-2 sm:gap-x-[var(--space-8)] lg:grid-cols-3">
            {list.slice(0, 30).map((s) => <Row key={s.id} s={s} />)}
          </ul>
        ) : (
          <p className="text-[15px] font-semibold v5-ok">Everyone is there.</p>
        )}
      </section>
      {area === "postsecondary" && <Plans roster={roster} />}
    </div>
  );
}

/** v4's logins chart and site bars (PlatformEngagement), on the v5 blues.
 *  DEMO-ONLY: login counts are v4's seeded months until logins are logged. */
function Logins() {
  const [view, setView] = useState<"month" | "day">("month");
  const year = ENGAGEMENT_YEARS.current;
  return (
    <div className="grid grid-cols-1 gap-[48px] lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-[var(--space-12)]" style={{ "--v4-chart-1": "var(--primary)", "--v4-chart-2": "color-mix(in srgb, var(--primary) 50%, white)" } as React.CSSProperties}>
      <section aria-label="Logins" className="flex min-w-0 flex-col gap-[var(--space-4)]">
        <Title aside={
          <span role="group" aria-label="Logins by" className="seg-track inline-flex h-[30px] items-center gap-[2px] rounded-[10px] p-[2px]" style={{ background: "color-mix(in srgb, var(--foreground) 9%, transparent)" }}>
            {(["month", "day"] as const).map((k) => (
              <button key={k} type="button" aria-pressed={view === k} onClick={() => setView(k)} className={`seg-item dm-quiet flex h-full cursor-pointer items-center rounded-[8px] px-[10px] text-[12px] ${view === k ? "font-semibold" : "font-medium text-[color:var(--muted-foreground)]"}`} style={{ background: view === k ? "color-mix(in srgb, var(--foreground) 16%, transparent)" : "transparent" }}>{k === "month" ? "By month" : "By day"}</button>
            ))}
          </span>
        }>Logins</Title>
        <LoginsChart key={view} data={view === "month" ? year.monthly : year.daily} />
      </section>
      <section aria-label="Where they spend time" className="flex min-w-0 flex-col gap-[var(--space-4)]">
        <Title>Where They Spend Time</Title>
        <SiteBars sites={year.bySite} />
      </section>
    </div>
  );
}

// DEMO-ONLY: outcomes need National Student Clearinghouse and state wage
// data, neither connected yet. These are plausible figures for a school
// this size, rising class over class, so the screen can be discussed.
const OUTCOMES: { label: string; now: number; byClass: number[] }[] = [
  { label: "Enrolled the fall after", now: 68, byClass: [58, 61, 60, 64, 68] },
  { label: "Still enrolled, year two", now: 81, byClass: [74, 76, 78, 79, 81] },
  { label: "Working or serving", now: 22, byClass: [18, 19, 21, 20, 22] },
  { label: "Earned a credential", now: 31, byClass: [19, 22, 25, 28, 31] },
];
const CLASSES = ["2021", "2022", "2023", "2024", "2025"];

function Outcomes() {
  const [pick, setPick] = useState(0);
  const o = OUTCOMES[pick];
  return (
    <div className="flex flex-col gap-[48px]">
      <MeasureTiles items={OUTCOMES.map((x) => ({ label: x.label, pct: x.now, value: `${x.now}%` }))} pick={pick} onPick={setPick} />
      <div className="grid grid-cols-1 gap-[48px] lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-[var(--space-12)]">
        <section aria-label="By graduating class" className="flex min-w-0 flex-col gap-[var(--space-4)]">
          <Title>{o.label}, by Class</Title>
          <TrendChart key={o.label} label={`${o.label} by graduating class`} points={o.byClass.map((v, i) => ({ label: CLASSES[i], value: v }))} max={100} />
        </section>
        <section aria-label="Where the class of 2025 went" className="flex min-w-0 flex-col gap-[var(--space-4)]">
          <Title>Class of 2025</Title>
          <GradientBars rows={[{ label: "4-year college", value: 41 }, { label: "2-year college", value: 27 }, { label: "Working", value: 17 }, { label: "Trade school", value: 9 }, { label: "Military", value: 5 }]} />
        </section>
      </div>
    </div>
  );
}

const PLAN_ORDER = ["4-Year College", "2-Year College", "Trade/Technical School", "Workforce", "Military", "Undecided"] as const;
const PLAN_WORD: Record<string, string> = { "4-Year College": "4-year college", "2-Year College": "2-year college", "Trade/Technical School": "Trade school", Workforce: "Work", Military: "Military", Undecided: "Still exploring" };

/** Plans after graduation, seniors: a ring with the total at its center and
 *  each plan as a segment (the Nexin breakdown reference, flat, not a 3D
 *  globe), or a dot strip per plan (one dot per senior) that keeps exact
 *  counts easy to compare. */
function Plans({ roster }: { roster: CounselorStudent[] }) {
  const [view] = useAB<"bars" | "ring">("v5-plans", "ring");
  const seniors = roster.filter((s) => s.grade === 12);
  const rows = PLAN_ORDER.map((p) => ({ p, n: seniors.filter((s) => s.postsecondaryIntent === p).length })).filter((r) => r.n > 0);
  // one blue, stepping lighter by rank; "still exploring" neutral
  const tint = (i: number, p: string) => (p === "Undecided" ? "color-mix(in srgb, var(--foreground) 22%, transparent)" : `color-mix(in srgb, var(--accent) ${100 - i * 15}%, var(--background))`);
  const C = 2 * Math.PI * 70;
  // where each ring segment starts, computed up front (no mutation in render)
  const starts = rows.map((_, i) => rows.slice(0, i).reduce((t, r) => t + (r.n / Math.max(1, seniors.length)) * C, 0));
  return (
    <section aria-label="Plans after graduation" className="flex flex-col gap-[var(--space-5)]">
      <div className="flex flex-wrap items-end justify-between gap-[var(--space-3)]">
        <h2 className="text-[22px] leading-[28px] font-semibold sm:text-[24px]" style={{ fontFamily: "var(--font-display)" }}>Plans After Graduation</h2>
        <ABSwitch test="v5-plans" fallback="ring" options={[{ key: "ring", label: "Ring" }, { key: "bars", label: "Dots" }]} why="Seniors' plans as a ring with the total in the middle (Maisha's Nexin reference, kept flat), or as rows of dots, one per senior. Open because the ring is more visual, dots are easier to count and compare." />
      </div>
      {view === "bars" ? (
        <ul className="flex flex-col">
          {rows.map((r, i) => (
            <li key={r.p} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-[var(--space-4)] gap-y-[var(--space-2)] border-b py-[var(--space-3)] last:border-b-0 sm:grid-cols-[180px_minmax(0,1fr)]" style={{ borderColor: RULE }}>
              <span className="text-[14px] font-semibold">{PLAN_WORD[r.p]}</span>
              <span role="img" aria-label={`${r.n} seniors: ${PLAN_WORD[r.p]}`} className="col-span-2 flex flex-wrap items-center gap-[4px] sm:col-span-1 sm:col-start-2 sm:row-start-1">
                {Array.from({ length: r.n }, (_, k) => <span key={k} aria-hidden className="size-[12px] rounded-full" style={{ background: tint(i, r.p) }} />)}
                <span aria-hidden className="hidden pl-[var(--space-2)] text-[15px] font-semibold tabular-nums sm:inline">{r.n}</span>
              </span>
              <span className="col-start-2 row-start-1 text-right text-[15px] font-semibold tabular-nums sm:hidden">{r.n}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-[var(--space-8)] sm:flex-row sm:justify-center">
          <svg viewBox="0 0 180 180" width="220" height="220" role="img" aria-label={`${seniors.length} seniors by plan`}>
            <circle cx="90" cy="90" r="70" fill="none" stroke="color-mix(in srgb, var(--foreground) 8%, transparent)" strokeWidth="18" />
            {rows.map((r, i) => {
              const len = (r.n / Math.max(1, seniors.length)) * C;
              return <circle key={r.p} cx="90" cy="90" r="70" fill="none" stroke={tint(i, r.p)} strokeWidth="18" strokeDasharray={`${Math.max(0, len - 3)} ${C}`} strokeDashoffset={-starts[i]} transform="rotate(-90 90 90)" strokeLinecap="butt" />;
            })}
            <text x="90" y="88" textAnchor="middle" style={{ font: "600 34px var(--font-display)", fill: "var(--foreground)" }}>{seniors.length}</text>
            <text x="90" y="110" textAnchor="middle" style={{ font: "500 12px var(--font-body)", fill: "var(--muted-foreground)" }}>seniors</text>
          </svg>
          <ul className="flex flex-col gap-[10px]">
            {rows.map((r, i) => (
              <li key={r.p} className="flex items-center gap-[var(--space-3)] text-[14px]">
                <span aria-hidden className="size-[10px] rounded-full" style={{ background: tint(i, r.p) }} />
                <span className="min-w-[130px] font-semibold">{PLAN_WORD[r.p]}</span>
                <span className="font-semibold tabular-nums">{r.n}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function Row({ s }: { s: CounselorStudent }) {
  return (
    <li className="border-b" style={{ borderColor: RULE }}>
      <Link href={`${cv("students")}&studentId=${encodeURIComponent(s.id)}`} className="dm-quiet group -mx-[var(--space-2)] flex items-center gap-[var(--space-3)] rounded-[var(--radius-sm)] px-[var(--space-2)] py-[10px]">
        <StudentFace s={s} size={36} />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-[15px] leading-[19px] font-semibold">{s.name}</span>
          <span className="text-[12.5px] font-medium" style={{ color: "var(--muted-foreground)" }}>Grade {s.grade}</span>
        </span>
        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-[2px]" style={{ color: "var(--muted-foreground)" }} aria-hidden />
      </Link>
    </li>
  );
}
