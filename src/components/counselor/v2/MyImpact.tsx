"use client";
/* eslint-disable @next/next/no-img-element -- the hero's cover photo is a plain absolutely-positioned background layer, same as ProfileExperience's own cover; next/image's `fill` mode buys nothing here. */

// DEMO-ONLY v2 fork of ../MyImpact.tsx (24 Sept 2026). v1 stays untouched so the
// two builds can be compared live via the bottom-center version chip
// (../version.tsx).
//
// Rebuilt 25 Sept 2026 (direct feedback: "My Impact etc are especially
// cluttered ... a huge overload of information at once with so much copy").
// The report a counselor hands a principal answers one question: did this
// period move the numbers? So: a scorecard of the four outcomes against
// their targets as the hero, one row of the counselor's own activity, one
// row of student engagement, grades as bars that open the roster, and the
// ASCA framing as three short columns. Each number once; no sentences.
// Dropped from the reference: the pathway bar list (the Overview's donut
// already shows it), the milestone stat tiles (folded into the scorecard),
// the achievements list and compliance summary (restated the page).
//
// Tabbed 25 Sept 2026 (direct instruction: "for My Impact, we can do the
// tabbed version and have the export just compile everything together
// when that is needed. So its easy on UI load and the report brings
// everything together when exported" -- then, same day: "let's do tabbed
// UI to reduce cognitive load wherever necessary. ONLY wherever
// necessary."). The Outcomes scorecard is the one thing a counselor reads
// every time, so it stays outside the tabs, always visible. Everything
// else -- activity/engagement, the grade (and counselor) breakdown, the
// ASCA framing -- is one glance at a time on screen (`Segmented`, the same
// tab control the Milestone Tracker's grade picker uses). Print, Share and
// Principal report all rely on the browser's print/PDF path
// (`window.print()`): a `hidden print:block` compiled version, built from
// the exact same section renderers as the tabs, stacks every section
// together for that path, so the report a principal receives is complete
// even though the screen only ever shows one section.

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCounselorFilters } from "../shell";
import { Printer, Share2, FileBarChart, BookOpen, Briefcase, Heart, UserRound } from "lucide-react";
import { BarChart, Ring, Segmented, SegmentedRing } from "@/components/connect/viz";
import { DEMO_SCHOOL, type PostsecondaryIntent } from "@/lib/counselorRoster";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { readCounselorAccount } from "@/lib/counselorAccount";
import { QUESTIONS, ANNOUNCEMENTS } from "./CounselorConnect";

import { OverviewCard, Verdict, alertColor } from "./overviewShared";
import { CardLink, Go } from "../chips";
import { GLASS_INSET } from "../surfaces";
import { Disclosure } from "./Disclosure";
import { BLUE_3, BLUE_5, NEUTRAL_SLICE, PRIMARY, TARGET_LINE } from "../palette";
import { SCHOOL_COUNSELORS, SCHOOL_TARGETS, TARGET_LABELS, counselorFor, readinessMetrics, targetBand, type TargetKey } from "@/lib/counselorOrg";
const GRADES = [9, 10, 11, 12];

// A real photo, not the illustrated black/white portrait the roster wears
// everywhere else (direct instruction: "Add a photo avatr and cover image
// to the my impact screen like we did for student profiles. Use one of
// the ehadshots not the black and white style avatarrs we have") -- the
// counselor is an adult professional, not a student, so this borrows a
// couple of Connect's real headshot photos and the student profile page's
// own cover-photo pool (both already-shipped, real assets) rather than
// inventing a third avatar system. No account field for this exists yet
// (CounselorAccount has no photo/cover), so both are a deterministic pick
// off the counselor's own name -- the same "no backend, seeded pick"
// convention avatarIndexForName already uses for students.
const COUNSELOR_HEADSHOTS = ["/images/connect/avatars/pro-rossi.jpg", "/images/connect/avatars/pro-martinez.jpg", "/images/connect/avatars/pro-tanaka.jpg", "/images/connect/avatars/pro-brooks.jpg", "/images/connect/avatars/pro-desai.png", "/images/connect/avatars/pro-cole.jpg"];
// One pinned, vibrant cover rather than a seeded pick (direct instruction:
// "use a better cover image for sarah chen too. Something vibrant") -- the
// seeded pool had landed on a dark bokeh shot for Lincoln High.
const COUNSELOR_COVER = "/images/profile/covers/fluid-paint.webp";
function seededPick<T>(seed: string, pool: T[]): T {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  return pool[Math.abs(hash) % pool.length];
}

function CounselorHeadshot({ src, size = 64 }: { src: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <span className="flex flex-none items-center justify-center rounded-full border-2" style={{ width: size, height: size, borderColor: "rgba(255,255,255,0.9)", background: "color-mix(in srgb, var(--primary) 22%, var(--card))" }}>
        <UserRound className="h-1/2 w-1/2" style={{ color: "var(--muted-foreground)" }} aria-hidden />
      </span>
    );
  }
  return (
    <Image
      key={src}
      src={src}
      alt=""
      width={128}
      height={128}
      className="flex-none rounded-full border-2 object-cover"
      style={{ width: size, height: size, borderColor: "rgba(255,255,255,0.9)" }}
      onError={() => setFailed(true)}
    />
  );
}

