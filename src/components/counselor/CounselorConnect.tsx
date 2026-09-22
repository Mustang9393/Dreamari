"use client";

import { useState } from "react";
import { Plus, Send, Check } from "lucide-react";
import { HoverBeam } from "@/components/app/HoverBeam";
import { Segmented } from "@/components/connect/viz";

import { GLASS_CARD as TINTED_CARD } from "./surfaces";

const ANNOUNCEMENTS = [
  { id: "a1", title: "FAFSA Deadline Approaching", to: "Grade 12 · Sent: 2026-09-10", read: 87, body: "Reminder: the priority deadline for fall admission is February 1st. All seniors should have their FAFSA submitted by this date to maximize financial aid opportunities.", tags: ["Related: Financial Aid Status", "Read Receipt Required", "Acknowledgment Required"] },
  { id: "a2", title: "Career Fair Next Week", to: "All Students · Sent: 2026-09-08", read: 72, body: "Annual Career Exploration Fair will be held on January 22nd in the gymnasium. Over 40 local employers and college representatives will be present. All students encouraged to attend.", tags: [] },
  { id: "a3", title: "Resume Workshop This Friday", to: "Grades 11-12 · Sent: 2026-09-12", read: 64, body: "Join us for a resume writing workshop this Friday after school in the library. We'll cover formatting, content, and how to highlight your achievements. Pizza will be served!", tags: ["Related: Resume"] },
];

const QUESTIONS = [
  { id: "q1", name: "Olivia Chen", grade: 11, question: "I'm interested in both graphic design and animation. How do I decide which career pathway to choose? Can I explore both?", tag: "Career Exploration", date: "2026-09-14", status: "new" as const },
  { id: "q2", name: "Charlotte Davis", grade: 12, question: "I missed the early action deadline for my top choice. Should I still apply regular decision or is it too late?", tag: "Applications", date: "2026-09-13", status: "new" as const },
  { id: "q3", name: "Jackson Thomas", grade: 11, question: "Should I take AP Economics or AP Psychology next year? Which would be better for a business major?", tag: "Academic Planning", date: "2026-09-12", status: "viewed" as const },
  { id: "q4", name: "Isabella Santos", grade: 12, question: "How many colleges should I have on my list? I currently have 15 but I'm not sure if that's too many.", tag: "College Search", date: "2026-09-11", status: "in-progress" as const },
];

const COMMUNITIES = [
  { name: "Grade 9 Planning", desc: "Academic planning, course selection, and getting started with career exploration", members: 142, posts: 87 },
  { name: "Grade 10 Career Exploration", desc: "Discovering career pathways, internships, and summer opportunities", members: 138, posts: 103 },
  { name: "Grade 11 College Planning", desc: "College search, standardized testing, campus visits, and building your college list", members: 145, posts: 156 },
  { name: "Grade 12 Applications", desc: "Application support, essay writing, deadlines, and decision strategies", members: 134, posts: 198 },
  { name: "FAFSA Support", desc: "Financial aid questions, FAFSA help, and scholarship opportunities", members: 267, posts: 142 },
  { name: "Scholarship Opportunities", desc: "Sharing scholarship information, tips, and success stories", members: 289, posts: 124 },
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
  const [statuses, setStatuses] = useState<Record<string, (typeof QUESTIONS)[number]["status"] | "resolved">>({});
  const [response, setResponse] = useState("");
  const selected = QUESTIONS.find((q) => q.id === selectedId)!;
  const statusOf = (id: string) => statuses[id] ?? QUESTIONS.find((q) => q.id === id)!.status;

  return (
    <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-[380px_1fr]">
      <div className="flex flex-col gap-[8px]">
        <span className="text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Student Questions ({QUESTIONS.length})</span>
        {QUESTIONS.map((q) => {
          const status = statusOf(q.id);
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => setSelectedId(q.id)}
              className="dm-quiet flex cursor-pointer flex-col gap-[6px] rounded-[var(--radius-lg)] border p-[var(--space-4)] text-left"
              style={{ borderColor: selectedId === q.id ? "var(--primary)" : "var(--glass-border)", background: selectedId === q.id ? "color-mix(in srgb, var(--primary) 10%, var(--card))" : "var(--card)" }}
            >
              <span className="flex items-center justify-between gap-[8px]">
                <span className="text-[13.5px] font-bold" style={{ color: "var(--foreground)" }}>{q.name}</span>
                {status === "new" && <span className="rounded-full px-[7px] py-[1px] text-[10px] font-bold" style={{ background: "color-mix(in srgb, #E0453C 20%, transparent)", color: "#E0453C" }}>New</span>}
                {status === "resolved" && <Check className="h-[14px] w-[14px]" aria-hidden style={{ color: "#33C78C" }} />}
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
          <h2 className="text-[15px] font-bold" style={{ color: "var(--foreground)" }}>Question Detail</h2>
          <div className="flex flex-col gap-[2px]">
            <span className="text-[14px] font-bold" style={{ color: "var(--foreground)" }}>{selected.name}</span>
            <span className="text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Grade {selected.grade} · {selected.tag} · {selected.date}</span>
          </div>
          <p className="rounded-[var(--radius-md)] border p-[var(--space-4)] text-[13.5px]" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)", color: "var(--foreground)" }}>{selected.question}</p>
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
              onClick={() => { setStatuses((s) => ({ ...s, [selected.id]: "resolved" })); setResponse(""); }}
              className="dm-solid bg-[var(--primary)] text-[var(--primary-foreground)] flex h-10 flex-1 cursor-pointer items-center justify-center gap-[6px] rounded-[var(--radius-md)] text-[13.5px] font-bold disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-[14px] w-[14px]" aria-hidden /> Send Response
            </button>
            <button type="button" onClick={() => setStatuses((s) => ({ ...s, [selected.id]: "resolved" }))} className="dm-quiet flex h-10 flex-1 cursor-pointer items-center justify-center rounded-[var(--radius-md)] border text-[13.5px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
              Mark Resolved
            </button>
          </div>
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
