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
// switcher at every width, and the freed space goes to the draft, which
// now renders on the same realistic "paper" surface (`PAPER_VARS`) the
// Milestone Tracker/Review Queue's document previews already use, so a
// letter reads like a letter instead of a `<textarea>` in a dark card.
// "Camera tracking," per the resume builder, means the live preview pans
// to what the counselor is doing -- there's one draft, not fielded
// sections to pan between, so the equivalent here is the page scrolling
// itself into view and flashing once when a new draft lands, instead of
// silently repainting off-screen.

import { useEffect, useRef, useState } from "react";
import { FileSignature, MessageSquareText, Users2, ListTodo, AlertTriangle, Sparkles, Megaphone, Check } from "lucide-react";
import { BatchComposer } from "./Batch";
import { CAREER_TRACKS } from "@/lib/counselorRoster";
import { Listbox } from "@/components/app/Listbox";
import { HoverBeam } from "@/components/app/HoverBeam";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { useRouter } from "next/navigation";
import { Copy, Download, Save, PenLine } from "lucide-react";
import { MILESTONE_KEYS, attentionRank, attentionReason, type CounselorStudent } from "@/lib/counselorRoster";
import { addNote } from "@/lib/counselorNotes";
import { Avatar, SelectBox, StatusChip } from "../chips";
import { GLASS_INSET } from "../surfaces";
import { GLASS_CARD as TINTED_CARD } from "../surfaces";
import { ScrollChips } from "../chips";
import { Segmented } from "@/components/connect/viz";
import { PAPER_VARS } from "./DocumentPreview";

type ToolId = "recommendation-letter" | "student-brief" | "parent-brief" | "success-plan" | "attention" | "group-message";

const TOOLS: { id: ToolId; label: string; sub: string; icon: typeof FileSignature }[] = [
  { id: "recommendation-letter", label: "Recommendation Letter", sub: "College · Scholarship · Internship · Employment", icon: FileSignature },
  { id: "student-brief", label: "Student Meeting Brief", sub: "Pre-meeting one-pager", icon: MessageSquareText },
  { id: "parent-brief", label: "Parent Meeting Brief", sub: "Family conference talking points", icon: Users2 },
  { id: "success-plan", label: "Student Success Plan", sub: "Personalized intervention plan", icon: ListTodo },
  { id: "group-message", label: "Group Message", sub: "One message, reminder or to-do to many students", icon: Megaphone },
  { id: "attention", label: "Students Needing Attention", sub: "Auto-prioritized caseload alerts", icon: AlertTriangle },
];

