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
  /** Small uppercase label at the top of the card ("Definition", "Quick check"). */
  label?: string;
  prompt: string;
  feedbackCorrect: string;
  feedbackWrong: string;
};

export type ChoiceQuestion = BaseQuestion & {
  kind: "choice";
  type: "Definition" | "Reverse Recall" | "Fill in the Blank" | "Catch the Misuse";
  options: string[];
  correctIndex: number;
  /** A term icon per option (TERM_ICON_MAP key), shown in place of the letter. */
  optionIcons?: string[];
  /** "grid": two columns of short answers (single words). */
  layout?: "grid";
  /** A visual card above the prompt, e.g. sells-for / costs / left. */
  visual?: { kind: "profit"; title: string; sells: number; costs: number };
};

export type TypeTermQuestion = BaseQuestion & {
  kind: "typeTerm";
  type: "Type the Term";
  wordBank: string[];
  answer: string;
};

export type MatchPair = { order: number; left: string; right: string; termId: string; icon?: string };
export type MatchUpQuestion = BaseQuestion & {
  kind: "matchUp";
  type: "Match It Up";
  pairs: MatchPair[];
  /** Column headers, left then right (default Term / Example). */
  headers?: [string, string];
};

export type BucketItem = { order: number; text: string; bucket: string; termId: string; icon?: string };
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
  /** Units x price -> revenue header, with the costs strip under it. */
  visual?: { units: number; unitLabel: string; price: number; costs: number };
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

/** One level on the game's full path, authored or not. Shown in the
 *  Levels panel so the depth is visible at a glance (Joshua, Slack, 27
 *  Sept 2026: "make it immediately clear that the game goes much deeper
 *  than the current beginner terms... see the names of the upcoming
 *  levels, even if those levels are still locked"). A level with a
 *  matching `lessons` entry is playable; the rest are the roadmap. */
export type GlossaryLevel = {
  number: number;
  title: string;
  tier: "Beginner" | "Intermediate" | "Advanced";
  words: string[];
  goal: string;
  /** the company value this level unlocks */
  unlocks: string;
  minutes: number;
};

/** Levels are grouped into chapters of the example company's story; the
 *  tier becomes the chapter's difficulty, shown as the signal-bars icon lit
 *  1/2/3 bars (27 Sept 2026, Chandu: "have it be chapters instead of
 *  difficulty level and the difficulty be a signal for the chapters"). */
export type GlossaryChapter = { number: number; name: string; tier: GlossaryLevel["tier"] };

export type GlossaryCareer = {
  careerSlug: string;
  careerTitle: string;
  world: string;
  lessons: GlossaryLesson[];
  levels: GlossaryLevel[];
  chapters: GlossaryChapter[];
};

