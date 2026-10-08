"use client";

// Dreamy's one job: he is the student's scout (9 Oct 2026, Chandu: "lets
// think about how we can incorporate dreamy more? right now its a just a
// sticker in random places with no real engagement or presence"). He goes
// ahead, finds things, brings them back, and reacts to what the student
// does. Every appearance is one of those three. Duo is the reference for a
// mascot with one job; Clippy is the warning.
//
// This store is the whole contract. Pages never render Dreamy; they write
// an event here ("I found a career that fits your Top 3") and the one
// companion mounted in the student shell shows it, under restraint rules
// the pages cannot bend:
//
// - One event at a time. A new event waits in a queue until the current
//   bubble is dismissed, or until the current one has been up for holdMs.
// - Nothing unprompted in the first warmupMs on a screen (the page calls
//   dreamyScreenMounted when it mounts).
// - At most one unprompted appearance per cooldownMs.
// - Never the same event twice: a seen-set keyed by event id. A page can
//   fire its event on every render and Dreamy still says it once.
// - Quiet mode: dock only. Finds still queue and the badge shows them, but
//   he does not speak until quiet is off or the student taps him.
// - A prompted event (the student asked: tapped him, pressed a button)
//   skips the warm-up and the cooldown. It still never repeats.
//
// Module state + useSyncExternalStore, the shape every other store in
// src/lib uses (stage.ts, peekStore.ts).

import { useSyncExternalStore } from "react";

export type DreamyMood = "idle" | "scouting" | "waiting" | "proud" | "puzzled";

export type DreamyActionIcon = "open" | "save" | "look" | "play" | "review" | "start";

/** One "What I'd do next" row. href navigates; onSelect runs instead. */
export type DreamyAction = {
  id: string;
  label: string;
  hint?: string;
  icon?: DreamyActionIcon;
  href?: string;
  onSelect?: () => void;
};

/** The thing he brings back: a career poster or an opportunity row. */
export type DreamyPayload = {
  kind: "poster" | "row";
  title: string;
  subtitle?: string;
  image?: string;
  /** a world colour or any CSS colour; the card's one accent */
  accent?: string;
  action: { label: string; href?: string; onSelect?: () => void };
};

export type DreamyEvent = {
  /** Stable per moment, not per render: "scout:top3:ux-designer",
   *  "review:resume:2026-10-08". The seen-set keys on it. */
  id: string;
  mood: DreamyMood;
  /** one sentence, 90 characters or fewer, 8th-grade words */
  line?: string;
  payload?: DreamyPayload;
  /** up to three; more are dropped */
  actions?: DreamyAction[];
  /** the student asked for this: skips warm-up and cooldown */
  prompted?: boolean;
};

export type DreamyRefusal = { id: string; reason: "repeat" | "quiet" | "warmup" | "cooldown" | "busy"; detail: string; at: number };

export type DreamyConfig = {
  /** ms a bubble holds before a queued event may replace it */
  holdMs: number;
  /** ms after a screen mounts before anything unprompted shows */
  warmupMs: number;
  /** ms between unprompted appearances */
  cooldownMs: number;
};

export type DreamyState = {
  mood: DreamyMood;
  line: string | null;
  payload: DreamyPayload | null;
  actions: DreamyAction[];
  /** the event on screen, or null when he is just idling in the dock */
  current: DreamyEvent | null;
  /** when the current event was shown */
  shownAt: number;
  queue: DreamyEvent[];
  seen: string[];
  quiet: boolean;
  /** the screen's mount time; the warm-up counts from it */
  screenAt: number;
  /** the last unprompted appearance; the cooldown counts from it */
  lastUnpromptedAt: number;
  config: DreamyConfig;
  /** why the last dreamySay did not show at once (the lab readout prints it) */
  lastRefusal: DreamyRefusal | null;
  /** bumps when a proud event lands: the dock plays its burst */
  burstNonce: number;
};

