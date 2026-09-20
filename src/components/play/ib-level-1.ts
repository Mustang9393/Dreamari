import type { Level } from "./types";

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
  // Express mode (Level 1 Intern tab, "Express Mode" column): only the three
  // screens that teach the GAME rather than the JOB and add nothing a
  // returning player needs twice -- the quick-check setup card, and the two
  // Act Moments, which are celebratory pauses, not content. Every other
  // screen stays, including every character card and every scored beat.
  expressCut: ["L1-05", "L1-ACT1", "L1-CHECK"],
  beats: [
    // ---- Act 1: Learn the Game ----
    {
      kind: "card",
      variant: "intro",
      id: "L1-01",
      speaker: "Narrator",
      setup: "Intern • Week 1",
      title: "Welcome to Investment Banking. Your internship at Cobalt Capital starts today. Your first day begins now.",
      celebrate: true,
      cta: "Continue",
    },
    {
      kind: "card",
      variant: "intro",
      id: "L1-02",
      speaker: "Narrator",
      setup: "Intern • Week 1",
      title: "Nine weeks. Seven interns, including you. Only two will be invited back for a full-time job after college.",
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
      kind: "card",
      variant: "intro",
      id: "L1-04",
      system: true,
      speaker: "System",
      title: "Here is an example.",
      example: "A big sneaker company wants to open 100 new stores but does not have enough money. An investment bank helps find investors and arrange the deal so the company can expand.",
      cta: "Continue",
    },
    {
      kind: "card",
      variant: "intro",
      id: "L1-05",
      system: true,
      speaker: "System",
      title: "Quick check before you start. Let us see if you got it.",
      cta: "Continue",
    },
    {
      // Q1. Beat 1 is always the easy win (Interaction Rules): one obvious
      // right answer, three options, no timer.
      kind: "choice",
      layout: "options",
      dragEnabled: true,
      id: "L1-06",
      planLineIfFailed: "you could not yet say what an investment bank is for",
      progress: 0.1,
      speaker: "System",
      setup: "Quick check before you start.",
      question: "A shoe company wants to buy a smaller shoe company. Who helps organize the deal?",
      choices: [
        { id: "a", label: "An investment bank", tier: "best", why: "Right. That is the whole job in one sentence: banks help companies buy and sell other companies." },
        { id: "b", label: "A shoe designer", tier: "wrong", why: "A shoe designer makes the shoes. Nobody is asking them to arrange a sale." },
        { id: "c", label: "A delivery company", tier: "wrong", why: "A delivery company moves the boxes. Buying a company is a different problem." },
      ],
      feedback: "",
      feedbackCta: "Continue",
      skills: ["Reading Comprehension", "Active Learning"],
    },
    {
      kind: "card",
      variant: "character",
      id: "L1-07",
      speaker: "Christina",
      castMember: "Christina",
      setup: "Christina • Associate",
      title: "Time to meet your team. Christina is an Associate, two levels above you. She will guide you and give you direction throughout your internship.",
      cta: "Continue",
    },
    {
      kind: "card",
      variant: "character",
      id: "L1-08",
      speaker: "Christina",
      castMember: "Christina",
      setup: "Christina • Associate",
      title: "Christina decides what work you get, and her feedback reaches the people deciding your return offer.",
      ladder: [
        { label: "You - Intern", lit: true },
        { label: "Christina - Associate", lit: true },
        { label: "Marcus - Vice President", lit: false },
      ],
      cta: "Continue",
    },
    {
      kind: "reveal",
      id: "L1-09",
      speaker: "System",
      title: "You are building real career skills. Every decision in this game practices skills investment bankers use in real life.",
      prompt: "Tap any skill tag to see what it means.",
      rows: [
        { label: "Decision-Making", reveal: "Compare options and make thoughtful choices." },
        { label: "Active Learning", reveal: "Learn from new information and apply it." },
      ],
      note: "2 of 15 career skills. After each decision, we show you which skill you practiced.",
      cta: "Continue",
    },
    {
      kind: "card",
      variant: "intro",
      id: "L1-10",
      speaker: "Narrator",
      castMembers: ["Christina", "Jordan"],
      title: "Christina meets you at reception. Jordan, one of the other interns, is starting today too.",
      cta: "Continue",
    },
    {
      // Q2.
      kind: "choice",
      layout: "options",
      id: "L1-11",
      planLineIfFailed: "you reached for work that was above you before you could do the work in front of you",
      progress: 0.2,
      castMembers: ["Christina", "Jordan"],
      speaker: "Narrator",
      question: "Day 1: What should you do first?",
      choices: [
        { id: "a", label: "Complete systems training", tier: "best", why: "Right. Learn the systems first. Everything else depends on them." },
        { id: "b", label: "Join a client call", tier: "wrong", why: "Client calls are not yours yet, and you would not know what you were listening to." },
        { id: "c", label: "Lead a company sale", tier: "wrong", why: "Nobody hands a sale to someone on day one. Aim at what is actually in front of you." },
      ],
      feedback: "",
      feedbackCta: "Continue",
      skills: ["Decision-Making", "Active Learning"],
    },
    {
      kind: "card",
      variant: "intro",
      id: "L1-13",
      speaker: "Christina",
      castMember: "Christina",
      title: '"Before client work, you need to learn the language of IB." Two terms you will hear all the time.',
      cta: "Continue",
    },
    {
      kind: "focus",
      id: "L1-14",
      speaker: "Christina",
      castMember: "Christina",
      title: "Two terms you will hear all the time.",
      terms: [
        { term: "Comps", def: "Similar companies used for comparison." },
        { term: "Deck", def: "A slide presentation." },
      ],
    },
    {
      kind: "focus",
      id: "L1-15",
      speaker: "Christina",
      castMember: "Christina",
      title: "Two more.",
      terms: [
        { term: "Model", def: "A spreadsheet used to analyze the numbers." },
        { term: "EOD", def: "End of the day." },
      ],
    },
    {
      // Q3. NEW beat (20 Sept): tests the four words rather than only
      // showing them, and brings Act 1 to three scored beats.
      kind: "choice",
      layout: "blank",
      id: "L1-16",
      planLineIfFailed: "you could not yet use the words the desk uses",
      progress: 0.3,
      speaker: "System",
      setup: "One quick check on the four words.",
      question: "Christina asks for the ___ by EOD. She wants the slides.",
      choices: [
        { id: "a", label: "deck", tier: "best", why: "Right. Deck means the slides. EOD means she wants them today." },
        { id: "b", label: "comps", tier: "wrong", why: "Comps are the list of similar companies, not the slides." },
        { id: "c", label: "model", tier: "wrong", why: "The model is the spreadsheet behind the slides, not the slides themselves." },
      ],
      feedback: "",
      feedbackCta: "Continue",
      skills: ["Reading Comprehension", "Critical Thinking"],
    },
    {
      // Act 1 completion moment: a quick celebration, not a stopping
      // point. Auto-advances, no reading.
      kind: "card",
      variant: "act",
      id: "L1-ACT1",
      auto: true,
      speaker: "System",
      title: "Foundation Complete",
      body: "You know the basics.",
      cta: "Continue",
    },

    // ---- Act 2: Prove You're Client-Ready ----
    {
      kind: "card",
      variant: "intro",
      id: "L1-17",
      speaker: "Christina",
      castMember: "Christina",
      title: "You are about to work with billion-dollar clients and senior executives. Let us see if you can communicate like a pro.",
      cta: "Continue",
    },
    {
      // Q4. Under binary scoring all four sub-questions must be right; the
      // old three-of-four pass is retired.
      kind: "rapid",
      id: "L1-18",
      planLineIfFailed: "you missed the small rules of how people here talk to each other",
      progress: 0.4,
      timer: 45,
      speaker: "Christina",
      castMember: "Christina",
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
      whenPass: "Right. Short, honest, quick to flag, and you know the words. That is a teammate people trust with a client email.",
      whenFail: "Close. On a real desk any one of those four slips is the one people remember.",
      feedback: "",
      feedbackCta: "Continue",
      skills: ["Written Communication", "Decision-Making"],
    },
    {
      kind: "card",
      variant: "intro",
      id: "L1-19",
      speaker: "Christina",
      castMember: "Christina",
      title: "Client information is confidential. Always keep it secure.",
      cta: "Continue",
    },
    {
      // Q5.
      kind: "choice",
      layout: "options",
      dragEnabled: true,
      id: "L1-20",
      planLineIfFailed: "you were not careful yet with things that belong to the client",
      progress: 0.5,
      speaker: "System",
      setup: "Client information is confidential.",
      question: "Where should client files be stored?",
      choices: [
        { id: "a", label: "Data room", tier: "best", why: "Right. The data room is the locked room. That is the whole point of it." },
        { id: "b", label: "Personal drive", tier: "wrong", why: "A personal drive is yours, not the firm's. The moment you leave, the file leaves with you." },
        { id: "c", label: "Group chat", tier: "wrong", why: "A group chat cannot be taken back. One wrong person in the group and it is out." },
      ],
      feedback: "",
      feedbackCta: "Continue",
      skills: ["Critical Thinking", "Social Awareness"],
    },
    {
      kind: "card",
      variant: "character",
      id: "L1-21",
      speaker: "Marcus",
      castMember: "Marcus",
      setup: "Marcus • Vice President",
      title: "The moment has arrived. Meet Marcus. Eleven years at Cobalt. Since then, he has worked on billion-dollar deals and become one of the team's top leaders.",
      cta: "Continue",
    },
    {
      kind: "card",
      variant: "character",
      id: "L1-22",
      speaker: "Marcus",
      castMember: "Marcus",
      setup: "Marcus • Vice President",
      title: "Marcus is above Christina and helps decide who gets a return offer. Do great work, and Marcus will remember your name.",
      ladder: [
        { label: "You - Intern", lit: true },
        { label: "Christina - Associate", lit: false },
        { label: "Marcus - Vice President", lit: true },
      ],
      cta: "Continue",
    },
    {
      kind: "card",
      variant: "intro",
      id: "L1-23",
      speaker: "Marcus",
      castMembers: ["Marcus", "Christina"],
      title: '"If you return, you will work on major deals. First, prove you catch the details." Review the summary and find the mistakes.',
      cta: "Continue",
    },
    {
      // Q6.
      kind: "choice",
      layout: "document",
      doc: "Deal Summary • Intern Draft",
      id: "L1-24",
      planLineIfFailed: "you let a line with obvious errors go out to a client",
      progress: 0.6,
      speaker: "System",
      setup: "Review the summary and find the mistakes.",
      question: "Which line goes out wrong?",
      choices: [
        { id: "a", label: "The deal is worth nine billion dollers and closes on Febuary 31.", tier: "best", why: "Right. Dollers, Febuary, and February never has a 31st. Three errors in one line." },
        { id: "b", label: "Full deck by end of day.", tier: "wrong", why: "That line is fine. Look for the one with more than one thing wrong." },
        { id: "c", label: "Client call Friday, 9 AM.", tier: "wrong", why: "That line is fine. Look for the one with more than one thing wrong." },
        { id: "d", label: "The client's revenue grew by 8% last year.", tier: "wrong", why: "That line is fine. Look for the one with more than one thing wrong." },
      ],
      feedback: "",
      feedbackCta: "Continue",
      skills: ["Reading Comprehension", "Critical Thinking"],
    },
    {
      // Q7. Boss Moment, re-added 20 Sept: gold overlay, never red, counts
      // as one of the ten scored beats.
      kind: "choice",
      layout: "boss",
      id: "L1-25",
      planLineIfFailed: "you did not build a relationship with anyone senior when the chance was in front of you",
      progress: 0.7,
      speaker: "Narrator",
      setup: "Marcus sent the deal email to the whole team. Your name is on it.",
      question: "What do you do?",
      choices: [
        { id: "a", label: "Send a short thank-you to the deal lead", tier: "best", why: "Right. One short note to one person. That is how people remember you without you asking them to." },
        { id: "b", label: "Assume everyone already knows what you did", tier: "wrong", why: "Nobody is keeping a list of what you did. Being quiet about good work is not the same as being humble." },
        { id: "c", label: "Reply all thanking everybody", tier: "wrong", why: "Reply all turns a thank-you into a performance. The whole team did not need the email." },
      ],
      feedback: "",
      feedbackCta: "Continue",
      skills: ["Social Awareness", "Verbal Communication"],
    },
    {
      // Act 2 checkpoint: the main resume point of Level 1. Progress
      // autosaves throughout regardless; this is the only place the
      // student is OFFERED an exit.
      kind: "card",
      variant: "act",
      id: "L1-CHECK",
      speaker: "System",
      title: "Client Ready",
      body: "You passed your first major test. Checkpoint saved.",
      cta: "Continue Internship",
      secondaryCta: "Finish Later",
      secondaryHref: "/play",
    },

    // ---- Act 3: Survive the Internship ----
    {
      // Jordan has no power over the player -- one card, no ladder.
      kind: "card",
      variant: "character",
      id: "L1-26",
      speaker: "Jordan",
      castMember: "Jordan",
      setup: "Jordan • Intern",
      title: "Meet Jordan. Jordan wants one of those two return offers just as badly as you do. He is confident, competitive, and willing to play a little dirty to get ahead.",
      cta: "Continue",
    },
    {
      kind: "card",
      variant: "intro",
      id: "L1-27",
      speaker: "Narrator",
      castMember: "Jordan",
      art: `${ART}/l1-12.webp`,
      artAlt: "Jordan presenting a spreadsheet on a monitor to a seated manager, your coffee mug in the foreground.",
      title: "The next day. You spent three days building a spreadsheet. Then you hear Jordan tell a manager he built it.",
      cta: "Continue",
    },
    {
      // Q8. Five options, the only beat in Level 1 with more than four --
      // the wrong answers are the point. "Crash out" and "Subtweet him"
      // are deliberate voice, not to be softened.
      kind: "choice",
      layout: "options",
      dragEnabled: true,
      id: "L1-28",
      planLineIfFailed: "you handled being crossed in a way people noticed for the wrong reason",
      progress: 0.8,
      speaker: "Narrator",
      setup: "Jordan took credit for your work.",
      question: "What is your move?",
      choices: [
        { id: "a", label: "Speak to Christina privately", tier: "best", why: "Right. Quietly, to the one person whose opinion decides your offer. No audience, no argument." },
        { id: "b", label: "Call Jordan out in front of the team", tier: "wrong", why: "Now the room is watching two interns argue instead of noticing your work." },
        { id: "c", label: "Crash out", tier: "wrong", why: "Understandable. Also the only thing anyone will remember about the day." },
        { id: "d", label: "Ignore it and keep working", tier: "wrong", why: "Letting it go once is fine. Letting it go every time is how someone else ends up with your record." },
        { id: "e", label: "Subtweet him", tier: "wrong", why: "It will not stay subtle, and it puts the firm's business on the internet." },
      ],
      feedback: "",
      feedbackCta: "Continue",
      skills: ["Social Awareness", "Decision-Making"],
    },
    {
      kind: "card",
      variant: "intro",
      id: "L1-29",
      speaker: "Narrator",
      resetScene: true,
      art: `${ART}/l1-13.webp`,
      artAlt: "A desk buried in sticky notes and crumpled paper, a figure walking out with a box, an I'M OUT note on the door.",
      title: "3:00 PM. One of the interns on your project quits. Half the presentation is unfinished. It is due at 6:00 PM.",
      cta: "Continue",
    },
    {
      // Q9. Options deliberately close in length so the correct one does
      // not give itself away.
      kind: "choice",
      layout: "options",
      dragEnabled: true,
      id: "L1-30",
      planLineIfFailed: "you took on more than you could finish instead of saying so early",
      progress: 0.9,
      speaker: "Narrator",
      setup: "An intern quit, and now there is more work to finish.",
      question: "What do you send Christina?",
      choices: [
        { id: "a", label: '"Can you help me prioritize what is left?"', tier: "best", why: "Right. You flagged the problem early and got direction before the deadline." },
        { id: "b", label: '"I will get the intern to come back, even if it causes a scene."', tier: "wrong", why: "Dragging someone back is not your call, and the scene costs more than the slides." },
        { id: "c", label: '"I will just finish everything myself."', tier: "wrong", why: "Brave, and nobody finds out there is a problem until it is too late to fix." },
      ],
      feedback: "",
      feedbackCta: "Continue",
      skills: ["Time Management", "Verbal Communication"],
    },
    {
      kind: "card",
      variant: "intro",
      id: "L1-31",
      speaker: "Narrator",
      mood: "night",
      title: "6:00 PM. You made the deadline. But the night is not over. Interns here work about 75 hours a week, and tonight is not an average night.",
      cta: "Continue",
    },
    {
      kind: "card",
      variant: "intro",
      id: "L1-32",
      speaker: "Narrator",
      mood: "night",
      title: "7:00 PM. Another intern has 200 misprinted pages to fix. Her deadline is 40 minutes. Yours is tomorrow. She has not asked for help.",
      cta: "Continue",
    },
    {
      // Q10. Ranking, all or nothing: the exact order scores Best, every
      // other order scores Wrong. The tenth and final scored beat, so a
      // perfect run reaches 100 here and nowhere earlier.
      kind: "rank",
      id: "L1-33",
      planLineIfFailed: "you walked past someone who needed help on a night you had time to give",
      progress: 1,
      speaker: "Narrator",
      mood: "night",
      question: "Rank these from best to worst.",
      order: ["Ask how you can help", "Wish her luck and keep working", "Laugh and walk away"],
      whenRight: "Right. Offering costs you nothing tonight and it is the thing people remember about you.",
      whenWrong: "Wishing her luck is not unkind, it is just not help. Walking away from someone drowning at 7 PM is the one people repeat later.",
      feedback: "",
      feedbackCta: "Continue",
      skills: ["Social Awareness", "Critical Thinking"],
    },
    {
      // Not scored: the reputation movement it animates is the one
      // already awarded at L1-33, traveling into the ring.
      kind: "card",
      variant: "intro",
      id: "L1-34",
      speaker: "Narrator",
      mood: "night",
      spotlight: "score",
      title: "Christina saw how you handled it. She did not say anything, but she noticed. That could matter when return offers are decided.",
      cta: "Continue",
    },
    {
      // Praise made neutral: said to every student, including one
      // finishing well below the line, so the review that follows never
      // reads as a lie.
      kind: "card",
      variant: "chapter",
      id: "L1-35",
      speaker: "Christina",
      castMember: "Christina",
      resetScene: true,
      title: "Your internship is complete.",
      body: '"Nine weeks. However this lands, you did the work." Now it is time for your final review.',
      cta: "Begin Final Review",
    },
    {
      kind: "review",
      id: "L1-36",
      speaker: "System",
      setup: "Final Review",
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
      headline: "Bag Secured",
      message: "You earned the return offer. You will return after college as an Investment Banking Analyst.",
      subline: "Level 2 unlocked: Analyst.",
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
