"use client";

// The drafting desk for Documents (7 Oct 2026). Chandu, on the first v5
// Documents tab: "I see letters to write and drafting when I click it but
// the drafting tools and UI we had aren't there anymore. WHY?" They are
// back, on the v4 pieces (ProductivitySuite's draft builder, DocumentDesk's
// US Letter page with letterhead and signature, print, full screen), laid
// out like the review desk: the page fills its column, every control sits
// in a sticky panel beside it so nothing needs a scroll.

import { useRef, useState, useSyncExternalStore } from "react";
import { ArrowLeft, Check, Copy, Maximize2, PenLine, Printer, Save, Send, Sparkles } from "lucide-react";
import { Dropdown, Option } from "@/components/colleges/filterKit";
import { ConfirmShimmer } from "@/components/flow/ConfirmShimmer";
import { DOC_TITLES, DocumentPage, FitPage, FullScreenDocument, plainText, printDocumentPage, type DocKind } from "@/components/counselor/v4/DocumentDesk";
import { EXAMPLE_PLACEHOLDER, LETTER_TYPES, buildDraft } from "@/components/counselor/v4/ProductivitySuite";
import { SignatureSettings } from "@/components/counselor/v4/Signature";
import { counselorAccountSnapshot, serverCounselorAccountSnapshot, subscribeCounselorAccount } from "@/lib/counselorAccount";
import { addNote } from "@/lib/counselorNotes";
import { MILESTONE_KEYS, type CounselorStudent } from "@/lib/counselorRoster";
import { StudentFace } from "./StudentFace";

const RULE = "color-mix(in srgb, var(--foreground) 10%, transparent)";
const OVERLINE = "text-[12px] leading-[16px] font-semibold tracking-[0.08em] uppercase";
const KINDS: DocKind[] = ["recommendation-letter", "student-brief", "parent-brief", "success-plan"];
const QUIET = "dm-quiet inline-flex min-h-[40px] cursor-pointer items-center justify-center gap-[8px] rounded-[var(--radius-md)] border px-[var(--space-3)] text-[14px] font-semibold";

// DEMO-ONLY: drafts live for the session in memory, so leaving the desk and
// coming back keeps the text. Production saves drafts server side.
const drafts = new Map<string, string>();

