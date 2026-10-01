"use client";

// My Impact, rebuilt 27 Sept 2026 on Maisha's review of the tabbed version:
// "Am I able to see the principal report? So I can show during demos. It
// can be like the replit." / "Where is the notable achievements portion
// from the replit? Need this here for a snapshot." / "I don't think this
// needs so many tabs within it." / "Please utilize the same numbers as the
// replit because its standard per actual caseload of counselors so it'll
// make more sense for the demo." / "This section needs a lot more work and
// closer to replit."
//
// So: one page, every figure the Replit's own (the Fall 2023 period below, read off the
// live Replit's My Impact on 27 Sept 2026), with the Replit's clutter cut
// (direct instruction the same day: "WE CAN for sure clean this up and
// reduce copy and clutter"). Every data point stays; what went is the
// repetition: the District Compliance section (its three comparisons now
// sit on the numbers they judge, and the full table is the Principal
// report's), the sentences restating numbers, and the report footer.
// Activity and student engagement share one card. "Principal report"
// opens the Replit's Principal / District Report on screen, as a modal
// with Print, instead of going straight to the print dialog, so it can be
// shown in a demo. Postsecondary plans by pathway is computed from the
// reference roster, which is the Replit's own 120 students (79 with a
// declared plan, as the Replit states).

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Printer, Share2, FileBarChart, BookOpen, Briefcase, Heart, CheckCircle2, AlertTriangle, Mail, Copy, ChevronDown } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { attentionReason, getRoster, DEMO_SCHOOL, type CounselorStudent, type MilestoneKey, type PostsecondaryIntent } from "@/lib/counselorRoster";
import { counselorAccountSnapshot, serverCounselorAccountSnapshot, subscribeCounselorAccount } from "@/lib/counselorAccount";
import { OverviewCard } from "./overviewShared";
import { BRAND, Crest, FullScreenDocument, PAGE_H, PAGE_W, SANS, SERIF, printDocumentPage } from "./DocumentDesk";
import { PAPER_VARS } from "./DocumentPreview";
import { DrillPanel, DrillTile, type Drill, type DrillStudent } from "./Drill";
import { QUESTIONS, ANNOUNCEMENTS } from "./CounselorConnect";
import { useRouter } from "next/navigation";
import { SurfaceState } from "@/components/app/SurfaceState";
import { useCounselorFilters } from "../shell";
import { Go } from "../chips";
import { curriculumForGrade } from "@/lib/counselorCurriculum";
import { COUNSELOR_COVER, COUNSELOR_HEADSHOTS, CounselorHeadshot, seededPick } from "./MyImpact";
import { GLASS_INSET } from "../surfaces";
import { Listbox } from "@/components/app/Listbox";
import { TimeUse } from "./TimeUse";

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
      { value: seniorPct, label: "Senior plan compliance", note: `${p.seniorsApplying} of 30 applying · target 80%`, chip: seniorPct >= 80 ? ("met" as const) : undefined },
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

function Bar({ pct, muted }: { pct: number; muted?: boolean }) {
  const reduce = useReducedMotion();
  return (
    <span className="relative block h-[8px] w-full rounded-full" style={{ background: "color-mix(in srgb, var(--foreground) 8%, transparent)" }} aria-hidden>
      <motion.span className="absolute inset-y-0 left-0 rounded-full" initial={reduce ? false : { width: "0%" }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} style={{ background: muted ? "color-mix(in srgb, var(--foreground) 28%, transparent)" : "linear-gradient(90deg, color-mix(in srgb, var(--primary) 45%, transparent), var(--primary))" }} />
    </span>
  );
}

