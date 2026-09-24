"use client";

// DEMO-ONLY v2 fork of ../CounselorConnect.tsx (24 Sept 2026). v1 stays untouched so the
// two builds can be compared live via the bottom-center version chip
// (../version.tsx). Changes from the 24 Sept audit land here.

// 25 Sept 2026 pass under the v2 budget: opens on Student Questions (the
// tab with work in it), questions sorted so unanswered come first with one
// status pill as the only color, a one-line detail header instead of a
// metadata grid, announcements with plain dates, discussions as a compact
// list ordered by activity. Data is the reference's, verbatim.

import { useState } from "react";
import { Plus, Send, Check } from "lucide-react";
import { HoverBeam } from "@/components/app/HoverBeam";
import { Segmented } from "@/components/connect/viz";
import { Avatar, STATUS_COLORS } from "../chips";
import { GLASS_CARD as TINTED_CARD, GLASS_INSET } from "../surfaces";
import { BLUE_3 } from "../palette";
import { Stat } from "./overviewShared";

function fmtDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export const ANNOUNCEMENTS = [
  { id: "a1", title: "FAFSA Deadline Approaching", to: "Grade 12 · Sent: 2026-09-10", read: 87, body: "Reminder: the priority deadline for fall admission is February 1st. All seniors should have their FAFSA submitted by this date to maximize financial aid opportunities.", tags: ["Related: Financial Aid Status", "Read Receipt Required", "Acknowledgment Required"] },
  { id: "a2", title: "Career Fair Next Week", to: "All Students · Sent: 2026-09-08", read: 72, body: "Annual Career Exploration Fair will be held on January 22nd in the gymnasium. Over 40 local employers and college representatives will be present. All students encouraged to attend.", tags: [] },
  { id: "a3", title: "Resume Workshop This Friday", to: "Grades 11-12 · Sent: 2026-09-12", read: 64, body: "Join us for a resume writing workshop this Friday after school in the library. We'll cover formatting, content, and how to highlight your achievements. Pizza will be served!", tags: ["Related: Resume"] },
];

type QuestionStatus = "new" | "viewed" | "in-progress" | "responded" | "resolved" | "follow-up";

