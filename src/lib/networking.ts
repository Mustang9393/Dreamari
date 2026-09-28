"use client";

// College networking: 1:1 message requests between a college student and a
// professional volunteer (Harvard team feedback via Joshua, 28 Sept 2026).
// Why this exists: on LinkedIn, students cold-message people who never
// signed up to help; Dreamari's volunteers DID sign up, so a request can be
// structured (Follow first, one request, student context attached) and
// bounded (a weekly allowance) instead of an open inbox. Flow: Follow ->
// prepare a request in Dreamari -> send ONE -> the volunteer Accepts or
// Declines -> a conversation opens.
//
// Same idiom as every other src/lib store (picks.ts, resume.ts): one
// localStorage key, read through useSyncExternalStore so a change in one
// component (Accept, on the pro's dashboard) is visible in another (the
// waiting state, on the student's profile view) without a page reload --
// true in the demo because both "sides" share this one browser.
//
// This is the prototype's whole backend for the feature: everything here is
// scoped to one student/volunteer pair per browser, same limitation already
// called out for every other src/lib store in docs/HANDOFF_INDEX.md.

import { useSyncExternalStore } from "react";
import { readLiveSignals } from "./studentSignals";
import { progressSnapshot } from "@/components/play/progress";
import { glossaryProgressSnapshot } from "@/components/glossary/progress";
import { SIMULATIONS, GLOSSARY_GAMES } from "@/components/play/games";
import { PROS, COMMUNITIES } from "@/components/connect/data";
import type { Notification } from "@/components/app/notificationsData";
import { useInbox } from "./inbox";

const KEY = "dreamari-networking";

// The live student's own Connect identity (same handle/year used everywhere
// else in Connect -- ConnectExperience.tsx, data.ts -- for the one student
// this prototype has a real account for).
export const NETWORK_STUDENT_NAME = "Jordan";
export const NETWORK_STUDENT_YEAR = "Junior";

export type MessagingSetting = "open" | "paused" | "public-only";
export type RequestStatus = "pending" | "accepted" | "declined";

export type NetworkingMessage = {
  from: "student" | "pro";
  text: string;
  at: number;
};

export type NetworkingRequest = {
  id: string;
  proId: string;
  studentName: string;
  /** college year, so a volunteer sees who is asking, not a random handle */
  studentYear: string;
  careerInterest: string;
  /** "Finished Investment Banking simulation, level 3" -- one line of real
   *  Dreamari activity, so a request reads as more than a cold DM. */
  activity: string;
  /** the student's one allowed message, sent with the request */
  message: string;
  status: RequestStatus;
  createdAt: number;
  respondedAt?: number;
  messages: NetworkingMessage[];
  /** DEMO-ONLY: seeded so the pro dashboard has something to show on first load */
  demo?: boolean;
};

type AllowanceRecord = { weekKey: string; used: number };

type Store = {
  requests: NetworkingRequest[];
  settings: Record<string, MessagingSetting>;
  allowance: AllowanceRecord;
};

function weekKey(d: Date = new Date()): string {
  // Monday-start week, keyed by that Monday's date -- simple and stable
  // enough for a demo allowance reset; no ISO week-number library needed.
  const date = new Date(d);
  const day = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - day);
  date.setHours(0, 0, 0, 0);
  return date.toISOString().slice(0, 10);
}

