#!/usr/bin/env node
// Beat -> room routing for a career simulation, automatically (29 Sept 2026:
// "I want it to be automated so we don't have to manually do anything. We
// have 900+ careers"). Every beat in a level gets one of the career's rooms,
// by the same rules a person used for Investment Banking and Nursing
// (docs/handoff/play-sop/07-art-direction-and-prompts.md section 2):
//
//   internal prep or review      -> private-meeting
//   a formal client moment       -> formal-meeting
//   a public working moment      -> work-floor (work-floor-night after dark)
//   coffee, lunch, coaching      -> break
//   a private transition         -> transition
//   the first arrival            -> arrival
//   the career's own room        -> specialist (patient room, garage bay...)
//   a continuous run stays in one room; the final review beat gets none.
//
// Two engines:
//   --engine claude  (default when ANTHROPIC_API_KEY is set) asks Claude to
//                    route the whole level at once, with the rules above and
//                    the career's room list, and returns JSON.
//   --engine rules   offline keyword rules plus continuity. Good enough to
//                    ship a first pass; Claude is better on subtle scenes.
//
// Usage:
//   node scripts/play-beats/map-beats.mjs --level level.json --manifest src/components/play/art/<career>.json [--engine claude|rules] [--write] [--compare]
//
//   --level     a level as JSON: { "id": "L1", "beats": [ ...beats as in src/components/play/types.ts ] }
//   --write     merge the result into the manifest's beatLocations (keeps any
//               beat already routed unless --overwrite)
//   --compare   print agreement with the manifest's existing routing (used to
//               prove the rules against the two hand-routed careers)

import fs from "node:fs";
import path from "node:path";

const args = Object.fromEntries(
  process.argv.slice(2).reduce((pairs, arg, i, all) => {
    if (arg.startsWith("--")) pairs.push([arg.slice(2), all[i + 1] && !all[i + 1].startsWith("--") ? all[i + 1] : true]);
    return pairs;
  }, []),
);
if (!args.level || !args.manifest) {
  console.error("Usage: map-beats.mjs --level level.json --manifest <career>.json [--engine claude|rules] [--write] [--overwrite] [--compare]");
  process.exit(1);
}
const level = JSON.parse(fs.readFileSync(args.level, "utf8"));
const manifestPath = path.resolve(args.manifest);
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const engine = args.engine ?? (process.env.ANTHROPIC_API_KEY ? "claude" : "rules");

// Rooms by role. A career without a role on a room falls back to guessing the
// role from its id, so older manifests still route.
const ROLE_GUESS = [
  ["work-floor-night", /night/],
  ["formal-meeting", /client|formal|board.*client/],
  ["private-meeting", /boardroom|meeting|conference|office-private/],
  ["break", /cafe|lounge|staff-room|break|kitchen/],
  ["transition", /hall|elevator|corridor|stair/],
  ["arrival", /exterior|lobby|reception|entrance/],
  ["work-floor", /floor|station|studio|shop|bay|site|lab|ward/],
];
const rooms = Object.entries(manifest.locations).map(([id, room]) => ({
  id,
  role: room.role ?? ROLE_GUESS.find(([, re]) => re.test(id))?.[0] ?? "specialist",
  alt: room.alt,
}));
const byRole = (role) => rooms.find((room) => room.role === role)?.id;
const WORK = byRole("work-floor") ?? rooms[0]?.id;

/** Every human-readable string on a beat, lowercased: the line, title,
 *  setup, question, options, examples. What Claude reads. */
function beatText(beat) {
  const out = [];
  const walk = (value, key) => {
    if (typeof value === "string") {
      if (!/^(id|kind|variant|method|art|artAlt|cta|prompt|pose|mood|tone|speaker|castMember)$/.test(key ?? "")) out.push(value);
    } else if (Array.isArray(value)) value.forEach((item) => walk(item, key));
    else if (value && typeof value === "object") Object.entries(value).forEach(([k, v]) => walk(v, k));
  };
  walk(beat);
  return out.join(" ").toLowerCase();
}

/** Only what the story itself says is happening (setup, title, body, line):
 *  answer options talk about clients and meetings hypothetically, which sent
 *  the rules engine into the boardroom for whole levels. */
function storyText(beat) {
  return ["setup", "title", "body", "line", "text", "intro", "example", "lead"]
    .map((key) => (typeof beat[key] === "string" ? beat[key] : ""))
    .join(" ")
    .toLowerCase();
}

