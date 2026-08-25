// Glossary Game content — authored from DreamAri_Glossary_Content_Template_v1.xlsx.
// That file is the content team's authoring template (Usman imports it); this
// module is the shape the game engine actually reads. Only Finance Lesson 1
// ("Dream Sneakers") has real, Live-status content today — it's the template's
// own worked example, transcribed verbatim (terms, questions, feedback copy,
// Power Play paragraph, facts) rather than paraphrased, since the wording is
// already tuned to eighth-grade level and ties every example back to the one
// company. Every other career/lesson is intentionally absent, not stubbed —
// `hasGlossary()` is how callers tell the difference between "no game yet"
// and "game with no content," matching the same real-data-vs-placeholder
// split the rest of the app already uses (career/data.ts's "Coming soon").

export type GlossaryTerm = {
  id: string;
  order: number;
  term: string;
  definition: string;
  example: string;
  icon: string;
  memoryTip?: string;
};

type BaseQuestion = {
  id: string;
  /** Which term this question credits toward mastery. Undefined only for
   *  Match It Up / Sort the Buckets, which tag credit per pair/item instead. */
  termId?: string;
  playOrder: number;
  prompt: string;
  feedbackCorrect: string;
  feedbackWrong: string;
};

export type ChoiceQuestion = BaseQuestion & {
  kind: "choice";
  type: "Definition" | "Reverse Recall" | "Fill in the Blank" | "Catch the Misuse";
  options: string[];
  correctIndex: number;
};

export type TypeTermQuestion = BaseQuestion & {
  kind: "typeTerm";
  type: "Type the Term";
  wordBank: string[];
  answer: string;
};

export type MatchPair = { order: number; left: string; right: string; termId: string };
export type MatchUpQuestion = BaseQuestion & {
  kind: "matchUp";
  type: "Match It Up";
  pairs: MatchPair[];
};

export type BucketItem = { order: number; text: string; bucket: string; termId: string };
export type SortBucketsQuestion = BaseQuestion & {
  kind: "sortBuckets";
  type: "Sort the Buckets";
  items: BucketItem[];
  buckets: string[];
};

export type ProfitStep = { order: number; label: string; answer: number };
export type ProfitBuilderQuestion = BaseQuestion & {
  kind: "profitBuilder";
  type: "Profit Builder";
  scenario: string;
  steps: ProfitStep[];
};

export type GlossaryQuestion = ChoiceQuestion | TypeTermQuestion | MatchUpQuestion | SortBucketsQuestion | ProfitBuilderQuestion;

export type PowerPlay = {
  /** {1} {2} ... mark the gaps. */
  paragraph: string;
  answers: string[];
};

export type GlossaryLesson = {
  id: string;
  lessonNumber: number;
  title: string;
  subtitle: string;
  milestone: string;
  exampleCompany: string;
  difficulty: string;
  estimatedMinutes: number;
  xpReward: number;
  companyValue: number;
  nextCompanyValue: number;
  nextMilestone: string;
  terms: GlossaryTerm[];
  /** Played in order, first. */
  questions: GlossaryQuestion[];
  /** Held back as remediation: only drawn if a term hasn't reached mastery
   *  after the main queue (README: "if the student gets one wrong the review
   *  round needs a different question to ask"). */
  reviewQuestions: GlossaryQuestion[];
  powerPlay: PowerPlay;
  facts: string[];
};

export type GlossaryCareer = {
  careerSlug: string;
  careerTitle: string;
  world: string;
  lessons: GlossaryLesson[];
};