export const DEFAULT_CONFIG: DreamyConfig = { holdMs: 8000, warmupMs: 10_000, cooldownMs: 90_000 };

const MAX_ACTIONS = 3;
const MAX_LINE = 90;

let state: DreamyState = {
  mood: "idle",
  line: null,
  payload: null,
  actions: [],
  current: null,
  shownAt: 0,
  queue: [],
  seen: [],
  quiet: false,
  screenAt: 0,
  lastUnpromptedAt: -Infinity,
  config: DEFAULT_CONFIG,
  lastRefusal: null,
  burstNonce: 0,
};
const listeners = new Set<() => void>();
let timer = 0;

function emit(next: Partial<DreamyState>): void {
  state = { ...state, ...next };
  for (const l of listeners) l();
}

const now = () => (typeof performance !== "undefined" ? performance.now() : Date.now());

/** A line is one short sentence. Longer copy is cut at the last word
 *  that fits, so a page cannot turn the bubble into a paragraph. */
function trimLine(line: string | undefined): string | null {
  if (!line) return null;
  const clean = line.trim();
  if (clean.length <= MAX_LINE) return clean;
  const cut = clean.slice(0, MAX_LINE);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), 40)).trim()}.`;
}

/** Time until the next unprompted event may show: the longer of the
 *  screen warm-up and the appearance cooldown. 0 when clear. */
export function unpromptedWaitMs(s: DreamyState = state): { ms: number; why: "warmup" | "cooldown" | null } {
  const t = now();
  const warm = Math.max(0, s.screenAt + s.config.warmupMs - t);
  const cool = Math.max(0, s.lastUnpromptedAt + s.config.cooldownMs - t);
  if (warm === 0 && cool === 0) return { ms: 0, why: null };
  return warm >= cool ? { ms: warm, why: "warmup" } : { ms: cool, why: "cooldown" };
}

/** Time until the current bubble may yield to a queued one. */
export function holdWaitMs(s: DreamyState = state): number {
  if (!s.current) return 0;
  return Math.max(0, s.shownAt + s.config.holdMs - now());
}

function show(ev: DreamyEvent): void {
  const t = now();
  emit({
    mood: ev.mood,
    line: trimLine(ev.line),
    payload: ev.payload ?? null,
    actions: (ev.actions ?? []).slice(0, MAX_ACTIONS),
    current: ev,
    shownAt: t,
    seen: state.seen.includes(ev.id) ? state.seen : [...state.seen, ev.id],
    lastUnpromptedAt: ev.prompted ? state.lastUnpromptedAt : t,
    burstNonce: ev.mood === "proud" ? state.burstNonce + 1 : state.burstNonce,
    // a wait that is over is no longer a skip worth reporting
    lastRefusal: state.lastRefusal?.id === ev.id ? null : state.lastRefusal,
  });
}

/** Play the next queued event if every rule allows it; otherwise sleep
 *  until the earliest moment one might. */
function drain(): void {
  window.clearTimeout(timer);
  timer = 0;
  const next = state.queue[0];
  if (!next) return;
  if (state.quiet && !next.prompted) return; // the badge shows it; he waits
  const hold = holdWaitMs();
  const wait = next.prompted ? { ms: 0, why: null } : unpromptedWaitMs();
  const delay = Math.max(hold, wait.ms);
  if (delay > 0) {
    timer = window.setTimeout(drain, delay + 20);
    return;
  }
  emit({ queue: state.queue.slice(1) });
  show(next);
  if (state.queue.length) timer = window.setTimeout(drain, state.config.holdMs + 20);
}

/** The one entry point for pages. Returns what happened so a caller (or
 *  the lab readout) can see the rule that applied. */
export function dreamySay(ev: DreamyEvent): "shown" | "queued" | "repeat" {
  if (state.seen.includes(ev.id) || state.queue.some((q) => q.id === ev.id) || state.current?.id === ev.id) {
    emit({ lastRefusal: { id: ev.id, reason: "repeat", detail: "Already shown once. Dreamy never repeats a find.", at: now() } });
    return "repeat";
  }
  if (ev.prompted) {
    // the student asked: it goes first, and the current bubble (already
    // seen) steps aside
    emit({ queue: [ev, ...state.queue.filter((q) => !q.prompted)], lastRefusal: null });
    window.clearTimeout(timer);
    timer = 0;
    if (state.current) emit({ current: null, line: null, payload: null, actions: [], mood: "idle" });
    drain();
    return "shown";
  }
  const queue = [...state.queue, ev];
  emit({ queue });
  if (state.quiet) {
    emit({ lastRefusal: { id: ev.id, reason: "quiet", detail: "Quiet mode. Kept in the queue; the badge shows it.", at: now() } });
    return "queued";
  }
  const hold = holdWaitMs();
  const wait = unpromptedWaitMs();
  if (state.current && hold > 0) {
    emit({ lastRefusal: { id: ev.id, reason: "busy", detail: `One at a time. Waits for a dismiss or ${Math.ceil(hold / 1000)}s.`, at: now() } });
  } else if (wait.why === "warmup") {
    emit({ lastRefusal: { id: ev.id, reason: "warmup", detail: `Screen just opened. Nothing unprompted for ${Math.ceil(wait.ms / 1000)}s more.`, at: now() } });
  } else if (wait.why === "cooldown") {
    emit({ lastRefusal: { id: ev.id, reason: "cooldown", detail: `One unprompted find per ${Math.round(state.config.cooldownMs / 1000)}s. ${Math.ceil(wait.ms / 1000)}s to go.`, at: now() } });
  } else {
    emit({ lastRefusal: null });
  }
  drain();
  return state.current?.id === ev.id ? "shown" : "queued";
}

/** The bubble's x, a tap on the card's action, or the sheet's "Not now":
 *  the current event is done. The next queued one may follow. */
export function dreamyDismiss(): void {
  if (!state.current) return;
  emit({ current: null, line: null, payload: null, actions: [], mood: "idle" });
  drain();
}

/** A direct mood with no event (the lab's mood buttons; a page reacting
 *  to a tap). Does not touch the queue or the seen-set. */
export function dreamySetMood(mood: DreamyMood): void {
  emit({ mood, burstNonce: mood === "proud" ? state.burstNonce + 1 : state.burstNonce });
}

export function dreamySetQuiet(quiet: boolean): void {
  emit({ quiet });
  if (!quiet) drain();
}

/** Pages call this on mount: the warm-up clock starts over. */
export function dreamyScreenMounted(): void {
  emit({ screenAt: now() });
  if (state.queue.length) drain();
}

export function dreamyConfigure(patch: Partial<DreamyConfig>): void {
  emit({ config: { ...state.config, ...patch } });
  drain();
}

/** The student tapped him with nothing waiting but things queued behind
 *  quiet mode or the cooldown: tapping is a prompt, so the next one plays. */
export function dreamyPromptNext(): boolean {
  const next = state.queue[0];
  if (!next) return false;
  emit({ queue: [{ ...next, prompted: true }, ...state.queue.slice(1)] });
  window.clearTimeout(timer);
  timer = 0;
  drain();
  return true;
}

/** Lab only: forget everything, as a fresh session would. */
export function dreamyReset(config: Partial<DreamyConfig> = {}): void {
  window.clearTimeout(timer);
  timer = 0;
  emit({
    mood: "idle",
    line: null,
    payload: null,
    actions: [],
    current: null,
    shownAt: 0,
    queue: [],
    seen: [],
    screenAt: now(),
    lastUnpromptedAt: -Infinity,
    config: { ...DEFAULT_CONFIG, ...config },
    lastRefusal: null,
  });
}

export function readDreamy(): DreamyState {
  return state;
}

const SERVER_STATE: DreamyState = state;

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useDreamy(): DreamyState {
  return useSyncExternalStore(subscribe, readDreamy, () => SERVER_STATE);
}
