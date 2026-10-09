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
// Connect. Two tabs (her second pass, same day: "Keep only two tabs: Inbox
// and Sent. Rename the existing 'Broadcasts' tab to 'Sent,' retaining its
// current layout and content. Remove the existing separate 'Sent' tab."):
// Inbox (student questions and conversations in one list) and Sent (the
// announcements workspace and the composer, as Broadcasts was, with the old
// Sent log's messages, reminders, to-dos and Explore shares reachable from
// one dropdown at its top left instead of a third tab). The Groups boards
// are removed for now (moderation and safety); see CounselorConnect below.

// 10 Oct 2026, Messages as a session, not a chore (Chandu: "Meetings and
// messages and their subtabs ... need super engaging and exciting like we
// did for awaiting me just now"). The model is Prepare > Review > Awaiting
// me (ReviewSession.tsx). WHY each piece:
// - Inbox is an inbox-zero run. The session bar beside the tabs ("4 of 10
//   answered") sparks forward on every reply or resolve, so the work shows.
// - The thread is a chat: the student's question is a bubble from their
//   face, your reply is your bubble. A person, not a form row.
// - Dreamy reads first and drafts: two short chips over the reply box.
//   Hovering one previews the full sentence in the box; a tap fills it.
// - Send whooshes your bubble up with a burst and a "Sent" tick. Mark
//   resolved lands a stamp. Then nothing moves until you say so (Chandu,
//   same day: "when i send a message there should be a moment to edit or
//   delete etc, right now it goes away IMMEDIATELY. Dont make them
//   disappear unless i click done or something"): the bubble keeps Edit
//   and Delete, the stamp keeps Undo, and the run bar counts it at once,
//   but the thread only leaves on "Next question" (or "Done" on the last).
// - The finish line: after the last Next, Dreamy celebrates "All 10
//   answered" with a fanfare and the faces you cleared.
// - Keys (in the buttons' tooltips): Ctrl+Enter sends, E resolves, N or
//   Enter is Next, J / K move through the list.
// - Phone and tablet behave like a messaging app: the list, then the thread
//   with a back control (no sheet over the list).
// - Sent is the same list-and-reader shape: each announcement row carries
//   its read ring, and the reader offers one next move (nudge the students
//   who have not read it), so what went out shows how it landed.
// Every earlier tool and data point is still here (grade, topic, milestone
// and status moved from the row's second line into the open thread's
// header). Sounds follow the app's mute setting; motion stops under reduced
// motion (messages.css).

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus, Send, Check, Bell, Briefcase, ClipboardList, Landmark, MessageSquare, ChevronLeft, RotateCcw, Sparkles, CheckCheck, ArrowRight } from "lucide-react";
import { IconTip } from "@/components/app/IconTip";
import { SparkBar } from "@/components/flow/SparkBar";
import { LocalBurst } from "@/components/build/ui";
import { playCorrect, playFanfare, playSweep } from "@/components/play/sound";
import { cv } from "@/lib/counselorBase";
import { Dreamy } from "./InsightCharts";
import { Listbox } from "./Listbox";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { Go } from "./chips";
import { Segmented } from "./viz";
import { SubTabs } from "./SubTabs";
import { Avatar, SelectBox, STATUS_COLORS, STATUS_FILLS, StatusChip, StudentLink } from "./chips";
import { BatchComposer } from "./Batch";
import { DrillPanel, type Drill, type DrillStudent } from "./Drill";
import { CAREER_TRACKS, getRoster, type CounselorStudent } from "@/lib/counselorRoster";
import { GLASS_CARD as TINTED_CARD, GLASS_INSET } from "../surfaces";
import { BLUE_3 } from "./palette";
import { addAnnouncement, setQuestionState, useAddedAnnouncements, useQuestionStates } from "@/lib/counselorConnect";
import { useSends } from "@/lib/counselorCasefile";
import { draftFor, replyTo, sendToStudent, undoLastMessage, undoReply, useMessages } from "@/lib/counselorMessages";
import { remindFafsa } from "@/lib/counselorFafsa";
import "./prepare.css";
import "./messages.css";
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
// 10 Oct 2026: one flat row per announcement (title and date, then the
// audience), its read rate as a small ring at the left, the way a chat list
// leads with a face.
function ReadRing({ pct, size = 34 }: { pct: number; size?: number }) {
  return (
    <span className="msg-ring" style={{ width: size, height: size }}>
      <svg viewBox="0 0 36 36" aria-hidden="true"><circle cx="18" cy="18" r="15" fill="none" stroke="var(--glass-border)" strokeWidth="3" /><circle className="msg-ring-arc" cx="18" cy="18" r="15" pathLength="100" fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" strokeDasharray={`${pct} 100`} transform="rotate(-90 18 18)" /></svg>
      <b>{pct}<small>%</small></b>
    </span>
  );
}

function AnnouncementCard({ a, open, onToggle }: { a: Announcement; open: boolean; onToggle: () => void }) {
  const [to, sent] = a.to.split(" · Sent: ");
  return (
    <li data-key={a.id}>
      <button type="button" className="msg-row dm-quiet" aria-pressed={open} onClick={onToggle}>
        <ReadRing pct={a.read} />
        <span className="sr-only">read by {a.read}%.</span>
        <span className="msg-row-copy">
          <span className="msg-row-top"><strong>{a.title}</strong><time>{fmtDate(sent)}</time></span>
          <span className="msg-row-line">{to}</span>
        </span>
      </button>
    </li>
  );
}

