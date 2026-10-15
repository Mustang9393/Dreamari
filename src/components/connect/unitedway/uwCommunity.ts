// The United Way board's three communities as one model (15 Oct 2026).
//
// WHY: Maisha's review asked for "three distinct experiences" instead of
// "mixing everyone's content into one feed": a Student Community (questions
// and posts by students), Volunteer Posts (labelled Insight, Opportunity or
// Event Update) and a private United Way Team space. The seeded content
// stays in the shapes the rest of Connect reads (Thread and Insight in
// uwThreads.ts), so this file turns it into the board's own items: who
// wrote it (a student, a volunteer or United Way staff), who it is for
// (a question's To: Volunteers or To: United Way Team), its reactions and
// its replies in LinkedIn's shape (Maisha: "Keep replies and discussions
// simple and familiar, similar to LinkedIn"), one level deep.
//
// Who sees what is decided here too (visibleTo), so the board and the
// event boards can never disagree:
// - students see every student question and post, and volunteers' posts;
// - volunteers see student posts and only the questions sent to them;
// - United Way Team sees everything.

import { EVENT_THREADS, INSIGHTS, THREADS, type Insight, type Thread } from "../data";
import type { StaffMember, UwBoard, UwPov } from "./uwData";
import { UW_STAFF_ANSWERS, UW_STUDENT_POSTS, type UwStudentPostSeed } from "./uwThreads";

// The reaction kinds, labels and the seeded split are shared with the
// rest of Connect (../reactions.tsx) since 15 Oct 2026; re-exported here
// so the United Way files keep their imports.
import { seedReactions, type ReactionKind } from "../reactions";
export { REACTION_KINDS, REACTION_LABEL, reactionTotal, seedReactions, type ReactionKind } from "../reactions";

export type UwPerson =
  | { kind: "student"; name: string; grade?: string; place?: string }
  | { kind: "volunteer"; proId: string }
  | { kind: "staff"; name: string; role: string; office: string; photo?: string };
export type UwReply = { id: string; who: UwPerson; body: string; postedAgo: string; likes: number; replies: UwReply[] };
export type UwTo = "volunteers" | "team";
export type UwLabel = "insight" | "opportunity" | "event";
export const LABEL_TEXT: Record<UwLabel, string> = { insight: "Insight", opportunity: "Opportunity", event: "Event Update" };
export const TO_TEXT: Record<UwTo, string> = { volunteers: "To: Volunteers", team: "To: United Way Team" };

type Base = { id: string; boardId: string; who: UwPerson; place?: string; postedAgo: string; at: number; reactions: Record<ReactionKind, number>; replies: UwReply[]; eventId?: string };
export type UwQuestion = Base & { kind: "question"; title: string; context?: string; to: UwTo; /** a program's page lists the questions asked about it: by id when asked there, else by the program's name as the seeded topic */ programId?: string; scope?: string };
export type UwStudentPost = Base & { kind: "student-post"; body: string };
export type UwVolunteerPost = Base & { kind: "volunteer-post"; label: UwLabel; title: string; body: string };
export type UwItem = UwQuestion | UwStudentPost | UwVolunteerPost;

/** Minutes ago, for one newest-first list ("Just now" is 0). */
export const agoMinutes = (ago: string) => { const m = /(\d+)\s*([mhdw])/.exec(ago); return m ? Number(m[1]) * ({ m: 1, h: 60, d: 1440, w: 10080 } as const)[m[2] as "m" | "h" | "d" | "w"] : 0; };

const hash = (s: string) => { let h = 0; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) | 0; return Math.abs(h); };

export const countReplies = (list: UwReply[]): number => list.reduce((n, r) => n + 1 + countReplies(r.replies), 0);

/** Every United Way staff member on a board, by first name. */
export function boardStaff(board: UwBoard): StaffMember[] {
  const seen = new Map<string, StaffMember>();
  const add = (m: StaffMember) => { if (!seen.has(m.name)) seen.set(m.name, m); };
  add(board.staff.me);
  for (const p of board.staff.posts) { add(p.author); p.replies.forEach((r) => add(r.author)); }
  return [...seen.values()];
}
const staffPerson = (board: UwBoard, name: string): UwPerson => {
  const m = boardStaff(board).find((x) => x.name === name);
  return { kind: "staff", name, role: m?.role ?? "United Way", office: m?.office ?? board.org, photo: m?.photo };
};

/** A Connect thread as a board question: answers and comments become
 *  replies; a follow-up from the asker, and the answer to it, nest under
 *  the answer they follow. A Team question is answered by United Way. */
