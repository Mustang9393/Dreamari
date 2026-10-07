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
import { MessageSquareText, ListTodo, Sparkles, Megaphone, Check, Printer, Send, X } from "lucide-react";
import { IconTip } from "@/components/app/IconTip";
import { draftKey, listDrafts, removeDraft, saveDraft, useDrafts, wordCount } from "@/lib/counselorDrafts";
import { SurfaceState } from "@/components/app/SurfaceState";
import { Listbox } from "./Listbox";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { useRouter, useSearchParams } from "next/navigation";
import { Copy, Save, PenLine, Users, LayoutTemplate, Share2, SlidersHorizontal, Search } from "lucide-react";
import { PinchZoom, ToolButton, ToolSheet } from "./MobileStudio";
import { MILESTONE_KEYS, type CounselorStudent } from "@/lib/counselorRoster";
import { attentionRank, attentionReason } from "./studentAttention";
import { addNote } from "@/lib/counselorNotes";
import { Avatar, StatusChip } from "./chips";
import { GLASS_INSET } from "../surfaces";
import { GLASS_CARD as TINTED_CARD } from "../surfaces";
import { Segmented } from "./viz";
import { ConfirmShimmer } from "@/components/flow/ConfirmShimmer";
import { DreamyMoment } from "./overviewShared";
import { SignatureSettings } from "./Signature";
import { SchoolPublicationSettings } from "./SchoolPublication";
import { DOC_TITLES, DocumentPage, plainText, FitPage, FullScreenButton, FullScreenDocument, printDocumentPage, type DocKind } from "./DocumentDesk";
import { counselorAccountSnapshot, serverCounselorAccountSnapshot, subscribeCounselorAccount } from "@/lib/counselorAccount";


type ToolId = DocKind | "attention" | "group-message";


export const LETTER_TYPES = ["College Application", "Scholarship", "Internship", "Employment"];

// The one thing the letter genuinely can't write for the counselor. Kept
// as one constant so the placeholder text generated into the draft and
// the contextual nudge that watches for it never drift apart.
export const EXAMPLE_PLACEHOLDER = "[Add one specific example.]";

