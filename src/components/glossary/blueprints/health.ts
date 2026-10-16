// DEMO-ONLY content: the Nursing glossary, under the Health & Medicine world,
// written here to prove the generator on a second industry (16 Oct 2026).
// Glossaries are per industry, grouped under career worlds; Registered Nurse
// is this one's example career (its hub card and cover). Riverside Clinic is this
// career's "Dream Sneakers": the one story every example ties back to. Two
// playable levels, four more on the roadmap. Eighth-grade copy, no dashes,
// every example names the clinic. Replace with the content team's sheet
// when it exists; the shape below is what the sheet must provide.

import type { GlossaryBlueprint } from "../generate";

export const NURSING_GLOSSARY: GlossaryBlueprint = {
  industry: { slug: "nursing", title: "Medical Terms", subject: "nursing", world: "Health & Medicine" },
  // A scenario thread (SOP #19): the same clinic every level, a new shift or
  // patient each time; nothing from Level 1's patients carries over.
  mode: "scenario_thread",
  studentRole: "nurse",
  exampleCareerSlug: "registered-nurse",
  company: "Riverside Clinic",
  idPrefix: "RN",
  chapters: [
    { number: 1, name: "First Shift", tier: "Beginner" },
    { number: 2, name: "On the Floor", tier: "Intermediate" },
    { number: 3, name: "The Specialist", tier: "Advanced" },
  ],
  levels: [
    {
      number: 1,
      title: "Clinic Basics",
      tier: "Beginner",
      goal: "Start your first shift.",
      milestone: "Open Riverside Clinic",
      nextMilestone: "Run the floor",
      companyValue: 10000,
      nextCompanyValue: 50000,
      // Dose is arithmetic by nature, so this level's words carry numbers.
      math: true,
      terms: [
        { term: "Patient", definition: "A person getting care from a nurse or doctor.", example: "Every person who comes to Riverside Clinic for care is a patient.", cue: "The person getting care", icon: "users" },
        { term: "Vital Signs", definition: "The body's basic numbers: heart rate, breathing, temperature and blood pressure.", example: "A Riverside Clinic nurse checks vital signs at the start of every visit.", cue: "Heart rate and temperature", icon: "heart-pulse" },
        { term: "Chart", definition: "The written record of a patient's care.", example: "Riverside Clinic nurses write every visit in the patient's chart.", cue: "The record of each visit", icon: "scroll" },
        { term: "Dose", definition: "How much medicine a patient gets at one time.", example: "At Riverside Clinic, a nurse checks the dose before giving any medicine.", cue: "How much medicine to give", icon: "stethoscope", formula: "2 pills x 250 mg = 500 mg" },
        { term: "Triage", definition: "Sorting patients by how urgent their needs are.", example: "Riverside Clinic uses triage so the sickest patients are seen first.", cue: "Who is seen first", icon: "siren" },
      ],
      facts: [
        "Nurses are the largest group of health care workers in the United States.",
        "Checking vital signs is usually the first thing a nurse does at a visit.",
      ],
    },
    {
      number: 2,
      title: "On the Floor",
      tier: "Beginner",
      goal: "Run the floor for a shift.",
      milestone: "Run the floor",
      nextMilestone: "Give the right medicine",
      companyValue: 50000,
      nextCompanyValue: 120000,
      intro: { headline: "Riverside Clinic Gets Busy", line: "More patients. One team.", hook: "Learn the words that keep a floor running." },
      terms: [
        { term: "Shift", definition: "The hours a nurse works in one stretch.", example: "A Riverside Clinic shift lasts twelve hours.", cue: "Twelve hours of work", situation: "Ana clocks in at seven and clocks out at seven.", icon: "activity" },
        { term: "Charge Nurse", definition: "The nurse who runs the floor for a shift.", example: "The charge nurse at Riverside Clinic decides which nurse cares for each patient.", cue: "The nurse who runs the floor", situation: "One nurse assigns every patient on the floor to a nurse.", icon: "user-round" },
        { term: "Handoff", definition: "Passing a patient's care to the next nurse.", example: "At the end of a shift, Riverside Clinic nurses do a handoff for every patient.", cue: "Passing care to the next nurse", situation: "Ana tells the night nurse everything about room four before leaving.", icon: "arrow-left-right" },
        { term: "Allergy", definition: "A bad reaction the body has to a food or a medicine.", example: "A Riverside Clinic chart lists every allergy before any medicine is given.", cue: "A bad reaction to a medicine", situation: "A patient breaks out in hives minutes after a new pill.", icon: "triangle-alert" },
        { term: "Discharge", definition: "When a patient is well enough to leave.", example: "Riverside Clinic plans each discharge so the patient knows how to care for themselves at home.", cue: "Going home well", situation: "The doctor signs the papers and the patient packs to go home.", icon: "arrow-up-circle" },
      ],
      facts: ["Many hospital nurses work three twelve-hour shifts a week."],
    },
    {
      number: 3,
      title: "Medicines",
      tier: "Intermediate",
      goal: "Give the right medicine, every time.",
      milestone: "Give the right medicine",
      nextMilestone: "Handle an emergency",
      companyValue: 120000,
      nextCompanyValue: 250000,
      intro: { headline: "The Medicine Cart", line: "A new shift. Every patient has a different order.", hook: "Learn the words that keep medicine safe." },
      terms: [
        { term: "Prescription", definition: "A doctor's written order for a medicine.", example: "A Riverside Clinic doctor writes a prescription before any medicine goes home.", cue: "The doctor's order for medicine", situation: "The doctor signs a slip that says which medicine and how often.", confusion: "Pharmacy", icon: "scroll" },
        { term: "Side Effect", definition: "An unwanted thing a medicine does along with its job.", example: "A Riverside Clinic nurse tells each patient what side effect to watch for.", cue: "An unwanted extra effect", situation: "The pill eases the pain but makes the patient sleepy too.", confusion: "Interaction", icon: "triangle-alert" },
        { term: "IV", definition: "A thin tube in a vein that gives fluid or medicine straight into the blood.", example: "At Riverside Clinic, an IV gives fluids fast to a dehydrated patient.", cue: "Medicine straight into a vein", situation: "A clear bag drips through a tube into a hand.", confusion: "Prescription", icon: "droplets" },
        { term: "Pharmacy", definition: "The place where medicines are prepared and handed out.", example: "The Riverside Clinic pharmacy fills every order the same day.", cue: "Where medicines are handed out", situation: "A counter with shelves of bottles and a line of patients waiting.", confusion: "Prescription", icon: "building" },
        { term: "Interaction", definition: "When two medicines change how each other works.", example: "A Riverside Clinic pharmacist checks for an interaction before filling two orders.", cue: "Two medicines that clash", situation: "Taken together, the two pills make each other stronger.", confusion: "Side Effect", icon: "arrow-left-right" },
      ],
      facts: ["Nurses check the right patient, right medicine, right dose, right time and right route before giving anything."],
    },
    {
      number: 4,
      title: "Emergencies",
      tier: "Intermediate",
      goal: "Act fast when seconds count.",
      milestone: "Handle an emergency",
      nextMilestone: "Lead the team",
      companyValue: 250000,
      nextCompanyValue: 500000,
      intro: { headline: "Room Four Is Crashing", line: "A different day. A patient takes a sudden turn.", hook: "Learn the words you will hear when seconds count." },
      terms: [
        { term: "Code Blue", definition: "The call that goes out when a patient's heart or breathing stops.", example: "When a Riverside Clinic patient stopped breathing, the nurse called a Code Blue.", cue: "The call when a heart stops", situation: "A patient has no pulse. The whole team is needed now.", confusion: "Rapid Response", icon: "siren" },
        { term: "CPR", definition: "Pressing hard on the chest and giving breaths to keep blood moving.", example: "Every Riverside Clinic nurse is trained in CPR.", cue: "Chest presses and breaths", situation: "Hands on the chest, pushing hard and fast, over and over.", confusion: "Airway", icon: "heart-pulse" },
        { term: "Airway", definition: "The open path that lets air reach the lungs.", example: "A Riverside Clinic nurse checks the airway first in any emergency.", cue: "The path air takes to the lungs", situation: "Something is blocking the throat and no air is getting through.", confusion: "CPR", icon: "wind" },
        { term: "Stabilize", definition: "To get a patient steady and out of immediate danger.", example: "Riverside Clinic nurses work to stabilize a patient before moving them.", cue: "Get the patient steady", situation: "Pulse back, breathing even. Now keep it that way before transport.", confusion: "Rapid Response", icon: "activity" },
        { term: "Rapid Response", definition: "A team called when a patient is getting worse fast, before the heart stops.", example: "A Riverside Clinic nurse called a Rapid Response when the fever climbed and would not stop.", cue: "The team called before a crisis", situation: "The patient is sliding downhill fast but still breathing.", confusion: "Code Blue", icon: "users" },
      ],
      facts: ["Chest presses should go about two per second, the beat of many pop songs."],
    },
    { number: 5, title: "Teamwork", tier: "Advanced", goal: "Lead a care team.", milestone: "Lead the team", nextMilestone: "Pick a specialty", companyValue: 500000, nextCompanyValue: 1000000, words: ["Care Plan", "Rounds", "Referral", "Consult", "Advocate"] },
    { number: 6, title: "Specialties", tier: "Advanced", goal: "Pick where you belong.", milestone: "Pick a specialty", nextMilestone: "Keep growing", companyValue: 1000000, nextCompanyValue: 1000000, words: ["ICU", "Pediatrics", "Oncology", "Labor and Delivery", "Nurse Practitioner"] },
  ],
};
