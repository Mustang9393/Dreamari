import type { Level } from "./types";

// LEVEL 1 INTERN, from DreamAri_IB_Levels1-3_Handoff (2).xlsx (Aug 31), tab
// "Level 1 Intern" -- the doc's full restructure: story cards split to one
// idea per screen (D52), teach-then-check pacing (D53/D67/D74), the
// two-card character system with the power-ladder graphic (D54/D89/D92),
// drag interactions (D75), Tap to Reveal teaching screens (D86/D90), the
// client renamed to Maison Laurent and introduced on first mention (D88),
// Jordan reframed from rivalry to composure with his family cut entirely
// (D83/D95/D97), and the rebalanced review-week beat (D84).
//
// Copy is verbatim from the sheet: 25-word setups, 10-word options, no em
// dashes, written for a 13 year old. Scores are the production column. Ten
// scored beats at 10% each. `feedback` strings are no longer displayed
// (D55: the card shows the derived headline plus the chosen option's own
// why line), so they are left empty here.
//
// Art is reused, never invented: the three hand-drawn hero scenes keep
// their original files (l1-07/l1-12/l1-13.webp) on their renumbered beats,
// and everything else resolves a Cobalt Capital location (locations.ts,
// keyed by the NEW beat ids).

const ART = "/images/play/ib";

