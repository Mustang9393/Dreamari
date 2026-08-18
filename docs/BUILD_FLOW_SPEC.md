# Build-profile flow — verbatim spec (captured from the Replit reference)

Source: https://dceeai.replit.app/build-profile/… walked end-to-end on 2026-08-19.
This is the exact userflow and copy the rebuilt `/flow` must follow. Copy is
verbatim — do not paraphrase. The Replit's "Skip" buttons are demo-only chrome and
are NOT part of the product flow (per direct instruction); "Previous" is real.

## Shared chrome (every step)

- Top bar: home icon + Dreamy wordmark.
- "BUILD" pill badge, gradient progress bar (blue -> purple -> pink), percent label.
- Steps at 88% and 100% additionally show an "Almost done" badge.
- Dreamy (the mascot) sits beside a speech bubble delivering each step's coaching
  line (listed per step below). In our rebuild Dreamy is the full interactive rig
  (eye tracking, parallax lean, sprite expression reactions to input) per direct
  request — the Replit uses a static image.
- Step content lives in a card with a gradient header strip: step icon, step
  title, constraint line.
- Footer: "Previous" (except step 1) + "Next Step" (disabled until valid).

## Steps

### 1. Interests — 13%
- Dreamy: "Start with what pulls your attention. ✨"
- Header: "Interests" / "Choose up to 2" (globe icon)
- Question: "What sounds interesting?" / "Choose up to 2"
- Tracker row: "Your picks" / "0 of 2 selected" (count updates)
- Options (13 worlds, exact labels): Arts, Media & Sport · Building &
  Construction · Business & Money · Counseling & Social Work · Driving, Flying &
  Shipping · Factories & Making Things · Food & Cooking · Health & Medicine ·
  Law, Safety & Justice · Personal Care & Community Services · Science &
  Research · Teaching & Education · Tech & Engineering
- Citation: "Harvard FAS Mignone + O*NET Interest Profiler"

### 2. Favorite Subjects — 25%
- Dreamy: "Pick the subjects you enjoy most. ✨"
- Header: "Favorite Subjects" / "Choose up to 2"
- Question: "Which subjects do you enjoy?" / "Choose up to 2"
- Options: Mathematics · Science · English/Literature · History · Art · Music ·
  Computer Science · Foreign Languages · Business · Psychology

### 3. Work Vibe — 38%
- Dreamy: "There is no right answer. Just choose what feels like you. ✨"
- Header: "Work Vibe" / "Pick one from each row"
- Question: "Where do you work best?" / "Pick one from each row."
- Row "YOUR ENERGY": Fast pace · Calm · Balanced
- Row "YOUR TEAM STYLE": Solo · Small team · Big team
- Summary card "Your Setup" echoing the two picks (placeholders "Energy…" /
  "Team…" until chosen)
- Citation: "MIT CAPD Self Assessment + O*NET Work Styles"

### 4. Milestone screen — 50% (between Work Vibe and Education)
- "50% COMPLETE" (eyebrow) / Dreamy image / heading "You're moving fast. 🚀" /
  subline "The good part is coming." / button "Continue" (with arrow)

### 5. Education & Training — 63%
- Dreamy: "How much education or training feels right? ✨"
- Header: "Education & Training" / "Choose one" (graduation-cap icon)
- Question: "How much school feels right for you?"
- Option cards (title / subtitle):
  - "Start work after HS" / "HS or short training"
  - "1–2 more years" / "Certificate or 2-year college"
  - "4 more years" / "4-year college"
  - "4+ more years" / "Advanced degree paths"
  - "Not sure yet" / "Show different options"

### 6. Education Cost — 75%
- Dreamy: "Choose a range that feels realistic. ✨"
- Header: "Education Cost" / "Choose one" (target icon)
- Question: "What total school or training cost feels realistic?" / "Select a
  range. You can change it later."
- "SELECTED RANGE" card showing the current label ("Select a range" until moved),
  discrete 6-stop slider: "As little as possible" · "$25,000 or less" · "$50,000
  or less" · "$100,000 or less" · "Over $100,000 for the right path" · "I'm not
  sure yet"
- Footnote: "These answers help Dreamari compare options, not rule out your
  dreams. You can change them later."
- (Slider is a prime "enhance interactive elements" target in our rebuild.)

### 7. Location — 88% ("Almost done" badge appears)
- Dreamy: "Choose states that feel possible for your next step. ✨"
- Header: "Location" / "Choose up to 3 states" (pin icon)
- Question: "Where are you open to going?" / "Choose up to 3 states. Your first
  choice is your top preference."
- Map | List segmented toggle.
  - Replit's Map tab is a GRID of state-abbreviation chips ("UNITED STATES" /
    "0/3 selected" / "Tap a state to add it.") — our rebuild replaces the grid
    with an ACTUAL USA map (real state shapes, tap/click to select, selection
    order = preference order), per direct instruction.
  - List tab: three dropdowns — "Choose a state", "Choose state 2 (optional)",
    "Choose state 3 (optional)" — each listing all 50 states + "Washington,
    D.C.". Keep this exactly.
- Citation: "MIT CAPD Job Search + BLS OEWS"

### 8. Profile Basics — 100% ("Almost done" badge)
- Dreamy: "Last step. Let's make your profile yours. ✨"
- Header: "Profile Basics" / "Name, email, grade, and GPA"
- Fields:
  - "What is your full name?" (text)
  - "What is your school email?" (email) + helper "Use your school email if you
    have one."
  - "What grade are you in?" — "Select grade..." / 8th grade · 9th grade · 10th
    grade · 11th grade · 12th grade · College · Other
  - "What is your current GPA?" + reassurance line "Your GPA does not define
    you. It just helps Dreamari find realistic schools and pathways." —
    "Select your GPA..." / 4.0 or higher · 3.5 to 3.9 · 3.0 to 3.4 · 2.5 to 2.9 ·
    2.0 to 2.4 · Below 2.0 · My school does not use GPA
- Footer: "Previous" + "Finish →" (loading state label: "Creating Profile")

### 9. Completion
- Dreamy with a green checkmark / "Congratulations!" / "Your profile is ready.
  Let's find your path."
- Path picker cards: "College" / "Majors & degrees" (grad cap) · "Trades" /
  "Skilled careers" (wrench) · "Both" / "Explore everything" (sparkle)
- Button: "See Matches →" (disabled until a path is picked)
- NOTE: the Replit shows this screen on a LIGHT lavender surface — decide
  deliberately whether we keep our dark system here or honor the light moment.

## Assets

- Dreamy expression sprites (10, 2000x2000, transparent) and 3 themed poses
  (1366x768: hard-hat builder w/ hammer, +2 more) unpacked at the session
  scratchpad under sprites/ — copy the needed ones into public/images/dreamy/
  with descriptive kebab-case names when the rebuild lands.

## Design source

- Figma frame for this flow: node 3009-15623 in Dreamari-Design-System-v2.0 —
  visual language + existing token bindings. (Pull pending: the desktop bridge
  needs the file as Figma's active tab.)
