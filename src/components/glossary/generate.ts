// Glossary Game generator: an industry's term list in, a playable glossary out.
//
// Why (16 Oct 2026, Chandu): "make sure the whole system is scaleable for any
// career. To be auto generated, including the games and levels." Level 1 of
// Investment Banking was hand-authored from the content template and every
// later level was hand-authored after it. That does not scale to 50
// industries. This module turns a GlossaryBlueprint (five terms per level,
// each with a definition, an example sentence and a short cue) into the same
// GlossaryLesson shape the engine already plays.
//
// Why four recipes (16 Oct 2026, the "Dreamari Glossary Game Master Scaling
// Plan" SOP, section 3): the lesson should get harder because students must
// think, not because screens hold more text. Level 1 recognizes, Level 2
// applies, Level 3 compares and classifies, Level 4 decides. The first pass
// of this generator reused Level 1's recipe on every level; that taught
// recognition four times over. Each recipe below reuses mechanics the engine
// already renders (choice with a scene, select all, compare scene, match,
// sort, type) in a different order, never more than two of the same mechanic
// in a row (SOP: interaction diversity), seven scored questions plus one
// Power Play (SOP: 7 to 10), every term credited at least twice so mastery
// is reachable in the main loop.
//
//   recognize (Level 1)  Definition, Match, Fill in the Blank, Reverse Recall,
//                        Sort, Catch the Misuse, Type the Term
//   apply (Level 2)      a situation then "which word", Match, Fill, Recall,
//                        Sort, a second situation, Type from a situation
//   analyze (Level 3)    a compare card (word vs the word it is mixed up
//                        with), Select All about one word, Recall, Sort,
//                        Misuse against the confusion, a situation, Type
//   decide (Level 4+)    "which option fits" situations, a compare card,
//                        Match, Select All, Misuse, Type from a situation
//
// What the SOP forbids, the validator refuses: timers (the engine has none),
// numbers unless the level says its words naturally use math, a situation
// that names its own word (answer leakage), a definition that names its own
// word (the Reverse Recall question reads the definition aloud), copy over
// the slot limits. Finance (Investment Banking) is hand-authored and never
// passes through here (SOP Executive Rule 1).
//
// Validation runs on every build and throws with a list of problems, so a
// bad blueprint fails at import time in development, not in a student's
// hands.

import type { GlossaryCareer, GlossaryChapter, GlossaryLesson, GlossaryLevel, GlossaryQuestion, GlossaryTerm, SceneCard } from "./data";
import { type IndustryMeta, worldSystem } from "./industries";

/** How the industry's levels hang together (SOP section 1).
 *  - continuous_story: one company, product or project progresses across the
 *    levels (Dream Sneakers). Every example names it.
 *  - scenario_thread: the same workplace, a new situation each level (a
 *    hospital shift, a different patient). Every example names the place.
 *  - practice_world: short varied situations, Dreamy and the world carry the
 *    game; no narrative to maintain. Examples need not name the anchor. */
export type WorldMode = "continuous_story" | "scenario_thread" | "practice_world";

/** The cognitive goal of a level (SOP section 3). Defaults by level number:
 *  1 recognize, 2 apply, 3 analyze, 4 and later decide. */
export type LevelFocus = "recognize" | "apply" | "analyze" | "decide";

export type TermSeed = {
  term: string;
  /** Eighth-grade level, one sentence. Must not say the word itself. */
  definition: string;
  /** Must contain the term (any case). In a continuous story or a scenario
   *  thread it also names the anchor (the company, the clinic). */
  example: string;
  /** A short phrase that shows the word (the match card's right side, the
   *  sort item, a Select All line): "Pair of sneakers", "Heart rate and
   *  temperature". Seven words at most. */
  cue: string;
  /** The SOP's context line: one real situation that shows the word in use
   *  WITHOUT naming it, twelve words at most ("A rider taps Pay and the app
   *  freezes."). Apply, analyze and decide levels ask "which word is this"
   *  or "which option fits" over it. Required on those levels. */
  situation?: string;
  /** The term in the same level students mix this one up with (the SOP's
   *  common_confusion). Drives the compare card, the Catch the Misuse
   *  distractor and the specific correction. Required on analyze and decide
   *  levels. */
  confusion?: string;
  /** An optional worked line for the teach card ("10% of $1,000 = $100").
   *  Only on a level that sets `math: true`. */
  formula?: string;
  /** TERM_ICON_MAP slug; optional, generated industries teach without pictures. */
  icon?: string;
};

