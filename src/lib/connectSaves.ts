"use client";

// Connect's Save button feeds the Career Locker (28 Sept 2026, direct ask:
// "saved posts/answers are stored and shown on Profile"). Same idiom as
// every other src/lib store (picks.ts, savedVideos.ts): one localStorage
// key, read through useSyncExternalStore so a Save in Connect shows up on
// Profile without a reload.
//
// This is deliberately its own small store, not a rewrite of Connect's
// existing in-memory `saves` state (ConnectExperience.tsx) -- that state
// already drives every Save button across all of Connect (boards, threads,
// insights, this feed) and touching its plumbing risked far more than this
// one addition needed. Here, only the Feed's own Save button also writes
// through to this persisted list; the rest of Connect's Save buttons are
// unchanged.

import { useSyncExternalStore } from "react";

const KEY = "dreamari-connect-locker-saves";

export type ConnectSavedItem = {
  /** the thread or insight id -- same id Connect's own `saves` record uses */
  id: string;
  kind: "question" | "insight";
  proId: string;
  proName: string;
  /** the question's title, or the post's title */
  title: string;
  boardId: string;
  savedAt: number;
};

function isItem(v: unknown): v is ConnectSavedItem {
  if (!v || typeof v !== "object") return false;
  const r = v as Partial<ConnectSavedItem>;
  return (
    typeof r.id === "string" &&
    (r.kind === "question" || r.kind === "insight") &&
    typeof r.proId === "string" &&
    typeof r.proName === "string" &&
    typeof r.title === "string" &&
    typeof r.boardId === "string" &&
    typeof r.savedAt === "number"
  );
}

function parse(raw: string | null): ConnectSavedItem[] {
  if (!raw) return [];
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value) ? value.filter(isItem) : [];
  } catch {
    return [];
  }
}

let cachedRaw: string | null | undefined;
let cached: ConnectSavedItem[] = [];
const listeners = new Set<() => void>();

function snapshot(): ConnectSavedItem[] {
  if (typeof window === "undefined") return [];
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    return [];
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cached = parse(raw);
  }
  return cached;
}

function serverSnapshot(): ConnectSavedItem[] {
  return [];
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

function commit(next: ConnectSavedItem[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // private browsing / full quota: the toggle still works this session,
    // it just won't persist -- same tolerance every other store here has.
  }
  for (const listener of listeners) listener();
}

/** Adds a Connect Feed save to the Locker; a no-op if it's already there
 *  (Save/unsave toggling in Connect can call this more than once). */
export function addConnectSave(item: ConnectSavedItem): void {
  const current = snapshot();
  if (current.some((x) => x.id === item.id)) return;
  commit([item, ...current]);
}

export function removeConnectSave(id: string): void {
  const current = snapshot();
  if (!current.some((x) => x.id === id)) return;
  commit(current.filter((x) => x.id !== id));
}

export function useConnectSaves(): ConnectSavedItem[] {
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}
