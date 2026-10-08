"use client";

// DEMO-ONLY v2 fork of ../CounselorConnect.tsx (24 Sept 2026). v1 stays untouched so the
// two builds can be compared live via the bottom-center version chip
// (../version.tsx). Changes from the 24 Sept audit land here.

// 25 Sept 2026 pass under the v2 budget: opens on Student Questions (the
// tab with work in it), questions sorted so unanswered come first with one
// status pill as the only color, a one-line detail header instead of a
// metadata grid, announcements with plain dates, discussions as a compact
// list ordered by activity. Data is the reference's, verbatim.

// Decluttered 2 Oct 2026, to Maisha's Replit (one tab row: Announcements /
// Student Questions / Group Discussions). WHY: the user compared this screen
// with the Replit and found ours "so dense and hard to read". The audit: two
// STACKED tab rows (section tabs, then Needs reply / Answered), a NEW /
// FOLLOW UP / VIEWED chip on every question, two-line previews, and boxes
// inside boxes (a quote box and a textarea inside the detail card). Now:
//   - One tab row only. Needs reply / Answered is a small dropdown in the
//     question list's own header, with its count (the tab badge is gone, so
//     each number is said once).
//   - Questions are ONE card: a list of flat rows (name, date, one-line
//     preview) beside the open question, split by a hairline. The status
//     chip is one quiet amber dot on a row that still owes a reply; the exact
//     status (New, Follow up, Viewed, In progress) is plain text in the open
//     question. Grade, category and date moved from every row to that header.
//   - The open question is flat: the question as plain text, no quote box.
//   - Announcements are one card of dividing rows, not ten bordered cards.
//   - A group's two stat tiles are one muted line (members, posts, last
//     active); every figure is still there.
// Design budget (v2): blue plus status colors, no card tints, gradient bars.

// 9 Oct 2026, Maisha's Prepare consolidation: this page is Messages, not
// Connect. Three tabs: Inbox (student questions and conversations in one
// list), Broadcasts (announcements to a grade, a group or the whole school,
// plus private messages to picked students) and Sent. The Groups boards are
// removed for now (moderation and safety); see CounselorConnect below.

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Send, Check, Bell, Briefcase, ClipboardList, Landmark, Megaphone, MessageSquare } from "lucide-react";
import { Listbox } from "./Listbox";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { Go } from "./chips";
import { Segmented } from "./viz";
import { SubTabs } from "./SubTabs";
import { Avatar, DetailPane, SelectBox, STATUS_COLORS, STATUS_FILLS, StatusChip, StudentLink } from "./chips";
import { DreamyMoment } from "./overviewShared";
import { BatchComposer } from "./Batch";
import { DrillPanel, type Drill, type DrillStudent } from "./Drill";
import { CAREER_TRACKS, getRoster, type CounselorStudent } from "@/lib/counselorRoster";
import { GLASS_CARD as TINTED_CARD, GLASS_INSET } from "../surfaces";
import { BLUE_3 } from "./palette";
import { addAnnouncement, setQuestionState, useAddedAnnouncements, useQuestionStates } from "@/lib/counselorConnect";
import { useSends } from "@/lib/counselorCasefile";
import { draftFor, replyTo, sendToStudent, useMessages } from "@/lib/counselorMessages";
import { remindFafsa } from "@/lib/counselorFafsa";
import "./prepare.css";
import { useShares } from "@/lib/counselorShares";
import { logTime } from "@/lib/counselorTimeLog";
import { ALL_CATALOG_CAREERS } from "@/components/app/catalog";
import { COLLEGES } from "@/components/colleges/data";
import { openCareer, openSchool } from "../v5/ExploreSheets";

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
  { id: "a2", title: "Career Fair Next Week", to: "All Students · Sent: 2026-09-08", read: 72, body: "Annual Career Exploration Fair will be held on January 22nd in the gymnasium. Over 40 local employers and school representatives will be present. All students encouraged to attend.", tags: [] },
  { id: "a3", title: "Resume Workshop This Friday", to: "Grades 11-12 · Sent: 2026-09-12", read: 64, body: "Join us for a resume writing workshop this Friday after school in the library. We'll cover formatting, content, and how to highlight your achievements. Pizza will be served!", tags: ["Related: Resume"] },
  { id: "a4", title: "Application Deadlines", to: "Grade 12 · Sent: 2026-09-05", read: 91, body: "Many regular decision applications are due January 15th - February 1st. Make sure you've submitted all required materials and checked your portal for each school.", tags: ["Related: Application Progress", "Read Receipt Required"] },
  { id: "a5", title: "Grade 9 Academic Planning Session", to: "Grade 9 · Sent: 2026-09-07", read: 68, body: "All freshmen should complete their initial four-year academic plan by the end of this month. Schedule a meeting with your counselor if you need assistance.", tags: ["Related: Academic Plan"] },
  { id: "a6", title: "Scholarship Opportunities Available", to: "Grades 11-12 · Sent: 2026-09-11", read: 79, body: "New local scholarships have been posted in Dreamari. Check the Scholarships tab to see opportunities you qualify for. Many have deadlines in February.", tags: ["Related: Financial Aid Status"] },
  { id: "a7", title: "Career Pathway Selection Reminder", to: "Grade 10 · Sent: 2026-09-09", read: 71, body: "All sophomores should finalize their career pathway selection by the end of January. This helps us align your coursework with your post-secondary goals.", tags: ["Related: Career Pathway Selection", "Acknowledgment Required"] },
  { id: "a8", title: "Junior Year School Planning Timeline", to: "Grade 11 · Sent: 2026-09-13", read: 58, body: "Juniors: now is the time to start your school search. Complete your initial school list in Dreamari and schedule campus visits during spring break.", tags: ["Related: School List"] },
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
  { id: "q4", name: "Isabella Santos", grade: 11, question: "How many schools should I have on my list? I currently have 15 but I'm not sure if that's too many.", tag: "School Search", date: "2026-09-11", status: "in-progress", milestone: "School List" },
  { id: "q5", name: "Sebastian Wilson", grade: 11, question: "Are there any local internships for high school students interested in film production?", tag: "Career Exploration", date: "2026-09-10", status: "responded", milestone: "Career Pathway Selection" },
  { id: "q6", name: "Elizabeth Wilson", grade: 12, question: "My parents don't have all their tax documents ready yet. Can I still submit my FAFSA or should I wait?", tag: "Financial Aid", date: "2026-09-09", status: "responded", milestone: "Financial Aid" },
  { id: "q7", name: "Lucas Miller", grade: 9, question: "What electives should I take next year if I want to pursue graphic design?", tag: "Course Selection", date: "2026-09-15", status: "new", milestone: "Academic Plan" },
  { id: "q8", name: "Marcus Thompson", grade: 11, question: "Should I include my job at the grocery store on my resume even though it's not related to healthcare?", tag: "Resume", date: "2026-09-14", status: "viewed", milestone: "Resume" },
  { id: "q9", name: "Emma Rodriguez", grade: 12, question: "One of my teachers hasn't submitted my recommendation letter yet and the deadline is next week. What should I do?", tag: "Recommendations", date: "2026-09-13", status: "in-progress", milestone: "Recommendation Letter" },
  { id: "q10", name: "Sophia Kim", grade: 12, question: "I'm feeling really stressed about school decisions. Do you have time to talk this week?", tag: "Personal Support", date: "2026-09-12", status: "responded" },
  { id: "q11", name: "Joseph Hernandez", grade: 10, question: "How can I find out more about careers in video game design?", tag: "Career Exploration", date: "2026-09-11", status: "follow-up", milestone: "Career Pathway Selection" },
  { id: "q12", name: "Ethan Garcia", grade: 11, question: "What's the difference between business administration and business management majors?", tag: "School Search", date: "2026-09-10", status: "resolved", milestone: "School List" },
  { id: "q13", name: "Daniel Thomas", grade: 10, question: "Do I need to take physics if I want to be a nurse?", tag: "Academic Planning", date: "2026-09-15", status: "new", milestone: "Academic Plan" },
  { id: "q14", name: "Diego Martinez", grade: 12, question: "The trade school application asks for a personal statement. Is this the same as a school essay?", tag: "Applications", date: "2026-09-14", status: "viewed", milestone: "Application Progress" },
  { id: "q15", name: "Mia Johnson", grade: 12, question: "I want to confirm I'm on track to graduate. Can we review my transcript together?", tag: "Graduation", date: "2026-09-13", status: "responded" },
];

