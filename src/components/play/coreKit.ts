// THE CORE KIT (9 Oct 2026). A career simulation built only from the pieces
// that scale by data: no hand-drawn instruments (the ECG monitor, the desk
// clock, the toolbox foam, the elevator, the departure board), no per-photo
// hotspots, no hand-placed camera frames, no one-career mechanics (the
// torque wrench). Chandu: "make a version where there isnt the custom arts
// like ecg, toolbox, clocks etc ... because we wont be able to realistically
// scale that." 900 careers cannot each get a bespoke instrument; every one
// of them can get a well-written level in these pieces.
//
// `toCoreLevel` is a pure transform, so the same function serves two jobs:
//   1. The runtime preview: /play/<game>?kit=core plays any level through it.
//   2. The generator: content written for a new career is passed through it
//      (or checked against BESPOKE_FIELDS) so nothing bespoke ships by
//      accident. The full rules are in docs/handoff/play-sop/11-core-kit-and-interactions.md.
//
// Every bespoke piece maps to a core piece that teaches the SAME thing with
// the SAME words. Copy is never dropped, only re-dressed.

import { AMT_TOOLS } from "./amtTools";
import type { Beat, CardBeat, ChoiceBeat, Level, WorldUi } from "./types";

/** Every field or beat kind the core kit removes or replaces, with what it
 *  becomes. The doc's whitelist is generated from the same idea; keep the
 *  two in step. */
export const BESPOKE_FIELDS = {
  "kind:inspect": "reveal when practice (each spot taps open), else flags (issues are the flagged rows)",
  "kind:torque": "slider (Under the mark / At the mark / Over the mark)",
  world: "removed; a clock or monitor's numbers fold into the card's facts",
  "world:foam": "reveal (the missing tools, then the rest)",
  board: "removed (the title shows as a normal title)",
  briefing: "a paper task card titled Briefing, same lines",
  "opsChat.radio / chatWith.radio": "radio: false (a normal chat header)",
  docStyle: "removed (plain document layout)",
  marks: "removed (no red-pen circles)",
  "layout:zones / layout:move": "options with dragEnabled (the shared drag token)",
  artFrame: "removed (no camera push-in)",
  exampleSteps: "example paragraph (the steps joined)",
  "review.style:logbook": "removed (plain ticked checklist)",
  "cinematic: CareerSeal, EndingBackdrop": "guarded by Presentation.coreKit (icon tile, no backdrop)",
} as const;

/** The card facts a world instrument's numbers fold into, so a deadline or
 *  a patient's state is still on screen as a plain tile. */
function worldFacts(world: WorldUi): { label: string; value: string }[] {
  switch (world.kind) {
    case "clock":
      return [
        ...(world.deadline ? [{ label: world.deadlineLabel ?? "Due", value: world.deadline }] : []),
        ...(world.cells ?? []),
      ];
    case "monitor":
      return [
        { label: "Patient", value: world.state === "alarm" ? "Getting worse" : "Stable" },
        ...(world.room ? [{ label: "Room", value: world.room }] : []),
        ...(world.time ? [{ label: "Time", value: world.time }] : []),
      ];
    default:
      return [];
  }
}

function coreCard(beat: CardBeat): Beat {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { world, board, exampleSteps, opsChat, ...rest } = beat;
  if (world?.kind === "foam") {
    // The shadow-foam ritual as Tap to Reveal: the missing tool first (the
    // point of the screen), then the rest as one row, so the lesson "every
    // tool is accounted for before a panel closes" survives at two taps.
    const tools = world.tools ?? AMT_TOOLS;
    const missing = world.missing ?? [];
    const others = tools.length - missing.length;
    return {
      ...rest,
      kind: "reveal",
      title: beat.title,
      body: beat.body,
      rows: [
        ...missing.map((tool) => ({ label: tool, reveal: "Missing. Find it before the panel closes.", color: "red" as const })),
        ...(others > 0 ? [{ label: `The other ${others} tools`, reveal: "All in their slots.", color: "green" as const }] : []),
      ],
      cta: beat.cta ?? "Continue",
    };
  }
  const folded = world ? worldFacts(world) : [];
  return {
    ...rest,
    ...(opsChat ? { opsChat: { ...opsChat, radio: false } } : {}),
    ...(folded.length > 0 && !beat.facts?.length ? { facts: folded } : {}),
    ...(exampleSteps && !beat.example ? { example: exampleSteps.map((step) => step.text).join(" ") } : {}),
  };
}

