# Investment Banking v2: which painted scene goes on which screen

For Chandu and Joshua, 12 Oct 2026.

**Why v2 exists.** A student said the simulation graphics "look AI". Joshua thinks the cause is the separate character sprites standing over empty rooms, so he painted ten full scenes with the characters in the room (`public/images/play/ib/v2/`, 1672x941). v2 plays the same game with **no sprites anywhere**. A screen with a natural match shows Joshua's scene. Every other screen keeps its v1 room, with nobody standing in it. Nothing else changes: same copy, same order, same scoring, same transitions.

**How to compare.**
- **Start screen:** the `v1 | v2` switch at the top right of the START INTERNSHIP screen sets the version for the run. It writes `?v=2` to the URL, so a reload keeps it. `/play/investment-banking?v=2` opens straight into v2.
- **In the game:** the small `v1 | v2` pill at the right end of the progress bar, under the score, flips the screen you are on. It keeps the same screen, score and answers; only the picture changes.
- Moving on to Level 2 keeps v2.
- Both switches are demo-only (`DEMO-ONLY: v1/v2 comparison` in code). The mapping lives in `src/components/play/ib-v2-scenes.ts`.

**Decisions that apply to every screen**
- **No giant name title in v2.** In v1 a character's introduction sets their name huge behind the sprite ("CHRISTINA", "MARCUS", "JORDAN"). That only works because the sprite is a separate layer in front of the letters. In a painted scene the letters would sit on top of the person. v2 drops the title. The name plate on the dialogue box carries the introduction: `CHRISTINA | ASSOCIATE`, `MARCUS | VICE PRESIDENT`, `JORDAN | INTERN`. That plate already shows on every spoken line in both versions.
- **Marcus's arrival keeps its spotlight.** The warm light and dark edges on his introduction are lighting, not a sprite, so v2 keeps them.
- **Who reacts to your answer.** In v1, after an answer, the room clears and the speaker's sprite shows a proud or concerned face, and the verdict card repeats that face in a small square. Both are cut from the sprite, so v2 has neither. Where Christina asked a scored question and you give the Best answer, v2 cuts to her thumbs-up scene instead (L1-11, L1-18, L1-20). Any other answer keeps the screen's own scene. There is no concerned Christina scene yet (see the list at the end).
- **Framing.** On desktop (1366x768, 1440x900, 2560x1440) a 16:9 scene barely crops, and every face sits between the HUD and the dialogue box. A 390px phone shows about a quarter of the width, so each scene has its own phone crop chosen to keep the face in. A phone cannot hold both faces in the two-person scenes, so it keeps one: Christina at reception (L1-10, L1-11; Jordan is out of frame) and Marcus in the boardroom (L1-24, L1-CHECK; Christina's presenting hand stays in). v1's sprites overlap, so its phone view shows both.
- **Unchanged in both versions:** the start screen art (`l1-04`, already a painted scene), the chat avatars in Christina's message thread (an app UI, not a sprite), and every screen with no match below.

## Level 1: screens that use a new scene

| Screen | What happens | v2 scene | Why |
|---|---|---|---|
| L1-07 | "Time to meet your team." Christina's introduction | christina-presents-office-day | Her intro, in the bright day-one office with the Cobalt logo; the open hand reads as "meet the team". |
| L1-08 | Christina decides your work; her feedback reaches the people deciding your offer | christina-thumbsup-office-day | Same office, same moment. The thumbs up is the "her feedback" the line is about. |
| L1-10 | "Christina meets you at reception. Jordan ... is starting today too." | christina-jordan-reception-day | An exact match: Christina gesturing to Jordan at reception, daytime. |
| L1-11 | Day 1: what should you do first? | christina-jordan-reception-day; Best answer: christina-thumbsup-office-day | Still day one at reception. A Best answer earns her thumbs up, the way v1's sprite turns proud. |
| L1-14 | "Before client work, you need to learn the language of IB." Four word cards | christina-presents-meeting-sunset | She points at the client meeting behind the glass while saying "before client work". v1 put this in the cafe; the script itself never names the cafe. |
| L1-16 | Match the phrases (practice) | christina-presents-meeting-sunset | Same moment, same scene. |
| L1-18 | "You're about to work with big brands and executives." Rapid-fire questions | christina-presents-meeting-sunset; Best: christina-thumbsup-glassdoor-sunset | The executives are the meeting she is pointing at. A pass earns the thumbs up by the meeting-room door. |
| L1-19 | "Client information stays private and with Cobalt Capital." | christina-presents-meeting-sunset | Christina by the closed meeting room, the private client work the line is about. |
| L1-20 | Where should client files be stored? | christina-presents-meeting-sunset; Best: christina-thumbsup-glassdoor-sunset | Same scene; a Best answer earns the thumbs up. |
| L1-21 | "Meet Marcus, the Vice President." | man-boardroom-sunset | He matches Marcus's face portrait (short curly fade, brown eyes, navy suit, dotted navy tie, white pocket square), alone in his boardroom at sunset, where v1 introduces him. |
| L1-21b | Marcus started as an intern 12 years ago | man-boardroom-sunset | Marcus still on screen. |
| L1-22 | Marcus is above Christina and helps decide offers | man-boardroom-sunset | Marcus still on screen, with the ladder. |
| L1-24 | Christina and Marcus: "prove you can catch the small details" | christina-man-boardroom-sunset | An exact match: both of them, the boardroom, sunset, Christina presenting Marcus. |
| L1-CHECK | "Marcus and Christina are reviewing your progress so far." | christina-man-boardroom-sunset | The two people doing the review. It sits blurred behind the checkpoint card, as v1's room does. |
| L1-26 | "Jordan wants one of those two return offers just as badly as you do." | jordan-trading-floor-sunset | Jordan, confident, on the trading floor at sunset, where v1 introduces him. |
| L1-27 | "You hear Jordan tell a manager he built it." | pov-coffee-jordan-pitch-sunset | You, coffee in hand, watching Jordan pitch your spreadsheet. Joshua's 16:9 version of v1's l1-12. |
| L1-28 | Jordan took credit. What's your move? | pov-coffee-jordan-pitch-sunset | v1 keeps the picture behind this question; v2 does the same, drained to grey as before. |
| L1-29 | 3:00 P.M. An intern on your project quits | pov-desk-colleague-leaves-day | Your hand on the laptop at a messy desk while he walks out with a box. Joshua's 16:9 version of v1's l1-13. The phone crop centres on the intern leaving, as the doc asks of v1. |
| L1-30 | Message Christina about the extra work | pov-desk-colleague-leaves-day | Still at your desk; v1 also keeps l1-13 here. |
| L1-35 | "Your internship is complete." Christina's praise | christina-thumbsup-office-day | Her approval, back in the day-one office (v1 ends at reception too). |

## Level 1: screens left on their v1 room (no sprite)

| Screen | Why no new scene |
|---|---|
| L1-01 | Building exterior; nobody in it in v1 either. |
| L1-02 | Reception with nobody in it ("Nine weeks. Seven interns"); no one has been introduced yet. |
| L1-ACT2 | The elevator ride to the floor; nobody in it. |
| L1-31, L1-32, L1-32b, L1-33 | Night on the trading floor (6 to 7 P.M., another intern's 200 misprinted pages). Every new scene is day or sunset. |
| L1-34 | "Christina saw how you handled it." Night; she is quiet. A thumbs up would say more than the line does. |
| L1-36 | The final review, blurred behind the score. |

## Levels 2 and 3

v2 removes the sprites on both levels. Two Level 2 screens match a scene:

| Screen | v2 scene | Why |
|---|---|---|
| L2-17 | jordan-trading-floor-sunset | "Tap every red flag in Jordan's work": Jordan, trading floor, sunset, the v1 room. |
| L2-21 | man-boardroom-sunset | Marcus's rapid-fire round in the internal boardroom at sunset, the v1 room. |

Everything else in Levels 2 and 3 keeps its v1 picture: most of their screens already use painted scenes (`l2-*`, `l3-*`). The screens that had a sprite (Cobalt HR on the job steps, Christina at night, Lamisa, Christina as a Vice President) show their room with nobody in it. On these two levels, which are not cinematic, the dialogue box shows the speaker's small face and name when no sprite stands in the room, as it always has. Express mode (`?mode=express`) also loses its sprites, with no new scenes mapped.

## Shopping list for Joshua (scenes these screens would want)

1. **Christina, concerned**, day office and sunset: the verdict after a wrong answer on L1-11, L1-18, L1-20 (v1 shows her concerned face there).
2. **Christina at night on the trading floor**, quietly watching: L1-34 ("She didn't say anything, but she noticed"), and Level 2's night prep (L2-13 to L2-15).
3. **POV at your desk at night**, the floor dark, a clock past 6 P.M.: L1-31 ("You made the deadline").
4. **Another intern buried in misprinted pages at night**, seen from your desk: L1-32 and L1-32b, and the ranking question L1-33.
5. **Reception, empty, day one**, with other interns arriving: L1-02 ("Seven interns, including you").
6. **Christina with the word cards / a notebook in the cafe at sunset**, if the team wants to keep the cafe for L1-14 and L1-16.
7. **Marcus, assessing (arms crossed or reading a page)**: the verdict on L1-24 and the Level 2 boardroom screens.
8. **Cobalt HR** (Level 2 and 3 job steps) and **Lamisa** (Level 3), who currently appear only as sprites.
9. **Christina as a Vice President** (Level 3): an older, more senior look.
10. **Tighter two-person compositions** of the reception (Christina and Jordan) and boardroom (Christina and Marcus) scenes, the two standing closer, so a phone can show both faces.
