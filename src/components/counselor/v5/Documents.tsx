"use client";

// v5 Workspace > Documents (8 Oct 2026). v4's Productivity Suite stays the
// drafting desk ("for the documents section of v5, please go back to how we
// had it in v4"); above it sits the letters queue the audit found missing:
// counselorLetters.ts had requests, evidence, a letter check and Mark sent,
// but no screen used them, so "Write" in a brief led to a blank desk and
// "Letters sent" on My Impact never moved. Each requested letter is one
// hairline row (who, due when, days left); the open one shows the
// student's own evidence with Add, which drops the sentence into the
// letter, and the check against the counselor's other letters. Write opens
// the desk on that student with the letter drafted; Mark sent records it.
// A link with &studentId= lands on that student's letter.

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, ChevronDown, PenLine, Plus, RotateCcw, Send } from "lucide-react";
import { buildDraft, EXAMPLE_PLACEHOLDER, ProductivitySuite, type LetterTools } from "@/components/counselor/v4/ProductivitySuite";
import { averageWords, checkLetter, daysLeft, evidenceFor, letterRequests, markDrafting, markSent, reopenLetter, useLetterOverrides, type LetterRequest } from "@/lib/counselorLetters";
import { readDraft, saveDraft, useDrafts, draftKey, wordCount } from "@/lib/counselorDrafts";
import { useReviewedRoster } from "@/lib/counselorReviews";
import type { CounselorStudent } from "@/lib/counselorRoster";
import { shortDate } from "@/lib/localRecord";
import { logTime } from "@/lib/counselorTimeLog";
import { StudentFace } from "./StudentFace";
import { V4Embed } from "./V4Embed";
import { notify } from "./LogSheet";
import { PillSwitch } from "./Switch";

const RULE = "color-mix(in srgb, var(--foreground) 10%, transparent)";
const OVERLINE = "text-[12px] leading-[16px] font-semibold tracking-[0.08em] uppercase";
const KIND = "recommendation-letter";
const STATUS_WORD: Record<LetterRequest["status"], string> = { requested: "Requested", drafting: "Drafting", sent: "Sent" };

function dueLine(r: LetterRequest): { text: string; cls?: string } {
  const d = daysLeft(r);
  if (d < 0) return { text: `${-d} ${d === -1 ? "day" : "days"} late`, cls: "v5-risk" };
  if (d === 0) return { text: "Due today", cls: "v5-warn" };
  return { text: `${d} ${d === 1 ? "day" : "days"} left`, cls: d <= 7 ? "v5-warn" : undefined };
}

/** Make sure a letter draft exists for this request, then mark it drafting. */
function startLetter(r: LetterRequest, s: CounselorStudent): void {
  if (!readDraft(s.id, KIND)) saveDraft({ studentId: s.id, kind: KIND, letterType: r.type, text: buildDraft(KIND, s, r.type) });
  markDrafting(s.id);
}

