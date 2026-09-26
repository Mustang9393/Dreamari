"use client";

// DEMO-ONLY: the Career actions lab's own state (26 Sept 2026). The lab's
// copies of Explore and the career page read and write THIS, never the real
// saved careers, Top 3 or preferences, so demoing the lab can't change the
// live demo. On first use in a browser session it seeds itself once from the
// real stores (read only), so the copies look exactly like the real pages
// the student is used to. Session storage, so it survives moving between the
// two lab pages and clears when the tab closes.
//
// Also carries the lab's network mode (Normal / Slow / Fail) so every action
// can show its loading and failed states, and the one feedback bar both
// pages share.

import { useSyncExternalStore } from "react";
import { picksSnapshot } from "@/lib/picks";

export type Reaction = "like" | "nope" | null;
export type Network = "normal" | "slow" | "fail";
export type Bar = { id: number; text: string; link?: { label: string; open: "saved" | "top3" }; undo?: () => void; error?: boolean; retry?: () => void } | null;

type State = { saved: string[]; top3: string[]; reaction: Record<string, Reaction>; network: Network; pending: string | null; bar: Bar; swapFor: { id: string; title: string } | null; drawer: "saved" | "top3" | null };

const KEY = "dreamari:actions-lab";
let state: State | null = null;
const listeners = new Set<() => void>();
let barSeq = 0;

function seed(): State {
  let saved: string[] = [];
  try { saved = JSON.parse(window.localStorage.getItem("dreamari-saved-careers") ?? "[]") as string[]; } catch { saved = []; }
  const top3 = picksSnapshot().ids.slice(0, 3);
  return { saved: Array.from(new Set([...top3, ...saved])), top3, reaction: {}, network: "normal", pending: null, bar: null, swapFor: null, drawer: null };
}
function read(): State {
  if (state) return state;
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    state = raw ? { ...(JSON.parse(raw) as State), pending: null, bar: null, swapFor: null, drawer: null } : seed();
  } catch { state = seed(); }
  return state;
}
const EMPTY: State = { saved: [], top3: [], reaction: {}, network: "normal", pending: null, bar: null, swapFor: null, drawer: null };
function write(next: Partial<State>) {
  state = { ...read(), ...next };
  try {
    const { saved, top3, reaction, network } = state;
    window.sessionStorage.setItem(KEY, JSON.stringify({ saved, top3, reaction, network }));
  } catch { /* private mode */ }
  listeners.forEach((l) => l());
}
function subscribe(l: () => void) { listeners.add(l); return () => { listeners.delete(l); }; }

export function useLab(): State {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export function resetLab() {
  try { window.sessionStorage.removeItem(KEY); } catch { /* */ }
  state = null;
  write(seed());
}

export const setNetwork = (network: Network) => write({ network });
export const setBar = (bar: Omit<NonNullable<Bar>, "id"> | null) => write({ bar: bar ? { ...bar, id: ++barSeq } : null });
export const openDrawer = (drawer: "saved" | "top3" | null) => write({ drawer });
export const cancelSwap = () => write({ swapFor: null });

// Every action goes through here: optimistic when the network is normal; a
// spinner on the tapped control (and taps ignored) when slow; a revert and a
// red "Try again" bar when it fails.
function run(key: string, apply: () => void, revert: () => void, ok: Omit<NonNullable<Bar>, "id">, retry: () => void) {
  const s = read();
  if (s.pending) return;
  if (s.network === "normal") { apply(); setBar(ok); return; }
  write({ pending: key });
  apply();
  window.setTimeout(() => {
    write({ pending: null });
    if (read().network === "fail") { revert(); setBar({ text: "Couldn't save that. Check your connection.", error: true, retry }); }
    else setBar(ok);
  }, 1200);
}

export function toggleSave(id: string, title: string) {
  const s = read();
  const was = s.saved.includes(id);
  if (!was) {
    run(`save:${id}`, () => write({ saved: [...read().saved, id] }), () => write({ saved: read().saved.filter((x) => x !== id) }), { text: `Saved ${title}`, link: { label: "View saved", open: "saved" } }, () => toggleSave(id, title));
    return;
  }
  // Top 3 is picked from Saved, so unsaving a Top 3 career takes it out of
  // the Top 3 too; Undo puts both back.
  const snap = { saved: s.saved, top3: s.top3 };
  const wasTop = s.top3.includes(id);
  run(`save:${id}`, () => write({ saved: read().saved.filter((x) => x !== id), top3: read().top3.filter((x) => x !== id) }), () => write(snap),
    { text: wasTop ? "Removed from Saved and your Top 3" : "Removed from Saved", undo: () => { write(snap); setBar(null); } }, () => toggleSave(id, title));
}

export function toggleTop3(id: string, title: string) {
  const s = read();
  if (s.top3.includes(id)) {
    const snap = s.top3;
    run(`top3:${id}`, () => write({ top3: read().top3.filter((x) => x !== id) }), () => write({ top3: snap }), { text: "Removed from your Top 3. Still in Saved.", undo: () => { write({ top3: snap }); setBar(null); } }, () => toggleTop3(id, title));
    return;
  }
  if (s.top3.length >= 3) { write({ swapFor: { id, title } }); return; }
  const n = s.top3.length + 1;
  const wasSaved = s.saved.includes(id);
  // Adding to the Top 3 also saves it: every Top 3 career is on Saved.
  run(`top3:${id}`, () => write({ top3: [...read().top3, id], saved: wasSaved ? read().saved : [...read().saved, id] }),
    () => write({ top3: read().top3.filter((x) => x !== id), saved: wasSaved ? read().saved : read().saved.filter((x) => x !== id) }),
    { text: `${title} is #${n} of 3`, link: { label: "See Top 3", open: "top3" } }, () => toggleTop3(id, title));
}

export function swapInto(outId: string, outTitle: string) {
  const s = read();
  const incoming = s.swapFor;
  if (!incoming) return;
  write({ swapFor: null });
  const snap = { saved: s.saved, top3: s.top3 };
  const n = s.top3.indexOf(outId) + 1;
  run(`top3:${incoming.id}`, () => write({ top3: read().top3.map((x) => (x === outId ? incoming.id : x)), saved: read().saved.includes(incoming.id) ? read().saved : [...read().saved, incoming.id] }), () => write(snap),
    { text: `${incoming.title} is now #${n}. ${outTitle} is still in Saved.`, undo: () => { write(snap); setBar(null); } }, () => { write({ swapFor: incoming }); swapInto(outId, outTitle); });
}

export function react(id: string, kind: "like" | "nope") {
  const s = read();
  const prev = s.reaction[id] ?? null;
  const value: Reaction = prev === kind ? null : kind;
  const inLists = s.saved.includes(id) || s.top3.includes(id);
  // Like and Not for me train recommendations; neither is a list or a
  // delete, and the feedback says exactly that.
  const ok = value === "like" ? { text: "More like this in For You" }
    : value === "nope" ? { text: inLists ? "Fewer like this in For You. Still in your Saved." : "Fewer like this in For You", undo: () => { write({ reaction: { ...read().reaction, [id]: prev } }); setBar(null); } }
    : { text: kind === "like" ? "Like removed" : "Back in your recommendations" };
  run(`react:${id}`, () => write({ reaction: { ...read().reaction, [id]: value } }), () => write({ reaction: { ...read().reaction, [id]: prev } }), ok, () => react(id, kind));
}
