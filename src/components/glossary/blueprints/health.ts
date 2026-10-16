// DEMO-ONLY content: the Nursing glossary, under the Health & Medicine world,
// written here to prove the generator on a second industry (16 Oct 2026).
// Glossaries are per industry, grouped under career worlds; Registered Nurse
// is this one's example career (its hub card and cover). Riverside Clinic is this
// career's "Dream Sneakers": the one story every example ties back to. Six
// playable levels. Eighth-grade copy, no dashes, no numbers, every example
// names the clinic. Replace with the content team's sheet when it exists; the
// shape below is what the sheet must provide.
//
// Rewritten 17 Oct 2026 to the Finance style after Chandu's note: "the games
// are repeating the same questions again and again for mastery instead of
// having any variety, please refer the finance glossary games and redo
// questions according to its style." Every word now carries three moments,
// each shown on one screen only; Levels 3, 4 and 5 sort concrete clinic
// moves into concept buckets; Levels 2 to 6 carry one or two short cases and
// a Select All with real items; every Power Play is a written paragraph whose
// blanks do not run in teaching order. Level 1's math flag and the Dose
// formula were dropped: these words do not need figures to be taught.

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
      terms: [
        {
          term: "Patient", definition: "A person getting care from a nurse or doctor.", example: "Every person who comes to Riverside Clinic for care is a patient.", cue: "The person getting care", icon: "users",
          moments: ["A man waits in room two with a sore throat.", "The woman in the bed is here to get better.", "Someone signs in at the front desk and waits to be seen."],
        },
        {
          term: "Vital Signs", definition: "The body's basic numbers: heart rate, breathing, temperature and blood pressure.", example: "A Riverside Clinic nurse checks vital signs at the start of every visit.", cue: "Heart rate and temperature", icon: "heart-pulse",
          moments: ["The nurse counts the pulse and checks the temperature first.", "A cuff squeezes the arm while the nurse reads the numbers.", "Pulse, breathing and temperature, written down before anything else."],
        },
        {
          term: "Chart", definition: "The written record of a patient's care.", example: "Riverside Clinic nurses write every visit in the patient's chart.", cue: "The record of each visit", icon: "scroll",
          moments: ["The nurse writes the visit in the file before leaving the room.", "Every note from past visits sits in one record.", "The doctor reads the notes to see what happened last time."],
        },
        {
          term: "Dose", definition: "How much medicine a patient gets at one time.", example: "At Riverside Clinic, a nurse checks the dose before giving any medicine.", cue: "How much medicine to give", icon: "stethoscope",
          moments: ["The label says one pill, twice a day, with food.", "The nurse measures the liquid medicine to the line on the cup.", "Too much medicine can hurt, so the amount is checked twice."],
        },
        {
          term: "Triage", definition: "Sorting patients by how urgent their needs are.", example: "Riverside Clinic uses triage so the sickest patients are seen first.", cue: "Who is seen first", icon: "siren",
          moments: ["The chest pain goes in first. The sprained ankle waits.", "A nurse decides who is sickest and sends them ahead.", "The waiting room is full, so the nurse sorts who goes next."],
        },
      ],
      powerPlay: {
        intro: "Open the clinic for the morning.",
        paragraph: "The nurse uses {5} to pick who goes first. A {1} sits down in room two. The nurse checks her {2}. All of it goes in her {3}. Before any pill, the nurse checks the {4} twice.",
      },
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
        {
          term: "Shift", definition: "The hours a nurse works in one stretch.", example: "A Riverside Clinic shift lasts twelve hours.", cue: "Twelve hours of work", icon: "activity",
          moments: ["Ana clocks in at seven and clocks out at seven.", "Twelve hours on the floor, then home to sleep.", "The night crew arrives as the day crew heads out."],
        },
        {
          term: "Charge Nurse", definition: "The nurse who runs the floor for a shift.", example: "The charge nurse at Riverside Clinic decides which nurse cares for each patient.", cue: "The nurse who runs the floor", icon: "user-round",
          moments: ["One nurse assigns every patient on the floor to a nurse.", "The nurse at the desk who decides who cares for whom.", "When a problem comes up, the whole floor goes to one nurse."],
        },
        {
          term: "Handoff", definition: "Passing a patient's care to the next nurse.", example: "Riverside Clinic nurses do a handoff for each patient before they go home.", cue: "Passing care to the next nurse", icon: "arrow-left-right",
          moments: ["Ana tells the night nurse everything about room four before leaving.", "Two nurses stand at the bedside and go over every detail.", "The day nurse passes each room's details to the night nurse."],
        },
        {
          term: "Allergy", definition: "A bad reaction the body has to a food or a medicine.", example: "A Riverside Clinic chart lists every allergy before any medicine is given.", cue: "A bad reaction to a medicine", icon: "triangle-alert",
          moments: ["A patient breaks out in hives minutes after a new pill.", "A red band on the wrist warns about a medicine to avoid.", "The man says penicillin makes his throat swell."],
        },
        {
          term: "Discharge", definition: "When a patient is well enough to leave.", example: "Riverside Clinic plans each discharge so patients know how to heal at home.", cue: "Going home well", icon: "arrow-up-circle",
          moments: ["The doctor signs the papers and the patient packs to go home.", "The nurse explains the home instructions and wheels her to the door.", "The bed is empty and clean. Its last patient left this morning."],
        },
      ],
      selectAll: {
        term: "Allergy",
        prompt: "Select every sign of a bad reaction to a medicine.",
        options: ["A rash spreading after a new pill", "A throat that swells after a shot", "Feeling sleepy after a long day", "Lips puffing up after a peanut"],
        correct: [0, 1, 3],
        feedbackCorrect: "A rash, a swollen throat and puffy lips are warning signs. Being tired is not.",
        feedbackWrong: "Look for a rash, swelling or puffy lips. Being tired is not a reaction.",
      },
      cases: [
        {
          terms: ["Handoff", "Charge Nurse", "Discharge"],
          scene: "Ana's twelve hours are up and room four still needs care.",
          steps: [
            { prompt: "Ana is going home. What should she do about room four first?", options: ["Tell the next nurse everything", "Leave a sticky note on the door"], correctIndex: 0 },
            { prompt: "Who decides which nurse takes room four tonight?", options: ["The patient in room four", "The nurse who runs the floor"], correctIndex: 1 },
            { prompt: "Room four is well enough to leave tomorrow. Who signs off?", options: ["The doctor signs the papers", "The patient just walks out"], correctIndex: 0 },
          ],
          feedbackCorrect: "Tell the next nurse first. The floor lead picks rooms, and the doctor signs off.",
          feedbackWrong: "Care passes from nurse to nurse. Only the doctor can send someone home.",
        },
      ],
      powerPlay: {
        intro: "Finish Ana's day on the floor.",
        paragraph: "Ana's {1} at Riverside Clinic is almost over. The {2} gives her room four for now. The man in room four has a penicillin {4}. His {5} is set for tomorrow. Ana gives the night nurse a full {3} on him.",
      },
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
        {
          term: "Prescription", definition: "A doctor's written order for a medicine.", example: "A Riverside Clinic doctor writes a prescription before any medicine goes home.", cue: "The doctor's order for medicine", confusion: "Pharmacy", icon: "scroll",
          moments: ["The doctor signs a slip that says which medicine and how often.", "A signed order for one medicine, written by the doctor.", "No pills leave the building without the doctor's written order."],
        },
        {
          term: "Side Effect", definition: "An unwanted thing a medicine does along with its job.", example: "A Riverside Clinic nurse tells each patient what side effect to watch for.", cue: "An unwanted extra effect", confusion: "Interaction", icon: "triangle-alert",
          moments: ["The pill eases the pain but makes the patient sleepy too.", "The new medicine works, but now her stomach is upset.", "His cough is gone. His mouth is dry all day."],
        },
        {
          term: "IV", definition: "A thin tube that puts fluid or medicine right into a vein.", example: "At Riverside Clinic, an IV gives fluids fast to a dehydrated patient.", cue: "Medicine straight into a vein", confusion: "Prescription", icon: "droplets",
          moments: ["A clear bag drips through a tube into a hand.", "Fluids flow through a thin tube right into his vein.", "A pole on wheels holds the bag that drips into her arm."],
        },
        {
          term: "Pharmacy", definition: "The place where medicines are prepared and handed out.", example: "The Riverside Clinic pharmacy fills every order the same day.", cue: "Where medicines are handed out", confusion: "Prescription", icon: "building",
          moments: ["A counter with shelves of bottles and a line of patients waiting.", "The order goes downstairs to be counted into a bottle.", "Bottles are filled and labeled behind a tall counter."],
        },
        {
          term: "Interaction", definition: "When two medicines change how each other works.", example: "A Riverside Clinic pharmacist checks for an interaction before filling two orders.", cue: "Two medicines that clash", confusion: "Side Effect", icon: "arrow-left-right",
          moments: ["Taken together, the two pills make each other stronger.", "Her heart pill stops working once she starts the new one.", "Two safe medicines become risky when swallowed at the same time."],
        },
      ],
      sort: {
        label: "Getting it or doing it",
        prompt: "Is each one about getting the medicine, or what it does in the body?",
        buckets: ["Getting the medicine", "What it does"],
        items: [
          { text: "The doctor's signed slip", bucket: "Getting the medicine", term: "Prescription" },
          { text: "Sleepy after the pain pill", bucket: "What it does", term: "Side Effect" },
          { text: "Counted into a bottle downstairs", bucket: "Getting the medicine", term: "Pharmacy" },
          { text: "Two pills boosting each other", bucket: "What it does", term: "Interaction" },
          { text: "A tube dripping into a vein", bucket: "Getting the medicine", term: "IV" },
          { text: "Dry mouth from the cough syrup", bucket: "What it does", term: "Side Effect" },
          { text: "The new pill cancels the old one", bucket: "What it does", term: "Interaction" },
        ],
        feedbackCorrect: "Orders, bottles and tubes get medicine in. The rest is what it does inside.",
        feedbackWrong: "Ask: is this how the medicine gets in, or what it does inside?",
      },
      selectAll: {
        term: "Side Effect",
        prompt: "Select every line that is an unwanted extra from a medicine.",
        options: ["Feeling dizzy after the blood pressure pill", "The fever dropping after the medicine", "An itchy rash from the antibiotic", "The doctor's slip for one more refill"],
        correct: [0, 2],
        feedbackCorrect: "Dizziness and a rash are unwanted extras. The fever dropping is the job.",
        feedbackWrong: "Pick what the medicine was not meant to do. A fever dropping is its job.",
      },
      cases: [
        {
          terms: ["Prescription", "Pharmacy"],
          scene: "Mrs. Lee needs a new blood pressure medicine today.",
          steps: [
            { prompt: "What must the doctor do before Mrs. Lee gets any pills?", options: ["Write the order", "Hand her a sample bag"], correctIndex: 0 },
            { prompt: "Where does that order go to be filled?", options: ["To the front desk", "To the counter with the bottles"], correctIndex: 1 },
            { prompt: "The order is filled. What does the nurse check before handing it over?", options: ["Right name and right medicine", "That the bottle looks nice"], correctIndex: 0 },
          ],
          feedbackCorrect: "The doctor writes it, the counter fills it, and the nurse checks it.",
          feedbackWrong: "First the order, then the filling. The nurse checks name and medicine last.",
        },
        {
          terms: ["Interaction", "Side Effect"],
          scene: "Mr. Diaz takes a heart pill. The doctor adds a new one.",
          steps: [
            { prompt: "What should the pharmacist check first?", options: ["Whether the two pills clash", "Whether the bottle is blue"], correctIndex: 0 },
            { prompt: "A day later Mr. Diaz feels sleepy from the new pill. What is that?", options: ["The pill working as planned", "An unwanted extra effect"], correctIndex: 1 },
            { prompt: "What does the nurse do about the sleepiness?", options: ["Tell the doctor and write it down", "Stop all his medicines at once"], correctIndex: 0 },
          ],
          feedbackCorrect: "Check for a clash first. Report a new unwanted effect and write it down.",
          feedbackWrong: "Check for a clash first. Then report the sleepiness, but do not stop everything.",
        },
      ],
      powerPlay: {
        intro: "Get Mrs. Lee's medicine right.",
        paragraph: "Mrs. Lee comes to Riverside Clinic too weak to drink. A nurse starts an {3} so fluids reach her blood fast. The doctor writes a {1} for a new heart pill. The {4} checks it for an {5} with her old pill. The nurse warns her a dry mouth may be a {2}.",
      },
      facts: ["Before giving medicine, nurses check the right patient, drug, dose, time and route."],
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
        {
          term: "Code Blue", definition: "The call that goes out when a patient's heart or breathing stops.", example: "When a Riverside Clinic patient stopped breathing, the nurse called a Code Blue.", cue: "The call when a heart stops", confusion: "Rapid Response", icon: "siren",
          moments: ["A patient has no pulse. The whole team is needed now.", "A heart has stopped. The speaker calls the whole team.", "Flat line on the monitor. The alarm goes out to everyone."],
        },
        {
          term: "CPR", definition: "Pressing hard on the chest and giving breaths to keep blood moving.", example: "Every Riverside Clinic nurse is trained in CPR.", cue: "Chest presses and breaths", confusion: "Airway", icon: "heart-pulse",
          moments: ["Hands on the chest, pushing hard and fast, over and over.", "Push the chest, give two breaths, push again. Do not stop.", "The nurse kneels over the bed, counting out loud with each press."],
        },
        {
          term: "Airway", definition: "The open path that lets air reach the lungs.", example: "A Riverside Clinic nurse checks the airway first in any emergency.", cue: "The path air takes to the lungs", confusion: "CPR", icon: "wind",
          moments: ["Something is blocking the throat and no air is getting through.", "The clear path from the mouth down to the lungs.", "The nurse tilts the head back so air can get in."],
        },
        {
          term: "Stabilize", definition: "To get a patient steady and out of immediate danger.", example: "Riverside Clinic nurses work to stabilize a patient before moving them.", cue: "Get the patient steady", confusion: "Rapid Response", icon: "activity",
          moments: ["Pulse back, breathing even. Now keep it that way before transport.", "The numbers settle. The patient is out of danger for now.", "Before the move upstairs, the team makes sure nothing will slip."],
        },
        {
          term: "Rapid Response", definition: "A team called when a patient is getting worse fast, before the heart stops.", example: "A Riverside Clinic nurse called a Rapid Response as the fever kept climbing.", cue: "The team called before a crisis", confusion: "Code Blue", icon: "users",
          moments: ["The patient is sliding downhill fast but still breathing.", "Fever climbing, pulse racing. The nurse calls for help early.", "He is getting worse by the minute, but his heart still beats."],
        },
      ],
      sort: {
        label: "Call or hands",
        prompt: "Is each one a call for help, or hands on the patient?",
        buckets: ["Call for help", "Hands on the patient"],
        items: [
          { text: "Alarm for a stopped heart", bucket: "Call for help", term: "Code Blue" },
          { text: "Pressing hard on the chest", bucket: "Hands on the patient", term: "CPR" },
          { text: "Team paged before the crash", bucket: "Call for help", term: "Rapid Response" },
          { text: "Tilting the head back", bucket: "Hands on the patient", term: "Airway" },
          { text: "Keeping the pulse steady", bucket: "Hands on the patient", term: "Stabilize" },
          { text: "Fever and pulse climbing fast", bucket: "Call for help", term: "Rapid Response" },
        ],
        feedbackCorrect: "Alarms and pages bring help. Pressing, tilting and steadying are hands on.",
        feedbackWrong: "Ask: does this bring people running, or is it done at the bed?",
      },
      selectAll: {
        term: "Stabilize",
        prompt: "Select every sign the patient is steady and out of danger.",
        options: ["Pulse back and even", "Breathing slow and regular", "No pulse at all", "Color back in the face"],
        correct: [0, 1, 3],
        feedbackCorrect: "An even pulse, regular breaths and color in the face mean steady.",
        feedbackWrong: "Look for an even pulse, regular breaths and color. No pulse is not steady.",
      },
      cases: [
        {
          terms: ["Rapid Response", "Code Blue"],
          scene: "Room six: the fever will not drop and the pulse keeps climbing.",
          steps: [
            { prompt: "He is still breathing but getting worse fast. Which call?", options: ["The team for a stopped heart", "The team that comes before a crash"], correctIndex: 1 },
            { prompt: "Minutes later his heart stops. Now which call?", options: ["The full crash team, now", "Keep watching for a minute"], correctIndex: 0 },
          ],
          feedbackCorrect: "Call early while he still breathes. If the heart stops, the call changes.",
          feedbackWrong: "Worse but breathing means the early team. A stopped heart means the crash call.",
        },
        {
          terms: ["Airway", "CPR", "Stabilize"],
          scene: "A visitor collapses in the hallway and is not breathing.",
          steps: [
            { prompt: "What do you check first?", options: ["That air can reach the lungs", "Her name and birthday"], correctIndex: 0 },
            { prompt: "No pulse. What do you do next?", options: ["Wait for the doctor", "Press hard and fast on the chest"], correctIndex: 1 },
            { prompt: "Her pulse returns. What now?", options: ["Keep her steady before moving her", "Rush her upstairs right away"], correctIndex: 0 },
          ],
          feedbackCorrect: "Open path first, then presses, then keep her steady before she moves.",
          feedbackWrong: "Air first, then presses. Once her pulse is back, steady her before moving.",
        },
      ],
      powerPlay: {
        intro: "Get room six through the night.",
        paragraph: "At Riverside Clinic, room six gets worse. His fever climbs, so the nurse calls a {5} while he still breathes. Then his heart stops, and it becomes a {1}. A nurse checks his {3} so air gets in. Another starts {2}, pushing hard and fast. When his pulse is back, the team works to {4} him.",
      },
      facts: ["Chest presses should go about two per second, the beat of many pop songs."],
    },
    {
      number: 5,
      title: "Teamwork",
      tier: "Advanced",
      goal: "Lead a care team.",
      milestone: "Lead the team",
      nextMilestone: "Pick a specialty",
      companyValue: 500000,
      nextCompanyValue: 1000000,
      intro: { headline: "The Whole Floor Is Yours", line: "A new shift. Today you run the team, not just a room.", hook: "Learn the words a team uses to care for one patient together." },
      terms: [
        {
          term: "Care Plan", definition: "The written set of goals and steps for one patient's care.", example: "Every Riverside Clinic patient has a care plan the whole team can read.", cue: "The written steps for one patient", confusion: "Rounds", icon: "clipboard-check",
          moments: ["A page lists this patient's goals and who does what today.", "The team sets three goals for her and writes down each step.", "Every nurse can read what this patient needs by Friday."],
        },
        {
          term: "Rounds", definition: "The daily walk when the team visits each patient to check in.", example: "Riverside Clinic nurses join rounds every morning.", cue: "The daily visit to each patient", confusion: "Care Plan", icon: "route",
          moments: ["The team moves bed to bed, checking on everyone.", "Every morning the doctors and nurses visit each room in turn.", "White coats stop at her door to ask how she slept."],
        },
        {
          term: "Referral", definition: "Sending a patient to another doctor or service for care.", example: "A Riverside Clinic doctor wrote a referral to a heart specialist.", cue: "Sending the patient on", confusion: "Consult", icon: "corner-up-right",
          moments: ["This needs a specialist, so the patient is sent to one.", "A note that sends her to a heart doctor across town.", "Her care moves to a skin doctor who takes it from here."],
        },
        {
          term: "Consult", definition: "Asking another expert for advice about a patient without handing the patient over.", example: "The Riverside Clinic team asked for a consult from a kidney doctor.", cue: "Asking an expert for advice", confusion: "Referral", icon: "users",
          moments: ["The doctor calls a specialist for an opinion but keeps the patient.", "A quick call to a kidney expert, then back to the bedside.", "The expert gives advice. The patient stays right where she is."],
        },
        {
          term: "Advocate", definition: "Speaking up for what a patient needs when they cannot.", example: "A Riverside Clinic nurse will advocate for a patient who is in pain.", cue: "Speaking up for the patient", confusion: "Consult", icon: "heart-pulse",
          moments: ["The patient is scared to ask, so the nurse asks for them.", "He cannot speak for himself, so the nurse speaks for him.", "The nurse insists the pain is real until the doctor listens."],
        },
      ],
      sort: {
        label: "Inside or outside",
        prompt: "Does each one stay inside the team, or reach for outside help?",
        buckets: ["Inside the team", "Outside help"],
        items: [
          { text: "Phone call to a kidney expert", bucket: "Outside help", term: "Consult" },
          { text: "Morning visit to every room", bucket: "Inside the team", term: "Rounds" },
          { text: "Sent to a heart doctor across town", bucket: "Outside help", term: "Referral" },
          { text: "Written goals for one patient", bucket: "Inside the team", term: "Care Plan" },
          { text: "Nurse asks for more pain relief", bucket: "Inside the team", term: "Advocate" },
          { text: "Skin doctor takes over her care", bucket: "Outside help", term: "Referral" },
        ],
        feedbackCorrect: "Visits, written goals and speaking up stay inside. Experts are outside help.",
        feedbackWrong: "Ask: does this bring in someone from outside, or is it just the team?",
      },
      selectAll: {
        term: "Consult",
        prompt: "Select every time the team asks an expert but keeps the patient.",
        options: ["A phone call to a kidney doctor for advice", "Sending her to a heart doctor for good", "A quick question to the skin expert", "The whole team walking bed to bed"],
        correct: [0, 2],
        feedbackCorrect: "Asking for advice keeps the patient here. Sending her away is a different word.",
        feedbackWrong: "Pick the ones where an expert is asked and the patient stays put.",
      },
      cases: [
        {
          terms: ["Referral", "Consult"],
          scene: "Mr. Park's kidney numbers are off and the team is unsure.",
          steps: [
            { prompt: "The doctor wants a kidney expert's opinion but will keep Mr. Park. Which?", options: ["Ask for advice", "Send him on"], correctIndex: 0 },
            { prompt: "The expert says Mr. Park needs care only a kidney center can give. Now which?", options: ["Ask for advice", "Send him on"], correctIndex: 1 },
          ],
          feedbackCorrect: "Ask for advice while he stays. Send him on when he needs more.",
          feedbackWrong: "Keeping the patient and asking is one word. Handing the patient over is the other.",
        },
        {
          terms: ["Advocate", "Care Plan"],
          scene: "Mrs. Cole whispers her pain is worse but says not to bother anyone.",
          steps: [
            { prompt: "What does the nurse do?", options: ["Tell the doctor the pain is worse", "Respect her wish and stay quiet"], correctIndex: 0 },
            { prompt: "The doctor changes her pain goal. Where does the new goal get written?", options: ["On a sticky note", "In her written steps for care"], correctIndex: 1 },
          ],
          feedbackCorrect: "Speak up for her. Then write the new goal where the team can read it.",
          feedbackWrong: "A scared patient still needs a voice. New goals go in the written plan.",
        },
      ],
      powerPlay: {
        intro: "Run the floor for one morning.",
        paragraph: "Morning at Riverside Clinic starts with {2}, as the team goes bed to bed. One woman is scared to say her pain is worse. Her nurse chooses to {5} for her. The doctor adds a new pain goal to her {1}. For another patient, the doctor asks a kidney expert for a {4}. When he needs a kidney center, the doctor writes a {3}.",
      },
      facts: ["Nurses spend more time with patients than any other member of the care team."],
    },
    {
      number: 6,
      title: "Specialties",
      tier: "Advanced",
      goal: "Pick where you belong.",
      milestone: "Pick a specialty",
      nextMilestone: "Keep growing",
      companyValue: 1000000,
      nextCompanyValue: 1000000,
      intro: { headline: "Where Will You Work?", line: "A tour of the units at Riverside Clinic.", hook: "Learn the names of the places a nurse can build a career." },
      terms: [
        {
          term: "ICU", definition: "The unit for the sickest patients, watched every minute.", example: "Riverside Clinic moves its most fragile patients to the ICU.", cue: "Where the sickest patients go", confusion: "Oncology", icon: "activity",
          moments: ["One nurse, two patients, machines beeping all night.", "The sickest patient in the building, watched every single minute.", "Monitors on every bed. No one here is close to going home."],
        },
        {
          term: "Pediatrics", definition: "Care for babies, children and teens.", example: "Riverside Clinic pediatrics has small chairs and bright walls.", cue: "Care for kids", confusion: "Labor and Delivery", icon: "users",
          moments: ["The waiting room is full of toys and tiny patients.", "The nurse puts a cartoon bandage on a crying four year old.", "A teenager and a toddler wait in chairs built for small people."],
        },
        {
          term: "Oncology", definition: "Care for people with cancer.", example: "Riverside Clinic oncology nurses stay with patients through long treatments.", cue: "Care for cancer patients", confusion: "ICU", icon: "droplets",
          moments: ["A patient comes in every week for a long treatment drip.", "Care for someone fighting cancer, one treatment at a time.", "She lost her hair to the treatment. The nurse knows her name."],
        },
        {
          term: "Labor and Delivery", definition: "The unit where babies are born.", example: "Riverside Clinic labor and delivery welcomed three babies last night.", cue: "Where babies are born", confusion: "Pediatrics", icon: "sun",
          moments: ["A family waits outside a room, and then a first cry.", "The mother's contractions are closer now. The room is ready.", "A newborn is weighed and wrapped while the father cries."],
        },
        {
          term: "Nurse Practitioner", definition: "A nurse with extra training who can diagnose and prescribe.", example: "A Riverside Clinic nurse practitioner runs the evening clinic.", cue: "A nurse who can prescribe", confusion: "Pediatrics", icon: "stethoscope",
          moments: ["She orders the test and writes the prescription herself.", "Extra years of school let this nurse diagnose on her own.", "No doctor tonight. The nurse with extra training writes the order."],
        },
      ],
      selectAll: {
        term: "Labor and Delivery",
        prompt: "Select every patient who belongs on the unit where babies arrive.",
        options: ["A mother whose water just broke", "A newborn minutes old", "A man with chest pain", "A teen with a broken arm"],
        correct: [0, 1],
        feedbackCorrect: "Mothers in labor and newborns belong here. The others go elsewhere.",
        feedbackWrong: "Only the mother giving birth and her newborn belong there.",
      },
      cases: [
        {
          terms: ["ICU", "Pediatrics"],
          scene: "Two new patients arrive at the same time.",
          steps: [
            { prompt: "A six year old with an ear infection. Which unit?", options: ["The unit for kids", "The unit for the sickest"], correctIndex: 0 },
            { prompt: "A man whose heart stopped twice today. Which unit?", options: ["The unit for kids", "The unit for the sickest"], correctIndex: 1 },
          ],
          feedbackCorrect: "Kids go to the kids' unit. The sickest go where they are watched every minute.",
          feedbackWrong: "Age picks the first unit. How sick he is picks the second.",
        },
        {
          terms: ["Nurse Practitioner", "Oncology"],
          scene: "The evening clinic is open and the only doctor has gone home.",
          steps: [
            { prompt: "A patient needs a test ordered tonight. Who can do it?", options: ["The nurse with extra training", "No one until morning"], correctIndex: 0 },
            { prompt: "She is here for her weekly cancer treatment. Which nurse takes her?", options: ["The baby unit nurse", "The cancer care nurse"], correctIndex: 1 },
          ],
          feedbackCorrect: "A nurse with extra training can order tests. Cancer care has its own nurses.",
          feedbackWrong: "Extra training lets her order and prescribe. Cancer care takes weekly treatment.",
        },
      ],
      powerPlay: {
        intro: "Take the tour of every unit.",
        paragraph: "A tour of Riverside Clinic. Upstairs, a first cry comes from {4}. In {2}, a nurse hands a sticker to a brave little girl. In {3}, the nurse greets a woman by name at her weekly treatment. The {1} is quiet and full of monitors. At night, a {5} checks a rash and writes the order herself.",
      },
      facts: ["Many nurses switch specialties more than once in a career."],
    },
  ],
};