export function V5Documents() {
  const roster = useReviewedRoster();
  const overrides = useLetterOverrides();
  const drafts = useDrafts();
  const params = useSearchParams();
  const requests = useMemo(() => letterRequests(roster, overrides), [roster, overrides]);
  const byId = useMemo(() => new Map(roster.map((s) => [s.id, s])), [roster]);
  const open = requests.filter((r) => r.status !== "sent");
  const sent = requests.filter((r) => r.status === "sent");
  const avg = averageWords(requests);
  const desk = useRef<HTMLDivElement>(null);
  const [focus, setFocus] = useState<string | null>(null);
  const [suite, setSuite] = useState<{ n: number; pre?: { studentId: string; letterType?: string } }>({ n: 0 });
  const [showSent, setShowSent] = useState(false);
  const [last, setLast] = useState<{ id: string; name: string } | null>(null);
  // the workspace first, requests a step away (8 Oct 2026, Chandu: "revert
  // the documents part to the workspace thing in v4... the workspace should
  // be front and centre and the counselor should be able to see requests as
  // a second step")
  // one switch, not two rows (8 Oct 2026: "we don't need two rows for this"):
  // the workspace's own Documents / Needs Attention and the requests
  const [view, setView] = useState<"documents" | "attention" | "requests">("documents");
  const needCount = Math.min(10, roster.filter((x) => x.status !== "On Track").length);

  // &studentId= (waiting.ts's Write) lands on that student's letter: adjust
  // state during render when the param changes, write the draft after.
  const wantId = params.get("studentId");
  const [handled, setHandled] = useState<string | null>(null);
  if (wantId && wantId !== handled) {
    setHandled(wantId);
    const r = requests.find((x) => x.studentId === wantId);
    setFocus(wantId);
    if (r) setSuite((p) => ({ n: p.n + 1, pre: { studentId: wantId, letterType: r.type } }));
  }
  useEffect(() => {
    if (!handled) return;
    const r = letterRequests(roster).find((x) => x.studentId === handled);
    const s = roster.find((x) => x.id === handled);
    if (r && s && r.status !== "sent") startLetter(r, s);
  }, [handled, roster]);

  const write = (r: LetterRequest) => {
    const s = byId.get(r.studentId);
    if (!s) return;
    startLetter(r, s);
    setFocus(r.studentId);
    setSuite((p) => ({ n: p.n + 1, pre: { studentId: r.studentId, letterType: r.type } }));
    setView("documents");
    window.requestAnimationFrame(() => desk.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const send = (s: CounselorStudent, words: number) => {
    markSent(s.id, words);
    // writing a letter is work for a student (indirect, ASCA)
    logTime({ activity: "Wrote a recommendation letter", minutes: 20, kind: "indirect", studentId: s.id });
    setLast({ id: s.id, name: s.name.split(" ")[0] });
    notify(`Letter for ${s.name.split(" ")[0]} marked sent`);
  };
  const sendRow = (r: LetterRequest) => {
    const s = byId.get(r.studentId);
    if (!s) return;
    const text = drafts[draftKey(s.id, KIND)]?.text;
    send(s, text ? wordCount(text) : avg);
  };

  const addEvidence = (s: CounselorStudent, r: LetterRequest, sentence: string) => {
    const cur = readDraft(s.id, KIND)?.text ?? buildDraft(KIND, s, r.type);
    if (cur.includes(sentence)) { notify("Already in the letter"); return; }
    let next: string;
    if (cur.includes(EXAMPLE_PLACEHOLDER)) next = cur.replace(EXAMPLE_PLACEHOLDER, sentence);
    else {
      // before the closing paragraph
      const parts = cur.split("\n\n");
      parts.splice(Math.max(1, parts.length - 1), 0, sentence);
      next = parts.join("\n\n");
    }
    saveDraft({ studentId: s.id, kind: KIND, letterType: readDraft(s.id, KIND)?.letterType ?? r.type, text: next });
    if (r.status === "requested") markDrafting(s.id);
    notify(`Added to ${s.name.split(" ")[0]}'s letter`);
  };

  const tools: LetterTools = {
    status: (id) => {
      const r = requests.find((x) => x.studentId === id);
      return r ? (r.status === "sent" ? "sent" : "open") : undefined;
    },
    markSent: send,
  };

  const row = (r: LetterRequest) => {
    const s = byId.get(r.studentId);
    if (!s) return null;
    const on = focus === r.studentId;
    const due = dueLine(r);
    const draft = drafts[draftKey(s.id, KIND)]?.text;
    return (
      <li key={r.studentId} className="border-b" style={{ borderColor: RULE }}>
        <div className="flex flex-wrap items-center gap-x-[var(--space-3)] gap-y-[var(--space-2)] py-[10px]">
          <button type="button" onClick={() => setFocus(on ? null : r.studentId)} aria-expanded={on} className="dm-quiet group -mx-[var(--space-2)] flex min-w-0 flex-1 cursor-pointer items-center gap-[var(--space-3)] rounded-[var(--radius-md)] px-[var(--space-2)] py-[4px] text-left" style={on ? { background: "color-mix(in srgb, var(--primary) 12%, transparent)" } : undefined}>
            <StudentFace s={s} size={40} />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-[15px] leading-[19px] font-semibold">{s.name}</span>
              <span className="truncate text-[13px] font-medium" style={{ color: "var(--muted-foreground)" }}>{r.type} · {r.recipients.length === 1 ? r.recipients[0] : `${r.recipients.length} places`}</span>
            </span>
            <span className="flex flex-none flex-col items-end">
              <span className="text-[13.5px] font-semibold tabular-nums">Due {shortDate(r.due)}</span>
              {r.status === "sent" ? <span className="text-[12.5px] font-semibold v5-ok">Sent</span> : <span className={`text-[12.5px] font-semibold tabular-nums ${due.cls ?? ""}`} style={due.cls ? undefined : { color: "var(--muted-foreground)" }}>{due.text}</span>}
            </span>
            <ChevronDown className="h-4 w-4 flex-none transition-transform" style={{ color: "var(--muted-foreground)", transform: on ? "rotate(180deg)" : undefined }} aria-hidden />
          </button>
          {r.status === "sent" ? (
            <button type="button" onClick={() => reopenLetter(r.studentId)} className="dm-link flex-none text-[13.5px] font-semibold" style={{ color: "var(--accent)" }}>Reopen</button>
          ) : (
            <span className="flex flex-none items-center gap-[var(--space-2)]">
              <span className="hidden w-[64px] text-[12.5px] font-semibold sm:block" style={{ color: "var(--muted-foreground)" }}>{STATUS_WORD[r.status]}</span>
              <button type="button" onClick={() => write(r)} className="dm-quiet inline-flex h-9 cursor-pointer items-center gap-[6px] rounded-full border px-[14px] text-[13.5px] font-semibold" style={{ borderColor: "color-mix(in srgb, var(--accent) 45%, transparent)", color: "var(--accent)" }}>
                <PenLine className="h-[14px] w-[14px]" aria-hidden /> Write
              </button>
              <button type="button" onClick={() => sendRow(r)} className="dm-quiet inline-flex h-9 cursor-pointer items-center gap-[6px] rounded-full border px-[14px] text-[13.5px] font-semibold" style={{ borderColor: "var(--glass-border)" }}>
                <Send className="h-[14px] w-[14px]" aria-hidden /> Mark sent
              </button>
            </span>
          )}
        </div>
        {on && <Evidence s={s} r={r} draft={draft} avg={avg} onAdd={(sentence) => addEvidence(s, r, sentence)} />}
      </li>
    );
  };

  return (
    <div className="flex flex-col gap-[var(--space-6)]">
      {/* the page view switch, level 3: the same pill as Explore's pathway
         switch and Engagement's year (9 Oct 2026) */}
      <PillSwitch label="Documents" value={view} onChange={setView} items={[{ key: "documents", label: "Documents" }, { key: "attention", label: "Needs attention", count: needCount }, { key: "requests", label: "Letter requests", count: open.length }]} />

      {view === "requests" && (
      <section aria-label="Letter requests" className="flex flex-col gap-[var(--space-4)]">
        {last && (
          <span role="status" className="flex items-center gap-[8px] text-[14px] font-medium" style={{ color: "var(--muted-foreground)" }}>
            <Check className="h-4 w-4 v5-ok" aria-hidden /> Sent: {last.name}
            <button type="button" onClick={() => { reopenLetter(last.id); setLast(null); }} className="dm-link inline-flex cursor-pointer items-center gap-[4px] font-semibold" style={{ color: "var(--accent)" }}><RotateCcw className="h-[13px] w-[13px]" aria-hidden />Undo</button>
          </span>
        )}
        {open.length ? (
          <ul className="flex flex-col border-t" style={{ borderColor: RULE }}>{open.map(row)}</ul>
        ) : (
          <p className="flex items-center gap-[8px] text-[15px] font-semibold v5-ok"><Check className="h-4 w-4" aria-hidden />Every letter is sent</p>
        )}
        {sent.length > 0 && (
          <>
            <button type="button" onClick={() => setShowSent((v) => !v)} aria-expanded={showSent} className="dm-link self-start text-[14px] font-semibold" style={{ color: "var(--accent)" }}>{showSent ? "Hide sent" : `Sent (${sent.length})`}</button>
            {showSent && <ul className="flex flex-col border-t" style={{ borderColor: RULE, opacity: 0.8 }}>{sent.map(row)}</ul>}
          </>
        )}
      </section>
      )}

      {view !== "requests" && (
        <div ref={desk} className="scroll-mt-[100px]">
          <V4Embed><ProductivitySuite key={suite.n} preselect={suite.pre} letterTools={tools} mode={view} /></V4Embed>
        </div>
      )}
    </div>
  );
}

/** What the letter can say, from the student's own record, and the check. */
function Evidence({ s, r, draft, avg, onAdd }: { s: CounselorStudent; r: LetterRequest; draft?: string; avg: number; onAdd: (sentence: string) => void }) {
  const ev = useMemo(() => evidenceFor(s), [s]);
  const check = draft ? checkLetter(draft, ev, avg) : null;
  return (
    <div className="flex flex-col gap-[var(--space-3)] pb-[var(--space-4)] pl-[52px]">
      <span className="text-[13px] font-medium" style={{ color: "var(--muted-foreground)" }}>To {r.recipients.join(", ")} · asked {shortDate(r.requestedOn)}</span>
      {check && <span className={`text-[13.5px] font-semibold ${check.ok ? "v5-ok" : "v5-warn"}`}>{check.verdict} · {check.words} words</span>}
      <span className={OVERLINE} style={{ color: "var(--muted-foreground)" }}>Evidence</span>
      {ev.length ? (
        <ul className="flex flex-col">
          {ev.map((e) => {
            const used = !!draft && draft.includes(e.sentence);
            return (
              <li key={e.id} className="flex items-start gap-[var(--space-3)] border-b py-[8px] last:border-b-0" style={{ borderColor: RULE }}>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-[14.5px] font-semibold">{e.label} <span className="font-medium" style={{ color: "var(--muted-foreground)" }}>· {e.source}</span></span>
                  <span className="text-[13.5px]" style={{ color: "var(--muted-foreground)" }}>{e.detail}</span>
                  {e.reflection && <span className="text-[13.5px] italic">“{e.reflection}”</span>}
                </span>
                {used
                  ? <span className="flex flex-none items-center gap-[4px] pt-[2px] text-[13px] font-semibold v5-ok"><Check className="h-[14px] w-[14px]" aria-hidden />In letter</span>
                  : <button type="button" onClick={() => onAdd(e.sentence)} className="dm-link inline-flex flex-none items-center gap-[4px] pt-[2px] text-[13.5px] font-semibold" style={{ color: "var(--accent)" }}><Plus className="h-[14px] w-[14px]" aria-hidden />Add</button>}
              </li>
            );
          })}
        </ul>
      ) : <p className="text-[14px]" style={{ color: "var(--muted-foreground)" }}>Nothing on file yet.</p>}
    </div>
  );
}
