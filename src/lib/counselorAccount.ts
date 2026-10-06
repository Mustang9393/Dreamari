// Local profile and role preferences for the separate counselor prototype.
// DEMO-ONLY: the dashboard opens without sign-in. The legacy isSignedIn
// field is retained for stored-record compatibility, not access control.

export const COUNSELOR_ACCOUNT_KEY = "dreamari-counselor-account";

export type CounselorRole = "School Counselor" | "Lead Counselor" | "School Leader" | "District Leader";

export const COUNSELOR_ROLES: CounselorRole[] = ["School Counselor", "Lead Counselor", "School Leader", "District Leader"];

export type CounselorAccount = {
  name: string;
  email: string;
  school: string;
  role: CounselorRole | "";
  isSignedIn: boolean;
  /** A real uploaded signature image (data URL), used on generated letters
   *  in place of the auto cursive signature when present. */
  signatureDataUrl: string;
};

export const EMPTY_COUNSELOR: CounselorAccount = { name: "", email: "", school: "", role: "", isSignedIn: false, signatureDataUrl: "" };

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}
// "School Administrator" / "District Administrator" were renamed School
// Leader / District Leader on 2 Oct 2026, to match the Replit's own role
// names (Joshua: "two additional views created: School Leader, District
// Leader"). An account saved under an old name keeps its role.
const LEGACY_ROLES: Record<string, CounselorRole> = { "School Administrator": "School Leader", "District Administrator": "District Leader" };

function role(value: unknown): CounselorRole | "" {
  if (typeof value === "string" && LEGACY_ROLES[value]) return LEGACY_ROLES[value];
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
    signatureDataUrl: str(v.signatureDataUrl),
  };
}

// DEMO-ONLY: every new browser session of the dashboard opens as the demo
// persona, Sarah Chen, School Counselor at Lincoln High School (direct
// instruction, 2 Oct 2026: "the demo account should say Sarah Chen... is it
// defaulting to district? Dont let it"). A name typed in Settings, or a role
// picked in "Viewing as", lasts for that session only; the next visit starts
// clean, so a demo never opens on someone's real name or on the last role
// a previous demo left behind. Remove with real sign-in.
const DEMO_PERSONA = { name: "Sarah Chen", school: "Lincoln High School", role: "School Counselor" as CounselorRole };
const DEMO_SESSION_KEY = "dreamari:counselor-demo-session";
let demoSessionChecked = false;
export function ensureDemoSession(): void {
  if (demoSessionChecked) return;
  demoSessionChecked = true;
  try {
    if (window.sessionStorage.getItem(DEMO_SESSION_KEY)) return;
    window.sessionStorage.setItem(DEMO_SESSION_KEY, "1");
    const raw = window.localStorage.getItem(COUNSELOR_ACCOUNT_KEY);
    const current = raw ? normalize(JSON.parse(raw)) : EMPTY_COUNSELOR;
    window.localStorage.setItem(COUNSELOR_ACCOUNT_KEY, JSON.stringify({ ...current, ...DEMO_PERSONA }));
    // And on v4, the only version since 7 Oct 2026 (v2 and v3 retired:
    // "lets kill v2 and v3 and default the counselor dashboard to v4").
    window.localStorage.setItem("dreamari:counselor-version", "v4");
  } catch {
    // no storage: the account reads as empty and the shell's own fallbacks apply
  }
}

export function readCounselorAccount(): CounselorAccount {
  if (typeof window === "undefined") return EMPTY_COUNSELOR;
  ensureDemoSession();
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
  ensureDemoSession();
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
