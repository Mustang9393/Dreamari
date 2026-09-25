"use client";

// DEMO-ONLY v2: the casefile cards mocked from the SchooLinks staff
// dashboard (25 Sept 2026, direct instruction: build the ones skipped as
// "would read as a copy", then see how to make them ours). Three cards on
// the Student Profile: Plan sign-off (three parties), To-dos (counselor-
// assigned, due dates, overdue), Check-ins (folded; a product decision,
// seeded from the student's own signals until a student-side check-in
// exists). Data: src/lib/counselorCasefile.ts.

import { useState } from "react";
import { CalendarClock, Check, ClipboardList, HeartPulse, ShieldCheck, Trash2, UserRound, Users } from "lucide-react";
import type { CounselorStudent } from "@/lib/counselorRoster";
import { addTodo, daysUntil, planSignoff, readSignoff, readTodos, removeTodo, toggleTodo, writeSignoff, type PartyState } from "@/lib/counselorCasefile";
import { signalsFor } from "@/lib/studentSignals";
import { STATUS_COLORS } from "../chips";
import { GLASS_CARD, GLASS_INSET } from "../surfaces";
import { PRIMARY } from "../palette";
import { Disclosure } from "./Disclosure";

function Head({ icon: Icon, title, aside }: { icon: React.ComponentType<{ className?: string }>; title: string; aside?: React.ReactNode }) {
  return (
    <span className="flex flex-wrap items-center justify-between gap-[8px]">
      <span className="flex items-center gap-[10px]">
        <span className="flex size-[30px] items-center justify-center rounded-[8px]" style={{ background: "color-mix(in srgb, var(--primary) 16%, transparent)", color: "var(--primary)" }}><Icon className="h-[15px] w-[15px]" /></span>
        <h2 className="text-[15px] font-bold" style={{ color: "var(--foreground)" }}>{title}</h2>
      </span>
      {aside}
    </span>
  );
}

const PARTY_WORD: Record<PartyState["state"], string> = { done: "Signed", pending: "Waiting", missing: "Not yet" };
function partyColor(p: PartyState): string {
  return p.state === "done" ? STATUS_COLORS["On Track"] : p.state === "pending" ? STATUS_COLORS["Needs Attention"] : "var(--muted-foreground)";
}

/** Three parties on the year's plan. The student's submission is read from
 *  the Academic Plan milestone; the counselor signs here; the guardian is
 *  invited here (a real guardian account is a product decision). */
