# Connect (`/connect`)

Status: Locked (5 Sept 2026). Role switch and volunteer picker are demo-only.

## Student home
Community / Events switch, search, "Your Communities" cards, "What should we launch next?" votes, Professionals to Follow (faces, first name, role, company, Follow).

## Community card (one component, everywhere)
`src/components/connect/CommunityCard.tsx`: cover photo, name, three stat tiles (Students, Pros, Companies), two company marks then a "+N" chip (opens a panel; closes on outside tap or scroll), Open button. The whole card is the tap target. Used on the home, the professional profile and the volunteer dashboard.

## Community boards
Tabs Questions / Posts / About; the ask composer sits under the board header. Answers carry Like, Share, Report, Follow.

## Event boards
Ticket cards (whole ticket tappable: opens the board, or the code sheet when not joined). Board tabs: Questions, Posts, Insights, Resources, People, About. Resources: Photos (gallery of one large and four small frames with the remaining count; full-screen viewer) then Files (icon, title, one meta line; folders expand on tap). Photos are licensed Commons photography for the prototype (`public/images/connect/events/ATTRIBUTION.md`).

## Professional profile (as students see it)
Personal cover from the same six covers as the student profile (never the employer's colours; the professional can pick one on their own view), name, tier badge, role · company mark, Follow. Views · Followers · Likes in short form (48.1K). Personal story and verification line. Panels: "Ask Me" (composer, then answered questions in the same card), "My Posts", "Communities" (the shared card), "About Me" (Education, Can help with). Dreamari blue for every industry.

## Volunteer view
The Volunteer role opens the profile as students see it; "My dashboard" opens the private dashboard (My Profile: routed questions, posts, communities; My Impact: numbers, chart, activity status, company card, impact summary) in Dreamari blue. Back returns to the profile.

## Content rules
- All 24 professionals use the new headshots (`pro-<id>.jpg`).
- No question or answer describes long hours, boredom, dislike, or any downside of an employer or profession. Questions are framed as career insight.
- Students never have follower counts; there is no messaging.

## Files
`src/components/connect/ConnectExperience.tsx`, `ProProfile.tsx`, `ProDashboard.tsx`, `CommunityCard.tsx`, `primitives.tsx`, `data.ts`.

## Demo role switcher (6 Sept 2026)
The five-role switcher (Student, Attendee, Volunteer, Partner, Staff) is hidden behind a small "Demo" button at the top of Connect. A student sees only the button; pressing it reveals the roles. Once a non-student role is showing the roles stay visible so the way back is obvious. Demo only, never a product feature (Joshua Pierce, Slack, 6 Sept 2026).

## People tab (Joshua Pierce, Slack, 6 and 7 Sept 2026)
Connect has three tabs: Communities, Events, People. Notifications moved behind the bell beside the tabs. People follows Joshua's reference: a segmented control, For you and Browse industries. For you: a Find a professional panel (the student's Top 3 careers as chips that open their industry, and Explore all industries), For you today (three cards: "Matches your #1 career" and so on, the top-ranked verified professional in each Top 3 world, each quoting a question they answered, View profile and Follow), Browse by industry (every world with professionals, its count, tap to browse), then New from people you follow. Browse industries: "Choose an industry to meet people who actually do the work." with every world and its career-path count (Coming soon at zero). An industry opens a grid of its professionals with a back link. The shared search box above the tabs searches names, roles, companies, fields, worlds and topics. Nothing ranks students. `src/components/connect/PeopleTab.tsx`.

## Professional profile (Joshua Pierce, 6 Sept 2026; Chandu, 7 Sept 2026)
Structure follows Joshua's reference, minus the full-bleed cover. A row above the header: "View all professionals" (back) on the left, Follow (and the volunteer's own My dashboard) on the right. Header card: cover photo, 96px portrait with the verified shield, name, tier pill, role | company mark, then Views, Followers, Likes as one line with hairline dividers and no icons. Under it, one translucent dark surface (rgba(8,10,24,0.5), blurred) holds four ruled sections with plain titles: Ask Me (title and "Ask Amara about their career." on the left, the composer on the right, answered questions as inset rows with an Answered pill and chevron), Latest Posts (inset rows, View all toggle), Communities (the same photo community cards as the Connect home, two columns, View all), About (the story, Education with an icon tile, topic chips, the verification line). No section is its own floating card. `ProfileCard` and `InsetRow` in `ProProfile.tsx`.

## Volunteer picker portraits (7 Sept 2026)
Connect's own copy of the avatar map pointed at the old photo set, so the demo volunteer picker showed empty circles. It now uses the one `Avatar` from `primitives.tsx`.

