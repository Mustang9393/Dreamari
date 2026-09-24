"use client";

import { useState } from "react";
import { Plus, Send, Check } from "lucide-react";
import { HoverBeam } from "@/components/app/HoverBeam";
import { Segmented } from "@/components/connect/viz";

import { GLASS_CARD as TINTED_CARD } from "./surfaces";

export const ANNOUNCEMENTS = [
  // All 10, verbatim off the reference (24 Sept 2026), dates included.
  { id: "a1", title: "FAFSA Deadline Approaching", to: "Grade 12 • Sent: 2024-01-10", read: 87, body: "Reminder: The priority FAFSA deadline for fall admission is February 1st. All seniors should have their FAFSA submitted by this date to maximize financial aid opportunities.", tags: ["Related: Financial Aid Status", "Read Receipt Required", "Acknowledgment Required"] },
  { id: "a2", title: "Career Fair Next Week", to: "All Students • Sent: 2024-01-08", read: 72, body: "Annual Career Exploration Fair will be held on January 22nd in the gymnasium. Over 40 local employers and college representatives will be present. All students encouraged to attend!", tags: [] },
  { id: "a3", title: "Resume Workshop This Friday", to: "Grades 11-12 • Sent: 2024-01-12", read: 64, body: "Join us for a resume writing workshop this Friday after school in the library. We'll cover formatting, content, and how to highlight your achievements. Pizza will be served!", tags: ["Related: Resume"] },
  { id: "a4", title: "College Application Deadlines", to: "Grade 12 • Sent: 2024-01-05", read: 91, body: "Many regular decision college applications are due January 15th - February 1st. Make sure you've submitted all required materials and checked your portal for each school.", tags: ["Related: Application Progress", "Read Receipt Required"] },
  { id: "a5", title: "Grade 9 Academic Planning Session", to: "Grade 9 • Sent: 2024-01-07", read: 68, body: "All freshmen should complete their initial four-year academic plan by the end of this month. Schedule a meeting with your counselor if you need assistance.", tags: ["Related: Academic Plan"] },
  { id: "a6", title: "Scholarship Opportunities Available", to: "Grades 11-12 • Sent: 2024-01-11", read: 79, body: "New local scholarships have been posted in Dreamari. Check the Scholarships tab to see opportunities you qualify for. Many have deadlines in February.", tags: ["Related: Financial Aid Status"] },
  { id: "a7", title: "Career Pathway Selection Reminder", to: "Grade 10 • Sent: 2024-01-09", read: 71, body: "All sophomores should finalize their career pathway selection by the end of January. This helps us align your coursework with your post-secondary goals.", tags: ["Related: Career Pathway Selection", "Acknowledgment Required"] },
  { id: "a8", title: "Junior Year College Planning Timeline", to: "Grade 11 • Sent: 2024-01-13", read: 58, body: "Juniors: Now is the time to start your college search! Complete your initial college list in Dreamari and schedule campus visits during spring break.", tags: ["Related: College List"] },
  { id: "a9", title: "Trade School Information Session", to: "All Students • Sent: 2024-01-14", read: 45, body: "Representatives from local technical colleges will present on January 25th during lunch periods. Learn about skilled trades programs and apprenticeship opportunities.", tags: [] },
  { id: "a10", title: "Senior Exit Survey", to: "Grade 12 • Sent: 2024-01-06", read: 82, body: "All seniors must complete the Senior Exit Survey by May 1st. This survey captures your final post-secondary plans and helps us support your transition.", tags: ["Related: Senior Exit Survey", "Acknowledgment Required"] },
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
  { id: "q1", name: "Olivia Chen", grade: 11, question: "I'm interested in both graphic design and animation. How do I decide which career pathway to choose? Can I explore both?", tag: "Career Exploration", date: "2024-01-14", status: "new", milestone: "Career Pathway Selection" },
  { id: "q2", name: "Charlotte Davis", grade: 12, question: "I missed the early action deadline for my top choice school. Should I still apply regular decision or is it too late?", tag: "Applications", date: "2024-01-13", status: "new", milestone: "Application Progress" },
  { id: "q3", name: "Jackson Thomas", grade: 11, question: "Should I take AP Economics or AP Psychology next year? Which would be better for a business major?", tag: "Academic Planning", date: "2024-01-12", status: "viewed", milestone: "Academic Plan" },
  { id: "q4", name: "Isabella Santos", grade: 11, question: "How many colleges should I have on my list? I currently have 15 but I'm not sure if that's too many.", tag: "College Search", date: "2024-01-11", status: "in-progress", milestone: "College List" },
  { id: "q5", name: "Sebastian Wilson", grade: 11, question: "Are there any local internships for high school students interested in film production?", tag: "Career Exploration", date: "2024-01-10", status: "responded", milestone: "Career Pathway Selection" },
  { id: "q6", name: "Elizabeth Wilson", grade: 12, question: "My parents don't have all their tax documents ready yet. Can I still submit my FAFSA or should I wait?", tag: "Financial Aid", date: "2024-01-09", status: "responded", milestone: "Financial Aid" },
  { id: "q7", name: "Lucas Miller", grade: 9, question: "What electives should I take next year if I want to pursue graphic design?", tag: "Course Selection", date: "2024-01-15", status: "new", milestone: "Academic Plan" },
  { id: "q8", name: "Marcus Thompson", grade: 11, question: "Should I include my job at the grocery store on my resume even though it's not related to healthcare?", tag: "Resume", date: "2024-01-14", status: "viewed", milestone: "Resume" },
  { id: "q9", name: "Emma Rodriguez", grade: 12, question: "One of my teachers hasn't submitted my recommendation letter yet and the deadline is next week. What should I do?", tag: "Recommendations", date: "2024-01-13", status: "in-progress", milestone: "Recommendation Letter" },
  { id: "q10", name: "Sophia Kim", grade: 12, question: "I'm feeling really stressed about college decisions. Do you have time to talk this week?", tag: "Personal Support", date: "2024-01-12", status: "responded" },
  { id: "q11", name: "Joseph Hernandez", grade: 10, question: "How can I find out more about careers in video game design?", tag: "Career Exploration", date: "2024-01-11", status: "follow-up", milestone: "Career Pathway Selection" },
  { id: "q12", name: "Ethan Garcia", grade: 11, question: "What's the difference between business administration and business management majors?", tag: "College Search", date: "2024-01-10", status: "resolved", milestone: "College List" },
  { id: "q13", name: "Daniel Thomas", grade: 10, question: "Do I need to take physics if I want to be a nurse?", tag: "Academic Planning", date: "2024-01-15", status: "new", milestone: "Academic Plan" },
  { id: "q14", name: "Diego Martinez", grade: 12, question: "The trade school application asks for a personal statement. Is this the same as a college essay?", tag: "Applications", date: "2024-01-14", status: "viewed", milestone: "Application Progress" },
  { id: "q15", name: "Mia Johnson", grade: 12, question: "I want to confirm I'm on track to graduate. Can we review my transcript together?", tag: "Graduation", date: "2024-01-13", status: "responded" },
];

