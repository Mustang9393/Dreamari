# Connect 2.0: UX audit, competitive audit, heuristic evaluation

Branch `connect-2-0`, 2026-09-03. Inputs: DREAMARI CONNECT 2.pdf, the CEO's Replit (dceeai.replit.app: /community-boards, profile, /volunteer/dashboard with My Profile and My Impact tabs, /corporate/dashboard), our branch as of commit 7c5287c. Method: Nielsen's ten heuristics per screen, severity 1 (cosmetic) to 4 (blocks the task); a pattern audit of products our users and volunteers already know; then a build list, all of which is implemented on the branch.

## 1. What was wrong with the branch before this pass

| Screen | Finding | Heuristic | Severity |
| --- | --- | --- | --- |
| Volunteer dashboard | No My Profile / My Impact split. The Replit and the brief both treat "what students asked me" and "what my help did" as two jobs; ours mixed them in one scroll. | Match between system and real world; recognition over recall | 3 |
| Volunteer dashboard | Impact was six numbers with one overall +28%. No per-metric change, no trend, no time range. A volunteer cannot see whether they are growing. | Visibility of system status | 3 |
| Volunteer dashboard | Activity status (Gold, weekly) buried as a sentence. The brief wants it private but motivating; the Replit gives it a card with "no penalty for taking a break". | Visibility of system status; help and documentation | 2 |
| Volunteer dashboard | "Career posts" was four prompt chips with no post list, no create flow, no signals per post. The Replit has My Posts with views, likes, saves and Create Post. | User control and freedom | 3 |
| Volunteer dashboard | No "asked · answered" counter; no way to see communities the volunteer belongs to. | Visibility of system status | 2 |
| Volunteer dashboard | Skip had no undo. | User control and freedom; error recovery | 2 |
| Volunteer dashboard | Impact Summary was numbers in a panel. The brief says "like Spotify Wrapped": something a person would actually post. | Aesthetic and minimalist design (in the sense of designed, not bare) | 3 |
| Everywhere | Every section was the same frosted panel with text rows. No charts, rings, portraits or marks doing the work words were doing. Reads as "words and boxes". | Aesthetic and minimalist design; recognition over recall | 3 |
| Profile | No About (education, career journey, topics they can help with). The Replit has it; students asking "how did you get here" have nowhere to look. | Recognition over recall | 2 |
| Connect landing | No trust line. The Replit opens with "Verified professionals · Moderated questions"; ours says it only inside composers. Parents and teachers read the top of the page. | Help and documentation; visibility of status | 2 |
| Your questions | Rows said "New answer" without saying who answered. A face and a name is the whole point. | Recognition over recall | 2 |
| Partner view | Progress bars and text only; the Replit's dashboard is rings, split bars and fill meters that read at a glance. | Visibility of status | 2 |
| Community board | Two levels of tabs: Feed / About pills inside the photo banner, then a second Student Questions / Professional Insights filter row inside a tinted wrapper card. Cards inside a card. | Consistency; aesthetic and minimalist | 3 |
| Community board | About was a bespoke tinted card with its own kicker labels, unlike every other section. | Consistency and standards | 2 |
| Thread and insight thread | The Back control was a cream-tinted pill from an older exploration: light ink on a light fill inside a dark UI. Off-system. | Consistency and standards | 2 |
| Thread | Like appeared twice: beside the question (correct, per CEO note) and again in the bottom row. | Consistency; minimalist | 2 |
| Thread | No way to follow the professional from their answer. The Replit puts "Follow Sarah" under the answer; the brief's loop depends on it (read → follow). | Recognition; flexibility | 3 |
| Insight thread | Report was inert. | Error recovery | 2 |
| Everywhere a company is named | Bare white logo marks sat off the text line (the JPMorgan wordmark floated above its row). | Consistency; aesthetic | 2 |
| Community cards | Approved. Photo, four stat tiles, Pros from chips, ghost action. Not changed. | | |
| Events tab | Cards and code flow work; the partner mark sits on the card. Not changed this pass; the one issue is the upcoming-event card with no action, acceptable. | | 1 |
| Join sheet | Three perks, one rule, Agree and Join. Clear. Not changed. | | |

Kept, because the audit confirmed them: Ask from the landing with routing and already-answered matches; contact-info block; Report with reasons; Saved; People to Follow below the communities as portrait cards; hairline rows inside one panel per section; strict type hierarchy; plain status words.

