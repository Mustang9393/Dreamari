# Landing page (`/`)

Status: Locked (5 Sept 2026).

## Structure
Hero → How it works chapters in this order: Build, Match, Play, Explore, Connect, Get Hired → closing CTA → footer with the Dreamari mark and wordmark.

## Chapters (desktop, 901px and up)
- Each chapter is one visible screen under the nav (`min-height: calc(100dvh - 96px)`), its row centred. Image sides alternate: Build copy-left, Match image-left, Play image-right, Explore image-left, Connect image-right.
- Phones: one chapter per screen with scroll snap (`y mandatory`), unchanged.

## Copy that is contractual
- Match: "Match" + "with careers and schools that fit who you are."
- Match card back: "Median salary" with one median per career (Management Analyst $99K, Investment Banking $361K, Private Equity $250K), "College major".
- Get Hired, My Top 3 mock: caption "Save your top 3 career paths and compare which one fits you best."; rows "University duration", "Cost", "Median salary"; no industry line; no FOCUS pill; IB $361K/year, Accountant $81K/year, Video Game Designer $98K/year.
- Connect chapter board card shows Morgan Stanley, EY, HSBC + more.

## Behaviour
- Nothing auto-scrolls the page (Connect used to).
- Play chapter is a self-running console tile; no Christina inset, no progress bar.

## Files
`src/components/marketing/chapters/*.tsx`, `src/components/marketing/ChapterShell.tsx`, `src/components/marketing/Footer.tsx`, `src/app/globals.css` (chapter sizing rules).

## Get Hired copy (Joshua Pierce, Slack, 6 Sept 2026)
- My Plan: "Turn your career goal into clear next steps." Panel: "Next 3 Months", "2 of 4 complete", then ✓ Explore careers and save your Top 3, ✓ Play a career simulation, ○ Ask a professional a career question, ○ Meet with your counselor. No career eyebrow, no percentage ring, no where-it-happens chips. Three type sizes only: stage title, subheader, body.
- Resume Builder: "Turn your experiences into a resume ready for employers." Preview sections: Experience (Volunteer Tutor · City Library; Camp Counselor · YMCA), Leadership (DECA · Treasurer), Skills, Awards. "Clubs and Leadership" is now "Leadership".
- Hire-Ready: "Get ready for internships, mentors, and future employers." Inside the image only "Your resume is ready to send." (no repeated HIRE-READY label).
- Not added: the "Powered by insights from Dream Opportunity…" lines and partner logos before Start Journey. Held pending confirmation of where they belong (likely the Schools page) and of the partner list.

## Get Hired, My Top 3 stack (7 Sept 2026)
The two side cards stay inside the panel (offset min(118px, 24vw)) and scale from their top edge, so all three tops line up and the cards behind end higher.

## Credibility lines and partner ticker (Joshua Pierce, 6 Sept; Chandu, 7 Sept 2026)
One partner display per page, inside the "Dreamari is created by Dream Opportunity" section (the Dream Opportunity mark, the contractual copy, the ticker, the closing line). Student page: the stamp above the footer, dark ground, every mark one-colour white (each brand's reversed one-colour logo; emblems with painted white counters such as HSBC and Warner Bros. are inverted by luminance so they never flatten into blocks). Schools page: the Built by Dream Opportunity section, light ground, every mark in full brand colour (EY's yellow beam included; light-grey originals such as Blackstone, AT&T and Goldman Sachs are darkened to read). The two credibility lines ("Powered by insights…", "Informed by…") sit before the Schools closing CTA only; nothing sits before the student Start Journey CTA. Order: JPMorgan Chase, Amazon, EY, Goldman Sachs, Chase, HSBC, Blackstone, AT&T, then the rest of the wall (22 marks; Nickelodeon, MTV and Pringles out). Each mark is trimmed to its ink and sized by pixels for equal visual mass; images load eagerly because a lazy image on a moving track never triggers. `PartnerTicker.tsx`, marks in `public/images/marketing/partners` with ATTRIBUTION.md.

## Demo hints (Joshua Pierce, 7 Sept 2026)
A very quiet ring pulse (`mkt-pulse`, 2.6s, no scaling, off under reduced motion) on the one control each chapter wants tapped next: Match's X while Management Analyst is on top, then the thumbs-up when Investment Banking is on top; Play's "Ask for your role and deadline" row; Connect's Enter Community button. Play's "Level 1 · Intern" line moved off the art to sit under "Day in the Life: Investment Banker".

## Get Hired chapter alignment (7 Sept 2026)
The centered chapter centres its copy block and its graphic as one group, and the graphic frame hugs its card instead of taking the viewport-based frame height, so the title, oneliner and the My Top 3 panel sit centred and close together at every width.

## Connect chapter headshots (Joshua Pierce, 7 Sept 2026)
Marcus and Priya use Joshua's supplied headshots (`public/images/marketing/avatar-marcus.jpg`, `avatar-priya.jpg`).

## Connect chapter community card (7 Sept 2026)
The community board card keeps its coloured glass surface (no photo, no accent line) and borrows the app's community card language: an accent-tinted border and frosted stat tiles (white at 9% with an inset hairline). Same width as every other chapter graphic (min(94cqw, 480px)).

## Demo hints, second pass (7 Sept 2026)
The hints were too faint to notice. `mkt-pulse` now runs a brighter, wider ring (to 14px, 0.8 alpha) on a 2.4s cadence and a narrow light band (about a third of the control) that crosses the control for most of the cycle. Applied to the Build chapter's Business & Money row (its old `mkt-nudge-pulse` class had no styles behind it), Match's X then thumbs-up, Play's "Ask for your role and deadline" and Connect's Enter Community. Off under reduced motion.

## Poster rows (7 Sept 2026)
Every poster row (`poster-row`) carries 44px of headroom above and 80px below, pulled back with negative margins so the layout does not move, so the grown card and its shadow (about 46px below) are never clipped by the scrolling row. Verified on Explore, Home and the career page.

## Created by Dream Opportunity stamp, scale (7 Sept 2026)
The student page's stamp uses the Schools section's scale: the mark at 64 to 80px, the heading at clamp(1.75rem, 4vw, 3rem), the lede at 16 to 18px in a 720px column, the ticker at 1100px, section padding 80 to 112px. Dark ground, white marks. The 12-years closing paragraph appears on the Schools section only (Chandu, 7 Sept 2026).

## Schools stage labels (Chandu, 7 Sept 2026)
The five stages ("01 Build" through "05 Connect") render as one all-caps line, number and name at equal weight, instead of a small "STAGE 1" eyebrow above a separate large title. Number in the accent colour. `StageCopy` in `SchoolsView.tsx`.

## Get Hired Next button (7 Sept 2026)
The Next button in the four-stage mini demo carries the same shimmer+pulse hint as the other landing nudges.

## Connect stage, two cards (Chandu, 7 Sept 2026, follow-up)
The community card and thread card previously used `self-start`/`self-end` inside a flex column, which is a cross-axis (horizontal) property: it pinned one card to the left edge and the other to the right, leaving a diagonal void between two seemingly unrelated boxes. Both now share the same centered alignment and width (68%), reading as one connected flow.
