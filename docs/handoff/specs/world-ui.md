# World UI: the career's own instruments beside a beat

Status: built and in use in three games (Investment Banker, Registered Nurse, Aviation Maintenance Technician), 6 Oct 2026. This spec is the contract a new career (or a generator writing one) builds against. Code: `src/components/play/WorldUi.tsx`, types in `src/components/play/types.ts` (`WorldUi`).

## Why

Chandu (6 Oct 2026): "we can get creative like this with the UI with the IB game and the Nursing game too. Show vitals, ecg, etc etc wherever they could work", then "make sure things react properly too, based on selections", then "are these all scalable? ... there will be eventually 900 careers."

A beat's world UI is the thing itself, drawn where the student's eye already is: a bedside monitor whose alarm the right answer settles, a wall clock whose deadline counts down, a call-light board that clears in the order you ranked, an ID badge touched to a reader. It is presentation only. Every word of the script stays where it was; the instrument sits beside it.

## The three rules that make it scale

1. **Kinds, not careers.** Every instrument is a generic kind (`monitor`, `clock`, `lights`, `record`, `sheet`, `inbox`, `wristband`, `elevator`, `badge`) with its content in the beat's data. There is no "MAR sheet" or "night report" in code; there is a `record` with rows and a `sheet` with lines. A new career picks a kind and fills its fields.
2. **No names in code.** Instruments never say a firm, a ward or a person. They read `WorldContext` (`{ firm, place, world }`), which `SimulationPlayer` provides once from `simulation.firm` (falling back to the title), `level.place` and `simulation.world`. A beat may override a label (`badge.org`, `inbox.org`, `elevator.label`, `monitor.place`) but never has to.
3. **Skin by world, not by career.** `worldSkin(world)` maps the app's worlds (`WORLD_COLORS` in `components/app/worlds.ts`) to a paper stock, a device palette and a glow colour. Two primitives carry the skin, `Paper` (documents) and `Device` (equipment), and every instrument is built from them with one header line, one rule, one row grid and one chip. Add a world to `worldSkin` and every instrument follows.

## The outcome contract

Instruments that can react take `outcome: Tier | null` (the tier of the answer just locked: `best`, `acceptable`, `risky`, `wrong`) and decide their own reaction:

| Kind | best / acceptable | risky / wrong |
| --- | --- | --- |
| `monitor` (alarm) | "Help at bedside" chip, numbers settle toward safe | "Deteriorating" chip, numbers worsen |
| `record` | flagged row becomes `labels.fixed` ("Done late · real time") | flagged row becomes `labels.worse` ("Still overdue") |
| `wristband` (rapid, per item) | green scan sweep and tick | red cross |
| `lights` (rank, on submit) | lights clear one by one in the student's order | same (the order is the answer) |

On directed levels the verdict sheet covers the body the moment an answer is tapped, so reactions are drawn by the verdict (`FeedbackSheet` renders `WorldPanel` with `outcome={result.tier}`), not by the body.

## The kinds

Set `world` on a card, check, choice, rank, rapid or pick beat.

