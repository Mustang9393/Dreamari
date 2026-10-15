// Glossary Game generator: a career's term list in, a playable glossary out.
//
// Why (16 Oct 2026, Chandu): "make sure the whole system is scaleable for any
// career. To be auto generated, including the games and levels." Level 1 of
// Investment Banking was hand-authored from the content template and every
// later level was hand-authored after it. That does not scale to 20 levels
// per career across the catalogue. This module turns a GlossaryBlueprint
// (five terms per level, each with a definition, an example sentence and a
// short cue) into the same GlossaryLesson shape the engine already plays,
// following Level 1's proven recipe question for question.
//
// What is generated, in Level 1's order:
//   1. Definition        (term 1)  which definition fits the word
//   2. Match It Up       (all 5)   word to its cue
//   3. Fill in the Blank (term 5)  the example with the word blanked
//   4. Reverse Recall    (term 3)  which word the definition names
//   5. Sort the Buckets  (1 to 4)  cues into their words
//   6. Catch the Misuse  (term 4)  three true "word = cue" pairs, one wrong
//   7. Type the Term     (term 2)  spell the word for its definition
// Every term is credited at least twice, so mastery (2) can be reached in
// the main queue. One Reverse Recall review question per term. The Power
// Play is one paragraph: the five examples with their words blanked.
// Facts come from the blueprint or a safe default. No pictures: generated
// careers teach with words, exactly like Levels 2+ (15 Oct 2026).
//
// Validation runs on every build and throws with a list of problems, so a
// bad blueprint fails at import time in development, not in a student's
// hands. Copy rules the content team must still follow: eighth grade,
// every example names the company, no em dashes.

import type { GlossaryCareer, GlossaryChapter, GlossaryLesson, GlossaryLevel, GlossaryQuestion, GlossaryTerm } from "./data";
import { type IndustryMeta, worldSystem } from "./industries";

export type TermSeed = {
  term: string;
  /** Eighth-grade level, one sentence. */
  definition: string;
  /** Must contain the term (any case) and name the company. */
  example: string;
  /** A short phrase that shows the word (the match card's right side, the
   *  sort item): "Pair of sneakers", "Heart rate and temperature". */
  cue: string;
  /** An optional worked line for the teach card ("10% of $1,000 = $100"). */
  formula?: string;
  /** TERM_ICON_MAP slug; optional, generated careers teach without pictures. */
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
  /** The career whose hub card and cover introduce this glossary. */
  exampleCareerSlug?: string;
  /** The one story every example ties back to ("Dream Sneakers"). */
  company: string;
  /** Lesson id prefix, globally unique ("FIN", "RN"). */
  idPrefix: string;
  levels: LevelSeed[];
  chapters: GlossaryChapter[];
};

const MINUTES: Record<GlossaryLevel["tier"], number> = { Beginner: 4, Intermediate: 5, Advanced: 6 };
/** Copy limits, in characters. Measured against the real slots at 375px and
 *  1280px: HUD token label (two lines of 9px), word tile, match card right
 *  side, teach card definition at 24px, one Power Play sentence. */
export const LIMITS = { term: 22, cue: 34, definition: 120, example: 150, formula: 28 } as const;
const DEFAULT_FACT = "Learning the words of a job is the first step to doing it. Say each one out loud once.";

/** The example with its term replaced by `mark` (first match, any case,
 *  whole word). Null when the example never names the term. */
