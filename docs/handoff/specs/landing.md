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

## Credibility lines and partner ticker (Joshua Pierce, 6 Sept; both pages, 7 Sept 2026)
"Powered by insights from Dream Opportunity and leading corporate partners." and "Informed by Dream Opportunity's work with 100+ schools." sit before the closing CTA on the student page (Start Journey) and on the Schools view. Under them runs one slow marquee of the real partner set (22 marks, `public/images/marketing/partners`, sources in its ATTRIBUTION.md): white silhouettes on the dark student page, ink silhouettes on the light Schools view, edges fading, pausing on hover, a static wrapped row under reduced motion. Every mark is trimmed to its ink and sized by pixels for equal visual mass (constant ink area, height 16 to 30px, width up to 150px), never by its file frame. `PartnerTicker.tsx`. Pringles has no vector source yet; MTV's is a filled block and is left out.

## Demo hints (Joshua Pierce, 7 Sept 2026)
A very quiet ring pulse (`mkt-pulse`, 2.6s, no scaling, off under reduced motion) on the one control each chapter wants tapped next: Match's X while Management Analyst is on top, then the thumbs-up when Investment Banking is on top; Play's "Ask for your role and deadline" row; Connect's Enter Community button. Play's "Level 1 · Intern" line moved off the art to sit under "Day in the Life: Investment Banker".
