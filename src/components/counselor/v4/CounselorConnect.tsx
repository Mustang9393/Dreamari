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
// 10 Oct 2026, later the same day, a design pass and bulk (Chandu:
// "Messages inbox and sent are too basic. We need better design there all
// around. And do we have bulk action controls? Bulk email, bulk sending
// etc?"). What each reference lends:
// - Superhuman: unread weight (a bold name and a bright line; read rows sit
//   back), a quiet time, and a keyboard for everything (J / K, X selects,
//   E resolves, N is Next).
// - Front: the checkbox takes the face's place on hover or focus,
//   shift-click selects a range, select all sits in the list head, and the
//   reading pane shows the selection with Reply to all and Mark resolved.
//   Reply to all reads before it sends (MessagesBulk.tsx, NudgeSession's
//   BulkReview pattern): one note with {first}, a preview per student, the
//   recipient list with untick, then Send N. Nothing leaves until Done.
// - Linear: the thread header's tags (status, topic, milestone) as quiet
//   pills.
// - Intercom: Sent as an outbound report. The outbox at a glance (sent,
//   reached, read, replies), each batch with its reach as three bars and a
//   drill into who read and who replied.
// - Bulk sending: "New message" is the page's primary action on both tabs.
//   One dropdown picks a message, reminder, to-do or announcement; the
//   audience is by grade, status, pathway, milestone not done, or picked
//   by hand; the preview steps through what each student gets; "Also send
//   as email" is DEMO-ONLY (no email channel exists).
// Every earlier tool and data point is still here (grade, topic, milestone
// and status moved from the row's second line into the open thread's
// header). Sounds follow the app's mute setting; motion stops under reduced
// motion (messages.css).

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus, Send, Check, Bell, Briefcase, ClipboardList, Landmark, MessageSquare, Mail, ChevronLeft, RotateCcw, Sparkles, CheckCheck, ArrowRight, Minus, X, Flag } from "lucide-react";
import { IconTip } from "@/components/app/IconTip";
import { SparkBar } from "@/components/flow/SparkBar";
import { LocalBurst } from "@/components/build/ui";
import { playCorrect, playFanfare, playSweep } from "@/components/play/sound";
import { cv } from "@/lib/counselorBase";
import { GlassesDreamy } from "./InsightCharts";
import { Listbox } from "./Listbox";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { Go } from "./chips";
import { Segmented } from "./viz";
import { LightPool, ReachFunnel } from "./charts/lit";
import { SubTabs } from "./SubTabs";
import { Avatar, SelectBox, STATUS_COLORS, STATUS_FILLS, StatusChip, StudentLink } from "./chips";
import { BulkComposer, BulkReplyReview, EmailToggle, fillFirst, markEmailed, reachFor, useEmailed } from "./MessagesBulk";
import { DrillPanel, type Drill, type DrillStudent } from "./Drill";
import { CAREER_TRACKS, MILESTONE_KEYS, getRoster, type CounselorStudent, type MilestoneKey, type MilestoneStatus } from "@/lib/counselorRoster";
import { GLASS_INSET } from "../surfaces";
import { BLUE_3 } from "./palette";
import { addAnnouncement, setQuestionState, useAddedAnnouncements, useQuestionStates } from "@/lib/counselorConnect";
import { useSends, type BatchKind } from "@/lib/counselorCasefile";
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
// 10 Oct 2026, glow pass: the ring became a pool of light whose area is the
// read rate (Chandu: "why is everything a ring to you?" and "i want them to
// be made of LIGHT"), same size, so the row still leads with a face-sized
// mark and the number stays on top.
function ReadRing({ pct, size = 34 }: { pct: number; size?: number }) {
  return (
    <LightPool pct={pct} size={size} className="msg-ring">
      <b>{pct}<small>%</small></b>
    </LightPool>
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
      {r.read.length > 0 && <UnreadFaces students={r.unread} onMore={() => onDrill(readDrill())} />}
      <LocalBurst nonce={burst} />
    </article>
  );
}

/** Who has not read it yet, as faces that open each student, so the
 *  reader carries the next people to reach, not empty space. */
function UnreadFaces({ students, onMore }: { students: CounselorStudent[]; onMore: () => void }) {
  if (!students.length) return null;
  const shown = students.slice(0, 8);
  return (
    <section className="msg-unread" aria-label="Not read yet">
      <span className="msg-label">Not read yet</span>
      <ul className="msg-unread-list">
        {shown.map((s) => (
          <li key={s.id}><Link href={`${cv("students")}&studentId=${encodeURIComponent(s.id)}`} className="msg-person dm-quiet"><Avatar name={s.name} index={s.avatarIndex} size={28} /><span>{s.name}</span></Link></li>
        ))}
        {students.length > shown.length && <li><button type="button" onClick={onMore} className="msg-person is-more dm-quiet">+{students.length - shown.length} more</button></li>}
      </ul>
    </section>
  );
}

