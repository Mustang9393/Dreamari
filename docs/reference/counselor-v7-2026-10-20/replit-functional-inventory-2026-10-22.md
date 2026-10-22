# Replit Counselor Dashboard: functional inventory (2026-10-22)

Source: https://dceeai.replit.app/dreamari-counselor-dashboard (Joshua's "official Counselor Dashboard" Replit), walked click by click on 22 Oct 2026 in the built-in browser pane. Purpose: let an engineer make another build match it 1:1 in behaviour. Copy is quoted exactly as rendered (the UI uppercases many labels via CSS; the accessible name is given where it differs).

Conventions in this file:

- "(type)" is one of: tab, sub-tab, button, link, textbox, select, checkbox, radio, chip, card, stat, table, dialog, toast, static.
- "toast" means the dark pill that appears bottom-right for a few seconds. It lives outside the Radix "Notifications (F8)" region (it is a custom element), so it is not announced as a notification.
- Where a control could not be opened or exercised, it is marked "(could not open)" or "(not exercised)".
- The whole dashboard is one route (`/dreamari-counselor-dashboard`). Every top tab, sub-tab, drawer and dialog is in-page state; the URL never changes. A hard reload always lands on HOME with all state reset.

Shared site chrome (outside the dashboard, listed once):

- **Dreamy** (link): home `/`.
- **EXPLORE / PLAY / SCHOOLS & TRADES / CONNECT / My Profile / Counselor Dashboard / Volunteer Dashboard** (links): site nav; `Counselor Dashboard` is the active one.
- **V2** (button): opens a dropdown of site links: My Profile (Reference) `/v2-my-profile`, Resume `/resume`, Talent Dashboard `/talent/dashboard`, Corporate Dashboard `/corporate/dashboard`, Parent Dashboard `/parent/dashboard`, Counselor Dashboard `/counselor/dashboard`, Counselor V2 Dashboard `/v2-counselor-dashboard`, Play Level 2 `/v2-games`, Connect `/v2-connect`, Volunteer Dashboard `/v2-volunteer-dashboard`, Choose Your Path `/user-selection`. Not part of the dashboard.
- **Messages, 3 unread** (button, icon + badge "3"): opens the Inbox dialog (see "Inbox dialog" under section 7) with no thread selected.
- **16,825** (link): `/dream-score`, the student-side dream score pill; present on every page.
- Hamburger (button): collapsed nav at narrow widths.

---

## HOME

Reached by: the HOME tab (default after load/reload), and nothing else navigates here.

### Hero and the three stat cards

- **COUNSELOR WORKSPACE** (static eyebrow).
- **Welcome back, Sarah.** (heading).
- **Prepare for a meeting** (button, primary, right of the heading): switches to the PREPARE tab (Agenda view, current week). No dialog.
- **REVIEWS** (card): big number `14`, caption `waiting for you`.
  - **Start reviewing** (button): switches to the STUDENTS tab, full directory, no filter applied, "121 students". There is no review queue anywhere in this prototype; this button is just a navigation.
- **UPCOMING MEETINGS** (card): big number `4`, caption `this week`, then `Next: Omar Hassan` and `Mon · Oct 19 · 10:00 AM`.
  - **View schedule** (button): switches to the PREPARE tab (Agenda view, current week).
  - Note: the card says 4 meetings this week but PREPARE's agenda for the same week says "6 meetings"; the numbers are independent hard-coded strings.
- **NEEDS ATTENTION / AT RISK** (card): value `6 students`.
  - **Review students** (button): switches to STUDENTS with the Status filter preset to "Needs Attention" (Filters badge shows `1`, a chip `Needs Attention` and `Clear all` appear). The resulting list shows the 4 Needs Attention rows only; At Risk rows are not included, and the header still reads "121 students".

### YOUR STUDENTS' INTERESTS

