import type { Level } from "./types";

// LEVEL 1 NEW GRADUATE NURSE, v2 -- the LAB build of the "NEW GRADUATE NURSE
// Simulation" script (5 Oct 2026, Downloads PDF), at
// /play/registered-nurse?v=2 (Quick links "Nursing sim v2 LAB"), beside the
// live Level 1 and its Express mode, which are untouched. Built the same way
// as the IB v2 lab: How to Play and the career mini lesson outside the story
// (`preGame`), then the level. Screen numbers below are the script's.
//
// Art follows the script's IMAGE line per screen, through the RN art manifest
// (src/components/play/art/registered-nurse.json): "RN FLOOR 1" is the
// existing nurses' station, "RN HALLWAY" the corridor, "RN BREAK ROOM" the
// staff room, "DA RN SIM ROSA / DENISE / TYLER" that character's sprite
// standing at the station. The three new images went through the art
// pipeline (`npm run art:process -- registered-nurse`): "RN FLOOR NIGHT" is
// the new riverbend-station-night room, and "RN PATIENT HIGH NEED 1 / 2" are
// the hero scenes on RN2-23 and RN2-43 (first person, Room 12's patient).
//
// Scoring: ten scored decisions at +5 (the script's own "+5 Reputation" on
// every verdict); Tyler's beat and the overdue-medication recovery are
// unscored applied decisions ("No Reputation change needed"). Time is the
// level's other character: the schedule is on screen at 6 and 29, a crisis
// knocks it off at 47.
//
// Where the script gives only the right answer's verdict, the wrong answers'
// one-line "why" is written here in the same voice; those lines are marked
// for Joshua's review in docs/AI_HANDOFF.md.

const ART = "/images/play/rn";