export const IB_LEVEL_1: Level = {
  id: "ib-l1",
  n: 1,
  role: "Intern",
  title: "The Summer Internship",
  blurb: "Week one at Cobalt Capital. Learn the language, hit your first deadline, and find out what the team says about you.",
  cover: `${ART}/l1-04.webp`,
  mood: "day",
  cast: {
    Christina: `${ART}/face-christina.webp`,
    Jordan: `${ART}/face-jordan.webp`,
    Marcus: `${ART}/face-marcus.webp`,
  },
  // Express mode ("Investment Banker, Level 1, Express mode" doc): the five
  // teaching screens go -- how-IB-works + its example page, the drag check on
  // it, the skill-chips intro, the score spotlight, and the typed 85-threshold
  // check. All ten scored beats survive; both story cards, every character
  // card and the vocabulary flips card stay. The cut teaching becomes
  // tappable in the player (score panel, term meanings, character cards).
  expressCut: ["L1-03", "L1-03b", "L1-04", "L1-07", "L1-09", "L1-10"],
  beats: [
    // ---- arrival: one idea per screen (D52) ----
    {
      kind: "card",
      variant: "intro",
      id: "L1-01",
      speaker: "Narrator",
      setup: "Intern • Week 1",
      title: "Welcome to Cobalt Capital.",
      cta: "Continue",
    },
    {
      kind: "card",
      variant: "intro",
      id: "L1-02",
      speaker: "Narrator",
      setup: "Intern • Week 1",
      // The stakes line is what makes Jordan matter later.
      title: "You are starting your summer internship. Nine weeks. Six interns. Two return offers.",
      cta: "Continue",
    },
    {
      kind: "card",
      variant: "intro",
      id: "L1-03",
      system: true,
      speaker: "System",
      setup: "How investment banking works",
      title: "Investment bankers help companies raise money and buy or sell businesses.",
      cta: "Continue",
    },
    {
      // The example on its OWN screen, per direct feedback -- one idea per
      // screen applies to the lesson and its illustration too.
      kind: "card",
      variant: "intro",
      id: "L1-03b",
      system: true,
      speaker: "System",
      title: "Here is what that looks like.",
      example: "A company wants to build 100 new hospitals but has no money. A bank finds investors and organises the deal.",
      cta: "Continue",
    },
    {
      // NOT SCORED, NOT A STRIKE: the comprehension check is what stops
      // anyone who tapped through the teach card without reading (D53).
      // A token-DRAG, not a tap (D75, reinstated per direct feedback with
      // the design mock): the slide is what differentiates a check from
      // tap multiple-choice and makes it read as a game.
      kind: "check",
      method: "drag",
      id: "L1-04",
      speaker: "System",
      setup: "Quick check before you start.",
      question: "A shoe company wants to buy a smaller shoe company. Who helps them do it?",
      prompt: "Press and hold the blue dot. Drag it to the answer.",
      options: [
        { label: "An investment bank", correct: true, why: "Right. Buying and selling companies is the job." },
        { label: "A shoe designer", correct: false, why: "Not this one. Try again." },
        { label: "A delivery company", correct: false, why: "Not this one. Try again." },
      ],
      cta: "Continue",
    },

    // ---- Christina: two cards, the screen before she first acts (D54) ----
    {
      kind: "card",
      variant: "character",
      id: "L1-05",
      speaker: "Narrator",
      castMember: "Christina",
      setup: "Christina • Associate",
      title: "She sat where you are sitting five years ago.",
      cta: "Continue",
    },
    {
      // The power card: what this person can actually do to you, in plain
      // words, with the ladder graphic (D89). Three rungs, not six -- the
      // ladder only ever shows rungs the student has actually met (D92).
      kind: "card",
      variant: "character",
      id: "L1-06",
      speaker: "Narrator",
      castMember: "Christina",
      setup: "Christina • Associate",
      title: "Christina decides what work you get. What she thinks of you reaches her boss before you do.",
      ladder: [
        { label: "You - Intern", lit: true },
        { label: "Christina - Associate", lit: true },
        { label: "Marcus - Vice President", lit: false },
      ],
      cta: "Continue",
    },
    {
      // Two example chips and the total named (D86): showing two of
      // fifteen with no count read as the whole list.
      kind: "reveal",
      id: "L1-07",
      speaker: "System",
      title: "Build real skills as you play.",
      prompt: "Tap a tag to see what it means.",
      rows: [
        { label: "Decision-Making", reveal: "Compare options and make thoughtful choices." },
        { label: "Active Learning", reveal: "Learn from new information and apply it." },
      ],
      note: "These are 2 of 15. Tap any tag, any time, to see what it means.",
      cta: "Continue",
    },

    // ---- scored beat 1: deliberately easy (D73) ----
    {
      kind: "choice",
      layout: "options",
      id: "L1-08",
      planLineIfFailed: "you picked up work on your first morning without asking anyone what mattered most",
      progress: 0.1,
      castMembers: ["Christina", "Jordan"],
      speaker: "Narrator",
      setup: "Christina meets you at reception. Jordan, another Intern, is starting too.",
      question: "Day 1: What should you do first?",
      prompt: "Tap one.",
      choices: [
        { id: "a", label: "Join a client call", tier: "wrong", why: "Eager, but you can't help yet. Someone senior would cover for you." },
        { id: "b", label: "Lead a company sale", tier: "wrong", why: "Interns don't lead deals. This reads as not knowing the job." },
        { id: "c", label: "Complete systems training", tier: "best", why: "Right. Learn the systems first. Everything after depends on them." },
      ],
      feedback: "",
      feedbackCta: "Continue",
      skills: ["Decision-Making", "Active Learning"],
    },
    {
      // Three rows, not four (D93): 40 to 59 and 60 to 84 are the same
      // outcome, so listing them separately taught a difference that does
      // not exist. The outcome shows at rest; the score is what you reveal.
      kind: "reveal",
      id: "L1-09",
      speaker: "System",
      spotlight: "score",
      setup: "That number in the corner just moved.",
      title: "Your reputation decides if you get promoted, keep your job, or lose it.",
      prompt: "Tap each outcome to reveal its score.",
      rows: [
        { label: "You lose the internship", reveal: "0 to 39 · At Risk", color: "red" },
        { label: "No return offer, start over", reveal: "40 to 84 · Cautious", color: "amber" },
        { label: "Promoted to Analyst", reveal: "85 and above · Trusted", color: "green" },
      ],
      cta: "Continue",
    },
    {
      // Typed, not tapped (D67): picking 85 from a list is recognition and
      // typing it is recall. The student carries this number for six levels.
      kind: "check",
      method: "type",
      id: "L1-10",
      speaker: "System",
      setup: "Quick check. Type the number, then press enter.",
      question: "What's the minimum amount of points you need to get promoted to the next level?",
      answer: "85",
      whyRight: "Right. 85 and above gets you promoted. Anything less and you play the level again.",
      hint: "At Risk 0 to 39 · Cautious 40 to 59 · Respected 60 to 84 · Trusted 85 to 100",
      cta: "Continue",
    },

    // ---- the language, taught before it is tested (D68) ----
    {
      kind: "flips",
      id: "L1-11",
      speaker: "Christina",
      setup: '"Before client work, learn the language."',
      title: "Four words you will hear before lunch.",
      prompt: "Tap the card for the next word.",
      cards: [
        { term: "Comps", def: "A list of similar companies" },
        { term: "Deck", def: "A slide presentation" },
        { term: "Model", def: "A spreadsheet of the numbers" },
        { term: "EOD", def: "End of the day" },
      ],
      cta: "Continue",
    },
    {
      // Request-to-action pairs, not term-to-definition (D68/D71): matching
      // a word to what you DO with it is what a first day actually asks.
      kind: "match",
      id: "L1-12",
      planLineIfFailed: "you could not follow a simple message from your own team",
      progress: 0.2,
      speaker: "Christina",
      setup: '"I\'m sending you four things, all at once."',
      question: "Match what she said to what you do.",
      prompt: "Tap a quote, then tap what you do.",
      pairs: [
        { term: '"Pull the comps."', def: "Get a list of similar companies" },
        { term: '"In the deck."', def: "Put it in the slides" },
        { term: '"Check the model."', def: "Check the spreadsheet" },
        { term: '"By EOD."', def: "By end of day" },
      ],
      whenRight: "Right. Four words, four things to actually go and do.",
      whenWrong: "Close. Comps are companies, the model is the spreadsheet, the deck is the slides.",
      feedback: "",
      feedbackCta: "Continue",
      skills: ["Reading Comprehension", "Active Learning"],
    },
    {
      kind: "rapid",
      id: "L1-13",
      planLineIfFailed: "you got the basics wrong on questions the team expects an intern to know cold",
      progress: 0.3,
      timer: 45,
      speaker: "Christina",
      castMember: "Christina",
      setup: '"Before client work, let me check how you communicate."',
      question: "Four quick questions on one shared timer.",
      prompt: "Four questions, one timer. Tap fast.",
      items: [
        {
          question: "How long should an email to a senior banker be?",
          options: [
            { label: "Two full pages with every detail", correct: false, why: "Too long. Bankers read on a phone between meetings." },
            { label: "Four sentences or less", correct: true, why: "Right. Answer first, detail underneath." },
            { label: "As long as possible to explain everything", correct: false, why: "Long isn't thorough. The skill is what you leave out." },
          ],
        },
        {
          question: "Christina asks for a number you do not know. What should you say?",
          options: [
            { label: '"This estimate is probably correct."', correct: false, why: "Probably is dangerous around numbers. If it's wrong, you said it was fine." },
            { label: '"Someone else should know that."', correct: false, why: "Maybe true, but it hands the problem back. She asked you." },
            { label: '"I\'ll confirm and follow up."', correct: true, why: "Right. Honest, quick, and it commits you to closing the gap." },
          ],
        },
        {
          question: "You spot an error in a client deck. What should you do?",
          options: [
            { label: "Wait until after the meeting.", correct: false, why: "By then the client has seen it. Errors are cheapest early." },
            { label: "Fix it and alert the team.", correct: true, why: "Right. Fixing it quietly leaves the team trusting a wrong version." },
            { label: "Delete the entire presentation.", correct: false, why: "Destroying work to hide a mistake makes it a serious one." },
          ],
        },
        {
          question: "What does EOD mean?",
          options: [
            { label: "Estimate of debt", correct: false, why: "EOD means end of day." },
            { label: "End of day", correct: true, why: "Right. And in banking that often means before sunrise." },
            { label: "Earnings on demand", correct: false, why: "EOD means end of day, not earnings." },
          ],
        },
      ],
      whenPass: "Right. Three of four means you can be trusted with a client email.",
      whenFail: "You needed three of four. These habits come up daily.",
      feedback: "",
      feedbackCta: "Continue",
      skills: ["Written Communication", "Decision-Making"],
    },

    // ---- the first real assignment ----
    {
      kind: "choice",
      layout: "options",
      id: "L1-14",
      planLineIfFailed: "you handled a request from a senior person without checking it was yours to handle",
      progress: 0.4,
      art: `${ART}/l1-07.webp`,
      artAlt: "Over-the-shoulder view of hands at a laptop showing charts, sunset skyline through the windows.",
      speaker: "Narrator",
      // Client introduced on first mention (D88): the build named Maison
      // Laurent five times across three levels without saying what it was.
      setup: "Your first assignment. Maison Laurent, a multi-billion dollar luxury fashion brand, needs a slide by 5 PM. It is 4 PM and numbers are missing.",
      question: "What do you do?",
      prompt: "Tap one.",
      choices: [
        { id: "a", label: "Send it on time, flag the gaps", tier: "acceptable", why: "On time and honest beats making things up. But you had an hour." },
        { id: "b", label: "Ask Christina for 30 more minutes", tier: "best", why: "Right. Asking early gives Christina a choice. She'd rather hear it at 4." },
        { id: "c", label: "Make the numbers up", tier: "risky", why: "Invented numbers end internships. Everything a bank sells is trust in its numbers." },
      ],
      feedback: "",
      feedbackCta: "Continue",
      skills: ["Time Management", "Negotiation"],
    },
    {
      kind: "choice",
      layout: "boss",
      id: "L1-15",
      planLineIfFailed: "you froze when a senior banker put you on the spot",
      progress: 0.5,
      // L1-14's laptop POV shot is that beat's own moment -- it stops here
      // rather than bleeding into an unrelated congratulations beat.
      resetScene: true,
      speaker: "Narrator",
      setup: "Your name made the deal email to the whole bank. You're on the record for helping close it.",
      question: "What do you do?",
      prompt: "Choose one.",
      choices: [
        { id: "a", label: "Send a short thank-you to the deal lead", tier: "best", why: "Right. Two lines to the person who named you makes them do it again." },
        { id: "b", label: "Assume everyone already knows your contribution", tier: "wrong", why: "Nobody tracks your work as closely as you do. Ten seconds costs nothing." },
      ],
      feedback: "",
      feedbackCta: "Continue",
      skills: ["Social Awareness", "Teamwork & Collaboration"],
    },
    {
      // Drag to Blank (D75): same content as the old tap version, and it
      // takes Level 1 to six pick-an-option beats out of ten.
      kind: "choice",
      layout: "blank",
      id: "L1-16",
      planLineIfFailed: "you saved client files somewhere they should never have gone",
      progress: 0.6,
      speaker: "Christina",
      setup: '"Before you share anything: client materials stay secure."',
      question: "Client files belong in the secure ___.",
      prompt: "Drag the right word into the space.",
      choices: [
        { id: "a", label: "data room", tier: "best", why: "Right. A data room is a locked folder only approved people can open." },
        { id: "b", label: "group chat", tier: "risky", why: "Chats are how client files leak. Once shared, nobody knows where it goes." },
        { id: "c", label: "personal drive", tier: "wrong", why: "Your drive feels safe, but the bank can't lock or delete it." },
      ],
      feedback: "",
      feedbackCta: "Continue",
      skills: ["Active Learning", "Decision-Making"],
    },

    // ---- Marcus: two cards, the screen BEFORE he is first named (D60) ----
    {
      kind: "card",
      variant: "character",
      id: "L1-17",
      speaker: "Narrator",
      castMember: "Marcus",
      setup: "Marcus • Vice President",
      title: "Eleven years here. He joined as an Analyst and never left.",
      cta: "Continue",
    },
    {
      kind: "card",
      variant: "character",
      id: "L1-18",
      speaker: "Narrator",
      castMember: "Marcus",
      setup: "Marcus • Vice President",
      title: "Marcus signs off on your promotion. Right now he is not sure who you are.",
      ladder: [
        { label: "You - Intern", lit: true },
        { label: "Christina - Associate", lit: false },
        { label: "Marcus - Vice President", lit: true },
      ],
      cta: "Continue",
    },
    {
      // Three errors of two different kinds on one line (D94/D96): one typo
      // in one of four lines was too fine a call for Level 1.
      kind: "choice",
      layout: "document",
      doc: "Maison Laurent Deal • Intern Summary",
      id: "L1-19",
      planLineIfFailed: "you sent writing out with mistakes still in it",
      progress: 0.7,
      speaker: "Christina",
      tone: "conflict",
      setup: '"Check the Maison Laurent summary before Marcus sees it. One line has mistakes in it."',
      question: "Tap the line with the mistakes.",
      prompt: "Tap the line with the mistakes.",
      choices: [
        { id: "a", label: "Maison Laurent's revenue grew by 8% last year.", tier: "wrong", why: "This line is fine. Look for the one with more than one thing wrong." },
        { id: "b", label: "Full deck by end of day.", tier: "wrong", why: "This line is fine. Look for the one with more than one thing wrong." },
        { id: "c", label: "Client call Friday, 9 AM.", tier: "wrong", why: "This line is fine. Look for the one with more than one thing wrong." },
        { id: "d", label: "The deal is worth nine billion dollers and closes on Febuary 31.", tier: "best", why: "Right. Dollers, Febuary, and February never has a 31st. Marcus would see all three." },
      ],
      feedback: "",
      feedbackCta: "Continue",
      skills: ["Reading Comprehension", "Critical Thinking"],
    },

    // ---- Jordan: one card, no power card -- he has none (Characters tab).
    //      Described by what he does, never by his family (D83/D97). ----
    {
      kind: "card",
      variant: "character",
      id: "L1-20",
      speaker: "Narrator",
      castMember: "Jordan",
      setup: "Jordan • Intern",
      title: "The other Intern from your first morning. He speaks first in every room and never sounds unsure.",
      cta: "Continue",
    },
    {
      // Rebalanced (D84): raising it at the review is now the best answer.
      // The old best, walking back in to mention a detail only you would
      // know, was too subtle for a first level. Second Risky of the level.
      kind: "choice",
      layout: "options",
      id: "L1-21",
      planLineIfFailed: "you made a call on your own that needed someone above you",
      progress: 0.8,
      art: `${ART}/l1-12.webp`,
      artAlt: "Jordan presenting a spreadsheet on a monitor to a seated manager, your coffee mug in the foreground.",
      speaker: "Narrator",
      tone: "conflict",
      setup: "You built the spreadsheet over three days. Jordan told your manager he made it. Your review with her is Friday.",
      question: "What do you do?",
      prompt: "Tap one.",
      choices: [
        { id: "a", label: "Raise it at your review", tier: "best", why: "Right. The record gets corrected calmly, by the person who decides your offer." },
        { id: "b", label: "Tell Jordan not to do that again", tier: "acceptable", why: "It may stop him. Your manager still thinks he built it." },
        { id: "c", label: "Go in and yell at both of them", tier: "risky", why: "You become the problem in the room, and the spreadsheet is forgotten." },
      ],
      feedback: "",
      feedbackCta: "Continue",
      skills: ["Persuasive Communication", "Social Awareness"],
    },
    {
      kind: "choice",
      layout: "options",
      id: "L1-22",
      planLineIfFailed: "you ran out of time on something that had a clear deadline",
      progress: 0.9,
      timer: 30,
      tone: "alarm",
      art: `${ART}/l1-13.webp`,
      artAlt: "A desk buried in sticky notes and crumpled paper, a figure walking out with a box, an I'M OUT note on the door.",
      speaker: "Narrator",
      setup: "Your intern partner quits at 3 PM, leaving half the 6 PM presentation undone. You've never even opened their slides.",
      question: "What do you do?",
      prompt: "Tap one before the timer runs out.",
      choices: [
        { id: "a", label: "Stay and finish both halves", tier: "acceptable", why: "Leadership, yes. But nobody knows the deck is at risk until 6 PM." },
        { id: "b", label: "Tell your manager, ask for two hours", tier: "best", why: "Right. Telling her at 3 gives three hours. Silence gives none." },
        { id: "c", label: "Send your half, explain by email", tier: "wrong", why: "Honest, but she gets half a deck and no time to fix it." },
      ],
      feedback: "",
      feedbackCta: "See the team's decision",
      skills: ["Problem-Solving", "Negotiation"],
    },
    {
      kind: "choice",
      layout: "options",
      id: "L1-23",
      planLineIfFailed: "you chose the easy option over the right one when nobody was watching",
      progress: 1,
      // L1-22's art is the specific tableau of a different intern quitting --
      // it stops here rather than bleeding into an unrelated intern's task
      // four hours later, then the chapter card and review that follow.
      resetScene: true,
      speaker: "Narrator",
      setup: "7 PM. Another intern is re-sorting 200 misprinted pages. Her deadline: 40 minutes. Yours: tomorrow. She hasn't asked for help.",
      question: "What do you do?",
      prompt: "Tap one.",
      choices: [
        { id: "a", label: "Ask how long it'll take, then decide", tier: "best", why: "Right. Thirty seconds tells you if it's five minutes or two hours." },
        { id: "b", label: "Start re-sorting without asking", tier: "acceptable", why: "Generous, but you've committed your evening without knowing the size of it." },
        { id: "c", label: "Keep working. She didn't ask", tier: "wrong", why: "She didn't ask, but she didn't need to. Asking costs nothing." },
        { id: "d", label: "Tell her to check the printer settings", tier: "wrong", why: "True and useless. The pages are already printed." },
      ],
      feedback: "",
      feedbackCta: "Continue",
      skills: ["Teamwork & Collaboration", "Helping & Supporting Others"],
    },

    // ---- the close ----
    {
      kind: "card",
      variant: "chapter",
      id: "L1-24",
      castMember: "Christina",
      speaker: "Christina",
      setup: '"Your internship is complete. Before the team decides on your offer, come here a second."',
      title: '"You stood out. You came in early, worked late, and made careful decisions under pressure."',
      body: '"I hope this works out. I\'d like to see you back here as an Analyst."',
      cta: "Begin Final Review",
    },
    {
      kind: "review",
      id: "L1-25",
      speaker: "System",
      setup: "Final Review",
      title: "Cobalt Capital is reviewing your internship.",
      body: "Your reputation will decide if you earn the return offer.",
    },
  ],
  // FOUR outcomes now (Endings tab): 85+, 60-84, 40-59, and under 40, which
  // goes to E-TERM -- the contract ends, and the run starts over. All four
  // bands mean something distinct, which is what makes the reputation teach
  // screen worth reading.
  endings: [
    {
      min: 85,
      band: "Trusted",
      headline: "Top of the Class",
      message:
        "Marcus (VP) asked for your name before the meeting ended. You're coming back as an Analyst, and the team already knows who you are.",
      subline: "Next up: your first full-time role.",
      primary: "Unlock Analyst Level",
      advances: true,
    },
    {
      min: 60,
      band: "Respected",
      headline: "So Close",
      message:
        'No return offer this summer. Christina is straight with you. "You were good. Good is most people. The ones who get offers are the ones I never had to check twice."',
      subline: "You start the internship over, from day one.",
      primary: "Play the internship again",
      advances: false,
    },
    {
      min: 40,
      band: "Cautious",
      headline: "No Return Offer",
      message: 'Cobalt is not making you an offer. Christina is straight about it: "You showed up. Showing up is the floor, not the bar."',
      subline: "You start the internship over, from day one.",
      primary: "Start the internship over",
      advances: false,
    },
    {
      // E-TERM: under 40, or a failed performance plan. Deep red, no
      // confetti. Named what to work on, never the word "fired" -- these
      // are 13 and 14 year olds.
      min: 0,
      band: "At Risk",
      headline: "Contract Ended",
      message: "Cobalt Capital is ending your contract. Your supervisor walks you out. This is what being let go actually looks like.",
      subline: "This happens to real people, and most of them go on to do well somewhere else. You can run this year again.",
      primary: "Play this year again",
      advances: false,
    },
  ],
};