function Stat({ value, label, note, big, chip, onOpen }: { value: string; label: string; note?: string; big?: boolean; chip?: React.ReactNode | "met"; onOpen?: () => void }) {
  const content = (
    <>
      <span className="flex items-start justify-between gap-[8px]">
        <span className={`${big ? "text-[30px]" : "text-[24px]"} leading-[1.05] font-extrabold tabular-nums`} style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{value}</span>
        {chip === "met" ? <MetChip met /> : chip}
      </span>
      <span className="text-[13px] font-bold" style={{ color: "var(--foreground)" }}>{label}</span>
      {note && <span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{note}</span>}
    </>
  );
  if (onOpen) return <DrillTile onOpen={onOpen} label={label} className={`h-full gap-[3px] rounded-[var(--radius-md)] border p-[var(--space-4)] ${chip ? "" : "pr-[28px]"}`}>{content}</DrillTile>;
  return <div className="flex h-full flex-col gap-[3px] rounded-[var(--radius-md)] border p-[var(--space-4)]" style={GLASS_INSET}>{content}</div>;
}

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
function PrincipalReportPage({ v, who, role, school, photo, pageRef }: { v: ImpactView; who: string; role: string; school: string; photo: string; pageRef: React.Ref<HTMLDivElement> }) {
  const kicker = { fontFamily: SANS, fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase" as const };
  const section = (n: string, title: string) => (
    <div className="flex items-baseline gap-[12px] border-b pb-[8px]" style={{ borderColor: "var(--ink)" }}>
      <span style={{ ...kicker, color: BRAND }}>{n}</span>
      <h2 style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 600, letterSpacing: "-0.005em", color: "var(--ink)" }}>{title}</h2>
    </div>
  );
  const figures = v.figures;
  return (
    <div ref={pageRef} data-doc-page className="flex flex-col" style={{ ...PAPER_VARS, width: PAGE_W, minHeight: PAGE_H, padding: "44px 72px 36px", background: "var(--paper)", color: "var(--ink)" }}>
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
        <span>Confidential · Page 1 of 1</span>
      </footer>
    </div>
  );
}

/** Opens the report at print size in the dashboard's full-screen document
 *  viewer, with zoom and Print. */
