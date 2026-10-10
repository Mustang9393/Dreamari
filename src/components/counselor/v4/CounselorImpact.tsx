"use client";

// 10 Oct 2026, Chandu: "try better types of graphs, more beautiful ones ...
// Get inspiration from Pinterest, Dribbble etc and be creative with the
// graphs, don't be traditional, as long as they convey the information
// sensibly." Visuals only; the six sections, their order, data, drills and
// reports are unchanged (charts/impactViz.tsx). The cover's ring is now a
// constellation, one dot per student lit clockwise, with the page's one
// glow behind it; the next step gets its share of the caseload as a thin
// bar; each Key Win wears its check; each district goal gets a bullet bar
// against its target tick and the header a pip per goal met; an earlier
// period's Use of Time is the same waffle as the live week's.
// The user's follow-up the same day: "ASCA Alignment and District goals need
// better graphs. Think beyond bars and donuts please." and "The Key Wins can
// also be better." District Goals now leads with a goal rose (one petal per
// goal, length = result as a share of target, a ring at 100%; turnaround is
// inverted since fewer days is better) linked to the table by hover, and
// each row shows its margin ("7 over", "15 under") instead of a bar. Key
// Wins is a bento of six cards: a hero figure, a micro-chart matched to the
// win's story, and the sentence cut short. The cover's caption moved under
// the constellation so no dot touches the number ("The on track 104
// students and the 86% are ... intersecting the graph"), and light mode
// drops the blue glow ("sort of bad on light mode").

// My Impact. Rebuilt 27 Sept 2026 on Maisha's review ("Am I able to see the
// principal report? ... Please utilize the same numbers as the replit"),
// re-laid 2 Oct 2026 to her Replit section for section ("ours is so dense
// and hard to read"), then given one colour and opacity system the same day
// ("Pay attention to color and opacity, whats strong, whats muted"): strong
// ink for every stat number, a step down for labels, a quiet step for
// notes, blue only for chart fills and interactive affordances, the status
// colours only where status is the point. Flat `--card` surfaces, a
// hairline border, no glow below the hero.
//
// Content changed 9 Oct 2026 to Maisha's My Impact image: "I want to change
// some of the info here because it's repetitive and present in other
// sections since our last changes. This is for the content change only. The
// design/aesthetic of how you present this info can be closer to how you've
// been designing." Her page, top to bottom:
//   1. Title line, filters, the reporting period, Principal Report and
//      Export Impact Report (unchanged).
//   2. Student Progress: the on-track hero (unchanged, it matches hers).
//   3. ASCA Alignment: four measures, two per domain, with the change since
//      last semester (ImpactSections.tsx).
//   4. Key Wins: six one-sentence tiles, each opening its students.
//   5. District Goals & Reporting: a six-row table against the targets.
//   6. Use of Time: the ASCA share and four categories.
// Gone, because her list does not have them and their figures sit on other
// Insights pages now: Where Students Are Heading (Life After Graduation and
// Progress Grade by Grade are Readiness and College & Career's), Readiness
// Checkpoints (Readiness), the My Work strip, Student Engagement
// (Engagement), Highlights From This Period (Key Wins carries the wins) and
// District Compliance as its own disclosure (its rows are the table). The
// Principal Report and Export Impact Report print the same six sections
// (ImpactPublication.tsx).
//
// Every number opens the students it counts, with View, Message, Schedule
// and Message All (InsightStudents.tsx). The Insights grade and group
// filters scope the live period; the fixed history periods are the Replit's
// whole-caseload figures (their drills show the breakdown without a list).

import { CountUp } from "./InsightCharts";
import { ImpactPublication } from "./ImpactPublication";
import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import { CheckCircle2, ChevronRight, FileBarChart, Mail, Copy } from "lucide-react";
import type React from "react";
import { DEMO_SCHOOL, MILESTONE_KEYS, milestonesForGrade, type CounselorStudent, type PostsecondaryIntent } from "@/lib/counselorRoster";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { useCounselorPreferences } from "@/lib/counselorPreferences";
import { summarize, useTimeLog, type TimeSummary } from "@/lib/counselorTimeLog";
import { counselorAccountSnapshot, serverCounselorAccountSnapshot, subscribeCounselorAccount } from "@/lib/counselorAccount";
import { Go } from "./chips";
import { FullScreenDocument, printDocumentPage } from "./DocumentDesk";
import { useConnectLive } from "./CounselorConnect";
import { useRouter } from "next/navigation";
import { SurfaceState } from "@/components/app/SurfaceState";
import { Listbox } from "./Listbox";
import { IconTip } from "@/components/app/IconTip";
import { useInsightsScope } from "./insightsScope";
import { InsightStudentsPanel, type StudentsDrill } from "./InsightStudents";
import { AscaAlignment, SectionTitle, UseOfTime, timeGroups, TIME_CATEGORIES, TIME_SHADE } from "./ImpactSections";
import { DotConstellation, GoalRose, MarginMarker, TimeFlow, WinClock, WinFlow, WinGauge, WinLiftTrack, WinPath, WinStep } from "./charts/impactViz";
import { ASCA_TARGET_PCT } from "@/lib/counselorTimeLog";
import "./insights2.css";

const PATHWAY_ORDER: PostsecondaryIntent[] = ["4-Year College", "2-Year College", "Trade/Technical School", "Military", "Workforce", "Undecided"];
const finished = (s: CounselorStudent, k: "Academic Plan" | "Career Pathway" | "Career Report") => s.milestones[k] === "Approved" || s.milestones[k] === "Completed";

