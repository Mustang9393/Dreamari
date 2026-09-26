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
import { useRef, useState, useSyncExternalStore } from "react";
import { MessageSquareText, ListTodo, Sparkles, Megaphone, Check, Printer } from "lucide-react";
import { BatchComposer } from "./Batch";
import { CAREER_TRACKS } from "@/lib/counselorRoster";
import { Listbox } from "@/components/app/Listbox";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { useRouter, useSearchParams } from "next/navigation";
import { Copy, Save, PenLine } from "lucide-react";
import { MILESTONE_KEYS, attentionRank, attentionReason, type CounselorStudent } from "@/lib/counselorRoster";
import { addNote } from "@/lib/counselorNotes";
import { Avatar, SelectBox, StatusChip } from "../chips";
import { GLASS_INSET } from "../surfaces";
import { GLASS_CARD as TINTED_CARD } from "../surfaces";
import { Segmented } from "@/components/connect/viz";
import { DOC_TITLES, DocumentPage, plainText, FitPage, FullScreenButton, FullScreenDocument, printDocumentPage, type DocKind } from "./DocumentDesk";
import { SubTabs } from "./SubTabs";
import { counselorAccountSnapshot, serverCounselorAccountSnapshot, subscribeCounselorAccount } from "@/lib/counselorAccount";


type ToolId = "recommendation-letter" | "student-brief" | "parent-brief" | "success-plan" | "attention" | "group-message";


const LETTER_TYPES = ["College Application", "Scholarship", "Internship", "Employment"];

// The one thing the letter genuinely can't write for the counselor. Kept
// as one constant so the placeholder text generated into the draft and
// the contextual nudge that watches for it never drift apart.
const EXAMPLE_PLACEHOLDER = "[Add one specific example.]";

