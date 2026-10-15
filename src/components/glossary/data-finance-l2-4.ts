// Investment Banking Levels 2 to 4, ported from Joshua's Replit reference
// (https://dceeai.replit.app/ib-glossary-game, walked end to end on 13 Oct
// 2026; full inventory in docs/reference/glossary-levels-2-4-review.md).
//
// Faithful to the Replit's terms, prompts, options, answers and feedback,
// with these deliberate changes (all listed in the review doc):
// - Every question states its question. The Replit's placeholder "Choose an
//   answer." is replaced by the question its options answer.
// - Wrong-answer feedback explains the answer; the Replit printed "Correct."
//   in front of wrong answers.
// - Three-option choices get a fourth option so the 2x2 stays even (Chandu,
//   9 Oct 2026: "keep choices even and symmetric").
// - Level 2 gets teach cards like Levels 3 and 4 (the Replit has none for
//   it); their examples are ours, written from the lesson's own story.
// - Review questions (one per term) are ours; the Replit's had no question.
// - Level 4's Power Play Stock path mirrors its Bond path (not walked).
// - 8th-grade reading level, no em dashes.
//
// Icons are semantic slugs resolved to the design system's line icons in
// GlossaryLabGameExperience.tsx (TERM_ICON_MAP). Terms use supporting term
// art only when a career-scoped illustration helps the meaning. The Oct 13
// asset pass is independent of this content file (termArt.ts); scene cards
// still draw the exact numbers instead of baking answers into pictures.

import type { GlossaryLesson, GlossaryQuestion, GlossaryTerm } from "./data";

// ---------------------------------------------------------------- Level 2

const L02_TERMS: GlossaryTerm[] = [
  { id: "Investor", order: 1, term: "Investor", definition: "A person or group that puts money into a business.", example: "Maya puts $25,000 into Dream Sneakers. She is an investor.", icon: "hand-coins" },
  { id: "Capital", order: 2, term: "Capital", definition: "Money a business uses to grow.", example: "Maya's $25,000 becomes capital to open Store #2.", icon: "piggy-bank" },
  { id: "Risk", order: 3, term: "Risk", definition: "The chance of losing money.", example: "If Store #2 fails, Maya could lose some of her money.", icon: "alert" },
  { id: "Return", order: 4, term: "Return", definition: "What an investor gains.", example: "Maya's $25,000 grows to $30,000. Her return is $5,000.", icon: "trending-up", formula: "$30,000 − $25,000 = $5,000" },
  { id: "Ownership", order: 5, term: "Ownership", definition: "The part of a company you own.", example: "Maya gets 2 of 10 shares, so she owns 20% of Dream Sneakers.", icon: "pie-chart", formula: "2 of 10 shares = 20%" },
];

