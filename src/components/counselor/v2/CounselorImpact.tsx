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

import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Printer, Share2, FileBarChart, CheckCircle2, AlertTriangle, Mail, Copy } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { attentionReason, getRoster, DEMO_SCHOOL, type CounselorStudent, type PostsecondaryIntent } from "@/lib/counselorRoster";
import { counselorAccountSnapshot, serverCounselorAccountSnapshot, subscribeCounselorAccount } from "@/lib/counselorAccount";
import { Tip } from "@/components/app/IconTip";
import { Go } from "../chips";
import { BRAND, Crest, FullScreenDocument, PAGE_H, PAGE_W, SANS, SERIF, printDocumentPage } from "./DocumentDesk";
import { PAPER_VARS } from "./DocumentPreview";
import { DrillPanel, type Drill, type DrillStudent } from "./Drill";
import { QUESTIONS, ANNOUNCEMENTS } from "./CounselorConnect";
import { useRouter } from "next/navigation";
import { SurfaceState } from "@/components/app/SurfaceState";
import { useCounselorFilters } from "../shell";
import { COUNSELOR_COVER, COUNSELOR_HEADSHOTS, CounselorHeadshot, seededPick } from "./MyImpact";
import { Listbox } from "@/components/app/Listbox";

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
    // Maisha's four milestone stats (her labels and sublines). `extra` is
    // what only our page had: it opens in the section's drill.
    milestones: [
      { value: careerPct, label: "Career Reports Approved", note: "", extra: `${p.careerReports} of ${p.caseload} students` },
      { value: academicPct, label: "Academic Plans Approved", note: "", extra: `${p.academicPlans} of ${p.caseload} students` },
      { value: resumePct, label: "Résumés Complete (Gr. 10+)", note: `${p.resumes} of 90 students`, extra: `${p.resumes} of 90 in Grades 10-12` },
      { value: seniorPct, label: "Senior Plan Compliance", note: "30 seniors · district target: 80%", extra: `${p.seniorsApplying} of 30 applying · target 80%` },
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
      { title: "Social-Emotional Development", short: "Social-emotional", items: [`Student Support: ${p.flags} actively monitored`, `Counselor Connect: ${responseRatePct}% response rate`, `At-Risk Support: ${p.atRisk} students flagged`], keys: [`${p.flags}`, `${responseRatePct}%`, `${p.atRisk} students`], full: [`${p.flags} students identified and actively monitored for support`, `${responseRatePct}% student question response rate via Counselor Connect`, `${p.atRisk} at-risk students flagged for proactive intervention`] },
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
    // Maisha's eight one-line achievements (her wording, this period's
    // figures); the longer sentences above open in the section's drill.
    highlights: [
      { key: `${seniorPct}%`, rest: "senior postsecondary plan rate" },
      { key: `${onTrackPct}%`, rest: "of caseload academically on track" },
      { key: `${t}-day`, rest: "average plan review turnaround" },
      { key: `${p.seniorsApplying} of 30`, rest: "seniors actively applying" },
      { key: `${responseRatePct}%`, rest: "Counselor Connect response rate" },
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
const FLAT_CARD_CLASS = "rounded-[var(--radius-md)] border";
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
        <span tabIndex={0} role="img" aria-label={tip} onClick={onOpen} className="block h-full w-full cursor-pointer rounded-r-[4px] outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--primary)]" />
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
    <div className={`flex min-w-0 flex-col gap-[4px] ${center ? "items-center text-center" : ""}`}>
      <span className={`${FIGURE_SIZE[size]} font-bold tabular-nums`} style={{ fontFamily: "var(--font-display)", color: INK }}>{value}</span>
      <span className="text-[12px] leading-[16px] font-medium" style={{ color: INK_MEDIUM }}>{label}</span>
      {note && <span className="text-[12px] leading-[16px]" style={{ color: INK_QUIET }}>{note}</span>}
    </div>
  );
}

/** One section, one flat card. The whole card opens the section's drill: a
 *  corner chevron (quiet until hover or keyboard focus) is the keyboard
 *  target and its ::before stretches over the card. No "Details" pill. */
