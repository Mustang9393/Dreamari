"use client";

// One step back, everywhere (8 Oct 2026, Chandu: "ALWAYS EVERYTHING SHOULD
// GO ONLY ONE STEP BACK. Please fix this app wide. Every single interaction
// or screen."). Anything that opens over or within a page (a sheet, a
// dialog, a program page inside a board, an industry inside People) is a
// "layer" and owns one browser history entry while it is open. So the
// browser's Back, the iPad and Android swipe, and the layer's own Back or X
// all do the same thing: close that one layer and nothing more. The URL does
// not change; the entry only holds the place.
//
// - Opening a layer pushes an entry marked with the layer's id (dmLayer).
// - Back onto an entry below a layer closes that layer (its onClose).
// - Closing a layer from the app (X, Back, a tap outside) takes its entry
//   back off, so the next Back steps to whatever was under it. That step is
//   ours: other listeners (Next's router, Connect) never see it, and any
//   history write made meanwhile waits until it lands, so a button that
//   closes a sheet and opens a page can't have its page undone.
// - An entry left behind by a layer that is gone (the student left the page
//   with a sheet open, then came back) is skipped in the direction they were
//   going, so no Back press is ever spent on nothing.
//
// Modal dialogs ([role=dialog][aria-modal=true]) join automatically through
// HistoryHost; in-page layers call useBackStep.

import { useEffect, useRef } from "react";

type Layer = { id: number; live: boolean; close: () => void };
type DmState = { dmLayer?: number; dmAt?: number } & Record<string, unknown>;

const layers: Layer[] = [];
let seq = 0;
let here = 0; // dmAt of the entry we are on
let selfSteps = 0; // history moves of ours still to land
let selfFrom = "";
let selfTimer = 0;
let queued: (() => void)[] = [];
let origPush: History["pushState"] | null = null;
let origReplace: History["replaceState"] | null = null;
let reconcileTimer = 0;
// where each entry was scrolled when it was left (by dmAt), so Back and
// Forward between pages land where the student was, not at the top
const SCROLLS = "dreamari-entry-scroll";
let popAt = 0; // when the last Back/Forward between entries happened
let popEntry = 0;

function saveScroll(at: number): void {
  if (!at) return;
  try {
    const m = JSON.parse(window.sessionStorage.getItem(SCROLLS) ?? "{}") as Record<string, number>;
    m[at] = window.scrollY;
    const keys = Object.keys(m);
    if (keys.length > 60) keys.sort().slice(0, keys.length - 60).forEach((k) => delete m[k]);
    window.sessionStorage.setItem(SCROLLS, JSON.stringify(m));
  } catch { /* private mode: pages open at the top */ }
}

/** After Back/Forward to another page: the scroll that page was left at. */
export function takePopScroll(): number | null {
  if (!popAt || performance.now() - popAt > 1500) return null;
  popAt = 0;
  try {
    const y = (JSON.parse(window.sessionStorage.getItem(SCROLLS) ?? "{}") as Record<string, number>)[popEntry];
    return typeof y === "number" ? y : null;
  } catch { return null; }
}

/** Monotonic across reloads, so entries compare by when they were made. */
const nextId = () => {
  seq = Math.max(seq + 1, Date.now());
  return seq;
};
const state = (): DmState => (window.history.state ?? {}) as DmState;

function install(): void {
  const w = window as unknown as { __dmHistory?: boolean };
  if (w.__dmHistory) return;
  w.__dmHistory = true;
  const h = window.history;
  origPush = h.pushState.bind(h);
  origReplace = h.replaceState.bind(h);
  // Every entry carries when it was made (dmAt). A push that isn't ours
  // never inherits our layer mark: Connect spreads the current state into
  // its steps, and a board is not a sheet.
  h.pushState = function pushState(data: unknown, unused: string, url?: string | URL | null) {
    const run = () => {
      const d = { ...((data ?? {}) as DmState) };
      if (!(d as { __dmOwn?: boolean }).__dmOwn) delete d.dmLayer;
      // a push within the same screen (Next's router.push to ?program=)
      // stays at the same Connect depth
      const cur = state();
      if (!("dmConnect" in d) && "dmConnect" in cur && url && new URL(String(url), window.location.href).pathname === window.location.pathname) d.dmConnect = cur.dmConnect;
      delete (d as { __dmOwn?: boolean }).__dmOwn;
      d.dmAt = nextId();
      here = d.dmAt;
      origPush!(d, unused, url);
    };
    if (selfSteps) queued.push(run);
    else run();
  };
  // a replace keeps the entry's own marks unless it sets them itself
  // (Next's router replaces with a fresh state)
  h.replaceState = function replaceState(data: unknown, unused: string, url?: string | URL | null) {
    const run = () => {
      const cur = state();
      const d = { ...((data ?? {}) as DmState) };
      if (d.dmAt === undefined && cur.dmAt !== undefined) d.dmAt = cur.dmAt;
      if (!("dmLayer" in d) && cur.dmLayer !== undefined) d.dmLayer = cur.dmLayer;
      if ("dmConnect" in cur && !("dmConnect" in d)) d.dmConnect = cur.dmConnect;
      if (d.dmAt === undefined) d.dmAt = nextId();
      here = d.dmAt;
      origReplace!(d, unused, url);
    };
    if (selfSteps) queued.push(run);
    else run();
  };
  if (state().dmAt === undefined) h.replaceState(h.state, "");
  here = state().dmAt ?? 0;
  // the tab's first entry of ours: Back from it leaves the app
  try { if (!window.sessionStorage.getItem(FIRST)) window.sessionStorage.setItem(FIRST, String(here)); } catch { /* fine */ }
  // Capture at the window runs before Next's own popstate listener, so our
  // own steps can be kept from it.
  window.addEventListener("popstate", onPop, true);
  // kept as the student scrolls (by the time a page change is written, the
  // next page may already have cut the scroll short)
  let saving = 0;
  window.addEventListener("scroll", () => {
    if (saving) return;
    const at = here;
    saving = window.setTimeout(() => { saving = 0; if (at === here) saveScroll(at); }, 150);
  }, { passive: true });
}

