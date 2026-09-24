"use client";

// v1: the reference's Review Queue, 1:1. Its 15 submissions are fixed
// content on the reference (captured verbatim 24 Sept 2026: names, types,
// priorities, statuses, dates, messages, attachments), not derived from the
// roster, so they're fixed here too. Approve / Request Changes behave as
// they do on the reference: the item leaves the list for the session.
// The v2 fork (v2/ReviewQueue.tsx) is where the roster-driven, persisted
// version lives.

import { useMemo, useState } from "react";
import { Paperclip } from "lucide-react";
import { HoverBeam } from "@/components/app/HoverBeam";
import { Avatar } from "./chips";

import { GLASS_CARD as TINTED_CARD } from "./surfaces";

type Priority = "Normal" | "High" | "Urgent";
type ItemStatus = "Pending Review" | "Submitted" | "In Progress" | "Overdue";
type ReviewItem = {
  id: string;
  student: string;
  grade: number;
  type: string;
  priority: Priority;
  status: ItemStatus;
  submitted: string;
  due: string;
  message: string;
  attachment?: string;
};

const QUEUE: ReviewItem[] = [
  { id: "1", student: "Marcus Thompson", grade: 11, type: "Resume Draft", priority: "Normal", status: "Pending Review", submitted: "2024-01-13", due: "2024-01-20", message: "Please review my updated resume. I added my volunteer work and recent internship.", attachment: "marcus_thompson_resume_v2.pdf" },
  { id: "2", student: "Jamal Washington", grade: 9, type: "Career Report", priority: "High", status: "Pending Review", submitted: "2024-01-14", due: "2024-01-18", message: "Completed my initial career report exploring technology careers.", attachment: "jamal_washington_career_report.pdf" },
  { id: "3", student: "Sophia Kim", grade: 12, type: "Financial Aid Documents", priority: "Urgent", status: "Pending Review", submitted: "2024-01-12", due: "2024-01-15", message: "Uploaded FAFSA completion verification and additional documents.", attachment: "sophia_kim_fafsa_docs.pdf" },
  { id: "4", student: "Harper Anderson", grade: 9, type: "Career Report", priority: "Normal", status: "Pending Review", submitted: "2024-01-14", due: "2024-01-21", message: "Finished my career report on healthcare pathways.", attachment: "harper_anderson_career_report.pdf" },
  { id: "5", student: "Aria Martinez", grade: 9, type: "Academic Plan", priority: "Normal", status: "Pending Review", submitted: "2024-01-13", due: "2024-01-19", message: "Submitted my four-year academic plan.", attachment: "aria_martinez_academic_plan.pdf" },
  { id: "6", student: "Henry Rodriguez", grade: 11, type: "Resume Draft", priority: "Normal", status: "Pending Review", submitted: "2024-01-15", due: "2024-01-22", message: "First draft of my application-ready resume.", attachment: "henry_rodriguez_resume.pdf" },
  { id: "7", student: "Chloe Anderson", grade: 12, type: "Financial Aid Status", priority: "High", status: "Pending Review", submitted: "2024-01-14", due: "2024-01-17", message: "Submitted FAFSA and CSS Profile completion confirmation.", attachment: "chloe_anderson_finaid.pdf" },
  { id: "8", student: "Victoria Martinez", grade: 9, type: "Career Report", priority: "Normal", status: "Pending Review", submitted: "2024-01-13", due: "2024-01-20", message: "Career report exploring finance and business.", attachment: "victoria_martinez_career_report.pdf" },
  { id: "9", student: "Olivia Chen", grade: 11, type: "Career Report - Revised", priority: "Urgent", status: "Submitted", submitted: "2024-01-10", due: "2024-01-12", message: "Resubmitted career report with your requested changes.", attachment: "olivia_chen_career_report_v2.pdf" },
  { id: "10", student: "Charlotte Davis", grade: 12, type: "Academic Plan - Overdue", priority: "Urgent", status: "Overdue", submitted: "2024-01-08", due: "2024-01-05", message: "Sorry for the delay. Academic plan attached.", attachment: "charlotte_davis_academic_plan.pdf" },
  { id: "11", student: "Isabella Santos", grade: 11, type: "Academic Plan - Revised", priority: "High", status: "Submitted", submitted: "2024-01-09", due: "2024-01-11", message: "Updated academic plan with the corrections you suggested.", attachment: "isabella_santos_academic_plan_v2.pdf" },
  { id: "12", student: "Jackson Thomas", grade: 11, type: "Academic Plan", priority: "Normal", status: "In Progress", submitted: "2024-01-11", due: "2024-01-16", message: "Working on finalizing my academic plan." },
  { id: "13", student: "Sebastian Wilson", grade: 11, type: "Academic Plan", priority: "High", status: "In Progress", submitted: "2024-01-09", due: "2024-01-14", message: "Almost done with my academic plan." },
  { id: "14", student: "Elizabeth Wilson", grade: 12, type: "Career Report - Revised", priority: "Urgent", status: "Overdue", submitted: "2024-01-07", due: "2024-01-04", message: "Revised career report attached.", attachment: "elizabeth_wilson_career_report_v2.pdf" },
  { id: "15", student: "Elizabeth Wilson", grade: 12, type: "Academic Plan - Overdue", priority: "Urgent", status: "Overdue", submitted: "2024-01-06", due: "2024-01-03", message: "Late submission of academic plan.", attachment: "elizabeth_wilson_academic_plan.pdf" },
];

