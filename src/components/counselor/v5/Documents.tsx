"use client";

// v5 Workspace > Documents (7 Oct 2026): the paperwork a counselor owes,
// as two short lists, soonest due first.
// - Letters to write: recommendation letter requests from counselorLetters
//   (the same store v4 and Prepare read), with Start and Mark sent, so
//   Prepare's "waiting on you" and the student page move too.
// - Write / Continue opens the drafting desk (DraftDesk.tsx): the real
//   letter page, Generate or Write my own, print, signature. New document
//   drafts a brief or plan for anyone.
// - Transcripts to send: seniors whose Transcript Submission milestone is
//   not done yet. Sent state is local to this component: there is no
//   transcript store yet.

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, FilePlus2, PenLine, RotateCcw, Send } from "lucide-react";
import { averageWords, daysLeft, letterRequests, markDrafting, markSent, reopenLetter, useLetterOverrides, type LetterRequest } from "@/lib/counselorLetters";
import { useReviewedRoster } from "@/lib/counselorReviews";
import type { CounselorStudent } from "@/lib/counselorRoster";
import { MILESTONE_ICON } from "./milestoneIcons";
import { StudentFace } from "./StudentFace";
import { cv } from "@/lib/counselorBase";
import type { DocKind } from "@/components/counselor/v4/DocumentDesk";
import { DraftDesk } from "./DraftDesk";
import { StudentSearch } from "./StudentSearch";

const RULE = "color-mix(in srgb, var(--foreground) 10%, transparent)";
const DONE = ["Approved", "Completed", "Not Applicable"];
const LetterIcon = MILESTONE_ICON["Recommendation Letter"];
const TranscriptIcon = MILESTONE_ICON["Transcript Submission"];

const studentHref = (id: string) => `${cv("students")}&studentId=${encodeURIComponent(id)}`;

function fmtDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** "8 days", "Today", "3 days late", inked by how close it is. */
function DueLine({ letter }: { letter: LetterRequest }) {
  const d = daysLeft(letter);
  const label = d < 0 ? `${-d} ${d === -1 ? "day" : "days"} late` : d === 0 ? "Today" : `${d} ${d === 1 ? "day" : "days"}`;
  const ink = d <= 7 ? "v5-risk" : d <= 14 ? "v5-warn" : undefined;
  return (
    <span className="flex flex-col items-end">
      <span className="text-[14px] font-semibold tabular-nums">{fmtDate(letter.due)}</span>
      <span className={`text-[12.5px] font-semibold tabular-nums ${ink ?? ""}`} style={ink ? undefined : { color: "var(--muted-foreground)" }}>{label}</span>
    </span>
  );
}

/** Where it goes: one name, or a count of schools. */
function whereTo(recipients: string[]): string {
  return recipients.length === 1 ? recipients[0] : `${recipients.length} schools`;
}

function Title({ children, count }: { children: React.ReactNode; count: string }) {
  return (
    <div className="flex items-baseline justify-between gap-[var(--space-3)]">
      <h2 className="text-[22px] leading-[28px] font-semibold sm:text-[24px]" style={{ fontFamily: "var(--font-display)" }}>{children}</h2>
      <span className="text-[14px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{count}</span>
    </div>
  );
}

function Who({ s, sub, icon: Icon }: { s: CounselorStudent; sub: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <Link href={studentHref(s.id)} className="dm-quiet -mx-[var(--space-2)] flex min-w-0 flex-1 items-center gap-[var(--space-3)] rounded-[var(--radius-md)] px-[var(--space-2)] py-[4px]">
      <StudentFace s={s} size={40} />
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-[15px] leading-[19px] font-semibold">{s.name}</span>
        <span className="flex min-w-0 items-center gap-[6px] text-[13px] font-medium" style={{ color: "var(--muted-foreground)" }}>
          <Icon className="h-[14px] w-[14px] flex-none" aria-hidden />
          <span className="truncate">{sub}</span>
        </span>
      </span>
    </Link>
  );
}

