# My Profile: Preferences

Status: Built, in review with Joshua (26 Sept 2026). Code: `src/components/profile/PreferencesTab.tsx` (UI), `src/lib/preferences.ts` (store), `src/components/profile/preferencesOptions.ts` (option lists). Route: `/profile?tab=preferences`.

Source: Joshua's Slack spec (25 Sept 2026) and his second pass (26 Sept 2026), ported from `dceeai.replit.app/my-profile#preferences`. Where the build deviates from his wording, it says so below under Decisions.

## 1. Who

- **Students, grades 9 to 12 and college.** They answered Build once and may think those answers are permanent. Here they update them any time, without retaking Build.
- **Counselors (300+ students each).** They read these answers to understand a student fast: what they like, what they're considering, what school and education they want, and whether the Career Report and My Plan line up with that. The counselor view is not built yet; this tab is its data source.
- **Dreamari itself.** The answers personalize Explore, schools, Play, Connect, Career Reports and My Plan, and later internships and jobs (18+).

## 2. Use cases

1. A Grade 11 student who picked Tech & Engineering in Grade 9 now prefers Business & Finance: they open Industries, swap it, save, and their recommendations shift.
2. A student wants to see and prune what they've saved: Saved Careers shows every saved career, Top 3 first; they remove the ones they've lost interest in.
3. A student sets how far from home and how much they can pay for school: College & Trade School, save, school matches update.
4. An older student sets internship preferences (types, roles, locations, remote/hybrid).

## 3. Journeys

Tab open → one list of Joshua's eight sections showing current answers → tap a row → editor sheet → change → Save → sheet closes, the row shows a check and opens a band under it showing what changed (for Industries, posters of careers now in Explore and "See them"). It must never feel like retaking Build: one section at a time, current answers pre-filled.

## 4. Rules

### Page

- Title "Preferences", then Joshua's line verbatim, one line on desktop (balanced wrap on phones): "Update your preferences to improve your recommendations as your interests change." His optional supporting line is left out; the save confirmation shows what changed instead (see Feedback).
- "Last updated {date}" at the right of the header row (under it on phones), only once a save has happened.
- One list, one card with divided rows, in Joshua's order: Industries, Saved Careers, Subjects, Work Style, Education, College & Trade School, Skills & Software, Internship & Job Preferences (badge "Optional"). No icons, no group headers.
- A row shows its answers as chips that fit on one line, then "+n" (measured, never wraps). Saved Careers shows up to five posters and "N saved".
- An empty row shows "+ Add" in the accent color and no "Edit". The first empty row's "Add" glints (`dm-text-nudge`); others stay plain.

### Feedback (the "this changes your Dreamari" moment)

Instead of explaining it in copy, each save shows the change:

- Industries: posters of careers now surfacing from the chosen industries, "New in Explore for {industries}", and a "See them" button to `/explore`.
- College & Trade School: "{n} schools match in {states}" (states and budget applied to the colleges catalog) and "See schools" to `/colleges`.
- Every other section: "Updating your {areas}" (the "Shapes" column below).
- It opens as a band directly under the row just edited (green-tinted, inline, not a floating toast; a bottom toast was easy to miss), with a check beside the row's title. It folds away after 7 s. Reduced motion shows and hides it without animating.

### Sections, fields and limits