// All 15, copied verbatim off the live reference (name/grade/status/
// question/category/date -- clicked through every card). "Related
// Milestone" is confirmed per-category from the 5 detail panels actually
// opened (Career Exploration, Applications, Academic Planning/Course
// Selection, Personal Support); the remaining categories (College Search,
// Financial Aid, Resume, Recommendations, Graduation) map onto this
// dashboard's own MILESTONE_KEYS naming where an obvious match exists,
// left blank where it doesn't (Graduation has no MILESTONE_KEYS analog).
export const QUESTIONS: { id: string; name: string; grade: number; question: string; tag: string; date: string; status: QuestionStatus; milestone?: string }[] = [
  { id: "q1", name: "Olivia Chen", grade: 11, question: "I'm interested in both graphic design and animation. How do I decide which career pathway to choose? Can I explore both?", tag: "Career Exploration", date: "2026-09-14", status: "new", milestone: "Career Pathway Selection" },
  { id: "q2", name: "Charlotte Davis", grade: 12, question: "I missed the early action deadline for my top choice. Should I still apply regular decision or is it too late?", tag: "Applications", date: "2026-09-13", status: "new", milestone: "Application Progress" },
  { id: "q3", name: "Jackson Thomas", grade: 11, question: "Should I take AP Economics or AP Psychology next year? Which would be better for a business major?", tag: "Academic Planning", date: "2026-09-12", status: "viewed", milestone: "Academic Plan" },
  { id: "q4", name: "Isabella Santos", grade: 11, question: "How many colleges should I have on my list? I currently have 15 but I'm not sure if that's too many.", tag: "College Search", date: "2026-09-11", status: "in-progress", milestone: "College List" },
  { id: "q5", name: "Sebastian Wilson", grade: 11, question: "Are there any local internships for high school students interested in film production?", tag: "Career Exploration", date: "2026-09-10", status: "responded", milestone: "Career Pathway Selection" },
  { id: "q6", name: "Elizabeth Wilson", grade: 12, question: "My parents don't have all their tax documents ready yet. Can I still submit my FAFSA or should I wait?", tag: "Financial Aid", date: "2026-09-09", status: "responded", milestone: "Financial Aid" },
  { id: "q7", name: "Lucas Miller", grade: 9, question: "What electives should I take next year if I want to pursue graphic design?", tag: "Course Selection", date: "2026-09-15", status: "new", milestone: "Academic Plan" },
  { id: "q8", name: "Marcus Thompson", grade: 11, question: "Should I include my job at the grocery store on my resume even though it's not related to healthcare?", tag: "Resume", date: "2026-09-14", status: "viewed", milestone: "Resume" },
  { id: "q9", name: "Emma Rodriguez", grade: 12, question: "One of my teachers hasn't submitted my recommendation letter yet and the deadline is next week. What should I do?", tag: "Recommendations", date: "2026-09-13", status: "in-progress", milestone: "Recommendation Letter" },
  { id: "q10", name: "Sophia Kim", grade: 12, question: "I'm feeling really stressed about college decisions. Do you have time to talk this week?", tag: "Personal Support", date: "2026-09-12", status: "responded" },
  { id: "q11", name: "Joseph Hernandez", grade: 10, question: "How can I find out more about careers in video game design?", tag: "Career Exploration", date: "2026-09-11", status: "follow-up", milestone: "Career Pathway Selection" },
  { id: "q12", name: "Ethan Garcia", grade: 11, question: "What's the difference between business administration and business management majors?", tag: "College Search", date: "2026-09-10", status: "resolved", milestone: "College List" },
  { id: "q13", name: "Daniel Thomas", grade: 10, question: "Do I need to take physics if I want to be a nurse?", tag: "Academic Planning", date: "2026-09-15", status: "new", milestone: "Academic Plan" },
  { id: "q14", name: "Diego Martinez", grade: 12, question: "The trade school application asks for a personal statement. Is this the same as a college essay?", tag: "Applications", date: "2026-09-14", status: "viewed", milestone: "Application Progress" },
  { id: "q15", name: "Mia Johnson", grade: 12, question: "I want to confirm I'm on track to graduate. Can we review my transcript together?", tag: "Graduation", date: "2026-09-13", status: "responded" },
];

// Color only where the counselor owes something: a new question and a
// follow-up are amber; viewed and in progress are a light blue (someone is
// on it); answered states are neutral. Order is the order to act in.
const STATUS_STYLE: Record<QuestionStatus, { label: string; color: string; rank: number }> = {
  new: { label: "New", color: STATUS_COLORS["Needs Attention"], rank: 0 },
  "follow-up": { label: "Follow up", color: STATUS_COLORS["Needs Attention"], rank: 1 },
  viewed: { label: "Viewed", color: BLUE_3[0], rank: 2 },
  "in-progress": { label: "In progress", color: BLUE_3[0], rank: 3 },
  responded: { label: "Responded", color: "var(--muted-foreground)", rank: 4 },
  resolved: { label: "Resolved", color: "var(--muted-foreground)", rank: 5 },
};
const OPEN: QuestionStatus[] = ["new", "follow-up", "viewed", "in-progress"];