// Icon is a semantic slug (matching the xlsx's plain-word Icon column --
// "building", "sneaker", "palette", "shopping bags", "money bag" -- not a
// literal emoji), resolved to a real icon component from the design system
// in the UI layer (ICON_MAP in GlossaryGameExperience.tsx). Content authors
// pick the slug; the app owns what it looks like.
const FIN_L01_TERMS: GlossaryTerm[] = [
  { id: "Company", order: 1, term: "Company", definition: "A company sells products or services to make money.", example: "Dream Sneakers is a company that makes and sells sneakers.", icon: "building", memoryTip: undefined },
  { id: "Product", order: 2, term: "Product", definition: "A product is something a company makes and sells.", example: "Your sneakers are the product that customers buy.", icon: "sneaker", memoryTip: "Product = something you can hold." },
  { id: "Service", order: 3, term: "Service", definition: "A service is work done for a customer, not a physical item.", example: "Custom sneaker design is a service Dream Sneakers offers.", icon: "palette", memoryTip: "Service = someone does something for you." },
  { id: "Customer", order: 4, term: "Customer", definition: "A customer buys what a company sells.", example: "A person buying your sneakers is a customer.", icon: "shopping-bag" },
  { id: "Profit", order: 5, term: "Profit", definition: "Profit is money left after a company pays all its costs.", example: "If Dream Sneakers earns $200K and spends $120K, profit is $80K.", icon: "money-bag", memoryTip: "Profit = what is left in your pocket." },
];

const FIN_L01_QUESTIONS: GlossaryQuestion[] = [
  {
    kind: "choice",
    type: "Definition",
    id: "FIN-L01-Q1",
    termId: "Company",
    playOrder: 1,
    prompt: "What is a company?",
    options: ["A government office that sets prices", "An organization that sells products or services to make money", "A savings account you open at a bank", "A school that teaches business skills"],
    correctIndex: 1,
    feedbackCorrect: "Dream Sneakers is a company - it sells sneakers and earns money from those sales.",
    feedbackWrong: "A company sells things to make money. A bank account, a school and a government office all do something else.",
  },
  {
    kind: "typeTerm",
    type: "Type the Term",
    id: "FIN-L01-Q2",
    termId: "Profit",
    playOrder: 2,
    prompt: "Dream Sneakers spends $10 to make a sneaker and sells it for $200. The $190 left over is called ______.",
    wordBank: ["Company", "Product", "Service", "Customer", "Profit"],
    answer: "profit",
    feedbackCorrect: "Exactly right - $200 in, $10 out, $190 profit.",
    feedbackWrong: "Profit = Revenue - Costs. Dream Sneakers earns $200 and spends $10, leaving $190 in profit.",
  },
  {
    kind: "choice",
    type: "Fill in the Blank",
    id: "FIN-L01-Q3",
    termId: "Service",
    playOrder: 3,
    prompt: "Dream Sneakers lets customers design their own shoes online. That is a ______ because it is work done for the customer.",
    options: ["company", "profit", "product", "service"],
    correctIndex: 3,
    feedbackCorrect: "A service is work done for you - not a physical item you hold.",
    feedbackWrong: "A service is work done for a customer. The sneaker itself is the product; designing it for them is the service.",
  },
  {
    kind: "matchUp",
    type: "Match It Up",
    id: "FIN-L01-Q4",
    playOrder: 4,
    prompt: "Match each term to its example.",
    pairs: [
      { order: 1, left: "Company", right: "Dream Sneakers", termId: "Company" },
      { order: 2, left: "Product", right: "Sneakers", termId: "Product" },
      { order: 3, left: "Customer", right: "Person buying shoes", termId: "Customer" },
      { order: 4, left: "Profit", right: "Money left after costs", termId: "Profit" },
    ],
    feedbackCorrect: "A company sells things. A product is what they sell.",
    feedbackWrong: "Look again at what each word points to - one is the business, one is the thing it sells, one is the person buying.",
  },
  {
    kind: "choice",
    type: "Catch the Misuse",
    id: "FIN-L01-Q5",
    termId: "Customer",
    playOrder: 5,
    prompt: "One sentence uses a business term incorrectly. Tap it.",
    options: ["A customer buys Dream Sneakers online.", "Dream Sneakers sells sneakers as its product.", "The sneaker is the customer.", "Profit is money left after costs."],
    correctIndex: 2,
    feedbackCorrect: "The customer is the person buying the sneaker. The sneaker is the product, not the customer.",
    feedbackWrong: "A customer is always a person or a business that buys. A sneaker cannot be a customer - it is what gets bought.",
  },
  {
    kind: "sortBuckets",
    type: "Sort the Buckets",
    id: "FIN-L01-Q6",
    playOrder: 6,
    prompt: "Sort each item into the right bucket.",
    buckets: ["Product", "Service", "Customer", "Company"],
    items: [
      { order: 1, text: "Pair of sneakers", bucket: "Product", termId: "Product" },
      { order: 2, text: "Custom sneaker design", bucket: "Service", termId: "Service" },
      { order: 3, text: "Person buying shoes", bucket: "Customer", termId: "Customer" },
      { order: 4, text: "Dream Sneakers itself", bucket: "Company", termId: "Company" },
    ],
    feedbackCorrect: "Every business splits into what it sells, what it does for people, who buys, and what it spends.",
    feedbackWrong: "Check each one again - ask yourself whether it is a thing, a job done for someone, a person, or money going out.",
  },
  {
    kind: "profitBuilder",
    type: "Profit Builder",
    id: "FIN-L01-Q7",
    termId: "Profit",
    playOrder: 7,
    prompt: "Profit Builder",
    scenario: "Dream Sneakers sells 500 pairs at $200 each. Costs are $60,000.",
    steps: [
      { order: 1, label: "Revenue: 500 × $200 =", answer: 100000 },
      { order: 2, label: "Profit: Revenue − $60,000 =", answer: 40000 },
    ],
    feedbackCorrect: "Revenue is everything that comes in: 500 x $200 = $100,000. Profit is what is left after costs: $100,000 - $60,000 = $40,000.",
    feedbackWrong: "Revenue is everything that comes in: 500 x $200 = $100,000. Profit is what is left after costs: $100,000 - $60,000 = $40,000.",
  },
];

