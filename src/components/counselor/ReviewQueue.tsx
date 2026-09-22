"use client";

import { useMemo, useState } from "react";
import { Paperclip } from "lucide-react";
import { HoverBeam } from "@/components/app/HoverBeam";
import { getRoster, type CounselorStudent, type MilestoneKey } from "@/lib/counselorRoster";
import { Avatar, MilestoneChip } from "./chips";

import { GLASS_CARD as TINTED_CARD } from "./surfaces";

type Priority = "Normal" | "High" | "Urgent";
type ReviewItem = {
  id: string;
  student: CounselorStudent;
  type: MilestoneKey;
  priority: Priority;
  submitted: string;
  due: string;
  message: string;
  attachment: string;
  status: "Approved" | "Changes Requested" | "Pending Review";
};

const MESSAGES: Record<string, string> = {
  Resume: "Please review my updated resume. I added my volunteer work and recent internship.",
  "Career Report": "Just finished my career report — let me know if anything's missing before I share it with my family.",
  "Academic Plan": "Updated my four-year plan with the new elective. Can you take a look?",
  "Financial Aid": "Submitted my FAFSA worksheet — wanted to confirm I filled it out right.",
  "Recommendation Letter": "Requesting a recommendation letter for my top-choice school. Deadline is coming up soon!",
};

function seedDate(offsetDays: number): string {
  return new Date(Date.now() + offsetDays * 86400000).toISOString().slice(0, 10);
}

function buildQueue(): ReviewItem[] {
  const pending = getRoster().filter((s) => Object.values(s.milestones).includes("Pending Review"));
  return pending.map((s, i) => {
    const type = (Object.keys(s.milestones) as MilestoneKey[]).find((k) => s.milestones[k] === "Pending Review")!;
    const priority: Priority = i % 5 === 0 ? "Urgent" : i % 3 === 0 ? "High" : "Normal";
    return {
      id: s.id,
      student: s,
      type,
      priority,
      submitted: seedDate(-((i % 6) + 1)),
      due: seedDate((i % 5) + 1),
      message: MESSAGES[type] ?? `Please review my ${type.toLowerCase()}.`,
      attachment: `${s.name.toLowerCase().replace(/\s+/g, "_")}_${type.toLowerCase().replace(/\s+/g, "_")}.pdf`,
      status: "Pending Review",
    };
  });
}

const PRIORITY_COLORS: Record<Priority, string> = { Normal: "rgba(255,255,255,0.35)", High: "#F5A623", Urgent: "#E0453C" };