// ---- DEMO-ONLY seed: a few realistic incoming requests -------------------
// So the pro dashboard's "Incoming requests" has something real to show on
// first load, instead of an empty state every time. Seeded against
// pro-okafor (Investment Banking), the default ProDashboardView pro and one
// of the two playable simulations, so "Finished Investment Banking
// simulation, level 3" is a real, reachable piece of activity, not invented.
function seedRequests(): NetworkingRequest[] {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  return [
    {
      id: "seed-req-1",
      proId: "pro-okafor",
      studentName: "Maya Sinclair",
      studentYear: "Sophomore",
      careerInterest: "Investment Banking",
      activity: "Finished Investment Banking simulation, level 3",
      message: "Hi Amara, I loved the analyst level of the sim. I'm trying to figure out if I should aim for a bulge bracket or a boutique bank first -- would love your take when you have a minute.",
      status: "pending",
      createdAt: now - 2 * day,
      messages: [{ from: "student", text: "Hi Amara, I loved the analyst level of the sim. I'm trying to figure out if I should aim for a bulge bracket or a boutique bank first -- would love your take when you have a minute.", at: now - 2 * day }],
      demo: true,
    },
    {
      id: "seed-req-2",
      proId: "pro-okafor",
      studentName: "Diego Fields",
      studentYear: "Freshman",
      careerInterest: "Investment Banking",
      activity: "Completed 5 Finance Terms glossary levels",
      message: "Hi Amara, I'm a first-gen student aiming for finance and just finished the finance vocabulary lessons. What's one thing you wish you'd known before your first internship application?",
      status: "pending",
      createdAt: now - 1 * day,
      messages: [{ from: "student", text: "Hi Amara, I'm a first-gen student aiming for finance and just finished the finance vocabulary lessons. What's one thing you wish you'd known before your first internship application?", at: now - 1 * day }],
      demo: true,
    },
    {
      id: "seed-req-3",
      proId: "pro-okafor",
      studentName: "Priya Anand",
      studentYear: "Junior",
      careerInterest: "Investment Banking",
      activity: "Finished Investment Banking simulation, level 5",
      message: "Hi Amara, I made it to the VP level in the simulation and I'm hooked. I'd love 15 minutes on how you chose your group (M&A vs. coverage) as a new analyst.",
      status: "accepted",
      createdAt: now - 6 * day,
      respondedAt: now - 5 * day,
      messages: [
        { from: "student", text: "Hi Amara, I made it to the VP level in the simulation and I'm hooked. I'd love 15 minutes on how you chose your group (M&A vs. coverage) as a new analyst.", at: now - 6 * day },
        { from: "pro", text: "Happy to help, Priya! Honestly, I picked coverage because I liked staying close to one industry. Happy to walk through how staffing actually works if that's useful.", at: now - 5 * day },
      ],
      demo: true,
    },
  ];
}

const EMPTY: Store = { requests: [], settings: {}, allowance: { weekKey: weekKey(), used: 0 } };

function isMessage(v: unknown): v is NetworkingMessage {
  if (!v || typeof v !== "object") return false;
  const m = v as Partial<NetworkingMessage>;
  return (m.from === "student" || m.from === "pro") && typeof m.text === "string" && typeof m.at === "number";
}

function isRequest(v: unknown): v is NetworkingRequest {
  if (!v || typeof v !== "object") return false;
  const r = v as Partial<NetworkingRequest>;
  return (
    typeof r.id === "string" &&
    typeof r.proId === "string" &&
    typeof r.studentName === "string" &&
    typeof r.studentYear === "string" &&
    typeof r.careerInterest === "string" &&
    typeof r.activity === "string" &&
    typeof r.message === "string" &&
    (r.status === "pending" || r.status === "accepted" || r.status === "declined") &&
    typeof r.createdAt === "number" &&
    Array.isArray(r.messages) &&
    r.messages.every(isMessage)
  );
}

function parse(raw: string | null): Store {
  if (!raw) return { ...EMPTY, requests: seedRequests() };
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") return { ...EMPTY, requests: seedRequests() };
    const v = value as Record<string, unknown>;
    const requests = Array.isArray(v.requests) ? v.requests.filter(isRequest) : [];
    const settingsRaw = (v.settings && typeof v.settings === "object" ? v.settings : {}) as Record<string, unknown>;
    const settings: Record<string, MessagingSetting> = {};
    for (const [proId, setting] of Object.entries(settingsRaw)) {
      if (setting === "open" || setting === "paused" || setting === "public-only") settings[proId] = setting;
    }
    const allowanceRaw = v.allowance as Partial<AllowanceRecord> | undefined;
    const currentWeek = weekKey();
    const allowance: AllowanceRecord = allowanceRaw && typeof allowanceRaw.weekKey === "string" && allowanceRaw.weekKey === currentWeek && typeof allowanceRaw.used === "number" ? { weekKey: currentWeek, used: allowanceRaw.used } : { weekKey: currentWeek, used: 0 };
    return { requests, settings, allowance };
  } catch {
    return { ...EMPTY, requests: seedRequests() };
  }
}

let cachedRaw: string | null | undefined;
let cached: Store = EMPTY;
const listeners = new Set<() => void>();

function snapshot(): Store {
  if (typeof window === "undefined") return EMPTY;
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    return EMPTY;
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cached = parse(raw);
    // First read ever (no key yet): persist the demo seed so it is stable
    // across reloads instead of re-randomizing (it isn't random, but this
    // keeps the "first load" branch from re-running parse() every time).
    if (raw === null) {
      try { window.localStorage.setItem(KEY, JSON.stringify(cached)); } catch { /* ignore */ }
      cachedRaw = window.localStorage.getItem(KEY);
    }
  }
  return cached;
}

function serverSnapshot(): Store {
  return EMPTY;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => { if (event.key === null || event.key === KEY) listener(); };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

function commit(next: Store): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Private browsing or a full quota: the round still works, it just
    // will not persist -- same tolerance every other store in this app has.
  }
  for (const listener of listeners) listener();
}

