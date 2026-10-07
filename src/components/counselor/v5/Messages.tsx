"use client";

// v5 Workspace > Messages (7 Oct 2026): student questions as an inbox, laid
// out like the Reviews desk beside it. The list is on the left, questions
// that still owe a reply first; the open question and the reply box sit in a
// sticky panel on the right, so Send never needs a scroll. On phones the
// list comes first and the open question below it.
// Data is v4's QUESTIONS (the Replit's 15, verbatim). Replies live in this
// component's state only: there is no messages store yet.

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Check, MessageSquare, RotateCcw, Send } from "lucide-react";
import { QUESTIONS } from "@/components/counselor/v4/CounselorConnect";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { avatarIndexForName, type CounselorStudent, type MilestoneKey } from "@/lib/counselorRoster";
import { MILESTONE_ICON } from "./milestoneIcons";
import { StudentFace } from "./StudentFace";
import { cv } from "@/lib/counselorBase";

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
  "College List": "College List",
  "Financial Aid": "Financial Aid",
  Resume: "Resume",
  "Recommendation Letter": "Recommendation Letter",
};

type Question = (typeof QUESTIONS)[number];
type Row = { q: Question; student: CounselorStudent | null; open: boolean };

const studentHref = (id: string) => `${cv("students")}&studentId=${encodeURIComponent(id)}`;

function fmtDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** A face for a question, even when the asker is outside this role's roster. */
function Face({ row, size }: { row: Row; size: number }) {
  const s = row.student ?? { id: row.q.id, avatarIndex: avatarIndexForName(row.q.name) ?? -1 };
  return <StudentFace s={s} size={size} />;
}

