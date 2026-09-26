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

Tab open → three groups of rows showing current answers → tap a row → editor sheet → change → Save → sheet closes, the row flashes a check, a toast names what is updating ("Saved. Updating your Explore careers."). It must never feel like retaking Build: one section at a time, current answers pre-filled.

## 4. Rules

### Page

- Title "Preferences". Under it, a "Shapes your" strip of four icon chips: Explore, Schools, Play, Career Report (see Decisions). Screen-reader text is Joshua's sentence: "Update your preferences to improve your recommendations as your interests change."
- "Last updated {date}" at the right of the header row (under it on phones), only once a save has happened.
- Rows are grouped, each group one card with divided rows:
  - **Your interests:** Industries, Saved Careers, Subjects & Skills, Skills & Software.
  - **After high school:** Education, College & Trade School.
  - **Work:** Work Style, Internships & Jobs (badge "Optional").
- A row shows its answers as chips that fit on one line, then "+n" (measured, never wraps). Saved Careers shows up to five posters and "N saved".
- An empty row shows "+ Add" in the accent color and no "Edit". The first empty row's "Add" glints (`dm-text-nudge`); others stay plain.

### Sections, fields and limits

Limits are shown as dots that fill (limits of 5 or fewer) or "n of m" (larger). At the cap, unpicked chips dim; tapping another replaces the oldest pick (Build's rule: locking picks out creates friction).

| Section | Fields | Limits | Shapes (editor line and save toast) |
|---|---|---|---|
| Industries | Industries I'm interested in (the 15 Build worlds) | max 3 | Explore careers, Play and Connect |
| Saved Careers | Read from the saved-careers store and the Top 3; no picking here | none | Career Report and My Plan |
| Subjects & Skills | Subjects I enjoy most; Skills I want to build | 5; 5 | Explore careers and Career Report |
| Skills & Software | Skills I have; Software I know; Software I want to learn. Options are suggested for the student's first saved career (Top 3 #1 first) from the Career Report, career profile and Explore's software list | none; none; 5 | Career Report and My Plan |
| Education | GPA (0 to 5, two decimals) and GPA type (Weighted / Unweighted / Not sure); Education pathways I'd consider (Trade / Certificate, 2-Year College, 4-Year College, Graduate / Professional, Not sure) | pathways max 2 | school matches and My Plan |
| College & Trade School | Preferred states; Distance from home (25 / 50 / 100 miles / Best opportunity); Yearly tuition budget; Campus setting; School size | states 3; campus 2; size 2 | school matches |
| Work Style | Pace (Fast-paced / Balanced / Steady); Team size; Where I'd like to work | team size 3; environment 3 | Explore careers |
| Internships & Jobs | Opportunity type (Internship, Summer Job, Part-Time, Apprenticeship, Full-Time); Preferred roles; Preferred work locations; Remote / Hybrid / In-person. Folded under "More job preferences": Graduation year, Availability, Willing to relocate (Yes / Maybe / No), Languages, Certifications / licenses, Portfolio or professional profile | roles 3; locations 3; modes 2 | internship and job matches |

Removed on Joshua's 26 Sept pass: Independent vs team and Structured vs flexible (Work Style); "How much education after high school" (folded into pathways); School Type (Education covers it); Preferred Industries in Jobs (carried over from Industries). The stored fields still exist for old data (see Data) but are not shown or edited.

### Editor sheet

- Title, and one accent line "Shapes your {areas}" with a sparkle icon.
- Save is disabled until something changed. Cancel, the X, the backdrop and Escape all close without saving.
- Saved Careers' sheet has one button, "Done" (edits apply immediately), plus "Find more in Explore" (`/explore`).
- Motion: backdrop fades; the sheet springs in (slides up on phones); chips spring on tap; the selected dot pops. `prefers-reduced-motion` skips entrances.

## 5. Data

- Store: `dreamari:preferences` in localStorage (`src/lib/preferences.ts`). Shape: `Preferences` in that file, normalized on every read (unknown or over-limit values are trimmed to the limits above).
- Seeding: when nothing is stored, answers seed from Build (`readStudentProfile()`: interests → industries, subjects, GPA, states, travel distance → distance, path → pathways) and the Top 3 (`readPicks()`).
- Write-back: saving writes the overlapping answers back to the student profile (`syncToProfile`): industries → Build interests (up to 3), subjects, GPA, states, distance, and pathways → Build's college / trades / both path. Build and Preferences stay one truth.
- Saved careers: `useSavedCareers()` (`src/lib/savedCareers.ts`), the same store Explore and Match write. Displayed order: Top 3 (ranked) first, then other saves. Removing unsaves in that store.
- Legacy fields still stored and ignored by the UI: `careers`, `workWith`, `structure`, `educationLevel`, `schoolTypes`, `jobs.industries`. Keep them readable for old data; don't show them.
- Backend contract (to build): GET the student's preferences (the `Preferences` shape) with the saved-careers list; PUT one section at a time (the sheet saves a whole section). The save toast's "Updating your ..." is a promise that those surfaces re-rank on their next load; it doesn't need a live push.

## 6. States and edge cases (the backend integration contract)

Preview each with `?prefs=` on `/profile?tab=preferences` (DEMO-ONLY, `useDemoPrefsState` in PreferencesTab.tsx).

| State | What shows | Preview |
|---|---|---|
| Loading | Skeleton rows in the three group cards (pulsing icon tile, title bar, chip bar), `aria-busy`. Never a flash of "Add" on every row before answers arrive. | `?prefs=loading` |
| Empty section | "+ Add" (first empty one glints), no "Edit". | a fresh browser |
| Save failed | The sheet stays open with every edit kept; a red line above the footer: "Couldn't save your changes. Your edits are still here."; Save becomes "Try again". | `?prefs=error`, then save any change |
| Saved | Sheet closes; the row's icon becomes a green check and the row tints briefly; toast "Saved. Updating your {areas}." for 4 s (above the bottom nav on phones). | any save |
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

- **The top sentence is a strip.** Joshua asked for "Update your preferences to improve your recommendations as your interests change." The user asked for the same point without a long sentence kids won't read. The "Shapes your Explore / Schools / Play / Career Report" strip names what the answers change (his own supporting line's list), and his sentence is its screen-reader text. Show both to Joshua if he wants the words back.
- **Say it at the moment it's true.** Instead of a supporting paragraph, each sheet says what it shapes and each save says what is updating.
- **Three groups, not eight cards,** so the page reads in three chunks.
- **Saved Careers is read-only selection.** Per Joshua: "Saved Careers should automatically reflect careers the student has already saved elsewhere. We should not make them select those careers again here."