// Recipients and the two requirement tags open who has read or acknowledged
// it, unread first, with one action: message the ones who have not (8 Oct
// 2026 audit: "Recipients" only jumped to the whole grade on Students).
// 10 Oct 2026: that action also sits in the footer as "Nudge the 4", the
// one next move, and an announcement everyone read says so with a check.
function AnnouncementReading({ a, onDrill, onMessage, onBack, burst }: { a: Announcement; onDrill: (d: Drill) => void; onMessage: (ids: string[]) => void; onBack: () => void; burst: number }) {
  const roster = useReviewedRoster();
  const [to, sent] = a.to.split(" · Sent: ");
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
  return (
    <article className="msg-read dm-scroll" key={a.id}>
      <header className="msg-read-head">
        <button type="button" onClick={onBack} className="msg-back dm-quiet"><ChevronLeft className="h-4 w-4" aria-hidden />Announcements</button>
        <span className="msg-read-to">To {to} · {fmtDate(sent)}</span>
      </header>
      <h2 className="msg-read-title">{a.title}</h2>
      <div className="msg-read-prose">{a.body}</div>
      {related.length > 0 && <p className="msg-read-related">{related.join(" · ")}</p>}
      {(needsReceipt || needsAck) && <div className="flex flex-wrap gap-[8px]">
        {needsReceipt && <button type="button" onClick={() => onDrill(readDrill())} className="msg-tag dm-quiet">Read receipt required<Go /></button>}
        {needsAck && <button type="button" onClick={() => onDrill(ackDrill())} className="msg-tag dm-quiet">Acknowledged <span style={{ color: "var(--muted-foreground)" }}>{r.acknowledged.length} of {r.recipients.length}</span><Go /></button>}
      </div>}
      <footer className="msg-read-foot">
        <ReadRing pct={a.read} size={52} />
        <span className="msg-read-stat"><strong>Read by students</strong><small>{r.read.length ? `${r.read.length} of ${r.recipients.length} students` : `Not read yet · ${r.recipients.length} students`}</small></span>
        {r.read.length > 0 && (r.unread.length > 0
          ? <button type="button" className="msg-nudge dm-quiet" onClick={() => onMessage(r.unread.map((s) => s.id))}><Send className="h-[14px] w-[14px]" aria-hidden />Nudge the {r.unread.length}</button>
          : <span className="msg-allread"><CheckCheck className="h-4 w-4" aria-hidden />Everyone read it</span>)}
        <button type="button" className="v4-text-action" onClick={() => onDrill(readDrill())}>Recipients <Go /></button>
      </footer>
      <LocalBurst nonce={burst} />
    </article>
  );
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
  const [burst, setBurst] = useState(0);
  const byAudience = roster.filter((s) => (gGrade === "All" || String(s.grade) === gGrade) && (gStatus === "All" || s.status === gStatus) && (gPathway === "All" || s.careerTrack === gPathway));
  const audience = gMode === "pick" ? students.filter((s) => picked.has(s.id)) : byAudience;
  const audienceLabel = gMode === "pick" ? `${picked.size} picked` : [gGrade === "All" ? "All grades" : `Grade ${gGrade}`, gStatus === "All" ? null : gStatus, gPathway === "All" ? null : gPathway].filter(Boolean).join(" · ");
  const labelCls = "text-[11px] font-bold tracking-[0.04em] uppercase";
  return (
    <div className="relative flex flex-col gap-[var(--space-3)]">
      <LocalBurst nonce={burst} />
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
      {sent && <p key={burst} className="msg-sent-note"><Check className="h-[14px] w-[14px]" aria-hidden />{sent}</p>}
      {audience.length === 0 ? (
        <p className="text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{gMode === "pick" ? "Pick at least one student above." : "No students match that audience. Widen a filter."}</p>
      ) : (
        <BatchComposer students={audience} audience={audienceLabel} onDone={(summary) => { setSent(summary); setBurst((n) => n + 1); playCorrect(); if (gMode === "pick") setPicked(new Set()); }} />
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
// 10 Oct 2026: the list and the open thread as a messaging app (see the
// note at the top of this file).

type Question = (typeof QUESTIONS)[number];
type InboxRow =
  | { kind: "question"; key: string; q: Question; name: string; grade: number; date: string; studentId?: string; avatarIndex?: number }
  | { kind: "thread"; key: string; name: string; grade: number; date: string; studentId: string; avatarIndex?: number; messages: { text: string; at: string }[] };
type QuestionRow = Extract<InboxRow, { kind: "question" }>;
type ThreadRow = Extract<InboxRow, { kind: "thread" }>;
type InboxGroup = "reply" | "answered" | "threads";
const OWES: QuestionStatus[] = ["new", "follow-up", "viewed", "in-progress"];
const threadKey = (id: string) => `t-${id}`;

/** The inbox run, kept by the page so it survives a trip to Sent and back:
 *  how many were answered, and when the run began and ended. */
export type InboxSession = { cleared: number; startedAt: number; finishedAt: number | null; /** the questions cleared, for inbox zero's faces */ keys: string[] };

/** Dreamy in his glasses, the pose for every Dreamy on Messages (10 Oct
 *  2026, Chandu: "the glasses dreamy everywhere"). The shared art; the
 *  float and hop are this page's (messages.css). */
function DreamyGlasses({ size }: { size: number }) {
  return <Dreamy mood="glasses" size={size} className="msg-dreamy-img" />;
}

type Draft = { label: string; text: string };
// DEMO-ONLY: Dreamy's draft replies to each question still waiting, until
// drafts come from the model. Student facing, so 8th-grade wording: short
// words, one idea per sentence.
const QUESTION_DRAFTS: Record<string, Draft[]> = {
  q1: [{ label: "Explore both", text: "Yes, you can explore both, Olivia. Try one small project in each this month. Then tell me which one you liked more." }, { label: "Talk it through", text: "Great question, Olivia. Let's look at both pathways together this week." }],
  q2: [{ label: "Apply regular", text: "It is not too late, Charlotte. Apply regular decision. Let's check that deadline together this week." }, { label: "Book a time", text: "Let's meet this week, Charlotte. We will look at your list and plan your next steps." }],
  q3: [{ label: "AP Economics", text: "For business, AP Economics is the better fit, Jackson. Take AP Psychology too if your schedule has room." }, { label: "Talk at check-in", text: "Good question, Jackson. Let's look at your schedule together at your next check-in." }],
  q4: [{ label: "Aim for 8 to 10", text: "Fifteen is a lot, Isabella. Most students apply to 8 to 10. Let's sort yours into reach, match and safe schools." }, { label: "Review the list", text: "Let's go over your list together this week, Isabella. Bring your top picks." }],
  q7: [{ label: "Art and media", text: "Great goal, Lucas. Take Art 1 and Digital Media next year. Yearbook is a good pick too." }, { label: "Talk at check-in", text: "Good question, Lucas. Let's pick your electives together at your next check-in." }],
  q8: [{ label: "Yes, include it", text: "Yes, include it, Marcus. A job shows you are reliable and good with people. That matters in healthcare." }, { label: "Send me your resume", text: "Send me your resume, Marcus. I will help you describe that job." }],
  q9: [{ label: "Send a reminder", text: "Send your teacher a short, kind reminder today, Emma. If you hear nothing in two days, tell me and I will follow up." }, { label: "I'll follow up", text: "Thanks for telling me, Emma. I will check in with your teacher today." }],
  q11: [{ label: "Try Explore", text: "Great interest, Joseph. Look up Game Designer in Explore. Then try a free coding or art class this summer." }, { label: "Talk at check-in", text: "Let's look at game design careers together at your next check-in, Joseph." }],
  q13: [{ label: "Not required", text: "Physics is not required for nursing, Daniel. Biology and Chemistry matter most. Physics can still help." }, { label: "Talk at check-in", text: "Good question, Daniel. Let's plan your science classes at your next check-in." }],
  q14: [{ label: "Much the same", text: "Yes, it is a lot like a school essay, Diego. Tell your story and why you want this trade. I can read a draft." }, { label: "Send me a draft", text: "Write a first draft, Diego, and send it to me. I will give you notes." }],
};

function draftsFor(row: InboxRow): Draft[] {
  const first = row.name.split(" ")[0];
  if (row.kind === "question") return QUESTION_DRAFTS[row.q.id] ?? [{ label: "Talk at check-in", text: `Good question, ${first}. Let's talk it through at your next check-in.` }, { label: "Book a time", text: `Let's find a time to meet this week, ${first}.` }];
  return [{ label: "Checking in", text: `Hi ${first}, just checking in. How is everything going?` }, { label: "Book a time", text: `Hi ${first}, let's find a time to meet this week. Pick a time that works for you.` }];
}

// A reply or a resolve the counselor has made but not yet moved on from
// (10 Oct 2026, Chandu: "when i send a message there should be a moment to
// edit or delete etc, right now it goes away IMMEDIATELY. Dont make them
// disappear unless i click done or something."). The store and the run bar
// update at once; the thread, its row and the stamp stay until Next.
type Settled = { key: string; kind: "replied" | "resolved"; prev: QuestionStatus; owed: boolean } | null;
const reducedMotion = () => typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** The run's progress: answered so far, of all that needed a reply. */
function InboxBar({ cleared, remaining }: { cleared: number; remaining: number }) {
  const total = cleared + remaining;
  const pct = total ? Math.round((cleared / total) * 100) : 100;
  return (
    <div className="msg-bar" role="status" aria-live="polite">
      <span className="msg-bar-copy"><b>{cleared} of {total}</b> answered</span>
      <SparkBar percent={pct} min={2} height={6} fill="linear-gradient(90deg, color-mix(in srgb, var(--primary) 70%, #7fd1ff), var(--primary))" glow="var(--primary)" memoryKey="v4-inbox-session" />
    </div>
  );
}

/** Inbox zero: Dreamy celebrates the run, with the time it took. */
function InboxZero({ session, faces }: { session: InboxSession; faces: QuestionRow[] }) {
  const n = session.cleared;
  const minutes = Math.max(1, Math.round(((session.finishedAt ?? session.startedAt) - session.startedAt) / 60000));
  return (
    <div className="msg-zero">
      <LocalBurst nonce={n > 0 ? 1 : 0} />
      <span className="msg-zero-dreamy"><DreamyGlasses size={120} /></span>
      <p className="msg-zero-title">{n > 0 ? `All ${n} answered` : "All caught up"}</p>
      <p className="msg-zero-sub">{n > 0 ? `Done in ${minutes} ${minutes === 1 ? "minute" : "minutes"}. New messages land here first.` : "New messages from students land here first."}</p>
      {faces.length > 0 && (
        <ul className="msg-zero-faces" aria-label="Students you cleared">
          {faces.map((f, i) => (
            <li key={f.key} style={{ animationDelay: `${0.35 + i * 0.06}s` }}>
              <BubbleFace id={f.studentId} name={f.name} index={f.avatarIndex} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function InboxPanel({ initialQuestion, initialStudent, initialDraft, session, setSession }: { initialQuestion: string | null; initialStudent: string | null; initialDraft: string | null; session: InboxSession; setSession: React.Dispatch<React.SetStateAction<InboxSession>> }) {
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
  // the question just replied to or resolved, held on screen until Next
  const [settled, setSettled] = useState<Settled>(null);
  const [editing, setEditing] = useState<string | null>(null);

  const questionRows = useMemo<QuestionRow[]>(() => QUESTIONS.map((q) => { const st = byName.get(q.name); return { kind: "question" as const, key: q.id, q, name: q.name, grade: q.grade, date: q.date, studentId: st?.id, avatarIndex: st?.avatarIndex }; }), [byName]);
  const threadRows = useMemo<ThreadRow[]>(() => {
    const byId = new Map(roster.map((s) => [s.id, s]));
    const rows: ThreadRow[] = threads.map((t) => ({ kind: "thread" as const, key: threadKey(t.studentId), name: t.name, grade: byId.get(t.studentId)?.grade ?? 0, date: t.messages[t.messages.length - 1]?.at ?? "", studentId: t.studentId, avatarIndex: byId.get(t.studentId)?.avatarIndex, messages: t.messages }));
    if (pending && !threads.some((t) => t.studentId === pending.id)) rows.unshift({ kind: "thread", key: threadKey(pending.id), name: pending.name, grade: pending.grade, date: "", studentId: pending.id, avatarIndex: pending.avatarIndex, messages: [] });
    return rows.sort((a, b) => (a.messages.length ? 0 : -1) - (b.messages.length ? 0 : -1) || b.date.localeCompare(a.date));
  }, [threads, roster, pending]);
  const inGroup = (g: InboxGroup): InboxRow[] => g === "threads" ? threadRows : questionRows.filter((r) => g === "reply" ? OWES.includes(statusOf(r.q.id)) : !OWES.includes(statusOf(r.q.id)));

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
  // a settled question keeps its place in Needs Reply until Next
  const rankOf = (r: QuestionRow) => STATUS_STYLE[settled?.key === r.key ? settled.prev : statusOf(r.q.id)].rank;
  const rows = group === "reply"
    ? [...inGroup("reply"), ...questionRows.filter((r) => r.key === settled?.key && !OWES.includes(statusOf(r.q.id)))].sort((a, b) => a.kind === "question" && b.kind === "question" ? rankOf(a) - rankOf(b) || b.date.localeCompare(a.date) || QUESTIONS.indexOf(a.q) - QUESTIONS.indexOf(b.q) : 0)
    : group === "answered" ? inGroup("answered").sort((a, b) => b.date.localeCompare(a.date)) : inGroup("threads");
  const [selectedKey, setSelectedKey] = useState(() => start?.key ?? rows[0]?.key ?? QUESTIONS[0].id);
  // below 1024px: the list, or one thread (a messaging app's two screens)
  const [open, setOpen] = useState(!!start);
  // each thread keeps its own unsent words, so moving through the list never
  // carries one student's reply into another's box
  const [texts, setTexts] = useState<Record<string, string>>(() => (start && linkedStudent && initialDraft ? { [start.key]: draftFor(initialDraft, linkedStudent.name.split(" ")[0]) } : {}));
  const [draftKey, setDraftKey] = useState<string | null>(initialDraft);
  const [burst, setBurst] = useState(0);
  // the conversation message just sent, for its Edit and Delete
  const [justSent, setJustSent] = useState<string | null>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);

  const selected = [...questionRows, ...threadRows].find((r) => r.key === selectedKey) ?? rows[0];
  const response = selected ? texts[selected.key] ?? "" : "";
  const setResponse = (v: string) => { if (!selected) return; const k = selected.key; setTexts((t) => ({ ...t, [k]: v })); };
  const counts: Record<InboxGroup, number> = { reply: inGroup("reply").length, answered: inGroup("answered").length, threads: threadRows.filter((r) => r.messages.length).length };
  const GROUPS: { value: InboxGroup; label: string }[] = [
    { value: "reply", label: `Needs Reply · ${counts.reply}` },
    { value: "answered", label: `Answered · ${counts.answered}` },
    { value: "threads", label: `Conversations · ${counts.threads}` },
  ];
  const zero = group === "reply" && rows.length === 0;
  // inbox zero's faces: each student cleared this run, once
  const zeroFaces = session.keys.map((k) => questionRows.find((r) => r.key === k)).filter((r, i, all): r is QuestionRow => !!r && all.findIndex((x) => x?.name === r.name) === i);
  const hereSettled = settled && selected?.key === settled.key ? settled : null;
  const nextKey = (() => {
    if (!hereSettled || group !== "reply") return undefined;
    const i = rows.findIndex((r) => r.key === hereSettled.key);
    return (rows[i + 1] ?? rows[i - 1])?.key;
  })();

  // moving away from a settled question lets it go
  const release = () => { setSettled(null); setEditing(null); };
  const pick = (key: string) => { if (key !== selectedKey) { setDraftKey(null); release(); setJustSent(null); } setSelectedKey(key); setOpen(true); };
  // a phone opening a thread lands on its top, focus on the way back
  useEffect(() => {
    if (!open || window.innerWidth >= 1024) return;
    const shell = shellRef.current;
    if (shell && shell.getBoundingClientRect().top < 0) shell.scrollIntoView({ block: "start" });
    backRef.current?.focus({ preventScroll: true });
  }, [open]);
  const back = () => {
    const k = selected?.key;
    setOpen(false);
    if (k) requestAnimationFrame(() => shellRef.current?.querySelector<HTMLElement>(`[data-key="${CSS.escape(k)}"] button`)?.focus());
  };

  const count = (key: string, owed: boolean) => { if (owed) setSession((s) => (s.keys.includes(key) ? s : { ...s, cleared: s.cleared + 1, keys: [...s.keys, key] })); };
  const uncount = (key: string) => setSession((s) => (s.keys.includes(key) ? { ...s, cleared: Math.max(0, s.cleared - 1), keys: s.keys.filter((x) => x !== key), finishedAt: null } : s));

  // Send: the reply is saved and counted at once, and your bubble rises with
  // a burst; the thread stays, with Edit and Delete, until Next.
  const reply = (row: QuestionRow) => {
    const text = response.trim();
    if (!text) return;
    const wasEditing = editing === row.key;
    const prev = settled?.key === row.key ? settled.prev : statusOf(row.q.id);
    const owed = settled?.key === row.key ? settled.owed : OWES.includes(prev);
    setQuestionState(row.q.id, "responded", text);
    replyTo(row.q.id, text);
    if (!wasEditing) logTime({ activity: "Answered a question", minutes: 5, kind: "indirect", studentId: row.studentId });
    setTexts((t) => ({ ...t, [row.key]: "" }));
    setSettled({ key: row.key, kind: "replied", prev, owed });
    setEditing(null);
    count(row.key, owed);
    setBurst((n) => n + 1);
    playSweep();
  };
  // Mark resolved: the stamp lands and stays, with Undo, until Next.
  const resolve = (row: QuestionRow) => {
    const prev = statusOf(row.q.id);
    const owed = OWES.includes(prev);
    setQuestionState(row.q.id, "resolved");
    setSettled({ key: row.key, kind: "resolved", prev, owed });
    count(row.key, owed);
    playCorrect();
  };
  // Edit: the sent words go back in the box; sending again updates the reply.
  const edit = (row: QuestionRow) => {
    const text = live.replyOf(row.q.id) ?? "";
    setTexts((t) => ({ ...t, [row.key]: text }));
    setEditing(row.key);
  };
  // Delete (or Undo a resolve): the question goes back to needing a reply.
  const unsettle = (row: QuestionRow) => {
    if (!settled || settled.key !== row.key) return;
    setQuestionState(row.q.id, settled.prev, "");
    if (settled.kind === "replied") undoReply(row.q.id);
    uncount(row.key);
    release();
  };
  // Next: only now does the thread leave and the next one slide in; after
  // the last one, inbox zero.
  const next = () => {
    if (!hereSettled) return;
    const k = nextKey;
    release();
    if (k) { setSelectedKey(k); return; }
    if (group === "reply") {
      setSession((s) => ({ ...s, finishedAt: Date.now() }));
      if (session.cleared > 0) playFanfare();
      setOpen(false);
    }
  };

  const sendThread = (row: ThreadRow) => {
    const text = response.trim();
    if (!text) return;
    sendToStudent(row.studentId, row.name, text);
    if (draftKey === "fafsa") remindFafsa([row.studentId]);
    logTime({ activity: "Messaged a student", minutes: 3, kind: "indirect", studentId: row.studentId });
    setTexts((t) => ({ ...t, [row.key]: "" }));
    setDraftKey(null);
    setPending(null);
    setBurst((n) => n + 1);
    playSweep();
    setJustSent(row.key);
  };
  // a conversation's last message: Edit takes it back into the box, Delete
  // takes it back
  const takeBack = (row: ThreadRow, toBox: boolean) => {
    const lastMsg = row.messages[row.messages.length - 1];
    undoLastMessage(row.studentId);
    const st = roster.find((s) => s.id === row.studentId);
    if (st) setPending(st);
    if (toBox && lastMsg) setTexts((t) => ({ ...t, [row.key]: lastMsg.text }));
    setJustSent(null);
  };

  // keys: J / K through the list, E resolves, N (or Enter) is Next once a
  // question is settled (never while typing; Ctrl+Enter sends from the box)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (e.metaKey || e.ctrlKey || e.altKey || (t && (t.tagName === "TEXTAREA" || t.tagName === "INPUT" || t.tagName === "SELECT" || t.isContentEditable))) return;
      if (document.querySelector('[aria-modal="true"]')) return;
      const k = e.key.toLowerCase();
      const i = rows.findIndex((r) => r.key === selected?.key);
      if ((k === "j" || k === "k") && rows.length) {
        const n = rows[k === "j" ? Math.min(rows.length - 1, i + 1) : Math.max(0, i - 1)];
        if (n) { e.preventDefault(); pick(n.key); }
      } else if (hereSettled && !editing && (k === "n" || (k === "enter" && t?.tagName !== "BUTTON" && t?.tagName !== "A"))) {
        e.preventDefault();
        next();
      } else if (k === "e" && !hereSettled && selected?.kind === "question" && OWES.includes(statusOf(selected.q.id))) {
        e.preventDefault();
        resolve(selected);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div ref={shellRef} className={`msg-shell ${zero ? "is-zero" : ""}`} data-open={open ? "true" : undefined}>
      <div className="msg-list-col">
        <div className="msg-list-head">
          <Listbox
            ariaLabel="Show messages"
            value={group}
            onChange={(k) => { const g = k as InboxGroup; release(); setGroup(g); const nx = inGroup(g)[0]; if (nx) setSelectedKey(nx.key); }}
            options={GROUPS}
            className={LIST_FIELD}
            style={FIELD_STYLE}
          />
          {!zero && <IconTip label="J and K move through the list"><span className="msg-keys">J / K</span></IconTip>}
        </div>
        <ul className="msg-list dm-scroll">
          {rows.length === 0 && !zero && <li className="msg-empty">{group === "threads" ? "No conversations yet. Message a student from their page." : "Nothing here right now."}</li>}
          {rows.map((r) => {
            const on = selected?.key === r.key;
            const done = settled?.key === r.key;
            const st = r.kind === "question" ? statusOf(r.q.id) : null;
            const unread = !done && (st === "new" || st === "follow-up");
            const waiting = !done && !!st && OWES.includes(st);
            const line = r.kind === "question" ? r.q.question : r.messages[r.messages.length - 1]?.text ?? "Write your first message";
            const topic = r.kind === "question" ? r.q.tag : r.messages.length ? `${r.messages.length} sent` : "New conversation";
            return (
              <li key={r.key} data-key={r.key}>
                <button type="button" onClick={() => pick(r.key)} aria-current={on ? "true" : undefined} className="msg-row dm-quiet">
                  <Avatar name={r.name} index={r.avatarIndex} size={38} />
                  <span className="msg-row-copy">
                    <span className="msg-row-top">
                      <strong>{r.name}</strong>
                      {unread && st && <span role="img" aria-label="Needs a reply" className="msg-dot" style={{ background: STATUS_STYLE[st].fill }} />}
                      {done && <CheckCheck className="msg-row-done" aria-label={settled?.kind === "resolved" ? "Resolved" : "Replied"} />}
                      {r.grade > 0 && <span className="msg-row-grade">Grade {r.grade}</span>}
                      <time>{r.date ? shortDay(r.date) : ""}</time>
                    </span>
                    <span className="msg-row-line"><b>{topic}</b> · <span className={waiting ? "is-waiting" : undefined}>{line}</span></span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      <section className="msg-thread-col" aria-label="Conversation">
        {zero
          ? <InboxZero session={session} faces={zeroFaces} />
          : selected && (selected.kind === "question"
            ? <QuestionThread key={selected.key} row={selected} status={statusOf(selected.q.id)} reply={live.replyOf(selected.q.id)} response={response} setResponse={setResponse}
                settled={hereSettled} editing={editing === selected.key} burst={burst} backRef={backRef} onBack={back}
                onReply={() => reply(selected)} onResolve={() => resolve(selected)} onEdit={() => edit(selected)} onCancelEdit={() => setEditing(null)}
                onUnsettle={() => unsettle(selected)} onNext={next} nextLabel={nextKey ? "Next question" : "Done"} />
            : <ConversationThread key={selected.key} row={selected} response={response} setResponse={setResponse} backRef={backRef} onBack={back}
                justSent={justSent === selected.key} onSend={() => sendThread(selected)} onEdit={() => takeBack(selected, true)} onDelete={() => takeBack(selected, false)} />)}
        {/* outside the keyed thread, so the next thread sliding in never replays it */}
        <LocalBurst nonce={burst} />
      </section>
    </div>
  );
}

/** The student's face beside their bubble, opening their page. */
function BubbleFace({ id, name, index }: { id?: string; name: string; index?: number }) {
  const face = <Avatar name={name} index={index} size={34} />;
  if (!id) return <span className="msg-face">{face}</span>;
  return <IconTip label={`Open ${name}`}><Link href={`${cv("students")}&studentId=${encodeURIComponent(id)}`} className="msg-face" aria-label={`Open ${name}`}>{face}</Link></IconTip>;
}

/** The reply frame: Dreamy across its top edge with his drafts as chips
 *  (hover or focus one to preview it in the box, tap to fill it), the box,
 *  then the actions. */
function ReplyBox({ row, value, onChange, onSend, hop = false, drafts = true, children }: { row: InboxRow; value: string; onChange: (v: string) => void; onSend: () => void; /** Dreamy hops when the reply goes */ hop?: boolean; drafts?: boolean; children: React.ReactNode }) {
  const [preview, setPreview] = useState<string | null>(null);
  // Dreamy "types" his drafts for a beat as each thread opens (he read it
  // first), then they pop in
  const [typing, setTyping] = useState(true);
  useEffect(() => { const t = window.setTimeout(() => setTyping(false), reducedMotion() ? 0 : 700); return () => window.clearTimeout(t); }, []);
  const boxRef = useRef<HTMLTextAreaElement>(null);
  const first = row.name.split(" ")[0];
  const label = row.kind === "question" ? "My reply" : "Message";
  return (
    <div className="msg-composer">
      <span className={`msg-dreamy ${hop ? "is-hop" : ""}`} aria-hidden><DreamyGlasses size={84} /></span>
      <div className="msg-drafts" role="group" aria-label="Dreamy's drafts" aria-busy={drafts && typing}>
        {drafts && typing && <span className="msg-typing" aria-label="Dreamy is drafting"><i /><i /><i /></span>}
        {drafts && !typing && draftsFor(row).map((d) => (
          <button key={d.label} type="button" aria-pressed={value === d.text} className="msg-draft dm-quiet"
            onMouseEnter={() => setPreview(d.text)} onMouseLeave={() => setPreview(null)} onFocus={() => setPreview(d.text)} onBlur={() => setPreview(null)}
            onClick={() => { onChange(d.text); setPreview(null); boxRef.current?.focus(); }}>
            <Sparkles className="h-[13px] w-[13px]" aria-hidden />{d.label}
          </button>
        ))}
        {!drafts && <span className="msg-drafts-note">Editing your reply</span>}
      </div>
      <textarea ref={boxRef} value={value} onChange={(e) => onChange(e.target.value)} aria-label={label} rows={3}
        onKeyDown={(e) => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); onSend(); } }}
        placeholder={preview ?? (row.kind === "question" ? `Reply to ${first}` : `Write to ${first}`)}
        className={`msg-box ${preview && !value ? "is-preview" : ""}`} />
      {children}
    </div>
  );
}

/** After a reply or a resolve: Dreamy cheering on the frame, what happened,
 *  Undo for a resolve, and Next (the only thing that moves on). */
function DoneBar({ settled, first, onUndo, onNext, nextLabel }: { settled: NonNullable<Settled>; first: string; onUndo: () => void; onNext: () => void; nextLabel: string }) {
  const nextRef = useRef<HTMLButtonElement>(null);
  // focus lands on Next, so Enter moves on
  useEffect(() => { nextRef.current?.focus({ preventScroll: true }); }, []);
  return (
    <div className="msg-composer is-done">
      <span className="msg-dreamy is-hop" aria-hidden><DreamyGlasses size={84} /></span>
      <div className="msg-done">
        <span className="msg-done-copy" role="status">
          <CheckCheck className="h-[18px] w-[18px]" aria-hidden />
          {settled.kind === "replied" ? `Sent to ${first}` : `Resolved for ${first}`}
          {settled.kind === "resolved" && <button type="button" onClick={onUndo} className="msg-undo-link dm-link"><RotateCcw className="h-[13px] w-[13px]" aria-hidden />Undo</button>}
        </span>
        <IconTip label={`${nextLabel} (N or Enter)`}>
          <button ref={nextRef} type="button" onClick={onNext} className="msg-next dm-solid bg-[var(--primary)] text-[var(--primary-foreground)]">{nextLabel}<ArrowRight className="h-[15px] w-[15px]" aria-hidden /></button>
        </IconTip>
      </div>
    </div>
  );
}

/** One question as a chat: who (name, grade, topic, milestone, status) in
 *  the header, the question as their bubble with its date, then the reply
 *  frame, or the reply already sent as yours. A reply or resolve made here
 *  stays on screen (Edit, Delete, Undo) until Next. */
function QuestionThread({ row, status, reply, response, setResponse, onReply, onResolve, settled, editing, burst, backRef, onBack, onEdit, onCancelEdit, onUnsettle, onNext, nextLabel }: { row: QuestionRow; status: QuestionStatus; reply?: string; response: string; setResponse: (v: string) => void; onReply: () => void; onResolve: () => void; settled: Settled; editing: boolean; burst: number; backRef: React.RefObject<HTMLButtonElement | null>; onBack: () => void; onEdit: () => void; onCancelEdit: () => void; onUnsettle: () => void; onNext: () => void; nextLabel: string }) {
  const q = row.q;
  const first = q.name.split(" ")[0];
  const answered = status === "responded" || status === "resolved";
  const mine = settled?.kind === "replied";
  return (
    <div className="msg-thread is-arriving">
      <ThreadHead backRef={backRef} onBack={onBack} id={row.studentId} name={q.name} index={row.avatarIndex} meta={`Grade ${q.grade} · ${q.tag}${q.milestone ? ` · ${q.milestone}` : ""}`}
        status={<span className="msg-status" style={{ color: STATUS_STYLE[status].color }}>{STATUS_STYLE[status].label}</span>} />
      <div className="msg-chat dm-scroll">
        <span className="msg-day">{fmtDate(q.date)}</span>
        <div className="msg-line is-them"><BubbleFace id={row.studentId} name={q.name} index={row.avatarIndex} /><p className="msg-bubble">{q.question}</p></div>
        {answered && !editing && (reply
          ? <div key={`${burst}-${reply}`} className={`msg-line is-me ${mine ? "is-new" : ""}`}>
              <span className="sr-only">My reply:</span>
              <p className="msg-bubble is-me">{reply}</p>
              {mine
                ? <span className="msg-time msg-bubble-tools"><span className="msg-tick"><CheckCheck className="h-[13px] w-[13px]" aria-hidden />Sent</span><button type="button" onClick={onEdit} className="dm-link">Edit</button><button type="button" onClick={onUnsettle} className="dm-link">Delete</button></span>
                : <span className="msg-time">You</span>}
            </div>
          : settled?.kind !== "resolved" && <p className="msg-system">Resolved without a reply.</p>)}
        {settled?.kind === "resolved" && <span className="msg-stamp" aria-hidden>Resolved</span>}
      </div>
      {editing ? (
        <ReplyBox row={row} value={response} onChange={setResponse} onSend={onReply} drafts={false}>
          <div className="msg-actions">
            <IconTip label="Save edit (Ctrl+Enter)">
              <button type="button" disabled={response.trim().length === 0} onClick={onReply} className="msg-send dm-solid bg-[var(--primary)] text-[var(--primary-foreground)]"><Send className="h-[15px] w-[15px]" aria-hidden />Save edit</button>
            </IconTip>
            <button type="button" onClick={onCancelEdit} className="msg-resolve dm-quiet">Cancel</button>
          </div>
        </ReplyBox>
      ) : settled ? (
        <DoneBar settled={settled} first={first} onUndo={onUnsettle} onNext={onNext} nextLabel={nextLabel} />
      ) : !answered && (
        <ReplyBox row={row} value={response} onChange={setResponse} onSend={onReply}>
          <div className="msg-actions">
            <IconTip label="Send reply (Ctrl+Enter)">
              <button type="button" disabled={response.trim().length === 0} onClick={onReply} className="msg-send dm-solid bg-[var(--primary)] text-[var(--primary-foreground)]"><Send className="h-[15px] w-[15px]" aria-hidden />Send reply</button>
            </IconTip>
            <IconTip label="Mark resolved (E)">
              <button type="button" onClick={onResolve} className="msg-resolve dm-quiet"><Check className="h-[15px] w-[15px]" aria-hidden />Mark resolved</button>
            </IconTip>
          </div>
        </ReplyBox>
      )}
    </div>
  );
}

/** A conversation the counselor started: what went out as your bubbles,
 *  newest at the foot, then the reply frame. The message just sent keeps
 *  Edit and Delete under it. */
function ConversationThread({ row, response, setResponse, onSend, justSent, backRef, onBack, onEdit, onDelete }: { row: ThreadRow; response: string; setResponse: (v: string) => void; onSend: () => void; justSent: boolean; backRef: React.RefObject<HTMLButtonElement | null>; onBack: () => void; onEdit: () => void; onDelete: () => void }) {
  const chatRef = useRef<HTMLDivElement>(null);
  useEffect(() => { const el = chatRef.current; if (el) el.scrollTop = el.scrollHeight; }, [row.messages.length]);
  return (
    <div className="msg-thread is-arriving">
      <ThreadHead backRef={backRef} onBack={onBack} id={row.studentId} name={row.name} index={row.avatarIndex} meta={`${row.grade ? `Grade ${row.grade} · ` : ""}Conversation`} />
      <div ref={chatRef} className="msg-chat dm-scroll">
        {row.messages.length === 0 && <p className="msg-system">Your first message starts the conversation.</p>}
        {row.messages.map((m, i) => {
          const fresh = justSent && i === row.messages.length - 1;
          return (
            <div key={m.at} className={`msg-line is-me ${fresh ? "is-new" : ""}`}>
              <p className="msg-bubble is-me">{m.text}</p>
              {fresh
                ? <span className="msg-time msg-bubble-tools"><span className="msg-tick"><CheckCheck className="h-[13px] w-[13px]" aria-hidden />Sent</span><button type="button" onClick={onEdit} className="dm-link">Edit</button><button type="button" onClick={onDelete} className="dm-link">Delete</button></span>
                : <span className="msg-time">You · {shortDay(m.at)}</span>}
            </div>
          );
        })}
      </div>
      <ReplyBox row={row} value={response} onChange={setResponse} onSend={onSend} hop={justSent}>
        <div className="msg-actions is-one">
          <IconTip label="Send (Ctrl+Enter)">
            <button type="button" disabled={response.trim().length === 0} onClick={onSend} className="msg-send dm-solid bg-[var(--primary)] text-[var(--primary-foreground)]"><Send className="h-[15px] w-[15px]" aria-hidden />Send</button>
          </IconTip>
        </div>
      </ReplyBox>
    </div>
  );
}

/** The open thread's header: back to the list (below 1024px), the student
 *  (face and name open their page; the ↗ says so), one muted line of
 *  facts, the status word at the right. */
function ThreadHead({ backRef, onBack, id, name, index, meta, status }: { backRef: React.RefObject<HTMLButtonElement | null>; onBack: () => void; id?: string; name: string; index?: number; meta: string; status?: React.ReactNode }) {
  return (
    <header className="msg-thread-head">
      <button ref={backRef} type="button" onClick={onBack} className="msg-back dm-quiet"><ChevronLeft className="h-4 w-4" aria-hidden />Inbox</button>
      <div className="msg-thread-who">
        <StudentLink id={id} name={name} index={index} size={42}><span className="msg-thread-meta">{meta}</span></StudentLink>
        {status}
      </div>
    </header>
  );
}

// ---- Sent ---------------------------------------------------------------------
// Sent is Broadcasts' layout and content (Maisha, 9 Oct 2026: "Rename the
// existing 'Broadcasts' tab to 'Sent,' retaining its current layout and
// content. Remove the existing separate 'Sent' tab."). The old Sent log's
// rows (messages, reminders, to-dos, Explore shares; 8 Oct 2026 audit:
// recorded and never shown) stay reachable from one dropdown at the top
// left of the tab, in the same spot in both layouts: Announcements shows
// the announcement list beside the open one; any other kind shows that
// kind's rows in one card.

type SentKind = "announcement" | "message" | "reminder" | "todo" | "share";
type SentRow = { id: string; at: string; kind: Exclude<SentKind, "announcement">; label: string; icon: typeof Bell; text: string; audience: string; studentIds: string[]; open?: () => void; openLabel?: string };
const SENT_KINDS: { value: SentKind; label: string }[] = [
  { value: "announcement", label: "Announcements" },
  { value: "message", label: "Messages" },
  { value: "reminder", label: "Reminders" },
  { value: "todo", label: "To-dos" },
  { value: "share", label: "Shared from Explore" },
];
const SEND_LABEL: Record<"message" | "reminder" | "todo", { label: string; icon: typeof Bell }> = { message: { label: "Message", icon: MessageSquare }, reminder: { label: "Reminder", icon: Bell }, todo: { label: "To-do", icon: ClipboardList } };
const shortDay = (iso: string) => new Date(iso.length === 10 ? `${iso}T12:00:00` : iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });

/** Everything but announcements that went out from the dashboard, newest
 *  first: messages, reminders and to-dos (counselorCasefile), one-to-one
 *  messages (counselorMessages) and Explore shares (counselorShares). */
function useSentRows(): SentRow[] {
  const sends = useSends();
  const shares = useShares();
  const threads = useMessages().threads;
  return useMemo<SentRow[]>(() => [
    ...sends.map((s) => ({ id: s.id, at: s.at, kind: s.kind, ...SEND_LABEL[s.kind], text: s.due ? `${s.text} Due ${shortDay(s.due)}.` : s.text, audience: s.audience, studentIds: s.studentIds })),
    // one-to-one messages from a student page or brief (v5's thread store)
    ...threads.flatMap((t) => t.messages.map((m, i) => ({ id: `${t.studentId}-${i}`, at: m.at, kind: "message" as const, ...SEND_LABEL.message, text: m.text, audience: t.name, studentIds: [t.studentId] }))),
    ...shares.map((sh) => {
      const career = sh.kind === "career" ? ALL_CATALOG_CAREERS.find((c) => c.title === sh.title) : undefined;
      const school = sh.kind === "school" ? COLLEGES.find((c) => c.slug === sh.ref) : undefined;
      return { id: sh.id, at: sh.at, kind: "share" as const, label: sh.kind === "career" ? "Career shared" : sh.kind === "school" ? "School shared" : "Shared", icon: sh.kind === "school" ? Landmark : Briefcase, text: sh.title, audience: `${sh.studentIds.length} student${sh.studentIds.length === 1 ? "" : "s"}`, studentIds: sh.studentIds, open: career ? () => openCareer(career) : school ? () => openSchool(school) : undefined, openLabel: `Open ${sh.title}` };
    }),
  ].sort((a, b) => b.at.localeCompare(a.at)), [sends, shares, threads]);
}

/** The one dropdown that picks what Sent shows, with each kind's count. */
function SentKindPicker({ kind, onKind, counts }: { kind: SentKind; onKind: (k: SentKind) => void; counts: Record<SentKind, number> }) {
  return <Listbox ariaLabel="What was sent" value={kind} onChange={(v) => onKind(v as SentKind)} options={SENT_KINDS.map((k) => ({ value: k.value, label: `${k.label} · ${counts[k.value]}` }))} className={LIST_FIELD} style={FIELD_STYLE} />;
}

/** One kind of sent item (not announcements) as rows in a card. A row
 *  opens who it went to. */
function SentPanel({ kind, onKind, counts, rows, onMessage }: { kind: Exclude<SentKind, "announcement">; onKind: (k: SentKind) => void; counts: Record<SentKind, number>; rows: SentRow[]; onMessage: (ids: string[]) => void }) {
  const roster = useReviewedRoster();
  const [drill, setDrill] = useState<Drill | null>(null);
  const shown = rows.filter((r) => r.kind === kind);
  const openRow = (r: SentRow) => {
    const to = r.studentIds.map((id) => roster.find((s) => s.id === id)).filter((s): s is CounselorStudent => !!s);
    setDrill({
      title: r.label, subtitle: `${shortDay(r.at)} · ${r.audience}`, lead: r.text,
      students: to.map((s) => ds(s, s.careerTrack)), studentsLabel: `Sent to ${to.length} student${to.length === 1 ? "" : "s"}`,
      action: r.open ? { label: r.openLabel ?? "Open", onClick: () => { setDrill(null); r.open?.(); } } : to.length ? { label: `Message ${to.length === 1 ? to[0].name.split(" ")[0] : `these ${to.length}`} again`, onClick: () => { setDrill(null); onMessage(to.map((s) => s.id)); } } : undefined,
    });
  };
  return (
    <div className="msg-card">
      <div className="msg-list-head">
        <div className="w-[260px] max-w-full"><SentKindPicker kind={kind} onKind={onKind} counts={counts} /></div>
      </div>
      <ul className="msg-list dm-scroll">
        {shown.length === 0 && <li className="msg-empty">Nothing of this kind sent yet.</li>}
        {shown.map((r) => (
          <li key={`${r.kind}-${r.id}`}>
            <button type="button" onClick={() => openRow(r)} className="msg-row dm-quiet group">
              <span className="msg-kind-icon"><r.icon className="h-[16px] w-[16px]" aria-hidden /></span>
              <span className="msg-row-copy">
                <span className="msg-row-top"><strong>{r.label}</strong><span className="msg-row-grade">{r.audience}</span><time>{shortDay(r.at)}</time></span>
                <span className="msg-row-line">{r.text}</span>
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
// 'Messages' inside Prepare"), then cut to two tabs the same day ("Keep only
// two tabs: Inbox and Sent"). Groups are gone ("Remove 'Groups' as
// student-to-student discussion boards for now ... creates moderation/
// safety complexity"); Questions folded into Inbox. Old links still land:
// &tab=questions and &tab=discussions open Inbox; &tab=broadcasts,
// &tab=announcements and &tab=sent open Sent.
type MessagesTab = "inbox" | "sent";
const OLD_TAB: Record<string, MessagesTab> = { inbox: "inbox", questions: "inbox", discussions: "inbox", broadcasts: "sent", announcements: "sent", sent: "sent" };

export function CounselorConnect() {
  // Opens on the Inbox (standing rule: what needs attention comes first).
  // `?compose=1` (Career + College Insights' pathway invites, Assist's
  // "Message all", Engagement's inactive drill, a profile's Message,
  // Milestones' "Message this group") opens straight into a private message
  // addressed to that pathway (`&pathway=`) or those students (`&ids=`), on
  // Sent, where everything sent to more than one student starts.
  const params = useSearchParams();
  const composeParam = params.get("compose") === "1";
  const initialPathway = params.get("pathway");
  const initialIds = (params.get("ids") ?? "").split(",").filter(Boolean);
  const questionParam = params.get("question");
  const studentParam = params.get("studentId");
  const draftParam = params.get("draft");
  const tabParam = OLD_TAB[params.get("tab") ?? ""];
  const [tab, setTab] = useState<MessagesTab>(composeParam ? "sent" : (questionParam || studentParam) ? "inbox" : tabParam ?? "inbox");
  const live = useConnectLive();
  const announcements = live.announcements;
  // `n` remounts the composer when a drill asks to message a new set
  const [compose, setCompose] = useState<{ kind: "announcement" | "private"; ids: string[]; n: number } | null>(composeParam ? { kind: "private", ids: initialIds, n: 0 } : null);
  const [openAnnouncement, setOpenAnnouncement] = useState<string | null>(null);
  const [drill, setDrill] = useState<Drill | null>(null);
  // what Sent shows: announcements (its layout from Broadcasts) or one
  // kind of the old Sent log
  const [sentKind, setSentKind] = useState<SentKind>("announcement");
  const sentRows = useSentRows();
  const sentCounts: Record<SentKind, number> = { announcement: announcements.length, message: 0, reminder: 0, todo: 0, share: 0 };
  for (const r of sentRows) sentCounts[r.kind]++;
  const current = announcements.find((a) => a.id === openAnnouncement) ?? announcements[0];
  const message = (ids: string[]) => { setDrill(null); setTab("sent"); setCompose({ kind: "private", ids, n: Date.now() }); window.scrollTo({ top: 0, behavior: "smooth" }); };
  // the inbox run (InboxPanel), kept here so a trip to Sent keeps it
  const [session, setSession] = useState<InboxSession>(() => ({ cleared: 0, startedAt: Date.now(), finishedAt: null, keys: [] }));
  const remaining = QUESTIONS.filter((q) => OWES.includes(live.statusOf(q.id))).length;
  // below 1024px: the announcement list, or one announcement
  const [annOpen, setAnnOpen] = useState(false);
  // a just-published announcement lands with a burst
  const [published, setPublished] = useState<{ id: string; n: number } | null>(null);
  const openAnn = (id: string) => {
    setOpenAnnouncement(id);
    setAnnOpen(true);
    // a phone opening an announcement lands on its top
    if (window.innerWidth < 1024) requestAnimationFrame(() => { const el = document.querySelector(".msg-shell.is-sent"); if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ block: "start" }); });
  };
  return (
    <div className="v4-page v4-connect flex flex-col gap-[var(--space-5)]">
      <div className="msg-toolbar">
        {/* the page view switch (level 3): the pill, so it never reads as a
           second row of the shell's underline page nav (9 Oct 2026) */}
        <SubTabs
          ariaLabel="Messages"
          value={tab}
          onChange={setTab}
          options={[
            { key: "inbox", label: "Inbox" },
            { key: "sent", label: "Sent" },
          ]}
        />
        {tab === "inbox" && session.cleared + remaining > 0 && <InboxBar cleared={session.cleared} remaining={remaining} />}
        {tab === "sent" && !compose && (
          <button type="button" onClick={() => setCompose({ kind: "announcement", ids: [], n: Date.now() })} className="dm-solid bg-[var(--primary)] text-[var(--primary-foreground)] flex h-9 cursor-pointer items-center gap-[6px] rounded-[var(--radius-sm)] px-[14px] text-[13px] font-bold">
            <Plus className="h-[14px] w-[14px]" aria-hidden /> New message
          </button>
        )}
      </div>

      {tab === "inbox" && <InboxPanel initialQuestion={questionParam} initialStudent={studentParam} initialDraft={draftParam} session={session} setSession={setSession} />}
      {tab === "sent" && (
        <div className="flex flex-col gap-[var(--space-4)]">
          {compose && <MessageComposer key={compose.n} initialKind={compose.kind} initialPathway={compose.n === 0 ? initialPathway : null} initialIds={compose.ids} onCancel={() => setCompose(null)} onSendAnnouncement={(a) => { addAnnouncement(a); setCompose(null); setSentKind("announcement"); openAnn(a.id); setPublished({ id: a.id, n: Date.now() }); playCorrect(); }} />}
          {!compose && (sentKind === "announcement"
            ? <div className="msg-shell is-sent" data-open={annOpen ? "true" : undefined}>
                <div className="msg-list-col">
                  <div className="msg-list-head"><SentKindPicker kind={sentKind} onKind={setSentKind} counts={sentCounts} /></div>
                  <ul className="msg-list dm-scroll">{announcements.map((a) => <AnnouncementCard key={a.id} a={a} open={current?.id === a.id} onToggle={() => openAnn(a.id)} />)}</ul>
                </div>
                <section className="msg-thread-col" aria-label="Announcement">
                  {current && <AnnouncementReading a={current} onDrill={setDrill} onMessage={message} onBack={() => setAnnOpen(false)} burst={published?.id === current.id ? published.n : 0} />}
                </section>
              </div>
            : <SentPanel kind={sentKind} onKind={setSentKind} counts={sentCounts} rows={sentRows} onMessage={message} />)}
        </div>
      )}
      <DrillPanel drill={drill} onClose={() => setDrill(null)} />
    </div>
  );
}