export function DraftDesk({ student, kind: initialKind, letterType: initialType = "", onBack, onSent }: {
  student: CounselorStudent;
  kind: DocKind;
  letterType?: string;
  onBack: () => void;
  /** a letter request: Mark sent closes it */
  onSent?: (words: number) => void;
}) {
  const account = useSyncExternalStore(subscribeCounselorAccount, counselorAccountSnapshot, serverCounselorAccountSnapshot);
  const [kind, setKind] = useState<DocKind>(initialKind);
  const [letterType, setLetterType] = useState(initialType);
  const key = `${student.id}:${kind}`;
  const [draft, setDraftState] = useState<string | null>(drafts.get(key) ?? null);
  const setDraft = (t: string | null) => { if (t === null) drafts.delete(key); else drafts.set(key, t); setDraftState(t); };
  const [landed, setLanded] = useState(0);
  const [full, setFull] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);
  const signer = { name: account.name, role: account.role, signatureDataUrl: account.signatureDataUrl };
  const title = `${DOC_TITLES[kind]}, ${student.name}`;
  const print = () => printDocumentPage(pageRef.current, title);
  const done = MILESTONE_KEYS.filter((k) => student.milestones[k] === "Approved" || student.milestones[k] === "Completed").length;

  const generate = () => { setSaved(false); setDraft(buildDraft(kind, student, letterType)); setLanded((n) => n + 1); };
  const writeOwn = () => {
    setSaved(false);
    const skeleton: Record<DocKind, string> = {
      "recommendation-letter": `To whom it may concern:\n\nI am writing to recommend ${student.name}${letterType ? ` for a ${letterType.toLowerCase()} opportunity` : ""}.\n\n`,
      "student-brief": "# Snapshot\n- \n# Open items\n- \n# Talking points\n- \n# Agreed next steps\n- ",
      "parent-brief": "# At a glance\n\n# Progress this year\n- \n# What is next\n- \n# How the family can help\n- ",
      "success-plan": "# Goal\n\n# Priorities\n1. \n# Check-ins\n- \n# Support\n- ",
    };
    setDraft(skeleton[kind]);
  };
  const switchKind = (k: DocKind) => { setKind(k); setDraftState(drafts.get(`${student.id}:${k}`) ?? null); setSaved(false); };
  const page = (ref?: React.Ref<HTMLDivElement>) => <DocumentPage kind={kind} student={student} letterType={letterType} signer={signer} draft={draft} onDraft={setDraft} pageRef={ref} />;

  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      <button type="button" onClick={onBack} className="dm-link inline-flex items-center gap-[6px] self-start text-[14px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
        <ArrowLeft className="h-4 w-4" aria-hidden /> Documents
      </button>
      <div className="grid grid-cols-1 gap-[var(--space-6)] lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-[var(--space-10)]">
        <section aria-label="Draft" className="flex min-w-0 flex-col gap-[var(--space-4)]">
          <div className="flex min-w-0 items-center gap-[var(--space-3)]">
            <StudentFace s={student} size={48} />
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-[20px] leading-[24px] font-semibold" style={{ fontFamily: "var(--font-display)" }}>{student.name}</span>
              <span className="text-[14px] font-medium" style={{ color: "var(--muted-foreground)" }}>{DOC_TITLES[kind]}{kind === "recommendation-letter" && letterType ? ` · ${letterType}` : ""}</span>
            </span>
          </div>
          <div className="relative overflow-hidden rounded-[var(--radius-lg)] border p-[var(--space-4)] sm:p-[var(--space-6)]" style={{ background: "color-mix(in srgb, var(--foreground) 4%, transparent)", borderColor: "var(--glass-border)" }}>
            <button type="button" onClick={() => setFull(true)} className="dm-quiet absolute top-[12px] right-[12px] z-[2] inline-flex h-9 items-center gap-[6px] rounded-full border px-[12px] text-[13px] font-semibold" style={{ background: "var(--card)", borderColor: "var(--glass-border)" }}>
              <Maximize2 className="h-[14px] w-[14px]" aria-hidden /> Full screen
            </button>
            <div className="v4-draft-shimmer relative mx-auto max-w-[816px]">
              <FitPage shadow="0 1px 2px rgba(35,51,46,0.14), 0 22px 56px -22px rgba(35,51,46,0.42)">{page(pageRef)}</FitPage>
              <ConfirmShimmer key={landed} active={landed > 0} />
            </div>
          </div>
          <FullScreenDocument open={full} onClose={() => setFull(false)} title={title} onPrint={print}>{page()}</FullScreenDocument>
        </section>

        <aside aria-label="Draft tools" className="flex min-w-0 flex-col gap-[var(--space-6)] lg:sticky lg:top-[100px] lg:self-start">
          <div className="flex flex-col items-start gap-[var(--space-2)]">
            <Dropdown quiet label="Format" value={DOC_TITLES[kind]} active={false} panel={(close) => ({
              title: "Format", description: "What you are writing.", count: KINDS.length, noun: "format", width: 300,
              children: <div className="flex flex-col p-[8px]">{KINDS.map((k) => <Option key={k} radio on={kind === k} onToggle={() => { switchKind(k); close(); }} label={DOC_TITLES[k]} />)}</div>,
            })} />
            {kind === "recommendation-letter" && (
              <Dropdown quiet label="Type" value={letterType || undefined} active={false} panel={(close) => ({
                title: "Letter type", description: "Shapes the opening line.", count: LETTER_TYPES.length, noun: "type", width: 300,
                children: <div className="flex flex-col p-[8px]">{LETTER_TYPES.map((t) => <Option key={t} radio on={letterType === t} onToggle={() => { setLetterType(t); close(); }} label={t} />)}</div>,
              })} />
            )}
          </div>
          <div className="grid grid-cols-2 gap-[var(--space-2)]">
            <button type="button" onClick={generate} className="dm-solid inline-flex min-h-[44px] items-center justify-center gap-[8px] rounded-[var(--radius-md)] px-[var(--space-3)] text-[15px] font-semibold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
              <Sparkles className="h-4 w-4" aria-hidden /> {draft !== null ? "Regenerate" : "Generate"}
            </button>
            <button type="button" onClick={writeOwn} className={QUIET} style={{ borderColor: "var(--glass-border)" }}>
              <PenLine className="h-4 w-4" aria-hidden /> Write my own
            </button>
          </div>
          {draft !== null && kind === "recommendation-letter" && draft.includes(EXAMPLE_PLACEHOLDER) && (
            <p className="-mt-[var(--space-3)] flex items-start gap-[6px] text-[13px] leading-[18px] font-semibold v5-warn"><Sparkles className="mt-[2px] h-[13px] w-[13px] flex-none" aria-hidden />Add one real example where the letter asks for it.</p>
          )}

          {/* what the draft is built from, so the facts come before the words */}
          <section aria-label="Built from" className="flex flex-col gap-[var(--space-3)] border-t pt-[var(--space-5)]" style={{ borderColor: RULE }}>
            <span className={OVERLINE} style={{ color: "var(--muted-foreground)" }}>Built from</span>
            <dl className="flex flex-col gap-[8px]">
              {[{ v: `${done} of ${student.milestoneCount}`, l: "Milestones done" }, { v: student.topMatches[0]?.title ?? "None yet", l: "Top match" }, { v: student.postsecondaryIntent === "Undecided" ? "Still exploring" : student.postsecondaryIntent, l: "Plan" }].map((f) => (
                <div key={f.l} className="flex items-baseline justify-between gap-[var(--space-3)]">
                  <dt className="flex-none text-[13.5px] font-medium" style={{ color: "var(--muted-foreground)" }}>{f.l}</dt>
                  <dd className="m-0 min-w-0 truncate text-right text-[14.5px] font-semibold">{f.v}</dd>
                </div>
              ))}
            </dl>
          </section>

          {draft !== null && (
            <section aria-label="Finish" className="flex flex-col gap-[var(--space-2)] border-t pt-[var(--space-5)]" style={{ borderColor: RULE }}>
              {onSent && kind === "recommendation-letter" && (
                <button type="button" onClick={() => onSent(plainText(draft).split(/\s+/).filter(Boolean).length)} className="dm-solid inline-flex min-h-[44px] items-center justify-center gap-[8px] rounded-[var(--radius-md)] px-[var(--space-4)] text-[15px] font-semibold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
                  <Send className="h-4 w-4" aria-hidden /> Mark sent
                </button>
              )}
              <div className="grid grid-cols-2 gap-[var(--space-2)]">
                <button type="button" onClick={print} className={QUIET} style={{ borderColor: "var(--glass-border)" }}><Printer className="h-4 w-4" aria-hidden /> Print or PDF</button>
                <button type="button" onClick={() => { void navigator.clipboard?.writeText(plainText(draft)); setCopied(true); window.setTimeout(() => setCopied(false), 1500); }} className={QUIET} style={{ borderColor: "var(--glass-border)" }}>{copied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />} {copied ? "Copied" : "Copy text"}</button>
                <button type="button" onClick={() => { addNote(student.id, `${DOC_TITLES[kind]}:\n${plainText(draft)}`); setSaved(true); }} className={`${QUIET} col-span-2`} style={{ borderColor: "var(--glass-border)" }}><Save className="h-4 w-4" aria-hidden /> {saved ? `Saved to ${student.name.split(" ")[0]}'s notes` : "Save to notes"}</button>
              </div>
            </section>
          )}
          {kind === "recommendation-letter" && <div className="border-t pt-[var(--space-5)]" style={{ borderColor: RULE }}><SignatureSettings /></div>}
        </aside>
      </div>
    </div>
  );
}