/** One reporting period's raw figures. Fall 2023 is the Replit's own My
 *  Impact, verbatim in every figure it shows (read off the live Replit on
 *  27 Sept 2026: Maisha, "utilize the same numbers as the replit"). The two
 *  earlier periods are DEMO-ONLY seeded history for the period switch,
 *  set a little behind Fall 2023 so the counselor's story climbs to now. */
type PeriodData = {
  key: "this-semester" | "fall-2023" | "spring-2023" | "year-2022-23";
  label: string;
  range: string;
  rangeLong: string;
  year: string;
  issued: string;
  /** only the current period has live student lists behind its numbers */
  current: boolean;
  caseload: number;
  onTrack: number;
  /** students per postsecondary intent, in PATHWAY_ORDER */
  plans: number[];
  answered: [number, number];
  careerReports: number;
  academicPlans: number;
  seniorsWithPlan: number;
  /** Grade 11 and 12 students with a career pathway identified, and how many there are */
  pathwayUpper: [number, number];
  reviewed: number;
  pending: number;
  turnaround: number;
  seniors?: number;
  /** DEMO-ONLY: minutes per Use of Time category for a period with no time log */
  timeMinutes?: number[];
};

const PERIODS: PeriodData[] = [
  {
    key: "fall-2023", label: "Fall 2023", range: "Aug 2023 – Jan 2024", rangeLong: "August 2023 – January 2024", year: "2023–2024", issued: "Feb 2, 2024", current: false,
    caseload: 120, onTrack: 103, plans: [66, 1, 12, 0, 0, 41], answered: [5, 15],
    careerReports: 87, academicPlans: 78, seniorsWithPlan: 26, pathwayUpper: [49, 60],
    reviewed: 15, pending: 10, turnaround: 2.1, timeMinutes: [760, 530, 640, 710],
  },
  {
    key: "spring-2023", label: "Spring 2023", range: "Jan – Jun 2023", rangeLong: "January – June 2023", year: "2022–2023", issued: "Jun 16, 2023", current: false,
    caseload: 120, onTrack: 97, plans: [58, 2, 11, 1, 0, 48], answered: [4, 14],
    careerReports: 80, academicPlans: 70, seniorsWithPlan: 24, pathwayUpper: [44, 60],
    reviewed: 22, pending: 4, turnaround: 2.8, timeMinutes: [700, 480, 610, 780],
  },
  {
    key: "year-2022-23", label: "2022–23 school year", range: "Aug 2022 – Jun 2023", rangeLong: "August 2022 – June 2023", year: "2022–2023", issued: "Jun 23, 2023", current: false,
    caseload: 120, onTrack: 96, plans: [57, 2, 11, 1, 0, 49], answered: [9, 31],
    careerReports: 82, academicPlans: 71, seniorsWithPlan: 24, pathwayUpper: [43, 60],
    reviewed: 38, pending: 4, turnaround: 3.1, timeMinutes: [690, 470, 600, 800],
  },
];

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** The current reporting period, built from the live stores (8 Oct 2026
 *  audit: every period was fixed history, so no drill could list a real
 *  student and nothing the counselor did here moved a number). The roster
 *  with its review decisions, Connect's replies and the time log feed it.
 *  The Academic Year in Settings names it: the semester of that year that
 *  holds today. */
function useLivePeriod(scoped?: CounselorStudent[]) {
  // `scoped` is the Insights filters' roster (v4 My Impact, 9 Oct 2026);
  // without it, the whole caseload (v5's report previews).
  const all = useReviewedRoster();
  const roster = scoped ?? all;
  const prefs = useCounselorPreferences();
  const connect = useConnectLive();
  const timeLog = useTimeLog();
  return useMemo(() => {
    const now = new Date();
    const start = new Date(`${prefs.start}T00:00:00`);
    const end = new Date(`${prefs.end}T00:00:00`);
    const fy = Number.isNaN(start.getTime()) ? now.getFullYear() : start.getFullYear();
    // Fall runs from the first day to January; spring from February to the last day.
    const springStart = new Date(fy + 1, 1, 1);
    const spring = now >= springStart;
    const from = spring ? springStart : start;
    const toMonth = spring ? (Number.isNaN(end.getTime()) ? 5 : end.getMonth()) : 0;
    const label = spring ? `Spring ${fy + 1}` : `Fall ${fy}`;
    const fromM = Number.isNaN(from.getTime()) ? 7 : from.getMonth();
    const range = `${MONTHS[fromM].slice(0, 3)} ${spring ? fy + 1 : fy} – ${MONTHS[toMonth].slice(0, 3)} ${fy + 1}`;
    const rangeLong = `${MONTHS[fromM]} ${spring ? fy + 1 : fy} – ${MONTHS[toMonth]} ${fy + 1}`;
    const reviewable = ["Career Report", "Academic Plan", "Resume"] as const;
    const count = (f: (s: CounselorStudent) => boolean) => roster.filter(f).length;
    const seniors = roster.filter((s) => s.grade === 12);
    const upper = roster.filter((s) => s.grade >= 11 && milestonesForGrade(s.grade).includes("Career Pathway"));
    const period: PeriodData = {
      key: "this-semester", label, range, rangeLong, year: prefs.year.replace(/\s*-\s*/, "–"), issued: now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), current: true,
      caseload: roster.length,
      onTrack: count((s) => s.status === "On Track"),
      plans: PATHWAY_ORDER.map((p) => count((s) => s.postsecondaryIntent === p)),
      answered: [connect.answered, connect.total],
      careerReports: count((s) => finished(s, "Career Report")),
      academicPlans: count((s) => finished(s, "Academic Plan")),
      seniorsWithPlan: seniors.filter((s) => s.postsecondaryIntent !== "Undecided").length,
      pathwayUpper: [upper.filter((s) => finished(s, "Career Pathway")).length, upper.length],
      seniors: seniors.length,
      reviewed: roster.reduce((n, s) => n + reviewable.filter((k) => s.milestones[k] === "Approved" || s.milestones[k] === "Changes Requested").length, 0),
      // every submission waiting, the Review Desk's own count
      pending: roster.reduce((n, s) => n + MILESTONE_KEYS.filter((k) => s.milestones[k] === "Pending Review").length, 0),
      // DEMO-ONLY: review turnaround needs submission times the roster does
      // not keep yet; a steady figure inside the 5-day standard until then
      turnaround: 1.9,
    };
    return { period, week: summarize(timeLog, now) };
  }, [roster, prefs, connect, timeLog]);
}

