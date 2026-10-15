"use client";

// What the United Way boards remember while the app is open (15 Oct 2026).
//
// - The POV ("Viewing as": Student, Volunteer, United Way Team), saved in
//   localStorage under dreamari:uw-pov so a demo opens where it was left.
//   Maisha's review: "For demo purposes, we should be able to switch
//   between these POVs to demonstrate the different experiences." The
//   board and its event boards read the same value.
// - Reactions and reply likes: one reaction per person per post, the
//   LinkedIn rule.
// - What was posted in this session: questions, student posts, volunteer
//   posts, replies, Team messages. DEMO-ONLY: in memory, so a reload
//   starts from the seeded board; the real ones come from the server.

import { useSyncExternalStore } from "react";
import type { ReactionKind, UwItem, UwReply } from "./uwCommunity";
import type { UwPov } from "./uwData";

const POV_KEY = "dreamari:uw-pov";
// The board opened on United Way's own staff view until now (12 Oct 2026,
// Chandu: "Make that the first POV, then students"), so a first visit
// still lands there.
const DEFAULT_POV: UwPov = "team";

export type TeamMessage = { id: string; body: string; postedAgo: string };
type State = {
  pov: UwPov | null;
  reactions: Record<string, ReactionKind | undefined>;
  liked: Record<string, boolean>;
  items: UwItem[];
  replies: Record<string, UwReply[]>;
  /** nested replies added here, by the parent reply's id */
  nested: Record<string, UwReply[]>;
  /** Team messages and thread replies added here, by channel, DM or message id */
  team: Record<string, TeamMessage[]>;
};
const EMPTY: State = { pov: null, reactions: {}, liked: {}, items: [], replies: {}, nested: {}, team: {} };
let state: State = EMPTY;
const subs = new Set<() => void>();
const set = (next: Partial<State>) => { state = { ...state, ...next }; subs.forEach((f) => f()); };
const subscribe = (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; };

function readPov(): UwPov {
  if (state.pov) return state.pov;
  try {
    const v = window.localStorage.getItem(POV_KEY);
    if (v === "student" || v === "volunteer" || v === "team") return v;
  } catch { /* private mode: the default */ }
  return DEFAULT_POV;
}

export function useUwPov(): [UwPov, (p: UwPov) => void] {
  const pov = useSyncExternalStore(subscribe, readPov, () => DEFAULT_POV);
  return [pov, setUwPov];
}
export function setUwPov(pov: UwPov) {
  try { window.localStorage.setItem(POV_KEY, pov); } catch { /* still switches for this visit */ }
  set({ pov });
}

const snapshot = () => state;
export function useUwStore(): State {
  return useSyncExternalStore(subscribe, snapshot, () => EMPTY);
}

export function react(id: string, kind: ReactionKind | undefined) {
  set({ reactions: { ...state.reactions, [id]: kind } });
}
export function toggleLike(id: string) {
  set({ liked: { ...state.liked, [id]: !state.liked[id] } });
}
export function addItem(item: UwItem) {
  set({ items: [item, ...state.items] });
}
export function addReply(itemId: string, reply: UwReply, parentId?: string) {
  if (parentId) set({ nested: { ...state.nested, [parentId]: [...(state.nested[parentId] ?? []), reply] } });
  else set({ replies: { ...state.replies, [itemId]: [...(state.replies[itemId] ?? []), reply] } });
}
export function addTeamMessage(key: string, body: string) {
  const id = `uw-team-${Date.now()}`;
  set({ team: { ...state.team, [key]: [...(state.team[key] ?? []), { id, body, postedAgo: "Just now" }] } });
}

/** A question started somewhere else (the Mentorship tab's "Ask the United
 *  Way Team"), waiting for its board to open the composer with it. */
export type PendingAsk = { boardId: string; programId?: string; text: string };
let pendingAsk: PendingAsk | null = null;
export function setPendingAsk(p: PendingAsk) { pendingAsk = p; }
/** Takes the waiting question for this board, once. */
export function takePendingAsk(boardId: string): PendingAsk | null {
  if (!pendingAsk || pendingAsk.boardId !== boardId) return null;
  const p = pendingAsk;
  pendingAsk = null;
  return p;
}