export function toQuestion(t: Thread, board: UwBoard): UwQuestion {
  const to: UwTo = t.to ?? "volunteers";
  const asker: UwPerson = { kind: "student", name: t.handle, grade: t.grade, place: t.place };
  const replies: UwReply[] = [];
  const staff = to === "team" ? (UW_STAFF_ANSWERS[t.id] ?? []) : [];
  staff.forEach(([name, body, ago], i) => replies.push({ id: `${t.id}-s${i}`, who: staffPerson(board, name), body, postedAgo: ago, likes: 4 + (hash(t.id + i) % 9), replies: [] }));
  let nestUnder: UwReply | undefined;
  t.responses.forEach((r, i) => {
    const id = `${t.id}-r${i}`;
    if (r.kind === "answer") {
      if (to === "team") return;
      const reply: UwReply = { id, who: { kind: "volunteer", proId: r.proId }, body: r.body, postedAgo: r.postedAgo, likes: 3 + (hash(id) % 14), replies: [] };
      if (nestUnder) { nestUnder.replies.push(reply); nestUnder = undefined; } else replies.push(reply);
    } else if (r.kind === "followup") {
      const parent = [...replies].reverse().find((x) => x.who.kind !== "student");
      const reply: UwReply = { id, who: asker, body: r.body, postedAgo: r.postedAgo, likes: 2, replies: [] };
      if (parent) { parent.replies.push(reply); nestUnder = parent; } else replies.push(reply);
    } else {
      replies.push({ id, who: { kind: "student", name: r.handle, grade: r.grade, place: r.place }, body: r.body, postedAgo: r.postedAgo, likes: r.likes ?? 0, replies: [] });
      nestUnder = undefined;
    }
  });
  return { kind: "question", id: t.id, boardId: t.boardId, who: asker, place: t.place, postedAgo: t.postedAgo, at: agoMinutes(t.postedAgo), title: t.title, context: t.context, scope: t.routedScope, to, reactions: seedReactions(t.id, t.helpful), replies };
}

/** A volunteer's post: a reply by the post's own author right after
 *  someone else's reply answers that reply, so it nests under it. */
export function toVolunteerPost(i: Insight): UwVolunteerPost {
  const replies: UwReply[] = [];
  i.replies.forEach((r, n) => {
    const id = `${i.id}-r${n}`;
    const who: UwPerson = r.proId ? { kind: "volunteer", proId: r.proId } : { kind: "student", name: r.handle ?? "Student", grade: r.grade, place: r.place };
    const reply: UwReply = { id, who, body: r.body, postedAgo: r.postedAgo, likes: r.likes, replies: [] };
    const last = replies[replies.length - 1];
    if (r.proId === i.proId && last && !(last.who.kind === "volunteer" && last.who.proId === i.proId)) last.replies.push(reply);
    else replies.push(reply);
  });
  return { kind: "volunteer-post", id: i.id, boardId: i.boardId, who: { kind: "volunteer", proId: i.proId }, place: i.place, postedAgo: i.postedAgo, at: agoMinutes(i.postedAgo), label: i.label ?? "insight", title: i.title, body: i.body, eventId: i.eventId, reactions: seedReactions(i.id, i.helpful), replies };
}

function personFrom(code: string, board: UwBoard): UwPerson {
  const [kind, a, b, c] = code.split(":");
  if (kind === "pro") return { kind: "volunteer", proId: a };
  if (kind === "staff") return staffPerson(board, a);
  return { kind: "student", name: a, grade: b, place: c };
}
export function toStudentPost(p: UwStudentPostSeed, board: UwBoard): UwStudentPost {
  return {
    kind: "student-post", id: p.id, boardId: p.boardId, who: { kind: "student", name: p.handle, grade: p.grade, place: p.place }, place: p.place,
    postedAgo: p.postedAgo, at: agoMinutes(p.postedAgo), body: p.body, reactions: seedReactions(p.id, p.likes),
    replies: p.replies.map(([who, body, ago, likes], n) => ({ id: `${p.id}-r${n}`, who: personFrom(who, board), body, postedAgo: ago, likes, replies: [] })),
  };
}

/** Everything seeded on a board (its events' questions live on the event
 *  boards, not here). */
export function seededItems(board: UwBoard): UwItem[] {
  return [
    ...THREADS.filter((t) => t.boardId === board.id).map((t) => toQuestion(t, board)),
    ...UW_STUDENT_POSTS.filter((p) => p.boardId === board.id).map((p) => toStudentPost(p, board)),
    ...INSIGHTS.filter((i) => i.boardId === board.id).map(toVolunteerPost),
  ];
}
/** An event board's questions. */
export function eventQuestions(eventId: string, board: UwBoard): UwQuestion[] {
  return EVENT_THREADS.filter((t) => t.boardId === eventId).map((t) => toQuestion(t, board));
}

/** Who may see an item (the visibility rules in one place). */
export function visibleTo(item: UwItem, pov: UwPov): boolean {
  if (pov === "volunteer" && item.kind === "question") return item.to === "volunteers";
  return true;
}
/** Who may reply. Students comment on volunteers' posts too (react and
 *  reply in public; posting there is the volunteers'). */
export function canReply(item: UwItem, pov: UwPov): boolean {
  return visibleTo(item, pov);
}