- **YOUR STUDENTS' INTERESTS** (heading) with subline `What they're curious about`.
- **Explore careers** (button, right of the heading): switches to the EXPLORE tab, CAREERS sub-tab.
- Six interest tiles (each a button with a count badge, a career name and an industry line), in order:
  - `22` **REGISTERED NURSE** · Health & Medicine
  - `19` **INVESTMENT BANKING** · Business & Finance
  - `18` **SOFTWARE ENGINEER** · Tech & Engineering
  - `15` **ANIMATOR** · Arts, Media & Sport
  - `14` **LAWYER** · Law, Safety & Justice
  - `10` **ENVIRONMENTAL SCIENTIST** · Science & Research
  - Clicking any tile switches to EXPLORE > CAREERS. It does not open that career's modal and does not prefill the search box. Caveat: EXPLORE remembers its last sub-tab, so if SCHOOLS was last open the tile lands on SCHOOLS.

### LOCAL WORK-BASED LEARNING OPPORTUNITIES

- **LOCAL WORK-BASED LEARNING OPPORTUNITIES** (heading) with subline `New This Week`.
- **View all opportunities** (button): switches to OPPORTUNITIES > Discover.
- Five opportunity cards in a horizontal rail (type pill, title, org, location · deadline, match count, two buttons), in order:
  1. `Career Experience` **JPMorgan Career Exploration Day** · JPMorgan Chase · `New York, NY · Deadline Nov 12` · `12 students match`
  2. `Job Shadow` **Hackensack Meridian Health Job Shadow** · Hackensack Meridian Health · `Hackensack, NJ · Deadline Nov 18` · `8 students match`
  3. `Apprenticeship / Skilled Trade` **Electrical Apprenticeship Info Session** · Newark Workforce Partners · `Newark, NJ · Deadline Nov 22` · `16 students match`
  4. `Internship` **Summer Software Internship** · Hudson Tech Collaborative · `Jersey City, NJ · Deadline Dec 1` · `10 students match`
  5. `Career Experience / WBL` **Healthcare Career Exploration Program** · Newark Health Careers Collaborative · `Newark, NJ · Deadline Dec 5` · `11 students match`
  - **View** (button on each card): switches to OPPORTUNITIES > Discover. On HOME it does NOT open the detail dialog (unlike the same button on the Opportunities page).
  - **Share** (button on each card): opens the "Share opportunity" dialog in place, on HOME, for that card (see OPPORTUNITIES > Share opportunity dialog).

---

## STUDENTS

Reached by: STUDENTS tab, HOME > Start reviewing, HOME > Review students (with filter), EXPLORE career modal > View students (with hidden filter), profile > Back to Students.

### Student directory

- **STUDENT DIRECTORY** (heading), subline `Find students, see where they stand, and identify who may need support.`
- **121 students** (static count): never changes, even when filters or search reduce the rows.
- **Search students...** (textbox, accessible name "Search students"): live filter on name and career interest (typing `software` leaves Charlotte Davis and Aisha Patel, both Software Engineer). Clearing restores the list.
- **Filters** (button, toggles an inline filter panel below the toolbar; shows a numeric badge with the number of active filters, e.g. `1`). Panel contents, all native selects:
  - **Grade** (select): `All grades`, `Grade 9`, `Grade 10`, `Grade 11`, `Grade 12`.
  - **Status** (select): `All statuses`, `On Track`, `Needs Attention`, `At Risk`.
  - **Postsecondary plan** (select): `All plans`, `4-Year College`, `2-Year College`, `Trade / Technical School`, `Workforce`, `Military`, `Undecided / Exploring`.
  - **GPA** (select): `Any GPA`, `3.5+`, `3.0–3.49`, `2.5–2.99`, `Below 2.5`, `Not Entered`.
  - Choosing a value filters rows immediately and adds a chip row under the toolbar ("Active filters"): one chip per active filter (e.g. `Grade 12`, `Needs Attention`) plus **Clear all** (button). Clicking a chip removes that filter; Clear all removes all visible chips.
- **Export** (button): toast `Student export prepared for this demo.` No file download.
- **Message selected (N)** (button, appears only after at least one row checkbox is checked; N = checked count): opens the Inbox dialog with the first selected student's thread open (see section 7).
- Table (columns, in order): **STUDENT**, **GRADE**, **STATUS**, **CAREER INTEREST**, **POSTSECONDARY PLAN**, **PROGRESS**, **LAST ACTIVE**. Each row is a single button containing a leading checkbox (accessible name `Select <name> for group message`), initials avatar, and the cell values. Clicking anywhere on the row except the checkbox opens the profile.
- Default rows (8, in this order; only 8 demo rows exist despite "121"):
  1. OH **Omar Hassan** · Grade 12 · AT RISK · Investment Banking · 4-Year College · Career Report overdue · 3 days ago
  2. EW **Elizabeth Wilson** · Grade 12 · AT RISK · Registered Nurse · 4-Year College · Academic Plan overdue · Today
  3. OC **Olivia Chen** · Grade 11 · NEEDS ATTENTION · Graphic Designer · Undecided · Career Report needs changes · 2 days ago
  4. CD **Charlotte Davis** · Grade 12 · NEEDS ATTENTION · Software Engineer · 4-Year College · Academic Plan overdue · Yesterday
  5. EC **Ethan Clark** · Grade 9 · NEEDS ATTENTION · Environmental Scientist · Exploring · 4 milestones not started · 5 days ago
  6. AP **Aisha Patel** · Grade 11 · ON TRACK · Software Engineer · 4-Year College · Plan reviewed · Today
  7. DW **Dante Williams** · Grade 10 · NEEDS ATTENTION · Sports Medicine · Exploring · Check-in response due today · Today
  8. MT **Maya Thompson** · Grade 12 · ON TRACK · Lawyer · 4-Year College · Applications in progress · Yesterday
- Status pills: `AT RISK` (red), `NEEDS ATTENTION` (amber), `ON TRACK` (green).
- Hidden-filter quirk: arriving via EXPLORE career modal > **View students** applies an industry filter that has no chip and is NOT removed by Clear all or by re-clicking the STUDENTS tab; only a reload clears it (see Interaction rules).

### Student profile (row click)

Header:

- **Back to Students** (button): returns to the directory with the previous filters, chips and open Filters panel intact.
- Avatar initials, **<Student name>** (heading), status pill (`AT RISK` / `ON TRACK` / `NEEDS ATTENTION`), then `Grade 12 · Investment Banker · 4-Year College` (grade · primary career · postsecondary goal).
- **Prepare Meeting** (button): opens the meeting brief screen for this student in an unscheduled state: the header reads `Meeting not scheduled` and `Time and duration · Not recorded` instead of a date/time. Its **Back to Agenda** goes to PREPARE (Agenda). Everything else on that screen is identical to the scheduled brief (see PREPARE > Meeting brief).
- **Message** (button): opens the Inbox dialog with this student's thread selected.
- **Add Note** (button): opens the "Meeting note · <name>" dialog (see PREPARE > Meeting note dialog).
- Profile sub-tabs (buttons in a `<nav>` named "<name> profile sections"): **About Me** (default), **Postsecondary Plan**, **Career Plan**, **Course Planner**, **Activity**.

#### About Me (default)

- **POSTSECONDARY GOAL** (card): heading `4-Year College`; `PREFERRED SCHOOLS` `NYU · Rutgers University · Baruch College` (Maya shows `Explore schools · Compare options` when none); `PREFERRED LOCATION` `New York / New Jersey`.
  - **View Postsecondary Plan** (button): switches to the Postsecondary Plan sub-tab.
- **CAREER GOAL** (card): heading `Investment Banker`; ordered list `01 Investment Banker`, `02 Financial Analyst`, `03 Accountant`; `PRIMARY INDUSTRY` `Business & Finance`.
  - **View Career Plan** (button): switches to the Career Plan sub-tab.
- **STUDENT-STATED / Preferences** (section): `SUBJECTS` Math · Economics; `INDUSTRIES` Business & Finance · Technology; `LOCATION PREFERENCES` New York · New Jersey; `EDUCATION PREFERENCE` Bachelor's Degree; `TUITION BUDGET` $25,000 / year; `WORK STYLE` Collaborative · Hands-on; `GPA` 3.4.

#### Postsecondary Plan

- Goal card: `Postsecondary goal` / **4-Year College** / `Preferred location: New York / New Jersey` / `Education preference: Bachelor's degree` / `Student-stated · demo plan`.
- **Saved / considered schools** (list): `Reach` NYU · `Target` Rutgers University · `Target` Baruch College · `Safety` Example School (demo). Not clickable.
- **Applications & financial aid** (list): `Application status` Needs review · `FAFSA` Not started · discuss · `Scholarships` Explore opportunities · `Final decision` Not yet recorded.
- **Relevant milestones** (list with status pills): `Confirm postsecondary direction` In progress · `Build and review school list` To review · `Track application requirements` To review · `Discuss financial aid and scholarships` To review.
- Footnote: `Additional pathway sections can adapt to 2-year college, trade or technical programs, apprenticeship…`.

#### Career Plan

- Goal card: `Career goal` / **Investment Banker** / `Primary industry · Business & Finance` / `Student-stated direction`.
- **Top 3 careers**: `01 Investment Banker`, `02 Financial Analyst`, `03 Accountant`.
- **Saved careers & industries**: chips `Investment Banker`, `Financial Analyst`; `Industries` Business & Finance · Technology; `Exploration` 14 careers explored · 7 saved.
- **Learning & next steps**: `Related simulations` Investment Banker simulation · Financial Analyst career preview; `Education pathways` Finance · Economics · Accounting; `Career activities` Exploration tasks and simulation practice; `Career report` Career Report overdue.
- Footnote: `Career matches and activities are demo content for discussion, not a prescribed recommendation.`

#### Course Planner

- Eyebrow `Connect academics to student goals`, heading **Course planner**, `Illustrative planning view`.
- **Current courses · demo**: English 12, Mathematics, Math elective, U.S. History (each pill `Current`).
- **Next year plan · discuss together**: English, Mathematics, Math, Student-selected elective (each pill `To review`).
- **Graduation progress**: heading `Review requirements`; `Confirm credits and requirements against the student’s school record.`; `Required courses remaining` / `Verify with school transcript`.
- **Career-aligned courses to consider** (`For Investment Banker interests`): arrow list Economics, Statistics, AP Calculus, Business / Entrepreneurship. Not clickable. Footnote: `Options to explore with the student—not requirements or placement advice.`

#### Activity

