// Counselor notes on a student -- keyed by student id, newest first. Same
// localStorage-as-record idiom as the rest of this prototype (no backend).
// Notes on seeded students are just as "real" as notes on the live student
// row here -- a counselor's own note-taking is real user input regardless
// of whether the student record underneath it is seeded or live.

const KEY = "dreamari-counselor-notes";

export type CounselorNote = { id: string; text: string; createdAt: string };

function readAll(): Record<string, CounselorNote[]> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? (parsed as Record<string, CounselorNote[]>) : {};
  } catch {
    return {};
  }
}

function writeAll(all: Record<string, CounselorNote[]>): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    // no storage: still works this session, just won't be remembered
  }
}

export function readNotes(studentId: string): CounselorNote[] {
  return readAll()[studentId] ?? [];
}

export function addNote(studentId: string, text: string): CounselorNote[] {
  const all = readAll();
  const note: CounselorNote = { id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`, text, createdAt: new Date().toISOString() };
  const next = [note, ...(all[studentId] ?? [])];
  all[studentId] = next;
  writeAll(all);
  return next;
}
