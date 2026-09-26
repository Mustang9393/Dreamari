# Simulation content intake: what a career's dataset must contain

This is the contract between the content team (Joshua's scripts) and the build. It says exactly which fields to supply for one career simulation. If a dataset has every field below and passes the validation list at the end, the build can turn it into a playable simulation without asking anyone a question.

Every field maps 1:1 onto `src/components/play/types.ts`. The column names below are suggestions for the spreadsheet or JSON export; the field names in `code` are what the engine reads. See [01-simulation-data-model.md](../01-simulation-data-model.md) for what each field does at runtime.

---

## Sheet 1: Career (one row)

| Column | Engine field | Rules |
|---|---|---|
| Simulation id | `Simulation.id` | URL slug, lowercase, hyphenated (`registered-nurse`). It is also the save key, the Performance Plan key and the music key. Never change it after launch. |
| Career catalogue slug | `Simulation.careerId` | The slug the rest of the app uses for this career (Career Detail, Explore, Top 3). Usually identical to the id. |
| Display title | `Simulation.title` | The job title a student would say: "Registered Nurse", "Investment Banker". |
| World | `Simulation.world` | Must be an exact key of `WORLD_COLORS` in `src/components/app/worlds.ts` (for example "Health & Medicine"). This one string sets the career's accent color everywhere in the game. |
| Employer (fictional) | `Simulation.firm` | A made-up employer name ("Cobalt Capital", "Riverbend Medical Center"). Never a real company. |
| Cover image | `Simulation.cover` | Path to the Play hub hero image (see [05-art-assets-and-prompts.md](../05-art-assets-and-prompts.md)). |
| Ladder, built | `Simulation.levels[].role` | The role of each level being delivered, bottom first ("New Grad RN"). |
| Ladder, not yet built | `Simulation.upcoming` | The remaining rungs, in order. Built + upcoming must equal the full ladder. Six rungs total today (the trailer finale draws exactly six). |
| Beat id prefix | (convention) | A prefix unique across ALL careers, for example `SE1-` for Software Engineer Level 1. Beat ids share one global location map, so a clash silently shows the wrong room. |

## Sheet 2: Level (one row per level)

| Column | Engine field | Rules |
|---|---|---|
| Level id | `Level.id` | `<abbr>-l<n>`, for example `rn-l1`. |
| Level number | `Level.n` | 1, 2 or 3 today. A level above 3 needs a Performance Plan entry added in code first, or the plan crashes when it fires. |
| Role | `Level.role` | Shown in the HUD ("Level 1 · New Grad RN"). |
| Title, blurb | `Level.title`, `Level.blurb` | Required by the type; not shown anywhere today. Supply them anyway. |
| Mood | `Level.mood` | `day` for almost every level. `night` (navy edges) and `crunch` (maroon edges) are used per beat for stretches. |
| Band word retired? | `Level.hideBand` | `true` on rebuilt levels: the HUD shows the number only and the tappable score explains the three outcomes. |
| Express cut | `Level.expressCut` | Beat ids the Express (short demo) run drops. Only teaching screens. Cutting a scored beat changes the point values (the scale keeps a perfect run at 100). Leave empty if the career has no Express mode. |

## Sheet 3: Characters (one row per person)

| Column | Engine field | Rules |
|---|---|---|
| Name | speaker key | Exactly as written in `speaker`/`castMember`. Case and spelling must match everywhere. |
| Role in the story | (drives the sprite set) | One of: mentor beside you, judge above you, peer you are measured against, figure at the top. See the sprite table in [05-art-assets-and-prompts.md](../05-art-assets-and-prompts.md). |
| Job title | (used in `setup` labels and ladder rungs) | Every ladder rung is "Name - Role", never a bare name. |
| Identity sentence | (sprite prompt) | Skin, hair, age, build, jewelry, exact wardrobe including uniform color, named props. This goes into the sprite master prompt word for word. |
| Voice pitch | `VOICE_PITCH[name]` in `SimulationPlayer.tsx` | Hz for the typing blips. Existing: Christina 640, Jordan 470, Marcus 360, Lamisa 560, Cobalt HR 600, Rosa 615, Denise 395, Tyler 505. Mentors sit high and warm (600-640), judges low (360-400), peers middle (470-505). Missing = 500 Hz, and every voice then sounds the same. |
| Face chip | `Level.cast[name]` | A square face crop, 420-512px (see art doc). |

## Sheet 4: Beats (one row per screen, in play order)

Every row has these common columns:

| Column | Engine field | Rules |
|---|---|---|
| Beat id | `id` | Prefix + number, unique across every career (`RN1-14`). Lettered sub-beats are allowed (`RN1-04b`). |
| Kind | `kind` | One of the 15 kinds in the table below. |
| Sub-type | `variant` / `layout` / `method` | Required for card, choice and check. |
| Speaker | `speaker` | `Narrator` (scene-setting, italic, silent, no name), `System` (the game talking: rules, squared box, silent), or a character name (bubble, name, face, voice blips). There is no mascot in the simulation. |
| Who stands in the room | `castMember` | When the person the scene is about differs from the speaker (a Narrator character card about Rosa). |
| Two people in the room | `castMembers` | Only works at a location with multi-person anchors (today only the IB reception). |
| Setup line | `setup` | The spoken or narrated line typed out before the question appears. About 25 words max. On cards this is a short eyebrow label instead ("Rosa • Staff Nurse", "Intern • Week 1"). Once the question appears the setup line leaves the screen, so the question must stand on its own. |
| Action prompt | `prompt` | Optional. The small grey instruction ("Tap one.", "Drag or tap the right word into the space."). Leave blank to get the default for the kind; enter an empty string on purpose to hide it. |
| Location | `BEAT_LOCATION[id]` in `locations.ts` | Every beat except the final review gets a room. |
| Hero art | `art`, `artAlt` | Optional illustrated plate for this beat. It stays up for up to 3 following beats. |
| Break the art chain | `resetScene` | `true` when the next scene moves on and the previous illustration must not linger. |
| Mood | `mood` | `night` / `crunch` for a stretch; blank inherits the level. |
| Tone | `tone` | `conflict` (amber edge, concerned faces) or `alarm` (red edge) for tense beats. |
| Spotlight | `spotlight` | `score` only on the beat that explains the reputation number. |

Scored beats (choice, match, rapid, chain, slider, flags, rank, pick, bucket) also need:

| Column | Engine field | Rules |
|---|---|---|
| Progress | `progress` | 0.1, 0.2 ... 1.0 across the ten scored beats (authoring metadata; keep it). |
| Plan line if failed | `planLineIfFailed` | A lowercase clause that completes "The last was when ___." in the supervisor's voice: "you opened a patient record that was none of your business". |
| Skills | `skills` | Exactly two names, each an exact key of `SKILL_MEANING` in `skills.ts`. |
| Feedback button | `feedbackCta` | Usually "Continue". The crisis beat can say "See what happens next". |
| Feedback body | `feedback` | Required by the type, never shown (the feedback card shows only the one "why" line). Enter an empty string. |
| Timer | `timer` | Seconds, only on choice, rapid, flags and pick. A timeout scores Wrong, never Risky. Do not put a timer on a slider (it is not enforced). |

### The 15 kinds and their extra columns

| Kind | Use it for | Extra columns |
|---|---|---|
| `card` | Every non-question screen | `variant` (intro, character, chapter, offer, step, act), `title`, `body`, `example`, `facts` (exactly 3 label/value tiles), `step` (at, of), `note`, `ladder` (bottom-to-top, "Name - Role", `lit` true for You and the card's person), `system`, `celebrate`, `auto` / `secondaryCta` / `secondaryHref` (act only), `cta` |
| `check` | Unscored comprehension gate after a teach card | `method` (tap for a concept, type for a number or exact word, drag when the answer should cost a deliberate second), `question`, `options` (label, correct, why; exactly one correct) or `answer` + `whyRight` + `hint`, `cta` |
| `reveal` | Tap-to-reveal list (skills, outcome bands) | `title`, rows (label, reveal, optional color red / amber / green), `note`, `cta` |
| `flips` | Vocabulary, one word per page | `title`, cards (term, def; at least one), `cta` |
| `focus` | Exactly two related terms, one in focus | `title`, two terms (term, def). No cta (buttons are fixed "Got it" / "Back"). |
| `choice` | The workhorse scored decision | `layout` (options, blank, tiles, document, boss), `question` (blank/tiles need exactly one `___`), choices (id a/b/c, label, tier, why), `doc` (document title), `dragEnabled` (options only) |
| `match` | Pair quotes/terms with what they mean | `question`, pairs (term, def), `whenRight`, `whenWrong` |
| `rapid` | 4-6 quick questions on one clock | items (question, options with label/correct/why), `whenPass`, `whenFail`, optional `timer`. Set the beat-level `question` to "" (not shown). |
| `chain` | Build one argument in 3 steps | `question`, steps (label, prompt, options with label/correct), `whenRight`, `whenWrong` |
| `slider` | Judge a level on an ordered scale | `question`, steps low-to-high (label, tier, why), 4 steps |
| `flags` | Find every error | `question`, rows (label, flag, why), `whenRight`, `whenWrong` |
| `rank` | Put rows in order | `question`, order (the CORRECT order), `whenRight`, `whenWrong`, optional `whenClose` (turns on partial credit) |
| `pick` | Choose exactly N | `question`, `pick`, cards (label, role pick / leave / harmful), `whenRight`, `whenWrong`, `whenHarmful` |
| `bucket` | Sort into two groups | `question`, two bucket names, items (label, into 0/1), `whenRight`, `whenWrong`. Interleave the buckets irregularly; items are not shuffled. |
| `review` | The level's last screen | `title`, `body`. Always last, never a location. |

## Sheet 5: Endings (one row per outcome, per level)

| Column | Engine field | Rules |
|---|---|---|
| Floor | `min` | Inclusive. Must include 0. The advancing ending is 85. |
| Headline, message, subline | `headline`, `message`, `subline` | Outcome first ("You are off orientation.", "Terminated"). Never the word "fired" (students are 13 and 14). |
| Button | `primary` | Replay label for non-advancing endings ("Start over"); the unlock label for the advancing one. |
| Advances | `advances` | `true` only on the 85+ ending. |

## Sheet 6: Performance Plan (per level, the three-strike recovery)

Structure is identical for every career; only the voice and options change. Fields: `warningSetup`, `warningQuestion`, `warningCta` ("Begin Recovery"); three steps, each with `setup` (step 1 contains `{PLAN_LINE}`), `correct`, `incorrect`, `whyCorrect`, `whyIncorrect`, `skillPrimary`, `skillSecondary`; `passedSetup` ("You made it out."), `passedBody`, `passedCta` ("Back to work"); `terminatedSetup`, `terminatedBody`, `terminatedRestartCta` ("Play this year again"), `terminatedLeaveCta` ("Back to Games"). The three questions never change across careers: (1) how is your work checked, (2) why did nobody hear about it, (3) name one thing you changed and show proof. Author the correct answer first; the engine randomizes position. Supply levels 1, 2 and 3 even if only Level 1 is built. Full example: `src/components/play/performance-plan.ts`.

## Sheet 7: Trailer (7 cards)

The seven-beat shape travels to every career: scale, odds, cost, room, consequence, the person at the top, the ladder. Columns: `id`, `seconds` (4 or 4.5), `text` (one plain line), `art` (reuse an existing plate; none = black), `sprite` (only on card 6: the top figure, dark-graded), `finale` (card 7 only; its text ends "How far will you get?"). No statistic we cannot source: ship the line without the number instead (D04).

## Sheet 8: Locations (one row per room)

`id` (career-prefixed, `riverbend-station`), image path, alt text, desktop focal point (x, y as 0-1), mobile focal point, character anchor (x, baselineY, heightFrac), and the list of beat ids that play there. Routing rule when a beat is ambiguous: internal prep/review to the internal meeting room, formal client/decision moments to the formal room, public working moments to the main floor, private transitions to the hallway. The room must not be empty while a line says a person is standing in it.

---

## Writing rules (from the shipped scripts; apply to every row)

1. Written for a 13-year-old. Setups about 25 words, options about 10 words.
2. No em dashes anywhere in student-facing copy.
3. Exactly one Best per scored beat. About one Risky per level (two at most, reserved for things that genuinely end careers).
4. Scored beat 1 is always the easy win: one obvious right answer, three options, no timer.
5. Options close in length, so the right one does not give itself away by being longest.
6. Every option's `why` explains THAT option, so a student who picks badly learns why their pick was weak.
7. Teach before you test. Nothing is taught that a later beat does not use.
8. The example on a teach card is its own screen.
9. Character cards come right before the character matters. Mentor and judge get two cards (role, then POWER card with the ladder). A peer gets one card and no ladder; describe what they do, never explain them.
10. Ladder rungs show only people the student has met.
11. The closing praise card is said to every student regardless of score, so the review that follows never reads as a lie.
12. True stakes only. If the career has no scarcity (nursing has no two-of-six), never invent one.
13. No numbers we cannot source. No real brands, logos or trademarks in text or art.
14. Headlines on the feedback card are derived from the tier ("Strong move!", "Not quite."). Never write your own.
15. Deliberate voice ("Crash out", "Subtweet him") is allowed where it is in character; do not soften it.
16. Composure beats competing: the peer-conflict beat always rewards the calm move.

## Pacing template (the shape both shipped Level 1s follow)

1. Arrival: celebrate card, true stakes line, "what this job actually does" system card, example on its own screen, drag check.
2. Mentor: role card, then POWER card with ladder.
3. Skills reveal: the two skills the next scored beat awards ("2 of 15").
4. Scored beat 1, the easy win.
5. Score explainer (reveal with `spotlight: "score"`, three colored rows) plus a typed check for "85". On `hideBand` levels this is retired; the tappable score explains itself.
6. Vocabulary: flips of 4 words (or two focus pairs), then a scored match or blank that uses them.
7. Rapid habits quiz, 4 items, 45 seconds.
8. The floor gets busy: rank (triage), boss moment, a blank with one Risky option.
9. Judge intro (two cards), then a timed document error-catch with `tone: "conflict"`.
10. Peer rival (one card), then a conflict choice where composure is Best.
11. Crisis: 30-second `tone: "alarm"` choice with a Risky option.
12. Close: final scored beat at progress 1.0, neutral praise chapter card, review, endings.

Ten scored beats per level, always. The last beat is always `review`.

## Validation list (run before a dataset goes into the build)

- [ ] Every beat id unique across all careers; prefix unique to this career and level.
- [ ] Exactly 10 scored beats per Full level, progress 0.1 to 1.0.
- [ ] Every scored beat has `planLineIfFailed`, exactly 2 skills that exist in `SKILL_MEANING`, `feedbackCta`.
- [ ] Every choice beat has exactly one `best`; every option has a `why`.
- [ ] Blank/tiles questions contain exactly one `___`.
- [ ] Check tap/drag has exactly one correct option; type has `answer`, `whyRight`, `hint`.
- [ ] Flips has at least one card; rapid and bucket at least one item (empty lists crash or soft-lock).
- [ ] Offer cards have exactly 3 facts. Focus has exactly 2 terms. Slider has 4 steps.
- [ ] Pick: exactly `pick` cards have role "pick".
- [ ] No duplicate labels inside any list (they are used as keys).
- [ ] Last beat is `review`; endings include `min: 0` and an 85 `advances: true`.
- [ ] Every speaker and cast name matches the Characters sheet exactly.
- [ ] Every non-review beat has a location; every on-screen character has a default sprite.
- [ ] Performance Plan authored for levels 1-3; trailer has 7 cards with card 7 `finale`.
- [ ] World string is an exact `WORLD_COLORS` key.
- [ ] Copy passes the writing rules above (no em dashes, no "fired", no real brands, no unsourced numbers).