function coreChoice(beat: ChoiceBeat): ChoiceBeat {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { world, docStyle, marks, briefing, ...rest } = beat;
  const bespokeLayout = beat.layout === "zones" || beat.layout === "move";
  return {
    ...rest,
    layout: bespokeLayout ? "options" : beat.layout,
    ...(bespokeLayout ? { dragEnabled: true } : {}),
    ...(beat.chatWith ? { chatWith: { ...beat.chatWith, radio: false } } : {}),
    ...(briefing
      ? {
          taskCardTitle: "Briefing",
          taskCard: [
            { label: "Now", value: briefing.heading },
            ...briefing.lines.map((line) => ({ label: "", value: line })),
            // The twist is written as its own sentence ("But the fluid is new."),
            // so its label must not repeat its first word.
            ...(briefing.twist ? [{ label: "Note", value: briefing.twist }] : []),
          ],
        }
      : {}),
  };
}

/** One beat, re-dressed in core pieces. Fields that are already core pass
 *  through untouched, including ids, so saves and ?screen= links still work. */
export function toCoreBeat(beat: Beat): Beat {
  // artFrame lives on every beat (BeatBase); the camera is never core.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { artFrame, ...base } = beat as Beat & { artFrame?: unknown };
  const plain = base as Beat;
  switch (plain.kind) {
    case "card":
      return coreCard(plain);
    case "choice":
      return coreChoice(plain);
    case "inspect": {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { image, imageAlt, hotspots, rapid, ...rest } = plain;
      // A practice inspection (AMT 7 and 31) is a look-closer lesson, not a
      // test: each spot is tapped open and the issues are what you find.
      // That is Tap to Reveal. As flags rows the notes ("Noticeable wear" vs
      // "Looks normal") would hand over the answer.
      if (plain.practice) {
        return {
          ...rest,
          kind: "reveal",
          title: plain.question,
          rows: hotspots.map((spot) => ({ label: spot.label, reveal: spot.note, color: spot.issue ? ("red" as const) : ("green" as const) })),
          cta: plain.feedbackCta || "Continue",
        };
      }
      return {
        ...rest,
        kind: "flags",
        rows: hotspots.map((spot) => ({ label: `${spot.label}: ${spot.note}`, flag: Boolean(spot.issue), why: spot.note })),
      };
    }
    case "torque": {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { target, band, whenRight, whenWrong, ...rest } = plain;
      return {
        ...rest,
        kind: "slider",
        steps: [
          { label: "Under the mark", tier: "wrong", why: whenWrong },
          { label: "At the mark", tier: "best", why: whenRight },
          { label: "Over the mark", tier: "wrong", why: whenWrong },
        ],
      };
    }
    case "review": {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { style, ...rest } = plain;
      return rest;
    }
    case "check":
    case "rapid":
    case "rank":
    case "pick": {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { world, ...rest } = plain as typeof plain & { world?: WorldUi };
      return { ...rest, ...("chatWith" in rest && rest.chatWith ? { chatWith: { ...rest.chatWith, radio: false } } : {}) } as Beat;
    }
    default:
      return plain;
  }
}

/** A whole level in core pieces. `coreKit: true` also tells the player to
 *  skip the cinematic-only bespoke celebrations (the firm's foil seal, the
 *  ECG / takeoff / market line behind the ending). */
export function toCoreLevel(level: Level): Level {
  return { ...level, id: `${level.id}-core`, coreKit: true, beats: level.beats.map(toCoreBeat) };
}

/** What a generator should run before shipping a level: every bespoke field
 *  still present, by beat id. Empty means the level is pure core kit. */
export function bespokeIn(level: Level): { beat: string; field: string }[] {
  const found: { beat: string; field: string }[] = [];
  for (const beat of level.beats) {
    const any = beat as Record<string, unknown>;
    if (beat.kind === "inspect" || beat.kind === "torque") found.push({ beat: beat.id, field: `kind:${beat.kind}` });
    for (const field of ["world", "board", "briefing", "docStyle", "marks", "artFrame", "exampleSteps"]) {
      if (any[field] !== undefined) found.push({ beat: beat.id, field });
    }
    if (beat.kind === "choice" && (beat.layout === "zones" || beat.layout === "move")) found.push({ beat: beat.id, field: `layout:${beat.layout}` });
    if (beat.kind === "review" && beat.style === "logbook") found.push({ beat: beat.id, field: "review.style:logbook" });
    const radio = (any.opsChat as { radio?: boolean } | undefined)?.radio || (any.chatWith as { radio?: boolean } | undefined)?.radio;
    if (radio) found.push({ beat: beat.id, field: "radio" });
  }
  return found;
}