const STATUS_STYLE: Record<QuestionStatus, { label: string; color: string }> = {
  new: { label: "New", color: "#E0453C" },
  viewed: { label: "Viewed", color: "#5B6CF9" },
  "in-progress": { label: "In Progress", color: "#5B6CF9" },
  responded: { label: "Responded", color: "#33C78C" },
  resolved: { label: "Resolved", color: "#33C78C" },
  "follow-up": { label: "Follow-Up Needed", color: "#F5A623" },
};

const COMMUNITIES = [
  { name: "Grade 9 Planning", desc: "Academic planning, course selection, and getting started with career exploration", members: 142, posts: 87, last: "2024-01-15" },
  { name: "Grade 10 Career Exploration", desc: "Discovering career pathways, internships, and summer opportunities", members: 138, posts: 103, last: "2024-01-15" },
  { name: "Grade 11 College Planning", desc: "College search, standardized testing, campus visits, and building your college list", members: 145, posts: 156, last: "2024-01-14" },
  { name: "Grade 12 Applications", desc: "Application support, essay writing, deadlines, and decision strategies", members: 134, posts: 198, last: "2024-01-15" },
  { name: "FAFSA Support", desc: "Financial aid questions, FAFSA help, and scholarship opportunities", members: 267, posts: 142, last: "2024-01-14" },
  { name: "Scholarship Opportunities", desc: "Sharing scholarship information, tips, and success stories", members: 289, posts: 124, last: "2024-01-13" },
  { name: "Career Pathways: Technology", desc: "For students exploring careers in software, engineering, IT, and tech", members: 78, posts: 65, last: "2024-01-15" },
  { name: "Career Pathways: Healthcare", desc: "For students interested in medicine, nursing, healthcare, and life sciences", members: 92, posts: 71, last: "2024-01-14" },
  { name: "Skilled Trades & Technical Careers", desc: "Apprenticeships, trade schools, and technical career pathways", members: 54, posts: 48, last: "2024-01-13" },
  { name: "Summer Opportunities", desc: "Summer programs, internships, jobs, and volunteer opportunities", members: 312, posts: 176, last: "2024-01-15" },
];

