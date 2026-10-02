"use client";

// DEMO-ONLY v2 fork of ../ProductivitySuite.tsx (24 Sept 2026). v1 stays untouched so the
// two builds can be compared live via the bottom-center version chip
// (../version.tsx). Changes from the 24 Sept audit land here.

// 25 Sept 2026 pass under the v2 budget: the five tools are a row of tabs
// (the side list spent a 300px column on five names, the same problem
// Student Progress had), the "you are always in control" banner and the
// repeated helper paragraph are one muted line under the button, the
// pickers are the app's Listbox and the student picker lists the whole
// roster. Draft copy is the reference's.
//
// 25 Sept 2026, later the same day: redesigned again (direct feedback,
// "the Productivity Suite is the worst UI right now, lots of long copy,
// not looking like a proper workspace tool"). Two things made it read as
// a stray form instead of a tool: the full-sentence description under
// every tool's name ("Generate a personalized recommendation letter
// using each student's career report, resume, assessments, reflections,
// milestones, activities, and counselor notes.") -- cut; the icon and the
// short sub-label already say what the tool is for -- and a horizontal
// row of full tool names as the only way to switch tools, which reads as
// a stack of buttons rather than a workspace. The draft pane is now
// always present once a tool is a draft tool, even before Generate is
// pressed -- a dashed empty state fills the space a blank card used to
// leave, so the workspace never looks unfinished mid-task.
//
// 26 Sept 2026, redesigned a third time (direct feedback: "can we show
// the preview like we did in resume for the productivity suite stuff...
// im not sure the side menu for tools is the best approach here"). The
// desktop left rail is gone -- it spent 228px on five names and still
// left the draft in a plain dark textarea that read as a form field, not
// a document. The chip row (previously mobile-only) is now the one
// switcher at every width, and the freed space goes to the draft.
// "Camera tracking," per the resume builder, means the live preview pans
// to what the counselor is doing -- there's one draft, not fielded
// sections to pan between, so the equivalent here is the page scrolling
// itself into view and flashing once when a new draft lands, instead of
// silently repainting off-screen.
//
// 26 Sept 2026, same day, a fourth pass on the preview itself (direct
// feedback: "resume builder has actual proper fonts, better designed
// template by default... the current preview doesnt read as editable but
// it is inline"; then: "Use actual letter formats and design for the
// previews... based on context and relevance"). Honest read on the third
// pass: it put every tool on the SAME generic serif page, which is a
// letter's shape, not a brief's or a plan's, and gave no visual signal
// that the page was live text, not print. Fixed both per document type:
// - Recommendation Letter gets a real letterhead (school, date,
//   right-aligned) and a real close (a cursive auto-signature in Dancing
//   Script, not typed characters, then the counselor's typed name and
//   role) as STATIC chrome; only the body paragraph is the editable
//   textarea, so the letter reads like a letter, not a form.
// - The three briefs/plans get a memo header (title, student, date) --
//   not a letter's date-and-salutation shape, since they aren't letters.
// - The editable region itself now says so: a small pencil + "Click to
//   edit" mark at rest, and a visible (if quiet) dashed rule around the
//   text, gone once it has focus -- flat print has neither.
// v3, 29 Sept 2026 (counselor platform research): this is v2's document
// hub (four templates on a real US Letter page) with three additions for
// the recommendation letter, the one document every senior needs:
// - Letter requests, a third mode: who asked, for where, due when, and
//   whether it is sent, soonest first. Status reads the roster's own
//   "Recommendation Letter" milestone (src/lib/counselorLetters.ts).
// - Evidence beside the draft: the student's brag sheet, resume and what
//   they did on Dreamari, each insertable as a sentence, and the draft
//   itself now opens with the two most specific ones instead of a gap.
//   AI drafts alone are standard now (SchooLinks, Naviance); a letter that
//   says something only this student did is not.
// - A letter check: length against the counselor's own average, how many
//   specifics it uses, and general praise to swap out. A 2025 study found
//   counselors write shorter letters for students of color; comparing
//   every letter with the counselor's own others is how no student gets
//   the short version by accident.
// Deep links (?doc=&student=, ?tool=letters) let Today and Meetings open a
// document already drafted.
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Sparkles, Check, Printer, Send, Plus, FileSignature } from "lucide-react";
import { averageWords, checkLetter, daysLeft, evidenceFor, letterRequests, markDrafting, markSent, reopenLetter, useLetterOverrides, type Evidence, type LetterRequest } from "@/lib/counselorLetters";
import { logTime } from "@/lib/counselorTimeLog";
import { shortDate } from "@/lib/localRecord";
import { SurfaceState } from "@/components/app/SurfaceState";
import { IconTip, Tip } from "@/components/app/IconTip";
import { ShowAll } from "./Disclosure";
import { Listbox } from "@/components/app/Listbox";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { useRouter, useSearchParams } from "next/navigation";
import { Copy, Save, PenLine } from "lucide-react";
import { MILESTONE_KEYS, type CounselorStudent } from "@/lib/counselorRoster";
import { addNote } from "@/lib/counselorNotes";
import { Avatar } from "../chips";
import { GLASS_INSET } from "../surfaces";
import { GLASS_CARD as TINTED_CARD } from "../surfaces";
import { Segmented, SegmentedRing } from "@/components/connect/viz";
import { NEUTRAL_SLICE, PRIMARY } from "../palette";
import { DOC_TITLES, DocumentPage, plainText, FitPage, FullScreenButton, FullScreenDocument, printDocumentPage, type DocKind } from "./DocumentDesk";
import { counselorAccountSnapshot, serverCounselorAccountSnapshot, subscribeCounselorAccount } from "@/lib/counselorAccount";