// Investment Banking's path, transcribed from Joshua's lesson-list
// screenshot (Slack, 27 Sept 2026). His header says 20 lessons; the
// screenshot shows the first 17, so 18-20 are still to be named.
// Minutes by tier, as the screenshot shows them: 4 / 5 / 6.
const MINUTES: Record<GlossaryLevel["tier"], number> = { Beginner: 4, Intermediate: 5, Advanced: 6 };
const lvl = (number: number, tier: GlossaryLevel["tier"], title: string, words: string, goal: string, unlocks: string): GlossaryLevel => ({ number, tier, title, words: words.split(" · "), goal, unlocks, minutes: MINUTES[tier] });
const IB_LEVELS: GlossaryLevel[] = [
  lvl(1, "Beginner", "Business Basics", "Company · Product · Service · Customer · Profit", "Launch Dream Sneakers", "$10K"),
  lvl(2, "Beginner", "Investing Basics", "Investor · Capital · Risk · Return · Ownership", "Meet your first investor", "$50K"),
  lvl(3, "Beginner", "Money In, Money Out", "Revenue · Cost · Profit · Margin · Loss", "Review your first sales report", "$120K"),
  lvl(4, "Beginner", "Ways to Invest", "Stock · Bond · Shareholder · Lender · Interest", "Choose how to raise money", "$250K"),
  lvl(5, "Beginner", "Deal Basics", "Deal · Client · Pitch · Mandate · Advisor", "Prepare your first funding pitch", "$500K"),
  lvl(6, "Beginner", "Banking Team Roles", "Analyst · Associate · VP · Director · Managing Director", "Build your finance team", "$1M"),
  lvl(7, "Intermediate", "IPO Basics", "IPO · Underwriter · Prospectus · Roadshow · Listing", "Learn the path to going public", "$3M"),
  lvl(8, "Intermediate", "Mergers & Acquisitions", "Merger · Acquisition · Target · Acquirer · Due Diligence", "Explore buying a smaller sneaker brand", "$5M"),
  lvl(9, "Intermediate", "Equity vs. Debt", "Equity · Debt · Dilution · Repayment · Collateral", "Choose your growth funding path", "$10M"),
  lvl(10, "Intermediate", "Pitch Decks & Financial Models", "Pitch Deck · Financial Model · Assumptions · Forecast · Sensitivity", "Build your investor deck", "$25M"),
  lvl(11, "Intermediate", "EBITDA & Operating Performance", "EBITDA · Depreciation · Amortization · Operating Performance · Earnings", "Prove the business is performing", "$50M"),
  lvl(12, "Intermediate", "Valuation Basics", "Valuation · Multiple · Comparable Company · Market Value · Enterprise Value", "Find out what Dream Sneakers is worth", "$100M"),
  lvl(13, "Intermediate", "Enterprise Value", "Enterprise Value · Equity Value · Debt · Cash · Purchase Price", "Understand the full price of the company", "$250M"),
  lvl(14, "Intermediate", "Cash Flow and Leverage", "Cash Flow · Free Cash Flow · Leverage · Debt Burden · Interest Expense", "Manage money and debt responsibly", "$500M"),
  lvl(15, "Advanced", "Public Offerings and Dilution", "Public Offering · Dilution · New Shares · Existing Shareholders · Capital Raise", "Raise major growth capital", "$1B"),
  lvl(16, "Advanced", "Discounted Cash Flow", "DCF · Future Cash Flow · Discount Rate · Present Value · Terminal Value", "Value future growth", "$3B"),
  lvl(17, "Advanced", "Buy-Side vs. Sell-Side", "Buy-Side · Sell-Side · Investment Bank · Hedge Fund · Private Equity", "Choose your role in a major deal", "$5B"),
];

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