const COMMUNITIES = [
  { name: "Grade 9 Planning", desc: "Academic planning, course selection, and getting started with career exploration", members: 142, posts: 87, last: "2026-09-15" },
  { name: "Grade 10 Career Exploration", desc: "Discovering career pathways, internships, and summer opportunities", members: 138, posts: 103, last: "2026-09-15" },
  { name: "Grade 11 College Planning", desc: "College search, standardized testing, campus visits, and building your college list", members: 145, posts: 156, last: "2026-09-14" },
  { name: "Grade 12 Applications", desc: "Application support, essay writing, deadlines, and decision strategies", members: 134, posts: 198, last: "2026-09-15" },
  { name: "FAFSA Support", desc: "Financial aid questions, FAFSA help, and scholarship opportunities", members: 267, posts: 142, last: "2026-09-14" },
  { name: "Scholarship Opportunities", desc: "Sharing scholarship information, tips, and success stories", members: 289, posts: 124, last: "2026-09-13" },
  { name: "Career Pathways: Technology", desc: "For students exploring careers in software, engineering, IT, and tech", members: 78, posts: 65, last: "2026-09-15" },
  { name: "Career Pathways: Healthcare", desc: "For students interested in medicine, nursing, healthcare, and life sciences", members: 92, posts: 71, last: "2026-09-14" },
  { name: "Skilled Trades & Technical Careers", desc: "Apprenticeships, trade schools, and technical career pathways", members: 54, posts: 48, last: "2026-09-13" },
  { name: "Summer Opportunities", desc: "Summer programs, internships, jobs, and volunteer opportunities", members: 312, posts: 176, last: "2026-09-15" },
];

function AnnouncementCard({ a }: { a: (typeof ANNOUNCEMENTS)[number] }) {
  const [to, sent] = a.to.split(" · Sent: ");
  return (
    <HoverBeam strength={0.6} className="h-full">
      <div className="flex h-full flex-col gap-[8px] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
        <div className="flex flex-wrap items-baseline justify-between gap-x-[var(--space-3)] gap-y-[2px]">
          <span className="flex min-w-0 flex-wrap items-baseline gap-x-[8px]">
            <h3 className="text-[15px] font-bold" style={{ color: "var(--foreground)" }}>{a.title}</h3>
            <span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{to} · {fmtDate(sent)}</span>
          </span>
          <span className="flex-none text-[13px] font-bold tabular-nums" style={{ color: "var(--foreground)" }}>{a.read}% <span className="font-semibold" style={{ color: "var(--muted-foreground)" }}>read</span></span>
        </div>
        <p className="text-[13.5px] leading-[19px]" style={{ color: "var(--foreground)" }}>{a.body}</p>
        {a.tags.length > 0 && (
          <span className="flex flex-wrap gap-[6px] pt-[2px]">
            {a.tags.map((t) => <span key={t} className="rounded-full border px-[9px] py-[3px] text-[11px] font-semibold" style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}>{t.replace(/^Related: /, "")}</span>)}
          </span>
        )}
      </div>
    </HoverBeam>
  );
}

function StatusPill({ status }: { status: QuestionStatus }) {
  const s = STATUS_STYLE[status];
  return (
    <span className="flex flex-none items-center gap-[4px] rounded-full px-[8px] py-[2px] text-[10.5px] font-extrabold tracking-[0.02em] uppercase" style={{ background: `color-mix(in srgb, ${s.color} 16%, transparent)`, color: s.color }}>
      {status === "resolved" && <Check className="h-[9px] w-[9px]" strokeWidth={3} aria-hidden />}
      {s.label}
    </span>
  );
}

