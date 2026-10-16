// Glossary Game generator: an industry's term list in, a playable glossary out.
//
// Why (16 Oct 2026, Chandu): "make sure the whole system is scaleable for any
// career. To be auto generated, including the games and levels." Level 1 of
// Investment Banking was hand-authored from the content template and every
// later level was hand-authored after it. That does not scale to 50
// industries. This module turns a GlossaryBlueprint into the same
// GlossaryLesson shape the engine already plays.
//
// Why the second rewrite (17 Oct 2026, Chandu): "the games are repeating the
// same questions again and again for mastery instead of having any variety,
// please refer the finance glossary games and redo questions according to
// its style so it is scaleable." The first generator built every screen from
// the same three strings per term (definition, example, cue), so a level felt
// like one question asked five ways: the definition was the Definition
// options, the Which Word prompt, the Type prompt and three feedback lines;
// the example was the Fill sentence and the Power Play. Finance never does
// that. Every Finance screen carries its own fresh line: a new story card, a
// concrete thing to sort into a concept bucket ("Store rent" into "Money
// out"), a short case answered a step at a time, and a review question in a
// form the main loop never used. So:
//
//   - Each term now carries three MOMENTS: short real situations that show
//     the word without saying it. Each moment is shown on at most one screen.
//     The definition is shown on the teach card and (if the student needs the
//     review) in Reverse Recall, nowhere else, except Level 1's one Definition
//     question. The example is the teach card and the Power Play fallback.
//   - A level may carry Finance-style authored pieces: a SORT of concrete
//     items into concept buckets, a SELECT ALL with concrete items, up to two
//     CASES (two to four steps over one scene), and a written POWER PLAY
//     paragraph. The generator uses them where the recipe has a slot and adds
//     cases as extra screens (the SOP allows 7 to 10 interactions).
//   - The builder asserts, at import time, that no line of copy appears twice
//     in a lesson, that every term can reach mastery in the main loop, and
//     that no three screens in a row share a mechanic.
//   - The Power Play's blanks never run in teaching order (17 Oct 2026,
//     Chandu: "dont make the power play so linear"), and the engine shuffles
//     the word bank so it never mirrors the blanks.
//
// Why four recipes (16 Oct 2026, the "Dreamari Glossary Game Master Scaling
// Plan" SOP, section 3): the lesson should get harder because students must
// think, not because screens hold more text. Level 1 recognizes, Level 2
// applies, Level 3 compares and classifies, Level 4 decides.
//
// What the SOP forbids, the validator refuses: timers (the engine has none),
// numbers unless the level says its words naturally use math, a moment or a
// definition that names its own word (answer leakage), copy over the slot
// limits. Finance (Investment Banking) is hand-authored and never passes
// through here (SOP Executive Rule 1).

import type { ChainQuestion, GlossaryCareer, GlossaryChapter, GlossaryLesson, GlossaryLevel, GlossaryQuestion, GlossaryTerm, GlossaryWorldMode, SceneCard } from "./data";
import { type IndustryMeta, worldSystem } from "./industries";

/** How the industry's levels hang together (SOP section 1).
 *  - continuous_story: one company, product or project progresses across the
 *    levels (Dream Sneakers). Every example names it.
 *  - scenario_thread: the same workplace, a new situation each level (a
 *    hospital shift, a different patient). Every example names the place.
 *  - practice_world: short varied situations, Dreamy and the world carry the
 *    game; no narrative to maintain. Examples need not name the anchor. */
export type WorldMode = GlossaryWorldMode;

/** The cognitive goal of a level (SOP section 3). Defaults by level number:
 *  1 recognize, 2 apply, 3 analyze, 4 and later decide. */
export type LevelFocus = "recognize" | "apply" | "analyze" | "decide";

export type TermSeed = {
  term: string;
  /** Eighth-grade level, one sentence. Must not say the word itself. Shown
   *  on the teach card and read aloud by the Reverse Recall review. */
  definition: string;
  /** Must contain the term (any case). In a continuous story or a scenario
   *  thread it also names the anchor (the company, the clinic). The teach
   *  card's example and the Power Play's fallback sentence. */
  example: string;
  /** A short phrase that shows the word (the match card's right side, a
   *  Catch the Misuse pair, a compare card point): "Pair of sneakers",
   *  "Chance of losing money". Seven words at most. */
  cue: string;
  /** Three short real situations that show the word in use WITHOUT naming
   *  it, twelve words at most each ("The same knife cuts raw chicken, then
   *  the lettuce."). Each one is shown on at most one screen of the lesson:
   *  a story card, a fill-in sentence, a Select All line, a sort item, a
   *  Type the Term prompt, a compare card. Three distinct moments are what
   *  keep a level from asking the same thing twice. */
  moments: string[];
  /** The term in the same level students mix this one up with (the SOP's
   *  common_confusion). Drives the compare card, the Catch the Misuse
   *  distractor and the specific correction. Required on analyze and decide
   *  levels. */
  confusion?: string;
  /** An optional worked line for the teach card ("10% of $1,000 = $100").
   *  Only on a level that sets `math: true`. */
  formula?: string;
  /** TERM_ICON_MAP slug; the Levels map only. Never shown on a flashcard. */
  icon?: string;
};

/** A short case over one scene, answered a step at a time (Finance Level 3:
 *  "Which helps Dream Sneakers keep more money?" then "What could
 *  improve?"). Two to four steps; each step is a choice of two or four.
 *  Credits every term in `terms` once the last step is right. */
export type CaseSeed = {
  terms: string[];
  /** One scene line above the steps (72 characters). */
  scene?: string;
  steps: { prompt: string; options: string[]; correctIndex: number }[];
  feedbackCorrect: string;
  feedbackWrong: string;
  label?: string;
};

