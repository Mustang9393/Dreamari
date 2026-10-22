"use client";

// Prepare > Meetings > Needs outreach (22 Oct 2026): v4's view brought into
// v7 on Usman's review ("Add a dedicated Meetings section similar to V4,
// including Upcoming and Needs Outreach"). Students Dreamari flags who have
// nothing booked into office hours from this week on, neediest first, with
// an invite to office hours that is read before it sends.
//
// Kept from v4 (MeetingsOutreach.tsx), same store (v4/meetingsModel.ts), so
// v4 and v7 agree on who was reached: an invite opens as an editable draft
// on the row and Send sends it; Invite all is a read first, then one Send;
// a sent row stays, marked Invited with its note, Edit and Undo, until Done
// (10 Oct 2026, Chandu: "Dont make them disappear unless i click done");
// booking a student from here counts as reaching them.
//
// Changed on Usman's notes: "Needs Attention" is said once, in the header,
// and never on a row ("Remove 'Needs Attention' from every individual
// row"); no Dreamy, stamps or bursts ("Remove the Dreamy cloud to reduce
// visual stimulation"); v7's quiet rows and sheet frame.

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarPlus, Check, ChevronLeft, ChevronRight, Pencil, RotateCcw, Send, UserRound } from "lucide-react";
import { SparkBar } from "@/components/flow/SparkBar";
import { attentionRank, attentionReason, type CounselorStudent } from "@/lib/counselorRoster";
import { useOfficeHours, type Meeting } from "@/lib/counselorMeetings";
import { isoDay } from "@/lib/localRecord";
import { fillInvite, inviteTemplate, markOutreachDone, nextOfficeHours, sendInvite, undoInvite, useInvites } from "../v4/meetingsModel";
import { notify } from "../v5/LogSheet";
import { StudentFace } from "../v5/StudentFace";
import { mondayOf } from "./data";
import type { BookRequest } from "./Prepare";
import { moment, Field, FIELD_STYLE, Modal, MUTED, PrimaryButton, QuietButton, RULE, Status, studentHref } from "./ui";

const NEED: Record<string, number> = { "At Risk": 0, "Needs Attention": 1, "On Track": 2 };
const BAR_FILL = "linear-gradient(90deg, color-mix(in srgb, var(--primary) 70%, #7fd1ff), var(--primary))";
const first = (s: CounselorStudent) => s.name.split(" ")[0];
const TEXTAREA = "w-full resize-y rounded-[var(--radius-md)] border bg-transparent px-[12px] py-[10px] text-[15px] leading-[22px] outline-none placeholder:text-[color:var(--muted-foreground)] focus-visible:ring-2";

export type OutreachState = {
  flagged: CounselorStudent[];
  toReach: CounselorStudent[];
  invitedIds: Set<string>;
  bookedIds: Set<string>;
  monday: string;
};

/** Who needs outreach this week, and who was reached. Reached = invited
 *  this week, or booked by the counselor (added meetings carry "a-" ids). */
export function useOutreach(roster: CounselorStudent[], meetings: Meeting[], now: Date): OutreachState {
  const invites = useInvites();
  return useMemo(() => {
    const monday = isoDay(mondayOf(now));
    const ordered = [...roster].sort((a, b) => NEED[a.status] - NEED[b.status] || attentionRank(a, b));
    const seededBooked = new Set(meetings.filter((m) => m.day >= monday && !m.id.startsWith("a-")).map((m) => m.studentId));
    const addedBooked = new Set(meetings.filter((m) => m.day >= monday && m.id.startsWith("a-")).map((m) => m.studentId));
    const flagged = ordered.filter((s) => s.status !== "On Track" && !seededBooked.has(s.id));
    const invitedIds = new Set(flagged.filter((s) => (invites[s.id]?.at ?? "").slice(0, 10) >= monday).map((s) => s.id));
    const bookedIds = new Set(flagged.filter((s) => addedBooked.has(s.id)).map((s) => s.id));
    const toReach = flagged.filter((s) => !invitedIds.has(s.id) && !bookedIds.has(s.id));
    return { flagged, toReach, invitedIds, bookedIds, monday };
  }, [roster, meetings, now, invites]);
}

