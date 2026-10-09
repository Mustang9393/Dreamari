"use client";

// Prepare > Meetings > Needs Outreach as a session (10 Oct 2026, Chandu:
// "Meetings and messages and their subtabs ... need super engaging and
// exciting like we did for awaiting me just now"). Students Dreamari flags
// with nothing booked, neediest first, with "3 of 11 reached" sparking
// forward and Dreamy (in glasses, about 100px, a layer over the header's
// right end, out of the flow: 10 Oct 2026, "just place it large anywhere
// and let it sit as a layer over whatever") hopping on every invite. One
// Dreamy per view, so the Invite all dialog has none; the finish states
// center a larger one above their line.
//
// Two rules from the same day, set elsewhere in the dashboard and carried
// here:
// - "Content would need to be seen first." Invite never sends on one tap.
//   It opens Dreamy's draft inline on the row, in full and editable, with
//   the next office hours written in; Send sends it. "Invite all" opens a
//   review first: one note with {first}, a per-student preview you can
//   step through, and the list of who gets it (anyone can be left out),
//   then one Send. The shape follows NudgeSession's BulkReview.
// - "Dont make them disappear unless i click done." A sent row stays: the
//   "Invited" stamp lands, the note it sent shows under the name with Edit
//   and Undo, and the row only leaves when the counselor clicks Done. A
//   student booked from here stays the same way, marked Booked. The finish
//   line comes when every row is Done.
// Book and Log a walk-in stay on every row (v5's booking sheet, openLog).

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CalendarCheck, CalendarPlus, Check, ChevronLeft, ChevronRight, Pencil, RotateCcw, Send, UserRound, Users, X } from "lucide-react";
import { IconTip } from "@/components/app/IconTip";
import { SparkBar } from "@/components/flow/SparkBar";
import { LocalBurst } from "@/components/build/ui";
import { playCorrect, playFanfare, playSelect } from "@/components/play/sound";
import { cv } from "@/lib/counselorBase";
import { attentionReason, type CounselorStudent } from "@/lib/counselorRoster";
import { useOfficeHours } from "@/lib/counselorMeetings";
import { openLog } from "../v5/LogSheet";
import { StudentFace } from "../v5/StudentFace";
import { GlassesDreamy } from "./InsightCharts";
import { STATUS_COLORS } from "./chips";
import { useDialogFocus } from "./useDialogFocus";
import { fillInvite, inviteTemplate, markOutreachDone, nextOfficeHours, sendInvite, undoInvite, useInvites } from "./meetingsModel";

const studentHref = (id: string) => `${cv("students")}&studentId=${encodeURIComponent(id)}`;
const BAR_FILL = "linear-gradient(90deg, color-mix(in srgb, var(--primary) 70%, #7fd1ff), var(--primary))";
const first = (s: CounselorStudent) => s.name.split(" ")[0];