export function useNetworkingStore(): Store {
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}

// ---- weekly allowance ------------------------------------------------------

export const BASE_WEEKLY_REQUESTS = 3;
export const MAX_EXTRA_REQUESTS = 4;
export const HARD_CAP_WEEKLY_REQUESTS = 7; // 3 base + 4 extra, never higher

export type Allowance = {
  base: number;
  earnedExtra: number;
  total: number;
  used: number;
  remaining: number;
};

/** Earned extras come from real Dreamari activity already tracked in
 *  studentSignals.ts: every 3 completed simulation levels or 5 completed
 *  glossary levels earns one extra request, capped at 4 extra (hard cap 7
 *  total). Reusing readLiveSignals() here rather than re-parsing
 *  dreamari-play-progress / dreamari-glossary-progress a second time. */
export function readAllowance(store: Store = snapshot()): Allowance {
  const sig = typeof window === "undefined" ? null : readLiveSignals();
  const fromSimulations = sig ? Math.floor(sig.simulationsCompleted / 3) : 0;
  const fromGlossary = sig ? Math.floor(sig.glossaryLessonsCompleted / 5) : 0;
  const earnedExtra = Math.min(MAX_EXTRA_REQUESTS, fromSimulations + fromGlossary);
  const total = Math.min(HARD_CAP_WEEKLY_REQUESTS, BASE_WEEKLY_REQUESTS + earnedExtra);
  const used = store.allowance.weekKey === weekKey() ? store.allowance.used : 0;
  return { base: BASE_WEEKLY_REQUESTS, earnedExtra, total, used, remaining: Math.max(0, total - used) };
}

// ---- messaging setting (pro side) -----------------------------------------

export function readMessagingSetting(proId: string, store: Store = snapshot()): MessagingSetting {
  return store.settings[proId] ?? "open";
}

export function setMessagingSetting(proId: string, setting: MessagingSetting): void {
  const store = snapshot();
  commit({ ...store, settings: { ...store.settings, [proId]: setting } });
}

// ---- requests --------------------------------------------------------------

export function requestFor(proId: string, store: Store = snapshot()): NetworkingRequest | null {
  // one active thread per pro: the newest request against that pro (a
  // decline can be followed by a fresh one later, so newest wins)
  const mine = store.requests.filter((r) => r.proId === proId && r.studentName === NETWORK_STUDENT_NAME);
  return mine.length ? mine.reduce((a, b) => (b.createdAt > a.createdAt ? b : a)) : null;
}

export function requestsForPro(proId: string, store: Store = snapshot()): NetworkingRequest[] {
  return store.requests.filter((r) => r.proId === proId).sort((a, b) => b.createdAt - a.createdAt);
}

export type SendResult = { ok: true; request: NetworkingRequest } | { ok: false; reason: "no-allowance" | "already-pending" };

/** Sends the student's one message request. Refuses a second request while
 *  one is already pending against this pro, and refuses past the weekly
 *  allowance -- both enforced here, not just in the UI, so nothing can
 *  route around the rule from another entry point later. */
export function sendRequest(input: { proId: string; careerInterest: string; activity: string; message: string; studentYear?: string }): SendResult {
  const store = snapshot();
  const existing = requestFor(input.proId, store);
  if (existing && existing.status === "pending") return { ok: false, reason: "already-pending" };
  const allowance = readAllowance(store);
  if (allowance.remaining <= 0) return { ok: false, reason: "no-allowance" };
  const now = Date.now();
  const request: NetworkingRequest = {
    id: `req-${now}-${Math.random().toString(36).slice(2, 8)}`,
    proId: input.proId,
    studentName: NETWORK_STUDENT_NAME,
    studentYear: input.studentYear ?? NETWORK_STUDENT_YEAR,
    careerInterest: input.careerInterest,
    activity: input.activity,
    message: input.message.trim(),
    status: "pending",
    createdAt: now,
    messages: [{ from: "student", text: input.message.trim(), at: now }],
  };
  const currentWeek = weekKey();
  commit({
    ...store,
    requests: [...store.requests, request],
    allowance: { weekKey: currentWeek, used: (store.allowance.weekKey === currentWeek ? store.allowance.used : 0) + 1 },
  });
  return { ok: true, request };
}

export function acceptRequest(id: string): void {
  const store = snapshot();
  commit({ ...store, requests: store.requests.map((r) => (r.id === id ? { ...r, status: "accepted", respondedAt: Date.now() } : r)) });
}

