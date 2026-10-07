// The counselor's side of Messages (8 Oct 2026 audit: "replies live only in
// component state; there is no messages store"). Two things are kept:
// replies to the students' questions (v4's QUESTIONS), keyed by question
// id, and threads the counselor starts with one student (Message from the
// student page or a brief, a FAFSA reminder). Because the reply is stored,
// "waiting on you" stops listing an answered question and My Impact counts
// it. DEMO-ONLY: kept in this browser until messages go through the
// messaging backend; the shape (one reply per question, one thread per
// student) is the product's.

import { createLocalRecord } from "./localRecord";

export type SentMessage = { text: string; at: string };
export type Thread = { studentId: string; name: string; messages: SentMessage[] };
type State = { replies: Record<string, SentMessage>; threads: Thread[] };

const store = createLocalRecord<State>("dreamari-counselor-messages", { replies: {}, threads: [] });

export function useMessages(): State {
  return store.useValue();
}

export function readMessages(): State {
  return store.read();
}

export function replyTo(questionId: string, text: string): void {
  store.update((s) => ({ ...s, replies: { ...s.replies, [questionId]: { text, at: new Date().toISOString() } } }));
}

export function undoReply(questionId: string): void {
  store.update((s) => {
    const replies = { ...s.replies };
    delete replies[questionId];
    return { ...s, replies };
  });
}

/** Add a message to the student's thread, starting it if needed. */
export function sendToStudent(studentId: string, name: string, text: string): void {
  const msg = { text, at: new Date().toISOString() };
  store.update((s) => {
    const has = s.threads.some((t) => t.studentId === studentId);
    const threads = has ? s.threads.map((t) => (t.studentId === studentId ? { ...t, messages: [...t.messages, msg] } : t)) : [{ studentId, name, messages: [msg] }, ...s.threads];
    return { ...s, threads };
  });
}

/** Take back the last message in a thread; an empty thread goes away. */
export function undoLastMessage(studentId: string): void {
  store.update((s) => ({
    ...s,
    threads: s.threads.map((t) => (t.studentId === studentId ? { ...t, messages: t.messages.slice(0, -1) } : t)).filter((t) => t.messages.length > 0),
  }));
}

// Ready-made first drafts a link can ask for with &draft=<key>. Student
// facing, so 8th-grade wording: short words, one idea per sentence.
const DRAFTS: Record<string, (first: string) => string> = {
  fafsa: (first) => `Hi ${first}, this is a reminder to file your FAFSA. It can help you pay for college. It takes about an hour. Come see me if you want help with it.`,
};

export function draftFor(key: string | null | undefined, first: string): string {
  return key && DRAFTS[key] ? DRAFTS[key](first) : "";
}