function AnnouncementCard({ a }: { a: (typeof ANNOUNCEMENTS)[number] }) {
  return (
    <HoverBeam strength={0.6} className="h-full">
      <div className="flex h-full flex-col gap-[8px] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
        <div className="flex items-start justify-between gap-[var(--space-3)]">
          <h3 className="text-[15px] font-bold" style={{ color: "var(--foreground)" }}>{a.title}</h3>
          <span className="flex-none text-[13px] font-bold tabular-nums" style={{ color: "var(--primary)" }}>{a.read}% Read</span>
        </div>
        <span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>To: {a.to}</span>
        <p className="text-[13.5px] leading-[19px]" style={{ color: "var(--foreground)" }}>{a.body}</p>
        {a.tags.length > 0 && (
          <span className="flex flex-wrap gap-[6px] pt-[2px]">
            {a.tags.map((t) => <span key={t} className="rounded-full border px-[9px] py-[3px] text-[11px] font-semibold" style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}>{t}</span>)}
          </span>
        )}
      </div>
    </HoverBeam>
  );
}

function QuestionsPanel() {
  const [selectedId, setSelectedId] = useState(QUESTIONS[0].id);
  const [statuses, setStatuses] = useState<Record<string, QuestionStatus>>({});
  const [response, setResponse] = useState("");
  const selected = QUESTIONS.find((q) => q.id === selectedId)!;
  const statusOf = (id: string) => statuses[id] ?? QUESTIONS.find((q) => q.id === id)!.status;
  const selectedStatus = statusOf(selected.id);
  const answered = selectedStatus === "responded" || selectedStatus === "resolved";

  return (
    <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-[380px_1fr]">
      <div className="flex flex-col gap-[8px]">
        <span className="text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Student Questions ({QUESTIONS.length})</span>
        {QUESTIONS.map((q) => {
          const status = statusOf(q.id);
          const s = STATUS_STYLE[status];
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => { setSelectedId(q.id); setResponse(""); }}
              className="dm-quiet flex cursor-pointer flex-col gap-[6px] rounded-[var(--radius-lg)] border p-[var(--space-4)] text-left"
              style={{ borderColor: selectedId === q.id ? "var(--primary)" : "var(--glass-border)", background: selectedId === q.id ? "color-mix(in srgb, var(--primary) 10%, var(--card))" : "var(--card)" }}
            >
              <span className="flex items-center justify-between gap-[8px]">
                <span className="text-[13.5px] font-bold" style={{ color: "var(--foreground)" }}>{q.name}</span>
                <span className="flex flex-none items-center gap-[4px] rounded-full px-[7px] py-[1px] text-[10px] font-bold" style={{ background: `color-mix(in srgb, ${s.color} 18%, transparent)`, color: s.color }}>
                  {status === "resolved" && <Check className="h-[9px] w-[9px]" strokeWidth={3} aria-hidden />}
                  {s.label}
                </span>
              </span>
              <span className="text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Grade {q.grade}</span>
              <p className="line-clamp-2 text-[13px]" style={{ color: "var(--foreground)" }}>{q.question}</p>
              <span className="text-[11px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{q.tag} · {q.date}</span>
            </button>
          );
        })}
      </div>
      <HoverBeam strength={0.5} className="h-full">
        <div className="flex h-full flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
          <div className="flex items-center justify-between gap-[8px]">
            <h2 className="text-[15px] font-bold" style={{ color: "var(--foreground)" }}>Question Detail</h2>
            <span className="flex flex-none items-center gap-[4px] rounded-full px-[8px] py-[2px] text-[11px] font-bold" style={{ background: `color-mix(in srgb, ${STATUS_STYLE[selectedStatus].color} 18%, transparent)`, color: STATUS_STYLE[selectedStatus].color }}>{STATUS_STYLE[selectedStatus].label}</span>
          </div>
          <div className="grid grid-cols-2 gap-x-[var(--space-4)] gap-y-[10px] rounded-[var(--radius-md)] border p-[var(--space-4)] text-[13px]" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
            <span style={{ color: "var(--muted-foreground)" }}>Student</span><span className="font-semibold" style={{ color: "var(--foreground)" }}>{selected.name} (Grade {selected.grade})</span>
            <span style={{ color: "var(--muted-foreground)" }}>Category</span><span className="font-semibold" style={{ color: "var(--foreground)" }}>{selected.tag}</span>
            <span style={{ color: "var(--muted-foreground)" }}>Submitted</span><span className="font-semibold" style={{ color: "var(--foreground)" }}>{selected.date}</span>
            {selected.milestone && <><span style={{ color: "var(--muted-foreground)" }}>Related Milestone</span><span className="font-semibold" style={{ color: "var(--foreground)" }}>{selected.milestone}</span></>}
          </div>
          <div className="flex flex-col gap-[4px]">
            <span className="text-[12px] font-bold tracking-[0.04em] uppercase" style={{ color: "var(--muted-foreground)" }}>Student Question</span>
            <p className="rounded-[var(--radius-md)] border p-[var(--space-4)] text-[13.5px]" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)", color: "var(--foreground)" }}>{selected.question}</p>
          </div>
          {answered ? (
            <p className="text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>You&apos;ve already {selectedStatus === "resolved" ? "resolved" : "responded to"} this question.</p>
          ) : (
            <>
              <div className="flex flex-col gap-[4px]">
                <span className="text-[12px] font-bold tracking-[0.04em] uppercase" style={{ color: "var(--muted-foreground)" }}>Your Response</span>
                <textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Type your response here..."
                  rows={4}
                  className="w-full resize-none rounded-[var(--radius-md)] border px-[12px] py-[10px] text-[13px] outline-none"
                  style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" }}
                />
              </div>
              <div className="flex gap-[10px]">
                <button
                  type="button"
                  disabled={response.trim().length === 0}
                  onClick={() => { setStatuses((s) => ({ ...s, [selected.id]: "responded" })); setResponse(""); }}
                  className="dm-solid bg-[var(--primary)] text-[var(--primary-foreground)] flex h-10 flex-1 cursor-pointer items-center justify-center gap-[6px] rounded-[var(--radius-md)] text-[13.5px] font-bold disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send className="h-[14px] w-[14px]" aria-hidden /> Send Response
                </button>
                <button type="button" onClick={() => setStatuses((s) => ({ ...s, [selected.id]: "resolved" }))} className="dm-quiet flex h-10 flex-1 cursor-pointer items-center justify-center rounded-[var(--radius-md)] border text-[13.5px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
                  Mark Resolved
                </button>
              </div>
            </>
          )}
        </div>
      </HoverBeam>
    </div>
  );
}