const PRIORITY_COLORS: Record<Priority, string> = { Normal: "rgba(255,255,255,0.35)", High: "#F5A623", Urgent: "#E0453C" };
const STATUS_PILL: Record<ItemStatus, string> = { "Pending Review": "#5B6CF9", Submitted: "#2F6BF2", "In Progress": "#F5A623", Overdue: "#E0453C" };

function Pill({ label, color }: { label: string; color: string }) {
  return (
    <span className="inline-flex items-center gap-[6px] rounded-full border px-[10px] py-[4px] text-[11.5px] font-bold whitespace-nowrap" style={{ borderColor: `color-mix(in srgb, ${color} 40%, transparent)`, background: `color-mix(in srgb, ${color} 14%, transparent)`, color }}>
      <span aria-hidden className="size-[6px] flex-none rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

export function ReviewQueue() {
  const [resolved, setResolved] = useState<Set<string>>(() => new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");

  const pending = useMemo(() => QUEUE.filter((i) => !resolved.has(i.id)), [resolved]);
  const selected = pending.find((i) => i.id === selectedId) ?? pending[0] ?? null;

  const resolve = () => {
    if (!selected) return;
    setResolved((prev) => new Set(prev).add(selected.id));
    setFeedback("");
    setSelectedId(null);
  };

  return (
    <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-[380px_1fr]">
      <div className="flex flex-col gap-[var(--space-3)]">
        <span className="text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Pending Reviews ({pending.length})</span>
        {pending.length === 0 ? (
          <div className="rounded-[var(--radius-lg)] border px-[var(--space-4)] py-[var(--space-6)] text-center text-[13px] font-semibold" style={{ borderColor: "var(--glass-border)", background: "var(--card)", color: "var(--muted-foreground)" }}>
            Nothing pending review right now.
          </div>
        ) : (
          <div className="flex flex-col gap-[8px]">
            {pending.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => { setSelectedId(item.id); setFeedback(""); }}
                className="dm-quiet flex cursor-pointer flex-col gap-[6px] rounded-[var(--radius-lg)] border p-[var(--space-4)] text-left"
                style={{ borderColor: selected?.id === item.id ? "var(--primary)" : "var(--glass-border)", background: selected?.id === item.id ? "color-mix(in srgb, var(--primary) 10%, var(--card))" : "var(--card)" }}
              >
                <span className="flex items-center gap-[10px]">
                  <Avatar name={item.student} size={30} />
                  <span className="flex min-w-0 flex-1 flex-col leading-tight">
                    <span className="truncate text-[13.5px] font-bold" style={{ color: "var(--foreground)" }}>{item.student}</span>
                    <span className="text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Grade {item.grade}</span>
                  </span>
                </span>
                <span className="text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>{item.type}</span>
                <span className="flex flex-wrap items-center gap-[8px]">
                  <Pill label={item.priority} color={PRIORITY_COLORS[item.priority]} />
                  <Pill label={item.status} color={STATUS_PILL[item.status]} />
                </span>
                <span className="text-[11px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Submitted: {item.submitted} • Due: {item.due}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <HoverBeam strength={0.5} className="h-full">
        <div className="flex h-full flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
          {!selected ? (
            <p style={{ color: "var(--muted-foreground)" }}>Select a submission to review.</p>
          ) : (
            <>
              <h2 className="text-[16px] font-bold" style={{ color: "var(--foreground)" }}>Review Detail</h2>
              <div className="flex flex-col gap-[8px]">
                <h3 className="text-[14px] font-bold" style={{ color: "var(--foreground)" }}>Submission Information</h3>
                <div className="grid grid-cols-2 gap-x-[var(--space-4)] gap-y-[10px] rounded-[var(--radius-md)] border p-[var(--space-4)] text-[13px]" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
                  <span style={{ color: "var(--muted-foreground)" }}>Student</span><span className="font-semibold" style={{ color: "var(--foreground)" }}>{selected.student} (Grade {selected.grade})</span>
                  <span style={{ color: "var(--muted-foreground)" }}>Type</span><span className="font-semibold" style={{ color: "var(--foreground)" }}>{selected.type}</span>
                  <span style={{ color: "var(--muted-foreground)" }}>Submitted</span><span className="font-semibold" style={{ color: "var(--foreground)" }}>{selected.submitted}</span>
                  <span style={{ color: "var(--muted-foreground)" }}>Due Date</span><span className="font-semibold" style={{ color: "var(--foreground)" }}>{selected.due}</span>
                  <span style={{ color: "var(--muted-foreground)" }}>Priority</span><span><Pill label={selected.priority} color={PRIORITY_COLORS[selected.priority]} /></span>
                  <span style={{ color: "var(--muted-foreground)" }}>Status</span><span><Pill label={selected.status} color={STATUS_PILL[selected.status]} /></span>
                </div>
              </div>
              <div className="flex flex-col gap-[4px]">
                <span className="text-[12px] font-bold tracking-[0.04em] uppercase" style={{ color: "var(--muted-foreground)" }}>Student Message</span>
                <p className="rounded-[var(--radius-md)] border p-[var(--space-4)] text-[13px] italic" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)", color: "var(--foreground)" }}>{selected.message}</p>
              </div>
              {selected.attachment && (
                <div className="flex flex-col gap-[4px]">
                  <span className="text-[12px] font-bold tracking-[0.04em] uppercase" style={{ color: "var(--muted-foreground)" }}>Attachment</span>
                  <span className="flex items-center gap-[8px] text-[13px] font-semibold" style={{ color: "var(--primary)" }}>
                    <Paperclip className="h-[14px] w-[14px]" aria-hidden /> {selected.attachment}
                  </span>
                </div>
              )}
              <div className="flex flex-col gap-[4px]">
                <span className="text-[12px] font-bold tracking-[0.04em] uppercase" style={{ color: "var(--muted-foreground)" }}>Counselor Feedback</span>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Add your feedback or notes here..."
                  rows={3}
                  className="w-full resize-none rounded-[var(--radius-md)] border px-[12px] py-[10px] text-[13px] outline-none"
                  style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" }}
                />
              </div>
              <div className="flex gap-[10px]">
                <button type="button" onClick={resolve} className="dm-solid bg-[var(--primary)] text-[var(--primary-foreground)] flex h-10 flex-1 cursor-pointer items-center justify-center rounded-[var(--radius-md)] text-[13.5px] font-bold">Approve</button>
                <button type="button" onClick={resolve} className="dm-quiet flex h-10 flex-1 cursor-pointer items-center justify-center rounded-[var(--radius-md)] border text-[13.5px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>Request Changes</button>
              </div>
            </>
          )}
        </div>
      </HoverBeam>
    </div>
  );
}
