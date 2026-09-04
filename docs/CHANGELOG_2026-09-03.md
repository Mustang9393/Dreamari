# Dreamari changelog · 3 September 2026

Plain-English summary for the team. Everything below is live on main and demo. Connect 2.0 was started from scratch today and iterated to the state described here; each item gives where we started and where we ended.

## Connect 2.0 · features built today

**Connect landing**
- Started: one page with descriptive text under the title, a notifications idea, and people above communities.
- Ended: a clean landing. Community/Events switch, an "Ask a question" row, your latest questions right under it (who answered, with their photo, or "Waiting"), then the community cards, then People to Follow. No bell, no badges, no explanatory lines.

**Asking a question**
- Started: a plain text box.
- Ended: a sheet that picks the right community from your words, shows any question already answered so you can read it right away, needs a full sentence, blocks phone numbers and usernames, and lets you delete your question before anyone answers.

**People to Follow**
- Started: nothing.
- Ended: a grid of professionals aligned to the community cards (two across on phones, three on tablets, six on desktop). Portrait, name, job, company logo, small Follow pill. Tap the card, the photo or the name to open the profile.

**Professional profiles**
- Started: name and a few numbers.
- Ended: portrait, role and company, Follow, three counts, tabs for Ask Me Anything, Answers, Posts and About (education, career journey, what they can help with). Tapping any professional's photo or name anywhere in Connect (answers, comments, badges, staff lists) opens their profile.

**Community boards and threads**
- Started: one long feed.
- Ended: one row of tabs (Questions, Posts, About) with the cards straight on the page. Every answer has Like with a count, Share, Report and a Follow button for its author. Comments are one level deep, block contact details, post on Enter, cap at 280 characters.

**Saving, sharing, reporting**
- Started: none of the three.
- Ended: Save on every question, answer and post with a Saved page where items can be removed in place. Share opens the phone share sheet or copies a link. Report has a real flow with reasons and appears on every comment.

**Events**
- Started: events named after the partner ("EY Student Impact Day") with a text host line.
- Ended: one naming syntax, Dream Opportunity first, then the partner, then the event (Dream Opportunity EY Student Impact Day, Dream Opportunity Morgan Stanley NYC, Dream Opportunity JPMorgan Chase Student Event, Dream Opportunity AT&T Student Event, Dream Opportunity EY Student Event). The Junior Achievement event stays its own thing, as on the Replit: Junior Achievement Goldman Sachs NYC. Each card carries a logo lockup: the lead mark, a small ×, the partner mark, one line, one baseline, the same positions on every card. Real logos for Junior Achievement, Goldman Sachs, Morgan Stanley, JPMorgan, AT&T and EY.

**Volunteer dashboard**
- Started: nothing.
- Ended: every one of the 15 volunteers has their own dashboard with two tabs. My Profile: questions routed to you with Answer or Skip (undo), your posts with a Create post flow (title and body, delete), your communities. My Impact: six numbers with how they moved, a 30-day chart, a private activity status (Gold, Silver, etc.), a company card in the company's colours, and a shareable 2026 Impact Summary.

**Partner dashboard**
- Started: nothing.
- Ended: goals against targets as rings, in-person vs on-Dreamari split, events with volunteer and student fill, your professionals, export.

**Staff dashboard**
- Started: nothing.
- Ended: Overview (students, volunteers, partners, schools, questions chart, answer rate and wait time), Moderation (reports, answers awaiting review, blocked posts), People (roles, activity tiers, all volunteers and partners), Features (usage this week).

**Demo controls**
- A role switch at the top of Connect: Student, Attendee, Volunteer, Partner, Staff. The hamburger menu has the same five under "Connect demo · view as".

**Company logos**
- Company logos appear wherever a company is named, in one chip style, and as bare marks in the event lockups.

**Words**
- All Connect copy written for 8th graders: Posts, Top answer, Save, Pro, Waiting. No explanatory sentences.