export function V5Messages() {
  const roster = useReviewedRoster();
  // id -> the reply sent this session
  const [replies, setReplies] = useState<Record<string, string>>({});
  const [draft, setDraft] = useState("");
  const [last, setLast] = useState<{ id: string; name: string } | null>(null);
  const panel = useRef<HTMLElement>(null);

  const rows = useMemo<Row[]>(() => {
    const byName = new Map(roster.map((s) => [s.name, s]));
    const all = QUESTIONS.map((q) => ({ q, student: byName.get(q.name) ?? null, open: OPEN.includes(q.status) && !(q.id in replies) }));
    // unanswered first, newest first inside each group
    return all.sort((a, b) => Number(b.open) - Number(a.open) || b.q.date.localeCompare(a.q.date));
  }, [roster, replies]);
  const toAnswer = rows.filter((r) => r.open);
  const answered = rows.filter((r) => !r.open);

  const [selectedId, setSelectedId] = useState<string>(() => rows[0]?.q.id ?? "");
  const selected = rows.find((r) => r.q.id === selectedId) ?? rows[0];

  const pick = (id: string) => {
    setSelectedId(id);
    setDraft("");
    // phones: the open question sits below the list, so bring it into view
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches) {
      panel.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const send = () => {
    if (!selected || !draft.trim()) return;
    const id = selected.q.id;
    setReplies((r) => ({ ...r, [id]: draft.trim() }));
    setLast({ id, name: selected.q.name });
    setDraft("");
    // move on to the next question that still owes a reply
    const next = toAnswer.find((r) => r.q.id !== id);
    if (next) setSelectedId(next.q.id);
  };

  const undo = () => {
    if (!last) return;
    const id = last.id;
    setReplies((r) => {
      const rest = { ...r };
      delete rest[id];
      return rest;
    });
    setSelectedId(id);
    setLast(null);
  };

  if (!selected) return null;

  return (
    <div className="grid grid-cols-1 gap-[var(--space-8)] lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-[var(--space-10)]">
      <section aria-label="Student questions" className="flex min-w-0 flex-col gap-[var(--space-6)]">
        <div className="flex items-baseline justify-between gap-[var(--space-3)]">
          <h2 className="text-[22px] leading-[28px] font-semibold sm:text-[24px]" style={{ fontFamily: "var(--font-display)" }}>Questions</h2>
          <span className="text-[14px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{toAnswer.length} to answer</span>
        </div>
        {toAnswer.length > 0 ? (
          <QuestionList label="To answer" rows={toAnswer} selectedId={selected.q.id} onPick={pick} />
        ) : (
          <p className="flex items-center gap-[8px] text-[15px] font-semibold v5-ok"><Check className="h-4 w-4" aria-hidden />All answered</p>
        )}
        {answered.length > 0 && <QuestionList label="Answered" rows={answered} selectedId={selected.q.id} onPick={pick} />}
      </section>

      <aside ref={panel} aria-label="Open question" className="flex min-w-0 scroll-mt-[var(--space-8)] flex-col gap-[var(--space-5)] lg:sticky lg:top-[100px] lg:self-start">
        <Detail row={selected} reply={replies[selected.q.id]} />
        {selected.open ? (
          <div className="flex flex-col gap-[var(--space-3)]">
            <label className="flex flex-col gap-[var(--space-2)]">
              <span className="text-[14px] font-semibold">Reply</span>
              <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={5} placeholder={`Write to ${selected.q.name.split(" ")[0]}`} className="w-full resize-y rounded-[var(--radius-md)] border px-[var(--space-4)] py-[var(--space-3)] text-[15px] outline-none placeholder:text-[color:var(--muted-foreground)]" style={{ borderColor: "color-mix(in srgb, var(--foreground) 30%, transparent)", background: "var(--glass-surface-1)" }} />
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

function QuestionList({ label, rows, selectedId, onPick }: { label: string; rows: Row[]; selectedId: string; onPick: (id: string) => void }) {
  return (
    <div className="flex flex-col gap-[var(--space-2)]">
      <span className={OVERLINE} style={{ color: "var(--muted-foreground)" }}>{label}</span>
      <ul className="flex flex-col border-t" style={{ borderColor: RULE }}>
        {rows.map((r) => {
          const on = r.q.id === selectedId;
          const isNew = r.open && r.q.status === "new";
          return (
            <li key={r.q.id} className="border-b" style={{ borderColor: RULE }}>
              <button type="button" onClick={() => onPick(r.q.id)} aria-current={on ? "true" : undefined} className="dm-quiet -mx-[var(--space-2)] flex w-[calc(100%+var(--space-4))] cursor-pointer items-center gap-[var(--space-3)] rounded-[var(--radius-md)] px-[var(--space-2)] py-[12px] text-left" style={on ? { background: "color-mix(in srgb, var(--primary) 12%, transparent)" } : undefined}>
                <Face row={r} size={40} />
                <span className="flex min-w-0 flex-1 flex-col gap-[2px]">
                  <span className="flex min-w-0 items-baseline gap-[8px]">
                    <span className="max-w-[65%] flex-none truncate text-[15px] leading-[19px] font-semibold">{r.q.name}</span>
                    <span className="min-w-0 truncate text-[13px] font-medium" style={{ color: "var(--muted-foreground)" }}>Grade {r.q.grade} · {r.q.tag}</span>
                  </span>
                  <span className="truncate text-[14px]" style={{ color: r.open ? "var(--foreground)" : "var(--muted-foreground)" }}>{r.q.question}</span>
                </span>
                <span className="flex flex-none flex-col items-end gap-[6px]">
                  <span className="text-[12.5px] font-medium tabular-nums" style={{ color: "var(--muted-foreground)" }}>{fmtDate(r.q.date)}</span>
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
  const key = row.q.milestone ? MILESTONE_OF[row.q.milestone] : undefined;
  const Icon = key ? MILESTONE_ICON[key] : MessageSquare;
  const status = reply ? "Answered" : STATUS_LABEL[row.q.status] ?? row.q.status;
  const who = (
    <>
      <Face row={row} size={48} />
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-[20px] leading-[24px] font-semibold" style={{ fontFamily: "var(--font-display)" }}>{row.q.name}</span>
        <span className="text-[14px] font-medium" style={{ color: "var(--muted-foreground)" }}>Grade {row.q.grade}</span>
      </span>
    </>
  );
  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      {row.student
        ? <Link href={studentHref(row.student.id)} className="dm-quiet flex min-w-0 items-center gap-[var(--space-3)] self-start rounded-[var(--radius-md)]">{who}</Link>
        : <div className="flex min-w-0 items-center gap-[var(--space-3)]">{who}</div>}
      <div className="flex flex-wrap items-center gap-x-[var(--space-3)] gap-y-[4px] text-[13.5px] font-medium" style={{ color: "var(--muted-foreground)" }}>
        <span className="flex items-center gap-[6px]"><Icon className="h-[15px] w-[15px]" aria-hidden />{row.q.tag}</span>
        <span aria-hidden>·</span>
        <span className="tabular-nums">{fmtDate(row.q.date)}</span>
        <span aria-hidden>·</span>
        <span className={row.open ? undefined : "v5-ok"}>{status}</span>
      </div>
      <p className="text-[17px] leading-[26px]">{row.q.question}</p>
      {reply && (
        <div className="flex flex-col gap-[var(--space-1)] border-t pt-[var(--space-4)]" style={{ borderColor: RULE }}>
          <span className={OVERLINE} style={{ color: "var(--muted-foreground)" }}>Your reply</span>
          <p className="text-[15px] leading-[22px] whitespace-pre-wrap">{reply}</p>
        </div>
      )}
    </div>
  );
}
