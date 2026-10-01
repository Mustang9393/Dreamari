"use client";

// Counselor Dashboard v3 (29 Sept 2026): v2's Overview with the research
// build on top. "Today" (./Today.tsx) replaces the "Needs your attention"
// strip and carries every At Risk row it showed; the season strip sits
// between it and the two v2 snapshots, which are unchanged.

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { TrendingDown, TrendingUp } from "lucide-react";
import { SegmentedRing } from "@/components/connect/viz";
import { OverviewCard } from "./overviewShared";
import { HoverBeam } from "@/components/app/HoverBeam";
import { CardLink, StatRow } from "../chips";
import { type CounselorStudent } from "@/lib/counselorRoster";
import { curriculumForGrade } from "@/lib/counselorCurriculum";
import { RankedBars, TOP_SAVED_CAREERS } from "./CareerCollegeInsights";
import { useCounselorFilters, type StatusRosterFilter } from "../shell";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { BLUE_3, NEUTRAL_SLICE, PRIMARY, TARGET_LINE, CHART_STATUS, TREND_UP } from "../palette";
import { SeasonStrip, TodayCard } from "./Today";

export const STATUS_COLORS: Record<CounselorStudent["status"], string> = {
  "On Track": "var(--cd-green)",
  "Needs Attention": "var(--cd-amber)",
  "At Risk": "var(--cd-red)",
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
      <div className="group relative flex h-full flex-col gap-[var(--space-5)] overflow-hidden rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={surface}>
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

// Student Status now carries the whole caseload picture in one card: how
// students stand (the ring) and how far they are through every milestone
// (the bar), with the way into each (27 Sept 2026, Maisha: "Student status.
// This can show overall progress snapshot across all milestones"). It
// replaces three cards that each told part of it: Postsecondary Plans and
// the two readiness bar charts, which she asked to remove ("Remove
// everything else ... This will make the overview much cleaner").
function StudentStatusCard({ onTrack, needsAttention, atRisk, heroTint, milestones, onStatus, onMilestones }: { onTrack: number; needsAttention: number; atRisk: number; heroTint: string; milestones: Record<(typeof MILESTONE_STATES)[number]["key"], number>; onStatus: (s: StatusRosterFilter) => void; onMilestones: () => void }) {
  const total = onTrack + needsAttention + atRisk || 1;
  const checkpoints = MILESTONE_STATES.reduce((a, st) => a + milestones[st.key], 0) || 1;
  const donePct = Math.round((milestones.completed / checkpoints) * 100);
  const surface = { ...GLASS_CARD_HERO, borderColor: `color-mix(in srgb, ${heroTint} 38%, var(--glass-border))` };
  return (
    <HoverBeam strength={0.7} className="h-full">
      <div className="group relative flex h-full flex-col gap-[var(--space-5)] overflow-hidden rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={surface}>
        <span aria-hidden className="pointer-events-none absolute inset-0" style={{ background: glowBackdrop(heroTint, 0.3) }} />
        <div className="relative flex flex-col gap-[2px]">
          <h2 className="text-[15px] leading-[1.3] font-bold" style={{ color: "var(--foreground)" }}>Student Status</h2>
          <DeltaChip pts={2} />
        </div>
        <div className="@container relative flex-1">
          <div className="grid h-full grid-cols-1 gap-[var(--space-5)] @[560px]:grid-cols-2">
            <div className="flex flex-col items-center justify-center gap-[var(--space-4)]">
              <SegmentedRing segments={[{ value: onTrack, color: CHART_STATUS["On Track"] }, { value: needsAttention, color: CHART_STATUS["Needs Attention"] }, { value: atRisk, color: CHART_STATUS["At Risk"] }]} size={132} stroke={15}>
                <span className="flex flex-col items-center">
                  <span className="text-[32px] leading-[1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{Math.round((onTrack / total) * 100)}%</span>
                  <span className="text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>on track</span>
                </span>
              </SegmentedRing>
              <div className="flex w-full flex-col gap-[4px]">
                <StatRow label="On Track" value={onTrack} color={CHART_STATUS["On Track"]} onClick={() => onStatus("On Track")} />
                <StatRow label="Needs Attention" value={needsAttention} color={CHART_STATUS["Needs Attention"]} onClick={() => onStatus("Needs Attention")} />
                <StatRow label="At Risk" value={atRisk} color={CHART_STATUS["At Risk"]} onClick={() => onStatus("At Risk")} />
              </div>
            </div>
            <div className="flex flex-col justify-center gap-[var(--space-4)] border-t pt-[var(--space-5)] @[560px]:border-t-0 @[560px]:border-l @[560px]:pt-0 @[560px]:pl-[var(--space-5)]" style={{ borderColor: "var(--glass-border)" }}>
              <span className="flex items-start justify-between gap-[10px]">
                <span className="flex flex-col gap-[2px]">
                  <span className="text-[11px] font-bold tracking-[0.06em] uppercase" style={{ color: "var(--muted-foreground)" }}>Across all milestones</span>
                  <span className="flex items-baseline gap-[8px]">
                    <span className="text-[32px] leading-[1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{donePct}%</span>
                    <span className="text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>done</span>
                  </span>
                </span>
                <CardLink onClick={onMilestones}>Milestones</CardLink>
              </span>
              <span className="flex h-[10px] w-full overflow-hidden rounded-full" role="img" aria-label={MILESTONE_STATES.map((st) => `${st.label} ${milestones[st.key]}`).join(", ")} style={{ background: "color-mix(in srgb, var(--foreground) 7%, transparent)" }}>
                {MILESTONE_STATES.map((st) => <span key={st.key} className="h-full" style={{ width: `${(milestones[st.key] / checkpoints) * 100}%`, background: st.color }} />)}
              </span>
              <div className="flex w-full flex-col gap-[4px]">
                {MILESTONE_STATES.map((st) => <StatRow key={st.key} label={st.label} value={milestones[st.key]} color={st.color} onClick={onMilestones} />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </HoverBeam>
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

export function Overview() {
  const router = useRouter();
  const { gradeFilter, setStatusFilter } = useCounselorFilters();
  const reviewed = useReviewedRoster();
  const roster = useMemo(() => (gradeFilter === "All Grades" ? reviewed : reviewed.filter((s) => s.grade === gradeFilter)), [reviewed, gradeFilter]);

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


  const onTrackPct = (onTrack / total) * 100;
  // The hero card's own color reports the reading: a healthy caseload
  // glows the chart blue (one chart family, 26 Sept 2026), a struggling
  // one amber or red.
  const heroTint = onTrackPct >= 80 ? CHART_STATUS["On Track"] : onTrackPct >= 60 ? STATUS_COLORS["Needs Attention"] : STATUS_COLORS["At Risk"];

  // Three cards, in the order Maisha set (27 Sept 2026): needs attention
  // (critical) at the top, student status, career pathways. Each one opens
  // the fuller picture on its own screen ("I also like how each snapshot
  // on the overview leads to a broader picture by a click to a different
  // tab"): the attention list to Students, status and milestones to
  // Students and the Milestone Tracker, pathways to Career + College
  // Insights.
  return (
    <div className="flex flex-col gap-[var(--space-6)]">
      <TodayCard roster={roster} />
      <SeasonStrip roster={roster} />
      {/* Reads this row's own width, not the browser's: the sidebar takes
         ~250px, so a viewport breakpoint went two-across into too little
         room (26 Sept 2026 report). */}
      <div className="@container">
        <div className="grid grid-cols-1 gap-[var(--space-4)] @[980px]:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <StudentStatusCard onTrack={onTrack} needsAttention={needsAttention} atRisk={atRisk} heroTint={heroTint} milestones={milestones} onStatus={goToStudents} onMilestones={() => router.push("/counselor?view=milestones")} />
          <PathwaysCard onOpen={() => router.push("/counselor?view=insights")} />
        </div>
      </div>
    </div>
  );
}
