"use client";

// Bulk on Messages (10 Oct 2026, Chandu: "Messages inbox and sent are too
// basic ... And do we have bulk action controls? Bulk email, bulk sending
// etc?"). Three pieces, used by CounselorConnect.tsx:
// - BulkReplyReview: Reply to all from the Inbox selection. The pattern is
//   NudgeSession's BulkReview (read it before you send): one note with
//   {first}, a per-student preview you step through (their question, then
//   your reply), the recipient list with untick, then Send N.
// - BulkComposer: one note to many (a message, a reminder, a to-do), with a
//   preview of what each student gets and an "Also send as email" switch.
//   It records through addSend, the same store BatchComposer writes, so the
//   Sent tab and each student's profile read it as before. BatchComposer
//   (Batch.tsx) stays as it is for the Students selection bar.
// - Reach: read and replied per send, seeded until receipts exist.

import { useEffect, useRef, useState } from "react";
import { Bell, CalendarClock, ChevronLeft, ChevronRight, ClipboardList, Loader2, Mail, MessageSquare, Send, X } from "lucide-react";
import { DatePicker } from "@/components/app/DatePicker";
import { IconTip } from "@/components/app/IconTip";
import { addSend, type BatchKind } from "@/lib/counselorCasefile";
import type { CounselorStudent } from "@/lib/counselorRoster";
import { createLocalRecord } from "@/lib/localRecord";
import { Avatar } from "./chips";
import { useDialogFocus } from "./useDialogFocus";

/** {first} becomes each student's first name. */
export const fillFirst = (text: string, name: string) => text.replace(/\{first\}/g, name.split(" ")[0]);

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** DEMO-ONLY: who read a send and who replied, seeded from its id until
 *  read receipts come back from the student app. Nothing reads it in the
 *  first two minutes; then about four in five read and one in four
 *  readers reply. */
export function reachFor(id: string, studentIds: string[], at: string): { read: string[]; replied: string[] } {
  const fresh = Date.now() - new Date(at).getTime() < 120000;
  if (fresh) return { read: [], replied: [] };
  const read = studentIds.filter((s) => hash(`${id}:r:${s}`) % 100 < 78);
  const replied = read.filter((s) => hash(`${id}:p:${s}`) % 100 < 26);
  return { read, replied };
}

// DEMO-ONLY: which sends also went out as email. There is no email channel
// in the product yet; the switch records the choice and nothing is emailed.
const emailedStore = createLocalRecord<string[]>("dreamari-counselor-emailed", []);
export const useEmailed = () => emailedStore.useValue();
export function markEmailed(id: string): void {
  emailedStore.update((list) => [id, ...list.filter((x) => x !== id)].slice(0, 300));
}