export function Outreach({ flagged, toReach, invitedIds, bookedIds, monday, now, onBook }: OutreachState & { now: Date; onBook: (r: BookRequest) => void }) {
  const invites = useInvites();
  const officeHours = useOfficeHours();
  const template = inviteTemplate(nextOfficeHours(officeHours, now));
  const [composing, setComposing] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [reviewing, setReviewing] = useState(false);

  const reached = flagged.filter((s) => invitedIds.has(s.id) || bookedIds.has(s.id));
  // a row leaves only on the counselor's Done (this week's)
  const isDone = (id: string) => (invites[id]?.done ?? "").slice(0, 10) >= monday;
  const rows = flagged.filter((s) => !isDone(s.id));
  const sentRows = rows.filter((s) => invitedIds.has(s.id) || bookedIds.has(s.id));

  const send = (s: CounselorStudent) => {
    const text = (drafts[s.id] ?? invites[s.id]?.text ?? fillInvite(template, s)).trim();
    if (!text) return;
    sendInvite(s.id, text);
    setComposing(null);
    notify(`Invited ${first(s)}`);
    moment(true);
  };
  const sendAll = (picked: CounselorStudent[], note: string) => {
    picked.forEach((s) => sendInvite(s.id, fillInvite(note, s)));
    setReviewing(false);
    notify(`Invited ${picked.length} students`);
    moment(true);
  };

  if (!flagged.length) {
    return <p className="flex items-center gap-[8px] py-[var(--space-6)] text-[16px] font-semibold"><Check className="h-4 w-4 v5-ok" aria-hidden />Everyone has a meeting</p>;
  }

  const total = flagged.length;
  const pct = Math.round((reached.length / total) * 100);

  return (
    <div className="flex flex-col gap-[var(--space-6)]">
      {/* the status, once, at the top (Usman, 22 Oct 2026) */}
      <div className="flex flex-col gap-[var(--space-3)]">
        <div className="flex flex-wrap items-center justify-between gap-x-[var(--space-4)] gap-y-[var(--space-3)]">
          <span className="flex flex-wrap items-center gap-x-[var(--space-3)] gap-y-[4px]">
            <Status status="Needs Attention" label="Needs attention" />
            <span className="text-[14px]" style={MUTED}>{total} with nothing booked</span>
          </span>
          <span className="flex flex-wrap items-center gap-[var(--space-3)]">
            <span className="text-[14px] font-semibold tabular-nums" style={MUTED}>{reached.length} of {total} reached</span>
            {sentRows.length > 1 && <QuietButton onClick={() => sentRows.forEach((s) => markOutreachDone(s.id))} icon={<Check className="h-4 w-4" aria-hidden />}>Done with sent</QuietButton>}
            {toReach.length > 1 && <QuietButton onClick={() => setReviewing(true)} icon={<Send className="h-4 w-4" aria-hidden />}>Invite all</QuietButton>}
          </span>
        </div>
        <SparkBar percent={pct} min={2} height={4} fill={BAR_FILL} glow="var(--primary)" memoryKey="v7-outreach" />
      </div>

      {!rows.length ? (
        <p className="flex items-center gap-[8px] text-[16px] font-semibold"><Check className="h-4 w-4 v5-ok" aria-hidden />All {total} reached</p>
      ) : (
        <ul className="flex flex-col border-t" style={{ borderColor: RULE }}>
          {rows.map((s) => {
            const invited = invitedIds.has(s.id);
            const booked = bookedIds.has(s.id);
            const open = composing === s.id;
            const sentText = invites[s.id]?.text;
            return (
              <li key={s.id} className="flex flex-col gap-[var(--space-3)] border-b py-[var(--space-4)]" style={{ borderColor: RULE }}>
                <div className="flex flex-wrap items-center gap-x-[var(--space-4)] gap-y-[var(--space-3)]">
                  <Link href={studentHref(s.id)} className="dm-quiet flex min-w-0 flex-1 items-center gap-[var(--space-3)] rounded-[var(--radius-md)]">
                    <StudentFace s={s} size={40} />
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-[15px] leading-[19px] font-semibold">{s.name}</span>
                      <span className="truncate text-[13.5px]" style={MUTED}>Grade {s.grade} · {attentionReason(s)}</span>
                    </span>
                  </Link>
                  <span className="flex flex-none items-center gap-[var(--space-2)] max-sm:w-full max-sm:justify-end">
                    {(invited || booked) && (
                      <span className="mr-[4px] inline-flex items-center gap-[6px] text-[13px] font-semibold v5-ok"><Check className="h-[14px] w-[14px]" aria-hidden />{booked ? "Booked" : "Invited"}</span>
                    )}
                    <QuietButton label="Log a walk-in" onClick={() => onBook({ mode: "walkin", studentId: s.id })} icon={<UserRound className="h-4 w-4" aria-hidden />} />
                    <QuietButton label="Book a meeting" onClick={() => onBook({ mode: "book", studentId: s.id })} icon={<CalendarPlus className="h-4 w-4" aria-hidden />} />
                    {invited || booked
                      ? <QuietButton onClick={() => markOutreachDone(s.id)} icon={<Check className="h-4 w-4" aria-hidden />}>Done</QuietButton>
                      : <QuietButton onClick={() => setComposing(open ? null : s.id)} icon={<Send className="h-4 w-4" aria-hidden />}>Invite</QuietButton>}
                  </span>
                </div>

                {/* the sent note, with Edit and Undo */}
                {invited && sentText && !open && (
                  <p className="flex flex-wrap items-center gap-x-[var(--space-3)] gap-y-[4px] text-[14px] leading-[20px] sm:pl-[52px]" style={MUTED}>
                    <span className="min-w-0 flex-1 basis-[280px]">“{sentText}”</span>
                    <button type="button" className="dm-link inline-flex cursor-pointer items-center gap-[4px] font-semibold" style={{ color: "var(--pc-link, var(--color-text-brand))" }} onClick={() => { setDrafts((d) => ({ ...d, [s.id]: sentText })); setComposing(s.id); }}><Pencil className="h-[13px] w-[13px]" aria-hidden />Edit</button>
                    <button type="button" className="dm-link inline-flex cursor-pointer items-center gap-[4px] font-semibold" style={{ color: "var(--pc-link, var(--color-text-brand))" }} onClick={() => undoInvite(s.id)}><RotateCcw className="h-[13px] w-[13px]" aria-hidden />Undo</button>
                  </p>
                )}

                {/* the draft, read before it sends */}
                {open && (
                  <div className="flex flex-col gap-[var(--space-3)] sm:pl-[52px]">
                    <textarea autoFocus rows={3} aria-label={`Invite to ${first(s)}`} value={drafts[s.id] ?? fillInvite(template, s)} onChange={(e) => setDrafts((d) => ({ ...d, [s.id]: e.target.value }))} className={TEXTAREA} style={FIELD_STYLE} />
                    <span className="flex flex-wrap justify-end gap-[var(--space-2)]">
                      <QuietButton onClick={() => setComposing(null)}>Cancel</QuietButton>
                      <PrimaryButton onClick={() => send(s)} icon={<Send className="h-4 w-4" aria-hidden />}>{invited ? "Send again" : "Send"}</PrimaryButton>
                    </span>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {reviewing && <InviteAll students={toReach} template={template} onClose={() => setReviewing(false)} onSend={sendAll} />}
    </div>
  );
}

/** Invite all, after a read: the note ({first} becomes each name), a preview
 *  you can step through, and who gets it. Nothing sends until Send. */
function InviteAll({ students, template, onClose, onSend }: { students: CounselorStudent[]; template: string; onClose: () => void; onSend: (picked: CounselorStudent[], note: string) => void }) {
  const [note, setNote] = useState(template);
  const [off, setOff] = useState<Set<string>>(() => new Set());
  const [at, setAt] = useState(0);
  const picked = students.filter((s) => !off.has(s.id));
  const i = Math.min(at, Math.max(0, picked.length - 1));
  const s = picked[i];
  const toggle = (id: string) => setOff((o) => { const n = new Set(o); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  return (
    <Modal title="Read before you send" onClose={onClose} footer={<PrimaryButton onClick={() => picked.length && note.trim() && onSend(picked, note.trim())} icon={<Send className="h-4 w-4" aria-hidden />}>Send to {picked.length}</PrimaryButton>}>
      <Field label="The invite">
        <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} className={TEXTAREA} style={FIELD_STYLE} />
      </Field>
      <p className="text-[13px]" style={MUTED}>{"{first}"} becomes each student&apos;s first name.</p>
      {s && (
        <div className="flex flex-col gap-[var(--space-2)]">
          <span className="flex items-center justify-between gap-[8px]">
            <span className="text-[13px] font-semibold" style={MUTED}>What {first(s)} gets</span>
            <span className="flex items-center gap-[4px] text-[13px] tabular-nums" style={MUTED}>
              <QuietButton label="Previous student" onClick={() => setAt(Math.max(0, i - 1))} icon={<ChevronLeft className="h-4 w-4" aria-hidden />} />
              {i + 1}/{picked.length}
              <QuietButton label="Next student" onClick={() => setAt(Math.min(picked.length - 1, i + 1))} icon={<ChevronRight className="h-4 w-4" aria-hidden />} />
            </span>
          </span>
          <span className="flex items-start gap-[10px]">
            <StudentFace s={s} size={32} />
            <span className="rounded-[18px] rounded-tl-[6px] px-[14px] py-[10px] text-[15px] leading-[22px]" style={{ background: "var(--glass-surface-2)" }}>{fillInvite(note, s)}</span>
          </span>
        </div>
      )}
      <ul className="flex max-h-[220px] flex-col overflow-y-auto border-t" style={{ borderColor: RULE }}>
        {students.map((p) => {
          const on = !off.has(p.id);
          return (
            <li key={p.id}>
              <label className="flex cursor-pointer items-center gap-[10px] border-b py-[8px] text-[14px]" style={{ borderColor: RULE }}>
                <input type="checkbox" checked={on} onChange={() => toggle(p.id)} className="size-[16px] accent-[var(--primary)]" />
                <StudentFace s={p} size={26} />
                <span className="truncate font-semibold">{p.name}</span>
                <span className="min-w-0 truncate" style={MUTED}>{attentionReason(p)}</span>
              </label>
            </li>
          );
        })}
      </ul>
    </Modal>
  );
}
