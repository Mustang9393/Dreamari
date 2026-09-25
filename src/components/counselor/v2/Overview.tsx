"use client";

// DEMO-ONLY v2 fork of ../Overview.tsx (24 Sept 2026). v1 stays untouched so the
// two builds can be compared live via the bottom-center version chip
// (../version.tsx). Changes from the 24 Sept audit land here.

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { TrendingDown, TrendingUp } from "lucide-react";
import { BarChart, SegmentedRing } from "@/components/connect/viz";
import { Panel } from "@/components/connect/ProProfile";
import { HoverBeam } from "@/components/app/HoverBeam";
import { Avatar, CardLink, Go, StatRow } from "../chips";
import { attentionReason, attentionSeverity, attentionRank, milestonesForGrade, type CounselorStudent, type AttentionSeverity, type MilestoneKey } from "@/lib/counselorRoster";
import { useCounselorFilters, type StatusRosterFilter, type PlanRosterFilter } from "../shell";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { BLUE_3, NEUTRAL_SLICE, PRIMARY, TARGET_LINE } from "../palette";
import { WORLD_COLORS } from "@/components/app/worlds";
import { GLASS_INSET } from "../surfaces";

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
const grades: (9 | 10 | 11 | 12)[] = [9, 10, 11, 12];
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