// ---- rules engine ----
// Explicit cues only: the house style keeps everything on the work floor
// unless the story places people somewhere else.
const SIGNALS = [
  // order matters: the first matching signal wins for a beat
  ["formal-meeting", /\bpitch (day|meeting|room)\b|\bthe client (is|are|walks|arrives|sits)\b|\bin the boardroom\b|\bthe board (meets|is waiting)\b|\bfamily meeting\b/],
  ["private-meeting", /\bmeeting room\b|\bconference room\b|\bteam meeting\b|\bdebrief\b|\bhuddle\b/],
  ["break", /\bcoffee\b|\bcafe\b|\blunch\b|\bbreak room\b|\bstaff room\b|\blounge\b|\bbefore lunch\b/],
  ["transition", /\belevator\b|\bhallway\b|\bcorridor\b|\bwalk(s|ing)? (to|down|out)\b|\bon (your|the) way\b|\bleav(e|ing) the\b|\boffer letter\b|\bpromot(ed|ion)\b/],
  ["arrival", /\breception\b|\blobby\b|\bfront desk\b/],
];
// Night only from a time that OPENS a scene ("7:00 PM. The floor empties.")
// or an explicit phrase: a teaching example that says "at 2 AM" is not the
// story turning to night.
const leadTime = (beat) => (typeof beat.setup === "string" ? beat.setup : typeof beat.title === "string" ? beat.title : "").trim().toLowerCase().match(/^(\d{1,2})(?::\d\d)?\s?(a\.?m|p\.?m)\b/);
function nightCue(beat, text) {
  const t = leadTime(beat);
  if (t) {
    const hour = Number(t[1]) % 12 + (t[2].startsWith("p") ? 12 : 0);
    return hour >= 18 || hour < 5 ? "on" : "off";
  }
  if (/\blate night\b|\bnight shift\b|\bovernight\b|\bcrunch time\b|\blast night\b|\bmidnight\b/.test(text)) return "on";
  if (/\bnext morning\b|\bnext day\b|\bsunrise\b|\bthe morning\b/.test(text)) return "off";
  return undefined;
}

// A specialist room (the bedside, the garage bay) needs two distinctive cues
// from its own description, ignoring words the whole level uses (every
// nursing beat says "patient"), and it holds only for that moment.
let commonWords = new Set();
function learnCommonWords(beats) {
  const counts = new Map();
  for (const beat of beats) for (const word of new Set(storyText(beat).match(/[a-z]{5,}/g) ?? [])) counts.set(word, (counts.get(word) ?? 0) + 1);
  commonWords = new Set([...counts].filter(([, n]) => n / beats.length > 0.12).map(([word]) => word));
}
function specialistMatch(text) {
  const special = rooms.filter((room) => room.role === "specialist");
  for (const room of special) {
    const words = [...new Set(`${room.id.replace(/-/g, " ")} ${room.alt ?? ""}`.toLowerCase().match(/[a-z]{5,}/g) ?? [])];
    const hits = words.filter((w) => !commonWords.has(w) && !/(light|across|beside|through|stretching|window|morning|center|medical|riverbend|cobalt|capital|monitors|city)/.test(w) && text.includes(w));
    if (hits.length >= 2 || /\bbedside\b|\bat (her|his|their) bed\b/.test(text)) return room.id;
  }
  return undefined;
}

function routeWithRules(beats) {
  learnCommonWords(beats);
  const out = {};
  const exterior = rooms.find((room) => room.role === "arrival" && /exterior|outside|street/.test(room.id))?.id;
  const inside = rooms.find((room) => room.role === "arrival" && room.id !== exterior)?.id;
  let current = WORK;
  let night = false;
  let transitionRun = 0;
  beats.forEach((beat, index) => {
    const last = index === beats.length - 1;
    if (beat.kind === "review" && last) return; // the final review waits on the ambient backdrop
    if (index === 0 && exterior) { out[beat.id] = exterior; return; } // the establishing shot
    const text = storyText(beat);
    const cue = nightCue(beat, text);
    if (cue === "on") night = true;
    else if (cue === "off") night = false;
    const signal = SIGNALS.find(([role, re]) => re.test(text) && byRole(role))?.[0];
    const special = specialistMatch(text);
    if (signal === "arrival") current = inside ?? WORK;
    else if (signal) current = byRole(signal);
    else if (special) { out[beat.id] = special; return; } // the moment only; the run continues where it was
    else if (current === byRole("transition") && ++transitionRun > 2) current = WORK; // a transition is a moment, not a place to stay
    else if (current === inside && index > 12) current = WORK;
    if (current !== byRole("transition")) transitionRun = 0;
    if (night && (current === WORK || current === byRole("work-floor"))) current = byRole("work-floor-night") ?? current;
    if (!night && current === byRole("work-floor-night")) current = WORK;
    out[beat.id] = current;
  });
  return out;
}

