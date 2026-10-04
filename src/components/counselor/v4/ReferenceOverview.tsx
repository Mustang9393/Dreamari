"use client";

// DEMO-ONLY v2 fork of ../Overview.tsx (24 Sept 2026). v1 stays untouched so the
// two builds can be compared live via the bottom-center version chip
// (../version.tsx). Changes from the 24 Sept audit land here.

// Decluttered 2 Oct 2026, to Maisha's Replit. WHY: the user compared the
// landing page with the Replit and found ours "so dense and hard to read".
// The audit: Student Status mixed two datasets in one card (students: 85% /
// 103 / 11 / 7, and milestones: 66% / 693 / 40 / 233 / 81), so "Needs
// attention" read 11 on one side and 40 on the other; the at-risk 7 was said
// three times; a CRITICAL chip and a "+2 pts vs last month" caption sat on
// top; and the attention list was bordered tiles inside a card. Now:
//   - Student Status is students only (the ring and its three counts). The
//     milestone picture is its own full-width card, Milestone progress,
//     titled for what it counts, so the two "needs attention" numbers can no
//     longer be mistaken for one.
//   - The at-risk 7 is said once, in Student Status. The attention list's
//     link is just "See all"; its rows keep the names and reasons.
//   - No CRITICAL chip: each row carries one small red dot (named for
//     screen readers) instead. "+2 pts vs last month" moved into Student
//     Status' drill (Details), with the breakdown and the at-risk students.
//   - Attention rows are flat, split by hairlines, not bordered tiles.
// Design budget (v2): blue plus status colors, glow only on the hero (Student
// Status), gradient bars.

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, TrendingDown, TrendingUp } from "lucide-react";
import { SegmentedRing } from "./viz";
import { OverviewCard } from "./overviewShared";
import { HoverBeam } from "@/components/app/HoverBeam";
import { Avatar, CardLink, Go, StatRow } from "./chips";
import { DrillPanel, type Drill } from "./Drill";
import { type CounselorStudent, type AttentionSeverity } from "@/lib/counselorRoster";
import { attentionReason, attentionSeverity, attentionRank } from "./studentAttention";
import { curriculumForGrade } from "@/lib/counselorCurriculum";
import { RankedBars, TOP_SAVED_CAREERS } from "./CareerCollegeInsights";
import { useCounselorFilters, type StatusRosterFilter } from "../shell";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { BLUE_3, NEUTRAL_SLICE, PRIMARY, TARGET_LINE, CHART_STATUS, TREND_UP } from "./palette";

export const STATUS_COLORS: Record<CounselorStudent["status"], string> = {
  "On Track": "var(--cd-green)",
  "Needs Attention": "var(--cd-amber)",
  "At Risk": "var(--cd-red)",
};

// Every student on the attention strip is already "At Risk" -- this is a
// second, finer scale for how urgent WITHIN that group, so a counselor
// with limited time knows which of several flagged names to open first
// (direct instruction: "rate by severity"). Critical reuses the same red
// as "At Risk" (both mean the same thing: this is bad), but High is its
// own distinct orange rather than reusing "Needs Attention"'s amber, and
// Medium is a muted slate rather than any status hue -- otherwise the
// severity badges would silently double as a second, confusing status
// legend.
const SEVERITY_COLORS: Record<AttentionSeverity, string> = {
  Critical: "var(--cd-red)",
  High: "#E8823C",
  Medium: "#8B93B8",
};