// Color only where the counselor owes something: a new question and a
// follow-up are amber; viewed and in progress are a light blue (someone is
// on it); answered states are neutral. Order is the order to act in.
// `color` is the status word's text ink; `fill` is the row's dot (status
// tokens, Maisha's v4 review, 7 Oct 2026). Status words in Title Case.
const STATUS_STYLE: Record<QuestionStatus, { label: string; color: string; fill: string; rank: number }> = {
  new: { label: "New", color: STATUS_COLORS["Needs Attention"], fill: STATUS_FILLS["Needs Attention"], rank: 0 },
  "follow-up": { label: "Follow Up", color: STATUS_COLORS["Needs Attention"], fill: STATUS_FILLS["Needs Attention"], rank: 1 },
  viewed: { label: "Viewed", color: "var(--primary)", fill: BLUE_3[0], rank: 2 },
  "in-progress": { label: "In Progress", color: "var(--primary)", fill: BLUE_3[0], rank: 3 },
  responded: { label: "Responded", color: "var(--muted-foreground)", fill: "var(--muted-foreground)", rank: 4 },
  resolved: { label: "Resolved", color: "var(--muted-foreground)", fill: "var(--muted-foreground)", rank: 5 },
};



type Announcement = (typeof ANNOUNCEMENTS)[number];
// Who a broadcast can go to (9 Oct 2026, Maisha: "announcements sent to
// grades, groups, or the full school"): the whole school, a grade, the
// juniors and seniors together, or a pathway group.
const AUDIENCES = ["All Students", "Grade 9", "Grade 10", "Grade 11", "Grade 12", "Grades 11-12", ...CAREER_TRACKS.map((t) => `${t} Pathway`)];

/** The students an announcement's "to" line reaches. */
function audienceOf(to: string, roster: CounselorStudent[]): CounselorStudent[] {
  const track = CAREER_TRACKS.find((t) => to === `${t} Pathway`);
  if (track) return roster.filter((s) => s.careerTrack === track);
  const grades = to.startsWith("Grades 11") ? [11, 12] : to.match(/Grade (\d+)/) ? [Number(to.match(/Grade (\d+)/)![1])] : [9, 10, 11, 12];
  return roster.filter((s) => grades.includes(s.grade));
}

// DEMO-ONLY: what the counselor wrote back to the seeded questions that are
// already answered (8 Oct 2026 audit: an answered question read "Reply text
// is not included in this demo record"). Short, plausible replies until
// Connect's history comes from the backend.
export const SEEDED_REPLIES: Record<string, string> = {
  q5: "Yes. The county film office runs a summer internship for juniors, and the local TV station takes student volunteers. I'll send you both links.",
  q6: "You can submit now. The FAFSA uses your parents' tax return from two years ago, so they likely have it already. Book a time if you want to fill it in together.",
  q10: "Of course. I have time Thursday at 10 and saved it for you. Bring your list and we'll sort it out together.",
  q12: "They are close. Administration leans toward planning and leading teams; management leans toward running daily work. Compare each school's course list.",
  q15: "You are on track. The last two credits are already in your schedule. Let's look at your transcript together on Tuesday.",
};

/** Connect as it stands now: the seeded questions and announcements plus
 *  what the counselor did here (src/lib/counselorConnect.ts). Shared with My
 *  Impact so its live period counts the same replies (8 Oct 2026). */