// Supporting text on this page is Inter, not the page-wide Bricolage
// default (direct feedback: "Review average 2.1 days etc can be inter font
// and more concise"). Bricolage stays on the big numbers only, so the type
// hierarchy is number, then label, then note, top-down by size.
const BODY = { fontFamily: "var(--font-body)" } as const;

// Everything below Outcomes is grouped, not listed (direct feedback:
// "So many numbers and clutter and competing for attention" and then
// "consolidate data better, group them better, dont just display
// everything all at once with 50 lines and copy and bars"). Three summary
// cards, each ONE headline or ONE small chart, with the rest of its facts
// folded behind "Details" -- every v1 fact is still one click away, and
// the print report opens all of them.

/** A card's one headline figure. */
function Headline({ value, label }: { value: string; label: string }) {
  return (
    <span className="flex flex-wrap items-baseline gap-x-[8px]">
      <span className="text-[28px] leading-[1] font-extrabold whitespace-nowrap tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{value}</span>
      <span className="text-[13px] font-semibold" style={{ ...BODY, color: "var(--muted-foreground)" }}>{label}</span>
    </span>
  );
}

/** One quiet row: label left, value right, hairline between rows.
 *  Clickable when given `onClick` (opens the students behind it). */
function ListRow({ label, value, dot, onClick }: { label: string; value: string; dot?: string; onClick?: () => void }) {
  const body = (
    <>
      <span className="flex min-w-0 items-center gap-[8px]">
        {dot && <span aria-hidden className="size-[8px] flex-none rounded-full" style={{ background: dot }} />}
        <span className="truncate text-[12.5px] font-medium" style={{ ...BODY, color: "var(--foreground)" }}>{label}</span>
      </span>
      <span className="flex flex-none items-center gap-[6px] text-[12.5px] font-bold tabular-nums" style={{ ...BODY, color: "var(--foreground)" }}>{value}{onClick && <Go />}</span>
    </>
  );
  return (
    <li className="border-t py-[7px] first:border-t-0 first:pt-0 last:pb-0" style={{ borderColor: "var(--glass-border)" }}>
      {onClick ? (
        <button type="button" onClick={onClick} className="dm-quiet -mx-[6px] flex w-[calc(100%+12px)] cursor-pointer items-center justify-between gap-[12px] rounded-[var(--radius-sm)] px-[6px] py-[2px] text-left">{body}</button>
      ) : (
        <span className="flex items-center justify-between gap-[12px]">{body}</span>
      )}
    </li>
  );
}

/** A rate or a comparison: short label, value, one thin bar. `muted`
 *  draws the bar in the neutral (a benchmark, not a result). */