// One fixed hue order for every readiness bar chart on this page. Went
// through two earlier passes -- magenta/indigo/teal read as "pink+purple,"
// and a true yellow->orange sunset progression measurably collided with
// this dashboard's own status colors (orange landed 13.9 ΔE from "Needs
// Attention," rust landed 11.5 ΔE from "At Risk" -- both below the "tell
// them apart" floor, the same problem already fixed once for green vs. "On
// Track"). Direct instruction after that: a single-hue ramp instead --
// light to dark shades of this dashboard's own primary blue, not a
// multi-hue walk at all. A real ordinal ramp, not a categorical palette,
// so it's validated with the skill's own ordinal gate (monotone lightness,
// a visible gap between steps, one hue, the light end still readable):
// `validate_palette.js "#9BA8FB,#5B6CF9,#2E3BB8" --ordinal --mode dark` ->
// all checks pass. "Series 1" and "series 2" still mean the same shade on
// every readiness chart.
export const READINESS_SERIES = [...BLUE_3];
// The target/benchmark line needs to read as "not one of the bars" against
// an all-blue ramp, and "not the status amber" against the rest of the
// page -- a warm bronze does both: validated clear of "Needs Attention"
// (`validate_palette.js "var(--cd-amber),#A67C2E" --mode dark` -> ΔE 17.9, passes)
// and it's warm/cool-contrasting against every blue bar it sits over.
export const TARGET_LINE_COLOR = TARGET_LINE;

// Two surfaces, spent by role, not one surface repeated three times --
// "dominance over equality": one card should carry the visual weight,
// everything else recedes a notch, or nothing reads as the centerpiece
// (direct feedback: "no design experimentation... the same cards and the
// same things"). GLASS_CARD_HERO is now spent on exactly one card on this
// page (Student Status); every other card downgrades to the plain glass.
import { GLASS_CARD, GLASS_CARD_HERO, glowBackdrop } from "../surfaces";

// Legend rows are the shared `StatRow` (chips.tsx) -- a row is a button
// whenever it can click through to a pre-filtered Roster, and the same
// visual row either way so clickable and static legends never look
// different at rest. Deliberately NOT a per-row micro-bar (tried once,
// reverted): a row that fills to its own share still reads as "this
// category has its own progress toward its own goal," the misreading
// already corrected on Career Pathways (23 Sept 2026: "we're showing
// distribution or breakdown"). The ring or stacked bar above is the
// distribution chart; the legend only names and counts each slice.

export function DeltaChip({ pts }: { pts: number }) {
  const up = pts >= 0;
  // Green up (direct feedback, 26 Sept 2026: "trend chips can stay green.
  // Blue is hard to read on blue"): a trend is text on a blue-tinted card,
  // so it takes the one color that reads there. Same on Engagement.
  const color = up ? TREND_UP : CHART_STATUS["Needs Attention"];
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span className="flex items-center gap-[3px] text-[11.5px] leading-[15px] font-extrabold tabular-nums" style={{ color }}>
      <Icon className="h-[12px] w-[12px]" aria-hidden />
      {up ? "+" : ""}{pts} pts <span className="font-semibold" style={{ color: "var(--muted-foreground)" }}>vs last month</span>
    </span>
  );
}