const L02_QUESTIONS: GlossaryQuestion[] = [
  {
    kind: "choice",
    type: "Definition",
    id: "FIN-L02-Q1",
    termId: "Investor",
    playOrder: 1,
    scene: { kind: "story", text: "Dream Sneakers wants to open Store #2." },
    prompt: "Maya puts $25,000 into Dream Sneakers to help it grow. What is Maya?",
    options: ["Investor", "Customer", "Supplier", "Employee"],
    correctIndex: 0,
    feedbackCorrect: "An investor puts money into a company.",
    feedbackWrong: "Maya is not buying sneakers or working there. She puts money in to help it grow, so she is an investor.",
  },
  {
    kind: "choice",
    type: "Fill in the Blank",
    id: "FIN-L02-Q2",
    termId: "Capital",
    playOrder: 2,
    scene: { kind: "story", text: "Maya invests $25,000." },
    prompt: "Which word fills the blank?",
    sentence: "The $25,000 becomes ___ for Dream Sneakers.",
    options: ["Capital", "Return", "Ownership", "Risk"],
    correctIndex: 0,
    feedbackCorrect: "Capital is money a business uses to grow.",
    feedbackWrong: "Money a business uses to grow is capital. Return is what Maya might gain later.",
  },
  {
    kind: "choice",
    type: "Definition",
    id: "FIN-L02-Q3",
    termId: "Risk",
    playOrder: 3,
    scene: { kind: "story", text: "The new store could succeed or fail." },
    prompt: "Maya could lose some of her money. What is this?",
    options: ["Capital", "Risk", "Return", "Ownership"],
    correctIndex: 1,
    feedbackCorrect: "Risk is the chance of losing money.",
    feedbackWrong: "The chance of losing money is risk. Maya could lose some if the store fails.",
  },
  {
    kind: "choice",
    type: "Definition",
    id: "FIN-L02-Q4",
    termId: "Return",
    playOrder: 4,
    scene: { kind: "figures", items: [{ label: "Maya invests", value: "$25,000" }, { label: "It becomes", value: "$30,000" }], ops: ["→"] },
    prompt: "What is Maya's return?",
    options: ["$25,000", "$30,000", "$5,000", "$55,000"],
    correctIndex: 2,
    feedbackCorrect: "$30,000 minus $25,000 is $5,000. That gain is her return.",
    feedbackWrong: "Return is the gain: $30,000 minus $25,000 is $5,000.",
  },
  {
    kind: "choice",
    type: "Definition",
    id: "FIN-L02-Q5",
    termId: "Ownership",
    playOrder: 5,
    scene: { kind: "shares", total: 10, owned: 2, label: "10 equal shares", note: "Dream Sneakers has 10 equal shares. Maya gets 2.", result: "2 of 10 shares = 20%" },
    prompt: "What percent of Dream Sneakers does Maya own?",
    options: ["50%", "10%", "20%", "80%"],
    correctIndex: 2,
    feedbackCorrect: "2 of 10 shares is 20% ownership. Maya now owns 20% of Dream Sneakers.",
    feedbackWrong: "Count the shares: 2 out of 10 is 20%.",
  },
  {
    kind: "matchUp",
    type: "Match It Up",
    id: "FIN-L02-Q6",
    playOrder: 6,
    label: "Match the terms",
    prompt: "Match each term to its meaning.",
    headers: ["Term", "Meaning"],
    pairs: [
      { order: 1, left: "Investor", right: "Puts money into a company", termId: "Investor" },
      { order: 2, left: "Capital", right: "Money used to grow", termId: "Capital" },
      { order: 3, left: "Risk", right: "Chance of losing money", termId: "Risk" },
      { order: 4, left: "Return", right: "What an investor gains", termId: "Return" },
      { order: 5, left: "Ownership", right: "Part of a company", termId: "Ownership" },
    ],
    feedbackCorrect: "Perfect. You know the language of an investment.",
    feedbackWrong: "Say each pair out loud. An investor puts money in. Capital is that money. Risk is the chance to lose it. Return is the gain. Ownership is your part.",
  },
  {
    kind: "choice",
    type: "Catch the Misuse",
    id: "FIN-L02-Q7",
    termId: "Ownership",
    playOrder: 7,
    label: "Quick check",
    prompt: "Which one is wrong?",
    options: ["Risk = chance of losing money", "Ownership = money used to grow", "Investor = puts money into a company", "Capital = money used to grow"],
    correctIndex: 1,
    feedbackCorrect: "Right. Ownership means part of a company.",
    feedbackWrong: "Ownership is not money used to grow. That is capital. Ownership means part of a company.",
  },
];