const SCHOOL_AVG_ON_TRACK = 71;
const GOAL_PCT = 80;
const REVIEW_DAYS = 5;
// DEMO-ONLY: the change since last semester on each ASCA measure, seeded
// until semester snapshots are stored (Maisha's image: +12, +8, +15, +10).
const ASCA_DELTAS = { academicPlan: 12, onTrack: 8, direction: 15, careerReport: 10 } as const;
const pct = (n: number, of: number) => (of ? Math.round((n / of) * 100) : 0);

export type GoalKey = "plans" | "senior" | "onTrack" | "careerReport" | "academicPlan" | "turnaround";
export type WinKey = "moved" | "academic" | "pathway" | "senior" | "turnaround" | "onTrack";

/** Everything the page, its drills and the reports show for one period,
 *  derived from its raw figures: the six sections of Maisha's image. */
function buildView(p: PeriodData, school: string, week?: TimeSummary) {
  const onTrackPct = pct(p.onTrack, p.caseload);
  const withPlan = p.plans.slice(0, 5).reduce((a, n) => a + n, 0);
  const withPlanPct = pct(withPlan, p.caseload);
  const careerPct = pct(p.careerReports, p.caseload);
  const academicPct = pct(p.academicPlans, p.caseload);
  const sr = p.seniors ?? 30;
  const seniorPct = pct(p.seniorsWithPlan, sr);
  const upperPct = pct(p.pathwayUpper[0], p.pathwayUpper[1]);
  const t = p.turnaround.toFixed(1);
  // DEMO-ONLY: who moved from undecided this semester needs the semester's
  // opening snapshot; a steady share of the decided until it is stored
  const moved = Math.max(1, Math.round(withPlan * 0.38));
  const minutes = week ? timeGroups(week).groups.map((g) => g.minutes) : (p.timeMinutes ?? [0, 0, 0, 0]);
  const timeTotal = Math.max(1, minutes.reduce((a, n) => a + n, 0));
  const studentPct = week ? week.studentPct : Math.round(((timeTotal - minutes[3]) / timeTotal) * 100);
  return {
    ...p,
    school, onTrackPct, withPlan, withPlanPct, careerPct, academicPct, seniorPct, upperPct, moved,
    exploring: p.caseload - withPlan,
    pathways: PATHWAY_ORDER.map((label, i) => ({ label, count: p.plans[i] })),
    // 3. ASCA Alignment: her four measures
    asca: {
      academic: [
        { key: "academicPlan" as const, short: "Academic plans on file", label: "Students with academic plans on file", pct: academicPct, delta: ASCA_DELTAS.academicPlan },
        { key: "onTrack" as const, short: "Meeting on-track criteria", label: "Students meeting on-track criteria", pct: onTrackPct, delta: ASCA_DELTAS.onTrack },
      ],
      career: [
        { key: "direction" as const, short: "Postsecondary direction set", label: "Students with a defined postsecondary direction", pct: withPlanPct, delta: ASCA_DELTAS.direction },
        { key: "careerReport" as const, short: "Career exploration done", label: "Students completing career exploration activities", pct: careerPct, delta: ASCA_DELTAS.careerReport },
      ],
    },
    // 4. Key Wins: her six sentences, this period's figures, no em dashes
    wins: [
      { key: "moved" as WinKey, figure: String(moved), text: `${moved} undecided students chose a postsecondary direction this semester.` },
      { key: "academic" as WinKey, figure: `${ASCA_DELTAS.academicPlan} points`, text: `Academic plans: +${ASCA_DELTAS.academicPlan} points after counselor reviews.` },
      { key: "pathway" as WinKey, figure: `${upperPct}%`, text: upperPct >= GOAL_PCT ? "Grades 11–12 career pathways exceed the school target." : `Grades 11–12 career pathways: ${upperPct}%; school target: ${GOAL_PCT}%.` },
      { key: "senior" as WinKey, figure: `${seniorPct}%`, text: `Senior plans: ${seniorPct}%, ${seniorPct >= GOAL_PCT ? "meeting" : "approaching"} the district’s ${GOAL_PCT}% spring benchmark.` },
      { key: "turnaround" as WinKey, figure: `${t} days`, text: `Reviews average ${t} days; district standard: ${REVIEW_DAYS} days.` },
      { key: "onTrack" as WinKey, figure: `${onTrackPct}%`, text: `On track: ${onTrackPct}% of ${p.caseload} students; school: ${SCHOOL_AVG_ON_TRACK}%.` },
    ],
    // 5. District Goals & Reporting: result against target, status computed
    goals: [
      { key: "plans" as GoalKey, value: withPlanPct, goal: GOAL_PCT, max: 100, metric: "Postsecondary plans on file", result: `${withPlanPct}%`, note: `${withPlan} of ${p.caseload}`, target: `${GOAL_PCT}% or more`, met: withPlanPct >= GOAL_PCT },
      { key: "senior" as GoalKey, value: seniorPct, goal: GOAL_PCT, max: 100, metric: "Senior postsecondary plans completed", result: `${seniorPct}%`, note: `${p.seniorsWithPlan} of ${sr}`, target: `${GOAL_PCT}% or more`, met: seniorPct >= GOAL_PCT },
      { key: "onTrack" as GoalKey, value: onTrackPct, goal: GOAL_PCT, max: 100, metric: "On-track rate", result: `${onTrackPct}%`, note: `${p.onTrack} of ${p.caseload}`, target: `${GOAL_PCT}% or more`, met: onTrackPct >= GOAL_PCT },
      { key: "careerReport" as GoalKey, value: careerPct, goal: GOAL_PCT, max: 100, metric: "Career report completion", result: `${careerPct}%`, note: `${p.careerReports} of ${p.caseload}`, target: `${GOAL_PCT}% or more`, met: careerPct >= GOAL_PCT },
      { key: "academicPlan" as GoalKey, value: academicPct, goal: GOAL_PCT, max: 100, metric: "Academic plan completion", result: `${academicPct}%`, note: `${p.academicPlans} of ${p.caseload}`, target: `${GOAL_PCT}% or more`, met: academicPct >= GOAL_PCT },
      { key: "turnaround" as GoalKey, value: p.turnaround, goal: REVIEW_DAYS, max: REVIEW_DAYS * 2, metric: "Plan review turnaround", result: `${t} days`, note: "average", target: `${REVIEW_DAYS} days or less`, met: p.turnaround <= REVIEW_DAYS },
    ],
    // 6. Use of Time: the ASCA share and the four categories
    time: { studentPct, total: timeTotal, groups: TIME_CATEGORIES.map((c, i) => ({ c, minutes: minutes[i], pct: Math.round((minutes[i] / timeTotal) * 100) })) },
  };
}
export type ImpactView = ReturnType<typeof buildView>;
const MET = "var(--cd-green)";
const OPEN = "var(--cd-amber)";

