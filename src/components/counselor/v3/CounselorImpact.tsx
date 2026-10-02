"use client";

// My Impact, v3 (rebuilt 2 Oct 2026). Why, in the words that drove it:
// a teammate's review of the 27 Sept one-page version said it had "so many
// numbers just for their caseload", "would not motivate a counselor to move
// from one platform to this", was "not engaging or user friendly" and had
// "way too many actions to take and think about". The user then asked for
// it as v3, "more graphical", and "remove ALL REDUNDANCY".
//
// What the audit found on the old page: about 70 printed numbers carrying
// about 35 distinct facts. On-track appeared 3 times, the senior plan rate
// 3 times, questions answered 4 times, turnaround 3 times, flags 3 times,
// and the ASCA cards repeated the milestone percentages. Two facts were
// wrong: "87% · 27 of 30 applying" mixed two different senior numbers
// (87% is 26 of 30 with a plan; 27 of 30 applying is 90%), and "15 plans
// reviewed · 10 pending" read like a backlog of the 15.
//
// So every fact now has ONE home on the page, drawn, not printed:
// - The hero is the district scorecard: the five targets the Principal
//   report judges, as bullet bars with the target tick, the school average
//   tick and the change since last semester. Its verdict counts targets met.
// - Readiness is three rings (the milestones that are not targets) and the
//   grade columns. Your work is the counselor's own output, with the two
//   queues that are waiting. Student activity is one ranked bar chart.
// - Time use and ASCA close the page, because they are for the yearly
//   review, not the week. ASCA lists the practices; its numbers are the
//   ones above, so they open in the drill instead of being printed twice.
// - The Replit's notable-achievement sentences are the lead line of each
//   figure's drill, and all six of the report's are in the Principal report.
// - Cut: the sticky section index (six cards do not need one), the page's
//   own Print (the report has Print and Share), and a Share button that did
//   nothing.
//
// Fall 2023 is still the Replit's own figures (Maisha, 27 Sept 2026:
// "utilize the same numbers as the replit"); nothing it showed is gone.

import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import { FileBarChart, BookOpen, Briefcase, Heart, CheckCircle2, AlertTriangle, Mail, Copy, TrendingUp } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { attentionReason, getRoster, DEMO_SCHOOL, type CounselorStudent, type MilestoneKey, type PostsecondaryIntent } from "@/lib/counselorRoster";
import { counselorAccountSnapshot, serverCounselorAccountSnapshot, subscribeCounselorAccount } from "@/lib/counselorAccount";
import { OverviewCard, Verdict } from "./overviewShared";
import { BRAND, Crest, FullScreenDocument, PAGE_H, PAGE_W, SANS, SERIF, printDocumentPage } from "./DocumentDesk";
import { PAPER_VARS } from "./DocumentPreview";
import { DrillPanel, type Drill, type DrillStudent } from "./Drill";
import { QUESTIONS, ANNOUNCEMENTS } from "./CounselorConnect";
import { useRouter } from "next/navigation";
import { SurfaceState } from "@/components/app/SurfaceState";
import { useCounselorFilters } from "../shell";
import { Go } from "../chips";
import { curriculumForGrade } from "@/lib/counselorCurriculum";
import { COUNSELOR_COVER, COUNSELOR_HEADSHOTS, CounselorHeadshot, seededPick } from "./MyImpact";
import { Listbox } from "@/components/app/Listbox";
import { BarChart, Ring, Segmented, SegmentedRing } from "@/components/connect/viz";
import { BLUE_5, NEUTRAL_SLICE, PRIMARY } from "../palette";
import { TimeUse } from "./TimeUse";
import { ASCA_TARGET_PCT, hoursLabel, summarize, TIME_KIND_LABEL, useTimeLog, type TimeSummary } from "@/lib/counselorTimeLog";

const PATHWAY_ORDER: PostsecondaryIntent[] = ["4-Year College", "2-Year College", "Trade/Technical School", "Military", "Workforce", "Undecided"];
/** One reporting period's raw figures. Fall 2023 is the Replit's own My
 *  Impact, verbatim in every figure it shows (read off the live Replit on
 *  27 Sept 2026: Maisha, "utilize the same numbers as the replit"). The two
 *  earlier periods are DEMO-ONLY seeded history for the period switch
 *  (direct instruction the same day: "build all 3", the third being "a
 *  reporting-period switch"), set a little behind Fall 2023 so the
 *  counselor's story climbs to now. */
type PeriodData = {
  key: "fall-2023" | "spring-2023" | "year-2022-23";
  label: string;
  range: string;
  rangeLong: string;
  year: string;
  issued: string;
  /** "semester" or "year": how the achievement sentences name the period */
  unit: "semester" | "year";
  /** only the current period has live student lists behind its numbers */
  current: boolean;
  caseload: number;
  onTrack: number;
  /** students per postsecondary intent, in PATHWAY_ORDER */
  plans: number[];
  answered: [number, number];
  grades: { onTrack: number; avg: number }[];
  overallAvg: number;
  careerReports: number;
  academicPlans: number;
  resumes: number;
  seniorsWithPlan: number;
  seniorsApplying: number;
  reviewed: number;
  approved: number;
  pending: number;
  announcements: number;
  flags: number;
  atRisk: number;
  turnaround: number;
  /** drops, simulations, careers saved, colleges saved, community posts */
  engagement: number[];
};

const PERIODS: PeriodData[] = [
  {
    key: "fall-2023", label: "Fall 2023", range: "Aug 2023 – Jan 2024", rangeLong: "August 2023 – January 2024", year: "2023–2024", issued: "Feb 2, 2024", unit: "semester", current: true,
    caseload: 120, onTrack: 103, plans: [66, 1, 12, 0, 0, 41], answered: [5, 15],
    grades: [{ onTrack: 27, avg: 44 }, { onTrack: 27, avg: 65 }, { onTrack: 23, avg: 69 }, { onTrack: 26, avg: 80 }], overallAvg: 64,
    careerReports: 87, academicPlans: 78, resumes: 35, seniorsWithPlan: 26, seniorsApplying: 27,
    reviewed: 15, approved: 0, pending: 10, announcements: 10, flags: 17, atRisk: 6, turnaround: 2.1,
    engagement: [7293, 852, 1101, 1246, 410],
  },
  {
    key: "spring-2023", label: "Spring 2023", range: "Jan – Jun 2023", rangeLong: "January – June 2023", year: "2022–2023", issued: "Jun 16, 2023", unit: "semester", current: false,
    caseload: 120, onTrack: 97, plans: [58, 2, 11, 1, 0, 48], answered: [4, 14],
    grades: [{ onTrack: 25, avg: 51 }, { onTrack: 25, avg: 68 }, { onTrack: 22, avg: 72 }, { onTrack: 25, avg: 83 }], overallAvg: 69,
    careerReports: 80, academicPlans: 70, resumes: 30, seniorsWithPlan: 24, seniorsApplying: 25,
    reviewed: 22, approved: 18, pending: 4, announcements: 12, flags: 21, atRisk: 8, turnaround: 2.8,
    engagement: [5120, 610, 860, 930, 290],
  },
  {
    key: "year-2022-23", label: "2022–23 school year", range: "Aug 2022 – Jun 2023", rangeLong: "August 2022 – June 2023", year: "2022–2023", issued: "Jun 23, 2023", unit: "year", current: false,
    caseload: 120, onTrack: 96, plans: [57, 2, 11, 1, 0, 49], answered: [9, 31],
    grades: [{ onTrack: 24, avg: 58 }, { onTrack: 25, avg: 70 }, { onTrack: 22, avg: 74 }, { onTrack: 25, avg: 85 }], overallAvg: 72,
    careerReports: 82, academicPlans: 71, resumes: 31, seniorsWithPlan: 24, seniorsApplying: 26,
    reviewed: 38, approved: 34, pending: 4, announcements: 21, flags: 23, atRisk: 9, turnaround: 3.1,
    engagement: [9480, 1130, 1590, 1720, 540],
  },
];

const SCHOOL_AVG_ON_TRACK = 71;
const pct = (n: number, of: number) => (of ? Math.round((n / of) * 100) : 0);
const fmt = (n: number) => n.toLocaleString("en-US");

/** Everything the page, its drills and the Principal report show for one
 *  period, derived from its raw figures. For Fall 2023 every string equals
 *  the Replit's. */
