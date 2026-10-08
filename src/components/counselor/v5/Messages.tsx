"use client";

// v5 Workspace > Messages (7 Oct 2026): student questions as an inbox, laid
// out like the Reviews desk beside it. The list is on the left, questions
// that still owe a reply first; the open question and the reply box sit in a
// sticky panel on the right, so Send never needs a scroll. On phones the
// list comes first and the open question below it.
// Data is v4's QUESTIONS (the Replit's 15, verbatim).
//
// 8 Oct 2026 (audit: "replies vanish on navigation; Message on a student
// opens the whole inbox"): replies and counselor-started threads are kept
// in src/lib/counselorMessages.ts, so an answered question stays answered,
// leaves "waiting on you" and counts on My Impact. A link with
// &studentId= opens that student: their open question if they have one,
// otherwise their thread, started fresh if there is none, with the reply
// box focused. &draft=<key> (a FAFSA reminder) opens the thread with a
// short ready-made message to edit and send.

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check, MessageCircle, MessageSquare, RotateCcw, Send } from "lucide-react";
import { QUESTIONS } from "@/components/counselor/v4/CounselorConnect";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { avatarIndexForName, type CounselorStudent, type MilestoneKey } from "@/lib/counselorRoster";
import { draftFor, replyTo, sendToStudent, undoLastMessage, undoReply, useMessages, type SentMessage } from "@/lib/counselorMessages";
import { remindFafsa } from "@/lib/counselorFafsa";
import { MILESTONE_ICON } from "./milestoneIcons";
import { StudentFace } from "./StudentFace";
import { cv } from "@/lib/counselorBase";
import { logTime } from "@/lib/counselorTimeLog";

const RULE = "color-mix(in srgb, var(--foreground) 10%, transparent)";
const OVERLINE = "text-[12px] leading-[16px] font-semibold tracking-[0.08em] uppercase";
const OPEN = ["new", "viewed", "in-progress", "follow-up"];
const STATUS_LABEL: Record<string, string> = { new: "New", viewed: "Viewed", "in-progress": "In progress", "follow-up": "Follow up", responded: "Answered", resolved: "Answered" };
// v4's question milestones use the Replit's names; map them onto the v5
// milestone keys so the matching icon shows. Unmapped ones show none.
const MILESTONE_OF: Record<string, MilestoneKey> = {
  "Career Pathway Selection": "Career Pathway",
  "Application Progress": "Applications",
  "Academic Plan": "Academic Plan",
  "School List": "School List",
  "Financial Aid": "Financial Aid",
  Resume: "Resume",
  "Recommendation Letter": "Recommendation Letter",
};

type Question = (typeof QUESTIONS)[number];
/** A student's question, or a thread the counselor started. */
type Row =
  | { kind: "question"; key: string; q: Question; name: string; grade: number; student: CounselorStudent | null; open: boolean; date: string }
  | { kind: "thread"; key: string; name: string; grade: number; student: CounselorStudent | null; messages: SentMessage[]; open: false; date: string };

const threadKey = (studentId: string) => `t-${studentId}`;
const studentHref = (id: string) => `${cv("students")}&studentId=${encodeURIComponent(id)}`;

