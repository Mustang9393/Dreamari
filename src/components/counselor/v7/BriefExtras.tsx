"use client";

// The Replit's two additions to the meeting brief, v7 only (22 Oct 2026,
// Chandu: "Yes, port all four: the brief's actions bar ..."; and "do not
// make those left open decision updates to v4"): rendered under v5's brief
// (which Joshua asked us not to redesign on 20 Oct), so the brief itself is
// untouched and v4, v5 and v6 never see this.
//
// - Actions to complete: numbered rows from what the student has open (the
//   same flags the agenda shows) plus, for seniors, the aid and application
//   paperwork the Replit lists. Complete for this session or Review moves a
//   row into a collapsed Completed (N) group with "Completed during
//   meeting" / "Reviewed during meeting" captions. Session state, as in the
//   Replit (nothing is sent anywhere).
// - After the Conversation: a bar that stays at the foot of the screen.
//   Mark Meeting Complete closes the booked meeting in the shared store
//   (completeMeeting) and turns green; Add Meeting Note saves to the
//   student's notes; Log Meeting opens the shared log sheet; Assign Task,
//   Add School, Recommend Career and Update Plan say they started, as in
//   the Replit (DEMO-ONLY: no task, school, career or plan store yet).

import { useMemo, useState } from "react";
import { Check, ChevronDown, NotebookPen } from "lucide-react";
import { completeMeeting, isPast, useMeetingsDone } from "@/lib/counselorMeetings";
import { addNote } from "@/lib/counselorNotes";
import { logTime } from "@/lib/counselorTimeLog";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { milestonesForGrade, type CounselorStudent } from "@/lib/counselorRoster";
import { notify, openLog } from "../v5/LogSheet";
import { flagsFor, useAllMeetings } from "./data";
import { moment, CARD, CARD_STYLE, DISPLAY, Field, FIELD_STYLE, H3, Modal, MUTED, OVERLINE, PrimaryButton, QuietButton, RULE } from "./ui";

type Action = { key: string; title: string; line: string; verb: "Complete for this session" | "Review" };
type Done = { action: Action; how: "Completed" | "Reviewed" };

/** What to do about each open item, as a short line. */
function lineFor(flag: string): string {
  if (/overdue$/.test(flag)) return "Review it before the meeting.";
  if (/needs changes$/.test(flag)) return "Go over what to change together.";
  if (/to review$/.test(flag)) return "Read it before the meeting.";
  return "Pick a first step together.";
}

function actionsFor(s: CounselorStudent): Action[] {
  const out: Action[] = flagsFor(s).map((f, i) => ({ key: `flag-${i}`, title: f, line: lineFor(f), verb: /overdue|needs changes/.test(f) ? "Complete for this session" : "Review" }));
  // DEMO-ONLY: seniors' paperwork, the Replit's three rows, until the aid,
  // transcript and letter records exist
  if (s.grade === 12) {
    const aid = s.milestones["Financial Aid"];
    if (milestonesForGrade(12).includes("Financial Aid") && aid !== "Approved" && aid !== "Completed") out.push({ key: "fafsa", title: "FAFSA status", line: "Student reports not started. Review the aid timeline together.", verb: "Review" });
    out.push({ key: "transcript", title: "Transcript status", line: "Student reports requested. Confirm what each application needs.", verb: "Review" });
    out.push({ key: "letters", title: "Recommendation letters", line: "Student reports 1 of 2 received. Confirm the remaining letter.", verb: "Review" });
  }
  return out;
}