## Community cards on tablets (7 Sept 2026)
The company chips row wraps under the Open button when the column is narrow (two columns at 768px), instead of running into it.

## Professional profile, second pass (Joshua Pierce, 7 Sept 2026)
No lede under Ask Me (the title and the composer already say it). Ask Me shows one answered question at rest with "View all N"; My Posts (not Latest Posts) shows two with View all. Communities uses the compact community card (228px minimum instead of 312px) so the boards read as secondary to the person. The profile surface is a step lighter than before: the shared panel glass with 7% brand blue mixed in, instead of the near-black tint.

## Community feed: sort, view, and posts that read as a feed (direct feedback, 8 Sept 2026)
Learned from Reddit's community page (r/duolingo, the user's own reference), scoped to what's worth borrowing -- no awards, no crossposts, no Hide/Report:

- **Card view stops being a floating box.** `QuestionCard`/`InsightCard` no longer wrap in the shared `Card` (bordered, shadowed, rounded surface) -- each post sits straight in the feed, divided by a hairline (`RULE`, matching Reddit's own "no bordered box, just a divided list" posts), with a background tint on hover standing in for the old hover ring. Same whole-row-opens-the-thread behavior as before.
- **Compact view**: a new dense single-line row (`CompactRow`/`CompactQuestionCard`/`CompactInsightCard`) -- avatar, one-line title, a meta line, a helpful-count pill and comment count on the right, one hairline divider between rows. Denser than Reddit's own "Compact" (which still keeps the full multi-line post, just with a smaller thumbnail) -- deliberately, since the point of Compact here is scanning many posts fast.
- **Sort**: Best (helpful count) / Most Recent, the latter parsed from the seed data's `postedAgo` strings (`agoMinutes()`) since there's no real timestamp field.
- **View and sort controls are quiet text/icons, not a second Segmented chip bar** -- the first pass used the same solid-pill styling as the Questions/Insights/Updates/About tabs above it and the two rows fought for attention (direct feedback). Reddit's own version is small plain text ("Best ⌄"); ours is muted-vs-foreground text links and two small icons, no border or background container.
- **`HelpfulPill`**: the one element Reddit renders as a rounded pill in every view (its vote widget) -- everything else in its action row (comments, share, save) stays plain text/icon. This feed has no downvote, so the pill carries just the thumbs-up and its count; used in both Card view (as a real button) and Compact view (as a static visual match, since the row itself is already the whole clickable target and a button can't nest inside a button).
- View persists across sessions (`localStorage`, `dreamari:connect-feed-view`); sort does not (resets to Best on reload, matching Reddit's own default).
- Applies to `BoardView`'s Questions and Insights tabs (both share `QuestionCard`/`InsightCard`, which `EventView` also happens to use for its own Questions tab -- it inherits the same flat-list look as an incidental consequence, not a separate pass over event boards).
- Files: `ConnectExperience.tsx` (`FeedControls`, `CompactRow`, `CompactQuestionCard`, `CompactInsightCard`, `HelpfulPill`, `agoMinutes`, `QuestionCard`, `InsightCard`, `BoardView`).

## Questions read as posts, not quotes (direct feedback, 8 Sept 2026: "I'm not sure the feed reads as posts... how does Reddit organize this?")
Two real gaps, not a skin problem: no information scent (a title alone doesn't say whether a question is worth a click) and the answered/unanswered signal was a small pill that only ever showed for the zero-comments case, easy to miss. Fixed against the actual pattern Stack Overflow and Quora use (a Q&A site's own convention fits better here than Reddit's general one): a colored answered/waiting state as the leading, always-visible fact, plus a one-line preview of what's actually inside.

- **Title is a plain heading, not a quoted line.** `&ldquo;{title}&rdquo;` read as a quotation to click into, not the subject of a post -- Reddit and Stack Overflow both just set the title.
- **`questionSnippet()`**: a one-line preview under the title -- the primary pro answer's own opening line if the question has one ("Elena Martinez: You have more than you think..."), or the asker's own `context` elaboration if it doesn't yet. Either way the row previews what's actually inside before you open it, the way Stack Overflow/Quora preview the top answer and Reddit previews the post body.
- **The real `thread.state` (`StatusChip`, already built and used elsewhere -- `awaiting`/`routed` both read "Waiting for an answer", `answered`/`resolved` both read "Answered") replaces the old ad-hoc `comments === 0` "Unanswered" pill**, and moves to lead the action row (state -> helpful -> comments -> Save) since it's the one fact that actually decides whether a question needs you. Compact view can't fit the full label on one line, so it's a plain colored dot with the same text as an `aria-label`.
- **Save drops its text label, icon-only, pushed to the far right (`ml-auto`)** in both Card components -- a secondary action that doesn't need to compete in text with the state/helpful/comment cluster that actually explains the post.
- Reference audit for "how does Reddit organize this" (for whoever picks this up next): Reddit's own anatomy is [author+time metadata] -> [title, the dominant element] -> [optional body/media] -> [action row], author-metadata always secondary to the post's subject -- which this feed already followed. The gap was Q&A-specific (an "is this answered" signal, an answer preview), which Reddit's general link-aggregator model doesn't have any equivalent for -- Stack Overflow/Stack Exchange and Quora do, and were the actual reference for this pass. Discourse (topic list: reply count, last-poster avatar, category tag) and Hacker News (rank, title+domain, points, comment count, no avatars at all) are the other two well-known community-list patterns worth knowing, if a future pass wants a third opinion.

## Real implementation: 4-way layout toggle, live per-student generated avatars (direct feedback, 8 Sept 2026)
The mockup review (Discourse/Stack Overflow/Reddit reference pass, and a DiceBear avatar comparison) turned into real code the same session, once the direction was confirmed against the live app rather than a static artifact.

**Feed layout, a real toggle in `BoardView` (not a mockup)**: `FeedView` is now `"card" | "aligned" | "rail" | "compact"`, defaulting to `"rail"`. `AlignedQuestionRow`/`AlignedInsightRow` (Option 1: fixed-width right-aligned reply-count column, tabular figures) and `RailQuestionRow`/`RailInsightRow` (Option 2: a slim left rail + a bigger bolder title, metadata pushed down) sit alongside the original `QuestionCard`/`InsightCard` ("Current") and `CompactQuestionCard`/`CompactInsightCard` ("Compact"). All four keep full StatusChip/HelpfulPill/Save functionality -- the toggle changes hierarchy, not what a post can do. The rail itself is a constant brand color (`var(--primary)`), not the question's answered/waiting state -- an early pass colored it per-state and green-for-answered read as over-signaling on every row (direct feedback: "I like rail without the green rail, let's get rid of that"); the StatusChip inside the row already says answered/waiting in words. Per user decision: "Columns and Rail are good... let's have those 3 [Current/Columns/Rail] for demo, Compact can exist alongside as an alternative for user preference" -- Compact is a density preference, not a fourth hierarchy option being judged against the other three. The toggle itself is quiet text (`FeedControls`), same treatment as sort, so it doesn't fight the real tabs above it.

**Generated avatars, app-wide**: `src/lib/avatar.ts` is the new shared source -- `useAvatarStyle()` / `setAvatarStyle()` (localStorage + event, same idiom as `dreamScore.ts`) and `generatedAvatarSvg(seed, style)`. `Avatar` in `connect/primitives.tsx` (used everywhere in Connect) and the student's own header photo in `ProfileExperience.tsx` (previously an uploadable `<img>`, `STUDENT.avatar`, with a pencil-edit affordance -- removed along with the upload capability, since there's no photo to upload anymore) both call it. Seeded by the person's first name only, so "Jordan Rivera" (profile) and "Jordan" (community handle) draw the identical avatar -- one face per person, not one per string variant. Pros are untouched -- they still wear their verified portrait; the "mixed cartoons and photos" note earlier in this file warned against mixing styles arbitrarily, but a generated avatar for a protected student identity next to a verified pro's real photo is the intended contrast now, not that problem recurring.

Three styles ship (`notionists`, `avataaars`, `openPeeps`), all CC0 1.0 (public domain) or "free for personal and commercial use" design licenses with MIT code -- no attribution owed, cleared for commercial use. `personas` and several other DiceBear character styles carry CC BY 4.0 design licenses (attribution required) and were left out for that reason alone, not visual quality. Every style is constrained to happy/neutral/cool expressions only (direct feedback: never sad/angry/distressed) -- Notionists' and Open Peeps' variants are unnamed line-art styles with no mood names to exclude in the schema; Avataaars names its moods, so its `mouth`/`eyes`/`eyebrows` option arrays are hand-trimmed to the safe subset in `avatar.ts`. A real DiceBear bug worth knowing: the library bakes a literal `width="64" height="64"` onto the root `<svg>` -- fine at 64px, but any smaller slot (26px in a feed row, 24px in Compact, 72px on the profile header would be fine but anything under 64 wasn't) got a cropped corner instead of a scaled-down avatar until `generatedAvatarSvg` rewrites those attributes to `100%`.

Not yet built: a visible style-switcher control (the library-level plumbing for all three styles exists and is one call away, but no UI lets a viewer pick between them yet) and the "choose one, unlock the rest" gamification layer explored in the mockup (a starter set + Dream-Score-gated unlocks) -- both are real follow-ups, not abandoned ideas.