function AnnouncementComposer({ onSend, onCancel }: { onSend: (a: Announcement) => void; onCancel: () => void }) {
  const [title, setTitle] = useState("");
  const [audience, setAudience] = useState<string>("All Students");
  const [body, setBody] = useState("");
  // DEMO-ONLY: the email switch records the choice; nothing is emailed
  const [email, setEmail] = useState(false);
  const field = { background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" } as const;
  return <div className="v4-message-compose-grid"><div className="v4-message-compose-fields"><label><span>01 / Audience</span><Listbox ariaLabel="Audience" value={audience} onChange={setAudience} options={AUDIENCES.map(a=>({value:a,label:a}))} className="v4-period-select" style={field}/></label><label><span>02 / Subject</span><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Give students a clear headline" aria-label="Title" style={field}/></label><label><span>03 / Message</span><textarea value={body} onChange={e=>setBody(e.target.value)} placeholder="What do students need to know or do?" aria-label="Body" rows={8} style={field}/></label><div className="v4-compose-footer"><button type="button" className="v4-secondary-action" onClick={onCancel}>Discard</button><EmailToggle on={email} onChange={setEmail}/><button type="button" className="v4-primary-action" disabled={!title.trim()||!body.trim()} onClick={()=>{const id=`a-${Date.now()}`;if(email)markEmailed(id);onSend({id,title:title.trim(),to:`${audience} · Sent: ${new Date().toISOString().slice(0,10)}`,read:0,body:body.trim(),tags:[]});}}><Send size={14}/>Publish announcement</button></div></div><aside className="v4-announcement-proof"><span className="v4-overline">Student Preview</span><div><span>School counseling · {audience}</span><h3>{title || 'Your announcement headline'}</h3><p>{body || 'Your message will appear here as you write.'}</p><small>From your counselor</small></div></aside></div>;
}

const DONE_STATES: MilestoneStatus[] = ["Approved", "Completed", "Not Applicable"];
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
function PrivateMessageComposer({ kind, initialPathway, initialIds, onCancel }: { kind: BatchKind; initialPathway: string | null; initialIds: string[]; onCancel: () => void }) {
  const roster = useReviewedRoster();
  const students = useMemo(() => [...roster].sort((a, b) => a.name.localeCompare(b.name)), [roster]);
  const [gGrade, setGGrade] = useState("All");
  const [gStatus, setGStatus] = useState("All");
  const [gPathway, setGPathway] = useState(initialPathway && (CAREER_TRACKS as readonly string[]).includes(initialPathway) ? initialPathway : "All");
  // by milestone (10 Oct 2026): everyone whose milestone is not done yet
  const [gMilestone, setGMilestone] = useState("All");
  const [gMode, setGMode] = useState<"audience" | "pick">(initialIds.length ? "pick" : "audience");
  const [picked, setPicked] = useState<Set<string>>(() => new Set(initialIds));
  const [sent, setSent] = useState<string | null>(null);
  const [burst, setBurst] = useState(0);
  const byAudience = roster.filter((s) => (gGrade === "All" || String(s.grade) === gGrade) && (gStatus === "All" || s.status === gStatus) && (gPathway === "All" || s.careerTrack === gPathway) && (gMilestone === "All" || !DONE_STATES.includes(s.milestones[gMilestone as MilestoneKey])));
  const audience = gMode === "pick" ? students.filter((s) => picked.has(s.id)) : byAudience;
  const audienceLabel = gMode === "pick" ? `${picked.size} picked` : [gGrade === "All" ? "All grades" : `Grade ${gGrade}`, gStatus === "All" ? null : gStatus, gPathway === "All" ? null : gPathway, gMilestone === "All" ? null : `${gMilestone} not done`].filter(Boolean).join(" · ");
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
        <div className="grid grid-cols-1 gap-[var(--space-3)] sm:grid-cols-2 xl:grid-cols-4">
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
          <label className="flex min-w-0 flex-col gap-[4px]">
            <span className={labelCls} style={{ color: "var(--muted-foreground)" }}>Milestone not done</span>
            <Listbox ariaLabel="Milestone not done" value={gMilestone} onChange={setGMilestone} options={[{ value: "All", label: "Any milestone" }, ...MILESTONE_KEYS.map((k) => ({ value: k, label: k }))]} className={FIELD} style={FIELD_STYLE} />
          </label>
        </div>
      )}
      {sent && <p key={burst} className="msg-sent-note"><Check className="h-[14px] w-[14px]" aria-hidden />{sent}</p>}
      {audience.length === 0 ? (
        <p className="text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{gMode === "pick" ? "Pick at least one student above." : "No students match that audience. Widen a filter."}</p>
      ) : (
        <BulkComposer kind={kind} students={audience} audience={audienceLabel} onDone={(summary) => { setSent(summary); setBurst((n) => n + 1); playCorrect(); if (gMode === "pick") setPicked(new Set()); }} />
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
  // one picker for what goes out (10 Oct 2026): a private message, a
  // reminder or a to-do to each student, or an announcement on the board.
  // One dropdown, so the audience switch is the composer's only tab row.
  const [kind, setKind] = useState<BatchKind | "announcement">(initialKind === "announcement" ? "announcement" : "message");
  return (
    <div className="msg-card msg-new">
      <div className="msg-new-head">
        <h2 className="msg-new-title">New message</h2>
        <Listbox ariaLabel="What to send" value={kind} onChange={(k) => setKind(k as BatchKind | "announcement")} options={[{ value: "message", label: "Message" }, { value: "reminder", label: "Reminder" }, { value: "todo", label: "To-do" }, { value: "announcement", label: "Announcement" }]} className={LIST_FIELD} style={FIELD_STYLE} />
        <span className="msg-new-sub">{kind === "announcement" ? "Posted to the board for everyone in the audience." : "Sent privately to each student, as their own."}</span>
      </div>
      {kind === "announcement" ? <AnnouncementComposer onSend={onSendAnnouncement} onCancel={onCancel} /> : <PrivateMessageComposer kind={kind} initialPathway={initialPathway} initialIds={initialIds} onCancel={onCancel} />}
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
 *  2026, Chandu: "the glasses dreamy everywhere"). Later the same day
 *  ("Dreamy sits very awkwardly ... It floats too much"): always an inline
 *  face locked into the row he speaks in, a 36px slot (88px only on inbox
 *  zero, centered), one per view. GlassesDreamy (InsightCharts.tsx) draws
 *  him as a layer over that slot, so his float, tilt and hop never move
 *  the layout. */
function DreamyGlasses({ size, hop = 0, thinking = false, pop }: { size: number; hop?: number; thinking?: boolean; pop?: number }) {
  return <GlassesDreamy size={size} hop={hop} thinking={thinking} pop={pop} />;
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
type Held = { kind: "replied" | "resolved"; prev: QuestionStatus; owed: boolean };
type Settled = ({ key: string } & Held) | null;
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
      <span className="msg-zero-avatar"><DreamyGlasses size={92} pop={1.25} hop={n > 0 ? 1 : 0} /></span>
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
  // questions replied to or resolved, held on screen until Next or Done
  const [held, setHeld] = useState<Record<string, Held>>({});
  // the last bulk action, held until its own Done
  const [bulk, setBulk] = useState<{ keys: string[]; kind: Held["kind"] } | null>(null);
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
  // a held question keeps its place in Needs Reply until Next or Done
  const rankOf = (r: QuestionRow) => STATUS_STYLE[held[r.key]?.prev ?? statusOf(r.q.id)].rank;
  const rows = group === "reply"
    ? [...inGroup("reply"), ...questionRows.filter((r) => held[r.key] && !OWES.includes(statusOf(r.q.id)))].sort((a, b) => a.kind === "question" && b.kind === "question" ? rankOf(a) - rankOf(b) || b.date.localeCompare(a.date) || QUESTIONS.indexOf(a.q) - QUESTIONS.indexOf(b.q) : 0)
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
  // multi-select (10 Oct 2026): Needs Reply rows, shift-click for a range
  const [checked, setChecked] = useState<Set<string>>(() => new Set());
  const [anchor, setAnchor] = useState<string | null>(null);
  const [reviewing, setReviewing] = useState(false);
  // the reading pane shows the selection (Front's multi-select pane) until a row is opened
  const [bulkView, setBulkView] = useState(false);
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
  const hereHeld = selected ? held[selected.key] : undefined;
  const hereSettled: Settled = hereHeld && selected ? { key: selected.key, ...hereHeld } : null;
  const selectable = group === "reply" ? rows.filter((r): r is QuestionRow => r.kind === "question" && !held[r.key]) : [];
  const checkedRows = selectable.filter((r) => checked.has(r.key));
  // Next goes to the next row still waiting
  const nextKey = (() => {
    if (!hereSettled || group !== "reply") return undefined;
    const i = rows.findIndex((r) => r.key === hereSettled.key);
    const free = (r: InboxRow) => !held[r.key];
    return (rows.slice(i + 1).find(free) ?? rows.slice(0, Math.max(0, i)).reverse().find(free))?.key;
  })();

  const releaseKeys = (keys: string[]) => {
    setHeld((h) => { const n = { ...h }; for (const k of keys) delete n[k]; return n; });
    setBulk((b) => { if (!b) return b; const left = b.keys.filter((k) => !keys.includes(k)); return left.length ? { ...b, keys: left } : null; });
    setEditing(null);
  };
  // the run ends, with Dreamy's celebration, once nothing waits and nothing is held
  const finishIfClear = (heldLeft: number) => {
    if (group !== "reply" || counts.reply > 0 || heldLeft > 0) return;
    setSession((s) => ({ ...s, finishedAt: Date.now() }));
    if (session.cleared > 0) playFanfare();
    setOpen(false);
  };
  const pick = (key: string) => {
    if (key !== selectedKey) {
      setDraftKey(null);
      setJustSent(null);
      // moving away lets a single held question go (a bulk hold waits for its Done)
      if (held[selectedKey] && !bulk?.keys.includes(selectedKey)) releaseKeys([selectedKey]);
      setEditing(null);
    }
    setSelectedKey(key);
    setBulkView(false);
    setOpen(true);
  };
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
    if (k) requestAnimationFrame(() => shellRef.current?.querySelector<HTMLElement>(`[data-key="${CSS.escape(k)}"] .msg-row`)?.focus());
  };

  const count = (key: string, owed: boolean) => { if (owed) setSession((s) => (s.keys.includes(key) ? s : { ...s, cleared: s.cleared + 1, keys: [...s.keys, key] })); };
  const uncount = (key: string) => setSession((s) => (s.keys.includes(key) ? { ...s, cleared: Math.max(0, s.cleared - 1), keys: s.keys.filter((x) => x !== key), finishedAt: null } : s));
  const hold = (key: string, h: Held) => setHeld((all) => ({ ...all, [key]: h }));

  // Send: the reply is saved and counted at once, and your bubble rises with
  // a burst; the thread stays, with Edit and Delete, until Next.
  const reply = (row: QuestionRow) => {
    const text = response.trim();
    if (!text) return;
    const wasEditing = editing === row.key;
    const prev = held[row.key]?.prev ?? statusOf(row.q.id);
    const owed = held[row.key]?.owed ?? OWES.includes(prev);
    setQuestionState(row.q.id, "responded", text);
    replyTo(row.q.id, text);
    if (!wasEditing) logTime({ activity: "Answered a question", minutes: 5, kind: "indirect", studentId: row.studentId });
    setTexts((t) => ({ ...t, [row.key]: "" }));
    hold(row.key, { kind: "replied", prev, owed });
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
    hold(row.key, { kind: "resolved", prev, owed });
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
  const revert = (key: string) => {
    const h = held[key];
    if (!h) return;
    setQuestionState(key, h.prev, "");
    if (h.kind === "replied") undoReply(key);
    uncount(key);
  };
  const unsettle = (row: QuestionRow) => { revert(row.key); releaseKeys([row.key]); };
  // Next: only now does the thread leave and the next one slide in; after
  // the last one, inbox zero.
  const next = () => {
    if (!hereSettled) return;
    const k = nextKey;
    const heldLeft = Object.keys(held).filter((x) => x !== hereSettled.key).length;
    releaseKeys([hereSettled.key]);
    if (k) { setSelectedKey(k); return; }
    finishIfClear(heldLeft);
  };

  // ---- bulk (10 Oct 2026) ----
  const toggleCheck = (key: string, range: boolean) => {
    setBulkView(true);
    setChecked((prev) => {
      const nextSet = new Set(prev);
      if (range && anchor) {
        const keys = selectable.map((r) => r.key);
        const [a, b] = [keys.indexOf(anchor), keys.indexOf(key)].sort((x, y) => x - y);
        if (a >= 0 && b >= 0) { for (const k of keys.slice(a, b + 1)) nextSet.add(k); return nextSet; }
      }
      if (nextSet.has(key)) nextSet.delete(key); else nextSet.add(key);
      return nextSet;
    });
    setAnchor(key);
  };
  const allChecked = selectable.length > 0 && checkedRows.length === selectable.length;
  const toggleAll = () => { setBulkView(true); setChecked(allChecked ? new Set() : new Set(selectable.map((r) => r.key))); };
  const clearChecks = () => { setChecked(new Set()); setAnchor(null); };
  const bulkResolve = () => {
    const keys = checkedRows.map((r) => r.key);
    for (const r of checkedRows) { const prev = statusOf(r.q.id); const owed = OWES.includes(prev); setQuestionState(r.q.id, "resolved"); hold(r.key, { kind: "resolved", prev, owed }); count(r.key, owed); }
    setBulk({ keys, kind: "resolved" });
    setBulkView(true);
    clearChecks();
    setBurst((n) => n + 1);
    playCorrect();
  };
  const bulkReply = (keys: string[], template: string) => {
    for (const k of keys) {
      const r = questionRows.find((x) => x.key === k);
      if (!r) continue;
      const prev = statusOf(r.q.id);
      const owed = OWES.includes(prev);
      const text = fillFirst(template, r.name);
      setQuestionState(r.q.id, "responded", text);
      replyTo(r.q.id, text);
      logTime({ activity: "Answered a question", minutes: 2, kind: "indirect", studentId: r.studentId });
      hold(r.key, { kind: "replied", prev, owed });
      count(r.key, owed);
    }
    setBulk({ keys, kind: "replied" });
    setBulkView(true);
    setReviewing(false);
    clearChecks();
    setBurst((n) => n + 1);
    playSweep();
  };
  const bulkUndo = () => { if (!bulk) return; for (const k of bulk.keys) revert(k); releaseKeys(bulk.keys); setBulkView(false); };
  const bulkDone = () => {
    if (!bulk) return;
    const keys = bulk.keys;
    const heldLeft = Object.keys(held).filter((x) => !keys.includes(x)).length;
    releaseKeys(keys);
    setBulkView(false);
    if (selected && keys.includes(selected.key)) {
      const nx = rows.find((r) => !held[r.key] && !keys.includes(r.key));
      if (nx) setSelectedKey(nx.key);
    }
    finishIfClear(heldLeft);
  };

  // keys: J / K through the list, X selects, E resolves, N (or Enter) is
  // Next once a question is held, Escape clears a selection (never while
  // typing; Ctrl+Enter sends from the box)
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
      } else if (k === "x" && selected && selectable.some((r) => r.key === selected.key)) {
        e.preventDefault();
        toggleCheck(selected.key, e.shiftKey);
      } else if (k === "escape" && checked.size) {
        clearChecks();
      } else if (bulk && bulkView && !checked.size && (k === "n" || (k === "enter" && t?.tagName !== "BUTTON" && t?.tagName !== "A"))) {
        e.preventDefault();
        bulkDone();
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

  const selecting = checkedRows.length > 0;
  return (
    <>
      <div ref={shellRef} className={`msg-shell ${zero ? "is-zero" : ""} ${selecting ? "is-selecting" : ""}`} data-open={open ? "true" : undefined}>
        <div className="msg-list-col">
          <div className="msg-list-head">
            {selectable.length > 0 && (
              <IconTip label={allChecked ? "Clear selection" : `Select all ${selectable.length}`}>
                <button type="button" role="checkbox" aria-checked={allChecked ? true : selecting ? "mixed" : false} aria-label={`Select all ${selectable.length}`} onClick={toggleAll} className="msg-check is-all">
                  {allChecked ? <Check className="h-[13px] w-[13px]" aria-hidden /> : selecting ? <Minus className="h-[13px] w-[13px]" aria-hidden /> : null}
                </button>
              </IconTip>
            )}
            <Listbox
              ariaLabel="Show messages"
              value={group}
              onChange={(k) => { const g = k as InboxGroup; if (held[selectedKey] && !bulk?.keys.includes(selectedKey)) releaseKeys([selectedKey]); clearChecks(); setGroup(g); const nx = inGroup(g)[0]; if (nx) setSelectedKey(nx.key); }}
              options={GROUPS}
              className={LIST_FIELD}
              style={FIELD_STYLE}
            />
            {!zero && <IconTip label="J and K move, X selects"><span className="msg-keys">J / K</span></IconTip>}
          </div>
          <ul className="msg-list dm-scroll" aria-label="Messages">
            {/* a dense list mid-flow: one muted line (COMPONENT_STATES_PLAYBOOK.md, tier 3) */}
            {rows.length === 0 && !zero && <li className="msg-empty">{group === "threads" ? "No conversations yet. Message a student from their page." : "Nothing answered yet."}</li>}
            {rows.map((r) => {
              const on = selected?.key === r.key;
              const h = held[r.key];
              const st = r.kind === "question" ? statusOf(r.q.id) : null;
              const unread = !h && (st === "new" || st === "follow-up");
              const waiting = !h && !!st && OWES.includes(st);
              const line = r.kind === "question" ? r.q.question : r.messages[r.messages.length - 1]?.text ?? "Write your first message";
              const topic = r.kind === "question" ? r.q.tag : r.messages.length ? `${r.messages.length} sent` : "New conversation";
              const canCheck = selectable.some((x) => x.key === r.key);
              const isChecked = checked.has(r.key);
              return (
                <li key={r.key} data-key={r.key} className={`msg-li ${isChecked ? "is-checked" : ""} ${unread ? "is-unread" : ""}`}>
                  {canCheck && (
                    <IconTip label={isChecked ? "Unselect" : "Select (Shift for a range)"} className="msg-check-tip absolute">
                      <button type="button" role="checkbox" aria-checked={isChecked} aria-label={`Select ${r.name}`} onClick={(e) => toggleCheck(r.key, e.shiftKey)} className="msg-check">
                        {isChecked && <Check className="h-[13px] w-[13px]" aria-hidden />}
                      </button>
                    </IconTip>
                  )}
                  <button type="button" onClick={(e) => { if (e.shiftKey && canCheck) { toggleCheck(r.key, true); return; } pick(r.key); }} aria-current={on ? "true" : undefined} className="msg-row dm-quiet">
                    <span className="msg-row-face"><Avatar name={r.name} index={r.avatarIndex} size={38} /></span>
                    <span className="msg-row-copy">
                      <span className="msg-row-top">
                        <strong>{r.name}</strong>
                        {unread && st && <span role="img" aria-label="Needs a reply" className="msg-dot" style={{ background: STATUS_STYLE[st].fill }} />}
                        {h && <CheckCheck className="msg-row-done" aria-label={h.kind === "resolved" ? "Resolved" : "Replied"} />}
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
          {/* a bulk action stays held, with Undo and Done, while you read a thread */}
          {bulk && !bulkView && !selecting && (
            <div className="msg-docked" role="region" aria-label="Last bulk action">
              <span className="msg-bulk-count"><CheckCheck className="h-4 w-4" aria-hidden />{bulk.kind === "replied" ? "Replied to" : "Resolved"} <b>{bulk.keys.length}</b></span>
              <button type="button" onClick={bulkUndo} className="msg-bulk-btn dm-quiet">Undo</button>
              <button type="button" onClick={bulkDone} className="msg-bulk-btn is-solid dm-solid bg-[var(--primary)] text-[var(--primary-foreground)]">Done</button>
            </div>
          )}
        </div>
        <section className="msg-thread-col" aria-label="Conversation">
          {zero
            ? <InboxZero session={session} faces={zeroFaces} />
            : (selecting || (bulk && bulkView))
            ? <BulkPanel rows={selecting ? checkedRows : (bulk?.keys ?? []).map((k) => questionRows.find((r) => r.key === k)).filter((r): r is QuestionRow => !!r)} done={selecting ? null : bulk?.kind ?? null}
                onReply={() => setReviewing(true)} onResolve={bulkResolve} onClear={clearChecks} onUndo={bulkUndo} onDone={bulkDone} />
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

        {/* phones and tablets: the selection's actions float at the foot
           (the reading pane, where they sit on a desktop, is hidden there) */}
        {selecting && (
          <div className="msg-bulkbar" role="region" aria-label="Bulk actions">
            <span className="msg-bulk-count"><b>{checkedRows.length}</b> selected</span>
            <button type="button" onClick={() => setReviewing(true)} className="msg-bulk-btn is-solid dm-solid bg-[var(--primary)] text-[var(--primary-foreground)]"><Send className="h-[14px] w-[14px]" aria-hidden />Reply to all</button>
            <button type="button" onClick={bulkResolve} className="msg-bulk-btn dm-quiet"><Check className="h-[14px] w-[14px]" aria-hidden />Resolve</button>
            <IconTip label="Clear selection (Esc)"><button type="button" onClick={clearChecks} aria-label="Clear selection" className="msg-bulk-x dm-quiet"><X className="h-4 w-4" aria-hidden /></button></IconTip>
          </div>
        )}
      </div>
      {reviewing && (
        <BulkReplyReview
          items={checkedRows.map((r) => ({ key: r.key, name: r.name, studentId: r.studentId, avatarIndex: r.avatarIndex, question: r.q.question, tag: r.q.tag }))}
          onCancel={() => setReviewing(false)}
          onSend={bulkReply}
        />
      )}
    </>
  );

  function sendThread(row: ThreadRow) {
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
  }
  // a conversation's last message: Edit takes it back into the box, Delete
  // takes it back
  function takeBack(row: ThreadRow, toBox: boolean) {
    const lastMsg = row.messages[row.messages.length - 1];
    undoLastMessage(row.studentId);
    const st = roster.find((s) => s.id === row.studentId);
    if (st) setPending(st);
    if (toBox && lastMsg) setTexts((t) => ({ ...t, [row.key]: lastMsg.text }));
    setJustSent(null);
  }
}

/** The reading pane while rows are selected (Front's multi-select pane):
 *  who, what they asked, and the two bulk moves. After a bulk move, what
 *  happened, with Undo and Done (nothing leaves until Done). */
function BulkPanel({ rows, done, onReply, onResolve, onClear, onUndo, onDone }: { rows: QuestionRow[]; done: Held["kind"] | null; onReply: () => void; onResolve: () => void; onClear: () => void; onUndo: () => void; onDone: () => void }) {
  const n = rows.length;
  const shown = rows.slice(0, 6);
  return (
    <div className="msg-bulkpane is-arriving">
      <div className="msg-bulkpane-head">
        <span className="msg-stack">{rows.slice(0, 6).map((r) => <span key={r.key}><Avatar name={r.name} index={r.avatarIndex} size={40} /></span>)}</span>
        <p className="msg-bulkpane-title">{done ? `${done === "replied" ? "Replied to" : "Resolved"} ${n}` : `${n} selected`}</p>
      </div>
      <ul className="msg-bulkpane-list dm-scroll">
        {shown.map((r) => (
          <li key={r.key}>
            <span className="msg-bulkpane-who">{done && <CheckCheck className="msg-row-done" aria-hidden />}<b>{r.name}</b><span>{r.q.tag}</span></span>
            <span className="msg-bulkpane-q">{r.q.question}</span>
          </li>
        ))}
        {n > shown.length && <li className="msg-bulkpane-more">and {n - shown.length} more</li>}
      </ul>
      <div className="msg-composer is-done has-mascot">
        <span className="msg-mascot" aria-hidden><DreamyGlasses size={44} pop={2.2} hop={done ? 1 : 0} /></span>
        <div className="msg-done">
          {done ? (
            <>
              <span className="msg-done-copy">Nice work.</span>
              <button type="button" onClick={onUndo} className="msg-undo-link dm-link"><RotateCcw className="h-[13px] w-[13px]" aria-hidden />Undo all</button>
              <IconTip label="Done (N or Enter)"><button type="button" onClick={onDone} className="msg-next dm-solid bg-[var(--primary)] text-[var(--primary-foreground)]">Done<ArrowRight className="h-[15px] w-[15px]" aria-hidden /></button></IconTip>
            </>
          ) : (
            <>
              <span className="msg-done-copy">One reply can go to all {n}.</span>
              <span className="msg-bulkpane-actions">
                <button type="button" onClick={onClear} className="msg-undo-link dm-link">Clear</button>
                <button type="button" onClick={onResolve} className="msg-btn dm-quiet"><Check className="h-4 w-4" aria-hidden />Mark resolved</button>
                <button type="button" onClick={onReply} className="msg-next dm-solid bg-[var(--primary)] text-[var(--primary-foreground)]"><Send className="h-[15px] w-[15px]" aria-hidden />Reply to all</button>
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/** The student's face beside their bubble, opening their page. */
function BubbleFace({ id, name, index }: { id?: string; name: string; index?: number }) {
  const face = <Avatar name={name} index={index} size={34} />;
  if (!id) return <span className="msg-face">{face}</span>;
  return <IconTip label={`Open ${name}`}><Link href={`${cv("students")}&studentId=${encodeURIComponent(id)}`} className="msg-face" aria-label={`Open ${name}`}>{face}</Link></IconTip>;
}

/** The reply frame: Dreamy's face leads his drafts row (a 36px avatar, in line), his drafts as chips
 *  (hover or focus one to preview it in the box, tap to fill it), the box,
 *  then the actions. */
function ReplyBox({ row, value, onChange, onSend, hop = 0, drafts = true, children }: { row: InboxRow; value: string; onChange: (v: string) => void; onSend: () => void; /** Dreamy hops when this changes (a message went) */ hop?: number; drafts?: boolean; children: React.ReactNode }) {
  const [preview, setPreview] = useState<string | null>(null);
  // Dreamy "types" his drafts for a beat as each thread opens (he read it
  // first), then they pop in
  const [typing, setTyping] = useState(true);
  useEffect(() => { const t = window.setTimeout(() => setTyping(false), reducedMotion() ? 0 : 700); return () => window.clearTimeout(t); }, []);
  const boxRef = useRef<HTMLTextAreaElement>(null);
  const first = row.name.split(" ")[0];
  const label = row.kind === "question" ? "My reply" : "Message";
  return (
    <div className="msg-composer has-mascot">
      {/* Dreamy, large, as a layer over the frame's top-left corner (out of
         the flow; the first row keeps room for him) */}
      <span className="msg-mascot" aria-hidden><DreamyGlasses size={44} pop={2.2} hop={hop} thinking={drafts && typing} /></span>
      <div className="msg-drafts" role="group" aria-label="Dreamy's drafts" aria-busy={drafts && typing}>
        {drafts && <span className="msg-drafts-says">Dreamy suggests</span>}
        {drafts && typing && <span className="msg-typing" aria-label="Dreamy is drafting"><i /><i /><i /></span>}
        {drafts && !typing && draftsFor(row).map((d) => (
          <button key={d.label} type="button" aria-pressed={value === d.text} className="msg-draft dm-quiet"
            onMouseEnter={() => setPreview(d.text)} onMouseLeave={() => setPreview(null)} onFocus={() => setPreview(d.text)} onBlur={() => setPreview(null)}
            onClick={() => { onChange(d.text); setPreview(null); boxRef.current?.focus(); }}>
            <Sparkles className="h-[13px] w-[13px]" aria-hidden />{d.label}
          </button>
        ))}
        {!drafts && <span className="msg-drafts-says">Editing your reply</span>}
      </div>
      <textarea ref={boxRef} value={value} onChange={(e) => onChange(e.target.value)} aria-label={label} rows={3}
        onKeyDown={(e) => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); onSend(); } }}
        placeholder={preview ?? (row.kind === "question" ? `Reply to ${first}` : `Write to ${first}`)}
        className={`msg-box ${preview && !value ? "is-preview" : ""}`} />
      {children}
    </div>
  );
}

/** After a reply or a resolve: Dreamy's face beside what happened (a hop),
 *  Undo for a resolve, and Next (the only thing that moves on). */
function DoneBar({ settled, first, onUndo, onNext, nextLabel }: { settled: NonNullable<Settled>; first: string; onUndo: () => void; onNext: () => void; nextLabel: string }) {
  const nextRef = useRef<HTMLButtonElement>(null);
  // focus lands on Next, so Enter moves on
  useEffect(() => { nextRef.current?.focus({ preventScroll: true }); }, []);
  return (
    <div className="msg-composer is-done has-mascot">
      <span className="msg-mascot" aria-hidden><DreamyGlasses size={44} pop={2.2} hop={1} /></span>
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
      <ThreadHead backRef={backRef} onBack={onBack} id={row.studentId} name={q.name} index={row.avatarIndex} meta={`Grade ${q.grade}`}
        tags={<>
          <span className="msg-tag-pill is-status" style={{ color: STATUS_STYLE[status].color }}><i style={{ background: STATUS_STYLE[status].fill }} />{STATUS_STYLE[status].label}</span>
          <span className="msg-tag-pill">{q.tag}</span>
          {q.milestone && <span className="msg-tag-pill"><Flag className="h-[12px] w-[12px]" aria-hidden />{q.milestone}</span>}
        </>} />
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
      <ReplyBox row={row} value={response} onChange={setResponse} onSend={onSend} hop={justSent ? row.messages.length : 0}>
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
function ThreadHead({ backRef, onBack, id, name, index, meta, tags }: { backRef: React.RefObject<HTMLButtonElement | null>; onBack: () => void; id?: string; name: string; index?: number; meta: string; tags?: React.ReactNode }) {
  return (
    <header className="msg-thread-head">
      <button ref={backRef} type="button" onClick={onBack} className="msg-back dm-quiet"><ChevronLeft className="h-4 w-4" aria-hidden />Inbox</button>
      <div className="msg-thread-who">
        <StudentLink id={id} name={name} index={index} size={42}><span className="msg-thread-meta">{meta}</span></StudentLink>
        {tags && <div className="msg-tags">{tags}</div>}
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
type SentRow = { id: string; at: string; kind: Exclude<SentKind, "announcement">; label: string; icon: typeof Bell; text: string; due?: string; audience: string; studentIds: string[]; open?: () => void; openLabel?: string };
const SENT_KINDS: { value: SentKind; label: string }[] = [
  { value: "announcement", label: "Announcements" },
  { value: "message", label: "Messages" },
  { value: "reminder", label: "Reminders" },
  { value: "todo", label: "To-dos" },
  { value: "share", label: "Shared from Explore" },
];
const SEND_LABEL: Record<"message" | "reminder" | "todo", { label: string; icon: typeof Bell }> = { message: { label: "Message", icon: MessageSquare }, reminder: { label: "Reminder", icon: Bell }, todo: { label: "To-do", icon: ClipboardList } };
const shortDay = (iso: string) => new Date(iso.length === 10 ? `${iso}T12:00:00` : iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });

// DEMO-ONLY: three batches already sent this month, so the outbox shows
// reach before the counselor sends one. Recipients come from the roster.
function seededBatches(): SentRow[] {
  const roster = getRoster();
  const ids = (f: (s: CounselorStudent) => boolean, n: number) => roster.filter(f).slice(0, n).map((s) => s.id);
  return [
    { id: "seed-b1", at: "2026-10-08T15:10:00.000Z", kind: "reminder", ...SEND_LABEL.reminder, text: "Hi {first}, the FAFSA opened this month. File it soon so you do not miss state aid. Come see me if you want help.", audience: "Grade 12", studentIds: ids((s) => s.grade === 12, 18) },
    { id: "seed-b2", at: "2026-10-03T14:00:00.000Z", kind: "message", ...SEND_LABEL.message, text: "Hi {first}! The career fair is on Oct 22 in the gym. Bring one question for an employer you like.", audience: "Grade 11", studentIds: ids((s) => s.grade === 11, 16) },
    { id: "seed-b3", at: "2026-09-29T13:30:00.000Z", kind: "todo", ...SEND_LABEL.todo, text: "Book a 15-minute meeting with me to review your plan.", due: "2026-10-13", audience: "Needs Attention", studentIds: ids((s) => s.status === "Needs Attention", 12) },
  ];
}

/** Everything but announcements that went out from the dashboard, newest
 *  first: messages, reminders and to-dos (counselorCasefile), one-to-one
 *  messages (counselorMessages) and Explore shares (counselorShares). */
function useSentRows(): SentRow[] {
  const sends = useSends();
  const shares = useShares();
  const threads = useMessages().threads;
  return useMemo<SentRow[]>(() => [
    ...sends.map((s) => ({ id: s.id, at: s.at, kind: s.kind, ...SEND_LABEL[s.kind], text: s.text, due: s.due, audience: s.audience, studentIds: s.studentIds })),
    ...seededBatches(),
    // one-to-one messages from a student page or brief (v5's thread store)
    ...threads.flatMap((t) => t.messages.map((m, i) => ({ id: `${t.studentId}-${i}`, at: m.at, kind: "message" as const, ...SEND_LABEL.message, text: m.text, audience: t.name, studentIds: [t.studentId] }))),
    ...shares.map((sh) => {
      const career = sh.kind === "career" ? ALL_CATALOG_CAREERS.find((c) => c.title === sh.title) : undefined;
      const school = sh.kind === "school" ? COLLEGES.find((c) => c.slug === sh.ref) : undefined;
      return { id: sh.id, at: sh.at, kind: "share" as const, label: sh.kind === "career" ? "Career shared" : sh.kind === "school" ? "School shared" : "Shared", icon: sh.kind === "school" ? Landmark : Briefcase, text: sh.title, audience: `${sh.studentIds.length} student${sh.studentIds.length === 1 ? "" : "s"}`, studentIds: sh.studentIds, open: career ? () => openCareer(career) : school ? () => openSchool(school) : undefined, openLabel: `Open ${sh.title}` };
    }),
  ].sort((a, b) => b.at.localeCompare(a.at)), [sends, shares, threads]);
}

/** {first} shows as a small token in the outbox, the way the editor wrote it. */
function WithTokens({ text }: { text: string }) {
  const parts = text.split(/(\{first\})/g);
  return <>{parts.map((p, i) => p === "{first}" ? <span key={i} className="msg-token-inline">first name</span> : <span key={i}>{p}</span>)}</>;
}

/** The outbox at a glance (Front's and Intercom's outbound reports): what
 *  went out, how many students it reached, how much was read, how many
 *  replied. One line each, the read rate as the one bar. */
function SentStats({ announcements, rows }: { announcements: Announcement[]; rows: SentRow[] }) {
  const roster = useReviewedRoster();
  const reached = new Set<string>();
  let sent = 0, read = 0, replies = 0;
  for (const a of announcements) { const r = readersFor(a, roster); r.recipients.forEach((s) => reached.add(s.id)); sent += r.recipients.length; read += r.read.length; }
  for (const b of rows) { if (b.kind === "share") continue; const r = reachFor(b.id, b.studentIds, b.at); b.studentIds.forEach((id) => reached.add(id)); sent += b.studentIds.length; read += r.read.length; replies += r.replied.length; }
  const pct = sent ? Math.round((read / sent) * 100) : 0;
  const cells = [
    { k: "Sent", v: String(announcements.length + rows.filter((r) => r.kind !== "share").length), sub: "announcements and notes" },
    { k: "Reached", v: String(reached.size), sub: "students" },
    // plain text, no mini chart (10 Oct 2026: "I dont like bar graphs")
    { k: "Read", v: `${pct}%`, sub: `${read} of ${sent} deliveries` },
    { k: "Replies", v: String(replies), sub: "from students" },
  ];
  return (
    <div className="msg-stats" role="group" aria-label="Outbox at a glance">
      {cells.map((c) => (
        <div key={c.k} className="msg-stat">
          <span className="msg-stat-k">{c.k}</span>
          <strong className="msg-stat-v">{c.v}</strong>
          <span className="msg-stat-sub">{c.sub}</span>
        </div>
      ))}
    </div>
  );
}

/** The one dropdown that picks what Sent shows, with each kind's count. */
function SentKindPicker({ kind, onKind, counts }: { kind: SentKind; onKind: (k: SentKind) => void; counts: Record<SentKind, number> }) {
  return <Listbox ariaLabel="What was sent" value={kind} onChange={(v) => onKind(v as SentKind)} options={SENT_KINDS.map((k) => ({ value: k.value, label: `${k.label} · ${counts[k.value]}` }))} className={LIST_FIELD} style={FIELD_STYLE} />;
}

/** One kind of sent item (not announcements): the list beside the open
 *  batch, its reach as three bars, and the next move. */
function SentPanel({ kind, onKind, counts, rows, onMessage, onNew }: { kind: Exclude<SentKind, "announcement">; onKind: (k: SentKind) => void; counts: Record<SentKind, number>; rows: SentRow[]; onMessage: (ids: string[]) => void; onNew: () => void }) {
  const shown = rows.filter((r) => r.kind === kind);
  const [openId, setOpenId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const current = shown.find((r) => r.id === openId) ?? shown[0];
  if (shown.length === 0) {
    // a whole panel with nothing yet: solid border, a heading, a muted
    // line and the action (COMPONENT_STATES_PLAYBOOK.md, tier 1)
    return (
      <div className="msg-card">
        <div className="msg-list-head"><div className="w-[260px] max-w-full"><SentKindPicker kind={kind} onKind={onKind} counts={counts} /></div></div>
        <div className="msg-empty-block">
          <p className="msg-empty-title">Nothing sent here yet</p>
          <p className="msg-empty-sub">{kind === "share" ? "Share a career or school from Explore and it lands here." : "Send one note to many students and its reach shows here."}</p>
          {kind !== "share" && <button type="button" onClick={onNew} className="msg-btn is-solid dm-solid bg-[var(--primary)] text-[var(--primary-foreground)]"><Plus className="h-4 w-4" aria-hidden />New message</button>}
        </div>
      </div>
    );
  }
  return (
    <div className="msg-shell is-sent" data-open={open ? "true" : undefined}>
      <div className="msg-list-col">
        <div className="msg-list-head"><SentKindPicker kind={kind} onKind={onKind} counts={counts} /></div>
        <ul className="msg-list dm-scroll">
          {shown.map((r) => {
            const reach = reachFor(r.id, r.studentIds, r.at);
            const pct = r.studentIds.length ? Math.round((reach.read.length / r.studentIds.length) * 100) : 0;
            return (
              <li key={`${r.kind}-${r.id}`} data-key={r.id}>
                <button type="button" onClick={() => { setOpenId(r.id); setOpen(true); }} aria-pressed={current?.id === r.id} className="msg-row dm-quiet">
                  {r.kind === "share" ? <span className="msg-kind-icon"><r.icon className="h-[16px] w-[16px]" aria-hidden /></span> : <ReadRing pct={pct} />}
                  <span className="msg-row-copy">
                    <span className="msg-row-top"><strong>{r.audience}</strong><span className="msg-row-grade">{r.studentIds.length > 1 ? `${r.studentIds.length} students` : r.label}</span><time>{shortDay(r.at)}</time></span>
                    <span className="msg-row-line"><WithTokens text={r.text} /></span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      <section className="msg-thread-col" aria-label={current?.label ?? "Sent"}>
        {current && <BatchReading key={current.id} r={current} onMessage={onMessage} onBack={() => setOpen(false)} />}
      </section>
    </div>
  );
}

/** One batch: what it said, who it reached, who read and replied. */
function BatchReading({ r, onMessage, onBack }: { r: SentRow; onMessage: (ids: string[]) => void; onBack: () => void }) {
  const roster = useReviewedRoster();
  const emailed = useEmailed();
  const [drill, setDrill] = useState<Drill | null>(null);
  const to = r.studentIds.map((id) => roster.find((s) => s.id === id)).filter((s): s is CounselorStudent => !!s);
  const reach = reachFor(r.id, r.studentIds, r.at);
  const readSet = new Set(reach.read), repliedSet = new Set(reach.replied);
  const unread = to.filter((s) => !readSet.has(s.id));
  const n = to.length || r.studentIds.length;
  const bars = [
    { k: "Sent", v: n, pct: 100 },
    { k: "Read", v: reach.read.length, pct: n ? Math.round((reach.read.length / n) * 100) : 0 },
    { k: "Replied", v: reach.replied.length, pct: n ? Math.round((reach.replied.length / n) * 100) : 0 },
  ];
  const whoDrill = (): Drill => ({
    title: r.label, subtitle: `${shortDay(r.at)} · ${r.audience}`, lead: r.text.replace(/\{first\}/g, "[first name]"),
    students: [...to.filter((s) => !readSet.has(s.id)).map((s) => ds(s, "Not read yet")), ...to.filter((s) => readSet.has(s.id) && !repliedSet.has(s.id)).map((s) => ds(s, "Read")), ...to.filter((s) => repliedSet.has(s.id)).map((s) => ds(s, "Replied"))],
    studentsLabel: `Sent to ${n} ${n === 1 ? "student" : "students"} · not read first`,
    action: r.open ? { label: r.openLabel ?? "Open", onClick: () => { setDrill(null); r.open?.(); } } : to.length ? { label: `Message ${to.length === 1 ? to[0].name.split(" ")[0] : `these ${to.length}`} again`, onClick: () => { setDrill(null); onMessage(to.map((s) => s.id)); } } : undefined,
  });
  return (
    <article className="msg-read dm-scroll">
      <header className="msg-read-head">
        <button type="button" onClick={onBack} className="msg-back dm-quiet"><ChevronLeft className="h-4 w-4" aria-hidden />Sent</button>
        <span className="msg-tags">
          <span className="msg-tag-pill"><r.icon className="h-[12px] w-[12px]" aria-hidden />{r.label}</span>
          {emailed.includes(r.id) && <span className="msg-tag-pill"><Mail className="h-[12px] w-[12px]" aria-hidden />Also emailed</span>}
          {r.due && <span className="msg-tag-pill">Due {shortDay(r.due)}</span>}
        </span>
        <span className="msg-read-to">To {r.audience} · {shortDay(r.at)}</span>
      </header>
      <div className="msg-line is-me msg-read-bubble"><p className="msg-bubble is-me"><WithTokens text={r.text} /></p></div>
      {r.kind !== "share" && (
        // Sent, Read, Replied as one ribbon that narrows as students drop
        // off (10 Oct 2026 glow pass; was three bars, "I dont like bar graphs")
        <ReachFunnel stages={bars} label={`Reach: ${bars.map((b) => `${b.k} ${b.v}`).join(", ")}`} />
      )}
      <footer className="msg-read-foot">
        <span className="msg-stack">{to.slice(0, 6).map((s) => <span key={s.id}><Avatar name={s.name} index={s.avatarIndex} size={28} /></span>)}</span>
        <span className="msg-read-stat"><strong>{n} {n === 1 ? "student" : "students"}</strong><small>{reach.read.length ? `${unread.length} have not read it` : "Reads show up here soon"}</small></span>
        {r.kind !== "share" && reach.read.length > 0 && unread.length > 0 && <button type="button" className="msg-nudge dm-quiet" onClick={() => onMessage(unread.map((s) => s.id))}><Send className="h-[14px] w-[14px]" aria-hidden />Nudge the {unread.length}</button>}
        {r.open && <button type="button" className="msg-nudge dm-quiet" onClick={() => r.open?.()}>{r.openLabel ?? "Open"}</button>}
        <button type="button" className="v4-text-action" onClick={() => setDrill(whoDrill())}>See who <Go /></button>
      </footer>
      {r.kind !== "share" && reach.read.length > 0 && <UnreadFaces students={unread} onMore={() => setDrill(whoDrill())} />}
      <DrillPanel drill={drill} onClose={() => setDrill(null)} />
    </article>
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
  const newMessage = () => { setTab("sent"); setCompose({ kind: "private", ids: [], n: Date.now() }); };
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
        <div className="msg-toolbar-end">
          {tab === "inbox" && session.cleared + remaining > 0 && <InboxBar cleared={session.cleared} remaining={remaining} />}
          {/* bulk sending (10 Oct 2026): one note to many, the page's primary
             action on both tabs; it opens on Sent, where sends are tracked */}
          {!(tab === "sent" && compose) && (
            <button type="button" onClick={newMessage} className="msg-new-btn dm-solid bg-[var(--primary)] text-[var(--primary-foreground)]">
              <Plus className="h-[15px] w-[15px]" aria-hidden />New message
            </button>
          )}
        </div>
      </div>

      {tab === "inbox" && <InboxPanel initialQuestion={questionParam} initialStudent={studentParam} initialDraft={draftParam} session={session} setSession={setSession} />}
      {tab === "sent" && (
        <div className="flex flex-col gap-[var(--space-4)]">
          {compose && <MessageComposer key={compose.n} initialKind={compose.kind} initialPathway={compose.n === 0 ? initialPathway : null} initialIds={compose.ids} onCancel={() => setCompose(null)} onSendAnnouncement={(a) => { addAnnouncement(a); setCompose(null); setSentKind("announcement"); openAnn(a.id); setPublished({ id: a.id, n: Date.now() }); playCorrect(); }} />}
          {!compose && <SentStats announcements={announcements} rows={sentRows} />}
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
            : <SentPanel key={sentKind} kind={sentKind} onKind={setSentKind} counts={sentCounts} rows={sentRows} onMessage={message} onNew={newMessage} />)}
        </div>
      )}
      <DrillPanel drill={drill} onClose={() => setDrill(null)} />
    </div>
  );
}
