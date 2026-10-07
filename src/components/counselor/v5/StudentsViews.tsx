"use client";

// Students > Milestones and Students > Progress (7 Oct 2026). Same open
// layout as the Directory: rows with hairlines, tap a row to see the
// students behind it. Milestones answers "which step is the caseload stuck
// on?"; Progress answers "which grade needs me?". Both draw one dot per
// student (the v4 caseload dot map) instead of a bar, so a count is never
// abstracted away from the people in it; Progress adds a half-ring gauge
// (the v6 gauge) for the share of milestones done.

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cv } from "@/lib/counselorBase";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { MILESTONE_KEYS, attentionReason, milestonesForGrade, type CounselorStudent, type MilestoneKey } from "@/lib/counselorRoster";
import { MILESTONE_ICON } from "./milestoneIcons";
import { StudentFace } from "./StudentFace";
import { HalfGauge } from "./Analytics";

const RULE = "color-mix(in srgb, var(--foreground) 10%, transparent)";
const DONE = ["Approved", "Completed"];
const WAITING = ["Pending Review"];
const MOVING = ["In Progress", "Changes Requested"];

/** One dot per student, in the order of `parts` (each part's dots share a
 *  look). The strip wraps, so a big caseload grows taller, never smaller. */
type DotPart = { n: number; label: string; dot: string };
function DotStrip({ parts, size = "size-[9px]", gap = "gap-[3px]" }: { parts: DotPart[]; size?: string; gap?: string }) {
  return (
    <span role="img" aria-label={parts.map((p) => `${p.n} ${p.label}`).join(", ")} className={`flex flex-wrap ${gap}`}>
      {parts.flatMap((p) => Array.from({ length: Math.max(0, p.n) }, (_, k) => <span key={`${p.label}-${k}`} aria-hidden className={`box-border flex-none rounded-full ${size} ${p.dot}`} />))}
    </span>
  );
}

// Dot inks. Light mode uses the planned mixes; on the near-black dark page a
// 28 to 55% mix of blue with the background all but vanishes, so dark mode
// steps the waiting tint up and "in progress" wears a blue ring (started,
// not finished) that reads in both themes.
const KEY_DOTS = {
  done: "bg-[var(--primary)]",
  waiting: "bg-[color-mix(in_srgb,var(--primary)_55%,var(--background))] dark:bg-[color-mix(in_srgb,var(--primary)_68%,var(--background))]",
  moving: "bg-[color-mix(in_srgb,var(--primary)_28%,var(--background))] shadow-[inset_0_0_0_1.5px_var(--primary)]",
  none: "bg-[color-mix(in_srgb,var(--foreground)_14%,transparent)]",
};

function Legend({ dots = false }: { dots?: boolean }) {
  return (
    <div className="flex flex-wrap gap-x-[var(--space-5)] gap-y-[6px] text-[13px] font-medium" style={{ color: "var(--muted-foreground)" }}>
      {[["Done", KEY_DOTS.done], ["Waiting for you", KEY_DOTS.waiting], ["In progress", KEY_DOTS.moving], ["Not started", KEY_DOTS.none]].map(([l, c]) => (
        <span key={l} className="flex items-center gap-[6px]"><span aria-hidden className={`size-[9px] rounded-full ${c}`} />{l}</span>
      ))}
      {dots && <span>One dot = one student</span>}
    </div>
  );
}

// Ring inks, the same four steps as the dots (SVG strokes need colors, not
// classes).
export const RING = {
  done: "var(--primary)",
  waiting: "color-mix(in srgb, var(--primary) 55%, var(--background))",
  moving: "color-mix(in srgb, var(--primary) 26%, var(--background))",
  none: "color-mix(in srgb, var(--foreground) 10%, transparent)",
};

/** A donut split into the four states, the share done in the middle. */
export function MilestoneRing({ parts, total, size = 112, stroke = 11, children }: { parts: { n: number; color: string }[]; total: number; size?: number; stroke?: number; children: React.ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const gap = 2.5;
  const segs = parts.filter((p) => p.n > 0);
  const starts = segs.map((_, i) => segs.slice(0, i).reduce((t, p) => t + (p.n / total) * c, 0));
  return (
    <span className="relative inline-flex flex-none items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden className="-rotate-90">
        {segs.map((p, i) => {
          const len = Math.max(0, (p.n / total) * c - (segs.length > 1 ? gap : 0));
          return <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={p.color} strokeWidth={stroke} strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-starts[i]} />;
        })}
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center">{children}</span>
    </span>
  );
}