const L02_REVIEW: GlossaryQuestion[] = [
  { kind: "choice", type: "Reverse Recall", id: "FIN-L02-R1", termId: "Investor", playOrder: 8, prompt: "A person or group that puts money into a business is called...", options: ["An investor", "A customer", "An employee", "A supplier"], correctIndex: 0, feedbackCorrect: "Right. That is an investor.", feedbackWrong: "Someone who puts money into a business is an investor." },
  { kind: "choice", type: "Reverse Recall", id: "FIN-L02-R2", termId: "Capital", playOrder: 9, prompt: "Money a business uses to grow is called...", options: ["Capital", "Return", "Risk", "Ownership"], correctIndex: 0, feedbackCorrect: "Right. That is capital.", feedbackWrong: "Money a business uses to grow is capital." },
  { kind: "choice", type: "Reverse Recall", id: "FIN-L02-R3", termId: "Risk", playOrder: 10, prompt: "The chance of losing money is called...", options: ["Risk", "Return", "Capital", "Ownership"], correctIndex: 0, feedbackCorrect: "Right. That is risk.", feedbackWrong: "The chance of losing money is risk." },
  { kind: "choice", type: "Reverse Recall", id: "FIN-L02-R4", termId: "Return", playOrder: 11, prompt: "What an investor gains is called the...", options: ["Return", "Risk", "Capital", "Ownership"], correctIndex: 0, feedbackCorrect: "Right. That is the return.", feedbackWrong: "What an investor gains is the return." },
  { kind: "choice", type: "Reverse Recall", id: "FIN-L02-R5", termId: "Ownership", playOrder: 12, prompt: "The part of a company you own is called...", options: ["Ownership", "Capital", "Return", "Risk"], correctIndex: 0, feedbackCorrect: "Right. That is ownership.", feedbackWrong: "The part of a company you own is your ownership." },
];

export const FIN_LESSON_2: GlossaryLesson = {
  id: "FIN-L02",
  lessonNumber: 2,
  title: "Investing Basics",
  subtitle: "Investor · Capital · Risk · Return · Ownership",
  milestone: "Open a second store",
  exampleCompany: "Dream Sneakers",
  difficulty: "Beginner",
  estimatedMinutes: 4,
  xpReward: 20,
  previousCompanyValue: 10000,
  companyValue: 50000,
  nextCompanyValue: 120000,
  nextMilestone: "Review your first sales report",
  intro: { headline: "Dream Sneakers Wants to Grow", line: "Maya is thinking about putting money into the company.", hook: "Let's find out who Maya is in this story." },
  terms: L02_TERMS,
  questions: L02_QUESTIONS,
  reviewQuestions: L02_REVIEW,
  powerPlay: {
    intro: "Complete the deal.",
    paragraph: "Maya is an {1} in Dream Sneakers. Her $25,000 becomes {2} for the company. She takes on {3} for a possible {4}. In exchange, she gets 20% {5}.",
    answers: ["investor", "capital", "risk", "return", "ownership"],
  },
  facts: [
    "Many new businesses get their first money from the founder's savings, family or friends before any outside investor joins.",
    "An investor in a young company hopes it grows, so the part they own is worth more later.",
  ],
};

// ---------------------------------------------------------------- Level 3

const L03_TERMS: GlossaryTerm[] = [
  { id: "Revenue", order: 1, term: "Revenue", definition: "All the money a business earns from sales.", example: "Dream Sneakers earns revenue every time someone buys sneakers.", icon: "banknote", formula: "500 pairs × $200 = $100,000" },
  { id: "Cost", order: 2, term: "Cost", definition: "Money a business spends.", example: "Materials, rent and wages are costs for Dream Sneakers.", icon: "receipt" },
  { id: "Cash Flow", order: 3, term: "Cash Flow", definition: "Money moving in and out of a business.", example: "Sneaker sales bring money in. Rent and wages send money out.", icon: "arrow-left-right" },
  { id: "Margin", order: 4, term: "Margin", definition: "How much of each sale is kept after costs.", example: "If Dream Sneakers keeps $40 of a $100 sale, its margin is 40%.", icon: "percent", formula: "$40 kept of $100 = 40%" },
  { id: "Loss", order: 5, term: "Loss", definition: "When a business spends more than it earns.", example: "Dream Sneakers has a loss when its costs are bigger than its sales.", icon: "trending-down", formula: "$30,000 in, $40,000 out = $10,000 loss" },
];

