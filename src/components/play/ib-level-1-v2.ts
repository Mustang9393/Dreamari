import type { Level } from "./types";

// LEVEL 1 INTERN, v2 -- the LAB build of the revised flow (5 Oct 2026),
// reached from the Quick links menu ("Career sim v2 LAB") at
// /play/investment-banking?v=2. It lives beside the main build rather than
// replacing it, by direct request ("for career simulations lets have a v2
// toggle or a lab link accessible from in the hamburger menu"), with its own
// save slot. Express mode is untouched.
//
// Sources, verbatim:
// - "Investment Banking Simulation: Revised Screen Order" (46 screens,
//   Downloads PDF): copy, order, interactions and design notes. Screen
//   numbers below are that document's.
// - "Optional Mini Lesson: Investment Banking 101" (Downloads PDF) and the
//   How to Play brief (Slack, 4 Oct 2026): the optional run-up in `preGame`,
//   so the old teaching screens (how IB works, the example, the quick check,
//   the skills screen) move OUT of the story -- "once the simulation starts,
//   all instruction ends".
//
// Scoring: seven decisions, each followed by its own "Strong move! / +6
// Reputation" screen in the document, at a fixed +6 / -6; a perfect run ends
// on 92, which is the "Reputation 92" the document's screen 46 shows. The
// match on screen 14 is a practice check (no verdict screen follows it).

const ART = "/images/play/ib";

