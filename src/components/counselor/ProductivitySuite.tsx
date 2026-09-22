"use client";

import { useState } from "react";
import { FileSignature, MessageSquareText, Users2, ListTodo, AlertTriangle, ShieldCheck, Sparkles } from "lucide-react";
import { HoverBeam } from "@/components/app/HoverBeam";
import { getRoster } from "@/lib/counselorRoster";

import { GLASS_CARD as TINTED_CARD } from "./surfaces";

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

export function ProductivitySuite() {
  const roster = getRoster();
  const [toolId, setToolId] = useState<ToolId>("recommendation-letter");
  const [studentId, setStudentId] = useState("");
  const [letterType, setLetterType] = useState("");
  const [draft, setDraft] = useState<string | null>(null);
  const tool = TOOLS.find((t) => t.id === toolId)!;

  const generate = () => {
    const student = roster.find((s) => s.id === studentId);
    setDraft(buildDraft(toolId, student?.name ?? "your student", letterType));
  };

  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      <div className="flex items-start gap-[10px] rounded-[var(--radius-lg)] border p-[var(--space-4)]" style={{ borderColor: "var(--glass-border)", background: "color-mix(in srgb, var(--primary) 10%, var(--card))" }}>
        <ShieldCheck className="mt-[2px] h-[16px] w-[16px] flex-none" aria-hidden style={{ color: "var(--primary)" }} />
        <p className="text-[13px] leading-[19px]" style={{ color: "var(--foreground)" }}>
          <b>You are always in control.</b> Every document generated here is a draft — designed to save you time, not replace your judgment. Review, edit, and approve every document before sharing or acting on it.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-[300px_1fr]">
        <div className="flex flex-col gap-[6px]">
          <span className="px-[4px] text-[12px] font-bold tracking-[0.04em] uppercase" style={{ color: "var(--muted-foreground)" }}>Choose a Tool</span>
          {TOOLS.map((t) => {
            const Icon = t.icon;
            const on = t.id === toolId;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => { setToolId(t.id); setDraft(null); }}
                className="dm-quiet flex cursor-pointer items-start gap-[10px] rounded-[var(--radius-md)] px-[var(--space-3)] py-[10px] text-left"
                style={{ background: on ? "color-mix(in srgb, var(--primary) 16%, transparent)" : "transparent" }}
              >
                <Icon className="mt-[1px] h-[15px] w-[15px] flex-none" aria-hidden style={{ color: on ? "var(--primary)" : "var(--muted-foreground)" }} />
                <span className="flex flex-col gap-[1px]">
                  <span className="text-[13px] font-bold" style={{ color: on ? "var(--foreground)" : "var(--muted-foreground)" }}>{t.label}</span>
                  <span className="text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{t.sub}</span>
                </span>
              </button>
            );
          })}
        </div>

        <HoverBeam strength={0.6} className="h-full">
          <div className="flex h-full flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
            <span className="flex items-center gap-[10px]">
              <span className="flex size-[30px] flex-none items-center justify-center rounded-[var(--radius-sm)]" style={{ background: "color-mix(in srgb, var(--primary) 18%, transparent)", color: "var(--primary)" }}>
                <tool.icon className="h-[15px] w-[15px]" aria-hidden />
              </span>
              <h2 className="text-[15px] font-bold" style={{ color: "var(--foreground)" }}>{tool.label}</h2>
            </span>
            <p className="text-[13.5px] leading-[19px]" style={{ color: "var(--muted-foreground)" }}>{tool.desc}</p>

            {toolId !== "attention" && (
              <div className="flex flex-col gap-[var(--space-3)] rounded-[var(--radius-md)] border p-[var(--space-4)]" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
                <span className="text-[12px] font-bold tracking-[0.04em] uppercase" style={{ color: "var(--muted-foreground)" }}>Configure &amp; Generate</span>
                <label className="flex flex-col gap-[4px]">
                  <span className="text-[12.5px] font-semibold" style={{ color: "var(--foreground)" }}>Select Student</span>
                  <select value={studentId} onChange={(e) => setStudentId(e.target.value)} className="h-10 cursor-pointer rounded-[var(--radius-sm)] border px-[10px] text-[13px] outline-none" style={{ background: "var(--card)", borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
                    <option value="" style={{ color: "#000" }}>Choose a student...</option>
                    {roster.slice(0, 30).map((s) => <option key={s.id} value={s.id} style={{ color: "#000" }}>{s.name} (Grade {s.grade})</option>)}
                  </select>
                </label>
                {toolId === "recommendation-letter" && (
                  <label className="flex flex-col gap-[4px]">
                    <span className="text-[12.5px] font-semibold" style={{ color: "var(--foreground)" }}>Letter Type</span>
                    <select value={letterType} onChange={(e) => setLetterType(e.target.value)} className="h-10 cursor-pointer rounded-[var(--radius-sm)] border px-[10px] text-[13px] outline-none" style={{ background: "var(--card)", borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
                      <option value="" style={{ color: "#000" }}>Select letter type...</option>
                      {LETTER_TYPES.map((t) => <option key={t} value={t} style={{ color: "#000" }}>{t}</option>)}
                    </select>
                  </label>
                )}
                <button type="button" onClick={generate} disabled={!studentId} className="dm-solid bg-[var(--primary)] text-[var(--primary-foreground)] flex h-10 cursor-pointer items-center justify-center gap-[6px] rounded-[var(--radius-md)] text-[13.5px] font-bold disabled:cursor-not-allowed disabled:opacity-50">
                  <Sparkles className="h-[14px] w-[14px]" aria-hidden /> Generate Draft
                </button>
                <p className="text-[11.5px]" style={{ color: "var(--muted-foreground)" }}>Dreamari will generate a first draft using available student data. You review, edit, and approve — your professional judgment is what matters.</p>
              </div>
            )}
            {toolId === "attention" && (
              <div className="flex flex-col gap-[var(--space-3)] rounded-[var(--radius-md)] border p-[var(--space-4)]" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
                <span className="text-[12px] font-bold tracking-[0.04em] uppercase" style={{ color: "var(--muted-foreground)" }}>Configure &amp; Generate</span>
                <p className="text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>This tool analyzes your entire caseload automatically — no student selection needed.</p>
                <button type="button" onClick={generate} className="dm-solid bg-[var(--primary)] text-[var(--primary-foreground)] flex h-10 w-fit cursor-pointer items-center justify-center gap-[6px] rounded-[var(--radius-md)] px-[16px] text-[13.5px] font-bold">
                  <Sparkles className="h-[14px] w-[14px]" aria-hidden /> Generate Draft
                </button>
                <p className="text-[11.5px]" style={{ color: "var(--muted-foreground)" }}>Dreamari will generate a first draft using available student data. You review, edit, and approve — your professional judgment is what matters.</p>
              </div>
            )}

            {draft && (
              <div className="flex flex-col gap-[8px] rounded-[var(--radius-md)] border p-[var(--space-4)]" style={{ borderColor: "var(--primary)", background: "color-mix(in srgb, var(--primary) 8%, var(--card))" }}>
                <span className="text-[12px] font-bold tracking-[0.04em] uppercase" style={{ color: "var(--primary)" }}>Draft</span>
                <p className="text-[13px] leading-[20px] whitespace-pre-line" style={{ color: "var(--foreground)" }}>{draft}</p>
              </div>
            )}
          </div>
        </HoverBeam>
      </div>
    </div>
  );
}