// Drafts are built from the student's own roster data (milestones,
// matches, plan), not a canned paragraph, so two students never get the
// same letter. A backend replaces this with a model call; the shape (a
// text the counselor edits, copies, downloads or saves to notes) stays.
export function buildDraft(toolId: ToolId, student: CounselorStudent | undefined, extra: string): string {
  const name = student?.name ?? "the student";
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
    // Brag sheet and family questionnaire: what a counselor sends before
    // writing a letter (the student's and the family's own words), in plain
    // words a student reads easily, with what Dreamari already knows filled in.
    case "brag-sheet":
      return [
        "# About you",
        `- **Name:** ${name || "your name"} · Grade ${student?.grade ?? ""}`,
        `- **Top career right now:** ${top}`,
        "# What you are proud of",
        "- What are you most proud of from high school so far?",
        "- ",
        "# Activities and jobs",
        "- Clubs, sports, jobs or volunteer work, and how long you did each:",
        "- ",
        "# What makes you, you",
        "- Three words a friend would use for you:",
        "- A time you solved a problem or helped someone:",
        "# Your plans",
        `- **After high school:** ${plan}`,
        "- Schools or programs you are applying to:",
        "# Already in Dreamari",
        `- **${e?.careersSaved ?? 0}** careers explored, **${e?.simulations ?? 0}** simulations played, **${approved.length} of ${student?.milestoneCount ?? 11}** milestones done`,
      ].join("\n");
    case "family-questionnaire":
      return [
        "# About your student",
        `- What three words describe ${first || "your student"}?`,
        `- What is something ${first || "they"} did that made you proud?`,
        "# Strengths",
        `- What is ${first || "your student"} really good at, in or out of school?`,
        `- What has been hard, and how did ${first || "they"} handle it?`,
        "# Plans",
        `- What do you hope ${first || "your student"} does after high school?`,
        "- Is there anything you want the counselor to know?",
      ].join("\n");
    case "meeting-summary":
      return [
        `# What we talked about`,
        `- Where ${first || "the student"} is: ${approved.length} of ${student?.milestoneCount ?? 11} milestones done`,
        `- ${top} as a direction, and ${plan}`,
        "# What we agreed",
        `1. Finish the **${open[0] ?? "next milestone"}**`,
        ...open.slice(1).map((k, i) => `${i + 2}. ${k}`),
        "# Dates to remember",
        "- Next check-in: to schedule",
        "# Questions?",
        "- Reply to this note or stop by during office hours.",
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

type Mode = "documents" | "attention";
const DOC_KINDS: DocKind[] = ["recommendation-letter", "brag-sheet", "family-questionnaire", "student-brief", "parent-brief", "meeting-summary", "success-plan"];

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
/** What a host screen can add for recommendation letters (v5's letters
 *  queue, 8 Oct 2026): whether this student has a letter still to send,
 *  and Mark sent with the letter's word count. */
export type LetterTools = { status: (studentId: string) => "open" | "sent" | undefined; markSent: (student: CounselorStudent, words: number) => void };

export function ProductivitySuite({ fixedStudent, preselect, letterTools, mode: modeProp }: { fixedStudent?: CounselorStudent; preselect?: { studentId: string; letterType?: string }; letterTools?: LetterTools; /** set by a host that shows its own switch (v5 Documents) */ mode?: "documents" | "attention" } = {}) {
  const roster = useReviewedRoster();
  const account = useSyncExternalStore(subscribeCounselorAccount, counselorAccountSnapshot, serverCounselorAccountSnapshot);
  const params = useSearchParams();
  const [modeState, setModeState] = useState<Mode>(!fixedStudent && !preselect && params.get("tool") === "attention" ? "attention" : "documents");
  const mode = modeProp ?? modeState;
  const setMode = setModeState;
  const [kind, setKind] = useState<DocKind>("recommendation-letter");
  const [studentId, setStudentId] = useState(fixedStudent?.id ?? preselect?.studentId ?? "");
  // Drafts persist per student and kind (8 Oct 2026 audit: "drafts are
  // useState only and vanish on navigation"): with a student picked, the
  // page shows and edits the saved draft (src/lib/counselorDrafts.ts), so
  // the Documents tab and the student's own Drafts tab share it. Only a
  // draft with no student yet stays in this component.
  const drafts = useDrafts();
  const [letterType, setLetterType] = useState(() => preselect?.letterType ?? drafts[draftKey(fixedStudent?.id ?? preselect?.studentId ?? "", "recommendation-letter")]?.letterType ?? "");
  const [loose, setLoose] = useState<string | null>(null);
  const [savedTo, setSavedTo] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  // phones and tablets: which tool's bottom sheet is open (8 Oct 2026)
  const [sheet, setSheet] = useState<null | "student" | "format" | "draft" | "edit" | "share" | "more">(null);
  const [studentQuery, setStudentQuery] = useState("");
  const [full, setFull] = useState(false);
  const router = useRouter();
  const pageRef = useRef<HTMLDivElement>(null);
  const students = [...roster].sort((a, b) => a.name.localeCompare(b.name));
  const student = fixedStudent ?? roster.find((s) => s.id === studentId);
  const draft = student ? drafts[draftKey(student.id, kind)]?.text ?? null : loose;
  const setDraft = (text: string | null) => {
    if (!student) { setLoose(text); return; }
    if (text !== null) saveDraft({ studentId: student.id, kind, letterType, text });
  };
  const savedList = listDrafts(drafts, fixedStudent?.id).filter((d) => roster.some((s) => s.id === d.studentId)).slice(0, 5);
  const reopen = (studentIdTo: string, k: string, type: string) => {
    setMode("documents");
    setStudentId(studentIdTo);
    setKind(k as DocKind);
    setLetterType(type);
    setSavedTo(null);
  };
  const attention = [...roster].filter((s) => s.status !== "On Track").sort(attentionRank).slice(0, 10);

  // The paper catches the light once when a draft lands (the student
  // app's ConfirmShimmer; Maisha, 7 Oct 2026: "mimic some of that [visual
  // excitement] ... without losing the clean, professional,
  // easy-to-process experience").
  const [landed, setLanded] = useState(0);
  const generateFor = (k: DocKind, st: CounselorStudent | undefined) => {
    setSavedTo(null);
    const text = buildDraft(k, st, letterType);
    if (st) saveDraft({ studentId: st.id, kind: k, letterType, text });
    else setLoose(text);
    setLanded((n) => n + 1);
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
      "brag-sheet": "# About you\n- \n# What you are proud of\n- \n# Activities and jobs\n- \n# Your plans\n- ",
      "family-questionnaire": "# About your student\n- \n# Strengths\n- \n# Plans\n- ",
      "meeting-summary": "# What we talked about\n- \n# What we agreed\n1. \n# Dates to remember\n- ",
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
  // Private messages live in Counselor Connect now (27 Sept 2026): the
  // whole list opens there as a private message already addressed to them.
  const messageAll = (list: CounselorStudent[]) => {
    router.push(`/counselor?view=connect&compose=1&ids=${list.map((s) => s.id).join(",")}`);
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

  // Phones and tablets (below 1100px, where the side panel used to stack
  // above the page): the page is the screen, the tools a bottom bar, each
  // tool a bottom sheet over the page (8 Oct 2026: "like how Canva, other
  // graphic editors or doc editors work on mobile").
  const DESCRIBE: Record<DocKind, string> = { "recommendation-letter": "A personal endorsement", "brag-sheet": "The student's own words, for a letter", "family-questionnaire": "The family's view, for a letter", "student-brief": "A focused student conversation", "parent-brief": "Progress, context & family support", "meeting-summary": "A recap to send after we meet", "success-plan": "Priorities, owners & next steps" };
  const sheetBtn = "dm-quiet flex min-h-[48px] w-full cursor-pointer items-center gap-[10px] rounded-[12px] border px-[14px] text-left text-[15px] font-semibold";
  const close = () => setSheet(null);
  const matching = students.filter((x) => !studentQuery.trim() || x.name.toLowerCase().includes(studentQuery.trim().toLowerCase()));
  const mobileTools = (
    <>
      <nav aria-label="Document tools" className="v4-studio-toolbar sticky z-[30] items-stretch gap-[2px] rounded-[18px] border p-[4px]" style={{ bottom: "calc(var(--doc-bar-bottom, 0px) + 10px + env(safe-area-inset-bottom))", background: "color-mix(in srgb, var(--card) 92%, transparent)", borderColor: "var(--glass-border)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)", boxShadow: "0 14px 36px -16px rgba(0,0,0,0.5)" }}>
        {!fixedStudent && <ToolButton icon={Users} label={student ? student.name.split(" ")[0] : "Student"} onClick={() => setSheet("student")} />}
        <ToolButton icon={LayoutTemplate} label="Format" onClick={() => setSheet("format")} />
        <ToolButton icon={Sparkles} label={draft !== null ? "Redo" : "Draft"} primary={draft === null && !!student} onClick={() => setSheet("draft")} />
        <ToolButton icon={PenLine} label="Edit" disabled={draft === null} onClick={() => setSheet("edit")} />
        <ToolButton icon={Share2} label="Share" disabled={draft === null} onClick={() => setSheet("share")} />
        <ToolButton icon={SlidersHorizontal} label="More" onClick={() => setSheet("more")} />
      </nav>

      <ToolSheet title="Student" open={sheet === "student"} onClose={close} tall>
        <label className="flex h-12 flex-none items-center gap-[10px] rounded-[12px] border px-[14px]" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
          <Search className="h-4 w-4 flex-none" aria-hidden style={{ color: "var(--muted-foreground)" }} />
          <input value={studentQuery} onChange={(e) => setStudentQuery(e.target.value)} placeholder="Find a student" className="min-w-0 flex-1 bg-transparent text-[16px] outline-none" />
        </label>
        <ul className="flex flex-col">
          {matching.map((x) => (
            <li key={x.id}>
              <button type="button" onClick={() => { setStudentId(x.id); setLoose(null); setSavedTo(null); close(); }} aria-pressed={x.id === studentId} className="dm-quiet flex min-h-[52px] w-full cursor-pointer items-center gap-[12px] rounded-[12px] px-[8px] text-left" style={x.id === studentId ? { background: "color-mix(in srgb, var(--primary) 14%, transparent)" } : undefined}>
                <Avatar name={x.name} size={34} index={x.avatarIndex} />
                <span className="flex min-w-0 flex-1 flex-col"><span className="truncate text-[15px] font-semibold">{x.name}</span><span className="text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>Grade {x.grade} · {x.status}</span></span>
                {x.id === studentId && <Check className="h-4 w-4" aria-hidden />}
              </button>
            </li>
          ))}
        </ul>
      </ToolSheet>

      <ToolSheet title="Format" open={sheet === "format"} onClose={close}>
        <div className="grid grid-cols-2 gap-[10px] sm:grid-cols-3">
          {DOC_KINDS.map((k) => {
            const on = kind === k;
            return (
              <button key={k} type="button" aria-pressed={on} onClick={() => { setKind(k); setLoose(null); setSavedTo(null); close(); }} className="flex min-h-[96px] cursor-pointer flex-col items-start justify-between gap-[8px] rounded-[14px] border p-[12px] text-left" style={on ? { borderColor: "var(--primary)", background: "color-mix(in srgb, var(--primary) 12%, transparent)" } : { borderColor: "var(--glass-border)" }}>
                <span className="flex w-full items-center justify-between"><LayoutTemplate className="h-[18px] w-[18px]" aria-hidden style={{ color: "var(--accent)" }} />{on && <Check className="h-4 w-4" aria-hidden />}</span>
                <span className="flex flex-col gap-[2px]"><span className="text-[14px] leading-[18px] font-bold">{DOC_TITLES[k]}</span><span className="text-[12px] leading-[16px]" style={{ color: "var(--muted-foreground)" }}>{DESCRIBE[k]}</span></span>
              </button>
            );
          })}
        </div>
      </ToolSheet>

      <ToolSheet title={DOC_TITLES[kind]} open={sheet === "draft"} onClose={close}>
        {kind === "recommendation-letter" && (
          <div className="flex flex-col gap-[8px]">
            <span className="text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Letter type</span>
            <div className="flex flex-wrap gap-[8px]">
              {LETTER_TYPES.map((t) => <button key={t} type="button" aria-pressed={letterType === t} onClick={() => setLetterType(t)} className={`${letterType === t ? "" : "dm-quiet "}inline-flex h-10 cursor-pointer items-center rounded-full border px-[14px] text-[14px] font-semibold`} style={letterType === t ? { background: "var(--primary)", borderColor: "var(--primary)", color: "var(--primary-foreground)" } : { borderColor: "var(--glass-border)" }}>{t}</button>)}
            </div>
          </div>
        )}
        {student ? (
          <p className="text-[14px]" style={{ color: "var(--muted-foreground)" }}>Built from {student.name}&apos;s record: {approvedCount} of {student.milestoneCount} milestones, top match {student.topMatches[0]?.title ?? "not yet"}, plan {student.postsecondaryIntent}.</p>
        ) : (
          <button type="button" onClick={() => setSheet("student")} className={sheetBtn} style={{ borderColor: "var(--glass-border)" }}><Users className="h-4 w-4" aria-hidden /> Choose a student first</button>
        )}
        <div className="grid grid-cols-2 gap-[10px]">
          <button type="button" disabled={!student} onClick={() => { generateFor(kind, student); close(); }} className="dm-solid flex min-h-[48px] cursor-pointer items-center justify-center gap-[8px] rounded-[12px] text-[15px] font-bold disabled:cursor-not-allowed disabled:opacity-50" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}><Sparkles className="h-4 w-4" aria-hidden /> {draft !== null ? "Regenerate" : "Generate"}</button>
          <button type="button" onClick={() => { writeOwn(); setSheet("edit"); }} className="dm-quiet flex min-h-[48px] cursor-pointer items-center justify-center gap-[8px] rounded-[12px] border text-[15px] font-bold" style={{ borderColor: "var(--glass-border)" }}><PenLine className="h-4 w-4" aria-hidden /> Write my own</button>
        </div>
      </ToolSheet>

      {/* typing on a scaled-down page is hard with a thumb: the text opens
         in a full sheet, the page updates behind it */}
      <ToolSheet title="Edit text" open={sheet === "edit"} onClose={close} tall>
        {kind === "recommendation-letter" && draft?.includes(EXAMPLE_PLACEHOLDER) && <p className="text-[13px] font-semibold" style={{ color: "var(--v4-caution, var(--color-feedback-warning))" }}>Add one specific example where the letter asks for it.</p>}
        <textarea value={draft ?? ""} onChange={(e) => setDraft(e.target.value)} className="min-h-[50dvh] w-full flex-1 resize-none rounded-[12px] border p-[14px] text-[16px] leading-[24px] outline-none" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }} />
        <p className="text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>&quot;# &quot; starts a heading, &quot;- &quot; a bullet. Drafts save as you type.</p>
      </ToolSheet>

      <ToolSheet title="Share" open={sheet === "share"} onClose={close}>
        <button type="button" onClick={() => { print(); close(); }} className={sheetBtn} style={{ borderColor: "var(--glass-border)" }}><Printer className="h-4 w-4" aria-hidden /> Print or save as PDF</button>
        <button type="button" onClick={() => { if (draft) void navigator.clipboard?.writeText(plainText(draft)); setCopied(true); window.setTimeout(() => setCopied(false), 1500); }} className={sheetBtn} style={{ borderColor: "var(--glass-border)" }}>{copied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />} {copied ? "Copied" : "Copy text"}</button>
        {student && draft !== null && <button type="button" onClick={() => { addNote(student.id, `${DOC_TITLES[kind]}:\n${plainText(draft)}`); setSavedTo(student.name); }} className={sheetBtn} style={{ borderColor: "var(--glass-border)" }}><Save className="h-4 w-4" aria-hidden /> {savedTo ? `Saved to ${student.name.split(" ")[0]}'s notes` : "Save to notes"}</button>}
        {draft !== null && kind === "recommendation-letter" && student && letterTools?.status(student.id) === "open" && <button type="button" onClick={() => { letterTools.markSent(student, wordCount(draft)); close(); }} className="dm-solid flex min-h-[48px] w-full cursor-pointer items-center justify-center gap-[8px] rounded-[12px] text-[15px] font-bold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}><Send className="h-4 w-4" aria-hidden /> Mark sent</button>}
      </ToolSheet>

      <ToolSheet title="More" open={sheet === "more"} onClose={close} tall>
        <button type="button" onClick={() => { setFull(true); close(); }} className={sheetBtn} style={{ borderColor: "var(--glass-border)" }}>Full screen preview</button>
        {savedList.length > 0 && (
          <div className="flex flex-col gap-[6px]">
            <span className="text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Saved drafts</span>
            {savedList.map((d) => {
              const who = roster.find((x) => x.id === d.studentId);
              return (
                <span key={`${d.studentId}:${d.kind}`} className="flex items-center gap-[6px]">
                  <button type="button" onClick={() => { reopen(d.studentId, d.kind, d.letterType); close(); }} className="dm-quiet flex min-h-[48px] min-w-0 flex-1 cursor-pointer flex-col justify-center rounded-[12px] px-[10px] text-left">
                    <span className="truncate text-[14.5px] font-semibold">{DOC_TITLES[d.kind as DocKind] ?? d.kind}{!fixedStudent && who ? `, ${who.name}` : ""}</span>
                    <span className="text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>Edited {new Date(d.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                  </button>
                  <button type="button" aria-label="Remove draft" onClick={() => removeDraft(d.studentId, d.kind)} className="dm-quiet flex size-11 flex-none cursor-pointer items-center justify-center rounded-full"><X className="h-4 w-4" aria-hidden /></button>
                </span>
              );
            })}
          </div>
        )}
        <div data-counselor-version="v4" className="flex flex-col gap-[14px]">
          {kind === "recommendation-letter" && <SignatureSettings />}
          <SchoolPublicationSettings />
        </div>
      </ToolSheet>
    </>
  );

  return (
    <div className="v4-page v4-studio flex flex-col gap-[var(--space-4)]">
      {!fixedStudent && !modeProp && (
        <Segmented
          ariaLabel="Workspace"
          options={[
            { key: "documents", label: "Documents" },
            { key: "attention", label: `Needs Attention · ${attention.length}` },
          ]}
          value={mode}
          onChange={(k) => setMode(k as Mode)}
        />
      )}

      {mode === "documents" && (
        <>
        <div className="v4-studio-layout grid grid-cols-1 items-start gap-[var(--space-4)] lg:grid-cols-[320px_minmax(0,1fr)]">
          {/* Setup: who, what, then generate. Sticky on a wide screen so
             the controls stay beside the page as it scrolls. */}
          <div className="v4-studio-settings v4-surface flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-4)]" style={TINTED_CARD}>
            {!fixedStudent && (
              <label className="flex min-w-0 flex-col gap-[4px]">
                <span className={labelCls} style={{ color: "var(--muted-foreground)" }}>Student</span>
                <Listbox ariaLabel="Student" value={studentId} onChange={(v) => { setStudentId(v); setLoose(null); setSavedTo(null); }} placeholder="Choose a student" options={students.map((s) => ({ value: s.id, label: `${s.name} · Grade ${s.grade}` }))} className={FIELD} style={fieldStyle} />
              </label>
            )}
            <fieldset className="v4-document-templates"><legend>Choose a Format</legend>{DOC_KINDS.map((k, index) => <button key={k} type="button" aria-pressed={kind === k} onClick={() => { setKind(k); setLoose(null); setSavedTo(null); }}><span className="v4-template-sheet" aria-hidden="true"><b>{String(index+1).padStart(2,"0")}</b><i/><i/><i/></span><span><strong>{DOC_TITLES[k]}</strong><small>{({"recommendation-letter":"A personal endorsement", "brag-sheet":"The student's own words, for a letter", "family-questionnaire":"The family's view, for a letter", "student-brief":"A focused student conversation", "parent-brief":"Progress, context & family support", "meeting-summary":"A recap to send after we meet", "success-plan":"Priorities, owners & next steps"} as Record<DocKind, string>)[k]}</small></span>{kind === k && <Check size={15}/>}</button>)}</fieldset>
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
                  <p className="flex items-start gap-[6px] text-[12px] leading-[16px] font-semibold" style={{ color: "var(--v4-caution)" }}>
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
            {/* v5's letters queue: send the letter from here (8 Oct 2026) */}
            {draft !== null && kind === "recommendation-letter" && student && letterTools?.status(student.id) && (
              letterTools.status(student.id) === "open"
                ? <button type="button" onClick={() => letterTools.markSent(student, wordCount(draft))} className="dm-solid bg-[var(--primary)] text-[var(--primary-foreground)] flex h-10 cursor-pointer items-center justify-center gap-[6px] rounded-[var(--radius-md)] px-[10px] text-[13px] font-bold"><Send className="h-[14px] w-[14px]" aria-hidden /> Mark sent</button>
                : <span className="flex items-center gap-[6px] text-[12.5px] font-bold" style={{ color: "var(--v4-ok)" }}><Check className="h-[13px] w-[13px]" aria-hidden /> Letter sent</span>
            )}
            {savedList.length > 0 && (
              <div className="flex flex-col gap-[6px] border-t pt-[var(--space-4)]" style={{ borderColor: "var(--glass-border)" }}>
                <span className={labelCls} style={{ color: "var(--muted-foreground)" }}>Saved drafts</span>
                <ul className="flex flex-col gap-[2px]">
                  {savedList.map((d) => {
                    const who = roster.find((s) => s.id === d.studentId);
                    const on = student?.id === d.studentId && kind === d.kind;
                    return (
                      <li key={`${d.studentId}:${d.kind}`} className="flex items-center gap-[4px]">
                        <button type="button" onClick={() => reopen(d.studentId, d.kind, d.letterType)} aria-current={on ? "true" : undefined} className="dm-quiet flex min-w-0 flex-1 cursor-pointer flex-col rounded-[var(--radius-sm)] px-[8px] py-[6px] text-left" style={on ? { background: "color-mix(in srgb, var(--primary) 12%, transparent)" } : undefined}>
                          <span className="truncate text-[12.5px] font-bold" style={{ color: "var(--foreground)" }}>{DOC_TITLES[d.kind as DocKind] ?? d.kind}{!fixedStudent && who ? `, ${who.name}` : ""}</span>
                          <span className="text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Edited {new Date(d.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                        </button>
                        <IconTip label="Remove draft"><button type="button" aria-label="Remove draft" onClick={() => removeDraft(d.studentId, d.kind)} className="dm-quiet flex size-[28px] flex-none cursor-pointer items-center justify-center rounded-[6px]" style={{ color: "var(--muted-foreground)" }}><X className="h-[13px] w-[13px]" aria-hidden /></button></IconTip>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            {kind === "recommendation-letter" && <SignatureSettings />}
            <SchoolPublicationSettings />
            {/* Drafts are local until explicitly exported. */}
            <span className="text-[11.5px] font-medium" style={{ color: "var(--muted-foreground)" }}>{student ? "Drafts save as you type." : "Drafts stay here until copied, saved or exported."}</span>
          </div>

          {/* The desk: a darker surface so the page reads as paper. */}
          <div className="v4-publication-desk flex min-w-0 flex-col gap-[10px] rounded-[var(--radius-lg)] border p-[var(--space-3)] sm:p-[var(--space-5)]" style={{ borderColor: "var(--glass-border)", background: "var(--cd-desk)" }}>
            <div className="flex items-center justify-between gap-[8px]">
              <span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{DOC_TITLES[kind]} · US Letter</span>
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
                <div className="v4-draft-shimmer">
                  <PinchZoom><FitPage>{page(pageRef)}</FitPage></PinchZoom>
                  <ConfirmShimmer key={landed} active={landed > 0} />
                </div>
              </SurfaceState>
            </div>
          </div>
          <FullScreenDocument open={full} onClose={() => setFull(false)} title={docTitle} onPrint={print}>{page()}</FullScreenDocument>
        </div>
        {mobileTools}
        </>
      )}

      {mode === "attention" && (
        <div className="v4-surface flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
          <div className="flex flex-wrap items-center justify-between gap-[8px]">
            <h2 className="text-[15px] font-bold" style={{ color: "var(--foreground)" }}>Needs Attention <span className="ml-[4px] text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>ranked, most urgent first</span></h2>
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
            {attention.length === 0 && <li className="v4-today-clear py-[var(--space-5)]"><DreamyMoment mood="celebrate" size={72} /><h3>Everyone Is on Track</h3><p>No students need a plan or a brief right now.</p></li>}
          </ul>
        </div>
      )}

    </div>
  );
}