function StudentLine({ s, note }: { s: CounselorStudent; note: string }) {
  return (
    <li className="border-b last:border-b-0" style={{ borderColor: RULE }}>
      <Link href={`${cv("students")}&studentId=${encodeURIComponent(s.id)}`} className="dm-quiet group -mx-[var(--space-2)] flex items-center gap-[var(--space-3)] rounded-[var(--radius-sm)] px-[var(--space-2)] py-[10px]">
        <StudentFace s={s} size={32} />
        <span className="min-w-0 flex-1 truncate text-[14px] font-semibold">{s.name}</span>
        <span className="hidden truncate text-[13px] font-medium sm:block" style={{ color: "var(--muted-foreground)" }}>{note}</span>
        <ChevronRight className="h-4 w-4 flex-none transition-transform group-hover:translate-x-[2px]" style={{ color: "var(--muted-foreground)" }} aria-hidden />
      </Link>
    </li>
  );
}

// Milestones as rings, not dot strips (Chandu, 7 Oct 2026, on the strips:
// "this is really hard to read, didn't we have donuts or arcs before?").
// One equal tile per milestone, the share done in the middle; tap a ring to
// see who has not finished it.
export function MilestonesView() {
  const roster = useReviewedRoster();
  const [open, setOpen] = useState<MilestoneKey | null>(null);
  const rows = useMemo(() => MILESTONE_KEYS.map((k) => {
    const eligible = roster.filter((s) => milestonesForGrade(s.grade).includes(k));
    const by = (set: string[]) => eligible.filter((s) => set.includes(s.milestones[k]));
    const done = by(DONE).length;
    return { k, eligible, done, waiting: by(WAITING).length, moving: by(MOVING).length, notDone: eligible.filter((s) => !DONE.includes(s.milestones[k])) };
  }).filter((r) => r.eligible.length), [roster]);
  const sel = rows.find((r) => r.k === open);

  return (
    <section aria-label="Milestones" className="flex flex-col gap-[var(--space-6)]">
      <Legend />
      <ul className="grid grid-cols-2 gap-x-[var(--space-4)] gap-y-[var(--space-6)] sm:grid-cols-3 lg:grid-cols-6">
        {rows.map((r) => {
          const Icon = MILESTONE_ICON[r.k];
          const isOpen = open === r.k;
          const pct = Math.round((r.done / r.eligible.length) * 100);
          return (
            <li key={r.k} className="flex">
              <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : r.k)} className="dm-quiet group flex w-full cursor-pointer flex-col items-center gap-[var(--space-3)] rounded-[var(--radius-lg)] px-[var(--space-2)] py-[var(--space-4)] text-center" style={isOpen ? { background: "color-mix(in srgb, var(--primary) 10%, transparent)" } : undefined}>
                <MilestoneRing total={r.eligible.length} parts={[
                  { n: r.done, color: RING.done },
                  { n: r.waiting, color: RING.waiting },
                  { n: r.moving, color: RING.moving },
                  { n: r.eligible.length - r.done - r.waiting - r.moving, color: RING.none },
                ]}>
                  <span className="text-[24px] leading-[28px] font-semibold tabular-nums" style={{ fontFamily: "var(--font-display)" }}>{pct}%</span>
                  <span className="text-[12px] font-medium tabular-nums" style={{ color: "var(--muted-foreground)" }}>{r.done} of {r.eligible.length}</span>
                </MilestoneRing>
                <span className="flex items-center gap-[6px] text-[14.5px] leading-[19px] font-semibold" style={{ color: isOpen ? "var(--accent)" : undefined }}>
                  <Icon className="h-[16px] w-[16px] flex-none" style={{ color: "var(--accent)" }} aria-hidden />{r.k}
                </span>
                {r.waiting > 0 && <span className="-mt-[6px] text-[12.5px] font-semibold" style={{ color: "var(--accent)" }}>{r.waiting} waiting for you</span>}
              </button>
            </li>
          );
        })}
      </ul>
      {sel && (
        <section aria-label={`${sel.k}: not done`} className="flex flex-col gap-[var(--space-3)] border-t pt-[var(--space-5)]" style={{ borderColor: RULE }}>
          <div className="flex items-baseline justify-between gap-[var(--space-3)]">
            <h3 className="text-[20px] leading-[26px] font-semibold" style={{ fontFamily: "var(--font-display)" }}>{sel.k}: {sel.notDone.length} not done</h3>
            <button type="button" onClick={() => setOpen(null)} className="dm-link text-[14px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Close</button>
          </div>
          <ul className="grid grid-cols-1 gap-x-[var(--space-10)] md:grid-cols-2">
            {sel.notDone.map((s) => <StudentLine key={s.id} s={s} note={s.milestones[sel.k] === "Pending Review" ? "Waiting for you" : s.milestones[sel.k]} />)}
          </ul>
        </section>
      )}
    </section>
  );
}