export type LevelSeed = {
  number: number;
  title: string;
  tier: GlossaryLevel["tier"];
  /** The level's one-line goal on the Levels map. */
  goal: string;
  /** The company value this level unlocks, as shown on the map ("$10K"). */
  unlocks: string;
  /** Exactly five, in teaching order. Omit on roadmap-only levels. */
  terms?: TermSeed[];
  /** The words a roadmap-only level will teach (shown locked on the map). */
  words?: string[];
  /** Overrides the default focus for this level number. */
  focus?: LevelFocus;
  /** The team's decision that this level's words naturally use numbers
   *  (SOP Executive Rule 4: no forced math). Without it, any $, % or figure
   *  in the copy fails validation. */
  math?: boolean;
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
 *  card's one line. */
export const LIMITS = { term: 22, cue: 34, definition: 120, example: 150, formula: 28, situation: 72 } as const;
/** Word limits from the SOP: a context line about 12 words, an answer choice
 *  usually 7. */
export const WORD_LIMITS = { situation: 12, cue: 7 } as const;
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

/** The questions one level can be built from. Each helper credits one term
 *  (or all of them) and writes its feedback from that term's own copy, with
 *  the specific correction when the term has a known confusion. */
function makeKit(seeds: TermSeed[], level: LevelSeed, id: string) {
  const names = seeds.map((s) => s.term);
  const byName = new Map(seeds.map((s) => [s.term, s]));
  const indexOf = (s: TermSeed) => seeds.indexOf(s);
  const conf = (s: TermSeed): TermSeed => (s.confusion && byName.get(s.confusion)) || others(seeds, indexOf(s), 1)[0];
  const q = (k: number) => `${id}-Q${k}`;
  const wordOptions = (s: TermSeed, slot: number) => place(s.term, others(seeds, indexOf(s), 3).map((o) => o.term), slot);
  const notThe = (s: TermSeed) => (s.confusion ? ` Not ${conf(s).term}: that is ${lower(conf(s).cue)}.` : "");
  const story = (text: string): SceneCard => ({ kind: "story", text });

  return {
    definition(s: TermSeed, k: number): GlossaryQuestion {
      const pick = place(s.definition, others(seeds, indexOf(s), 3).map((o) => o.definition), level.number);
      return {
        kind: "choice", type: "Definition", id: q(k), termId: s.term, playOrder: k, label: "Definition",
        prompt: `What does "${s.term}" mean?`,
        options: pick.options, correctIndex: pick.correctIndex,
        feedbackCorrect: `${s.term}: ${s.definition} ${s.example}`,
        feedbackWrong: `${s.definition} ${s.example}`,
      };
    },
    match(k: number, headers: [string, string]): GlossaryQuestion {
      return {
        kind: "matchUp", type: "Match It Up", id: q(k), playOrder: k, label: "Match the terms", prompt: "Match each word to what shows it.",
        headers,
        pairs: seeds.map((s, i) => ({ order: i + 1, left: s.term, right: s.cue, termId: s.term, icon: s.icon })),
        feedbackCorrect: `All five matched: ${names.join(", ")}.`,
        feedbackWrong: "Read each one again and ask which word it shows.",
      };
    },
    fill(s: TermSeed, k: number): GlossaryQuestion {
      const pick = wordOptions(s, level.number + k);
      return {
        kind: "choice", type: "Fill in the Blank", id: q(k), termId: s.term, playOrder: k, label: "Fill in the blank",
        prompt: "Which word fills the blank?",
        sentence: blank(s.example, s.term, "___") ?? `___: ${s.definition}`,
        layout: "grid",
        options: pick.options, correctIndex: pick.correctIndex,
        feedbackCorrect: `${s.term}: ${s.definition}`,
        feedbackWrong: `${s.definition} So the word is ${s.term}.${notThe(s)}`,
      };
    },
    recall(s: TermSeed, k: number): GlossaryQuestion {
      const pick = wordOptions(s, level.number + k);
      return {
        kind: "choice", type: "Reverse Recall", id: q(k), termId: s.term, playOrder: k, label: "Which word",
        prompt: `${s.definition} Which word is that?`,
        options: pick.options, correctIndex: pick.correctIndex,
        feedbackCorrect: `${s.term}: ${s.definition}`,
        feedbackWrong: `That describes ${s.term}. ${s.example}${notThe(s)}`,
      };
    },
    sort(k: number): GlossaryQuestion {
      const four = seeds.slice(0, 4);
      return {
        kind: "sortBuckets", type: "Sort the Buckets", id: q(k), playOrder: k, label: "Sort the buckets", prompt: "Sort each one.",
        buckets: four.map((s) => s.term),
        items: [four[2], four[0], four[3], four[1]].map((s, i) => ({ order: i + 1, text: s.cue, bucket: s.term, termId: s.term, icon: s.icon })),
        feedbackCorrect: "Every one sorted into its word.",
        feedbackWrong: "Ask of each one: which word does it show?",
      };
    },
    /** Three true "word = cue" pairs and one wrong, where the wrong pair gives
     *  `s` the cue of the word it is mixed up with. */
    misuse(s: TermSeed, k: number): GlossaryQuestion {
      const wrongWith = conf(s);
      const truePairs = others(seeds, indexOf(s), 4).filter((o) => o !== wrongWith).slice(0, 3).map((o) => `${o.term} = ${o.cue}`);
      const pick = place(`${s.term} = ${wrongWith.cue}`, truePairs, level.number + k);
      return {
        kind: "choice", type: "Catch the Misuse", id: q(k), termId: s.term, playOrder: k, label: "Quick check",
        prompt: "Which one is wrong?",
        options: pick.options, correctIndex: pick.correctIndex,
        feedbackCorrect: `Right: ${s.term} is ${lower(s.cue)}, not ${lower(wrongWith.cue)}.`,
        feedbackWrong: `${s.term} is not ${lower(wrongWith.cue)}. That is ${wrongWith.term}. ${s.term} means ${lower(s.definition)}`,
      };
    },
    type(s: TermSeed, k: number, fromSituation = false): GlossaryQuestion {
      const lead = fromSituation && s.situation ? `${s.situation} Type the word.` : `Type the word: ${s.definition}`;
      return {
        kind: "typeTerm", type: "Type the Term", id: q(k), termId: s.term, playOrder: k, label: "Type the term",
        prompt: lead,
        wordBank: names, answer: s.term,
        feedbackCorrect: `${s.term}: ${s.definition}`,
        feedbackWrong: `The word is ${s.term}. ${s.example}`,
      };
    },
    /** A real situation on a scene card, then "which word is this" (apply)
     *  or "which option fits" (decide). */
    situation(s: TermSeed, k: number, ask: "word" | "option"): GlossaryQuestion {
      const pick = wordOptions(s, level.number + k);
      return {
        kind: "choice", type: "Fill in the Blank", id: q(k), termId: s.term, playOrder: k, label: ask === "word" ? "In the moment" : "Your call",
        scene: story(s.situation ?? s.example),
        prompt: ask === "word" ? "Which word is this?" : "Which option fits?",
        layout: "grid",
        options: pick.options, correctIndex: pick.correctIndex,
        feedbackCorrect: `${s.term}. ${s.definition}`,
        feedbackWrong: `That is ${s.term}: ${lower(s.definition)}${notThe(s)}`,
      };
    },
    /** The word beside the word it is mixed up with, each with its cue; the
     *  situation decides which one it is. */
    compare(s: TermSeed, k: number): GlossaryQuestion {
      const other = conf(s);
      const pick = wordOptions(s, level.number + k);
      return {
        kind: "choice", type: "Fill in the Blank", id: q(k), termId: s.term, playOrder: k, label: "Tell them apart",
        scene: { kind: "compare", title: `${s.term} or ${other.term}?`, options: [{ label: s.term, points: [s.cue] }, { label: other.term, points: [other.cue] }] },
        prompt: `${s.situation ?? s.example} Which one is that?`,
        layout: "grid",
        options: pick.options, correctIndex: pick.correctIndex,
        feedbackCorrect: `${s.term}: ${lower(s.cue)}. ${other.term} is ${lower(other.cue)}.`,
        feedbackWrong: `That is ${s.term}, ${lower(s.cue)}. ${other.term} would be ${lower(other.cue)}.`,
      };
    },
    /** Every line about one word: its cue and its situation, against the
     *  confusion's cue and another word's situation. */
    selectAll(s: TermSeed, k: number): GlossaryQuestion {
      const other = conf(s);
      const another = others(seeds, indexOf(s), 4).find((o) => o !== other) ?? other;
      const lines = [s.cue, s.situation ?? s.example, other.cue, another.situation ?? another.example];
      return {
        kind: "multiSelect", type: "Select All", id: q(k), termId: s.term, playOrder: k, label: "Select all",
        prompt: `Select every line about ${s.term}.`,
        options: lines, correct: [0, 1],
        feedbackCorrect: `Both lines show ${s.term}: ${lower(s.definition)}`,
        feedbackWrong: `${s.term} is ${lower(s.cue)}. "${other.cue}" is ${other.term}, and the other line is ${another.term}.`,
      };
    },
  };
}

/** The seven scored questions for one level, by its cognitive focus. */
function recipe(level: LevelSeed, seeds: TermSeed[], id: string): GlossaryQuestion[] {
  const kit = makeKit(seeds, level, id);
  const [t1, t2, t3, t4, t5] = seeds;
  switch (focusFor(level)) {
    case "recognize":
      return [kit.definition(t1, 1), kit.match(2, ["Word", "Example"]), kit.fill(t5, 3), kit.recall(t3, 4), kit.sort(5), kit.misuse(t4, 6), kit.type(t2, 7)];
    case "apply":
      return [kit.situation(t1, 1, "word"), kit.match(2, ["Word", "Example"]), kit.fill(t5, 3), kit.recall(t3, 4), kit.sort(5), kit.situation(t4, 6, "word"), kit.type(t2, 7, true)];
    case "analyze":
      return [kit.compare(t1, 1), kit.selectAll(t2, 2), kit.recall(t3, 3), kit.sort(4), kit.misuse(t4, 5), kit.situation(t5, 6, "word"), kit.type(t5, 7, true)];
    case "decide":
      return [kit.situation(t1, 1, "option"), kit.compare(t2, 2), kit.match(3, ["Word", "Use it when"]), kit.situation(t3, 4, "option"), kit.selectAll(t4, 5), kit.misuse(t5, 6), kit.type(t4, 7, true)];
  }
}

export function buildLesson(bp: GlossaryBlueprint, level: LevelSeed, previousValue: number): GlossaryLesson {
  const seeds = level.terms ?? [];
  const id = `${bp.idPrefix}-L${String(level.number).padStart(2, "0")}`;
  const terms = seeds.map((seed, i) => term(seed, i + 1));
  const names = seeds.map((s) => s.term);
  const questions = recipe(level, seeds, id);

  const reviewQuestions: GlossaryQuestion[] = seeds.map((s, i) => {
    const pick = place(s.term, others(seeds, i, 3).map((o) => o.term), level.number + i);
    return {
      kind: "choice", type: "Reverse Recall", id: `${id}-Q${8 + i}`, termId: s.term, playOrder: 8 + i,
      prompt: `${s.definition} That word is...`,
      options: pick.options, correctIndex: pick.correctIndex,
      feedbackCorrect: `Right, that is ${s.term}.`,
      feedbackWrong: `That describes ${s.term}. ${s.example}`,
    };
  });

  const paragraph = seeds.map((s, i) => blank(s.example, s.term, `{${i + 1}}`) ?? `{${i + 1}}: ${s.definition}`).join(" ");

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
    powerPlay: { intro: level.goal.replace(/\.$/, "") + ".", paragraph, answers: names.map((n) => n.toLowerCase()) },
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
    unlocks: level.unlocks,
    minutes: MINUTES[level.tier],
  }));
  return { industrySlug: industry.slug, industryTitle: industry.title, careerSlug: bp.exampleCareerSlug ?? industry.slug, careerTitle: industry.title, world: industry.world, subject: industry.subject, lessons, levels, chapters: bp.chapters };
}