## Connect 2.0 · concepts and data still to be decided
- All numbers are demo data. Real counts, real routing and real moderation queues come from the engineer.
- Company brand colours are approximations; use official hex values.
- Event boards: who can post, how event codes are issued, and how long a board stays open after the event.
- Volunteer activity tiers (Gold, Silver) are private to the volunteer in this build. Decide whether any of it is ever shown to students.
- Demo controls must be removed or gated before production.
- Home page proposal (state-aware hero, From Connect panel, Top 3 strip) is written up in docs, not built.

## Career pages (Josh's notes)
- Removed "People doing it" and "Jobs open each year".
- The degree pop-up says what you need in words; the education-mix numbers are gone.
- Each ladder level opens to two short lists: "What you do" and "What you need".
- Education: "Where you would study it" rows now link to college pages. Those pages are not designed yet, so the links land on the College Lookup shell with the credential carried across as a placeholder.

## My Profile
- Header is a cover photo with your name and photo on it, and Grade, GPA and Streak as three icon tiles coloured by your #1 career. An A/B switch beside Cover, Saved and Settings previews the cover as your #1 career's poster (A) or a background (B).
- Six cover backgrounds rendered as glass materials in the brand palette; upload your own. The picker opens centred over a blurred page.
- All tabs live inside one card. Career Report is accented by your #1 career's colour.
- Side by side comparison ("My top 3") is now one table at every size: a tinted factor column pinned to the left, the careers scroll sideways. Phones compare the same way desktop does.

## Overall improvements
- One app background on every screen, fixed to the viewport, so it never shifts when a tab changes the page height. Blue field, purple only in the top-right corner.
- Uniform paddings, gaps and margins across Connect, checked at phone, tablet and desktop widths.
- Every Connect screen and the Profile checked pixel by pixel at phone size.
- Follow buttons share one small size on people cards and under answers.

## Bug fixes
- Background turned fully black behind the career "What you need to get in" sheet. The page now stays visible behind a dimmed, blurred overlay.
- Profile cover A/B got stuck half-swapped. Both images stay loaded and crossfade.
- Metric tiles: the change (+18%) wrapped under the figure on some tiles and not others. It now sits under the figure on phones and tablets and beside it on desktop, the same on every tile.
- Metric grids: the hairline dividers appeared at random. They now run between every column and above every row.
- Morgan Stanley and other partner logos had extra padding. Fixed by stripping the width and height from the SVGs.
- Explore's tabs sat under the search button on phones; the Play featured card overflowed; Profile name and school were cut off; career ladder titles did not wrap. All fixed.

## Documents
- Connect 2.0 journeys report (PDF and web page) and a full UX audit with research sources and the interaction spec (posting, asking, commenting, liking, sharing, saving), in the docs folder.

## College lookup (branch `college-lookup`, pushed as a branch, not on main)
- Research first: the live Find a college page studied at phone, tablet and desktop; competitive audit of College Scorecard, BigFuture, Niche, College Navigator and Scoir; search patterns from NN/g and Baymard; Gen Z social-search research. Written up in docs/COLLEGE_LOOKUP_AUDIT.md.
- Find a college: one search box with results as you type, six quick picks in a student's words (Near home, 4-year, 2-year, Trade school, Under $15K a year, Everyone gets in), "All filters" in a tray over the results, applied filters as removable chips. Home state first, then by how many finish. We do not rank.
- College cards in the community card shape: campus photo, name, place, two plain sentences ("About $6,100 a year after grants. 98 in 100 students finish."), three words, Compare and Open. Save on every card. Compare up to three side by side.
- College pages in the career page anatomy with a strict top-down type order: title, section headings, subheadings, body. Figures are bold body text, never bigger than the heading above them. "At a glance" rows, then folded sections: What it costs, Getting in, What you can study, Life there, Who is there, After college, See it then ask someone, Where these numbers come from.
- Data: 30 colleges (10 New Jersey, 20 South Dakota). 16 with figures transcribed from the live site; the rest carry generated sample detail in the same shape, marked in the page's sources. Real campus photos from Wikimedia Commons with licences recorded.
- Copy: "Really pay" replaced everywhere with "Cost for a year, after grants" and plain sentences.
- Sitewide search was tried and pulled the same night: too heavy and busy. College search stays its own page for now; we come back to sitewide search with a calmer design. Explore accepts a search from the URL, which stays.

