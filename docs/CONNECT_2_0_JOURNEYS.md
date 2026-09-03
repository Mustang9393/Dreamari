# Connect 2.0: journeys, stories, edge cases

Branch `connect-2-0`, 2026-09-03. Source brief: DREAMARI CONNECT 2.pdf. This is the full user-journey map for the Connect tab, what is built on the branch, and what is proposed. The rule that ranks everything else: the least information that still does the job. An 8th grader should never have to work out what a screen is for.

## Who lands on Connect

| Person | Arrives with | Wants | Fear |
| --- | --- | --- | --- |
| New student (13 to 15) | Nothing yet, maybe a Match Top 3 | To ask one real question and see who does the job | Looking dumb in public, strangers |
| Returning student | Top 3, a question they asked, people they follow | Did anyone answer me? What did my people post? | Missing the answer, having to dig for it |
| Event attendee (JA, Dream Opportunity) | An event code | The room for the event they went to | Losing the code, not finding the room |
| Professional (Founding 150) | A verified account, 10 minutes a week | One question worth answering, proof it mattered | Obligation, being judged for volunteering rarely |
| Partner or employer (later) | Sponsorship | Company-level proof of impact | Nothing to show |

## The one loop

Student asks → Dreamari routes to the right verified pros → a pro answers in minutes → students read, like, save, follow → the pro sees the impact, privately → Dreamari sends the next relevant question. Every screen below exists to move one step of this loop.

## The landing, top to bottom

1. **Find your community** title, Community / Events toggle, search. Unchanged from the approved design.
2. **Your questions** panel. The one primary action on the tab, "Ask a question", lives in its header. Rows: the student's own questions with one word of status (New answer, Answered, Waiting for an answer). Last row: "Saved answers and posts · 2". When the student has never asked, the panel shows one sentence and the Ask button. This is where a returning student's whole reason for coming is answered in one glance.
3. **Your Communities** grid. The doors. Unchanged cards (CEO-approved photo cards, stat tiles, Pros from logos, ghost action).
4. **People to Follow** rail, below the communities (direct feedback). Instagram's suggestion shape: portrait, name, what they do, the company as its logo, Follow. Nothing else. Ranked relevance first from the Match Top 3, activity second.
5. **New from people you follow**. Appears only after the first follow. Four rows: who, answered or posted, the title.

Why people come after places: a student's first question is "where do I ask about nursing", not "which nurse". The community answers that. The people rail then makes the community human, and Following gives a reason to come back.

## Journeys

### 1. First visit with a Top 3
Home → Connect. Sees Your questions (empty state, one line, Ask button), five communities with the ones matching their Top 3 already joined, People to Follow "Picked for your Top 3". Taps Ask. Built.

### 2. First visit without a Top 3
Same screen. People to Follow falls back to quality and activity ranking and drops the "Picked for your Top 3" label. Proposed: a one-line hint under the rail, "Pick your Top 3 in Match and we will pick people for you", linking to Match. Not built (copy decision).

### 3. Ask a question
Three entry points, one behaviour:
- Landing: "Ask a question" opens the Ask sheet.
- Community board: the composer at the top of Student Questions.
- Profile: Ask Me Anything composer.

The Ask sheet: type the question. Where it goes is picked from the words ("bank" → Finance Careers) and can be changed with one tap on a community chip. When a question with the same words was already answered, up to two "Already answered" rows appear above Post: one tap opens the answer, no waiting at all. Phone numbers, emails, @handles and DM apps block Post with a plain sentence about why. The footer says who you post as and that verified pros answer in public. After Post: toast "Sent to verified pros in Finance Careers. Most questions answered within 2 days." and the question appears in Your questions as Waiting. Built (all three composers feed Your questions).

### 4. Waiting, then a new answer
Waiting: Your questions shows "Waiting for an answer". The thread says where it went and how long it usually takes. Proposed: after the community's response window passes with no answer, the row reads "Still waiting. We asked more pros." and offers "See similar answered questions". Not built (needs time state).
Answered: the row flips to "New answer" in green. Tap → thread. The primary answer is marked, the question's likes sit by the question, Like, Save and Report sit under each answer. Built.

### 5. Follow a professional
From the rail, a card, a profile, or a name anywhere (badges, insight cards, comments open profiles). Follow → Following, the count ticks. "New from people you follow" appears on the landing. Students follow pros; there is no reverse. Built.

### 6. Browse a community
Card → board: Feed (Student Questions / Professional Insights) and About (purpose, topics, Pros from logos, response window). Not joined → Join sheet (what you get, one ground rule, Agree & Join). Built earlier; unchanged.

### 7. Save
Save on any question, answer or post. Toast "Saved. Find it under Saved." The Saved view now exists: Your questions → "Saved answers and posts" → one panel of rows (Question, Answer by, Post by, Event takeaways). Built (this was a dead end before).

### 8. Event attendee
Events tab → the event card → Enter Code → sheet → board unlocked, stays under Your events. Built earlier; unchanged.

