"use client";

// DEMO-ONLY v2 fork of ../CounselorConnect.tsx (24 Sept 2026). v1 stays untouched so the
// two builds can be compared live via the bottom-center version chip
// (../version.tsx). Changes from the 24 Sept audit land here.

// 25 Sept 2026 pass under the v2 budget: opens on Student Questions (the
// tab with work in it), questions sorted so unanswered come first with one
// status pill as the only color, a one-line detail header instead of a
// metadata grid, announcements with plain dates, discussions as a compact
// list ordered by activity. Data is the reference's, verbatim.

import { SubTabs } from "./SubTabs";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Send, Check, ChevronLeft } from "lucide-react";
import { Listbox } from "@/components/app/Listbox";
import { useCounselorFilters } from "../shell";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { CardLink, Go } from "../chips";
import { RankBar } from "./overviewShared";
import { HoverBeam } from "@/components/app/HoverBeam";
import { Segmented } from "@/components/connect/viz";
import { Avatar, DetailPane, STATUS_COLORS, StudentLink } from "../chips";
import { getRoster } from "@/lib/counselorRoster";
import { GLASS_CARD as TINTED_CARD, GLASS_INSET } from "../surfaces";
import { BLUE_3 } from "../palette";

function fmtDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// All 10, verbatim off the reference (direct report, confirmed against
// both files: only 3 had survived an earlier pass -- "FIX, display
// better, no cognitive overload... do not miss data points"). Nothing
// about display changes here: AnnouncementCard already defaults every
// card closed with a one-line-clamped preview and opens one at a time,
// so 10 collapsed one-liners is the same footprint 3 already had.
export const ANNOUNCEMENTS = [
  { id: "a1", title: "FAFSA Deadline Approaching", to: "Grade 12 · Sent: 2026-09-10", read: 87, body: "Reminder: the priority deadline for fall admission is February 1st. All seniors should have their FAFSA submitted by this date to maximize financial aid opportunities.", tags: ["Related: Financial Aid Status", "Read Receipt Required", "Acknowledgment Required"] },
  { id: "a2", title: "Career Fair Next Week", to: "All Students · Sent: 2026-09-08", read: 72, body: "Annual Career Exploration Fair will be held on January 22nd in the gymnasium. Over 40 local employers and college representatives will be present. All students encouraged to attend.", tags: [] },
  { id: "a3", title: "Resume Workshop This Friday", to: "Grades 11-12 · Sent: 2026-09-12", read: 64, body: "Join us for a resume writing workshop this Friday after school in the library. We'll cover formatting, content, and how to highlight your achievements. Pizza will be served!", tags: ["Related: Resume"] },
  { id: "a4", title: "College Application Deadlines", to: "Grade 12 · Sent: 2026-09-05", read: 91, body: "Many regular decision college applications are due January 15th - February 1st. Make sure you've submitted all required materials and checked your portal for each school.", tags: ["Related: Application Progress", "Read Receipt Required"] },
  { id: "a5", title: "Grade 9 Academic Planning Session", to: "Grade 9 · Sent: 2026-09-07", read: 68, body: "All freshmen should complete their initial four-year academic plan by the end of this month. Schedule a meeting with your counselor if you need assistance.", tags: ["Related: Academic Plan"] },
  { id: "a6", title: "Scholarship Opportunities Available", to: "Grades 11-12 · Sent: 2026-09-11", read: 79, body: "New local scholarships have been posted in Dreamari. Check the Scholarships tab to see opportunities you qualify for. Many have deadlines in February.", tags: ["Related: Financial Aid Status"] },
  { id: "a7", title: "Career Pathway Selection Reminder", to: "Grade 10 · Sent: 2026-09-09", read: 71, body: "All sophomores should finalize their career pathway selection by the end of January. This helps us align your coursework with your post-secondary goals.", tags: ["Related: Career Pathway Selection", "Acknowledgment Required"] },
  { id: "a8", title: "Junior Year College Planning Timeline", to: "Grade 11 · Sent: 2026-09-13", read: 58, body: "Juniors: now is the time to start your college search. Complete your initial college list in Dreamari and schedule campus visits during spring break.", tags: ["Related: College List"] },
  { id: "a9", title: "Trade School Information Session", to: "All Students · Sent: 2026-09-14", read: 45, body: "Representatives from local technical colleges will present on January 25th during lunch periods. Learn about skilled trades programs and apprenticeship opportunities.", tags: [] },
  { id: "a10", title: "Senior Exit Survey", to: "Grade 12 · Sent: 2026-09-06", read: 82, body: "All seniors must complete the Senior Exit Survey by May 1st. This survey captures your final post-secondary plans and helps us support your transition.", tags: ["Related: Senior Exit Survey", "Acknowledgment Required"] },
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

type Announcement = (typeof ANNOUNCEMENTS)[number];
const AUDIENCES = ["All Students", "Grade 9", "Grade 10", "Grade 11", "Grade 12", "Grades 11-12"] as const;

function audienceGrades(to: string): number[] {
  if (to.startsWith("Grades 11")) return [11, 12];
  const m = to.match(/Grade (\d+)/);
  return m ? [Number(m[1])] : [9, 10, 11, 12];
}

// A card opens (expands) to its read-receipt bar, who it went to, and the
// way into that audience on Students. Direct question, 25 Sept 2026:
// "the cards aren't clickable, should they be? Where does the announcement
// go?" It goes to the students in its audience; the card now says how many
// and how many have read it, and opens that roster.
function AnnouncementCard({ a, open, onToggle }: { a: Announcement; open: boolean; onToggle: () => void }) {
  const router = useRouter();
  const { setGradeFilter } = useCounselorFilters();
  const roster = useReviewedRoster();
  const [to, sent] = a.to.split(" · Sent: ");
  const grades = audienceGrades(to);
  const recipients = roster.filter((st) => grades.includes(st.grade)).length;
  const readCount = Math.round((a.read / 100) * recipients);
  return (
    <HoverBeam strength={0.6} className="h-full">
      <div className="flex h-full flex-col gap-[8px] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
        <button type="button" onClick={onToggle} aria-expanded={open} className="dm-quiet flex w-full cursor-pointer flex-col gap-[6px] rounded-[var(--radius-sm)] text-left">
          <span className="flex flex-wrap items-baseline justify-between gap-x-[var(--space-3)] gap-y-[2px]">
            <span className="flex min-w-0 flex-wrap items-baseline gap-x-[8px]">
              <h3 className="text-[15px] font-bold" style={{ color: "var(--foreground)" }}>{a.title}</h3>
              <span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{to} · {fmtDate(sent)}</span>
            </span>
            <span className="flex flex-none items-center gap-[8px] text-[13px] font-bold tabular-nums" style={{ color: "var(--foreground)" }}>{a.read}% <span className="font-semibold" style={{ color: "var(--muted-foreground)" }}>read</span><Go kind="expand" open={open} /></span>
          </span>
          <p className={`text-[13.5px] leading-[19px] ${open ? "" : "line-clamp-1"}`} style={{ color: "var(--foreground)" }}>{a.body}</p>
        </button>
        {open && (
          <div className="flex flex-col gap-[10px] border-t pt-[10px]" style={{ borderColor: "var(--glass-border)" }}>
            <RankBar value={a.read} />
            <div className="flex flex-wrap items-center justify-between gap-[8px]">
              <span className="text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Read by {readCount} of {recipients} students{a.tags.length ? ` · ${a.tags.map((t) => t.replace(/^Related: /, "")).join(" · ")}` : ""}</span>
              <CardLink onClick={() => { setGradeFilter(grades.length === 1 ? (grades[0] as 9 | 10 | 11 | 12) : "All Grades"); router.push("/counselor?view=students"); }}>Recipients</CardLink>
            </div>
          </div>
        )}
      </div>
    </HoverBeam>
  );
}

function AnnouncementComposer({ onSend, onCancel }: { onSend: (a: Announcement) => void; onCancel: () => void }) {
  const [title, setTitle] = useState("");
  const [audience, setAudience] = useState<string>("All Students");
  const [body, setBody] = useState("");
  const field = { background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" } as const;
  return (
    <div className="flex flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
      <h3 className="text-[15px] font-bold" style={{ color: "var(--foreground)" }}>New announcement</h3>
      <div className="grid grid-cols-1 gap-[var(--space-3)] sm:grid-cols-[minmax(0,1fr)_200px]">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" aria-label="Title" className="h-10 rounded-[var(--radius-sm)] border px-[12px] text-[13px] outline-none" style={field} />
        <Listbox ariaLabel="Audience" value={audience} onChange={setAudience} options={AUDIENCES.map((a) => ({ value: a, label: a }))} className="flex h-10 w-full cursor-pointer items-center justify-between gap-[8px] rounded-[var(--radius-sm)] border px-[10px] text-left text-[13px] font-semibold" style={field} />
      </div>
      <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="What students need to know" aria-label="Body" rows={3} className="w-full resize-none rounded-[var(--radius-md)] border px-[12px] py-[10px] text-[13px] outline-none" style={field} />
      <div className="flex justify-end gap-[10px]">
        <button type="button" onClick={onCancel} className="dm-quiet flex h-9 cursor-pointer items-center rounded-[var(--radius-sm)] border px-[14px] text-[13px] font-semibold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>Cancel</button>
        <button type="button" disabled={!title.trim() || !body.trim()} onClick={() => onSend({ id: `a-${Date.now()}`, title: title.trim(), to: `${audience} · Sent: ${new Date().toISOString().slice(0, 10)}`, read: 0, body: body.trim(), tags: [] })} className="dm-solid bg-[var(--primary)] text-[var(--primary-foreground)] flex h-9 cursor-pointer items-center gap-[6px] rounded-[var(--radius-sm)] px-[14px] text-[13px] font-bold disabled:cursor-not-allowed disabled:opacity-50">
          <Send className="h-[14px] w-[14px]" aria-hidden /> Send
        </button>
      </div>
    </div>
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
  // The three counts that used to sit above the tabs as big numbers are
  // now this list's own filter: the number and the list it counts are the
  // same control (was: a stat row, a tab badge and a pill on every card all
  // saying the same thing).
  const GROUPS: { key: "reply" | "progress" | "answered"; label: string; statuses: QuestionStatus[] }[] = [
    { key: "reply", label: "Need a reply", statuses: ["new", "follow-up"] },
    { key: "progress", label: "In progress", statuses: ["viewed", "in-progress"] },
    { key: "answered", label: "Answered", statuses: ["responded", "resolved"] },
  ];
  const [group, setGroup] = useState<"reply" | "progress" | "answered">("reply");
  const inGroup = (g: (typeof GROUPS)[number]) => QUESTIONS.filter((q) => g.statuses.includes(statusOf(q.id)));
  const current = GROUPS.find((g) => g.key === group)!;
  const ordered = inGroup(current).sort((a, b) => STATUS_STYLE[statusOf(a.id)].rank - STATUS_STYLE[statusOf(b.id)].rank || b.date.localeCompare(a.date));
  // A pill only earns its place when it tells cards in this list apart.
  const mixed = new Set(ordered.map((q) => statusOf(q.id))).size > 1;
  const [selectedId, setSelectedId] = useState(() => ordered[0]?.id ?? QUESTIONS[0].id);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [response, setResponse] = useState("");
  const selected = QUESTIONS.find((q) => q.id === selectedId)!;
  const selectedStatus = statusOf(selected.id);
  const answered = selectedStatus === "responded" || selectedStatus === "resolved";

  return (
    <div className="flex flex-col gap-[var(--space-4)]">
    <SubTabs ariaLabel="Question status" value={group} onChange={(k) => { setGroup(k); const next = inGroup(GROUPS.find((g) => g.key === k)!)[0]; if (next) setSelectedId(next.id); }} options={GROUPS.map((g) => ({ key: g.key, label: g.label, count: inGroup(g).length }))} />
    <div className="grid grid-cols-1 items-start gap-[var(--space-4)] lg:grid-cols-[360px_minmax(0,1fr)]">
      <div className="flex max-h-[70vh] flex-col gap-[8px] overflow-y-auto pr-[2px] [scrollbar-width:thin]">
        {ordered.length === 0 && <p className="rounded-[var(--radius-md)] border px-[12px] py-[var(--space-5)] text-center text-[13px] font-semibold" style={{ ...GLASS_INSET, color: "var(--muted-foreground)" }}>Nothing here right now.</p>}
        {ordered.map((q) => {
          const on = selectedId === q.id;
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => { setSelectedId(q.id); setResponse(""); setSheetOpen(true); }}
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
                {mixed && <StatusPill status={statusOf(q.id)} />}
              </span>
              <p className="line-clamp-2 text-[12.5px] leading-[17px]" style={{ color: "var(--foreground)" }}>{q.question}</p>
            </button>
          );
        })}
      </div>
      <DetailPane open={sheetOpen} onClose={() => setSheetOpen(false)}>
      <HoverBeam strength={0.5}>
        <div className="flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
          <div className="flex items-start justify-between gap-[var(--space-3)]">
            <StudentLink id={getRoster().find((s) => s.name === selected.name)?.id} name={selected.name}>
              <span className="truncate text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Grade {selected.grade} · {selected.tag} · {fmtDate(selected.date)}{selected.milestone ? ` · ${selected.milestone}` : ""}</span>
            </StudentLink>
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
              <div className="flex gap-[10px]">
                <button
                  type="button"
                  disabled={response.trim().length === 0}
                  onClick={() => { setStatus(selected.id, "responded"); setResponse(""); setSheetOpen(false); }}
                  className="dm-solid bg-[var(--primary)] text-[var(--primary-foreground)] flex h-10 flex-1 cursor-pointer items-center justify-center gap-[6px] rounded-[var(--radius-md)] text-[13.5px] font-bold disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send className="h-[14px] w-[14px]" aria-hidden /> Send reply
                </button>
                <button type="button" onClick={() => { setStatus(selected.id, "resolved"); setSheetOpen(false); }} className="dm-quiet flex h-10 flex-1 cursor-pointer items-center justify-center rounded-[var(--radius-md)] border text-[13.5px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
                  Mark resolved
                </button>
              </div>
            </>
          )}
        </div>
      </HoverBeam>
      </DetailPane>
    </div>
    </div>
  );
}