function QuestionsPanel({ statuses, setStatus }: { statuses: Record<string, QuestionStatus>; setStatus: (id: string, s: QuestionStatus) => void }) {
  const statusOf = (id: string) => statuses[id] ?? QUESTIONS.find((q) => q.id === id)!.status;
  // Unanswered first, then by date within each state.
  const ordered = [...QUESTIONS].sort((a, b) => STATUS_STYLE[statusOf(a.id)].rank - STATUS_STYLE[statusOf(b.id)].rank || b.date.localeCompare(a.date));
  const [selectedId, setSelectedId] = useState(ordered[0].id);
  const [response, setResponse] = useState("");
  const selected = QUESTIONS.find((q) => q.id === selectedId)!;
  const selectedStatus = statusOf(selected.id);
  const answered = selectedStatus === "responded" || selectedStatus === "resolved";

  return (
    <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-[360px_1fr]">
      <div className="flex max-h-[70vh] flex-col gap-[8px] overflow-y-auto pr-[2px] [scrollbar-width:thin]">
        {ordered.map((q) => {
          const on = selectedId === q.id;
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => { setSelectedId(q.id); setResponse(""); }}
              aria-pressed={on}
              className="dm-quiet flex w-full cursor-pointer flex-col gap-[6px] rounded-[var(--radius-md)] border px-[12px] py-[10px] text-left"
              style={{ ...GLASS_INSET, borderColor: on ? "color-mix(in srgb, var(--primary) 60%, var(--glass-border))" : GLASS_INSET.borderColor, background: on ? "color-mix(in srgb, var(--primary) 12%, transparent)" : GLASS_INSET.background }}
            >
              <span className="flex items-center justify-between gap-[10px]">
                <span className="flex min-w-0 items-center gap-[10px]">
                  <Avatar name={q.name} size={30} />
                  <span className="flex min-w-0 flex-col leading-tight">
                    <span className="truncate text-[13.5px] font-bold" style={{ color: "var(--foreground)" }}>{q.name}</span>
                    <span className="truncate text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Grade {q.grade} · {q.tag} · {fmtDate(q.date)}</span>
                  </span>
                </span>
                <StatusPill status={statusOf(q.id)} />
              </span>
              <p className="line-clamp-2 text-[12.5px] leading-[17px]" style={{ color: "var(--foreground)" }}>{q.question}</p>
            </button>
          );
        })}
      </div>
      <HoverBeam strength={0.5} className="h-full">
        <div className="flex h-full flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
          <div className="flex flex-wrap items-start justify-between gap-[var(--space-3)]">
            <div className="flex min-w-0 items-center gap-[12px]">
              <Avatar name={selected.name} size={44} />
              <div className="flex min-w-0 flex-col gap-[2px]">
                <h2 className="text-[17px] leading-[1.2] font-bold" style={{ color: "var(--foreground)" }}>{selected.name}</h2>
                <span className="text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Grade {selected.grade} · {selected.tag} · {fmtDate(selected.date)}{selected.milestone ? ` · ${selected.milestone}` : ""}</span>
              </div>
            </div>
            <StatusPill status={selectedStatus} />
          </div>
          <p className="rounded-[var(--radius-md)] border p-[var(--space-4)] text-[14px] leading-[21px]" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)", color: "var(--foreground)" }}>{selected.question}</p>
          {answered ? (
            <p className="text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{selectedStatus === "resolved" ? "Resolved." : "You have replied."}</p>
          ) : (
            <>
              <div className="flex flex-col gap-[6px]">
                <label htmlFor="connect-response" className="text-[12px] font-bold tracking-[0.04em] uppercase" style={{ color: "var(--muted-foreground)" }}>Your reply</label>
                <textarea
                  id="connect-response"
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder={`Reply to ${selected.name.split(" ")[0]}`}
                  rows={4}
                  className="w-full resize-none rounded-[var(--radius-md)] border px-[12px] py-[10px] text-[13px] outline-none"
                  style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" }}
                />
              </div>
              <div className="mt-auto flex gap-[10px]">
                <button
                  type="button"
                  disabled={response.trim().length === 0}
                  onClick={() => { setStatus(selected.id, "responded"); setResponse(""); }}
                  className="dm-solid bg-[var(--primary)] text-[var(--primary-foreground)] flex h-10 flex-1 cursor-pointer items-center justify-center gap-[6px] rounded-[var(--radius-md)] text-[13.5px] font-bold disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send className="h-[14px] w-[14px]" aria-hidden /> Send reply
                </button>
                <button type="button" onClick={() => setStatus(selected.id, "resolved")} className="dm-quiet flex h-10 flex-1 cursor-pointer items-center justify-center rounded-[var(--radius-md)] border text-[13.5px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
                  Mark resolved
                </button>
              </div>
            </>
          )}
        </div>
      </HoverBeam>
    </div>
  );
}

