"use client";

import { useMemo, useState } from "react";
import { ClipboardCheck, FileText, MapIcon, Compass, FileBadge, School, ListChecks, Send, DollarSign } from "lucide-react";
import { SegmentedRing } from "@/components/connect/viz";
import { HoverBeam } from "@/components/app/HoverBeam";
import { getRoster, MILESTONE_KEYS, type MilestoneKey } from "@/lib/counselorRoster";
import { useCounselorFilters } from "./shell";

import { GLASS_CARD as TINTED_CARD } from "./surfaces";

const GRADE_REQUIRED: Record<number, { count: number; focus: string; keys: MilestoneKey[] }> = {
  9: { count: 3, focus: "Career exploration and building a foundation for a four-year academic plan.", keys: ["Career Assessment", "Career Pathway", "Academic Plan"] },
  10: { count: 5, focus: "Deepening career exploration and starting postsecondary research.", keys: ["Career Assessment", "Career Report", "Career Pathway", "Academic Plan", "College Exploration"] },
  11: { count: 8, focus: "College list building, resume-readiness, and financial aid awareness.", keys: ["Career Assessment", "Career Report", "Academic Plan", "Career Pathway", "Resume", "College Exploration", "College List", "Financial Aid"] },
  12: { count: 11, focus: "Applications, financial aid, and transitioning out of high school.", keys: [...MILESTONE_KEYS] },
};

const MILESTONE_ICONS: Record<MilestoneKey, typeof ClipboardCheck> = {
  "Career Assessment": ClipboardCheck,
  "Career Report": FileText,
  "Academic Plan": MapIcon,
  "Career Pathway": Compass,
  Resume: FileBadge,
  "College Exploration": School,
  "College List": ListChecks,
  Applications: Send,
  "Financial Aid": DollarSign,
  "Recommendation Letter": Send,
  "Transcript Submission": FileText,
};

export function MilestoneTracker() {
  const { gradeFilter } = useCounselorFilters();
  const [tab, setTab] = useState<number>(gradeFilter === "All Grades" ? 9 : gradeFilter);
  const req = GRADE_REQUIRED[tab];

  const gradeRoster = useMemo(() => getRoster().filter((s) => s.grade === tab), [tab]);

  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      <div role="tablist" aria-label="Grade level" className="flex w-fit gap-[2px] rounded-[var(--radius-md)] border p-[3px]" style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)" }}>
        {[9, 10, 11, 12].map((g) => (
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
          <span className="text-[13.5px] font-bold" style={{ color: "var(--foreground)" }}>Grade {tab} students are required to complete {req.count} milestones</span>
          <span className="text-[13px]" style={{ color: "var(--muted-foreground)" }}>Focus: {req.focus}</span>
        </div>
        <div className="flex items-center gap-[var(--space-6)]">
          <span className="flex flex-col items-center">
            <span className="text-[22px] leading-[1.1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{gradeRoster.length}</span>
            <span className="text-[11px] font-semibold" style={{ color: "var(--muted-foreground)" }}>students</span>
          </span>
          <span className="flex flex-col items-center">
            <span className="text-[22px] leading-[1.1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{req.count}</span>
            <span className="text-[11px] font-semibold" style={{ color: "var(--muted-foreground)" }}>milestones</span>
          </span>
          <span className="flex flex-col items-center">
            <span className="text-[22px] leading-[1.1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{gradeRoster.length ? Math.round(gradeRoster.reduce((sum, s) => sum + s.roadmapPct, 0) / gradeRoster.length) : 0}%</span>
            <span className="text-[11px] font-semibold" style={{ color: "var(--muted-foreground)" }}>avg. done</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-2">
        {req.keys.map((key) => {
          const Icon = MILESTONE_ICONS[key];
          const completed = gradeRoster.filter((s) => s.milestones[key] === "Approved").length;
          const inProgress = gradeRoster.filter((s) => s.milestones[key] === "In Progress" || s.milestones[key] === "Pending Review").length;
          const needsAttention = gradeRoster.filter((s) => s.milestones[key] === "Changes Requested").length;
          const notStarted = gradeRoster.length - completed - inProgress - needsAttention;
          const pct = gradeRoster.length ? Math.round((completed / gradeRoster.length) * 100) : 0;
          return (
            <HoverBeam key={key} strength={0.6} className="h-full">
              <div className="flex h-full flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
                <span className="flex items-center gap-[10px]">
                  <span className="flex size-[30px] flex-none items-center justify-center rounded-[var(--radius-sm)]" style={{ background: "color-mix(in srgb, var(--primary) 18%, transparent)", color: "var(--primary)" }}>
                    <Icon className="h-[15px] w-[15px]" aria-hidden />
                  </span>
                  <h3 className="text-[14.5px] font-bold" style={{ color: "var(--foreground)" }}>{key}</h3>
                </span>
                <div className="flex items-center gap-[var(--space-5)]">
                  <SegmentedRing
                    segments={[
                      { value: completed, color: "#33C78C" },
                      { value: inProgress, color: "#5B6CF9" },
                      { value: needsAttention, color: "#E0453C" },
                      { value: notStarted, color: "#5B6470" },
                    ]}
                    size={78}
                    stroke={9}
                  >
                    <span className="flex flex-col items-center">
                      <span className="text-[17px] leading-[1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{pct}%</span>
                      <span className="text-[9.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>completed</span>
                    </span>
                  </SegmentedRing>
                  <div className="grid flex-1 grid-cols-2 gap-x-[var(--space-3)] gap-y-[6px] text-[12.5px] font-semibold">
                    <span className="flex items-center gap-[6px]" style={{ color: "var(--muted-foreground)" }}><span aria-hidden className="size-[7px] rounded-full" style={{ background: "#33C78C" }} />Completed <b className="ml-auto tabular-nums" style={{ color: "var(--foreground)" }}>{completed}</b></span>
                    <span className="flex items-center gap-[6px]" style={{ color: "var(--muted-foreground)" }}><span aria-hidden className="size-[7px] rounded-full" style={{ background: "#5B6CF9" }} />In Progress <b className="ml-auto tabular-nums" style={{ color: "var(--foreground)" }}>{inProgress}</b></span>
                    <span className="flex items-center gap-[6px]" style={{ color: "var(--muted-foreground)" }}><span aria-hidden className="size-[7px] rounded-full" style={{ background: "#E0453C" }} />Needs Attention <b className="ml-auto tabular-nums" style={{ color: "var(--foreground)" }}>{needsAttention}</b></span>
                    <span className="flex items-center gap-[6px]" style={{ color: "var(--muted-foreground)" }}><span aria-hidden className="size-[7px] rounded-full" style={{ background: "rgba(255,255,255,0.3)" }} />Not Started <b className="ml-auto tabular-nums" style={{ color: "var(--foreground)" }}>{notStarted}</b></span>
                  </div>
                </div>
              </div>
            </HoverBeam>
          );
        })}
      </div>
    </div>
  );
}