// Settled 26 Sept 2026, final instruction after eleven earlier attempts
// (full history in AI_HANDOFF.md): "just use one horizontal bar
// representing the total number of students and show segments in colors
// to show the distribution or number of students in each career pathways,
// making up the total Thats it." One bar, one shape: its own width IS the
// full roster, each pathway is a contiguous segment sized to its exact
// share -- a real 100%-stacked bar, not a chart style at all. The compact
// dot+label+value key below (unchanged since the earlier attempts) still
// carries every pathway's name and count.
// Direct follow-up the same day: "not so flat and bright and align with
// the other graph styling for the colors, gradients, opacity etc. Hover
// can show number and pathway details with a glow." Each segment now
// carries the same recipe this dashboard's other data-viz already uses --
// a subtle top-to-base gradient at a toned-down rest opacity (GLASS_CARD's
// own sheen direction, not a flat saturated fill) -- and brightens to full
// opacity with a real glow plus a floating tooltip on hover, the same
// two-part "quiet at rest, lit on hover" language as the Career Readiness
// bars above it.
function PathwaysBarChart({ topPathways, colors, activePathway, onToggle }: { topPathways: [string, number][]; colors: string[]; activePathway: string | null; onToggle: (label: string) => void }) {
  const total = topPathways.reduce((sum, [, v]) => sum + v, 0) || 1;
  const [hoverLabel, setHoverLabel] = useState<string | null>(null);
  // Cumulative left offset per segment, computed once -- the tooltip
  // below needs each segment's position but has to live OUTSIDE the
  // bar's own clipping row (see why below), so it can't just be an
  // absolutely-positioned child of that segment anymore.
  const segments = topPathways.reduce<{ label: string; value: number; pct: number; left: number; color: string }[]>((acc, [label, value], i) => {
    const pct = (value / total) * 100;
    const left = acc.length > 0 ? acc[acc.length - 1].left + acc[acc.length - 1].pct : 0;
    acc.push({ label, value, pct, left, color: colors[i % colors.length] });
    return acc;
  }, []);
  const hovered = segments.find((s) => s.label === hoverLabel) ?? null;
  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      {/* Direct correction on the glass treatment: "revert this is worse.
         just use flat colors with the glow like in the donuts." Ring/
         SegmentedRing's own recipe -- flat, fully-saturated per-segment
         color (no gradient, no frost), plus ONE shared soft blurred glow
         behind the whole shape (not a glow baked into each segment). Its
         own small wrapper, sized to the bar's own footprint -- nested one
         level too high the first time, it inherited the WHOLE
         chart+legend block's height and washed out as a huge diffuse
         blob across the entire card instead of sitting behind just the
         bar. */}
      <div className="relative">
        <span aria-hidden className="pointer-events-none absolute inset-[-40%] opacity-60 blur-[16px]" style={{ background: `radial-gradient(ellipse 70% 140% at 50% 50%, color-mix(in srgb, ${(hovered ?? segments[0])?.color ?? "var(--primary)"} 45%, transparent), transparent 70%)` }} />
        <div className="relative flex h-[30px] w-full overflow-hidden rounded-[8px]" role="img" aria-label={`Career pathways: ${topPathways.map(([l, v]) => `${l} ${v}`).join(", ")}`}>
        {segments.map((seg, i) => {
          const active = activePathway === seg.label;
          const isHover = seg.label === hoverLabel;
          const dim = activePathway !== null && !active;
          return (
            <button
              key={seg.label}
              type="button"
              onClick={() => onToggle(seg.label)}
              onMouseEnter={() => setHoverLabel(seg.label)}
              onMouseLeave={() => setHoverLabel(null)}
              onFocus={() => setHoverLabel(seg.label)}
              onBlur={() => setHoverLabel(null)}
              aria-pressed={active}
              aria-label={`${seg.label}: ${seg.value}`}
              // No `.dm-quiet` here -- its own `:hover { background: ...
              // !important }` was overriding this button's colored fill
              // on hover, which is what turned every segment flat gray
              // the moment it was pointed at.
              className="h-full cursor-pointer transition-[opacity,filter] duration-150"
              style={{
                width: `${seg.pct}%`,
                background: seg.color,
                opacity: dim ? 0.35 : 1,
                borderRight: i < segments.length - 1 ? "1px solid var(--card)" : "none",
                filter: isHover || active ? `drop-shadow(0 0 8px color-mix(in srgb, ${seg.color} 80%, transparent))` : undefined,
              }}
            />
          );
        })}
      </div>
      {/* Rendered as a sibling of the bar row, not nested inside it -- the
         row above needs its own `overflow-hidden` to clip the segments
         into one rounded pill, and an absolutely-positioned tooltip
         nested inside that same clipped box was invisible no matter what
         z-index or bottom offset it had (confirmed via devtools: it was
         in the DOM, fully opaque, just clipped to zero visible area by
         its own clipping ancestor). Positioned here instead, by the
         hovered segment's own precomputed left%, with nothing above it
         to clip it. "Hover can show number and pathway details with a
         glow." */}
      {hovered && (
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 -translate-y-[calc(100%+8px)] rounded-[8px] border px-[10px] py-[6px] text-center"
          style={{ left: `${hovered.left + hovered.pct / 2}%`, background: "var(--card)", borderColor: "var(--glass-border)", boxShadow: `0 0 14px color-mix(in srgb, ${hovered.color} 55%, transparent), 0 6px 16px rgba(0,0,0,0.35)` }}
        >
          <div className="whitespace-nowrap text-[10px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{hovered.label}</div>
          <div className="whitespace-nowrap text-[13px] font-extrabold" style={{ color: "var(--foreground)" }}>{hovered.value} students</div>
        </div>
        )}
      </div>
      <div className="@container">
        <div className="grid grid-cols-2 gap-x-[22px] gap-y-[5px] @[440px]:grid-cols-3">
          {topPathways.map(([label, value], i) => {
            const active = activePathway === label;
            const dim = activePathway !== null && !active;
            return (
              <button
                key={label}
                type="button"
                onClick={() => onToggle(label)}
                aria-pressed={active}
                className="dm-quiet flex cursor-pointer items-center gap-[6px] rounded-[4px] py-[2px] text-left transition-opacity"
                style={{ opacity: dim ? 0.45 : 1 }}
              >
                <span aria-hidden className="size-[6px] flex-none rounded-full" style={{ background: colors[i % colors.length] }} />
                <span className="truncate text-[10.5px] font-semibold" style={{ color: active ? "var(--foreground)" : "var(--muted-foreground)" }}>{label}</span>
                <span className="flex-none text-[10.5px] font-bold tabular-nums" style={{ color: "var(--foreground)" }}>{value}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PathwaysCard({ topPathways, colors, activePathway, onToggle, onOpen }: { topPathways: [string, number][]; colors: string[]; activePathway: string | null; onToggle: (label: string) => void; onOpen: () => void }) {
  return (
    <HoverBeam strength={0.7} className="h-full">
      <div className="group relative flex h-full flex-col gap-[var(--space-5)] overflow-hidden rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={GLASS_CARD}>
        <div className="relative flex items-center justify-between gap-[8px]">
          <h2 className="text-[15px] leading-[1.3] font-bold" style={{ color: "var(--foreground)" }}>Career Pathways <span className="ml-[4px] text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{topPathways.reduce((sum, [, v]) => sum + v, 0)} students</span></h2>
          {!activePathway && <CardLink onClick={onOpen}>Insights</CardLink>}
          {activePathway && (
            <button type="button" onClick={() => onToggle(activePathway)} className="dm-quiet flex cursor-pointer items-center gap-[4px] rounded-full border px-[8px] py-[2px] text-[11px] font-bold" style={{ borderColor: "color-mix(in srgb, var(--primary) 35%, var(--glass-border))", color: "var(--foreground)" }}>
              {activePathway} <span aria-hidden style={{ color: "var(--muted-foreground)" }}>✕</span>
            </button>
          )}
        </div>
        <PathwaysBarChart topPathways={topPathways} colors={colors} activePathway={activePathway} onToggle={onToggle} />
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
  // When every row shown has the same severity, say it once in the header
  // instead of repeating the same red word on every row.
  const oneSeverity = shown.length > 0 && shown.every((s) => attentionSeverity(s) === attentionSeverity(shown[0])) ? attentionSeverity(shown[0]) : null;
  return (
    <div className="group flex flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={GLASS_CARD}>
      <div className="flex items-center justify-between gap-[8px]">
        <h2 className="text-[15px] leading-[1.3] font-bold" style={{ color: "var(--foreground)" }}>Needs your attention{oneSeverity && <span className="ml-[8px] text-[11px] font-extrabold tracking-[0.04em] uppercase" style={{ color: SEVERITY_COLORS[oneSeverity] }}>{oneSeverity}</span>}</h2>
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
                    {!oneSeverity && <span className="text-[10.5px] font-extrabold tracking-[0.04em] uppercase" style={{ color }}>{severity}</span>}
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
  const { gradeFilter, setStatusFilter, setPlanFilter } = useCounselorFilters();
  // Local to this page, not the shared context -- distinct from the donut
  // click-throughs on purpose (direct instruction: this one "cross-filters
  // the whole Overview page", the donuts navigate to Students instead).
  const [pathwayFilter, setPathwayFilter] = useState<string | null>(null);
  const togglePathway = (label: string) => setPathwayFilter((cur) => (cur === label ? null : label));

  const reviewed = useReviewedRoster();
  const roster = useMemo(() => {
    let all = reviewed;
    if (gradeFilter !== "All Grades") all = all.filter((s) => s.grade === gradeFilter);
    if (pathwayFilter) all = all.filter((s) => s.careerTrack === pathwayFilter);
    return all;
  }, [reviewed, gradeFilter, pathwayFilter]);

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
  // No "Other" -- folding the smaller worlds together read as if those
  // pathways mattered less (direct feedback, 26 Sept 2026: "i dont want
  // certian careers reading like theya re lesser than the ones prominently
  // listed... show only the tracks on build"). All of a caseload's real
  // Build worlds are shown, largest first, single column -- a two-column
  // grid was tried once already for this exact legend and rejected (see
  // PathwaysCard below): several of these world names are long enough to
  // wrap and stagger in a half-width column at any reasonable card size.
  const topPathways: [string, number][] = [...pathwayCounts.entries()].sort((a, b) => b[1] - a[1]);
  // Each pathway wears the colour its world has everywhere else in the
  // student app (WORLD_COLORS -- Build, Explore, Career Poster Cards),
  // not a bespoke sequence invented for this one screen (direct
  // instruction, 26 Sept 2026: "the nomenclature is wrong for career
  // pathways and so are the colors. they [should match what's] fixed
  // across the dreamari app" -- restoring the 25 Sept decision after a
  // same-day detour through the reference's own seven tracks). "Other"
  // stays neutral.
  const pathwayColors = topPathways.map(([label]) => WORLD_COLORS[label] ?? PRIMARY);

  // The reference's own per-grade percentage, verbatim (v1's Overview.tsx):
  // of the grade's students, how many have this milestone Approved. A grade
  // where the milestone doesn't apply yet (e.g. Resume before Grade 10)
  // reads 0 and BarChart draws no bar for that slot, matching the
  // reference's own "nothing plotted yet" columns exactly.
  const pctApproved = (g: number, key: MilestoneKey) => {
    // NaN, not 0, for a grade that doesn't track this milestone yet
    // (Resume before Grade 10, College List/FAFSA before Grade 12) --
    // BarChart draws nothing for NaN, but draws a real, visible 0% for an
    // actual zero (direct report, real data: Grade 9's Career Report is
    // genuinely tracked and genuinely all "Not Started" -- "career
    // readiness of grade 9 is zero. Dont do that" was about the chart
    // hiding that real zero as if it were the same kind of gap).
    if (!milestonesForGrade(g).includes(key)) return NaN;
    const gs = roster.filter((s) => s.grade === g);
    if (gs.length === 0) return NaN;
    const approved = gs.filter((s) => s.milestones[key] === "Approved").length;
    return (approved / gs.length) * 100;
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
         (direct feedback: "no design experimentation... the same cards").
         A viewport-width breakpoint (`lg:`) went 3-across as soon as the
         BROWSER reached 1024px, but this page's own content column is
         narrower than the viewport by a fixed ~250px sidebar, so at
         1024-1400px of actual browser width the row still went 3-across
         into far less than 1024px of real space -- pathway names and
         "Postsecondary Plans" itself truncated (direct report with a
         screenshot: "the viewport that its on now definitely cant do 3
         in a row"). `@container`/`@[1100px]:` below reads THIS row's own
         rendered width instead of the browser's, so it goes 3-across only
         once there's actually room, regardless of sidebar/page chrome.
         The container and the queried grid must be different elements --
         an element can't respond to the container query it itself
         establishes -- so `@container` wraps a plain div and the grid
         classes live one level down. */}
      <div className="@container">
      <div className="grid grid-cols-1 gap-[var(--space-4)] @[520px]:grid-cols-2">
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
        <DonutCard
          title="Postsecondary Plans"
          centerPct={(withPlan / total) * 100}
          centerLabel="have a plan"
          deltaPts={4}
          rows={[
            { label: "With Plan", value: withPlan, color: PRIMARY, onClick: () => goToStudents(undefined, "With Plan") },
            { label: "Undecided", value: undecided, color: NEUTRAL_SLICE, onClick: () => goToStudents(undefined, "Undecided") },
          ]}
        />
      </div>
      </div>

      {/* Its own full-width row, not a third column squeezed beside the
         two donuts -- direct question, 26 Sept 2026: "do we need to go 2
         in a row and then move career pathways graph to its own row
         instead?" At 15 real Build worlds this card needs real width to
         wrap its chips into just a few rows rather than many; a 1/3-width
         column left it both cramped and, before the chip redesign, the
         tallest thing on the page by far. */}
      <PathwaysCard topPathways={topPathways} colors={pathwayColors} activePathway={pathwayFilter} onToggle={togglePathway} onOpen={() => router.push("/counselor?view=insights")} />

      {/* Reviews approved chart. A "My Plan by grade" panel briefly lived
         here, driven by the student app's own My Plan steps rather than
         the reference's curriculum; removed in the 25 Sept 2026 content
         reversion (direct instruction: "take out all the additional stuff
         we did for parity with dreamari's plan... match the replit") since
         it had no reference equivalent. The full school year map (grade by
         season) lives on the Milestone Tracker, which this card still
         links to. */}
      {/* Career Readiness and Academic Readiness, the reference's own two
         charts, restored 26 Sept 2026 (direct feedback: "refer v1, I dont
         think these are the same graphs... one tile seems missing" -- a
         same-day pass had merged both into one five-row list, reasoning
         that Resume/College List/FAFSA don't apply until later grades and
         would render as "empty columns"; BarChart already draws no bar at
         all for a 0%/not-applicable slot -- confirmed against v1's own
         live charts above, Grade 9's Resume column is simply blank, not an
         ugly empty bar -- so that reasoning no longer holds and the
         reference's own two-panel bar-chart form is back, verbatim in
         grouping and grades, wearing v2's "solid" bar style already used
         elsewhere on this dashboard. */}
      <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-2">
        <HoverBeam strength={0.6} className="h-full">
          <Panel id="career-readiness" title="Career Readiness" className="h-full">
            <p className="-mt-[var(--space-2)] text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>% of students with approved milestones by grade</p>
            <BarChart
              barStyle="solid"
              hideValuesUntilHover
              groups={grades.map((g) => `Gr. ${g}`)}
              series={[
                { label: "Career Report", accent: READINESS_SERIES[0], values: grades.map((g) => pctApproved(g, "Career Report")) },
                { label: "Resume", accent: READINESS_SERIES[1], values: grades.map((g) => pctApproved(g, "Resume")) },
              ]}
            />
          </Panel>
        </HoverBeam>
        <HoverBeam strength={0.6} className="h-full">
          <Panel id="academic-readiness" title="Academic Readiness" className="h-full">
            <p className="-mt-[var(--space-2)] text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>% of students with approved milestones by grade</p>
            <BarChart
              barStyle="solid"
              hideValuesUntilHover
              groups={grades.map((g) => `Gr. ${g}`)}
              series={[
                { label: "Academic Plan", accent: READINESS_SERIES[0], values: grades.map((g) => pctApproved(g, "Academic Plan")) },
                { label: "College List", accent: READINESS_SERIES[1], values: grades.map((g) => pctApproved(g, "College List")) },
                { label: "Financial Aid / FAFSA", accent: READINESS_SERIES[2], values: grades.map((g) => pctApproved(g, "Financial Aid")) },
              ]}
            />
          </Panel>
        </HoverBeam>
      </div>
    </div>
  );
}