### 9. Report
Report on a thread or an answer opens a sheet: four reasons, Send report, toast "Thanks. A moderator will look at it." The reporter is never revealed. Built (Report was inert before).

### 10. Professional: routed question to answer
`/connect?dashboard=pro` (preview only, no student entry point). "Three students asked questions about investment banking this week. Answer one?" Each routed question is a row with Answer and Skip. Answer opens a three-line composer; Post answer → "Live on Finance Careers" with a link to the thread, and Questions Answered ticks up in the private dashboard. Skip → "Skipped. Nothing changes." The headline counts down as questions are handled. Built.

### 11. Professional: posts, impact, recognition
Career posts from four prompts (secondary, optional). Private Impact Dashboard with the brief's six numbers, the positive activity sentence, "Active weekly. Only you can see this.", and the company line with the company's logo. 2026 Impact Summary with Download and who to share it with. Built as a preview.

## Edge cases and empty states

| Case | What happens |
| --- | --- |
| Never asked anything | Your questions shows one sentence and the Ask button |
| Asked, nobody answered yet | Row says Waiting for an answer; thread says where it went and the usual wait |
| Question already answered by someone else | Ask sheet shows it before Post; one tap reads it |
| Question contains contact details | Post is blocked with a plain reason; the draft is kept |
| Not joined, tries to ask on a board | Join sheet first |
| Follows nobody | No Following section; the rail is the invitation |
| Follows people with nothing new | Following section hides itself |
| No Top 3 | Rail ranks by quality and activity; no "Picked for your Top 3" |
| Nothing saved | Saved view says how to save |
| Company with no exact logo | Text chip, same size (none today; Goldman Sachs and Blackstone added) |
| Event code wrong | Inline error in the code sheet |
| Upcoming event | Card says the board opens after the event |

## Pain points in the previous Connect, and status

| Pain | Status |
| --- | --- |
| Asking was two levels deep (open a community, find the composer) | Fixed: Ask from the landing, auto-routed |
| No way to see your own questions or whether anyone answered | Fixed: Your questions panel |
| "Find it under Saved" but no Saved anywhere | Fixed: Saved view |
| Report buttons did nothing | Fixed: Report sheet with confirmation |
| People cards repeated the role, the field chip and a follower count | Fixed: portrait, name, role, logo, Follow |
| People rail sat above the communities | Fixed: below |
| Pill-shaped composer and chips | Fixed: 12px composer, 8px chips |
| Following did nothing after the count ticked | Fixed: New from people you follow |
| Pro "Answer" was a one-line message, not a flow | Fixed: routed rows with a real composer |
| Company names as text where a logo exists | Fixed: logos in chips, profiles, badges, insight cards, dashboard |

## Safety by design, visible

- Students follow pros; pros never follow students; students have no follower counts anywhere.
- No message entry point exists. Every composer says answers are public.
- Contact details are blocked at the composer.
- Report is one tap away on every thread and answer, with a confirmation.
- Pros see a grade, never a full name (said in every composer footer).
- Verification line on every profile.

## Copy rules for an 8th grader

One idea per line. Say what happens next ("Sent to verified pros in Finance Careers"). Status is one or two words (New answer, Answered, Waiting for an answer). No system words (routed, moderation queue, entitlement). No em dashes.

## Deferred, needs backend or a decision

Real routing and time-based "still waiting" state. Persisted follows, saves and questions. Notification badge on the Connect tab. Pro login and the real dashboard. Anonymized outcomes ("18 students you supported graduated"). Company-level aggregation. Invite flow for the Founding 150.

## Home page: evaluation and proposal

What Home does today: a three-panel hero carousel (Today's Drop, Continue the simulation, Trending career), a Continue rail of three activity cards, a rail of recommended careers, and the Your Signal banner to the Career Report.

Where it underserves:
- Two of three hero panels repeat what sits directly below (panel 2 is the first Continue card; panel 3 is a career from the recommended rail). Carousels are also the least-read element on any home page.
- Nothing from Connect reaches Home. A student with a new answer waiting has no idea.
- Nothing about the student's actual spine: Build → Match → Top 3 → Play. A student who has not done Match gets the same page as one who has.
- "View all activity" goes nowhere.
- The recommended rail duplicates Explore one for one.

Proposal, same page length, less to read:
1. **Hero, one panel, state-aware.** Today's Drop stays as the hero (it is the daily habit). Under it, one line for the next step in the spine: "Finish Match to get your Top 3" or "Continue: The $30B Deal, 18 min left". No carousel.
2. **Continue rail.** Keep as is.
3. **From Connect.** One panel, up to three rows: new answers to your questions, new from people you follow. Empty → "Ask a pro anything" with the Ask button. This is where the Connect loop earns a return visit.
4. **Your Top 3.** Three poster cards with a one-line progress each (played, glossary, asked). Replaces the recommended rail; Explore keeps recommendations.
5. **Your Signal banner.** Keep.

Not built; awaiting the go-ahead since it changes an approved Home.