export function PlanSignoffCard({ student }: { student: CounselorStudent }) {
  const [record, setRecord] = useState(() => readSignoff(student.id));
  const so = planSignoff(student, record);
  const first = student.name.split(" ")[0];
  const rows: { key: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; label: string; party: PartyState; action?: React.ReactNode }[] = [
    { key: "student", icon: UserRound, label: first, party: so.student },
    {
      key: "counselor", icon: ShieldCheck, label: "You", party: so.counselor,
      action: so.counselor.state === "pending"
        ? <button type="button" onClick={() => setRecord(writeSignoff(student.id, { counselorAt: new Date().toISOString() }))} className="dm-solid bg-[var(--primary)] text-[var(--primary-foreground)] flex h-8 cursor-pointer items-center rounded-[var(--radius-sm)] px-[12px] text-[12.5px] font-bold">Sign</button>
        : record.counselorAt ? <button type="button" onClick={() => setRecord(writeSignoff(student.id, { counselorAt: undefined }))} className="dm-quiet flex h-8 cursor-pointer items-center rounded-[var(--radius-sm)] border px-[10px] text-[12px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>Undo</button> : undefined,
    },
    {
      key: "guardian", icon: Users, label: "Guardian", party: so.guardian,
      action: so.guardian.state === "done" ? undefined
        : <button type="button" onClick={() => setRecord(writeSignoff(student.id, { guardianInvitedAt: new Date().toISOString() }))} className="dm-quiet flex h-8 cursor-pointer items-center rounded-[var(--radius-sm)] border px-[10px] text-[12px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>{so.guardian.state === "pending" ? "Remind" : "Invite"}</button>,
    },
  ];
  const signed = rows.filter((r) => r.party.state === "done").length;
  return (
    <div className="flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={GLASS_CARD}>
      <Head icon={ShieldCheck} title="Plan sign-off" aside={<span className="text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{signed} of 3 signed · Grade {student.grade} plan</span>} />
      <ul className="flex flex-col gap-[6px]">
        {rows.map((r) => (
          <li key={r.key} className="flex items-center gap-[10px] rounded-[var(--radius-md)] border px-[12px] py-[8px]" style={GLASS_INSET}>
            <r.icon className="h-[15px] w-[15px] flex-none" style={{ color: "var(--muted-foreground)" }} />
            <span className="min-w-0 flex-1 text-[13.5px] font-bold" style={{ color: "var(--foreground)" }}>{r.label}</span>
            <span className="flex items-center gap-[6px] text-[12.5px] font-semibold" style={{ color: partyColor(r.party) }}>
              {r.party.state === "done" && <Check className="h-[13px] w-[13px]" aria-hidden />}
              {PARTY_WORD[r.party.state]}{r.party.when && r.party.state === "pending" ? ` · sent ${new Date(r.party.when).toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : ""}
            </span>
            {r.action}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Tasks the counselor assigns this student, each with a due date. Overdue
 *  reads in the At Risk red; done rows fade. */
export function TodosCard({ student }: { student: CounselorStudent }) {
  const [todos, setTodos] = useState(() => readTodos(student.id));
  const [text, setText] = useState("");
  const [due, setDue] = useState(() => { const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString().slice(0, 10); });
  const open = todos.filter((t) => !t.done);
  const overdue = open.filter((t) => daysUntil(t.due) < 0).length;
  const fieldStyle = { background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" } as const;
  return (
    <div className="flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={GLASS_CARD}>
      <Head icon={ClipboardList} title="To-dos" aside={<span className="text-[12.5px] font-semibold" style={{ color: overdue ? STATUS_COLORS["At Risk"] : "var(--muted-foreground)" }}>{open.length === 0 ? "Nothing open" : overdue ? `${overdue} overdue · ${open.length} open` : `${open.length} open`}</span>} />
      <form
        className="flex flex-wrap items-center gap-[8px]"
        onSubmit={(e) => { e.preventDefault(); if (!text.trim()) return; setTodos(addTodo(student.id, text.trim(), due)); setText(""); }}
      >
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder={`Ask ${student.name.split(" ")[0]} to…`} aria-label="To-do" className="h-9 min-w-[200px] flex-1 rounded-[var(--radius-sm)] border px-[10px] text-[13px] outline-none" style={fieldStyle} />
        <input type="date" value={due} onChange={(e) => setDue(e.target.value)} aria-label="Due date" className="h-9 rounded-[var(--radius-sm)] border px-[10px] text-[13px] outline-none" style={fieldStyle} />
        <button type="submit" disabled={!text.trim()} className="dm-solid bg-[var(--primary)] text-[var(--primary-foreground)] flex h-9 cursor-pointer items-center rounded-[var(--radius-sm)] px-[14px] text-[13px] font-bold disabled:cursor-not-allowed disabled:opacity-50">Assign</button>
      </form>
      {todos.length === 0 ? (
        <p className="text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>No to-dos yet. What you assign here shows up in {student.name.split(" ")[0]}&apos;s My Plan.</p>
      ) : (
        <ul className="flex flex-col gap-[6px]">
          {todos.map((t) => {
            const days = daysUntil(t.due);
            const dueLabel = t.done ? "Done" : days < 0 ? `Overdue by ${-days} day${days === -1 ? "" : "s"}` : days === 0 ? "Due today" : days === 1 ? "Due tomorrow" : `Due in ${days} days`;
            const color = t.done ? "var(--muted-foreground)" : days < 0 ? STATUS_COLORS["At Risk"] : days <= 2 ? STATUS_COLORS["Needs Attention"] : "var(--muted-foreground)";
            return (
              <li key={t.id} className="flex items-center gap-[10px] rounded-[var(--radius-md)] border px-[12px] py-[8px]" style={{ ...GLASS_INSET, opacity: t.done ? 0.6 : 1 }}>
                <button type="button" onClick={() => setTodos(toggleTodo(student.id, t.id))} aria-label={t.done ? "Mark not done" : "Mark done"} className="flex size-[20px] flex-none cursor-pointer items-center justify-center rounded-[6px] border" style={{ borderColor: t.done ? PRIMARY : "var(--glass-border)", background: t.done ? PRIMARY : "transparent", color: "#fff" }}>{t.done && <Check className="h-[12px] w-[12px]" aria-hidden />}</button>
                <span className={`min-w-0 flex-1 text-[13.5px] font-semibold ${t.done ? "line-through" : ""}`} style={{ color: "var(--foreground)" }}>{t.text}</span>
                <span className="flex flex-none items-center gap-[6px] text-[12px] font-semibold" style={{ color }}><CalendarClock className="h-[13px] w-[13px]" aria-hidden />{dueLabel}</span>
                <button type="button" onClick={() => setTodos(removeTodo(student.id, t.id))} aria-label="Remove" className="dm-quiet flex size-[26px] flex-none cursor-pointer items-center justify-center rounded-[6px]" style={{ color: "var(--muted-foreground)" }}><Trash2 className="h-[13px] w-[13px]" aria-hidden /></button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/** Well-being check-ins, folded. SchooLinks makes these a counselor
 *  feature (four areas, alert words, staff email). Dreamari has no
 *  student-side check-in yet, so this reads the student's own activity
 *  as a proxy and says so; whether to build the real thing is a product
 *  decision logged in the spec. */
export function CheckinsCard({ student }: { student: CounselorStudent }) {
  const [open, setOpen] = useState(false);
  const sig = signalsFor(student);
  const active = student.status === "On Track";
  const areas: { label: string; word: string; color: string }[] = [
    { label: "Engagement", word: active ? "Steady" : "Quiet lately", color: active ? STATUS_COLORS["On Track"] : STATUS_COLORS["Needs Attention"] },
    { label: "Exploration", word: sig.careersSaved >= 5 ? "Curious" : "Narrow", color: sig.careersSaved >= 5 ? STATUS_COLORS["On Track"] : STATUS_COLORS["Needs Attention"] },
    { label: "Connection", word: sig.questionsAsked >= 2 ? "Reaching out" : "Not yet", color: sig.questionsAsked >= 2 ? STATUS_COLORS["On Track"] : "var(--muted-foreground)" },
    { label: "Confidence", word: sig.dreamScore >= 70 ? "Growing" : "Building", color: sig.dreamScore >= 70 ? STATUS_COLORS["On Track"] : STATUS_COLORS["Needs Attention"] },
  ];
  return (
    <div className="flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={GLASS_CARD}>
      <Disclosure id="profile-checkins" variant="card" title={<Head icon={HeartPulse} title="Check-ins" />} summary="From Dreamari activity, no check-in asked yet" open={open} onToggle={() => setOpen((v) => !v)}>
        <ul className="grid grid-cols-2 gap-[8px] sm:grid-cols-4">
          {areas.map((a) => (
            <li key={a.label} className="flex flex-col gap-[2px] rounded-[var(--radius-md)] border px-[12px] py-[10px]" style={GLASS_INSET}>
              <span className="text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{a.label}</span>
              <span className="flex items-center gap-[6px] text-[13.5px] font-bold" style={{ color: "var(--foreground)" }}><span aria-hidden className="size-[8px] rounded-full" style={{ background: a.color }} />{a.word}</span>
            </li>
          ))}
        </ul>
        <p className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>A real check-in (how are you feeling this week, with alert words that notify staff) needs a student-side prompt. Product decision, logged in the spec.</p>
      </Disclosure>
    </div>
  );
}
