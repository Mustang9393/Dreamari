import type { CaseloadStatus, MilestoneStatus } from "@/lib/counselorRoster";

// Shared status pills -- the same caseload-status and milestone-review
// vocabulary shows up on Students, the student drill-down, Milestone
// Tracker, and Review Queue, so the colors/labels live in one place rather
// than four.

export const STATUS_COLORS: Record<CaseloadStatus, string> = {
  "On Track": "#33C78C",
  "Needs Attention": "#F5A623",
  "At Risk": "#E0453C",
};

export const MILESTONE_COLORS: Record<MilestoneStatus, string> = {
  Approved: "#33C78C",
  "Pending Review": "#5B6CF9",
  "Changes Requested": "#E0453C",
  "In Progress": "#F5A623",
  "Not Started": "rgba(255,255,255,0.35)",
};

function Chip({ label, color }: { label: string; color: string }) {
  return (
    <span className="inline-flex items-center gap-[6px] rounded-full border px-[10px] py-[4px] text-[11.5px] font-bold whitespace-nowrap" style={{ borderColor: `color-mix(in srgb, ${color} 40%, transparent)`, background: `color-mix(in srgb, ${color} 14%, transparent)`, color }}>
      <span aria-hidden className="size-[6px] flex-none rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

export function StatusChip({ status }: { status: CaseloadStatus }) {
  return <Chip label={status} color={STATUS_COLORS[status]} />;
}

export function MilestoneChip({ status }: { status: MilestoneStatus }) {
  return <Chip label={status} color={MILESTONE_COLORS[status]} />;
}

export function initials(name: string): string {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

export function Avatar({ name, size = 34 }: { name: string; size?: number }) {
  return (
    <span
      className="flex flex-none items-center justify-center rounded-full text-[12.5px] font-extrabold"
      style={{ width: size, height: size, background: "color-mix(in srgb, var(--primary) 22%, transparent)", color: "var(--primary)" }}
    >
      {initials(name)}
    </span>
  );
}
