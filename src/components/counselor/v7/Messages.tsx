"use client";

// v7 Workspace > Messages (22 Oct 2026): the counselor's inbox, built on
// Usman's review of v7 ("Make the inbox mechanics feel closer to Instagram
// so it is immediately familiar and easy to clear"):
// - two filters, Needs response | All;
// - a conversation is one calm row: face, name, the last line, a relative
//   time (2d, 4d, 1w) and, unread, a small dot at the far right ("rather
//   than a prominent yellow element in the middle");
// - several unread messages in one conversation read "3 messages" so the
//   counselor sees what needs attention;
// - roomy rows ("more like WhatsApp rather than a compressed admin list")
//   and an open list that ends where the conversations end, not a panel
//   that fills the screen;
// - no Dreamy and no "Dreamy suggests" ("Remove the Dreamy cloud and Dreamy
//   Suggests").
// The open conversation is a chat: their lines at the left from their face,
// yours at the right in blue, the reply box under it.
//
// Replit parity (Chandu, 22 Oct 2026: "1:1 with the replit ... functionality
// wise"): a search box over the list, Attach on the composer (DEMO-ONLY: the
// file's name travels in the message, nothing uploads), and a group message
// (&to=id,id from the directory's "Message selected"): one note, sent to
// each student's own thread. The nav's Messages badge reads useUnreadCount.
//
// Data is v4's QUESTIONS (the Replit's 15, verbatim) and the shared messages
// store (src/lib/counselorMessages.ts: replies and counselor-started
// threads), so an answered question stays answered everywhere and counts on
// My Impact. &studentId= opens that student's conversation; &draft=<key>
// opens it with a ready-made message (a FAFSA reminder), as before.

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check, Paperclip, RotateCcw, Search, Send, UserRound, Users, X } from "lucide-react";
import { guardiansFor } from "../v5/family";
import { TextTabs } from "@/components/app/TextTabs";
import { IconTip } from "@/components/app/IconTip";
import { QUESTIONS } from "@/components/counselor/v4/CounselorConnect";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { avatarIndexForName, type CounselorStudent } from "@/lib/counselorRoster";
import { draftFor, replyTo, sendToStudent, STUDENT_ONLY, undoLastMessage, undoReply, useMessages, type Audience, type SentMessage } from "@/lib/counselorMessages";
import { remindFafsa } from "@/lib/counselorFafsa";
import { createLocalRecord } from "@/lib/localRecord";
import { logTime } from "@/lib/counselorTimeLog";
import { StudentFace } from "../v5/StudentFace";
import { CARD, CARD_STYLE, DISPLAY, Modal, MUTED, PrimaryButton, RULE, studentHref } from "./ui";

// DEMO-ONLY: the school staff a counselor can loop in, until staff accounts
// exist. The two teammates are the ones the counselor's profile names.
const STAFF = [
  { name: "Daniel Okafor", role: "Counselor" },
  { name: "Renee Alvarez", role: "Counselor" },
  { name: "Priya Natarajan", role: "College and career coordinator" },
  { name: "Marcus Bell", role: "Assistant principal" },
  { name: "Elena Costa", role: "School social worker" },
  { name: "Tom Whitaker", role: "Special education case manager" },
];
/** "Omar Hassan · Maria Hassan (mother) · Renee Alvarez": who gets it, in words. */
function audienceLine(a: Audience, studentName: string, guardians: { name: string; relation: string }[]): string {
  const parts: string[] = [];
  if (a.kind !== "guardians") parts.push(studentName);
  if (a.kind !== "student") parts.push(...a.guardians.map((g) => { const r = guardians.find((x) => x.name === g)?.relation; return r ? `${g} (${r.toLowerCase()})` : g; }));
  parts.push(...a.staff);
  return parts.join(" · ");
}

type Question = (typeof QUESTIONS)[number];
type Filter = "needs" | "all";
const OPEN = ["new", "viewed", "in-progress", "follow-up"];
// a question the student is still waiting on, that the counselor has not opened here
const UNREAD = ["new", "follow-up"];