/** The page's one colour and opacity system, used everywhere below the hero.
 *  STRONG: every stat number, full foreground. QUIET: sublines, captions,
 *  targets and notes. Blue (`--primary`) is for chart fills and interactive
 *  affordances only, never a number; MET / OPEN colour only a status chip. */
const INK = "var(--foreground)";
const FLAT_CARD = { background: "var(--card)", borderColor: "var(--glass-border)" } as const;
const FLAT_CARD_CLASS = "v4-surface rounded-[var(--radius-md)] border p-[var(--space-4)] sm:p-[var(--space-6)]";

export function MetChip({ met }: { met: boolean }) {
  return (
    <span className="v4-goal-status inline-flex items-center gap-[4px] rounded-full px-[9px] py-[2px] text-[11px] font-extrabold whitespace-nowrap" style={{ background: `color-mix(in srgb, ${met ? MET : OPEN} 16%, transparent)`, color: met ? MET : OPEN }}>
      {met ? <CheckCircle2 className="h-[11px] w-[11px]" aria-hidden /> : <Go kind="open" className="h-[11px] w-[11px]" />}{met ? "Met" : "In progress"}
    </span>
  );
}

/** The Replit's Principal / District Report as a printed document (27 Sept
 *  2026, direct instruction: "make the principal report much more
 *  editorially composed, designed, beautifully formatted, add a school x
 *  Dreamari branding"). Its sections are the page's six (9 Oct 2026). Share
 *  (27 Sept 2026: "lets add a share option in the principal report preview
 *  too") is an email to the principal with the wins and goals in the body,
 *  or the same text copied; the PDF itself comes from Print or save PDF. */