/** DEMO-ONLY: "Also send as email", a switch, no real sending. */
export function EmailToggle({ on, onChange }: { on: boolean; onChange: (on: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={() => onChange(!on)} className="msg-switch dm-quiet">
      <span className="msg-switch-track" aria-hidden><i /></span>
      <Mail className="h-[14px] w-[14px]" aria-hidden />Also send as email
    </button>
  );
}

/** Step through one preview per student: "What Maya gets", 1 of 12. */
function Stepper({ at, total, onAt }: { at: number; total: number; onAt: (i: number) => void }) {
  return (
    <span className="msg-step">
      <IconTip label="Previous student"><button type="button" onClick={() => onAt(Math.max(0, at - 1))} disabled={at === 0} aria-label="Previous student" className="dm-quiet"><ChevronLeft className="h-4 w-4" aria-hidden /></button></IconTip>
      <span className="tabular-nums">{at + 1} of {total}</span>
      <IconTip label="Next student"><button type="button" onClick={() => onAt(Math.min(total - 1, at + 1))} disabled={at >= total - 1} aria-label="Next student" className="dm-quiet"><ChevronRight className="h-4 w-4" aria-hidden /></button></IconTip>
    </span>
  );
}

/** Put a token where the cursor is. */
function insertAt(el: HTMLTextAreaElement | null, value: string, token: string): string {
  const from = el?.selectionStart ?? value.length;
  const to = el?.selectionEnd ?? value.length;
  return value.slice(0, from) + token + value.slice(to);
}

export type ReplyItem = { key: string; name: string; studentId?: string; avatarIndex?: number; question: string; tag: string };

/** Reply to all: read before you send. */
export function BulkReplyReview({ items, onCancel, onSend }: { items: ReplyItem[]; onCancel: () => void; onSend: (keys: string[], template: string) => void }) {
  const [template, setTemplate] = useState("Hi {first}, thanks for your question. Let's talk it through at your next check-in.");
  const [off, setOff] = useState<Set<string>>(() => new Set());
  const [at, setAt] = useState(0);
  const [showList, setShowList] = useState(false);
  const [sending, setSending] = useState(false);
  const box = useRef<HTMLTextAreaElement>(null);
  const ref = useRef<HTMLDivElement>(null);
  useDialogFocus(true, ref, onCancel);
  useEffect(() => { box.current?.focus(); }, []);
  const picked = items.filter((i) => !off.has(i.key));
  const idx = Math.min(at, Math.max(0, picked.length - 1));
  const it = picked[idx];
  const n = picked.length;
  // the button's own loading state (COMPONENT_STATES_PLAYBOOK.md): a
  // spinning icon and "Sending" for a beat, then the replies land
  const send = () => { setSending(true); window.setTimeout(() => onSend(picked.map((p) => p.key), template.trim()), 600); };
  return (
    <>
      <div className="msg-scrim" onClick={onCancel} aria-hidden />
      <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="msg-review-title" className="msg-review dm-scroll">
        <IconTip label="Close" className="msg-review-close absolute"><button type="button" onClick={onCancel} aria-label="Close" className="dm-quiet"><X className="h-4 w-4" aria-hidden /></button></IconTip>
        <div className="msg-review-head">
          <h2 id="msg-review-title" className="msg-review-title">Reply to {n}</h2>
          <p className="msg-review-sub">One note, with each name filled in. Read it before you send.</p>
        </div>
        <label className="flex flex-col gap-[8px]">
          <span className="msg-label">The note</span>
          <textarea ref={box} rows={3} value={template} onChange={(e) => setTemplate(e.target.value)} className="msg-box" />
        </label>
        <span><button type="button" onClick={() => setTemplate(insertAt(box.current, template, "{first}"))} className="msg-token dm-quiet">+ First name</button></span>

        {it && (
          <div className="msg-preview">
            <span className="flex items-center justify-between gap-[8px]">
              <span className="msg-label">What {it.name.split(" ")[0]} gets</span>
              <Stepper at={idx} total={n} onAt={setAt} />
            </span>
            <div className="msg-line is-them"><span className="msg-face"><Avatar name={it.name} index={it.avatarIndex} size={30} /></span><p className="msg-bubble">{it.question}</p></div>
            <div className="msg-line is-me"><p className="msg-bubble is-me">{fillFirst(template, it.name) || " "}</p></div>
          </div>
        )}

        <div className="flex flex-col gap-[8px]">
          <button type="button" onClick={() => setShowList((v) => !v)} aria-expanded={showList} className="msg-who dm-quiet">
            <span className="msg-stack">{picked.slice(0, 5).map((p) => <span key={p.key}><Avatar name={p.name} index={p.avatarIndex} size={26} /></span>)}</span>
            <span>To {n} {n === 1 ? "student" : "students"}</span>
            <span className="msg-who-link">{showList ? "Hide list" : "See list"}</span>
          </button>
          {showList && (
            <ul className="msg-who-list dm-scroll">
              {items.map((p) => (
                <li key={p.key}>
                  <label className="msg-who-row">
                    <input type="checkbox" checked={!off.has(p.key)} onChange={() => setOff((o) => { const s = new Set(o); if (s.has(p.key)) s.delete(p.key); else s.add(p.key); return s; })} />
                    <Avatar name={p.name} index={p.avatarIndex} size={26} />
                    <span className="truncate font-semibold">{p.name}</span>
                    <span className="truncate" style={{ color: "var(--muted-foreground)" }}>{p.tag}</span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>

        <span className="flex justify-end gap-[8px]">
          <button type="button" onClick={onCancel} className="msg-btn dm-quiet">Cancel</button>
          <button type="button" disabled={!n || !template.trim() || sending} onClick={send} className="msg-btn is-solid dm-solid bg-[var(--primary)] text-[var(--primary-foreground)]">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />}
            {sending ? "Sending…" : `Send ${n} ${n === 1 ? "reply" : "replies"}`}
          </button>
        </span>
      </div>
    </>
  );
}

const KINDS: { id: BatchKind; label: string; icon: typeof Bell }[] = [
  { id: "message", label: "Message", icon: MessageSquare },
  { id: "reminder", label: "Reminder", icon: Bell },
  { id: "todo", label: "To-do", icon: ClipboardList },
];
// The same starters as BatchComposer (Batch.tsx), with {first} where a
// greeting reads better personal.
const TEMPLATES: Record<BatchKind, { label: string; text: string }[]> = {
  message: [
    { label: "Check in", text: "Hi {first}! Checking in on how your plan is going this season. Reply here if you want to talk anything through, or book a time with me." },
    { label: "Event invite", text: "Hi {first}, we are hosting a career talk next week. Come if the field interests you, and bring a question for the speaker." },
  ],
  reminder: [
    { label: "Step due", text: "Hi {first}, your next My Plan step is due soon. Open My Plan to see what is left. It takes a few minutes." },
    { label: "Course plan meeting", text: "Registration closes soon, {first}. Book a time with me this week so we can pick next year's courses together." },
  ],
  todo: [
    { label: "Book a meeting", text: "Book a 15-minute meeting with me to review your plan." },
    { label: "Share your report", text: "Share your latest Career Report with me from the app." },
  ],
};

/** One note to many students, previewed per student before it goes. */
export function BulkComposer({ kind, students, audience, onDone }: { kind: BatchKind; students: CounselorStudent[]; audience: string; onDone: (summary: string) => void }) {
  const [text, setText] = useState("");
  const [due, setDue] = useState(() => { const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString().slice(0, 10); });
  const [email, setEmail] = useState(false);
  const [at, setAt] = useState(0);
  const [sending, setSending] = useState(false);
  const box = useRef<HTMLTextAreaElement>(null);
  const n = students.length;
  const idx = Math.min(at, Math.max(0, n - 1));
  const s = students[idx];
  const noun = kind === "todo" ? "to-do" : kind;
  const Icon = KINDS.find((k) => k.id === kind)?.icon ?? MessageSquare;
  const send = () => {
    setSending(true);
    window.setTimeout(() => {
      const next = addSend({ kind, text: text.trim(), due: kind === "todo" ? due : undefined, studentIds: students.map((x) => x.id), audience });
      if (email && next[0]) markEmailed(next[0].id);
      setSending(false);
      setText("");
      onDone(`${kind === "todo" ? "To-do assigned to" : kind === "reminder" ? "Reminder sent to" : "Message sent to"} ${n} ${n === 1 ? "student" : "students"}${email ? ", and by email" : ""}.`);
    }, 600);
  };
  return (
    <div className="msg-compose">
      <div className="msg-compose-write">
        <div className="flex flex-wrap items-center gap-[6px]">
          <span className="msg-label">Start from</span>
          {TEMPLATES[kind].map((t) => <button key={t.label} type="button" onClick={() => setText(t.text)} className="msg-token dm-quiet">{t.label}</button>)}
          <button type="button" onClick={() => setText(insertAt(box.current, text, "{first}"))} className="msg-token dm-quiet">+ First name</button>
        </div>
        <textarea ref={box} value={text} onChange={(e) => setText(e.target.value)} rows={5} aria-label={`The ${noun}`} placeholder={`One ${noun} for all ${n}. Each student sees it as their own.`} className="msg-box" />
        {kind === "todo" && (
          <label className="flex items-center gap-[8px] text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
            <CalendarClock className="h-[14px] w-[14px]" aria-hidden /> Due
            <DatePicker value={due} onChange={setDue} ariaLabel="Due date" className="h-9 rounded-[var(--radius-sm)] border px-[10px] text-[13px] outline-none" style={{ background: "var(--card)", borderColor: "var(--glass-border)", color: "var(--foreground)" }} />
          </label>
        )}
        <div className="msg-compose-foot">
          <EmailToggle on={email} onChange={setEmail} />
          <button type="button" disabled={!text.trim() || n === 0 || sending} onClick={send} className="msg-btn is-solid dm-solid bg-[var(--primary)] text-[var(--primary-foreground)]">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />}
            {sending ? "Sending…" : `${kind === "todo" ? "Assign" : "Send"} to ${n}`}
          </button>
        </div>
      </div>
      <aside className="msg-preview" aria-label="Preview">
        <span className="flex items-center justify-between gap-[8px]">
          <span className="msg-label">{s ? `What ${s.name.split(" ")[0]} gets` : "Preview"}</span>
          {n > 1 && <Stepper at={idx} total={n} onAt={setAt} />}
        </span>
        {s ? (
          <div className="msg-phone">
            <span className="msg-phone-from"><Icon className="h-[14px] w-[14px]" aria-hidden />{kind === "todo" ? "New to-do" : kind === "reminder" ? "Reminder" : "Message"} from your counselor{email ? " · also by email" : ""}</span>
            <p className="msg-bubble">{text.trim() ? fillFirst(text, s.name) : <span style={{ color: "var(--muted-foreground)" }}>Your words show here as {s.name.split(" ")[0]} will see them.</span>}</p>
            {kind === "todo" && <span className="msg-phone-due">Due {new Date(`${due}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>}
          </div>
        ) : <p className="msg-empty-line">Pick an audience to see what each student gets.</p>}
        {n > 0 && <span className="msg-who-static"><span className="msg-stack">{students.slice(0, 5).map((x) => <span key={x.id}><Avatar name={x.name} index={x.avatarIndex} size={24} /></span>)}</span>To {n} {n === 1 ? "student" : "students"} · {audience}</span>}
      </aside>
    </div>
  );
}