const FIN_L01_REVIEW: GlossaryQuestion[] = [
  {
    kind: "choice",
    type: "Reverse Recall",
    id: "FIN-L01-Q8",
    termId: "Company",
    playOrder: 8,
    prompt: "An organization that sells products or services to make money is called a...",
    options: ["Company", "Customer", "Product", "Service"],
    correctIndex: 0,
    feedbackCorrect: "Right - that is the definition of a company.",
    feedbackWrong: "That describes a company. A customer buys, a product is sold, a service is work done.",
  },
];

const FIN_LESSON_1: GlossaryLesson = {
  id: "FIN-L01",
  lessonNumber: 1,
  title: "Business Basics",
  subtitle: "Company · Product · Service · Customer · Profit",
  milestone: "Launch Dream Sneakers",
  exampleCompany: "Dream Sneakers",
  difficulty: "Beginner",
  estimatedMinutes: 4,
  xpReward: 20,
  companyValue: 10000,
  nextCompanyValue: 50000,
  nextMilestone: "Meet your first investor",
  terms: FIN_L01_TERMS,
  questions: FIN_L01_QUESTIONS,
  reviewQuestions: FIN_L01_REVIEW,
  powerPlay: {
    paragraph:
      "Dream Sneakers is a {1} built to sell a great {2}: custom sneakers. We offer custom design as a {3} for every {4} who orders. Once costs are paid, the money left is {5}.",
    answers: ["company", "product", "service", "customer", "profit"],
  },
  facts: [
    "The sneaker industry sells over 25 billion pairs of shoes a year - that is three pairs for every person on Earth.",
    "Most new companies do not make a profit in their first year. Spending more than you earn at the start is normal.",
  ],
};

const GLOSSARY_CAREERS: Record<string, GlossaryCareer> = {
  "investment-banking": {
    careerSlug: "investment-banking",
    careerTitle: "Investment Banking",
    world: "Business & Money",
    lessons: [FIN_LESSON_1],
  },
};

export function hasGlossary(slug: string): boolean {
  return slug in GLOSSARY_CAREERS;
}

export function glossaryFor(slug: string): GlossaryCareer | null {
  return GLOSSARY_CAREERS[slug] ?? null;
}