function SectionCard({ title, unit, onOpen, children }: { title: string; unit?: string; onOpen?: () => void; children: React.ReactNode }) {
  return (
    <section className={`${FLAT_CARD_CLASS} group relative flex h-full flex-col gap-[var(--space-2)] p-[var(--space-4)] sm:p-[var(--space-6)] ${onOpen ? "has-[button:focus-visible]:outline-2 has-[button:focus-visible]:outline-offset-2 has-[button:focus-visible]:outline-[var(--primary)] hover:!border-[color-mix(in_srgb,var(--foreground)_24%,transparent)] transition-colors duration-150" : ""}`} style={FLAT_CARD}>
      <div className="flex items-center justify-between gap-[10px]">
        <h2 className="min-w-0 text-[14px] leading-[20px] font-semibold" style={{ color: INK }}>
          {title}
          {unit && <span className="ml-[8px] text-[12px] leading-[16px] font-normal" style={{ color: INK_QUIET }}>{unit}</span>}
        </h2>
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

export function CounselorImpact() {
  const account = useSyncExternalStore(subscribeCounselorAccount, counselorAccountSnapshot, serverCounselorAccountSnapshot);
  const who = account.name || "Sarah Chen";
  const role = account.role || "School Counselor";
  const school = account.school || DEMO_SCHOOL;
  const router = useRouter();
  const { setStatusFilter, setPlanFilter } = useCounselorFilters();
  const [report, setReport] = useState(false);
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
  const hdrBtn = { background: "rgba(9,10,20,0.55)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", borderColor: "rgba(255,255,255,0.18)", color: "#FFFFFF" } as const;
  const sub = (s: string) => `${s} · ${v.label}`;
  const A = v.achievements;

  // One drill per section card, not per number. What a section's card no
  // longer shows (the Replit's longer sentences, pending counts, the school
  // average, student lists) is in its drill.
  const drills = {
    caseload: (): Drill => ({ title: "Caseload", subtitle: sub(`${v.caseload} students, Grades 9 to 12`), rowsLabel: "By grade", rows: v.grades.map((g) => ({ label: `Grade ${g.grade}`, value: `${g.total} students` })), stats: [{ value: String(v.onTrack), label: "on track" }, { value: String(v.caseload - v.onTrack), label: "need attention or at risk" }], action: { label: "Open Students", onClick: go("students") } }),
    onTrack: (): Drill => ({ title: "On track", subtitle: sub(`${v.onTrackPct}% of the caseload · school average ${SCHOOL_AVG_ON_TRACK}%`), lead: A.onTrack, rowsLabel: "On track by grade", rows: v.grades.map((g) => ({ label: `Grade ${g.grade}`, value: `${g.onTrack} of ${g.total}`, pct: (g.onTrack / g.total) * 100 })), students: list(notOnTrack.map((s) => ds(s, attentionReason(s)))), studentsLabel: `${notOnTrack.length} not on track`, action: { label: "Open these students", onClick: go("students", () => setStatusFilter("At Risk")) } }),
    plans: (): Drill => ({ title: "Postsecondary plans", subtitle: sub(`${v.withPlan} of ${v.caseload} declared · target 80%`), rowsLabel: "By pathway", rows: v.pathways.map((p) => ({ label: p.label, value: String(p.count), pct: (p.count / v.caseload) * 100 })), students: list(roster.filter((s) => s.postsecondaryIntent === "Undecided").map((s) => ds(s, "Undecided"))), studentsLabel: `${v.pathways[5].count} undecided`, action: { label: "Open undecided students", onClick: go("students", () => setPlanFilter("Undecided")) } }),
    answered: (): Drill => ({ title: "Student questions", subtitle: sub(`${v.answered[0]} of ${v.answered[1]} answered`), lead: A.answered, items: live ? QUESTIONS.slice(0, 8).map((q) => `${q.name}: ${q.question}`) : undefined, itemsLabel: "Recent questions", action: { label: "Open Counselor Connect", onClick: go("connect") } }),
    pathways: (): Drill => ({ ...drills.plans(), title: "Postsecondary plans by pathway" }),
    progress: (): Drill => ({ title: "Caseload progress by grade", subtitle: sub(`${v.overallAvg}% average plan completion · ${v.onTrack} of ${v.caseload} on track`), rowsLabel: "Average plan completion", rows: v.grades.map((g) => ({ label: `Grade ${g.grade} · ${g.onTrack} of ${g.total} on track`, value: `${g.avg}%`, pct: g.avg })), students: list(notOnTrack.map((s) => ds(s, attentionReason(s)))), studentsLabel: `${notOnTrack.length} not on track`, action: { label: "Open the Milestone Tracker", onClick: go("milestones") } }),
    readiness: (): Drill => ({ title: "Readiness milestones", subtitle: sub("College and career readiness"), lead: A.senior, rowsLabel: "Done across the caseload", rows: v.milestones.map((m) => ({ label: `${m.label} · ${m.extra}`, value: `${m.value}%`, pct: m.value })), items: [A.applying], itemsLabel: "Seniors applying", students: list(seniors.filter((s) => s.postsecondaryIntent === "Undecided").map((s) => ds(s, "No plan declared yet"))), studentsLabel: "Seniors still without a plan", action: { label: "Open the Milestone Tracker", onClick: go("milestones") } }),
    work: (): Drill => ({ title: "Counselor activity", subtitle: sub("Reviews, questions, announcements and flags"), lead: A.turnaround, stats: [{ value: String(v.reviewed), label: "plans reviewed" }, { value: String(v.pending), label: "still pending" }, { value: `${v.responseRatePct}%`, label: `questions answered (${v.answered[0]} of ${v.answered[1]})` }, { value: String(v.announcements), label: "announcements, school-wide" }], items: [A.flagged, ...(live ? ANNOUNCEMENTS.map((a) => `${a.title} · ${a.read}% read`) : [])], itemsLabel: "Support flags and announcements", students: list(flagged.map((s) => ds(s, s.supportFlagReason ?? ""))), studentsLabel: "Flagged students", action: { label: "Open Review Queue", onClick: go("review-queue") } }),
    activities: (): Drill => ({ title: "Student activity on Dreamari", subtitle: sub("this reporting period"), lead: A.activities, rowsLabel: "By activity", rows: v.engagement.map((e) => ({ label: e.label, value: fmt(e.value), pct: (e.value / v.engagement[0].value) * 100 })), items: [A.touchpoints], itemsLabel: "Touchpoints", action: { label: "Open Platform Engagement", onClick: go("engagement") } }),
    asca: (): Drill => ({ title: "ASCA National Model alignment", subtitle: sub("4th Ed."), items: v.asca.flatMap((c) => c.full.map((f) => `${c.short}: ${f}`)), itemsLabel: "What the caseload shows", action: { label: "Open the Milestone Tracker", onClick: go("milestones") } }),
    achievements: (): Drill => ({ title: "Notable achievements", subtitle: sub("In full"), items: Object.values(A), itemsLabel: "The Replit's wording", action: { label: "Open the Principal report", onClick: () => { setDrill(null); setReport(true); } } }),
    compliance: (): Drill => ({ title: "District compliance", subtitle: sub("All five measures in the Principal report"), items: v.reportCompliance.map((r) => `${r.metric}: ${r.result} (target ${r.target}) · ${r.met ? "Met" : "In progress"}`), itemsLabel: "Measures", action: { label: "Open the Principal report", onClick: () => { setDrill(null); setReport(true); } } }),
  };
  const open = (d: Drill) => setDrill(d);

  const headlines = [
    { value: String(v.caseload), label: "Total Caseload", note: "students", drill: drills.caseload },
    { value: `${v.onTrackPct}%`, label: "On-Track Rate", note: "of caseload on pace", drill: drills.onTrack },
    { value: `${v.withPlanPct}%`, label: "Postsecondary Plans", note: "students with declared plan", drill: drills.plans },
    { value: `${v.responseRatePct}%`, label: "Question Response Rate", note: "student inquiries answered", drill: drills.answered },
  ];
  const statRow = "grid grid-cols-2 gap-x-[var(--space-4)] gap-y-[var(--space-4)]";

  return (
    // COMPONENT_INVENTORY row 62: this screen's own data is always seeded
    // (fixed reporting periods), so real emptiness only shows up once a
    // school genuinely has no caseload -- wrapped in SurfaceState both for
    // that real case and so `?state=loading|error&surface=62` can preview
    // the states this always-populated demo data never reaches on its own.
    <SurfaceState id={62} isEmpty={v.caseload === 0} onEmptyAction={() => router.push("/counselor?view=schools")}>
    <div className="flex flex-col gap-[var(--space-6)]">
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

      {/* The reporting period: one slim line under the hero (it replaces the
         sticky section index that used to carry it). */}
      <div className="flex flex-wrap items-center gap-x-[var(--space-3)] gap-y-[6px] print:hidden">
        <span className="text-[13px] font-semibold" style={{ color: INK_MEDIUM }}>Reporting period</span>
        <Listbox ariaLabel="Reporting period" value={periodKey} onChange={(k) => { setPeriodKey(k as PeriodData["key"]); setDrill(null); }} options={PERIODS.map((p) => ({ value: p.key, label: `${p.label} · ${p.range}` }))} className="flex h-9 min-w-[230px] flex-1 cursor-pointer items-center justify-between gap-[8px] rounded-[var(--radius-sm)] border px-[10px] text-left text-[13px] font-semibold sm:flex-none" style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" }} />
      </div>

      {/* 1. Four headline cards: number, label, one line. */}
      <div className="grid grid-cols-2 gap-[var(--space-4)] lg:grid-cols-4">
        {headlines.map((h) => (
          <button key={h.label} type="button" onClick={() => open(h.drill())} aria-label={`${h.label}: details`} className={`${FLAT_CARD_CLASS} group relative flex h-full w-full cursor-pointer flex-col px-[var(--space-4)] pt-[var(--space-5)] pb-[var(--space-4)] text-left sm:px-[var(--space-6)] ${FLAT_CARD_HOVER}`} style={FLAT_CARD}>
            <Figure value={h.value} label={h.label} note={h.note} />
            <Go kind="open" className="absolute top-[14px] right-[14px] opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100" />
          </button>
        ))}
      </div>

      {/* 2. Plans by pathway and progress by grade, side by side. */}
      <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-2">
        <SectionCard title="Postsecondary Plans by Pathway" onOpen={() => open(drills.pathways())}>
          <ul className="flex flex-col">
            {v.pathways.map((p) => {
              // rank by size among the declared pathways: 0 = the largest
              const rank = v.pathways.filter((o) => o.label !== "Undecided" && o.count > p.count).length;
              const share = pct(p.count, v.caseload);
              const tip = `${p.label}: ${p.count} ${p.count === 1 ? "student" : "students"} (${share}%)`;
              return (
                <li key={p.label} className="flex items-center">
                  <span className="w-[92px] flex-none pr-[6px] text-right text-[11px] leading-[13px] sm:w-[128px]" style={{ color: INK_MEDIUM }}>{p.label}</span>
                  <span aria-hidden className="h-px w-[4px] flex-none" style={{ background: "var(--glass-border)" }} />
                  <HBar count={p.count} of={v.caseload} tip={tip} tone={p.label === "Undecided" ? "neutral" : rank} onOpen={() => open(drills.pathways())} />
                </li>
              );
            })}
          </ul>
          <p className="mt-auto text-center text-[12px] leading-[16px]" style={{ color: INK_QUIET }}><Key>{v.withPlan} of {v.caseload}</Key> students (<Key>{v.withPlanPct}%</Key>) have a declared postsecondary path</p>
        </SectionCard>
        <SectionCard title="Caseload Progress by Grade Level" onOpen={() => open(drills.progress())}>
          <ul className="flex flex-col gap-[var(--space-4)]">
            {v.grades.map((g) => (
              <li key={g.grade} className="flex flex-col gap-[4px]">
                <span className="flex flex-wrap items-baseline justify-between gap-x-[10px] text-[12px] leading-[16px]">
                  <span className="font-medium" style={{ color: INK_MEDIUM }}>Grade {g.grade}</span>
                  <span className="tabular-nums" style={{ color: INK_QUIET }}>{g.onTrack}/{g.total} on track · {g.avg}% avg completion</span>
                </span>
                <Bar pct={g.avg} />
              </li>
            ))}
          </ul>
          <p className="mt-auto text-[12px] leading-[16px]" style={{ color: INK_QUIET }}>Overall average plan completion: <Key>{v.overallAvg}%</Key></p>
        </SectionCard>
      </div>

      {/* 3. Readiness milestones: four flat stats and the one highlighted line. */}
      <SectionCard title="College & Career Readiness Milestones" onOpen={() => open(drills.readiness())}>
        <div className={`${statRow} lg:grid-cols-4`}>
          {v.milestones.map((m) => <Figure key={m.label} value={`${m.value}%`} label={m.label} note={m.note || undefined} center />)}
        </div>
        <InfoLine><Key>{v.seniorsApplying} of 30 seniors</Key> have college or postsecondary applications in progress or submitted. Senior postsecondary plan rate of <Key>{v.seniorPct}%</Key> {v.seniorPct >= 80 ? "meets" : "approaches"} the district 80% target.</InfoLine>
      </SectionCard>

      {/* 4. Counselor activity: four flat stats and the turnaround line. */}
      <SectionCard title="Counselor Activity & Accountability" onOpen={() => open(drills.work())}>
        <div className={`${statRow} lg:grid-cols-4`}>
          {v.activity.map((a) => <Figure key={a.label} size="md" value={a.value} label={a.label} note={a.note || undefined} />)}
        </div>
        <InfoLine>Average plan review turnaround: <Key>{v.turnaround.toFixed(1)} days</Key> vs. district standard of 5 business days.</InfoLine>
      </SectionCard>

      {/* 5. Platform engagement: five flat stats and one caption. */}
      <SectionCard title="Platform-Facilitated Student Engagement" onOpen={() => open(drills.activities())}>
        <div className={`${statRow} sm:grid-cols-3 lg:grid-cols-5`}>
          {v.engagement.map((e) => <Figure key={e.label} value={fmt(e.value)} label={e.label} size="md" center />)}
        </div>
        <p className="text-[12px] leading-[16px]" style={{ color: INK_QUIET }}>All engagement activity was generated by students in {who}&apos;s caseload through the Dreamari platform during this reporting period.</p>
      </SectionCard>

      {/* 6. ASCA: three plain columns split by hairlines, three lines each. */}
      <SectionCard title="ASCA National Model Alignment" unit="4th Ed." onOpen={() => open(drills.asca())}>
        <div className="grid grid-cols-1 sm:grid-cols-3">
          {v.asca.map((c, i) => (
            <div key={c.title} className={`flex flex-col gap-[var(--space-2)] ${i > 0 ? "mt-[var(--space-4)] border-t pt-[var(--space-4)] sm:mt-0 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-[var(--space-5)]" : "sm:pr-[var(--space-5)]"}`} style={{ borderColor: HAIRLINE }}>
              <h3 className="text-[12px] leading-[16px] font-semibold" style={{ color: INK_MEDIUM }}>{c.title}</h3>
              <ul className="flex flex-col gap-[6px]">
                {c.items.map((it, j) => <li key={it} className="text-[12px] leading-[16px]" style={{ color: INK_MEDIUM }}><WithKey text={it} k={c.keys[j]} /></li>)}
              </ul>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* 7. Notable achievements: plain lines, key figure strong, two columns
         on wide screens, hairlines between rows. */}
      <SectionCard title={`Notable Achievements · ${v.label}`} onOpen={() => open(drills.achievements())}>
        <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-x-[var(--space-8)]">
          {[v.highlights.slice(0, 4), v.highlights.slice(4)].map((col, ci) => (
            <ul key={ci} className="flex flex-col">
              {col.map((h, hi) => (
                <li key={h.key + h.rest} className={`py-[10px] text-[14px] leading-[20px] ${hi > 0 ? "border-t" : ci > 0 ? "max-sm:border-t sm:pt-0" : "pt-0"}`} style={{ borderColor: HAIRLINE, color: INK_MEDIUM }}>
                  <Key>{h.key}</Key> {h.rest}
                </li>
              ))}
            </ul>
          ))}
        </div>
      </SectionCard>

      {/* 8. District compliance: three items, value, label, target, and the
         status as a dot plus a quiet word (the only place the status colours
         appear). */}
      <SectionCard title="District Compliance Summary" onOpen={() => open(drills.compliance())}>
        <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-3">
          {v.compliance.map((c) => (
            <div key={c.label} className="flex min-w-0 flex-col gap-[4px]">
              <span className="text-[18px] leading-[28px] font-bold tabular-nums" style={{ fontFamily: "var(--font-display)", color: INK }}>{c.value}</span>
              <span className="text-[12px] leading-[16px] font-medium" style={{ color: INK_MEDIUM }}>{c.label}</span>
              <span className="flex flex-wrap items-center gap-x-[6px] text-[12px] leading-[16px]" style={{ color: INK_QUIET }}>
                <span aria-hidden className="size-[6px] flex-none rounded-full" style={{ background: c.met ? MET : OPEN }} />
                {c.met ? "Met" : "In progress"}
                <span aria-hidden>·</span>
                {c.target}
              </span>
            </div>
          ))}
        </div>
      </SectionCard>

      <DrillPanel drill={drill} onClose={() => setDrill(null)} />
      {report && <PrincipalReport v={v} who={who} role={role} school={school} onClose={() => setReport(false)} />}
    </div>
    </SurfaceState>
  );
}
