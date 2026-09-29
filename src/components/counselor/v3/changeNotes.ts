// The (i) notes for v3 (29 Sept 2026). v3 is v2 plus the counselor
// platform research build, so a screen v3 did not touch keeps v2's note
// (what changed from the Replit), and a screen it did touch explains what
// changed from v2 and why, per the standing rule to document the why of
// every major change. Sources: the "US School Counselor Platform Research"
// PDF, checked independently in the Google Doc "Counselor dashboard and
// student app: gaps and what to build".
//
// UI copy: no em dashes (standing rule).

import type { CounselorView } from "../roles";
import { CHANGE_NOTES as V2_NOTES, type ChangeNote } from "../v2/changeNotes";

const FROM_V2 = { changedHeading: "What changed from v2, and why", keptHeading: "Kept from v2" } as const;

export const CHANGE_NOTES: Record<CounselorView, ChangeNote> = {
  ...V2_NOTES,
  overview: {
    ...FROM_V2,
    summary: "The counselor's morning in one list, then this season's job, then the caseload.",
    decisions: [
      { change: "Today replaces Needs your attention", why: "The research's first ask is one ranked \"who needs me today\" list. v2 listed At Risk students only, while letters due, meetings, reviews waiting and seniors without a FAFSA lived on five screens. Each row now says why in a few words and has one action." },
      { change: "Ranked by what is time-bound first", why: "A meeting at 10:15 or a letter due in six days cannot wait; a batched job can. Done jobs stay in the list with a check so the morning's progress shows." },
      { change: "A season strip under Today", why: "A counselor's year runs on a calendar (applications and letters in fall, financial aid and registration in winter, decisions in spring, enrollment in summer). The strip shows three numbers for this season's job and changes with the date; ?season= previews another." },
    ],
    kept: "Every At Risk student v2 listed, with the same reason and severity word (Show all). Student Status and Career Pathways unchanged.",
    order: "Today first because it is the day's work, the season second because it frames the week, the caseload snapshots last.",
  },
  productivity: {
    ...FROM_V2,
    summary: "v2's document hub, with the recommendation letter built around evidence.",
    decisions: [
      { change: "Letter requests as a third mode", why: "Who asked, for where, due when, and whether it is sent, soonest first. It reads the roster's own Recommendation Letter milestone, so it agrees with the Milestone Tracker." },
      { change: "Evidence beside the draft, and the draft opens with it", why: "AI letter drafts are standard now (SchooLinks' Recommendation Letter Agent, Naviance 2025-26). The difference is a letter that says something only this student did: their brag sheet, resume and Dreamari activity, each one tap into the letter." },
      { change: "A letter check", why: "A 2025 study (Inside Higher Ed, July 2025) found counselors write shorter letters for students of color. Every letter is compared with the counselor's own average length and checked for specifics and general praise, so no student gets the short version by accident. No demographic data is used or needed." },
      { change: "Mark as sent", why: "Closes the request, records the length for the average, and logs the time." },
    ],
    kept: "All four templates, Generate and Write my own, the US Letter page, full screen, print, copy, save to notes, and Needs attention.",
    order: "Documents first; letter requests soonest due first; sent letters last.",
  },
  impact: {
    ...V2_NOTES.impact,
    summary: `${V2_NOTES.impact.summary} v3 adds Time use.`,
    decisions: [
      ...V2_NOTES.impact.decisions,
      { change: "v3: a Time use section with ASCA's 80/20", why: "ASCA recommends at least 80% of a counselor's time on direct and indirect student services. The research names lost time (scheduling, proctoring) as the daily pain with no way to show it. v3 logs reviews, letters, reminders and meetings automatically; the rest is one tap." },
    ],
  },
  meetings: {
    ...FROM_V2,
    summary: "New: office hours, the week's bookings, and notes that go to the profile.",
    decisions: [
      { change: "A Meetings screen for counselors with a caseload", why: "The research lists booking a counselor as a core student need and meeting notes as a core counselor one; SchooLinks, Naviance and Xello all schedule. v2 had meeting briefs but no meetings." },
      { change: "Prep opens v2's meeting brief already drafted", why: "The brief existed; now it is one click from the meeting it is for." },
      { change: "Notes save to the student's profile and log the time", why: "One action does the three things a counselor does after a meeting today in three places." },
    ],
    kept: "Not in v2. Uses v2's Student Meeting Brief and the profile's notes.",
    order: "Meetings that need notes first, then today, then the week in time order.",
  },
  "financial-aid": {
    ...FROM_V2,
    summary: "New: every senior's FAFSA in three states, with the fix and one action each.",
    decisions: [
      { change: "Completed, Submitted but incomplete, Not submitted", why: "The research's three states. v2 counted Financial Aid as one milestone, so an incomplete FAFSA (usually a parent who has not signed) looked the same as one never started." },
      { change: "Opt-out form on file", why: "Illinois, like New Jersey where the pilot runs, requires the FAFSA, the state application or an opt-out form to graduate. The opt-out counts toward the requirement and is recorded here." },
      { change: "To confirm", why: "A student's report that they filed waits for the counselor's confirmation, the same pattern as Review Queue." },
    ],
    kept: "The roster's Financial Aid milestone is the source, so the counts agree with the Milestone Tracker and Readiness.",
    order: "Not submitted, then incomplete, then waiting to be confirmed, then completed.",
  },
};