const L03_QUESTIONS: GlossaryQuestion[] = [
  {
    kind: "choice",
    type: "Definition",
    id: "FIN-L03-Q1",
    termId: "Revenue",
    playOrder: 1,
    scene: { kind: "figures", items: [{ label: "Sneakers sold", value: "500" }, { label: "Price each", value: "$200" }, { label: "From sales", value: "$100,000" }], ops: ["×", "="], highlightLast: true },
    prompt: "What is the $100,000 called?",
    options: ["Revenue", "Cost", "Loss", "Capital"],
    correctIndex: 0,
    feedbackCorrect: "Revenue is the money from sales.",
    feedbackWrong: "Money that comes in from sales is revenue.",
  },
  {
    kind: "sortBuckets",
    type: "Sort the Buckets",
    id: "FIN-L03-Q2",
    playOrder: 2,
    label: "Money in or out",
    prompt: "Is each one money in or money out?",
    buckets: ["Money in", "Money out"],
    items: [
      { order: 1, text: "Sneaker sales", bucket: "Money in", termId: "Cash Flow" },
      { order: 2, text: "Store rent", bucket: "Money out", termId: "Cash Flow" },
      { order: 3, text: "Online orders", bucket: "Money in", termId: "Cash Flow" },
      { order: 4, text: "Employee wages", bucket: "Money out", termId: "Cash Flow" },
      { order: 5, text: "Materials", bucket: "Money out", termId: "Cash Flow" },
    ],
    feedbackCorrect: "Sales and orders bring money in. Rent, wages and materials send it out. That movement is cash flow.",
    feedbackWrong: "Ask of each one: does Dream Sneakers get this money, or pay it? Getting it is money in.",
  },
  {
    kind: "multiSelect",
    type: "Select All",
    id: "FIN-L03-Q3",
    termId: "Cost",
    playOrder: 3,
    scene: { kind: "story", text: "Dream Sneakers' first monthly report." },
    prompt: "Select every cost.",
    options: ["Materials · $10,000", "Rent · $5,000", "Wages · $15,000", "Sales · $50,000"],
    correct: [0, 1, 2],
    feedbackCorrect: "Materials, rent and wages are money the business spends. Sales is money coming in.",
    feedbackWrong: "Costs are what the business spends. Sales is money coming in.",
  },
  {
    kind: "choice",
    type: "Definition",
    id: "FIN-L03-Q4",
    termId: "Loss",
    playOrder: 4,
    scene: { kind: "figures", items: [{ label: "Revenue", value: "$30,000" }, { label: "Costs", value: "$40,000" }], ops: ["−"] },
    prompt: "What does Dream Sneakers have this month?",
    options: ["A $10,000 loss", "$10,000 revenue", "A $10,000 margin", "$10,000 capital"],
    correctIndex: 0,
    feedbackCorrect: "Costs were higher than revenue, so it is a $10,000 loss.",
    feedbackWrong: "When costs are bigger than revenue, the business has a loss.",
  },
  {
    kind: "choice",
    type: "Definition",
    id: "FIN-L03-Q5",
    termId: "Margin",
    playOrder: 5,
    scene: { kind: "figures", items: [{ label: "Sale", value: "$100" }, { label: "Costs", value: "$60" }, { label: "Left", value: "$40" }], ops: ["−", "="], highlightLast: true },
    prompt: "What is the margin on this sale?",
    options: ["20%", "40%", "60%", "100%"],
    correctIndex: 1,
    feedbackCorrect: "Margin shows how much of each sale remains after costs: $40 of $100 is 40%.",
    feedbackWrong: "Margin is the part of each sale you keep: $40 of $100 is 40%.",
  },
  {
    kind: "chain",
    type: "Case",
    id: "FIN-L03-Q6",
    playOrder: 6,
    termIds: ["Cost", "Margin"],
    scene: { kind: "story", text: "Revenue stays the same this month." },
    prompt: "Which helps Dream Sneakers keep more money?",
    steps: [
      { prompt: "Which helps Dream Sneakers keep more money?", options: ["Costs go up", "Costs go down"], correctIndex: 1 },
      { prompt: "What could improve?", options: ["Margin", "Cost"], correctIndex: 0 },
    ],
    feedbackCorrect: "When revenue stays the same, lower costs leave more money and improve margin.",
    feedbackWrong: "Spending less while sales stay the same leaves more of each sale. That is a better margin.",
  },
  {
    kind: "chain",
    type: "Case",
    id: "FIN-L03-Q7",
    playOrder: 7,
    termIds: ["Revenue", "Loss"],
    scene: { kind: "figures", items: [{ label: "Revenue", value: "$100,000" }, { label: "Costs", value: "$80,000" }], ops: ["−"] },
    prompt: "How much money is left?",
    steps: [
      { prompt: "How much money is left?", answer: 20000, unit: "$" },
      { prompt: "Which Level 1 word means the $20,000 left after costs?", options: ["Profit", "Revenue", "Capital", "Cost"], correctIndex: 0 },
      { prompt: "If costs rose above $100,000, what would Dream Sneakers have?", options: ["A loss", "A margin", "Capital", "Revenue"], correctIndex: 0 },
    ],
    feedbackCorrect: "Money left after costs is profit. If costs rise above revenue, the business has a loss.",
    feedbackWrong: "Take costs from revenue: $100,000 minus $80,000 is $20,000. That is profit. Costs above revenue make a loss.",
  },
];