function buildView(p: PeriodData, school: string) {
  const onTrackPct = pct(p.onTrack, p.caseload);
  const withPlan = p.plans.slice(0, 5).reduce((a, n) => a + n, 0);
  const withPlanPct = pct(withPlan, p.caseload);
  const responseRatePct = pct(p.answered[0], p.answered[1]);
  const careerPct = pct(p.careerReports, p.caseload);
  const academicPct = pct(p.academicPlans, p.caseload);
  const resumePct = pct(p.resumes, 90);
  const seniorPct = pct(p.seniorsWithPlan, 30);
  const flagsPct = pct(p.flags, p.caseload);
  const [drops, sims, careers, colleges, posts] = p.engagement;
  const touchpoints = sims + careers + colleges;
  const t = p.turnaround.toFixed(1);
  const period = p.unit === "semester" ? "this semester" : "this year";
  return {
    ...p,
    onTrackPct, withPlan, withPlanPct, responseRatePct, careerPct, academicPct, resumePct, seniorPct, flagsPct, touchpoints,
    grades: p.grades.map((g, i) => ({ grade: 9 + i, onTrack: g.onTrack, total: 30, avg: g.avg })),
    pathways: PATHWAY_ORDER.map((label, i) => ({ label, count: p.plans[i] })),
    milestones: [
      { value: careerPct, label: "Career reports approved", note: `${p.careerReports} of ${p.caseload} students` },
      { value: academicPct, label: "Academic plans approved", note: `${p.academicPlans} of ${p.caseload} students` },
      { value: resumePct, label: "Résumés complete", note: `${p.resumes} of 90 in Grades 10-12` },
      { value: seniorPct, label: "Senior plan compliance", note: `${p.seniorsWithPlan} of 30 seniors with a plan`, chip: seniorPct >= 80 ? ("met" as const) : undefined },
    ] as { value: number; label: string; note: string; chip?: "met" }[],
    activity: [
      { value: String(p.reviewed), label: "Plans reviewed", note: p.pending ? `${p.pending} pending` : "none pending" },
      { value: `${p.answered[0]}/${p.answered[1]}`, label: "Questions answered", note: `${responseRatePct}%` },
      { value: String(p.announcements), label: "Announcements", note: "school-wide" },
      { value: String(p.flags), label: "Support flags", note: `${flagsPct}% of caseload` },
      { value: `${t} days`, label: "Review turnaround", note: "district standard 5" },
    ],
    engagement: [
      { value: drops, label: "Career drops" },
      { value: sims, label: "Simulations" },
      { value: careers, label: "Careers saved" },
      { value: colleges, label: "Colleges saved" },
      { value: posts, label: "Community posts" },
    ],
    asca: [
      { icon: BookOpen, title: "Academic", headline: `${academicPct}%`, headlineLabel: "approved 4-year plans", items: [`Planning for all ${p.caseload} students`, `${academicPct}% with an approved 4-year plan`, "Course selection and credit monitoring"], full: [`Academic planning supported for all ${p.caseload} students`, `${academicPct}% of students have approved 4-year academic plans`, "Course selection and credit-monitoring support delivered"] },
      { icon: Briefcase, title: "Career", headline: `${careerPct}%`, headlineLabel: "career reports complete", items: [`${careerPct}% career reports complete`, `${withPlanPct}% with a declared pathway`, "Simulations and assessments on Dreamari"], full: [`${careerPct}% career report completion rate across caseload`, `Career pathway declared for ${withPlanPct}% of students`, "Career simulations and assessments facilitated via Dreamari"] },
      { icon: Heart, title: "Social-emotional", headline: String(p.flags), headlineLabel: "students monitored", items: [`${p.flags} students monitored for support`, `${responseRatePct}% question response rate`, `${p.atRisk} at-risk students flagged early`], full: [`${p.flags} students identified and actively monitored for support`, `${responseRatePct}% student question response rate via Counselor Connect`, `${p.atRisk} at-risk students flagged for proactive intervention`] },
    ],
    // The Replit's eight notable achievements, its wording, this period's
    // figures (punctuation only changed: no em dashes).
    achievements: {
      senior: `Senior postsecondary plan rate of ${seniorPct}%, ${seniorPct >= 80 ? "meeting the district-mandated 80% benchmark ahead of the spring deadline" : "approaching the district-mandated 80% benchmark"}.`,
      onTrack: `Maintained a ${onTrackPct}% on-track rate across a caseload of ${p.caseload} students, well above the school average of ${SCHOOL_AVG_ON_TRACK}%.`,
      turnaround: `Delivered all plan reviews at an average of ${t} days, meeting the district's 5-day turnaround standard with room to spare.`,
      applying: `${p.seniorsApplying} of 30 seniors have active college or postsecondary applications underway, positioning ${school} for strong college-going outcomes.`,
      answered: `Achieved a ${responseRatePct}% Counselor Connect question-response rate, ensuring every student inquiry received a timely, professional reply.`,
      flagged: `${p.flags} students proactively identified for additional support. Early identification reduces at-risk escalation and supports equitable outcomes.`,
      activities: `Over ${fmt(drops)} career-exploration activities completed by students on the Dreamari platform, driven by counselor-assigned prompts and deadlines.`,
      touchpoints: `Career simulations, pathway selections, and college-saving activity contributed to ${fmt(touchpoints)} total student engagement touchpoints ${period}.`,
    },
    // The Principal / District Report's own six achievements and five-row
    // compliance table, as the Replit's report words them.
    reportAchievements: [
      `Maintained a ${onTrackPct}% on-track rate across a caseload of ${p.caseload} students, above the school average of ${SCHOOL_AVG_ON_TRACK}%.`,
      `Senior postsecondary plan rate of ${seniorPct}%: ${seniorPct >= 80 ? "meets" : "approaching"} the district 80% benchmark.`,
      `${p.seniorsApplying} of 30 seniors have active college or postsecondary applications underway.`,
      `Achieved a ${responseRatePct}% student question response rate, ensuring all inquiries received timely, professional replies.`,
      `Reviewed and processed all counseling submissions at an average turnaround of ${t} days vs. the district 5-day standard.`,
      `${p.flags} students proactively identified for additional support through early-intervention monitoring.`,
    ],
    reportCompliance: [
      { metric: "Postsecondary Plans on File", result: `${withPlanPct}%`, target: "≥ 80%", met: withPlanPct >= 80 },
      { metric: "Senior Plan Compliance", result: `${seniorPct}%`, target: "≥ 80%", met: seniorPct >= 80 },
      { metric: "Plan Review Turnaround", result: `${t} days avg.`, target: "≤ 5 days", met: p.turnaround <= 5 },
      { metric: "On-Track Rate", result: `${onTrackPct}%`, target: "≥ 70%", met: onTrackPct >= 70 },
      { metric: "Career Report Completion", result: `${careerPct}%`, target: "≥ 60%", met: careerPct >= 60 },
    ],
    figures: [
      { value: `${onTrackPct}%`, label: "On-track rate", note: `school average ${SCHOOL_AVG_ON_TRACK}%` },
      { value: `${seniorPct}%`, label: "Senior plan compliance", note: "district target 80%" },
      { value: t, unit: "days", label: "Plan review turnaround", note: "district standard 5 days" },
      { value: `${careerPct}%`, label: "Career report completion", note: "target 60%" },
    ],
  };
}
type ImpactView = ReturnType<typeof buildView>;
const MET = "var(--cd-green)";
const OPEN = "var(--cd-amber)";

export function MetChip({ met }: { met: boolean }) {
  return (
    <span className="inline-flex items-center gap-[4px] rounded-full px-[9px] py-[2px] text-[11px] font-extrabold" style={{ background: `color-mix(in srgb, ${met ? MET : OPEN} 16%, transparent)`, color: met ? MET : OPEN }}>
      {met ? <CheckCircle2 className="h-[11px] w-[11px]" aria-hidden /> : <AlertTriangle className="h-[11px] w-[11px]" aria-hidden />}{met ? "Met" : "In progress"}
    </span>
  );
}

/** The Dreamari mark and wordmark in ink, for the masthead: every line
 *  flush right, so the block reads as one right-aligned unit opposite the
 *  school's crest (direct feedback, 27 Sept 2026: "Dreamari should be right
 *  aligned"). */
function DreamariLockup() {
  return (
    <span className="flex flex-col items-end gap-[5px] text-right">
      <span style={{ fontFamily: SANS, fontSize: 7.5, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ink-faint)" }}>Data from</span>
      <span className="flex items-center gap-[7px]">
        <span aria-hidden className="h-[13px] w-[23px] flex-none" style={{ background: "var(--ink)", maskImage: "url(/images/app/logo-mark.svg)", WebkitMaskImage: "url(/images/app/logo-mark.svg)", maskSize: "contain", WebkitMaskSize: "contain", maskRepeat: "no-repeat", WebkitMaskRepeat: "no-repeat", maskPosition: "right center", WebkitMaskPosition: "right center" }} />
        <span style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 800, lineHeight: 1, letterSpacing: "0.02em", color: "var(--ink)" }}>DREAMARI</span>
      </span>
      <span style={{ fontFamily: SANS, fontSize: 8, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--ink-faint)" }}>Career readiness platform</span>
    </span>
  );
}

/** The Replit's Principal / District Report as a printed document (27 Sept
 *  2026, direct instruction: "make the principal report much more
 *  editorially composed, designed, beautifully formatted, add a school x
 *  Dreamari branding", and "Make sure the principal report has all the
 *  content that was in the replit dont leave anything out, just present it
 *  better"). Every line of the Replit's report is here except the modal's own
 *  instruction to the counselor ("A presentable summary ... Review and
 *  export or copy before sharing"), which the principal does not need
 *  (direct feedback, 27 Sept 2026: "This is for the counselor to share
 *  with the principal they know what it is"): the title, the summary header (the report's kicker, the counselor and
 *  role, the school and reporting period), the six notable achievements
 *  and the five-row District Compliance Summary with Result, Target and
 *  Status. The Replit's Print Report and Done are the viewer's Print and
 *  close. Presented as a US Letter page: a co-branded masthead (the
 *  school's crest and name, a hairline cross, Dreamari's mark), a serif
 *  headline, the four figures a principal reads first, numbered
 *  achievements and a ruled table. */