const LETTER_TYPES = ["College Application", "Scholarship", "Internship", "Employment"];

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
  switch (toolId) {
    case "recommendation-letter":
      return `To the ${extra === "Employment" || extra === "Internship" ? "Hiring Manager" : "Admissions Committee"},\n\nIt is my privilege to recommend ${name} for ${extra ? `this ${extra.toLowerCase()} opportunity` : "this opportunity"}. ${first} is a Grade ${student?.grade ?? ""} student on the ${student?.careerTrack ?? "career"} pathway whose top career match is ${top}. ${first} has completed ${approved.length} of ${student?.milestoneCount ?? 11} required milestones this year${approved.length ? `, including ${approved.slice(0, 2).join(" and ")}` : ""}, and is working toward ${student?.postsecondaryIntent === "Undecided" || !student ? "a postsecondary plan" : student.postsecondaryIntent}.\n\n[Add one specific example, then sign.]`;
    case "student-brief":
      return `Meeting brief: ${name}\n\nStatus: ${student?.status ?? "unknown"} · roadmap ${student?.roadmapPct ?? 0}% · ${approved.length} of ${student?.milestoneCount ?? 11} milestones done.\nPathway: ${student?.careerTrack ?? "undeclared"} · top match ${top}.\nOpen items: ${open.length ? open.join(", ") : "none"}.\nTalking points: what went well, the one milestone to finish next, confirm the postsecondary plan (${student?.postsecondaryIntent ?? "not set"}).`;
    case "parent-brief":
      return `Family conference: ${name}\n\n${first} is a Grade ${student?.grade ?? ""} student exploring ${student?.careerTrack ?? "careers"}, with ${top} as a top match. Progress this year: ${approved.length} of ${student?.milestoneCount ?? 11} required milestones complete.\nWhat is next: ${open.length ? open.join(", ") : "keeping pace"}.\nHow the family can help: a regular time each week for ${first} to work on the plan, and a conversation about ${student?.postsecondaryIntent === "Undecided" || !student ? "postsecondary options" : student.postsecondaryIntent}.`;
    case "success-plan":
      return `Success plan: ${name}\n\nGoal: back on pace in 4 to 6 weeks.\nFinish first: ${open[0] ?? "the next milestone"}.\nThen: ${open.slice(1).join(", ") || "review the roadmap"}.\nCheck-in: weekly, 10 minutes, one action each time.\nSupport: ${student?.careerTrack ?? "pathway"} resources on Dreamari, and financial aid guidance if applicable.`;
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

export function ProductivitySuite({ fixedStudent }: { fixedStudent?: CounselorStudent } = {}) {
  const roster = useReviewedRoster();
  const [toolId, setToolId] = useState<ToolId>("recommendation-letter");
  const [studentId, setStudentId] = useState(fixedStudent?.id ?? "");
  const [letterType, setLetterType] = useState("");
  const [draft, setDraft] = useState<string | null>(null);
  const [savedTo, setSavedTo] = useState<string | null>(null);
  const router = useRouter();
  // The "camera" a new draft pans to: there's one page here, not fielded
  // sections, so panning means scrolling the page into view and flashing
  // its border once, rather than silently repainting off-screen.
  const pageRef = useRef<HTMLDivElement>(null);
  const [flash, setFlash] = useState(false);
  const showDraft = (text: string) => {
    setDraft(text);
    setFlash(true);
    pageRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };
  useEffect(() => {
    if (!flash) return;
    const t = window.setTimeout(() => setFlash(false), 900);
    return () => window.clearTimeout(t);
  }, [flash]);
  const tool = TOOLS.find((t) => t.id === toolId)!;
  const students = [...roster].sort((a, b) => a.name.localeCompare(b.name));
  const student = fixedStudent ?? roster.find((s) => s.id === studentId);
  // The attention tool is a real list, not a paragraph: the roster ranked
  // the same way the Overview ranks it, each row opening the profile.
  const attention = [...roster].filter((s) => s.status !== "On Track").sort(attentionRank).slice(0, 10);
  // Group message audience: grade, status, pathway, any combination.
  const [gGrade, setGGrade] = useState("All");
  const [gStatus, setGStatus] = useState("All");
  const [gPathway, setGPathway] = useState("All");
  const [gSent, setGSent] = useState<string | null>(null);
  // Or a hand-picked set (25 Sept 2026: "the batch thing should be in
  // Productivity Suite, not in the Students tab itself").
  const [gMode, setGMode] = useState<"audience" | "pick">("audience");
  const [picked, setPicked] = useState<Set<string>>(() => new Set());
  const [pickSearch, setPickSearch] = useState("");
  const togglePick = (id: string) => setPicked((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  const byAudience = roster.filter((s) => (gGrade === "All" || String(s.grade) === gGrade) && (gStatus === "All" || s.status === gStatus) && (gPathway === "All" || s.careerTrack === gPathway));
  const audience = gMode === "pick" ? students.filter((s) => picked.has(s.id)) : byAudience;
  const audienceLabel = gMode === "pick" ? `${picked.size} picked` : [gGrade === "All" ? "All grades" : `Grade ${gGrade}`, gStatus === "All" ? null : gStatus, gPathway === "All" ? null : gPathway].filter(Boolean).join(" · ");
  const pickList = students.filter((s) => !pickSearch.trim() || s.name.toLowerCase().includes(pickSearch.trim().toLowerCase()));

  const generate = () => {
    setSavedTo(null);
    showDraft(buildDraft(toolId, student, letterType));
  };
  // A blank start with only the headings, for a counselor who would rather
  // write than edit a generated draft (direct instruction, 25 Sept 2026:
  // "make sure a manual option exists everywhere we have AI generated
  // things"). Same editor, same Copy / Download / Save to notes.
  const writeOwn = () => {
    setSavedTo(null);
    const name = student?.name ?? "";
    const skeleton: Record<ToolId, string> = {
      "recommendation-letter": `To whom it may concern,\n\n${name ? `I am writing to recommend ${name}` : "I am writing to recommend "}${letterType ? ` for a ${letterType.toLowerCase()} opportunity` : ""}.\n\n\n\nSincerely,\n`,
      "student-brief": `Meeting brief${name ? `: ${name}` : ""}\n\nStatus:\nRecent activity:\nOpen items:\nTalking points:\n`,
      "parent-brief": `Family conference${name ? `: ${name}` : ""}\n\nProgress this year:\nWhat is next:\nHow the family can help:\n`,
      "success-plan": `Success plan${name ? `: ${name}` : ""}\n\nGoal:\nFinish first:\nThen:\nCheck-in:\nSupport:\n`,
      attention: "",
      "group-message": "",
    };
    showDraft(skeleton[toolId]);
  };
  const download = () => {
    if (!draft) return;
    const url = URL.createObjectURL(new Blob([draft], { type: "text/plain" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${toolId}-${(student?.name ?? "draft").toLowerCase().replace(/\s+/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const visibleTools = TOOLS.filter((t) => !fixedStudent || (t.id !== "attention" && t.id !== "group-message"));
  const isDraftTool = toolId !== "attention" && toolId !== "group-message";

  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      {/* The one switcher at every width -- the desktop left rail this
         used to have spent 228px on five names and still left the draft
         in a plain textarea; that width now goes to the draft itself. */}
      <ScrollChips ariaLabel="Tool" value={toolId} onChange={(k) => { setToolId(k); setDraft(null); }} options={visibleTools.map((t) => ({ key: t.id, label: t.label }))} />

      <HoverBeam strength={0.6} className="h-full min-w-0 flex-1">
        <div className="flex h-full flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
          <h2 className="flex flex-wrap items-baseline gap-x-[8px] gap-y-[2px] text-[15px] font-bold" style={{ color: "var(--foreground)" }}>
            <span className="flex items-center gap-[8px]"><tool.icon className="h-[15px] w-[15px] flex-none" aria-hidden style={{ color: "var(--primary)" }} />{tool.label}</span>
            <span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{tool.sub}</span>
          </h2>

          {toolId === "group-message" ? (
            <div className="flex flex-col gap-[var(--space-3)]">
              <Segmented ariaLabel="Who receives it" options={[{ key: "audience", label: "By audience" }, { key: "pick", label: "Pick students" }]} value={gMode} onChange={(k) => setGMode(k as "audience" | "pick")} />
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
                  <span className="text-[11px] font-bold tracking-[0.04em] uppercase" style={{ color: "var(--muted-foreground)" }}>Grade</span>
                  <Listbox ariaLabel="Grade" value={gGrade} onChange={setGGrade} options={[{ value: "All", label: "All grades" }, ...["9", "10", "11", "12"].map((g) => ({ value: g, label: `Grade ${g}` }))]} className={FIELD} style={fieldStyle} />
                </label>
                <label className="flex min-w-0 flex-col gap-[4px]">
                  <span className="text-[11px] font-bold tracking-[0.04em] uppercase" style={{ color: "var(--muted-foreground)" }}>Status</span>
                  <Listbox ariaLabel="Status" value={gStatus} onChange={setGStatus} options={[{ value: "All", label: "All statuses" }, ...["On Track", "Needs Attention", "At Risk"].map((v) => ({ value: v, label: v }))]} className={FIELD} style={fieldStyle} />
                </label>
                <label className="flex min-w-0 flex-col gap-[4px]">
                  <span className="text-[11px] font-bold tracking-[0.04em] uppercase" style={{ color: "var(--muted-foreground)" }}>Pathway</span>
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
          ) : toolId === "attention" ? (
            <ul className="flex flex-col gap-[6px]">
              {attention.map((s) => (
                <li key={s.id}>
                  <button type="button" onClick={() => router.push(`/counselor?view=students&studentId=${s.id}`)} className="dm-quiet flex w-full cursor-pointer flex-wrap items-center gap-x-[12px] gap-y-[4px] rounded-[var(--radius-md)] border px-[12px] py-[8px] text-left" style={GLASS_INSET}>
                    <Avatar name={s.name} size={32} index={s.avatarIndex} />
                    <span className="flex min-w-0 flex-1 flex-col leading-tight">
                      <span className="truncate text-[13px] font-bold" style={{ color: "var(--foreground)" }}>{s.name}</span>
                      <span className="truncate text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Grade {s.grade} · {attentionReason(s)}</span>
                    </span>
                    <StatusChip status={s.status} />
                  </button>
                </li>
              ))}
              {attention.length === 0 && <li className="text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Everyone is on track.</li>}
            </ul>
          ) : (
          <div className="grid grid-cols-1 gap-[var(--space-3)] sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:items-end lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
            {!fixedStudent && (
              <label className="flex min-w-0 flex-col gap-[4px]">
                <span className="text-[11px] font-bold tracking-[0.04em] uppercase" style={{ color: "var(--muted-foreground)" }}>Student</span>
                <Listbox ariaLabel="Student" value={studentId} onChange={setStudentId} placeholder="Choose a student" options={students.map((s) => ({ value: s.id, label: `${s.name} · Grade ${s.grade}` }))} className={FIELD} style={fieldStyle} />
              </label>
            )}
            {toolId === "recommendation-letter" && (
              <label className="flex min-w-0 flex-col gap-[4px]">
                <span className="text-[11px] font-bold tracking-[0.04em] uppercase" style={{ color: "var(--muted-foreground)" }}>Letter type</span>
                <Listbox ariaLabel="Letter type" value={letterType} onChange={setLetterType} placeholder="Choose a type" options={LETTER_TYPES.map((t) => ({ value: t, label: t }))} className={FIELD} style={fieldStyle} />
              </label>
            )}
            <div className="flex gap-[8px]">
              <button type="button" onClick={generate} disabled={!studentId} className="dm-solid bg-[var(--primary)] text-[var(--primary-foreground)] flex h-10 cursor-pointer items-center justify-center gap-[6px] rounded-[var(--radius-md)] px-[16px] text-[13.5px] font-bold disabled:cursor-not-allowed disabled:opacity-50">
                <Sparkles className="h-[14px] w-[14px]" aria-hidden /> Generate draft
              </button>
              <button type="button" onClick={writeOwn} className="dm-quiet flex h-10 cursor-pointer items-center justify-center gap-[6px] rounded-[var(--radius-md)] border px-[14px] text-[13.5px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
                <PenLine className="h-[14px] w-[14px]" aria-hidden /> Write my own
              </button>
            </div>
          </div>
          )}

          {draft !== null && toolId !== "attention" && toolId !== "group-message" && (
            <div className="flex flex-col gap-[10px]">
              <div className="flex flex-wrap items-center justify-between gap-[8px]">
                <span className="text-[12px] font-bold tracking-[0.04em] uppercase" style={{ color: "var(--muted-foreground)" }}>Draft{student ? ` · ${student.name}` : ""}</span>
                <span className="flex flex-wrap gap-[6px]">
                  <button type="button" onClick={() => { void navigator.clipboard?.writeText(draft); }} className="dm-quiet flex h-8 cursor-pointer items-center gap-[5px] rounded-full border px-[10px] text-[12px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}><Copy className="h-[13px] w-[13px]" aria-hidden /> Copy</button>
                  <button type="button" onClick={download} className="dm-quiet flex h-8 cursor-pointer items-center gap-[5px] rounded-full border px-[10px] text-[12px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}><Download className="h-[13px] w-[13px]" aria-hidden /> Download</button>
                  {student && <button type="button" onClick={() => { addNote(student.id, `${tool.label}:\n${draft}`); setSavedTo(student.name); }} className="dm-quiet flex h-8 cursor-pointer items-center gap-[5px] rounded-full border px-[10px] text-[12px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}><Save className="h-[13px] w-[13px]" aria-hidden /> {savedTo ? "Saved to notes" : "Save to notes"}</button>}
                </span>
              </div>
              {/* The same realistic-paper surface the document previews
                 use elsewhere (PAPER_VARS), not a dark textarea -- a
                 letter reads like a letter. Still a real, editable
                 textarea underneath; only the surface changed. The
                 border flashes once when a new draft lands (the "camera"
                 this single-page tool has to pan to). */}
              <div
                ref={pageRef}
                className="rounded-[2px] p-[4px] transition-[box-shadow] duration-300"
                style={{ ...PAPER_VARS, background: "var(--paper)", boxShadow: flash ? "0 0 0 2px var(--primary), 0 12px 32px -12px rgba(0,0,0,0.4)" : "0 12px 32px -12px rgba(0,0,0,0.4)" }}
              >
                <div className="mb-[10px] flex items-center justify-between border-b px-[8px] pt-[4px] pb-[10px]" style={{ borderColor: "var(--rule)" }}>
                  <span className="text-[10.5px] font-bold tracking-[0.08em] uppercase" style={{ color: "var(--ink-faint)" }}>{tool.label}</span>
                  {student && <span className="text-[10.5px] font-semibold" style={{ color: "var(--ink-faint)" }}>{student.name} · Grade {student.grade}</span>}
                </div>
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={12}
                  aria-label="Draft"
                  className="w-full resize-y px-[8px] pb-[8px] text-[13.5px] leading-[21px] outline-none"
                  style={{ background: "transparent", color: "var(--ink)", fontFamily: "var(--font-serif, ui-serif, Georgia, serif)" }}
                />
              </div>
            </div>
          )}

          {/* A resting editor pane, not a void: before Generate or Write my
             own is pressed, a draft tool still shows the shape of its own
             workspace instead of empty space under the button row. */}
          {draft === null && isDraftTool && (
            <div className="flex min-h-[160px] flex-1 flex-col items-center justify-center gap-[6px] rounded-[var(--radius-md)] border border-dashed p-[var(--space-6)] text-center" style={{ borderColor: "var(--glass-border)" }}>
              <Sparkles className="h-[18px] w-[18px]" aria-hidden style={{ color: "var(--muted-foreground)" }} />
              <span className="text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Generate a draft, or write your own, to fill this in.</span>
            </div>
          )}
        </div>
      </HoverBeam>
    </div>
  );
}