const MODES: WorldMode[] = ["continuous_story", "scenario_thread", "practice_world"];
/** A dollar or percent sign, or a figure of two or more digits. Single
 *  digits in prose ("3 steps") pass; money and measures do not. */
const NUMBERS = /[$%]|\d\d/;

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
    if (level.terms.length !== 5) problems.push(`${where}: ${level.terms.length} terms, needs exactly 5`);
    const names = level.terms.map((t) => t.term.toLowerCase());
    if (new Set(names).size !== names.length) problems.push(`${where}: duplicate term names`);
    const cues = level.terms.map((t) => t.cue.toLowerCase());
    if (new Set(cues).size !== cues.length) problems.push(`${where}: duplicate cues (the match and sort cards need unique right sides)`);
    const defs = level.terms.map((t) => t.definition);
    if (new Set(defs).size !== defs.length) problems.push(`${where}: duplicate definitions`);
    for (const t of level.terms) {
      // Length limits are layout rules (16 Oct 2026, Chandu: "make sure there
      // are rules in place so words dont get clipped, wrap, layouts dont
      // break"): a term must fit a HUD token and a word tile, a cue a match
      // card, a definition a teach card at 24px, an example two lines of the
      // Power Play paragraph, a situation one scene line.
      if (t.term.length > LIMITS.term) problems.push(`${where}: term "${t.term}" is ${t.term.length} characters; the HUD tokens and word tiles hold ${LIMITS.term}`);
      if (t.cue.length > LIMITS.cue) problems.push(`${where}: cue for "${t.term}" is ${t.cue.length} characters; match and sort cards hold ${LIMITS.cue}`);
      if (words(t.cue) > WORD_LIMITS.cue) problems.push(`${where}: cue for "${t.term}" is ${words(t.cue)} words; an answer is ${WORD_LIMITS.cue} at most`);
      if (t.definition.length > LIMITS.definition) problems.push(`${where}: definition for "${t.term}" is ${t.definition.length} characters; the teach card and answer tiles hold ${LIMITS.definition}`);
      if (t.example.length > LIMITS.example) problems.push(`${where}: example for "${t.term}" is ${t.example.length} characters; the Power Play paragraph holds ${LIMITS.example} per sentence`);
      if (t.formula && t.formula.length > LIMITS.formula) problems.push(`${where}: formula for "${t.term}" is ${t.formula.length} characters; the worked line holds ${LIMITS.formula}`);
      if (!blank(t.example, t.term, "_")) problems.push(`${where}: the example for "${t.term}" never says the word, so it cannot become a blank`);
      if (anchored && !t.example.includes(bp.company)) problems.push(`${where}: the example for "${t.term}" does not name ${bp.company} (every example does in a ${bp.mode.replace("_", " ")})`);
      if (/—|–/.test(`${t.definition} ${t.example} ${t.cue} ${t.situation ?? ""}`)) problems.push(`${where}: "${t.term}" copy uses a dash; write it as two sentences`);
      // Answer leakage (SOP): the Reverse Recall question reads the
      // definition and asks for the word, so the definition cannot say it;
      // the situation is asked over, so neither can it.
      if (mentions(t.definition, t.term)) problems.push(`${where}: the definition of "${t.term}" says the word itself; the Which Word question would give it away`);
      if (t.situation) {
        if (t.situation.length > LIMITS.situation) problems.push(`${where}: situation for "${t.term}" is ${t.situation.length} characters; the scene card holds ${LIMITS.situation}`);
        if (words(t.situation) > WORD_LIMITS.situation) problems.push(`${where}: situation for "${t.term}" is ${words(t.situation)} words; a context line is ${WORD_LIMITS.situation} at most`);
        if (mentions(t.situation, t.term)) problems.push(`${where}: the situation for "${t.term}" says the word itself; it is the answer`);
      } else if (focus !== "recognize") {
        problems.push(`${where}: "${t.term}" has no situation; ${focus} levels ask over one`);
      }
      if (t.confusion) {
        if (!names.includes(t.confusion.toLowerCase())) problems.push(`${where}: "${t.term}" is confused with "${t.confusion}", which is not a word in this level`);
        if (t.confusion.toLowerCase() === t.term.toLowerCase()) problems.push(`${where}: "${t.term}" cannot be confused with itself`);
      } else if (focus === "analyze" || focus === "decide") {
        problems.push(`${where}: "${t.term}" has no confusion; ${focus} levels tell words apart`);
      }
      // No forced math (SOP Executive Rule 4): numbers only where the team
      // said this level's words naturally carry them.
      if (!level.math && (t.formula || NUMBERS.test(`${t.definition} ${t.example} ${t.cue} ${t.situation ?? ""}`))) {
        problems.push(`${where}: "${t.term}" uses numbers but the level does not set math: true; only set it when this job's words naturally use math`);
      }
    }
  }
  return problems;
}