export function declineRequest(id: string): void {
  const store = snapshot();
  commit({ ...store, requests: store.requests.map((r) => (r.id === id ? { ...r, status: "declined", respondedAt: Date.now() } : r)) });
}

/** Withdrawing a still-pending request removes it entirely and returns the
 *  weekly slot it used (it was never accepted, so it shouldn't count against
 *  the allowance) -- letting the student send a new one whenever they're
 *  ready. Only refunds the slot if the request was sent in the CURRENT
 *  allowance week; one sent in an earlier week already rolled off that
 *  week's own count, so there is nothing to give back here. */
export function withdrawRequest(id: string): void {
  const store = snapshot();
  const request = store.requests.find((r) => r.id === id);
  if (!request || request.status !== "pending") return;
  const currentWeek = weekKey();
  const refund = store.allowance.weekKey === currentWeek && weekKey(new Date(request.createdAt)) === currentWeek;
  commit({
    ...store,
    requests: store.requests.filter((r) => r.id !== id),
    allowance: refund ? { weekKey: currentWeek, used: Math.max(0, store.allowance.used - 1) } : store.allowance,
  });
}

/** The one real line of Dreamari activity that goes out with a request, so
 *  a volunteer sees a student who did something, not a random handle (spec
 *  example: "Finished Investment Banking simulation, level 3"). Prefers the
 *  most recently completed simulation level (has a real timestamp); falls
 *  back to the career with the most completed glossary levels; falls back
 *  to a plain, honest line rather than inventing activity that didn't
 *  happen. */
export function describeRecentActivity(): string {
  if (typeof window === "undefined") return "New to Dreamari's simulations and glossary games";
  const runs = Object.values(progressSnapshot()).filter((r) => r.scored >= 10);
  if (runs.length) {
    const latest = runs.reduce((a, b) => (b.at > a.at ? b : a));
    const title = SIMULATIONS.find((s) => s.id === latest.gameId)?.title ?? latest.gameId;
    return `Finished ${title} simulation, level ${latest.level}`;
  }
  const glossary = glossaryProgressSnapshot();
  const byCareer = Object.entries(glossary).map(([slug, save]) => ({ slug, n: Object.values(save.lessons).filter((l) => l.completed).length })).filter((c) => c.n > 0);
  if (byCareer.length) {
    const top = byCareer.reduce((a, b) => (b.n > a.n ? b : a));
    const title = GLOSSARY_GAMES.find((g) => g.careerSlug === top.slug)?.title ?? "career";
    return `Completed ${top.n} ${title} glossary level${top.n === 1 ? "" : "s"}`;
  }
  return "New to Dreamari's simulations and glossary games";
}

/** Either side replying inside an accepted conversation. */
export function sendMessage(id: string, from: "student" | "pro", text: string): void {
  const trimmed = text.trim();
  if (!trimmed) return;
  const store = snapshot();
  commit({ ...store, requests: store.requests.map((r) => (r.id === id ? { ...r, messages: [...r.messages, { from, text: trimmed, at: Date.now() }] } : r)) });
}

// ---- links + notifications -------------------------------------------------

const DEFAULT_PRO_ID = "pro-okafor"; // ProDashboardView's own default pro

/** Where a conversation for this feature lives, for a notification's href
 *  or a future "Messages" entry point on the Connect page. Student: the
 *  pro's profile in College POV, where the Message panel already renders
 *  whatever state the request is in. Pro: their dashboard's Messaging tab
 *  (`?net=messages`, read by ProDashboard.tsx on mount). */
export function messagesHref(as: "student" | "pro", proId?: string): string {
  if (as === "pro") return `/connect?dashboard=${proId ?? DEFAULT_PRO_ID}&as=pro&net=messages`;
  return proId ? `/connect?pro=${proId}&pov=college&net=messages` : `/connect?tab=people&pov=college`;
}

/** The pro's home community board -- "Ask in Community" from a decline
 *  notification, same lookup ProProfileView already does for its own
 *  in-page fallback. */
function communityHrefFor(proId: string): string {
  const pro = PROS.find((p) => p.id === proId);
  const board = pro ? (COMMUNITIES.find((c) => c.world === pro.world) ?? COMMUNITIES[0]) : COMMUNITIES[0];
  return board ? `/connect?board=${board.id}` : "/connect";
}

function proAvatar(proId: string): string {
  return `/images/connect/avatars/${proId}.jpg`;
}

function shortAgo(at: number): string {
  const mins = Math.max(0, Math.round((Date.now() - at) / 60_000));
  if (mins <= 1) return "Just now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.round(hours / 24)}d`;
}