function BarRow({ label, value, pct, muted, tick }: { label: string; value: string; pct: number; muted?: boolean; /** a benchmark tick, as % of the bar */ tick?: number }) {
  const color = muted ? NEUTRAL_SLICE : PRIMARY;
  return (
    <li className="flex flex-col gap-[5px]">
      <span className="flex items-baseline justify-between gap-[12px] text-[12.5px]" style={BODY}>
        <span className="truncate font-medium" style={{ color: muted ? "var(--muted-foreground)" : "var(--foreground)" }}>{label}</span>
        <span className="flex-none font-bold tabular-nums" style={{ color: muted ? "var(--muted-foreground)" : "var(--foreground)" }}>{value}</span>
      </span>
      <span className="relative block h-[6px] w-full rounded-full" style={{ background: "color-mix(in srgb, var(--foreground) 10%, transparent)" }} aria-hidden>
        <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${Math.max(0, Math.min(100, pct))}%`, background: muted ? color : `linear-gradient(90deg, color-mix(in srgb, ${color} 35%, transparent), ${color})` }} />
        {typeof tick === "number" && <span className="absolute top-[-3px] bottom-[-3px] w-[2px] rounded-[1px]" style={{ left: `calc(${tick}% - 1px)`, background: TARGET_LINE }} />}
      </span>
    </li>
  );
}

/** Parts of one whole: a single bar, one segment per category. */
function CompositionBar({ parts }: { parts: { label: string; value: number; color: string }[] }) {
  const sum = parts.reduce((a, p) => a + p.value, 0) || 1;
  return (
    <span className="flex h-[12px] w-full gap-[2px] overflow-hidden rounded-full" role="img" aria-label={parts.map((p) => `${p.label} ${p.value}`).join(", ")}>
      {parts.filter((p) => p.value > 0).map((p) => <span key={p.label} className="h-full" style={{ width: `${(p.value / sum) * 100}%`, background: p.color }} />)}
    </span>
  );
}

/** A summary card: its one headline/chart always, its details folded (and
 *  always open in print). */
function SummaryCard({ id, title, unit, children, details }: { id: string; title: string; unit?: string; children: React.ReactNode; details: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <OverviewCard title={title} unit={unit}>
      {children}
      <div className="mt-auto print:hidden">
        <Disclosure id={id} title="Details" open={open} onToggle={() => setOpen((v) => !v)}>
          <ul className="flex flex-col">{details}</ul>
        </Disclosure>
      </div>
      <ul className="hidden flex-col print:flex">{details}</ul>
    </OverviewCard>
  );
}

// One outcome as a glanceable tile: the percentage is the headline, the
// target and the counts drop to a single muted line, and the tile itself
// opens the students behind the number (direct feedback on the old rows:
// "too wordy and text heavy and not glanceable. No actionable cta").
function OutcomeTile({ label, value, target, note, toGo, onClick }: { label: string; value: number | null; target: number; note: string; /** students still needed to reach the target, when below it */ toGo: number; onClick: () => void }) {
  const alert = value === null ? undefined : alertColor(value, target);
  return (
    <button type="button" onClick={onClick} className="dm-quiet flex min-w-0 cursor-pointer items-center gap-[14px] rounded-[var(--radius-md)] border p-[14px] text-left" style={GLASS_INSET}>
      {/* A rate of one caseload reads as a ring (share of a whole), not a
         bar filling toward nothing. */}
      <Ring pct={value ?? 0} size={68} stroke={7} accent={alert ?? PRIMARY}>
        <span className="text-[16px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: alert ?? "var(--foreground)" }}>{value === null ? "n/a" : `${value}%`}</span>
      </Ring>
      <span className="flex min-w-0 flex-1 flex-col gap-[3px]" style={BODY}>
        <span className="flex items-center justify-between gap-[6px]">
          <span className="truncate text-[13px] font-bold" style={{ color: "var(--foreground)" }}>{label}</span>
          <Go />
        </span>
        <span className="text-[11.5px] font-medium" style={{ color: "var(--muted-foreground)" }}>{note} · target {target}%</span>
        {toGo > 0 && <span className="text-[11.5px] font-bold" style={{ color: alert }}>{toGo} to go</span>}
      </span>
    </button>
  );
}

type ImpactTab = "outcomes" | "activity" | "readiness" | "asca";
const PATHWAY_ORDER: PostsecondaryIntent[] = ["4-Year College", "2-Year College", "Trade/Technical School", "Military", "Workforce", "Undecided"];

// `scope="school"` is the Lead Counselor's School Impact: the same report
// for the whole school, headed by the school, with a by-counselor card.
export function MyImpact({ scope = "mine" }: { scope?: "mine" | "school" }) {
  const router = useRouter();
  const { setGradeFilter, setCounselorFilter, setStatusFilter, setPlanFilter } = useCounselorFilters();
  const roster = useReviewedRoster();
  const account = readCounselorAccount();
  const who = scope === "school" ? (account.school || DEMO_SCHOOL) : (account.name || "Sarah Chen");
  const m = readinessMetrics(roster);
  const total = roster.length || 1;
  const [tab, setTab] = useState<ImpactTab>("outcomes");

  const respondedQuestions = QUESTIONS.filter((q) => q.status === "responded" || q.status === "resolved").length;
  const responseRatePct = Math.round((respondedQuestions / QUESTIONS.length) * 100);
  const reviewableKeys = ["Career Report", "Academic Plan", "Resume"] as const;
  const plansReviewed = roster.reduce((sum, s) => sum + reviewableKeys.filter((k) => s.milestones[k] === "Approved" || s.milestones[k] === "Changes Requested").length, 0);
  const plansApproved = roster.reduce((sum, s) => sum + reviewableKeys.filter((k) => s.milestones[k] === "Approved").length, 0);
  const plansPending = roster.reduce((sum, s) => sum + reviewableKeys.filter((k) => s.milestones[k] === "Pending Review").length, 0);
  // v1's own definition (an active support flag), so both builds report the
  // same number for "students monitored for support".
  const monitored = roster.filter((s) => s.supportFlagReason).length;
  const monitoredPct = Math.round((monitored / total) * 100);
  const atRiskCount = roster.filter((s) => s.status === "At Risk").length;
  const careerReportApproved = roster.filter((s) => s.milestones["Career Report"] === "Approved").length;
  const academicPlanApproved = roster.filter((s) => s.milestones["Academic Plan"] === "Approved").length;
  const careerReportPct = Math.round((careerReportApproved / total) * 100);
  const academicPlanPct = Math.round((academicPlanApproved / total) * 100);
  const gr10Plus = roster.filter((s) => s.grade >= 10);
  const resumeApproved = gr10Plus.filter((s) => s.milestones.Resume === "Approved").length;
  const resumePct = gr10Plus.length ? Math.round((resumeApproved / gr10Plus.length) * 100) : 0;
  // v1's definition: applications in progress or submitted.
  const seniorRows = roster.filter((s) => s.grade === 12);
  const seniorsApplying = seniorRows.filter((s) => ["In Progress", "Completed", "Approved", "Pending Review"].includes(s.milestones.Applications)).length;
  const overallAvgCompletion = Math.round(roster.reduce((sum, s) => sum + s.roadmapPct, 0) / total);
  const pathway = PATHWAY_ORDER.map((p) => ({ label: p, count: roster.filter((s) => s.postsecondaryIntent === p).length }));

  const engagement = { drops: 0, sims: 0, careers: 0, colleges: 0, posts: 0 };
  for (const s of roster) {
    engagement.drops += s.engagement.dailyDropsCompleted;
    engagement.sims += s.engagement.simulations;
    engagement.careers += s.engagement.careersSaved;
    engagement.colleges += s.engagement.collegesSaved;
    engagement.posts += s.engagement.communityPosts;
  }

  // Fixed reference figure from the Replit reference ("well above the
  // school average of 71%"), the same convention as "Reviews average 2.1
  // days" below -- a comparator the backend eventually computes for real.
  const SCHOOL_AVERAGE_ON_TRACK = 71;
  // Each outcome opens the students behind it -- the ones still keeping it
  // below target -- instead of only reporting it.
  const openStudents = (opts: { grade?: 12; plan?: "Undecided"; status?: "At Risk" }) => () => {
    if (opts.grade) setGradeFilter(opts.grade);
    if (opts.plan) setPlanFilter(opts.plan);
    if (opts.status) setStatusFilter(opts.status);
    router.push("/counselor?view=students");
  };
  const outcomes: { key: TargetKey; value: number | null; note: string; count: number; of: number; open: () => void }[] = [
    { key: "onTrack", value: m.onTrackPct, note: `${m.onTrack} of ${m.students} · school avg ${SCHOOL_AVERAGE_ON_TRACK}%`, count: m.onTrack, of: m.students, open: openStudents({ status: "At Risk" }) },
    { key: "plansOnFile", value: m.withPlanPct, note: `${m.withPlan} of ${m.students}`, count: m.withPlan, of: m.students, open: openStudents({ plan: "Undecided" }) },
    { key: "seniorPlan", value: m.seniors ? m.seniorPlanPct : null, note: `${m.seniorsCompliant} of ${m.seniors} seniors`, count: m.seniorsCompliant, of: m.seniors, open: openStudents({ grade: 12, plan: "Undecided" }) },
    { key: "fafsa", value: m.seniors ? m.fafsaPct : null, note: `${m.fafsaDone} of ${m.seniors} seniors`, count: m.fafsaDone, of: m.seniors, open: openStudents({ grade: 12 }) },
  ];
  /** Students still needed to reach this outcome's target. */
  const toGo = (o: (typeof outcomes)[number]) => Math.max(0, Math.ceil((SCHOOL_TARGETS[o.key] / 100) * o.of) - o.count);
  const SHORT_LABEL: Record<TargetKey, string> = { onTrack: "On-track", plansOnFile: "Plans", seniorPlan: "Senior plans", fafsa: "FAFSA", activeStudents: "Active students" };
  type Measured = (typeof outcomes)[number] & { value: number };
  const measured = outcomes.filter((o): o is Measured => o.value !== null);
  const met = measured.filter((o) => targetBand(o.value, SCHOOL_TARGETS[o.key]) === "met").length;
  const worst = measured.slice().sort((a, b) => (a.value - SCHOOL_TARGETS[a.key]) - (b.value - SCHOOL_TARGETS[b.key]))[0] as Measured | undefined;
  const heroBand = worst ? targetBand(worst.value, SCHOOL_TARGETS[worst.key]) : "met";

  const grades = GRADES.map((g) => ({ g, m: readinessMetrics(roster.filter((s) => s.grade === g)) })).filter((x) => x.m.students > 0).sort((a, b) => a.m.onTrackPct - b.m.onTrackPct);
  const byCounselor = scope === "school"
    ? SCHOOL_COUNSELORS.map((c) => ({ c, m: readinessMetrics(roster.filter((s) => counselorFor(s).id === c.id)) })).filter((x) => x.m.students > 0).sort((a, b) => a.m.onTrackPct - b.m.onTrackPct)
    : [];

  // Each section is a small renderer, called once for whichever tab is
  // selected on screen and once more (all of them) in the print-only
  // compiled version below -- so the two never drift out of sync.
  // Ranked largest first, darkest blue first, so the ramp doubles as rank.
  const RAMP = [...BLUE_5].reverse();
  const actions = [
    { label: "Daily Career Drops", value: engagement.drops },
    { label: "Colleges saved", value: engagement.colleges },
    { label: "Careers saved", value: engagement.careers },
    { label: "Simulations", value: engagement.sims },
    { label: "Community posts", value: engagement.posts },
  ].sort((a, b) => b.value - a.value).map((a, i) => ({ ...a, color: RAMP[i] }));
  const totalActions = actions.reduce((a, x) => a + x.value, 0);
  const intents = pathway.filter((p) => p.label !== "Undecided").sort((a, b) => b.count - a.count).map((p, i) => ({ label: p.label, value: p.count, color: RAMP[i] }));
  const pathwayParts = [...intents, { label: "Undecided", value: pathway.find((p) => p.label === "Undecided")?.count ?? 0, color: NEUTRAL_SLICE }];
  const plansChanges = plansReviewed - plansApproved;

  // ---- Outcomes tab: the four targets, then how they compare.
  const renderOutcomes = () => (
    <div className="flex flex-col gap-[var(--space-4)]">
      {/* No status tint on this card (direct instruction: "remove the red
         glow from outcomes card"); red lives only on the outcomes actually
         below target. The one CTA names the worst of them. */}
      <OverviewCard
        title="Outcomes"
        unit="Aug 2026 to Jan 2027"
        hero
        aside={worst && heroBand !== "met" ? <CardLink onClick={worst.open}>{SHORT_LABEL[worst.key]} follow-up</CardLink> : undefined}
      >
        <Verdict band={heroBand}>{met} of {measured.length} targets met</Verdict>
        <div className="grid grid-cols-1 gap-[10px] sm:grid-cols-2">
          {outcomes.map((o) => <OutcomeTile key={o.key} label={TARGET_LABELS[o.key]} value={o.value} target={SCHOOL_TARGETS[o.key]} note={o.note} toGo={o.value === null ? 0 : toGo(o)} onClick={o.open} />)}
        </div>
      </OverviewCard>
      {renderBenchmarks()}
    </div>
  );

  // v1's "Notable Achievements" were eight sentences restating numbers
  // shown elsewhere; the facts only that list carried are the COMPARISONS
  // (school average, district benchmark, 5-day standard), so that is what
  // this draws: each result as a bar, the benchmark as a tick, the gap as
  // the one number (direct feedback: "The notable achievements is REALLY
  // BAD. We need better data viz"). The rest of v1's list -- seniors
  // applying, questions answered, support flags, Career Drops -- lives in
  // the Activity and Readiness tabs.
  const benchmarks = [
    { label: "On-track rate", gap: `${m.onTrackPct - SCHOOL_AVERAGE_ON_TRACK >= 0 ? "+" : ""}${m.onTrackPct - SCHOOL_AVERAGE_ON_TRACK} pts`, note: `${m.onTrackPct}% vs ${SCHOOL_AVERAGE_ON_TRACK}% school avg`, pct: m.onTrackPct, tick: SCHOOL_AVERAGE_ON_TRACK },
    { label: "Senior plan rate", gap: `${m.seniorPlanPct - SCHOOL_TARGETS.seniorPlan >= 0 ? "+" : ""}${m.seniorPlanPct - SCHOOL_TARGETS.seniorPlan} pts`, note: `${m.seniorPlanPct}% vs ${SCHOOL_TARGETS.seniorPlan}% district`, pct: m.seniorPlanPct, tick: SCHOOL_TARGETS.seniorPlan },
    { label: "Review turnaround", gap: "2.9 days faster", note: "2.1 days vs 5-day standard", pct: (2.1 / 5) * 100, tick: 100 },
  ];
  const renderBenchmarks = () => (
    <OverviewCard title="Against benchmarks">
      <ul className="grid grid-cols-1 gap-[var(--space-5)] md:grid-cols-3">
        {benchmarks.map((b) => (
          <li key={b.label} className="flex flex-col gap-[8px]">
            <span className="text-[12.5px] font-semibold" style={{ ...BODY, color: "var(--muted-foreground)" }}>{b.label}</span>
            <span className="text-[24px] leading-[1] font-extrabold whitespace-nowrap tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{b.gap}</span>
            <ul><BarRow label={b.note} value="" pct={b.pct} tick={b.tick} muted={false} /></ul>
          </li>
        ))}
      </ul>
    </OverviewCard>
  );

  // ---- Activity tab: what the counselor did, and what students did.
  const renderActivity = () => (
    <div className="grid grid-cols-1 gap-[var(--space-4)] xl:grid-cols-2">
      <SummaryCard
        id="impact-work"
        title={scope === "school" ? "Counselor work" : "Your work"}
        details={<>
          <ListRow label="Pending review" value={String(plansPending)} />
          <ListRow label={`Questions answered (${responseRatePct}%)`} value={`${respondedQuestions} of ${QUESTIONS.length}`} />
          <ListRow label="Announcements sent" value={String(ANNOUNCEMENTS.length)} />
          <ListRow label={`Support flags active (${monitoredPct}% of caseload)`} value={String(monitored)} />
        </>}
      >
        {/* Plans reviewed split by outcome: parts of one total, a donut. */}
        <span className="flex items-center gap-[var(--space-5)]">
          <SegmentedRing segments={[{ value: plansApproved, color: PRIMARY }, { value: plansChanges, color: BLUE_3[0] }]} size={96} stroke={11}>
            <span className="flex flex-col items-center leading-none">
              <span className="text-[20px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{plansReviewed}</span>
              <span className="text-[10px] font-semibold" style={{ ...BODY, color: "var(--muted-foreground)" }}>reviewed</span>
            </span>
          </SegmentedRing>
          <ul className="flex min-w-0 flex-1 flex-col">
            <ListRow label="Approved" value={String(plansApproved)} dot={PRIMARY} />
            <ListRow label="Changes requested" value={String(plansChanges)} dot={BLUE_3[0]} />
            <ListRow label="Avg turnaround (standard 5)" value="2.1 days" />
          </ul>
        </span>
      </SummaryCard>
      <SummaryCard
        id="impact-engagement"
        title="Student engagement"
        unit={scope === "school" ? "school-wide" : "your caseload"}
        details={<>{actions.map((a) => <ListRow key={a.label} label={a.label} value={a.value.toLocaleString("en-US")} dot={a.color} />)}</>}
      >
        <Headline value={totalActions.toLocaleString("en-US")} label="actions on Dreamari" />
        <CompositionBar parts={actions} />
        <span className="flex flex-wrap gap-x-[12px] gap-y-[4px] text-[11.5px] font-medium" style={{ ...BODY, color: "var(--muted-foreground)" }}>
          {actions.map((a) => <span key={a.label} className="flex items-center gap-[5px]"><span aria-hidden className="size-[7px] rounded-full" style={{ background: a.color }} />{a.label}</span>)}
        </span>
      </SummaryCard>
    </div>
  );

  // ---- Readiness tab: milestone rates, pathways, and the grade split.
  const milestoneRings = [
    { label: "Career reports", pct: careerReportPct, count: `${careerReportApproved} of ${roster.length}` },
    { label: "Academic plans", pct: academicPlanPct, count: `${academicPlanApproved} of ${roster.length}` },
    { label: "Résumés (Gr. 10+)", pct: resumePct, count: `${resumeApproved} of ${gr10Plus.length}` },
    { label: "Seniors applying", pct: seniorRows.length ? Math.round((seniorsApplying / seniorRows.length) * 100) : 0, count: `${seniorsApplying} of ${seniorRows.length}` },
  ];
  const renderReadiness = () => (
    <div className="grid grid-cols-1 gap-[var(--space-4)] xl:grid-cols-2">
      <SummaryCard
        id="impact-readiness"
        title="Milestones approved"
        details={<>{milestoneRings.map((r) => <ListRow key={r.label} label={r.label} value={r.count} />)}</>}
      >
        {/* Four independent rates of the same caseload: small multiples of
           one ring each, so they compare at a glance. */}
        <div className="grid grid-cols-2 gap-[var(--space-4)] sm:grid-cols-4">
          {milestoneRings.map((r) => (
            <span key={r.label} className="flex flex-col items-center gap-[8px] text-center">
              <Ring pct={r.pct} size={72} stroke={7} accent={PRIMARY}>
                <span className="text-[16px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{r.pct}%</span>
              </Ring>
              <span className="text-[12px] leading-[15px] font-semibold" style={{ ...BODY, color: "var(--foreground)" }}>{r.label}</span>
            </span>
          ))}
        </div>
      </SummaryCard>
      <OverviewCard title="Postsecondary pathways" unit={`${m.withPlan} of ${m.students} declared`}>
        {/* Parts of one caseload: a donut, with its key beside it. */}
        <span className="flex flex-wrap items-center gap-[var(--space-5)]">
          <SegmentedRing segments={pathwayParts.map((p) => ({ value: p.value, color: p.color }))} size={112} stroke={13}>
            <span className="flex flex-col items-center leading-none">
              <span className="text-[20px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{m.withPlanPct}%</span>
              <span className="text-[10px] font-semibold" style={{ ...BODY, color: "var(--muted-foreground)" }}>declared</span>
            </span>
          </SegmentedRing>
          <ul className="flex min-w-[180px] flex-1 flex-col">
            {pathwayParts.map((p) => <ListRow key={p.label} label={p.label} value={String(p.value)} dot={p.color} />)}
          </ul>
        </span>
      </OverviewCard>
      {/* One grouped column chart for the grade split: on-track rate and
         plan completion per grade, the 80% target as a line. */}
      <div className="xl:col-span-2">
        <OverviewCard title="By grade" unit={`${overallAvgCompletion}% plan completion overall`} aside={<CardLink onClick={() => router.push("/counselor?view=students")}>Students</CardLink>}>
          <BarChart
            barStyle="solid"
            hideValuesUntilHover
            height={200}
            groups={GRADES.map((g) => `Gr. ${g}`)}
            series={[
              { label: "On track", accent: BLUE_3[1], values: GRADES.map((g) => grades.find((x) => x.g === g)?.m.onTrackPct ?? NaN) },
              { label: "Plan completion", accent: BLUE_3[0], values: GRADES.map((g) => { const gr = roster.filter((s) => s.grade === g); return gr.length ? Math.round(gr.reduce((sum, s) => sum + s.roadmapPct, 0) / gr.length) : NaN; }) },
            ]}
            targetLine={{ value: SCHOOL_TARGETS.onTrack, label: "On-track target" }}
          />
          {scope === "school" && (
            <ul className="flex flex-col border-t pt-[var(--space-3)]" style={{ borderColor: "var(--glass-border)" }}>
              {byCounselor.map(({ c, m: cm }) => <ListRow key={c.id} label={`${c.name} · ${c.range}`} value={`${cm.onTrackPct}% on track`} onClick={() => { setCounselorFilter(c.id); router.push("/counselor?view=students"); }} />)}
            </ul>
          )}
        </OverviewCard>
      </div>
    </div>
  );

  // One tile per ASCA domain: its headline number, then its practices.
  const renderAsca = () => (
    <OverviewCard title="ASCA National Model" unit="4th edition">
      <div className="grid grid-cols-1 gap-[10px] sm:grid-cols-3">
        {ASCA({ total: roster.length, academicPlanPct, careerReportPct, withPlanPct: m.withPlanPct, monitored, responseRatePct, atRiskCount }).map((col) => (
          <div key={col.title} className="flex flex-col gap-[12px] rounded-[var(--radius-md)] border p-[14px]" style={GLASS_INSET}>
            <span className="flex items-center gap-[8px]">
              <span aria-hidden className="flex size-[28px] flex-none items-center justify-center rounded-[8px]" style={{ background: "color-mix(in srgb, var(--primary) 18%, transparent)" }}>
                <col.icon className="h-[15px] w-[15px]" style={{ color: "var(--primary)" }} />
              </span>
              <span className="text-[13px] font-bold" style={{ ...BODY, color: "var(--foreground)" }}>{col.title}</span>
            </span>
            <Headline value={col.value} label={col.label} />
            <ul className="flex flex-col gap-[4px] border-t pt-[10px]" style={{ borderColor: "var(--glass-border)" }}>
              {col.practices.map((pr) => <li key={pr} className="text-[12px] leading-[16px] font-medium" style={{ ...BODY, color: "var(--muted-foreground)" }}>{pr}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </OverviewCard>
  );

  const headshotSrc = seededPick(account.name || "Sarah Chen", COUNSELOR_HEADSHOTS);
  const coverSrc = COUNSELOR_COVER;

  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      {/* This counselor's own report gets a real identity hero (photo +
         cover), the same shape Student Profile uses -- gated to "mine"
         only. School Impact's `who` is the SCHOOL, not this counselor, so
         leading that report with one person's face would misattribute it
         (a District Administrator paging through several schools would
         see the same face over every one). */}
      {/* `min-h` on the inner content div alone wasn't enough -- as a flex
         child of this page's own `flex flex-col` wrapper, the SECTION's
         own box collapsed to ~47px regardless of its child's real 132px
         height (confirmed via devtools: child rect was 132px tall, the
         section clipping it was not). Repeating the floor on the section
         itself fixes it directly rather than depending on content-based
         auto-sizing that wasn't working here. */}
      {scope === "mine" && (
        // Same floor as Student Profile's own cover hero (ProfileExperience.tsx:
        // `min-h-[192px] sm:min-h-[208px]`) -- direct instruction: "make sure
        // the cover image header is the same height as the student profile
        // ones."
        <section className="relative min-h-[208px] overflow-hidden rounded-[var(--radius-lg)] border print:hidden" style={{ borderColor: "var(--glass-border)" }}>
          <div className="absolute inset-0" aria-hidden>
            <img src={coverSrc} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <span className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(12,16,35,0.88) 0%, rgba(12,16,35,0.55) 45%, rgba(12,16,35,0.18) 75%, transparent 100%)" }} />
          </div>
          <div className="relative flex min-h-[208px] flex-col justify-end gap-[var(--space-3)] p-[var(--space-4)] pt-[52px] sm:p-[var(--space-5)]">
            <div className="flex min-w-0 items-end gap-[var(--space-4)]">
              <CounselorHeadshot src={headshotSrc} />
              <div className="flex min-w-0 flex-col gap-[2px]" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
                <h2 className="truncate text-[18px] font-extrabold text-white" style={{ fontFamily: "var(--font-display)" }}>{who}</h2>
                {/* The reporting period dropped from this line -- direct
                   report: "causing a long text string and colliding with
                   the ctas on small screens." Still stated once, on the
                   very next card (Outcomes' own unit caption below). */}
                <span className="truncate text-[13px] font-semibold" style={{ color: "rgba(255,255,255,0.85)" }}>{account.role || "School Counselor"} · {account.school || DEMO_SCHOOL} · {m.students} students</span>
              </div>
            </div>
            {/* One row under the identity, at every width (direct
               instruction: "ctas can fit neatly in a row under the
               identity") -- pinning them to a photo corner collided with
               the name on narrow screens. A solid backing (not
               `dm-quiet`'s transparent default) keeps them readable on the
               photo. */}
            <div className="flex flex-wrap items-center gap-[6px] sm:gap-[8px]">
              <button type="button" onClick={() => window.print()} className="dm-quiet flex h-9 cursor-pointer items-center gap-[6px] rounded-[var(--radius-sm)] border px-[10px] text-[13px] font-semibold sm:px-[12px]" style={{ background: "rgba(9,10,20,0.55)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", borderColor: "rgba(255,255,255,0.18)", color: "#fff" }}>
                <Printer className="h-[14px] w-[14px]" aria-hidden /> Print
              </button>
              <button type="button" className="dm-quiet flex h-9 cursor-pointer items-center gap-[6px] rounded-[var(--radius-sm)] border px-[10px] text-[13px] font-semibold sm:px-[12px]" style={{ background: "rgba(9,10,20,0.55)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", borderColor: "rgba(255,255,255,0.18)", color: "#fff" }}>
                <Share2 className="h-[14px] w-[14px]" aria-hidden /> Share
              </button>
              <button type="button" onClick={() => window.print()} className="dm-solid bg-[var(--primary)] text-[var(--primary-foreground)] flex h-9 cursor-pointer items-center gap-[6px] rounded-[var(--radius-sm)] px-[12px] text-[13px] font-bold sm:px-[14px]">
                <FileBarChart className="h-[14px] w-[14px]" aria-hidden /> Principal report
              </button>
            </div>
          </div>
        </section>
      )}

      {scope === "school" && (
        <div className="flex flex-wrap items-center justify-between gap-[var(--space-4)] print:hidden">
          <div className="flex flex-col gap-[2px]">
            <h2 className="text-[18px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{who}</h2>
            <span className="text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{`Prepared by ${account.name || "Sarah Chen"}`} · August 2026 to January 2027</span>
          </div>
          <div className="flex flex-wrap items-center gap-[8px]">
            <button type="button" onClick={() => window.print()} className="dm-quiet flex h-9 cursor-pointer items-center gap-[6px] rounded-[var(--radius-sm)] border px-[12px] text-[13px] font-semibold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
              <Printer className="h-[14px] w-[14px]" aria-hidden /> Print
            </button>
            <button type="button" className="dm-quiet flex h-9 cursor-pointer items-center gap-[6px] rounded-[var(--radius-sm)] border px-[12px] text-[13px] font-semibold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
              <Share2 className="h-[14px] w-[14px]" aria-hidden /> Share
            </button>
            <button type="button" onClick={() => window.print()} className="dm-solid bg-[var(--primary)] text-[var(--primary-foreground)] flex h-9 cursor-pointer items-center gap-[6px] rounded-[var(--radius-sm)] px-[14px] text-[13px] font-bold">
              <FileBarChart className="h-[14px] w-[14px]" aria-hidden /> Principal report
            </button>
          </div>
        </div>
      )}

      {/* Print-only header: the on-screen one above is print:hidden so the
         compiled report leads with the same identity line, not the tab
         control or button row. */}
      <div className="hidden flex-col gap-[2px] print:flex">
        <h2 className="text-[18px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{who}</h2>
        <span className="text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{scope === "school" ? `Prepared by ${account.name || "Sarah Chen"}` : `${account.role || "School Counselor"} · ${account.school || DEMO_SCHOOL}`} · August 2026 to January 2027</span>
      </div>

      {/* Outcomes is the one number a counselor reads every time, not a
         section to page through -- it stays outside the tabs, on screen
         and in print alike. */}
      {/* Everything lives in tabs, directly under the header (direct
         instruction: "Organise everything into tabs dont just put a tab
         for the last row"). */}
      <div className="flex flex-col gap-[var(--space-4)] print:hidden">
        <Segmented
          ariaLabel="Report section"
          options={[
            { key: "outcomes", label: "Outcomes" },
            { key: "activity", label: "Activity" },
            { key: "readiness", label: "Readiness" },
            { key: "asca", label: "ASCA" },
          ]}
          value={tab}
          onChange={(k) => setTab(k as ImpactTab)}
        />
        {tab === "outcomes" && renderOutcomes()}
        {tab === "activity" && renderActivity()}
        {tab === "readiness" && renderReadiness()}
        {tab === "asca" && renderAsca()}
      </div>

      {/* Print only: every tab compiled together. */}
      <div className="hidden flex-col gap-[var(--space-4)] print:flex">
        {renderOutcomes()}
        {renderActivity()}
        {renderReadiness()}
        {renderAsca()}
      </div>

      {/* One quiet line, not two with a bold all-caps half (direct
         feedback: "Other disclaimers can be more subtle"). */}
      <span className="text-[11px] leading-[15px] font-medium" style={{ ...BODY, color: "color-mix(in srgb, var(--muted-foreground) 75%, transparent)" }}>
        Dreamari Counselor Dashboard · Aug 2026 to Jan 2027 · aggregated, anonymized · ASCA (4th ed.) accountability review · confidential
      </span>
    </div>
  );
}


// Every item v1's ASCA alignment cards listed, grouped under one headline
// per domain.
function ASCA(d: { total: number; academicPlanPct: number; careerReportPct: number; withPlanPct: number; monitored: number; responseRatePct: number; atRiskCount: number }) {
  return [
    { icon: BookOpen, title: "Academic", value: `${d.academicPlanPct}%`, label: "four-year plans approved", practices: [`All ${d.total} students supported`, "Course selection, credit monitoring"] },
    { icon: Briefcase, title: "Career", value: `${d.careerReportPct}%`, label: "career reports complete", practices: [`${d.withPlanPct}% declared a pathway`, "Simulations and assessments"] },
    { icon: Heart, title: "Social-emotional", value: String(d.monitored), label: "students monitored", practices: [`${d.responseRatePct}% of questions answered`, `${d.atRiskCount} at-risk students flagged`] },
  ];
}