/** Concrete things sorted into concept buckets (Finance Level 3: "Sneaker
 *  sales", "Store rent" into "Money in" and "Money out"; Level 4: "Creates
 *  shareholders" into "Stock" or "Bond"). Each item credits the term it
 *  shows. Two to four buckets, four to seven items. */
export type SortSeed = {
  prompt: string;
  buckets: string[];
  items: { text: string; bucket: string; term: string }[];
  feedbackCorrect?: string;
  feedbackWrong?: string;
  label?: string;
};

/** Select every item that fits (Finance Level 3: "Select every cost." over
 *  "Materials", "Rent", "Wages", "Sales"). Four options, one to three right. */
export type SelectAllSeed = {
  term: string;
  prompt: string;
  options: string[];
  correct: number[];
  feedbackCorrect?: string;
  feedbackWrong?: string;
};

/** The written finale: one paragraph that uses all five words once, with
 *  {1} to {5} standing for the five terms in TEACHING order (so {3} is
 *  always the third term). The blanks may appear in any order in the text
 *  and must not run 1, 2, 3, 4, 5. */
export type PowerPlaySeed = { intro: string; paragraph: string };

export type LevelSeed = {
  number: number;
  title: string;
  tier: GlossaryLevel["tier"];
  /** The level's one-line goal on the Levels map. */
  goal: string;
  /** The company value this level unlocks, as shown on the map ("$10K").
   *  Continuous stories only; the other modes show the milestone there. */
  unlocks?: string;
  /** Exactly five, in teaching order. Omit on roadmap-only levels. */
  terms?: TermSeed[];
  /** The words a roadmap-only level will teach (shown locked on the map). */
  words?: string[];
  /** Overrides the default focus for this level number. */
  focus?: LevelFocus;
  /** A plate image for the Levels map, when this level has its own
   *  (levelPlates.ts explains the library and the strip format). */
  plate?: string;
  /** The team's decision that this level's words naturally use numbers
   *  (SOP Executive Rule 4: no forced math). Without it, any $, % or figure
   *  in the copy fails validation. */
  math?: boolean;
  /** Authored, Finance-style pieces. All optional; the generator has a
   *  derived fallback for each slot. */
  sort?: SortSeed;
  selectAll?: SelectAllSeed;
  cases?: CaseSeed[];
  powerPlay?: PowerPlaySeed;
  milestone: string;
  nextMilestone: string;
  companyValue: number;
  nextCompanyValue: number;
  facts?: string[];
  intro?: GlossaryLesson["intro"];
};

export type GlossaryBlueprint = {
  /** The industry this glossary is: slug, title, subject and the world
   *  whose design system it wears (industries.ts). */
  industry: IndustryMeta;
  /** How the levels hang together; see WorldMode. */
  mode: WorldMode;
  /** Who the student is in this world: "founder", "nurse", "pilot". */
  studentRole: string;
  /** The career whose hub card and cover introduce this glossary. */
  exampleCareerSlug?: string;
  /** The world anchor every level returns to ("Dream Sneakers", "Riverside
   *  Clinic"). Names the value meter. */
  company: string;
  /** Lesson id prefix, globally unique ("FIN", "RN"). */
  idPrefix: string;
  levels: LevelSeed[];
  chapters: GlossaryChapter[];
};

const MINUTES: Record<GlossaryLevel["tier"], number> = { Beginner: 4, Intermediate: 5, Advanced: 6 };
/** Copy limits, in characters. Measured against the real slots at 375px and
 *  1280px: HUD token label (two lines of 9px), word tile, match card right
 *  side, teach card definition at 24px, one Power Play sentence, the scene
 *  card's one line, a sort token, a Select All line, a case step's prompt. */
export const LIMITS = { term: 22, cue: 34, definition: 120, example: 150, formula: 28, moment: 72, sortItem: 34, selectLine: 44, caseStep: 90, caseOption: 34, powerPlay: 460 } as const;
/** Word limits from the SOP: a context line about 12 words, an answer choice
 *  usually 7. */
export const WORD_LIMITS = { moment: 12, cue: 7 } as const;
export const MOMENTS_PER_TERM = 3;
const DEFAULT_FACT = "Learning the words of a job is the first step to doing it. Say each one out loud once.";