export function MeetingsOutreach({ flagged, invitedIds, bookedIds, monday, now }: {
  flagged: CounselorStudent[];
  invitedIds: Set<string>;
  bookedIds: Set<string>;
  monday: string;
  now: Date;
}) {
  const invites = useInvites();
  const officeHours = useOfficeHours();
  const when = nextOfficeHours(officeHours, now);
  const template = inviteTemplate(when);
  const [all, setAll] = useState(false);
  // the row whose draft is open, and each row's own edits
  const [composing, setComposing] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [stamped, setStamped] = useState<Record<string, number>>({});
  const [leaving, setLeaving] = useState<string | null>(null);
  const [reviewing, setReviewing] = useState(false);
  const [hop, setHop] = useState(0);
  const [finish, setFinish] = useState(0);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const reached = flagged.filter((s) => invitedIds.has(s.id) || bookedIds.has(s.id));
  const toReach = flagged.filter((s) => !invitedIds.has(s.id) && !bookedIds.has(s.id));
  // a row leaves only on the counselor's Done (this week's)
  const isDone = (id: string) => (invites[id]?.done ?? "").slice(0, 10) >= monday;
  const rows = flagged.filter((s) => !isDone(s.id));

  const celebrate = (ids: string[], allReached: boolean) => {
    setStamped((m) => ({ ...m, ...Object.fromEntries(ids.map((id) => [id, (m[id] ?? 0) + 1])) }));
    setHop((n) => n + 1);
    if (allReached) playFanfare(); else playCorrect();
  };
  const send = (s: CounselorStudent) => {
    const text = (drafts[s.id] ?? invites[s.id]?.text ?? fillInvite(template, s)).trim();
    if (!text) return;
    const wasReached = invitedIds.has(s.id) || bookedIds.has(s.id);
    sendInvite(s.id, text);
    setComposing(null);
    celebrate([s.id], !wasReached && toReach.length === 1);
  };
  const sendAll = (picked: CounselorStudent[], note: string) => {
    picked.forEach((s) => sendInvite(s.id, fillInvite(note, s)));
    setReviewing(false);
    celebrate(picked.map((s) => s.id), picked.length === toReach.length);
  };
  const done = (s: CounselorStudent) => {
    if (leaving) return;
    setLeaving(s.id);
    playSelect();
    timer.current = window.setTimeout(() => {
      markOutreachDone(s.id);
      setLeaving(null);
      if (rows.length === 1) { playFanfare(); setFinish((n) => n + 1); }
    }, 420);
  };

  // the explicit way to clear many at once: Done on every row already sent
  const sentRows = rows.filter((s) => invitedIds.has(s.id) || bookedIds.has(s.id));
  const doneAllSent = () => {
    sentRows.forEach((s) => markOutreachDone(s.id));
    if (sentRows.length === rows.length) { playFanfare(); setFinish((n) => n + 1); } else playSelect();
  };

  if (!flagged.length) {
    return (
      <div className="mtg-finish">
        <span className="mtg-finish-mascot"><GlassesDreamy size={56} pop={2.1} /></span>
        <h2 className="mtg-finish-title">Everyone has a meeting</h2>
      </div>
    );
  }

  const total = flagged.length;
  const pct = Math.round((reached.length / total) * 100);
  const shown = all ? rows : rows.slice(0, 12);

  if (!rows.length) {
    return (
      <div className="mtg-finish">
        <LocalBurst nonce={finish} />
        <span className="mtg-finish-mascot"><GlassesDreamy size={56} pop={2.1} hop={finish} /></span>
        <h2 className="mtg-finish-title">All {total} reached</h2>
        <span className="mtg-reached-faces">
          {reached.slice(0, 8).map((s) => (
            <IconTip key={s.id} label={s.name}>
              <Link href={studentHref(s.id)} aria-label={`Open ${s.name}`} className="mtg-reached-face"><StudentFace s={s} size={30} /></Link>
            </IconTip>
          ))}
          {reached.length > 8 && <small className="mtg-reached-more">+{reached.length - 8}</small>}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      <section aria-label="Outreach progress" className="mtg-session">
        <span className="mtg-mascot is-session"><GlassesDreamy size={44} pop={2.3} thinking={!!composing || reviewing} hop={hop} /></span>
        <div className="mtg-session-copy" role="status" aria-live="polite">
          <p className="mtg-session-count"><b>{reached.length} of {total}</b> reached</p>
          <SparkBar percent={pct} min={2} height={6} fill={BAR_FILL} glow="var(--primary)" memoryKey="v4-outreach-session" />
        </div>
        <span className="mtg-session-actions">
          {sentRows.length > 1 && (
            <button type="button" onClick={doneAllSent} className="prep-action is-quiet"><Check className="h-4 w-4" aria-hidden />Done with sent</button>
          )}
          {toReach.length > 1 && (
            <button type="button" onClick={() => setReviewing(true)} className="mtg-session-all prep-action is-quiet">
              <Users className="h-4 w-4" aria-hidden />Invite all
            </button>
          )}
        </span>
      </section>

      <div className="flex flex-col gap-[var(--space-3)]">
        <ul className="mtg-out-rows">
          {shown.map((s) => {
            const invited = invitedIds.has(s.id);
            const booked = bookedIds.has(s.id);
            const open = composing === s.id;
            const sentText = invites[s.id]?.text;
            return (
              <li key={s.id} className={`mtg-out-row${leaving === s.id ? " is-leaving" : ""}${invited || booked ? " is-sent" : ""}${open ? " is-open" : ""}`}>
                <Link href={studentHref(s.id)} className="mtg-out-who dm-quiet">
                  <StudentFace s={s} size={40} />
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-[15px] leading-[19px] font-semibold">{s.name}</span>
                    <span className="truncate text-[13px] font-medium" style={{ color: "var(--muted-foreground)" }}>Grade {s.grade}</span>
                  </span>
                </Link>
                <span className="mtg-out-reason">
                  {invited || booked ? (
                    <strong className="mtg-out-state">{booked ? <CalendarCheck className="h-[15px] w-[15px]" aria-hidden /> : <Check className="h-[15px] w-[15px]" aria-hidden />}{booked ? "Booked" : "Invited"}</strong>
                  ) : (
                    <strong style={{ color: STATUS_COLORS[s.status] }}>{s.status}</strong>
                  )}
                  <span>{attentionReason(s)}</span>
                </span>
                <span className="mtg-out-actions">
                  <IconTip label="Log a walk-in">
                    <button type="button" className="v4-row-action" aria-label={`Log a walk-in with ${s.name}`} onClick={() => openLog({ mode: "walkin", studentId: s.id })}><UserRound size={16} aria-hidden /></button>
                  </IconTip>
                  <IconTip label="Book a meeting">
                    <button type="button" className="v4-row-action" aria-label={`Book a meeting with ${s.name}`} onClick={() => openLog({ mode: "book", studentId: s.id })}><CalendarPlus size={16} aria-hidden /></button>
                  </IconTip>
                  {invited || booked ? (
                    <button type="button" className="mtg-log" onClick={() => done(s)} disabled={!!leaving} aria-label={`Done with ${s.name}`}><Check className="h-[15px] w-[15px]" aria-hidden />Done</button>
                  ) : (
                    <button type="button" className="mtg-invite" aria-expanded={open} onClick={() => setComposing(open ? null : s.id)} aria-label={`Invite ${s.name} to office hours`}>
                      <Send className="h-[15px] w-[15px]" aria-hidden />Invite
                    </button>
                  )}
                </span>

                {/* the sent note, under the name, with Edit and Undo */}
                {invited && sentText && !open && (
                  <p className="mtg-out-sent">
                    <span className="mtg-out-sent-text">{sentText}</span>
                    <button type="button" className="dm-link" onClick={() => { setDrafts((d) => ({ ...d, [s.id]: sentText })); setComposing(s.id); }}><Pencil className="h-[13px] w-[13px]" aria-hidden />Edit</button>
                    <button type="button" className="dm-link" onClick={() => undoInvite(s.id)}><RotateCcw className="h-[13px] w-[13px]" aria-hidden />Undo</button>
                  </p>
                )}

                {/* the draft, read before it sends */}
                {open && (
                  <div className="mtg-out-compose">
                    <label className="flex flex-col gap-[6px]">
                      <span className="sr-only">Invite to {first(s)}</span>
                      <textarea autoFocus rows={3} value={drafts[s.id] ?? fillInvite(template, s)} onChange={(e) => setDrafts((d) => ({ ...d, [s.id]: e.target.value }))} className="mtg-textarea" />
                    </label>
                    <span className="flex flex-wrap justify-end gap-[8px]">
                      <button type="button" className="prep-action is-quiet" onClick={() => setComposing(null)}>Cancel</button>
                      <button type="button" className="prep-action is-primary" disabled={!(drafts[s.id] ?? "x").trim()} onClick={() => send(s)}><Send className="h-4 w-4" aria-hidden />{invited ? "Send again" : "Send"}</button>
                    </span>
                  </div>
                )}

                {stamped[s.id] ? <span key={stamped[s.id]} className="mtg-stamp is-small is-invite is-fading" aria-hidden>Invited</span> : null}
                <LocalBurst nonce={stamped[s.id] ?? 0} />
              </li>
            );
          })}
        </ul>
        {rows.length > 12 && (
          <button type="button" onClick={() => setAll((a) => !a)} className="dm-link self-start text-[14px] font-semibold" style={{ color: "var(--primary)" }}>{all ? "Show fewer" : `Show all ${rows.length}`}</button>
        )}
      </div>
      {reviewing && <InviteAll students={toReach} template={template} onCancel={() => setReviewing(false)} onSend={sendAll} />}
    </div>
  );
}

/** Invite all, after a read: the note (editable, {first} for each name), a
 *  preview per student you can step through, and who gets it (leave anyone
 *  out). Nothing sends until Send. */
function InviteAll({ students, template, onCancel, onSend }: { students: CounselorStudent[]; template: string; onCancel: () => void; onSend: (picked: CounselorStudent[], note: string) => void }) {
  const [note, setNote] = useState(template);
  const [off, setOff] = useState<Set<string>>(() => new Set());
  const [at, setAt] = useState(0);
  const [showList, setShowList] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLTextAreaElement>(null);
  useDialogFocus(true, ref, onCancel);
  const picked = students.filter((s) => !off.has(s.id));
  const i = Math.min(at, Math.max(0, picked.length - 1));
  const s = picked[i];
  const insert = () => {
    const el = box.current;
    const from = el?.selectionStart ?? note.length;
    const to = el?.selectionEnd ?? note.length;
    setNote(note.slice(0, from) + "{first}" + note.slice(to));
  };
  const toggle = (id: string) => setOff((o) => { const n = new Set(o); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  return (
    <>
      <div className="mtg-scrim" onClick={onCancel} aria-hidden />
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby="mtg-all-title" tabIndex={-1} className="mtg-review dm-scroll">
        <IconTip label="Close" className="mtg-review-close"><button type="button" onClick={onCancel} aria-label="Close" className="dm-quiet"><X className="h-4 w-4" aria-hidden /></button></IconTip>
        <h2 id="mtg-all-title" className="mtg-review-title">Read before you send</h2>

        <label className="flex flex-col gap-[8px]">
          <span className="mtg-label">The invite</span>
          <textarea ref={box} rows={3} value={note} onChange={(e) => setNote(e.target.value)} className="mtg-textarea" />
        </label>
        <button type="button" onClick={insert} className="mtg-token dm-quiet self-start">+ First name</button>

        {s && (
          <div className="mtg-preview">
            <span className="flex items-center justify-between gap-[8px]">
              <span className="mtg-label">What {first(s)} gets</span>
              <span className="mtg-step">
                <IconTip label="Previous"><button type="button" onClick={() => setAt(Math.max(0, i - 1))} disabled={i === 0} aria-label="Previous student" className="dm-quiet"><ChevronLeft className="h-4 w-4" aria-hidden /></button></IconTip>
                <span className="tabular-nums">{i + 1}/{picked.length}</span>
                <IconTip label="Next"><button type="button" onClick={() => setAt(Math.min(picked.length - 1, i + 1))} disabled={i >= picked.length - 1} aria-label="Next student" className="dm-quiet"><ChevronRight className="h-4 w-4" aria-hidden /></button></IconTip>
              </span>
            </span>
            <span className="mtg-bubble-row"><StudentFace s={s} size={32} /><span className="mtg-bubble">{fillInvite(note, s)}</span></span>
          </div>
        )}

        <div className="flex flex-col gap-[8px]">
          <button type="button" onClick={() => setShowList((v) => !v)} aria-expanded={showList} className="mtg-who-toggle dm-quiet">
            <span className="flex -space-x-[8px]">{picked.slice(0, 5).map((p) => <span key={p.id} className="rounded-full" style={{ boxShadow: "0 0 0 2px var(--card)" }}><StudentFace s={p} size={26} /></span>)}</span>
            <span>To {picked.length}</span>
            <span className="mtg-link">{showList ? "Hide" : "See list"}</span>
          </button>
          {showList && (
            <ul className="mtg-pick-list dm-scroll">
              {students.map((p) => {
                const on = !off.has(p.id);
                return (
                  <li key={p.id}>
                    <button type="button" aria-pressed={on} onClick={() => toggle(p.id)} className="mtg-pick dm-quiet">
                      <span className="mtg-pick-box" aria-hidden>{on && <Check className="h-[13px] w-[13px]" strokeWidth={3} />}</span>
                      <StudentFace s={p} size={26} />
                      <span className="truncate font-semibold">{p.name}</span>
                      <span className="truncate" style={{ color: "var(--muted-foreground)" }}>{attentionReason(p)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <span className="flex justify-end gap-[8px]">
          <button type="button" onClick={onCancel} className="prep-action is-quiet">Cancel</button>
          <button type="button" disabled={!picked.length || !note.trim()} onClick={() => onSend(picked, note.trim())} className="prep-action is-primary"><Send className="h-4 w-4" aria-hidden />Send {picked.length}</button>
        </span>
      </div>
    </>
  );
}