export function useConnectLive() {
  const states = useQuestionStates();
  const added = useAddedAnnouncements();
  // a reply sent from v5 Messages (src/lib/counselorMessages.ts) counts here too
  const v5 = useMessages().replies;
  return useMemo(() => {
    const statusOf = (id: string): QuestionStatus => states[id]?.status ?? (v5[id] ? "responded" : QUESTIONS.find((q) => q.id === id)?.status ?? "new");
    const replyOf = (id: string): string | undefined => states[id]?.reply ?? v5[id]?.text ?? SEEDED_REPLIES[id];
    const answered = QUESTIONS.filter((q) => { const st = statusOf(q.id); return st === "responded" || st === "resolved"; }).length;
    const announcements: Announcement[] = [...added, ...ANNOUNCEMENTS];
    return { statusOf, replyOf, answered, total: QUESTIONS.length, announcements, added };
  }, [states, added, v5]);
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** DEMO-ONLY: who in the audience has read, and acknowledged, an
 *  announcement, seeded from its read rate until receipts come back from the
 *  student app. About four in five readers acknowledge. */
function readersFor(a: Announcement, roster: CounselorStudent[]) {
  const [to] = a.to.split(" · Sent: ");
  const recipients = audienceOf(to, roster);
  const order = [...recipients].sort((x, y) => hashStr(`${a.id}:${x.id}`) - hashStr(`${a.id}:${y.id}`));
  const n = Math.round((a.read / 100) * recipients.length);
  const read = order.slice(0, n);
  const unread = order.slice(n);
  const acknowledged = read.filter((s) => hashStr(`${a.id}:ack:${s.id}`) % 5 !== 0);
  const ackIds = new Set(acknowledged.map((s) => s.id));
  return { recipients, read, unread, acknowledged, notAcknowledged: order.filter((s) => !ackIds.has(s.id)) };
}

const ds = (s: CounselorStudent, note: string): DrillStudent => ({ id: s.id, name: s.name, grade: s.grade, avatarIndex: s.avatarIndex, note });

// A card opens (expands) to its read-receipt bar, who it went to, and the
// way into that audience on Students. Direct question, 25 Sept 2026:
// "the cards aren't clickable, should they be? Where does the announcement
// go?" It goes to the students in its audience; the card now says how many
// and how many have read it, and opens that roster.
function AnnouncementCard({ a, open, onToggle }: { a: Announcement; open: boolean; onToggle: () => void }) {
  const [to,sent] = a.to.split(" · Sent: ");
  return <li><button type="button" className="v4-broadcast-item" aria-pressed={open} onClick={onToggle}><span className="v4-broadcast-date">{fmtDate(sent)}</span><strong>{a.title}</strong><small>{to}</small><span className="v4-broadcast-read"><i style={{width:`${a.read}%`}}/></span></button></li>;
}

// Recipients and the two requirement tags open who has read or acknowledged
// it, unread first, with one action: message the ones who have not (8 Oct
// 2026 audit: "Recipients" only jumped to the whole grade on Students).
function AnnouncementReading({ a, onDrill, onMessage }: { a: Announcement; onDrill: (d: Drill) => void; onMessage: (ids: string[]) => void }) {
  const roster = useReviewedRoster();
  const [to,sent] = a.to.split(" · Sent: ");
  const r = readersFor(a, roster);
  const related = a.tags.filter((t) => t.startsWith("Related: ")).map((t) => t.replace(/^Related: /, ""));
  const needsReceipt = a.tags.includes("Read Receipt Required");
  const needsAck = a.tags.includes("Acknowledgment Required");
  const readDrill = (): Drill => ({
    title: "Who Has Read It", subtitle: `${a.title} · ${r.read.length} of ${r.recipients.length} read`,
    students: [...r.unread.map((s) => ds(s, "Not read yet")), ...r.read.map((s) => ds(s, "Read"))], studentsLabel: `${r.recipients.length} recipients · not read first`,
    action: r.unread.length ? { label: `Message the ${r.unread.length} who have not read it`, onClick: () => onMessage(r.unread.map((s) => s.id)) } : undefined,
  });
  const ackDrill = (): Drill => ({
    title: "Who Has Acknowledged It", subtitle: `${a.title} · ${r.acknowledged.length} of ${r.recipients.length} acknowledged`,
    students: [...r.notAcknowledged.map((s) => ds(s, "Not acknowledged yet")), ...r.acknowledged.map((s) => ds(s, "Acknowledged"))], studentsLabel: `${r.recipients.length} recipients · not acknowledged first`,
    action: r.notAcknowledged.length ? { label: `Message the ${r.notAcknowledged.length} who have not acknowledged it`, onClick: () => onMessage(r.notAcknowledged.map((s) => s.id)) } : undefined,
  });
  const tagButton = "dm-quiet flex h-8 cursor-pointer items-center gap-[6px] rounded-full border px-[12px] text-[12px] font-semibold";
  return <article className="v4-broadcast-reading"><header><span className="v4-overline">Published Announcement</span><small>{fmtDate(sent)}</small></header><h2>{a.title}</h2><p className="v4-message-address">To {to}</p><div className="v4-message-prose">{a.body}</div>{related.length>0 && <p className="v4-source-note">{related.join(' · ')}</p>}
    {(needsReceipt || needsAck) && <div className="flex flex-wrap gap-[8px]">
      {needsReceipt && <button type="button" onClick={() => onDrill(readDrill())} className={tagButton} style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>Read receipt required<Go /></button>}
      {needsAck && <button type="button" onClick={() => onDrill(ackDrill())} className={tagButton} style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>Acknowledged <span style={{ color: "var(--muted-foreground)" }}>{r.acknowledged.length} of {r.recipients.length}</span><Go /></button>}
    </div>}
    <footer><div className="v4-read-ring"><svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="19" fill="none" stroke="var(--glass-border)" strokeWidth="3"/><circle cx="24" cy="24" r="19" pathLength="100" fill="none" stroke="var(--primary)" strokeWidth="3" strokeDasharray={`${a.read} 100`} transform="rotate(-90 24 24)"/></svg><strong>{a.read}<small>%</small></strong></div><span><strong>Read by students</strong><small>{r.read.length ? `${r.read.length} of ${r.recipients.length} students` : `Not read yet · ${r.recipients.length} students`}</small></span><button type="button" className="v4-text-action" onClick={() => onDrill(readDrill())}>Recipients <Go/></button></footer></article>;
}

function AnnouncementComposer({ onSend, onCancel }: { onSend: (a: Announcement) => void; onCancel: () => void }) {
  const [title, setTitle] = useState("");
  const [audience, setAudience] = useState<string>("All Students");
  const [body, setBody] = useState("");
  const field = { background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" } as const;
  return <div className="v4-message-compose-grid"><div className="v4-message-compose-fields"><label><span>01 / Audience</span><Listbox ariaLabel="Audience" value={audience} onChange={setAudience} options={AUDIENCES.map(a=>({value:a,label:a}))} className="v4-period-select" style={field}/></label><label><span>02 / Subject</span><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Give students a clear headline" aria-label="Title" style={field}/></label><label><span>03 / Message</span><textarea value={body} onChange={e=>setBody(e.target.value)} placeholder="What do students need to know or do?" aria-label="Body" rows={8} style={field}/></label><div className="v4-compose-footer"><button type="button" className="v4-secondary-action" onClick={onCancel}>Discard</button><button type="button" className="v4-primary-action" disabled={!title.trim()||!body.trim()} onClick={()=>onSend({id:`a-${Date.now()}`,title:title.trim(),to:`${audience} · Sent: ${new Date().toISOString().slice(0,10)}`,read:0,body:body.trim(),tags:[]})}><Send size={14}/>Publish announcement</button></div></div><aside className="v4-announcement-proof"><span className="v4-overline">Student Preview</span><div><span>School counseling · {audience}</span><h3>{title || 'Your announcement headline'}</h3><p>{body || 'Your message will appear here as you write.'}</p><small>From your counselor</small></div></aside></div>;
}

const FIELD = "flex h-10 w-full cursor-pointer items-center justify-between gap-[8px] rounded-[var(--radius-sm)] border px-[10px] text-left text-[13px] font-semibold";
const FIELD_STYLE = { background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" } as const;

/** Search and pick students by name: the private message's pick list,
 *  shared with New group's member picker (8 Oct 2026). */
function StudentPicker({ picked, setPicked }: { picked: Set<string>; setPicked: React.Dispatch<React.SetStateAction<Set<string>>> }) {
  const roster = useReviewedRoster();
  const students = useMemo(() => [...roster].sort((a, b) => a.name.localeCompare(b.name)), [roster]);
  const [pickSearch, setPickSearch] = useState("");
  const togglePick = (id: string) => setPicked((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  const pickList = students.filter((s) => !pickSearch.trim() || s.name.toLowerCase().includes(pickSearch.trim().toLowerCase()));
  return (
    <div className="flex flex-col gap-[8px] rounded-[var(--radius-md)] border p-[10px]" style={GLASS_INSET}>
      <div className="flex flex-wrap items-center justify-between gap-[8px]">
        <input value={pickSearch} onChange={(e) => setPickSearch(e.target.value)} placeholder="Search a name" aria-label="Search students" className="h-9 min-w-[200px] flex-1 rounded-[var(--radius-sm)] border px-[10px] text-[13px] outline-none" style={FIELD_STYLE} />
        <span className="flex items-center gap-[8px] text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
          {picked.size} picked
          {picked.size > 0 && <button type="button" onClick={() => setPicked(new Set())} className="dm-quiet cursor-pointer rounded-full border px-[10px] py-[3px] text-[12px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>Clear</button>}
          {pickList.length > 0 && <button type="button" onClick={() => setPicked((prev) => { const next = new Set(prev); for (const s of pickList) next.add(s.id); return next; })} className="dm-quiet cursor-pointer rounded-full border px-[10px] py-[3px] text-[12px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>Pick all {pickList.length}</button>}
        </span>
      </div>
      <ul className="flex max-h-[260px] flex-col gap-[2px] dm-scroll overflow-y-auto pr-[4px]">
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
  );
}

// A private message to a chosen set of students, each receiving it in
// their own inbox: moved here from the Productivity Suite's "Group
// message" (27 Sept 2026, Maisha: "Group message - idk if this is
// necessary because they can technically send group messages via the
// counselor connect - is there a difference here?"). There is one: an
// announcement is posted where a whole grade reads it, while this goes
// privately to exactly the students picked, by status, pathway or name
// (a note to the at-risk students cannot be a public post). Both are
// outgoing messages, so both now start from Counselor Connect's one
// "New message" button.
function PrivateMessageComposer({ initialPathway, initialIds, onCancel }: { initialPathway: string | null; initialIds: string[]; onCancel: () => void }) {
  const roster = useReviewedRoster();
  const students = useMemo(() => [...roster].sort((a, b) => a.name.localeCompare(b.name)), [roster]);
  const [gGrade, setGGrade] = useState("All");
  const [gStatus, setGStatus] = useState("All");
  const [gPathway, setGPathway] = useState(initialPathway && (CAREER_TRACKS as readonly string[]).includes(initialPathway) ? initialPathway : "All");
  const [gMode, setGMode] = useState<"audience" | "pick">(initialIds.length ? "pick" : "audience");
  const [picked, setPicked] = useState<Set<string>>(() => new Set(initialIds));
  const [sent, setSent] = useState<string | null>(null);
  const byAudience = roster.filter((s) => (gGrade === "All" || String(s.grade) === gGrade) && (gStatus === "All" || s.status === gStatus) && (gPathway === "All" || s.careerTrack === gPathway));
  const audience = gMode === "pick" ? students.filter((s) => picked.has(s.id)) : byAudience;
  const audienceLabel = gMode === "pick" ? `${picked.size} picked` : [gGrade === "All" ? "All grades" : `Grade ${gGrade}`, gStatus === "All" ? null : gStatus, gPathway === "All" ? null : gPathway].filter(Boolean).join(" · ");
  const labelCls = "text-[11px] font-bold tracking-[0.04em] uppercase";
  return (
    <div className="flex flex-col gap-[var(--space-3)]">
      {/* a switch inside the composer card (level 4, the compact underline),
         never the page pill (9 Oct 2026) */}
      <Segmented ariaLabel="Who receives it" value={gMode} onChange={setGMode} options={[{ key: "audience", label: "By Audience" }, { key: "pick", label: "Pick Students" }]} />
      {gMode === "pick" ? (
        <StudentPicker picked={picked} setPicked={setPicked} />
      ) : (
        <div className="grid grid-cols-1 gap-[var(--space-3)] sm:grid-cols-3">
          <label className="flex min-w-0 flex-col gap-[4px]">
            <span className={labelCls} style={{ color: "var(--muted-foreground)" }}>Grade</span>
            <Listbox ariaLabel="Grade" value={gGrade} onChange={setGGrade} options={[{ value: "All", label: "All grades" }, ...["9", "10", "11", "12"].map((g) => ({ value: g, label: `Grade ${g}` }))]} className={FIELD} style={FIELD_STYLE} />
          </label>
          <label className="flex min-w-0 flex-col gap-[4px]">
            <span className={labelCls} style={{ color: "var(--muted-foreground)" }}>Status</span>
            <Listbox ariaLabel="Status" value={gStatus} onChange={setGStatus} options={[{ value: "All", label: "All statuses" }, ...["On Track", "Needs Attention", "At Risk"].map((v) => ({ value: v, label: v }))]} className={FIELD} style={FIELD_STYLE} />
          </label>
          <label className="flex min-w-0 flex-col gap-[4px]">
            <span className={labelCls} style={{ color: "var(--muted-foreground)" }}>Pathway</span>
            <Listbox ariaLabel="Pathway" value={gPathway} onChange={setGPathway} options={[{ value: "All", label: "All pathways" }, ...CAREER_TRACKS.map((t) => ({ value: t, label: t }))]} className={FIELD} style={FIELD_STYLE} />
          </label>
        </div>
      )}
      {sent && <p className="flex items-center gap-[8px] text-[13px] font-bold" style={{ color: "var(--foreground)" }}><Check className="h-[14px] w-[14px]" aria-hidden style={{ color: "var(--primary)" }} />{sent}</p>}
      {audience.length === 0 ? (
        <p className="text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{gMode === "pick" ? "Pick at least one student above." : "No students match that audience. Widen a filter."}</p>
      ) : (
        <BatchComposer students={audience} audience={audienceLabel} onDone={(summary) => { setSent(summary); if (gMode === "pick") setPicked(new Set()); }} />
      )}
      <div className="flex justify-end">
        <button type="button" onClick={onCancel} className="dm-quiet flex h-9 cursor-pointer items-center rounded-[var(--radius-sm)] border px-[14px] text-[13px] font-semibold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>{sent ? "Done" : "Cancel"}</button>
      </div>
    </div>
  );
}

// One "New message" composer: an announcement a whole grade sees on the
// board, or a private message to chosen students.
function MessageComposer({ initialKind, initialPathway, initialIds, onSendAnnouncement, onCancel }: { initialKind: "announcement" | "private"; initialPathway: string | null; initialIds: string[]; onSendAnnouncement: (a: Announcement) => void; onCancel: () => void }) {
  const [kind, setKind] = useState(initialKind);
  return (
    <div className="v4-message-composer v4-surface" style={TINTED_CARD}>
      <div className="v4-composer-heading">
        <h3 className="text-[15px] font-bold" style={{ color: "var(--foreground)" }}>New Message</h3>
        <Listbox ariaLabel="Message type" value={kind} onChange={k=>setKind(k as "announcement"|"private")} options={[{value:"announcement",label:"Announcement"},{value:"private",label:"Private message"}]} className="v4-period-select"/>
        <span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{kind === "announcement" ? "Posted to the board for everyone in the audience." : "Sent privately to each chosen student."}</span>
      </div>
      {kind === "announcement" ? <AnnouncementComposer onSend={onSendAnnouncement} onCancel={onCancel} /> : <PrivateMessageComposer initialPathway={initialPathway} initialIds={initialIds} onCancel={onCancel} />}
    </div>
  );
}

const LIST_FIELD = "flex h-9 w-full cursor-pointer items-center justify-between gap-[8px] rounded-[var(--radius-sm)] border px-[10px] text-left text-[13px] font-bold";

// ---- Inbox --------------------------------------------------------------------
// Messages > Inbox (9 Oct 2026, Maisha: "Remove 'Questions' as its own
// category. Student questions are simply incoming messages, so they can
// live within Messages → Inbox. The counselor should still see: Student,
// Grade, Topic, Question, Date, Reply, Resolve."). One list holds both:
// the students' questions and the one-to-one conversations the counselor
// started (a student page's Message, a FAFSA reminder; src/lib/
// counselorMessages.ts). Needs Reply / Answered / Conversations stays a
// dropdown in the list's own header, never a second tab row.
// &question= opens one question; &studentId= opens that student's open
// question, or their conversation (started fresh if there is none), and
// &draft= fills a ready-made first message (v5's links, mapped here by cv()).

type Question = (typeof QUESTIONS)[number];
type InboxRow =
  | { kind: "question"; key: string; q: Question; name: string; grade: number; date: string; studentId?: string; avatarIndex?: number }
  | { kind: "thread"; key: string; name: string; grade: number; date: string; studentId: string; avatarIndex?: number; messages: { text: string; at: string }[] };
type InboxGroup = "reply" | "answered" | "threads";
const OWES: QuestionStatus[] = ["new", "follow-up", "viewed", "in-progress"];
const threadKey = (id: string) => `t-${id}`;

function InboxPanel({ initialQuestion, initialStudent, initialDraft }: { initialQuestion: string | null; initialStudent: string | null; initialDraft: string | null }) {
  // Statuses and replies are kept (src/lib/counselorConnect.ts, 8 Oct 2026),
  // so a reply or a resolve survives a reload and My Impact counts it.
  const live = useConnectLive();
  const statusOf = live.statusOf;
  const roster = useReviewedRoster();
  const { threads } = useMessages();
  const byName = useMemo(() => new Map(getRoster().map((s) => [s.name, s])), []);
  const linkedStudent = initialStudent ? roster.find((s) => s.id === initialStudent) : undefined;
  // a conversation opened from a link before its first message is sent
  const [pending, setPending] = useState<CounselorStudent | null>(() => (linkedStudent && !threads.some((t) => t.studentId === linkedStudent.id) && (initialDraft || !QUESTIONS.some((q) => q.name === linkedStudent.name && OWES.includes(statusOf(q.id)))) ? linkedStudent : null));

  const questionRows = useMemo<InboxRow[]>(() => QUESTIONS.map((q) => { const st = byName.get(q.name); return { kind: "question" as const, key: q.id, q, name: q.name, grade: q.grade, date: q.date, studentId: st?.id, avatarIndex: st?.avatarIndex }; }), [byName]);
  const threadRows = useMemo<Extract<InboxRow, { kind: "thread" }>[]>(() => {
    const byId = new Map(roster.map((s) => [s.id, s]));
    const rows: Extract<InboxRow, { kind: "thread" }>[] = threads.map((t) => ({ kind: "thread" as const, key: threadKey(t.studentId), name: t.name, grade: byId.get(t.studentId)?.grade ?? 0, date: t.messages[t.messages.length - 1]?.at ?? "", studentId: t.studentId, avatarIndex: byId.get(t.studentId)?.avatarIndex, messages: t.messages }));
    if (pending && !threads.some((t) => t.studentId === pending.id)) rows.unshift({ kind: "thread", key: threadKey(pending.id), name: pending.name, grade: pending.grade, date: "", studentId: pending.id, avatarIndex: pending.avatarIndex, messages: [] });
    return rows.sort((a, b) => (a.messages.length ? 0 : -1) - (b.messages.length ? 0 : -1) || b.date.localeCompare(a.date));
  }, [threads, roster, pending]);
  const inGroup = (g: InboxGroup): InboxRow[] => g === "threads" ? threadRows : questionRows.filter((r) => r.kind === "question" && (g === "reply" ? OWES.includes(statusOf(r.q.id)) : !OWES.includes(statusOf(r.q.id))));

  // Where a link lands: a question, a student's open question, or their conversation.
  const start = (() => {
    if (initialQuestion && QUESTIONS.some((q) => q.id === initialQuestion)) return { group: (OWES.includes(statusOf(initialQuestion)) ? "reply" : "answered") as InboxGroup, key: initialQuestion };
    if (linkedStudent) {
      const open = initialDraft ? undefined : QUESTIONS.filter((q) => q.name === linkedStudent.name && OWES.includes(statusOf(q.id))).sort((a, b) => b.date.localeCompare(a.date))[0];
      return open ? { group: "reply" as InboxGroup, key: open.id } : { group: "threads" as InboxGroup, key: threadKey(linkedStudent.id) };
    }
    return null;
  })();
  const [group, setGroup] = useState<InboxGroup>(start?.group ?? "reply");
  const rows = group === "reply"
    ? inGroup("reply").sort((a, b) => a.kind === "question" && b.kind === "question" ? STATUS_STYLE[statusOf(a.q.id)].rank - STATUS_STYLE[statusOf(b.q.id)].rank || b.date.localeCompare(a.date) : 0)
    : group === "answered" ? inGroup("answered").sort((a, b) => b.date.localeCompare(a.date)) : inGroup("threads");
  const [selectedKey, setSelectedKey] = useState(() => start?.key ?? rows[0]?.key ?? QUESTIONS[0].id);
  const [sheetOpen, setSheetOpen] = useState(!!start);
  const [response, setResponse] = useState(() => (linkedStudent ? draftFor(initialDraft, linkedStudent.name.split(" ")[0]) : ""));
  const [draftKey, setDraftKey] = useState<string | null>(initialDraft);
  const selected = [...questionRows, ...threadRows].find((r) => r.key === selectedKey) ?? rows[0];
  // After a reply or a resolve, the next question still needing a reply
  // opens, so working the list is one motion (and the last one lands on
  // the cleared state).
  const advance = () => { const next = rows.find((r) => r.key !== selectedKey); if (next) setSelectedKey(next.key); };
  const pick = (key: string) => { setSelectedKey(key); setResponse(""); setDraftKey(null); setSheetOpen(true); };
  const counts: Record<InboxGroup, number> = { reply: inGroup("reply").length, answered: inGroup("answered").length, threads: threadRows.filter((r) => r.messages.length).length };
  const GROUPS: { value: InboxGroup; label: string }[] = [
    { value: "reply", label: `Needs Reply · ${counts.reply}` },
    { value: "answered", label: `Answered · ${counts.answered}` },
    { value: "threads", label: `Conversations · ${counts.threads}` },
  ];

  return (
    <div className="v4-conversation-layout v4-surface grid grid-cols-1 overflow-hidden rounded-[var(--radius-lg)] border lg:grid-cols-[360px_minmax(0,1fr)]" style={TINTED_CARD}>
      <div className="flex min-w-0 flex-col lg:border-r" style={{ borderColor: "var(--glass-border)" }}>
        <div className="flex items-center border-b p-[var(--space-4)]" style={{ borderColor: "var(--glass-border)" }}>
          <Listbox
            ariaLabel="Show messages"
            value={group}
            onChange={(k) => { const g = k as InboxGroup; setGroup(g); const next = inGroup(g)[0]; if (next) setSelectedKey(next.key); setResponse(""); }}
            options={GROUPS}
            className={LIST_FIELD}
            style={FIELD_STYLE}
          />
        </div>
        <ul className="dm-scroll flex max-h-[calc(70vh/var(--vz,1))] flex-col dm-scroll overflow-y-auto">
          {/* Every question answered earns Dreamy's celebrate (Maisha's
             "extra kick of excitement", at a real win only). */}
          {rows.length === 0 && (group === "reply"
            ? <li className="v4-today-clear px-[var(--space-5)] py-[var(--space-6)]"><DreamyMoment mood="celebrate" size={72} /><h3>Every Question Has a Reply</h3><p>New messages from students land here first.</p></li>
            : <li className="px-[var(--space-5)] py-[var(--space-5)] text-center text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{group === "threads" ? "No conversations yet. Message a student from their page." : "Nothing here right now."}</li>)}
          {rows.map((r) => {
            const on = selected?.key === r.key;
            const st = r.kind === "question" ? statusOf(r.q.id) : null;
            const owed = st === "new" || st === "follow-up";
            const line = r.kind === "question" ? r.q.question : r.messages[r.messages.length - 1]?.text ?? "Write your first message";
            const topic = r.kind === "question" ? r.q.tag : r.messages.length ? `${r.messages.length} sent` : "New conversation";
            return (
              <li key={r.key} className="border-t first:border-t-0" style={{ borderColor: "var(--glass-border)" }}>
                <button
                  type="button"
                  onClick={() => pick(r.key)}
                  aria-pressed={on}
                  className="dm-quiet flex w-full cursor-pointer items-center gap-[12px] px-[var(--space-4)] py-[12px] text-left"
                  style={{ background: on ? "color-mix(in srgb, var(--foreground) 6%, transparent)" : undefined, boxShadow: on ? "inset 2px 0 0 var(--primary)" : undefined }}
                >
                  <Avatar name={r.name} index={r.avatarIndex} size={32} />
                  <span className="flex min-w-0 flex-1 flex-col gap-[1px] leading-tight">
                    <span className="flex items-baseline justify-between gap-[8px]">
                      <span className="flex min-w-0 items-center gap-[6px]">
                        <span className="truncate text-[13.5px] font-bold" style={{ color: "var(--foreground)" }}>{r.name}</span>
                        {owed && st && <span role="img" aria-label="Needs a reply" className="size-[7px] flex-none rounded-full" style={{ background: STATUS_STYLE[st].fill }} />}
                      </span>
                      <span className="flex-none text-[11.5px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{r.date ? shortDay(r.date) : ""}</span>
                    </span>
                    <span className="truncate text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{r.grade ? `Grade ${r.grade} · ` : ""}{topic}</span>
                    <span className="truncate text-[12.5px]" style={{ color: r.kind === "question" && OWES.includes(st as QuestionStatus) ? "var(--foreground)" : "var(--muted-foreground)" }}>{line}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      <DetailPane open={sheetOpen} onClose={() => setSheetOpen(false)}>
        {selected && (selected.kind === "question"
          ? <QuestionReading row={selected} status={statusOf(selected.q.id)} reply={live.replyOf(selected.q.id)} response={response} setResponse={setResponse}
              onReply={() => { const text = response.trim(); setQuestionState(selected.q.id, "responded", text); replyTo(selected.q.id, text); logTime({ activity: "Answered a question", minutes: 5, kind: "indirect", studentId: selected.studentId }); setResponse(""); setSheetOpen(false); if (group === "reply") advance(); }}
              onResolve={() => { setQuestionState(selected.q.id, "resolved"); setSheetOpen(false); if (group === "reply") advance(); }} />
          : <ThreadReading row={selected} response={response} setResponse={setResponse}
              onSend={() => { const text = response.trim(); sendToStudent(selected.studentId, selected.name, text); if (draftKey === "fafsa") remindFafsa([selected.studentId]); logTime({ activity: "Messaged a student", minutes: 3, kind: "indirect", studentId: selected.studentId }); setResponse(""); setDraftKey(null); setPending(null); }} />)}
      </DetailPane>
    </div>
  );
}

/** One question: who, grade, topic, date and status on one line; the
 *  question; then Reply and Resolve (or the reply already sent). */
function QuestionReading({ row, status, reply, response, setResponse, onReply, onResolve }: { row: Extract<InboxRow, { kind: "question" }>; status: QuestionStatus; reply?: string; response: string; setResponse: (v: string) => void; onReply: () => void; onResolve: () => void }) {
  const q = row.q;
  const answered = status === "responded" || status === "resolved";
  return (
    <div className="v4-question-reading flex flex-col gap-[var(--space-4)] lg:p-[var(--space-5)]">
      <div className="flex items-start justify-between gap-[var(--space-3)]">
        <StudentLink id={row.studentId} name={q.name} index={row.avatarIndex}>
          <span className="text-[12.5px] leading-[17px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Grade {q.grade} · {q.tag} · {fmtDate(q.date)}{q.milestone ? ` · ${q.milestone}` : ""}</span>
        </StudentLink>
        <span className="flex-none text-[12.5px] font-bold" style={{ color: STATUS_STYLE[status].color }}>{STATUS_STYLE[status].label}</span>
      </div>
      <p className="v4-question-prose border-t pt-[var(--space-4)] text-[15px] leading-[22px]" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>{q.question}</p>
      {answered ? (
        <p className="text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{reply ? <span className="v4-sent-response"><small>My reply</small>{reply}</span> : "Resolved without a reply."}</p>
      ) : (
        <>
          <textarea value={response} onChange={(e) => setResponse(e.target.value)} placeholder={`Reply to ${q.name.split(" ")[0]}`} aria-label="My reply" rows={4} className="w-full resize-none rounded-[var(--radius-md)] border px-[12px] py-[10px] text-[13px] outline-none" style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" }} />
          <div className="flex gap-[10px]">
            <button type="button" disabled={response.trim().length === 0} onClick={onReply} className="dm-solid bg-[var(--primary)] text-[var(--primary-foreground)] flex h-10 flex-1 cursor-pointer items-center justify-center gap-[6px] rounded-[var(--radius-md)] text-[13.5px] font-bold disabled:cursor-not-allowed disabled:opacity-50">
              <Send className="h-[14px] w-[14px]" aria-hidden /> Send reply
            </button>
            <button type="button" onClick={onResolve} className="dm-quiet flex h-10 flex-1 cursor-pointer items-center justify-center rounded-[var(--radius-md)] border text-[13.5px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
              Mark resolved
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/** A conversation the counselor started: what went out, then the box. */
function ThreadReading({ row, response, setResponse, onSend }: { row: Extract<InboxRow, { kind: "thread" }>; response: string; setResponse: (v: string) => void; onSend: () => void }) {
  return (
    <div className="v4-question-reading flex flex-col gap-[var(--space-4)] lg:p-[var(--space-5)]">
      <StudentLink id={row.studentId} name={row.name} index={row.avatarIndex}>
        <span className="text-[12.5px] leading-[17px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{row.grade ? `Grade ${row.grade} · ` : ""}Conversation</span>
      </StudentLink>
      {row.messages.length > 0 && (
        <ul className="flex flex-col gap-[var(--space-3)] border-t pt-[var(--space-4)]" style={{ borderColor: "var(--glass-border)" }}>
          {row.messages.map((m) => (
            <li key={m.at} className="flex flex-col gap-[2px]">
              <span className="text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>You · {shortDay(m.at)}</span>
              <p className="text-[14px] leading-[21px] whitespace-pre-wrap" style={{ color: "var(--foreground)" }}>{m.text}</p>
            </li>
          ))}
        </ul>
      )}
      <textarea value={response} onChange={(e) => setResponse(e.target.value)} placeholder={`Write to ${row.name.split(" ")[0]}`} aria-label="Message" rows={4} className="w-full resize-none rounded-[var(--radius-md)] border px-[12px] py-[10px] text-[13px] outline-none" style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" }} />
      <button type="button" disabled={response.trim().length === 0} onClick={onSend} className="dm-solid bg-[var(--primary)] text-[var(--primary-foreground)] flex h-10 cursor-pointer items-center justify-center gap-[6px] rounded-[var(--radius-md)] text-[13.5px] font-bold disabled:cursor-not-allowed disabled:opacity-50">
        <Send className="h-[14px] w-[14px]" aria-hidden /> Send
      </button>
    </div>
  );
}

// ---- Sent ---------------------------------------------------------------------

type SentKind = "message" | "reminder" | "todo" | "announcement" | "share";
type SentRow = { id: string; at: string; kind: SentKind; label: string; icon: typeof Bell; text: string; audience: string; studentIds: string[]; open?: () => void; openLabel?: string };
const SENT_FILTERS: { value: "all" | SentKind; label: string }[] = [
  { value: "all", label: "Everything sent" },
  { value: "message", label: "Messages" },
  { value: "reminder", label: "Reminders" },
  { value: "todo", label: "To-dos" },
  { value: "announcement", label: "Announcements" },
  { value: "share", label: "Shared from Explore" },
];
const SEND_LABEL: Record<"message" | "reminder" | "todo", { label: string; icon: typeof Bell }> = { message: { label: "Message", icon: MessageSquare }, reminder: { label: "Reminder", icon: Bell }, todo: { label: "To-do", icon: ClipboardList } };
const shortDay = (iso: string) => new Date(iso.length === 10 ? `${iso}T12:00:00` : iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });

/** Everything that went out from the dashboard in one list, newest first
 *  (8 Oct 2026 audit: messages, reminders, to-dos and Explore shares were
 *  recorded and never shown). A row opens who it went to. */
function SentPanel({ announcements, onOpenAnnouncement, onMessage }: { announcements: Announcement[]; onOpenAnnouncement: (id: string) => void; onMessage: (ids: string[]) => void }) {
  const sends = useSends();
  const shares = useShares();
  const threads = useMessages().threads;
  const roster = useReviewedRoster();
  const [filter, setFilter] = useState<"all" | SentKind>("all");
  const [drill, setDrill] = useState<Drill | null>(null);
  const rows = useMemo<SentRow[]>(() => [
    ...sends.map((s) => ({ id: s.id, at: s.at, kind: s.kind, ...SEND_LABEL[s.kind], text: s.due ? `${s.text} Due ${shortDay(s.due)}.` : s.text, audience: s.audience, studentIds: s.studentIds })),
    // one-to-one messages from a student page or brief (v5's thread store)
    ...threads.flatMap((t) => t.messages.map((m, i) => ({ id: `${t.studentId}-${i}`, at: m.at, kind: "message" as const, ...SEND_LABEL.message, text: m.text, audience: t.name, studentIds: [t.studentId] }))),
    ...announcements.map((a) => { const [to, sent] = a.to.split(" · Sent: "); return { id: a.id, at: `${sent}T12:00:00`, kind: "announcement" as const, label: "Announcement", icon: Megaphone, text: a.title, audience: to, studentIds: [], open: () => onOpenAnnouncement(a.id) }; }),
    ...shares.map((sh) => {
      const career = sh.kind === "career" ? ALL_CATALOG_CAREERS.find((c) => c.title === sh.title) : undefined;
      const school = sh.kind === "school" ? COLLEGES.find((c) => c.slug === sh.ref) : undefined;
      return { id: sh.id, at: sh.at, kind: "share" as const, label: sh.kind === "career" ? "Career shared" : sh.kind === "school" ? "School shared" : "Shared", icon: sh.kind === "school" ? Landmark : Briefcase, text: sh.title, audience: `${sh.studentIds.length} student${sh.studentIds.length === 1 ? "" : "s"}`, studentIds: sh.studentIds, open: career ? () => openCareer(career) : school ? () => openSchool(school) : undefined, openLabel: `Open ${sh.title}` };
    }),
  ].sort((a, b) => b.at.localeCompare(a.at)), [sends, shares, threads, announcements, onOpenAnnouncement]);
  const shown = filter === "all" ? rows : rows.filter((r) => r.kind === filter);
  const openRow = (r: SentRow) => {
    if (r.kind === "announcement") { r.open?.(); return; }
    const to = r.studentIds.map((id) => roster.find((s) => s.id === id)).filter((s): s is CounselorStudent => !!s);
    setDrill({
      title: r.label, subtitle: `${shortDay(r.at)} · ${r.audience}`, lead: r.text,
      students: to.map((s) => ds(s, s.careerTrack)), studentsLabel: `Sent to ${to.length} student${to.length === 1 ? "" : "s"}`,
      action: r.open ? { label: r.openLabel ?? "Open", onClick: () => { setDrill(null); r.open?.(); } } : to.length ? { label: `Message ${to.length === 1 ? to[0].name.split(" ")[0] : `these ${to.length}`} again`, onClick: () => { setDrill(null); onMessage(to.map((s) => s.id)); } } : undefined,
    });
  };
  return (
    <div className="v4-surface flex flex-col overflow-hidden rounded-[var(--radius-lg)] border" style={TINTED_CARD}>
      <div className="flex flex-wrap items-center justify-between gap-[8px] border-b p-[var(--space-4)]" style={{ borderColor: "var(--glass-border)" }}>
        <div className="w-[220px]"><Listbox ariaLabel="What was sent" value={filter} onChange={(v) => setFilter(v as "all" | SentKind)} options={SENT_FILTERS} className={LIST_FIELD} style={FIELD_STYLE} /></div>
        <span className="text-[12.5px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{shown.length} sent</span>
      </div>
      <ul className="flex flex-col">
        {shown.length === 0 && <li className="px-[var(--space-5)] py-[var(--space-5)] text-center text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Nothing of this kind sent yet.</li>}
        {shown.map((r) => (
          <li key={`${r.kind}-${r.id}`} className="border-t first:border-t-0" style={{ borderColor: "var(--glass-border)" }}>
            <button type="button" onClick={() => openRow(r)} className="dm-quiet group flex w-full cursor-pointer items-center gap-[12px] px-[var(--space-4)] py-[12px] text-left">
              <span className="flex size-[32px] flex-none items-center justify-center rounded-full" style={{ background: "color-mix(in srgb, var(--primary) 14%, transparent)", color: "var(--primary)" }}><r.icon className="h-[15px] w-[15px]" aria-hidden /></span>
              <span className="flex min-w-0 flex-1 flex-col gap-[1px] leading-tight">
                <span className="flex items-baseline justify-between gap-[8px]">
                  <span className="truncate text-[13.5px] font-bold" style={{ color: "var(--foreground)" }}>{r.label} <span className="font-semibold" style={{ color: "var(--muted-foreground)" }}>· {r.audience}</span></span>
                  <span className="flex-none text-[11.5px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{shortDay(r.at)}</span>
                </span>
                <span className="truncate text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>{r.text}</span>
              </span>
              <Go className="flex-none opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
          </li>
        ))}
      </ul>
      <DrillPanel drill={drill} onClose={() => setDrill(null)} />
    </div>
  );
}

// Messages (9 Oct 2026, Maisha: "Replace the current Connect section with
// 'Messages' inside Prepare. Inside Messages, keep: Inbox ..., Broadcasts
// (announcements sent to grades, groups, or the full school), Sent
// (previous communication)"). Three tabs, one row. Groups are gone ("Remove
// 'Groups' as student-to-student discussion boards for now ... creates
// moderation/safety complexity"); Questions folded into Inbox. Old links
// still land: &tab=questions and &tab=discussions open Inbox,
// &tab=announcements opens Broadcasts.
type MessagesTab = "inbox" | "broadcasts" | "sent";
const OLD_TAB: Record<string, MessagesTab> = { inbox: "inbox", questions: "inbox", discussions: "inbox", broadcasts: "broadcasts", announcements: "broadcasts", sent: "sent" };

export function CounselorConnect() {
  // Opens on the Inbox (standing rule: what needs attention comes first).
  // `?compose=1` (Career + College Insights' pathway invites, Assist's
  // "Message all", Engagement's inactive drill, a profile's Message,
  // Milestones' "Message this group") opens straight into a private message
  // addressed to that pathway (`&pathway=`) or those students (`&ids=`), on
  // Broadcasts, where everything sent to more than one student starts.
  const params = useSearchParams();
  const composeParam = params.get("compose") === "1";
  const initialPathway = params.get("pathway");
  const initialIds = (params.get("ids") ?? "").split(",").filter(Boolean);
  const questionParam = params.get("question");
  const studentParam = params.get("studentId");
  const draftParam = params.get("draft");
  const tabParam = OLD_TAB[params.get("tab") ?? ""];
  const [tab, setTab] = useState<MessagesTab>(composeParam ? "broadcasts" : (questionParam || studentParam) ? "inbox" : tabParam ?? "inbox");
  const live = useConnectLive();
  const announcements = live.announcements;
  // `n` remounts the composer when a drill asks to message a new set
  const [compose, setCompose] = useState<{ kind: "announcement" | "private"; ids: string[]; n: number } | null>(composeParam ? { kind: "private", ids: initialIds, n: 0 } : null);
  const [openAnnouncement, setOpenAnnouncement] = useState<string | null>(null);
  const [drill, setDrill] = useState<Drill | null>(null);
  const current = announcements.find((a) => a.id === openAnnouncement) ?? announcements[0];
  const message = (ids: string[]) => { setDrill(null); setTab("broadcasts"); setCompose({ kind: "private", ids, n: Date.now() }); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const openAnn = (id: string) => { setTab("broadcasts"); setCompose(null); setOpenAnnouncement(id); };
  return (
    <div className="v4-page v4-connect flex flex-col gap-[var(--space-5)]">
      <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
        {/* the page view switch (level 3): the pill, so it never reads as a
           second row of the shell's underline page nav (9 Oct 2026) */}
        <SubTabs
          ariaLabel="Messages"
          value={tab}
          onChange={setTab}
          options={[
            { key: "inbox", label: "Inbox" },
            { key: "broadcasts", label: "Broadcasts" },
            { key: "sent", label: "Sent" },
          ]}
        />
        {tab === "broadcasts" && !compose && (
          <button type="button" onClick={() => setCompose({ kind: "announcement", ids: [], n: Date.now() })} className="dm-solid bg-[var(--primary)] text-[var(--primary-foreground)] flex h-9 cursor-pointer items-center gap-[6px] rounded-[var(--radius-sm)] px-[14px] text-[13px] font-bold">
            <Plus className="h-[14px] w-[14px]" aria-hidden /> New broadcast
          </button>
        )}
      </div>

      {tab === "inbox" && <InboxPanel initialQuestion={questionParam} initialStudent={studentParam} initialDraft={draftParam} />}
      {tab === "broadcasts" && (
        <div className="flex flex-col gap-[var(--space-4)]">
          {compose && <MessageComposer key={compose.n} initialKind={compose.kind} initialPathway={compose.n === 0 ? initialPathway : null} initialIds={compose.ids} onCancel={() => setCompose(null)} onSendAnnouncement={(a) => { addAnnouncement(a); setCompose(null); setOpenAnnouncement(a.id); }} />}
          {!compose && <div className="v4-broadcast-workspace"><ul className="v4-broadcast-list dm-scroll">{announcements.map(a=><AnnouncementCard key={a.id} a={a} open={current?.id===a.id} onToggle={()=>setOpenAnnouncement(a.id)}/>)}</ul>{current && <AnnouncementReading a={current} onDrill={setDrill} onMessage={message}/>}</div>}
        </div>
      )}
      {tab === "sent" && <SentPanel announcements={announcements} onOpenAnnouncement={openAnn} onMessage={message} />}
      <DrillPanel drill={drill} onClose={() => setDrill(null)} />
    </div>
  );
}
