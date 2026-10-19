// My Plan v2 content (lib/top3Flow, 19 Oct 2026): the same Fall / Winter /
// Spring seasons and In app / Out of app columns, with In app steps written
// for the student's #1 career. Chandu: "Keep the on app off app, and fall /
// etc designs just give it better content", "guide them to play,
// simulations, glossaries, ANYTHING that helps them", "add... schedule a
// meeting with your counselors, keep it locked till the student hits the
// share career report with counselor thing".
//
// Grounded in the student interviews (Oct 2026): after Top 3, 0 of 5 knew
// what to do next; their next wants were "see what school or training I
// need" (2), "learn more about these careers" (1), "talk to someone who does
// this job" (1). So Fall opens with exactly those three.
//
// Rules: Out of app steps are untouched. Existing In app steps keep their
// ids (the counselor dashboard tracks them) and only get career wording and
// a better link where one exists. Added steps never repeat a label the
// season already has. The source data (gradePlanData.ts) is not changed.

import { simulationFor } from "@/components/play/games";
import { glossaryFor } from "@/components/glossary/data";
import { ALL_PROFILE_CAREERS, type ProfileCareer } from "./data";
import type { GradeStep, GradeWindow } from "./gradePlanData";

export type CareerStep = GradeStep & {
  /** opens in the page instead of a link (the counselor booking sheet) */
  action?: "book-meeting";
  /** waits for another step; shown locked until that one is done */
  waitsFor?: { id: string; reason: string };
};

export const SHARE_REPORT_ID = "career-share-report";
export const BOOK_MEETING_ID = "career-book-meeting";
export const SAVE_SCHOOLS_ID = "career-save-schools";
export const SAVE_PROGRAM_ID = "career-save-program";

type Grade = 9 | 10 | 11 | 12;