type ToolId = "recommendation-letter" | "student-brief" | "parent-brief" | "success-plan" | "attention" | "group-message";


const LETTER_TYPES = ["College Application", "Scholarship", "Internship", "Employment"];

// The one thing the letter genuinely can't write for the counselor. Kept
// as one constant so the placeholder generated into the draft and the
// evidence insert that fills it never drift apart.
const EXAMPLE_PLACEHOLDER = "[Add one specific example.]";

// Drafts are built from the student's own roster data (milestones,
// matches, plan), not a canned paragraph, so two students never get the
// same letter. A backend replaces this with a model call; the shape (a
// text the counselor edits, copies, downloads or saves to notes) stays.
function buildDraft(toolId: ToolId, student: CounselorStudent | undefined, extra: string, evidence: Evidence[] = []): string {
  const name = student?.name ?? "your student";
  const first = name.split(" ")[0];
  const top = student?.topMatches[0]?.title ?? "their chosen pathway";
  const approved = student ? MILESTONE_KEYS.filter((k) => student.milestones[k] === "Approved" || student.milestones[k] === "Completed") : [];
  const open = student ? MILESTONE_KEYS.filter((k) => ["Not Started", "Overdue", "Changes Requested", "In Progress", "Pending Review"].includes(student.milestones[k])).slice(0, 3) : [];
  const e = student?.engagement;
  const plan = student?.postsecondaryIntent === "Undecided" || !student ? "a postsecondary plan" : student.postsecondaryIntent;
  const statusOf = (k: string) => (student ? student.milestones[k as keyof typeof student.milestones] : "");
  // Drafts are written in a light markup the page renders (DocumentDesk's
  // RichText): "# " a section heading, "- " a bullet, "1. " a numbered
  // step, **bold**. Briefs and plans are working documents, so they get
  // headings, bold labels and bullets (direct feedback, 26 Sept 2026:
  // "the meeting briefs can use proper hierarchy, bullet points, bolding
  // etc and look more professional"). The letter stays plain paragraphs,
  // the convention for a recommendation letter, but is built as a real
  // one: introduction, record, interests, a specific example, a close.
  switch (toolId) {
    case "recommendation-letter":
      return [
        `To the ${extra === "Employment" || extra === "Internship" ? "Hiring Manager" : "Admissions Committee"}:`,
        "",
        `As ${first}'s school counselor at Lincoln High School, it is my privilege to recommend ${name} for ${extra ? `this ${extra.toLowerCase()} opportunity` : "this opportunity"}.`,
        "",
        `${first} is a Grade ${student?.grade ?? ""} student on our ${student?.careerTrack ?? "career"} pathway. This year ${first} has completed ${approved.length} of ${student?.milestoneCount ?? 11} required college and career milestones${approved.length ? `, including the ${approved.slice(0, 2).join(" and the ")}` : ""}, and is working toward ${plan}.`,
        "",
        `${first}'s interests are well considered. Through our career exploration program, ${first} has explored ${e?.careersSaved ?? 0} careers and ${e?.collegesSaved ?? 0} colleges and completed ${e?.simulations ?? 0} career simulations, with ${top} emerging as a clear direction.`,
        "",
        // v3: the two most specific things this student did, from their
        // own brag sheet or resume, where v2 left a gap to fill.
        (() => {
          const own = evidence.filter((x) => x.source !== "Dreamari").slice(0, 2);
          return own.length ? `${own.map((x) => x.sentence).join(" ")} ${own[0].reflection ? `In ${first}'s own words: "${own[0].reflection}"` : ""}`.trim() : EXAMPLE_PLACEHOLDER;
        })(),
        "",
        `I recommend ${first} without reservation. Please contact me at counseling@lincolnhs.org or (217) 555-0142 if I can tell you more.`,
      ].join("\n");
    case "student-brief":
      return [
        "# Snapshot",
        `- **Status:** ${student?.status ?? "unknown"}, roadmap ${student?.roadmapPct ?? 0}% complete`,
        `- **Milestones:** ${approved.length} of ${student?.milestoneCount ?? 11} done`,
        `- **Pathway:** ${student?.careerTrack ?? "undeclared"}, top match ${top}`,
        `- **After high school:** ${student?.postsecondaryIntent ?? "not set"}`,
        "# Open items",
        ...(open.length ? open.map((k) => `- **${k}:** ${statusOf(k)}`) : ["- Nothing open"]),
        "# Talking points",
        `- Start with what went well this term`,
        `- Agree on the one milestone to finish next: **${open[0] ?? "keep pace"}**`,
        `- Confirm the plan after high school (${student?.postsecondaryIntent ?? "not set"})`,
        "# Agreed next steps",
        "- To agree in the meeting",
      ].join("\n");
    case "parent-brief":
      return [
        "# At a glance",
        `${first} is a Grade ${student?.grade ?? ""} student exploring **${student?.careerTrack ?? "careers"}**, with ${top} as a top match.`,
        "# Progress this year",
        `- **${approved.length} of ${student?.milestoneCount ?? 11}** required milestones complete`,
        ...(approved.length ? [`- Finished: ${approved.slice(0, 3).join(", ")}`] : []),
        "# What is next",
        ...(open.length ? open.map((k) => `- ${k}`) : ["- Keeping pace"]),
        "# How the family can help",
        `- Set a regular time each week for ${first} to work on the plan`,
        `- Talk together about ${plan}`,
        "# Questions for the family",
        `- What has ${first} talked about enjoying lately?`,
        "- Is there anything at home we should plan around?",
      ].join("\n");
    case "success-plan":
      return [
        "# Goal",
        "**Back on pace in 4 to 6 weeks.**",
        "# Priorities",
        `1. Finish the **${open[0] ?? "next milestone"}**`,
        ...open.slice(1).map((k, i) => `${i + 2}. ${k}`),
        ...(open.length <= 1 ? ["2. Review the roadmap together"] : []),
        "# Check-ins",
        "- **Weekly**, 10 minutes, one action each time",
        "- Next check-in: to schedule",
        "# Support",
        `- ${student?.careerTrack ?? "Pathway"} resources on Dreamari`,
        "- Financial aid guidance, if applicable",
      ].join("\n");
    case "attention":
    case "group-message":
      return "";
  }
}

