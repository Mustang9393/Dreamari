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

import { useState } from "react";
import { FileSignature, MessageSquareText, Users2, ListTodo, AlertTriangle, Sparkles } from "lucide-react";
import { Segmented } from "@/components/connect/viz";
import { Listbox } from "@/components/app/Listbox";
import { HoverBeam } from "@/components/app/HoverBeam";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { GLASS_CARD as TINTED_CARD } from "../surfaces";

type ToolId = "recommendation-letter" | "student-brief" | "parent-brief" | "success-plan" | "attention";

const TOOLS: { id: ToolId; label: string; sub: string; icon: typeof FileSignature; desc: string }[] = [
  { id: "recommendation-letter", label: "Recommendation Letter", sub: "College · Scholarship · Internship · Employment", icon: FileSignature, desc: "Generate a personalized recommendation letter using each student's career report, resume, assessments, reflections, milestones, activities, and counselor notes. Tailored to the application type and audience." },
  { id: "student-brief", label: "Student Meeting Brief", sub: "Pre-meeting one-pager", icon: MessageSquareText, desc: "Generate a one-page overview before a student meeting — covering career interests, milestone progress, missing requirements, suggested discussion topics, and recommended next steps." },
  { id: "parent-brief", label: "Parent Meeting Brief", sub: "Family conference talking points", icon: Users2, desc: "Generate talking points before a parent-teacher or parent-counselor conference — summarizing student progress, career readiness, academic planning, areas needing attention, and recommended action steps." },
  { id: "success-plan", label: "Student Success Plan", sub: "Personalized intervention plan", icon: ListTodo, desc: "Generate a personalized intervention plan for students who are behind — including missing milestones, recommended Dreamari activities, career simulations, suggested professional connections, and counselor follow-up recommendations." },
  { id: "attention", label: "Students Needing Attention", sub: "Auto-prioritized caseload alerts", icon: AlertTriangle, desc: "Automatically identify and prioritize students requiring counselor follow-up based on engagement, milestone completion, missing plans, and other risk indicators. No student selection needed — Dreamari does the analysis." },
];

const LETTER_TYPES = ["College Application", "Scholarship", "Internship", "Employment"];

function buildDraft(toolId: ToolId, studentName: string, extra: string): string {
  switch (toolId) {
    case "recommendation-letter":
      return `To the Admissions Committee,\n\nIt is my privilege to recommend ${studentName} for ${extra || "this opportunity"}. Over the course of our work together, I've watched ${studentName.split(" ")[0]} take real ownership of their own path — completing every milestone on their plan, engaging thoughtfully with career exploration, and building a resume that reflects genuine initiative.\n\n[Draft continues — review, personalize with specific examples, and edit before sending.]`;
    case "student-brief":
      return `Meeting Brief — ${studentName}\n\nCurrent status: on pace, milestones largely on track.\nRecent activity: engaged with career exploration and saved matches this month.\nOpen items: review any pending milestones together and confirm next steps.\nSuggested talking points: celebrate recent progress, confirm postsecondary intention, set one concrete next action before the next check-in.`;
    case "parent-brief":
      return `Family Conference Notes — ${studentName}\n\n${studentName.split(" ")[0]} is actively working through their postsecondary plan. In plain terms: they've explored several career paths, saved a shortlist of strong matches, and are making steady progress on their academic and career milestones.\n\nSuggested talking points: what's going well, what needs a decision soon, and how the family can support the next step.`;
    case "success-plan":
      return `Success Plan — ${studentName}\n\nGoal: get back on pace over the next 4–6 weeks.\nNext milestones: complete the next 2 outstanding items on their plan.\nCheck-in cadence: weekly, 10 minutes, focused on one action item at a time.\nSupport: connect to relevant resources (tutoring, application help, financial aid guidance) as needed.`;
    case "attention":
      return `Prioritized list generated from your current caseload — students sorted by overdue milestones, approaching deadlines, and drop in recent activity. Review the list, then use Student Meeting Brief for anyone you want to follow up with directly.`;
  }
}

const FIELD = "flex h-10 w-full cursor-pointer items-center justify-between gap-[8px] rounded-[var(--radius-sm)] border px-[10px] text-left text-[13px] font-semibold";
const fieldStyle = { background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" } as const;

export function ProductivitySuite() {
  const roster = useReviewedRoster();
  const [toolId, setToolId] = useState<ToolId>("recommendation-letter");
  const [studentId, setStudentId] = useState("");
  const [letterType, setLetterType] = useState("");
  const [draft, setDraft] = useState<string | null>(null);
  const tool = TOOLS.find((t) => t.id === toolId)!;
  const students = [...roster].sort((a, b) => a.name.localeCompare(b.name));

  const generate = () => {
    const student = roster.find((s) => s.id === studentId);
    setDraft(buildDraft(toolId, student?.name ?? "your student", letterType));
  };

  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      <Segmented ariaLabel="Tool" value={toolId} onChange={(k) => { setToolId(k); setDraft(null); }} options={TOOLS.map((t) => ({ key: t.id, label: t.label }))} />

      <HoverBeam strength={0.6} className="h-full">
        <div className="flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
          <div className="flex flex-col gap-[4px]">
            <h2 className="flex items-center gap-[8px] text-[15px] font-bold" style={{ color: "var(--foreground)" }}>
              <tool.icon className="h-[15px] w-[15px] flex-none" aria-hidden style={{ color: "var(--primary)" }} />{tool.label}
              <span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{tool.sub}</span>
            </h2>
            <p className="max-w-[72ch] text-[13px] leading-[18px]" style={{ color: "var(--muted-foreground)" }}>{tool.desc.split(/(?<=\.)\s/)[0]}</p>
          </div>

          <div className="grid grid-cols-1 gap-[var(--space-3)] sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
            {toolId !== "attention" && (
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
            <button type="button" onClick={generate} disabled={toolId !== "attention" && !studentId} className="dm-solid bg-[var(--primary)] text-[var(--primary-foreground)] flex h-10 cursor-pointer items-center justify-center gap-[6px] rounded-[var(--radius-md)] px-[16px] text-[13.5px] font-bold disabled:cursor-not-allowed disabled:opacity-50">
              <Sparkles className="h-[14px] w-[14px]" aria-hidden /> Generate draft
            </button>
          </div>
          <p className="text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>A first draft from the student&apos;s Dreamari data. Review and edit before you use it.</p>

          {draft && (
            <div className="flex flex-col gap-[8px] rounded-[var(--radius-md)] border p-[var(--space-4)]" style={{ borderColor: "color-mix(in srgb, var(--primary) 50%, var(--glass-border))", background: "color-mix(in srgb, #FFFFFF 7%, transparent)" }}>
              <span className="text-[12px] font-bold tracking-[0.04em] uppercase" style={{ color: "var(--muted-foreground)" }}>Draft</span>
              <p className="text-[13px] leading-[20px] whitespace-pre-line" style={{ color: "var(--foreground)" }}>{draft}</p>
            </div>
          )}
        </div>
      </HoverBeam>
    </div>
  );
}