type Group = (typeof COMMUNITIES)[number];
type Post = { id: string; author: string; text: string; at: string };

// Seeded recent posts per group, three each, so a group opens onto
// something (direct question, 25 Sept 2026: "can I see these groups,
// what's happening in them?"). A backend replaces this with the group's
// feed; the shape (author, text, at) stays.
const POST_SEEDS = [
  "Does anyone have the link to the FAFSA worksheet from last week's session?",
  "Reminder: campus visit sign-ups close Friday.",
  "I finished my career report, happy to share how I structured it.",
  "Which electives pair well with the healthcare pathway?",
  "The scholarship deadline moved to March 1, check the updated list.",
  "Anyone doing the summer internship at the hospital again this year?",
];
function seededPosts(group: Group, roster: { name: string }[]): Post[] {
  let h = 0;
  for (const ch of group.name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return [0, 1, 2].map((i) => ({ id: `${group.name}-${i}`, author: roster[(h + i * 7) % Math.max(1, roster.length)]?.name ?? "A student", text: POST_SEEDS[(h + i) % POST_SEEDS.length], at: new Date(new Date(`${group.last}T00:00:00`).getTime() - i * 86400000).toISOString().slice(0, 10) }));
}

function GroupDetail({ group, onBack }: { group: Group; onBack: () => void }) {
  const roster = useReviewedRoster();
  const [posts, setPosts] = useState<Post[]>(() => seededPosts(group, roster));
  const [draft, setDraft] = useState("");
  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      <button type="button" onClick={onBack} className="dm-quiet flex w-fit cursor-pointer items-center gap-[4px] text-[13px] font-bold" style={{ color: "var(--foreground)" }}><ChevronLeft className="h-4 w-4" aria-hidden /> Groups</button>
      <div className="flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
        <div className="flex flex-col gap-[2px]">
          <h2 className="text-[17px] font-bold" style={{ color: "var(--foreground)" }}>{group.name}</h2>
          <span className="text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{group.desc}</span>
          <span className="text-[12px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{group.members} members · {group.posts} posts · active {fmtDate(group.last)}</span>
        </div>
        <div className="flex gap-[8px]">
          <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={`Post to ${group.name}`} aria-label="New post" className="h-10 min-w-0 flex-1 rounded-[var(--radius-sm)] border px-[12px] text-[13px] outline-none" style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" }} />
          <button type="button" disabled={!draft.trim()} onClick={() => { setPosts((p) => [{ id: `me-${Date.now()}`, author: "You", text: draft.trim(), at: new Date().toISOString().slice(0, 10) }, ...p]); setDraft(""); }} className="dm-solid bg-[var(--primary)] text-[var(--primary-foreground)] flex h-10 flex-none cursor-pointer items-center gap-[6px] rounded-[var(--radius-sm)] px-[14px] text-[13px] font-bold disabled:cursor-not-allowed disabled:opacity-50"><Send className="h-[14px] w-[14px]" aria-hidden /> Post</button>
        </div>
        <ul className="flex flex-col gap-[6px]">
          {posts.map((p) => (
            <li key={p.id} className="flex flex-col gap-[4px] rounded-[var(--radius-md)] border px-[12px] py-[10px]" style={GLASS_INSET}>
              <span className="flex items-baseline justify-between gap-[8px] text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}><span style={{ color: "var(--foreground)" }}>{p.author}</span><span>{fmtDate(p.at)}</span></span>
              <p className="text-[13px] leading-[18px]" style={{ color: "var(--foreground)" }}>{p.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// One card, one row per group, most active first; a row opens the group.
// "New group" is an inline form (name and one line), and the group lands
// at the top with no members yet.
function DiscussionsPanel() {
  const [groups, setGroups] = useState<Group[]>(() => [...COMMUNITIES]);
  const [openName, setOpenName] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const ordered = useMemo(() => [...groups].sort((a, b) => b.last.localeCompare(a.last) || b.posts - a.posts), [groups]);
  const open = groups.find((g) => g.name === openName);
  if (open) return <GroupDetail key={open.name} group={open} onBack={() => setOpenName(null)} />;
  const field = { background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" } as const;
  return (
    <div className="flex flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
      <div className="flex items-center justify-between gap-[8px]">
        <h2 className="text-[15px] font-bold" style={{ color: "var(--foreground)" }}>Groups <span className="ml-[6px] text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>most active first</span></h2>
        {!creating && (
          <button type="button" onClick={() => setCreating(true)} className="dm-solid bg-[var(--primary)] text-[var(--primary-foreground)] flex h-9 cursor-pointer items-center gap-[6px] rounded-[var(--radius-sm)] px-[14px] text-[13px] font-bold">
            <Plus className="h-[14px] w-[14px]" aria-hidden /> New group
          </button>
        )}
      </div>
      {creating && (
        <div className="flex flex-col gap-[8px] rounded-[var(--radius-md)] border p-[12px]" style={GLASS_INSET}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Group name" aria-label="Group name" className="h-10 rounded-[var(--radius-sm)] border px-[12px] text-[13px] outline-none" style={field} />
          <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="What it is for, in one line" aria-label="Description" className="h-10 rounded-[var(--radius-sm)] border px-[12px] text-[13px] outline-none" style={field} />
          <div className="flex justify-end gap-[10px]">
            <button type="button" onClick={() => { setCreating(false); setName(""); setDesc(""); }} className="dm-quiet flex h-9 cursor-pointer items-center rounded-[var(--radius-sm)] border px-[14px] text-[13px] font-semibold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>Cancel</button>
            <button type="button" disabled={!name.trim()} onClick={() => { setGroups((g) => [{ name: name.trim(), desc: desc.trim() || "New group", members: 0, posts: 0, last: new Date().toISOString().slice(0, 10) }, ...g]); setCreating(false); setName(""); setDesc(""); }} className="dm-solid bg-[var(--primary)] text-[var(--primary-foreground)] flex h-9 cursor-pointer items-center rounded-[var(--radius-sm)] px-[14px] text-[13px] font-bold disabled:cursor-not-allowed disabled:opacity-50">Create</button>
          </div>
        </div>
      )}
      <ul className="flex flex-col gap-[6px]">
        {ordered.map((c) => (
          <li key={c.name}>
            <button type="button" onClick={() => setOpenName(c.name)} className="dm-quiet flex w-full cursor-pointer flex-wrap items-baseline justify-between gap-x-[12px] gap-y-[2px] rounded-[var(--radius-md)] border px-[12px] py-[10px] text-left" style={GLASS_INSET}>
              <span className="text-[13.5px] font-bold" style={{ color: "var(--foreground)" }}>{c.name}</span>
              <span className="text-[12px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{c.members} members · {c.posts} posts · active {fmtDate(c.last)}</span>
            </button>
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
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => [...ANNOUNCEMENTS]);
  const [composing, setComposing] = useState(false);
  const [openAnnouncement, setOpenAnnouncement] = useState<string | null>(null);
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
            { key: "questions", label: "Questions", badge: needsYou || undefined },
            { key: "announcements", label: "Announcements" },
            { key: "discussions", label: "Groups" },
          ]}
        />
        {tab === "announcements" && !composing && (
          <button type="button" onClick={() => setComposing(true)} className="dm-solid bg-[var(--primary)] text-[var(--primary-foreground)] flex h-9 cursor-pointer items-center gap-[6px] rounded-[var(--radius-sm)] px-[14px] text-[13px] font-bold">
            <Plus className="h-[14px] w-[14px]" aria-hidden /> New announcement
          </button>
        )}
      </div>

      {tab === "questions" && <QuestionsPanel statuses={statuses} setStatus={(id, st) => setStatuses((s) => ({ ...s, [id]: st }))} />}
      {tab === "announcements" && (
        <div className="flex flex-col gap-[var(--space-4)]">
          {composing && <AnnouncementComposer onCancel={() => setComposing(false)} onSend={(a) => { setAnnouncements((list) => [a, ...list]); setComposing(false); setOpenAnnouncement(a.id); }} />}
          {announcements.map((a) => <AnnouncementCard key={a.id} a={a} open={openAnnouncement === a.id} onToggle={() => setOpenAnnouncement((o) => (o === a.id ? null : a.id))} />)}
        </div>
      )}
      {tab === "discussions" && <DiscussionsPanel />}
    </div>
  );
}