// Joshua's reworked order (28 Sept 2026, from his Replit and a Duolingo
// comparison): one definition, then five visual, interactive formats that
// all reuse the same five terms, ending on the profit math. "Make the game
// feel more visual, interactive, and enjoyable while also strengthening
// learning." Icons stand in for his 3D term pictures (not imported).
const FIN_L01_QUESTIONS: GlossaryQuestion[] = [
  {
    kind: "choice",
    type: "Definition",
    id: "FIN-L01-Q1",
    termId: "Company",
    playOrder: 1,
    label: "Definition",
    prompt: "What is a company?",
    options: ["A business that sells products or services", "A person shopping", "When someone comes to your house to visit", "A class about business"],
    correctIndex: 0,
    feedbackCorrect: "Dream Sneakers is a company: it sells sneakers and earns money from those sales.",
    feedbackWrong: "A company is a business that sells products or services. A shopper is a customer, and a class or a visit is something else.",
  },
  {
    kind: "matchUp",
    type: "Match It Up",
    id: "FIN-L01-Q2",
    playOrder: 2,
    label: "Match the terms",
    prompt: "",
    headers: ["Concept", "Visual"],
    pairs: [
      { order: 1, left: "Company", right: "Dream Sneakers", termId: "Company", icon: "building" },
      { order: 2, left: "Product", right: "Pair of sneakers", termId: "Product", icon: "sneaker" },
      { order: 3, left: "Service", right: "Custom sneaker design", termId: "Service", icon: "palette" },
      { order: 4, left: "Customer", right: "Person buying sneakers", termId: "Customer", icon: "shopping-bag" },
      { order: 5, left: "Profit", right: "Money left after costs", termId: "Profit", icon: "money-bag" },
    ],
    feedbackCorrect: "The company makes the product, offers the service, sells to the customer and keeps the profit.",
    feedbackWrong: "Look at what each picture shows: the business, the thing it sells, the work it does, the buyer, and the money left over.",
  },
  {
    kind: "choice",
    type: "Fill in the Blank",
    id: "FIN-L01-Q3",
    termId: "Profit",
    playOrder: 3,
    prompt: "What's the $190 called?",
    visual: { kind: "profit", title: "Dream Sneakers", sells: 200, costs: 10 },
    layout: "grid",
    options: ["Company", "Product", "Service", "Profit", "Customer"],
    correctIndex: 3,
    feedbackCorrect: "Exactly: $200 in, $10 out, $190 profit.",
    feedbackWrong: "Profit is the money left after costs: $200 - $10 = $190.",
  },
  {
    kind: "choice",
    type: "Definition",
    id: "FIN-L01-Q4",
    termId: "Service",
    playOrder: 4,
    label: "Real-world scenario",
    prompt: "Custom sneaker design is work done for a customer. What is it?",
    options: ["Product", "Service", "Customer"],
    correctIndex: 1,
    feedbackCorrect: "A service is work done for you, not a physical item you hold.",
    feedbackWrong: "Work done for a customer is a service. The sneaker itself is the product.",
  },
  {
    kind: "sortBuckets",
    type: "Sort the Buckets",
    id: "FIN-L01-Q5",
    playOrder: 5,
    label: "Sort the buckets",
    prompt: "Sort each one.",
    buckets: ["Product", "Service", "Customer", "Company"],
    items: [
      { order: 1, text: "Person buying shoes", bucket: "Customer", termId: "Customer", icon: "shopping-bag" },
      { order: 2, text: "Pair of sneakers", bucket: "Product", termId: "Product", icon: "sneaker" },
      { order: 3, text: "Custom sneaker design", bucket: "Service", termId: "Service", icon: "palette" },
      { order: 4, text: "Dream Sneakers", bucket: "Company", termId: "Company", icon: "building" },
    ],
    feedbackCorrect: "A thing you buy, a job done for you, the buyer, and the business: every one sorted.",
    feedbackWrong: "Ask of each one: is it a thing, work done for someone, a person, or the business itself?",
  },
  {
    kind: "choice",
    type: "Catch the Misuse",
    id: "FIN-L01-Q6",
    termId: "Customer",
    playOrder: 6,
    label: "Quick check",
    prompt: "Which one is wrong?",
    options: ["Customer = buyer", "Product = sneaker", "Company = Dream Sneakers", "Customer = sneaker"],
    optionIcons: ["shopping-bag", "sneaker", "building", "sneaker"],
    correctIndex: 3,
    feedbackCorrect: "Right: the customer is the person buying. The sneaker is the product.",
    feedbackWrong: "A customer is always the buyer. A sneaker can't be a customer; it's what gets bought.",
  },
  {
    kind: "profitBuilder",
    type: "Profit Builder",
    id: "FIN-L01-Q7",
    termId: "Profit",
    playOrder: 7,
    label: "Profit builder",
    prompt: "Find the revenue, then the profit.",
    scenario: "Dream Sneakers sells 500 pairs at $200 each. Costs are $60,000.",
    visual: { units: 500, unitLabel: "Sneakers", price: 200, costs: 60000 },
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
    world: "Business & Finance",
    lessons: [FIN_LESSON_1],
    levels: IB_LEVELS,
    // Chapter names are placeholders (ours, not the Replit's), drawn from
    // the levels' own goals: launching the company, growing it, then the
    // billion-dollar deals. Joshua to confirm or rename.
    chapters: [
      { number: 1, name: "The Startup", tier: "Beginner" },
      { number: 2, name: "Scaling Up", tier: "Intermediate" },
      { number: 3, name: "The Big Leagues", tier: "Advanced" },
    ],
  },
};

export function hasGlossary(slug: string): boolean {
  return slug in GLOSSARY_CAREERS;
}

export function glossaryFor(slug: string): GlossaryCareer | null {
  return GLOSSARY_CAREERS[slug] ?? null;
}