function PrincipalReport({ v, who, role, school, onClose }: { v: ImpactView; who: string; role: string; school: string; onClose: () => void }) {
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
  ].join("\n");
  const share = [
    { label: "Email to principal", icon: Mail, onClick: () => { window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(summary)}`; } },
    { label: copied ? "Summary copied" : "Copy summary", icon: Copy, onClick: () => { navigator.clipboard?.writeText(summary).then(() => { setCopied(true); window.setTimeout(() => setCopied(false), 2000); }).catch(() => {}); } },
  ];
  return (
    <FullScreenDocument open title={`Principal / District Report · ${who}`} onClose={onClose} onPrint={() => printDocumentPage(pageRef.current, `Principal report, ${who}`)} share={share}>
      <PrincipalReportPage v={v} who={who} role={role} school={school} photo={seededPick(who, COUNSELOR_HEADSHOTS)} pageRef={pageRef} />
    </FullScreenDocument>
  );
}

/** A win: the number, what it is, and against what. `bar` draws the
 *  comparison (value and benchmark as % of the bar); `delta` says it in
 *  three words. */
function WinTile({ value, label, delta, bar, onOpen }: { value: string; label: string; delta?: string; bar?: { pct: number; tick?: number }; onOpen: () => void }) {
  const reduce = useReducedMotion();
  return (
    <DrillTile onOpen={onOpen} label={label} className="h-full gap-[6px] rounded-[var(--radius-md)] border p-[var(--space-4)]">
      <span className="text-[28px] leading-[1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{value}</span>
      <span className="text-[13px] font-bold" style={{ color: "var(--foreground)" }}>{label}</span>
      {bar && (
        <span className="relative mt-[6px] block h-[6px] w-full rounded-full" style={{ background: "color-mix(in srgb, var(--foreground) 8%, transparent)" }} aria-hidden>
          <motion.span className="absolute inset-y-0 left-0 rounded-full" initial={reduce ? false : { width: "0%" }} animate={{ width: `${Math.min(100, bar.pct)}%` }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} style={{ background: "linear-gradient(90deg, color-mix(in srgb, var(--primary) 45%, transparent), var(--primary))" }} />
          {typeof bar.tick === "number" && <span className="absolute -top-[3px] -bottom-[3px] w-[2px] rounded-full" style={{ left: `calc(${bar.tick}% - 1px)`, background: "var(--foreground)" }} />}
        </span>
      )}
      {delta && <span className="mt-auto pt-[4px] text-[12px] font-bold" style={{ color: MET }}>{delta}</span>}
    </DrillTile>
  );
}

const SECTIONS = [
  { id: "impact-achievements", label: "Achievements" },
  { id: "impact-caseload", label: "Caseload" },
  { id: "impact-readiness", label: "Readiness" },
  { id: "impact-work", label: "Your work" },
  { id: "impact-time", label: "Time use" },
  { id: "impact-asca", label: "ASCA" },
] as const;

/** Sticky under the dashboard's top bar: jump links to each section, the
 *  one in view lit, and the reporting period. One continuous page with the
 *  navigation tabs used to give (27 Sept 2026: Maisha, "I don't think this
 *  needs so many tabs"; our suggestion, built: "a sticky section index"). */
function SectionIndex({ periodKey, onPeriod }: { periodKey: PeriodData["key"]; onPeriod: (k: PeriodData["key"]) => void }) {
  const [active, setActive] = useState<string>(SECTIONS[0].id);
  useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver((entries) => {
      const seen = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (seen) setActive(seen.target.id);
    }, { rootMargin: "-130px 0px -60% 0px", threshold: 0 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  const jump = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 124, behavior: "smooth" });
  };
  return (
    <nav aria-label="My Impact sections" className="sticky top-[60px] z-[5] -mx-[var(--space-1)] flex flex-wrap items-center justify-between gap-[var(--space-3)] rounded-[var(--radius-lg)] border px-[var(--space-3)] py-[8px] backdrop-blur-[12px] print:hidden" style={{ background: "color-mix(in srgb, var(--background) 86%, transparent)", borderColor: "var(--glass-border)" }}>
      <ul className="flex flex-wrap items-center gap-[2px]">
        {SECTIONS.map((s) => (
          <li key={s.id}>
            <button type="button" onClick={() => jump(s.id)} aria-current={active === s.id ? "true" : undefined} className="dm-quiet flex h-8 cursor-pointer items-center rounded-full px-[12px] text-[12.5px] font-bold transition-colors" style={active === s.id ? { background: "color-mix(in srgb, var(--primary) 16%, transparent)", color: "var(--foreground)", boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--primary) 45%, transparent)" } : { color: "var(--muted-foreground)" }}>{s.label}</button>
          </li>
        ))}
      </ul>
      <span className="flex items-center gap-[8px]">
        <span className="text-[11px] font-bold tracking-[0.06em] uppercase" style={{ color: "var(--muted-foreground)" }}>Period</span>
        <Listbox ariaLabel="Reporting period" value={periodKey} onChange={(v) => onPeriod(v as PeriodData["key"])} options={PERIODS.map((p) => ({ value: p.key, label: `${p.label} · ${p.range}` }))} className="flex h-8 min-w-[230px] cursor-pointer items-center justify-between gap-[8px] rounded-[var(--radius-sm)] border px-[10px] text-left text-[12.5px] font-semibold" style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" }} />
      </span>
    </nav>
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
  const [ascaOpen, setAscaOpen] = useState(false);
  const v = useMemo(() => buildView(PERIODS.find((p) => p.key === periodKey)!, school), [periodKey, school]);
  // The Replit's own 120 students: in the current period every list in a
  // drill counts the same students its number does. Earlier periods have
  // no student-level history here, so their drills show the breakdown
  // without a list.
  const roster = useMemo(() => getRoster(), []);
  const live = v.current;
  const ds = (s: CounselorStudent, note: string): DrillStudent => ({ id: s.id, name: s.name, grade: s.grade, avatarIndex: s.avatarIndex, note });
  const list = (items: DrillStudent[]) => (live ? items : undefined);
  const pathwayMax = Math.max(...v.pathways.map((p) => p.count), 1);
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
  const hdrBtn = { background: "rgba(9,10,20,0.55)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", borderColor: "rgba(255,255,255,0.18)", color: "#FFFFFF" } as const;
  const sub = (s: string) => `${s} · ${v.label}`;
  const A = v.achievements;

  const drills = {
    caseload: (): Drill => ({ title: "Caseload", subtitle: sub(`${v.caseload} students, Grades 9 to 12`), rowsLabel: "By grade", rows: v.grades.map((g) => ({ label: `Grade ${g.grade}`, value: `${g.total} students` })), stats: [{ value: String(v.onTrack), label: "on track" }, { value: String(v.caseload - v.onTrack), label: "need attention or at risk" }], action: { label: "Open Students", onClick: go("students") } }),
    onTrack: (): Drill => ({ title: "On track", subtitle: sub(`${v.onTrackPct}% of the caseload · school average ${SCHOOL_AVG_ON_TRACK}%`), lead: A.onTrack, rowsLabel: "On track by grade", rows: v.grades.map((g) => ({ label: `Grade ${g.grade}`, value: `${g.onTrack} of ${g.total}`, pct: (g.onTrack / g.total) * 100 })), students: list(notOnTrack.map((s) => ds(s, attentionReason(s)))), studentsLabel: `${notOnTrack.length} not on track`, action: { label: "Open these students", onClick: go("students", () => setStatusFilter("At Risk")) } }),
    plans: (): Drill => ({ title: "Postsecondary plans", subtitle: sub(`${v.withPlan} of ${v.caseload} declared · target 80%`), rowsLabel: "By pathway", rows: v.pathways.map((p) => ({ label: p.label, value: String(p.count), pct: (p.count / v.caseload) * 100 })), students: list(roster.filter((s) => s.postsecondaryIntent === "Undecided").map((s) => ds(s, "Undecided"))), studentsLabel: `${v.pathways[5].count} undecided`, action: { label: "Open undecided students", onClick: go("students", () => setPlanFilter("Undecided")) } }),
    answered: (): Drill => ({ title: "Student questions", subtitle: sub(`${v.answered[0]} of ${v.answered[1]} answered`), lead: A.answered, items: live ? QUESTIONS.slice(0, 8).map((q) => `${q.name}: ${q.question}`) : undefined, itemsLabel: "Recent questions", action: { label: "Open Counselor Connect", onClick: go("connect") } }),
    senior: (): Drill => ({ title: "Senior plan rate", subtitle: sub(`${v.seniorPct}% · district target 80%`), lead: A.senior, stats: [{ value: "30", label: "seniors" }, { value: String(v.seniorsApplying), label: "applying" }], students: list(seniors.filter((s) => s.postsecondaryIntent === "Undecided").map((s) => ds(s, "No plan declared yet"))), studentsLabel: "Seniors still without a plan", action: { label: "Open Grade 12", onClick: go("students", () => setGradeFilter(12)) } }),
    turnaround: (): Drill => ({ title: "Review turnaround", subtitle: sub(`${v.turnaround.toFixed(1)} days on average · standard 5 days`), lead: A.turnaround, stats: [{ value: String(v.reviewed), label: "plans reviewed" }, { value: String(v.pending), label: "still pending" }], action: { label: "Open Review Queue", onClick: go("review-queue") } }),
    applying: (): Drill => ({ title: "Seniors applying", subtitle: sub(`${v.seniorsApplying} of 30`), lead: A.applying, students: list(seniors.filter((s) => !applying.includes(s)).map((s) => ds(s, `Applications ${s.milestones.Applications.toLowerCase()}`))), studentsLabel: "Not applying yet", action: { label: "Open Grade 12", onClick: go("students", () => setGradeFilter(12)) } }),
    flagged: (): Drill => ({ title: "Support flags", subtitle: sub(`${v.flags} students · ${v.flagsPct}% of caseload`), lead: A.flagged, students: list(flagged.map((s) => ds(s, s.supportFlagReason ?? ""))), studentsLabel: "Flagged students", action: { label: "Open Students", onClick: go("students") } }),
    activities: (): Drill => ({ title: "Student activity on Dreamari", subtitle: sub("this reporting period"), lead: A.activities, rowsLabel: "By activity", rows: v.engagement.map((e) => ({ label: e.label, value: fmt(e.value), pct: (e.value / v.engagement[0].value) * 100 })), action: { label: "Open Platform Engagement", onClick: go("engagement") } }),
    touchpoints: (): Drill => ({ title: "Engagement touchpoints", subtitle: sub(fmt(v.touchpoints)), lead: A.touchpoints, rowsLabel: "Made up of", rows: v.engagement.slice(1, 4).map((e) => ({ label: e.label, value: fmt(e.value), pct: (e.value / v.touchpoints) * 100 })), action: { label: "Open Platform Engagement", onClick: go("engagement") } }),
    grade: (g: ImpactView["grades"][number]): Drill => ({ title: `Grade ${g.grade}`, subtitle: sub(`${g.onTrack} of ${g.total} on track · ${g.avg}% average completion`), rowsLabel: live ? "Checkpoints done" : undefined, rows: live ? curriculumForGrade(g.grade as 9 | 10 | 11 | 12).map((c) => ({ label: c.name, value: `${c.donePct}%`, pct: c.donePct })) : undefined, stats: live ? undefined : [{ value: `${g.onTrack}/${g.total}`, label: "on track" }, { value: `${g.avg}%`, label: "average completion" }], students: list(roster.filter((s) => s.grade === g.grade && s.status !== "On Track").map((s) => ds(s, attentionReason(s)))), studentsLabel: "Not on track", action: { label: `Open Grade ${g.grade} in the Milestone Tracker`, onClick: go("milestones", () => setGradeFilter(g.grade as 9 | 10 | 11 | 12)) } }),
    pathway: (label: PostsecondaryIntent, count: number): Drill => { const l = roster.filter((s) => s.postsecondaryIntent === label); return { title: label, subtitle: sub(`${count} students`), students: list(l.map((s) => ds(s, s.careerTrack))), studentsLabel: "Students", stats: live ? undefined : [{ value: String(count), label: "students" }, { value: `${pct(count, v.caseload)}%`, label: "of the caseload" }], action: label === "Undecided" ? { label: "Open undecided students", onClick: go("students", () => setPlanFilter("Undecided")) } : { label: "Open Students", onClick: go("students") } }; },
    milestone: (m: ImpactView["milestones"][number]): Drill => {
      const key: MilestoneKey = m.label.startsWith("Career") ? "Career Report" : m.label.startsWith("Academic") ? "Academic Plan" : m.label.startsWith("Résumés") ? "Resume" : "Applications";
      const grades = key === "Resume" ? [10, 11, 12] : key === "Applications" ? [12] : [9, 10, 11, 12];
      return { title: m.label, subtitle: sub(`${m.value}% · ${m.note}`), rowsLabel: live ? "Done by grade" : undefined, rows: live ? approvedByGrade(key, grades) : undefined, stats: live ? undefined : [{ value: `${m.value}%`, label: m.label.toLowerCase() }, { value: m.note.split(" · ")[0], label: "students" }], action: { label: "Open the Milestone Tracker", onClick: go("milestones") } };
    },
    work: (label: string): Drill => {
      if (label === "Plans reviewed" || label === "Review turnaround") return drills.turnaround();
      if (label === "Questions answered") return drills.answered();
      if (label === "Support flags") return drills.flagged();
      return { title: "Announcements", subtitle: sub(`${v.announcements} sent, school-wide`), items: live ? ANNOUNCEMENTS.map((a) => `${a.title} · ${a.read}% read`) : undefined, itemsLabel: "Sent", action: { label: "Open Counselor Connect", onClick: go("connect") } };
    },
    asca: (c: ImpactView["asca"][number]): Drill => ({ title: `${c.title} development`, subtitle: sub("ASCA National Model, 4th Ed."), items: c.full, itemsLabel: "What the caseload shows", action: c.title === "Career" ? { label: "Open Career + College Insights", onClick: go("insights") } : c.title === "Academic" ? { label: "Open the Milestone Tracker", onClick: go("milestones") } : { label: "Open Students", onClick: go("students") } }),
  };
  const open = (d: Drill) => setDrill(d);

  return (
    // COMPONENT_INVENTORY row 62: this screen's own data is always seeded
    // (fixed reporting periods), so real emptiness only shows up once a
    // school genuinely has no caseload -- wrapped in SurfaceState both for
    // that real case and so `?state=loading|error&surface=62` can preview
    // the states this always-populated demo data never reaches on its own.
    <SurfaceState id={62} isEmpty={v.caseload === 0} onEmptyAction={() => router.push("/counselor?view=schools")}>
    <div className="flex flex-col gap-[var(--space-5)]">
      <section className="relative min-h-[208px] overflow-hidden rounded-[var(--radius-lg)] border print:hidden" style={{ borderColor: "var(--glass-border)" }}>
        <div className="absolute inset-0" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={COUNSELOR_COVER} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <span className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(12,16,35,0.88) 0%, rgba(12,16,35,0.55) 45%, rgba(12,16,35,0.18) 75%, transparent 100%)" }} />
        </div>
        <div className="relative flex min-h-[208px] flex-col justify-end gap-[var(--space-3)] p-[var(--space-4)] pt-[52px] sm:p-[var(--space-5)]">
          <div className="flex min-w-0 items-end gap-[var(--space-4)]">
            <CounselorHeadshot src={seededPick(who, COUNSELOR_HEADSHOTS)} />
            <div className="flex min-w-0 flex-col gap-[2px]" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
              <h2 className="truncate text-[18px] font-extrabold text-white" style={{ fontFamily: "var(--font-display)" }}>{who}</h2>
              <span className="truncate text-[13px] font-semibold" style={{ color: "rgba(255,255,255,0.85)" }}>{role} · {school} · {v.label}, {v.range}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-[6px] sm:gap-[8px]">
            <button type="button" onClick={() => window.print()} className="dm-quiet flex h-9 cursor-pointer items-center gap-[6px] rounded-[var(--radius-sm)] border px-[12px] text-[13px] font-semibold" style={hdrBtn}><Printer className="h-[14px] w-[14px]" aria-hidden /> Print</button>
            <button type="button" className="dm-quiet flex h-9 cursor-pointer items-center gap-[6px] rounded-[var(--radius-sm)] border px-[12px] text-[13px] font-semibold" style={hdrBtn}><Share2 className="h-[14px] w-[14px]" aria-hidden /> Share</button>
            <button type="button" onClick={() => setReport(true)} className="dm-solid bg-[var(--primary)] text-[var(--primary-foreground)] flex h-9 cursor-pointer items-center gap-[6px] rounded-[var(--radius-sm)] px-[14px] text-[13px] font-bold"><FileBarChart className="h-[14px] w-[14px]" aria-hidden /> Principal report</button>
          </div>
        </div>
      </section>

      <SectionIndex periodKey={periodKey} onPeriod={(k) => { setPeriodKey(k); setDrill(null); }} />

      {/* The Replit's four headline numbers; each opens its breakdown. */}
      <div className="grid grid-cols-2 gap-[var(--space-3)] lg:grid-cols-4">
        <Stat big value={String(v.caseload)} label="Caseload" note="students" onOpen={() => open(drills.caseload())} />
        <Stat big value={`${v.onTrackPct}%`} label="On track" note={`school average ${SCHOOL_AVG_ON_TRACK}%`} chip={<MetChip met={v.onTrackPct >= SCHOOL_AVG_ON_TRACK} />} onOpen={() => open(drills.onTrack())} />
        <Stat big value={`${v.withPlanPct}%`} label="Postsecondary plans" note="target 80%" chip={<MetChip met={v.withPlanPct >= 80} />} onOpen={() => open(drills.plans())} />
        <Stat big value={`${v.responseRatePct}%`} label="Questions answered" note={`${v.answered[0]} of ${v.answered[1]}`} onOpen={() => open(drills.answered())} />
      </div>

      {/* Notable achievements as wins: all eight of the Replit's, each the
         number, what it is, and the comparison drawn; the Replit's
         sentence opens in each drill. */}
      <section id="impact-achievements" className="scroll-mt-[124px]">
        <OverviewCard title="Notable achievements" unit={v.label}>
          <div className="grid grid-cols-2 gap-[var(--space-3)] md:grid-cols-4">
            <WinTile value={`${v.seniorPct}%`} label="Senior plan rate" bar={{ pct: v.seniorPct, tick: 80 }} delta={v.seniorPct >= 80 ? "Target 80% met" : `${80 - v.seniorPct} pts to target`} onOpen={() => open(drills.senior())} />
            <WinTile value={`${v.onTrackPct}%`} label="On track" bar={{ pct: v.onTrackPct, tick: SCHOOL_AVG_ON_TRACK }} delta={`+${v.onTrackPct - SCHOOL_AVG_ON_TRACK} over school`} onOpen={() => open(drills.onTrack())} />
            <WinTile value={`${v.turnaround.toFixed(1)}d`} label="Turnaround" bar={{ pct: (v.turnaround / 5) * 100, tick: 100 }} delta={`${(5 - v.turnaround).toFixed(1)} days faster`} onOpen={() => open(drills.turnaround())} />
            <WinTile value={`${v.seniorsApplying}/30`} label="Seniors applying" bar={{ pct: (v.seniorsApplying / 30) * 100 }} delta={`${pct(v.seniorsApplying, 30)}% of seniors`} onOpen={() => open(drills.applying())} />
            <WinTile value={String(v.flags)} label="Flagged early" delta={`${v.flagsPct}% of caseload`} onOpen={() => open(drills.flagged())} />
            <WinTile value={`${v.responseRatePct}%`} label="Questions answered" bar={{ pct: v.responseRatePct }} delta={`${v.answered[0]} of ${v.answered[1]} replied`} onOpen={() => open(drills.answered())} />
            <WinTile value={fmt(v.engagement[0].value)} label="Career activities" delta="on Dreamari" onOpen={() => open(drills.activities())} />
            <WinTile value={fmt(v.touchpoints)} label="Engagement touchpoints" delta="sims, pathways, colleges" onOpen={() => open(drills.touchpoints())} />
          </div>
        </OverviewCard>
      </section>

      <section id="impact-caseload" className="grid scroll-mt-[124px] grid-cols-1 gap-[var(--space-4)] lg:grid-cols-2">
        <OverviewCard title="Plans by pathway" unit={`${v.withPlan} of ${v.caseload} declared`}>
          <ul className="flex flex-col gap-[2px]">
            {v.pathways.map((p) => (
              <li key={p.label}>
                <button type="button" onClick={() => open(drills.pathway(p.label, p.count))} className="dm-quiet group grid w-full cursor-pointer grid-cols-[150px_minmax(0,1fr)_28px_14px] items-center gap-[12px] rounded-[var(--radius-sm)] px-[4px] py-[5px] text-left text-[13px]">
                  <span className="truncate font-semibold" style={{ color: "var(--foreground)" }}>{p.label}</span>
                  <Bar pct={(p.count / pathwayMax) * 100} muted={p.label === "Undecided"} />
                  <span className="text-right font-bold tabular-nums" style={{ color: "var(--foreground)" }}>{p.count}</span>
                  <Go className="opacity-0 transition-opacity group-hover:opacity-100" />
                </button>
              </li>
            ))}
          </ul>
        </OverviewCard>
        <OverviewCard title="Progress by grade" unit={`${v.overallAvg}% average completion`}>
          <ul className="flex flex-col gap-[2px]">
            {v.grades.map((g) => (
              <li key={g.grade}>
                <button type="button" onClick={() => open(drills.grade(g))} className="dm-quiet group flex w-full cursor-pointer flex-col gap-[5px] rounded-[var(--radius-sm)] px-[4px] py-[6px] text-left">
                  <span className="flex w-full items-baseline justify-between gap-[10px] text-[13px]">
                    <span className="font-bold" style={{ color: "var(--foreground)" }}>Grade {g.grade}</span>
                    <span className="flex items-center gap-[6px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{g.onTrack}/{g.total} on track · {g.avg}%<Go className="opacity-0 transition-opacity group-hover:opacity-100" /></span>
                  </span>
                  <Bar pct={g.avg} />
                </button>
              </li>
            ))}
          </ul>
        </OverviewCard>
      </section>

      <section id="impact-readiness" className="scroll-mt-[124px]">
        <OverviewCard title="Readiness milestones">
          <div className="grid grid-cols-2 gap-[var(--space-3)] lg:grid-cols-4">
            {v.milestones.map((m) => <Stat key={m.label} value={`${m.value}%`} label={m.label} note={m.note} chip={m.chip} onOpen={() => open(drills.milestone(m))} />)}
          </div>
        </OverviewCard>
      </section>

      <section id="impact-work" className="scroll-mt-[124px]">
        <OverviewCard title="Your work this period">
          <div className="grid grid-cols-2 gap-[var(--space-3)] sm:grid-cols-3 lg:grid-cols-5">
            {v.activity.map((a) => <Stat key={a.label} value={a.value} label={a.label} note={a.note} onOpen={() => open(drills.work(a.label))} />)}
          </div>
          <span className="text-[11px] font-bold tracking-[0.06em] uppercase" style={{ color: "var(--muted-foreground)" }}>Student activity on Dreamari</span>
          <div className="grid grid-cols-2 gap-[var(--space-3)] sm:grid-cols-3 lg:grid-cols-5">
            {v.engagement.map((e) => <Stat key={e.label} value={fmt(e.value)} label={e.label} onOpen={() => open(drills.activities())} />)}
          </div>
        </OverviewCard>
      </section>

      {/* v3 (29 Sept 2026): ASCA's 80/20 use of time, logged from the
         counselor's own work (./TimeUse.tsx). */}
      <section id="impact-time" className="scroll-mt-[124px]">
        <TimeUse />
      </section>

      {/* ASCA last and quiet: it matters for annual accountability, not the
         week's work, so it opens on its three headline numbers and shows
         the evidence on request (our suggestion, built 27 Sept 2026: "put
         the for-accountability parts last and quieter"). */}
      <section id="impact-asca" className="scroll-mt-[124px]">
        <OverviewCard title="ASCA alignment" unit="National Model, 4th Ed." aside={<button type="button" onClick={() => setAscaOpen((o) => !o)} aria-expanded={ascaOpen} className="dm-quiet flex cursor-pointer items-center gap-[4px] rounded-full border px-[11px] py-[5px] text-[12.5px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>{ascaOpen ? "Hide evidence" : "Show evidence"}<ChevronDown className={`h-[14px] w-[14px] transition-transform ${ascaOpen ? "rotate-180" : ""}`} aria-hidden /></button>}>
          <div className="grid grid-cols-1 gap-[var(--space-3)] sm:grid-cols-3">
            {v.asca.map((c) => (
              <DrillTile key={c.title} onOpen={() => open(drills.asca(c))} label={c.title} className="h-full gap-[8px] rounded-[var(--radius-md)] border p-[var(--space-4)]">
                <span className="flex items-center gap-[8px]"><c.icon className="h-[14px] w-[14px]" aria-hidden style={{ color: "var(--primary)" }} /><h3 className="text-[13.5px] font-bold" style={{ color: "var(--foreground)" }}>{c.title}</h3></span>
                <span className="flex items-baseline gap-[8px]">
                  <span className="text-[24px] leading-[1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{c.headline}</span>
                  <span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{c.headlineLabel}</span>
                </span>
                {ascaOpen && (
                  <ul className="flex flex-col gap-[5px] border-t pt-[8px]" style={{ borderColor: "var(--glass-border)" }}>
                    {c.items.map((it) => <li key={it} className="flex items-start gap-[7px] text-[12.5px] leading-[18px]" style={{ color: "var(--foreground)" }}><CheckCircle2 className="mt-[2px] h-[12px] w-[12px] flex-none" aria-hidden style={{ color: "var(--primary)" }} />{it}</li>)}
                  </ul>
                )}
              </DrillTile>
            ))}
          </div>
        </OverviewCard>
      </section>

      <DrillPanel drill={drill} onClose={() => setDrill(null)} />
      {report && <PrincipalReport v={v} who={who} role={role} school={school} onClose={() => setReport(false)} />}
    </div>
    </SurfaceState>
  );
}
