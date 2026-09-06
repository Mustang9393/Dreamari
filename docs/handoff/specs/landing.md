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