const FIELD = "flex h-10 w-full cursor-pointer items-center justify-between gap-[8px] rounded-[var(--radius-sm)] border px-[10px] text-left text-[13px] font-semibold";
const fieldStyle = { background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" } as const;

/** The four draft tools for ONE student, embedded on the Student Profile
 *  (Usman, 25 Sept 2026: "pick a student, then generate something belongs
 *  inside the student profile"). The page below keeps the picker for old
 *  links. */
export function DraftTools({ student }: { student: CounselorStudent }) {
  return <ProductivitySuite fixedStudent={student} />;
}

// 2 Oct 2026 redundancy pass: the Needs attention mode is gone. It was
// the Overview's Today list a second time (same students, same order);
// `?tool=attention` links land on the Overview instead.
type Mode = "documents" | "letters";
const DOC_KINDS: DocKind[] = ["recommendation-letter", "student-brief", "parent-brief", "success-plan"];

// 26 Sept 2026, a fifth pass (direct feedback: "Productivity suite still
// feels like the worst design and weakest link right now. How can we
// really make it feel like a proper productivity workspace?"). Three
// decisions:
// - Three modes, not six tool tiles. The four document tools are one
//   workflow (pick a student, generate, edit a page) with four templates,
//   so the template is a choice inside the setup panel, next to the
//   student and the letter type (asked: "can they just be a drop down or
//   something just like letter type is"). Needs attention is a different
//   workflow and stays its own mode. Group message moved to Counselor
//   Connect as its private-message option (27 Sept 2026, Maisha: "idk if
//   this is necessary because they can technically send group messages
//   via the counselor connect").
// - A workspace shape: a setup panel on the left (who, what, generate,
//   what the draft was built from, what to do with it) and a desk on the
//   right holding a real US Letter page (DocumentDesk.tsx), with a full
//   screen view at print size.
// - Needs attention leads somewhere (asked: "should it have some sort of
//   actionable step from that view?"): each student opens a success plan
//   or a meeting brief already drafted, and the whole list can be
//   messaged in one go.
export function ProductivitySuite({ fixedStudent }: { fixedStudent?: CounselorStudent } = {}) {
  const roster = useReviewedRoster();
  const account = useSyncExternalStore(subscribeCounselorAccount, counselorAccountSnapshot, serverCounselorAccountSnapshot);
  const params = useSearchParams();
  const [mode, setMode] = useState<Mode>(!fixedStudent && params.get("tool") === "letters" ? "letters" : "documents");
  const [kind, setKind] = useState<DocKind>("recommendation-letter");
  const [studentId, setStudentId] = useState(fixedStudent?.id ?? "");
  const [letterType, setLetterType] = useState("");
  const letterO = useLetterOverrides();
  const requests = letterRequests(roster, letterO);
  const [sentFlash, setSentFlash] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);
  const [savedTo, setSavedTo] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [full, setFull] = useState(false);
  const router = useRouter();
  const pageRef = useRef<HTMLDivElement>(null);
  const students = [...roster].sort((a, b) => a.name.localeCompare(b.name));
  const student = fixedStudent ?? roster.find((s) => s.id === studentId);

  const generateFor = (k: DocKind, st: CounselorStudent | undefined, type: string = letterType) => {
    setSavedTo(null);
    setSentFlash(false);
    setDraft(buildDraft(k, st, type, st ? evidenceFor(st) : []));
    if (k === "recommendation-letter" && st) markDrafting(st.id);
  };
  const requestFor = (id: string | undefined) => requests.find((r) => r.studentId === id);
  useEffect(() => {
    if (!fixedStudent && params.get("tool") === "attention") router.replace("/counselor?view=overview");
  }, [fixedStudent, params, router]);
  // Deep link from Today or Meetings: open the document already drafted.
  useEffect(() => {
    const doc = params.get("doc") as DocKind | null;
    const sid = params.get("student");
    if (fixedStudent || !doc || !DOC_KINDS.includes(doc) || !sid) return;
    const st = roster.find((x) => x.id === sid);
    if (!st) return;
    const type = doc === "recommendation-letter" ? (requestFor(sid)?.type ?? "") : "";
    /* eslint-disable react-hooks/set-state-in-effect -- follows the URL once after mount */
    setMode("documents");
    setKind(doc);
    setStudentId(sid);
    setLetterType(type);
    generateFor(doc, st, type);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [params.get("doc"), params.get("student")]); // eslint-disable-line react-hooks/exhaustive-deps
  // A blank start with only the headings, for a counselor who would rather
  // write than edit a generated draft ("make sure a manual option exists
  // everywhere we have AI generated things").
  const writeOwn = () => {
    setSavedTo(null);
    const name = student?.name ?? "";
    const skeleton: Record<DocKind, string> = {
      "recommendation-letter": `To whom it may concern:\n\n${name ? `I am writing to recommend ${name}` : "I am writing to recommend "}${letterType ? ` for a ${letterType.toLowerCase()} opportunity` : ""}.\n\n`,
      "student-brief": "# Snapshot\n- \n# Open items\n- \n# Talking points\n- \n# Agreed next steps\n- ",
      "parent-brief": "# At a glance\n\n# Progress this year\n- \n# What is next\n- \n# How the family can help\n- ",
      "success-plan": "# Goal\n\n# Priorities\n1. \n# Check-ins\n- \n# Support\n- ",
    };
    setDraft(skeleton[kind]);
  };
  // From Letter requests: open the document for that student, drafted.
  const openDoc = (k: DocKind, st: CounselorStudent, type?: string) => {
    setMode("documents");
    setKind(k);
    setStudentId(st.id);
    if (type !== undefined) setLetterType(type);
    generateFor(k, st, type);
  };
  const evidence = student ? evidenceFor(student) : [];
  const check = kind === "recommendation-letter" && draft !== null ? checkLetter(draft, evidence, averageWords(requests)) : null;
  const request = requestFor(student?.id);
  // Insert one piece of evidence: into the gap if the draft still has
  // one, otherwise as its own paragraph before the closing line.
  const insertEvidence = (x: Evidence) => {
    setDraft((d) => {
      if (d === null) return d;
      if (d.includes(EXAMPLE_PLACEHOLDER)) return d.replace(EXAMPLE_PLACEHOLDER, x.sentence);
      const parts = d.split("\n\n");
      parts.splice(Math.max(1, parts.length - 1), 0, x.sentence);
      return parts.join("\n\n");
    });
  };
  const send = () => {
    if (!student || !check) return;
    markSent(student.id, check.words);
    logTime({ activity: `Recommendation letter, ${student.name}`, minutes: 30, kind: "indirect", studentId: student.id });
    setSentFlash(true);
  };
  const docTitle = `${DOC_TITLES[kind]}${student ? `, ${student.name}` : ""}`;
  const print = () => printDocumentPage(pageRef.current, docTitle);
  const signer = { name: account.name, role: account.role, signatureDataUrl: account.signatureDataUrl };
  const labelCls = "text-[11px] font-bold tracking-[0.04em] uppercase";
  const approvedCount = student ? MILESTONE_KEYS.filter((k) => student.milestones[k] === "Approved" || student.milestones[k] === "Completed").length : 0;
  const actionBtn = "dm-quiet flex h-9 cursor-pointer items-center justify-center gap-[6px] rounded-[var(--radius-sm)] border px-[10px] text-[12.5px] font-bold";

  const page = (ref?: React.Ref<HTMLDivElement>) => (
    <DocumentPage kind={kind} student={student} letterType={letterType} signer={signer} draft={draft} onDraft={setDraft} pageRef={ref} />
  );

  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      {!fixedStudent && (
        <Segmented
          ariaLabel="Workspace"
          options={[
            { key: "documents", label: "Documents" },
            // No count here: the Open tab inside carries it (2 Oct 2026 redundancy pass).
            { key: "letters", label: "Letter requests" },
          ]}
          value={mode}
          onChange={(k) => setMode(k as Mode)}
        />
      )}

      {mode === "documents" && (
        <div className="grid grid-cols-1 items-start gap-[var(--space-4)] lg:grid-cols-[320px_minmax(0,1fr)]">
          {/* Setup: who, what, then generate. Sticky on a wide screen so
             the controls stay beside the page as it scrolls. */}
          {/* Not sticky while the evidence list is showing: a sticky column
             taller than the screen hides its own bottom (the letter check
             and Mark as sent). */}
          <div className={`flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-4)] ${kind === "recommendation-letter" && student ? "" : "lg:sticky lg:top-[16px]"}`} style={TINTED_CARD}>
            {!fixedStudent && (
              <label className="flex min-w-0 flex-col gap-[4px]">
                <span className={labelCls} style={{ color: "var(--muted-foreground)" }}>Student</span>
                <Listbox ariaLabel="Student" value={studentId} onChange={(v) => { setStudentId(v); setDraft(null); }} placeholder="Choose a student" options={students.map((s) => ({ value: s.id, label: `${s.name} · Grade ${s.grade}` }))} className={FIELD} style={fieldStyle} />
              </label>
            )}
            <label className="flex min-w-0 flex-col gap-[4px]">
              <span className={labelCls} style={{ color: "var(--muted-foreground)" }}>Document</span>
              <Listbox ariaLabel="Document" value={kind} onChange={(v) => { setKind(v as DocKind); setDraft(null); }} options={DOC_KINDS.map((k) => ({ value: k, label: DOC_TITLES[k] }))} className={FIELD} style={fieldStyle} />
            </label>
            {kind === "recommendation-letter" && (
              <label className="flex min-w-0 flex-col gap-[4px]">
                <span className={labelCls} style={{ color: "var(--muted-foreground)" }}>Letter type</span>
                <Listbox ariaLabel="Letter type" value={letterType} onChange={setLetterType} placeholder="Choose a type" options={LETTER_TYPES.map((t) => ({ value: t, label: t }))} className={FIELD} style={fieldStyle} />
              </label>
            )}
            <div className="grid grid-cols-2 gap-[8px]">
              <button type="button" onClick={() => generateFor(kind, student)} disabled={!student} className="dm-solid bg-[var(--primary)] text-[var(--primary-foreground)] flex h-10 cursor-pointer items-center justify-center gap-[6px] rounded-[var(--radius-md)] px-[10px] text-[13px] font-bold disabled:cursor-not-allowed disabled:opacity-50">
                <Sparkles className="h-[14px] w-[14px]" aria-hidden /> {draft !== null ? "Regenerate" : "Generate"}
              </button>
              <button type="button" onClick={writeOwn} className="dm-quiet flex h-10 cursor-pointer items-center justify-center gap-[6px] rounded-[var(--radius-md)] border px-[10px] text-[13px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
                <PenLine className="h-[14px] w-[14px]" aria-hidden /> Write my own
              </button>
            </div>

            {/* What the draft is built from: the counselor can see the
               facts before trusting the words. */}
            {student && (
              <div className="flex flex-col gap-[10px] rounded-[var(--radius-md)] border p-[12px]" style={GLASS_INSET}>
                {/* The identity row (avatar, name, grade, pathway, status) is
                   cut: the student picker and the page's own header already
                   name the student (2 Oct 2026 redundancy pass). */}
                <span className={labelCls} style={{ color: "var(--muted-foreground)" }}>Built from</span>
                <ul className="flex flex-col gap-[4px] text-[12px] font-medium" style={{ color: "var(--foreground)" }}>
                  <li className="flex justify-between gap-[8px]"><span style={{ color: "var(--muted-foreground)" }}>Milestones done</span><span className="font-bold tabular-nums">{approvedCount} of {student.milestoneCount}</span></li>
                  <li className="flex justify-between gap-[8px]"><span style={{ color: "var(--muted-foreground)" }}>Top match</span><span className="truncate font-bold">{student.topMatches[0]?.title ?? "Not yet"}</span></li>
                  <li className="flex justify-between gap-[8px]"><span style={{ color: "var(--muted-foreground)" }}>Plan</span><span className="truncate font-bold">{student.postsecondaryIntent}</span></li>
                </ul>
              </div>
            )}

            {kind === "recommendation-letter" && student && (
              <EvidencePanel evidence={evidence} request={request} canInsert={draft !== null} used={draft ?? ""} onInsert={insertEvidence} />
            )}

            {check && <LetterCheckCard check={check} />}

            {draft !== null && (
              <div className="flex flex-col gap-[8px] border-t pt-[var(--space-4)]" style={{ borderColor: "var(--glass-border)" }}>
                {/* The amber "add one specific example" nudge is cut: the
                   draft's own placeholder and the letter check's Specific
                   examples row already ask (2 Oct 2026 redundancy pass). */}
                <div className="grid grid-cols-2 gap-[8px]">
                  <button type="button" onClick={print} className={actionBtn} style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}><Printer className="h-[13px] w-[13px]" aria-hidden /> Print or PDF</button>
                  <button type="button" onClick={() => { void navigator.clipboard?.writeText(plainText(draft)); setCopied(true); window.setTimeout(() => setCopied(false), 1500); }} className={actionBtn} style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>{copied ? <Check className="h-[13px] w-[13px]" aria-hidden /> : <Copy className="h-[13px] w-[13px]" aria-hidden />} {copied ? "Copied" : "Copy text"}</button>
                  {student && <button type="button" onClick={() => { addNote(student.id, `${DOC_TITLES[kind]}:\n${plainText(draft)}`); setSavedTo(student.name); logTime({ activity: `${DOC_TITLES[kind]}, ${student.name}`, minutes: 10, kind: "indirect", studentId: student.id }); }} className={`${actionBtn} col-span-2`} style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}><Save className="h-[13px] w-[13px]" aria-hidden /> {savedTo ? `Saved to ${student.name.split(" ")[0]}'s notes` : "Save to notes"}</button>}
                  {student && kind === "recommendation-letter" && (
                    request?.status === "sent" && !sentFlash
                      ? <button type="button" onClick={() => reopenLetter(student.id)} className={`${actionBtn} col-span-2`} style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}><Check className="h-[13px] w-[13px]" aria-hidden /> Sent · reopen</button>
                      : <button type="button" onClick={send} disabled={sentFlash} className="dm-solid col-span-2 flex h-9 cursor-pointer items-center justify-center gap-[6px] rounded-[var(--radius-sm)] bg-[var(--primary)] px-[10px] text-[12.5px] font-bold text-[var(--primary-foreground)] disabled:cursor-default disabled:opacity-70">{sentFlash ? <><Check className="h-[13px] w-[13px]" aria-hidden /> Marked as sent</> : <><Send className="h-[13px] w-[13px]" aria-hidden /> Mark as sent</>}</button>
                  )}
                </div>
              </div>
            )}
            {/* "Nothing is shared until you approve it." cut (a footnote; the
               Mark as sent step says it). 2 Oct 2026 redundancy pass. */}
          </div>

          {/* The desk: a darker surface so the page reads as paper. */}
          <div className="flex min-w-0 flex-col gap-[10px] rounded-[var(--radius-lg)] border p-[var(--space-3)] sm:p-[var(--space-5)]" style={{ borderColor: "var(--glass-border)", background: "var(--cd-desk)" }}>
            {/* "{doc} · US Letter" repeated the Document picker; cut (2 Oct 2026). */}
            <div className="flex items-center justify-end gap-[8px]">
              <FullScreenButton onClick={() => setFull(true)} />
            </div>
            <div className="mx-auto w-full max-w-[816px]">
              {/* Draft generation is local and synchronous today (no real
                 POST yet, unlike Resume's ATS/Tailor calls) -- this only
                 gives the desk a real loading/error contract to render
                 against once it is, and lets `?state=` review those states
                 (the built "choose a student"/"generate a draft" ghost in
                 DocumentPage keeps handling the true empty case, kept as is
                 per COMPONENT_INVENTORY row 60). */}
              <SurfaceState id={60} what="document">
                <FitPage>{page(pageRef)}</FitPage>
              </SurfaceState>
            </div>
          </div>
          <FullScreenDocument open={full} onClose={() => setFull(false)} title={docTitle} onPrint={print}>{page()}</FullScreenDocument>
        </div>
      )}

      {mode === "letters" && <LetterRequests requests={requests} roster={roster} onOpen={(st, r) => openDoc("recommendation-letter", st, r.type)} />}

    </div>
  );
}

