"use client";

import { useState } from "react";
import Image from "next/image";
import { MILESTONE_KEYS, type CaseloadStatus, type MilestoneStatus, type MilestoneKey } from "@/lib/counselorRoster";
import { useStudentAvatarSrc } from "@/lib/avatar";

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
  // The reference's own extra states: student-completed reads as done
  // (same green as Approved), overdue is the one red the dashboard
  // reserves for "act now", and a dash-in-the-reference "not applicable"
  // is the quietest gray of all.
  Completed: "#33C78C",
  Overdue: "#E0453C",
  "Not Applicable": "rgba(255,255,255,0.18)",
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

// One compact cell standing in for what used to be 5 separate pill
// columns (Career Report/Resume/Applications/Rec. Letter/Transcript) --
// each pill repeated the same "Approved" (green) label on most rows, pure
// visual noise across 120 rows, and the 5 shown were an arbitrary subset
// that silently left out the other 6 milestones a student actually has.
// This shows all 11 -- a real count plus a small segmented strip, same
// segmented-mark language the Overview charts already use, so a
// counselor can see completion AND spot exactly which stage is stuck
// (each segment is titled on hover) without opening the student.
export function MilestonesMini({ milestones }: { milestones: Record<MilestoneKey, MilestoneStatus> }) {
  const approved = MILESTONE_KEYS.filter((k) => milestones[k] === "Approved").length;
  return (
    <span className="flex flex-col gap-[4px]">
      <span className="text-[12px] font-bold tabular-nums whitespace-nowrap" style={{ color: "var(--foreground)" }}>{approved}/{MILESTONE_KEYS.length} approved</span>
      <span className="flex gap-[2px]">
        {MILESTONE_KEYS.map((k) => (
          <span key={k} title={`${k}: ${milestones[k]}`} aria-hidden className="h-[5px] w-[8px] flex-none rounded-[1.5px]" style={{ background: MILESTONE_COLORS[milestones[k]] }} />
        ))}
      </span>
    </span>
  );
}

// One legend row shared by every ring/bar card on the dashboard: dot + label
// on the left, the value pinned to the right edge, so a card's values always
// line up in one column. `min-w-0` on every flex step down to the label is
// what lets `truncate` actually bite -- a flex child's default min-width is
// its content's width, which silently defeats truncation until overridden.
export function StatRow({ label, value, color, onClick, active }: { label: string; value: number; color: string; onClick?: () => void; active?: boolean }) {
  const row = (
    <>
      <span className="flex min-w-0 flex-1 items-center gap-[8px]" style={{ color: active ? "var(--foreground)" : "var(--muted-foreground)" }}>
        <span aria-hidden className="size-[8px] flex-none rounded-full" style={{ background: color }} />
        <span className="truncate">{label}</span>
      </span>
      <span className="flex-none tabular-nums" style={{ color: "var(--foreground)" }}>{value}</span>
    </>
  );
  if (!onClick) return <span className="flex items-center justify-between text-[13px] font-semibold">{row}</span>;
  return (
    <button
      type="button"
      onClick={onClick}
      className="dm-quiet flex w-full cursor-pointer items-center justify-between rounded-[var(--radius-sm)] px-[4px] py-[2px] text-[13px] font-semibold"
      style={{ background: active ? `color-mix(in srgb, ${color} 16%, transparent)` : "transparent" }}
    >
      {row}
    </button>
  );
}

export function initials(name: string): string {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

// The same illustrated black/white portrait set every student wears
// app-wide (src/lib/avatar.ts), not a separate initials-only style just
// for this dashboard (direct instruction: "use the avatars from our
// collections... make sure there is diversity and variety and they make
// sense for the names"). That module already does the real work: 18
// common first names are pinned to a gender/ethnicity-matched portrait
// from a deliberately diverse 48-portrait set, and every other name
// (most of this roster's synthetic first names) draws a stable, varied
// portrait from that same diverse set via a deterministic hash -- so this
// component only has to point at it, not re-solve diversity itself.
// First name only, so "Jordan Rivera" (roster row) and "Jordan" (handle
// elsewhere in the app) draw the identical face for the one real student.
// Falls back to initials (this dashboard's original treatment) only if
// the image itself ever fails to load.
export function Avatar({ name, size = 34 }: { name: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  const seed = name.split(" ")[0] || name;
  const src = useStudentAvatarSrc(seed);
  if (failed) {
    return (
      <span
        className="flex flex-none items-center justify-center rounded-full text-[12.5px] font-extrabold"
        style={{ width: size, height: size, background: "color-mix(in srgb, var(--primary) 22%, transparent)", color: "var(--primary)" }}
      >
        {initials(name)}
      </span>
    );
  }
  return (
    <Image
      key={src}
      src={src}
      alt=""
      width={128}
      height={128}
      className="flex-none rounded-full object-cover"
      style={{ width: size, height: size, background: "var(--secondary)" }}
      onError={() => setFailed(true)}
    />
  );
}
