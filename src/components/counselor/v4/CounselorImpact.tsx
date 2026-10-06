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
//
// Rebuilt again 2 Oct 2026, to Maisha's Replit layout, section for section.
// WHY: "In v1, maisha's look so much cleaner and easier to read… ours is so
// dense and hard to read, maishas has cleaner spacing, lesser numbers". The
// diagnosis of the version above, and what changed:
//   - Boxes inside boxes: every section was a card of bordered tiles. Now each
//     section is ONE card holding flat, unboxed stats in a row (Maisha's way).
//   - Repeated numbers: the Notable achievements WinTile grid repeated figures
//     shown above it. It is a short chevron list again: no tiles, bars or
//     captions. The Replit's full sentences live in that section's drill.
//   - Extra chrome: the sticky section index, the Met / In progress chips on
//     the headline cards and a caption under every number are gone. The
//     reporting period picker is one slim line under the hero.
// Order and content are Maisha's: headline cards, pathway and grade charts,
// readiness milestones, counselor activity, platform engagement, ASCA,
// achievements, district compliance. Every number on her page is on this one;
// the figures only we had (pending reviews, school average, the career report
// and on-track compliance rows, student lists) moved into that section's
// drill, which opens from the whole card (the "Details" pill is its keyboard
// target), not from per-number tiles. The hero (artwork, photo, Print / Share
// / Principal report) is untouched, and so is the Principal report document.
// Design budget (v2): blue plus status colors, no card tints, glow only on the
// hero, gradient bars.
//
// Lightened again 2 Oct 2026, same day, on the same screen.
// WHY: "v2 my impact is still so dense and cardy, i think maishas has the
// better graphs too ours just seems so DENSE." The layout already matched; what
// was left was visual weight and the charts. Measured on the live Replit at
// 1366px and matched below the hero (the hero is untouched):
//   - Numbers: hers are 24px / 700 (headline, milestones), 20px / 700
//     (activity, engagement), 18px / 700 (compliance); ours were 28px / 800 black
//     everywhere. Milestone and engagement numbers are her accent colour (our
//     blue) and centred, as hers are. Labels are 12px / 500, sublines 12px / 400
//     muted; section titles 14px / 600 (were 15px / 700).
//   - Cards: a plain `--card` surface, a hairline border, her 12px radius and
//     24px padding. No gradient, glass, glow or hover lift (the beam and the
//     shared GLASS_CARD are off this screen; the shared cards are unchanged).
//   - "Details" pills are gone. The whole card still opens its drill; a corner
//     chevron (`Go`) appears on hover or keyboard focus, and is the focus target.
//   - Pathway chart: category labels on a left axis, 28px bars rounded on the
//     free end, one blue stepping lighter, Undecided neutral grey, no count
//     column. The exact count (and its share) moved into a tooltip on each bar
//     (hover or focus) and stays in the section drill. Grade bars are 8px on a
//     light blue track, with her "27/30 on track · 44% avg completion" lines.
//   - Info strips: a pale blue strip, 12px, bold figures in the accent.
// No data point was dropped: every figure on her page is still on screen (the
// pathway counts in tooltips, as on hers), and our extras stay in the drills.
//
// Refined 2 Oct 2026, again the same day, on the colour and opacity.
// WHY: "lose the icons, dont do 1:1 for design, use whats working in hers and
// make it BETTER. Dont just copy. Pay attention to color and opacity, whats
// strong, whats muted etc." Hers has the right calm (flat cards, light numbers,
// simple charts) but no system: purple numbers in some sections and black in
// others, tinted strips, icons and bullets doing the work hierarchy should.
// Ours is one system, defined once (INK, INK_MEDIUM, INK_QUIET below) and used
// everywhere: strong ink for every stat number, a step down for labels and
// titles' siblings, a quiet step for sublines and notes, blue ONLY for chart
// bars and interactive affordances (never numbers), and the status colours
// ONLY where status is the point (a dot and a quiet word on the compliance
// items). Fewer boxes than hers: no icons below the hero, no tinted strips
// (a hairline and a sentence), no coloured ASCA panels (three plain columns),
// no chevron or check bullets (hairlines between rows). Pathway bars step from
// strong to light by RANK (largest pathway strongest), not by row position, so
// the colour itself says which pathway is biggest. No data point was dropped.