export function ReviewQueue() {
  const [items, setItems] = useState<ReviewItem[]>(() => buildQueue());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");

  const pending = useMemo(() => items.filter((i) => i.status === "Pending Review"), [items]);
  const selected = items.find((i) => i.id === selectedId) ?? pending[0] ?? null;

  const resolve = (status: "Approved" | "Changes Requested") => {
    if (!selected) return;
    setItems((prev) => prev.map((i) => (i.id === selected.id ? { ...i, status } : i)));
    setFeedback("");
    setSelectedId(null);
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-[8px] rounded-[var(--radius-lg)] border py-[70px] text-center" style={{ borderColor: "var(--glass-border)", background: "var(--card)" }}>
        <p style={{ color: "var(--muted-foreground)" }}>Nothing pending review right now.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-[380px_1fr]">
      <div className="flex flex-col gap-[var(--space-3)]">
        <span className="text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Pending Reviews ({pending.length})</span>
        <div className="flex flex-col gap-[8px]">
          {pending.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedId(item.id)}
              className="dm-quiet flex cursor-pointer flex-col gap-[6px] rounded-[var(--radius-lg)] border p-[var(--space-4)] text-left"
              style={{ borderColor: selected?.id === item.id ? "var(--primary)" : "var(--glass-border)", background: selected?.id === item.id ? "color-mix(in srgb, var(--primary) 10%, var(--card))" : "var(--card)" }}
            >
              <span className="flex items-center gap-[10px]">
                <Avatar name={item.student.name} size={30} />
                <span className="flex min-w-0 flex-1 flex-col leading-tight">
                  <span className="truncate text-[13.5px] font-bold" style={{ color: "var(--foreground)" }}>{item.student.name}</span>
                  <span className="text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Grade {item.student.grade}</span>
                </span>
              </span>
              <span className="text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>{item.type}</span>
              <span className="flex items-center gap-[8px]">
                <span className="rounded-full px-[8px] py-[2px] text-[10.5px] font-bold" style={{ background: `color-mix(in srgb, ${PRIORITY_COLORS[item.priority]} 18%, transparent)`, color: PRIORITY_COLORS[item.priority] }}>{item.priority}</span>
                <MilestoneChip status="Pending Review" />
              </span>
              <span className="text-[11px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Submitted: {item.submitted} · Due: {item.due}</span>
            </button>
          ))}
        </div>
      </div>

      <HoverBeam strength={0.5} className="h-full">
        <div className="flex h-full flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
          {!selected ? (
            <p style={{ color: "var(--muted-foreground)" }}>Select a submission to review.</p>
          ) : (
            <>
              <h2 className="text-[16px] font-bold" style={{ color: "var(--foreground)" }}>Review Detail</h2>
              <div className="grid grid-cols-2 gap-x-[var(--space-4)] gap-y-[10px] rounded-[var(--radius-md)] border p-[var(--space-4)] text-[13px]" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
                <span style={{ color: "var(--muted-foreground)" }}>Student</span><span className="font-semibold" style={{ color: "var(--foreground)" }}>{selected.student.name} (Grade {selected.student.grade})</span>
                <span style={{ color: "var(--muted-foreground)" }}>Type</span><span className="font-semibold" style={{ color: "var(--foreground)" }}>{selected.type}</span>
                <span style={{ color: "var(--muted-foreground)" }}>Submitted</span><span className="font-semibold" style={{ color: "var(--foreground)" }}>{selected.submitted}</span>
                <span style={{ color: "var(--muted-foreground)" }}>Due Date</span><span className="font-semibold" style={{ color: "var(--foreground)" }}>{selected.due}</span>
                <span style={{ color: "var(--muted-foreground)" }}>Priority</span><span className="font-semibold" style={{ color: PRIORITY_COLORS[selected.priority] }}>{selected.priority}</span>
                <span style={{ color: "var(--muted-foreground)" }}>Status</span><span><MilestoneChip status="Pending Review" /></span>
              </div>
              <div className="flex flex-col gap-[4px]">
                <span className="text-[12px] font-bold tracking-[0.04em] uppercase" style={{ color: "var(--muted-foreground)" }}>Student Message</span>
                <p className="rounded-[var(--radius-md)] border p-[var(--space-4)] text-[13px] italic" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)", color: "var(--foreground)" }}>{selected.message}</p>
              </div>
              <div className="flex flex-col gap-[4px]">
                <span className="text-[12px] font-bold tracking-[0.04em] uppercase" style={{ color: "var(--muted-foreground)" }}>Attachment</span>
                <span className="flex items-center gap-[8px] text-[13px] font-semibold" style={{ color: "var(--primary)" }}>
                  <Paperclip className="h-[14px] w-[14px]" aria-hidden /> {selected.attachment}
                </span>
              </div>
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
                <button type="button" onClick={() => resolve("Approved")} className="dm-solid bg-[var(--primary)] text-[var(--primary-foreground)] flex h-10 flex-1 cursor-pointer items-center justify-center rounded-[var(--radius-md)] text-[13.5px] font-bold">Approve</button>
                <button type="button" onClick={() => resolve("Changes Requested")} className="dm-quiet flex h-10 flex-1 cursor-pointer items-center justify-center rounded-[var(--radius-md)] border text-[13.5px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>Request Changes</button>
              </div>
            </>
          )}
        </div>
      </HoverBeam>
    </div>
  );
}