// Ring on top, bigger, legend stacked below it -- not side-by-side at the
// old 92px size (direct instruction, 23 Sept 2026: "the graph has to be
// bigger and on top, the other info below"). Centered so the ring reads as
// the card's headline number, same job a hero stat does elsewhere in this
// dashboard, with the legend as supporting detail underneath it.
// `hero` spends the one saturated, glowing surface this page has on
// exactly one card (see the surfaces-import comment above). A hero card
// also ties its glow/border to `heroTint` -- the status color itself, not
// a generic brand tint -- so the card's own color communicates the
// reading at a glance (a healthy caseload glows green, a struggling one
// would glow amber/red), the way Boltshift's one saturated hero tile
// matches what it's actually reporting rather than just being "the loud
// one." Every other donut stays the plain glass and a smaller ring, so
// there's exactly one thing the eye lands on first.
export function DonutCard({ title, caption, centerPct, centerLabel, deltaPts, rows, hero, heroTint, aside }: { title: string; /** one muted line under the title, for a reading that has no trend delta */ caption?: string; centerPct: number; centerLabel: string; deltaPts?: number; rows: { label: string; value: number; color: string; onClick?: () => void }[]; hero?: boolean; heroTint?: string; /** the card's way in, a CardLink, visible at rest */ aside?: React.ReactNode }) {
  const surface = hero ? { ...GLASS_CARD_HERO, borderColor: heroTint ? `color-mix(in srgb, ${heroTint} 38%, var(--glass-border))` : GLASS_CARD_HERO.borderColor } : GLASS_CARD;
  // Student Status and Postsecondary Plans sit in an equal-width 2-column
  // row now (both cards the same width), so their rings should read the
  // same size too (direct instruction, 26 Sept 2026) -- `hero` still
  // controls the glow/tint surface treatment, just not ring geometry.
  const ringSize = 132;
  const ringStroke = 15;
  // A quiet version of the same glow, not just a flat plain box -- "no
  // upgrade at all" was a fair read of a sidekick card that got resized but
  // kept every pixel of its old self. Low enough opacity it never competes
  // with the hero's, but the card still reads as considered, not neglected.
  const glowColor = heroTint ?? rows[0]?.color ?? "var(--primary)";
  return (
    <HoverBeam strength={0.7} className="h-full">
      <div className="v4-surface group relative flex h-full flex-col gap-[var(--space-5)] overflow-hidden rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={surface}>
        <span aria-hidden className="pointer-events-none absolute inset-0" style={{ background: glowBackdrop(glowColor, hero ? 0.3 : 0.12) }} />
        <div className="relative flex flex-col gap-[2px]">
          {/* Single line always: the title truncates before the pill is
             ever forced onto its own line -- a dropped-pill wrap read as
             broken in the narrow third-column card (direct feedback, 26
             Sept 2026: "wraps the students chip badly"). */}
          <span className="flex items-center justify-between gap-[8px]">
            <h2 className="min-w-0 truncate text-[15px] leading-[1.3] font-bold" style={{ color: "var(--foreground)" }}>{title}</h2>
            <span className="flex-none">{aside}</span>
          </span>
          {/* Hand-authored, deterministic vs. last month -- same "seeded
             demo data" convention the roster itself already uses, not a
             live computation (there's no historical snapshot to compute
             it from). Direct instruction: trend deltas on the donut cards. */}
          {typeof deltaPts === "number" && <DeltaChip pts={deltaPts} />}
          {caption && <span className="text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{caption}</span>}
        </div>
        {/* flex-1 + justify-center: when the row-stretch that keeps every
           card the same height (direct instruction) leaves a shorter card
           with room to spare, the ring+legend group centers in it instead
           of sitting glued to the title with dead air below (direct
           report: "badly aligned"). */}
        <div className="relative flex flex-1 flex-col items-center justify-center gap-[var(--space-5)]">
          {/* Every category in the legend below gets its own drawn arc here
             -- not a single accent-colored ring next to an unrelated
             multi-color legend (direct feedback: "only one color is being
             represented when there's more colors in the legend"). */}
          <SegmentedRing segments={rows.map((r) => ({ value: r.value, color: r.color }))} size={ringSize} stroke={ringStroke}>
            <span className="flex flex-col items-center">
              <span className={`${hero ? "text-[32px]" : "text-[24px]"} leading-[1] font-extrabold tabular-nums`} style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{Math.round(centerPct)}%</span>
              <span className="text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{centerLabel}</span>
            </span>
          </SegmentedRing>
          <div className="flex w-full flex-col gap-[4px]">
            {rows.map((r) => <StatRow key={r.label} {...r} />)}
          </div>
        </div>
      </div>
    </HoverBeam>
  );
}

// The four checkpoint states, named and colored exactly as the Milestone
// Tracker names and colors them, so the snapshot here and the tracker it
// opens read as the same data.
const MILESTONE_STATES = [
  { key: "completed", label: "Done", color: PRIMARY },
  { key: "needsAttention", label: "Needs attention", color: BLUE_3[0] },
  { key: "inProgress", label: "In progress", color: "var(--cd-blue-pale)" },
  { key: "notStarted", label: "Not started", color: NEUTRAL_SLICE },
] as const;

// Student Status is students only: how they stand, and the way into each
// group. The milestone picture is MilestonesCard below, its own card
// (2 Oct 2026: two datasets in one card made "Needs attention" read 11 on one
// side and 40 on the other). Details opens the breakdown, last month's change
// and the at-risk students.
function StudentStatusCard({ onTrack, needsAttention, atRisk, heroTint, onStatus, onDetails }: { onTrack: number; needsAttention: number; atRisk: number; heroTint: string; onStatus: (s: StatusRosterFilter) => void; onDetails: () => void }) {
  const total = onTrack + needsAttention + atRisk || 1;
  const surface = { ...GLASS_CARD_HERO, borderColor: `color-mix(in srgb, ${heroTint} 38%, var(--glass-border))` };
  return (
    <HoverBeam strength={0.7} className="h-full">
      <div className="v4-surface group relative flex h-full flex-col gap-[var(--space-5)] overflow-hidden rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={surface}>
        <span aria-hidden className="pointer-events-none absolute inset-0" style={{ background: glowBackdrop(heroTint, 0.3) }} />
        <div className="relative flex items-center justify-between gap-[8px]">
          <h2 className="text-[15px] leading-[1.3] font-bold" style={{ color: "var(--foreground)" }}>Student Status</h2>
          <DetailsLink label="Student Status" onClick={onDetails} />
        </div>
        <div className="relative flex flex-1 flex-col items-center justify-center gap-[var(--space-4)]">
          <SegmentedRing segments={[{ value: onTrack, color: CHART_STATUS["On Track"] }, { value: needsAttention, color: CHART_STATUS["Needs Attention"] }, { value: atRisk, color: CHART_STATUS["At Risk"] }]} size={132} stroke={15}>
            <span className="flex flex-col items-center">
              <span className="text-[32px] leading-[1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{Math.round((onTrack / total) * 100)}%</span>
              <span className="text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>on track</span>
            </span>
          </SegmentedRing>
          <div className="flex w-full max-w-[360px] flex-col gap-[4px]">
            <StatRow label="On Track" value={onTrack} color={CHART_STATUS["On Track"]} onClick={() => onStatus("On Track")} />
            <StatRow label="Needs Attention" value={needsAttention} color={CHART_STATUS["Needs Attention"]} onClick={() => onStatus("Needs Attention")} />
            <StatRow label="At Risk" value={atRisk} color={CHART_STATUS["At Risk"]} onClick={() => onStatus("At Risk")} />
          </div>
        </div>
      </div>
    </HoverBeam>
  );
}

/** The quiet "Details" pill that opens a card's drill (same as My Impact's). */
function DetailsLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-label={`${label}: details`} className="dm-quiet flex flex-none cursor-pointer items-center gap-[2px] rounded-full px-[8px] py-[4px] text-[12.5px] leading-[16px] font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]" style={{ color: "var(--muted-foreground)" }}>
      Details<ChevronRight className="h-[14px] w-[14px]" aria-hidden />
    </button>
  );
}