export function BriefExtras({ studentId }: { studentId: string }) {
  const roster = useReviewedRoster();
  const row = roster.find((r) => r.id === studentId);
  const meetings = useAllMeetings(roster);
  const doneStore = useMeetingsDone();
  const [done, setDone] = useState<Done[]>([]);
  const [showDone, setShowDone] = useState(false);
  const [noting, setNoting] = useState(false);
  const [started, setStarted] = useState<Set<string>>(() => new Set());
  const [completed, setCompleted] = useState(false);
  const all = useMemo(() => (row ? actionsFor(row) : []), [row]);
  if (!row) return null;
  const first = row.name.split(" ")[0];
  const open = all.filter((a) => !done.some((d) => d.action.key === a.key));
  const next = meetings.find((m) => m.studentId === row.id && !isPast(m) && !doneStore[m.id]);
  const finish = (a: Action, how: Done["how"]) => setDone((d) => [...d, { action: a, how }]);

  const markComplete = () => {
    if (completed) return;
    if (next) {
      completeMeeting(next.id, "Marked complete after the conversation");
      logTime({ activity: `${next.type} meeting`, minutes: next.minutes, kind: "direct", studentId: row.id });
    }
    setCompleted(true);
    notify("Meeting marked complete.");
    moment(true);
  };
  const start = (what: string) => {
    setStarted((s) => new Set(s).add(what));
    notify(`${what} started for ${row.name}.`);
  };

  return (
    <>
      <section aria-label="Actions to complete" className="flex flex-col gap-[var(--space-4)] pb-[120px] pt-[var(--space-8)]">
        <h2 className={H3} style={DISPLAY}>Actions to complete</h2>
        {open.length ? (
          <ol className="flex flex-col">
            {open.map((a, i) => (
              <li key={a.key} className="flex flex-wrap items-center gap-x-[var(--space-4)] gap-y-[var(--space-2)] border-b py-[12px]" style={{ borderColor: RULE }}>
                <span className="w-[26px] flex-none text-[13px] font-semibold tabular-nums" style={MUTED}>{String(i + 1).padStart(2, "0")}</span>
                <span className="flex min-w-0 flex-1 basis-[240px] flex-col">
                  <span className="text-[15px] font-semibold">{a.title}</span>
                  <span className="text-[13.5px]" style={MUTED}>{a.line}</span>
                </span>
                <QuietButton onClick={() => finish(a, a.verb === "Review" ? "Reviewed" : "Completed")} icon={<Check className="h-4 w-4" aria-hidden />}>{a.verb}</QuietButton>
              </li>
            ))}
          </ol>
        ) : <p className="text-[14px]" style={MUTED}>{done.length ? "Everything is handled for this session." : "Nothing open for this meeting."}</p>}
        {done.length > 0 && (
          <div className="flex flex-col gap-[var(--space-2)]">
            <button type="button" aria-expanded={showDone} onClick={() => setShowDone((v) => !v)} className="dm-quiet -mx-[8px] flex w-fit cursor-pointer items-center gap-[8px] rounded-[var(--radius-md)] px-[8px] py-[6px] text-[14px] font-semibold" style={MUTED}>
              {showDone ? "Hide" : "Completed"} · {done.length}<ChevronDown className={`h-4 w-4 transition-transform ${showDone ? "rotate-180" : ""}`} aria-hidden />
            </button>
            {showDone && (
              <ul className="flex flex-col">
                {done.map((d) => (
                  <li key={d.action.key} className="flex items-center gap-[var(--space-3)] border-b py-[10px] text-[14px]" style={{ borderColor: RULE }}>
                    <Check className="h-4 w-4 flex-none v5-ok" aria-hidden />
                    <span className="min-w-0 flex-1 truncate font-semibold">{d.action.title}</span>
                    <span className="flex-none text-[13px]" style={MUTED}>{d.how} during meeting</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>

      {/* the bar after the conversation, at the foot of the screen (above the phone tab bar) */}
      <div className={`sticky bottom-[88px] z-[20] flex flex-wrap items-center gap-[var(--space-2)] p-[var(--space-3)] lg:bottom-[16px] ${CARD}`} style={CARD_STYLE} role="group" aria-label="After the conversation">
        <span className={`${OVERLINE} mr-[var(--space-2)] basis-full sm:basis-auto`} style={MUTED}>After the conversation</span>
        <button type="button" onClick={markComplete} aria-pressed={completed} className="dm-solid inline-flex min-h-[40px] cursor-pointer items-center justify-center gap-[8px] rounded-[var(--radius-md)] px-[var(--space-4)] text-[14px] font-semibold" style={completed ? { background: "var(--color-feedback-success-solid)", color: "#fff" } : { background: "var(--primary)", color: "var(--primary-foreground)" }}>
          <Check className="h-4 w-4" aria-hidden />{completed ? "Meeting complete" : "Mark meeting complete"}
        </button>
        {(["Assign task", "Add school", "Recommend career", "Update plan"] as const).map((what) => (
          <button key={what} type="button" onClick={() => start(what)} aria-pressed={started.has(what)} className="dm-quiet inline-flex min-h-[40px] cursor-pointer items-center justify-center rounded-[var(--radius-md)] border px-[var(--space-4)] text-[14px] font-semibold" style={{ borderColor: started.has(what) ? "color-mix(in srgb, var(--primary) 55%, var(--glass-border))" : "var(--glass-border)", background: started.has(what) ? "color-mix(in srgb, var(--primary) 12%, transparent)" : "transparent" }}>{what}</button>
        ))}
        <QuietButton onClick={() => setNoting(true)} icon={<NotebookPen className="h-4 w-4" aria-hidden />}>Add meeting note</QuietButton>
        <QuietButton onClick={() => openLog({ mode: "walkin", studentId: row.id })}>Log meeting</QuietButton>
      </div>

      {noting && <NoteSheet name={row.name} onSave={(text) => { addNote(row.id, `Meeting note: ${text}`); notify("Internal meeting note saved to the student profile."); moment(); setNoting(false); }} onClose={() => setNoting(false)} first={first} />}
    </>
  );
}

function NoteSheet({ name, first, onSave, onClose }: { name: string; first: string; onSave: (text: string) => void; onClose: () => void }) {
  const [text, setText] = useState("");
  return (
    <Modal overline="Internal counselor note" title={`Meeting note · ${name}`} onClose={onClose} footer={<PrimaryButton onClick={() => text.trim() && onSave(text.trim())}>Save internal note</PrimaryButton>}>
      <p className="text-[14px]" style={MUTED}>Stays in {first}&apos;s counselor profile. It is not sent as a message.</p>
      <Field label="Note">
        <textarea autoFocus value={text} onChange={(e) => setText(e.target.value)} rows={4} placeholder="What you discussed, the follow-up, and the next steps" className="w-full resize-y rounded-[var(--radius-md)] border bg-transparent px-[12px] py-[10px] text-[15px] leading-[22px] outline-none placeholder:text-[color:var(--muted-foreground)] focus-visible:ring-2" style={FIELD_STYLE} />
      </Field>
    </Modal>
  );
}