export function careerWindows(windows: GradeWindow[], career: ProfileCareer, grade: Grade, topIds: string[]): GradeWindow[] {
  const id = career.id;
  const title = career.title;
  const sim = simulationFor(id);
  // The career's glossary game has levels (Finance Terms: four). One level a
  // season, each opening that exact level (Chandu, 19 Oct 2026: "we have
  // levels to glossary games so maybe that can also be incorporated").
  const g = glossaryFor(id);
  const levelStep = (n: number, sid: string): CareerStep | null => {
    const lesson = g?.lessons.find((l) => l.lessonNumber === n);
    return lesson ? { id: sid, label: "PLAY", inApp: true, title: `${g!.industryTitle} Level ${n}: ${lesson.title}`, href: `/play/glossary/${id}?lesson=${n}` } : null;
  };
  const levels = (sids: [number, string][]) => sids.map(([n, sid]) => levelStep(n, sid)).filter((x): x is CareerStep => x !== null);
  const level1 = levelStep(1, "career-glossary-1");
  const similar = ALL_PROFILE_CAREERS.find((c) => c.world === career.world && !topIds.includes(c.id)) ?? ALL_PROFILE_CAREERS.find((c) => !topIds.includes(c.id));
  const s = (sid: string, label: GradeStep["label"], stepTitle: string, href?: string, extra?: Partial<CareerStep>): CareerStep => ({ id: sid, label, inApp: true, title: stepTitle, href, ...extra });

  // Career wording for the existing in-app steps, by id (ids unchanged).
  const retitle: Record<string, Partial<GradeStep>> = {
    "g9-winter-play": sim ? { title: `Play the ${title} simulation`, href: `/play?focus=${sim.id}` } : {},
    "g10-fall-play": { title: `Play 3 games about ${title}` },
    // Grade 11's glossary milestone becomes Level 1 of this career's glossary
    "g11-fall-play": level1 ? { title: level1.title, href: level1.href } : {},
    "g11-fall-explore": { title: `Save 3 schools for ${title}`, href: "/colleges?view=foryou" },
    "g9-spring-connect": { title: `Ask 2 ${title} pros a question`, href: "/connect?tab=communities" },
    "g10-spring-connect": { title: `Ask 3 ${title} pros how they started`, href: "/connect?tab=communities" },
    "g11-spring-connect": { title: `Ask 3 ${title} pros for advice`, href: "/connect?tab=communities" },
  };

  const added: Record<GradeWindow["id"], CareerStep[]> = {
    fall: [
      ...levels([[1, "career-glossary-1"]]),
      // the interview wants, in their order
      // learning steps land on the career page's own section, opened and
      // scrolled to (?tab=, CareerDetailExperience; Chandu, 19 Oct 2026)
      s("career-training", "LEARN", `See the school or training ${title} needs`, `/career/${id}?tab=education`),
      s("career-watch", "EXPLORE", `Watch a day in ${title}`, `/career/${id}?tab=overview&section=what-they-do`),
      s("career-follow", "CONNECT", "Follow someone who does this job", "/connect"),
      // Grade 9 already plays it in Winter (g9-winter-play, reworded above)
      ...(sim && grade !== 12 && grade !== 9 ? [s("career-sim", "PLAY", `Play the ${title} simulation`, `/play?focus=${sim.id}`)] : []),
    ],
    winter: [
      ...levels([[2, "career-glossary-2"]]),
      s(SHARE_REPORT_ID, "PLAN", "Share your Career Report with your counselor", "/profile?tab=report"),
      s(BOOK_MEETING_ID, "PLAN", "Book a meeting with your counselor", undefined, { action: "book-meeting", waitsFor: { id: SHARE_REPORT_ID, reason: "After you share your Career Report" } }),
      ...(grade <= 10 ? [s(SAVE_SCHOOLS_ID, "EXPLORE", `Save 3 schools for ${title}`, "/colleges?view=foryou")] : []),
    ],
    spring: [
      ...levels([[3, "career-glossary-3"], [4, "career-glossary-4"]]),
      ...(grade !== 12 ? [s(SAVE_PROGRAM_ID, "EXPERIENCE", `Save a summer program for ${title}`, "/opportunities?tab=programs")] : []),
      ...(grade >= 10 ? [s("career-scholarship", "FUND", "Save a scholarship", "/opportunities?tab=scholarships")] : []),
      ...(similar && grade !== 12 ? [s("career-similar", "EXPLORE", `Try a similar career: ${similar.title}`, `/career/${similar.id}`)] : []),
    ],
  };

  // Out of app: everything the season already had stays; these come after it
  // (Chandu: "dont remove what was already there in the out of app stuff.
  // Just add to it"). Self-reported, except the counselor meeting itself.
  const outS = (sid: string, label: GradeStep["label"], stepTitle: string, extra?: Partial<CareerStep>): CareerStep => ({ id: sid, label, inApp: false, title: stepTitle, ...extra });
  const addedOut: Record<GradeWindow["id"], CareerStep[]> = {
    fall: [
      outS("career-club", "JOIN", `Join a club or class linked to ${title}`),
      ...(grade === 11 ? [outS("career-psat", "PREPARE", "Take the PSAT", { deadlineBound: true })] : []),
    ],
    winter: [
      outS("career-shadow", "EXPERIENCE", `Shadow someone in ${title} for a day`),
      outS("career-meet-counselor", "PLAN", "Meet with your counselor", { counselorVerified: true, counselorNote: "Bring your Career Report and one question about what comes next.", waitsFor: { id: BOOK_MEETING_ID, reason: "After you book it" } }),
    ],
    spring: [
      outS("career-volunteer", "VOLUNTEER", `Volunteer or work somewhere near ${title}`),
      ...(grade === 11 ? [outS("career-sat", "PREPARE", "Sign up for the SAT or ACT", { deadlineBound: true })] : []),
    ],
  };

  return windows.map((w) => {
    const existing = w.steps.map((st) => (st.inApp && retitle[st.id] ? { ...st, ...retitle[st.id] } : st));
    const taken = new Set(existing.filter((st) => st.inApp).map((st) => `${st.label}:${st.title.toLowerCase()}`));
    const titles = new Set(existing.map((st) => st.title.toLowerCase()));
    const extra = added[w.id].filter((st) => !taken.has(`${st.label}:${st.title.toLowerCase()}`) && !titles.has(st.title.toLowerCase()));
    // new in-app steps first, then the season's own, then the new out-of-app ones
    const extraOut = addedOut[w.id].filter((st) => !titles.has(st.title.toLowerCase()));
    return { ...w, steps: [...extra, ...existing, ...extraOut] };
  });
}
