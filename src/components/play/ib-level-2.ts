import type { Level } from "./types";

// LEVEL 2 ANALYST, from DreamAri_IB_Levels1-3_Handoff.xlsx, tab "Level 2 Analyst".
// Copy verbatim from the sheet; scores are the PRODUCTION column, which is where
// this level changes most -- the prototype ran +15/-10 with no middle tier, so
// the bar maxed out at question 4 of 11 and the last seven beats had no upside.
// Ten scored beats at 10% each, +5 / +2 / -3 / -6.
//
// Production changes from the sheet that ARE applied here:
// - L2-01: "and it's all worth it" cut from the offer card. It told the student
//   the answer to the question the app exists to help them decide (D10).
// - L2-02..06: reverted back to an unnamed "Cobalt HR" character (undoing an
//   earlier D11 experiment that briefly handed onboarding to Christina),
//   per direct instruction -- HR runs the onboarding carousel, then
//   Christina's own introduction (L2-07) follows right after it.
// - L2-21d: the sentence fragment is a question now, and "Flag it fast" is
//   lengthened so the right answer is not the conspicuously short one (D16).
// - Narrative cards do NOT advance the progress bar, per the Scoring Model tab,
//   even though the build moved it to 91 and 100 percent on them.
//
// Left as the sheet has it, deliberately:
// - L2-15's two market sizes: which one is correct is still open (D06). The beat
//   works either way, because the mistake IS the contradiction.
//
// L2-09, L2-10 and L2-19 each shipped, at one point, with their own hero art
// that read "LOUIS VUITTON" outright (a real trademark, and a contradiction
// of the story's own fictional client, Maison Laurent) -- the same defect
// hit L3-19 and L3-20. L2-10 and L2-19 have since been recomposed with the
// branding removed (see their own beat comments). L2-09 has NOT been
// corrected -- it currently runs the raw handoff art with the real
// branding still in it, deliberately, as a temporary placeholder on the
// pre-launch internal deployment (D08/D09 remain open). Swap it for
// corrected art before any public release.

const ART = "/images/play/ib";