function flush(): void {
  window.clearTimeout(selfTimer);
  selfSteps = 0;
  const q = queued;
  queued = [];
  q.forEach((run) => run());
}

function go(delta: number): void {
  selfSteps = Math.abs(delta);
  selfFrom = window.location.href;
  window.clearTimeout(selfTimer);
  // a step with nowhere to go never fires popstate
  selfTimer = window.setTimeout(flush, 600);
  window.history.go(delta);
}

function onPop(e: PopStateEvent): void {
  // a #section link fires popstate with no state: not a step back
  if (e.state === null) return;
  const s = e.state as DmState;
  const from = here;
  if (!selfSteps) saveScroll(from);
  here = s.dmAt ?? here;
  popAt = performance.now();
  popEntry = here;
  if (selfSteps) {
    // our own step: same page, nothing for anyone else to do
    if (window.location.href === selfFrom) e.stopImmediatePropagation();
    flush();
    skipIfStale(s, from);
    return;
  }
  // the student went back (or forward) past these layers: close them
  const mark = s.dmLayer ?? 0;
  for (let i = layers.length - 1; i >= 0; i--) {
    if (layers[i].id <= mark) break;
    const [gone] = layers.splice(i, 1);
    if (gone.live) gone.close();
  }
  skipIfStale(s, from);
}

/** An entry whose layer is gone holds nothing: keep going the same way. */
function skipIfStale(s: DmState, from: number): void {
  if (s.dmLayer === undefined || layers.some((l) => l.id === s.dmLayer)) return;
  const back = (s.dmAt ?? 0) < from;
  // take the mark off first, so a dead end (nothing further that way)
  // leaves a plain entry rather than a trap
  origReplace?.({ ...s, dmLayer: undefined }, "");
  go(back ? -1 : 1);
}

function reconcile(): void {
  window.clearTimeout(reconcileTimer);
  reconcileTimer = window.setTimeout(() => {
    let k = 0;
    while (k < layers.length && !layers[layers.length - 1 - k].live) k++;
    if (!k) return;
    const onTop = state().dmLayer === layers[layers.length - 1].id;
    layers.splice(layers.length - k, k);
    // drop dead ones buried under a live layer too: their entries are
    // skipped as stale if ever reached
    for (let i = layers.length - 1; i >= 0; i--) if (!layers[i].live) layers.splice(i, 1);
    if (onTop) go(-k);
  }, 0);
}

/** Open a layer: one history entry, closed by Back. Returns its release,
 *  called when the layer closes from inside the app. */
export function openLayer(close: () => void): () => void {
  install();
  const top = layers[layers.length - 1];
  let layer: Layer;
  if (top && !top.live && state().dmLayer === top.id) {
    // one layer closing as the next opens (or a development remount):
    // the new one takes over its entry rather than stacking a dead one
    top.live = true;
    top.close = close;
    layer = top;
  } else {
    layer = { id: nextId(), live: true, close };
    layers.push(layer);
    const cur = state();
    if (cur.dmLayer !== undefined && !layers.some((l) => l !== layer && l.id === cur.dmLayer)) {
      // we're on a stale layer entry (a reload, or a return): reuse it
      window.history.replaceState({ ...cur, dmLayer: layer.id }, "");
    } else {
      window.history.pushState({ ...cur, dmLayer: layer.id, __dmOwn: true }, "");
    }
    // a layer sits over the page where it was opened: same scroll
    saveScroll(state().dmAt ?? 0);
  }
  let released = false;
  return () => {
    if (released) return;
    released = true;
    layer.live = false;
    reconcile();
  };
}

/** While `open`, a browser Back closes this layer (calls `onClose`). */
export function useBackStep(open: boolean, onClose: () => void): void {
  const close = useRef(onClose);
  useEffect(() => { close.current = onClose; });
  useEffect(() => {
    if (!open) return;
    return openLayer(() => close.current());
  }, [open]);
}

/** A flow of steps (a wizard, a sign-up): one history entry per step past
 *  the first, so Back walks back a step at a time. `depth` is how many
 *  steps in the student is (0 = the first); `onBack` steps back once. */
export function useBackSteps(depth: number, onBack: () => void): void {
  const back = useRef(onBack);
  useEffect(() => { back.current = onBack; });
  const held = useRef<(() => void)[]>([]);
  useEffect(() => {
    const steps = held.current;
    while (steps.length > depth) steps.pop()!();
    while (steps.length < depth) {
      steps.push(openLayer(() => {
        steps.pop();
        back.current();
      }));
    }
  }, [depth]);
  useEffect(() => () => {
    const steps = held.current;
    while (steps.length) steps.pop()!();
  }, []);
}

const FIRST = "dreamari-first-entry";

/** True when Back stays inside the app (this tab has an earlier entry of
 *  ours), not out to another site or a blank tab. */
export function canGoBack(): boolean {
  install();
  try {
    const first = Number(window.sessionStorage.getItem(FIRST));
    return !!first && state().dmAt !== undefined && state().dmAt !== first;
  } catch {
    return window.history.length > 1;
  }
}

/** Set up the history marks early (HistoryHost calls this on mount). */
export function installHistory(): void {
  install();
}
