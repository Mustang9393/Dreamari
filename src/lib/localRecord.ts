// One small localStorage-backed record with a stable snapshot, for
// useSyncExternalStore. The same idiom counselorReviews.ts spells out by
// hand (reparse only when the stored string changed, notify listeners on
// write, follow other tabs through the storage event), made reusable for
// the Counselor Dashboard v3 stores (29 Sept 2026). Prototype only: a
// backend replaces every one of these with an API call.

import { useSyncExternalStore } from "react";

export type LocalRecord<T> = {
  read: () => T;
  write: (next: T) => void;
  update: (fn: (prev: T) => T) => T;
  subscribe: (listener: () => void) => () => void;
  useValue: () => T;
};

export function createLocalRecord<T>(key: string, fallback: T): LocalRecord<T> {
  let cache: { raw: string | null; parsed: T } = { raw: null, parsed: fallback };
  let loaded = false;
  const listeners = new Set<() => void>();

  const read = (): T => {
    if (typeof window === "undefined") return fallback;
    let raw: string | null = null;
    try {
      raw = window.localStorage.getItem(key);
    } catch {
      return cache.parsed;
    }
    if (loaded && raw === cache.raw) return cache.parsed;
    let parsed = fallback;
    try {
      if (raw) parsed = JSON.parse(raw) as T;
    } catch {
      parsed = fallback;
    }
    cache = { raw, parsed };
    loaded = true;
    return parsed;
  };

  const write = (next: T) => {
    const raw = JSON.stringify(next);
    try {
      window.localStorage.setItem(key, raw);
    } catch {
      // no storage: still works this session
    }
    cache = { raw, parsed: next };
    loaded = true;
    listeners.forEach((l) => l());
  };

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) listener();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  };

  return {
    read,
    write,
    update: (fn) => {
      const next = fn(read());
      write(next);
      return next;
    },
    subscribe,
    useValue: () => useSyncExternalStore(subscribe, read, () => fallback),
  };
}

/** A stable small hash of a string, for deterministic seeding. */
export function seedHash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Local calendar date as YYYY-MM-DD. */
export function isoDay(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/** Whole days from today to an ISO date (negative when past). */
export function daysFromToday(iso: string, now: Date = new Date()): number {
  const [y, m, d] = iso.split("-").map(Number);
  const target = new Date(y, m - 1, d).getTime();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.round((target - today) / 86400000);
}

/** An ISO date moved by n days. */
export function addDays(iso: string, n: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return isoDay(new Date(y, m - 1, d + n));
}

/** "Oct 15" */
export function shortDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