## 4 September, morning (on main)
- College cards: the campus photo is only a cover now, with the college's logo or seal on a white disc at its edge. All words sit below on a calm panel: name, place, two sentences, three words, Compare. No text over photos.
- Filters: the tray is short checkbox and radio lists with small headings instead of rows of chips. Same filters, half the noise.
- Sitewide search is pinned. Find a college is reached from the hamburger.
- Connect landing: three tabs, Community, Events, Notifications. Ask a question and "your questions" moved off the landing into Notifications (with new posts from people you follow). Every board still has its own Ask.
- Community cards: bigger title, two numbers (Students, Pros) without icons, three company logos and "+N more" instead of the "Pros from" line and the Posts and Companies counts.
- Event cards: taller, coloured in the partner's real brand colour like a volunteer's company card, with the photo as faint texture. Text and logos switch to dark ink on light brands (EY).
- Professional profiles: Answers and Career posts show three, then "View all N".
- Threads: answers, comments and follow-ups share one surface and border.
- Ask row on Connect redrawn as a text field before it moved.
- College pages, second pass after review: three pictures on the whole page, one per question a student brings. Cost by income as bars with the full price as a marker line. Getting in as 100 dots. Who is there as a ring with a legend. Everything else is a sentence or a short list: scores, degrees offered, class size, four-year finish rate, pay and debt, scholarships and Pell, women and men, full and part time. Life there and Who is there merged. Nothing from the reference data was dropped; the street address joined the header.
- College pages, third pass: no sentences or paragraphs. Every fact is a label and value row or a fragment. "At a glance" stays as label and value rows (a fragment list was tried and reverted), with a "What kind of place" row added. Two pictures remain, cost by income and who is there. The admit dot grid was tried and removed.
- College pages, fourth pass: back to the reference's own structure and data. Sections in the reference's order (Getting in, What it costs, Academics, What you can study, Who is there, Life there, After college). Every transcribed figure is back on the page: all programmes with their share of graduates, the average across income groups, everyone on campus, full time and part time and women and men as split bars with counts, race with counts, the net-price calculator link. Only the words and layout are simplified.

## College detail page, 4 Sept

- Start: the page mirrored the reference's sections but had dropped data (programme tables by degree level, the 5, 6 and 8 year finish rates, part-time retention, meal plans, SAT reading and maths, team sizes by gender, loan default, the aid, apply, calculator and map links).
- End: all of it is on the page, from the reference's own numbers. What you can study has tabs by level with the five biggest programmes and a link for the rest. Academics shows the two headline finish rates with the others one tap away. Getting in shows SAT reading, SAT maths and ACT ranges with how many students sent scores. Header has Financial aid and How to apply links and the address opens a map.
- Rule kept: rows, not sentences. Nothing on the page uses a typed dot or a dash as a separator.

## College detail page and data, 4 Sept (second pass)

- Start: 14 of 30 colleges showed made-up detail behind real headline figures; the page showed everything as rows of equal weight.
- End: every college reads from its reference page. Getting in lists what they ask for with Required and Looked at, and shows score ranges on their scale. What it costs shows what families pay against the full price, so the size of the grant is visible. Who is there is three splits and the ring. Nothing is said twice on the page; setting, accreditation and the sticker price each appear once.

## Play, 4 Sept

- Start: on the data room question a drag that missed sprang back with no other way to answer, and the tiles did not move while dragging.
- End: tiles follow the finger, the blank lights up when a tile is over it, and every drag screen also answers on a tap. Copy says "drag or tap".

## Home, 4 Sept (CEO notes)