// DEMO-ONLY: a few students wrote more than once, so the inbox shows "2
// messages", "3 messages", "4+ messages" the way Instagram does. Production
// reads every message of the conversation.
const FOLLOW_UPS: Record<string, string[]> = {
  q7: ["Also, is there a deadline to pick them?"],
  q13: ["My mom thinks I should.", "Can we talk about it this week?"],
  q1: ["I made a short film for a class and loved it.", "But I also like making logos and posters.", "Is there a way to try both before I pick?"],
  q2: ["The regular deadline is January 1."],
};
// DEMO-ONLY: the seed's dates are September 2026. The newest seeded day
// reads as yesterday, so the list shows 1d, 2d, 4d, 1w like a live inbox.
// Production uses each message's real timestamp (replies already do).
const SEED_TODAY = new Date("2026-09-16T14:00:00");

const seen = createLocalRecord<Record<string, true>>("dreamari-counselor-v7-messages-seen", {});
const threadKey = (studentId: string) => `t-${studentId}`;

/** Conversations with an unread student message (the nav badge). */
export function useUnreadCount(): number {
  const { replies } = useMessages();
  const seenIds = seen.useValue();
  return QUESTIONS.filter((q) => OPEN.includes(q.status) && UNREAD.includes(q.status) && !replies[q.id] && !seenIds[q.id]).length;
}

type Line = { from: "them" | "you"; text: string; at: number; audience?: Audience };
type Row = {
  key: string;
  kind: "question" | "thread";
  q?: Question;
  studentId?: string;
  name: string;
  grade: number;
  student: CounselorStudent | null;
  /** the student is still waiting on a reply */
  open: boolean;
  unread: number;
  lines: Line[];
  /** last activity, ms */
  at: number;
};

/** "now", "5m", "3h", "2d", "1w" */
function ago(ms: number, now: number): string {
  const s = Math.max(0, Math.round((now - ms) / 1000));
  if (s < 60) return "now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return `${Math.floor(d / 7)}w`;
}
/** a seeded question's time, on the demo clock (see SEED_TODAY) */
function seedTime(date: string, now: number): number {
  const d = new Date(`${date}T09:00:00`);
  return now - (SEED_TODAY.getTime() - d.getTime());
}

/** A face for a row, even when the asker is outside this role's roster. */
function Face({ row, size }: { row: Row; size: number }) {
  const idx = row.student ? row.student.avatarIndex : avatarIndexForName(row.name);
  if (!row.student && (idx === undefined || idx < 0)) {
    const initials = row.name.split(" ").map((p) => p[0]).slice(0, 2).join("");
    return <span aria-hidden className="flex flex-none items-center justify-center rounded-full font-semibold" style={{ width: size, height: size, fontSize: Math.round(size * 0.36), background: "color-mix(in srgb, var(--primary) 18%, var(--card))", color: "var(--pc-link, var(--color-text-brand))" }}>{initials}</span>;
  }
  return <StudentFace s={row.student ?? { id: row.key, avatarIndex: idx ?? -1 }} size={size} />;
}

