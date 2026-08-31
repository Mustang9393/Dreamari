import type { Level } from "./types";

// REGISTERED NURSE, LEVEL 1 (New Grad RN), from
// DreamAri_RegisteredNurse_Level1_Handoff.xlsx, tab "Level 1 New Grad RN" --
// built to the same SOP as the IB simulation: one idea per screen,
// teach-then-check pacing, the two-card character system with the power
// ladder, word-card flipbook vocabulary, spotlighted score explainer, D55
// feedback cards, plan lines on every scored beat.
//
// The stake is real and it is not a contest: nobody on this floor works
// alone until the floor says they are ready. Nursing has no
// two-of-six-get-offers scarcity, so this career never invents one.
//
// Beat ids are RN1-xx so they can never collide with the IB level's L1-xx
// keys in the shared BEAT_LOCATION map. Art: the four supplied character
// portraits are hero art on their own cards (no alpha cutouts yet -- see
// docs/handoff/sprite-master-prompt.md for the sprite order); rooms come
// from the six-plate Riverbend location library (locations.ts).
//
// Known blockers carried from the sheet, deliberately NOT invented around:
// salary/hours are proposals (no offer card exists in Level 1, so nothing
// ships them); endings are Draft pending approval; the rank beat uses the
// sheet's own three-band partial credit (whenClose), which the walkthrough
// flags as a rules conflict to settle for all 25 careers.

const ART = "/images/play/rn";