function PrincipalReport({ v, who, role, school, kind, onClose }: { v: ImpactView; who: string; role: string; school: string; kind: "impact" | "principal"; onClose: () => void }) {
  const pageRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const subject = `Counselor Impact Summary: ${who}, ${school}, ${v.range}`;
  const summary = [
    `Counselor Impact Summary · Academic Year ${v.year}`,
    `${who}, ${role} · ${school} · Reporting Period: ${v.range}`,
    ``,
    `Key Wins`,
    ...v.wins.map((w, i) => `${i + 1}. ${w.text}`),
    ``,
    `District Goals & Reporting`,
    ...v.goals.map((g) => `${g.metric}: ${g.result} (target ${g.target}) · ${g.met ? "Met" : "In progress"}`),
  ].join("\n");
  const share = [
    { label: "Email to principal", icon: Mail, onClick: () => { window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(summary)}`; } },
    { label: copied ? "Summary copied" : "Copy summary", icon: Copy, onClick: () => { navigator.clipboard?.writeText(summary).then(() => { setCopied(true); window.setTimeout(() => setCopied(false), 2000); }).catch(() => {}); } },
  ];
  return (
    <FullScreenDocument open title={`${kind === "impact" ? "Impact report · 2 pages" : "Principal brief · 1 page"} · ${who}`} onClose={onClose} onPrint={() => printDocumentPage(pageRef.current, `Principal report, ${who}`)} share={share}>
      <ImpactPublication v={v} who={who} role={role} kind={kind} pageRef={pageRef} />
    </FullScreenDocument>
  );
}

/** The two reports for other screens (v5 My Impact, 7 Oct 2026: "export
 *  report and principal report need to be there and show previews"): the
 *  current period, the signed-in counselor. */
function useDefaultImpactView() {
  const account = useSyncExternalStore(subscribeCounselorAccount, counselorAccountSnapshot, serverCounselorAccountSnapshot);
  const school = account.school || DEMO_SCHOOL;
  const { period, week } = useLivePeriod();
  const v = useMemo(() => buildView(period, school, week), [period, school, week]);
  return { v, who: account.name || "Sarah Chen", role: account.role || "School Counselor", school };
}

export function ImpactReportPreview({ kind, onClose }: { kind: "impact" | "principal"; onClose: () => void }) {
  const { v, who, role, school } = useDefaultImpactView();
  return <PrincipalReport v={v} who={who} role={role} school={school} kind={kind} onClose={onClose} />;
}

/** The report's first page, scaled down, for a thumbnail. */
export function ImpactReportThumb({ kind, width = 120 }: { kind: "impact" | "principal"; width?: number }) {
  const { v, who, role } = useDefaultImpactView();
  const ref = useRef<HTMLDivElement>(null);
  const scale = width / 816;
  return (
    <span aria-hidden className="pointer-events-none relative block overflow-hidden bg-white" style={{ width, height: Math.round(1056 * scale) }}>
      <span className="absolute top-0 left-0 block origin-top-left" style={{ width: 816, transform: `scale(${scale})` }}>
        <ImpactPublication v={v} who={who} role={role} kind={kind} pageRef={ref} />
      </span>
    </span>
  );
}

/** A goal's margin to its target: points over or under, or days faster or
 *  slower for the turnaround (fewer days is better). */
function goalMargin(g: ImpactView["goals"][number]) {
  if (g.key === "turnaround") {
    const d = Math.round((g.goal - g.value) * 10) / 10;
    return { good: d >= 0, text: `${Math.abs(d)} ${d >= 0 ? "days faster" : "days slower"}` };
  }
  const d = g.value - g.goal;
  return { good: d >= 0, text: `${Math.abs(d)} ${d >= 0 ? "over" : "under"}` };
}

/** Each Key Win as a bento card: a kicker, a hero figure, a micro-chart
 *  matched to its story, and the sentence cut short. */
function winCard(key: WinKey, v: ImpactView): { kicker: string; hero: string; caption: string; viz: React.ReactNode } {
  const t = v.turnaround.toFixed(1);
  switch (key) {
    case "moved": return { kicker: "Postsecondary direction", hero: String(v.moved), caption: "undecided students chose a direction this semester.", viz: <WinFlow moved={v.moved} still={v.exploring} /> };
    case "academic": return { kicker: "Academic plans", hero: `+${ASCA_DELTAS.academicPlan}`, caption: "points after counselor reviews.", viz: <WinStep from={v.academicPct - ASCA_DELTAS.academicPlan} to={v.academicPct} /> };
    case "senior": return { kicker: "Senior plans", hero: `${v.seniorPct}%`, caption: `${v.seniorPct >= GOAL_PCT ? "Meets" : "Nearing"} the district’s ${GOAL_PCT}% spring benchmark.`, viz: <WinGauge value={v.seniorPct} bench={GOAL_PCT} /> };
    case "turnaround": return { kicker: "Review speed", hero: `${t} days`, caption: `average review. District standard: ${REVIEW_DAYS} days.`, viz: <WinClock days={v.turnaround} standard={REVIEW_DAYS} /> };
    // 10 Oct 2026, Chandu on the old 100-cell lift waffle: "IM NOT REALLY
    // SURE WHAT THE ON TRACK REPRESENTS? ... Why are some squares dark and
    // others light?" The kicker now says what on track means, the caption
    // says the lift in words, and the chart labels its own marks.
    case "onTrack": {
      const lift = v.onTrackPct - SCHOOL_AVG_ON_TRACK;
      const pts = `${Math.abs(lift)} ${Math.abs(lift) === 1 ? "point" : "points"}`;
      return { kicker: "On track to graduate", hero: `${v.onTrackPct}%`, caption: `of your ${v.caseload} students. ${lift === 0 ? "Same as the school." : `${pts} ${lift > 0 ? "above" : "below"} the school.`}`, viz: <WinLiftTrack ours={v.onTrackPct} school={SCHOOL_AVG_ON_TRACK} /> };
    }
    case "pathway": return v.upperPct >= GOAL_PCT
      ? { kicker: "Career pathways", hero: "11–12", caption: "Grades 11–12 are above the school target.", viz: <WinPath pct={v.upperPct} target={GOAL_PCT} /> }
      : { kicker: "Career pathways", hero: `${v.upperPct}%`, caption: `of grades 11–12 have one. Target: ${GOAL_PCT}%.`, viz: <WinPath pct={v.upperPct} target={GOAL_PCT} /> };
  }
}

const needsLabel = (s: CounselorStudent) => (s.postsecondaryIntent === "Undecided" ? "No plan yet" : s.postsecondaryIntent);

/** `scope="school"` is the Lead Counselor's School Impact: the same six
 *  sections for the whole school, headed by the school (9 Oct 2026: "School
 *  Impact follows the same structure"). */
export function CounselorImpact({ scope: who_ = "mine" }: { scope?: "mine" | "school" }) {
  const account = useSyncExternalStore(subscribeCounselorAccount, counselorAccountSnapshot, serverCounselorAccountSnapshot);
  const name = account.name || "Sarah Chen";
  const role = account.role || "School Counselor";
  const school = account.school || DEMO_SCHOOL;
  const who = who_ === "school" ? school : name;
  const router = useRouter();
  const [report, setReport] = useState<false | "impact" | "principal">(false);
  const [drill, setDrill] = useState<StudentsDrill | null>(null);
  const [goalLit, setGoalLit] = useState<string | null>(null);
  // The Insights grade and group filters scope the live period (9 Oct 2026);
  // the fixed history periods are whole-caseload figures.
  const scope = useInsightsScope();
  // Opens on the live semester (8 Oct 2026); the three fixed periods are
  // the Replit's history.
  const livePeriod = useLivePeriod(scope.roster);
  const periods = useMemo(() => [livePeriod.period, ...PERIODS], [livePeriod.period]);
  const [periodKey, setPeriodKey] = useState<PeriodData["key"]>("this-semester");
  const live = periodKey === "this-semester";
  const v = useMemo(() => { const p = periods.find((x) => x.key === periodKey) ?? periods[0]; return buildView(p, school, p.current ? livePeriod.week : undefined); }, [periods, periodKey, school, livePeriod.week]);
  const roster = scope.roster;
  const week = livePeriod.week;

  // Drills: in the live period every list counts the same students its
  // number does (the reviewed roster, filtered). Earlier periods have no
  // student-level history, so their drills show the breakdown without a list.
  const sub = (s: string) => [s, v.label, live ? scope.scopeLabel : ""].filter(Boolean).join(" · ");
  const list = (students: CounselorStudent[], note: (s: CounselorStudent) => string) => (live ? students.map((s) => ({ s, note: note(s) })) : []);
  const grade = (s: CounselorStudent) => `Grade ${s.grade}`;
  const notOnTrack = roster.filter((s) => s.status !== "On Track");
  const undecided = roster.filter((s) => s.postsecondaryIntent === "Undecided");
  const decided = roster.filter((s) => s.postsecondaryIntent !== "Undecided");
  const seniors = roster.filter((s) => s.grade === 12);
  const upper = roster.filter((s) => s.grade >= 11);
  const byGrade = [9, 10, 11, 12].map((g) => ({ g, rows: roster.filter((s) => s.grade === g) })).filter((x) => x.rows.length > 0);
  const gradeStats = (f: (s: CounselorStudent) => boolean, word: string) => byGrade.map((x) => ({ value: `${x.rows.filter(f).length} of ${x.rows.length}`, label: `Grade ${x.g} ${word}` }));
  const go = (view: string) => () => { setDrill(null); router.push(`/counselor?view=${view}&v=4`); };

  const drills = {
    onTrack: (): StudentsDrill => ({ title: "On Track", subtitle: sub(`${v.onTrack} of ${v.caseload} · school average ${SCHOOL_AVG_ON_TRACK}%`), stats: gradeStats((s) => s.status === "On Track", "on track"), students: list(notOnTrack, (s) => s.status), listLabel: `Need support · ${live ? notOnTrack.length : v.caseload - v.onTrack}`, extra: { label: "Open Milestones", onClick: go("milestones") } }),
    exploring: (): StudentsDrill => ({ title: "Still Exploring Their Next Step", subtitle: sub(`${v.exploring} of ${v.caseload} without a direction yet`), stats: v.pathways.map((p) => ({ value: String(p.count), label: p.label === "Undecided" ? "still deciding" : p.label })), students: list(undecided, grade), listLabel: `Still deciding · ${live ? undecided.length : v.exploring}`, extra: { label: "Open College & Career", onClick: go("insights") } }),
    direction: (): StudentsDrill => ({ title: "Postsecondary Direction Defined", subtitle: sub(`${v.withPlan} of ${v.caseload}`), stats: v.pathways.filter((p) => p.label !== "Undecided").map((p) => ({ value: String(p.count), label: p.label })), students: list(decided, needsLabel), listLabel: `With a direction · ${live ? decided.length : v.withPlan}` }),
    academic: (): StudentsDrill => ({ title: "Academic Plans on File", subtitle: sub(`${v.academicPlans} of ${v.caseload} · ${v.academicPct}%`), stats: gradeStats((s) => finished(s, "Academic Plan"), "on file"), students: list(roster.filter((s) => !finished(s, "Academic Plan")), (s) => s.milestones["Academic Plan"]), listLabel: "Still missing a plan", extra: { label: "Open Reviews", onClick: go("review-queue") } }),
    careerReport: (): StudentsDrill => ({ title: "Career Exploration Completed", subtitle: sub(`${v.careerReports} of ${v.caseload} career reports · ${v.careerPct}%`), stats: gradeStats((s) => finished(s, "Career Report"), "complete"), students: list(roster.filter((s) => !finished(s, "Career Report")), (s) => s.milestones["Career Report"]), listLabel: "Not finished yet", extra: { label: "Open Milestones", onClick: go("milestones") } }),
    pathway: (): StudentsDrill => ({ title: "Career Pathway, Grades 11 to 12", subtitle: sub(`${v.pathwayUpper[0]} of ${v.pathwayUpper[1]} identified · target ${GOAL_PCT}%`), stats: [{ value: `${v.upperPct}%`, label: "identified" }, { value: `${GOAL_PCT}%`, label: "school target" }], students: list([...upper].sort((a, b) => Number(finished(a, "Career Pathway")) - Number(finished(b, "Career Pathway"))), (s) => (finished(s, "Career Pathway") ? s.careerTrack : `Exploring ${s.careerTrack}`)), listLabel: "Needs support first" }),
    senior: (): StudentsDrill => ({ title: "Senior Postsecondary Plans", subtitle: sub(`${v.seniorsWithPlan} of ${v.seniors ?? 30} seniors · target ${GOAL_PCT}%`), stats: [{ value: `${v.seniorPct}%`, label: "with a plan" }, { value: String((v.seniors ?? 30) - v.seniorsWithPlan), label: "still deciding" }], students: list([...seniors].sort((a, b) => Number(a.postsecondaryIntent !== "Undecided") - Number(b.postsecondaryIntent !== "Undecided")), needsLabel), listLabel: "Still deciding first" }),
    reviews: (): StudentsDrill => ({ title: "Plan Reviews", subtitle: sub(`${v.reviewed} reviewed · ${v.turnaround.toFixed(1)} days on average`), stats: [{ value: String(v.reviewed), label: "reviewed" }, { value: String(v.pending), label: "waiting" }, { value: `${v.turnaround.toFixed(1)}`, label: "days to review" }, { value: `${REVIEW_DAYS}`, label: "district standard, days" }], students: list(roster.filter((s) => MILESTONE_KEYS.some((k) => s.milestones[k] === "Pending Review")), (s) => `${MILESTONE_KEYS.filter((k) => s.milestones[k] === "Pending Review").length} waiting`), listLabel: "Waiting on a review", extra: { label: "Open Reviews", onClick: go("review-queue") } }),
    moved: (): StudentsDrill => ({ title: "Moved to a Direction This Semester", subtitle: sub(`${v.moved} students`), students: list(decided.slice(0, v.moved), needsLabel), listLabel: `Chose a direction · ${v.moved}` }),
    asca: (): StudentsDrill => ({ title: "About These Metrics", subtitle: "ASCA National Model, 4th edition", items: ["Academic plans on file: the academic plan milestone is approved or completed.", "On-track criteria: the student's status is On Track.", "Postsecondary direction: the student has picked college, trade school, work or military.", "Career exploration: the career report milestone is approved or completed.", "The change is since last semester."], itemsLabel: "What each measure counts", students: [], extra: { label: "Open Readiness", onClick: go("readiness") } }),
  };
  const open = (d: StudentsDrill) => setDrill(d);
  const forWin: Record<WinKey, () => StudentsDrill> = { moved: drills.moved, academic: drills.academic, pathway: drills.pathway, senior: drills.senior, turnaround: drills.reviews, onTrack: drills.onTrack };
  const forGoal: Record<GoalKey, () => StudentsDrill> = { plans: drills.direction, senior: drills.senior, onTrack: drills.onTrack, careerReport: drills.careerReport, academicPlan: drills.academic, turnaround: drills.reviews };
  const forAsca = { academicPlan: drills.academic, onTrack: drills.onTrack, direction: drills.direction, careerReport: drills.careerReport } as const;
  const our = who_ === "school" ? "our" : "my";
  // What a mark's tooltip says it opens: the students behind it, or the
  // breakdown for a past period with no student list.
  const ascaTip = (d: StudentsDrill) => (d.students.length ? `See the ${d.students.length} ${d.listLabel ? d.listLabel.split(" · ")[0].toLowerCase() : "students"}` : "See the breakdown");

  return (
    // COMPONENT_INVENTORY row 62: this screen's own data is always seeded
    // (fixed reporting periods), so real emptiness only shows up once a
    // school genuinely has no caseload; `?state=loading|error&surface=62`
    // previews the states this always-populated demo data never reaches.
    <SurfaceState id={62} isEmpty={v.caseload === 0} onEmptyAction={() => router.push("/counselor?view=schools")}>
    <div className="v4-page v4-impact-report v4-sections flex flex-col">
      <div className="v4-impact-toolbar">
        <Listbox ariaLabel="Reporting period" value={periodKey} onChange={(k) => { setPeriodKey(k as PeriodData["key"]); setDrill(null); }} options={periods.map((p) => ({ value: p.key, label: p.current ? `This semester (${p.label})` : p.label }))} className="v4-period-select" />
        <span className="v4-source-note">{v.range} · {who_ === "school" ? `Prepared by ${name}` : who}</span>
        <div><button className="v4-secondary-action" onClick={() => setReport("principal")}>Principal Report</button><button className="v4-primary-action" onClick={() => setReport("impact")}><FileBarChart size={15}/>Export Impact Report</button></div>
      </div>
      {/* 2. Student Progress: the hero, unchanged (it matches her image). */}
      <section className="v4-impact-cover" aria-label="Student Progress">
        <div className="v4-impact-story"><span className="v4-overline">Student Progress</span><h2>Moving Toward<br/><em>What’s Next</em></h2><p>{v.onTrack} of {live && scope.scopeLabel ? `these ${v.caseload}` : `${our} ${v.caseload}`} students are on track.</p><button className="v4-text-action" onClick={() => open(drills.onTrack())}>Explore student progress <Go/></button></div>
        {/* One dot per student, the on-track ones lit clockwise (the page's one glow). */}
        <IconTip label={live ? `See the ${notOnTrack.length} students not on track` : "See the breakdown"} className="justify-self-center w-full max-w-[300px] justify-center">
        <button className="iv-orbit dm-quiet" onClick={() => open(drills.onTrack())} aria-label={`On-track rate ${v.onTrackPct} percent, ${v.onTrack} of ${v.caseload} students. Open details`}>
          <span className="iv-orbit-disc">
            <DotConstellation lit={v.onTrack} total={v.caseload} />
            <span className="iv-orbit-center"><strong><CountUp value={v.onTrackPct}/><small>%</small></strong></span>
          </span>
          <em className="iv-orbit-caption">on track · {v.onTrack} students</em>
        </button>
        </IconTip>
        <div className="v4-impact-priority"><span className="v4-overline">Next step</span><strong><CountUp value={v.exploring}/></strong><p className="v4-impact-priority-label">students still exploring<br/>their next step</p><button className="v4-text-action" onClick={() => open(drills.exploring())}>View student list <Go/></button></div>
      </section>

      {/* 3. ASCA Alignment */}
      <AscaAlignment
        academic={v.asca.academic.map((a) => ({ ...a, tip: ascaTip(forAsca[a.key]()), onOpen: () => open(forAsca[a.key]()) }))}
        career={v.asca.career.map((a) => ({ ...a, tip: ascaTip(forAsca[a.key]()), onOpen: () => open(forAsca[a.key]()) }))}
        onAbout={() => open(drills.asca())} />

      {/* 4. Key Wins: a bento of six cards, each a hero figure, a
         micro-chart matched to the win and its sentence cut short. Every
         card opens the students or the detail behind it. */}
      <section className={`${FLAT_CARD_CLASS} flex flex-col gap-[var(--space-4)]`} style={FLAT_CARD} aria-label="Key Wins">
        <SectionTitle title="Key Wins" info="What moved this period. Select a win to see the students behind it." />
        <div className="iv-wins">
          {v.wins.map((w) => {
            const card = winCard(w.key, v);
            return (
              <button key={w.key} type="button" onClick={() => open(forWin[w.key]())} className={`iv-win iv-win-${w.key} dm-quiet group`} aria-label={`${w.text} Show details`}>
                <span className="iv-win-top"><span className="iv-win-kicker">{card.kicker}</span><ChevronRight size={14} aria-hidden className="transition-transform group-hover:translate-x-[3px]" /></span>
                <span className="iv-win-viz">{card.viz}</span>
                <strong className="iv-win-hero">{card.hero}</strong>
                <span className="iv-win-caption">{card.caption}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 5. District Goals & Reporting: result, target, status; a row opens
         its students. Compact cards on phones (insights2.css). */}
      <section className={`${FLAT_CARD_CLASS} flex flex-col gap-[var(--space-4)]`} style={FLAT_CARD} aria-label="District Goals and Reporting">
        <div className="flex flex-wrap items-center justify-between gap-[10px]">
          <SectionTitle title="District Goals & Reporting" info="Each district measure against its target. Met is a threshold check for this period, not a change over time. In the rose, each petal is a result as a share of its target; the ring is 100%." unit={`${v.goals.filter((g) => g.met).length} of ${v.goals.length} met`} />
          <button type="button" onClick={() => setReport("principal")} className="v4-r2-link">View full report<ChevronRight size={14} aria-hidden /></button>
        </div>
        <div className="iv-goals-layout">
        <figure className="iv-rose-wrap">
          <GoalRose lit={goalLit} onLit={setGoalLit} onOpen={(k) => open(forGoal[k as GoalKey]())}
            goals={v.goals.map((g) => ({ key: g.key, short: g.metric, met: g.met, value: g.key === "turnaround" ? `${g.value.toFixed(1)}d` : g.result, ratio: g.key === "turnaround" ? g.goal / Math.max(0.1, g.value) : g.value / Math.max(1, g.goal) }))} />
          <figcaption><i className="is-met" aria-hidden />Met<i className="is-open" aria-hidden />In progress<i className="is-ring" aria-hidden />Target</figcaption>
        </figure>
        <div className="v4-goals">
          <div className="v4-goals-head" aria-hidden><span>Goal / Metric</span><span>Current Result</span><span>Target</span><span>Status</span><span /></div>
          {v.goals.map((g) => (
            <button key={g.key} type="button" onClick={() => open(forGoal[g.key]())} className={`v4-goal dm-quiet group${goalLit === g.key ? " is-lit" : ""}`}
              onPointerEnter={() => setGoalLit(g.key)} onPointerLeave={() => setGoalLit(null)} onFocus={() => setGoalLit(g.key)} onBlur={() => setGoalLit(null)} aria-label={`${g.metric}: ${g.result}, target ${g.target}, ${g.met ? "met" : "in progress"}. Show students`}>
              <span className="v4-goal-metric">{g.metric}</span>
              <span className="v4-goal-result iv-goal-result"><strong>{g.result}</strong><small>{g.note}</small><MarginMarker {...goalMargin(g)} /></span>
              <span className="v4-goal-target">{g.target}</span>
              <MetChip met={g.met} />
              <ChevronRight size={14} aria-hidden className="transition-transform group-hover:translate-x-[3px]" />
            </button>
          ))}
        </div>
        </div>
      </section>

      {/* 6. Use of Time: the counselor's week, so the live period only. */}
      {live && <UseOfTime week={week} onDrill={(d) => open({ ...d, extra: d.extra && { ...d.extra, onClick: () => { setDrill(null); d.extra!.onClick(); } } })} />}
      {!live && (
        <section className={`${FLAT_CARD_CLASS} flex flex-col gap-[var(--space-3)]`} style={FLAT_CARD} aria-label="Use of Time">
          <SectionTitle title="Use of Time" info="Where the period's logged time went. ASCA asks for 80% in direct and indirect student services." unit={`${v.time.studentPct}% direct and indirect student services · ASCA target: ${ASCA_TARGET_PCT}%`} />
          <TimeFlow groups={v.time.groups.map((g) => ({ c: g.c, pct: g.minutes, color: TIME_SHADE[g.c], quiet: g.c === "Administrative Work" }))} target={ASCA_TARGET_PCT} label={v.time.groups.map((g) => `${g.c} ${g.pct}%`).join(", ")} />
          <ul className="v4-r2-legend" style={{ color: INK }}>
            {v.time.groups.map((g) => <li key={g.c}><i aria-hidden className="mr-[6px] inline-block size-[9px] rounded-[2px] align-middle" style={{ background: TIME_SHADE[g.c] }} /><span>{g.c}: {g.pct}%</span></li>)}
          </ul>
        </section>
      )}

      <InsightStudentsPanel drill={drill} onClose={() => setDrill(null)} />
      {report && <PrincipalReport v={v} who={who} role={who_ === "school" ? `Prepared by ${name}` : role} school={school} kind={report} onClose={() => setReport(false)} />}
    </div>
    </SurfaceState>
  );
}