/** Real-time notifications derived straight from the store, not a second
 *  persisted list -- a request that moves from pending to accepted simply
 *  stops producing the "new request" row and starts producing the
 *  "accepted" one, so there is never a stale duplicate to clean up.
 *  Read/unread reuses the app's own inbox (`lib/inbox.ts`) by giving every
 *  row a stable id (`net-...`); opening one from the bell marks it read the
 *  same way any other notification does, and `useNetworkingUnread` below
 *  checks the identical ids so the two can never disagree. */
export function networkingNotifications(store: Store = snapshot()): Notification[] {
  const out: Notification[] = [];
  for (const r of store.requests) {
    const pro = PROS.find((p) => p.id === r.proId);
    const proFirstName = (pro?.name ?? "Your volunteer").split(" ")[0];
    const isMine = r.studentName === NETWORK_STUDENT_NAME;
    if (isMine) {
      // Student-facing: what happened to MY request.
      if (r.status === "accepted") {
        out.push({
          id: `net-accepted-${r.id}`, scope: "connect", avatar: proAvatar(r.proId), who: proFirstName,
          text: "accepted your request. Say hello!", when: shortAgo(r.respondedAt ?? r.createdAt), href: messagesHref("student", r.proId),
        });
      } else if (r.status === "declined") {
        out.push({
          id: `net-declined-${r.id}`, scope: "connect", avatar: proAvatar(r.proId), who: proFirstName,
          text: "isn't taking requests right now. Ask in Community instead.", when: shortAgo(r.respondedAt ?? r.createdAt), href: communityHrefFor(r.proId),
        });
      }
      const last = r.messages[r.messages.length - 1];
      if (r.status === "accepted" && last && last.from === "pro") {
        out.push({
          id: `net-msg-${r.id}-${last.at}`, scope: "connect", avatar: proAvatar(r.proId), who: proFirstName,
          text: "sent you a message", detail: last.text, when: shortAgo(last.at), href: messagesHref("student", r.proId),
        });
      }
    } else {
      // Pro-facing: a request or reply waiting on a volunteer. Real accounts
      // would only see their OWN incoming requests; this demo's single
      // browser plays both sides, so these simply exist alongside the
      // student-facing ones above rather than needing a separate login.
      if (r.status === "pending") {
        out.push({
          id: `net-newreq-${r.id}`, scope: "connect", icon: "message",
          text: `New request from ${r.studentName}, ${r.studentYear.toLowerCase()} interested in ${r.careerInterest}`,
          when: shortAgo(r.createdAt), href: messagesHref("pro", r.proId),
        });
      }
      const last = r.messages[r.messages.length - 1];
      if (r.status === "accepted" && last && last.from === "student") {
        out.push({
          id: `net-msg-${r.id}-${last.at}`, scope: "connect", icon: "message",
          who: r.studentName, text: "sent you a message", detail: last.text, when: shortAgo(last.at), href: messagesHref("pro", r.proId),
        });
      }
    }
  }
  return out;
}

/** Pending requests for a pro (the count that matters to a volunteer
 *  deciding whether to open their Messaging tab), or unread accepts/declines
 *  and unread messages for the student -- read the same way the bell
 *  itself does, via `lib/inbox.ts`'s `read` ids, so this count and the
 *  bell's badge can never drift apart. `proId` narrows to one volunteer;
 *  omitted, it covers every pro in the store (rare in this one-student demo,
 *  but correct if a student ever messages more than one). */
export function useNetworkingUnread(as: "student" | "pro", proId?: string): number {
  const store = useNetworkingStore();
  const inbox = useInbox();
  const mine = (r: NetworkingRequest) => !proId || r.proId === proId;
  if (as === "pro") {
    const requests = store.requests.filter(mine);
    const pending = requests.filter((r) => r.status === "pending").length;
    const unreadMsgs = requests.filter((r) => {
      const last = r.messages[r.messages.length - 1];
      return r.status === "accepted" && last?.from === "student" && !inbox.read.includes(`net-msg-${r.id}-${last.at}`);
    }).length;
    return pending + unreadMsgs;
  }
  const requests = store.requests.filter((r) => r.studentName === NETWORK_STUDENT_NAME && mine(r));
  const unreadDecisions = requests.filter((r) => (r.status === "accepted" && !inbox.read.includes(`net-accepted-${r.id}`)) || (r.status === "declined" && !inbox.read.includes(`net-declined-${r.id}`))).length;
  const unreadMsgs = requests.filter((r) => {
    const last = r.messages[r.messages.length - 1];
    return r.status === "accepted" && last?.from === "pro" && !inbox.read.includes(`net-msg-${r.id}-${last.at}`);
  }).length;
  return unreadDecisions + unreadMsgs;
}