function blank(example: string, term: string, mark: string): string | null {
  const pattern = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}s?\\b`, "i");
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

export function buildLesson(bp: GlossaryBlueprint, level: LevelSeed, previousValue: number): GlossaryLesson {
  const seeds = level.terms ?? [];
  const id = `${bp.idPrefix}-L${String(level.number).padStart(2, "0")}`;
  const q = (k: number) => `${id}-Q${k}`;
  const terms = seeds.map((seed, i) => term(seed, i + 1));
  const names = seeds.map((s) => s.term);
  const [t1, t2, t3, t4, t5] = seeds;

  const definition = place(t1.definition, others(seeds, 0, 3).map((s) => s.definition), level.number);
  const fill = place(t5.term, others(seeds, 4, 3).map((s) => s.term), level.number + 1);
  const recall = place(t3.term, others(seeds, 2, 3).map((s) => s.term), level.number + 2);
  const misusePairs = [t1, t2, t3].map((s) => `${s.term} = ${s.cue}`);
  const misuse = place(`${t4.term} = ${t2.cue}`, misusePairs, level.number + 3);

  const questions: GlossaryQuestion[] = [
    {
      kind: "choice", type: "Definition", id: q(1), termId: t1.term, playOrder: 1, label: "Definition",
      prompt: `What does "${t1.term}" mean?`,
      options: definition.options, correctIndex: definition.correctIndex,
      feedbackCorrect: `${t1.term}: ${t1.definition} ${t1.example}`,
      feedbackWrong: `${t1.definition} ${t1.example}`,
    },
    {
      kind: "matchUp", type: "Match It Up", id: q(2), playOrder: 2, label: "Match the terms", prompt: "Match each word to what shows it.",
      headers: ["Word", "Example"],
      pairs: seeds.map((s, i) => ({ order: i + 1, left: s.term, right: s.cue, termId: s.term, icon: s.icon })),
      feedbackCorrect: `All five matched: ${names.join(", ")}.`,
      feedbackWrong: "Read each example again and ask which word it shows.",
    },
    {
      kind: "choice", type: "Fill in the Blank", id: q(3), termId: t5.term, playOrder: 3, label: "Fill in the blank",
      prompt: "Which word fills the blank?",
      sentence: blank(t5.example, t5.term, "___") ?? `___: ${t5.definition}`,
      layout: "grid",
      options: fill.options, correctIndex: fill.correctIndex,
      feedbackCorrect: `${t5.term}: ${t5.definition}`,
      feedbackWrong: `${t5.definition} So the word is ${t5.term}.`,
    },
    {
      kind: "choice", type: "Reverse Recall", id: q(4), termId: t3.term, playOrder: 4, label: "Which word",
      prompt: `${t3.definition} Which word is that?`,
      options: recall.options, correctIndex: recall.correctIndex,
      feedbackCorrect: `${t3.term}: ${t3.definition}`,
      feedbackWrong: `That describes ${t3.term}. ${t3.example}`,
    },
    {
      kind: "sortBuckets", type: "Sort the Buckets", id: q(5), playOrder: 5, label: "Sort the buckets", prompt: "Sort each one.",
      buckets: [t1, t2, t3, t4].map((s) => s.term),
      items: [t3, t1, t4, t2].map((s, i) => ({ order: i + 1, text: s.cue, bucket: s.term, termId: s.term, icon: s.icon })),
      feedbackCorrect: "Every one sorted into its word.",
      feedbackWrong: "Ask of each one: which word does it show?",
    },
    {
      kind: "choice", type: "Catch the Misuse", id: q(6), termId: t4.term, playOrder: 6, label: "Quick check",
      prompt: "Which one is wrong?",
      options: misuse.options, correctIndex: misuse.correctIndex,
      feedbackCorrect: `Right: ${t4.term} is ${t4.cue.toLowerCase()}, not ${t2.cue.toLowerCase()}.`,
      feedbackWrong: `${t4.term} means ${t4.definition.charAt(0).toLowerCase()}${t4.definition.slice(1)} ${t2.cue} is ${t2.term}.`,
    },
    {
      kind: "typeTerm", type: "Type the Term", id: q(7), termId: t2.term, playOrder: 7, label: "Type the term",
      prompt: `Type the word: ${t2.definition}`,
      wordBank: names, answer: t2.term,
      feedbackCorrect: `${t2.term}: ${t2.definition}`,
      feedbackWrong: `The word is ${t2.term}. ${t2.example}`,
    },
  ];

  const reviewQuestions: GlossaryQuestion[] = seeds.map((s, i) => {
    const pick = place(s.term, others(seeds, i, 3).map((o) => o.term), level.number + i);
    return {
      kind: "choice", type: "Reverse Recall", id: q(8 + i), termId: s.term, playOrder: 8 + i,
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

/** Everything the engine needs for one career. Throws on a bad blueprint. */
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

/** The content intake checklist, as code. Empty list means playable. */
export function validateBlueprint(bp: GlossaryBlueprint): string[] {
  const problems: string[] = [];
  if (!worldSystem(bp.industry.world)) problems.push(`"${bp.industry.world}" is not a career world (industries.ts WORLD_SYSTEMS)`);
  if (!/^[a-z][a-z-]*$/.test(bp.industry.slug)) problems.push(`industry slug "${bp.industry.slug}" must be lowercase letters and dashes (it is a route)`);
  if (!bp.levels.length) problems.push("no levels");
  if (!bp.levels.some((l) => l.terms)) problems.push("no level has terms; nothing to play");
  const numbers = new Set<number>();
  for (const level of bp.levels) {
    if (numbers.has(level.number)) problems.push(`level ${level.number} is listed twice`);
    numbers.add(level.number);
    if (!level.terms) continue;
    const where = `level ${level.number} (${level.title})`;
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
      // Power Play paragraph.
      if (t.term.length > LIMITS.term) problems.push(`${where}: term "${t.term}" is ${t.term.length} characters; the HUD tokens and word tiles hold ${LIMITS.term}`);
      if (t.cue.length > LIMITS.cue) problems.push(`${where}: cue for "${t.term}" is ${t.cue.length} characters; match and sort cards hold ${LIMITS.cue}`);
      if (t.definition.length > LIMITS.definition) problems.push(`${where}: definition for "${t.term}" is ${t.definition.length} characters; the teach card and answer tiles hold ${LIMITS.definition}`);
      if (t.example.length > LIMITS.example) problems.push(`${where}: example for "${t.term}" is ${t.example.length} characters; the Power Play paragraph holds ${LIMITS.example} per sentence`);
      if (t.formula && t.formula.length > LIMITS.formula) problems.push(`${where}: formula for "${t.term}" is ${t.formula.length} characters; the worked line holds ${LIMITS.formula}`);
      if (!blank(t.example, t.term, "_")) problems.push(`${where}: the example for "${t.term}" never says the word, so it cannot become a blank`);
      if (!t.example.includes(bp.company)) problems.push(`${where}: the example for "${t.term}" does not name ${bp.company}`);
      if (/—|–/.test(`${t.definition} ${t.example} ${t.cue}`)) problems.push(`${where}: "${t.term}" copy uses a dash; write it as two sentences`);
    }
  }
  return problems;
}