export const IB_LEVEL_2: Level = {
  id: "ib-l2",
  n: 2,
  role: "Analyst",
  title: "Your First Big Deal",
  blurb: "Christina picked you for Cobalt's $30B Maison Laurent pitch. Jordan is on the same team.",
  cover: `${ART}/l2-23.webp`,
  mood: "day",
  cast: {
    Christina: `${ART}/face-christina.webp`,
    Jordan: `${ART}/face-jordan.webp`,
    Marcus: `${ART}/face-marcus.webp`,
    "Cobalt HR": `${ART}/face-cobalt-hr.webp`,
  },
  beats: [
    {
      kind: "card",
      variant: "offer",
      id: "L2-01",
      art: `${ART}/l2-02.webp`,
      artAlt: "A first-year analyst's desk at Cobalt Capital, city windows behind.",
      speaker: "Narrator",
      setup: "Your offer",
      title: "Cobalt Capital, Investment Banking Analyst.",
      facts: [
        { label: "Position", value: "Analyst · Year 1" },
        { label: "Salary", value: "$110,000 + bonus" },
        { label: "Hours", value: "80–90 / week" },
      ],
      body: "Standard for the industry. Long days early on, and the hours ease as you move up.",
      cta: "Accept Offer",
    },
    {
      kind: "card",
      variant: "step",
      id: "L2-02",
      // The offer card's own art is for the offer letter, not for HR -- it
      // stops here rather than bleeding into her onboarding steps.
      resetScene: true,
      speaker: "Cobalt HR",
      step: { at: 1, of: 5 },
      setup: '"Interns prove they can learn. Analysts prove they can be trusted."',
      title: "Research the client.",
      body: "Learn what the company wants and why it matters.",
      cta: "Continue",
    },
    {
      kind: "card",
      variant: "step",
      id: "L2-03",
      speaker: "Cobalt HR",
      step: { at: 2, of: 5 },
      title: "Build the numbers.",
      body: "Help calculate revenue, costs, profit, and deal value.",
      cta: "Continue",
    },
    {
      kind: "card",
      variant: "step",
      id: "L2-04",
      speaker: "Cobalt HR",
      step: { at: 3, of: 5 },
      title: "Check for mistakes.",
      body: "Catch errors before senior leaders or clients see them.",
      cta: "Continue",
    },
    {
      kind: "card",
      variant: "step",
      id: "L2-05",
      speaker: "Cobalt HR",
      step: { at: 4, of: 5 },
      title: "Update slides.",
      body: "Make sure the pitch deck is clear and accurate.",
      cta: "Continue",
    },
    {
      kind: "card",
      variant: "step",
      id: "L2-06",
      speaker: "Cobalt HR",
      step: { at: 5, of: 5 },
      title: "Take meeting notes.",
      body: "Track decisions, questions, and next steps.",
      cta: "Done",
    },
    {
      kind: "card",
      variant: "character",
      id: "L2-07",
      art: `${ART}/l2-07.webp`,
      artAlt: "Christina at a desk writing, a monitor of charts beside her, city windows behind.",
      speaker: "Narrator",
      setup: "Christina · Level 3 · Associate",
      title: "She checks your work before anyone senior sees it.",
      body: "Christina turns Analyst work into client-ready materials. You: Analyst → Christina: Associate.",
      cta: "Continue",
    },
    {
      kind: "card",
      variant: "character",
      id: "L2-08",
      art: `${ART}/l2-08.webp`,
      artAlt: "Marcus in a navy suit, seated, city windows behind.",
      speaker: "Narrator",
      setup: "Marcus · Level 4 · Vice President",
      title: "VPs lead deals and present to clients.",
      body: "Marcus is one level above Christina and helps lead the Maison Laurent pitch. Christina: Associate → Marcus: VP.",
      cta: "Continue",
    },
    {
      kind: "card",
      variant: "chapter",
      id: "L2-09",
      // TEMPORARY PLACEHOLDER: raw handoff art, real Louis Vuitton branding
      // baked in (see D08/D09 in this file's header comment). Live on the
      // pre-launch internal deployment ONLY, per explicit instruction --
      // swap for the corrected Maison Laurent art before any public
      // release and remove this note (resetScene kept so removing `art`
      // again falls back cleanly).
      resetScene: true,
      art: `${ART}/l2-09.webp`,
      artAlt: "Christina handing over a deal binder, Jordan at a monitor behind her.",
      speaker: "Narrator",
      setup: "Next episode · Level 2",
      title: "Your First Big Deal",
      body: "Christina picked you for Cobalt Capital's $30B Maison Laurent pitch. Watch out for Jordan. He is on the same team.",
      note: "Can you hold your own as an Analyst?",
      cta: "Start Level 2",
    },
    {
      kind: "choice",
      layout: "options",
      id: "L2-10",
      planLineIfFailed: 'you started on the wrong thing while something urgent sat untouched',
      progress: 0.1,
      // From the 2026-08-24 asset package (status READY). The clean
      // background still had "Louis Vuitton Pitch Materials" printed on a
      // binder spine on the desk -- patched out locally (the desk surface
      // extended over it) since the source asset itself wasn't corrected.
      art: `${ART}/l2-10.webp`,
      artAlt: "Christina gesturing toward Marcus with arms folded, a wall screen reading Deal Team Kickoff, seen from the boardroom table.",
      speaker: "Narrator",
      setup: "Christina introduces you to Marcus, the VP. The team pitches Maison Laurent tomorrow.",
      question: "What should you do first?",
      choices: [
        { id: "a", label: "Ask for your role and deadline", tier: "best", why: "Right. Analysts need context before speed. Two minutes saves a day." },
        { id: "b", label: "Start changing slides", tier: "wrong", why: "Fast feels productive, but you don't know which slides are yours." },
        { id: "c", label: "Wait for Jordan (Analyst)", tier: "wrong", why: "Waiting lets Jordan decide your role. Nobody is coming to assign you work." },
      ],
      feedback: "Strong start. Analysts need context before they move fast.",
      feedbackCta: "Continue",
      skills: ["Verbal Communication", "Time Management"],
    },
    {
      kind: "chain",
      id: "L2-11",
      planLineIfFailed: 'you built an argument for the client that did not hold together',
      progress: 0.2,
      speaker: "Narrator",
      setup: "Build the pitch one sentence at a time. All three parts have to connect.",
      question: "What is Cobalt's case for Maison Laurent?",
      steps: [
        {
          label: "Client goal",
          prompt: "What does Maison Laurent want?",
          options: [
            { label: "Grow globally", correct: true },
            { label: "Cut its marketing budget", correct: false },
            { label: "Sell fewer products", correct: false },
          ],
        },
        {
          label: "Cobalt strength",
          prompt: "Why is Cobalt a good fit?",
          options: [
            { label: "We have the biggest office", correct: false },
            { label: "Understands luxury brands", correct: true },
            { label: "We are the cheapest option", correct: false },
          ],
        },
        {
          label: "Outcome",
          prompt: "What can Cobalt help Maison Laurent earn?",
          options: [
            { label: "Investor trust", correct: true },
            { label: "A longer meeting", correct: false },
            { label: "More slides", correct: false },
          ],
        },
      ],
      whenRight: "Right. Goal, strength, outcome. Three sentences that hold together as one argument.",
      whenWrong: "Close. A pitch only works if all three parts connect. One weak link breaks it.",
      feedback: "A strong pitch is three sentences: what the client wants, why you can deliver, what they get. All three or none.",
      feedbackCta: "Continue",
      skills: ["Persuasive Communication", "Critical Thinking"],
    },
    {
      kind: "card",
      variant: "chapter",
      id: "L2-12",
      mood: "night",
      // Dreamy removed from the simulation (D62): the Narrator sets the
      // scene -- the office at night, most desks empty, one lamp on.
      speaker: "Narrator",
      setup: "Late night analyst grind",
      title: "Get through the work for tomorrow's Maison Laurent meeting.",
      note: "Morning review starts soon.",
      cta: "Start the late-night work",
    },
    {
      kind: "choice",
      layout: "tiles",
      id: "L2-13",
      planLineIfFailed: 'you could not explain a basic finance term you use every day',
      progress: 0.3,
      mood: "night",
      speaker: "Christina",
      setup: '"Marcus wants the numbers ready. Let\'s start simple."',
      question: "Profit means money a company keeps after paying ___.",
      choices: [
        { id: "a", label: "costs", tier: "best", why: "Right. Profit is what's left after everything the company spends." },
        { id: "b", label: "emails", tier: "wrong", why: "Emails cost nothing to send." },
        { id: "c", label: "meetings", tier: "wrong", why: "Meetings aren't something you subtract." },
        { id: "d", label: "rent", tier: "acceptable", why: "Rent is one cost, not all of them." },
      ],
      feedback: "Profit is what's left after costs. Rent is one cost, not all of them.",
      feedbackCta: "Continue",
      skills: ["Active Learning", "Reading Comprehension"],
    },
    {
      kind: "slider",
      id: "L2-14",
      planLineIfFailed: 'you passed work up the chain without checking where the numbers came from',
      progress: 0.4,
      mood: "night",
      speaker: "Christina",
      setup: '"I need the model before Marcus reviews it. You aligned at kickoff, so I am not checking behind you on this one."',
      question: "How risky is it to send Marcus the model without checking the source?",
      steps: [
        { label: "Low", tier: "risky", why: "Not low. If the source is wrong, Marcus repeats it to the client." },
        { label: "Medium", tier: "wrong", why: "Higher. Christina trusts you now, so nobody checks behind you." },
        { label: "High", tier: "best", why: "Right. High. It can still be caught, but only if someone catches it." },
        { label: "Critical", tier: "acceptable", why: "Close. Critical is for things you can't undo. This is still fixable." },
      ],
      feedback: "Sending an unchecked number up the chain is high risk. Not medium, because nobody checks behind you.",
      feedbackCta: "Continue",
      skills: ["Critical Thinking", "Decision-Making"],
    },
    {
      kind: "choice",
      layout: "document",
      id: "L2-15",
      planLineIfFailed: 'you let two slides contradict each other and neither of us caught it',
      progress: 0.5,
      mood: "night",
      speaker: "Christina",
      setup: '"It is nearly midnight and I need this clean. Check every page for inconsistencies before it goes to Maison Laurent."',
      question: "Tap the line that creates an inconsistency in the deck.",
      choices: [
        { id: "a", label: "Slide 3: Luxury shoppers are spending more online.", tier: "wrong", why: "Nothing here conflicts with another slide." },
        { id: "b", label: "Slide 4: Market size is $18B.", tier: "wrong", why: "This matches the research. The conflict is later." },
        { id: "c", label: "Slide 5: Maison Laurent has strong brand loyalty.", tier: "wrong", why: "Nothing here conflicts with another slide." },
        { id: "d", label: "Slide 6: Market size is $27B.", tier: "best", why: "Right. Slide 4 already said 18. Two market sizes in one deck." },
        { id: "e", label: "Slide 7: Growth is expected across Asia and Europe.", tier: "wrong", why: "Nothing here conflicts with another slide." },
      ],
      feedback: "Two slides can't claim two market sizes. Clients notice contradictions faster than mistakes.",
      feedbackCta: "Continue",
      skills: ["Critical Thinking", "Reading Comprehension"],
    },
    {
      kind: "card",
      variant: "chapter",
      id: "L2-16",
      // Dreamy removed from the simulation (D62): navy mode ends, morning
      // light across the same desks, no character on screen.
      speaker: "Narrator",
      setup: "Next morning",
      title: "You made it through the late-night prep.",
      body: "It is now 9:00 AM, and the Maison Laurent review is about to begin.",
      cta: "Start morning review",
    },
    {
      kind: "flags",
      id: "L2-17",
      planLineIfFailed: 'you signed off on someone else\'s work with errors still in it',
      progress: 0.6,
      timer: 60,
      speaker: "Narrator",
      castMember: "Jordan",
      tone: "alarm",
      setup: "It is 10:10 AM. The meeting is in 20 minutes. There are errors in Jordan's work, and you have to fix them before Christina and Marcus come in.",
      question: "Tap every red flag in Jordan's work.",
      rows: [
        { label: "Bags sold: 2", flag: false, why: "Not an error. Two is small, but not wrong." },
        { label: "Price per bag: $2,000", flag: false, why: "Not an error. That's a normal price." },
        { label: "Revenue: 2 × $2,000 = $400", flag: true, why: "Right. 2 × $2,000 is $4,000, not $400." },
        { label: "Profit: $4,000 − $1,000 = $5,000", flag: true, why: "Right. $4,000 minus $1,000 is $3,000. Subtracting can't grow a number." },
        { label: "Source: Missing", flag: true, why: "Right. A number nobody can check should never reach a client." },
      ],
      whenRight: "Right. The multiplication, the subtraction, and the missing source.",
      whenWrong: "Three lines are wrong: the multiplication, the subtraction, and the missing source.",
      feedback: "Three errors: the multiplication, the subtraction, and the missing source. Checking work means redoing the maths.",
      feedbackCta: "Continue",
      skills: ["Critical Thinking", "Helping & Supporting Others"],
    },
    {
      kind: "card",
      variant: "character",
      id: "L2-18",
      art: `${ART}/l2-18.webp`,
      artAlt: "Jordan standing over a desk of printouts, Christina working behind him.",
      speaker: "Jordan",
      setup: '"Thanks for fixing the numbers. I still think I should get promoted to Associate before you."',
      title: "Jordan responds.",
      note: "The one-sided rivalry continues.",
      cta: "Continue",
    },
    {
      kind: "choice",
      layout: "options",
      id: "L2-19",
      planLineIfFailed: 'you handled yourself badly in front of a client',
      progress: 0.7,
      // From the 2026-08-24 asset package (status READY). The clean
      // background still had a "Louis Vuitton Meeting" label on a folder on
      // the desk -- patched out locally (filled with the folder's own black)
      // since the source asset itself wasn't corrected.
      art: `${ART}/l2-19.webp`,
      artAlt: "Christina standing at a laptop, a colleague at the window behind her, your hands taking notes in the foreground.",
      speaker: "Christina",
      setup: '"You earned a seat in the Maison Laurent meeting. Listen closely and take notes."',
      question: "What should you do during the meeting?",
      choices: [
        { id: "a", label: "Take clear notes on what the client says", tier: "best", why: "Right. You were told to listen. Doing your actual job gets you invited back." },
        { id: "b", label: "Start pitching the deck to the client", tier: "risky", why: "Pitching is the VP's job. Doing it uninvited embarrasses Christina." },
        { id: "c", label: "Ask a bunch of questions during the meeting", tier: "acceptable", why: "Good instinct, wrong room. Write them down and ask Christina after." },
      ],
      feedback: "You were told to listen and take notes. Doing the job you were given gets you invited back.",
      feedbackCta: "Continue",
      skills: ["Active Listening", "Written Communication"],
    },
    {
      kind: "match",
      id: "L2-20",
      planLineIfFailed: 'you mixed up terms in a client conversation',
      progress: 0.8,
      // L2-19's art is Christina's own moment in the client meeting -- it
      // stops here rather than bleeding into Marcus's assessment beat
      // (L2-21) two beats later.
      resetScene: true,
      speaker: "Narrator",
      setup: "You heard these words in the meetings. Learn the deal lingo.",
      question: "Tap a term, then tap its match.",
      pairs: [
        { term: "Valuation", def: "What a company may be worth" },
        { term: "Pitch", def: "Why the client should pick us" },
        { term: "Due Diligence", def: "Checking every number and fact" },
        { term: "Margin", def: "Profit as a percent of sales" },
      ],
      whenRight: "Right. These four words come up in every deal conversation.",
      whenWrong: "Close. Valuation is what a company may be worth. Due diligence is the checking.",
      feedback: "Valuation, pitch, due diligence, margin. Following a meeting means not stopping to translate.",
      feedbackCta: "Continue",
      skills: ["Active Learning", "Reading Comprehension"],
    },
    {
      // Level 2's rapid-fire model has NO timer, unlike Level 1's shared clock.
      kind: "rapid",
      id: "L2-21",
      planLineIfFailed: 'you got quick, everyday questions wrong under time pressure',
      progress: 0.9,
      speaker: "Marcus",
      setup: '"Let me check you actually understand this deal, not just the tasks. I noticed your answer at kickoff."',
      question: "Four questions, scored as one beat.",
      items: [
        {
          question: "What does profit mean?",
          options: [
            { label: "Revenue minus costs", correct: true, why: "Right. What's left after costs." },
            { label: "Office rent and supply costs", correct: false, why: "Rent and supplies are costs, not profit." },
            { label: "Total money the company brings in before any bills are paid", correct: false, why: "That's revenue. Money in before anything is paid out." },
          ],
        },
        {
          question: "What is valuation?",
          options: [
            { label: "A pitch deck layout", correct: false, why: "That's the slide design, not the company's worth." },
            { label: "An estimate of worth", correct: true, why: "Right. An estimate, which is why two banks can disagree." },
            { label: "The exact price of one share on the stock market today", correct: false, why: "Share price you can look up. Valuation is a judgment." },
          ],
        },
        {
          question: "Before Marcus (VP) reviews work, who checks it?",
          options: [
            { label: "Christina (Associate)", correct: true, why: "Right. Work moves up one level at a time." },
            { label: "The managing director", correct: false, why: "The MD is above Marcus. Work doesn't skip two levels." },
            { label: "The client directly", correct: false, why: "Nothing reaches the client until everyone inside has checked it." },
          ],
        },
        {
          // The sheet's prompt was a fragment, and "Flag it fast" was the
          // conspicuously short option, which gave the answer away (D16).
          question: "What do you do when two numbers do not match?",
          options: [
            { label: "Change the numbers quietly so no one sees the mistake", correct: false, why: "Quiet changes turn small errors into serious ones. Someone will ask." },
            { label: "Wait and see if anyone asks about it", correct: false, why: "Waiting means the wrong number may reach the client first." },
            { label: "Flag it fast, before the deck moves on", correct: true, why: "Right. Flagging fast gives the team time. Nobody's punished for finding it early." },
          ],
        },
      ],
      whenPass: "Right. Marcus checks whether you understand the deal or just did the tasks.",
      whenFail: "He's checking understanding, not effort. Worth another run.",
      feedback: "Marcus asks fast questions to see if you understand the deal or only did the tasks.",
      feedbackCta: "Continue",
      skills: ["Active Learning", "Critical Thinking"],
    },
    {
      // NEW BEAT in the handoff: written to reach ten scored questions and to
      // cover Problem-Solving.
      kind: "choice",
      layout: "options",
      id: "L2-22",
      planLineIfFailed: 'you missed a deadline that had been on your calendar for a week',
      progress: 1,
      timer: 30,
      mood: "night",
      tone: "alarm",
      art: `${ART}/l2-23.webp`,
      artAlt: "Two spreadsheet pages side by side, one arrow up and one down, an empty office behind.",
      speaker: "Narrator",
      setup: "1 AM. One page says sales went up. Another says the company made less money. Both can't be true. Christina left hours ago.",
      question: "What do you do?",
      choices: [
        { id: "a", label: "Check where each page got its numbers", tier: "best", why: "Right. Check where each page got its numbers. One of them is wrong." },
        { id: "b", label: "Start the spreadsheet over", tier: "acceptable", why: "Slow, but honest. You'd find it, and lose the night doing it." },
        { id: "c", label: "Send it to Christina to find", tier: "wrong", why: "She left hours ago. This one is yours to solve tonight." },
        { id: "d", label: "Use the better number, drop the other", tier: "risky", why: "Dropping the number that doesn't fit is how a wrong figure reaches a client." },
      ],
      feedback: "One page says sales rose, another says money fell. Find where each number came from.",
      feedbackCta: "Continue",
      skills: ["Problem-Solving", "Teamwork & Collaboration"],
    },
    {
      kind: "card",
      variant: "chapter",
      id: "L2-23",
      art: `${ART}/l2-23.webp`,
      artAlt: "Christina gesturing with a notebook, Marcus with folded arms beside her.",
      speaker: "Christina",
      setup: '"You caught the model issues, stayed late, and took strong notes. Marcus said you handled the pressure well."',
      title: "Your team notices you.",
      cta: "Continue",
    },
    {
      kind: "card",
      variant: "chapter",
      id: "L2-24",
      speaker: "Marcus",
      setup:
        '"Jordan is also being considered. He built strong relationships with senior leaders. At the Associate level strong work is expected, and to keep rising, leaders need to hear your thinking."',
      title: "The plot twist.",
      body: "You knew the details. Jordan was more visible.",
      note: "The real lesson is just beginning.",
      cta: "Begin final review",
    },
    {
      kind: "review",
      id: "L2-25",
      // The review is deliberately not routed to any location (see
      // locations.ts) -- it should read as the abstract, liminal
      // AmbientBackdrop, not keep showing L2-23's debrief art.
      resetScene: true,
      // A SYSTEM card (D62): no avatar, no name. The game talking, not a
      // person -- the final review is a rule, not a moment.
      speaker: "System",
      setup: "Final review",
      title: "Cobalt Capital is reviewing your Analyst performance.",
      body: "Your reputation will decide if you are promoted.",
    },
  ],
  endings: [
    {
      min: 85,
      band: "Trusted",
      headline: "Promoted to Associate",
      message: "Congratulations! You earned the promotion. You will now lead work as an Associate.",
      subline: "Next up: your first leadership role.",
      primary: "Claim Your Reward",
      advances: true,
    },
    {
      min: 60,
      band: "Respected",
      headline: "Another Year as Analyst",
      message:
        'No promotion this cycle. Christina is direct about it: "The work was there. Marcus needs to hear you think out loud, not just read what you wrote."',
      subline: "You will play the Analyst year again, the same one, from the beginning. Aim higher this time.",
      primary: "Play the Analyst year again",
      advances: false,
    },
    {
      min: 40,
      band: "Cautious",
      headline: "Performance Review",
      message:
        'Cobalt is putting your Analyst year under review. Christina: "The pace is real and it caught you. It catches most people. Go again."',
      subline: "You will play the Analyst year again, the same one, from the beginning.",
      primary: "Play the Analyst year again",
      advances: false,
    },
    {
      // E-TERM (Endings tab): under 40, or a failed performance plan. Deep
      // red, no confetti. Reputation resets and the year restarts.
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
