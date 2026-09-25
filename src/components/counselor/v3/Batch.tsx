"use client";

// One message to many students (25 Sept 2026, direct question: "I should
// be able to select more than one student and send stuff. Of course not
// recommendation letters etc because they need to be personalised"). The
// composer is shared by the Students selection bar (a hand-picked set)
// and the Productivity Suite's Group message tool (an audience by grade,
// status or pathway). Three kinds: a message, a reminder, a to-do with a
// due date. Personal drafts stay one student at a time. DEMO-ONLY: sends
// are recorded locally (counselorCasefile.ts), nothing is delivered.

import { useState } from "react";
import { Bell, CalendarClock, ClipboardList, MessageSquare, Send, X } from "lucide-react";
import type { CounselorStudent } from "@/lib/counselorRoster";
import { addSend, type BatchKind } from "@/lib/counselorCasefile";
import { Avatar } from "../chips";
import { GLASS_INSET } from "../surfaces";

const KINDS: { id: BatchKind; label: string; icon: typeof Bell }[] = [
  { id: "message", label: "Message", icon: MessageSquare },
  { id: "reminder", label: "Reminder", icon: Bell },
  { id: "todo", label: "To-do", icon: ClipboardList },
];

const TEMPLATES: Record<BatchKind, { label: string; text: string }[]> = {
  message: [
    { label: "Check in", text: "Hi! Checking in on how your plan is going this season. Reply here if you want to talk anything through, or book a time with me." },
    { label: "Event invite", text: "We are hosting a career talk next week. Come if the field interests you, and bring a question for the speaker." },
  ],
  reminder: [
    { label: "Step due", text: "A reminder that your next My Plan step is due soon. Open My Plan to see what is left; it takes a few minutes." },
    { label: "Course plan meeting", text: "Registration closes soon. Book a time with me this week so we can pick next year's courses together." },
  ],
  todo: [
    { label: "Book a meeting", text: "Book a 15-minute meeting with me to review your plan." },
    { label: "Share your report", text: "Share your latest Career Report with me from the app." },
  ],
};

export function BatchComposer({ students, audience, onDone, onCancel }: { students: CounselorStudent[]; /** how the set was chosen, for the record ("12 selected", "Grade 11 · At Risk") */ audience: string; onDone: (summary: string) => void; onCancel?: () => void }) {
  const [kind, setKind] = useState<BatchKind>("message");
  const [text, setText] = useState("");
  const [due, setDue] = useState(() => { const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString().slice(0, 10); });
  const n = students.length;
  const fieldStyle = { background: "var(--card)", borderColor: "var(--glass-border)", color: "var(--foreground)" } as const;
  const noun = kind === "todo" ? "to-do" : kind;
  return (
    <div className="flex flex-col gap-[var(--space-3)] rounded-[var(--radius-md)] border p-[var(--space-4)]" style={{ ...GLASS_INSET, borderColor: "color-mix(in srgb, var(--primary) 50%, var(--glass-border))" }}>
      <div className="flex flex-wrap items-center justify-between gap-[8px]">
        <span className="flex items-center gap-[8px]">
          <span className="flex -space-x-[8px]">
            {students.slice(0, 4).map((s) => <span key={s.id} className="rounded-full ring-2" style={{ ["--tw-ring-color" as string]: "var(--card)" }}><Avatar name={s.name} size={24} index={s.avatarIndex} /></span>)}
          </span>
          <span className="text-[13px] font-bold" style={{ color: "var(--foreground)" }}>{n} student{n === 1 ? "" : "s"} <span className="font-semibold" style={{ color: "var(--muted-foreground)" }}>· {audience}</span></span>
        </span>
        <span className="flex items-center gap-[6px]">
          <span className="flex rounded-full border p-[2px]" style={{ borderColor: "var(--glass-border)" }} role="tablist" aria-label="What to send">
            {KINDS.map((k) => (
              <button key={k.id} type="button" role="tab" aria-selected={kind === k.id} onClick={() => { setKind(k.id); setText(""); }} className="flex h-7 cursor-pointer items-center gap-[5px] rounded-full px-[10px] text-[12px] font-bold" style={{ background: kind === k.id ? "var(--primary)" : "transparent", color: kind === k.id ? "var(--primary-foreground)" : "var(--muted-foreground)" }}>
                <k.icon className="h-[12px] w-[12px]" aria-hidden />{k.label}
              </button>
            ))}
          </span>
          {onCancel && <button type="button" onClick={onCancel} aria-label="Close" className="dm-quiet flex size-[28px] cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}><X className="h-[14px] w-[14px]" aria-hidden /></button>}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-[6px]">
        <span className="text-[11px] font-bold tracking-[0.04em] uppercase" style={{ color: "var(--muted-foreground)" }}>Start from</span>
        {TEMPLATES[kind].map((t) => (
          <button key={t.label} type="button" onClick={() => setText(t.text)} className="dm-quiet flex h-7 cursor-pointer items-center rounded-full border px-[10px] text-[12px] font-semibold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>{t.label}</button>
        ))}
        <span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>or write your own</span>
      </div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} aria-label={`The ${noun}`} placeholder={`One ${noun} for all ${n}. Each student sees it as their own.`} className="w-full resize-y rounded-[var(--radius-sm)] border px-[12px] py-[10px] text-[13px] leading-[20px] outline-none" style={fieldStyle} />
      <div className="flex flex-wrap items-center justify-between gap-[8px]">
        {kind === "todo" ? (
          <label className="flex items-center gap-[8px] text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
            <CalendarClock className="h-[14px] w-[14px]" aria-hidden /> Due
            <input type="date" value={due} onChange={(e) => setDue(e.target.value)} aria-label="Due date" className="h-8 rounded-[var(--radius-sm)] border px-[8px] text-[13px] outline-none" style={fieldStyle} />
          </label>
        ) : (
          <span aria-hidden />
        )}
        <button
          type="button"
          disabled={!text.trim() || n === 0}
          onClick={() => {
            addSend({ kind, text: text.trim(), due: kind === "todo" ? due : undefined, studentIds: students.map((s) => s.id), audience });
            onDone(`${kind === "todo" ? "To-do assigned to" : kind === "reminder" ? "Reminder sent to" : "Message sent to"} ${n} student${n === 1 ? "" : "s"}.`);
          }}
          className="dm-solid bg-[var(--primary)] text-[var(--primary-foreground)] flex h-9 cursor-pointer items-center gap-[6px] rounded-[var(--radius-sm)] px-[14px] text-[13px] font-bold disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send className="h-[13px] w-[13px]" aria-hidden /> {kind === "todo" ? "Assign" : "Send"} to {n}
        </button>
      </div>
    </div>
  );
}