const L03_REVIEW: GlossaryQuestion[] = [
  { kind: "choice", type: "Reverse Recall", id: "FIN-L03-R1", termId: "Revenue", playOrder: 8, prompt: "All the money a business earns from sales is called...", options: ["Revenue", "Cost", "Loss", "Margin"], correctIndex: 0, feedbackCorrect: "Right. That is revenue.", feedbackWrong: "Money earned from sales is revenue." },
  { kind: "choice", type: "Reverse Recall", id: "FIN-L03-R2", termId: "Cost", playOrder: 9, prompt: "Money a business spends is called a...", options: ["Cost", "Revenue", "Margin", "Cash flow"], correctIndex: 0, feedbackCorrect: "Right. That is a cost.", feedbackWrong: "Money a business spends is a cost." },
  { kind: "choice", type: "Reverse Recall", id: "FIN-L03-R3", termId: "Cash Flow", playOrder: 10, prompt: "Money moving in and out of a business is called...", options: ["Cash flow", "Margin", "Revenue", "Loss"], correctIndex: 0, feedbackCorrect: "Right. That is cash flow.", feedbackWrong: "Money moving in and out is cash flow." },
  { kind: "choice", type: "Reverse Recall", id: "FIN-L03-R4", termId: "Margin", playOrder: 11, prompt: "How much of each sale is kept after costs is called the...", options: ["Margin", "Cost", "Cash flow", "Loss"], correctIndex: 0, feedbackCorrect: "Right. That is the margin.", feedbackWrong: "The part of each sale kept after costs is the margin." },
  { kind: "choice", type: "Reverse Recall", id: "FIN-L03-R5", termId: "Loss", playOrder: 12, prompt: "When a business spends more than it earns, it has a...", options: ["Loss", "Margin", "Revenue", "Cost"], correctIndex: 0, feedbackCorrect: "Right. That is a loss.", feedbackWrong: "Spending more than you earn is a loss." },
];