// One card, one row per group, most active first: the name says what the
// group is (the reference's descriptions restated the name), the muted
// line carries the counts.
function DiscussionsPanel() {
  const ordered = [...COMMUNITIES].sort((a, b) => b.last.localeCompare(a.last) || b.posts - a.posts);
  return (
    <div className="flex flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
      <div className="flex items-center justify-between gap-[8px]">
        <h2 className="text-[15px] font-bold" style={{ color: "var(--foreground)" }}>Groups <span className="ml-[6px] text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>most active first</span></h2>
        <button type="button" className="dm-solid bg-[var(--primary)] text-[var(--primary-foreground)] flex h-9 cursor-pointer items-center gap-[6px] rounded-[var(--radius-sm)] px-[14px] text-[13px] font-bold">
          <Plus className="h-[14px] w-[14px]" aria-hidden /> New group
        </button>
      </div>
      <ul className="flex flex-col gap-[6px]">
        {ordered.map((c) => (
          <li key={c.name} className="flex flex-wrap items-baseline justify-between gap-x-[12px] gap-y-[2px] rounded-[var(--radius-md)] border px-[12px] py-[10px]" style={GLASS_INSET}>
            <span className="text-[13.5px] font-bold" style={{ color: "var(--foreground)" }}>{c.name}</span>
            <span className="text-[12px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{c.members} members · {c.posts} posts · active {fmtDate(c.last)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CounselorConnect() {
  // Opens on the tab with work in it (standing rule: what needs attention
  // comes first). Statuses live here so the tab badge and the panel agree.
  const [tab, setTab] = useState<"questions" | "announcements" | "discussions">("questions");
  const [statuses, setStatuses] = useState<Record<string, QuestionStatus>>({});
  const statusOf = (id: string) => statuses[id] ?? QUESTIONS.find((q) => q.id === id)!.status;
  const open = QUESTIONS.filter((q) => OPEN.includes(statusOf(q.id)));
  const needsYou = open.filter((q) => statusOf(q.id) === "new" || statusOf(q.id) === "follow-up").length;
  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
        <Segmented
          ariaLabel="Counselor Connect section"
          value={tab}
          onChange={setTab}
          options={[
            { key: "questions", label: "Questions", badge: open.length || undefined },
            { key: "announcements", label: "Announcements" },
            { key: "discussions", label: "Groups" },
          ]}
        />
        {tab === "questions" && (
          <div className="flex gap-[var(--space-6)]">
            <Stat value={String(needsYou)} label="need a reply" color={needsYou > 0 ? STATUS_COLORS["Needs Attention"] : undefined} />
            <Stat value={String(open.length - needsYou)} label="in progress" />
            <Stat value={String(QUESTIONS.length - open.length)} label="answered" />
          </div>
        )}
        {tab === "announcements" && (
          <button type="button" className="dm-solid bg-[var(--primary)] text-[var(--primary-foreground)] flex h-9 cursor-pointer items-center gap-[6px] rounded-[var(--radius-sm)] px-[14px] text-[13px] font-bold">
            <Plus className="h-[14px] w-[14px]" aria-hidden /> New announcement
          </button>
        )}
      </div>

      {tab === "questions" && <QuestionsPanel statuses={statuses} setStatus={(id, st) => setStatuses((s) => ({ ...s, [id]: st }))} />}
      {tab === "announcements" && (
        <div className="flex flex-col gap-[var(--space-4)]">
          {ANNOUNCEMENTS.map((a) => <AnnouncementCard key={a.id} a={a} />)}
        </div>
      )}
      {tab === "discussions" && <DiscussionsPanel />}
    </div>
  );
}
