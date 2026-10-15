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
      unlocks: "$10K",
      milestone: "Open Riverside Clinic",
      nextMilestone: "Run the floor",
      companyValue: 10000,
      nextCompanyValue: 50000,
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
      unlocks: "$50K",
      milestone: "Run the floor",
      nextMilestone: "Give the right medicine",
      companyValue: 50000,
      nextCompanyValue: 120000,
      intro: { headline: "Riverside Clinic Gets Busy", line: "More patients. One team.", hook: "Learn the words that keep a floor running." },
      terms: [
        { term: "Shift", definition: "The hours a nurse works in one stretch.", example: "A Riverside Clinic shift lasts twelve hours.", cue: "Twelve hours of work", icon: "activity" },
        { term: "Charge Nurse", definition: "The nurse who runs the floor for a shift.", example: "The charge nurse at Riverside Clinic decides which nurse cares for each patient.", cue: "The nurse who runs the floor", icon: "user-round" },
        { term: "Handoff", definition: "Passing a patient's care to the next nurse.", example: "At the end of a shift, Riverside Clinic nurses do a handoff for every patient.", cue: "Passing care to the next nurse", icon: "arrow-left-right" },
        { term: "Allergy", definition: "A bad reaction the body has to a food or a medicine.", example: "A Riverside Clinic chart lists every allergy before any medicine is given.", cue: "A bad reaction to a medicine", icon: "triangle-alert" },
        { term: "Discharge", definition: "When a patient is well enough to leave.", example: "Riverside Clinic plans each discharge so the patient knows how to care for themselves at home.", cue: "Going home well", icon: "arrow-up-circle" },
      ],
      facts: ["Many hospital nurses work three twelve-hour shifts a week."],
    },
    { number: 3, title: "Medicines", tier: "Intermediate", goal: "Give the right medicine, every time.", unlocks: "$120K", milestone: "Give the right medicine", nextMilestone: "Handle an emergency", companyValue: 120000, nextCompanyValue: 250000, words: ["Prescription", "Side Effect", "IV", "Pharmacy", "Interaction"] },
    { number: 4, title: "Emergencies", tier: "Intermediate", goal: "Act fast when seconds count.", unlocks: "$250K", milestone: "Handle an emergency", nextMilestone: "Lead the team", companyValue: 250000, nextCompanyValue: 500000, words: ["Code Blue", "CPR", "Airway", "Stabilize", "Rapid Response"] },
    { number: 5, title: "Teamwork", tier: "Advanced", goal: "Lead a care team.", unlocks: "$500K", milestone: "Lead the team", nextMilestone: "Pick a specialty", companyValue: 500000, nextCompanyValue: 1000000, words: ["Care Plan", "Rounds", "Referral", "Consult", "Advocate"] },
    { number: 6, title: "Specialties", tier: "Advanced", goal: "Pick where you belong.", unlocks: "$1M", milestone: "Pick a specialty", nextMilestone: "Keep growing", companyValue: 1000000, nextCompanyValue: 1000000, words: ["ICU", "Pediatrics", "Oncology", "Labor and Delivery", "Nurse Practitioner"] },
  ],
};