export const FIN_LESSON_3: GlossaryLesson = {
  id: "FIN-L03",
  lessonNumber: 3,
  title: "Money In, Money Out",
  subtitle: "Revenue · Cost · Cash Flow · Margin · Loss",
  milestone: "Review your first sales report",
  exampleCompany: "Dream Sneakers",
  difficulty: "Beginner",
  estimatedMinutes: 4,
  xpReward: 20,
  previousCompanyValue: 50000,
  companyValue: 120000,
  nextCompanyValue: 250000,
  nextMilestone: "Choose how to raise money",
  intro: { headline: "Dream Sneakers Gets Its First Sales Report", line: "Money is coming in. Money is going out.", hook: "Let's see how the business is really doing." },
  terms: L03_TERMS,
  questions: L03_QUESTIONS,
  reviewQuestions: L03_REVIEW,
  // One paragraph, all five terms, like Level 1 (Joshua, 15 Oct 2026); the
  // month's figures ride in the sentences so the blanks still have numbers
  // to lean on without a separate scene card.
  powerPlay: {
    intro: "Run the month.",
    paragraph:
      "Dream Sneakers made $120,000 in sales this month. That money coming in is {1}. It spent $90,000 to make and sell the shoes. That is its {2}. Money moving in and out like this is {3}. The $30,000 left is 25% of sales. That share is the {4}. If costs ever pass sales, Dream Sneakers has a {5}.",
    answers: ["revenue", "cost", "cash flow", "margin", "loss"],
  },
  facts: [
    "A business can have lots of revenue and still have a loss if its costs are even bigger.",
    "Some growing businesses run short of cash because bills are due before customers pay. That is a cash flow problem.",
  ],
};

// ---------------------------------------------------------------- Level 4

const L04_TERMS: GlossaryTerm[] = [
  { id: "Stock", order: 1, term: "Stock", definition: "A piece of ownership in a company.", example: "Dream Sneakers stock lets you own a small piece of the company.", icon: "chart-line" },
  { id: "Bond", order: 2, term: "Bond", definition: "Money borrowed from investors.", example: "Dream Sneakers can sell a bond to borrow money for a new factory.", icon: "scroll" },
  { id: "Shareholder", order: 3, term: "Shareholder", definition: "A person who owns stock.", example: "Anyone who owns Dream Sneakers stock is a shareholder.", icon: "users" },
  { id: "Lender", order: 4, term: "Lender", definition: "A person or group that lends money.", example: "A bank that loans money to Dream Sneakers is a lender.", icon: "landmark" },
  { id: "Interest", order: 5, term: "Interest", definition: "Extra money paid for borrowing money.", example: "Dream Sneakers pays interest on the money it borrows from lenders.", icon: "coins", formula: "10% of $1,000 = $100" },
];