// Status dots in the app's status colors (Chandu, 7 Oct 2026: "at risk,
// needs attention etc need color coding").
const STATUS_DOTS = {
  ok: "bg-[var(--color-feedback-success-solid)]",
  attention: "bg-[var(--color-feedback-warning-solid)]",
  risk: "bg-[var(--color-feedback-danger-solid)]",
};

export function ProgressView() {
  const roster = useReviewedRoster();
  const [open, setOpen] = useState<number | null>(null);
  const grades = useMemo(() => [9, 10, 11, 12].map((g) => {
    const list = roster.filter((s) => s.grade === g);
    const keys = milestonesForGrade(g);
    const doneAll = list.reduce((t, s) => t + keys.filter((k) => DONE.includes(s.milestones[k])).length, 0);
    return {
      g, list,
      ok: list.filter((s) => s.status === "On Track").length,
      attention: list.filter((s) => s.status === "Needs Attention").length,
      risk: list.filter((s) => s.status === "At Risk").length,
      pct: list.length ? Math.round((doneAll / (list.length * keys.length)) * 100) : 0,
      need: list.filter((s) => s.status !== "On Track").sort((a, b) => (a.status === "At Risk" ? -1 : 1) - (b.status === "At Risk" ? -1 : 1)),
    };
  }), [roster]);

  return (
    <section aria-label="Progress by grade" className="flex flex-col gap-[var(--space-5)]">
      <div className="flex flex-wrap gap-x-[var(--space-5)] gap-y-[6px] text-[13px] font-medium" style={{ color: "var(--muted-foreground)" }}>
        {[["On track", STATUS_DOTS.ok], ["Needs attention", STATUS_DOTS.attention], ["At risk", STATUS_DOTS.risk]].map(([l, c]) => <span key={l} className="flex items-center gap-[6px]"><span aria-hidden className={`box-border size-[12px] rounded-full ${c}`} />{l}</span>)}
        <span>One dot = one student</span>
      </div>
      <ul className="flex flex-col">
        {grades.map((r) => {
          const isOpen = open === r.g;
          return (
            <li key={r.g} className="border-b" style={{ borderColor: RULE }}>
              <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : r.g)} className="dm-quiet -mx-[var(--space-2)] grid w-[calc(100%+var(--space-4))] cursor-pointer grid-cols-[minmax(0,1fr)_auto] items-center gap-x-[var(--space-4)] gap-y-[8px] rounded-[var(--radius-md)] px-[var(--space-2)] py-[18px] text-left sm:grid-cols-[140px_minmax(0,2fr)_150px_16px]">
                <span className="flex flex-col">
                  <span className="text-[20px] leading-[24px] font-semibold" style={{ fontFamily: "var(--font-display)" }}>Grade {r.g}</span>
                  <span className="text-[13px] font-medium" style={{ color: "var(--muted-foreground)" }}>{r.list.length} students</span>
                </span>
                <span className="col-span-2 sm:col-span-1 sm:row-start-1 sm:col-start-2"><DotStrip size="size-[12px]" gap="gap-[4px]" parts={[
                  { n: r.ok, label: "on track", dot: STATUS_DOTS.ok },
                  { n: r.attention, label: "need attention", dot: STATUS_DOTS.attention },
                  { n: r.risk, label: "at risk", dot: STATUS_DOTS.risk },
                ]} /></span>
                <span className="row-start-1 col-start-2 flex flex-col items-center gap-[2px] justify-self-end sm:col-start-3">
                  <HalfGauge pct={r.pct} width={64} stroke={6} color="var(--primary)">
                    <span className="text-[14px] leading-[16px] font-semibold tabular-nums">{r.pct}%</span>
                  </HalfGauge>
                  <span className="text-[12.5px] font-medium" style={{ color: "var(--muted-foreground)" }}>milestones done</span>
                </span>
                <ChevronDown className={`hidden h-4 w-4 transition-transform sm:block ${isOpen ? "rotate-180" : ""}`} style={{ color: "var(--muted-foreground)" }} aria-hidden />
              </button>
              {isOpen && (
                r.need.length
                  ? <ul className="mb-[var(--space-4)] flex flex-col pl-[var(--space-8)]">{r.need.map((s) => <StudentLine key={s.id} s={s} note={`${s.status} · ${attentionReason(s)}`} />)}</ul>
                  : <p className="mb-[var(--space-4)] pl-[var(--space-8)] text-[14px] font-semibold v5-ok">Everyone in grade {r.g} is on track.</p>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