export const RN_LEVEL_1: Level = {
  id: "rn-l1",
  n: 1,
  role: "New Grad RN",
  title: "The First Year",
  blurb: "Four West, Riverbend Medical Center. Learn the language, watch your patients, and say it out loud the moment something changes.",
  cover: `${ART}/locations/station.jpg`,
  mood: "day",
  cast: {
    Rosa: `${ART}/face-rosa.jpg`,
    Denise: `${ART}/face-denise.jpg`,
    Tyler: `${ART}/face-tyler.jpg`,
    Yvonne: `${ART}/face-yvonne.jpg`,
  },
  beats: [
    // ---- arrival: one idea per screen ----
    {
      kind: "card",
      variant: "intro",
      id: "RN1-01",
      speaker: "Narrator",
      setup: "New Grad RN • Year 1",
      title: "Welcome to Riverbend Medical Center.",
      cta: "Continue",
    },
    {
      kind: "card",
      variant: "intro",
      id: "RN1-02",
      speaker: "Narrator",
      setup: "New Grad RN • Year 1",
      title: "Your first year as a nurse. Four West, a floor for people recovering from surgery or illness.",
      cta: "Continue",
    },
    {
      // The stakes line, and it is true: new nurses work beside an
      // experienced nurse before working on their own.
      kind: "card",
      variant: "intro",
      id: "RN1-03",
      speaker: "Narrator",
      setup: "New Grad RN • Year 1",
      title: "Nobody here works alone until the floor says they are ready. That takes about a year.",
      cta: "Continue",
    },
    {
      kind: "card",
      variant: "intro",
      id: "RN1-04",
      system: true,
      speaker: "System",
      setup: "What a nurse actually does",
      title: "Nurses watch patients closely, carry out their treatment, and speak up the moment something changes.",
      cta: "Continue",
    },
    {
      // The example on its own screen -- one idea per screen applies to the
      // lesson and its illustration too.
      kind: "card",
      variant: "intro",
      id: "RN1-04b",
      system: true,
      speaker: "System",
      title: "Here is what that looks like.",
      example: "A patient starts breathing faster at 2 AM. The nurse is the one who notices, and the one who makes the call.",
      cta: "Continue",
    },
    {
      // NOT SCORED, NOT A STRIKE: the check is what stops anyone who tapped
      // through the teach card without reading. Token-drag, per the SOP.
      kind: "check",
      method: "drag",
      id: "RN1-05",
      speaker: "System",
      setup: "Quick check before you start.",
      question: "A patient starts breathing badly at 2 AM. Who notices first?",
      prompt: "Press and hold the blue dot. Drag it to the answer.",
      options: [
        { label: "The nurse at the bedside", correct: true, why: "Right. The nurse is the one in the room." },
        { label: "The head of the hospital", correct: false, why: "Not this one. Try again." },
        { label: "The person who books appointments", correct: false, why: "Not this one. Try again." },
      ],
      cta: "Continue",
    },

    // ---- Rosa: two cards, the screen before she first acts ----
    {
      // Her background earns its place: it mirrors the path the player is
      // on, and "nursing assistant" is taught inside the sentence because a
      // later beat depends on the term.
      kind: "card",
      variant: "character",
      id: "RN1-06",
      speaker: "Narrator",
      castMember: "Rosa",
      setup: "Rosa • Staff Nurse",
      title: "She started here as a nursing assistant, helping patients wash and eat, while she was still at school.",
      cta: "Continue",
    },
    {
      kind: "card",
      variant: "character",
      id: "RN1-07",
      speaker: "Narrator",
      castMember: "Rosa",
      setup: "Rosa • Staff Nurse",
      title: "Rosa decides which patients you take. What she thinks of you reaches her manager before you do.",
      ladder: [
        { label: "You - New Graduate Nurse", lit: true },
        { label: "Rosa - Staff Nurse", lit: true },
        { label: "Denise - Nurse Manager", lit: false },
      ],
      cta: "Continue",
    },
    {
      // The two chips shown are the two the very next beat awards.
      kind: "reveal",
      id: "RN1-08",
      speaker: "System",
      resetScene: true,
      title: "Build real skills as you play.",
      prompt: "Tap a tag to see what it means.",
      rows: [
        { label: "Active Listening", reveal: "Listen carefully, understand others, and respond appropriately." },
        { label: "Decision-Making", reveal: "Compare options and make thoughtful choices." },
      ],
      note: "These are 2 of 15. Tap any tag, any time, to see what it means.",
      cta: "Continue",
    },

    // ---- scored beat 1: the deliberate easy win ----
    {
      kind: "choice",
      layout: "options",
      id: "RN1-09",
      planLineIfFailed: "you started your shift without finding out what had happened overnight",
      progress: 0.1,
      speaker: "Narrator",
      // Rosa is IN this scene ("Rosa meets you") -- the room must not be
      // empty while the line says she is standing in it.
      castMember: "Rosa",
      setup: "6:55 AM. Rosa meets you at the nurse station. The night nurse is still here.",
      question: "Day 1: What should you do first?",
      prompt: "Tap one.",
      choices: [
        { id: "a", label: "Start handing out medicine alone", tier: "wrong", why: "You do not know yet which patients are yours or what changed overnight." },
        { id: "b", label: "Get an update from the night nurse", tier: "best", why: "Right. The night nurse knows what happened. Ask before you touch anything." },
        { id: "c", label: "Wait until someone gives you a job", tier: "wrong", why: "Waiting feels safe, but nobody has time to come and find you." },
      ],
      feedback: "",
      feedbackCta: "Continue",
      skills: ["Active Listening", "Decision-Making"],
    },
    {
      // The score explainer, spotlit: the gauge debuts center screen, flies
      // to its slot, and runs the worked +5/-3 demo while this beat is up.
      kind: "reveal",
      id: "RN1-10",
      speaker: "System",
      spotlight: "score",
      setup: "That number in the corner just moved.",
      title: "Your reputation decides if you move up, repeat the year, or lose the job.",
      prompt: "Tap each outcome to reveal its score.",
      rows: [
        { label: "You lose the job", reveal: "under 40 · At Risk", color: "red" },
        { label: "No move up, start the year over", reveal: "40 to 84 · Cautious", color: "amber" },
        { label: "Promoted to Staff Nurse", reveal: "85 and above · Trusted", color: "green" },
      ],
      cta: "Continue",
    },
    {
      // Typed, not tapped: picking 85 off a list is recognition; typing it
      // is recall, and the student carries this number for six levels.
      kind: "check",
      method: "type",
      id: "RN1-11",
      speaker: "System",
      setup: "Quick check. Type the number, then press enter.",
      question: "What's the minimum amount of points you need to move up to the next level?",
      answer: "85",
      whyRight: "Right. 85 and above moves you up. Anything less and you play the year again.",
      hint: "At Risk under 40 · Cautious 40 to 59 · Respected 60 to 84 · Trusted 85 and above",
      cta: "Continue",
    },

    // ---- the language, taught before it is tested ----
    {
      // The word-card flipbook: one word per binder page, big term and
      // meaning together. Every one of these four is used later in a
      // scored beat; nothing is taught that is not needed.
      kind: "flips",
      id: "RN1-12",
      speaker: "Rosa",
      setup: '"Four words you will hear before lunch."',
      title: "Learn them now and the rest of the day makes sense.",
      prompt: "Tap the card for the next word.",
      cards: [
        { term: "Vitals", def: "The basic body numbers, like heart rate and temperature" },
        { term: "Chart", def: "The patient record, where everything gets written down" },
        { term: "Report", def: "The handover, when one nurse tells the next what happened" },
        { term: "Escalate", def: "Tell someone more senior, straight away" },
      ],
      cta: "Continue",
    },
    {
      // Request-to-action pairs: matching a word to what you DO with it is
      // what a first shift actually asks.
      kind: "match",
      id: "RN1-13",
      planLineIfFailed: "you could not follow a plain instruction from your own team",
      progress: 0.2,
      speaker: "Rosa",
      setup: '"I need four things from you, all at once."',
      question: "Match what she said to what you do.",
      prompt: "Tap a quote, then tap what you do.",
      pairs: [
        { term: '"Get her vitals."', def: "Check her heart rate and temperature" },
        { term: '"It is in the chart."', def: "Look in the patient record" },
        { term: '"Give me report."', def: "Tell her what happened on your shift" },
        { term: '"Escalate it."', def: "Tell someone more senior now" },
      ],
      whenRight: "Right. Four words, four things to actually go and do.",
      whenWrong: "Close. Vitals are numbers, the chart is the record, escalate means tell someone now.",
      feedback: "",
      feedbackCta: "Continue",
      skills: ["Reading Comprehension", "Active Learning"],
    },
    {
      kind: "rapid",
      id: "RN1-14",
      planLineIfFailed: "you got the basics wrong on things the floor expects a nurse to know cold",
      progress: 0.3,
      timer: 45,
      speaker: "Rosa",
      setup: '"Quick one. Every nurse needs these habits cold."',
      question: "Four quick questions on one shared timer.",
      prompt: "Four questions, one timer. Tap fast.",
      items: [
        {
          question: "Before you give a patient their medicine, what do you check first?",
          options: [
            { label: "The number on the door", correct: false, why: "Patients move beds. The door is not the person." },
            { label: "Their name and date of birth", correct: true, why: "Right. Two things that belong to the person, not to the room." },
            { label: "Whichever bed they are in", correct: false, why: "Beds get swapped all day. It is the commonest way the wrong person gets something." },
          ],
        },
        {
          question: "You are not sure about something Rosa asked you to do. What do you say?",
          options: [
            { label: '"It looks about right to me."', correct: false, why: "About right is not a check. If it is wrong, you said it was fine." },
            { label: '"Someone else can check that."', correct: false, why: "Maybe true, but it hands the problem back. She asked you." },
            { label: '"I will check before I do it."', correct: true, why: "Right. Honest, quick, and it commits you to closing the gap." },
          ],
        },
        {
          question: "You forgot to write down something you did two hours ago. What do you do?",
          options: [
            { label: "Write it now and put the real time", correct: true, why: "Right. Late and honest is a record. Late and hidden is not." },
            { label: "Leave it out, it is too late now", correct: false, why: "If it is not written down, as far as anyone else knows it never happened." },
            { label: "Write it as if it just happened", correct: false, why: "A record with the wrong time in it sends the next nurse the wrong way." },
          ],
        },
        {
          question: "What does escalate mean?",
          options: [
            { label: "Do it faster", correct: false, why: "Speed is not the point. Who hears about it is." },
            { label: "Write it down for later", correct: false, why: "Writing it down is not telling anyone." },
            { label: "Tell someone more senior now", correct: true, why: "Right. And on this floor, now means now." },
          ],
        },
      ],
      whenPass: "Right. Three of four means you can be trusted beside a patient.",
      whenFail: "You needed three of four. These four come up every single shift.",
      feedback: "",
      feedbackCta: "Continue",
      skills: ["Written Communication", "Decision-Making"],
    },

    // ---- the floor gets busy ----
    {
      // The sheet's own three-band scoring: all four right is Best, three
      // of four is Acceptable (whenClose), anything else Wrong. The
      // reasoning is available to anybody: most dangerous first, then
      // whoever could get hurt in the next minute.
      kind: "rank",
      id: "RN1-15",
      planLineIfFailed: "you went to the least urgent patient first while someone else was waiting on you",
      progress: 0.4,
      speaker: "Narrator",
      setup: "10:20 AM. Four patients need you at the same time. Rosa is in a room with the door shut.",
      question: "Put them in the order you go.",
      prompt: "Use the arrows to order them, then tap Submit rank.",
      order: [
        "A patient who says she cannot catch her breath",
        "A patient climbing out of bed on his own",
        "A patient whose pain medicine is due now",
        "A patient asking when lunch comes",
      ],
      whenRight: "Right. Breathing first, then the fall waiting to happen, then pain, then the question that can wait.",
      whenClose: "Three of four in the right place. Close enough to be safe, not yet the order an experienced nurse would take.",
      whenWrong: "Breathing comes before everything. Lunch comes after everything. The two in the middle are about who could get hurt in the next minute.",
      feedback: "",
      feedbackCta: "Continue",
      skills: ["Time Management", "Helping & Supporting Others"],
    },
    {
      kind: "choice",
      layout: "boss",
      id: "RN1-16",
      planLineIfFailed: "you went quiet when a senior nurse put you on the spot",
      progress: 0.5,
      speaker: "Narrator",
      setup: "A family told the morning meeting you explained things better than anyone all week. Your name was said out loud.",
      question: "What do you do?",
      prompt: "Choose one.",
      choices: [
        { id: "a", label: "Thank her, and name who helped you", tier: "best", why: "Right. Passing credit on costs nothing and makes people want you on their shift." },
        { id: "b", label: "Say it was nothing", tier: "wrong", why: "You were handed a moment on the record and you gave it straight back." },
      ],
      feedback: "",
      feedbackCta: "Continue",
      skills: ["Social Awareness", "Teamwork & Collaboration"],
    },
    {
      // Privacy: the -6 is genuinely how nurses lose their licence, and the
      // system logs every open.
      kind: "choice",
      layout: "blank",
      id: "RN1-17",
      planLineIfFailed: "you opened a patient record that was none of your business",
      progress: 0.6,
      speaker: "Rosa",
      setup: '"A patient record is private. The system logs every person who opens one."',
      question: "You may only open the record of a patient who is ___.",
      prompt: "Drag the right words into the space.",
      choices: [
        { id: "a", label: "yours today", tier: "best", why: "Right. If they are not your patient, you have no reason to be in there." },
        { id: "b", label: "someone you know", tier: "risky", why: "Looking up someone you know is how nurses lose their licence. Every open is logged with your name." },
        { id: "c", label: "on your floor", tier: "wrong", why: "Same floor is not the same as your patient. The log does not care which corridor you are on." },
      ],
      feedback: "",
      feedbackCta: "Continue",
      skills: ["Active Learning", "Critical Thinking"],
    },

    // ---- Denise: two cards, the screen before she first matters ----
    {
      kind: "card",
      variant: "character",
      id: "RN1-18",
      speaker: "Narrator",
      castMember: "Denise",
      setup: "Denise • Nurse Manager",
      title: "Nine years running Four West. She reads every handover note.",
      cta: "Continue",
    },
    {
      kind: "card",
      variant: "character",
      id: "RN1-19",
      speaker: "Narrator",
      castMember: "Denise",
      setup: "Denise • Nurse Manager",
      title: "Denise decides when you are ready to work on your own. Right now she is not sure who you are.",
      ladder: [
        { label: "You - New Graduate Nurse", lit: true },
        { label: "Rosa - Staff Nurse", lit: false },
        { label: "Denise - Nurse Manager", lit: true },
      ],
      cta: "Continue",
    },
    {
      // Three errors of two different kinds on ONE line, so nobody is
      // hunting for a subtlety.
      kind: "choice",
      layout: "document",
      doc: "Four West • Handover Note",
      id: "RN1-20",
      planLineIfFailed: "you passed on a handover note with mistakes still in it",
      progress: 0.7,
      timer: 40,
      speaker: "Rosa",
      tone: "conflict",
      resetScene: true,
      setup: '"Check tonight\'s handover note before Denise reads it. One line has three things wrong."',
      question: "Tap the line with the mistakes.",
      prompt: "Tap the line with the mistakes.",
      choices: [
        { id: "a", label: "Walked to the window twice today.", tier: "wrong", why: "This line is fine. Look for the one with more than one thing wrong." },
        { id: "b", label: "Family visiting after 6 PM.", tier: "wrong", why: "This line is fine. Look for the one with more than one thing wrong." },
        { id: "c", label: "Pain was 3 out of 10 at 4 PM.", tier: "wrong", why: "This line is fine. Look for the one with more than one thing wrong." },
        { id: "d", label: "Recieved his last dose on Febuary 30.", tier: "best", why: "Right. Recieved, Febuary, and February never has a 30th. Denise would see all three." },
      ],
      feedback: "",
      feedbackCta: "Continue",
      skills: ["Reading Comprehension", "Critical Thinking"],
    },

    // ---- Tyler: one card, no power card -- he has none. No background
    //      line of any kind: what he does is described, never explained. ----
    {
      kind: "card",
      variant: "character",
      id: "RN1-21",
      speaker: "Narrator",
      castMember: "Tyler",
      setup: "Tyler • New Grad RN",
      title: "The other new nurse from your first morning. He answers first in every room and never sounds unsure.",
      cta: "Continue",
    },
    {
      // Composure, every single time: the lesson is never to compete.
      kind: "choice",
      layout: "options",
      id: "RN1-22",
      planLineIfFailed: "you took a disagreement into a full room instead of handling it after",
      progress: 0.8,
      speaker: "Narrator",
      tone: "conflict",
      resetScene: true,
      // Tyler is IN this scene, claiming the catch -- his uncertain-tier
      // face carries the conflict tone.
      castMember: "Tyler",
      setup: "You spotted a rash on a patient yesterday and reported it. In the morning meeting, Tyler says he spotted it.",
      question: "What do you do?",
      prompt: "Tap one.",
      choices: [
        { id: "a", label: "Mention it to Rosa afterwards", tier: "best", why: "Right. Rosa was there and can put it back on the record without a scene." },
        { id: "b", label: "Tell Tyler later not to do that", tier: "acceptable", why: "It may stop him doing it again. The room still thinks he found it." },
        { id: "c", label: "Cut him off in the meeting", tier: "wrong", why: "You become the problem in the room, and the rash is forgotten." },
      ],
      feedback: "",
      feedbackCta: "Continue",
      skills: ["Persuasive Communication", "Social Awareness"],
    },
    {
      // The second -6: writing something down is not telling anyone.
      kind: "choice",
      layout: "options",
      id: "RN1-23",
      planLineIfFailed: "you saw a patient get worse and nobody heard about it in time",
      progress: 0.9,
      timer: 30,
      tone: "alarm",
      speaker: "Narrator",
      setup: "Your patient was fine an hour ago. Now she is confused and breathing fast. Rosa is with someone else.",
      question: "What do you do?",
      prompt: "Tap one before the timer runs out.",
      choices: [
        { id: "a", label: "Interrupt Rosa now", tier: "best", why: "Right. A sudden change is the one thing you interrupt anybody for." },
        { id: "b", label: "Ask another nurse nearby", tier: "acceptable", why: "Fine, and much faster than waiting. Rosa knows this patient and would still want to hear it." },
        { id: "c", label: "Check her again in ten minutes", tier: "wrong", why: "Ten minutes is a long time when someone is getting worse in front of you." },
        { id: "d", label: "Write it down and carry on", tier: "risky", why: "Writing it down is not telling anyone. Nobody reads a note in time." },
      ],
      feedback: "",
      feedbackCta: "See what happens next",
      skills: ["Problem-Solving", "Verbal Communication"],
    },
    {
      // The level opens on receiving report and closes on giving it.
      kind: "pick",
      id: "RN1-24",
      planLineIfFailed: "you handed over your patients without saying what actually mattered",
      progress: 1,
      speaker: "Narrator",
      setup: "7 PM. Your shift is ending. The night nurse sits down for report.",
      question: "Pick the three things she must hear.",
      prompt: "Tap three, then tap Submit.",
      pick: 3,
      cards: [
        { label: "Room 12 got worse this afternoon and was seen by the doctor", role: "pick" },
        { label: "Room 14 starts a new medicine at 10 PM", role: "pick" },
        { label: "Room 9 is waiting on test results tonight", role: "pick" },
        { label: "Room 12 watches the same show every evening", role: "leave" },
        { label: "You are hoping to swap a shift next week", role: "leave" },
        { label: "The coffee machine is broken", role: "leave" },
      ],
      whenRight: "Right. What changed, what is coming, and what is still open. Everything else can wait.",
      whenWrong: "Report is not everything you know. It is what she needs in order to keep three people safe overnight.",
      feedback: "",
      feedbackCta: "Continue",
      skills: ["Verbal Communication", "Critical Thinking"],
    },

    // ---- the close ----
    {
      // Rosa says this to every player regardless of score: it is what she
      // noticed, not what they achieved.
      kind: "card",
      variant: "chapter",
      id: "RN1-25",
      speaker: "Rosa",
      setup: '"Your first year is over. Before the floor decides whether you work on your own, come here a second."',
      title: '"You asked when you did not know, and you said it out loud when something changed."',
      body: '"I would take you on my shift."',
      cta: "Begin Final Review",
    },
    {
      kind: "review",
      id: "RN1-26",
      speaker: "System",
      setup: "Final Review",
      title: "Four West is deciding whether you are ready to work on your own.",
      body: "Your reputation decides it.",
    },
  ],
  // THREE outcomes, four screens (Endings tab): the 40-84 outcome has a
  // softer tone above 60 and a blunter one below, never shown as separate
  // results. Under 40 goes to termination, same as a failed plan.
  endings: [
    {
      min: 85,
      band: "Trusted",
      headline: "You are off orientation.",
      message: 'Rosa: "You asked when you did not know, and you said it out loud when something changed." That is the whole job, and you did it for a year.',
      subline: "Next year you carry your own patients. Nobody is checking behind you.",
      primary: "Unlock Level 2",
      advances: true,
    },
    {
      min: 60,
      band: "Respected",
      headline: "Not yet.",
      message: "You were safe, and safe is not the same as ready. The floor needs to see you catch things before somebody asks you to.",
      subline: "You start the year over, from day one.",
      primary: "Start over",
      advances: false,
    },
    {
      min: 40,
      band: "Cautious",
      headline: "Not this year.",
      message: "Too much got past you, and too much of it got past you quietly. Denise cannot put you in a room on your own yet.",
      subline: "You start the year over, from day one.",
      primary: "Start over",
      advances: false,
    },
    {
      min: 0,
      band: "At Risk",
      headline: "Terminated",
      message: "Riverbend is ending your job here. Someone walks you out. This is what being let go looks like.",
      subline: "This happens to real people, and most of them go on to do well somewhere else.",
      primary: "Start over",
      advances: false,
    },
  ],
};