- Eyebrow `Dreamari engagement · demo snapshot`, heading **Student activity**.
- Stat grid (value / label): `3 days ago` Last active · `8 days` Current streak · `14` Careers explored · `7` Saved careers · `3 / 3` Top 3 careers · `11` Schools explored · `5` Saved schools · `4 played` Career simulations · `3 completed` Simulation progress · `12` Videos watched · `7 / 10` Planner tasks · `3 completed` Glossary games · `4 interactions` Connect activity · `Started` Resume.
- **Worth a conversation** (aside): heading `Preference change`; `Omar recently added Florida to his preferred locations. His current list also includes New York and New Jersey.`
- **Recent activity** (timeline): Today `Saved Rutgers University` · Yesterday `Completed Investment Banker Simulation` · 2 days ago `Changed #2 career from Accountant to Financial Analyst` · 3 days ago `Watched JPMorgan Chase London Office Tour` · 4 days ago `Completed planner task: Explore 10 careers`.
- **Meeting history**: `2026-10-19 · 10:00 AM` Career Report overdue · Needs Prep; `2026-11-13 · 9:30 AM` Student planning meeting · Ready. Not clickable.
- Footnote: `Activity counts and events are illustrative prototype data; they are not verified student records.`

---

## EXPLORE

Reached by: EXPLORE tab, HOME > Explore careers, HOME interest tiles.

- **EXPLORE** (heading), subline `Discover careers, pathways, and workforce insights to strengthen every student conversation.`
- Sub-tabs (buttons): **CAREERS** (default), **SCHOOLS**, **LABOR MARKET**. The chosen sub-tab is remembered while the page is alive.

### CAREERS

- **4-YEAR CAREERS** / **TRADES & TECHNICAL** (segmented buttons, group "Career pathway"; 4-YEAR is default).
- **What are your students interested in?** (heading).
- **Search careers...** (textbox): live filter by career name across sections; empty sections disappear (`nurse` leaves only HEALTH & MEDICINE > Registered Nurse).
- **Filters** (button, toggles an inline panel):
  - **Interest / Subject** (select): `Any interest / subject`, `Math`, `Science`, `Business`, `Technology`, `Healthcare`, `Art`, `Sports`, `Animals`, `Helping People`, `Working With My Hands`, `Design`.
  - **Industry** (select): `All Industries`, `Arts, Media & Sport`, `Business & Finance`, `Health & Medicine`, `Tech & Engineering`, `Science & Research`, `Law, Safety & Justice`, `Education & Social Impact`, `Building & Construction`, `Driving, Flying & Shipping`, `Factories & Making Things`, `Fixing Machines & Engines`.
  - **Education** (select): `Any education`, `Bachelor's degree`, `Graduate degree`, `Apprenticeship`, `Certificate`, `High school / training`, `Associate degree`.
