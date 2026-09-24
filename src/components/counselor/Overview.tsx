"use client";

import { useMemo } from "react";
import { SegmentedRing, BarChart } from "@/components/connect/viz";
import { Panel } from "@/components/connect/ProProfile";
import { HoverBeam } from "@/components/app/HoverBeam";
import { getRoster, type CounselorStudent } from "@/lib/counselorRoster";
import { useCounselorFilters } from "./shell";

// Single-hue ordinal ramp for the readiness bar charts, validated with the
// dataviz skill's ordinal gate (`validate_palette.js "#9BA8FB,#5B6CF9,#2E3BB8"
// --ordinal --mode dark`): the earlier multi-hue set measurably collided with
// this dashboard's own status colors. Visual rule only; the charts' content
// and composition are the reference's.
const READINESS_SERIES = ["#9BA8FB", "#5B6CF9", "#2E3BB8"];

const STATUS_COLORS: Record<CounselorStudent["status"], string> = {
  "On Track": "#33C78C",
  "Needs Attention": "#F5A623",
  "At Risk": "#E0453C",
};

// A touch of brand-blue tint over the shared PANEL glass, same "CARD" step
// ProProfile.tsx's own dashboard cards use one level up from a bare panel --
// keeps these from reading as flat/undifferentiated boxes.
import { GLASS_CARD as TINTED_CARD } from "./surfaces";

function StatRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <span className="flex items-center justify-between text-[13px] font-semibold">
      <span className="flex items-center gap-[8px]" style={{ color: "var(--muted-foreground)" }}>
        <span aria-hidden className="size-[8px] flex-none rounded-full" style={{ background: color }} />
        {label}
      </span>
      <span className="tabular-nums" style={{ color: "var(--foreground)" }}>{value}</span>
    </span>
  );
}

function DonutCard({ title, centerPct, centerLabel, rows }: { title: string; centerPct: number; centerLabel: string; rows: { label: string; value: number; color: string }[] }) {
  return (
    <HoverBeam strength={0.7} className="h-full">
      <div className="flex h-full flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
        {/* Plain text title, no icon badge -- the reference's own card
           header is just a heading, nothing else (direct instruction:
           align composition to the reference 1:1). min-height still
           covers 2 lines so "Postsecondary Plans" wrapping doesn't throw
           off the ring's vertical position relative to its neighbors. */}
        <h2 className="text-[15px] leading-[1.3] font-bold" style={{ color: "var(--foreground)", minHeight: 38 }}>{title}</h2>
        <div className="flex items-center gap-[var(--space-5)]">
          {/* Every category in the legend below gets its own drawn arc here
             -- not a single accent-colored ring next to an unrelated
             multi-color legend (direct feedback: "only one color is being
             represented when there's more colors in the legend"). */}
          <SegmentedRing segments={rows.map((r) => ({ value: r.value, color: r.color }))} size={92} stroke={11}>
            <span className="flex flex-col items-center">
              <span className="text-[22px] leading-[1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{Math.round(centerPct)}%</span>
              <span className="text-[10.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{centerLabel}</span>
            </span>
          </SegmentedRing>
          <div className="flex min-w-0 flex-1 flex-col gap-[6px]">
            {rows.map((r) => <StatRow key={r.label} {...r} />)}
          </div>
        </div>
      </div>
    </HoverBeam>
  );
}

export function Overview() {
  const { gradeFilter } = useCounselorFilters();
  const roster = useMemo(() => {
    const all = getRoster();
    return gradeFilter === "All Grades" ? all : all.filter((s) => s.grade === gradeFilter);
  }, [gradeFilter]);

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

  return (
    <div className="flex flex-col gap-[var(--space-6)]">
      <div className="grid grid-cols-1 gap-[var(--space-4)] md:grid-cols-3">
        <DonutCard
          title="Student Status"
          centerPct={(onTrack / total) * 100}
          centerLabel="on track"
          rows={[
            { label: "On Track", value: onTrack, color: STATUS_COLORS["On Track"] },
            { label: "Needs Attention", value: needsAttention, color: STATUS_COLORS["Needs Attention"] },
            { label: "At Risk", value: atRisk, color: STATUS_COLORS["At Risk"] },
          ]}
        />
        <DonutCard
          title="Postsecondary Plans"
          centerPct={(withPlan / total) * 100}
          centerLabel="have a plan"
          rows={[
            { label: "With Plan", value: withPlan, color: "#2F6BF2" },
            { label: "Undecided", value: undecided, color: "#5B6470" },
          ]}
        />
        <HoverBeam strength={0.7} className="h-full">
          <div className="flex h-full flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
            <h2 className="text-[15px] leading-[1.3] font-bold" style={{ color: "var(--foreground)", minHeight: 38 }}>Career Pathways</h2>
            <div className="flex items-center gap-[var(--space-5)]">
              <SegmentedRing segments={topPathways.map(([, value], i) => ({ value, color: pathwayColors[i % pathwayColors.length] }))} size={92} stroke={11}>
                <span className="flex flex-col items-center">
                  <span className="text-[22px] leading-[1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{total}</span>
                  <span className="text-[10.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>students</span>
                </span>
              </SegmentedRing>
              <div className="flex min-w-0 flex-1 flex-col gap-[6px]">
                {topPathways.map(([label, value], i) => (
                  <StatRow key={label} label={label} value={value} color={pathwayColors[i % pathwayColors.length]} />
                ))}
              </div>
            </div>
          </div>
        </HoverBeam>
      </div>

      <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-2">
        <HoverBeam strength={0.6} className="h-full">
          <Panel id="career-readiness" title="Career Readiness" aside={<span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>% of students with approved milestones by grade</span>}>
            <BarChart
              groups={grades.map((g) => `Gr. ${g}`)}
              series={[
                { label: "Career Report", accent: READINESS_SERIES[0], values: grades.map((g) => pctApproved(g, "Career Report")) },
                { label: "Resume", accent: READINESS_SERIES[1], values: grades.map((g) => pctApproved(g, "Resume")) },
              ]}
            />
          </Panel>
        </HoverBeam>
        <HoverBeam strength={0.6} className="h-full">
          <Panel id="academic-readiness" title="Academic Readiness" aside={<span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>% of students with approved milestones by grade</span>}>
            <BarChart
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