function fmtDate(iso: string): string {
  const d = new Date(iso.length === 10 ? `${iso}T12:00:00` : iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** A face for a row, even when the asker is outside this role's roster. */
function Face({ row, size }: { row: Row; size: number }) {
  const s = row.student ?? { id: row.key, avatarIndex: avatarIndexForName(row.name) ?? -1 };
  return <StudentFace s={s} size={size} />;
}

export function V5Messages() {
  const roster = useReviewedRoster();
  const params = useSearchParams();
  const { replies, threads } = useMessages();
  const [draft, setDraft] = useState("");
  const [draftKey, setDraftKey] = useState<string | null>(null);
  const [last, setLast] = useState<{ key: string; name: string; kind: Row["kind"]; studentId?: string } | null>(null);
  // a thread opened from a link before its first message is sent
  const [pending, setPending] = useState<CounselorStudent | null>(null);
  const panel = useRef<HTMLElement>(null);
  const box = useRef<HTMLTextAreaElement>(null);

  const rows = useMemo<Row[]>(() => {
    const byName = new Map(roster.map((s) => [s.name, s]));
    const byId = new Map(roster.map((s) => [s.id, s]));
    const qs: Row[] = QUESTIONS.map((q) => ({ kind: "question", key: q.id, q, name: q.name, grade: q.grade, student: byName.get(q.name) ?? null, open: OPEN.includes(q.status) && !replies[q.id], date: q.date }));
    const ts: Row[] = threads.map((t) => {
      const st = byId.get(t.studentId) ?? null;
      return { kind: "thread", key: threadKey(t.studentId), name: t.name, grade: st?.grade ?? 0, student: st, messages: t.messages, open: false, date: t.messages[t.messages.length - 1]?.at ?? "" };
    });
    if (pending && !threads.some((t) => t.studentId === pending.id)) ts.unshift({ kind: "thread", key: threadKey(pending.id), name: pending.name, grade: pending.grade, student: pending, messages: [], open: false, date: "" });
    // unanswered first, newest first inside each group
    return [...qs.sort((a, b) => Number(b.open) - Number(a.open) || b.date.localeCompare(a.date)), ...ts.sort((a, b) => b.date.localeCompare(a.date))];
  }, [roster, replies, threads, pending]);
  const toAnswer = rows.filter((r) => r.kind === "question" && r.open);
  const answered = rows.filter((r) => r.kind === "question" && !r.open);
  const started = rows.filter((r) => r.kind === "thread");

  const [selectedKey, setSelectedKey] = useState<string>(() => rows[0]?.key ?? "");

  // Follow &studentId= (and &draft=) whenever they change: adjust state
  // during render, React's pattern for state derived from a changing input.
  const wantId = params.get("studentId");
  const wantDraft = params.get("draft");
  const sig = wantId ? `${wantId}|${wantDraft ?? ""}` : null;
  const [handled, setHandled] = useState<string | null>(null);
  if (sig && sig !== handled) {
    setHandled(sig);
    const st = roster.find((s) => s.id === wantId);
    if (st) {
      const question = wantDraft ? undefined : QUESTIONS.filter((q) => q.name === st.name && OPEN.includes(q.status) && !replies[q.id]).sort((a, b) => b.date.localeCompare(a.date))[0];
      if (question) {
        setSelectedKey(question.id);
        setDraft("");
      } else {
        if (!threads.some((t) => t.studentId === st.id)) setPending(st);
        setSelectedKey(threadKey(st.id));
        setDraft(draftFor(wantDraft, st.name.split(" ")[0]));
      }
      setDraftKey(wantDraft);
    }
  }
  // the reply box takes focus once a link has opened a student
  useEffect(() => {
    if (!handled) return;
    const el = box.current;
    if (!el) return;
    el.focus();
    el.setSelectionRange(el.value.length, el.value.length);
  }, [handled]);

  const selected = rows.find((r) => r.key === selectedKey) ?? rows[0];

  const pick = (key: string) => {
    setSelectedKey(key);
    setDraft("");
    setDraftKey(null);
    // phones: the open question sits below the list, so bring it into view
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches) {
      panel.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const send = () => {
    if (!selected || !draft.trim()) return;
    const text = draft.trim();
    if (selected.kind === "question") {
      replyTo(selected.q.id, text);
      logTime({ activity: "Answered a question", minutes: 5, kind: "indirect", studentId: selected.student?.id });
      setLast({ key: selected.key, name: selected.name, kind: "question" });
      // move on to the next question that still owes a reply
      const next = toAnswer.find((r) => r.key !== selected.key);
      if (next) setSelectedKey(next.key);
    } else if (selected.student) {
      const id = selected.student.id;
      sendToStudent(id, selected.name, text);
      // a FAFSA reminder sent from here counts on the FAFSA tracker too
      if (draftKey === "fafsa") remindFafsa([id]);
      logTime({ activity: "Messaged a student", minutes: 3, kind: "indirect", studentId: id });
      setLast({ key: selected.key, name: selected.name, kind: "thread", studentId: id });
      setPending(null);
    }
    setDraft("");
    setDraftKey(null);
  };

  const undo = () => {
    if (!last) return;
    if (last.kind === "question") undoReply(last.key);
    else if (last.studentId) undoLastMessage(last.studentId);
    setSelectedKey(last.key);
    setLast(null);
  };

  if (!selected) return null;
  const canWrite = selected.kind === "thread" || selected.open;
  const first = selected.name.split(" ")[0];

  return (
    <div className="grid grid-cols-1 gap-[var(--space-8)] lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-[var(--space-10)]">
      <section aria-label="Student questions" className="flex min-w-0 flex-col gap-[var(--space-6)]">
        <div className="flex items-baseline justify-between gap-[var(--space-3)]">
          <h2 className="text-[22px] leading-[28px] font-semibold sm:text-[24px]" style={{ fontFamily: "var(--font-display)" }}>Questions</h2>
          <span className="text-[14px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{toAnswer.length} to answer</span>
        </div>
        {toAnswer.length > 0 ? (
          <QuestionList label="To answer" rows={toAnswer} selectedKey={selected.key} onPick={pick} />
        ) : (
          <p className="flex items-center gap-[8px] text-[15px] font-semibold v5-ok"><Check className="h-4 w-4" aria-hidden />All answered</p>
        )}
        {started.length > 0 && <QuestionList label="Your messages" rows={started} selectedKey={selected.key} onPick={pick} />}
        {answered.length > 0 && <QuestionList label="Answered" rows={answered} selectedKey={selected.key} onPick={pick} />}
      </section>

      <aside ref={panel} aria-label="Open conversation" className="flex min-w-0 scroll-mt-[var(--space-8)] flex-col gap-[var(--space-5)] lg:sticky lg:top-[100px] lg:self-start">
        <Detail row={selected} reply={selected.kind === "question" ? replies[selected.q.id]?.text : undefined} />
        {canWrite ? (
          <div className="flex flex-col gap-[var(--space-3)]">
            <label className="flex flex-col gap-[var(--space-2)]">
              <span className="text-[14px] font-semibold">{selected.kind === "question" ? "Reply" : "Message"}</span>
              <textarea ref={box} value={draft} onChange={(e) => setDraft(e.target.value)} rows={5} placeholder={`Write to ${first}`} className="w-full resize-y rounded-[var(--radius-md)] border px-[var(--space-4)] py-[var(--space-3)] text-[15px] outline-none placeholder:text-[color:var(--muted-foreground)]" style={{ borderColor: "color-mix(in srgb, var(--foreground) 30%, transparent)", background: "var(--glass-surface-1)" }} />
            </label>
            <button type="button" disabled={!draft.trim()} onClick={send} className="dm-solid inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-[8px] rounded-[var(--radius-md)] px-[var(--space-4)] text-[15px] font-semibold disabled:cursor-not-allowed disabled:opacity-50" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
              <Send className="h-4 w-4" aria-hidden /> Send
            </button>
          </div>
        ) : null}
        {last && (
          <span role="status" className="flex items-center gap-[8px] text-[14px] font-medium" style={{ color: "var(--muted-foreground)" }}>
            Sent: {last.name.split(" ")[0]}
            <button type="button" onClick={undo} className="dm-link inline-flex cursor-pointer items-center gap-[4px] font-semibold" style={{ color: "var(--accent)" }}><RotateCcw className="h-[13px] w-[13px]" aria-hidden />Undo</button>
          </span>
        )}
      </aside>
    </div>
  );
}

function QuestionList({ label, rows, selectedKey, onPick }: { label: string; rows: Row[]; selectedKey: string; onPick: (key: string) => void }) {
  return (
    <div className="flex flex-col gap-[var(--space-2)]">
      <span className={OVERLINE} style={{ color: "var(--muted-foreground)" }}>{label}</span>
      <ul className="flex flex-col border-t" style={{ borderColor: RULE }}>
        {rows.map((r) => {
          const on = r.key === selectedKey;
          const isNew = r.kind === "question" && r.open && r.q.status === "new";
          const sub = r.kind === "question" ? r.q.tag : r.messages.length ? `${r.messages.length} sent` : "New message";
          const line = r.kind === "question" ? r.q.question : r.messages[r.messages.length - 1]?.text ?? "Write your first message";
          return (
            <li key={r.key} className="border-b" style={{ borderColor: RULE }}>
              <button type="button" onClick={() => onPick(r.key)} aria-current={on ? "true" : undefined} className="dm-quiet -mx-[var(--space-2)] flex w-[calc(100%+var(--space-4))] cursor-pointer items-center gap-[var(--space-3)] rounded-[var(--radius-md)] px-[var(--space-2)] py-[12px] text-left" style={on ? { background: "color-mix(in srgb, var(--primary) 12%, transparent)" } : undefined}>
                <Face row={r} size={40} />
                <span className="flex min-w-0 flex-1 flex-col gap-[2px]">
                  <span className="flex min-w-0 items-baseline gap-[8px]">
                    <span className="max-w-[65%] flex-none truncate text-[15px] leading-[19px] font-semibold">{r.name}</span>
                    <span className="min-w-0 truncate text-[13px] font-medium" style={{ color: "var(--muted-foreground)" }}>{r.grade ? `Grade ${r.grade} · ` : ""}{sub}</span>
                  </span>
                  <span className="truncate text-[14px]" style={{ color: r.open ? "var(--foreground)" : "var(--muted-foreground)" }}>{line}</span>
                </span>
                <span className="flex flex-none flex-col items-end gap-[6px]">
                  <span className="text-[12.5px] font-medium tabular-nums" style={{ color: "var(--muted-foreground)" }}>{r.date ? fmtDate(r.date) : ""}</span>
                  {isNew ? <span className="size-[8px] rounded-full" style={{ background: "var(--primary)" }} role="img" aria-label="New" /> : <span className="size-[8px]" aria-hidden />}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Detail({ row, reply }: { row: Row; reply?: string }) {
  const key = row.kind === "question" && row.q.milestone ? MILESTONE_OF[row.q.milestone] : undefined;
  const Icon = key ? MILESTONE_ICON[key] : row.kind === "thread" ? MessageCircle : MessageSquare;
  const who = (
    <>
      <Face row={row} size={48} />
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-[20px] leading-[24px] font-semibold" style={{ fontFamily: "var(--font-display)" }}>{row.name}</span>
        {row.grade > 0 && <span className="text-[14px] font-medium" style={{ color: "var(--muted-foreground)" }}>Grade {row.grade}</span>}
      </span>
    </>
  );
  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      {row.student
        ? <Link href={studentHref(row.student.id)} className="dm-quiet flex min-w-0 items-center gap-[var(--space-3)] self-start rounded-[var(--radius-md)]">{who}</Link>
        : <div className="flex min-w-0 items-center gap-[var(--space-3)]">{who}</div>}
      {row.kind === "question" ? (
        <>
          <div className="flex flex-wrap items-center gap-x-[var(--space-3)] gap-y-[4px] text-[13.5px] font-medium" style={{ color: "var(--muted-foreground)" }}>
            <span className="flex items-center gap-[6px]"><Icon className="h-[15px] w-[15px]" aria-hidden />{row.q.tag}</span>
            <span aria-hidden>·</span>
            <span className="tabular-nums">{fmtDate(row.q.date)}</span>
            <span aria-hidden>·</span>
            <span className={row.open ? undefined : "v5-ok"}>{reply ? "Answered" : STATUS_LABEL[row.q.status] ?? row.q.status}</span>
          </div>
          <p className="text-[17px] leading-[26px]">{row.q.question}</p>
          {reply && (
            <div className="flex flex-col gap-[var(--space-1)] border-t pt-[var(--space-4)]" style={{ borderColor: RULE }}>
              <span className={OVERLINE} style={{ color: "var(--muted-foreground)" }}>Your reply</span>
              <p className="text-[15px] leading-[22px] whitespace-pre-wrap">{reply}</p>
            </div>
          )}
        </>
      ) : row.messages.length ? (
        <ul className="flex flex-col gap-[var(--space-3)] border-t pt-[var(--space-4)]" style={{ borderColor: RULE }}>
          {row.messages.map((m) => (
            <li key={m.at} className="flex flex-col gap-[2px]">
              <span className={OVERLINE} style={{ color: "var(--muted-foreground)" }}>You · {fmtDate(m.at)}</span>
              <p className="text-[15px] leading-[22px] whitespace-pre-wrap">{m.text}</p>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
