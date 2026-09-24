"use client";

import { useMemo } from "react";
import { SegmentedRing, BarChart } from "@/components/connect/viz";
import { Panel } from "@/components/connect/ProProfile";
import { HoverBeam } from "@/components/app/HoverBeam";
import { getRoster, CAREER_TRACKS, type CounselorStudent } from "@/lib/counselorRoster";
import { useCounselorFilters } from "./shell";

// v1: the reference's Overview, 1:1 in content and composition (direct
// instruction, 24 Sept 2026: "match the replit with that level of detail").
// Three equal cards, each a large centered donut with its legend stacked
// underneath; the Postsecondary card's center is the COUNT of students with
// a plan, not a percentage; Career Pathways lists the reference's seven
// pathways by size; the two readiness charts carry their subtitle directly
// under the title. Only the visual language is ours.

// Single-hue ordinal ramp for the readiness bar charts, validated with the
// dataviz skill's ordinal gate (`validate_palette.js "#9BA8FB,#5B6CF9,#2E3BB8"
// --ordinal --mode dark`): the earlier multi-hue set measurably collided with
// this dashboard's own status colors. Visual rule only.
const READINESS_SERIES = ["#9BA8FB", "#5B6CF9", "#2E3BB8"];

const STATUS_COLORS: Record<CounselorStudent["status"], string> = {
  "On Track": "#33C78C",
  "Needs Attention": "#F5A623",
  "At Risk": "#E0453C",
};

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

// Ring on top, centered, legend below -- the reference's own card
// composition. `center` is whatever the reference prints in the middle
// ("86%", "79", "120"), not always a percentage.
function DonutCard({ title, center, centerLabel, rows }: { title: string; center: string; centerLabel: string; rows: { label: string; value: number; color: string }[] }) {
  return (
    <HoverBeam strength={0.7} className="h-full">
      <div className="flex h-full flex-col gap-[var(--space-5)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
        <h2 className="text-[15px] leading-[1.3] font-bold" style={{ color: "var(--foreground)" }}>{title}</h2>
        <div className="flex justify-center">
          <SegmentedRing segments={rows.map((r) => ({ value: r.value, color: r.color }))} size={150} stroke={16}>
            <span className="flex flex-col items-center">
              <span className="text-[26px] leading-[1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{center}</span>
              <span className="text-[11px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{centerLabel}</span>
            </span>
          </SegmentedRing>
        </div>
        <div className="flex flex-col gap-[8px]">
          {rows.map((r) => <StatRow key={r.label} {...r} />)}
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
  const pathways = CAREER_TRACKS.map((t) => [t, pathwayCounts.get(t) ?? 0] as const).sort((a, b) => b[1] - a[1]);
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
          center={`${Math.round((onTrack / total) * 100)}%`}
          centerLabel="on track"
          rows={[
            { label: "On Track", value: onTrack, color: STATUS_COLORS["On Track"] },
            { label: "Needs Attention", value: needsAttention, color: STATUS_COLORS["Needs Attention"] },
            { label: "At Risk", value: atRisk, color: STATUS_COLORS["At Risk"] },
          ]}
        />
        <DonutCard
          title="Postsecondary Plans"
          center={String(withPlan)}
          centerLabel="have a plan"
          rows={[
            { label: "With Plan", value: withPlan, color: "#2F6BF2" },
            { label: "Undecided", value: undecided, color: "#5B6470" },
          ]}
        />
        <DonutCard
          title="Career Pathways"
          center={String(roster.length)}
          centerLabel="students"
          rows={pathways.map(([label, value], i) => ({ label, value, color: pathwayColors[i % pathwayColors.length] }))}
        />
      </div>

      <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-2">
        <HoverBeam strength={0.6} className="h-full">
          <Panel id="career-readiness" title="Career Readiness" className="h-full">
            <p className="-mt-[var(--space-2)] text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>% of students with approved milestones by grade</p>
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
          <Panel id="academic-readiness" title="Academic Readiness" className="h-full">
            <p className="-mt-[var(--space-2)] text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>% of students with approved milestones by grade</p>
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