function PrincipalReportPage({ v, who, role, school, photo, time, pageRef }: { v: ImpactView; who: string; role: string; school: string; photo: string; time: TimeSummary; pageRef: React.Ref<HTMLDivElement> }) {
  const kicker = { fontFamily: SANS, fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase" as const };
  const section = (n: string, title: string) => (
    <div className="flex items-baseline gap-[12px] border-b pb-[8px]" style={{ borderColor: "var(--ink)" }}>
      <span style={{ ...kicker, color: BRAND }}>{n}</span>
      <h2 style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 600, letterSpacing: "-0.005em", color: "var(--ink)" }}>{title}</h2>
    </div>
  );
  const figures = v.figures;
  return (
    <div ref={pageRef} className="flex flex-col">
    <div data-doc-page className="flex flex-col" style={{ ...PAPER_VARS, width: PAGE_W, minHeight: PAGE_H, padding: "44px 72px 36px", background: "var(--paper)", color: "var(--ink)", breakAfter: "page" }}>
      {/* Masthead. The school owns this report, so its crest and office
         lead; Dreamari sits on the right as where the figures come from,
         which is what it actually is to a principal (direct feedback,
         27 Sept 2026: "Dont just include a letterhead etc because i said.
         Make sure it makes sense for a report to be shared with the
         principal"). */}
      <header className="flex items-center justify-between gap-[20px] border-b pb-[16px]" style={{ borderColor: "var(--rule)" }}>
        <span className="flex items-center gap-[12px]">
          <Crest size={40} />
          <span className="flex flex-col gap-[3px]">
            <span style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 600, lineHeight: 1.1, color: "var(--ink)" }}>{school}</span>
            <span style={{ ...kicker, fontSize: 8, color: BRAND }}>Office of School Counseling</span>
          </span>
        </span>
        <DreamariLockup />
      </header>

      {/* What this is, who it is for, who prepared it and for when: the
         memo block a report handed to a principal opens with. The Replit's
         summary header (kicker, counselor and role, school and period) is
         all here. */}
      <section className="mt-[24px] flex flex-col gap-[8px]">
        <span className="flex items-center justify-between gap-[16px]">
          <span style={{ ...kicker, color: BRAND }}>Principal / District Report</span>
          <span style={{ ...kicker, color: "var(--ink-faint)" }}>Academic Year {v.year}</span>
        </span>
        <h1 style={{ fontFamily: SERIF, fontSize: 36, fontWeight: 600, lineHeight: 1.05, letterSpacing: "-0.015em" }}>Counselor Impact Summary</h1>
      </section>
      <dl className="mt-[16px] grid grid-cols-[1.35fr_1fr_1fr_0.8fr] border-y" style={{ borderColor: "var(--rule)" }}>
        <div className="flex items-center gap-[10px] py-[12px] pr-[14px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo} alt="" className="size-[40px] flex-none rounded-full object-cover" />
          <span className="flex min-w-0 flex-col gap-[2px]">
            <dt style={{ ...kicker, fontSize: 7.5, color: "var(--ink-faint)" }}>Prepared by</dt>
            <dd style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 600, lineHeight: 1.2, color: "var(--ink)" }}>{who}, {role}</dd>
          </span>
        </div>
        {[
          ["Prepared for", `Principal, ${school}`],
          ["Reporting period", v.range],
          // Issued just after the period it reports on closes, not today:
          // a 2023-24 report dated this week reads as an error.
          ["Issued", v.issued],
        ].map(([k, v]) => (
          <div key={k} className="flex flex-col justify-center gap-[2px] py-[12px] pl-[14px]" style={{ borderLeft: "1px solid var(--rule)" }}>
            <dt style={{ ...kicker, fontSize: 7.5, color: "var(--ink-faint)" }}>{k}</dt>
            <dd style={{ fontFamily: SERIF, fontSize: 13.5, fontWeight: 600, lineHeight: 1.25, color: "var(--ink)" }}>{v}</dd>
          </div>
        ))}
      </dl>

      {/* The figures a principal reads first, from the compliance table. */}
      <section className="mt-[18px] grid grid-cols-4 border-b" style={{ borderColor: "var(--rule)" }}>
        {figures.map((f, i) => (
          <div key={f.label} className="flex flex-col gap-[3px] py-[12px]" style={{ paddingLeft: i === 0 ? 0 : 18, borderLeft: i === 0 ? undefined : "1px solid var(--rule)" }}>
            <span className="flex items-baseline gap-[4px]">
              <span style={{ fontFamily: SERIF, fontSize: 34, fontWeight: 600, lineHeight: 1, letterSpacing: "-0.02em", color: "var(--ink)" }}>{f.value}</span>
              {f.unit && <span style={{ fontFamily: SERIF, fontSize: 15, color: "var(--ink-soft)" }}>{f.unit}</span>}
            </span>
            <span style={{ fontFamily: SANS, fontSize: 10.5, fontWeight: 700, color: "var(--ink)" }}>{f.label}</span>
            <span style={{ fontFamily: SANS, fontSize: 9.5, color: "var(--ink-faint)" }}>{f.note}</span>
          </div>
        ))}
      </section>

      <section className="mt-[22px] flex flex-col gap-[12px]">
        {section("01", "Notable Achievements")}
        <ol className="grid grid-cols-2 gap-x-[32px] gap-y-[10px]">
          {v.reportAchievements.map((a, i) => (
            <li key={a} className="flex gap-[12px]">
              <span style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 600, lineHeight: 1, color: BRAND, minWidth: 26 }}>{String(i + 1).padStart(2, "0")}</span>
              <span style={{ fontFamily: SERIF, fontSize: 13, lineHeight: 1.5, color: "var(--ink)" }}>{a}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-[22px] flex flex-col gap-[8px]">
        {section("02", "District Compliance Summary")}
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {["Metric", "Result", "Target", "Status"].map((h, i) => (
                <th key={h} className="pt-[4px] pb-[8px]" style={{ ...kicker, fontSize: 8.5, color: "var(--ink-faint)", textAlign: i === 0 ? "left" : i === 3 ? "right" : "left" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {v.reportCompliance.map((r) => (
              <tr key={r.metric} style={{ borderTop: "1px solid var(--rule)" }}>
                <td className="py-[8px]" style={{ fontFamily: SERIF, fontSize: 14, color: "var(--ink)" }}>{r.metric}</td>
                <td className="py-[8px]" style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{r.result}</td>
                <td className="py-[8px]" style={{ fontFamily: SANS, fontSize: 11.5, color: "var(--ink-soft)" }}>{r.target}</td>
                <td className="py-[8px] text-right">
                  <span className="inline-flex items-center gap-[6px]" style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: r.met ? "#157A4A" : "#A35A00" }}>
                    {r.met ? "✓ Met" : "⚠ In Progress"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* One line of small print: where the figures come from, and the
         handling note (direct feedback, 27 Sept 2026: "The footer notes can
         be better designed. Source doesnt have to be this big"). */}
      <footer className="mt-auto flex items-center justify-between gap-[24px] border-t pt-[10px] whitespace-nowrap" style={{ borderColor: "var(--rule)", fontFamily: SANS, fontSize: 8.5, letterSpacing: "0.02em", color: "var(--ink-faint)" }}>
        <span><b style={{ fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginRight: 6 }}>Source</b>{school} counseling records and student activity on Dreamari</span>
        <span>Confidential · Page 1 of 2</span>
      </footer>
    </div>
    {/* The gap between the two sheets on screen; print breaks the page instead. */}
    <div data-print-hide aria-hidden style={{ height: 24, background: "#1c1d20" }} />
    <ReportDetailPage v={v} school={school} time={time} />
    </div>
  );
}
/** Page 2 of the Principal report: every section of My Impact that page 1
 *  does not already carry, so the export is the whole picture in one
 *  document (2 Oct 2026, direct instruction: "make sure the EXPORT has
 *  everything together. in a multipage document"). Page 1 stays the
 *  Replit's own report; this page adds caseload, readiness, the
 *  counselor's work, student activity, ASCA alignment and use of time. */
function ReportDetailPage({ v, school, time }: { v: ImpactView; school: string; time: TimeSummary }) {
  const kicker = { fontFamily: SANS, fontSize: 8.5, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase" as const };
  const section = (n: string, title: string, unit?: string) => (
    <div className="flex items-baseline gap-[12px] border-b pb-[6px]" style={{ borderColor: "var(--ink)" }}>
      <span style={{ ...kicker, color: BRAND }}>{n}</span>
      <h2 style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 600, color: "var(--ink)" }}>{title}</h2>
      {unit && <span className="ml-auto" style={{ ...kicker, fontSize: 7.5, color: "var(--ink-faint)" }}>{unit}</span>}
    </div>
  );
  const row = (label: string, value: string, note?: string, bar?: number) => (
    <li key={label} className="flex flex-col gap-[2px] py-[3px]" style={{ borderTop: "1px solid var(--rule)" }}>
      <span className="flex items-baseline justify-between gap-[12px]">
        <span style={{ fontFamily: SERIF, fontSize: 12.5, color: "var(--ink)" }}>{label}{note && <span style={{ fontFamily: SANS, fontSize: 9.5, color: "var(--ink-faint)", marginLeft: 6 }}>{note}</span>}</span>
        <span style={{ fontFamily: SERIF, fontSize: 12.5, fontWeight: 600, color: "var(--ink)", whiteSpace: "nowrap" }}>{value}</span>
      </span>
      {typeof bar === "number" && (
        <span className="block h-[4px] w-full rounded-full" style={{ background: "var(--paper-sunken)" }}>
          <span className="block h-full rounded-full" style={{ width: `${Math.max(0, Math.min(100, bar))}%`, background: BRAND }} />
        </span>
      )}
    </li>
  );
  const activityMax = Math.max(...v.engagement.map((e) => e.value), 1);
  return (
    <div data-doc-page className="flex flex-col" style={{ ...PAPER_VARS, width: PAGE_W, minHeight: PAGE_H, padding: "40px 72px 32px", background: "var(--paper)", color: "var(--ink)" }}>
      <header className="flex items-center justify-between gap-[20px] border-b pb-[12px]" style={{ borderColor: "var(--rule)" }}>
        <span style={{ ...kicker, color: BRAND }}>Counselor Impact Summary · Supporting detail</span>
        <span style={{ ...kicker, color: "var(--ink-faint)" }}>{v.label} · {v.range}</span>
      </header>

      <div className="mt-[11px] grid grid-cols-2 gap-x-[32px] gap-y-[11px]">
        <section className="flex flex-col gap-[6px]">
          {section("03", "Caseload", `${v.caseload} students`)}
          <span style={{ ...kicker, fontSize: 7.5, color: "var(--ink-faint)", marginTop: 4 }}>Postsecondary plans · {v.withPlan} of {v.caseload} declared</span>
          <ul>{v.pathways.map((p) => row(p.label, String(p.count), `${pct(p.count, v.caseload)}%`))}</ul>
          <span style={{ ...kicker, fontSize: 7.5, color: "var(--ink-faint)", marginTop: 6 }}>By grade · {v.overallAvg}% average completion</span>
          <ul>{v.grades.map((g) => row(`Grade ${g.grade}`, `${g.avg}% complete`, `${g.onTrack} of ${g.total} on track`))}</ul>
        </section>

        <section className="flex flex-col gap-[6px]">
          {section("04", "Readiness milestones")}
          <ul>
            {v.milestones.map((m) => row(m.label, `${m.value}%`, m.note, m.value))}
            {row("Seniors applying", `${pct(v.seniorsApplying, 30)}%`, `${v.seniorsApplying} of 30`, pct(v.seniorsApplying, 30))}
          </ul>
          <div className="mt-[8px] flex flex-col gap-[6px]">
            {section("05", "Counselor activity")}
            <ul>
              {row("Questions answered", `${v.answered[0]} of ${v.answered[1]}`, `${v.responseRatePct}% response rate`)}
              {row("Plans reviewed", String(v.reviewed), `${v.pending} waiting`)}
              {row("Review turnaround", `${v.turnaround.toFixed(1)} days`, "district standard 5 days")}
              {row("Announcements", String(v.announcements), "school-wide")}
              {row("Support flags", String(v.flags), `${v.flagsPct}% of caseload · ${v.atRisk} at risk, flagged early`)}
            </ul>
          </div>
        </section>
      </div>

      <section className="mt-[11px] flex flex-col gap-[6px]">
        {section("06", "Student activity on Dreamari", `${fmt(v.touchpoints)} engagement touchpoints`)}
        <div className="grid grid-cols-[1fr_1.1fr] gap-x-[32px]">
          <ul>{v.engagement.map((e, i) => row(ACTIVITY_LABELS[i], fmt(e.value), undefined, (e.value / activityMax) * 100))}</ul>
          <div className="flex flex-col gap-[8px] pt-[6px]" style={{ fontFamily: SERIF, fontSize: 12, lineHeight: 1.5, color: "var(--ink)" }}>
            <p>{v.achievements.activities}</p>
            <p>{v.achievements.touchpoints}</p>
          </div>
        </div>
      </section>

      <section className="mt-[11px] flex flex-col gap-[8px]">
        {section("07", "ASCA alignment", "National Model, 4th Ed.")}
        <div className="grid grid-cols-3 gap-x-[24px]">
          {v.asca.map((c) => (
            <div key={c.title} className="flex flex-col gap-[4px]">
              <span style={{ fontFamily: SERIF, fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{c.title}</span>
              <ul className="flex flex-col gap-[3px]">
                {c.full.map((it) => <li key={it} style={{ fontFamily: SANS, fontSize: 9.5, lineHeight: 1.45, color: "var(--ink-soft)" }}>{it}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-[11px] flex flex-col gap-[6px]">
        {section("08", "Use of time", "last 7 days")}
        <span className="flex items-baseline gap-[10px]">
          <span style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 600, lineHeight: 1, color: "var(--ink)" }}>{time.studentPct}%</span>
          <span style={{ fontFamily: SANS, fontSize: 10, color: "var(--ink-soft)" }}>of time with or for students · ASCA recommends at least {ASCA_TARGET_PCT}%</span>
        </span>
        <ul className="grid grid-cols-3 gap-x-[24px]">
          {(["direct", "indirect", "support"] as const).map((k) => row(TIME_KIND_LABEL[k], hoursLabel(time.minutes[k])))}
        </ul>
      </section>

      {/* The Replit report's closing statement (v1's My Impact footer), kept
         so nothing Maisha's page said is lost. */}
      <p className="mt-auto pt-[8px]" style={{ fontFamily: SANS, fontSize: 9, lineHeight: 1.5, color: "var(--ink-soft)" }}>
        This report reflects Dreamari platform data and counselor activity from {v.rangeLong}. All student metrics are aggregated and anonymized in distribution. Prepared for administrative review in accordance with ASCA National Model (4th Edition) program accountability standards. All engagement activity was generated by students in this caseload through the Dreamari platform during this reporting period.
      </p>
      <footer className="mt-[10px] flex items-center justify-between gap-[24px] border-t pt-[10px] whitespace-nowrap" style={{ borderColor: "var(--rule)", fontFamily: SANS, fontSize: 8.5, letterSpacing: "0.02em", color: "var(--ink-faint)" }}>
        <span><b style={{ fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginRight: 6 }}>Source</b>{school} counseling records and student activity on Dreamari</span>
        <span>Confidential · Page 2 of 2</span>
      </footer>
    </div>
  );
}


/** Opens the report at print size in the dashboard's full-screen document
 *  viewer, with zoom and Print. */
function PrincipalReport({ v, who, role, school, time, onClose }: { v: ImpactView; who: string; role: string; school: string; time: TimeSummary; onClose: () => void }) {
  const pageRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  // Share (27 Sept 2026, direct instruction: "lets add a share option in
  // the principal report preview too"): an email to the principal with the
  // report's headline figures and achievements in the body, or the same
  // text copied. The PDF itself comes from Print or save PDF.
  const subject = `Counselor Impact Summary: ${who}, ${school}, ${v.range}`;
  const summary = [
    `Counselor Impact Summary · Academic Year ${v.year}`,
    `${who}, ${role} · ${school} · Reporting Period: ${v.range}`,
    ``,
    `Notable Achievements`,
    ...v.reportAchievements.map((a, i) => `${i + 1}. ${a}`),
    ``,
    `District Compliance Summary`,
    ...v.reportCompliance.map((r) => `${r.metric}: ${r.result} (target ${r.target}) · ${r.met ? "Met" : "In Progress"}`),
    ``,
    `Caseload: ${v.caseload} students · ${v.withPlan} with a postsecondary plan`,
    ...v.pathways.map((p) => `${p.label}: ${p.count}`),
    ...v.grades.map((g) => `Grade ${g.grade}: ${g.onTrack} of ${g.total} on track · ${g.avg}% average completion`),
    ``,
    `Readiness milestones`,
    ...v.milestones.map((m) => `${m.label}: ${m.value}% (${m.note})`),
    `Seniors applying: ${v.seniorsApplying} of 30`,
    ``,
    `Counselor activity`,
    `Questions answered: ${v.answered[0]} of ${v.answered[1]} (${v.responseRatePct}%)`,
    `Plans reviewed: ${v.reviewed} · ${v.pending} waiting · turnaround ${v.turnaround.toFixed(1)} days`,
    `Announcements: ${v.announcements} · Support flags: ${v.flags} (${v.atRisk} at risk)`,
    ``,
    `Student activity on Dreamari`,
    ...v.engagement.map((e, i) => `${ACTIVITY_LABELS[i]}: ${fmt(e.value)}`),
    ``,
    `ASCA alignment`,
    ...v.asca.map((c) => `${c.title}: ${c.full.join("; ")}`),
    `Use of time, last 7 days: ${time.studentPct}% with or for students (ASCA ${ASCA_TARGET_PCT}%)`,
  ].join("\n");
  const share = [
    { label: "Email to principal", icon: Mail, onClick: () => { window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(summary)}`; } },
    { label: copied ? "Summary copied" : "Copy summary", icon: Copy, onClick: () => { navigator.clipboard?.writeText(summary).then(() => { setCopied(true); window.setTimeout(() => setCopied(false), 2000); }).catch(() => {}); } },
  ];
  return (
    <FullScreenDocument open title={`Principal / District Report · ${who}`} onClose={onClose} onPrint={() => printDocumentPage(pageRef.current, `Principal report, ${who}`)} share={share}>
      <PrincipalReportPage v={v} who={who} role={role} school={school} photo={seededPick(who, COUNSELOR_HEADSHOTS)} time={time} pageRef={pageRef} />
    </FullScreenDocument>
  );
}

/** The semester each period is compared with. Only Fall 2023 has an
 *  earlier semester in the demo history. */
const PREVIOUS: Partial<Record<PeriodData["key"], PeriodData["key"]>> = { "fall-2023": "spring-2023" };
type ImpactTab = "achievements" | "targets" | "work" | "readiness" | "activity" | "asca";
const TABS: { key: ImpactTab; label: string }[] = [
  { key: "achievements", label: "Achievements" },
  { key: "targets", label: "Targets" },
  { key: "work", label: "Your work" },
  { key: "readiness", label: "Caseload and readiness" },
  { key: "activity", label: "Student activity" },
  { key: "asca", label: "ASCA and time" },
];
const ACTIVITY_SHORT = ["Explorations", "Simulations", "Careers saved", "Colleges saved", "Posts"];
const ACTIVITY_LABELS = ["Career explorations", "Career simulations", "Careers saved", "Colleges saved", "Community posts"];

/** Amber within 10 points of the target, red beyond it, nothing when met. */
function bandColor(gap: number): string | undefined {
  if (gap <= 0) return undefined;
  return gap <= 10 ? "var(--cd-amber)" : "var(--cd-red)";
}

type TargetRowData = {
  key: string;
  label: string;
  note: string;
  value: string;
  /** where the value and the ticks sit, as % of the bar */
  fill: number;
  target: number;
  avg?: number;
  /** how far short of the target, in points (<= 0 when met) */
  gap: number;
  /** the margin above target, used only to order the rows */
  margin: number;
  delta?: string;
  open: () => void;
};

/** A half-circle gauge: the arc fills to the value, the solid tick is the
 *  target, the dashed tick a comparator (the school average). A gauge,
 *  not a bar, because each of these is one reading against one line. */
function Gauge({ pct, target, avg, color, children }: { pct: number; target: number; avg?: number; color: string; children: React.ReactNode }) {
  const reduce = useReducedMotion();
  const r = 50;
  const cx = 64;
  const cy = 62;
  const at = (p: number, rad = r) => {
    const a = Math.PI * (1 - Math.max(0, Math.min(100, p)) / 100);
    return [cx + rad * Math.cos(a), cy - rad * Math.sin(a)] as const;
  };
  const [x0, y0] = at(0);
  const [x1, y1] = at(100);
  const arc = `M ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1}`;
  const tick = (p: number) => { const [ax, ay] = at(p, r - 10); const [bx, by] = at(p, r + 10); return { x1: ax, y1: ay, x2: bx, y2: by }; };
  return (
    <span className="relative block w-full max-w-[150px]" aria-hidden>
      <svg viewBox="0 0 128 70" className="block w-full overflow-visible">
        <path d={arc} fill="none" stroke="color-mix(in srgb, var(--foreground) 10%, transparent)" strokeWidth="11" strokeLinecap="round" />
        <motion.path d={arc} fill="none" stroke={color} strokeWidth="11" strokeLinecap="round" pathLength={100} initial={reduce ? false : { strokeDasharray: "0 100" }} animate={{ strokeDasharray: `${Math.max(0.5, Math.min(100, pct))} 100` }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }} style={{ filter: `drop-shadow(0 0 4px color-mix(in srgb, ${color} 45%, transparent))` }} />
        {typeof avg === "number" && <line {...tick(avg)} stroke="color-mix(in srgb, var(--foreground) 50%, transparent)" strokeWidth="2" strokeDasharray="2 2" />}
        <line {...tick(target)} stroke="var(--foreground)" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <span className="absolute inset-x-0 bottom-[2px] flex flex-col items-center">{children}</span>
    </span>
  );
}

/** Done against waiting, as one donut. The middle says what is waiting. */
function DoneDonut({ done, waiting, label, onOpen }: { done: number; waiting: number; label: string; onOpen: () => void }) {
  return (
    <button type="button" onClick={onOpen} aria-label={`${label}: ${done} done, ${waiting} waiting`} className="dm-quiet group flex cursor-pointer flex-col items-center gap-[8px] rounded-[var(--radius-md)] px-[6px] py-[8px]">
      <SegmentedRing segments={[{ value: done, color: PRIMARY }, { value: waiting, color: "var(--cd-amber)" }]} size={112} stroke={12}>
        <span className="flex flex-col items-center leading-none">
          <span className="text-[22px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{waiting}</span>
          <span className="text-[10.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>waiting</span>
        </span>
      </SegmentedRing>
      <span className="flex flex-col items-center"><Label>{label}</Label><Note>{done} done of {done + waiting}</Note></span>
    </button>
  );
}

/** The caseload as one dot per student: who is flagged, and who of them is
 *  at risk. "17 of 120" reads as people, not as a percentage. */
function Waffle({ total, flagged, atRisk }: { total: number; flagged: number; atRisk: number }) {
  return (
    <span className="grid w-full max-w-[260px] grid-cols-[repeat(15,minmax(0,1fr))] gap-[4px]" aria-hidden>
      {Array.from({ length: total }, (_, i) => {
        const c = i < atRisk ? "var(--cd-red)" : i < flagged ? "var(--cd-amber)" : "color-mix(in srgb, var(--foreground) 12%, transparent)";
        return <span key={i} className="aspect-square rounded-full" style={{ background: c }} />;
      })}
    </span>
  );
}

function Legend({ items }: { items: { label: string; color: string; dashed?: boolean; tick?: boolean }[] }) {
  return (
    <span className="flex flex-wrap items-center gap-x-[16px] gap-y-[4px] text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
      {items.map((it) => (
        <span key={it.label} className="flex items-center gap-[6px]">
          {it.tick ? <span aria-hidden className={`h-[12px] w-0 ${it.dashed ? "border-l-2 border-dashed" : "border-l-[2.5px]"}`} style={{ borderColor: it.color }} /> : <span aria-hidden className="size-[8px] rounded-full" style={{ background: it.color }} />}
          {it.label}
        </span>
      ))}
    </span>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <span className="text-[13px] font-bold" style={{ color: "var(--foreground)" }}>{children}</span>;
}
function Note({ children, dot }: { children: React.ReactNode; dot?: string }) {
  return (
    <span className="flex items-center gap-[6px] text-[11.5px] font-semibold" style={{ color: dot ? "var(--foreground)" : "var(--muted-foreground)" }}>
      {dot && <span aria-hidden className="size-[7px] flex-none rounded-full" style={{ background: dot }} />}
      {children}
    </span>
  );
}

export function CounselorImpact() {
  const account = useSyncExternalStore(subscribeCounselorAccount, counselorAccountSnapshot, serverCounselorAccountSnapshot);
  const who = account.name || "Sarah Chen";
  const role = account.role || "School Counselor";
  const school = account.school || DEMO_SCHOOL;
  const router = useRouter();
  const { setStatusFilter, setPlanFilter, setGradeFilter } = useCounselorFilters();
  const [report, setReport] = useState(false);
  const [drill, setDrill] = useState<Drill | null>(null);
  const [periodKey, setPeriodKey] = useState<PeriodData["key"]>("fall-2023");
  const [tab, setTab] = useState<ImpactTab>("achievements");
  const timeEntries = useTimeLog();
  const timeSum = useMemo(() => summarize(timeEntries), [timeEntries]);
  const v = useMemo(() => buildView(PERIODS.find((p) => p.key === periodKey)!, school), [periodKey, school]);
  const prevKey = PREVIOUS[periodKey];
  const prev = useMemo(() => (prevKey ? buildView(PERIODS.find((p) => p.key === prevKey)!, school) : null), [prevKey, school]);
  // The Replit's own 120 students: in the current period every list in a
  // drill counts the same students its number does. Earlier periods have
  // no student-level history here, so their drills show the breakdown
  // without a list.
  const roster = useMemo(() => getRoster(), []);
  const live = v.current;
  const ds = (s: CounselorStudent, note: string): DrillStudent => ({ id: s.id, name: s.name, grade: s.grade, avatarIndex: s.avatarIndex, note });
  const list = (items: DrillStudent[]) => (live ? items : undefined);
  const notOnTrack = roster.filter((s) => s.status !== "On Track");
  const flagged = roster.filter((s) => s.supportFlagReason);
  const seniors = roster.filter((s) => s.grade === 12);
  const applying = seniors.filter((s) => ["In Progress", "Completed", "Approved", "Pending Review"].includes(s.milestones.Applications));
  const go = (view: string, set?: () => void) => () => { set?.(); setDrill(null); router.push(`/counselor?view=${view}`); };
  const approvedByGrade = (key: MilestoneKey, grades: number[]) => grades.map((g) => {
    const gs = roster.filter((s) => s.grade === g);
    const n = gs.filter((s) => s.milestones[key] === "Approved" || s.milestones[key] === "Completed").length;
    return { label: `Grade ${g}`, value: `${n} of ${gs.length}`, pct: gs.length ? (n / gs.length) * 100 : 0 };
  });
  const sub = (s: string) => `${s} · ${v.label}`;
  const A = v.achievements;
  const waitingQuestions = v.answered[1] - v.answered[0];
  const activityTotal = v.engagement.reduce((a, e) => a + e.value, 0);
  const prevActivityTotal = prev ? prev.engagement.reduce((a, e) => a + e.value, 0) : 0;
  const activityGrowth = prev ? Math.round(((activityTotal - prevActivityTotal) / prevActivityTotal) * 100) : 0;

  const drills = {
    onTrack: (): Drill => ({ title: "On track", subtitle: sub(`${v.onTrackPct}% of the caseload · school average ${SCHOOL_AVG_ON_TRACK}%`), lead: A.onTrack, rowsLabel: "On track by grade", rows: v.grades.map((g) => ({ label: `Grade ${g.grade}`, value: `${g.onTrack} of ${g.total}`, pct: (g.onTrack / g.total) * 100 })), students: list(notOnTrack.map((s) => ds(s, attentionReason(s)))), studentsLabel: `${notOnTrack.length} not on track`, action: { label: "Open these students", onClick: go("students", () => setStatusFilter("At Risk")) } }),
    plans: (): Drill => ({ title: "Postsecondary plans on file", subtitle: sub(`${v.withPlan} of ${v.caseload} declared · target 80%`), rowsLabel: "By pathway", rows: v.pathways.map((p) => ({ label: p.label, value: String(p.count), pct: (p.count / v.caseload) * 100 })), students: list(roster.filter((s) => s.postsecondaryIntent === "Undecided").map((s) => ds(s, "Undecided"))), studentsLabel: `${v.pathways[5].count} undecided`, action: { label: "Open undecided students", onClick: go("students", () => setPlanFilter("Undecided")) } }),
    answered: (): Drill => ({ title: "Student questions", subtitle: sub(`${v.answered[0]} of ${v.answered[1]} answered`), lead: A.answered, items: live ? QUESTIONS.slice(0, 8).map((q) => `${q.name}: ${q.question}`) : undefined, itemsLabel: "Recent questions", action: { label: "Open Counselor Connect", onClick: go("connect") } }),
    senior: (): Drill => ({ title: "Seniors with a plan", subtitle: sub(`${v.seniorsWithPlan} of 30 · ${v.seniorPct}% · district target 80%`), lead: A.senior, students: list(seniors.filter((s) => s.postsecondaryIntent === "Undecided").map((s) => ds(s, "No plan declared yet"))), studentsLabel: "Seniors still without a plan", action: { label: "Open Grade 12", onClick: go("students", () => setGradeFilter(12)) } }),
    turnaround: (): Drill => ({ title: "Review turnaround", subtitle: sub(`${v.turnaround.toFixed(1)} days on average · standard 5 days`), lead: A.turnaround, action: { label: "Open Review Queue", onClick: go("review-queue") } }),
    reviews: (): Drill => ({ title: "Plan reviews", subtitle: sub(`${v.reviewed} reviewed · ${v.pending} waiting`), stats: [{ value: String(v.reviewed), label: "reviewed" }, { value: String(v.pending), label: "waiting for you" }], action: { label: "Open Review Queue", onClick: go("review-queue") } }),
    applying: (): Drill => ({ title: "Seniors applying", subtitle: sub(`${v.seniorsApplying} of 30`), lead: A.applying, students: list(seniors.filter((s) => !applying.includes(s)).map((s) => ds(s, `Applications ${s.milestones.Applications.toLowerCase()}`))), studentsLabel: "Not applying yet", action: { label: "Open Grade 12", onClick: go("students", () => setGradeFilter(12)) } }),
    flagged: (): Drill => ({ title: "Support flags", subtitle: sub(`${v.flags} students · ${v.flagsPct}% of caseload`), lead: A.flagged, stats: [{ value: String(v.flags), label: "monitored for support" }, { value: String(v.atRisk), label: "at risk, flagged early" }], students: list(flagged.map((s) => ds(s, s.supportFlagReason ?? ""))), studentsLabel: "Flagged students", action: { label: "Open Students", onClick: go("students") } }),
    activities: (): Drill => ({ title: "Student activity on Dreamari", subtitle: sub("this reporting period"), lead: `${A.activities} ${A.touchpoints}`, stats: [{ value: fmt(v.engagement[0].value), label: "career explorations" }, { value: fmt(v.touchpoints), label: "touchpoints: simulations, careers and colleges saved" }], rowsLabel: "By activity", rows: v.engagement.map((e, i) => ({ label: ACTIVITY_LABELS[i], value: fmt(e.value), pct: (e.value / v.engagement[0].value) * 100 })), action: { label: "Open Platform Engagement", onClick: go("engagement") } }),
    grade: (g: ImpactView["grades"][number]): Drill => ({ title: `Grade ${g.grade}`, subtitle: sub(`${g.onTrack} of ${g.total} on track · ${g.avg}% average completion`), rowsLabel: live ? "Checkpoints done" : undefined, rows: live ? curriculumForGrade(g.grade as 9 | 10 | 11 | 12).map((c) => ({ label: c.name, value: `${c.donePct}%`, pct: c.donePct })) : undefined, stats: live ? undefined : [{ value: `${g.onTrack}/${g.total}`, label: "on track" }, { value: `${g.avg}%`, label: "average completion" }], students: list(roster.filter((s) => s.grade === g.grade && s.status !== "On Track").map((s) => ds(s, attentionReason(s)))), studentsLabel: "Not on track", action: { label: `Open Grade ${g.grade} in the Milestone Tracker`, onClick: go("milestones", () => setGradeFilter(g.grade as 9 | 10 | 11 | 12)) } }),
    milestone: (m: ImpactView["milestones"][number]): Drill => {
      const key: MilestoneKey = m.label.startsWith("Career") ? "Career Report" : m.label.startsWith("Academic") ? "Academic Plan" : m.label.startsWith("Résumés") ? "Resume" : "Applications";
      const grades = key === "Resume" ? [10, 11, 12] : key === "Applications" ? [12] : [9, 10, 11, 12];
      return { title: m.label, subtitle: sub(`${m.value}% · ${m.note}`), rowsLabel: live ? "Done by grade" : undefined, rows: live ? approvedByGrade(key, grades) : undefined, stats: live ? undefined : [{ value: `${m.value}%`, label: m.label.toLowerCase() }, { value: m.note, label: "students" }], action: { label: "Open the Milestone Tracker", onClick: go("milestones") } };
    },
    announcements: (): Drill => ({ title: "Announcements", subtitle: sub(`${v.announcements} sent, school-wide`), items: live ? ANNOUNCEMENTS.map((a) => `${a.title} · ${a.read}% read`) : undefined, itemsLabel: "Sent", action: { label: "Open Counselor Connect", onClick: go("connect") } }),
    asca: (c: ImpactView["asca"][number]): Drill => ({ title: `${c.title} development`, subtitle: sub("ASCA National Model, 4th Ed."), stats: [{ value: c.headline, label: c.headlineLabel }], items: c.full, itemsLabel: "What the caseload shows", action: c.title === "Career" ? { label: "Open Career + College Insights", onClick: go("insights") } : c.title === "Academic" ? { label: "Open the Milestone Tracker", onClick: go("milestones") } : { label: "Open Students", onClick: go("students") } }),
  };
  const open = (d: Drill) => setDrill(d);

  // The scorecard: the five targets the Principal report judges, the one
  // furthest from its target first.
  const pts = (n: number) => `+${n} pts`;
  const targets: TargetRowData[] = ([
    { key: "plans", label: "Plans on file", note: `${v.withPlan} of ${v.caseload} students · target 80%`, value: `${v.withPlanPct}%`, fill: v.withPlanPct, target: 80, gap: 80 - v.withPlanPct, margin: v.withPlanPct - 80, delta: prev && v.withPlanPct > prev.withPlanPct ? pts(v.withPlanPct - prev.withPlanPct) : undefined, open: () => open(drills.plans()) },
    { key: "senior", label: "Seniors with a plan", note: `${v.seniorsWithPlan} of 30 · target 80%`, value: `${v.seniorPct}%`, fill: v.seniorPct, target: 80, gap: 80 - v.seniorPct, margin: v.seniorPct - 80, delta: prev && v.seniorPct > prev.seniorPct ? pts(v.seniorPct - prev.seniorPct) : undefined, open: () => open(drills.senior()) },
    { key: "career", label: "Career reports", note: `${v.careerReports} of ${v.caseload} done · target 60%`, value: `${v.careerPct}%`, fill: v.careerPct, target: 60, gap: 60 - v.careerPct, margin: v.careerPct - 60, delta: prev && v.careerPct > prev.careerPct ? pts(v.careerPct - prev.careerPct) : undefined, open: () => open(drills.milestone(v.milestones[0])) },
    { key: "ontrack", label: "On track", note: `target 70% · school ${SCHOOL_AVG_ON_TRACK}%`, value: `${v.onTrackPct}%`, fill: v.onTrackPct, target: 70, avg: SCHOOL_AVG_ON_TRACK, gap: 70 - v.onTrackPct, margin: v.onTrackPct - 70, delta: prev && v.onTrackPct > prev.onTrackPct ? pts(v.onTrackPct - prev.onTrackPct) : undefined, open: () => open(drills.onTrack()) },
    // Days, where lower is better: the bar runs 0 to 6 days, the tick is the
    // district's 5-day standard.
    { key: "turnaround", label: "Review turnaround", note: "standard 5 days", value: `${v.turnaround.toFixed(1)}d`, fill: (v.turnaround / 6) * 100, target: (5 / 6) * 100, gap: (v.turnaround - 5) * 20, margin: (5 - v.turnaround) * 20, delta: prev && v.turnaround < prev.turnaround ? `${(prev.turnaround - v.turnaround).toFixed(1)}d faster` : undefined, open: () => open(drills.turnaround()) },
  ] as TargetRowData[]).sort((a, b) => a.margin - b.margin);
  const metCount = targets.filter((t) => t.gap <= 0).length;
  // Each sentence split around its one figure, so the figure can be lit in
  // place. Order and wording are the Replit's.
  const lit = (key: string, sentence: string, figure: string, openIt: () => void) => {
    const i = sentence.indexOf(figure);
    return i < 0 ? { key, before: sentence, figure: "", after: "", open: openIt } : { key, before: sentence.slice(0, i), figure, after: sentence.slice(i + figure.length), open: openIt };
  };
  const achievementItems = [
    lit("senior", A.senior, `${v.seniorPct}%`, () => open(drills.senior())),
    lit("onTrack", A.onTrack, `${v.onTrackPct}%`, () => open(drills.onTrack())),
    lit("turnaround", A.turnaround, `${v.turnaround.toFixed(1)} days`, () => open(drills.turnaround())),
    lit("applying", A.applying, `${v.seniorsApplying} of 30`, () => open(drills.applying())),
    lit("answered", A.answered, `${v.responseRatePct}%`, () => open(drills.answered())),
    lit("flagged", A.flagged, `${v.flags} students`, () => open(drills.flagged())),
    lit("activities", A.activities, fmt(v.engagement[0].value), () => open(drills.activities())),
    lit("touchpoints", A.touchpoints, fmt(v.touchpoints), () => open(drills.activities())),
  ];
  const PATH_RAMP = [...BLUE_5].reverse();
  const pathwayParts = [
    ...v.pathways.filter((p) => p.label !== "Undecided").sort((a, b) => b.count - a.count).map((p, i) => ({ ...p, color: PATH_RAMP[Math.min(i, PATH_RAMP.length - 1)] })),
    ...v.pathways.filter((p) => p.label === "Undecided").map((p) => ({ ...p, color: NEUTRAL_SLICE })),
  ];
  const milestoneRings = [
    { label: "Academic plans", note: `${v.academicPlans} of ${v.caseload}`, value: v.academicPct, open: () => open(drills.milestone(v.milestones[1])) },
    { label: "Résumés", note: `${v.resumes} of 90 in Grades 10 to 12`, value: v.resumePct, open: () => open(drills.milestone(v.milestones[2])) },
    { label: "Seniors applying", note: `${v.seniorsApplying} of 30`, value: pct(v.seniorsApplying, 30), open: () => open(drills.applying()) },
  ];
  const ASCA_NOTE: Record<string, string> = { Academic: "Course selection and credit monitoring", Career: "Simulations and assessments on Dreamari", "Social-emotional": "At-risk students flagged early" };
  const ASCA_ICON = { Academic: BookOpen, Career: Briefcase, "Social-emotional": Heart } as const;
  const onDark = { background: "rgba(9,10,20,0.55)", backdropFilter: "blur(10px)", borderColor: "rgba(255,255,255,0.18)", color: "#FFFFFF" } as const;

  return (
    // COMPONENT_INVENTORY row 62: this screen's own data is always seeded
    // (fixed reporting periods), so real emptiness only shows up once a
    // school genuinely has no caseload -- wrapped in SurfaceState both for
    // that real case and so `?state=loading|error&surface=62` can preview
    // the states this always-populated demo data never reaches on its own.
    <SurfaceState id={62} isEmpty={v.caseload === 0} onEmptyAction={() => router.push("/counselor?view=schools")}>
    <div className="flex flex-col gap-[var(--space-5)]">
      {/* Who, which caseload, which period, and the one thing to do with
         it: the report. The period lives here so it reads as part of the
         page's title, not a control floating over the cards. */}
      <section className="relative flex-none overflow-hidden rounded-[var(--radius-lg)] border print:hidden" style={{ borderColor: "var(--glass-border)" }}>
        <div className="absolute inset-0" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={COUNSELOR_COVER} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <span className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(12,16,35,0.9) 0%, rgba(12,16,35,0.6) 50%, rgba(12,16,35,0.25) 100%)" }} />
        </div>
        <div className="relative flex min-h-[148px] flex-wrap items-end justify-between gap-[var(--space-4)] p-[var(--space-4)] pt-[44px] sm:p-[var(--space-5)] sm:pt-[52px]">
          <div className="flex min-w-0 items-end gap-[var(--space-4)]">
            <CounselorHeadshot src={seededPick(who, COUNSELOR_HEADSHOTS)} />
            <div className="flex min-w-0 flex-col gap-[2px]" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
              <h2 className="truncate text-[18px] font-extrabold text-white" style={{ fontFamily: "var(--font-display)" }}>{who}</h2>
              <span className="truncate text-[13px] font-semibold" style={{ color: "rgba(255,255,255,0.85)" }}>{role} · {school} · {v.caseload} students</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-[8px]">
            <Listbox ariaLabel="Reporting period" value={periodKey} onChange={(k) => { setPeriodKey(k as PeriodData["key"]); setDrill(null); }} options={PERIODS.map((p) => ({ value: p.key, label: `${p.label} · ${p.range}` }))} className="dm-quiet flex h-9 min-w-[220px] cursor-pointer items-center justify-between gap-[8px] rounded-[var(--radius-sm)] border px-[12px] text-left text-[13px] font-semibold" style={onDark} />
            <button type="button" onClick={() => setReport(true)} className="dm-solid flex h-9 cursor-pointer items-center gap-[6px] rounded-[var(--radius-sm)] bg-[var(--primary)] px-[14px] text-[13px] font-bold text-[var(--primary-foreground)]"><FileBarChart className="h-[14px] w-[14px]" aria-hidden /> Principal report</button>
          </div>
        </div>
      </section>

      <Segmented ariaLabel="My Impact sections" value={tab} onChange={setTab} options={TABS} />

      {/* One section on screen at a time (2 Oct 2026, direct instruction:
         "organise into tabs"), after the six-card page had "so many things
         fighting for attention". The Principal report is where they all
         come together, on two pages. */}
      {/* Maisha's snapshot, back on the page as the first tab (2 Oct 2026:
         the user, "I think we're missing the notable achievements from the
         my impact. I believe that was important"; Maisha, 27 Sept: "Need
         this here for a snapshot"). The Replit's eight sentences in its
         words, each figure lit in place rather than printed twice, and each
         opening its breakdown. */}
      {tab === "achievements" && (
        <OverviewCard hero title="Notable achievements" unit={v.label}>
          <ol className="grid grid-cols-1 gap-x-[var(--space-5)] gap-y-[2px] md:grid-cols-2">
            {achievementItems.map((a, i) => (
              <li key={a.key}>
                <button type="button" onClick={a.open} className="dm-quiet group flex w-full cursor-pointer items-start gap-[14px] rounded-[var(--radius-md)] px-[8px] py-[10px] text-left">
                  <span className="min-w-[24px] pt-[1px] text-[15px] leading-[20px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--primary)" }}>{String(i + 1).padStart(2, "0")}</span>
                  <span className="flex-1 text-[13.5px] leading-[20px] font-medium" style={{ color: "var(--foreground)" }}>
                    {a.before}<strong className="font-extrabold" style={{ color: "var(--primary)" }}>{a.figure}</strong>{a.after}
                  </span>
                  <Go className="mt-[3px] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
                </button>
              </li>
            ))}
          </ol>
        </OverviewCard>
      )}

      {tab === "targets" && (
        <OverviewCard hero title="District targets" unit={prev ? `change since ${prev.label}` : v.label}>
          <Verdict band={metCount === targets.length ? "met" : metCount >= targets.length - 1 ? "near" : "missed"}>{metCount} of {targets.length} targets met</Verdict>
          <ul className="grid grid-cols-2 gap-x-[var(--space-3)] gap-y-[var(--space-4)] sm:grid-cols-3 lg:grid-cols-5">
            {targets.map((r) => {
              const alert = bandColor(r.gap);
              return (
                <li key={r.key}>
                  <button type="button" onClick={r.open} aria-label={`${r.label}: ${r.value}, ${r.note}`} className="dm-quiet group flex w-full cursor-pointer flex-col items-center gap-[8px] rounded-[var(--radius-md)] px-[6px] py-[10px] text-center">
                    <Gauge pct={r.fill} target={r.target} avg={r.avg} color={alert ?? PRIMARY}>
                      <span className="text-[22px] leading-[1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: alert ?? "var(--foreground)" }}>{r.value}</span>
                    </Gauge>
                    <span className="flex flex-col items-center gap-[2px]">
                      <Label>{r.label}</Label>
                      <Note>{r.note}</Note>
                      {r.delta && <span className="flex items-center gap-[3px] text-[11.5px] font-bold" style={{ color: MET }}><TrendingUp className="h-[11px] w-[11px]" aria-hidden />{r.delta}</span>}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <Legend items={[{ label: "Target", color: "var(--foreground)", tick: true }, { label: "School average", color: "color-mix(in srgb, var(--foreground) 50%, transparent)", tick: true, dashed: true }]} />
        </OverviewCard>
      )}

      {tab === "work" && (
        <OverviewCard title="Your work">
          {waitingQuestions > 0 ? <Verdict band="near">{waitingQuestions} questions waiting</Verdict> : <Verdict band="met">Every question answered</Verdict>}
          <div className="grid grid-cols-1 items-center gap-[var(--space-5)] md:grid-cols-[auto_auto_minmax(0,1fr)]">
            <DoneDonut done={v.answered[0]} waiting={waitingQuestions} label="Student questions" onOpen={() => open(drills.answered())} />
            <DoneDonut done={v.reviewed} waiting={v.pending} label="Plan reviews" onOpen={() => open(drills.reviews())} />
            <button type="button" onClick={() => open(drills.flagged())} aria-label={`Support flags: ${v.flags} students, ${v.atRisk} at risk`} className="dm-quiet group flex cursor-pointer flex-col gap-[10px] rounded-[var(--radius-md)] p-[8px] text-left md:border-l md:pl-[var(--space-5)]" style={{ borderColor: "var(--glass-border)" }}>
              <span className="flex items-baseline gap-[8px]"><span className="text-[22px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{v.flags}</span><Label>students flagged for support</Label></span>
              <Waffle total={v.caseload} flagged={v.flags} atRisk={v.atRisk} />
              <Legend items={[{ label: `${v.atRisk} at risk`, color: "var(--cd-red)" }, { label: `${v.flags - v.atRisk} other flags`, color: "var(--cd-amber)" }, { label: `${v.caseload - v.flags} no flag`, color: "color-mix(in srgb, var(--foreground) 22%, transparent)" }]} />
            </button>
          </div>
          <div className="flex items-center justify-between gap-[12px] border-t pt-[var(--space-3)]" style={{ borderColor: "var(--glass-border)" }}>
            <Legend items={[{ label: "Done", color: PRIMARY }, { label: "Waiting for you", color: "var(--cd-amber)" }]} />
            <button type="button" onClick={() => open(drills.announcements())} className="dm-quiet flex cursor-pointer items-center gap-[6px] rounded-full px-[8px] py-[4px] text-[12.5px] font-bold" style={{ color: "var(--foreground)" }}>{v.announcements} announcements sent<Go /></button>
          </div>
        </OverviewCard>
      )}

      {tab === "readiness" && (
        <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-2">
          {/* Maisha's "Postsecondary Plans by Pathway", back on the page: a
             caseload split six ways is parts of one whole, so a donut with its
             key, Undecided in neutral grey. */}
          <OverviewCard title="Plans by pathway" unit={`${v.withPlan} of ${v.caseload} declared`}>
            <div className="flex flex-1 flex-wrap items-center justify-center gap-[var(--space-5)]">
              <SegmentedRing segments={pathwayParts.map((p) => ({ value: p.count, color: p.color }))} size={140} stroke={15}>
                <span className="flex flex-col items-center leading-none">
                  <span className="text-[24px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{v.caseload}</span>
                  <span className="text-[11px] font-semibold" style={{ color: "var(--muted-foreground)" }}>students</span>
                </span>
              </SegmentedRing>
              <ul className="flex min-w-[190px] flex-1 flex-col">
                {pathwayParts.map((p) => (
                  <li key={p.label}>
                    <button type="button" onClick={() => open(drills.plans())} className="dm-quiet flex w-full cursor-pointer items-center justify-between gap-[10px] rounded-[var(--radius-sm)] px-[6px] py-[5px] text-left text-[13px]">
                      <span className="flex items-center gap-[8px] font-semibold" style={{ color: "var(--foreground)" }}><span aria-hidden className="size-[8px] flex-none rounded-full" style={{ background: p.color }} />{p.label}</span>
                      <span className="font-bold tabular-nums" style={{ color: "var(--foreground)" }}>{p.count}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </OverviewCard>
          <OverviewCard title="Progress by grade" unit={`${v.overallAvg}% average completion`}>
            <div className="grid flex-1 grid-cols-4 items-end gap-[var(--space-3)]">
              {v.grades.map((g) => (
                <button key={g.grade} type="button" onClick={() => open(drills.grade(g))} aria-label={`Grade ${g.grade}: ${g.avg}% average completion, ${g.onTrack} of ${g.total} on track`} className="dm-quiet group flex cursor-pointer flex-col items-center gap-[6px] rounded-[var(--radius-md)] px-[4px] py-[6px]">
                  <span className="text-[15px] font-extrabold tabular-nums" style={{ color: "var(--foreground)" }}>{g.avg}%</span>
                  <span className="relative flex h-[120px] w-full max-w-[44px] items-end overflow-hidden rounded-[10px]" style={{ background: "color-mix(in srgb, var(--foreground) 7%, transparent)" }}>
                    <motion.span className="w-full rounded-[10px]" initial={{ height: "0%" }} animate={{ height: `${g.avg}%` }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} style={{ background: `linear-gradient(180deg, ${PRIMARY}, color-mix(in srgb, ${PRIMARY} 30%, transparent))` }} />
                  </span>
                  <span className="flex flex-col items-center"><Label>Grade {g.grade}</Label><Note>{g.onTrack}/{g.total} on track</Note></span>
                </button>
              ))}
            </div>
          </OverviewCard>
          <div className="lg:col-span-2">
            <OverviewCard title="Readiness milestones">
              <div className="grid grid-cols-3 gap-[var(--space-3)]">
                {milestoneRings.map((m) => (
                  <button key={m.label} type="button" onClick={m.open} aria-label={`${m.label}: ${m.value}%, ${m.note}`} className="dm-quiet group flex cursor-pointer flex-col items-center gap-[8px] rounded-[var(--radius-md)] px-[4px] py-[8px] text-center">
                    <Ring pct={m.value} size={84} stroke={8} accent={PRIMARY}><span className="text-[18px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{m.value}%</span></Ring>
                    <span className="flex flex-col items-center gap-[1px] text-balance"><Label>{m.label}</Label><Note>{m.note}</Note></span>
                  </button>
                ))}
              </div>
            </OverviewCard>
          </div>
        </div>
      )}

      {tab === "activity" && (
        <OverviewCard title="Student activity" unit="by your caseload, on Dreamari" aside={<button type="button" onClick={() => open(drills.activities())} className="dm-quiet flex cursor-pointer items-center gap-[4px] rounded-full px-[8px] py-[4px] text-[12.5px] font-bold" style={{ color: "var(--foreground)" }}>Details<Go /></button>}>
          {prev && activityGrowth > 0 ? <Verdict band="met">Up {activityGrowth}% since {prev.label}</Verdict> : <Verdict band="met">{fmt(activityTotal)} actions this period</Verdict>}
          {/* One chart, every activity side by side, this semester against
             the last (direct feedback, 2 Oct 2026: "Student activity etc can
             be one graph with many bars with legends"). */}
          <BarChart
            groups={ACTIVITY_SHORT}
            series={[
              ...(prev ? [{ label: prev.label, accent: BLUE_5[1], values: prev.engagement.map((e) => e.value) }] : []),
              { label: v.label, accent: PRIMARY, values: v.engagement.map((e) => e.value) },
            ]}
            max={Math.ceil(Math.max(...v.engagement.map((e) => e.value), ...(prev ? prev.engagement.map((e) => e.value) : [0])) / 1000) * 1000}
            valueSuffix=""
            barStyle="solid"
            height={240}
          />
        </OverviewCard>
      )}

      {tab === "asca" && (
        <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-2">
          <TimeUse />
          <OverviewCard title="ASCA alignment" unit="National Model, 4th Ed.">
                      <ul className="-mx-[6px] flex flex-col">
              {v.asca.map((c) => {
                const Icon = ASCA_ICON[c.title as keyof typeof ASCA_ICON];
                return (
                  <li key={c.title}>
                    <button type="button" onClick={() => open(drills.asca(c))} className="dm-quiet group flex w-full cursor-pointer items-center gap-[12px] rounded-[var(--radius-sm)] px-[6px] py-[8px] text-left">
                      <span className="flex size-[32px] flex-none items-center justify-center rounded-full" style={{ background: "color-mix(in srgb, var(--primary) 16%, transparent)" }}><Icon className="h-[15px] w-[15px]" aria-hidden style={{ color: "var(--primary)" }} /></span>
                      <span className="flex min-w-0 flex-1 flex-col gap-[1px]"><Label>{c.title}</Label><Note>{ASCA_NOTE[c.title]}</Note></span>
                      <Go className="opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </OverviewCard>
        </div>
      )}
      <DrillPanel drill={drill} onClose={() => setDrill(null)} />
      {report && <PrincipalReport v={v} who={who} role={role} school={school} time={timeSum} onClose={() => setReport(false)} />}
    </div>
    </SurfaceState>
  );
}