- Daily Drop panel: label is "DAILY DROP", headline "Discover a new career in 30 seconds", line "Keep your daily streak alive.", button "Catch the Drop". The 12-day streak stays; the saved-careers count is gone.
- Trending panel: "Featured in 3 career worlds" removed.
- Career simulation panel: same cover as the Play tab, button says "Play", the "$30B Deal" subtitle is replaced by the level name.
- Continue Learning & Playing: the investment banker card is "Day in the Life: Investment Banker" with the Play tab cover; "Finance Essentials" is "Finance Glossary Game" on Home and in Play; "Deal Team Kickoff" is removed and the Registered Nurse simulation card takes its place.

## Connect, 4 Sept (CEO notes)

- Event boards are named "Nonprofit & Company" and are ongoing channels, not one day's event: Dream Opportunity & EY, Dream Opportunity & Morgan Stanley, Junior Achievement & Goldman Sachs, Dream Opportunity & SEO Scholars (new, partner and date to confirm), Dream Opportunity & JPMorgan Chase. The city sits with the date under the name. AT&T Dallas is out: the boards follow one New Jersey student. The line under the name is the date (the next one when booked), the time once confirmed, and the city.
- Event cards and the event board header are no longer colour blocks: dark glass, the partner's colour as a corner glow, a fine ruled texture, and no photos anywhere an event is shown. Students, Pros and Posts are back on every card and in the board header, because partner nonprofits pay to see them. Open board and Enter code are solid buttons.
- The Junior Achievement mark was JA Singapore's; it is set in type until a US mark arrives.
- Ask a question is replaced by a search bar on the Connect landing (communities, topics, companies, events). Asking lives inside each board.
- Community cards: name first, then three tiles, Students, Pros and Companies. Post counts are gone. "Suggest a Community" is now "What should we launch next?" with four candidate communities and one vote each.
- "People to Follow" is "Professionals to Follow".
- Event boards carry an official Dream Opportunity post: what happened, about the company, what to do next, a link back to the matching community, and event photos.

## Home rail, 4 Sept

- The Continue Learning & Playing cards are built exactly like the Play tab's cards: cover, poster title, world label, level and real progress from the same save the Play tab reads, and a play badge in the middle. Cards in progress say Continue; new ones say Play. Home, Play and the game all say "Day in the Life".

## Profile, 4 Sept (CEO notes)

- Header: the A/B cover switch and "Upload your own" are gone. Students pick from the curated backgrounds only. The real app should carry about 40.
- My Plan: rebuilt in the career page's shape. One glass surface per level, rows on hairlines inside, no cards stacked on cards. Only the level title is bold; steps, times and actions are body weight. Every level starts closed.
- Overview tiles: titles in ink, one regular line beneath, so the three doorways read at the same weight without shouting.
- Career Report: subheadings (What You Do, Potential Employers, and the rest) are in the accent so the eye finds them. Education is one even list with the most common path first and tagged. Colleges show all six schools grouped by distance from the student (In New Jersey, A train ride away, Further away), reach to safety within each, each with its city. Which schools and how many per band is an open question for Jenny and Odein. Subheads that repeated a section title are gone. My Reflection is collapsed until tapped.
- Resume: labelled "Coming soon" with a line on what it will do; the button is disabled.
- Home carousel holds each panel for 13 seconds.
- Career Report, later: "Courses to Consider" is now "High School Classes to Take", each class named with the reason it helps, so it no longer reads as a repeat of the majors. Section header actions (Career details, College Lookup) sit on the title row where there is room and drop left-aligned under the title on phones and tablets. College cards open the lookup from one corner arrow.

## Landing, 4 Sept (CEO notes)

- Play chapter: the preview is now the game's own screen. Same scene art, the game's header strip with level and role, its dialogue box, its numbered option buttons and its right and wrong feedback. All three answers are live. The series title sits above the card, outside the game. Names are gone from the scene line.
- Build chapter: "Build your profile by taking a personality, skill, and academic assessment." The demo question reads 3 of 10.
- Landing on phones: the How It Works chapters snap one by one while scrolling down. Scrolling back up is free, and desktop is unchanged.

## Connect boards, 4 Sept (Replit v2-connect as the source of truth for how information is delivered)