## 2. Competitive audit: patterns our users already know

| Product | Pattern | What we take | What we leave |
| --- | --- | --- | --- |
| TikTok / Instagram creator analytics | Metric tiles with a percent change each; one chart with a 7 / 30 / 90 day switch; "Post" as the primary action | Metric tiles with deltas, the 30-day area chart with a range switch | Follower demographics, watch time |
| Spotify Wrapped / Strava Year in Sport | One shareable card: gradient, four big numbers, your name, the year | The 2026 Impact Summary as a card you can download and post | Slideshow, sound |
| Stack Overflow / Quora | "Questions for you" inbox: routed questions with counts, Answer / Skip, unanswered badge | Routed rows with asked · answered counter, Skip with Undo | Reputation points, downvotes |
| LinkedIn profile | Headline, About, Experience, "Talks about" topics; posts with reactions | About section with education, career journey, topics they can help with | Connections, endorsements, messaging |
| Duolingo | Positive streak copy; never shame; private progress | "Gold volunteer. You helped this week. No penalty for taking a break." Only you can see this | Public leagues |
| Handshake / Forage | Employer logos as trust; verified badges; student privacy first | Company marks everywhere a company is named; verified shield; grade-only identity | Job applications |
| Reddit AMA | One person, public questions, upvoted answers | Ask Me Anything as the primary engagement; public answers | Threads of threads, karma |
| Corporate CSR dashboards (Benevity, Goodera) | Goals vs targets as rings, volunteer hours, events with fill rates, exportable report | Goal rings, in-person vs virtual split bar, events with fill meters, Export | Budget approvals, payroll giving |

## 3. Heuristic evaluation, after the rebuild

| Heuristic | How Connect meets it now |
| --- | --- |
| Visibility of system status | Your questions with who answered; asked · answered counter; per-metric deltas; chart; goal rings; "Live on Finance Careers" after posting |
| Match to the real world | Plain words: New answer, Waiting, Answered, Skipped. Roles named as people say them: Student, Volunteer, Partner |
| User control and freedom | Cancel on every composer; Undo on Skip; Back on every screen; role switch always visible in the demo |
| Consistency and standards | One Panel shell, one row style, one metric tile, one Follow button, one segmented control for every tab set |
| Error prevention | Contact details blocked before Post; Post disabled until there is text; similar answered questions shown before posting |
| Recognition over recall | Portraits, company marks, community photos, status colours with words, icons on every metric |
| Flexibility and efficiency | Every screen has a URL; Ask from three places; keyboard: Enter posts, Shift+Enter breaks |
| Aesthetic and minimalist design | One chart, one card, rings where numbers are goals; nothing decorative that does not carry data |
| Help users recover from errors | Report confirms; wrong event code explains; blocked post keeps the draft and says why |
| Help and documentation | Trust line under the Connect title; one safety line per composer; "Only you can see this" on private analytics |

## 4. Build list from this audit (implemented on the branch)

1. Volunteer dashboard split into **My Profile** and **My Impact** with a segmented control.
2. My Profile: Ask Me Anything with asked · answered, routed rows with student identity and status, Answer with inline composer, Skip with Undo; My posts with signals and Create post from prompts; My communities.
3. My Impact: headline sentence; six metric tiles with icon and delta; 30-day students-reached area chart with range switch; Gold volunteer status card; company on Dreamari; 2026 Impact Summary as a shareable card with Download and share targets.
4. Profile: About panel (education, career journey, topics they can help with) for every professional.
5. Connect landing: trust line under the title; Your questions rows show who answered with their portrait.
6. Partner view: goal rings, in-person vs on-Dreamari split bar, events with fill meters.
7. Shared visual primitives in `viz.tsx`: MetricTile, AreaChart, Ring, Meter, Segmented.
8. Community board: one segmented row (Questions · Insights · About) under the banner, counts in the tabs, feed cards straight on the page, About as the standard panel.
9. Threads: standard Back link; one Like, beside the question; Follow on every answer card; Report wired on insights.
10. Company logos in the chip everywhere (three chip sizes), never a bare mark beside text.

## 5. Not built, and why

Real analytics, time ranges and deltas need a backend. Per-region growth and budget belong to the corporate product, not the prototype. Public activity tiers are excluded by the brief. Private messaging is excluded by design.