export const RN_LEVEL_1_V2: Level = {
  id: "rn-l1-v2",
  n: 1,
  role: "New Graduate Nurse",
  title: "The First Year",
  blurb: "Four West, Riverbend Medical Center. Four patients, a short-staffed floor, and a clock that never stops.",
  cover: `${ART}/locations/station-hero.webp`,
  mood: "day",
  cast: {
    Rosa: `${ART}/face-rosa.jpg`,
    Denise: `${ART}/face-denise.jpg`,
    Tyler: `${ART}/face-tyler.jpg`,
  },
  hideBand: true,
  directed: true,
  points: 5,
  saveSlot: 202,
  qaSkip: true,
  // Screen 55: "Button: Start Over", so no fix-your-misses round.
  noRepair: true,
  // The script has no three-strikes plan, and its endings show only the
  // buttons it writes.
  noStrikes: true,
  plainEndings: true,
  preGame: {
    // The IB reference copy, said for a hospital floor.
    startLabel: "Start Shift",
    skipLabel: "Skip to the shift",
    handoffLine: "Your first shift starts now.",
    howToCta: "Start your first shift",
    tiers: [
      { label: "Off orientation" },
      { label: "Not yet" },
      { label: "Terminated" },
    ],
    ladder: ["New Graduate Nurse", "Staff Nurse", "Charge Nurse", "Nurse Manager", "Director of Nursing", "Chief Nursing Officer"],
    skills: ["Time Management", "Communication", "Attention to Detail"],
    skillTotal: 15,
    lesson: {
      title: "Nursing 101",
      screens: [
        // M1.
        {
          kind: "say",
          icon: "care",
          heading: "What does a registered nurse actually do?",
          body: "Nurses care for patients, watch for changes, give treatment, and keep the care team informed.",
          image: `${ART}/locations/patient-room.jpg`,
          cta: "See an Example",
        },
        // M2.
        {
          kind: "say",
          icon: "care",
          heading: "Real example",
          body: "A patient starts breathing differently. The nurse notices the change and gets help.",
          image: `${ART}/locations/patient-room.jpg`,
          cta: "Quick Check",
        },
        // M3. No Reputation: the simulation has not started yet.
        {
          kind: "check",
          heading: "Quick check",
          // M3 is a tap question, not the IB lesson's drag.
          method: "tap",
          question: "A patient's condition suddenly changes. Who is most likely to notice first?",
          options: [
            { label: "The nurse caring for them", correct: true },
            { label: "The hospital CEO", correct: false },
            { label: "The person scheduling appointments", correct: false },
          ],
          image: `${ART}/locations/patient-room.jpg`,
          cta: "Start Level 1",
        },
      ],
    },
  },
  beats: [
    {
      // Screen 1.
      kind: "card",
      variant: "intro",
      id: "RN2-01",
      speaker: "Narrator",
      title: "Welcome to Riverbend Medical Center.",
      body: "Your first year as a nurse starts today.",
      bodyLarge: true,
      celebrate: true,
      cta: "Continue",
    },
    {
      // Screen 2.
      kind: "card",
      variant: "intro",
      id: "RN2-02",
      speaker: "Narrator",
      title: "Welcome to Four West.",
      body: "A busy hospital floor for people recovering from surgery or illness.",
      cta: "Continue",
    },
    {
      // Screen 3, the stakes. "Keep the second line large."
      kind: "card",
      variant: "intro",
      id: "RN2-03",
      speaker: "Narrator",
      title: "Today, you’re short-staffed.",
      body: "One nurse called out. The patients didn’t.",
      bodyLarge: true,
      cta: "Continue",
    },
    {
      // Screen 4.
      kind: "card",
      variant: "character",
      id: "RN2-04",
      speaker: "Rosa",
      castMember: "Rosa",
      setup: "Rosa • Staff Nurse",
      title: "Rosa is the experienced nurse working beside you.",
      body: "She started at Riverbend as a nursing assistant while she was still in school.",
      cta: "Continue",
    },
    {
      // Screen 5.
      kind: "card",
      variant: "character",
      id: "RN2-05",
      speaker: "Rosa",
      castMember: "Rosa",
      setup: "Rosa • Staff Nurse",
      title: "Rosa decides which patients you take.",
      body: "What she thinks of you reaches her manager before you do.",
      ladder: [
        { label: "New Graduate Nurse • You", lit: true },
        { label: "Staff Nurse • Rosa", lit: true },
        { label: "Nurse Manager", lit: false },
      ],
      cta: "Continue",
    },
    {
      // Screen 6, the clock starts. The schedule is the screen's main visual.
      kind: "card",
      variant: "intro",
      id: "RN2-06",
      speaker: "Narrator",
      title: "Your assignment",
      body: "Four patients. Four different schedules.",
      schedule: [
        { time: "10:00", room: "Room 9", task: "Medication due" },
        { time: "10:00", room: "Room 12", task: "Assessment due" },
        { time: "10:30", room: "Room 14", task: "Reposition" },
        { time: "11:00", room: "Room 16", task: "Medication due" },
      ],
      scheduleNote: "And everything still has to be documented.",
      cta: "Continue",
    },
    {
      // Screen 7, the level's theme in Rosa's two lines.
      kind: "card",
      variant: "intro",
      id: "RN2-07",
      speaker: "Rosa",
      castMember: "Rosa",
      title: "“Stay ahead of the clock. Once you fall behind, everything stacks up.”",
      body: "“And if you can’t be everywhere, tell me what can’t wait.”",
      cta: "Start Shift",
    },
    {
      // Screens 8 + 9. Scored 1.
      kind: "choice",
      layout: "options",
      id: "RN2-08",
      planLineIfFailed: "you started on the floor before you knew what happened overnight",
      progress: 0.1,
      speaker: "Narrator",
      castMember: "Rosa",
      reactor: "Rosa",
      // Screen 8 is one screen: the time line, Rosa, and the question.
      inlineSetup: true,
      keepScene: true,
      setup: "6:55 A.M. The night nurse is still here.",
      question: "What should you do first?",
      choices: [
        { id: "a", label: "Get report from the night nurse", tier: "best", why: "You got the handoff before taking over. Now you know what happened overnight." },
        { id: "b", label: "Start handing out medication", tier: "wrong", why: "Not before you know what changed overnight. One missed detail and the dose is wrong." },
        { id: "c", label: "Wait for Rosa to tell you what to do", tier: "wrong", why: "Rosa has her own patients. The night nurse is leaving, and only she knows the night." },
      ],
      feedback: "",
      feedbackCta: "Continue",
      skills: ["Active Listening", "Decision-Making"],
    },
    {
      // Screen 10.
      kind: "card",
      variant: "intro",
      id: "RN2-10",
      speaker: "Rosa",
      castMember: "Rosa",
      title: "“Four words you’ll hear all shift.”",
      cta: "First Word",
    },
    {
      // Screens 11-14, one word at a time.
      kind: "flips",
      id: "RN2-11",
      speaker: "Narrator",
      // The script titles no screen here; the cards speak for themselves.
      title: "",
      cards: [
        { term: "Vitals", def: "Basic body numbers, like heart rate and temperature." },
        { term: "Chart", def: "The patient’s medical record." },
        { term: "Report", def: "When one nurse tells the next what happened." },
        { term: "Escalate", def: "Tell someone more senior right away." },
      ],
      cta: "Continue",
    },
    {
      // Screens 15 + 16. Scored 2.
      kind: "match",
      id: "RN2-15",
      planLineIfFailed: "you could not yet turn the floor's words into the right action",
      progress: 0.2,
      speaker: "Rosa",
      castMember: "Rosa",
      question: "Match what Rosa said to what you do.",
      prompt: "Tap a phrase, then tap the matching action.",
      pairs: [
        { term: "“Get her vitals.”", def: "Check her heart rate and temperature" },
        { term: "“It’s in the chart.”", def: "Look in the patient record" },
        { term: "“Give me report.”", def: "Tell her what happened" },
        { term: "“Escalate it.”", def: "Tell someone more senior now" },
      ],
      whenRight: "You know the words and what to do when you hear them.",
      whenWrong: "Close. Vitals are the numbers, the chart is the record, report is the handoff, and escalate means tell someone now.",
      feedback: "",
      feedbackCta: "Continue",
      skills: ["Reading Comprehension", "Active Learning"],
    },
    {
      // Screen 17.
      kind: "card",
      variant: "intro",
      id: "RN2-17",
      speaker: "Rosa",
      castMember: "Rosa",
      title: "“The floor is about to get busy.”",
      body: "Four questions. 45 seconds.",
      note: "3 of 4 correct to pass.",
      cta: "Start",
    },
    {
      // Screens 18-21 + 22. Scored 3: one clock, 3 of 4 to pass.
      kind: "rapid",
      id: "RN2-18",
      planLineIfFailed: "you skipped the small safety checks that keep patients safe",
      progress: 0.3,
      timer: 45,
      speaker: "Rosa",
      castMember: "Rosa",
      question: "",
      items: [
        {
          question: "Before giving medication, what should you check first?",
          options: [
            { label: "The number on the door", correct: false, why: "Patients move rooms. The door does not tell you who is in the bed." },
            { label: "Their name and date of birth", correct: true, why: "Right. Two checks, every time, before every dose." },
            { label: "Whichever bed they’re in", correct: false, why: "Beds change too. Check the person, not the place." },
          ],
        },
        {
          question: "You’re unsure about something Rosa asked you to do. What do you say?",
          options: [
            { label: "“It looks about right.”", correct: false, why: "About right is how mistakes reach a patient." },
            { label: "“Someone else can check.”", correct: false, why: "It was asked of you. Checking is part of doing it." },
            { label: "“I’ll check before I do it.”", correct: true, why: "Right. Asking first is safer than fixing it later." },
          ],
        },
        {
          question: "You forgot to document something you did two hours ago. What do you do?",
          options: [
            { label: "Write it now with the real time", correct: true, why: "Right. Late is fine. False is not." },
            { label: "Leave it out", correct: false, why: "If it is not charted, the next nurse thinks it never happened." },
            { label: "Write it as if it just happened", correct: false, why: "The time is part of the record. Changing it makes the chart untrue." },
          ],
        },
        {
          question: "What does escalate mean?",
          options: [
            { label: "Do it faster", correct: false, why: "Escalate means tell someone more senior now." },
            { label: "Write it down for later", correct: false, why: "Later is the opposite of escalating." },
            { label: "Tell someone more senior now", correct: true, why: "Right. And now means now." },
          ],
        },
      ],
      whenPass: "You checked carefully, asked when unsure, and knew when to speak up.",
      whenFail: "Close. On a real floor, the one check you skip is the one that matters.",
      feedback: "",
      feedbackCta: "Continue",
      skills: ["Attention to Detail", "Decision-Making"],
    },
    {
      // Screen 23. New image: RN PATIENT HIGH NEED 1, first person beside the bed.
      kind: "card",
      variant: "intro",
      id: "RN2-23",
      speaker: "Narrator",
      art: `${ART}/RN2-23.webp`,
      artAlt: "Room 12: the patient sits up in bed, uncomfortable and anxious, looking at you, monitors and an IV beside her.",
      title: "Room 12 needs you again.",
      body: "They’ve already called twice this morning. They’re uncomfortable, anxious, and asking when someone is coming back.",
      cta: "Respond",
    },
    {
      // Screens 24 + 25. Scored 4. The patient stays visible behind the choice.
      kind: "choice",
      layout: "options",
      id: "RN2-24",
      keepScene: true,
      planLineIfFailed: "you brushed off a patient who needed you to listen",
      progress: 0.4,
      speaker: "Narrator",
      question: "What’s your move?",
      choices: [
        { id: "a", label: "Listen, assess them, and explain your next step", tier: "best", why: "You didn’t dismiss them or make a promise you couldn’t keep. You listened, checked them, and set expectations." },
        { id: "b", label: "Tell them everyone is busy", tier: "wrong", why: "True, and it tells them they are on their own. They will call again, more worried." },
        { id: "c", label: "Promise you’ll stay until they feel better", tier: "wrong", why: "Kind, and impossible with three other patients. A broken promise costs more trust than no promise." },
      ],
      feedback: "",
      feedbackCta: "Continue",
      skills: ["Active Listening", "Communication"],
    },
    {
      // Screens 26 + 27. Scored 5: the staffing premise becomes gameplay.
      kind: "rank",
      id: "RN2-26",
      resetScene: true,
      planLineIfFailed: "you put a routine task ahead of a patient in danger",
      progress: 0.5,
      speaker: "Narrator",
      // Screen 26 is one screen. The doc's instruction is the question
      // itself, so no extra instruction line shows (rank prompts are quiet on
      // directed levels).
      inlineSetup: true,
      setup: "10:20 A.M. Four patients need you at the same time.",
      question: "Rank them in the order you go.",
      order: [
        "Room 12 says they suddenly can’t catch their breath",
        "Room 14 is climbing out of bed alone",
        "Room 16’s medication is due",
        "Room 9 wants to know when lunch arrives",
      ],
      whenRight: "Breathing first. Then stop the fall. The scheduled medication matters, but immediate danger comes first.",
      whenWrong: "Breathing comes first, then the fall risk. The medication can wait a few minutes, and lunch can wait longer.",
      feedback: "",
      feedbackCta: "Continue",
      skills: ["Critical Thinking", "Time Management"],
    },
    {
      // Screen 28, the checkpoint (break room, its own celebratory stage).
      kind: "card",
      variant: "act",
      id: "RN2-28",
      speaker: "System",
      title: "",
      body: "You made it through the morning rush.",
      example: "Too many needs. Not enough time. You kept your patients moving safely.",
      note: "Checkpoint saved",
      cta: "Continue Shift",
      secondaryCta: "Finish Later",
      secondaryHref: "/play",
    },
    {
      // Screen 29, the schedule starts slipping.
      kind: "card",
      variant: "intro",
      id: "RN2-29",
      speaker: "Narrator",
      title: "10:55 A.M.",
      body: "Your next hour is already filling up.",
      schedule: [
        { time: "11:00", room: "Room 16", task: "Medication" },
        { time: "11:00", room: "Room 12", task: "Assessment" },
        { time: "11:10", room: "Room 14", task: "Reposition" },
      ],
      scheduleNote: "Also: Two notes still need charting.",
      cta: "Continue",
    },
    {
      // Screens 30 + 31. Scored 6, the pure time-management beat.
      kind: "choice",
      layout: "options",
      id: "RN2-30",
      planLineIfFailed: "you fell behind without telling anyone what could not wait",
      progress: 0.6,
      speaker: "Rosa",
      castMember: "Rosa",
      inlineSetup: true,
      keepScene: true,
      setup: "“You’re getting behind. What do you need?”",
      question: "What do you tell her?",
      choices: [
        { id: "a", label: "“Can someone help with Room 14 while I handle the 11:00 tasks?”", tier: "best", why: "Good time management isn’t doing everything yourself. It’s knowing what can’t wait and asking for help early." },
        { id: "b", label: "“I’ll catch up eventually.”", tier: "wrong", why: "Eventually is after the 11:00 dose is late. Say what you need while it still helps." },
        { id: "c", label: "“I’ll chart everything first and do the patients later.”", tier: "wrong", why: "The patients' times come first. Charting matters, and it can follow the care." },
      ],
      feedback: "",
      feedbackCta: "Continue",
      skills: ["Time Management", "Communication"],
    },
    {
      // Screen 32.
      kind: "card",
      variant: "intro",
      id: "RN2-32",
      speaker: "Narrator",
      title: "Patient records are private.",
      body: "Riverbend logs every chart you open.",
      cta: "Continue",
    },
    {
      // Screens 33 + 34. Scored 7.
      kind: "choice",
      layout: "blank",
      id: "RN2-33",
      planLineIfFailed: "you were not careful yet about whose records you open",
      progress: 0.7,
      speaker: "Narrator",
      // The doc's heading IS the instruction: "DRAG THE RIGHT WORD INTO THE
      // SPACE.", then the sentence.
      prompt: "Drag the right word into the space.",
      promptStyle: "heading",
      question: "You may only open the record of a patient who is ___.",
      choices: [
        { id: "a", label: "yours today", tier: "best", why: "You only open records you need for your work." },
        { id: "b", label: "someone you know", tier: "wrong", why: "Knowing them is a reason NOT to look. Only your own patients, only for your work." },
        { id: "c", label: "on your floor", tier: "wrong", why: "The whole floor is not yours. Every chart you open is logged." },
      ],
      feedback: "",
      feedbackCta: "Continue",
      skills: ["Attention to Detail", "Decision-Making"],
    },
    {
      // Screen 35.
      kind: "card",
      variant: "character",
      id: "RN2-35",
      speaker: "Denise",
      castMember: "Denise",
      setup: "Denise • Nurse Manager",
      title: "Nine years running Four West.",
      body: "She reads every handoff note.",
      cta: "Continue",
    },
    {
      // Screen 36.
      kind: "card",
      variant: "character",
      id: "RN2-36",
      speaker: "Denise",
      castMember: "Denise",
      title: "Denise decides when you’re ready to work on your own.",
      body: "Right now, she’s still deciding.",
      ladder: [
        { label: "New Graduate Nurse • You", lit: true },
        { label: "Staff Nurse • Rosa", lit: true },
        { label: "Nurse Manager • Denise", lit: true },
      ],
      cta: "Continue",
    },
    {
      // Screen 37.
      kind: "card",
      variant: "intro",
      id: "RN2-37",
      speaker: "Narrator",
      title: "Your patients are settled for the moment.",
      body: "Now you have to catch up on charting.",
      note: "Denise will read this note.",
      cta: "Check the Note",
    },
    {
      // Screens 38 + 39. Scored 8. Denise, who reads every note, reacts.
      kind: "choice",
      layout: "document",
      doc: "Four West • Handoff Note",
      id: "RN2-38",
      planLineIfFailed: "you let a note with obvious errors go to the next shift",
      progress: 0.8,
      speaker: "Narrator",
      castMember: "Denise",
      reactor: "Denise",
      prompt: "Tap the line with three mistakes.",
      question: "Find the line with the mistakes.",
      choices: [
        { id: "a", label: "Recieved his last dose on Febuary 30.", tier: "best", why: "“Recieved,” “Febuary,” and February 30 isn’t a real date. Three mistakes in one line." },
        { id: "b", label: "Walked to the window twice today.", tier: "wrong", why: "That line is fine. Look for the one with more than one thing wrong." },
        { id: "c", label: "Family visiting after 6 P.M.", tier: "wrong", why: "That line is fine. Look for the one with more than one thing wrong." },
        { id: "d", label: "Pain was 3 out of 10 at 4 P.M.", tier: "wrong", why: "That line is fine. Look for the one with more than one thing wrong." },
      ],
      feedback: "",
      feedbackCta: "Continue",
      skills: ["Reading Comprehension", "Attention to Detail"],
    },
    {
      // Screen 40.
      kind: "card",
      variant: "character",
      id: "RN2-40",
      speaker: "Tyler",
      castMember: "Tyler",
      setup: "Tyler • New Graduate Nurse",
      title: "Tyler started the same time you did.",
      body: "He answers first in every room and never sounds unsure.",
      cta: "Continue",
    },
    {
      // Screens 41 + 42. Kept, but not scored ("No Reputation change needed").
      kind: "choice",
      layout: "options",
      id: "RN2-41",
      practice: true,
      speaker: "Narrator",
      castMember: "Tyler",
      inlineSetup: true,
      keepScene: true,
      setup: "The next morning... Yesterday, you spotted a rash and reported it. In the morning meeting, Tyler says he spotted it.",
      question: "What’s your move?",
      choices: [
        { id: "a", label: "Mention it to Rosa afterwards", tier: "best", why: "You protected your work without turning the meeting into an argument." },
        { id: "b", label: "Tell Tyler later not to do that", tier: "wrong", why: "It may stop him, and no one who matters ever hears it was yours." },
        { id: "c", label: "Cut him off in the meeting", tier: "wrong", why: "Now the meeting is about the two of you, not the patient." },
      ],
      feedback: "",
      feedbackCta: "Continue",
      skills: ["Social Awareness", "Decision-Making"],
    },
    {
      // Screen 43. New image: RN PATIENT HIGH NEED 2, same patient, same room.
      kind: "card",
      variant: "intro",
      id: "RN2-43",
      speaker: "Narrator",
      art: `${ART}/RN2-43.webp`,
      artAlt: "Room 12 again: the same patient, now pale and breathing hard with a hand on her chest, the monitor numbers up.",
      title: "Another call from Room 12.",
      body: "They’ve needed a lot from you today. This time, something feels different.",
      cta: "Enter Room",
    },
    {
      // Screen 44.
      kind: "card",
      variant: "intro",
      id: "RN2-44",
      speaker: "Narrator",
      title: "Room 12 was talking normally an hour ago.",
      body: "Now they’re confused and breathing fast. Rosa is helping another patient. Two other call lights are on.",
      cta: "Act Now",
    },
    {
      // Screens 45 + 46. Scored 9, on a 30 second clock. Asking another nurse
      // is acceptable, interrupting Rosa is best.
      kind: "choice",
      layout: "options",
      id: "RN2-45",
      keepScene: true,
      timer: 30,
      planLineIfFailed: "you waited on a patient whose condition was changing fast",
      progress: 0.9,
      speaker: "Narrator",
      question: "What do you do first?",
      choices: [
        { id: "a", label: "Interrupt Rosa and escalate now", tier: "best", why: "Being busy doesn’t make a dangerous change less urgent. You spoke up immediately." },
        { id: "b", label: "Ask another nurse nearby for immediate help", tier: "acceptable", why: "Getting help right away is right. Rosa knows this patient best, so she is the faster help." },
        { id: "c", label: "Finish your other rooms first", tier: "wrong", why: "A patient who is confused and breathing fast cannot wait for a routine round." },
        { id: "d", label: "Document it and check again later", tier: "wrong", why: "Later is too late for this. Escalate first, chart after." },
      ],
      feedback: "",
      feedbackCta: "Continue",
      skills: ["Critical Thinking", "Communication"],
    },
    {
      // Screen 47, the consequence of falling behind.
      kind: "card",
      variant: "intro",
      id: "RN2-47",
      speaker: "Narrator",
      resetScene: true,
      title: "The crisis pulled you off schedule.",
      body: "Room 12 is getting help. But your 12:00 medication now shows overdue.",
      cta: "What Now?",
    },
    {
      // Screens 48 + 49. An unscored applied decision.
      kind: "choice",
      layout: "options",
      id: "RN2-48",
      practice: true,
      bestHeadline: "Good recovery.",
      speaker: "Narrator",
      question: "What’s your move?",
      choices: [
        { id: "a", label: "Tell Rosa what slipped, check the medication, and handle it safely", tier: "best", why: "Falling behind can happen. Hiding it makes the problem worse." },
        { id: "b", label: "Give it immediately without checking anything", tier: "wrong", why: "Late is not a reason to skip the checks. Rushing is how a late dose becomes a wrong one." },
        { id: "c", label: "Hide the delay and change the chart time", tier: "wrong", why: "A false chart time is the one thing worse than a late dose." },
        { id: "d", label: "Leave it for the next nurse", tier: "wrong", why: "It is your patient and your dose. Handing it on silently just moves the problem." },
      ],
      feedback: "",
      feedbackCta: "Continue",
      skills: ["Time Management", "Communication"],
    },
    {
      // Screen 50. New image: RN FLOOR NIGHT.
      kind: "card",
      variant: "intro",
      id: "RN2-50",
      speaker: "Narrator",
      mood: "night",
      title: "7:00 P.M.",
      body: "Your shift is ending. The night nurse sits down for report.",
      cta: "Give Report",
    },
    {
      // Screens 51 + 52. Scored 10: the level opens on receiving report and
      // closes on giving it.
      kind: "pick",
      id: "RN2-51",
      planLineIfFailed: "you left the next nurse without what she needed to know",
      progress: 1,
      speaker: "Narrator",
      mood: "night",
      pick: 3,
      question: "Pick the three things the night nurse must hear.",
      cards: [
        { label: "Room 12 got worse and was seen by the doctor", role: "pick" },
        { label: "Room 14 starts a new medication at 10 P.M.", role: "pick" },
        { label: "Room 9 is waiting on test results tonight", role: "pick" },
        { label: "Room 12 watches the same show every evening", role: "leave" },
        { label: "You’re hoping to swap a shift next week", role: "leave" },
        { label: "The coffee machine is broken", role: "leave" },
      ],
      whenRight: "You passed on what changed, what’s coming next, and what’s still open.",
      whenWrong: "Report is what changed, what is coming, and what is still open. The rest can wait.",
      feedback: "",
      feedbackCta: "Continue",
      skills: ["Communication", "Attention to Detail"],
    },
    {
      // Screen 53.
      kind: "card",
      variant: "chapter",
      id: "RN2-53",
      speaker: "Rosa",
      castMember: "Rosa",
      // "IMAGE: DA RN SIM ROSA.png": Rosa at the day station, not the night
      // floor. Two lines, as the doc writes them.
      celebrate: true,
      title: "Your first year is over.",
      body: "Rosa: “You learned when to move, when to ask for help, and when something couldn’t wait.”\nNow Four West decides whether you’re ready to work on your own.",
      cta: "Begin Final Review",
    },
    {
      // Screen 54, over the night station, blurred and darkened.
      kind: "review",
      id: "RN2-54",
      speaker: "System",
      mood: "night",
      title: "Four West is deciding whether you’re ready to work on your own.",
      body: "Your Reputation determines what happens next.",
      pending: "Decision pending...",
    },
  ],
  // Screen 55.
  endings: [
    {
      min: 85,
      headline: "You’re off orientation.",
      message: "You proved you’re ready for more responsibility.",
      subline: "Next year, you carry your own patients with more independence.",
      unlock: "Level 2 Unlocked • Staff Nurse",
      primary: "Start Level 2",
      advances: true,
    },
    {
      min: 40,
      headline: "Not yet.",
      message: "You kept patients safe, but Four West needs to see more consistency before you work independently.",
      subline: "",
      primary: "Start Over",
      advances: false,
    },
    {
      min: 0,
      headline: "Terminated",
      message: "Riverbend is ending your job here.",
      subline: "You can replay the year and make different decisions.",
      primary: "Start Over",
      advances: false,
    },
  ],
};