Limits are shown as dots that fill (limits of 5 or fewer) or "n of m" (larger). At the cap, unpicked chips dim; tapping another replaces the oldest pick (Build's rule: locking picks out creates friction).

| Section | Fields | Limits | Shapes (named in the save band) |
|---|---|---|---|
| Industries | Industries I'm interested in (the 15 Build worlds) | max 3 | Explore careers, Play and Connect |
| Saved Careers | Read from the saved-careers store and the Top 3; no picking here | none | Career Report and My Plan |
| Subjects | Subjects I enjoy most | 5 | Explore careers and Career Report |
| Skills & Software | Skills I have; Skills I want to build; Software I know; Software I want to learn. Options are suggested for the student's first saved career (Top 3 #1 first) from the Career Report, career profile and Explore's software list | none; 5; none; none | Career Report and My Plan |
| Education | GPA (0 to 5, two decimals) and GPA type (Weighted / Unweighted / Not sure); Education pathways I'd consider (Trade / Certificate, 2-Year College, 4-Year College, Graduate / Professional, Not sure) | pathways max 2 | school matches and My Plan |
| College & Trade School | Preferred states; Distance (25 / 50 / 100 miles / Best opportunity); Yearly tuition budget; Campus setting; School size | states 3; campus 2; size 2 | school matches |
| Work Style | Fast-paced or steady (Fast-paced / Balanced / Steady, as in Joshua's Replit); Preferred team size; Preferred work environment | team size 3; environment 3 | Explore careers |
| Internship & Job Preferences | Opportunity type (Internship, Summer Job, Part-Time, Apprenticeship, Full-Time); Preferred roles; Preferred work locations; Remote / Hybrid / In-person. Folded under "More job preferences": Graduation year, Availability, Willing to relocate (Yes / Maybe / No), Languages, Certifications / licenses, Portfolio or professional profile | roles 3; locations 3; modes 2 | internship and job matches |

Removed on Joshua's 26 Sept pass: Independent vs team and Structured vs flexible (Work Style); "How much education after high school" (folded into pathways); School Type (Education covers it); Preferred Industries in Jobs (carried over from Industries). The stored fields still exist for old data (see Data) but are not shown or edited.

### Editor sheet

- Title only (no explainer line); the save confirmation carries the "what this changes" message.
- Save is disabled until something changed. Cancel, the X, the backdrop and Escape all close without saving.
- Saved Careers' sheet has one button, "Done" (edits apply immediately), plus "Find more in Explore" (`/explore`).
- Motion: backdrop fades; the sheet springs in (slides up on phones); chips spring on tap; the selected dot pops. `prefers-reduced-motion` skips entrances.

## 5. Data

- Store: `dreamari:preferences` in localStorage (`src/lib/preferences.ts`). Shape: `Preferences` in that file, normalized on every read (unknown or over-limit values are trimmed to the limits above).
- Seeding: when nothing is stored, answers seed from Build (`readStudentProfile()`: interests → industries, subjects, GPA, states, travel distance → distance, path → pathways) and the Top 3 (`readPicks()`).
- Write-back: saving writes the overlapping answers back to the student profile (`syncToProfile`): industries → Build interests (up to 3), subjects, GPA, states, distance, and pathways → Build's college / trades / both path. Build and Preferences stay one truth.
- Saved careers: `useSavedCareers()` (`src/lib/savedCareers.ts`), the same store Explore and Match write. Displayed order: Top 3 (ranked) first, then other saves. Removing unsaves in that store.
- Legacy fields still stored and ignored by the UI: `careers`, `workWith`, `structure`, `educationLevel`, `schoolTypes`, `jobs.industries`. Keep them readable for old data; don't show them.
- Backend contract (to build): GET the student's preferences (the `Preferences` shape) with the saved-careers list; PUT one section at a time (the sheet saves a whole section). The save band's "Updating your ..." is a promise that those surfaces re-rank on their next load; it doesn't need a live push.

## 6. States and edge cases (the backend integration contract)

Preview each with `?prefs=` on `/profile?tab=preferences` (DEMO-ONLY, `useDemoPrefsState` in PreferencesTab.tsx).

| State | What shows | Preview |
|---|---|---|
| Loading | Skeleton rows in the three group cards (pulsing icon tile, title bar, chip bar), `aria-busy`. Never a flash of "Add" on every row before answers arrive. | `?prefs=loading` |
| Empty section | "+ Add" (first empty one glints), no "Edit". | a fresh browser |
| Save failed | The sheet stays open with every edit kept; a red line above the footer: "Couldn't save your changes. Your edits are still here."; Save becomes "Try again". | `?prefs=error`, then save any change |
| Saved | Sheet closes; the row's icon becomes a green check and the row tints briefly; the proof band under the row (see Feedback), 7 s. | any save |
| Nothing changed | Save disabled. | open any sheet |

Edge cases:

- **Saved careers, any count.** 0: "+ Add"; the sheet says "Nothing saved yet." with Find more in Explore. 1 to 5: every poster. More than 5: five posters and "N saved" (tested for 7 from Match, and for 40+ later); the sheet's grid scrolls inside the sheet. Top 3 careers carry their rank badge and cannot be removed here (change them on Top Three).
- **A saved career with no poster** (catalog miss): the tile shows the title on the neutral surface, no broken image.
- **Long titles** ("Architectural & Engineering Manager"): two-line clamp on posters; row chips truncate at 200px.
- **More stored answers than the limit** (old data, or Build allowing more): trimmed to the limit on read.
- **Industries → Build write-back**: Build's own picker may allow fewer worlds than Preferences' 3; Build must accept up to 3 on read.
- **No saved career** for Skills & Software suggestions: generic skills and software lists (`GENERIC_SKILLS`, `GENERIC_SOFTWARE`).
- **GPA** outside 0 to 5 or non-numeric: the input is `type=number` 0 to 5; the backend must still validate.
- **Grade.** Internships & Jobs is shown to everyone as Optional and last. When the backend has the grade, hide or fold it below Grade 11 (Joshua: "can become more prominent as students get older").

## Decisions

- **Content is Joshua's, word for word; only the experience is ours.** Sections, fields, limits and labels follow his two notes. Where his notes repeat a field, it appears once: "Skills I want to build" is listed under both Subjects & Skills and Skills & Software; it lives in Skills & Software (with career-based suggestions), the way his own Replit does it, and the first section is "Subjects". Confirm with Joshua.
- **Industries max 3 (his note) vs Build's 2 worlds.** Saving 3 writes 3 back to Build's interests; Build must accept 3 on read, or Joshua picks one limit for both. Open question.
- **The explanation is a moment, not a sentence.** His top line stays verbatim; his optional supporting line is replaced by the save confirmation that shows what changed (posters, a school count). A student learns it by seeing it once.
- **No icons, one list,** so the page reads as his eight sections and nothing else.
- **Saved Careers is read-only selection.** Per Joshua: "Saved Careers should automatically reflect careers the student has already saved elsewhere in Dreamari. We should not make them select those careers again here."
