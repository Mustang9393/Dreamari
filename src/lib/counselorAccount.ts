// A school counselor's own account for the separate Counselor Dashboard
// product (isolated from the student app's chrome and data by design --
// see the "Counselor Dashboard" plan). There is no backend, so this is the
// same localStorage-as-record idiom as studentProfile.ts: sign-up just
// writes an account and flips `isSignedIn`, sign-in checks an account
// already exists. Not real auth -- there's no password, no server check --
// same honesty as the app's shared-PIN gate (src/middleware.ts): enough to
// demo a real-feeling flow, not to protect anything.

export const COUNSELOR_ACCOUNT_KEY = "dreamari-counselor-account";

export type CounselorRole = "School Counselor" | "Lead Counselor" | "School Administrator";

export const COUNSELOR_ROLES: CounselorRole[] = ["School Counselor", "Lead Counselor", "School Administrator"];

export type CounselorAccount = {
  name: string;
  email: string;
  school: string;
  role: CounselorRole | "";
  isSignedIn: boolean;
};

export const EMPTY_COUNSELOR: CounselorAccount = { name: "", email: "", school: "", role: "", isSignedIn: false };

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}
function role(value: unknown): CounselorRole | "" {
  return typeof value === "string" && (COUNSELOR_ROLES as string[]).includes(value) ? (value as CounselorRole) : "";
}

function normalize(value: unknown): CounselorAccount {
  if (!value || typeof value !== "object") return EMPTY_COUNSELOR;
  const v = value as Record<string, unknown>;
  return {
    name: str(v.name),
    email: str(v.email),
    school: str(v.school),
    role: role(v.role),
    isSignedIn: v.isSignedIn === true,
  };
}

export function readCounselorAccount(): CounselorAccount {
  if (typeof window === "undefined") return EMPTY_COUNSELOR;
  try {
    const raw = window.localStorage.getItem(COUNSELOR_ACCOUNT_KEY);
    return raw ? normalize(JSON.parse(raw)) : EMPTY_COUNSELOR;
  } catch {
    return EMPTY_COUNSELOR;
  }
}

// Stable snapshot for useSyncExternalStore: rebuilt only when the raw string moves.
let cachedRaw: string | null | undefined;
let cached: CounselorAccount = EMPTY_COUNSELOR;
const listeners = new Set<() => void>();

export function counselorAccountSnapshot(): CounselorAccount {
  if (typeof window === "undefined") return EMPTY_COUNSELOR;
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(COUNSELOR_ACCOUNT_KEY);
  } catch {
    return EMPTY_COUNSELOR;
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cached = readCounselorAccount();
  }
  return cached;
}
export function serverCounselorAccountSnapshot(): CounselorAccount {
  return EMPTY_COUNSELOR;
}
export function subscribeCounselorAccount(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === COUNSELOR_ACCOUNT_KEY) listener();
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

/** Merge a partial update into the stored account. */
export function writeCounselorAccount(patch: Partial<CounselorAccount>): void {
  if (typeof window === "undefined") return;
  try {
    const next = normalize({ ...readCounselorAccount(), ...patch });
    window.localStorage.setItem(COUNSELOR_ACCOUNT_KEY, JSON.stringify(next));
  } catch {
    // no storage: the session still works, it just won't be remembered
  }
  for (const listener of listeners) listener();
}

export function signOutCounselor(): void {
  writeCounselorAccount({ isSignedIn: false });
}
