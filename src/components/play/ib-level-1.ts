import type { Level } from "./types";

// LEVEL 1 INTERN, from DreamAri_IB_Levels1-3_Handoff.xlsx, tab "Level 1 Intern".
// Copy is verbatim from the sheet: 25-word setups, 10-word options, 20-word
// feedback, no em dashes, written for a 13 year old. Scores are the PRODUCTION
// column, not the prototype's. Ten scored beats at 10% each.
//
// Art file names carry their beat id (IB L1-04 -> l1-04.webp). Three of the
// twenty-one screens still have their own hero illustration; the rest either
// inherit the last one (sticky, see SCENE_FRESH_BEATS in SimulationPlayer)
// or resolve a Cobalt Capital location instead (locations.ts). L1-01, L1-04
// and L1-15 dropped their shared l1-04.webp in favor of the reception scene
// supplied with a genuine separated background and character slots -- see
// "l1-reception" in locations.ts.
//
// Known gaps from the sheet, deliberately left as the sheet has them:
// - Feedback for the rapid-fire set is the sheet's own copy.

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
  },
  beats: [
    {
      kind: "card",
      variant: "intro",
      id: "L1-01",
      speaker: "Dreamy",
      pose: "happy",
      setup: "Intern • Week 1",
      title: "Welcome to Cobalt Capital.",
      body: "You're starting your summer internship in investment banking.",
      cta: "Continue",
    },
    {
      kind: "card",
      variant: "intro",
      id: "L1-02",
      speaker: "Dreamy",
      pose: "glasses",
      setup: "How Investment Banking Works",
      title: "Investment bankers help companies raise money and buy or sell businesses.",
      example:
        "Imagine a company wants to build 100 new hospitals but needs money. An investment bank helps find investors and organize the deal.",
      cta: "Continue",
    },
    {
      kind: "card",
      variant: "intro",
      id: "L1-03",
      speaker: "Dreamy",
      pose: "idea",
      setup: "Your Reputation",
      title: "Every decision changes your reputation.",
      body: "Your reputation decides if you get promoted, keep your position, or lose your job.",
      showBands: true,
      cta: "Start Internship",
    },
    {
      kind: "choice",
      layout: "options",
      id: "L1-04",
      progress: 0.1,
      castMembers: ["Christina", "Jordan"],
      speaker: "Narrator",
      pose: "happy",
      setup: "Christina welcomes you to Cobalt Capital. Jordan, another Intern, is starting too.",
      question: "Day 1: What should you do first?",
      choices: [
        { id: "a", label: "Join a client call", tier: "wrong", why: "Eager, but you can't help yet. Someone senior would cover for you." },
        { id: "b", label: "Lead a company sale", tier: "wrong", why: "Interns don't lead deals. This reads as not knowing the job." },
        { id: "c", label: "Complete systems training", tier: "best", why: "Right. Learn the systems first. Everything after depends on them." },
      ],
      feedback: "Doing training first shows you are ready to learn before jumping into real client work.",
      feedbackCta: "Continue",
      skills: ["Decision-Making", "Active Learning"],
    },
    {
      kind: "match",
      id: "L1-05",
      progress: 0.2,
      speaker: "Christina",
      setup: '"Before client work, learn the language of banking."',
      question: "Tap a term, then tap its match.",
      pairs: [
        { term: "Comps", def: "A list of similar companies" },
        { term: "Deck", def: "A slide presentation" },
        { term: "Model", def: "A spreadsheet of the numbers" },
        { term: "EOD", def: "End of the day" },
      ],
      whenRight: "Right. These four words come up on your first morning.",
      whenWrong: "Close. Comps are similar companies. A model is the spreadsheet, a deck the slides.",
      feedback: "Learning banking terms helps you follow along in meetings and speak up with confidence.",
      feedbackCta: "Continue",
      skills: ["Active Learning", "Reading Comprehension"],
    },
    {
      kind: "rapid",
      id: "L1-06",
      progress: 0.3,
      timer: 45,
      speaker: "Dreamy",
      pose: "alert",
      castMember: "Christina",
      setup: "Christina checks if you understand how Interns communicate before giving you client work.",
      question: "Four quick questions on one shared timer.",
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
      feedback: "You needed 3 of 4 correct to pass. Keep practicing!",
      feedbackCta: "Continue",
      skills: ["Written Communication", "Decision-Making"],
    },
    {
      kind: "choice",
      layout: "options",
      id: "L1-07",
      progress: 0.4,
      art: `${ART}/l1-07.webp`,
      artAlt: "Over-the-shoulder view of hands at a laptop showing charts, sunset skyline through the windows.",
      speaker: "Narrator",
      pose: "nervous",
      setup: "Christina gives you your first real assignment: a Nike slide due by 5 PM. It is 4 PM, and key numbers are missing.",
      question: "What do you do?",
      choices: [
        {
          id: "a",
          label: "Turn it in on time with a note that some numbers are missing",
          tier: "acceptable",
          why: "On time and honest beats making things up. But you had an hour.",
        },
        {
          id: "b",
          label: "Ask your boss for 30 more minutes to get the right numbers",
          tier: "best",
          why: "Right. Asking early gives Christina a choice. She'd rather hear it at 4.",
        },
        {
          id: "c",
          label: "Fill in numbers you made up and turn it in on time",
          tier: "risky",
          why: "Invented numbers end internships. Everything a bank sells is trust in its numbers.",
        },
      ],
      feedback: "Saying you don't know is better than guessing, it builds trust, especially when client work is on the line.",
      feedbackCta: "Continue",
      skills: ["Time Management", "Negotiation"],
    },
    {
      kind: "choice",
      layout: "boss",
      id: "L1-08",
      progress: 0.5,
      speaker: "Narrator",
      pose: "party",
      setup: "Your name made the deal email to the whole bank. You're on the record for helping close it.",
      question: "What do you do?",
      choices: [
        { id: "a", label: "Send a short thank-you to the deal lead", tier: "best", why: "Right. Two lines to the person who named you makes them do it again." },
        {
          id: "b",
          label: "Assume everyone already knows your contribution",
          tier: "wrong",
          why: "Nobody tracks your work as closely as you do. Ten seconds costs nothing.",
        },
      ],
      feedback: "Credit travels. Acknowledging the person who put your name forward makes them far more likely to do it again.",
      feedbackCta: "Continue",
      skills: ["Social Awareness", "Teamwork & Collaboration"],
    },
    {
      kind: "choice",
      layout: "blank",
      id: "L1-09",
      progress: 0.6,
      speaker: "Christina",
      setup: '"Before you share anything: client files stay secure."',
      question: "Client files belong in the secure ___.",
      choices: [
        { id: "a", label: "data room", tier: "best", why: "Right. A data room is a locked folder only approved people can open." },
        { id: "b", label: "group chat", tier: "risky", why: "Chats are how client files leak. Once shared, nobody knows where it goes." },
        { id: "c", label: "personal drive", tier: "wrong", why: "Your drive feels safe, but the bank can't lock or delete it." },
      ],
      feedback:
        "A data room is a locked online folder only approved people can open. A leaked client file can end a deal and cost the bank the client.",
      feedbackCta: "Continue",
      skills: ["Active Learning", "Decision-Making"],
    },
    {
      kind: "choice",
      layout: "document",
      doc: "Nike Deal • Intern Summary",
      id: "L1-10",
      progress: 0.7,
      speaker: "Christina",
      setup: '"Review the Nike summary before Marcus sees it. One line has a mistake."',
      // Production change from the sheet: the prompt now says the mistake is a
      // WRITING error, not a fact error (decision D07).
      question: "Tap the line with the writing mistake, not a fact mistake.",
      choices: [
        { id: "a", label: "Nike's revenue grew by 8% last year.", tier: "wrong", why: "Nothing wrong here. Look for something a reader spots instantly." },
        { id: "b", label: "Our team will send the full deck by end of day.", tier: "wrong", why: "This line is fine. Look for a writing error, not a fact." },
        { id: "c", label: "The client call is scheduled for Friday at 9 AM.", tier: "wrong", why: "This line is fine. Look for a writing error, not a fact." },
        { id: "d", label: "The deal is worth nine billion dollers.", tier: "best", why: "Right. Dollers should be dollars. Marcus will see it first." },
      ],
      feedback:
        "Dollers should be dollars. A typo next to a number is the first thing Marcus (VP) will see, and it makes the whole page look unchecked.",
      feedbackCta: "Continue",
      skills: ["Reading Comprehension", "Critical Thinking"],
    },
    {
      kind: "card",
      variant: "character",
      id: "L1-11",
      speaker: "Dreamy",
      castMember: "Jordan",
      pose: "curious",
      setup: "Jordan, Summer Intern",
      title: "Another intern.",
      body: "Same goal as you.",
      cta: "Continue",
    },
    {
      kind: "choice",
      layout: "options",
      id: "L1-12",
      progress: 0.8,
      showdown: { opponent: "Jordan" },
      art: `${ART}/l1-12.webp`,
      artAlt: "Jordan presenting a spreadsheet on a monitor to a seated manager, your coffee mug in the foreground.",
      speaker: "Narrator",
      pose: "puzzle",
      tone: "conflict",
      setup: "You built the comparison spreadsheet over three days. While you grabbed coffee, Jordan told your manager 'I made that.' You overheard it.",
      question: "What do you do?",
      choices: [
        {
          id: "a",
          label: "Walk back in calmly and mention one detail only you would know about the spreadsheet",
          tier: "best",
          why: "Right. Corrects the record without accusing anyone. Your manager draws the conclusion.",
        },
        {
          id: "b",
          label: "Raise it in your performance review, without blaming Jordan",
          tier: "acceptable",
          why: "Honest, but slow. By review time she's filed away who built what.",
        },
        {
          id: "c",
          label: "Pull Jordan aside after and tell them not to do that again",
          tier: "wrong",
          why: "Satisfying, but your manager still believes the wrong thing.",
        },
      ],
      feedback:
        "Correcting the record without accusing anyone works best. A specific detail proves the work is yours and lets your manager reach the conclusion.",
      feedbackCta: "Continue",
      skills: ["Persuasive Communication", "Social Awareness"],
    },
    {
      kind: "choice",
      layout: "options",
      id: "L1-13",
      progress: 0.9,
      timer: 30,
      tone: "alarm",
      art: `${ART}/l1-13.webp`,
      artAlt: "A desk buried in sticky notes and crumpled paper, a figure walking out with a box, an I'M OUT note on the door.",
      speaker: "Narrator",
      pose: "alert",
      setup: "Your intern partner quits at 3 PM, leaving half the 6 PM presentation undone. You've never even opened their slides.",
      question: "What do you do?",
      choices: [
        { id: "a", label: "Stay and finish both halves. You'll figure it out.", tier: "acceptable", why: "Leadership, yes. But nobody knows the deck is at risk until 6 PM." },
        {
          id: "b",
          label: "Tell your manager immediately and ask for a two-hour extension.",
          tier: "best",
          why: "Right. Telling her at 3 gives three hours. Silence gives none.",
        },
        {
          id: "c",
          label: "Submit your half and email the manager explaining what happened.",
          tier: "wrong",
          why: "Honest, but she gets half a deck and no time to fix it.",
        },
      ],
      feedback: "Stepping up when a teammate is gone shows you can lead, and senior bankers will notice.",
      feedbackCta: "See the team's decision",
      skills: ["Problem-Solving", "Negotiation"],
    },
    {
      // NEW BEAT in the handoff: written to reach ten scored questions and to
      // cover Teamwork & Collaboration.
      kind: "choice",
      layout: "options",
      id: "L1-14",
      progress: 1,
      speaker: "Narrator",
      pose: "curious",
      setup: "7 PM. Another intern is re-sorting 200 misprinted pages. Her deadline: 40 minutes. Yours: tomorrow. She hasn't asked for help.",
      question: "What do you do?",
      choices: [
        { id: "a", label: "Ask how long it'll take, then decide", tier: "best", why: "Right. Thirty seconds tells you if it's five minutes or two hours." },
        { id: "b", label: "Start re-sorting without asking", tier: "acceptable", why: "Generous, but you've committed your evening without knowing the size of it." },
        { id: "c", label: "Keep working. She didn't ask", tier: "wrong", why: "She didn't ask, but she didn't need to. Asking costs nothing." },
        { id: "d", label: "Tell her to check the printer settings next time", tier: "wrong", why: "True and useless. The pages are already printed." },
      ],
      feedback: "Asking how big a favour is before agreeing to it is not selfish. It is how you keep both promises.",
      feedbackCta: "Continue",
      skills: ["Teamwork & Collaboration", "Helping & Supporting Others"],
    },
    {
      kind: "card",
      variant: "chapter",
      id: "L1-15",
      castMember: "Christina",
      speaker: "Christina",
      setup: '"You stood out. You came in early, worked late, and made careful decisions under pressure."',
      title: "Your internship is complete.",
      body: '"I hope this works out. I would like to see you back here as an Analyst."',
      cta: "Begin Final Review",
    },
    {
      kind: "review",
      id: "L1-16",
      speaker: "Dreamy",
      pose: "party",
      setup: "Final Review",
      title: "Cobalt Capital is reviewing your internship.",
      body: "Your reputation will decide if you earn the return offer.",
    },
  ],
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
      subline: "You will play the internship again, the same one, from the beginning.",
      primary: "Play the internship again",
      advances: false,
    },
    {
      min: 0,
      band: "Cautious",
      headline: "No Return Offer This Summer",
      message:
        'Cobalt is not extending an offer this summer. Christina walks you out. "You have the work ethic. The judgment takes another run, and most people need one."',
      subline: "You will play the internship again, the same one, from the beginning.",
      primary: "Play the internship again",
      advances: false,
    },
  ],
};
