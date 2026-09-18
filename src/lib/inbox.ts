// The inbox: one small store the top nav and the mentorship chat share.
// The chat dock's state (closed, open, minimised, full screen), its unread
// count, whether the student is inside a mentorship program right now
// (the Messages icon only exists there: mentorship is a college thing),
// and a decision taken on a meeting from a notification that the chat
// thread applies when it mounts. Same useSyncExternalStore shape as picks.

import { useSyncExternalStore } from "react";

export type DockState = "closed" | "open" | "min" | "full";
export type MeetingDecision = "accepted" | "declined";

export type Inbox = {
  dock: DockState;
  unread: number;
  /** true while the Mentorship tab is on screen (mentorship notifications) */
  mentorship: boolean;
  /** true while inside a mentorship program (the Messages icon and dock) */
  program: boolean;
  /** a decision taken from a notification, waiting for the thread to apply */
  meetingDecision: MeetingDecision | null;
  /** notification ids the student has opened */
  read: string[];
  /** notification ids resolved by an inline action, with the outcome */
  resolved: Record<string, string>;
};

// unread starts at 1: the mentor's latest message is waiting when the demo opens
const EMPTY: Inbox = { dock: "closed", unread: 1, mentorship: false, program: false, meetingDecision: null, read: [], resolved: {} };
let state: Inbox = EMPTY;
const listeners = new Set<() => void>();

function set(patch: Partial<Inbox>): void {
  state = { ...state, ...patch };
  for (const l of listeners) l();
}

export function inboxSnapshot(): Inbox { return state; }
export function serverInboxSnapshot(): Inbox { return EMPTY; }
export function subscribeInbox(listener: () => void): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
export function useInbox(): Inbox {
  return useSyncExternalStore(subscribeInbox, inboxSnapshot, serverInboxSnapshot);
}

export function setDock(dock: DockState): void { set({ dock }); }
export function openDock(): void { set({ dock: state.dock === "full" ? "full" : "open" }); }
export function setUnreadMessages(unread: number): void { if (unread !== state.unread) set({ unread }); }
export function setMentorshipContext(on: boolean): void { if (on !== state.mentorship) set({ mentorship: on }); }
export function setProgramContext(on: boolean): void { if (on !== state.program) set({ program: on }); }
export function decideMeeting(decision: MeetingDecision): void { set({ meetingDecision: decision }); }
export function clearMeetingDecision(): void { if (state.meetingDecision) set({ meetingDecision: null }); }
export function markNotificationRead(id: string): void { if (!state.read.includes(id)) set({ read: [...state.read, id] }); }
export function resolveNotification(id: string, outcome: string): void { set({ resolved: { ...state.resolved, [id]: outcome }, read: state.read.includes(id) ? state.read : [...state.read, id] }); }