export function focusFor(level: LevelSeed): LevelFocus {
  if (level.focus) return level.focus;
  return level.number <= 1 ? "recognize" : level.number === 2 ? "apply" : level.number === 3 ? "analyze" : "decide";
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function mentions(text: string, word: string): boolean {
  return new RegExp(`\\b${escapeRegExp(word)}s?\\b`, "i").test(text);
}

/** The example with its term replaced by `mark` (first match, any case,
 *  whole word). Null when the example never names the term. */
function blank(example: string, term: string, mark: string): string | null {
  const pattern = new RegExp(`\\b${escapeRegExp(term)}s?\\b`, "i");
  if (!pattern.test(example)) return null;
  return example.replace(pattern, mark);
}

function others<T>(list: T[], skip: number, count: number): T[] {
  const out: T[] = [];
  for (let i = 1; out.length < count && i <= list.length; i += 1) out.push(list[(skip + i) % list.length]);
  return out;
}

/** Four options with the right one placed by a stable rotation, so the
 *  answer is not always first and not random between renders. */
function place<T>(correct: T, distractors: T[], slot: number): { options: T[]; correctIndex: number } {
  const options = [...distractors];
  const correctIndex = slot % (distractors.length + 1);
  options.splice(correctIndex, 0, correct);
  return { options, correctIndex };
}

function term(seed: TermSeed, order: number): GlossaryTerm {
  return { id: seed.term, order, term: seed.term, definition: seed.definition, example: seed.example, icon: seed.icon ?? "circle", formula: seed.formula };
}

function lower(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

function words(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** The order the five Power Play blanks appear in when the generator writes
 *  the paragraph itself: never 1 to 5, and different from level to level so
 *  two fallback paragraphs in a row do not share a pattern. */
const BLANK_ORDERS: number[][] = [[2, 4, 0, 3, 1], [3, 0, 4, 1, 2], [1, 3, 0, 4, 2], [4, 1, 3, 0, 2]];

type Kit = ReturnType<typeof makeKit>;

/** The questions one level can be built from. Each helper credits one term
 *  (or several) and writes its feedback from that term's own copy, with the
 *  specific correction when the term has a known confusion. Every line of
 *  copy a helper shows is checked out of `used`, so a moment, a cue line or
 *  a sentence is never shown twice in one lesson. */
function makeKit(seeds: TermSeed[], level: LevelSeed, id: string) {
  const names = seeds.map((s) => s.term);
  const byName = new Map(seeds.map((s) => [s.term, s]));
  const indexOf = (s: TermSeed) => seeds.indexOf(s);
  const conf = (s: TermSeed): TermSeed => (s.confusion && byName.get(s.confusion)) || others(seeds, indexOf(s), 1)[0];
  const q = (k: number) => `${id}-Q${k}`;
  const wordOptions = (s: TermSeed, slot: number) => place(s.term, others(seeds, indexOf(s), 3).map((o) => o.term), slot);
  const quote = (text: string) => `"${text}"`;
  const notThe = (s: TermSeed) => (s.confusion ? ` Not ${conf(s).term}: that is ${quote(lower(conf(s).cue))}.` : "");
  const story = (text: string): SceneCard => ({ kind: "story", text });
  const used = new Set<string>();
  const show = (text: string): string => {
    if (used.has(text)) throw new Error(`${id}: "${text}" would be shown twice in one lesson`);
    used.add(text);
    return text;
  };
  /** An unused moment of `s`, preferring index `prefer`. */
  const moment = (s: TermSeed, prefer: number): string => {
    const order = [prefer, ...s.moments.map((_, i) => i).filter((i) => i !== prefer)];
    for (const i of order) if (s.moments[i] !== undefined && !used.has(s.moments[i])) return show(s.moments[i]);
    throw new Error(`${id}: "${s.term}" has no unused moment left; the recipe needs ${MOMENTS_PER_TERM}`);
  };
  const WHICH_PROMPTS = ["Which word is this?", "What is this called?", "Which word fits here?"];
  const WHICH_LABELS = ["Real-world scenario", "In the moment", "On the job"];
  const byTerm = (name: string): TermSeed => {
    const s = byName.get(name);
    if (!s) throw new Error(`${id}: "${name}" is not a word in this level`);
    return s;
  };

  return {
    names,
    used,
    byTerm,
    /** Level 1 only: the five definitions as the options for one word. */
    definition(s: TermSeed, k: number): GlossaryQuestion {
      const pick = place(s.definition, others(seeds, indexOf(s), 3).map((o) => o.definition), level.number);
      return {
        kind: "choice", type: "Definition", id: q(k), termId: s.term, playOrder: k, label: "Definition",
        prompt: `What does "${s.term}" mean?`,
        options: pick.options, correctIndex: pick.correctIndex,
        feedbackCorrect: `${s.term}: ${lower(s.cue)}. ${s.example}`,
        feedbackWrong: `${s.term} means ${lower(s.definition)}${notThe(s)}`,
      };
    },
    match(k: number, headers: [string, string]): GlossaryQuestion {
      return {
        kind: "matchUp", type: "Match It Up", id: q(k), playOrder: k, label: "Match the terms", prompt: headers[1] === "Use it when" ? "Match each word to when you use it." : "Match each word to its meaning.",
        headers,
        pairs: seeds.map((s, i) => ({ order: i + 1, left: s.term, right: show(s.cue), termId: s.term, icon: s.icon })),
        feedbackCorrect: `All five matched: ${names.join(", ")}.`,
        feedbackWrong: "Say each pair out loud, then try the ones that felt wrong.",
      };
    },
    /** A moment as a sentence with the word missing at the end. */
    fill(s: TermSeed, k: number): GlossaryQuestion {
      const pick = wordOptions(s, level.number + k);
      return {
        kind: "choice", type: "Fill in the Blank", id: q(k), termId: s.term, playOrder: k, label: "Fill in the blank",
        prompt: "Which word fills the blank?",
        sentence: `${moment(s, 1)} That is ___.`,
        layout: "grid",
        options: pick.options, correctIndex: pick.correctIndex,
        feedbackCorrect: `${s.term}: ${lower(s.cue)}.`,
        feedbackWrong: `${s.definition} So the word is ${s.term}.${notThe(s)}`,
      };
    },
    /** A moment on a story card, then which word it shows. */
    which(s: TermSeed, k: number): GlossaryQuestion {
      const pick = wordOptions(s, level.number + k);
      return {
        kind: "choice", type: "Fill in the Blank", id: q(k), termId: s.term, playOrder: k, label: WHICH_LABELS[k % WHICH_LABELS.length],
        scene: story(moment(s, 0)),
        prompt: WHICH_PROMPTS[k % WHICH_PROMPTS.length],
        layout: "grid",
        options: pick.options, correctIndex: pick.correctIndex,
        feedbackCorrect: `${s.term}: ${lower(s.definition)}`,
        feedbackWrong: `This is ${s.term}: ${lower(s.definition)}${notThe(s)}`,
      };
    },
    /** Decide: the same shape, asked as a call the student makes. */
    yourCall(s: TermSeed, k: number): GlossaryQuestion {
      const pick = wordOptions(s, level.number + k);
      return {
        kind: "choice", type: "Fill in the Blank", id: q(k), termId: s.term, playOrder: k, label: "Your call",
        scene: story(moment(s, 0)),
        prompt: "Which option fits?",
        layout: "grid",
        options: pick.options, correctIndex: pick.correctIndex,
        feedbackCorrect: `${s.term}. ${s.cue}.`,
        feedbackWrong: `The call is ${s.term}: ${lower(s.definition)}${notThe(s)}`,
      };
    },
    /** Four words' moments sorted into the words themselves, when the level
     *  has no authored sort. */
    sortDerived(k: number, four: TermSeed[]): GlossaryQuestion {
      return {
        kind: "sortBuckets", type: "Sort the Buckets", id: q(k), playOrder: k, label: "Sort the buckets", prompt: "Which word does each one show?",
        buckets: four.map((s) => s.term),
        items: [four[2], four[0], four[3], four[1]].map((s, i) => ({ order: i + 1, text: moment(s, 1), bucket: s.term, termId: s.term, icon: s.icon })),
        feedbackCorrect: "Every moment sorted into its word.",
        feedbackWrong: "Read each moment again and ask which word it shows.",
      };
    },
    sortAuthored(seed: SortSeed, k: number): GlossaryQuestion {
      return {
        kind: "sortBuckets", type: "Sort the Buckets", id: q(k), playOrder: k, label: seed.label ?? "Sort the buckets", prompt: seed.prompt,
        buckets: seed.buckets,
        items: seed.items.map((it, i) => ({ order: i + 1, text: show(it.text), bucket: it.bucket, termId: byTerm(it.term).term })),
        feedbackCorrect: seed.feedbackCorrect ?? "Every one sorted.",
        feedbackWrong: seed.feedbackWrong ?? "Ask of each one which bucket it belongs in, then try again.",
      };
    },
    /** Three true "word = cue" pairs and one wrong, where the wrong pair gives
     *  `s` the cue of the word it is mixed up with. */
    misuse(s: TermSeed, k: number): GlossaryQuestion {
      const wrongWith = conf(s);
      const truePairs = others(seeds, indexOf(s), 4).filter((o) => o !== wrongWith).slice(0, 3).map((o) => `${o.term} = ${lower(o.cue)}`);
      const pick = place(`${s.term} = ${lower(wrongWith.cue)}`, truePairs, level.number + k);
      return {
        kind: "choice", type: "Catch the Misuse", id: q(k), termId: s.term, playOrder: k, label: "Quick check",
        prompt: "Which one is wrong?",
        options: pick.options, correctIndex: pick.correctIndex,
        feedbackCorrect: `Right: ${s.term} is ${quote(lower(s.cue))}, not ${quote(lower(wrongWith.cue))}.`,
        feedbackWrong: `${s.term} is not ${quote(lower(wrongWith.cue))}. That is ${wrongWith.term}. ${s.term} means ${lower(s.definition)}`,
      };
    },
    type(s: TermSeed, k: number): GlossaryQuestion {
      return {
        kind: "typeTerm", type: "Type the Term", id: q(k), termId: s.term, playOrder: k, label: "Type the term",
        prompt: `${moment(s, 2)} Type the word.`,
        wordBank: names, answer: s.term,
        feedbackCorrect: `${s.term}: ${lower(s.cue)}.`,
        feedbackWrong: `The word is ${s.term}: ${lower(s.definition)}`,
      };
    },
    /** The word beside the word it is mixed up with, each with its cue; a
     *  moment decides which one it is. */
    compare(s: TermSeed, k: number): GlossaryQuestion {
      const other = conf(s);
      const pick = place(s.term, [other.term], level.number + k);
      const twoMore = others(seeds, indexOf(s), 4).filter((o) => o !== other).slice(0, 2).map((o) => o.term);
      const options = [...pick.options, ...twoMore];
      return {
        kind: "choice", type: "Fill in the Blank", id: q(k), termId: s.term, playOrder: k, label: "Tell them apart",
        scene: { kind: "compare", title: `${s.term} or ${other.term}?`, options: [{ label: s.term, points: [s.cue] }, { label: other.term, points: [other.cue] }] },
        prompt: `${moment(s, 0)} Which one is that?`,
        layout: "grid",
        options, correctIndex: pick.correctIndex,
        feedbackCorrect: `${s.term}: ${quote(lower(s.cue))}. ${other.term}: ${quote(lower(other.cue))}.`,
        feedbackWrong: `That is ${s.term}: ${quote(lower(s.cue))}. ${other.term} would be ${quote(lower(other.cue))}.`,
      };
    },
    /** Two of the word's moments against the confusion's and another word's,
     *  when the level has no authored Select All. */
    selectAllDerived(s: TermSeed, k: number): GlossaryQuestion {
      const other = conf(s);
      const another = others(seeds, indexOf(s), 4).find((o) => o !== other) ?? other;
      const lines = [moment(s, 0), moment(s, 2), moment(other, 2), moment(another, 2)];
      const rot = k % 4;
      const options = lines.map((_, i) => lines[(i + rot) % 4]);
      const correct = options.map((line, i) => (lines.indexOf(line) < 2 ? i : -1)).filter((i) => i >= 0);
      return {
        kind: "multiSelect", type: "Select All", id: q(k), termId: s.term, playOrder: k, label: "Select all",
        prompt: `Select every moment that shows ${s.term}.`,
        options, correct,
        feedbackCorrect: `Both show ${s.term}: ${lower(s.definition)}`,
        feedbackWrong: another === other
          ? `${s.term} is ${quote(lower(s.cue))}. The other two lines are ${other.term}.`
          : `${s.term} is ${quote(lower(s.cue))}. One other line is ${other.term}, the last is ${another.term}.`,
      };
    },
    selectAllAuthored(seed: SelectAllSeed, k: number): GlossaryQuestion {
      const s = byTerm(seed.term);
      return {
        kind: "multiSelect", type: "Select All", id: q(k), termId: s.term, playOrder: k, label: "Select all",
        prompt: seed.prompt,
        options: seed.options.map(show), correct: seed.correct,
        feedbackCorrect: seed.feedbackCorrect ?? `Right. Every one of those is ${s.term}.`,
        feedbackWrong: seed.feedbackWrong ?? `${s.term} means ${lower(s.definition)}`,
      };
    },
    caseAuthored(seed: CaseSeed, k: number): GlossaryQuestion {
      const terms = seed.terms.map((t) => byTerm(t).term);
      const question: ChainQuestion = {
        kind: "chain", type: "Case", id: q(k), playOrder: k, label: seed.label ?? "Case",
        scene: seed.scene ? story(show(seed.scene)) : undefined,
        prompt: show(seed.steps[0].prompt),
        steps: seed.steps.map((step, i) => ({ prompt: i === 0 ? step.prompt : show(step.prompt), options: step.options, correctIndex: step.correctIndex })),
        termIds: terms,
        feedbackCorrect: seed.feedbackCorrect,
        feedbackWrong: seed.feedbackWrong,
      };
      return question;
    },
    /** The held-back review: the definition read aloud, one per word. Drawn
     *  only for a word still short of mastery after the main loop. */
    recall(s: TermSeed, k: number): GlossaryQuestion {
      const pick = wordOptions(s, level.number + k);
      return {
        kind: "choice", type: "Reverse Recall", id: q(k), termId: s.term, playOrder: k, label: "Review",
        prompt: `${s.definition} That word is...`,
        options: pick.options, correctIndex: pick.correctIndex,
        feedbackCorrect: `Right, that is ${s.term}.`,
        feedbackWrong: `That describes ${s.term}. ${s.example}`,
      };
    },
  };
}

/** The scored questions for one level: seven derived from the recipe for
 *  its cognitive focus, with the level's authored pieces used in the slots
 *  that have one and the rest added as extra screens. */
function recipe(level: LevelSeed, seeds: TermSeed[], kit: Kit): GlossaryQuestion[] {
  const [t1, t2, t3, t4, t5] = seeds;
  const sortSlot = (k: number, four: TermSeed[]) => (level.sort ? kit.sortAuthored(level.sort, k) : kit.sortDerived(k, four));
  const selectSlot = (k: number, s: TermSeed) => (level.selectAll ? kit.selectAllAuthored(level.selectAll, k) : kit.selectAllDerived(s, k));
  let core: GlossaryQuestion[];
  let hasSort = true;
  let hasSelect = true;
  switch (focusFor(level)) {
    case "recognize":
      // Finance Level 1: one definition, then visual interactive formats
      // over the same five words.
      hasSelect = false;
      core = [kit.definition(t1, 1), kit.match(2, ["Word", "Meaning"]), kit.fill(t5, 3), kit.which(t3, 4), sortSlot(5, [t1, t2, t3, t4]), kit.misuse(t4, 6), kit.type(t2, 7)];
      break;
    case "apply":
      // Finance Level 2: story cards, then Match and a quick check.
      hasSort = false;
      core = [kit.which(t1, 1), kit.fill(t2, 2), kit.which(t3, 3), selectSlot(4, t4), kit.match(5, ["Word", "Meaning"]), kit.misuse(t5, 6), kit.type(t1, 7)];
      break;
    case "analyze":
      // Finance Level 3: a figures card, a concept sort, Select All, cases.
      core = [kit.compare(t1, 1), kit.which(t3, 2), sortSlot(3, [t2, t3, t4, t5]), selectSlot(4, t2), kit.fill(t1, 5), kit.misuse(t4, 6), kit.type(t5, 7)];
      break;
    case "decide":
      // Finance Level 4: calls to make, a compare card, a sort, a quick check.
      hasSort = false;
      core = [kit.yourCall(t1, 1), kit.compare(t2, 2), kit.match(3, ["Word", "Use it when"]), kit.fill(t3, 4), selectSlot(5, t4), kit.misuse(t5, 6), kit.type(t1, 7)];
      break;
    default:
      throw new Error(`unknown focus for level ${level.number}`);
  }
  // Extras: authored cases, plus an authored sort or Select All the recipe
  // had no slot for. Inserted after the third and fifth screens so a case
  // never sits next to another case and the loop still opens and closes on
  // a derived screen.
  const extras: ((k: number) => GlossaryQuestion)[] = [];
  for (const c of level.cases ?? []) extras.push((k) => kit.caseAuthored(c, k));
  if (level.sort && !hasSort) extras.push((k) => kit.sortAuthored(level.sort!, k));
  if (level.selectAll && !hasSelect) extras.push((k) => kit.selectAllAuthored(level.selectAll!, k));
  const slots = [3, 5, 6];
  const out = [...core];
  extras.forEach((make, i) => {
    const at = Math.min(slots[i] + i, out.length);
    out.splice(at, 0, make(100 + i));
  });
  return out.map((question, i) => ({ ...question, id: question.id.replace(/-Q\d+$/, `-Q${i + 1}`), playOrder: i + 1 }));
}

/** The screen shape a student sees, for the "no three in a row" rule: a
 *  choice over a story card, a fill-in sentence, a compare card and a plain
 *  2x2 are four different screens even though the engine calls them all
 *  "choice" (Finance Level 2 runs five choices in a row, each on a different
 *  card, and it never feels repetitive). */
export function mechanic(q: GlossaryQuestion): string {
  if (q.kind !== "choice") return q.kind;
  if (q.sentence) return "choice:sentence";
  if (q.scene) return `choice:${q.scene.kind}`;
  return `choice:${q.type}`;
}

function credits(lesson: Pick<GlossaryLesson, "questions" | "terms">): Record<string, number> {
  const count: Record<string, number> = Object.fromEntries(lesson.terms.map((t) => [t.id, 0]));
  for (const q of lesson.questions) {
    const ids = new Set<string>();
    if (q.kind === "matchUp") q.pairs.forEach((p) => ids.add(p.termId));
    else if (q.kind === "sortBuckets") q.items.forEach((it) => ids.add(it.termId));
    else if (q.kind === "chain") (q.termIds ?? []).forEach((t) => ids.add(t));
    else if (q.termId) ids.add(q.termId);
    for (const t of ids) if (t in count) count[t] += 1;
  }
  return count;
}

export function buildLesson(bp: GlossaryBlueprint, level: LevelSeed, previousValue: number): GlossaryLesson {
  const seeds = level.terms ?? [];
  const id = `${bp.idPrefix}-L${String(level.number).padStart(2, "0")}`;
  const terms = seeds.map((seed, i) => term(seed, i + 1));
  const names = seeds.map((s) => s.term);
  const kit = makeKit(seeds, level, id);
  const questions = recipe(level, seeds, kit);
  const reviewQuestions = seeds.map((s, i) => kit.recall(s, questions.length + 1 + i));

  // The lesson's own promises, checked at build time so a bad combination of
  // authored pieces fails at import, not in a student's hands.
  const count = credits({ questions, terms });
  for (const [t, n] of Object.entries(count)) if (n < 2) throw new Error(`${id}: "${t}" is credited ${n} time(s) in the main loop; mastery needs 2. Move the Select All or a case to it.`);
  const kinds = questions.map(mechanic);
  for (let i = 2; i < kinds.length; i += 1) if (kinds[i] === kinds[i - 1] && kinds[i - 1] === kinds[i - 2]) throw new Error(`${id}: three ${kinds[i]} screens in a row (questions ${i - 1} to ${i + 1})`);

  let powerPlay: GlossaryLesson["powerPlay"];
  if (level.powerPlay) {
    powerPlay = { intro: level.powerPlay.intro, paragraph: level.powerPlay.paragraph, answers: names.map((n) => n.toLowerCase()) };
  } else {
    const order = BLANK_ORDERS[level.number % BLANK_ORDERS.length];
    const paragraph = order.map((i) => blank(seeds[i].example, seeds[i].term, `{${i + 1}}`) ?? `{${i + 1}}: ${seeds[i].definition}`).join(" ");
    powerPlay = { intro: level.goal.replace(/\.$/, "") + ".", paragraph, answers: names.map((n) => n.toLowerCase()) };
  }

  return {
    id,
    lessonNumber: level.number,
    title: level.title,
    subtitle: names.join(" · "),
    milestone: level.milestone,
    exampleCompany: bp.company,
    difficulty: level.tier,
    estimatedMinutes: MINUTES[level.tier],
    xpReward: 20,
    companyValue: level.companyValue,
    nextCompanyValue: level.nextCompanyValue,
    nextMilestone: level.nextMilestone,
    previousCompanyValue: previousValue,
    intro: level.intro,
    terms,
    questions,
    reviewQuestions,
    powerPlay,
    facts: level.facts && level.facts.length ? level.facts : [DEFAULT_FACT],
  };
}

/** Everything the engine needs for one industry. Throws on a bad blueprint. */
export function buildGlossaryCareer(bp: GlossaryBlueprint): GlossaryCareer {
  const problems = validateBlueprint(bp);
  if (problems.length) throw new Error(`Glossary blueprint "${bp.industry.slug}" is not playable:\n- ${problems.join("\n- ")}`);
  const industry = bp.industry;
  const lessons: GlossaryLesson[] = [];
  let previous = 0;
  for (const level of bp.levels) {
    if (!level.terms) continue;
    lessons.push(buildLesson(bp, level, previous));
    previous = level.companyValue;
  }
  const levels: GlossaryLevel[] = bp.levels.map((level) => ({
    number: level.number,
    tier: level.tier,
    title: level.title,
    words: level.terms ? level.terms.map((s) => s.term) : level.words ?? [],
    goal: level.goal,
    // Only a company's value is worth a dollar figure on the map; a clinic
    // or a kitchen shows what the level unlocks in words (SOP level_goal).
    unlocks: bp.mode === "continuous_story" ? level.unlocks ?? level.milestone : level.milestone,
    minutes: MINUTES[level.tier],
    plate: level.plate,
  }));
  return { industrySlug: industry.slug, mode: bp.mode, industryTitle: industry.title, careerSlug: bp.exampleCareerSlug ?? industry.slug, careerTitle: industry.title, world: industry.world, subject: industry.subject, lessons, levels, chapters: bp.chapters };
}

const MODES: WorldMode[] = ["continuous_story", "scenario_thread", "practice_world"];
/** A dollar or percent sign, or a figure of two or more digits. Single
 *  digits in prose ("3 steps") pass; money and measures do not. */
const NUMBERS = /[$%]|\d\d/;
const DASH = /—|–/;

/** The content intake checklist, as code. Empty list means playable. */
export function validateBlueprint(bp: GlossaryBlueprint): string[] {
  const problems: string[] = [];
  if (!worldSystem(bp.industry.world)) problems.push(`"${bp.industry.world}" is not a career world (industries.ts WORLD_SYSTEMS)`);
  if (!/^[a-z][a-z-]*$/.test(bp.industry.slug)) problems.push(`industry slug "${bp.industry.slug}" must be lowercase letters and dashes (it is a route)`);
  if (!MODES.includes(bp.mode)) problems.push(`mode "${bp.mode}" must be continuous_story, scenario_thread or practice_world`);
  if (!bp.studentRole?.trim()) problems.push("studentRole is empty; say who the student is (founder, nurse, pilot)");
  if (!bp.levels.length) problems.push("no levels");
  if (!bp.levels.some((l) => l.terms)) problems.push("no level has terms; nothing to play");
  const anchored = bp.mode !== "practice_world";
  const numbers = new Set<number>();
  for (const level of bp.levels) {
    if (numbers.has(level.number)) problems.push(`level ${level.number} is listed twice`);
    numbers.add(level.number);
    if (!level.terms) continue;
    const where = `level ${level.number} (${level.title})`;
    const focus = focusFor(level);
    if (level.title.length > 30) problems.push(`${where}: level title is ${level.title.length} characters; the HUD and map hold 30`);
    if (level.goal.length > 48) problems.push(`${where}: goal is ${level.goal.length} characters; the welcome line holds 48`);
    if (bp.mode === "continuous_story" && !level.unlocks) problems.push(`${where}: a continuous story shows the company value each level unlocks; add unlocks ("$10K")`);
    if (level.terms.length !== 5) problems.push(`${where}: ${level.terms.length} terms, needs exactly 5`);
    const names = level.terms.map((t) => t.term);
    const lowerNames = names.map((n) => n.toLowerCase());
    if (new Set(lowerNames).size !== lowerNames.length) problems.push(`${where}: duplicate term names`);
    const cues = level.terms.map((t) => t.cue.toLowerCase());
    if (new Set(cues).size !== cues.length) problems.push(`${where}: duplicate cues (the match card needs unique right sides)`);
    const defs = level.terms.map((t) => t.definition);
    if (new Set(defs).size !== defs.length) problems.push(`${where}: duplicate definitions`);
    const allMoments = level.terms.flatMap((t) => t.moments ?? []);
    if (new Set(allMoments.map((m) => m.toLowerCase())).size !== allMoments.length) problems.push(`${where}: two moments are the same line; every moment in a level must be different`);
    const levelCopy: string[] = [];
    const numberCheck = (text: string, what: string) => {
      if (!level.math && NUMBERS.test(text)) problems.push(`${where}: ${what} uses numbers but the level does not set math: true; only set it when this job's words naturally use math`);
      if (DASH.test(text)) problems.push(`${where}: ${what} uses a dash; write it as two sentences`);
    };
    for (const t of level.terms) {
      // Length limits are layout rules (16 Oct 2026, Chandu: "make sure there
      // are rules in place so words dont get clipped, wrap, layouts dont
      // break"): a term must fit a HUD token and a word tile, a cue a match
      // card, a definition a teach card at 24px, an example two lines of the
      // Power Play paragraph, a moment one scene line.
      if (t.term.length > LIMITS.term) problems.push(`${where}: term "${t.term}" is ${t.term.length} characters; the HUD tokens and word tiles hold ${LIMITS.term}`);
      if (t.cue.length > LIMITS.cue) problems.push(`${where}: cue for "${t.term}" is ${t.cue.length} characters; match cards and quick-check pairs hold ${LIMITS.cue}`);
      if (words(t.cue) > WORD_LIMITS.cue) problems.push(`${where}: cue for "${t.term}" is ${words(t.cue)} words; an answer is ${WORD_LIMITS.cue} at most`);
      if (t.definition.length > LIMITS.definition) problems.push(`${where}: definition for "${t.term}" is ${t.definition.length} characters; the teach card and answer tiles hold ${LIMITS.definition}`);
      if (t.example.length > LIMITS.example) problems.push(`${where}: example for "${t.term}" is ${t.example.length} characters; the Power Play paragraph holds ${LIMITS.example} per sentence`);
      if (t.formula && t.formula.length > LIMITS.formula) problems.push(`${where}: formula for "${t.term}" is ${t.formula.length} characters; the worked line holds ${LIMITS.formula}`);
      if (!blank(t.example, t.term, "_")) problems.push(`${where}: the example for "${t.term}" never says the word, so it cannot become a blank`);
      if (anchored && !t.example.includes(bp.company)) problems.push(`${where}: the example for "${t.term}" does not name ${bp.company} (every example does in a ${bp.mode.replace("_", " ")})`);
      // Answer leakage (SOP): the Reverse Recall question reads the
      // definition and asks for the word, so the definition cannot say it;
      // every moment is asked over, so neither can they.
      if (mentions(t.definition, t.term)) problems.push(`${where}: the definition of "${t.term}" says the word itself; the review question would give it away`);
      if (mentions(t.cue, t.term)) problems.push(`${where}: the cue for "${t.term}" says the word itself; the match card would give it away`);
      const moments = t.moments ?? [];
      if (moments.length !== MOMENTS_PER_TERM) problems.push(`${where}: "${t.term}" has ${moments.length} moments; every word needs exactly ${MOMENTS_PER_TERM} so no screen repeats a line`);
      moments.forEach((m, i) => {
        if (m.length > LIMITS.moment) problems.push(`${where}: moment ${i + 1} for "${t.term}" is ${m.length} characters; the scene card holds ${LIMITS.moment}`);
        if (words(m) > WORD_LIMITS.moment) problems.push(`${where}: moment ${i + 1} for "${t.term}" is ${words(m)} words; a context line is ${WORD_LIMITS.moment} at most`);
        if (mentions(m, t.term)) problems.push(`${where}: moment ${i + 1} for "${t.term}" says the word itself; it is the answer`);
      });
      if (t.confusion) {
        if (!lowerNames.includes(t.confusion.toLowerCase())) problems.push(`${where}: "${t.term}" is confused with "${t.confusion}", which is not a word in this level`);
        if (t.confusion.toLowerCase() === t.term.toLowerCase()) problems.push(`${where}: "${t.term}" cannot be confused with itself`);
      } else if (focus === "analyze" || focus === "decide") {
        problems.push(`${where}: "${t.term}" has no confusion; ${focus} levels tell words apart`);
      }
      // No forced math (SOP Executive Rule 4): numbers only where the team
      // said this level's words naturally carry them.
      if (!level.math && t.formula) problems.push(`${where}: "${t.term}" has a formula but the level does not set math: true`);
      numberCheck(`${t.definition} ${t.example} ${t.cue} ${moments.join(" ")}`, `"${t.term}"`);
      levelCopy.push(t.cue, ...moments);
    }
    const known = (name: string) => lowerNames.includes(name.toLowerCase());
    if (level.sort) {
      const s = level.sort;
      if (s.buckets.length < 2 || s.buckets.length > 4) problems.push(`${where}: the sort has ${s.buckets.length} buckets; two to four`);
      if (s.items.length < 4 || s.items.length > 7) problems.push(`${where}: the sort has ${s.items.length} items; four to seven`);
      if (s.prompt.length > LIMITS.caseStep) problems.push(`${where}: the sort prompt is ${s.prompt.length} characters; ${LIMITS.caseStep} at most`);
      for (const it of s.items) {
        if (!s.buckets.includes(it.bucket)) problems.push(`${where}: sort item "${it.text}" goes in "${it.bucket}", which is not a bucket`);
        if (!known(it.term)) problems.push(`${where}: sort item "${it.text}" credits "${it.term}", which is not a word in this level`);
        if (it.text.length > LIMITS.sortItem) problems.push(`${where}: sort item "${it.text}" is ${it.text.length} characters; a token holds ${LIMITS.sortItem}`);
        if (names.some((n) => mentions(it.text, n) && s.buckets.includes(n))) problems.push(`${where}: sort item "${it.text}" says the word it should be sorted into`);
        numberCheck(it.text, `sort item "${it.text}"`);
        levelCopy.push(it.text);
      }
      for (const b of s.buckets) if (b.length > LIMITS.cue) problems.push(`${where}: sort bucket "${b}" is ${b.length} characters; ${LIMITS.cue} at most`);
    }
    if (level.selectAll) {
      const s = level.selectAll;
      if (!known(s.term)) problems.push(`${where}: the Select All is about "${s.term}", which is not a word in this level`);
      if (s.options.length !== 4) problems.push(`${where}: the Select All has ${s.options.length} options; four`);
      if (s.correct.length < 1 || s.correct.length > 3 || s.correct.some((i) => i < 0 || i >= s.options.length)) problems.push(`${where}: the Select All needs one to three correct indexes within its options`);
      if (s.prompt.length > LIMITS.caseStep) problems.push(`${where}: the Select All prompt is ${s.prompt.length} characters; ${LIMITS.caseStep} at most`);
      for (const o of s.options) {
        if (o.length > LIMITS.selectLine) problems.push(`${where}: Select All line "${o}" is ${o.length} characters; a line holds ${LIMITS.selectLine}`);
        if (mentions(o, s.term)) problems.push(`${where}: Select All line "${o}" says ${s.term}; it is the answer`);
        numberCheck(o, `Select All line "${o}"`);
        levelCopy.push(o);
      }
    }
    for (const [ci, c] of (level.cases ?? []).entries()) {
      const label = `case ${ci + 1}`;
      if (!c.terms.length) problems.push(`${where}: ${label} credits no words; list the words it is about`);
      for (const t of c.terms) if (!known(t)) problems.push(`${where}: ${label} credits "${t}", which is not a word in this level`);
      if (c.steps.length < 2 || c.steps.length > 4) problems.push(`${where}: ${label} has ${c.steps.length} steps; two to four`);
      if (c.scene && c.scene.length > LIMITS.moment) problems.push(`${where}: ${label} scene is ${c.scene.length} characters; the scene card holds ${LIMITS.moment}`);
      if (c.scene) { numberCheck(c.scene, `${label} scene`); levelCopy.push(c.scene); }
      for (const [si, step] of c.steps.entries()) {
        if (step.options.length !== 2 && step.options.length !== 4) problems.push(`${where}: ${label} step ${si + 1} has ${step.options.length} options; two or four`);
        if (step.correctIndex < 0 || step.correctIndex >= step.options.length) problems.push(`${where}: ${label} step ${si + 1} points at an option that does not exist`);
        if (step.prompt.length > LIMITS.caseStep) problems.push(`${where}: ${label} step ${si + 1} prompt is ${step.prompt.length} characters; ${LIMITS.caseStep} at most`);
        for (const o of step.options) if (o.length > LIMITS.caseOption) problems.push(`${where}: ${label} step ${si + 1} option "${o}" is ${o.length} characters; ${LIMITS.caseOption} at most`);
        const answer = step.options[step.correctIndex] ?? "";
        if (answer && mentions(step.prompt, answer)) problems.push(`${where}: ${label} step ${si + 1} says its own answer "${answer}"`);
        numberCheck(`${step.prompt} ${step.options.join(" ")}`, `${label} step ${si + 1}`);
        levelCopy.push(step.prompt);
      }
      if ((level.cases ?? []).length > 2) problems.push(`${where}: ${level.cases!.length} cases; two at most, the loop holds ten screens`);
    }
    if (level.powerPlay) {
      const p = level.powerPlay.paragraph;
      const found = [...p.matchAll(/\{(\d)\}/g)].map((m) => Number(m[1]));
      for (let i = 1; i <= 5; i += 1) if (found.filter((n) => n === i).length !== 1) problems.push(`${where}: the Power Play paragraph must use {${i}} exactly once`);
      if (found.length === 5 && found.every((n, i) => n === i + 1)) problems.push(`${where}: the Power Play blanks run 1 to 5 in teaching order; reorder the sentences so the student has to think about which word goes where`);
      if (p.length > LIMITS.powerPlay) problems.push(`${where}: the Power Play paragraph is ${p.length} characters; ${LIMITS.powerPlay} at most`);
      for (const n of names) if (mentions(p, n)) problems.push(`${where}: the Power Play paragraph says "${n}", one of its own answers`);
      if (!level.powerPlay.intro.trim()) problems.push(`${where}: the Power Play needs an intro line`);
      numberCheck(p, "the Power Play paragraph");
    }
    // No line of copy twice within a level, across every authored piece.
    const seen = new Map<string, number>();
    for (const line of levelCopy) seen.set(line.toLowerCase(), (seen.get(line.toLowerCase()) ?? 0) + 1);
    for (const [line, n] of seen) if (n > 1) problems.push(`${where}: "${line}" appears ${n} times across the level's copy; every line is shown once`);
  }
  return problems;
}