const PILL = "dm-quiet inline-flex h-9 flex-none cursor-pointer items-center gap-[6px] rounded-full border px-[14px] text-[13.5px] font-semibold";
const QUIET_PILL = { borderColor: "var(--glass-border)" };
const ACCENT_PILL = { borderColor: "color-mix(in srgb, var(--accent) 45%, transparent)", color: "var(--accent)" };

function Undo({ word, name, onUndo }: { word: string; name: string; onUndo: () => void }) {
  return (
    <span role="status" className="flex items-center gap-[8px] text-[14px] font-medium" style={{ color: "var(--muted-foreground)" }}>
      {word}: {name.split(" ")[0]}
      <button type="button" onClick={onUndo} className="dm-link inline-flex cursor-pointer items-center gap-[4px] font-semibold" style={{ color: "var(--accent)" }}><RotateCcw className="h-[13px] w-[13px]" aria-hidden />Undo</button>
    </span>
  );
}

function AllDone({ children }: { children: React.ReactNode }) {
  return <p className="flex items-center gap-[8px] py-[var(--space-2)] text-[15px] font-semibold v5-ok"><Check className="h-4 w-4" aria-hidden />{children}</p>;
}

export function V5Documents() {
  const roster = useReviewedRoster();
  const overrides = useLetterOverrides();
  const byId = useMemo(() => new Map(roster.map((s) => [s.id, s])), [roster]);
  const requests = useMemo(() => letterRequests(roster, overrides), [roster, overrides]);
  // letterRequests already sorts open letters by due date, sooner first
  const letters = requests.filter((r) => r.status !== "sent" && byId.has(r.studentId));
  const [lastLetter, setLastLetter] = useState<{ id: string; name: string } | null>(null);

  // DEMO-ONLY: no transcript store yet, so Send is remembered in this
  // component only and resets on reload.
  const [sentTranscripts, setSentTranscripts] = useState<string[]>([]);
  const [lastTranscript, setLastTranscript] = useState<{ id: string; name: string } | null>(null);
  const transcripts = useMemo(() => {
    const letterOf = new Map(requests.map((r) => [r.studentId, r]));
    return roster
      .filter((s) => s.grade === 12 && !DONE.includes(s.milestones["Transcript Submission"]))
      .map((s) => ({ s, letter: letterOf.get(s.id) as LetterRequest | undefined }))
      // soonest due first; seniors with no known deadline after, by name
      .sort((a, b) => (a.letter ? 0 : 1) - (b.letter ? 0 : 1) || (a.letter && b.letter ? a.letter.due.localeCompare(b.letter.due) : 0) || a.s.name.localeCompare(b.s.name));
  }, [roster, requests]);
  const openTranscripts = transcripts.filter((t) => !sentTranscripts.includes(t.s.id));

  const sendLetter = (r: LetterRequest, s: CounselorStudent, words?: number) => {
    // DEMO-ONLY: sent from the list without a draft, the letter is logged
    // at the counselor's average length.
    markSent(r.studentId, words ?? averageWords(requests));
    setLastLetter({ id: r.studentId, name: s.name });
  };
  const [desk, setDesk] = useState<{ s: CounselorStudent; kind: DocKind; letter?: LetterRequest } | null>(null);
  const [picking, setPicking] = useState(false);
  const write = (r: LetterRequest, s: CounselorStudent) => { if (r.status === "requested") markDrafting(r.studentId); setDesk({ s, kind: "recommendation-letter", letter: r }); window.scrollTo({ top: 0 }); };

  if (desk) {
    const { s, letter } = desk;
    return <DraftDesk key={`${s.id}-${desk.kind}`} student={s} kind={desk.kind} letterType={letter?.type} onBack={() => setDesk(null)} onSent={letter ? (words) => { sendLetter(letter, s, words); setDesk(null); } : undefined} />;
  }

  return (
    <div className="flex max-w-[860px] flex-col gap-[var(--space-12)]">
      <div className="-mb-[var(--space-6)] flex flex-wrap items-center gap-[var(--space-3)]">
        {picking
          ? <StudentSearch compact students={roster} onPick={(s) => { setPicking(false); setDesk({ s, kind: "student-brief" }); }} placeholder="Who is it for?" />
          : <button type="button" onClick={() => setPicking(true)} className={PILL} style={QUIET_PILL}><FilePlus2 className="h-[14px] w-[14px]" aria-hidden /> New document</button>}
      </div>
      <section aria-label="Letters to write" className="flex flex-col gap-[var(--space-3)]">
        <Title count={`${letters.length} open`}>Letters to Write</Title>
        {letters.length ? (
          <ul className="flex flex-col border-t" style={{ borderColor: RULE }}>
            {letters.map((r) => {
              const s = byId.get(r.studentId)!;
              return (
                <li key={r.studentId} className="flex flex-wrap items-center gap-x-[var(--space-4)] gap-y-[var(--space-2)] border-b py-[10px]" style={{ borderColor: RULE }}>
                  <Who s={s} icon={LetterIcon} sub={`${r.type} · ${whereTo(r.recipients)}`} />
                  <DueLine letter={r} />
                  <span className="flex w-full flex-none items-center justify-end gap-[var(--space-2)] sm:w-auto">
                    {r.status !== "requested" && <span className="px-[var(--space-2)] text-[13px] font-semibold v5-warn">Drafting</span>}
                    <button type="button" onClick={() => write(r, s)} className={PILL} style={ACCENT_PILL}><PenLine className="h-[14px] w-[14px]" aria-hidden /> {r.status === "requested" ? "Write" : "Continue"}</button>
                  </span>
                </li>
              );
            })}
          </ul>
        ) : <AllDone>All letters sent</AllDone>}
        {lastLetter && <Undo word="Sent" name={lastLetter.name} onUndo={() => { reopenLetter(lastLetter.id); setLastLetter(null); }} />}
      </section>

      <section aria-label="Transcripts to send" className="flex flex-col gap-[var(--space-3)]">
        <Title count={`${openTranscripts.length} to send`}>Transcripts to Send</Title>
        {openTranscripts.length ? (
          <ul className="flex flex-col border-t" style={{ borderColor: RULE }}>
            {openTranscripts.map(({ s, letter }) => {
              const status = s.milestones["Transcript Submission"];
              return (
                <li key={s.id} className="flex flex-wrap items-center gap-x-[var(--space-4)] gap-y-[var(--space-2)] border-b py-[10px]" style={{ borderColor: RULE }}>
                  <Who s={s} icon={TranscriptIcon} sub={letter ? whereTo(letter.recipients) : "Senior"} />
                  {letter
                    ? <DueLine letter={letter} />
                    : <span className={`text-[13px] font-semibold ${status === "Overdue" ? "v5-risk" : ""}`} style={status === "Overdue" ? undefined : { color: "var(--muted-foreground)" }}>{status}</span>}
                  <span className="flex w-full flex-none justify-end sm:w-auto">
                    <button type="button" onClick={() => { setSentTranscripts((l) => [...l, s.id]); setLastTranscript({ id: s.id, name: s.name }); }} className={PILL} style={ACCENT_PILL}><Send className="h-[14px] w-[14px]" aria-hidden /> Send</button>
                  </span>
                </li>
              );
            })}
          </ul>
        ) : <AllDone>All transcripts sent</AllDone>}
        {lastTranscript && <Undo word="Sent" name={lastTranscript.name} onUndo={() => { setSentTranscripts((l) => l.filter((id) => id !== lastTranscript.id)); setLastTranscript(null); }} />}
      </section>
    </div>
  );
}