// Progress across every milestone checkpoint in the grades in view: the
// share done, one bar, and the four states as flat figures in a row, with
// the Milestone Tracker one click away. The states keep the Tracker's names
// and colors so this and the Tracker read as the same data.
function MilestonesCard({ milestones, onOpen }: { milestones: Record<(typeof MILESTONE_STATES)[number]["key"], number>; onOpen: () => void }) {
  const checkpoints = MILESTONE_STATES.reduce((a, st) => a + milestones[st.key], 0) || 1;
  const donePct = Math.round((milestones.completed / checkpoints) * 100);
  return (
    <OverviewCard title="Milestone progress" unit="checkpoints" aside={<CardLink onClick={onOpen}>Milestone Tracker</CardLink>}>
      <div className="flex items-baseline gap-[8px]">
        <span className="text-[32px] leading-[1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{donePct}%</span>
        <span className="text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>done</span>
      </div>
      <span className="flex h-[10px] w-full overflow-hidden rounded-full" role="img" aria-label={MILESTONE_STATES.map((st) => `${st.label} ${milestones[st.key]}`).join(", ")} style={{ background: "color-mix(in srgb, var(--foreground) 7%, transparent)" }}>
        {MILESTONE_STATES.map((st) => <span key={st.key} className="h-full" style={{ width: `${(milestones[st.key] / checkpoints) * 100}%`, background: st.color }} />)}
      </span>
      <dl className="grid grid-cols-2 gap-x-[var(--space-5)] gap-y-[var(--space-4)] sm:grid-cols-4">
        {MILESTONE_STATES.map((st) => (
          <div key={st.key} className="flex flex-col gap-[2px]">
            <dt className="order-2 flex items-center gap-[8px] text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
              <span aria-hidden className="size-[8px] flex-none rounded-full" style={{ background: st.color }} />
              {st.label}
            </dt>
            <dd className="order-1 text-[24px] leading-[1.1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{milestones[st.key]}</dd>
          </div>
        ))}
      </dl>
    </OverviewCard>
  );
}