- Inside a community: four tabs, Questions, Insights, Updates, About. Industry Updates is verified posts from the firms whose pros answer here, filterable by firm. The question composer now closes the feed instead of opening it. Header and cards unchanged.
- Industry Updates is new: firm posts with the kind of thing it is, the deadline, who it is for and where, and one action. The Finance board carries three real early-career programmes (Goldman Sachs, Morgan Stanley, JPMorgan Chase) with "check the firm's page" instead of dates that go stale.
- About gained Community rules and Moderators as disclosures.
- Card designs and the board header are unchanged, as asked. Not adopted from the reference: the Dream Points read, reply, post ladder, and the "professional insights maps to volunteer influencers" idea, both flagged by the CEO as not thought through yet.
- Profile, later: one card holds the tab bar and whichever panel is open. Inside it the groups are a darker sunken step in the career report's paper colour, not a second layer of glass. The three Overview doorways sit side by side as smaller cards at every width.
- Connect, Professionals to Follow: no more cards. A row of large portraits, each ringed in its firm's colour, with one badge on the corner: the volunteer tier the pro has earned (Diamond, Gold or Silver by how recently they helped), or the verified shield if they have no tier. Name, role and firm in three steps, and a small Follow button. Scrolls sideways on phones. The pro dashboard's activity status now varies by pro instead of calling everyone Gold. The launch vote card lost its caption.
- Volunteer dashboard: "View all N answered" under Ask Me Anything opens every answered question with its response link; Show less closes it. Where the count is larger than the prototype's data, the panel says how many are on file.
- Community cards: the stat boxes and company marks sit on a light blur instead of a dark fill, so they read as part of the photo rather than chips; Open is a solid rounded button tinted with the card's own accent, an outward arrow, the one solid object on the card, no blue.
- Volunteer dashboard: "View all N answered" opens its own screen, Questions you answered, newest first, with a response link on each. Built to page through hundreds later; the prototype notes how many it holds.
- Community cards: hovering or focusing "+N more" shows the remaining companies in a small tooltip.
- Professionals to Follow: the only badge is the verified shield; the tier medals are gone (one icon in three tints that everyone wore said nothing). No ring of any kind around the portraits, so the row stops reading like story bubbles.
- Professionals to Follow: name, role and firm are one line each, so every column is the same height and Follow sits the same distance from every face. Long roles truncate and show in full on hover.
- Landing on phones: every chapter fills the screen (the short ones too), content starts under the nav's zone instead of floating mid-screen, and a small "Scroll" chevron bobs at each chapter's foot except the last. Scrolling down snaps chapter by chapter; scrolling up is free. The nav island stays put for the first 11 seconds, then hides on scroll-down as before.
- Landing Play preview: the career is named once, above the card; the header strip keeps Level 1 · Intern and the reputation ring. The ring and the progress bar draw themselves in on load. More of the scene shows, the dialogue box hugs its bottom edge, and the options carry no numbers until a result replaces them.
- Volunteer dashboard: "2026 Impact Summary" is "My 2026 Impact Summary".

