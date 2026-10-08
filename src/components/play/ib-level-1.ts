import type { Level } from "./types";
import { IB_LEVEL_1_EXPRESS_LEGACY } from "./ib-level-1-express-legacy";

// LEVEL 1 INTERN, from DreamAri_IB_Levels1-3_Handoff_v8.xlsx (20 Sept), tab
// "Level 1 Intern" -- the 20 Sept rebuild to a clean three-act flow (Act 1:
// Learn the Game, Act 2: Prove You're Client-Ready, Act 3: Survive the
// Internship), BINARY scoring (every scored beat is +5 or -5 over exactly
// ten beats, so final reputation always equals correct answers x 10), and
// three plain outcomes -- BAG SECURED, RETRY LEVEL, TERMINATED -- with the
// At Risk / Cautious / Respected / Trusted band word retired for this level
// (`hideBand`, see the Scoring Model and Interaction Rules tabs).
//
// Copy is verbatim from the sheet: 25-word setups, 10-word options, no em
// dashes, written for a 13 year old. `feedback` strings are not displayed
// (the card shows the derived headline plus the chosen option's own why
// line), so they are left empty here, same as before.
//
// Art is reused, never invented: the two hand-drawn hero scenes keep their
// original files (l1-12/l1-13.webp) on the beats that replaced their
// originals, and everything else resolves a Cobalt Capital location
// (locations.ts) from the beat's own speaker/scene.

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
  // Retires the four-band word from the reputation gauge's own corner
  // label and switches the HUD's tap-to-explain popup on in Full mode too
  // (Interaction Rules: "this is not a required screen anymore... opens
  // ONLY when the student taps the reputation score").
  hideBand: true,
  // The 4 Oct 2026 doc pass (see the comment above `beats`): typed speech,
  // stage reactions, points that fly into the score, the doc's reputation
  // pop-up. Full mode only -- Express builds from its own frozen snapshot.
  directed: true,
  points: 6,
  scoreTip: "Your choices change your reputation. Reach 85+ to secure the offer.",
  // Express mode reverted to its pre-20-Sept content (direct instruction,
  // 21 Sept 2026: "the express mode changed to the full game with recent
  // updates... ONLY EXPRESS MODE should revert") -- expressSource below
  // points Express at the frozen legacy snapshot instead of this level's
  // own beats. `expressCut` stays non-empty ONLY because PlayHub and the
  // route both gate "is Express even offered" on its length; the actual
  // cut list Express plays against is the legacy file's own expressCut,
  // not this one. Full mode is entirely unaffected -- it still plays
  // every beat below, three acts, binary scoring, all of it.
  expressCut: ["L1-05", "L1-ACT1", "L1-CHECK"],
  expressSource: IB_LEVEL_1_EXPRESS_LEGACY,
  // ---------------------------------------------------------------------
  // 4 Oct 2026: rebuilt screen by screen to "DREAMARI IB GAME: LEVEL 1"
  // (Google Doc 1VT1pc5zA8zWXwNMw2NvRCPUnraS7vNPl8qv01ozEM-I), which
  // supersedes the v8 sheet wherever they differ. Chandu: "Please lets
  // match the doc." Copy is the doc's, word for word, contractions and
  // all. What changed against the 20 Sept build, and why:
  // - Seven scored beats, not ten: the doc has no word quiz after the
  //   vocabulary and no thank-you-email boss moment before the checkpoint,
  //   and screen 6 is a practice question (the score first moves at screen
  //   12, "50 -> 56"). Each decision is a fixed +6 / -6 (`points`), so a
  //   perfect run ends on 92; one miss ends on 80 unless it is repaired
  //   (a fix banks +2), which is how a student with one slip still gets
  //   the offer.
  // - Screens 14+15, 17+18-21 and 26+27 are one STAGED beat each: the
  //   character says the line in the room, a tap opens the activity (the
  //   doc: "move directly into the first vocabulary term", "transition
  //   directly into the communication challenge").
  // - Screen 6 is plain multiple choice again ("keep the existing layout");
  //   only 23, 30 and 32 drag, each in its own design.
  // - Every question is asked by someone who can react: Christina reacts
  //   on stage when the verdict lands (her proud / concerned faces), and on
  //   the document review she reacts beside Marcus, who has one face.
  // Screen numbers below are the doc's.
  beats: [
    // ---- Act 1: Learn the Game (screens 1-16) ----
    {
      // Screen 1.
      kind: "card",
      variant: "intro",
      id: "L1-01",
      speaker: "Narrator",
      title: "Welcome to Investment Banking.",
      body: "Your internship at Cobalt Capital starts today. Your first day begins now.",
      celebrate: true,
      cta: "Continue",
    },
    {
      // Screen 2.
      kind: "card",
      variant: "intro",
      id: "L1-02",
      speaker: "Narrator",
      title: "Nine weeks. Seven interns, including you.",
      body: "Only two will be invited back for a full-time job after college.",
      cta: "Continue",
    },
    {
      // Screen 3.
      kind: "card",
      variant: "intro",
      id: "L1-03",
      system: true,
      speaker: "System",
      title: "Before we begin, here\u2019s how investment banking works.",
      body: "Investment bankers help companies raise money and buy or sell businesses.",
      cta: "Continue",
    },
    {
      // Screen 4.
      kind: "card",
      variant: "intro",
      id: "L1-04",
      system: true,
      speaker: "System",
      title: "Here\u2019s an example.",
      exampleSteps: [
        { icon: "store", text: "A big sneaker company wants to open 100 new stores" },
        { icon: "gap", text: "but doesn\u2019t have enough money." },
        { icon: "bank", text: "An investment bank helps find investors and arrange the deal" },
        { icon: "grow", text: "so the company can expand." },
      ],
      example: "A big sneaker company wants to open 100 new stores but doesn\u2019t have enough money. An investment bank helps find investors and arrange the deal so the company can expand.",
      cta: "Continue",
    },
    {
      // Screen 5.
      kind: "card",
      variant: "intro",
      id: "L1-05",
      system: true,
      speaker: "System",
      title: "Quick check before you start.",
      body: "Let\u2019s see if you got it.",
      cta: "Continue",
    },
    {
      // Screen 6. The DRAG question exactly as it was designed when the doc
      // was written ("Keep the current multiple-choice screen and
      // interaction exactly as designed"): drag the token onto an answer,
      // or tap one. Briefly rebuilt as plain options on 4 Oct by misreading
      // "multiple-choice" -- restored the same day (teammate: "this was
      // supposed to be the drag thing"). A PRACTICE question: it only checks
      // the explanation landed, and the doc's score first moves at screen 12
      // ("50 -> 56"). Nobody has been met yet, so nobody reacts on stage.
      kind: "choice",
      layout: "options",
      dragEnabled: true,
      practice: true,
      id: "L1-06",
      speaker: "System",
      question: "A shoe company wants to buy a smaller shoe company. Who helps organize the deal?",
      choices: [
        { id: "a", label: "Investment bank", tier: "best", why: "That\u2019s the whole job in one sentence: banks help companies buy and sell other companies." },
        { id: "b", label: "Shoe designer", tier: "wrong", why: "A shoe designer makes the shoes. Nobody is asking them to arrange a sale." },
        { id: "c", label: "Delivery company", tier: "wrong", why: "A delivery company moves the boxes. Buying a company is a different problem." },
      ],
      feedback: "",
      feedbackCta: "Continue",
      skills: ["Reading Comprehension", "Active Learning"],
    },
    {
      // Screen 7.
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
      // Screen 8. The doc's ladder: VP, Associate (Christina), Analyst,
      // Intern (you). Marcus is not named yet -- he is a reveal in Act 2.
      kind: "card",
      variant: "character",
      id: "L1-08",
      speaker: "Christina",
      castMember: "Christina",
      setup: "Christina \u2022 Associate",
      title: "Christina decides what work you get, and her feedback reaches the people deciding your return offer.",
      body: "Here\u2019s the ladder:",
      ladder: [
        { label: "Intern \u2022 You", lit: true },
        { label: "Analyst", lit: false },
        { label: "Associate \u2022 Christina", lit: true },
        { label: "Vice President", lit: false },
      ],
      cta: "Continue",
    },
    {
      // Screen 9.
      kind: "reveal",
      id: "L1-09",
      // Screen 9, in the doc's order: heading, its sentence, the tags, then
      // the count and how the tags work.
      speaker: "System",
      title: "You\u2019re building real career skills.",
      body: "Every decision in this game practices skills investment bankers use in real life.",
      rows: [
        { label: "Decision-Making", reveal: "Compare options and make thoughtful choices." },
        { label: "Active Learning", reveal: "Learn from new information and apply it." },
      ],
      note: "2 of 15 career skills. Tap any skill tag to see what it means. After each decision, we\u2019ll show you which skill you practiced.",
      cta: "Continue",
    },
    {
      // Screen 10.
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
      // Screen 11, verdict = screen 12 ("Strong move! +6 / Learn the
      // systems first. Everything else depends on them."). Christina is the
      // one deciding your work, so she reacts; the +6 then flies into the
      // score and the one-time tooltip (Level.scoreTip) explains it.
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
    // Screen 13 is no longer a screen: tapping the score opens it (Hud).
    {
      // Screens 14 + 15. Christina says the line in the cafe, a tap opens
      // the first pair of flash cards.
      kind: "focus",
      id: "L1-14",
      speaker: "Christina",
      castMember: "Christina",
      setup: "\u201cBefore client work, you need to learn the language of IB.\u201d",
      title: "Two terms you\u2019ll hear all the time:",
      terms: [
        { term: "Comps", def: "Similar companies used for comparison." },
        { term: "Deck", def: "A slide presentation." },
      ],
    },
    {
      // Screen 16.
      kind: "focus",
      id: "L1-15",
      speaker: "Christina",
      castMember: "Christina",
      title: "Two more:",
      terms: [
        { term: "Model", def: "A spreadsheet used to analyze the numbers." },
        { term: "EOD", def: "End of the day." },
      ],
    },
    {
      // Act 1 completion moment: a quick celebration with a reputation
      // pulse, then on automatically.
      kind: "card",
      variant: "act",
      id: "L1-ACT1",
      auto: true,
      speaker: "System",
      title: "Foundation Complete",
      body: "You know the basics.",
      cta: "Continue",
    },

    // ---- Act 2: Prove You're Client-Ready (screens 17-27) ----
    {
      // Screens 17 + 18-21. Christina's new line in the room, then the four
      // timed questions exactly as they were (one shared clock, all four to
      // pass under binary scoring).
      kind: "rapid",
      id: "L1-18",
      planLineIfFailed: "you missed the small rules of how people here talk to each other",
      progress: 2 / 7,
      timer: 45,
      speaker: "Christina",
      castMember: "Christina",
      setup: "You\u2019re about to work with billion-dollar clients and senior executives. Let\u2019s see if you can communicate like a pro.",
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
            { label: '"This estimate is probably correct."', correct: false, why: "Probably is dangerous around numbers. If it's wrong, you said it was fine." },
            { label: '"I will confirm and follow up."', correct: true, why: "Right. Honest, quick, and it commits you to closing the gap." },
            { label: '"Someone else should know that."', correct: false, why: "Maybe true, but it hands the problem back. She asked you." },
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
      whenFail: "Close. On a real desk any one of those four slips is the one people remember.",
      feedback: "",
      feedbackCta: "Continue",
      skills: ["Written Communication", "Decision-Making"],
    },
    {
      // Screen 22.
      kind: "card",
      variant: "intro",
      id: "L1-19",
      speaker: "Christina",
      castMember: "Christina",
      title: "Client information is confidential.",
      body: "Always keep it secure.",
      cta: "Continue",
    },
    {
      // Screen 23. The files drag into one of three zones in a row (Data
      // room left, Personal drive centre, Group chat right), then Submit.
      kind: "choice",
      layout: "zones",
      dragItem: "Client files",
      id: "L1-20",
      planLineIfFailed: "you were not careful yet with things that belong to the client",
      progress: 3 / 7,
      speaker: "Christina",
      castMember: "Christina",
      question: "Where should client files be stored?",
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
      // Screen 24, the boss-level arrival (`entrance: "boss"`).
      kind: "card",
      variant: "character",
      id: "L1-21",
      speaker: "Marcus",
      castMember: "Marcus",
      entrance: "boss",
      setup: "Marcus \u2022 Vice President",
      title: "The moment has arrived. Meet Marcus.",
      body: "Marcus started as an intern 12 years ago. Since then, he\u2019s worked on billion-dollar deals and become one of the team\u2019s top leaders.",
      cta: "Continue",
    },
    {
      // Screen 25.
      kind: "card",
      variant: "character",
      id: "L1-22",
      speaker: "Marcus",
      castMember: "Marcus",
      setup: "Marcus \u2022 Vice President",
      title: "Marcus is above Christina and helps decide who gets a return offer.",
      body: "Do great work, and Marcus will remember your name.",
      ladder: [
        // Doc screen 25 names first: MARCUS / Vice President, CHRISTINA /
        // Associate, YOU / Intern.
        { label: "You \u2022 Intern", lit: true },
        { label: "Christina \u2022 Associate", lit: true },
        { label: "Marcus \u2022 Vice President", lit: true },
      ],
      cta: "Continue",
    },
    {
      // Screens 26 + 27. Marcus and Christina together in the boardroom
      // (two character slots there now), Marcus says the line, a tap opens
      // the document. One instruction only: the question itself. Christina
      // reacts to the verdict beside him (Marcus has one face).
      kind: "choice",
      layout: "document",
      doc: "Deal Summary \u2022 Intern Draft",
      id: "L1-24",
      planLineIfFailed: "you let a line with obvious errors go out to a client",
      progress: 4 / 7,
      speaker: "Marcus",
      castMembers: ["Marcus", "Christina"],
      // Christina stays in front of Marcus while the narrator speaks, as before.
      castFront: "Christina",
      reactor: "Christina",
      setup: "\u201cIf you return, you\u2019ll work on major deals. First, prove you catch the details.\u201d",
      question: "Find the line with the mistakes.",
      choices: [
        { id: "a", label: "The deal is worth nine billion dollers and closes on Febuary 31.", tier: "best", why: "Dollers, Febuary, and February never has a 31st. Three errors in one line." },
        { id: "b", label: "Full deck by end of day.", tier: "wrong", why: "That line is fine. Look for the one with more than one thing wrong." },
        { id: "c", label: "Client call Friday, 9 AM.", tier: "wrong", why: "That line is fine. Look for the one with more than one thing wrong." },
        { id: "d", label: "The client\u2019s revenue grew by 8% last year.", tier: "wrong", why: "That line is fine. Look for the one with more than one thing wrong." },
      ],
      feedback: "",
      feedbackCta: "Continue",
      skills: ["Reading Comprehension", "Critical Thinking"],
    },
    {
      // Mid-level checkpoint, straight after screen 27. Showing it saves the
      // run one beat past it, so Finish Later resumes at Act 3.
      kind: "card",
      variant: "act",
      id: "L1-CHECK",
      speaker: "System",
      title: "Client Ready",
      body: "You passed your first major test.",
      note: "Checkpoint saved.",
      cta: "Continue Internship",
      secondaryCta: "Finish Later",
      secondaryHref: "/play",
    },

    // ---- Act 3: Survive the Internship (screens 28-39) ----
    {
      // Screen 28.
      kind: "card",
      variant: "character",
      id: "L1-26",
      speaker: "Jordan",
      castMember: "Jordan",
      setup: "Jordan \u2022 Intern",
      title: "Meet Jordan.",
      body: "Jordan wants one of those two return offers just as badly as you do. He\u2019s confident, competitive, and willing to play a little dirty to get ahead.",
      cta: "Continue",
    },
    {
      // Screen 29.
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
      // Screen 30. Action cards scattered around a YOUR MOVE drop zone.
      // "Crash out" and "Subtweet him" are deliberate voice.
      kind: "choice",
      layout: "move",
      id: "L1-28",
      planLineIfFailed: "you handled being crossed in a way people noticed for the wrong reason",
      progress: 5 / 7,
      speaker: "Narrator",
      question: "Jordan took credit for your work. What\u2019s your move?",
      choices: [
        { id: "a", label: "Speak to Christina privately", tier: "best", why: "Quietly, to the one person whose opinion decides your offer. No audience, no argument." },
        { id: "b", label: "Call Jordan out in front of the team", tier: "wrong", why: "Now the room is watching two interns argue instead of noticing your work." },
        { id: "c", label: "Crash out", tier: "wrong", why: "Understandable. Also the only thing anyone will remember about the day." },
        { id: "d", label: "Ignore it and keep working", tier: "wrong", why: "Letting it go once is fine. Letting it go every time is how someone else ends up with your record." },
        { id: "e", label: "Subtweet him", tier: "wrong", why: "It will not stay subtle, and it puts the firm\u2019s business on the internet." },
      ],
      feedback: "",
      feedbackCta: "Continue",
      skills: ["Social Awareness", "Decision-Making"],
    },
    {
      // Screen 31.
      kind: "card",
      variant: "intro",
      id: "L1-29",
      speaker: "Narrator",
      resetScene: true,
      art: `${ART}/l1-13.webp`,
      artAlt: "A desk buried in sticky notes and crumpled paper, a figure walking out with a box, an I'M OUT note on the door.",
      title: "3:00 PM. One of the interns on your project quits.",
      body: "Half the presentation is unfinished. It\u2019s due at 6:00 PM.",
      cta: "Continue",
    },
    {
      // Screen 32. Drag one message into the chat with Christina; her face
      // carries the verdict.
      kind: "choice",
      layout: "chat",
      chatWith: { name: "Christina", role: "Associate", time: "Today 3:04 PM" },
      id: "L1-30",
      planLineIfFailed: "you took on more than you could finish instead of saying so early",
      progress: 6 / 7,
      speaker: "Christina",
      question: "An intern quit, and now there\u2019s more work to finish. What do you do?",
      choices: [
        { id: "a", label: "\u201cCan you help me prioritize what\u2019s left?\u201d", tier: "best", why: "You flagged the problem early and got direction before the deadline." },
        { id: "b", label: "\u201cI\u2019ll get the intern to come back, even if it causes a scene.\u201d", tier: "wrong", why: "Dragging someone back is not your call, and the scene costs more than the slides." },
        { id: "c", label: "\u201cI\u2019ll just finish everything myself.\u201d", tier: "wrong", why: "Brave, and nobody finds out there is a problem until it is too late to fix." },
      ],
      feedback: "",
      feedbackCta: "Continue",
      skills: ["Time Management", "Verbal Communication"],
    },
    {
      // Screen 33. The office shifts to night ("Let the visual communicate
      // the long hours"): resetScene drops the daytime quit illustration,
      // which would otherwise linger three beats into the evening.
      kind: "card",
      variant: "intro",
      id: "L1-31",
      speaker: "Narrator",
      resetScene: true,
      mood: "night",
      title: "6:00 PM. You made the deadline.",
      body: "But the night isn\u2019t over. Interns can sometimes work 80 to 100 hours a week.",
      cta: "Continue",
    },
    {
      // Screen 34.
      kind: "card",
      variant: "intro",
      id: "L1-32",
      speaker: "Narrator",
      mood: "night",
      title: "7:00 PM.",
      body: "Another intern has 200 misprinted pages to fix.",
      facts: [
        { label: "Her deadline", value: "40 minutes" },
        { label: "Your deadline", value: "Tomorrow" },
      ],
      note: "She hasn\u2019t asked for help.",
      cta: "Continue",
    },
    {
      // Screen 35. Drag the three into order, then submit; exact order only.
      kind: "rank",
      id: "L1-33",
      planLineIfFailed: "you walked past someone who needed help on a night you had time to give",
      progress: 1,
      speaker: "Narrator",
      mood: "night",
      setup: "Her deadline is close. Yours isn\u2019t.",
      prompt: "Drag the three choices into order, then submit.",
      question: "Rank these from BEST to WORST:",
      order: ["Ask how you can help", "Wish her luck and keep working", "Laugh and walk away"],
      whenRight: "Offering costs you nothing tonight and it is the thing people remember about you.",
      whenWrong: "Wishing her luck is not unkind, it is just not help. Walking away from someone drowning at 7 PM is the one people repeat later.",
      feedback: "",
      feedbackCta: "Continue",
      skills: ["Social Awareness", "Critical Thinking"],
    },
    {
      // Screen 36. Christina is in the room, wearing her reaction to how
      // the ranking actually went (`reactsTo`).
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
      // Screen 37. Celebratory but concise; the result is not revealed yet.
      kind: "card",
      variant: "chapter",
      id: "L1-35",
      speaker: "Christina",
      castMember: "Christina",
      resetScene: true,
      celebrate: true,
      title: "Your internship is complete.",
      body: "Christina: \u201cYou handled pressure, caught the details, and proved you can work with the team.\u201d Now it\u2019s time for your final review.",
      cta: "Begin Final Review",
    },
    {
      // Screen 38. The score becomes the focus and builds suspense.
      kind: "review",
      id: "L1-36",
      speaker: "System",
      title: "Cobalt Capital is deciding who gets a return offer.",
      body: "Your reputation will determine what happens next.",
    },
  ],
  // THREE outcomes (Endings tab, 20 Sept): 85+, 40-84, and under 40. The old
  // 60-84/40-59 split is merged, and the band word is gone -- the headline
  // IS the outcome, not a feeling about it.
  endings: [
    {
      min: 85,
      // Screen 39.
      headline: "Bag Secured.",
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