| Kind | Where it goes | Fields | What it draws |
| --- | --- | --- | --- |
| `monitor` | card, choice, check | `state: "stable" \| "alarm"`, `time?`, `room?`, `place?` | Bedside monitor: ECG strip scrolling at the shown heart rate, HR / SpO2 / RR / BP tiles, alarm chip. Header is `firm's first word · place · room`. |
| `clock` | card, choice, rank | `now`, `deadline?`, `deadlineLabel?`, `status?: "due" \| "delivered"`, `zone?` (default "Local time"), `showNow?` (default true), `cells?` | Wall clock ticking from `now` in the world's glow; countdown to `deadline` (red under an hour); DELIVERED in green; extra cells. `showNow: false` drops the running clock and shows only the countdown (or only Delivered): use it when the headline already says the hour (IB doc: "Only show a countdown when time pressure is important"). A chat beat's timestamp reads `Today {now}`. Beats sharing an hour share one running clock (`CLOCK_EPOCH`). A card whose whole title is a time ("7:00 P.M.") hands the title to the clock; its facts become cells. |
| `lights` | rank | `place?` | Board of lights, one per location named in the rows ("Room 12", "Gate 4", "Bay 2"), numbered in the student's order, cleared on submit. |
| `record` | choice, check | `title?`, `rows: { time, label, status: "done" \| "flag" \| "due" }[]`, `labels?` | Record sheet on the world's paper; one flagged row written by the answer. |
| `sheet` | pick | `title?`, `meta?`, `lines?: string[]` | Report sheet whose numbered lines fill as cards are picked; `lines` labels each line in the doc's framing. Submit reads "Hand over". |
| `inbox` | rapid | `org?` | Each question as an email: `Inbox · firm`, sender from `beat.speaker` and `beat.speakerRole`, the question as the subject. |
| `wristband` | rapid | `org?` | ID band (NAME, DOB, barcode) on the first item, scanned on the right answer. |
| `elevator` | act card | `floor`, `label?` | Indicator climbing to `floor`, arrow pulsing, "Arrived". The act auto-advance holds 3.4 s for the ride. |
| `badge` | first card | `role`, `org?` | ID card on a lanyard (band in the world colour, photo, barcode) swings to a wall reader; LED goes green. No name on the card. |
| `foam` | card | `tools?` (defaults to the AMT drawer's twelve), `missing?`, `title?` | The toolbox's shadow foam (`ShadowBoard.tsx`): each tool drawn in its own cut-out with a finger notch, the missing ones as bright tool-shaped holes with a glow and a pulsing edge. Interactive: the student taps each tool to count it in (green stamp, click, the count climbs); tapping the empty slot says where the tool is and it comes back with a clank; at a full count the chip turns green and the card's button appears. Any trade with a toolbox reuses it with its own `tools` list; unknown names draw a plain slot. |

Related, outside `world`:

- `ChoiceBeat.docStyle: "chart" \| "slide"` draws a document choice as the career's paper (chart) or a deck slide; `marks: string[]` are the words the red pen circles on the verdict (`MarkedLine`).
- `ChoiceBeat.layout: "zones"`: a zone whose label reads data room / vault / archive draws an animated padlock that snaps shut when the file lands (no text tag; the icon is the signal). The verdict adds `ZoneBadge` (Locked / Shared / Personal).
- `ReviewBeat.style: "logbook"`: the final review's ticked lines as the trade's log page (`Log · firm`), stamped in turn, then a signature.
- `chatWith.radio` / `opsChat.radio`: the Operations window as a handset (`RadioHeader`).
- Timed beats draw the countdown as a slanted plate on the box's top-right (`DrainBar`), never a bar touching the name tag.

## Adding a career

1. Pick the kinds that fit the script. A deadline job gets `clock`; a bedside job gets `monitor`; any queue of places gets `lights`; any form with one late line gets `record`; any handover gets `sheet`; any first day gets `badge`.
2. Set `simulation.firm` and `level.place`. That is all the naming the instruments need.
3. If the career's world is not yet in `worldSkin`, add it there (paper, device, glow). Do not add per-career colours.
4. Write nothing new in `WorldUi.tsx` unless the script needs a kind that does not exist. If it does, build it from `Paper` or `Device`, take `outcome`, read `useWorld()`, and add a row to the table above.

## Copy and demo flags

Instrument labels are not script copy and do not go through the doc review, but they follow the app's rules: 8th-grade words, no em dashes, one fact once. `DEMO-ONLY:` the monitor's numbers are illustrative, not patient data; no script line depends on them.

## Open

- Dialogue-box skins per world and scene transitions between acts (hospital doors, hangar door): `worldSkin` is the hook; the pass has not been done.
- World sound beds: needs audio assets.
- AMT weather strip and toolbox-foam inventory: proposed, unbuilt.