## Later, 4 Sep (local only, not pushed)
- Landing Play preview rebuilt for immersion: the career is named once in a caption above the card, the 4:3 scene shows the full image with no crop, "Level 1 · Intern" chip stays, the reputation ring and progress bar are gone, options carry no numbers.
- Landing Connect chapter: Jordan and Priya share the same purple; Jordan reads "NYU · Freshman", Priya "Pace University · Sophomore"; Maya is tagged "Howard University · Sophomore". Maya's portrait still needs a photo of a Black woman (no suitable asset exists in the repo yet).
- Home: the "27 cards, a pattern is forming" signal banner is replaced by a static "Your Next Moves" row with My Plan, Community Boards and Resume Builder, using the CEO's exact copy. My Plan and Resume Builder deep-link into the matching profile tab via ?tab=.
- Explore > Browse: new last rail "Videos Inside Leading Companies" under Typical Pay. Five poster-shaped video cards (Mars via the Kellanova talent director clip, JPMorgan Chase office tour, EY senior cyber consultant, AT&T office tour, Kellogg's office tour), each with the company mark top-left, a play button in the middle and the title on the scrim. Tapping opens the clip full screen with sound and controls. The EY clip is new (Part 1, re-encoded from the M4V the CEO dropped in the repo folder). WildBrain is on the CEO's list but no clip was supplied, so it is not shown yet. Mars, Kellogg's and WildBrain show their name in type until brand-compliant logo files are approved.
- Home: Continue Learning & Playing cards stretch to fill the row on desktop instead of leaving empty space on the right.
- Landing Connect chapter: Maya's portrait is now a Black student (Unsplash, free licence, photo dPQBwZ6d-NU), cropped to a headshot.
- Landing (phones): the "Scroll" nudge now only shows when the whole chapter fits on the screen. Play's card is taller than a phone, so its nudge is gone instead of sitting over the third answer.
- Landing Play chapter rebuilt as a console game tile (Xbox/PlayStation direction): the scene art with a blurred copy glowing behind it, a rim-lit frame, one light sweep as it arrives, a slow camera push, and a desktop tilt toward the cursor. A gold XP bar runs the full width of the top edge beside the Level 1 · Intern chip. The situation is now a conversation: Christina (serious sprite thumbnail, "Associate") types her line about Marcus and tomorrow's pitch, the three choices rise as a console menu with the cursor resting on the right one, and it confirms itself with a check, the light sweep, the bar sparking forward and a +25 XP pop. Nothing can be got wrong: the other two rows are not buttons. It runs on its own; no press-to-play. "Day in the Life: Investment Banker" is a step larger.
- Shimmer feedback everywhere: the confirm sweep peaks at 26% white instead of 60%, fades out through its second half and ends fully past the row, so no white slab is left behind. Profile tab "updated" cue now passes through the letters only, not the pill's padding.
- Landing (phones): the "Scroll" word and chevron are gone. The nudge is now the app's own swipe-up gesture mark (touch ring, then a dot travelling up), crisp with no glow or trail, centred in a full-width row so it cannot sit off centre.
- Landing Play: the "Right. Clarify scope..." line is removed; the check on the answer is the feedback. Christina's line is set in quotation marks in the body face at medium weight, so speech reads apart from the bold question.
- Landing (phones): the scroll cue is now an up chevron, the swipe-up dot with a hollow-stroke trail (two outlined rings following it, no glow), and the word SCROLL under it, all centred.
- Phones are a pager now: the hero, each How It Works chapter and the footer snap one screen at a time in both directions (y mandatory, never toggled from JS, which was the source of the jank). Every chapter is exactly one screen tall with the heading and caption above the graphic and the block centred; the graphic frame is sized to the room left under the nav, copy and scroll cue. The "How Dreamari works" header becomes a small eyebrow above BUILD on phones.
- Scroll cue: the up arrow is gone (beside a dot already travelling up it read as "go back up"); the cue is the swipe-up dot with its hollow trail and SCROLL, in the flow at the foot of every chapter, so it can never overlap a card.
- Explore > Browse videos: WildBrain office tour added (encoded from the 4K clip the CEO dropped in). Mars, Kellogg's and WildBrain now carry real marks: Mars and Kellogg's as one-colour white wordmarks, WildBrain with white letters and its blue W creature kept blue. All three registered in docs/BRAND_MARKS.md as "to confirm with the brand".
- Phones: the graphic sits at the centre of every chapter screen with the heading and caption directly above it; Get Hired's card is a touch shorter on phones so its copy clears it.
- Landing Play: no auto-answer. The cursor rests on the right choice and only a tap confirms it. The "Deal Team Kickoff / Scene 1" filler is gone; the question is visible from the start, dimmed while Christina is still talking.
- Landing Play: the blurred colour halo behind the card is removed; the card sits on the page with just its rim-lit edge.
- Explore > Browse videos: the company mark moved from the frosted chip at the top of each card to the dark scrim right above the title, white and larger, so it reads against bright footage.
- Explore > Browse videos: both EY cybersecurity clips are in, titled "Senior Cyber Consultant, Part 1" and "Part 2" (they are different videos, not a duplicate).
- Explore > Browse videos: the Mars, Kellogg's and WildBrain files are trimmed to their ink and every company mark on the cards is set by letter height (15px, one baseline) rather than by its file box, so no logo reads bigger because its artwork carries more air or ornament.
- Home highlights carousel rethought as feature cards: the photo fills the whole card and pushes in slowly while its panel shows; on desktop the frost ramps in from the left so the image stays sharp on the right, on phones it ramps up from the foot. Text is one tight block at the foot: eyebrow, a bigger title, one HUD chip line (streak, Level 1 · Intern with the gold progress bar, Fast-growing role) and one action styled like the career page buttons. Text rises in with a stagger on each panel change. Story-style timing segments and pause sit top-right, prev/next sit bottom-right, so nothing crosses the title. No colour washes.
- Home highlights: Trending panel is now Nurse Anesthetist (the UX poster's subject sat under the text side of the frame); the frost and scrim overhang the card's foot so no hairline of raw photo shows at the bottom border; Dreamy is a touch larger on desktop.
- Home highlights: panel 2 now announces the Registered Nurse game as newly unlocked (Investment Banker already lives in the Continue rail below). The frost on every panel is a blurred copy of the photo masked in, not backdrop blur layers, which removes the flicker and edge lines that showed while the photo pushed in. The hairline top rim is gone.
- Home highlights: Trending panel is Drone Pilot (a growth field outside Health, which panel 2 already covers, and a poster whose subject sits in the clear right side of the frame).
- Landing Play: answering now plays a win. The whole card flashes, confetti bursts from the check with the Build flow's burst and ring, and Christina's thumbs-up hallway scene from the game fades in full bleed behind the dialogue and menu while her thumbnail switches to her smile.
- Landing on phones: no more overlap between the caption and the graphic (seen on an iPhone in Connect and Get Hired). The copy row can no longer shrink below its text, and the graphic frame grows to its content instead of letting a taller card spill upward. On a short phone the section grows a little rather than overlapping.
- Landing on phones: a finished interaction now really lands on the next chapter. Scripted advances switch snapping off for the ride and back on when the scroll settles, so the page no longer snaps back to the chapter you just finished. Play advances to Connect after its win, Connect advances to Get Hired after the thread has been read, Build and Match as before.
- Landing on phones: the closing "You're ready" block is its own snap stop, so the tail after Get Hired no longer springs back to the chapter top on a slow scroll.
- Landing Play win: "Correct!" pops in with a one-line reason, the dialogue and the menu fade away, and the card is only Christina's thumbs-up scene with the level chip and XP bar.
- Type: Favorit is retired. Bricolage Grotesque is the one display face across the landing page and the app (wordmark, headings, poster caps where the world face is not used). The Google Fonts sheet loads once from the root layout instead of on each page; the Favorit file and the local font loader are removed; the token sources and generated CSS say Bricolage Grotesque.
- Landing on phones: a little more room between a chapter's caption and its graphic (Get Hired's card sat tight under the copy).
- Design tokens: unused tokens purged (587 to 464). Foundations, the shadcn-style semantic roles and the shadcn-style component groups (button, input, progress, toast, card) all stay, so the set Usman pulls still lines up; retired screen tokens and prototype-only colours are gone. Rules recorded in design-tokens/README.md. Validation and the generated CSS check pass.
- Explore videos: the Kellogg's office tour carries the Mars mark (filmed at Kellanova, now Mars). The two aviation maintenance technician clips are in the Explore For You reel as Part 1 and Part 2; no company is named in them so they sit with the career clips.
- Brand marks: every mark is cleared for demo use. Microsoft, Apple and Netflix show their marks again instead of type. Register updated.
- Landing on phones: after a scripted advance (Play to Connect), the browser now treats the new chapter as the snapped one, so tapping Enter Community no longer snaps the page back to Play.
- Landing: Get Hired has its own scroll cue again (there is more below it), so on tablets the only cue in view is no longer the previous chapter's.
- Docs: Figma v2.0 audited against the prototype. docs/DESIGN_SYSTEM_ALIGNMENT.md records what is aligned (colours, glass, radius, spacing, display face), the four stale Figma values (labels still Montserrat, white primary CTA, card fill, Favorit), everything the prototype has that Figma does not, and instructions for the production app and its agent. AGENTS.md points to it.
- Figma v2.0 brought level with the prototype: 15 text styles retyped (Montserrat labels, captions and body to Inter; Section Heading and the stat numerals to Bricolage Grotesque), CTA Default and Disabled variants now brand blue with white text. Card fill and display face were already right. A fresh export is the remaining step for the app.
- Docs rewritten for the post-Figma state: alignment doc, token decisions log and the tokens README now say Figma matches the prototype and the app needs one fresh export.
- Explore videos: the Kellogg's office tour carries the Kellogg's mark again. Only the Kellanova talent director clip carries Mars.
- Play tab: the Career Simulations rail runs to the right edge of the screen on desktop instead of clipping at the content column, so the next card peeks in. No sideways page scroll.
- Connect, volunteer dashboard: Activity status now varies per professional. The icon follows the tier (gem, trophy, medal, coffee for a break), the ring shows how much of the tier's window is left, and the copy names when they last answered, how many answers they have, and the one thing that keeps or lifts the tier.
- Connect: nine more verified professionals so every company has at least two voices (EY, Deloitte, CVS Health, Nike, Microsoft, Mayo Clinic, Pfizer, JPMorgan Chase, Spotify), with real portraits and deliberately uneven activity from answered today to a two-month break. 24 professionals in all.
- Connect, event boards: the event cards are shaped like tickets. Round notches cut into both edges and a perforated line mark where the stub begins; the stub carries the counts, the lockup and the action, the body carries the name, date and city. Community cards are unchanged.
- Connect, event tickets refined: the card's coloured edge now runs through the notches (an outer edge box and an inset surface box share the notch mask), the stub sits on its own lighter tinted paper, and the perforation takes the partner's colour.
- Connect, event tickets v3 (trial): the stub carries a QR code (prototype pattern, not scannable) beside the lockup and the action on phones; from tablet up the stub becomes a side stub on the right with the QR, cinema-ticket style, and the lockup and action stay in the body. Same words and elements, only the QR added. Tags: tickets-og (before tickets), tickets-current (edge-following notches, no QR).
- Connect, event tickets v4 (trial, not pushed): side stub on the right at every width carrying the lockup turned on its side; tap the stub for the event's QR (prototype pattern with the partner's colour in the centre plate). Counts sit in three thin circle outlines, the action on its own line. Every ticket is the same fixed height, the tear line sits exactly on the notches and the top tab centres on the body.
- Connect, event tickets: the stub keeps the lockup on its side for now (an upright stack will be needed before shipping, brands forbid rotated logos), and "Opens after the event" sits in the action row where the button sits on other cards, so all rows line up.
- Connect, event tickets: the counts sit on small frosted discs (blurred glass, hairline edge) instead of coloured rings, a touch tighter.
- Profile: the locker has two shelves. "Archive" (formerly Saved Careers, renamed everywhere) and "Event Stubs": one torn vertical ticket per event attended, in the partner's colours, with the day large, the name, the city, the lockup on the stub and an arrow. Each opens its event board.
- QR everywhere it belongs: a small quiet QR icon in the corner of each event ticket's stub, each locker stub and beside the lockup in the event board header. Tapping opens the branded QR sheet (white plate, partner colour on the centre tile, lockup and event name). The ticket stub no longer flips on tap. Board headers keep the banner shape but share the frosted count discs and the QR icon.
- Home highlights: panels advance every 7 seconds instead of 13, in line with the 5 to 8 second band the large streaming and store homepages use; the timing segment and the photo push run on the same clock. Panel 2 reads "New game launched".