// Drafts are built from the student's own roster data (milestones,
// matches, plan), not a canned paragraph, so two students never get the
// same letter. A backend replaces this with a model call; the shape (a
// text the counselor edits, copies, downloads or saves to notes) stays.
function buildDraft(toolId: ToolId, student: CounselorStudent | undefined, extra: string): string {
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
        EXAMPLE_PLACEHOLDER,
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

type Mode = "documents" | "group-message" | "attention";
const DOC_KINDS: DocKind[] = ["recommendation-letter", "student-brief", "parent-brief", "success-plan"];

// 26 Sept 2026, a fifth pass (direct feedback: "Productivity suite still
// feels like the worst design and weakest link right now. How can we
// really make it feel like a proper productivity workspace?"). Three
// decisions:
// - Three modes, not six tool tiles. The four document tools are one
//   workflow (pick a student, generate, edit a page) with four templates,
//   so the template is a choice inside the setup panel, next to the
//   student and the letter type (asked: "can they just be a drop down or
//   something just like letter type is"). Group message and Needs
//   attention are different workflows and stay their own modes.
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
  const initialPathway = params.get("pathway");
  const [mode, setMode] = useState<Mode>(!fixedStudent && params.get("tool") === "group-message" ? "group-message" : "documents");
  const [kind, setKind] = useState<DocKind>("recommendation-letter");
  const [studentId, setStudentId] = useState(fixedStudent?.id ?? "");
  const [letterType, setLetterType] = useState("");
  const [draft, setDraft] = useState<string | null>(null);
  const [savedTo, setSavedTo] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [full, setFull] = useState(false);
  const router = useRouter();
  const pageRef = useRef<HTMLDivElement>(null);
  const students = [...roster].sort((a, b) => a.name.localeCompare(b.name));
  const student = fixedStudent ?? roster.find((s) => s.id === studentId);
  const attention = [...roster].filter((s) => s.status !== "On Track").sort(attentionRank).slice(0, 10);
  // Group message audience: grade, status, pathway, any combination.
  const [gGrade, setGGrade] = useState("All");
  const [gStatus, setGStatus] = useState("All");
  const [gPathway, setGPathway] = useState(initialPathway && (CAREER_TRACKS as readonly string[]).includes(initialPathway) ? initialPathway : "All");
  const [gSent, setGSent] = useState<string | null>(null);
  const [gMode, setGMode] = useState<"audience" | "pick">("audience");
  const [picked, setPicked] = useState<Set<string>>(() => new Set());
  const [pickSearch, setPickSearch] = useState("");
  const togglePick = (id: string) => setPicked((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  const byAudience = roster.filter((s) => (gGrade === "All" || String(s.grade) === gGrade) && (gStatus === "All" || s.status === gStatus) && (gPathway === "All" || s.careerTrack === gPathway));
  const audience = gMode === "pick" ? students.filter((s) => picked.has(s.id)) : byAudience;
  const audienceLabel = gMode === "pick" ? `${picked.size} picked` : [gGrade === "All" ? "All grades" : `Grade ${gGrade}`, gStatus === "All" ? null : gStatus, gPathway === "All" ? null : gPathway].filter(Boolean).join(" · ");
  const pickList = students.filter((s) => !pickSearch.trim() || s.name.toLowerCase().includes(pickSearch.trim().toLowerCase()));

  const generateFor = (k: DocKind, st: CounselorStudent | undefined) => {
    setSavedTo(null);
    setDraft(buildDraft(k, st, letterType));
  };
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
  // From Needs attention: open the document for that student, drafted.
  const openDoc = (k: DocKind, st: CounselorStudent) => {
    setMode("documents");
    setKind(k);
    setStudentId(st.id);
    generateFor(k, st);
  };
  const messageAll = (list: CounselorStudent[]) => {
    setPicked(new Set(list.map((s) => s.id)));
    setGMode("pick");
    setGSent(null);
    setMode("group-message");
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
            { key: "group-message", label: "Group message" },
            { key: "attention", label: `Needs attention · ${attention.length}` },
          ]}
          value={mode}
          onChange={(k) => setMode(k as Mode)}
        />
      )}

      {mode === "documents" && (
        <div className="grid grid-cols-1 items-start gap-[var(--space-4)] lg:grid-cols-[320px_minmax(0,1fr)]">
          {/* Setup: who, what, then generate. Sticky on a wide screen so
             the controls stay beside the page as it scrolls. */}
          <div className="flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-4)] lg:sticky lg:top-[16px]" style={TINTED_CARD}>
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
                <span className={labelCls} style={{ color: "var(--muted-foreground)" }}>Built from</span>
                <span className="flex items-center gap-[10px]">
                  <Avatar name={student.name} size={34} index={student.avatarIndex} />
                  <span className="flex min-w-0 flex-1 flex-col leading-tight">
                    <span className="truncate text-[13px] font-bold" style={{ color: "var(--foreground)" }}>{student.name}</span>
                    <span className="truncate text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Grade {student.grade} · {student.careerTrack}</span>
                  </span>
                  <StatusChip status={student.status} />
                </span>
                <ul className="flex flex-col gap-[4px] text-[12px] font-medium" style={{ color: "var(--foreground)" }}>
                  <li className="flex justify-between gap-[8px]"><span style={{ color: "var(--muted-foreground)" }}>Milestones done</span><span className="font-bold tabular-nums">{approvedCount} of {student.milestoneCount}</span></li>
                  <li className="flex justify-between gap-[8px]"><span style={{ color: "var(--muted-foreground)" }}>Top match</span><span className="truncate font-bold">{student.topMatches[0]?.title ?? "Not yet"}</span></li>
                  <li className="flex justify-between gap-[8px]"><span style={{ color: "var(--muted-foreground)" }}>Plan</span><span className="truncate font-bold">{student.postsecondaryIntent}</span></li>
                </ul>
              </div>
            )}

            {draft !== null && (
              <div className="flex flex-col gap-[8px] border-t pt-[var(--space-4)]" style={{ borderColor: "var(--glass-border)" }}>
                {kind === "recommendation-letter" && draft.includes(EXAMPLE_PLACEHOLDER) && (
                  <p className="flex items-start gap-[6px] text-[12px] leading-[16px] font-semibold" style={{ color: "#F5A623" }}>
                    <Sparkles className="mt-[2px] h-[12px] w-[12px] flex-none" aria-hidden /> Add one specific example where the letter asks for it.
                  </p>
                )}
                <div className="grid grid-cols-2 gap-[8px]">
                  <button type="button" onClick={print} className={actionBtn} style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}><Printer className="h-[13px] w-[13px]" aria-hidden /> Print or PDF</button>
                  <button type="button" onClick={() => { void navigator.clipboard?.writeText(plainText(draft)); setCopied(true); window.setTimeout(() => setCopied(false), 1500); }} className={actionBtn} style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>{copied ? <Check className="h-[13px] w-[13px]" aria-hidden /> : <Copy className="h-[13px] w-[13px]" aria-hidden />} {copied ? "Copied" : "Copy text"}</button>
                  {student && <button type="button" onClick={() => { addNote(student.id, `${DOC_TITLES[kind]}:\n${plainText(draft)}`); setSavedTo(student.name); }} className={`${actionBtn} col-span-2`} style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}><Save className="h-[13px] w-[13px]" aria-hidden /> {savedTo ? `Saved to ${student.name.split(" ")[0]}'s notes` : "Save to notes"}</button>}
                </div>
              </div>
            )}
            {/* The reference's "You are always in control" line, short. */}
            <span className="text-[11.5px] font-medium" style={{ color: "var(--muted-foreground)" }}>Nothing is shared until you approve it.</span>
          </div>

          {/* The desk: a darker surface so the page reads as paper. */}
          <div className="flex min-w-0 flex-col gap-[10px] rounded-[var(--radius-lg)] border p-[var(--space-3)] sm:p-[var(--space-5)]" style={{ borderColor: "var(--glass-border)", background: "color-mix(in srgb, #000 35%, var(--card))" }}>
            <div className="flex items-center justify-between gap-[8px]">
              <span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{DOC_TITLES[kind]} · US Letter</span>
              <FullScreenButton onClick={() => setFull(true)} />
            </div>
            <div className="mx-auto w-full max-w-[816px]">
              <FitPage>{page(pageRef)}</FitPage>
            </div>
          </div>
          <FullScreenDocument open={full} onClose={() => setFull(false)} title={docTitle} onPrint={print}>{page()}</FullScreenDocument>
        </div>
      )}

      {mode === "attention" && (
        <div className="flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
          <div className="flex flex-wrap items-center justify-between gap-[8px]">
            <h2 className="text-[15px] font-bold" style={{ color: "var(--foreground)" }}>Needs attention <span className="ml-[4px] text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>ranked, most urgent first</span></h2>
            {attention.length > 0 && (
              <button type="button" onClick={() => messageAll(attention)} className="dm-solid bg-[var(--primary)] text-[var(--primary-foreground)] flex h-9 cursor-pointer items-center gap-[6px] rounded-[var(--radius-sm)] px-[12px] text-[12.5px] font-bold">
                <Megaphone className="h-[13px] w-[13px]" aria-hidden /> Message all {attention.length}
              </button>
            )}
          </div>
          <ul className="flex flex-col gap-[6px]">
            {attention.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center gap-x-[12px] gap-y-[8px] rounded-[var(--radius-md)] border px-[12px] py-[10px]" style={GLASS_INSET}>
                <button type="button" onClick={() => router.push(`/counselor?view=students&studentId=${s.id}`)} className="flex min-w-0 flex-1 cursor-pointer items-center gap-[12px] text-left">
                  <Avatar name={s.name} size={34} index={s.avatarIndex} />
                  <span className="flex min-w-0 flex-col leading-tight">
                    <span className="truncate text-[13px] font-bold" style={{ color: "var(--foreground)" }}>{s.name}</span>
                    <span className="truncate text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Grade {s.grade} · {attentionReason(s)}</span>
                  </span>
                </button>
                <StatusChip status={s.status} />
                <span className="flex gap-[6px]">
                  <button type="button" onClick={() => openDoc("success-plan", s)} className={actionBtn} style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}><ListTodo className="h-[13px] w-[13px]" aria-hidden /> Success plan</button>
                  <button type="button" onClick={() => openDoc("student-brief", s)} className={actionBtn} style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}><MessageSquareText className="h-[13px] w-[13px]" aria-hidden /> Meeting brief</button>
                </span>
              </li>
            ))}
            {attention.length === 0 && <li className="text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Everyone is on track.</li>}
          </ul>
        </div>
      )}

      {mode === "group-message" && (
        <div className="flex flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
          <SubTabs ariaLabel="Who receives it" options={[{ key: "audience", label: "By audience" }, { key: "pick", label: "Pick students" }]} value={gMode} onChange={(k) => setGMode(k)} />
          {gMode === "pick" && (
            <div className="flex flex-col gap-[8px] rounded-[var(--radius-md)] border p-[10px]" style={GLASS_INSET}>
              <div className="flex flex-wrap items-center justify-between gap-[8px]">
                <input value={pickSearch} onChange={(e) => setPickSearch(e.target.value)} placeholder="Search a name" aria-label="Search students" className="h-9 min-w-[200px] flex-1 rounded-[var(--radius-sm)] border px-[10px] text-[13px] outline-none" style={fieldStyle} />
                <span className="flex items-center gap-[8px] text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
                  {picked.size} picked
                  {picked.size > 0 && <button type="button" onClick={() => setPicked(new Set())} className="dm-quiet cursor-pointer rounded-full border px-[10px] py-[3px] text-[12px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>Clear</button>}
                  {pickList.length > 0 && <button type="button" onClick={() => setPicked((prev) => { const next = new Set(prev); for (const s of pickList) next.add(s.id); return next; })} className="dm-quiet cursor-pointer rounded-full border px-[10px] py-[3px] text-[12px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>Pick all {pickList.length}</button>}
                </span>
              </div>
              <ul className="flex max-h-[260px] flex-col gap-[2px] overflow-y-auto pr-[4px]">
                {pickList.map((s) => (
                  <li key={s.id}>
                    <label className="dm-quiet flex cursor-pointer items-center gap-[10px] rounded-[var(--radius-sm)] px-[6px] py-[5px]">
                      <SelectBox checked={picked.has(s.id)} label={`Pick ${s.name}`} onChange={() => togglePick(s.id)} />
                      <Avatar name={s.name} size={26} index={s.avatarIndex} />
                      <span className="min-w-0 flex-1 truncate text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>{s.name} <span style={{ color: "var(--muted-foreground)" }}>· Grade {s.grade}</span></span>
                      <StatusChip status={s.status} />
                    </label>
                  </li>
                ))}
                {pickList.length === 0 && <li className="px-[6px] py-[5px] text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>No student by that name.</li>}
              </ul>
            </div>
          )}
          <div className={`grid grid-cols-1 gap-[var(--space-3)] sm:grid-cols-3 ${gMode === "pick" ? "hidden" : ""}`}>
            <label className="flex min-w-0 flex-col gap-[4px]">
              <span className={labelCls} style={{ color: "var(--muted-foreground)" }}>Grade</span>
              <Listbox ariaLabel="Grade" value={gGrade} onChange={setGGrade} options={[{ value: "All", label: "All grades" }, ...["9", "10", "11", "12"].map((g) => ({ value: g, label: `Grade ${g}` }))]} className={FIELD} style={fieldStyle} />
            </label>
            <label className="flex min-w-0 flex-col gap-[4px]">
              <span className={labelCls} style={{ color: "var(--muted-foreground)" }}>Status</span>
              <Listbox ariaLabel="Status" value={gStatus} onChange={setGStatus} options={[{ value: "All", label: "All statuses" }, ...["On Track", "Needs Attention", "At Risk"].map((v) => ({ value: v, label: v }))]} className={FIELD} style={fieldStyle} />
            </label>
            <label className="flex min-w-0 flex-col gap-[4px]">
              <span className={labelCls} style={{ color: "var(--muted-foreground)" }}>Pathway</span>
              <Listbox ariaLabel="Pathway" value={gPathway} onChange={setGPathway} options={[{ value: "All", label: "All pathways" }, ...CAREER_TRACKS.map((t) => ({ value: t, label: t }))]} className={FIELD} style={fieldStyle} />
            </label>
          </div>
          {gSent && <p className="flex items-center gap-[8px] text-[13px] font-bold" style={{ color: "var(--foreground)" }}><Check className="h-[14px] w-[14px]" aria-hidden style={{ color: "var(--primary)" }} />{gSent}</p>}
          {audience.length === 0 ? (
            <p className="text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{gMode === "pick" ? "Pick at least one student above." : "No students match that audience. Widen a filter."}</p>
          ) : (
            <BatchComposer students={audience} audience={audienceLabel} onDone={(summary) => { setGSent(summary); if (gMode === "pick") setPicked(new Set()); }} />
          )}
        </div>
      )}
    </div>
  );
}