export function V7Messages() {
  const roster = useReviewedRoster();
  const params = useSearchParams();
  const { replies, threads } = useMessages();
  const seenIds = seen.useValue();
  const [now] = useState(() => Date.now());
  const [filter, setFilter] = useState<Filter>("needs");
  const [q, setQ] = useState("");
  const [attached, setAttached] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  // a group message from the directory (&to=id,id): the ids, until sent
  const [group, setGroup] = useState<string[] | null>(null);
  // who each conversation goes to (Joshua, 22 Oct 2026); student only until changed
  const [audiences, setAudiences] = useState<Record<string, Audience>>({});
  const [choosing, setChoosing] = useState(false);
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
    const qs: Row[] = QUESTIONS.map((q) => {
      const t0 = seedTime(q.date, now);
      const extra = FOLLOW_UPS[q.id] ?? [];
      const reply = replies[q.id];
      const lines: Line[] = [{ from: "them", text: q.question, at: t0 }, ...extra.map((text, i) => ({ from: "them" as const, text, at: t0 + (i + 1) * 300000 }))];
      if (reply) lines.push({ from: "you", text: reply.text, at: new Date(reply.at).getTime(), audience: reply.audience });
      const open = OPEN.includes(q.status) && !reply;
      const unread = open && UNREAD.includes(q.status) && !seenIds[q.id] ? lines.length : 0;
      return { key: q.id, kind: "question", q, name: q.name, grade: q.grade, student: byName.get(q.name) ?? null, open, unread, lines, at: lines[lines.length - 1].at };
    });
    const ts: Row[] = threads.map((t) => {
      const st = byId.get(t.studentId) ?? null;
      const lines: Line[] = t.messages.map((m: SentMessage) => ({ from: "you", text: m.text, at: new Date(m.at).getTime(), audience: m.audience }));
      return { key: threadKey(t.studentId), kind: "thread", studentId: t.studentId, name: t.name, grade: st?.grade ?? 0, student: st, open: false, unread: 0, lines, at: lines[lines.length - 1]?.at ?? now };
    });
    if (pending && !threads.some((t) => t.studentId === pending.id)) ts.unshift({ key: threadKey(pending.id), kind: "thread", studentId: pending.id, name: pending.name, grade: pending.grade, student: pending, open: false, unread: 0, lines: [], at: now });
    // newest activity first, as an inbox reads
    return [...qs, ...ts].sort((a, b) => b.at - a.at);
  }, [roster, replies, threads, pending, seenIds, now]);

  const needs = rows.filter((r) => r.open);
  const needle = q.trim().toLowerCase();
  const shown = (filter === "needs" ? needs : rows).filter((r) => !needle || r.name.toLowerCase().includes(needle));

  const [selectedKey, setSelectedKey] = useState<string>(() => needs[0]?.key ?? rows[0]?.key ?? "");

  // Follow &studentId= (and &draft=) whenever they change: adjust state
  // during render, React's pattern for state derived from a changing input.
  const wantId = params.get("studentId");
  const wantDraft = params.get("draft");
  const wantTo = params.get("to");
  const sig = wantId ? `${wantId}|${wantDraft ?? ""}` : wantTo ? `to|${wantTo}` : null;
  const [handled, setHandled] = useState<string | null>(null);
  if (sig && sig !== handled) {
    setHandled(sig);
    if (wantTo && !wantId) {
      const ids = wantTo.split(",").filter((id) => roster.some((s) => s.id === id));
      if (ids.length) { setGroup(ids); setDraft(""); setDraftKey(null); }
    }
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
        setFilter("all");
      }
      setDraftKey(wantDraft);
    }
  }
  useEffect(() => {
    if (!handled) return;
    const el = box.current;
    if (!el) return;
    el.focus();
    el.setSelectionRange(el.value.length, el.value.length);
  }, [handled]);

  const selected = rows.find((r) => r.key === selectedKey) ?? shown[0] ?? rows[0];

  // opening a conversation reads it: the dot goes
  useEffect(() => {
    if (selected?.kind === "question" && selected.unread) seen.update((m) => ({ ...m, [selected.key]: true }));
  }, [selected]);

  const pick = (key: string) => {
    setSelectedKey(key);
    setDraft("");
    setDraftKey(null);
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches) {
      panel.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const send = () => {
    const text = attached ? `${draft.trim()}\n\nAttached: ${attached}` : draft.trim();
    if (group) {
      if (!draft.trim()) return;
      const students = group.map((id) => roster.find((s) => s.id === id)).filter((s): s is CounselorStudent => !!s);
      students.forEach((s) => sendToStudent(s.id, s.name, text));
      logTime({ activity: `Messaged ${students.length} students`, minutes: 3, kind: "indirect" });
      setLast({ key: threadKey(students[0].id), name: `${students.length} students`, kind: "thread" });
      setGroup(null);
      setFilter("all");
      setSelectedKey(threadKey(students[0].id));
      setDraft("");
      setAttached(null);
      return;
    }
    if (!selected || !draft.trim()) return;
    const audience = selected ? audiences[selected.key] : undefined;
    if (selected.kind === "question" && selected.q) {
      replyTo(selected.q.id, text, audience);
      logTime({ activity: "Answered a question", minutes: 5, kind: "indirect", studentId: selected.student?.id });
      setLast({ key: selected.key, name: selected.name, kind: "question" });
      // move on to the next one still waiting
      const next = needs.find((r) => r.key !== selected.key);
      if (next && filter === "needs") setSelectedKey(next.key);
    } else if (selected.student) {
      const id = selected.student.id;
      sendToStudent(id, selected.name, text, audience);
      if (draftKey === "fafsa") remindFafsa([id]);
      logTime({ activity: "Messaged a student", minutes: 3, kind: "indirect", studentId: id });
      setLast({ key: selected.key, name: selected.name, kind: "thread", studentId: id });
      setPending(null);
    }
    setDraft("");
    setDraftKey(null);
    setAttached(null);
  };

  const undo = () => {
    if (!last) return;
    if (last.kind === "question") undoReply(last.key);
    else if (last.studentId) undoLastMessage(last.studentId);
    setSelectedKey(last.key);
    setLast(null);
  };

  const first = selected?.name.split(" ")[0] ?? "";
  const canWrite = !!selected && (selected.kind === "thread" || selected.open);

  return (
    <div className="grid grid-cols-1 gap-[var(--space-8)] lg:grid-cols-[380px_minmax(0,1fr)] lg:gap-[var(--space-10)]">
      <section aria-label="Conversations" className="flex min-w-0 flex-col gap-[var(--space-4)]">
        <label className="relative flex items-center">
          <Search className="pointer-events-none absolute left-[12px] h-4 w-4" style={MUTED} aria-hidden />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search messages" aria-label="Search messages" className="h-10 w-full rounded-[var(--radius-md)] border bg-transparent pr-[10px] pl-[36px] text-[14px] outline-none focus-visible:ring-2" style={{ borderColor: "var(--glass-border)" }} />
        </label>
        <TextTabs layoutId="v7-inbox" ariaLabel="Inbox" value={filter} onChange={setFilter} soft caps={false}
          items={[{ key: "needs", label: needs.length ? `Needs response · ${needs.length}` : "Needs response" }, { key: "all", label: "All" }]} />
        {shown.length ? (
          <ul className="flex flex-col gap-[4px]">
            {shown.map((r) => {
              const on = selected?.key === r.key;
              const lastLine = r.lines[r.lines.length - 1];
              const line = r.unread > 1 ? `${r.unread >= 4 ? "4+" : r.unread} messages` : !lastLine ? "Write your first message" : lastLine.from === "you" ? `You: ${lastLine.text}` : lastLine.text;
              return (
                <li key={r.key}>
                  <button type="button" onClick={() => pick(r.key)} aria-current={on ? "true" : undefined}
                    className="dm-quiet flex w-full cursor-pointer items-center gap-[var(--space-4)] rounded-[var(--radius-lg)] px-[var(--space-3)] py-[14px] text-left"
                    style={on ? { background: "color-mix(in srgb, var(--primary) 12%, transparent)" } : undefined}>
                    <Face row={r} size={52} />
                    <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
                      <span className={`truncate text-[15px] leading-[20px] ${r.unread ? "font-bold" : "font-semibold"}`}>{r.name}</span>
                      <span className="flex min-w-0 items-baseline gap-[6px] text-[14px] leading-[18px]" style={{ color: r.unread ? "var(--foreground)" : "var(--muted-foreground)" }}>
                        <span className={`min-w-0 truncate ${r.unread ? "font-semibold" : ""}`}>{line}</span>
                        {r.lines.length > 0 && <span className="flex-none tabular-nums" style={MUTED}>· {ago(r.at, now)}</span>}
                      </span>
                    </span>
                    {r.unread ? <span className="size-[8px] flex-none rounded-full" style={{ background: "var(--primary)" }} role="img" aria-label="Unread" /> : <span className="size-[8px] flex-none" aria-hidden />}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="flex items-center gap-[8px] py-[var(--space-4)] text-[15px] font-semibold v5-ok"><Check className="h-4 w-4" aria-hidden />All caught up</p>
        )}
      </section>

      {group && (
        <aside aria-label="Group message" className={`flex min-h-[320px] min-w-0 flex-col gap-[var(--space-5)] self-start p-[var(--space-6)] lg:sticky lg:top-[96px] ${CARD}`} style={CARD_STYLE}>
          <div className="flex items-start justify-between gap-[var(--space-3)]">
            <div className="flex min-w-0 flex-col gap-[6px]">
              <span className="text-[20px] leading-[26px] font-extrabold" style={DISPLAY}>Message {group.length} students</span>
              <span className="flex flex-wrap items-center gap-[6px]">
                {group.map((id) => { const s = roster.find((x) => x.id === id); return s ? <span key={id} className="rounded-full" style={{ boxShadow: "0 0 0 2px var(--card)" }}><StudentFace s={s} size={26} /></span> : null; })}
                <span className="text-[13px]" style={MUTED}>{group.map((id) => roster.find((x) => x.id === id)?.name.split(" ")[0]).filter(Boolean).join(", ")}</span>
              </span>
            </div>
            <button type="button" onClick={() => setGroup(null)} aria-label="Cancel the group message" className="dm-quiet flex size-9 flex-none cursor-pointer items-center justify-center rounded-full"><X className="h-4 w-4" aria-hidden /></button>
          </div>
          <p className="text-[14px]" style={MUTED}>Each student gets it in their own thread.</p>
          <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={4} placeholder="Write one message for all of them" aria-label="Group message" className="w-full resize-y rounded-[var(--radius-md)] border bg-transparent px-[var(--space-4)] py-[var(--space-3)] text-[15px] leading-[22px] outline-none placeholder:text-[color:var(--muted-foreground)] focus-visible:ring-2" style={{ borderColor: "var(--glass-border)" }} />
          <span className="flex items-center justify-end">
            <button type="button" disabled={!draft.trim()} onClick={send} className="dm-solid inline-flex min-h-[42px] cursor-pointer items-center justify-center gap-[8px] rounded-[var(--radius-md)] px-[var(--space-5)] text-[15px] font-semibold disabled:cursor-not-allowed disabled:opacity-50" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
              <Send className="h-4 w-4" aria-hidden /> Send to {group.length}
            </button>
          </span>
        </aside>
      )}
      {selected && !group && (
        <aside ref={panel} aria-label="Open conversation" className={`flex min-h-[420px] min-w-0 scroll-mt-[var(--space-8)] flex-col self-start p-[var(--space-6)] lg:sticky lg:top-[96px] ${CARD}`} style={CARD_STYLE}>
          {/* who; and, only when the conversation goes beyond the student,
             who else is in it, as small tags under the name the way
             SchooLinks shows participants, with one quiet icon to change
             it (Chandu, 22 Oct 2026: "remove the to omar and parents info
             from messages panel. Keep that extremely intuitive and familiar
             dont overcomplicate with additional copy"; Joshua's ask was the
             audience options and knowing who receives, which the tags and
             the sheet cover) */}
          {(() => {
            const a = selected.student ? (audiences[selected.key] ?? STUDENT_ONLY) : null;
            const extra = a && (a.kind !== "student" || a.staff.length > 0);
            const gs = selected.student ? guardiansFor(selected.student) : [];
            const tags = !a || !extra ? [] : [
              ...(a.kind !== "guardians" ? [] : []),
              ...(a.kind === "guardians" ? [`${selected.name} not included`] : []),
              ...a.guardians.map((g) => { const r = gs.find((x) => x.name === g)?.relation; return r ? `${g} · ${r.toLowerCase()}` : g; }),
              ...a.staff,
            ];
            const who = (
              <>
                <Face row={selected} size={48} />
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-[20px] leading-[26px] font-extrabold" style={DISPLAY}>{selected.name}</span>
                  <span className="truncate text-[13.5px]" style={MUTED}>{[selected.grade > 0 ? `Grade ${selected.grade}` : null, selected.q?.tag].filter(Boolean).join(" · ")}</span>
                </span>
              </>
            );
            return (
              <div className="flex flex-col gap-[var(--space-3)]">
                <div className="flex items-start justify-between gap-[var(--space-3)]">
                  {selected.student
                    ? <Link href={studentHref(selected.student.id)} className="dm-quiet flex min-w-0 items-center gap-[var(--space-3)] self-start rounded-[var(--radius-md)]">{who}</Link>
                    : <div className="flex min-w-0 items-center gap-[var(--space-3)]">{who}</div>}
                  {selected.student && (
                    <IconTip label={extra ? "Change who gets this" : "Add guardians or staff"}>
                      <button type="button" onClick={() => setChoosing(true)} aria-label={extra ? "Change who gets this" : "Add guardians or staff"} className="dm-quiet flex size-9 flex-none cursor-pointer items-center justify-center rounded-full" style={{ color: extra ? "var(--pc-link, var(--color-text-brand))" : "var(--muted-foreground)" }}>
                        <Users className="h-[18px] w-[18px]" aria-hidden />
                      </button>
                    </IconTip>
                  )}
                </div>
                {tags.length > 0 && (
                  <ul className="flex flex-wrap gap-[6px]">
                    {tags.map((t) => <li key={t} className="rounded-full border px-[10px] py-[3px] text-[12.5px] font-semibold" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>{t}</li>)}
                  </ul>
                )}
              </div>
            );
          })()}

          {/* the chat */}
          <ul className="mt-[var(--space-5)] flex flex-col gap-[var(--space-2)] border-t pt-[var(--space-5)]" style={{ borderColor: RULE }}>
            {selected.lines.map((l, i) => (
              <li key={`${l.at}-${i}`} className={`flex max-w-[88%] items-end gap-[8px] ${l.from === "you" ? "self-end" : ""}`}>
                {l.from === "them" && <span className="flex-none" style={{ visibility: selected.lines[i + 1]?.from === "them" ? "hidden" : "visible" }}><Face row={selected} size={26} /></span>}
                <span className={`flex min-w-0 flex-col gap-[3px] ${l.from === "you" ? "items-end" : ""}`}>
                  <p className={`m-0 px-[14px] py-[9px] text-[15px] leading-[22px] whitespace-pre-wrap ${l.from === "you" ? "rounded-[18px] rounded-br-[6px]" : "rounded-[18px] rounded-bl-[6px]"}`}
                    style={l.from === "you" ? { background: "var(--primary)", color: "var(--primary-foreground)" } : { background: "color-mix(in srgb, var(--foreground) 9%, transparent)" }}>{l.text}</p>
                </span>
              </li>
            ))}
            {!selected.lines.length && <li className="text-[14px]" style={MUTED}>No messages yet.</li>}
          </ul>

          {canWrite && (
            <div className="mt-auto flex flex-col gap-[var(--space-3)] pt-[var(--space-5)]">
              <label className="flex flex-col">
                <span className="sr-only">Message</span>
                <textarea ref={box} value={draft} onChange={(e) => setDraft(e.target.value)} rows={3} placeholder={`Message ${first}`} onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send(); }}
                  className="w-full resize-y rounded-[var(--radius-md)] border bg-transparent px-[var(--space-4)] py-[var(--space-3)] text-[15px] leading-[22px] outline-none placeholder:text-[color:var(--muted-foreground)] focus-visible:ring-2" style={{ borderColor: "var(--glass-border)" }} />
              </label>
              <span className="flex items-center justify-between gap-[var(--space-3)]">
                <span className="flex min-w-0 items-center gap-[var(--space-3)]">
                  <input ref={fileInput} type="file" className="sr-only" aria-label="Attach a file" onChange={(e) => setAttached(e.target.files?.[0]?.name ?? null)} />
                  {attached
                    ? <span className="flex min-w-0 items-center gap-[6px] text-[13px]" style={MUTED}><Paperclip className="h-[14px] w-[14px] flex-none" aria-hidden /><span className="truncate">{attached}</span><button type="button" onClick={() => setAttached(null)} aria-label="Remove the attachment" className="dm-quiet flex size-6 cursor-pointer items-center justify-center rounded-full"><X className="h-[13px] w-[13px]" aria-hidden /></button></span>
                    : <button type="button" onClick={() => fileInput.current?.click()} className="dm-quiet inline-flex cursor-pointer items-center gap-[6px] rounded-[var(--radius-sm)] text-[13px] font-semibold" style={MUTED}><Paperclip className="h-[14px] w-[14px]" aria-hidden />Attach</button>}
                </span>
                {last ? (
                  <span role="status" className="flex items-center gap-[8px] text-[14px]" style={MUTED}>
                    Sent to {last.name.split(" ")[0]}
                    <button type="button" onClick={undo} className="dm-link inline-flex cursor-pointer items-center gap-[4px] font-semibold" style={{ color: "var(--pc-link, var(--color-text-brand))" }}><RotateCcw className="h-[13px] w-[13px]" aria-hidden />Undo</button>
                  </span>
                ) : <span />}
                <button type="button" disabled={!draft.trim()} onClick={send} className="dm-solid inline-flex min-h-[42px] cursor-pointer items-center justify-center gap-[8px] rounded-[var(--radius-md)] px-[var(--space-5)] text-[15px] font-semibold disabled:cursor-not-allowed disabled:opacity-50" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
                  <Send className="h-4 w-4" aria-hidden /> Send
                </button>
              </span>
            </div>
          )}
          {!canWrite && last && (
            <span role="status" className="mt-auto flex items-center gap-[8px] pt-[var(--space-5)] text-[14px]" style={MUTED}>
              Sent to {last.name.split(" ")[0]}
              <button type="button" onClick={undo} className="dm-link inline-flex cursor-pointer items-center gap-[4px] font-semibold" style={{ color: "var(--pc-link, var(--color-text-brand))" }}><RotateCcw className="h-[13px] w-[13px]" aria-hidden />Undo</button>
            </span>
          )}
        </aside>
      )}
      {choosing && selected?.student && (
        <AudienceSheet student={selected.student} value={audiences[selected.key] ?? STUDENT_ONLY}
          onSave={(a) => { setAudiences((m) => ({ ...m, [selected.key]: a })); setChoosing(false); }} onClose={() => setChoosing(false)} />
      )}
    </div>
  );
}

/** Who the conversation goes to: the four choices SchooLinks offers, as one
 *  list of rows with a check, then the staff to loop in (Joshua, 22 Oct 2026:
 *  "Student Only, Guardians Only, Student + Guardians, Include Other School
 *  Staff ... Keep the UI simple and explicit"). Guardians come from the
 *  student's family record; each can be left out. */
function AudienceSheet({ student, value, onSave, onClose }: { student: CounselorStudent; value: Audience; onSave: (a: Audience) => void; onClose: () => void }) {
  const guardians = useMemo(() => guardiansFor(student), [student]);
  const [kind, setKind] = useState<Audience["kind"]>(value.kind);
  const [gs, setGs] = useState<Set<string>>(() => new Set(value.kind === "student" ? guardians.map((g) => g.name) : value.guardians));
  const [staffOn, setStaffOn] = useState(value.staff.length > 0);
  const [staff, setStaff] = useState<Set<string>>(() => new Set(value.staff));
  const first = student.name.split(" ")[0];
  const toggle = (set: React.Dispatch<React.SetStateAction<Set<string>>>, id: string) => set((p) => { const n = new Set(p); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const picked: Audience = { kind, guardians: kind === "student" ? [] : guardians.filter((g) => gs.has(g.name)).map((g) => g.name), staff: staffOn ? STAFF.filter((x) => staff.has(x.name)).map((x) => x.name) : [] };
  const options: { k: Audience["kind"]; title: string; who: string; Icon: typeof UserRound }[] = [
    { k: "student", title: "Student only", who: student.name, Icon: UserRound },
    { k: "guardians", title: "Guardians only", who: guardians.map((g) => `${g.name} (${g.relation.toLowerCase()})`).join(", ") || "No guardian on file", Icon: Users },
    { k: "both", title: "Student and guardians", who: [student.name, ...guardians.map((g) => g.name)].join(", "), Icon: Users },
  ];
  return (
    <Modal overline={`Message ${first}`} title="Who gets this?" onClose={onClose} footer={<PrimaryButton onClick={() => onSave(picked)}>Use this</PrimaryButton>}>
      <ul className="flex flex-col">
        {options.map(({ k, title, who, Icon }) => {
          const on = kind === k;
          const disabled = k !== "student" && guardians.length === 0;
          return (
            <li key={k} className="border-b last:border-b-0" style={{ borderColor: RULE }}>
              <button type="button" role="radio" aria-checked={on} disabled={disabled} onClick={() => setKind(k)} className="dm-quiet flex w-full cursor-pointer items-center gap-[12px] py-[12px] text-left disabled:cursor-not-allowed disabled:opacity-50">
                <span className="flex size-[36px] flex-none items-center justify-center rounded-full border" style={{ borderColor: on ? "var(--primary)" : "var(--glass-border)", color: on ? "var(--pc-link, var(--color-text-brand))" : "var(--muted-foreground)" }}><Icon className="h-4 w-4" aria-hidden /></span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-[15px] font-semibold">{title}</span>
                  <span className="truncate text-[13px]" style={MUTED}>{who}</span>
                </span>
                {on && <Check className="h-4 w-4 flex-none" style={{ color: "var(--pc-link, var(--color-text-brand))" }} aria-hidden />}
              </button>
              {on && k !== "student" && guardians.length > 1 && (
                <ul className="flex flex-col gap-[6px] pb-[12px] pl-[48px]">
                  {guardians.map((g) => (
                    <li key={g.name}><label className="flex cursor-pointer items-center gap-[10px] text-[14px]"><input type="checkbox" checked={gs.has(g.name)} onChange={() => toggle(setGs, g.name)} className="size-[16px] accent-[var(--primary)]" />{g.name} <span style={MUTED}>· {g.relation.toLowerCase()}</span></label></li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
        <li className="border-t pt-[4px]" style={{ borderColor: RULE }}>
          <label className="dm-quiet flex w-full cursor-pointer items-center gap-[12px] py-[12px]">
            <input type="checkbox" checked={staffOn} onChange={(e) => setStaffOn(e.target.checked)} className="ml-[10px] size-[16px] flex-none accent-[var(--primary)]" />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="text-[15px] font-semibold">Include other school staff</span>
              <span className="text-[13px]" style={MUTED}>Pick colleagues who should be in this conversation</span>
            </span>
          </label>
          {staffOn && (
            <ul className="flex flex-col gap-[6px] pb-[12px] pl-[48px]">
              {STAFF.map((p) => (
                <li key={p.name}><label className="flex cursor-pointer items-center gap-[10px] text-[14px]"><input type="checkbox" checked={staff.has(p.name)} onChange={() => toggle(setStaff, p.name)} className="size-[16px] accent-[var(--primary)]" />{p.name} <span style={MUTED}>· {p.role}</span></label></li>
              ))}
            </ul>
          )}
        </li>
      </ul>
      <p className="text-[13.5px] font-semibold">Goes to: <span className="font-normal">{audienceLine(picked, student.name, guardians)}</span></p>
    </Modal>
  );
}