const L04_QUESTIONS: GlossaryQuestion[] = [
  {
    kind: "chain",
    type: "Case",
    id: "FIN-L04-Q1",
    playOrder: 1,
    termIds: ["Stock", "Bond"],
    scene: { kind: "story", text: "Two ways to raise money: stock or bonds." },
    prompt: "Own part of the company: stock or bond?",
    steps: [
      { prompt: "Own part of the company: stock or bond?", options: ["Stock", "Bond"], correctIndex: 0 },
      { prompt: "Loan money to the company: stock or bond?", options: ["Stock", "Bond"], correctIndex: 1 },
      { prompt: "Can make you a shareholder: stock or bond?", options: ["Stock", "Bond"], correctIndex: 0 },
      { prompt: "Must be paid back: stock or bond?", options: ["Stock", "Bond"], correctIndex: 1 },
    ],
    feedbackCorrect: "Stock means ownership. Bonds are loans that must be paid back.",
    feedbackWrong: "Stock is a piece of the company. A bond is a loan the company pays back.",
  },
  {
    kind: "chain",
    type: "Case",
    id: "FIN-L04-Q2",
    playOrder: 2,
    termIds: ["Shareholder", "Lender"],
    prompt: "You buy Dream Sneakers stock. You are a:",
    steps: [
      { prompt: "You buy Dream Sneakers stock. You are a:", options: ["Shareholder", "Lender"], correctIndex: 0 },
      { prompt: "You lend Dream Sneakers money through a bond. You are a:", options: ["Shareholder", "Lender"], correctIndex: 1 },
    ],
    feedbackCorrect: "Stock owners are shareholders. People who lend through bonds are lenders.",
    feedbackWrong: "If you own stock, you are a shareholder. If you lend money, you are a lender.",
  },
  {
    kind: "chain",
    type: "Case",
    id: "FIN-L04-Q3",
    playOrder: 3,
    termIds: ["Interest"],
    scene: { kind: "figures", items: [{ label: "Borrowed", value: "$1,000" }, { label: "Interest rate", value: "10%" }], ops: ["×"] },
    prompt: "How much interest does Dream Sneakers owe?",
    steps: [{ prompt: "How much interest does Dream Sneakers owe?", answer: 100, unit: "$" }],
    feedbackCorrect: "10% of $1,000 is $100. That extra money is interest.",
    feedbackWrong: "Interest is the cost of borrowing. 10% of $1,000 is $100.",
  },
  {
    kind: "sortBuckets",
    type: "Sort the Buckets",
    id: "FIN-L04-Q4",
    playOrder: 4,
    label: "Stock or bond",
    prompt: "Sort each one: stock or bond?",
    buckets: ["Stock", "Bond"],
    items: [
      { order: 1, text: "Sell ownership", bucket: "Stock", termId: "Stock" },
      { order: 2, text: "Creates shareholders", bucket: "Stock", termId: "Shareholder" },
      { order: 3, text: "No loan to pay back", bucket: "Stock", termId: "Stock" },
      { order: 4, text: "Borrow money", bucket: "Bond", termId: "Bond" },
      { order: 5, text: "Creates lenders", bucket: "Bond", termId: "Lender" },
      { order: 6, text: "Pay interest", bucket: "Bond", termId: "Interest" },
      { order: 7, text: "Pay the money back", bucket: "Bond", termId: "Bond" },
    ],
    feedbackCorrect: "Stock sells ownership. Bonds borrow money that must be paid back with interest.",
    feedbackWrong: "Ask of each one: does Dream Sneakers give away a piece of itself (stock), or borrow money it pays back (bond)?",
  },
  {
    kind: "choice",
    type: "Definition",
    id: "FIN-L04-Q5",
    termId: "Shareholder",
    playOrder: 5,
    scene: { kind: "split", title: "Who owns Dream Sneakers", parts: [{ label: "Founder", pct: 80 }, { label: "Investor", pct: 20 }] },
    prompt: "Who is a shareholder here, besides the founder?",
    options: ["The investor who owns stock", "The lender who owns a bond", "Every customer", "A store employee"],
    correctIndex: 0,
    feedbackCorrect: "The investor owns stock, so she is a shareholder. This ties back to ownership from Level 2.",
    feedbackWrong: "A shareholder owns stock. Lenders, customers and employees do not own part of the company.",
  },
  {
    kind: "chain",
    type: "Case",
    id: "FIN-L04-Q6",
    playOrder: 6,
    termIds: ["Bond", "Stock"],
    scene: { kind: "compare", title: "Dream Sneakers needs $100,000", options: [{ label: "A: Sell stock", points: ["Give up some ownership", "No loan to pay back"] }, { label: "B: Issue a bond", points: ["Keep ownership", "Pay back money + interest"] }] },
    prompt: "Which option lets Dream Sneakers keep its ownership?",
    steps: [
      { prompt: "Which option lets Dream Sneakers keep its ownership?", options: ["A: Stock", "B: Bond"], correctIndex: 1 },
      { prompt: "Which option creates new shareholders?", options: ["A: Stock", "B: Bond"], correctIndex: 0 },
    ],
    feedbackCorrect: "A bond lets the company keep its ownership. Stock creates new shareholders.",
    feedbackWrong: "Selling stock gives away part of the company to new shareholders. A bond is a loan, so the owners keep it all.",
  },
  {
    kind: "choice",
    type: "Catch the Misuse",
    id: "FIN-L04-Q7",
    termId: "Lender",
    playOrder: 7,
    label: "Quick check",
    prompt: "Which one is wrong?",
    options: ["Stock = ownership", "Bond = borrowed money", "Shareholder = owns stock", "Lender = owns part of the company"],
    correctIndex: 3,
    feedbackCorrect: "Right. A lender gives borrowed money. A shareholder owns part of the company.",
    feedbackWrong: "A lender does not own part of the company. A lender gives money that must be paid back.",
  },
];