export const IB_LEVEL_1_V2: Level = {
  id: "ib-l1-v2",
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
  hideBand: true,
  directed: true,
  points: 6,
  saveSlot: 201,
  // The cinematic presentation pass (name plates, intro name splash, reply
  // bubbles, drain-bar timer, paper documents, the room draining to grey on
  // pivotal choices), built and approved as a local v3 lab, then promoted
  // here (Chandu, 5 Oct 2026: "push these to replace the v2 links of both").
  cinematic: true,
  // DEMO-ONLY: skip-screen + Start over in the HUD. Flagged for Usman:
  // remove for production (see docs/HANDOFF_INDEX.md).
  qaSkip: true,
  // Neither the revised order nor the main doc has a three-strikes plan.
  noStrikes: true,
  scoreTip: "Your choices change your reputation. Reach 85+ to secure the offer.",
  sectionAfter: { beatId: "L1-ACT2", label: "Level 1.5" },
  preGame: {
    // Copy from the How to Play reference shots (5 Oct 2026).
    startLabel: "Start Internship",
    skipLabel: "Skip to the internship",
    handoffLine: "Your internship starts now.",
    howToCta: "Start your first day",
    tiers: [
      { label: "Bag Secured" },
      { label: "Retry" },
      { label: "Terminated" },
    ],
    ladder: ["Intern", "Analyst", "Associate", "Vice President", "Executive Director", "Managing Director"],
    // The shots show Decision-Making, Active Learning and Attention to
    // Detail; Level 1 never practises Attention to Detail, so Critical
    // Thinking (four decisions) takes its place.
    skills: ["Decision-Making", "Active Learning", "Critical Thinking"],
    skillTotal: 15,
    lesson: {
      title: "Investment Banking 101",
      screens: [
        // Mini lesson screen 1.
        { kind: "say", heading: "What do investment bankers do?", body: "They help companies raise money and buy or sell businesses." },
        // Mini lesson screen 2: "Use the visual diagram here so the copy stays light."
        {
          kind: "diagram",
          heading: "Here\u2019s an example.",
          // The four fragments are the doc's own sentence, split where it
          // breaks across the diagram, word for word.
          steps: [
            { icon: "store", text: "A sneaker company that has 1,000 stores," },
            { icon: "gap", text: "wants to open 100 new stores but needs additional money." },
            { icon: "bank", text: "An investment bank finds investors" },
            { icon: "grow", text: "to help fund the expansion." },
          ],
        },
        // Mini lesson screen 3: the drag interaction, then the hand-off into
        // the simulation. "An food company" in the source is read as "A food
        // company".
        {
          kind: "check",
          heading: "Quick check.",
          question: "A shoe company wants to buy another shoe company.\nWho helps with the deal?",
          options: [
            { label: "A food company", correct: false },
            { label: "An investment bank", correct: true },
            { label: "A pants designer", correct: false },
          ],
        },
      ],
    },
  },
  beats: [
    {
      // Screen 1. The second line is part of the main message (bodyLarge).
      kind: "card",
      variant: "intro",
      id: "L1-01",
      speaker: "Narrator",
      title: "Welcome to Investment Banking.",
      body: "Your internship at Cobalt Capital starts today.",
      bodyLarge: true,
      celebrate: true,
      cta: "Continue",
    },
    {
      // Screen 2. "The stakes should feel important."
      kind: "card",
      variant: "intro",
      id: "L1-02",
      speaker: "Narrator",
      title: "Nine weeks. Seven interns, including you.",
      body: "Only two will be invited back for a full-time job after college.",
      bodyLarge: true,
      cta: "Continue",
    },
    {
      // Screen 3, kept as is.
      kind: "card",
      variant: "character",
      id: "L1-07",
      speaker: "Christina",
      castMember: "Christina",
      setup: "Christina \u2022 Associate",
      title: "Time to meet your team.",
      body: "Christina is an Associate, two levels above you. She\u2019ll guide you and give you direction throughout your internship.",
      cta: "Continue",
    },
    {
      // Screen 4. No "Here's the ladder." -- the visual says it.
      kind: "card",
      variant: "character",
      id: "L1-08",
      speaker: "Christina",
      castMember: "Christina",
      setup: "Christina \u2022 Associate",
      title: "Christina decides what work you get, and her feedback reaches the people deciding your return offer.",
      ladder: [
        { label: "Intern \u2022 You", lit: true },
        { label: "Analyst", lit: false },
        { label: "Associate \u2022 Christina", lit: true },
        { label: "Vice President", lit: false },
      ],
      cta: "Continue",
    },
    {
      // Screen 5.
      kind: "card",
      variant: "intro",
      id: "L1-10",
      speaker: "Narrator",
      castMembers: ["Christina", "Jordan"],
      title: "Christina meets you at reception.",
      body: "Jordan, one of the other interns, is starting today too.",
      cta: "Continue",
    },
    {
      // Screens 6 + 7: the decision, then the verdict with the reputation
      // change and the skills, "as it currently works".
      kind: "choice",
      layout: "options",
      id: "L1-11",
      planLineIfFailed: "you reached for work that was above you before you could do the work in front of you",
      progress: 1 / 7,
      speaker: "Christina",
      castMember: "Christina",
      question: "Day 1: What should you do first?",
      choices: [
        { id: "a", label: "Complete systems training", tier: "best", why: "Learn the systems first. Everything else depends on them." },
        { id: "b", label: "Join a client call", tier: "wrong", why: "Client calls are not yours yet, and you would not know what you were listening to." },
        { id: "c", label: "Lead a company sale", tier: "wrong", why: "Nobody hands a sale to someone on day one. Aim at what is actually in front of you." },
      ],
      feedback: "",
      feedbackCta: "Continue",
      skills: ["Decision-Making", "Active Learning"],
    },
    {
      // Screens 8 + 9-12. Christina's line in the cafe, then the four words
      // one at a time on the Word Cards ("four separate screens so the
      // student only has to process one term at a time").
      kind: "flips",
      id: "L1-14",
      speaker: "Christina",
      castMember: "Christina",
      setup: "\u201cBefore client work, you need to learn the language of investment banking (IB).\u201d",
      title: "Four words commonly used in investment banking.",
      cards: [
        { term: "Comps", def: "A list of similar companies" },
        { term: "Deck", def: "A slide presentation" },
        { term: "Model", def: "A spreadsheet of the numbers" },
        { term: "EOD", def: "End of the day" },
      ],
      cta: "Continue",
    },
    {
      // Screens 13 + 14. "The purpose here is to transition from learning
      // the vocabulary to using it." A practice check: no verdict screen
      // follows it in the document (14 goes straight to 15), so it never
      // moves the score and moves on as soon as it is solved.
      kind: "match",
      id: "L1-16",
      practice: true,
      noVerdict: true,
      speaker: "Christina",
      castMember: "Christina",
      setup: "\u201cLet\u2019s see if you really understand those words.\u201d",
      question: "Match what she said to what you do.",
      prompt: "Tap a phrase, then tap what it means.",
      pairs: [
        { term: "\u201cPull the comps.\u201d", def: "Get a list of similar companies" },
        { term: "\u201cIn the deck.\u201d", def: "Put it in the slides" },
        { term: "\u201cCheck the model.\u201d", def: "Check the spreadsheet" },
        { term: "\u201cBy EOD.\u201d", def: "By end of day" },
      ],
      whenRight: "Four words, four things to actually go and do.",
      whenWrong: "Close. Comps are companies, the model is the spreadsheet, the deck is the slides.",
      feedback: "",
      feedbackCta: "Continue",
      skills: ["Reading Comprehension", "Active Learning"],
    },
    {
      // Screens 15 + 16-19 + 20. Christina's transition line, then the four
      // timed questions (one clock, 3 of 4 to pass), then the verdict.
      kind: "rapid",
      id: "L1-18",
      planLineIfFailed: "you missed the small rules of how people here talk to each other",
      progress: 2 / 7,
      timer: 45,
      speaker: "Christina",
      castMember: "Christina",
      setup: "You\u2019re about to work with big brands and executives. Let\u2019s see if you can communicate like a pro.",
      question: "",
      items: [
        {
          question: "How long should an email to a senior banker be?",
          options: [
            { label: "Two full pages with every detail", correct: false, why: "Too long. Bankers read on a phone between meetings." },
            { label: "Four sentences or less", correct: true, why: "Right. Answer first, detail underneath." },
            { label: "As long as possible to explain everything", correct: false, why: "Long is not thorough. The skill is what you leave out." },
          ],
        },
        {
          question: "Christina asks for a number you do not know. What should you say?",
          options: [
            { label: "\u201cThis estimate is probably correct.\u201d", correct: false, why: "Probably is dangerous around numbers. If it's wrong, you said it was fine." },
            { label: "\u201cI will confirm and follow up.\u201d", correct: true, why: "Right. Honest, quick, and it commits you to closing the gap." },
            { label: "\u201cSomeone else should know that.\u201d", correct: false, why: "Maybe true, but it hands the problem back. She asked you." },
          ],
        },
        {
          question: "You spot an error in a client deck. What should you do?",
          options: [
            { label: "Fix it and alert the team.", correct: true, why: "Right. Fixing it quietly leaves the team trusting a wrong version." },
            { label: "Wait until after the meeting.", correct: false, why: "By then the client has seen it. Errors are cheapest early." },
            { label: "Delete the entire presentation.", correct: false, why: "Destroying work to hide a mistake makes it a serious one." },
          ],
        },
        {
          question: "What does EOD mean?",
          options: [
            { label: "End of day", correct: true, why: "Right. And in banking that often means before sunrise." },
            { label: "Estimate of debt", correct: false, why: "EOD means end of day." },
            { label: "Earnings on demand", correct: false, why: "EOD means end of day, not earnings." },
          ],
        },
      ],
      whenPass: "Short, honest, quick to flag, and you know the words. That is a teammate people trust with a client email.",
      whenFail: "Close. On a real desk any one of those slips is the one people remember.",
      feedback: "",
      feedbackCta: "Continue",
      skills: ["Written Communication", "Decision-Making"],
    },
    {
      // Screen 21. Plain words, not "confidential".
      kind: "card",
      variant: "intro",
      id: "L1-19",
      speaker: "Christina",
      castMember: "Christina",
      title: "Client information stays private and with Cobalt Capital.",
      body: "Keep it secure.",
      cta: "Continue",
    },
    {
      // Screens 22 + 23. The files go into the right place, then the verdict.
      kind: "choice",
      layout: "zones",
      id: "L1-20",
      planLineIfFailed: "you were not careful yet with things that belong to the client",
      progress: 3 / 7,
      speaker: "Christina",
      castMember: "Christina",
      question: "Where should client files be stored to keep them safe?",
      choices: [
        { id: "a", label: "Data room", tier: "best", why: "The data room is the locked room. That is the whole point of it." },
        { id: "b", label: "Personal drive", tier: "wrong", why: "A personal drive is yours, not the firm\u2019s. The moment you leave, the file leaves with you." },
        { id: "c", label: "Group chat", tier: "wrong", why: "A group chat cannot be taken back. One wrong person in the group and it is out." },
      ],
      feedback: "",
      feedbackCta: "Continue",
      skills: ["Critical Thinking", "Social Awareness"],
    },
    {
      // Screen 24. "Significantly more visual presence and aura than
      // previous character introductions" (`entrance: "boss"`).
      kind: "card",
      variant: "character",
      id: "L1-21",
      introduce: { name: "Marcus", role: "Vice President" },
      speaker: "Marcus",
      castMember: "Marcus",
      entrance: "boss",
      title: "Meet Marcus, the Vice President.",
      body: "The moment has arrived.",
      cta: "Continue",
    },
    {
      // Screen 25, split out of 24 so the introduction is not overloaded.
      // Marcus stays on screen.
      kind: "card",
      variant: "character",
      id: "L1-21b",
      introduce: { name: "Marcus", role: "Vice President" },
      speaker: "Marcus",
      castMember: "Marcus",
      title: "Marcus started as an intern 12 years ago.",
      body: "Since then, he\u2019s worked on billion-dollar deals and become one of the team\u2019s top leaders.",
      cta: "Continue",
    },
    {
      // Screen 26. No "Marcus \u2022 Vice President" label on top: he was
      // just introduced. So no `introduce` here either: in cinematic mode
      // that draws the name splash and the role plate all over again.
      kind: "card",
      variant: "character",
      id: "L1-22",
      speaker: "Marcus",
      castMember: "Marcus",
      title: "Marcus is above Christina and helps decide who gets a return offer.",
      body: "Do great work, and Marcus will remember your name.",
      ladder: [
        { label: "Intern \u2022 You", lit: true },
        { label: "Associate \u2022 Christina", lit: true },
        { label: "Vice President \u2022 Marcus", lit: true },
      ],
      cta: "Continue",
    },
    {
      // Screens 27 + 28 + 29. Christina and Marcus together, the line that
      // ties the challenge to the Analyst offer, then the document. The
      // first line is now close in length to the wrong one, so the longest
      // line no longer gives the answer away.
      kind: "choice",
      layout: "document",
      doc: "Deal Summary \u2022 Intern Draft",
      id: "L1-24",
      planLineIfFailed: "you let a line with obvious errors go out to a client",
      progress: 4 / 7,
      speaker: "Marcus",
      castMembers: ["Marcus", "Christina"],
      reactor: "Christina",
      setup: "\u201cTo earn the Analyst offer, prove you can catch the small details.\u201d",
      question: "Find the line with the mistakes.",
      choices: [
        { id: "a", label: "The deal is worth nine billion dollers and closes on Febuary 31.", tier: "best", why: "Dollers, Febuary, and February never has a 31st. Three errors in one line." },
        { id: "b", label: "The full client deck is due by end of day for tomorrow\u2019s meeting.", tier: "wrong", why: "That line is fine. Look for the one with more than one thing wrong." },
        { id: "c", label: "Client call Friday, 9 A.M.", tier: "wrong", why: "That line is fine. Look for the one with more than one thing wrong." },
        { id: "d", label: "The client\u2019s revenue grew by 8% last year.", tier: "wrong", why: "That line is fine. Look for the one with more than one thing wrong." },
      ],
      feedback: "",
      feedbackCta: "Continue",
      skills: ["Reading Comprehension", "Critical Thinking"],
    },
    {
      // Screen 30, the checkpoint: its own celebratory backdrop, centred and
      // higher than the dialogue cards. Showing it saves the run one beat
      // past it, so Finish Later resumes at Level 1.5.
      kind: "card",
      variant: "act",
      id: "L1-CHECK",
      speaker: "System",
      // The doc gives no eyebrow, only the line itself.
      title: "",
      body: "You passed your first few weeks.",
      note: "Checkpoint saved.",
      cta: "Continue Internship",
      secondaryCta: "Finish Later",
      secondaryHref: "/play",
    },
    {
      // "LEVEL 1.5 NEEDS TO FEEL LIKE A NEW SECTION": a section title, and
      // the HUD reads Level 1.5 from here on (Level.sectionAfter).
      kind: "card",
      variant: "act",
      id: "L1-ACT2",
      auto: true,
      speaker: "System",
      // Doc screen: "Level 1.5" and nothing else.
      title: "",
      body: "Level 1.5",
      cta: "Continue",
    },
    {
      // Screen 31. No "Meet Jordan." -- he was introduced at reception.
      kind: "card",
      variant: "character",
      id: "L1-26",
      speaker: "Jordan",
      castMember: "Jordan",
      setup: "Jordan \u2022 Intern",
      title: "Jordan wants one of those two return offers just as badly as you do.",
      body: "He\u2019s confident, competitive, and willing to play a little dirty to get ahead.",
      cta: "Continue",
    },
    {
      // Screen 32.
      kind: "card",
      variant: "intro",
      id: "L1-27",
      speaker: "Narrator",
      castMember: "Jordan",
      art: `${ART}/l1-12.webp`,
      artAlt: "Jordan presenting a spreadsheet on a monitor to a seated manager, your coffee mug in the foreground.",
      title: "The next day...",
      body: "You spent three days building a spreadsheet. Then you hear Jordan tell a manager he built it.",
      cta: "Continue",
    },
    {
      // Screens 33 + 34. Simple multiple choice now, and the picture of
      // Jordan with the manager stays visible behind it (`keepScene`).
      kind: "choice",
      layout: "options",
      id: "L1-28",
      // The room drains to grey while this is open (cinematic labs).
      pivotal: true,
      keepScene: true,
      planLineIfFailed: "you handled being crossed in a way people noticed for the wrong reason",
      progress: 5 / 7,
      speaker: "Narrator",
      question: "Jordan took credit for your work. What\u2019s your move?",
      choices: [
        { id: "d", label: "Ignore it and keep working", tier: "wrong", why: "Letting it go once is fine. Letting it go every time is how someone else ends up with your record." },
        { id: "b", label: "Call Jordan out in front of the team", tier: "wrong", why: "Now the room is watching two interns argue instead of noticing your work." },
        { id: "c", label: "Crash out", tier: "wrong", why: "Understandable. Also the only thing anyone will remember about the day." },
        { id: "e", label: "Subtweet him", tier: "wrong", why: "It will not stay subtle, and it puts the firm\u2019s business on the internet." },
        { id: "a", label: "Speak to Christina privately", tier: "best", why: "Quietly, to the one person whose opinion decides your offer. No audience, no argument." },
      ],
      feedback: "",
      feedbackCta: "Continue",
      skills: ["Social Awareness", "Decision-Making"],
    },
    {
      // Screen 35.
      kind: "card",
      variant: "intro",
      id: "L1-29",
      speaker: "Narrator",
      resetScene: true,
      art: `${ART}/l1-13.webp`,
      artAlt: "A desk buried in sticky notes and crumpled paper, a figure walking out with a box, an I'M OUT note on the door.",
      title: "3:00 P.M. One of the interns on your project quits.",
      body: "Half the presentation is unfinished. It\u2019s due at 6:00 P.M.",
      cta: "Continue",
    },
    {
      // Screens 36 + 37. The messaging interaction, kept.
      kind: "choice",
      layout: "chat",
      chatWith: { name: "Christina", role: "Associate" },
      id: "L1-30",
      planLineIfFailed: "you took on more than you could finish instead of saying so early",
      progress: 6 / 7,
      speaker: "Christina",
      question: "An intern quit, and now there\u2019s more work to finish. What do you message Christina?",
      choices: [
        { id: "c", label: "\u201cI\u2019ll just finish everything myself.\u201d", tier: "wrong", why: "Brave, and nobody finds out there is a problem until it is too late to fix." },
        { id: "a", label: "\u201cCan you help me prioritize what\u2019s left?\u201d", tier: "best", why: "You flagged the problem early and got direction before the deadline." },
        { id: "b", label: "\u201cI\u2019ll get the intern to come back, even if it causes a scene.\u201d", tier: "wrong", why: "Dragging someone back is not your call, and the scene costs more than the slides." },
      ],
      feedback: "",
      feedbackCta: "Continue",
      skills: ["Time Management", "Verbal Communication"],
    },
    {
      // Screen 38, centred. Night.
      kind: "card",
      variant: "intro",
      id: "L1-31",
      speaker: "Narrator",
      resetScene: true,
      center: true,
      mood: "night",
      title: "6:00 P.M. You made the deadline.",
      body: "But the night isn\u2019t over. Interns can sometimes work 80 to 100 hours a week.",
      cta: "Continue",
    },
    {
      // Screen 39, centred.
      kind: "card",
      variant: "intro",
      id: "L1-32",
      speaker: "Narrator",
      center: true,
      mood: "night",
      title: "7:00 P.M.",
      body: "Another intern has 200 misprinted pages to fix.",
      facts: [
        { label: "Her deadline", value: "40 minutes" },
        { label: "Your deadline", value: "Tomorrow" },
      ],
      note: "She hasn\u2019t asked for help.",
      cta: "Continue",
    },
    {
      // Screen 40, centred in the same place as 39 so the two read as one moment.
      kind: "card",
      variant: "intro",
      id: "L1-32b",
      speaker: "Narrator",
      center: true,
      mood: "night",
      title: "Her deadline is close. Yours isn\u2019t.",
      cta: "Continue",
    },
    {
      // Screens 41 + 42. Drag to rank, kept.
      kind: "rank",
      id: "L1-33",
      planLineIfFailed: "you walked past someone who needed help on a night you had time to give",
      progress: 1,
      speaker: "Narrator",
      mood: "night",
      question: "Rank these from BEST to WORST:",
      order: ["Ask how you can help", "Wish her luck and keep working", "Laugh and walk away"],
      whenRight: "Offering costs you nothing tonight and it is the thing people remember about you.",
      whenWrong: "Wishing her luck is not unkind, it is just not help. Walking away from someone drowning at 7 PM is the one people repeat later.",
      feedback: "",
      feedbackCta: "Continue",
      skills: ["Social Awareness", "Critical Thinking"],
    },
    {
      // Screen 43. Christina wears her reaction to how the ranking went.
      kind: "card",
      variant: "intro",
      id: "L1-34",
      speaker: "Narrator",
      castMember: "Christina",
      reactsTo: "L1-33",
      mood: "night",
      title: "Christina saw how you handled it.",
      body: "She didn\u2019t say anything, but she noticed. That could matter when return offers are decided.",
      cta: "Continue",
    },
    {
      // Screen 44.
      kind: "card",
      variant: "chapter",
      id: "L1-35",
      speaker: "Christina",
      castMember: "Christina",
      resetScene: true,
      celebrate: true,
      title: "Your internship is complete.",
      // Two lines in the doc: Christina's quote, then the hand-off.
      body: "Christina: \u201cYou handled pressure, caught the details, and proved you can work with the team.\u201d\nNow it\u2019s time for your final review.",
      cta: "Begin Final Review",
    },
    {
      // Screen 45. The final reputation, prominent.
      kind: "review",
      id: "L1-36",
      speaker: "System",
      title: "Cobalt Capital is deciding who gets a return offer.",
      body: "Your reputation will determine what happens next.",
    },
  ],
  // Screen 46 (Bag Secured, with a full-screen confetti celebration) and the
  // two other outcomes, as in the main build.
  endings: [
    {
      min: 85,
      // Screen 46.
      headline: "Bag Secured",
      message: "You earned the return offer. You\u2019ll return after college as an Investment Banking Analyst.",
      subline: "Level 2 unlocked \u2022 Analyst",
      primary: "Unlock Analyst Level",
      advances: true,
    },
    {
      min: 40,
      headline: "Retry Level",
      message:
        'No return offer. Christina is straight with you. "You were good. Good is most people. Two of seven get asked back, and the ones who do are the ones I never had to check twice."',
      subline: "You start the internship over, from day one.",
      primary: "Play the internship again",
      advances: false,
    },
    {
      // TERMINATED: under 40, or a failed performance plan.
      min: 0,
      headline: "Terminated",
      message: "Cobalt Capital is ending your contract. Your supervisor walks you out. This is what being let go actually looks like.",
      subline: "This happens to real people, and most of them go on to do well somewhere else. You can run this year again.",
      primary: "Play this year again",
      advances: false,
    },
  ],
};
