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

## 6. Research: notifications and everything else, for 8th graders of every ability (2026-09-03, later)

Question asked: should "Your questions" live behind a notifications bell? Sources read: Nielsen Norman Group's teen usability research (100 teens, 13 to 17, US/UK/AU; 130 guidelines), the W3C COGA note "Making Content Usable for People with Cognitive and Learning Disabilities", CAST's Universal Design for Learning guidelines (executive function), reporting on notification anxiety in teens (Common Sense Media via CNN, 2023), and the way Google Classroom surfaces a student's own items.

What the research says
- Teens read at or below a 6th-grade level on screens, give up fast, and blame the design. Anything that needs decoding (an unlabelled icon, a hidden panel) is skipped. Icons need words next to them.
- The most important task belongs at the top of the page, visible without a tap (COGA 4.3.1, 4.2.1). Students who have to click into things to find what concerns them get lost (the Google Classroom Stream lesson; its fix was a To-do list on the Stream itself).
- Badge counts create an open loop and measurable anxiety in adolescents. A bell with a number is the pattern that harms this audience most.
- Executive-function support (UDL): fewer options at once, visible progress and status, one clear next step.
- Teens want to do things, not read about them: ask, follow, like, save.

Decision
- The bell is out. A student's own questions sit as a two-row strip directly under the Ask row: who answered (a face and a name) or "Waiting for an answer", then the question. Nothing to decode, nothing to open, no badge. More than two → "See all".
- Ask sheet: the community it goes to is one line ("Goes to Finance Careers · Change"); the five chips appear only if they tap Change.
- Words at a 6th-grade level everywhere a student reads: Posts (not Insights), Top answer (not Primary answer), Save (not Save insight), Pro (not Professional), Waiting (not Awaiting).
- No search box on a tab with two items.
- One rhythm: every panel and card pads space-5 on phones and space-6 from tablet; every Connect page stacks its sections at space-5.
- The 2026 Impact Summary is one gold card with its own Download; nothing nested around it.

Sources: nngroup.com/articles/usability-of-websites-for-teenagers, nngroup.com/reports/teenagers-on-the-web, w3.org/TR/coga-usable/design_guide.html, udlguidelines.cast.org, cnn.com/2023/09/26/health/teen-hundreds-of-phone-notifications-report-wellness, alicekeeler.com/2023/08/19/student-engagement-setting-up-google-classroom.

## 7. The interactions, one by one (2026-09-03, night)

How each social action works, what the research says, what we borrowed, and the edge cases. Sources as in section 6, plus the way Instagram, TikTok, YouTube, Reddit, Quora, Brainly and Stack Overflow handle the same actions.

### Asking a question
- Where: the Ask row on the landing, the composer on a board, Ask Me Anything on a profile. Same sheet, same rules.
- Research: teens are hesitant to enter information and give up on friction (NN/g); routed questions beat blank-page posting (brief). Brainly and Quora both show similar questions before you post; Stack Overflow's duplicate check cuts repeat questions.
- Ours: routing from the words with one Change link; up to two already-answered matches above Post; contact details block Post and keep the draft; under 12 characters Post stays off with one hint ("A few more words helps the right pro find it"); the counter appears only after 220 characters; posting shows a toast and the question appears under the Ask row as Waiting; an unanswered question you asked can be deleted from See all.
- Edge cases: not joined → Join sheet first; same question twice → the match shows first; offline or failure → backend; a question that is really a comment (no question mark) still routes.

### Answering (volunteer)
- Research: creators return when the ask is specific and small (brief; Stack Overflow's inbox). A minimum length prevents one-word answers; a disclosure line ("Based on my own experience") is what the handoff asks for.
- Ours: inline composer under the routed question; Post stays off under 40 characters; the disclosure checkbox is on by default; after posting, "Live on Finance Careers" with View response; Skip has Undo; Questions answered ticks up.

### Commenting (students, on threads and posts)
- Research: TikTok and Instagram keep replies one level deep and put the composer at the bottom; Reddit-style nesting is what the CEO rejected. Enter posts, Shift+Enter breaks (every chat app teens use). Emoji reactions on peer comments are the Gen Z register the doc shows.
- Ours: one composer per thread, one level of replies (Reply focuses the composer), 280 characters with the counter only after 200, the same contact guard as every composer, the identity line "Posts as Jordan · Junior", Report on every comment, like plus two emoji reactions on peer comments.
- Edge cases: empty → Post off; contact details → blocked with the reason; a reply to a reply → lands as a comment, never a sub-thread.

### Liking
- Research: one symbol everywhere (Instagram's heart); a count next to it tells the volunteer it mattered (brief: visible learning signals). "Helpful" without a number told the volunteer nothing.
- Ours: thumbs up with a count on the question, on every answer, on posts and on comments; tap again to undo; the count moves at once; no separate Helpful verb.

### Saving
- Research: Instagram's bookmark is understood by every teen; a save is private and needs a place to go back to.
- Ours: Save on questions, answers and posts; Saved page reachable from See all; each saved row has its own bookmark to remove it; the toast says where it went.
- Edge cases: unsave from the list or from the item; nothing saved → one line.

### Sharing
- Research: NN/g: give teens Copy Link, never force sharing or public profiles; on phones the native share sheet is the pattern they know (Instagram, TikTok, YouTube).
- Ours: Share on threads, answers and posts; on phones the system share sheet, elsewhere copies the link and confirms "Link copied"; only public content is shareable, there is nothing private to leak; clipboard failure explains what to do.

### Posting (volunteer)
- Research: prompts remove the blank page (brief); short posts get read (NN/g: dense text is the teen repellent).
- Ours: Create post from four prompts, title plus a 600-character body, Publish off until 40 characters, the post appears at the top with Delete; each post shows Views · Likes · Saves.

### Following
- Ours: Follow on the rail, the profile and every answer card; flips to Following; New from people you follow on See all. Students follow pros only.

### Reporting
- Ours: on questions, answers, posts and comments; four reasons; toast; anonymous. Staff see the queue with Remove or Keep.
