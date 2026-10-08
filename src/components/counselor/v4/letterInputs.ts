"use client";

// What a recommendation letter is written from (9 Oct 2026, Maisha: "Remove
// Student Brag Sheet and Family Questionnaire as counselor-generated
// document types. These should instead be inputs students/families complete
// that Dreamari can use when helping generate a Recommendation Letter. For
// example: Student Brag Sheet · received; Family Input Form · received;
// Student career interests · available; Counselor notes · available;
// Generate Recommendation Letter.").
//
// Four inputs per student, each with a status and, when it is there, the
// sentence the generated letter uses. The brag sheet is the student's own
// (counselorLetters.ts evidence, the same one v5's letters queue shows);
// career interests come from their Dreamari matches; counselor notes are
// the notes on the student's profile. A missing brag sheet or family form
// can be asked for: the ask goes to the student as a message (so it shows
// in Messages > Sent) and is remembered here.

import { useSyncExternalStore } from "react";
import { evidenceFor } from "@/lib/counselorLetters";
import { readNotes } from "@/lib/counselorNotes";
import { createLocalRecord, seedHash, shortDate } from "@/lib/localRecord";
import type { CounselorStudent } from "@/lib/counselorRoster";

export type LetterInputKey = "brag" | "family" | "interests" | "notes";
export type LetterInput = {
  key: LetterInputKey;
  label: string;
  /** there to draw on */
  ok: boolean;
  /** "Received", "Not received", "Available", "None yet", "Asked Oct 9" */
  word: string;
  /** sentences the letter can use */
  sentences: string[];
  /** a missing input the counselor can ask for */
  canAsk: boolean;
};

// DEMO-ONLY: the Family Input Form is a family-side feature still to
// build, so who has sent one back, and the line the letter quotes, are
// seeded per student until those forms come from the family app.
const FAMILY_LINES = [
  (f: string) => `${f}'s family describes ${f} as the one who keeps everyone organized at home.`,
  (f: string) => `At home, ${f} helps care for younger siblings while keeping up with school.`,
  (f: string) => `${f}'s family says ${f} never gives up on a hard problem, at school or at home.`,
  (f: string) => `${f}'s family has watched ${f} grow more confident this year, and so have I.`,
];
// DEMO-ONLY: a counselor's note history is seeded for most students so the
// letter has something to draw on before the counselor has written any.
const NOTE_LINES = [
  (f: string) => `In our meetings, ${f} comes prepared and follows through on what we agree.`,
  (f: string) => `When ${f} hit a hard stretch this year, ${f} asked for help early and used it well.`,
  (f: string) => `${f} has met with me regularly and always arrives with thoughtful questions.`,
];

const asks = createLocalRecord<Record<string, string>>("dreamari-counselor-letter-input-asks", {});
export const useLetterInputAsks = () => asks.useValue();
export function askForInput(studentId: string, key: LetterInputKey): void {
  asks.update((a) => ({ ...a, [`${studentId}:${key}`]: new Date().toISOString().slice(0, 10) }));
}

/** How many notes the counselor has saved on this student (live). */
export function useNoteCount(studentId: string | undefined): number {
  return useSyncExternalStore(
    (cb) => { window.addEventListener("storage", cb); window.addEventListener("focus", cb); return () => { window.removeEventListener("storage", cb); window.removeEventListener("focus", cb); }; },
    () => (studentId ? readNotes(studentId).length : 0),
    () => 0,
  );
}

export function letterInputs(s: CounselorStudent, noteCount: number, asked: Record<string, string>): LetterInput[] {
  const first = s.name.split(" ")[0];
  const h = seedHash(s.id);
  const askedWord = (key: LetterInputKey) => (asked[`${s.id}:${key}`] ? `Asked ${shortDate(asked[`${s.id}:${key}`])}` : "Not received");

  const brag = evidenceFor(s).filter((e) => e.source === "Brag sheet" || e.source === "Resume");
  const familyIn = s.grade >= 11 && h % 3 !== 0;
  const tops = s.topMatches.slice(0, 2).map((m) => m.title);
  const seededNote = h % 3 !== 2;
  const notesOk = noteCount > 0 || seededNote;

  return [
    { key: "brag", label: "Student Brag Sheet", ok: brag.length > 0, word: brag.length ? "Received" : askedWord("brag"), sentences: brag.map((e) => e.sentence), canAsk: !brag.length },
    { key: "family", label: "Family Input Form", ok: familyIn, word: familyIn ? "Received" : askedWord("family"), sentences: familyIn ? [FAMILY_LINES[h % FAMILY_LINES.length](first)] : [], canAsk: !familyIn },
    { key: "interests", label: "Career Interests", ok: tops.length > 0, word: tops.length ? "Available" : "None yet", sentences: tops.length ? [`${first}'s strongest career interests are ${tops.join(" and ")}, and ${first} has chosen coursework with them in mind.`] : [], canAsk: false },
    { key: "notes", label: "Counselor Notes", ok: notesOk, word: notesOk ? "Available" : "None yet", sentences: notesOk ? [NOTE_LINES[h % NOTE_LINES.length](first)] : [], canAsk: false },
  ];
}

/** The message a missing input's ask sends (student facing: 8th grade). */
export function askMessage(key: LetterInputKey, first: string): string {
  return key === "brag"
    ? `Hi ${first}, I am getting ready to write your recommendation letter. Please fill in your brag sheet in Dreamari. It tells me what you are proud of.`
    : `Hi ${first}, I am getting ready to write your recommendation letter. Please ask your family to fill in the Family Input Form in Dreamari. It helps me tell your story.`;
}