const L04_REVIEW: GlossaryQuestion[] = [
  { kind: "choice", type: "Reverse Recall", id: "FIN-L04-R1", termId: "Stock", playOrder: 8, prompt: "A piece of ownership in a company is called...", options: ["Stock", "A bond", "Interest", "A lender"], correctIndex: 0, feedbackCorrect: "Right. That is stock.", feedbackWrong: "A piece of ownership is stock." },
  { kind: "choice", type: "Reverse Recall", id: "FIN-L04-R2", termId: "Bond", playOrder: 9, prompt: "Money a company borrows from investors and pays back later is a...", options: ["Bond", "Stock", "Shareholder", "Margin"], correctIndex: 0, feedbackCorrect: "Right. That is a bond.", feedbackWrong: "Borrowed money that is paid back later is a bond." },
  { kind: "choice", type: "Reverse Recall", id: "FIN-L04-R3", termId: "Shareholder", playOrder: 10, prompt: "A person who owns stock is a...", options: ["Shareholder", "Lender", "Customer", "Supplier"], correctIndex: 0, feedbackCorrect: "Right. That is a shareholder.", feedbackWrong: "Someone who owns stock is a shareholder." },
  { kind: "choice", type: "Reverse Recall", id: "FIN-L04-R4", termId: "Lender", playOrder: 11, prompt: "A person or group that lends money is a...", options: ["Lender", "Shareholder", "Customer", "Founder"], correctIndex: 0, feedbackCorrect: "Right. That is a lender.", feedbackWrong: "Someone who lends money is a lender." },
  { kind: "choice", type: "Reverse Recall", id: "FIN-L04-R5", termId: "Interest", playOrder: 12, prompt: "Extra money paid for borrowing money is called...", options: ["Interest", "Stock", "Revenue", "Capital"], correctIndex: 0, feedbackCorrect: "Right. That is interest.", feedbackWrong: "The extra money paid for borrowing is interest." },
];

export const FIN_LESSON_4: GlossaryLesson = {
  id: "FIN-L04",
  lessonNumber: 4,
  title: "Ways to Invest",
  subtitle: "Stock · Bond · Shareholder · Lender · Interest",
  milestone: "Choose how to raise money",
  exampleCompany: "Dream Sneakers",
  difficulty: "Beginner",
  estimatedMinutes: 4,
  xpReward: 20,
  previousCompanyValue: 120000,
  companyValue: 250000,
  nextCompanyValue: 500000,
  nextMilestone: "Prepare your first funding pitch",
  intro: { headline: "Dream Sneakers Needs Money to Grow", line: "There's more than one way to raise money.", hook: "Now you choose how Dream Sneakers gets funded." },
  terms: L04_TERMS,
  questions: L04_QUESTIONS,
  reviewQuestions: L04_REVIEW,
  // One paragraph, all five terms (Joshua, 15 Oct 2026). Both funding paths
  // from the old choose-a-path finale sit in the same scenario.
  powerPlay: {
    intro: "Fund Dream Sneakers.",
    paragraph:
      "Dream Sneakers needs $100,000 to grow. It can sell {1}, so each buyer becomes a {2} who owns a small piece of the company. Or it can sell a {3} to borrow the money from a {4}. Borrowing means paying {5} on top of what it owes.",
    answers: ["stock", "shareholder", "bond", "lender", "interest"],
  },
  facts: [
    "Big companies often raise money both ways: selling stock and borrowing with bonds.",
    "When you buy a bond, you are lending money. You get it back later, with interest.",
  ],
};