function DiscussionsPanel() {
  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      <div className="flex justify-end">
        <button type="button" className="dm-solid bg-[var(--primary)] text-[var(--primary-foreground)] flex h-9 cursor-pointer items-center gap-[6px] rounded-[var(--radius-sm)] px-[14px] text-[13px] font-bold">
          <Plus className="h-[14px] w-[14px]" aria-hidden /> Create Discussion
        </button>
      </div>
      <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2 xl:grid-cols-3">
        {COMMUNITIES.map((c) => (
          <HoverBeam key={c.name} strength={0.6} className="h-full">
            <div className="flex h-full flex-col gap-[8px] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
              <h3 className="text-[14.5px] font-bold" style={{ color: "var(--foreground)" }}>{c.name}</h3>
              <p className="text-[13px] leading-[18px]" style={{ color: "var(--muted-foreground)" }}>{c.desc}</p>
              <span className="mt-auto flex items-center gap-[14px] pt-[4px] text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
                <span>{c.members} members</span><span>{c.posts} posts</span>
              </span>
              <span className="text-[11px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Last: {c.last}</span>
            </div>
          </HoverBeam>
        ))}
      </div>
    </div>
  );
}

export function CounselorConnect() {
  const [tab, setTab] = useState<"announcements" | "questions" | "discussions">("announcements");
  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
        <Segmented
          ariaLabel="Counselor Connect section"
          value={tab}
          onChange={setTab}
          options={[
            { key: "announcements", label: "Announcements" },
            { key: "questions", label: "Student Questions" },
            { key: "discussions", label: "Group Discussions" },
          ]}
        />
        {tab === "announcements" && (
          <button type="button" className="dm-solid bg-[var(--primary)] text-[var(--primary-foreground)] flex h-9 cursor-pointer items-center gap-[6px] rounded-[var(--radius-sm)] px-[14px] text-[13px] font-bold">
            <Plus className="h-[14px] w-[14px]" aria-hidden /> New Announcement
          </button>
        )}
      </div>

      {tab === "announcements" && (
        <div className="flex flex-col gap-[var(--space-4)]">
          {ANNOUNCEMENTS.map((a) => <AnnouncementCard key={a.id} a={a} />)}
        </div>
      )}
      {tab === "questions" && <QuestionsPanel />}
      {tab === "discussions" && <DiscussionsPanel />}
    </div>
  );
}