// ---- Claude engine ----
function claudePrompt(beats) {
  const compact = beats.map((beat) => ({ id: beat.id, kind: beat.kind, speaker: beat.speaker, castMember: beat.castMember, text: beatText(beat).slice(0, 600) }));
  const prompt = `You are routing a career simulation's beats to rooms. Each beat is one screen of a visual-novel style game. Return JSON only: {"<beat id>": "<room id>", ...} covering every beat id except the level's final "review" beat, which gets no room.

Rooms (id, role, description):
${rooms.map((room) => `- ${room.id} (${room.role}): ${room.alt ?? ""}`).join("\n")}

House style (how every career so far was routed by hand; follow it closely):
1. The work floor is home. Anything without a clear reason to be elsewhere happens on the work-floor room: onboarding and briefing cards, character introductions (people are met where they work), questions, checks and quizzes, everyday tasks, news about the job.
2. The very first beat of the whole simulation is the establishing shot: the arrival room that is outside (exterior, street), for ONE beat only. If the story then says you arrive at reception or the lobby, use the indoor arrival room for that greeting run. After the opening, arrival rooms are only for a scene that explicitly returns to reception or the lobby.
3. Meeting rooms only when a meeting is actually happening in the story: the private-meeting room when the team is shown gathered in a room to review or prep; the formal-meeting room when the client, the board, a family or senior decision-makers are in the room. A topic being "prep" or "review" is not enough; the line must place people in the room.
4. One-on-one teaching or coaching from the mentor (terms, etiquette, how the job works, a pep talk) happens in the break room, over coffee.
5. The transition room is for short private moments of one to three beats: walking somewhere, the elevator, private news (an offer, a promotion, a warning), the quiet beat just after a big meeting, the end of a day.
6. Night: from six in the evening (an explicit time, "late", "last night", "overnight", "crunch") everything that would be on the work floor uses the work-floor-night room, until the story says it is morning or the next day.
7. The career's specialist room (a patient's bedside, a garage bay, a studio) only when the moment clearly happens at that place.
8. Continuity: a run stays in one room until the story gives a reason to move. Questions and checks happen wherever the story currently is.
9. Use only the room ids listed. Every beat gets a room except the level's final "review" beat.

Beats in order:
${JSON.stringify(compact)}`;
  return prompt;
}

async function routeWithClaude(beats) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY is not set; use --engine rules");
  const prompt = claudePrompt(beats);
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: process.env.PLAY_BEATS_MODEL ?? "claude-sonnet-5", max_tokens: 8000, messages: [{ role: "user", content: prompt }] }),
  });
  if (!response.ok) throw new Error(`Claude API ${response.status}: ${await response.text()}`);
  const data = await response.json();
  const text = data.content?.map((part) => part.text ?? "").join("") ?? "";
  const json = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
  const valid = new Set(rooms.map((room) => room.id));
  for (const [beatId, roomId] of Object.entries(json)) if (!valid.has(roomId)) delete json[beatId];
  return json;
}

const beats = level.beats ?? level;
if (args["print-prompt"]) {
  console.log(claudePrompt(beats));
  process.exit(0);
}
// --routed <file>: score or write a routing produced elsewhere (a batch job,
// another model) instead of running an engine here.
const routed = args.routed ? JSON.parse(fs.readFileSync(args.routed, "utf8")) : engine === "claude" ? await routeWithClaude(beats) : routeWithRules(beats);

if (args.compare) {
  let same = 0, total = 0;
  const misses = [];
  for (const beat of beats) {
    const had = manifest.beatLocations[beat.id];
    if (!had) continue;
    total++;
    if (routed[beat.id] === had) same++;
    else misses.push(`${beat.id}: had ${had}, got ${routed[beat.id] ?? "(none)"}`);
  }
  console.log(`${args.routed ? `routing from ${path.basename(args.routed)}` : `engine ${engine}`}: ${same}/${total} beats match the hand routing (${total ? Math.round((same / total) * 100) : 0}%)`);
  if (args.verbose) misses.forEach((line) => console.log("  " + line));
}

if (args.write) {
  const next = args.overwrite ? { ...manifest.beatLocations, ...routed } : { ...routed, ...manifest.beatLocations };
  manifest.beatLocations = next;
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`wrote ${Object.keys(routed).length} routes into ${path.relative(process.cwd(), manifestPath)}`);
} else if (!args.compare) {
  console.log(JSON.stringify(routed, null, 2));
}
