"use client";

// DEMO-ONLY v2 fork of ../Overview.tsx (24 Sept 2026). v1 stays untouched so the
// two builds can be compared live via the bottom-center version chip
// (../version.tsx). Changes from the 24 Sept audit land here.

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { TrendingDown, TrendingUp } from "lucide-react";
import { SegmentedRing } from "@/components/connect/viz";
import { Panel } from "@/components/connect/ProProfile";
import { HoverBeam } from "@/components/app/HoverBeam";
import { Avatar, CardLink, Go, StatRow } from "../chips";
import { attentionReason, attentionSeverity, attentionRank, milestonesForGrade, type CounselorStudent, type AttentionSeverity, type MilestoneKey } from "@/lib/counselorRoster";
import { useCounselorFilters, type StatusRosterFilter, type PlanRosterFilter } from "../shell";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { BLUE_3, NEUTRAL_SLICE, PRIMARY, TARGET_LINE } from "../palette";
import { WORLD_COLORS } from "@/components/app/worlds";
import { GLASS_INSET } from "../surfaces";
import { planGradeSummary } from "./PlanMap";

export const STATUS_COLORS: Record<CounselorStudent["status"], string> = {
  "On Track": "#33C78C",
  "Needs Attention": "#F5A623",
  "At Risk": "#E0453C",
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
  Critical: "#E0453C",
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
const READINESS_TARGET = 80;
const grades: (9 | 10 | 11 | 12)[] = [9, 10, 11, 12];
const READINESS_ROWS: { key: MilestoneKey; label: string }[] = [
  { key: "Career Report", label: "Career Report" },
  { key: "Resume", label: "Resume" },
  { key: "Academic Plan", label: "Academic Plan" },
  { key: "College List", label: "College List" },
  { key: "Financial Aid", label: "FAFSA" },
];
function readinessColor(pct: number): string {
  return pct >= READINESS_TARGET ? STATUS_COLORS["On Track"] : READINESS_TARGET - pct <= 10 ? STATUS_COLORS["Needs Attention"] : STATUS_COLORS["At Risk"];
}
// The target/benchmark line needs to read as "not one of the bars" against
// an all-blue ramp, and "not the status amber" against the rest of the
// page -- a warm bronze does both: validated clear of "Needs Attention"
// (`validate_palette.js "#F5A623,#A67C2E" --mode dark` -> ΔE 17.9, passes)
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

function DeltaChip({ pts }: { pts: number }) {
  const up = pts >= 0;
  const color = up ? STATUS_COLORS["On Track"] : STATUS_COLORS["At Risk"];
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
  const ringSize = hero ? 152 : 108;
  const ringStroke = hero ? 17 : 13;
  // A quiet version of the same glow, not just a flat plain box -- "no
  // upgrade at all" was a fair read of a sidekick card that got resized but
  // kept every pixel of its old self. Low enough opacity it never competes
  // with the hero's, but the card still reads as considered, not neglected.
  const glowColor = heroTint ?? rows[0]?.color ?? "var(--primary)";
  return (
    <HoverBeam strength={0.7} className="h-full">
      <div className="group relative flex h-full flex-col gap-[var(--space-5)] overflow-hidden rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={surface}>
        {hero && <span aria-hidden className="pointer-events-none absolute inset-0" style={{ background: glowBackdrop(glowColor, 0.3) }} />}
        <div className="relative flex flex-col gap-[2px]">
          {/* Wraps: in the narrow third-column card the link drops under
             the title instead of forcing "Postsecondary Plans" onto two
             lines. */}
          <span className="flex flex-wrap items-start justify-between gap-[8px]">
            <h2 className="text-[15px] leading-[1.3] font-bold whitespace-nowrap" style={{ color: "var(--foreground)" }}>{title}</h2>
            {aside}
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

// A donut this size with 7 categories would be mostly hairline slivers,
// illegible at a glance -- but a set of separate ranked bars was wrong for
// a different reason (direct correction, 23 Sept 2026): "it's supposed to
// show how many out of the total number of students... are in different
// pathways... individually for them to fill up a bar doesn't make sense,
// we're showing distribution or breakdown." A bar that fills on its own
// reads as progress toward ITS OWN goal; what this data actually is, is
// parts of one whole. Fixed with the graph a "distribution" chart actually
// is: one stacked bar, its own segments sized to each pathway's real share
// of the roster (all segments together always sum to the full bar), with
// the ranked legend as the supporting detail below it -- same "graph on
// top, bigger; other info below" shape as the two ring cards.
// Clicking a pathway cross-filters the whole Overview page (not a
// navigation -- direct instruction distinguishes this from the donut
// click-throughs, which land on the Roster). The stacked bar's own
// segments are the click targets too, not just the legend rows, since
// they're already visually "the thing you'd click."
function PathwaysCard({ total, topPathways, colors, activePathway, onToggle, onOpen }: { total: number; topPathways: [string, number][]; colors: string[]; activePathway: string | null; onToggle: (label: string) => void; onOpen: () => void }) {
  return (
    <HoverBeam strength={0.7} className="h-full">
      <div className="group relative flex h-full flex-col gap-[var(--space-5)] overflow-hidden rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={GLASS_CARD}>
        <div className="relative flex items-center justify-between gap-[8px]">
          <h2 className="text-[15px] leading-[1.3] font-bold" style={{ color: "var(--foreground)" }}>Career Pathways</h2>
          {!activePathway && <CardLink onClick={onOpen}>Insights</CardLink>}
          {activePathway && (
            <button type="button" onClick={() => onToggle(activePathway)} className="dm-quiet flex cursor-pointer items-center gap-[4px] rounded-full border px-[8px] py-[2px] text-[11px] font-bold" style={{ borderColor: "color-mix(in srgb, var(--primary) 35%, var(--glass-border))", color: "var(--foreground)" }}>
              {activePathway} <span aria-hidden style={{ color: "var(--muted-foreground)" }}>✕</span>
            </button>
          )}
        </div>
        <div className="relative flex flex-1 flex-col justify-center gap-[var(--space-5)]">
          <span className="flex h-[18px] w-full overflow-hidden rounded-full" style={{ background: "color-mix(in srgb, var(--foreground) 12%, transparent)", boxShadow: "0 6px 16px -6px rgba(0,0,0,0.5)" }}>
            {topPathways.map(([label, value], i) => {
              const pct = total > 0 ? (value / total) * 100 : 0;
              if (pct <= 0) return null;
              const dim = activePathway !== null && activePathway !== label;
              return (
                <button
                  key={label} type="button" onClick={() => onToggle(label)} title={`${label}: ${value}`}
                  aria-pressed={activePathway === label}
                  className="h-full flex-none cursor-pointer first:rounded-l-full last:rounded-r-full [&:not(:last-child)]:shadow-[inset_-2px_0_0_var(--card)]"
                  style={{ width: `${pct}%`, background: colors[i % colors.length], opacity: dim ? 0.35 : 1, transition: "opacity 120ms ease" }}
                />
              );
            })}
          </span>
          {/* Tried a 2-column legend twice (mobile wrap, then a wider card
             still wrapping/staggering) -- several of these category names
             ("Counseling & Social Work", "Personal Care & Community
             Services", "Fixing Machines & Engines") just don't fit a
             half-width column with a right-aligned number at any
             reasonable card size (direct report, with a screenshot: "This
             isnt fixed"). Single column, proven to hold up everywhere. */}
          <div className="flex flex-col gap-[4px]">
            {topPathways.map(([label, value], i) => (
              <StatRow key={label} label={label} value={value} color={colors[i % colors.length]} active={activePathway === label} onClick={() => onToggle(label)} />
            ))}
          </div>
        </div>
      </div>
    </HoverBeam>
  );
}

// "Nothing needs your attention" is a real, expected state (a healthy
// caseload, or a narrow grade/pathway filter with no matches), not an
// error -- a quiet one-line message, no illustration, matching this app's
// default empty-state treatment for a filtered list that's just empty.
//
// Redesigned per direct feedback: promoted above the donut row (it's the
// one card that says "act now," so it leads, not trails); the per-student
// "At Risk" pill was dropped -- every single card in a section titled
// "needs your attention" is at risk, so the badge repeated the section's
// own heading six times over without adding information, pure clutter.
// Bigger avatars and real padding instead, so six names read as a
// considered row, not a cram of chips.
// Rebuilt 25 Sept 2026 (direct feedback: "lose the red glow on needs your
// attention", and the standing budget: skimmable, one line per item, color
// only where it means something). No glow, no filled red blocks: one row
// per student on the raised inset surface, the reason in plain text, and
// the severity as one colored word. Three rows, then "See all".
function AttentionStrip({ students, onSeeAll }: { students: CounselorStudent[]; onSeeAll: () => void }) {
  const router = useRouter();
  const shown = students.slice(0, 3);
  const rest = students.length - shown.length;
  return (
    <div className="group flex flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={GLASS_CARD}>
      <div className="flex items-center justify-between gap-[8px]">
        <h2 className="text-[15px] leading-[1.3] font-bold" style={{ color: "var(--foreground)" }}>Needs your attention</h2>
        <CardLink onClick={onSeeAll}>{rest > 0 ? `See all ${students.length}` : "Students"}</CardLink>
      </div>
      {students.length === 0 ? (
        <p className="text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Nothing needs attention under the current filters.</p>
      ) : (
        <ul className="flex flex-col gap-[6px]">
          {shown.map((s) => {
            const severity = attentionSeverity(s);
            const color = SEVERITY_COLORS[severity];
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => router.push(`/counselor?view=students&studentId=${s.id}`)}
                  className="dm-quiet group flex w-full cursor-pointer flex-wrap items-center gap-x-[12px] gap-y-[4px] rounded-[var(--radius-md)] border px-[12px] py-[8px] text-left"
                  style={GLASS_INSET}
                >
                  <Avatar name={s.name} size={32} index={s.avatarIndex} />
                  <span className="flex min-w-0 flex-1 flex-col leading-tight">
                    <span className="truncate text-[13px] font-bold" style={{ color: "var(--foreground)" }}>{s.name}</span>
                    <span className="truncate text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Grade {s.grade} · {s.careerTrack}</span>
                  </span>
                  <span className="flex flex-none items-center gap-[10px] text-[12.5px] font-semibold">
                    <span style={{ color: "var(--foreground)" }}>{attentionReason(s)}</span>
                    <span className="text-[10.5px] font-extrabold tracking-[0.04em] uppercase" style={{ color }}>{severity}</span>
                    <Go />
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
  const { gradeFilter, setGradeFilter, setStatusFilter, setPlanFilter } = useCounselorFilters();
  // Local to this page, not the shared context -- distinct from the donut
  // click-throughs on purpose (direct instruction: this one "cross-filters
  // the whole Overview page", the donuts navigate to Students instead).
  const [pathwayFilter, setPathwayFilter] = useState<string | null>(null);
  const togglePathway = (label: string) => setPathwayFilter((cur) => (cur === label ? null : label));

  const reviewed = useReviewedRoster();
  const topSix = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of reviewed) counts.set(s.careerTrack, (counts.get(s.careerTrack) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k]) => k);
  }, [reviewed]);
  const roster = useMemo(() => {
    let all = reviewed;
    if (gradeFilter !== "All Grades") all = all.filter((s) => s.grade === gradeFilter);
    if (pathwayFilter) all = pathwayFilter === "Other" ? all.filter((s) => !topSix.includes(s.careerTrack)) : all.filter((s) => s.careerTrack === pathwayFilter);
    return all;
  }, [reviewed, gradeFilter, pathwayFilter, topSix]);

  const goToStudents = (status?: StatusRosterFilter, plan?: PlanRosterFilter) => {
    if (status) setStatusFilter(status);
    if (plan) setPlanFilter(plan);
    router.push("/counselor?view=students");
  };

  const total = roster.length || 1;
  const onTrack = roster.filter((s) => s.status === "On Track").length;
  const needsAttention = roster.filter((s) => s.status === "Needs Attention").length;
  const atRisk = roster.filter((s) => s.status === "At Risk").length;

  const withPlan = roster.filter((s) => s.postsecondaryIntent !== "Undecided").length;
  const undecided = total - withPlan;

  const pathwayCounts = new Map<string, number>();
  for (const s of roster) pathwayCounts.set(s.careerTrack, (pathwayCounts.get(s.careerTrack) ?? 0) + 1);
  // Fifteen Build worlds are too many for one bar: the six largest, then
  // "Other" (dataviz rule: fold the tail, never a ninth hue).
  const ranked = [...pathwayCounts.entries()].sort((a, b) => b[1] - a[1]);
  const rest = ranked.slice(6).reduce((n, [, v]) => n + v, 0);
  const topPathways: [string, number][] = rest > 0 ? [...ranked.slice(0, 6), ["Other", rest]] : ranked.slice(0, 7);
  // Each pathway wears the colour its world has everywhere else in the
  // student app (WORLD_COLORS, the Figma Career Poster Card variants, light
  // and dark values in tokens.css). Direct instruction, 25 Sept 2026: "let
  // pathways use the actual color system we use for the different
  // industries in the dreamari app." History: a seven-hue set that reused
  // status colors; a single-hue ramp that blended neighbours; three
  // cluster hues that repeated; a spectral rank order (palette.ts
  // PATHWAY_SEQUENCE, now unused here). "Other" stays neutral.
  const pathwayColors = topPathways.map(([label]) => (label === "Other" ? NEUTRAL_SLICE : WORLD_COLORS[label] ?? PRIMARY));

  const gradeSummary = useMemo(() => planGradeSummary(reviewed), [reviewed]);
  const gradeVerdictColor = gradeSummary.length === 0 ? STATUS_COLORS["On Track"] : gradeSummary[0].donePct >= 80 ? STATUS_COLORS["On Track"] : gradeSummary[0].donePct >= 50 ? STATUS_COLORS["Needs Attention"] : STATUS_COLORS["At Risk"];
  // Five milestones, each over the grades the reference tracks it for
  // (milestonesForGrade), lowest share first.
  const readiness = useMemo(() => READINESS_ROWS.map((r) => {
    const rowGrades = grades.filter((g) => milestonesForGrade(g).includes(r.key));
    const pool = roster.filter((s) => rowGrades.includes(s.grade as 9 | 10 | 11 | 12));
    const done = pool.filter((s) => s.milestones[r.key] === "Approved" || s.milestones[r.key] === "Completed").length;
    return { ...r, grades: rowGrades, pool: pool.length, done, pct: pool.length ? Math.round((done / pool.length) * 100) : 0 };
  }).filter((r) => r.pool > 0).sort((a, b) => a.pct - b.pct), [roster]);

  // Worst first, not roster order -- direct instruction: "rate by severity
  // so counselor knows what to give attention first."
  const atRiskStudents = useMemo(() => roster.filter((s) => s.status === "At Risk").sort(attentionRank), [roster]);

  const onTrackPct = (onTrack / total) * 100;
  // The hero card's own color reports the reading, not just the brand's --
  // a healthy caseload glows the same green as "On Track" everywhere else
  // in this dashboard, a struggling one would glow amber or red.
  const heroTint = onTrackPct >= 80 ? STATUS_COLORS["On Track"] : onTrackPct >= 60 ? STATUS_COLORS["Needs Attention"] : STATUS_COLORS["At Risk"];

  return (
    <div className="flex flex-col gap-[var(--space-6)]">
      {/* Leads the page, not the donut row -- direct instruction: this is
         the one card that says "act now," everything else is read-only
         context underneath it. */}
      <AttentionStrip students={atRiskStudents} onSeeAll={() => goToStudents("At Risk")} />

      {/* Asymmetric 12-col grid, not three equal boxes -- "dominance over
         equality": one card (Student Status) carries the visual weight as
         the wide hero, Postsecondary Plans is the compact simple-data
         sidekick, Career Pathways keeps enough room for its 7-row legend
         (direct feedback: "no design experimentation... the same cards"). */}
      <div className="grid grid-cols-1 gap-[var(--space-4)] xl:grid-cols-12">
        <div className="xl:col-span-5">
          <DonutCard
            title="Student Status"
            centerPct={onTrackPct}
            centerLabel="on track"
            deltaPts={2}
            hero
            heroTint={heroTint}
            aside={<CardLink onClick={() => goToStudents()}>Students</CardLink>}
            rows={[
              { label: "On Track", value: onTrack, color: STATUS_COLORS["On Track"], onClick: () => goToStudents("On Track") },
              { label: "Needs Attention", value: needsAttention, color: STATUS_COLORS["Needs Attention"], onClick: () => goToStudents("Needs Attention") },
              { label: "At Risk", value: atRisk, color: STATUS_COLORS["At Risk"], onClick: () => goToStudents("At Risk") },
            ]}
          />
        </div>
        <div className="xl:col-span-4">
          <PathwaysCard total={total} topPathways={topPathways} colors={pathwayColors} activePathway={pathwayFilter} onToggle={togglePathway} onOpen={() => router.push("/counselor?view=insights")} />
        </div>
        <div className="xl:col-span-3">
          <DonutCard
            title="Postsecondary Plans"
            centerPct={(withPlan / total) * 100}
            centerLabel="have a plan"
            deltaPts={4}
            aside={<CardLink onClick={() => goToStudents()}>Students</CardLink>}
            rows={[
              { label: "With Plan", value: withPlan, color: PRIMARY, onClick: () => goToStudents(undefined, "With Plan") },
              { label: "Undecided", value: undecided, color: NEUTRAL_SLICE, onClick: () => goToStudents(undefined, "Undecided") },
            ]}
          />
        </div>
      </div>

      {/* My Plan by grade and the reviews chart. This row replaced the
         "Academic Readiness" bars, whose College List and FAFSA series
         were "Not Applicable" for Grades 9-11 and rendered as empty
         columns (direct report, 25 Sept 2026: "i see empty graphs in
         overview"). The full school year map (grade by season) lives on
         the Milestone Tracker only ("let's not show the grid in two
         places"); here it is one line per grade, the glance version,
         and each line opens the tracker at that grade. */}
      <div className="grid grid-cols-1 gap-[var(--space-4)] xl:grid-cols-2">
        <HoverBeam strength={0.6} className="h-full">
          <Panel id="plan-by-grade" title="My Plan by grade" className="h-full">
            <p className="-mt-[var(--space-2)] text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Steps done this year</p>
            {gradeSummary.length > 0 && (
              <p className="flex items-center gap-[8px] text-[13.5px] leading-[18px] font-bold" style={{ color: "var(--foreground)" }}>
                <span aria-hidden className="size-[8px] flex-none rounded-full" style={{ background: gradeVerdictColor, boxShadow: `0 0 8px ${gradeVerdictColor}` }} />
                <span>Grade {gradeSummary[0].grade} has the most room to grow</span>
              </p>
            )}
            <ul className="flex flex-col gap-[6px]">
              {gradeSummary.map((g) => (
                <li key={g.grade}>
                  <button type="button" onClick={() => { setGradeFilter(g.grade); router.push("/counselor?view=milestones"); }} className="dm-quiet group flex w-full cursor-pointer flex-col gap-[6px] rounded-[var(--radius-md)] border px-[12px] py-[9px] text-left" style={GLASS_INSET}>
                    <span className="flex items-baseline justify-between gap-[10px]">
                      <span className="flex min-w-0 items-baseline gap-[8px]">
                        <span className="text-[13.5px] font-bold" style={{ color: "var(--foreground)" }}>Grade {g.grade}</span>
                        <span className="truncate text-[11.5px] font-semibold" style={{ color: g.awaiting > 0 ? PRIMARY : "var(--muted-foreground)" }}>{g.awaiting > 0 ? `${g.awaiting} pending your review` : g.notDone > 0 ? `${g.notDone} of ${g.students} still have steps to do` : "everyone is done"}</span>
                      </span>
                      <span className="flex flex-none items-center gap-[6px]">
                        <span className="text-[15px] leading-[1] font-extrabold tabular-nums" style={{ color: "var(--foreground)" }}>{g.donePct}%</span>
                        <Go />
                      </span>
                    </span>
                    <span className="block h-[6px] w-full overflow-hidden rounded-full" style={{ background: "color-mix(in srgb, var(--foreground) 8%, transparent)" }} aria-hidden>
                      <span className="block h-full rounded-full" style={{ width: `${g.donePct}%`, background: `linear-gradient(90deg, color-mix(in srgb, ${PRIMARY} 55%, transparent), ${PRIMARY})` }} />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </Panel>
        </HoverBeam>
        <HoverBeam strength={0.6} className="h-full">
          {/* Maisha's Career Readiness and Academic Readiness bars, kept as
             measures and re-shaped (25 Sept 2026, direct question: "why
             did we remove career readiness and academic readiness? ... we
             need a concrete reason"). The bars split five milestones over
             four grade columns, but Resume starts in Grade 10 and College
             List and FAFSA in Grade 12, so three of five series were Not
             Applicable for Grades 9-11 and rendered as empty columns. One
             row per measure, over the grades it applies to, keeps all five
             with nothing empty, in the same footprint. */}
          <Panel id="readiness" title="Readiness" className="h-full">
            <p className="-mt-[var(--space-2)] text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>% approved, over the grades each milestone applies to</p>
            {readiness.length > 0 && (
              <p className="flex items-center gap-[8px] text-[13.5px] leading-[18px] font-bold" style={{ color: "var(--foreground)" }}>
                <span aria-hidden className="size-[8px] flex-none rounded-full" style={{ background: readinessColor(readiness[0].pct), boxShadow: `0 0 8px ${readinessColor(readiness[0].pct)}` }} />
                <span>{readiness[0].pct >= READINESS_TARGET ? "Every milestone is on target" : `${readiness[0].label} has the most room to grow`}</span>
              </p>
            )}
            <ul className="flex flex-col gap-[6px]">
              {readiness.map((r) => (
                <li key={r.key}>
                  <button type="button" onClick={() => { setGradeFilter(r.grades[0]); router.push("/counselor?view=milestones"); }} className="dm-quiet group flex w-full cursor-pointer flex-col gap-[6px] rounded-[var(--radius-md)] border px-[12px] py-[9px] text-left" style={GLASS_INSET}>
                    <span className="flex items-baseline justify-between gap-[10px]">
                      <span className="flex min-w-0 items-baseline gap-[8px]">
                        <span className="text-[13.5px] font-bold" style={{ color: "var(--foreground)" }}>{r.label}</span>
                        <span className="truncate text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{r.grades.length > 1 ? `Gr ${r.grades[0]}–${r.grades[r.grades.length - 1]}` : `Gr ${r.grades[0]}`} · {r.done} of {r.pool}</span>
                      </span>
                      <span className="flex flex-none items-center gap-[6px]">
                        <span className="text-[15px] leading-[1] font-extrabold tabular-nums" style={{ color: r.pct >= READINESS_TARGET ? "var(--foreground)" : readinessColor(r.pct) }}>{r.pct}%</span>
                        <Go />
                      </span>
                    </span>
                    <span className="relative block h-[6px] w-full overflow-hidden rounded-full" style={{ background: "color-mix(in srgb, var(--foreground) 8%, transparent)" }} aria-hidden>
                      <span className="block h-full rounded-full" style={{ width: `${r.pct}%`, background: r.pct >= READINESS_TARGET ? `linear-gradient(90deg, color-mix(in srgb, ${PRIMARY} 55%, transparent), ${PRIMARY})` : readinessColor(r.pct) }} />
                      <span className="absolute top-[-2px] h-[10px] w-[2px] rounded-full" style={{ left: `${READINESS_TARGET}%`, background: TARGET_LINE_COLOR }} />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </Panel>
        </HoverBeam>
      </div>
    </div>
  );
}