- 4-YEAR CAREERS sections and cards (each card is a button: eyebrow `CAREER PATH`, name, `<field> · <education>`):
  - ARTS, MEDIA & SPORT: Animator (Arts & Media · Bachelor's degree), Graphic Designer (Arts & Media · Bachelor's degree), Sports Coach (Sports · Bachelor's degree)
  - BUSINESS & FINANCE: Investment Banker, Financial Analyst, Accountant, Management Analyst, Marketing Manager (all Business & Finance · Bachelor's degree)
  - HEALTH & MEDICINE: Registered Nurse (Healthcare · Bachelor's degree), Physician Assistant (Healthcare · Graduate degree), Physical Therapist (Healthcare · Graduate degree), Healthcare Administrator (Healthcare · Bachelor's degree), Dietitian (Healthcare · Bachelor's degree)
  - TECH & ENGINEERING: Software Engineer (Technology · Bachelor's degree), Data Scientist (Technology · Bachelor's degree), Civil Engineer (Engineering · Bachelor's degree)
  - SCIENCE & RESEARCH: Environmental Scientist (Science & Research · Bachelor's degree), Veterinarian (Science & Research · Graduate degree)
  - LAW, SAFETY & JUSTICE: Lawyer (Law & Justice · Graduate degree)
  - EDUCATION & SOCIAL IMPACT: Teacher (Education · Bachelor's degree)
- TRADES & TECHNICAL sections and cards (eyebrow `SKILL PATH`):
  - BUILDING & CONSTRUCTION: Electrician, Plumber, Carpenter (Skilled Trades · Apprenticeship), HVAC Technician, Construction Equipment Operator (Skilled Trades · Certificate)
  - DRIVING, FLYING & SHIPPING: Commercial Pilot, Aircraft Technician, Truck Driver (Transportation · Certificate), Railroad Worker (Transportation · High school / training), Logistics Technician (Transportation · Associate degree)
  - FACTORIES & MAKING THINGS: Industrial Machinery Mechanic (Manufacturing · Certificate)
  - FIXING MACHINES & ENGINES: Automotive Technician, Diesel Technician (Automotive · Certificate), Aviation Maintenance Technician (Transportation · Certificate), Heavy Equipment Technician (Manufacturing · Certificate)

#### Career overview modal (any career card, also labor-market cards)

- Centered modal, eyebrow `CAREER OVERVIEW`, heading = career name, one-line description (e.g. Animator: `Creates visual sequences for film, games, and digital media.`; Registered Nurse: `Coordinates and provides patient care in a range of healthcare settings.`).
- Field grid: **MEDIAN PAY** `—` · **EDUCATION / TRAINING** (e.g. `Bachelor's degree or portfolio-based training`) · **CAREER GROWTH** `—` · **DEMAND IN NEW JERSEY** `—` · **RELATED MAJORS OR TRAINING** (e.g. `Animation, digital media, or visual effects`) · **SIMILAR CAREERS** (e.g. `Graphic Designer · Video Editor`). Pay/growth/demand are always em-dashes.
- **Close career details** (icon button, top right) and **Close** (button): close the modal. Escape does NOT close it.
- **View students** (button, primary): switches to STUDENTS with a hidden industry filter (no chip). From Animator the list showed only Olivia Chen (Graphic Designer, Arts & Media). Any previously active chips stay active too. See Interaction rules for the clearing quirk.

### SCHOOLS

- **Find a school or pathway** (heading).
- **Search schools** (textbox, placeholder `Search colleges, trade schools, or training programs...`).
- **Filters** (button, inline panel): **State** (select: `New Jersey`, `New York`, `Pennsylvania`, `Massachusetts`, `Florida`), **School type** (`Any school type`, `4-Year University`, `2-Year College`, `Technical / Trade School`), **Setting** (`Any setting`, `City`, `Suburb`, `Rural`), **Size** (`Any size`, `Small`, `Medium`, `Large`), **Program / Major** (textbox, placeholder `Type a program`).
- **Explore in** (select, in a card above the lists): same five states; default `New Jersey`.
- Sections and cards (cards are static `<article>`s, not clickable; each shows name, `City, NJ`, `Acceptance Rate —`, `Tuition & Fees —`):
  - 4-YEAR UNIVERSITIES: Rutgers University–New Brunswick (New Brunswick, NJ), Montclair State University (Montclair, NJ), Seton Hall University (South Orange, NJ), New Jersey Institute of Technology (Newark, NJ)
  - 2-YEAR COLLEGES: Bergen Community College (Paramus, NJ), Hudson County Community College (Jersey City, NJ), Essex County College (Newark, NJ)
  - TECHNICAL SCHOOLS: Lincoln Tech (Union, NJ), Universal Technical Institute (Bloomfield, NJ)
- Other states were not exercised for content.

### LABOR MARKET

- Card: heading **Labor Market**, `Explore in` + state select (`New Jersey` default; `New York`, `Pennsylvania`, `Massachusetts`, `Florida`). Changing it rewrites the three section headings (`… IN NEW YORK`) but the card lists stayed identical.
- Scope segmented buttons: **ALL CAREERS** (default), **4-YEAR CAREERS**, **TRADES & TECHNICAL**.
- Three horizontal rails, each with a heading and a **View Top 25** (button) that expands the rail from 10 to 25 cards and relabels itself **Show fewer**:
  - **MOST IN-DEMAND CAREERS IN NEW JERSEY**: `#1 · DEMAND` Registered Nurse (Health & Medicine), #2 Electrician (Building & Construction), #3 Software Engineer (Tech & Engineering), #4 HVAC Technician, #5 Accountant, #6 Truck Driver, #7 Physical Therapist, #8 Civil Engineer, #9 Plumber, #10 Data Scientist; expanded adds #11 Medical and Health Services Manager, #12 Actuary, #13 Occupational Therapist, #14 Biologist, #15 Carpenter, #16 Diesel Technician … (cards show `Median pay —`, `Annual openings —`, `Demand —`).
  - **GROWING FASTEST IN NEW JERSEY**: `#1 · GROWTH` Data Scientist, #2 Wind Turbine Technician, #3 Solar Photovoltaic Installer, #4 Physical Therapist, #5 Software Engineer, #6 HVAC Technician, #7 Nurse Practitioner, #8 Electrician, #9 Environmental Scientist, #10 Logistics Technician (cards show `Projected growth —` and `Training <value>`; items without a catalog entry show industry `Career pathway` and `Training varies`).
  - **TOP PAYING CAREERS IN NEW JERSEY**: `#1 · PAY` Physician Assistant, #2 Lawyer, #3 Software Engineer, #4 Investment Banker, #5 Data Scientist, #6 Commercial Pilot, #7 Physical Therapist, #8 Civil Engineer, #9 Registered Nurse, #10 Electrician (cards show `Median pay —`, `Training <value>`).
- Clicking a labor-market card opens the same Career overview modal as CAREERS.

---

## PREPARE

Reached by: PREPARE tab, HOME > Prepare for a meeting, HOME > View schedule, any brief's Back to Agenda, Risk list > Prepare meeting (opens a brief whose Back lands here).

### Header controls

- **PREPARE FOR A STUDENT MEETING** (heading, accessible name "Prepare for a student meeting"), subline `Get ready before every conversation.`
- **Today** (button): exists in the DOM but is positioned off-canvas / zero-size, so it cannot be clicked (could not open). Intended to jump back to the current week.
- **‹** / **›** (buttons): step one MONTH, not one week. The agenda jumps to the Mon–Fri week that contains the 1st of the previous/next month (from Oct 19–23, › shows "Oct 26 – Oct 30" because Nov 1 is a Sunday; ‹ from there shows "Sep 28 – Oct 2").
- **Month picker** (select, default `October 2026`; options January 2026 … December 2026): same rule, shows the week containing the 1st of the chosen month.
- **Add meeting** (button, primary): opens the Add meeting dialog.
- **Agenda** / **Calendar** (segmented buttons; Agenda default). Choice is remembered within the page session: Back to Agenda from a brief returns to whichever view was active.
- **Search student meetings…** (textbox): on typing, a **Matching students** panel appears ABOVE the agenda (the agenda below is not filtered). Each match is a card: initials avatar, `Olivia Chen · Grade 11`, `Next: Tuesday, Oct 20 · 11:00 AM`, `Meeting history: Tuesday, Oct 20 · Career interests changed · Tuesday, Oct 27 · Career planning · Monday, Nov 2 · Postsecondary planning`, and a **Prepare** (button) that opens that student's brief. Clearing the box removes the panel.
- Default week on load: Mon Oct 19 – Fri Oct 23, 2026 (the week containing the prototype "today").

### Agenda view

- Week heading **Oct 19 – Oct 23** and summary line `6 meetings · 2 need prep · 2 ready` (the "need prep" fragment is a highlighted span; "ready" counts READY rows only; ACTION REQUIRED / REQUESTED / CANCELED are counted in neither).
- Day groups (heading per day; days with no meetings are omitted) and meeting rows. Each row: time (`10:00 AM`) with duration below (`30 min`); a name button `<Name> · Grade N` with 1–3 agenda lines; a status label; action buttons. Default week:
  - Monday, Oct 19: `10:00 AM / 30 min` **Omar Hassan · Grade 12** · Career Report overdue · FAFSA not started · 2 college applications remaining · `NEEDS PREP` · **Prepare**
  - `1:30 PM / 20 min` **Maya Thompson · Grade 12** · College application check-in · Applications in progress · `READY` · **Prepare**
  - Tuesday, Oct 20: `11:00 AM / 30 min` **Olivia Chen · Grade 11** · Career interests changed · Postsecondary plan incomplete · `NEEDS PREP` · **Prepare**
  - Thursday, Oct 22: `9:00 AM / 15 min` **Dante Williams · Grade 10** · Check-in requested · Course plan needs review · Career Report incomplete · `ACTION REQUIRED` (red) · **Prepare**
  - `2:00 PM / 30 min` **Jordan Rivera · Grade 11** · College planning · Review school list · `REQUESTED` · **Confirm** · **Suggest time** · **Decline**
  - Friday, Oct 23: `10:00 AM / 30 min` **Aisha Patel · Grade 11** · Course planning · Review next-semester options · `READY` · **Prepare**
- Status colours: NEEDS PREP amber, READY green, ACTION REQUIRED red, REQUESTED blue-grey, CANCELED green-grey.
- **Prepare** (button, per row) and the **name block** (button, per row): both open the meeting brief for that meeting.
- **Confirm** (button, REQUESTED rows only): toast `Meeting request confirmed.`; the row's status becomes `NEEDS PREP`, the three buttons are replaced by a single **Prepare**, and the summary becomes `6 meetings · 3 need prep · 2 ready`.
- **Suggest time** (button): toast `Choose an available time to suggest to Jordan.`; the button shows a pressed/selected state; nothing else changes (no slot picker appears; clicking a calendar slot afterwards was not exercised).
- **Decline** (button): toast `Meeting request declined.`; status becomes `CANCELED`, buttons replaced by **Prepare**; summary unchanged (`2 need prep · 2 ready`). The row is not removed.
- Below the week: three **Week of …** accordion cards (button each): `Week of Oct 26` / `Monday, Oct 26 – Friday, Oct 30` / `6 meetings`; `Week of Nov 2` / `Monday, Nov 2 – Friday, Nov 6` / `4 meetings`; `Week of Nov 9` / `Monday, Nov 9 – Friday, Nov 13` / `7 meetings`. Clicking expands the card inline with that week's rows (time, name, lines, status, Prepare) without day headings and without navigating. The three cards always follow the displayed week (e.g. after › they read Week of Nov 2 / Nov 9 / Nov 16 `0 meetings`).
  - Week of Oct 26 rows: Mon 9:00 AM Elizabeth Wilson (Academic check-in · Academic Plan overdue · READY); Tue 10:30 AM Olivia Chen (Career planning · Career Report needs changes · READY); Wed 11:00 AM Charlotte Davis (Course planning · Academic Plan overdue · READY); Thu 1:00 PM Ethan Clark (Academic check-in · 4 milestones not started · READY); Fri 2:00 PM Aisha Patel (Career planning · READY); Fri 3:00 PM Dante Williams (Course planning · Check-in response due today · READY). All 30 min. Summary for that week: `6 meetings · 0 need prep · 6 ready`.
  - Week of Nov 2 rows: 9:00 AM Olivia Chen (Postsecondary planning · Career Report needs changes · READY); 11:00 AM Charlotte Davis (Postsecondary planning · Academic Plan overdue · NEEDS PREP); 1:00 PM Ethan Clark (Postsecondary planning · 4 milestones not started · READY); 2:30 PM Aisha Patel (Postsecondary planning · READY).
  - Week of Nov 9 (7 meetings) and later were not expanded.
- Footer line: `Availability this week · Mon 9:00 AM – 3:00 PM · Tue 10:00 AM – 4:00 PM · Thu 9:00 AM – 3:00 PM · Fri 9:00 AM – 12:00 PM` and **Manage availability** (button): opens the Manage availability dialog. The line re-renders from the dialog's saved values.

### Calendar view

- Inner card header: eyebrow `WEEK OF` (or `MONTH`), heading `Oct 19 – Oct 23` (or `October 2026`), and a second **Week** / **Month** segmented pair inside the card (there is also one in the toolbar; both control the same state; Week default).
- **Week grid**: columns Mon 19 … Fri 23 (day name + date number), rows 9:00 AM … 4:00 PM hourly. Open availability hours are lightly shaded. Meetings render as blocks at their start time showing name and `Grade N` (Omar 10:00 Mon, Maya 1:30 Mon, Olivia 11:00 Tue, Dante 9:00 Thu in a red tint for ACTION REQUIRED, Jordan 2:00 Thu, Aisha 10:00 Fri). Confirmed meeting blocks are buttons that open the brief; Jordan's REQUESTED block is plain text (not clickable).
- **Month grid**: Mon–Fri only, six rows (Sep 28 → Nov 6), each day cell is a button; meeting chips inside cells are text `10:00 AM · Omar Hassan` (not individually clickable). Clicking a day cell switches to Week view for that day's week.
- Footer: `Open time is lightly shaded · Manage your weekly hours and office blocks` and **Manage availability** (button).

### Add meeting dialog

- Centered modal (`<form>`), eyebrow `SCHEDULE A CONVERSATION`, heading **Add meeting**, X close button.
- **Student** (select, default `Omar Hassan`; options Omar Hassan, Elizabeth Wilson, Olivia Chen, Charlotte Davis, Ethan Clark, Aisha Patel, Dante Williams, Maya Thompson).
- **Date** (native date input, `dd/mm/yyyy`).
- **Time** (native time input).
- **Duration** (select, default `15 minutes`; `20 minutes`, `30 minutes`, `45 minutes`, `60 minutes`).
- **Meeting Type** (select, default `In Person`; `Virtual`).
- **Location** (textbox, placeholder `Counselor office or video call`).
- **Reason** (select, default `Career Planning`; `Postsecondary Planning`, `Course Planning`, `FAFSA / Financial Aid`, `Application Support`, `Academic Check-In`, `General Check-In`, `Other`).
- **Cancel** (button): closes. **Schedule meeting** (submit button): not exercised (form submission is permission-gated in this session); whether it adds a row to the agenda is unverified.

### Manage availability dialog

- Modal, eyebrow `WEEKLY SCHEDULE PREFERENCES`, heading **Manage availability**, X close.
- Five labelled text inputs (free text): **Monday** `9:00 AM – 3:00 PM`, **Tuesday** `10:00 AM – 4:00 PM`, **Wednesday** `Unavailable`, **Thursday** `9:00 AM – 3:00 PM`, **Friday** `9:00 AM – 12:00 PM`.
- Helper: `Edit recurring hours, block time, or add office hours.`
- **Block time** (button): overwrites the Monday field with `Blocked · 2:00–3:00 PM`.
- **Add office hours** (button): overwrites the Wednesday field with `Office hours · 1:00–3:00 PM`.
- **Save availability** (button, primary): closes the dialog, toast `Availability saved.`, and the agenda footer re-renders, e.g. `Availability this week · Mon Blocked · 2:00–3:00 PM · Tue 10:00 AM – 4:00 PM · Wed Office hours · 1:00–3:00 PM · Thu 9:00 AM – 3:00 PM · Fri 9:00 AM – 12:00 PM`. The calendar shading did not visibly change. Values are lost on reload.

### Meeting brief (Prepare / name block / calendar block / profile Prepare Meeting / Risk list Prepare meeting)

A full-page screen replacing the PREPARE content (the top tab stays on PREPARE even when opened from STUDENTS or ANALYTICS).

- **Back to Agenda** (button): returns to PREPARE in whichever Agenda/Calendar view was last active (from the profile and Risk list it also lands on PREPARE, not back where you came from).
- Header card: **<Name>** (heading), `Grade 12`, status pill (`At Risk` / `Needs Attention`), then right-aligned `Monday, Oct 19` / `10:00 AM` / `30 minutes` (or `Meeting not scheduled` / `Time and duration · Not recorded` when opened from a profile or the Risk list). Stat strip: **GPA** `3.4` · **PRIMARY OCCUPATION** `Investment Banker` · **POSTSECONDARY GOAL** `4-Year College` · **PREFERRED LOCATIONS** `New York, New Jersey`.
- **POSTSECONDARY GOAL** (section): heading `4-Year College`; note `Student-reported list; Reach, Target, and Likely are planning labels, not admissions predictions.`; three columns **REACH** (New York University), **TARGET** (Rutgers University, Baruch College), **LIKELY** (Example University), each school with `Location · Not recorded` and a **View School** (button) that only toasts `<School> details are not available.` For a student without a list (Dante) the section shows `College list Not recorded for this student.`
  - **COLLEGE PLANNING** (grid, each with `Student reported` caption): COLLEGE LIST `4 schools` · APPLICATIONS `2 started · 1 submitted` · COMMON APP `Not started` · FAFSA `Not started` · TRANSCRIPT `Requested` · RECOMMENDATIONS `1 of 2 received` · SCHOLARSHIPS `3 saved` · FINAL DECISION `Not yet` (all `Not recorded` for Dante).
- **CAREER GOALS** (section): `TOP 3 CAREERS · STUDENT REPORTED` 01 Investment Banker 02 Financial Analyst 03 Accountant; SUBJECTS `Math · Economics`; INDUSTRIES `Business & Finance · Technology`; EDUCATION PREFERENCE `Bachelor's Degree`; WORK STYLE `Not recorded`.
  - **RELATED CAREERS TO EXPLORE** (horizontal rail of image cards, each a button with eyebrow `RELATED CAREER`, name, industry): Asset Manager, Private Equity Associate, Corporate Finance Analyst, Financial Planner, Management Consultant (all Business & Finance). Clicking only toasts `<Career> opened in career exploration.` (no navigation). Dante's rail: Athletic Trainer, Occupational Therapist (industry shown as `Career`). This rail overflows the page horizontally at narrow widths.
- **ACTIONS TO COMPLETE** (section): numbered rows `01…` each with a title, a one-line description and one button:
  - `Career Report overdue` / `Review the current report before the meeting.` / **Complete for this session**
  - `FAFSA status` / `Student reports not started; review the aid timeline together.` / **Review**
  - `Transcript status` / `Student reports requested; confirm what each application needs.` / **Review**
  - `Recommendation letters` / `Student reports 1 of 2 received; confirm the remaining letter.` / **Review**
  - Dante has one row: `Check-in response due today` / `Check in on the student's response.` / **Complete for this session**.
  - **Complete for this session**: removes the row, renumbers the rest, and adds a collapsed group button **Completed (1)** at the bottom; expanded (label becomes **Hide (1)**) it lists the item with a check icon and caption `Completed during meeting`.
  - **Review**: same, but the caption is `Reviewed during meeting`; the counter increments (`Hide (2)`).
- **After the Conversation** (sticky bottom bar, heading `After the Conversation`), buttons left to right:
  - **Mark Meeting Complete**: toast `Meeting marked complete.`; the button turns green and relabels to **Meeting Complete**. The agenda row's status was not observed to change (state is lost on reload; not verified in-session).
  - **Assign Task**: toast `Assign Task started for Omar Hassan.`; the button keeps a selected highlight. No dialog.
  - **Add School**: toast `Add School started for Omar Hassan.` No dialog.
  - **Recommend Career**: toast `Recommend Career started for Omar Hassan.` No dialog.
  - **Update Plan**: toast `Update Plan started for Omar Hassan.` No dialog.
  - **Add Meeting Note**: opens the Meeting note dialog (below).
  - **Log Meeting**: toast `Meeting log opened.` No dialog.

### Meeting note dialog (brief > Add Meeting Note; profile > Add Note)

- Modal, accessible name "Add internal meeting note", eyebrow `INTERNAL COUNSELOR DOCUMENTATION`, heading **Meeting note · <Name>**, X close.
- Helper: `This note stays in the counselor profile and is not sent as a message.`
- Textarea (placeholder `Discussed, follow-up, and next steps…`).
- **Cancel** (button): closes. Escape does not close.
- **Save internal note** (button, primary): with empty text does nothing (dialog stays, no validation message). With text: closes and toasts `Internal meeting note saved to the student profile.` The note is not displayed anywhere afterwards (Activity tab unchanged).

---

## OPPORTUNITIES

Reached by: OPPORTUNITIES tab, HOME > View all opportunities, HOME card > View.

- **OPPORTUNITIES** (heading), subline `Discover, share, and track experiences that support student goals.`
- **Add opportunity** (button, primary, top right): replaces the list area with an inline form (not a modal); see below.
- Sub-tabs (buttons in a `<nav>`): **Discover** (default), **Applications**. Clicking Discover also dismisses the Add opportunity form.

### Discover

- **Search opportunities...** (textbox): live filter on title/org/category; sections with no matches show an empty-state line, e.g. `No volunteer match this search and filter set. Clear a filter or try another search.` (`No part-time jobs match …`).
- **Filters** (button, inline panel; badge shows active count; active filters become chips + **Clear all**):
  - **Type** (select): `All Types`, `Internship`, `Part-Time Job`, `Volunteer`, `Career Event`, `Summer Program`, `Job Shadow`, `Apprenticeship`, `Work-Based Learning`.
  - **Career / Industry** (select): `All Careers`, `Business & Finance`, `Healthcare`, `Skilled Trades`, `Technology`, `Education & Social Impact`, `Sports & Recreation`, `Hospitality`, `Health & Medicine`, `Science & Research`, `Tech & Engineering`, `Arts, Media & Sport`.
  - **Location** (select): `All Locations`, `Local / Nearby`, `Virtual`, `New Jersey`, `New York`, `City`, `Newark`, `Hackensack`, `Jersey City`.
  - **Grade** (select): `All Grades`, `Grade 9`, `Grade 10`, `Grade 11`, `Grade 12`.
  - **Deadline** (select): `Any Deadline`, `This Week`, `Next 30 Days`, `Next 60 Days`.
- Five horizontal rails (heading + cards; each card: type pill, title, org, `City, ST · Deadline <date>`, `N students match`, **View**, **Share**):
  - **PART-TIME JOBS**: Retail Associate (Maple Street Market · Newark, NJ · Dec 14 · 7), Library Assistant (Newark Public Library · Newark · Dec 18 · 5), Recreation Center Assistant (Jersey City Recreation · Jersey City · Dec 20 · 9), Restaurant Team Member (The Corner Table · Hackensack · Dec 22 · 6), Youth Program Assistant (Boys & Girls Club of Newark · Newark · Jan 4 · 8)
  - **VOLUNTEER**: Community Food Bank Volunteer (Community FoodBank of NJ · Hillside · Dec 9 · 13), Hospital Volunteer Program (Hackensack Meridian Health · Hackensack · Dec 16 · 10), Youth Sports Volunteer (Newark Youth League · Newark · Dec 11 · 6), Animal Shelter Volunteer (Newark Animal Shelter · Newark · Dec 19 · 8), Neighborhood Clean-Up Crew (Passaic River Coalition · Newark · Dec 13 · 11)
  - **CAREER EVENTS**: JPMorgan Career Exploration Day (Career Experience · 12), Hackensack Meridian Health Job Shadow (Job Shadow · 8), Electrical Apprenticeship Info Session (Apprenticeship / Skilled Trade · 16), Healthcare Career Exploration Program (Career Experience / WBL · 11), Technology Career Day (Newark Tech Collaborative · Dec 10 · 17), Skilled Trades Open House (Hudson County Building Trades · Jersey City · Dec 17 · 14), Media & Entertainment Career Panel (Garden State Media Lab · Dec 12 · 9), Finance Careers Roundtable (Newark Workforce Partners · Dec 21 · 12), Healthcare Career Exploration Program again (duplicate card)
  - **SUMMER PROGRAMS**: Summer STEM Program (Rutgers–Newark Youth Programs · Feb 2 · 15), Business Leadership Program (Newark Community Foundation · Feb 8 · 10), Healthcare Exploration Program (University Hospital Newark · Feb 12 · 13), Design & Media Summer Academy (Garden State Media Lab · Feb 15 · 8), Skilled Trades Summer Program (Hudson County Building Trades · Jersey City · Feb 20 · 12)
  - **INTERNSHIPS**: Summer Software Internship (Hudson Tech Collaborative · Jersey City · Dec 1 · 10), Finance Internship (Newark Workforce Partners · Jan 12 · 9), Healthcare Internship (University Hospital Newark · Jan 18 · 12), Marketing Internship (Garden State Media Lab · Jan 20 · 7), Engineering Internship (PSEG · Jan 26 · 14), Summer Software Internship again (duplicate card)
- **View** (button on a card): opens the Opportunity details dialog.
- **Share** (button on a card): opens the Share opportunity dialog directly.

#### Opportunity details dialog

- Centered modal: eyebrow `<Type> · <Industry>` (e.g. `Part-Time Job · Business & Finance`), **Close opportunity details** (X), heading = title, `<Org> · <City, ST>`, description paragraph (`Help customers, stock seasonal items, and learn day-to-day retail operations. Weekend shifts available.`).
- Field grid: **ELIGIBILITY** `Students who are curious about this field and can meet the listed schedule.` · **GRADES** `Grades 10–12` · **FORMAT** `In Person` · **DEADLINE** `Dec 14` · **DATES** `Upcoming session – See program details` · **APPLICATION** `Apply with a short resume at the store.`
- **Close** (button) and **Share** (button, primary). Escape does not close.

#### Share opportunity dialog

- Modal, eyebrow `PROTOTYPE · AUDIENCE SELECTION`, heading **Share opportunity**, subline = opportunity title, X **Close**.
- Audience radios (2-column grid; **Selected students** is pre-selected):
  - **Individual student** `Target by individual student`: shows the 8-student roster as RADIO buttons (`Omar Hassan · Grade 12 · Investment Banking`, `Elizabeth Wilson · Grade 12 · Registered Nurse`, `Olivia Chen · Grade 11 · Graphic Designer`, `Charlotte Davis · Grade 12 · Software Engineer`, `Ethan Clark · Grade 9 · Environmental Scientist`, `Aisha Patel · Grade 11 · Software Engineer`, `Dante Williams · Grade 10 · Sports Medicine`, `Maya Thompson · Grade 12 · Lawyer`).
  - **Selected students** `Choose students from your caseload`: same roster as CHECKBOXES.
  - **Grade** `Target by grade`: one select **Choose grade** (default `Grade 11`; Grade 9–12).
  - **Career interest** `Target by career interest`: one select **Choose career interest** (default `Technology`; `Health & Medicine`, `Business & Finance`, `Arts, Media & Sport`, `Science & Research`, `Skilled Trades`).
  - **All my students** `Everyone in your school roster`: no extra controls.
- Footer note: `Prototype only. Choosing an audience does not send a message.`
- **Cancel** (button): closes. **Choose audience** (button, primary): closes the share dialog with no toast and no state change; an underlying details dialog (if any) stays open.

### Add opportunity (inline form)

- Form card heading `SHARE A LOCAL EXPERIENCE WITH STUDENTS`. Fields, two columns:
  - **Title** (textbox) · **Organization** (textbox)
  - **Opportunity Type** (select, default `Internship`; `Work-Based Learning`, `Job Shadow`, `Apprenticeship`, `Part-Time Job`, `Volunteer`, `Career Event`, `Employer Visit`, `Summer Program`, `Mentorship`) · **Career / Industry** (textbox, placeholder `e.g. Health & Medicine`)
  - **Description** (textarea, full width)
  - **Location** (textbox) · **Format** (select, default `In Person`; `Virtual`, `Hybrid`)
  - **Eligibility** (textbox) · **Grade Levels** (textbox, placeholder `Grades 10–12`)
  - **Application Deadline** (date) · **Start Date** (date) · **End Date** (date)
  - **Application URL or Instructions** (textbox) · **Image / Logo URL** (url input)
  - **Visibility** (select, default `Only my students`; `My school`, `District-wide`)
- **Save draft** (submit button) and **Publish opportunity** (submit button, primary): not exercised (form submission permission-gated); unknown whether a card is added.
- Footer: `Future targeting can include selected students, grades, or career interests.`

### Applications

- Table with columns **STUDENT**, **OPPORTUNITY**, **STATUS**, **FOLLOW-UP**; four rows:
  - Omar Hassan · JPMorgan Career Exploration Day · `Saved` · Confirm application materials
  - Dante Williams · Hackensack Meridian Health Job Shadow · `Applied` · Check application status
  - Aisha Patel · Summer Software Internship · `Interviewing` · Interview preparation
  - Maya Thompson · Electrical Apprenticeship Info Session · `Accepted` · Confirm participation
- **Status** (select per row): `Saved`, `Applied`, `Interviewing`, `Accepted`, `Participating`, `Completed`. Changing it updates only that select; the Follow-up text does not change and there is no toast. Rows are not clickable; no add/remove controls.

---

## ANALYTICS

- Eyebrow `CASELOAD INTELLIGENCE`, heading **Analytics**, subline `Understand readiness, pathways, outcomes, and where support matters most.`
- **Export snapshot** (button, top right): toast `Analytics snapshot exported for this demo.`
- Sub-tabs (buttons): **OVERVIEW** (default), **READINESS**, **POSTSECONDARY**, **CAREER & WBL**, **RISK**, **OUTCOMES**, **ENGAGEMENT**. The active sub-tab is remembered when you leave and return to ANALYTICS.

### OVERVIEW

- Stat tiles: `121` Students · `86%` On Track · `72%` Postsecondary Plan Complete · `64%` FAFSA Complete · `78%` Applications Submitted · `41%` Completed WBL.
- **READINESS SNAPSHOT / Student milestones** (vertical bar chart, light-blue gradient bars with % above): GPA 74% · Grad req. 81% · Academic plan 68% · FAFSA 64% · Apps 78% · WBL 41% · Career plan 86%. Caption `Illustrative caseload data · configurable state and district measures.`
- **PLANNING DESTINATIONS / Postsecondary mix** (donut, centre `121 Students`, legend with %): 4-Year College 45% · 2-Year College 22% · Trade / Technical 15% · Other / exploring 18%.
- Footnote: `Student-stated, activity, and verified data should be distinguished where records support it. Demo figures are illustrative.`

### READINESS

- Heading **Readiness**, `Track academic and graduation readiness. Distinguish student-stated information from verified records.`
- **Grade** (select: `All grades`, Grade 9–12); changing it did not alter the demo values.
- Numbered measure list (`01…09`, each `<value> · demo measure`): GPA & grades 86% · Attendance 72% · Graduation requirements 64% · Academic plan completion 78% · Course requirements 41% · SAT / ACT 69% · AP / IB 58% · State assessments 73% · Credit completion 62%.
- Footnote: `Measures are configurable for state and district requirements. Verified values require an authorized source connection.`

### POSTSECONDARY

- Heading **Postsecondary readiness**, `A live view of planning progress and destinations across your caseload.`; Grade select.
- Destination counts: `52` 4-Year College · `21` 2-Year College · `13` Trade / Technical School · `4` Apprenticeship · `3` Military · `8` Workforce · `20` Undecided.
- Measures 01–13: Postsecondary plan 86% · College list 72% · Applications started 64% · Applications submitted 78% · Common App 41% · Transcript status 69% · Recommendation letters 58% · FAFSA 73% · State financial aid 62% · Scholarships 86% · Acceptances 72% · Final decision 64% · Final transcript 78%. Same footnote.

### CAREER & WBL

- Heading **Career & work-based learning**, `Participation and experience measures help show how students connect learning to work.`; Grade select.
- Measures 01–09: Work-based learning participation 86% · WBL hours 72% · Internships 64% · Job shadows 78% · Career events 41% · Apprenticeships 69% · Employer experiences 58% · CTE completion 73% · Industry certifications 62%. Same footnote.

### RISK

- Eyebrow `PRIORITIZED INTERVENTION LIST`, heading **Who needs attention first?**, `Start with the students carrying multiple overdue steps.`
- **Risk category** (select: `All risk categories`, `Academic risk`, `FAFSA incomplete`, `Milestones overdue`, `Low engagement`); changing it did not visibly change the list in this test.
- Student rows (name, reason line, pill, button): Omar Hassan `Career Report overdue · FAFSA not started · 1 college application` `3 URGENT ITEMS` (red) · Elizabeth Wilson `Academic Plan overdue · Review their next milestone` `AT RISK` · Olivia Chen `Career Report needs changes · Review their next milestone` `NEEDS ATTENTION` · Charlotte Davis `Academic Plan overdue · Review their next milestone` `NEEDS ATTENTION` · Ethan Clark `4 milestones not started · Review their next milestone` `NEEDS ATTENTION`.
  - **Prepare meeting** (button per row): opens that student's meeting brief in the unscheduled state (`Meeting not scheduled`); the top tab switches to PREPARE and Back to Agenda lands on PREPARE.
- Count tiles: `9` Academic Risk · `4` Missing Graduation Requirements · `18` No Postsecondary Plan · `22` FAFSA Incomplete · `11` No Applications · `31` Milestones Overdue · `14` Low Engagement · `6` Attendance Concern. Not clickable.

### OUTCOMES

- Filter row of selects: **School year · 2024–25** (`2023–24`), **All grades** (`Grade 12`), **All counselors** (`Sarah Mitchell`), **All schools** (`Northview High`). None changed the demo values.
- **COHORT OUTCOMES / Student destinations** (bar chart): Graduated 91% · College 64% · Trade 13% · Apprentice 8% · Workforce 11% · Military 4%.
- **OUTCOME DEFINITIONS / Follow the full picture**: `Graduation, college enrollment, trade enrollment, apprenticeship, workforce, and military outcomes are shown separately. Postsecondary persistence can be added when verified longitudinal data is available.`
  - **Demographics where permitted** (button, dropdown-styled): toggles to **Hide demographic breakdown** and reveals the text `Demographic comparisons are disabled in this prototype. Production access must follow district permissions and reporting safeguards.`

### ENGAGEMENT

- Heading **Dreamari engagement**, `Engagement is one part of the student picture—not a proxy for readiness.`; Grade select.
- Measures 01–12: Careers explored 86% · Careers saved 72% · Top 3 completion 64% · Schools explored 78% · Schools saved 41% · Career simulations played 69% · Glossary games completed 58% · Videos watched 73% · Connect activity 62% · Planner tasks completed 86% · Resume completion 72% · Sessions & return frequency 64%. Same footnote.

---

## Messages / Inbox (section 7)

There is no review queue in this prototype: HOME's "Start reviewing" is a plain navigation to STUDENTS and no approve / request-changes / feedback UI exists anywhere. The only messaging surface is one dialog.

### Inbox dialog

Opened by: top-nav **Messages, 3 unread** (no thread selected), STUDENTS > **Message selected (N)** (first selected student's thread open), profile > **Message** (that student's thread open).

- Modal, accessible name "Counselor inbox", eyebrow `SCHOOL-AUTHORIZED COMMUNICATION`, heading **Inbox**, **Close inbox** (X). Escape does not close.
- Left column (`<aside>`):
  - **Search messages** (textbox): filters the thread list by student name (`Oli` leaves Olivia Chen).
  - **Unread** / **All** (filter buttons; All default). Unread shows only threads with messages (Dante Williams, Omar Hassan, Olivia Chen).
  - Thread list (buttons; name, last-message preview, relative time; unread dot on Dante and Olivia): Dante Williams `Thanks, I'll finish that today.` `2 min ago` · Omar Hassan `Can we talk about my college list?` `Yesterday` · Olivia Chen `I added two new schools.` `Mon` · then Elizabeth Wilson, Charlotte Davis, Ethan Clark, Aisha Patel, Maya Thompson each with preview `Start a school-authorized conversation.` and no time.
- Right column: heading = student name (or `Select a student conversation` when none), message bubbles with `Counselor · <text>` (right, blue) or `<FirstName> · <text>` (left, grey) and a timestamp line `Today · 10:32 AM`. Dante's thread: `Counselor · Please send your updated plan before Thursday.` then `Dante · Thanks, I'll finish that today.` Omar's: `Omar · Can we talk about my college list?`
- Composer (`<form>`): textarea **Write a message** (placeholder `Write a school-appropriate message…`), **Attach** (label wrapping a file input), **Send** (submit, primary). Footer: `Approved attachments only. Keep communication professional and school related.`
  - **Send** with text: appends a `Counselor · <text>` bubble with the fixed timestamp `Today · 10:32 AM`, updates that thread's preview to the new text and its time to `Just now`, clears the textarea. Thread order does not change. The "3 unread" badge did not change. Lost on reload.

---

## Interaction rules observed

- Single route, in-memory state. Nothing persists across a hard reload: reload always shows HOME, agenda back to the current week with Jordan `REQUESTED`, Omar `NEEDS PREP`, availability defaults, sent messages gone, saved notes gone, filters cleared.
- Within a page session the following ARE remembered when switching top tabs and coming back: STUDENTS filters/chips/open filter panel and search text; EXPLORE sub-tab; ANALYTICS sub-tab; PREPARE Agenda/Calendar and Week/Month choice; OPPORTUNITIES sub-tab.
- Top tabs are plain state switches; the active tab is styled as a filled pill. Opening a meeting brief from STUDENTS or ANALYTICS flips the active top tab to PREPARE.
- Default week in PREPARE is the Mon–Fri week containing today (Oct 19–23, 2026). ‹ › and the month select move by month to the week containing the 1st; there is no week stepper and the Today button is unreachable, so the only way back to the current week after moving is a reload.
- Agenda sorting: by day then start time; days with no meetings are omitted; the three "Week of" accordions always show the three weeks after the displayed one.
- Agenda summary counts: `N meetings` = rows in the displayed week (REQUESTED and CANCELED included); `need prep` = NEEDS PREP rows; `ready` = READY rows. Confirm increments need prep (2 → 3); Decline changes nothing in the counts.
- Status labels and colours: NEEDS PREP (amber), READY (green), ACTION REQUIRED (red), REQUESTED (grey-blue), CANCELED (green-grey); directory statuses AT RISK (red), NEEDS ATTENTION (amber), ON TRACK (green).
- "121 students" and the HOME numbers (14 reviews, 4 meetings, 6 students) are static strings and never recompute.
- STUDENTS search and all four filters compose (AND). HOME > Review students = Status "Needs Attention" preset (4 rows). Chips only exist for the four visible filters; the industry filter set by EXPLORE > View students is invisible, survives Clear all and tab switches, and is only cleared by reload.
- Dialog behaviour: all dialogs (career overview, opportunity details, share, add meeting, manage availability, meeting note, inbox) ignore the Escape key and need their X / Close / Cancel button. Share can stack on top of Details; Choose audience closes only the share layer.
- Toasts: bottom-right dark pill, auto-dismiss in a few seconds, one at a time; exact strings are listed inline above. Actions that only toast (no state): Export, Export snapshot, View School, related-career cards, Assign Task, Add School, Recommend Career, Update Plan, Log Meeting, Suggest time.
- Actions that change state in-session: Confirm/Decline (row status + summary), Complete for this session / Review (moves rows into a Completed/Hide (N) group with captions `Completed during meeting` / `Reviewed during meeting`), Mark Meeting Complete (button becomes green `Meeting Complete`), Save availability (footer line), Save internal note (toast only, note not displayed), Send message (bubble + preview + `Just now`), Applications status select (that select only), View Top 25 / Show fewer (rail length), Demographics toggle (reveals copy), directory checkbox (reveals `Message selected (N)`).
- Form submits not exercised in this session (permission-gated): Add meeting > Schedule meeting; Add opportunity > Save draft / Publish opportunity.
- Layout notes relevant to matching: opportunity and related-career rails are horizontal scrollers; the Calendar week grid is 5 columns x 8 hourly rows (9 AM–4 PM); the Month grid is weekday-only; the "Today" button is in the DOM but hidden; the meeting brief page can overflow horizontally because of the related-careers rail.
