"use client";

// One wrapper every data-backed surface renders through, so loading, slow,
// error, empty, not found and offline are real states of the real screen,
// not a list in a doc (27 Sept 2026, direct instruction: "DO not have
// anything proposed not built yet. BUILD EVERYTHING").
//
// Production: pass the request's `status` (and `isEmpty` from the data);
// a load that runs past SLOW_MS turns into the slow view by itself, and a
// failed or pending load while the browser is offline shows the offline
// view. The prototype has no network, so:
// DEMO-ONLY review switch: `?state=loading|slow|error|empty|notfound|offline`
// on any page forces that state on every SurfaceState there; add
// `&surface=<n>` to force it on one surface only (n = its row in
// src/lib/surfaceStates.ts and the Component Lab's States gallery).

import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { surfaceById } from "@/lib/surfaceStates";
import { EmptyView, ErrorView, LoadingView, NotFoundView, OfflineView, SlowView } from "./states";

export type SurfaceStatus = "ready" | "loading" | "slow" | "error" | "empty" | "notfound" | "offline";
const FORCEABLE: SurfaceStatus[] = ["loading", "slow", "error", "empty", "notfound", "offline"];
const SLOW_MS = 4000;

const noopSubscribe = () => () => {};
function subscribeHistory(cb: () => void) {
  window.addEventListener("popstate", cb);
  return () => window.removeEventListener("popstate", cb);
}

/** The demo override for surface `n`, or null. */
export function useForcedState(n?: number): SurfaceStatus | null {
  const search = useSyncExternalStore(subscribeHistory, () => location.search, () => "");
  const q = new URLSearchParams(search);
  const s = q.get("state") as SurfaceStatus | null;
  if (!s || !FORCEABLE.includes(s)) return null;
  const only = q.get("surface");
  if (only && n !== undefined && only !== String(n)) return null;
  return s;
}

function subscribeOnline(cb: () => void) {
  window.addEventListener("online", cb);
  window.addEventListener("offline", cb);
  return () => {
    window.removeEventListener("online", cb);
    window.removeEventListener("offline", cb);
  };
}
/** navigator.onLine as a live value (true on the server). */
export function useOnline() {
  return useSyncExternalStore(subscribeOnline, () => navigator.onLine, () => true);
}

/** Flips to true once `active` has stayed true for SLOW_MS. */
function useSlow(active: boolean) {
  const [slowFor, setSlowFor] = useState<number | null>(null);
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => setSlowFor(Date.now()), SLOW_MS);
    return () => {
      clearTimeout(t);
      setSlowFor(null);
    };
  }, [active]);
  return active && slowFor !== null;
}

export function SurfaceState({
  id,
  status = "ready",
  isEmpty = false,
  onRetry,
  onEmptyAction,
  what,
  className = "",
  children,
}: {
  /** Row in src/lib/surfaceStates.ts: supplies this surface's copy. */
  id: number;
  status?: SurfaceStatus;
  /** True when the loaded data has nothing to show. */
  isEmpty?: boolean;
  onRetry?: () => void;
  onEmptyAction?: () => void;
  /** Not-found noun ("career", "college"); defaults to "page". */
  what?: string;
  className?: string;
  children: ReactNode;
}) {
  const forced = useForcedState(id);
  const online = useOnline();
  const slow = useSlow(status === "loading" && !forced);

  let state: SurfaceStatus = forced ?? status;
  if (!forced) {
    if (state === "loading" && slow) state = "slow";
    if ((state === "loading" || state === "slow" || state === "error") && !online) state = "offline";
    if (state === "ready" && isEmpty) state = "empty";
  }
  if (state === "ready") return <>{children}</>;

  return (
    <div className={`w-full ${className}`} data-surface-state={state} data-surface={id}>
      <SurfaceStateView id={id} state={state} onRetry={onRetry} onEmptyAction={onEmptyAction} what={what} />
    </div>
  );
}

/** The view for one surface in one state, with its registry copy. Used by
 *  SurfaceState and by the Component Lab's States gallery. */
export function SurfaceStateView({ id, state, onRetry, onEmptyAction, what }: { id: number; state: Exclude<SurfaceStatus, "ready">; onRetry?: () => void; onEmptyAction?: () => void; what?: string }) {
  const row = surfaceById(id);
  const shape = row?.loadShape === "button" || !row?.loadShape ? "chip" : row.loadShape;
  const label = row?.loadLabel ?? "Loading";
  switch (state) {
    case "loading":
      return <LoadingView label={label} shape={shape} />;
    case "slow":
      return <SlowView label={label} shape={shape} onRetry={onRetry} />;
    case "error":
      return <ErrorView verb={row?.errorVerb ?? "load this"} fallback={row?.errorFallback} onRetry={onRetry} />;
    case "empty": {
      const c = row?.emptyCopy ?? {};
      return <EmptyView tier={row?.emptyTier ?? 3} heading={c.heading} line={c.line} cta={c.cta} query={c.query} onAction={onEmptyAction} />;
    }
    case "notfound":
      return <NotFoundView what={what ?? "page"} />;
    case "offline":
      return <OfflineView onRetry={onRetry} />;
  }
}

/** App-wide strip while the browser is offline (or `?state=offline`). */
export function OfflineBanner() {
  const online = useOnline();
  const forced = useSyncExternalStore(noopSubscribe, () => new URLSearchParams(location.search).get("state") === "offline", () => false);
  if (online && !forced) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-[calc(env(safe-area-inset-top)+10px)] z-[95] flex justify-center px-4">
      <div className="pointer-events-auto marketing-v2 themeable contents">
        <OfflineView variant="banner" />
      </div>
    </div>
  );
}
