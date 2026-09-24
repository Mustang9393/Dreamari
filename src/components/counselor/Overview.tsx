"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { TrendingDown, TrendingUp, ChevronRight, AlertTriangle } from "lucide-react";
import { SegmentedRing, BarChart } from "@/components/connect/viz";
import { Panel } from "@/components/connect/ProProfile";
import { HoverBeam } from "@/components/app/HoverBeam";
import { Avatar, StatRow } from "./chips";
import { getRoster, attentionReason, attentionSeverity, attentionRank, type CounselorStudent, type AttentionSeverity } from "@/lib/counselorRoster";
import { useCounselorFilters, type StatusRosterFilter, type PlanRosterFilter } from "./shell";

const STATUS_COLORS: Record<CounselorStudent["status"], string> = {
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
const READINESS_SERIES = ["#9BA8FB", "#5B6CF9", "#2E3BB8"];
// The target/benchmark line needs to read as "not one of the bars" against
// an all-blue ramp, and "not the status amber" against the rest of the
// page -- a warm bronze does both: validated clear of "Needs Attention"
// (`validate_palette.js "#F5A623,#A67C2E" --mode dark` -> ΔE 17.9, passes)
// and it's warm/cool-contrasting against every blue bar it sits over.
const TARGET_LINE_COLOR = "#A67C2E";

// Two surfaces, spent by role, not one surface repeated three times --
// "dominance over equality": one card should carry the visual weight,
// everything else recedes a notch, or nothing reads as the centerpiece
// (direct feedback: "no design experimentation... the same cards and the
// same things"). GLASS_CARD_HERO is now spent on exactly one card on this
// page (Student Status); every other card downgrades to the plain glass.
import { GLASS_CARD, GLASS_CARD_HERO, glowBackdrop } from "./surfaces";

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
function DonutCard({ title, centerPct, centerLabel, deltaPts, rows, hero, heroTint }: { title: string; centerPct: number; centerLabel: string; deltaPts?: number; rows: { label: string; value: number; color: string; onClick?: () => void }[]; hero?: boolean; heroTint?: string }) {
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
      <div className="relative flex h-full flex-col gap-[var(--space-5)] overflow-hidden rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={surface}>
        <span aria-hidden className="pointer-events-none absolute inset-0" style={{ background: glowBackdrop(glowColor, hero ? 0.3 : 0.14) }} />
        <div className="relative flex flex-col gap-[2px]">
          <h2 className="text-[15px] leading-[1.3] font-bold" style={{ color: "var(--foreground)" }}>{title}</h2>
          {/* Hand-authored, deterministic vs. last month -- same "seeded
             demo data" convention the roster itself already uses, not a
             live computation (there's no historical snapshot to compute
             it from). Direct instruction: trend deltas on the donut cards. */}
          {typeof deltaPts === "number" && <DeltaChip pts={deltaPts} />}
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
function PathwaysCard({ total, topPathways, colors, activePathway, onToggle }: { total: number; topPathways: [string, number][]; colors: string[]; activePathway: string | null; onToggle: (label: string) => void }) {
  return (
    <HoverBeam strength={0.7} className="h-full">
      <div className="relative flex h-full flex-col gap-[var(--space-5)] overflow-hidden rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={GLASS_CARD}>
        <span aria-hidden className="pointer-events-none absolute inset-0" style={{ background: glowBackdrop(colors[0], 0.14) }} />
        <div className="relative flex items-center justify-between gap-[8px]">
          <h2 className="text-[15px] leading-[1.3] font-bold" style={{ color: "var(--foreground)" }}>Career Pathways</h2>
          {activePathway && (
            <button type="button" onClick={() => onToggle(activePathway)} className="dm-quiet flex cursor-pointer items-center gap-[4px] rounded-full border px-[8px] py-[2px] text-[11px] font-bold" style={{ borderColor: "color-mix(in srgb, var(--primary) 35%, var(--glass-border))", color: "var(--foreground)" }}>
              {activePathway} <span aria-hidden style={{ color: "var(--muted-foreground)" }}>✕</span>
            </button>
          )}
        </div>
        <div className="relative flex flex-1 flex-col justify-center gap-[var(--space-5)]">
          <span className="flex h-[18px] w-full overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.08)", boxShadow: "0 6px 16px -6px rgba(0,0,0,0.5)" }}>
            {topPathways.map(([label, value], i) => {
              const pct = total > 0 ? (value / total) * 100 : 0;
              if (pct <= 0) return null;
              const dim = activePathway !== null && activePathway !== label;
              return (
                <button
                  key={label} type="button" onClick={() => onToggle(label)} title={`${label}: ${value}`}
                  aria-pressed={activePathway === label}
                  className="h-full flex-none cursor-pointer first:rounded-l-full last:rounded-r-full"
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
function AttentionStrip({ students, onSeeAll }: { students: CounselorStudent[]; onSeeAll: () => void }) {
  const router = useRouter();
  // One row's worth at the new, wider card size -- two full rows of these
  // bigger cards was a lot of vertical space for an at-a-glance strip
  // (direct feedback: "stick to showing only [a few] students... click on
  // see all to see more").
  const shown = students.slice(0, 3);
  const rest = students.length - shown.length;
  return (
    <div className="relative flex flex-col gap-[var(--space-4)] overflow-hidden rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={GLASS_CARD}>
      {/* Same quiet-glow treatment as every card below it, tied to the
         status color this whole strip is actually about -- uniform
         material across the page, not one glowing card and ten flat ones. */}
      <span aria-hidden className="pointer-events-none absolute inset-0" style={{ background: glowBackdrop(STATUS_COLORS["At Risk"], 0.12) }} />
      <div className="relative flex items-center justify-between gap-[8px]">
        <h2 className="text-[15px] leading-[1.3] font-bold" style={{ color: "var(--foreground)" }}>Needs your attention this week</h2>
        {rest > 0 && (
          <button type="button" onClick={onSeeAll} className="dm-quiet flex cursor-pointer items-center gap-[2px] text-[12.5px] font-bold" style={{ color: "var(--primary)" }}>
            See all {students.length} <ChevronRight className="h-[13px] w-[13px]" aria-hidden />
          </button>
        )}
      </div>
      {/* A grid, not a free-wrap flex row -- every chip's width was its own
         text length before ("Gr. 10 · Factories & Making Things" vs "Gr. 12
         · Arts, Media & Sport"), so the row read as ragged (direct
         feedback: "should NOT be varying widths, heights"). Fixed column
         widths plus a truncated subtitle give every chip the same
         footprint regardless of name or pathway length. */}
      {students.length === 0 ? (
        <p className="relative text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Nothing needs attention this week under the current filters.</p>
      ) : (
        // 3 columns, not 6 -- cramming six equal chips per row (a fixed
        // 1/6th of the card's width each) left no room for "Changes
        // requested: Transcript Submission" without truncating it away,
        // which defeated the whole point of adding a reason (direct
        // report: "things are truncating... the reason blends in and it
        // isn't very intuitive"). Half as many columns roughly doubles
        // each card's width.
        <div className="relative grid grid-cols-1 gap-[var(--space-3)] sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((s) => {
            const severity = attentionSeverity(s);
            const color = SEVERITY_COLORS[severity];
            return (
            <button
              key={s.id} type="button"
              onClick={() => router.push(`/counselor?view=students&studentId=${s.id}`)}
              className="dm-quiet flex min-w-0 cursor-pointer flex-col gap-[8px] rounded-[var(--radius-md)] border p-[12px] text-left"
              style={{ borderColor: "var(--glass-border)", background: "color-mix(in srgb, #FFFFFF 4%, transparent)" }}
            >
              <span className="flex min-w-0 items-center justify-between gap-[10px]">
                <span className="flex min-w-0 items-center gap-[10px]">
                  <Avatar name={s.name} size={36} />
                  <span className="flex min-w-0 flex-col items-start text-left leading-tight">
                    <span className="w-full truncate text-left text-[13px] font-bold" style={{ color: "var(--foreground)" }}>{s.name}</span>
                    <span className="w-full truncate text-left text-[11px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Grade {s.grade} · {s.careerTrack}</span>
                  </span>
                </span>
                {/* Sorted worst-first below, and labeled here too -- a
                   counselor with limited time should be able to tell which
                   of several open cards to act on without reading every
                   reason (direct instruction: "rate by severity so
                   counselor knows what to give attention first"). */}
                <span className="flex-none rounded-full px-[8px] py-[2px] text-[10px] font-extrabold tracking-[0.02em] uppercase" style={{ color, background: `color-mix(in srgb, ${color} 18%, transparent)` }}>{severity}</span>
              </span>
              {/* The reason lives in its own tinted, iconed pill below the
                 name -- direct feedback: run inline with the grade, "the
                 reason blends in." Its own row, its own color, its own
                 icon reads as a flag, not more metadata on the same line;
                 allowed to wrap to 2 lines (clamped, not truncated) since
                 the reason is the one piece of information here that
                 actually shouldn't get cut off. */}
              {/* `w-full` plus a fixed `min-h` (2 lines' worth) -- a 1-line
                 reason and a 2-line reason otherwise made pills of visibly
                 different sizes across the same row (direct feedback:
                 "keep the red surfaces uniform in width, heights"). Every
                 pill now occupies the same footprint regardless of how
                 much its own text wraps. Colored by severity, same as the
                 badge above -- not always red regardless of how urgent. */}
              <span className="flex w-full min-h-[42px] items-start gap-[6px] rounded-[var(--radius-sm)] px-[8px] py-[6px]" style={{ background: `color-mix(in srgb, ${color} 14%, transparent)` }}>
                <AlertTriangle className="mt-[1px] h-[13px] w-[13px] flex-none" aria-hidden style={{ color }} />
                <span className="line-clamp-2 text-[11.5px] leading-[15px] font-bold" style={{ color }}>{attentionReason(s)}</span>
              </span>
            </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Overview() {
  const router = useRouter();
  const { gradeFilter, setStatusFilter, setPlanFilter } = useCounselorFilters();
  // Local to this page, not the shared context -- distinct from the donut
  // click-throughs on purpose (direct instruction: this one "cross-filters
  // the whole Overview page", the donuts navigate to Students instead).
  const [pathwayFilter, setPathwayFilter] = useState<string | null>(null);
  const togglePathway = (label: string) => setPathwayFilter((cur) => (cur === label ? null : label));

  const roster = useMemo(() => {
    let all = getRoster();
    if (gradeFilter !== "All Grades") all = all.filter((s) => s.grade === gradeFilter);
    if (pathwayFilter) all = all.filter((s) => s.careerTrack === pathwayFilter);
    return all;
  }, [gradeFilter, pathwayFilter]);

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
  const topPathways = [...pathwayCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 7);
  const pathwayColors = ["#5B6CF9", "#7C5CFA", "#33C78C", "#4AB8D8", "#F5A623", "#EC5FA6", "#33C0C7"];

  const grades = [9, 10, 11, 12];
  const gradeStudents = (g: number) => roster.filter((s) => s.grade === g);
  const pctApproved = (g: number, key: string) => {
    const students = gradeStudents(g);
    if (students.length === 0) return 0;
    const approved = students.filter((s) => (s.milestones as Record<string, string>)[key] === "Approved").length;
    return (approved / students.length) * 100;
  };

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
      <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-12">
        <div className="lg:col-span-5">
          <DonutCard
            title="Student Status"
            centerPct={onTrackPct}
            centerLabel="on track"
            deltaPts={2}
            hero
            heroTint={heroTint}
            rows={[
              { label: "On Track", value: onTrack, color: STATUS_COLORS["On Track"], onClick: () => goToStudents("On Track") },
              { label: "Needs Attention", value: needsAttention, color: STATUS_COLORS["Needs Attention"], onClick: () => goToStudents("Needs Attention") },
              { label: "At Risk", value: atRisk, color: STATUS_COLORS["At Risk"], onClick: () => goToStudents("At Risk") },
            ]}
          />
        </div>
        <div className="lg:col-span-4">
          <PathwaysCard total={total} topPathways={topPathways} colors={pathwayColors} activePathway={pathwayFilter} onToggle={togglePathway} />
        </div>
        <div className="lg:col-span-3">
          <DonutCard
            title="Postsecondary Plans"
            centerPct={(withPlan / total) * 100}
            centerLabel="have a plan"
            deltaPts={4}
            rows={[
              { label: "With Plan", value: withPlan, color: "#2F6BF2", onClick: () => goToStudents(undefined, "With Plan") },
              { label: "Undecided", value: undecided, color: "#5B6470", onClick: () => goToStudents(undefined, "Undecided") },
            ]}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-2">
        <HoverBeam strength={0.6} className="h-full">
          {/* No `aside` here -- an aside sits inline next to the title
             until it doesn't fit, and "Academic Readiness" (longer title,
             identical subtitle text) wrapped to a second line while
             "Career Readiness" didn't, so the two cards' header dividers
             landed at different heights (direct report, with a screenshot:
             "the headers are different heights"). A subtitle below the
             divider, structurally identical in both cards, can't do that
             regardless of title or subtitle length. */}
          <Panel id="career-readiness" title="Career Readiness" className="h-full">
            <p className="-mt-[var(--space-2)] text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>% of students with approved milestones by grade</p>
            <BarChart
              groups={grades.map((g) => `Gr. ${g}`)}
              series={[
                { label: "Career Report", accent: READINESS_SERIES[0], values: grades.map((g) => pctApproved(g, "Career Report")) },
                { label: "Resume", accent: READINESS_SERIES[1], values: grades.map((g) => pctApproved(g, "Resume")) },
              ]}
              targetLine={{ value: 80, label: "Target", color: TARGET_LINE_COLOR }}
            />
          </Panel>
        </HoverBeam>
        <HoverBeam strength={0.6} className="h-full">
          <Panel id="academic-readiness" title="Academic Readiness" className="h-full">
            <p className="-mt-[var(--space-2)] text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>% of students with approved milestones by grade</p>
            <BarChart
              groups={grades.map((g) => `Gr. ${g}`)}
              series={[
                { label: "Academic Plan", accent: READINESS_SERIES[0], values: grades.map((g) => pctApproved(g, "Academic Plan")) },
                { label: "College List", accent: READINESS_SERIES[1], values: grades.map((g) => pctApproved(g, "College List")) },
                { label: "Financial Aid / FAFSA", accent: READINESS_SERIES[2], values: grades.map((g) => pctApproved(g, "Financial Aid")) },
              ]}
              targetLine={{ value: 80, label: "Target", color: TARGET_LINE_COLOR }}
            />
          </Panel>
        </HoverBeam>
      </div>
    </div>
  );
}
