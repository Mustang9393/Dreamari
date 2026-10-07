// What the counselor does in v4 Counselor Connect, kept (8 Oct 2026 audit:
// replies, Mark resolved, new announcements, new groups and group posts all
// lived in component state and were gone on reload, so My Impact could not
// count them either). One record per kind. The seeded questions,
// announcements and groups stay in CounselorConnect.tsx; this holds only
// what changed. DEMO-ONLY: browser-local until Connect has a backend.

import { createLocalRecord } from "./localRecord";

export type QuestionState = { status: "new" | "viewed" | "in-progress" | "responded" | "resolved" | "follow-up"; reply?: string; at: string };
export type StoredAnnouncement = { id: string; title: string; to: string; read: number; body: string; tags: string[] };
export type StoredGroup = { name: string; desc: string; members: number; posts: number; last: string; memberIds: string[] };
export type GroupPost = { id: string; author: string; text: string; at: string };

const questions = createLocalRecord<Record<string, QuestionState>>("dreamari-counselor-connect-questions", {});
const announcements = createLocalRecord<StoredAnnouncement[]>("dreamari-counselor-connect-announcements", []);
const groups = createLocalRecord<StoredGroup[]>("dreamari-counselor-connect-groups", []);
const posts = createLocalRecord<Record<string, GroupPost[]>>("dreamari-counselor-connect-posts", {});

export const useQuestionStates = () => questions.useValue();
export const useAddedAnnouncements = () => announcements.useValue();
export const useAddedGroups = () => groups.useValue();
export const useGroupPosts = () => posts.useValue();

export function setQuestionState(id: string, status: QuestionState["status"], reply?: string): void {
  questions.update((all) => ({ ...all, [id]: { status, reply: reply ?? all[id]?.reply, at: new Date().toISOString() } }));
}

export function addAnnouncement(a: StoredAnnouncement): void {
  announcements.update((list) => [a, ...list].slice(0, 100));
}

export function addGroup(g: StoredGroup): void {
  groups.update((list) => [g, ...list.filter((x) => x.name !== g.name)].slice(0, 50));
}

/** The counselor's own posts in a group, newest first. */
export function addGroupPost(group: string, text: string): void {
  const post: GroupPost = { id: `me-${Date.now().toString(36)}`, author: "Me", text, at: new Date().toISOString().slice(0, 10) };
  posts.update((all) => ({ ...all, [group]: [post, ...(all[group] ?? [])].slice(0, 100) }));
}
