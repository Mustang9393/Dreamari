// No backend anywhere else in this prototype (see picks.ts's own note) --
// this is the one deliberate exception. A real mobile bug report came in
// with no reproduction ("buttons stop responding, sometimes, and reloading
// doesn't fix it") and the app had no way to ever produce a stack trace for
// it. This turns "sometimes, on someone else's phone" into an actual
// message: every uncaught error and unhandled promise rejection gets kept
// locally and best-effort reported to the server console, nothing more.

const KEY = "dreamari-error-log";
const MAX_ENTRIES = 20;

export type LoggedError = {
  kind: "error" | "unhandledrejection";
  message: string;
  stack?: string;
  url: string;
  userAgent: string;
  at: number;
};

function persistLocally(entry: LoggedError): void {
  try {
    const raw = window.localStorage.getItem(KEY);
    const list: LoggedError[] = raw ? JSON.parse(raw) : [];
    list.push(entry);
    while (list.length > MAX_ENTRIES) list.shift();
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // Private browsing or a full quota -- the report still goes to the
    // server below; losing the local copy is not fatal.
  }
}

function report(entry: LoggedError): void {
  persistLocally(entry);
  try {
    const body = JSON.stringify(entry);
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/log-error", new Blob([body], { type: "application/json" }));
    } else {
      fetch("/api/log-error", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
    }
  } catch {
    // Best-effort only -- a failure here must never itself throw.
  }
}

let installed = false;

/** Call once, as early as possible (see ErrorReporter in the root layout).
 *  Safe to call more than once -- only the first call attaches listeners. */
export function installErrorReporting(): void {
  if (installed || typeof window === "undefined") return;
  installed = true;

  window.addEventListener("error", (event) => {
    report({
      kind: "error",
      message: event.message,
      stack: event.error instanceof Error ? event.error.stack : undefined,
      url: window.location.href,
      userAgent: navigator.userAgent,
      at: Date.now(),
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason: unknown = event.reason;
    report({
      kind: "unhandledrejection",
      message: reason instanceof Error ? reason.message : String(reason),
      stack: reason instanceof Error ? reason.stack : undefined,
      url: window.location.href,
      userAgent: navigator.userAgent,
      at: Date.now(),
    });
  });
}

export function readLoggedErrors(): LoggedError[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearLoggedErrors(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // nothing to clear
  }
}
