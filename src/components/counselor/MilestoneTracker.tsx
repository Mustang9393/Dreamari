"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { SegmentedRing } from "@/components/connect/viz";
import { HoverBeam } from "@/components/app/HoverBeam";
import { GRADE_READINESS, type MilestoneCard } from "@/lib/milestoneReadiness";
import { useCounselorFilters } from "./shell";

import { GLASS_CARD as TINTED_CARD } from "./surfaces";

const STATUS_COLORS = {
  completed: "#33C78C",
  inProgress: "#5B6CF9",
  // Color rules kept from the later passes (visual only, content untouched):
  // amber for the words "Needs Attention", matching Overview and Students
  // instead of At Risk's red, and the dashboard's own muted-foreground token
  // for "Not Started" (the bespoke gray measured under 3:1 on this surface).
  needsAttention: "#F5A623",
  notStarted: "var(--muted-foreground)",
  notApplicable: "rgba(255,255,255,0.18)",
} as const;

function StatRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <span className="flex items-center gap-[6px] text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
      <span aria-hidden className="size-[7px] flex-none rounded-full" style={{ background: color }} />
      {label}
      <b className="ml-auto tabular-nums" style={{ color: "var(--foreground)" }}>{value}</b>
    </span>
  );
}

function MilestoneCardView({ card }: { card: MilestoneCard }) {
  const stats: { label: string; value: number; color: string }[] = [
    { label: "Completed", value: card.completed, color: STATUS_COLORS.completed },
    { label: "In Progress", value: card.inProgress, color: STATUS_COLORS.inProgress },
    { label: "Needs Attention", value: card.needsAttention, color: STATUS_COLORS.needsAttention },
    { label: "Not Started", value: card.notStarted, color: STATUS_COLORS.notStarted },
  ];
  if (card.notApplicable) stats.push({ label: "Not Applicable", value: card.notApplicable, color: STATUS_COLORS.notApplicable });

  return (
    <HoverBeam strength={0.6} className="h-full">
      <div className="flex h-full flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
        <div className="flex flex-col gap-[2px]">
          <span className="flex items-center gap-[8px]">
            <Info aria-hidden className="h-[14px] w-[14px] flex-none" style={{ color: "var(--muted-foreground)" }} />
            <h3 className="text-[14.5px] leading-[1.25] font-bold" style={{ color: "var(--foreground)" }}>{card.name}</h3>
          </span>
          <span className="pl-[22px] text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{card.subtitle}</span>
          {card.reviewNote && <span className="pl-[22px] text-[11.5px]" style={{ color: "var(--muted-foreground)", opacity: 0.75 }}>{card.reviewNote}</span>}
        </div>

        <div className="flex flex-col items-center gap-[6px] py-[var(--space-2)]">
          <SegmentedRing
            segments={stats.filter((s) => s.value > 0).map((s) => ({ value: s.value, color: s.color }))}
            size={110}
            stroke={12}
          >
            <span className="flex flex-col items-center">
              <span className="text-[26px] leading-[1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{card.pct}%</span>
              <span className="text-[10.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>completed</span>
            </span>
          </SegmentedRing>
          <span className="text-[12.5px] font-bold tabular-nums" style={{ color: "var(--foreground)" }}>{card.completed} of {card.total}</span>
        </div>

        <div className="grid grid-cols-2 gap-x-[var(--space-4)] gap-y-[8px]">
          {stats.map((s) => <StatRow key={s.label} {...s} />)}
        </div>

        <button
          type="button"
          className="dm-quiet mt-auto flex cursor-pointer items-center gap-[4px] text-left text-[12.5px] font-bold"
          style={{ color: "var(--primary)" }}
        >
          View Details & Student Breakdown
        </button>
      </div>
    </HoverBeam>
  );
}

export function MilestoneTracker() {
  const { gradeFilter } = useCounselorFilters();
  const [tab, setTab] = useState<9 | 10 | 11 | 12>(gradeFilter === "All Grades" ? 9 : gradeFilter);
  const grade = GRADE_READINESS[tab];

  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      <div role="tablist" aria-label="Grade level" className="flex w-fit gap-[2px] rounded-[var(--radius-md)] border p-[3px]" style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)" }}>
        {([9, 10, 11, 12] as const).map((g) => (
          <button
            key={g}
            type="button"
            role="tab"
            aria-selected={tab === g}
            onClick={() => setTab(g)}
            className="dm-quiet flex h-9 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] px-[16px] text-[13px] font-bold"
            style={{ background: tab === g ? "var(--primary)" : "transparent", color: tab === g ? "#FFFFFF" : "var(--muted-foreground)" }}
          >
            Grade {g}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-start justify-between gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
        <div className="flex max-w-[520px] flex-col gap-[4px]">
          <span className="text-[13.5px] font-bold" style={{ color: "var(--foreground)" }}>Grade {tab} students are required to complete {grade.cards.length} milestones</span>
          <span className="text-[13px]" style={{ color: "var(--muted-foreground)" }}>Focus: {grade.focus}</span>
        </div>
        <div className="flex items-center gap-[var(--space-6)]">
          <span className="flex flex-col items-center">
            <span className="text-[22px] leading-[1.1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{grade.students}</span>
            <span className="text-[11px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Students</span>
          </span>
          <span className="flex flex-col items-center">
            <span className="text-[22px] leading-[1.1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{grade.cards.length}</span>
            <span className="text-[11px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Milestones</span>
          </span>
          <span className="flex flex-col items-center">
            <span className="text-[22px] leading-[1.1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{grade.avgDone}%</span>
            <span className="text-[11px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Avg. Done</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-2">
        {grade.cards.map((card) => <MilestoneCardView key={card.name} card={card} />)}
      </div>
    </div>
  );
}