// ---- v3: letters -----------------------------------------------------------

const SOURCE_ORDER: Evidence["source"][] = ["Brag sheet", "Resume", "Dreamari"];

/** What the letter can say, grouped by where it came from, each one a
 *  sentence the counselor can drop into the draft. */
function EvidencePanel({ evidence, request, canInsert, used, onInsert }: { evidence: Evidence[]; request?: LetterRequest; canInsert: boolean; /** the draft, to mark what it already uses */ used: string; onInsert: (x: Evidence) => void }) {
  const labelCls = "text-[11px] font-bold tracking-[0.04em] uppercase";
  return (
    <div className="flex flex-col gap-[10px] rounded-[var(--radius-md)] border p-[12px]" style={GLASS_INSET}>
      <span className="flex items-center justify-between gap-[8px]">
        <span className={labelCls} style={{ color: "var(--muted-foreground)" }}>Evidence</span>
        {request && <span className="text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{request.type} · due {shortDate(request.due)}</span>}
      </span>
      {request && <span className="text-[12px] leading-[16px] font-semibold" style={{ color: "var(--foreground)" }}>For {request.recipients.join(", ")}</span>}
      {/* The "No brag sheet..." helper is cut (2 Oct 2026 redundancy pass):
         the missing Brag sheet / Resume groups already show it. */}
      {SOURCE_ORDER.map((src) => {
        const items = evidence.filter((x) => x.source === src);
        if (!items.length) return null;
        return (
          <div key={src} className="flex flex-col gap-[6px]">
            <span className="text-[11px] font-bold" style={{ color: "var(--muted-foreground)" }}>{src}</span>
            <ul className="flex flex-col gap-[6px]">
              {items.map((x) => (
                <li key={x.id} className="flex items-start gap-[8px]">
                  <span className="flex min-w-0 flex-1 flex-col leading-tight">
                    <span className="text-[12.5px] font-bold" style={{ color: "var(--foreground)" }}>{x.label}</span>
                    <span className="text-[11.5px] leading-[15px] font-medium" style={{ color: "var(--muted-foreground)" }}>{x.detail}</span>
                    {x.reflection && <span className="mt-[2px] text-[11.5px] leading-[15px] font-medium italic" style={{ color: "var(--muted-foreground)" }}>&ldquo;{x.reflection}&rdquo;</span>}
                  </span>
                  {canInsert && used.includes(x.sentence) ? (
                    <IconTip label="In the letter">
                      <span aria-label={`${x.label} is in the letter`} className="flex size-7 flex-none items-center justify-center rounded-full" style={{ color: "var(--cd-green)" }}><Check className="h-[14px] w-[14px]" aria-hidden /></span>
                    </IconTip>
                  ) : canInsert && (
                    <IconTip label="Add to the letter">
                      <button type="button" aria-label={`Add ${x.label} to the letter`} onClick={() => onInsert(x)} className="dm-quiet flex size-7 flex-none cursor-pointer items-center justify-center rounded-full border" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}><Plus className="h-[13px] w-[13px]" aria-hidden /></button>
                    </IconTip>
                  )}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

/** One verdict, then the three readings behind it. */
function LetterCheckCard({ check }: { check: ReturnType<typeof checkLetter> }) {
  const dot = check.ok ? "var(--cd-green)" : "var(--cd-amber)";
  const row = (label: string, value: string, warn: boolean) => (
    <li className="flex justify-between gap-[8px]">
      <span style={{ color: "var(--muted-foreground)" }}>{label}</span>
      <span className="font-bold tabular-nums" style={{ color: warn ? "var(--cd-amber)" : "var(--foreground)" }}>{value}</span>
    </li>
  );
  return (
    <div className="flex flex-col gap-[8px] rounded-[var(--radius-md)] border p-[12px]" style={GLASS_INSET}>
      <span className="text-[11px] font-bold tracking-[0.04em] uppercase" style={{ color: "var(--muted-foreground)" }}>Letter check</span>
      <p className="flex items-center gap-[8px] text-[13px] leading-[17px] font-bold" style={{ color: "var(--foreground)" }}>
        <span aria-hidden className="size-[8px] flex-none rounded-full" style={{ background: dot }} />
        {check.verdict}
      </p>
      <ul className="flex flex-col gap-[4px] text-[12px] font-medium">
        {row("Length", `${check.words} of your usual ${check.average} words`, check.words < check.average * 0.8)}
        {row("Specific examples", String(check.specifics), check.specifics < 2)}
        {row("General praise", check.generic.length ? check.generic.slice(0, 3).join(", ") : "None", check.generic.length > 0)}
      </ul>
    </div>
  );
}

const LETTER_STATUS_LABEL: Record<LetterRequest["status"], string> = { requested: "Requested", drafting: "Drafting", sent: "Sent" };
// Requested / Drafting / Sent split every request into one whole, so a
// ring (2 Oct 2026 redundancy pass). Furthest along brightest, the same
// stage ramp as the report charts.
const LETTER_STATUS_COLOR: Record<LetterRequest["status"], string> = { requested: NEUTRAL_SLICE, drafting: "var(--cd-blue-soft)", sent: PRIMARY };

/** Every senior who asked for a letter, soonest due first. */
function LetterRequests({ requests, roster, onOpen }: { requests: LetterRequest[]; roster: CounselorStudent[]; onOpen: (s: CounselorStudent, r: LetterRequest) => void }) {
  const [tab, setTab] = useState<"open" | "sent">("open");
  const [all, setAll] = useState(false);
  const byId = new Map(roster.map((s) => [s.id, s]));
  const open = requests.filter((r) => r.status !== "sent");
  const sent = requests.filter((r) => r.status === "sent");
  const full = tab === "open" ? open : sent;
  const list = all ? full : full.slice(0, 8);
  const soon = open.filter((r) => daysLeft(r) <= 30).length;
  const actionBtn = "dm-quiet flex h-8 flex-none cursor-pointer items-center gap-[6px] rounded-[var(--radius-sm)] border px-[11px] text-[12.5px] font-bold";
  return (
    <div className="flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
      <div className="flex flex-wrap items-center justify-between gap-[8px]">
        <h2 className="flex items-center gap-[8px] text-[15px] font-bold" style={{ color: "var(--foreground)" }}><FileSignature className="h-[16px] w-[16px]" aria-hidden style={{ color: "var(--primary)" }} />Letter requests</h2>
        <span className="flex items-center gap-[8px] text-[12.5px] font-bold" style={{ color: "var(--foreground)" }}>
          <span aria-hidden className="size-[8px] rounded-full" style={{ background: soon ? "var(--cd-amber)" : "var(--cd-green)" }} />
          {soon ? `${soon} due in 30 days` : "Nothing due in 30 days"}
        </span>
      </div>
      {/* One verdict (above), the stage split as a ring, and the counts on
         the tabs: the open count used to show in the workspace switcher,
         here and on the Open tab. Exact stage counts on the ring's hover. */}
      <div className="flex flex-wrap items-center gap-x-[16px] gap-y-[6px]">
        <Tip label={(["requested", "drafting", "sent"] as const).map((k) => `${LETTER_STATUS_LABEL[k]} ${requests.filter((r) => r.status === k).length}`).join(" · ")}>
          <SegmentedRing size={40} stroke={6} segments={(["requested", "drafting", "sent"] as const).map((k) => ({ value: requests.filter((r) => r.status === k).length, color: LETTER_STATUS_COLOR[k] }))} />
        </Tip>
        {(["requested", "drafting", "sent"] as const).map((k) => (
          <span key={k} className="flex items-center gap-[6px] text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}><span aria-hidden className="size-[9px] rounded-full" style={{ background: LETTER_STATUS_COLOR[k] }} />{LETTER_STATUS_LABEL[k]}</span>
        ))}
      </div>
      <div role="tablist" aria-label="Letter requests" className="flex gap-x-[var(--space-5)] border-b" style={{ borderColor: "var(--glass-border)" }}>
        {([{ key: "open", label: "Open", n: open.length }, { key: "sent", label: "Sent", n: sent.length }] as const).map((t) => (
          <button key={t.key} type="button" role="tab" aria-selected={tab === t.key} onClick={() => { setTab(t.key); setAll(false); }} className="cursor-pointer border-b-2 pb-[8px] text-[13px] font-bold" style={{ borderColor: tab === t.key ? "var(--primary)" : "transparent", color: tab === t.key ? "var(--foreground)" : "var(--muted-foreground)" }}>
            {t.label} <span className="tabular-nums" style={{ color: "var(--muted-foreground)" }}>{t.n}</span>
          </button>
        ))}
      </div>
      <ul className="flex flex-col gap-[6px]">
        {list.map((r) => {
          const s = byId.get(r.studentId);
          if (!s) return null;
          const left = daysLeft(r);
          const warn = r.status !== "sent" && left <= 7;
          return (
            <li key={r.studentId} className="flex flex-wrap items-center gap-x-[12px] gap-y-[6px] rounded-[var(--radius-md)] border px-[12px] py-[8px]" style={GLASS_INSET}>
              <span className="flex min-w-0 flex-1 items-center gap-[12px]">
                <Avatar name={s.name} size={32} index={s.avatarIndex} />
                <span className="flex min-w-0 flex-col leading-tight">
                  <span className="truncate text-[13px] font-bold" style={{ color: "var(--foreground)" }}>{s.name} <span className="font-semibold" style={{ color: "var(--muted-foreground)" }}>· {r.type}</span></span>
                  <span className="truncate text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{r.recipients.join(", ")}</span>
                </span>
              </span>
              {/* Due date and days left said the same thing twice: "in N
                 days", the date on hover (2 Oct 2026 redundancy pass). */}
              <span className="flex w-[118px] flex-none flex-col items-end text-right leading-tight">
                {r.status === "sent" || left < 0 ? (
                  <span className="text-[12.5px] font-bold tabular-nums" style={{ color: warn ? "var(--cd-amber)" : "var(--foreground)" }}>{r.status === "sent" ? `${r.words ?? ""} words` : `Late, ${shortDate(r.due)}`}</span>
                ) : (
                  <Tip label={`Due ${shortDate(r.due)}`}>
                    <span tabIndex={0} className="text-[12.5px] font-bold tabular-nums outline-none" style={{ color: warn ? "var(--cd-amber)" : "var(--foreground)" }}>{left === 0 ? "Today" : `in ${left} day${left === 1 ? "" : "s"}`}</span>
                  </Tip>
                )}
                <span className="text-[11px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{LETTER_STATUS_LABEL[r.status]}</span>
              </span>
              <button type="button" onClick={() => onOpen(s, r)} className={actionBtn} style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>{r.status === "sent" ? "Open" : r.status === "drafting" ? "Keep writing" : "Draft"}</button>
            </li>
          );
        })}
        {list.length === 0 && <li className="text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{tab === "open" ? "Every requested letter is sent." : "No letters sent yet."}</li>}
      </ul>
      {full.length > 8 && <ShowAll total={full.length} shown={8} open={all} onToggle={() => setAll((v) => !v)} />}
    </div>
  );
}