import { CountUp, DestinationRing, Dreamy, GradeDotPlot, ReadinessArcs } from "./InsightCharts";
import { useChartColors } from "./ChartColors";
import { ImpactPublication } from "./ImpactPublication";
import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import { FileBarChart, CheckCircle2, AlertTriangle, Mail, Copy } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { getRoster, DEMO_SCHOOL, type CounselorStudent, type PostsecondaryIntent } from "@/lib/counselorRoster";
import { attentionReason } from "./studentAttention";
import { counselorAccountSnapshot, serverCounselorAccountSnapshot, subscribeCounselorAccount } from "@/lib/counselorAccount";
import { Tip } from "@/components/app/IconTip";
import { Go } from "./chips";
import { BRAND, Crest, FullScreenDocument, PAGE_H, PAGE_W, SANS, SERIF, printDocumentPage } from "./DocumentDesk";
import { PAPER_VARS } from "./DocumentPreview";
import { DrillPanel, type Drill, type DrillStudent } from "./Drill";
import { QUESTIONS, ANNOUNCEMENTS } from "./CounselorConnect";
import { useRouter } from "next/navigation";
import { SurfaceState } from "@/components/app/SurfaceState";
import { useCounselorFilters } from "../shell";
import { COUNSELOR_HEADSHOTS, seededPick } from "./MyImpact";
import { Segmented } from "./viz";
import { Listbox } from "./Listbox";

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
    key: "fall-2023", label: "Fall 2023", range: "Aug 2023 – Jan 2024", rangeLong: "August 2023 – January 2024", year: "2023–2024", issued: "Feb 2, 2024", unit: "semester", current: false,
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
    // Maisha's four milestone stats (her labels and sublines). `extra` is
    // what only our page had: it opens in the section's drill.
    milestones: [
      { value: careerPct, label: "Career Reports Approved", note: "", extra: `${p.careerReports} of ${p.caseload} students` },
      { value: academicPct, label: "Academic Plans Approved", note: "", extra: `${p.academicPlans} of ${p.caseload} students` },
      { value: resumePct, label: "Résumés Complete (Gr. 10+)", note: `${p.resumes} of 90 students`, extra: `${p.resumes} of 90 in Grades 10-12` },
      { value: seniorPct, label: "Senior Plan Compliance", note: "30 seniors · district target: 80%", extra: `${p.seniorsWithPlan} of 30 seniors · target 80%` },
    ],
    activity: [
      { value: String(p.reviewed), label: "Plans Reviewed", note: "" },
      { value: `${p.answered[0]}/${p.answered[1]}`, label: "Student Questions", note: "" },
      { value: String(p.announcements), label: "Announcements Sent", note: "" },
      { value: String(p.flags), label: "Support Flags Active", note: `${flagsPct}% of caseload monitored` },
    ],
    engagement: [
      { value: drops, label: "Daily Career Drops Completed" },
      { value: sims, label: "Career Simulations Completed" },
      { value: careers, label: "Careers Saved to Profiles" },
      { value: colleges, label: "Colleges Saved by Students" },
      { value: posts, label: "Community Contributions" },
    ],
    // Maisha's three ASCA panels, her wording, this period's figures. `full`
    // is the longer wording the section's drill shows.
    asca: [
      { title: "Academic Development", short: "Academic", items: [`Academic Planning: ${p.caseload} students supported`, `4-Year Plans: ${academicPct}% approved`, "Course & Credit Monitoring: Ongoing support"], keys: [`${p.caseload} students`, `${academicPct}%`, "Ongoing support"], full: [`Academic planning supported for all ${p.caseload} students`, `${academicPct}% of students have approved 4-year academic plans`, "Course selection and credit-monitoring support delivered"] },
      { title: "Career Development", short: "Career", items: [`Career Reports: ${careerPct}% completed`, `Career Pathways: ${withPlanPct}% declared`, "Career Simulations & Assessments: Facilitated"], keys: [`${careerPct}%`, `${withPlanPct}%`, "Facilitated"], full: [`${careerPct}% career report completion rate across caseload`, `Career pathway declared for ${withPlanPct}% of students`, "Career simulations and assessments facilitated via Dreamari"] },
      { title: "Social-Emotional Development", short: "Social-emotional", items: [`Student Support: ${p.flags} actively monitored`, `Connect: ${responseRatePct}% response rate`, `At-Risk Support: ${p.atRisk} students flagged`], keys: [`${p.flags}`, `${responseRatePct}%`, `${p.atRisk} students`], full: [`${p.flags} students identified and actively monitored for support`, `${responseRatePct}% student question response rate via Connect`, `${p.atRisk} at-risk students flagged for proactive intervention`] },
    ],
    // The Replit's eight notable achievements, its wording, this period's
    // figures (punctuation only changed: no em dashes).
    achievements: {
      senior: `Senior postsecondary plan rate of ${seniorPct}%, ${seniorPct >= 80 ? "meeting the district-mandated 80% benchmark ahead of the spring deadline" : "approaching the district-mandated 80% benchmark"}.`,
      onTrack: `${onTrackPct}% of ${p.caseload} students were on track; the school comparison is ${SCHOOL_AVG_ON_TRACK}%.`,
      turnaround: `Plan reviews took ${t} days on average, against a district standard of 5 days.`,
      applying: `${p.seniorsApplying} of 30 seniors have active college or postsecondary applications underway.`,
      answered: `${responseRatePct}% of student questions received a response in the reporting period.`,
      flagged: `${p.flags} students were identified for additional support.`,
      activities: `${fmt(drops)} career-exploration activities were completed by students on Dreamari.`,
      touchpoints: `Career simulations, pathway selections, and college-saving activity contributed to ${fmt(touchpoints)} total student engagement touchpoints ${period}.`,
    },
    // Maisha's eight one-line achievements (her wording, this period's
    // figures); the longer sentences above open in the section's drill.
    highlights: [
      { key: `${seniorPct}%`, rest: "senior postsecondary plan rate" },
      { key: `${onTrackPct}%`, rest: "of caseload academically on track" },
      { key: `${t}-day`, rest: "average plan review turnaround" },
      { key: `${p.seniorsApplying} of 30`, rest: "seniors actively applying" },
      { key: `${responseRatePct}%`, rest: "Connect response rate" },
      { key: `${p.flags}`, rest: "students identified for additional support" },
      { key: fmt(drops), rest: "career exploration activities completed" },
      { key: fmt(touchpoints), rest: "student engagement touchpoints" },
    ],
    // Maisha's District Compliance Summary: three items, value, label, target.
    compliance: [
      { value: `${withPlanPct}%`, label: "Postsecondary Plans on File", target: "Target: \u2265 80% (district)", met: withPlanPct >= 80 },
      { value: `${seniorPct}%`, label: "Senior Plan Compliance", target: "Target: \u2265 80% (district)", met: seniorPct >= 80 },
      { value: `${t} days avg.`, label: "Plan Review Turnaround", target: "Target: \u2264 5 days (district)", met: p.turnaround <= 5 },
    ],
    // The Principal / District Report's own six achievements and five-row
    // compliance table, as the Replit's report words them.
    reportAchievements: [
      `Maintained a ${onTrackPct}% on-track rate across a caseload of ${p.caseload} students, above the school average of ${SCHOOL_AVG_ON_TRACK}%.`,
      `Senior postsecondary plan rate of ${seniorPct}%: ${seniorPct >= 80 ? "meets" : "approaching"} the district 80% benchmark.`,
      `${p.seniorsApplying} of 30 seniors have active college or postsecondary applications underway.`,
      `Answered ${p.answered[0]} of ${p.answered[1]} student questions (${responseRatePct}%) during the reporting period.`,
      `Reviewed ${p.reviewed} submissions with an average turnaround of ${t} days against the district 5-day standard.`,
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
export type ImpactView = ReturnType<typeof buildView>;
const MET = "var(--cd-green)";
const OPEN = "var(--cd-amber)";

/** The page's one colour and opacity system, used everywhere below the hero.
 *  STRONG: every stat number, full foreground. MEDIUM: stat labels and the
 *  plain body of a line. QUIET: sublines, captions, targets and notes. Blue
 *  (`--primary`) is for chart bars and interactive affordances only, never a
 *  number; MET / OPEN colour only a status dot. */
const INK = "var(--foreground)";
const INK_MEDIUM = "color-mix(in srgb, var(--foreground) 72%, transparent)";
const INK_QUIET = "color-mix(in srgb, var(--foreground) 62%, transparent)"; // 62%, not 50%: 50% fell below 4.5:1 contrast at 12px on white
const HAIRLINE = "var(--glass-border)";

/** A key figure inside a sentence: strong ink, 600. */
function Key({ children }: { children: React.ReactNode }) {
  return <b className="font-semibold" style={{ color: INK }}>{children}</b>;
}
/** A line of text with its key figure in strong ink and the rest as given. */
function WithKey({ text, k }: { text: string; k: string }) {
  const at = k ? text.indexOf(k) : -1;
  if (at < 0) return <>{text}</>;
  return <>{text.slice(0, at)}<Key>{k}</Key>{text.slice(at + k.length)}</>;
}

/** This screen's own flat card: a plain `--card` surface and a hairline
 *  border, no gradient, glass, glow or shadow (the shared OverviewCard and
 *  GLASS_CARD stay as they are for the other screens). */
const FLAT_CARD = { background: "var(--card)", borderColor: "var(--glass-border)" } as const;
const FLAT_CARD_CLASS = "v4-surface rounded-[var(--radius-md)] border";
/** Clickable cards darken their hairline a step on hover; nothing moves. */
const FLAT_CARD_HOVER = "transition-colors duration-150 hover:!border-[color-mix(in_srgb,var(--foreground)_24%,transparent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]";

/** Horizontal progress bar, 8px: a light neutral track and a solid blue fill. */
function Bar({ pct }: { pct: number }) {
  const reduce = useReducedMotion();
  return (
    <span className="relative block h-[8px] w-full rounded-full" style={{ background: "color-mix(in srgb, var(--foreground) 7%, transparent)" }} aria-hidden>
      <motion.span className="absolute inset-y-0 left-0 rounded-full" initial={reduce ? false : { width: "0%" }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} style={{ background: "var(--primary)" }} />
    </span>
  );
}

/** Pathway bar, Maisha's chart style: a 28px bar, rounded on its free end,
 *  growing from a left axis. Bars share the accent, a step lighter per rank;
 *  Undecided is neutral grey. The count is not printed beside it: it is in
 *  the tooltip (hover or keyboard focus) and in the section drill. The bar
 *  is scaled to the whole caseload so its length reads as a share of it. */
function HBar({ count, of, tip, tone, onOpen }: { count: number; of: number; tip: string; tone: number | "neutral"; onOpen: () => void }) {
  // `tone` is the pathway's rank by size (0 = largest): strongest blue for the
  // largest, stepping down to a floor of 35% for the smallest.
  const reduce = useReducedMotion();
  const width = `${Math.min(100, (count / Math.max(of, 1)) * 100)}%`;
  const fill = tone === "neutral"
    ? "color-mix(in srgb, var(--foreground) 14%, transparent)"
    : `color-mix(in srgb, var(--primary) ${[92, 66, 50, 40, 35][Math.min(tone, 4)]}%, transparent)`;
  return (
    <span className="relative my-[3px] block h-[28px] min-w-0 flex-1 border-l" style={{ borderColor: "var(--muted-foreground)", ["--bar" as string]: width }}>
      <motion.span aria-hidden className="absolute inset-y-0 left-0 rounded-r-[4px]" initial={reduce ? false : { width: "0%" }} animate={{ width }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} style={{ background: fill, minWidth: count > 0 ? 4 : 0 }} />
      <Tip label={tip} className="absolute inset-y-0 left-0 w-[max(var(--bar),28px)]">
        <button type="button" aria-label={tip} onClick={onOpen} className="block h-full w-full cursor-pointer rounded-r-[4px] outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--primary)]" />
      </Tip>
    </span>
  );
}

type FigureSize = "lg" | "md" | "sm";
const FIGURE_SIZE: Record<FigureSize, string> = { lg: "text-[24px] leading-[32px]", md: "text-[20px] leading-[28px]", sm: "text-[18px] leading-[28px]" };

/** A flat figure, Maisha's proportions: the number (24 / 20 / 18px, bold, strong
 *  ink, always), its label (12px, medium) and at most one quiet subline
 *  (12px). No icon, no box, no border; `center` centres the stack. */
function Figure({ value, label, note, size = "lg", center }: { value: string; label: string; note?: string; size?: FigureSize; center?: boolean }) {
  return (
    <div className={`v4-impact-figure v4-impact-figure-${size} flex min-w-0 flex-col gap-[4px] ${center ? "items-center text-center" : ""}`}>
      <span className={`${FIGURE_SIZE[size]} font-bold tabular-nums`} style={{ fontFamily: "var(--font-display)", color: INK }}>{value}</span>
      <span className="text-[12px] leading-[16px] font-medium" style={{ color: INK_MEDIUM }}>{label}</span>
      {note && <span className="text-[12px] leading-[16px]" style={{ color: INK_QUIET }}>{note}</span>}
    </div>
  );
}

/** One section, one flat card. The whole card opens the section's drill: a
 *  corner chevron (quiet until hover or keyboard focus) is the keyboard
 *  target and its ::before stretches over the card. No "Details" pill. */
function SectionCard({ title, unit, onOpen, colors = false, children }: { title: string; unit?: string; onOpen?: () => void; /** show the in-chart Multicolor control (ChartColors.tsx) */ colors?: boolean; children: React.ReactNode }) {
  const chartColors = useChartColors();
  return (
    <section {...(colors ? chartColors.attrs : {})} className={`${FLAT_CARD_CLASS} group relative flex h-full flex-col gap-[var(--space-2)] p-[var(--space-4)] sm:p-[var(--space-6)] ${onOpen ? "has-[button:focus-visible]:outline-2 has-[button:focus-visible]:outline-offset-2 has-[button:focus-visible]:outline-[var(--primary)] hover:!border-[color-mix(in_srgb,var(--foreground)_24%,transparent)] transition-colors duration-150" : ""}`} style={FLAT_CARD}>
      <div className="flex items-center justify-between gap-[10px]">
        <h2 className="min-w-0 text-[14px] leading-[20px] font-semibold" style={{ color: INK }}>
          {title}
          {unit && <span className="ml-[8px] text-[12px] leading-[16px] font-normal" style={{ color: INK_QUIET }}>{unit}</span>}
        </h2>
        {colors && <span className="ml-auto">{chartColors.toggle}</span>}
        {onOpen && (
          <button type="button" onClick={onOpen} aria-label={`${title}: details`} className="flex flex-none cursor-pointer items-center rounded-full p-[2px] outline-none before:absolute before:inset-0 before:content-['']">
            <Go kind="open" className="opacity-0 group-hover:opacity-100 group-has-[button:focus-visible]:opacity-100" />
          </button>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-[var(--space-4)]">{children}</div>
    </section>
  );
}

/** The line under a stat row: a hairline and a quiet sentence, key figures in
 *  strong ink (Maisha's pale blue strip, without the box). */
function InfoLine({ children }: { children: React.ReactNode }) {
  return (
    <p className="border-t pt-[var(--space-4)] text-[12px] leading-[16px]" style={{ borderColor: HAIRLINE, color: INK_QUIET }}>{children}</p>
  );
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
function PrincipalReport({ v, who, role, school, kind, onClose }: { v: ImpactView; who: string; role: string; school: string; kind: "impact" | "principal"; onClose: () => void }) {
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
    <FullScreenDocument open title={`${kind === "impact" ? "Impact report · 3 pages" : "Principal brief · 1 page"} · ${who}`} onClose={onClose} onPrint={() => printDocumentPage(pageRef.current, `Principal report, ${who}`)} share={share}>
      <ImpactPublication v={v} who={who} role={role} kind={kind} pageRef={pageRef} />
    </FullScreenDocument>
  );
}

export function CounselorImpact() {
  const account = useSyncExternalStore(subscribeCounselorAccount, counselorAccountSnapshot, serverCounselorAccountSnapshot);
  const who = account.name || "Sarah Chen";
  const role = account.role || "School Counselor";
  const school = account.school || DEMO_SCHOOL;
  const router = useRouter();
  const { setStatusFilter, setPlanFilter } = useCounselorFilters();
  const [report, setReport] = useState<false | "impact" | "principal">(false);
  const [drill, setDrill] = useState<Drill | null>(null);
  const [periodKey, setPeriodKey] = useState<PeriodData["key"]>("fall-2023");
  const v = useMemo(() => buildView(PERIODS.find((p) => p.key === periodKey)!, school), [periodKey, school]);
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
  const go = (view: string, set?: () => void) => () => { set?.(); setDrill(null); router.push(`/counselor?view=${view}`); };

  const sub = (s: string) => `${s} · ${v.label}`;
  const A = v.achievements;

  // One drill per section card, not per number. What a section's card no
  // longer shows (the Replit's longer sentences, pending counts, the school
  // average, student lists) is in its drill.
  const drills = {
    caseload: (): Drill => ({ title: "Caseload", subtitle: sub(`${v.caseload} students, Grades 9 to 12`), rowsLabel: "By grade", rows: v.grades.map((g) => ({ label: `Grade ${g.grade}`, value: `${g.total} students` })), stats: [{ value: String(v.onTrack), label: "on track" }, { value: String(v.caseload - v.onTrack), label: "need attention or at risk" }], action: { label: "Open Students", onClick: go("students") } }),
    onTrack: (): Drill => ({ title: "On Track", subtitle: sub(`${v.onTrackPct}% of the caseload · school average ${SCHOOL_AVG_ON_TRACK}%`), lead: A.onTrack, rowsLabel: "On track by grade", rows: v.grades.map((g) => ({ label: `Grade ${g.grade}`, value: `${g.onTrack} of ${g.total}`, pct: (g.onTrack / g.total) * 100 })), students: list(notOnTrack.map((s) => ds(s, attentionReason(s)))), studentsLabel: `Current roster · ${notOnTrack.length} need support`, action: { label: "Open student directory", onClick: go("students", () => setStatusFilter("All")) } }),
    plans: (): Drill => ({ title: "Postsecondary Plans", subtitle: sub(`${v.withPlan} of ${v.caseload} declared · target 80%`), rowsLabel: "By pathway", rows: v.pathways.map((p) => ({ label: p.label, value: String(p.count), pct: (p.count / v.caseload) * 100 })), students: list(roster.filter((s) => s.postsecondaryIntent === "Undecided").map((s) => ds(s, "Undecided"))), studentsLabel: `${v.pathways[5].count} undecided`, action: { label: "Open undecided students", onClick: go("students", () => setPlanFilter("Undecided")) } }),
    answered: (): Drill => ({ title: "Student Questions", subtitle: sub(`${v.answered[0]} of ${v.answered[1]} answered`), lead: A.answered, items: live ? QUESTIONS.slice(0, 8).map((q) => `${q.name}: ${q.question}`) : undefined, itemsLabel: "Recent questions", action: { label: "Open Connect", onClick: go("connect") } }),
    pathways: (): Drill => ({ ...drills.plans(), title: "Postsecondary Plans by Pathway" }),
    progress: (): Drill => ({ title: "Caseload Progress by Grade", subtitle: sub(`${v.overallAvg}% average plan completion · ${v.onTrack} of ${v.caseload} on track`), rowsLabel: "Average plan completion", rows: v.grades.map((g) => ({ label: `Grade ${g.grade} · ${g.onTrack} of ${g.total} on track`, value: `${g.avg}%`, pct: g.avg })), students: list(notOnTrack.map((s) => ds(s, attentionReason(s)))), studentsLabel: `Current roster · ${notOnTrack.length} need support`, action: { label: "Open the Milestone Tracker", onClick: go("milestones") } }),
    readiness: (): Drill => ({ title: "Readiness Milestones", subtitle: sub("College and career readiness"), lead: A.senior, rowsLabel: "Done across the caseload", rows: v.milestones.map((m) => ({ label: `${m.label} · ${m.extra}`, value: `${m.value}%`, pct: m.value })), items: [A.applying], itemsLabel: "Seniors applying", students: list(seniors.filter((s) => s.postsecondaryIntent === "Undecided").map((s) => ds(s, "No plan declared yet"))), studentsLabel: "Seniors still without a plan", action: { label: "Open the Milestone Tracker", onClick: go("milestones") } }),
    work: (): Drill => ({ title: "My Counseling Activity", subtitle: sub("Reviews, questions, announcements and flags"), lead: A.turnaround, stats: [{ value: String(v.reviewed), label: "plans reviewed" }, { value: String(v.pending), label: "still pending" }, { value: `${v.responseRatePct}%`, label: `questions answered (${v.answered[0]} of ${v.answered[1]})` }, { value: String(v.announcements), label: "announcements, school-wide" }], items: [A.flagged, ...(live ? ANNOUNCEMENTS.map((a) => `${a.title} · ${a.read}% read`) : [])], itemsLabel: "Support flags and announcements", students: list(flagged.map((s) => ds(s, s.supportFlagReason ?? ""))), studentsLabel: "Flagged students", action: { label: "Open Review Queue", onClick: go("review-queue") } }),
    activities: (): Drill => ({ title: "Student Activity on Dreamari", subtitle: sub("this reporting period"), lead: A.activities, rowsLabel: "By activity", rows: v.engagement.map((e) => ({ label: e.label, value: fmt(e.value), pct: (e.value / v.engagement[0].value) * 100 })), items: [A.touchpoints], itemsLabel: "Touchpoints", action: { label: "Open Engagement", onClick: go("engagement") } }),
    asca: (): Drill => ({ title: "ASCA National Model Alignment", subtitle: sub("4th Ed."), items: v.asca.flatMap((c) => c.full.map((f) => `${c.short}: ${f}`)), itemsLabel: "What the caseload shows", action: { label: "Open the Milestone Tracker", onClick: go("milestones") } }),
    achievements: (): Drill => ({ title: "Notable Achievements", subtitle: sub("In full"), items: Object.values(A), itemsLabel: "Report details", action: { label: "Open the Principal report", onClick: () => { setDrill(null); setReport("principal"); } } }),
    compliance: (): Drill => ({ title: "District Compliance", subtitle: sub("All five measures in the Principal report"), items: v.reportCompliance.map((r) => `${r.metric}: ${r.result} (target ${r.target}) · ${r.met ? "Met" : "In progress"}`), itemsLabel: "Measures", action: { label: "Open the Principal report", onClick: () => { setDrill(null); setReport("principal"); } } }),
  };
  const open = (d: Drill) => setDrill(d);

  return (
    // COMPONENT_INVENTORY row 62: this screen's own data is always seeded
    // (fixed reporting periods), so real emptiness only shows up once a
    // school genuinely has no caseload -- wrapped in SurfaceState both for
    // that real case and so `?state=loading|error&surface=62` can preview
    // the states this always-populated demo data never reaches on its own.
    <SurfaceState id={62} isEmpty={v.caseload === 0} onEmptyAction={() => router.push("/counselor?view=schools")}>
    <div className="v4-page v4-impact-report flex flex-col gap-[var(--space-6)]">
      <div className="v4-impact-toolbar">
        <Listbox ariaLabel="Reporting period" value={periodKey} onChange={(k) => { setPeriodKey(k as PeriodData["key"]); setDrill(null); }} options={PERIODS.map((p) => ({ value: p.key, label: p.label }))} className="v4-period-select" />
        <span className="v4-source-note">Historical demo · {who}</span>
        <div><button className="v4-secondary-action" onClick={() => setReport("principal")}>Principal brief</button><button className="v4-primary-action" onClick={() => setReport("impact")}><FileBarChart size={15}/>Impact report</button></div>
      </div>
      <section className="v4-impact-cover">
        <div className="v4-impact-story"><span className="v4-overline">Student momentum</span><h2>Moving Toward<br/><em>What’s Next</em></h2><p>{v.onTrack} of my {v.caseload} students are on track.</p><button className="v4-text-action" onClick={() => open(drills.onTrack())}>Explore student progress <Go/></button></div>
        <button className="v4-momentum-orbit" onClick={() => open(drills.onTrack())} aria-label={`On-track rate ${v.onTrackPct} percent. Open details`}>
          <svg viewBox="0 0 320 240" aria-hidden="true"><defs><linearGradient id="momentum-ink" x1="0" y1="1" x2="1" y2="0"><stop stopColor="var(--v4-chart-1)"/><stop offset="1" stopColor="var(--v4-chart-2)"/></linearGradient></defs><ellipse cx="160" cy="120" rx="147" ry="99" fill="none" stroke="var(--glass-border)" transform="rotate(-18 160 120)"/><ellipse cx="160" cy="120" rx="132" ry="114" fill="none" stroke="var(--glass-border)" transform="rotate(23 160 120)"/><circle cx="160" cy="120" r="92" fill="none" stroke="var(--glass-border)" strokeWidth="14"/><circle className="v4-ring-draw" cx="160" cy="120" r="92" pathLength="100" fill="none" stroke="url(#momentum-ink)" strokeWidth="14" strokeLinecap="round" strokeDasharray={`${v.onTrackPct} 100`} transform="rotate(-90 160 120)"/></svg>
          <span><strong><CountUp value={v.onTrackPct}/><small>%</small></strong><em>on track</em></span>
        </button>
        <div className="v4-impact-priority"><span className="v4-overline">Next opportunity</span><strong><CountUp value={v.caseload-v.withPlan}/></strong><p className="v4-impact-priority-label">students still exploring<br/>their next step</p><button className="v4-text-action" onClick={() => open(drills.plans())}>See the breakdown <Go/></button></div>
      </section>
      <div className="v4-section-heading"><div><span className="v4-overline">01 / Direction</span><h2>Where Students Are Heading</h2></div><button className="v4-text-action" onClick={() => open(drills.caseload())}>About this cohort <Go/></button></div>
      <div className="v4-impact-chart-pair">
        <SectionCard title="Life After Graduation" colors onOpen={() => open(drills.pathways())}><DestinationRing items={v.pathways} total={v.caseload} declared={v.withPlan} onOpen={() => open(drills.pathways())}/></SectionCard>
        <SectionCard title="Progress Grade by Grade" onOpen={() => open(drills.progress())}><GradeDotPlot grades={v.grades}/></SectionCard>
      </div>
      <SectionCard title="Readiness Checkpoints" colors onOpen={() => open(drills.readiness())}><ReadinessArcs items={v.milestones}/></SectionCard>
      <div className="v4-section-heading"><div><span className="v4-overline">02 / Follow-through</span><h2>The Work That Moves Things Forward</h2></div></div>
      <section className="v4-service-story">
        <button className="v4-service-feature" onClick={() => open(drills.work())}><span className="v4-overline">Review turnaround</span><strong><CountUp value={v.turnaround} decimals={1}/><small>days</small></strong><p>Within the {5}-day district standard</p><div className="v4-target-rule" aria-hidden="true"><i style={{left:`${v.turnaround/5*100}%`}}/><b/></div><span className="v4-service-scale"><span>0</span><span>5 days</span></span><em>{v.reviewed} plans reviewed · {v.pending} pending <Go/></em></button>
        <div className="v4-service-actions"><button onClick={() => open(drills.answered())}><span className="v4-service-amount">{v.answered[0]}<small>/{v.answered[1]}</small></span><span><strong>Questions answered</strong><small>{v.answered[1]-v.answered[0]} still need a response</small></span><Go/></button><button onClick={() => open(drills.work())}><span className="v4-service-amount">{v.flags}</span><span><strong>Students being supported</strong><small>{v.atRisk} flagged at risk</small></span><Go/></button><button onClick={() => open(drills.work())}><span className="v4-service-amount">{v.announcements}</span><span><strong>Announcements shared</strong><small>School-wide communication</small></span><Go/></button></div>
      </section>
      <div className="v4-impact-disclosures">
        <details><summary><span>Student Engagement</span><span>{fmt(v.engagement[0].value)} career drops completed</span><Go kind="expand"/></summary><div className="v4-engagement-ledger">{v.engagement.map((e,i) => <div key={e.label}><span>0{i+1}</span><strong>{fmt(e.value)}</strong><p>{e.label}</p></div>)}</div><p className="v4-source-note">Recorded activity events, not unique students. {fmt(v.touchpoints)} touchpoints combine simulations, saved careers and saved colleges.</p></details>
        {/* A celebratory touch on the achievements (Maisha's v4 review, 7 Oct
           2026: make the dashboard "more exciting to receive", the way the
           student app celebrates a win). Dreamy cheers beside the title and
           the eight highlights pop in, one after another, when the list opens. The
           wording and figures are unchanged. */}
        <details className="v4-wins"><summary><Dreamy mood="celebrate" size={40} className="v4-wins-dreamy"/><span>Highlights From This Period</span><span>Eight observations</span><Go kind="expand"/></summary><ul className="v4-impact-observations">{Object.values(A).map((text,i)=><li key={text}><span>{String(i+1).padStart(2,'0')}</span><p>{text}</p></li>)}</ul></details>
        <details><summary><span>Standards & Accountability</span><span>{v.reportCompliance.filter(c=>c.met).length} of {v.reportCompliance.length} targets met</span><Go kind="expand"/></summary><div className="v4-compliance-table">{v.reportCompliance.map(c=><div key={c.metric}><strong>{c.metric}</strong><span>{c.result}</span><small>Target {c.target}</small><b>{c.met ? '✓ Met' : '○ In progress'}</b></div>)}</div><div className="v4-asca-ledger">{v.asca.map(c=><section key={c.title}><h3>{c.title}</h3><ul>{c.full.map(text=><li key={text}>{text}</li>)}</ul></section>)}</div><p className="v4-source-note">ASCA National Model alignment · 4th edition</p></details>
      </div>
      <DrillPanel drill={drill} onClose={() => setDrill(null)} />
      {report && <PrincipalReport v={v} who={who} role={role} school={school} kind={report} onClose={() => setReport(false)} />}
    </div>
    </SurfaceState>
  );
}