// The top five saved careers as bars, the same chart Career + College
// Insights draws for all ten, with the way to the rest (27 Sept 2026,
// Maisha: "I don't love the 'career pathways' snapshot. It feels hard to
// follow ... Either a bar or a pie chart. In the overview maybe they see
// the top 3-5 careers and then they click the insights button to see
// all"). Bars, not a pie: ranked counts of this many categories read
// faster as lengths than as slices. The treemap it replaces (area per
// pathway, tiles wrapping into rows) asked the reader to compare areas.
function PathwaysCard({ onOpen }: { onOpen: () => void }) {
  return (
    <OverviewCard title="Career Pathways" unit="top saved careers" aside={<CardLink onClick={onOpen}>See all {TOP_SAVED_CAREERS.length}</CardLink>}>
      <div className="relative flex flex-1 flex-col justify-center">
        <RankedBars items={TOP_SAVED_CAREERS} limit={5} />
      </div>
    </OverviewCard>
  );
}

function AttentionStrip({ students, onSeeAll }: { students: CounselorStudent[]; onSeeAll: () => void }) {
  const router = useRouter();
  const shown = students.slice(0, 3);
  return (
    <div className="v4-surface group flex flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={GLASS_CARD}>
      <div className="flex items-center justify-between gap-[8px]">
        <h2 className="text-[15px] leading-[1.3] font-bold" style={{ color: "var(--foreground)" }}>Needs your attention</h2>
        <CardLink onClick={onSeeAll}>See all</CardLink>
      </div>
      {students.length === 0 ? (
        <p className="text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Nothing needs attention under the current filters.</p>
      ) : (
        <ul className="flex flex-col">
          {shown.map((s) => {
            const severity = attentionSeverity(s);
            return (
              <li key={s.id} className="border-t first:border-t-0" style={{ borderColor: "var(--glass-border)" }}>
                <button
                  type="button"
                  onClick={() => router.push(`/counselor?view=students&studentId=${s.id}`)}
                  className="dm-quiet group flex w-full cursor-pointer flex-wrap items-center gap-x-[12px] gap-y-[4px] rounded-[var(--radius-sm)] px-[4px] py-[10px] text-left"
                >
                  <Avatar name={s.name} size={32} index={s.avatarIndex} />
                  <span className="flex min-w-0 flex-1 flex-col leading-tight">
                    <span className="truncate text-[13px] font-bold" style={{ color: "var(--foreground)" }}>{s.name}</span>
                    <span className="truncate text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Grade {s.grade} · {s.careerTrack}</span>
                  </span>
                  {/* Under the name on phones, beside it from sm: at 375px the
                     reason took the row and cut names to "Omar H..." (26 Sept
                     2026 phone check). The dot is the severity (Critical,
                     High, Medium), a color instead of a chip. */}
                  <span className="flex w-full items-center gap-[10px] pl-[44px] text-[12.5px] font-semibold sm:w-auto sm:flex-none sm:pl-0">
                    <span role="img" aria-label={severity} title={severity} className="size-[8px] flex-none rounded-full" style={{ background: SEVERITY_COLORS[severity] }} />
                    <span style={{ color: "var(--foreground)" }}>{attentionReason(s)}</span>
                    <Go className="opacity-0 transition-opacity group-hover:opacity-100" />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function Overview() {
  const router = useRouter();
  const { gradeFilter, setStatusFilter } = useCounselorFilters();
  const reviewed = useReviewedRoster();
  const roster = useMemo(() => (gradeFilter === "All Grades" ? reviewed : reviewed.filter((s) => s.grade === gradeFilter)), [reviewed, gradeFilter]);

  const [drill, setDrill] = useState<Drill | null>(null);

  const goToStudents = (status: StatusRosterFilter) => {
    setStatusFilter(status);
    router.push("/counselor?view=students");
  };

  const total = roster.length || 1;
  const onTrack = roster.filter((s) => s.status === "On Track").length;
  const needsAttention = roster.filter((s) => s.status === "Needs Attention").length;
  const atRisk = roster.filter((s) => s.status === "At Risk").length;

  // Every milestone checkpoint across the grades in view, from the same
  // curriculum data the Milestone Tracker reads.
  const milestones = useMemo(() => {
    const grades = gradeFilter === "All Grades" ? ([9, 10, 11, 12] as const) : ([gradeFilter] as const);
    const sum = { completed: 0, needsAttention: 0, inProgress: 0, notStarted: 0 };
    for (const g of grades) for (const item of curriculumForGrade(g)) {
      sum.completed += item.completed; sum.needsAttention += item.needsAttention; sum.inProgress += item.inProgress; sum.notStarted += item.notStarted;
    }
    return sum;
  }, [gradeFilter]);

  // Worst first, not roster order -- direct instruction: "rate by severity
  // so counselor knows what to give attention first."
  const atRiskStudents = useMemo(() => roster.filter((s) => s.status === "At Risk").sort(attentionRank), [roster]);

  const onTrackPct = (onTrack / total) * 100;
  // The hero card's own color reports the reading: a healthy caseload
  // glows the chart blue (one chart family, 26 Sept 2026), a struggling
  // one amber or red.
  const heroTint = onTrackPct >= 80 ? CHART_STATUS["On Track"] : onTrackPct >= 60 ? STATUS_COLORS["Needs Attention"] : STATUS_COLORS["At Risk"];

  // Student Status's drill: the breakdown, last month's change (hand-authored
  // demo history, like the roster) and the students at risk.
  const openStatusDrill = () => setDrill({
    title: "Student Status",
    subtitle: `${roster.length} students`,
    lead: `${Math.round(onTrackPct)}% of students are on track, up 2 pts vs last month.`,
    rows: [
      { label: "On Track", value: String(onTrack), pct: (onTrack / total) * 100 },
      { label: "Needs Attention", value: String(needsAttention), pct: (needsAttention / total) * 100 },
      { label: "At Risk", value: String(atRisk), pct: (atRisk / total) * 100 },
    ],
    rowsLabel: "Students by status",
    students: atRiskStudents.map((st) => ({ id: st.id, name: st.name, grade: st.grade, avatarIndex: st.avatarIndex, note: attentionReason(st) })),
    studentsLabel: `${atRiskStudents.length} at risk`,
    action: { label: "See all students", onClick: () => { setDrill(null); goToStudents("At Risk"); } },
  });

  // Four cards, in the order Maisha set (27 Sept 2026): needs attention
  // (critical) at the top, student status, career pathways. Each one opens
  // the fuller picture on its own screen ("I also like how each snapshot
  // on the overview leads to a broader picture by a click to a different
  // tab"): the attention list to Students, status and milestones to
  // Students and the Milestone Tracker, pathways to Career + College
  // Insights.
  return (
    <div className="flex flex-col gap-[var(--space-6)]">
      <AttentionStrip students={atRiskStudents} onSeeAll={() => goToStudents("At Risk")} />
      {/* Reads this row's own width, not the browser's: the sidebar takes
         ~250px, so a viewport breakpoint went two-across into too little
         room (26 Sept 2026 report). */}
      <div className="@container">
        <div className="grid grid-cols-1 gap-[var(--space-4)] @[760px]:grid-cols-2">
          <StudentStatusCard onTrack={onTrack} needsAttention={needsAttention} atRisk={atRisk} heroTint={heroTint} onStatus={goToStudents} onDetails={openStatusDrill} />
          <PathwaysCard onOpen={() => router.push("/counselor?view=insights")} />
        </div>
      </div>
      <MilestonesCard milestones={milestones} onOpen={() => router.push("/counselor?view=milestones")} />
      <DrillPanel drill={drill} onClose={() => setDrill(null)} />
    </div>
  );
}
