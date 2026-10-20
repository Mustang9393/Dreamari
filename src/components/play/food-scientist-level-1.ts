import type { Level } from "./types";
import { FS_ARTIFACTS, FS_PROJECT, FS_BEST_TRIAL } from "./food-scientist-artifacts";
// AI-authored fictional educational project; professional and human QA pending.
export const FOOD_SCIENTIST_LEVEL_1: Level = {
  "id": "fs-l1",
  "n": 1,
  "role": "Junior Food Scientist",
  "title": "The snack that keeps breaking",
  "blurb": "Investigate an oat snack, compare trials and recommend the next test.",
  "cover": "/images/play/fs/v1/arrival.png",
  "mood": "day",
  "hideBand": true,
  "directed": true,
  "cinematic": true,
  "worldTheme": true,
  "coreKit": true,
  "quietQuestions": true,
  "qaSkip": true,
  "saveSlot": 601,
  "cast": {
    "Kiran": "/images/play/fs/face-kiran.webp",
    "Mei": "/images/play/fs/face-mei.webp"
  },
  "preGame": {
    "startLabel": "Start the project",
    "skipLabel": "Skip to the lab",
    "handoffLine": "Sprout Lab · Your first project",
    "howToCta": "Start the project",
    "ladder": [
      "First formulation project",
      "Planned: repeatability study",
      "Planned: process scale-up",
      "Planned: product review"
    ],
    "skills": [
      "Critical Thinking",
      "Quality Control",
      "Professional Judgment"
    ],
    "skillTotal": 15,
    "lesson": {
      "title": "Food science in one minute",
      "screens": [
        {
          "kind": "say",
          "heading": "Study what changes a food.",
          "body": "Ingredients and processes affect quality. Tests help you check an idea.",
          "image": "/images/play/fs/v1/arrival.png"
        },
        {
          "kind": "say",
          "heading": "Know your authority.",
          "body": "You help record and compare. Your supervisor approves work and the quality lead approves tasting.",
          "image": "/images/play/fs/v1/hold.png"
        },
        {
          "kind": "check",
          "heading": "Evidence first",
          "question": "Which supports a recommendation?",
          "options": [
            {
              "label": "A recorded comparison using a consistent method",
              "correct": true
            },
            {
              "label": "A confident guess about what everyone likes",
              "correct": false
            }
          ]
        }
      ]
    }
  },
  "beats": [
    {
      "id": "FS1-01",
      "kind": "card",
      "variant": "chapter",
      "title": "A snack with a problem.",
      "body": "Sprout Lab is developing an oat snack. Too many pieces break during handling. Your first project is to help investigate.",
      "speaker": "Narrator",
      "system": false,
      "cta": "Continue",
      "artifact": FS_ARTIFACTS.brief
    },
    {
      "id": "FS1-02",
      "kind": "card",
      "variant": "chapter",
      "title": "Food science turns questions into tests.",
      "body": "Food scientists study how ingredients and processes affect food quality and safety. A good result needs evidence, not just a good taste.",
      "speaker": "System",
      "system": true,
      "cta": "Continue"
    },
    {
      "id": "FS1-03",
      "kind": "card",
      "variant": "chapter",
      "title": "Meet Kiran, your mentor.",
      "body": "“I’m Kiran, the product development scientist. You will help plan a comparison and write a recommendation. I supervise the lab work.”",
      "speaker": "Kiran",
      "system": false,
      "cta": "Continue"
    },
    {
      "id": "FS1-04",
      "kind": "card",
      "variant": "chapter",
      "title": "A recommendation, not a launch.",
      "body": "Mei, the quality lead, approves tasting and further work. You can record, compare and raise questions; you cannot clear a product for sale.",
      "speaker": "System",
      "system": true,
      "cta": "Continue",
      "artifact": FS_ARTIFACTS.brief
    },
    {
      "id": "FS1-05",
      "kind": "card",
      "variant": "chapter",
      "title": "Name the problem before the fix.",
      "body": "A useful question names something you can observe. “Which trial has less breakage in the same handling test?” gives the team a check.",
      "speaker": "System",
      "system": true,
      "cta": "Continue"
    },
    {
      "id": "FS1-06",
      "kind": "check",
      "method": "tap",
      "speaker": "System",
      "question": "Which is a testable question about a different juice project?",
      "options": [
        {
          "label": "Does the colour change during the agreed storage test?",
          "correct": true,
          "why": "That follows the evidence and the task."
        },
        {
          "label": "Will everyone love this juice?",
          "correct": false,
          "why": "That goes beyond what the evidence can tell you."
        }
      ],
      "cta": "Continue"
    },
    {
      "id": "FS1-07",
      "kind": "choice",
      "speaker": "Kiran",
      "question": "The oat snack breaks too easily during handling. What should you investigate first?",
      "feedback": "",
      "feedbackCta": "Continue",
      "skills": [
        "Critical Thinking",
        "Problem-Solving"
      ],
      "progress": 0.1,
      "planLineIfFailed": "you decided before checking the evidence",
      "layout": "options",
      "choices": [
        {
          "id": "a",
          "label": "How much the snack breaks in a consistent handling test",
          "tier": "best",
          "why": "A repeatable observation connects directly to the project problem."
        },
        {
          "id": "b",
          "label": "Which wrapper colour looks most exciting",
          "tier": "wrong",
          "why": "The wrapper colour does not measure snack breakage."
        },
        {
          "id": "c",
          "label": "How to promise the longest shelf life",
          "tier": "wrong",
          "why": "Shelf life is a different question and has not been studied."
        }
      ]
    },
    {
      "id": "FS1-08",
      "kind": "card",
      "variant": "chapter",
      "title": "Use the tool that answers the question.",
      "body": "A balance measures ingredient mass. A texture test compares physical firmness. A sensory panel collects people’s responses under an agreed method.",
      "speaker": "System",
      "system": true,
      "cta": "Continue"
    },
    {
      "id": "FS1-TOOLS",
      "kind": "flips",
      "speaker": "System",
      "title": "Three different kinds of evidence",
      "cards": [
        {
          "term": "Balance",
          "def": "Measures ingredient mass in grams."
        },
        {
          "term": "Texture test",
          "def": "Measures a physical property using a defined method."
        },
        {
          "term": "Sensory panel",
          "def": "People describe or rate approved samples using an agreed method."
        }
      ],
      "cta": "Continue"
    },
    {
      "id": "FS1-09",
      "kind": "match",
      "prompt": "Tap a tool, then tap its evidence.",
      "speaker": "Kiran",
      "question": "Match each tool to the evidence it provides.",
      "feedback": "",
      "feedbackCta": "Continue",
      "skills": [
        "Reading Comprehension",
        "Active Learning"
      ],
      "progress": 0.2,
      "planLineIfFailed": "you decided before checking the evidence",
      "pairs": [
        {
          "term": "Balance",
          "def": "Ingredient mass"
        },
        {
          "term": "Texture test",
          "def": "Physical firmness"
        },
        {
          "term": "Sensory panel",
          "def": "People’s responses to a sample"
        }
      ],
      "whenRight": "Different questions need different evidence.",
      "whenWrong": "Mass, physical firmness and people’s responses are different measurements."
    },
    {
      "id": "FS1-10",
      "kind": "card",
      "variant": "chapter",
      "title": "Keep observation separate from explanation.",
      "body": "“The piece split into two” is an observation. “It split because mixing was too short” is a possible explanation until tested.",
      "speaker": "System",
      "system": true,
      "cta": "Continue"
    },
    {
      "id": "FS1-11",
      "kind": "check",
      "method": "tap",
      "speaker": "System",
      "question": "Which line is an observation from a different cracker test?",
      "options": [
        {
          "label": "Three pieces cracked when moved to the tray.",
          "correct": true,
          "why": "That follows the evidence and the task."
        },
        {
          "label": "The oven must be broken.",
          "correct": false,
          "why": "That goes beyond what the evidence can tell you."
        }
      ],
      "cta": "Continue"
    },
    {
      "id": "FS1-12",
      "kind": "bucket",
      "speaker": "Kiran",
      "question": "Sort each oat-snack note into observation or possible explanation.",
      "feedback": "",
      "feedbackCta": "Continue",
      "skills": [
        "Attention to Detail",
        "Critical Thinking"
      ],
      "progress": 0.3,
      "planLineIfFailed": "you decided before checking the evidence",
      "buckets": [
        "Observation",
        "Possible explanation"
      ],
      "items": [
        {
          "label": "The binder may be too low.",
          "into": 1
        },
        {
          "label": `${FS_PROJECT.batches[0].broken} pieces broke in the test.`,
          "into": 0
        },
        {
          "label": "Batch A weighed 100 g before the test.",
          "into": 0
        },
        {
          "label": "Longer mixing probably caused the breakage.",
          "into": 1
        }
      ],
      "whenRight": "You kept recorded events separate from ideas to investigate.",
      "whenWrong": "What you saw or measured is evidence. A proposed cause still needs a test."
    },
    {
      "id": "FS1-13",
      "kind": "card",
      "variant": "chapter",
      "title": "Make a fair comparison.",
      "body": "Change one planned factor and keep other conditions the same. Record the exact change. Repeat the comparison before treating one result as reliable.",
      "speaker": "System",
      "system": true,
      "cta": "Continue",
      "artifact": FS_ARTIFACTS.example
    },
    {
      "id": "FS1-14",
      "kind": "card",
      "variant": "chapter",
      "title": "Your team’s trial plan.",
      "body": "Kiran proposes replacing 5 g oats with 5 g binder in each 100 g trial. Keep mixing, shaping, storage interval and the test method unchanged.",
      "speaker": "Kiran",
      "system": false,
      "cta": "Continue",
      "artifact": FS_ARTIFACTS.plan
    },
    {
      "id": "FS1-15",
      "kind": "choice",
      "speaker": "Kiran",
      "question": "You are testing the planned oats-to-binder adjustment. Which comparison best isolates it?",
      "feedback": "",
      "feedbackCta": "Continue",
      "skills": [
        "Decision-Making",
        "Quality Control"
      ],
      "progress": 0.4,
      "planLineIfFailed": "you decided before checking the evidence",
      "layout": "options",
      "artifact": FS_ARTIFACTS.plan,
      "choices": [
        {
          "id": "a",
          "label": "Use A and B as planned, keeping all other conditions the same",
          "tier": "best",
          "why": "This tests the planned ingredient balance while holding the method steady."
        },
        {
          "id": "b",
          "label": "Change the binder, mixing time and shape together",
          "tier": "wrong",
          "why": "Several changes make it harder to tell which one affected the result."
        },
        {
          "id": "c",
          "label": "Make only B and compare it with a memory of A",
          "tier": "wrong",
          "why": "A remembered result is a weak comparison with no consistent control."
        }
      ]
    },
    {
      "id": "FS1-16",
      "kind": "card",
      "variant": "chapter",
      "title": "The record lets someone repeat your work.",
      "body": "Agree the method first, record both batch IDs while making them, then test. Write the result against the right ID before drawing a conclusion.",
      "speaker": "System",
      "system": true,
      "cta": "Continue",
      "artifact": FS_ARTIFACTS.flow
    },
    {
      "id": "FS1-17",
      "kind": "rank",
      "speaker": "Kiran",
      "question": "Order these dependent steps for the oat-snack comparison.",
      "feedback": "",
      "feedbackCta": "Continue",
      "skills": [
        "Time Management",
        "Quality Control"
      ],
      "progress": 0.5,
      "planLineIfFailed": "you decided before checking the evidence",
      "order": [
        "Agree the single change and shared test method",
        "Make and identify A and B using the plan",
        "Run the agreed test and record results by batch ID",
        "Compare results and propose the next check"
      ],
      "whenRight": "The plan defines the samples; the records connect the measurement to the recommendation.",
      "whenWrong": "You need a defined plan and identified samples before a result can support a conclusion."
    },
    {
      "id": "FS1-MID",
      "kind": "card",
      "variant": "act",
      "speaker": "System",
      "title": "",
      "body": "",
      "review": {
        "threshold": 65,
        "intro": {
          "kicker": "Mid-project review",
          "line": "Kiran checks how you planned the trial."
        },
        "progressLine": "Reviewing the first five decisions...",
        "pass": {
          "title": "A sound start.",
          "body": "You connected a testable question to a fair comparison. Next, protect the samples and interpret the evidence."
        },
        "fail": {
          "title": "Use the next checks to improve.",
          "body": "Keep the method steady, separate observations from explanations and ask when records are incomplete."
        }
      },
      "cta": "Continue the project"
    },
    {
      "id": "FS1-18",
      "kind": "card",
      "variant": "chapter",
      "title": "A missing record is a real gap.",
      "body": "A batch needs its ingredient identity and an agreed test method. Hold an uncertain sample separately and ask the supervisor. Never fill a gap with a guess.",
      "speaker": "System",
      "system": true,
      "cta": "Continue"
    },
    {
      "id": "FS1-19",
      "kind": "check",
      "method": "tap",
      "speaker": "System",
      "question": "A different test has an unknown sample ID. What is the next step?",
      "options": [
        {
          "label": "Hold it separately and check with the supervisor.",
          "correct": true,
          "why": "That follows the evidence and the task."
        },
        {
          "label": "Guess its identity from its colour.",
          "correct": false,
          "why": "That goes beyond what the evidence can tell you."
        }
      ],
      "cta": "Continue"
    },
    {
      "id": "FS1-20",
      "kind": "flags",
      "speaker": "Kiran",
      "question": "Find the two record problems that need follow-up.",
      "feedback": "",
      "feedbackCta": "Continue",
      "skills": [
        "Attention to Detail",
        "Written Communication"
      ],
      "progress": 0.6,
      "planLineIfFailed": "you decided before checking the evidence",
      "artifact": FS_ARTIFACTS.log,
      "rows": [
        {
          "label": "A has ingredient amounts and its test method recorded.",
          "flag": false,
          "why": "Those records support identifying and repeating the trial."
        },
        {
          "label": "B’s draft record omits the test method.",
          "flag": true,
          "why": "The team must restore the verified method record so the result can be interpreted."
        },
        {
          "label": "C has no confirmed ingredient identity.",
          "flag": true,
          "why": "Unknown ingredients must be checked before this sample can be used."
        },
        {
          "label": "D is held separately while its record is checked.",
          "flag": false,
          "why": "Holding an uncertain sample protects against using it by mistake."
        }
      ],
      "whenRight": "You identified missing evidence without treating a sensible hold as a defect.",
      "whenWrong": "The problems are B’s missing method and C’s missing ingredient identity."
    },
    {
      "id": "FS1-21",
      "kind": "card",
      "variant": "chapter",
      "title": "Tasting cannot clear an unknown sample.",
      "body": "An allergen is a substance that can trigger an allergic reaction. Allergen cross-contact can introduce one unintentionally. Appearance or taste cannot confirm allergen status.",
      "speaker": "System",
      "system": true,
      "cta": "Continue"
    },
    {
      "id": "FS1-22",
      "kind": "card",
      "variant": "chapter",
      "title": "Mei joins the project.",
      "body": "“I’m Mei, the quality lead. Sample C’s ingredient record and allergen review are incomplete. Keep it off the tasting tray while I investigate.”",
      "speaker": "Mei",
      "system": false,
      "cta": "Continue",
      "artifact": FS_ARTIFACTS.hold
    },
    {
      "id": "FS1-23",
      "kind": "choice",
      "speaker": "Mei",
      "question": "A colleague asks to taste sample C before its ingredient and allergen checks are confirmed. What do you do?",
      "feedback": "",
      "feedbackCta": "Continue",
      "skills": [
        "Safety Awareness",
        "Teamwork & Collaboration"
      ],
      "progress": 0.7,
      "planLineIfFailed": "you decided before checking the evidence",
      "speakerRole": "Junior food scientist",
      "layout": "options",
      "artifact": FS_ARTIFACTS.hold,
      "choices": [
        {
          "id": "a",
          "label": "Keep C out of tasting and ask Mei to confirm the checks",
          "tier": "best",
          "why": "Unknown ingredient and allergen status must be resolved before tasting is considered."
        },
        {
          "id": "b",
          "label": "Taste a tiny piece to see whether it seems safe",
          "tier": "wrong",
          "why": "A small taste cannot establish allergen status or safety."
        },
        {
          "id": "c",
          "label": "Offer C without mentioning the missing record",
          "tier": "wrong",
          "why": "The colleague would be deciding without essential information."
        }
      ]
    },
    {
      "id": "FS1-24",
      "kind": "card",
      "variant": "chapter",
      "title": "Ask a fair sensory question.",
      "body": "For approved samples, neutral codes reduce expectation clues. Keep serving conditions consistent and collect each person’s own response before discussion.",
      "speaker": "System",
      "system": true,
      "cta": "Continue"
    },
    {
      "id": "FS1-25",
      "kind": "card",
      "variant": "chapter",
      "title": "The panel has a clear boundary.",
      "body": "Mei has confirmed that A and B meet the panel protocol. C remains held. You are helping compare texture, not proving a health benefit.",
      "speaker": "Mei",
      "system": false,
      "cta": "Continue",
      "artifact": FS_ARTIFACTS.sensory
    },
    {
      "id": "FS1-26",
      "kind": "pick",
      "speaker": "Mei",
      "question": "Choose three methods for comparing the approved A and B samples fairly.",
      "feedback": "",
      "feedbackCta": "Continue",
      "skills": [
        "Quality Control",
        "Active Listening"
      ],
      "progress": 0.8,
      "planLineIfFailed": "you decided before checking the evidence",
      "pick": 3,
      "cards": [
        {
          "label": "Use neutral sample codes.",
          "role": "pick"
        },
        {
          "label": "Say which sample Kiran expects to win.",
          "role": "leave"
        },
        {
          "label": "Use the same serving conditions.",
          "role": "pick"
        },
        {
          "label": "Collect independent responses before group discussion.",
          "role": "pick"
        },
        {
          "label": "Let the loudest person answer for everyone.",
          "role": "leave"
        }
      ],
      "whenRight": "You reduced expectation and group-pressure clues while keeping the comparison consistent.",
      "whenWrong": "Use neutral codes, consistent conditions and independent responses."
    },
    {
      "id": "FS1-27",
      "kind": "card",
      "variant": "chapter",
      "title": "The handling results are ready.",
      "body": "Kiran brings the recorded counts. Read the two results and the limits of the test before recommending the next step.",
      "speaker": "Kiran",
      "system": false,
      "cta": "Continue",
      "artifact": FS_ARTIFACTS.results
    },
    {
      "id": "FS1-28",
      "kind": "card",
      "variant": "chapter",
      "title": "Build a recommendation in three parts.",
      "body": "Connect the question to the measured result and a next check. A small trial can support a repeat test; it cannot prove all production will behave the same way.",
      "speaker": "System",
      "system": true,
      "cta": "Continue",
      "artifact": FS_ARTIFACTS.example
    },
    {
      "id": "FS1-29",
      "kind": "check",
      "method": "tap",
      "speaker": "System",
      "question": "One different cracker trial breaks less often. What does that support?",
      "options": [
        {
          "label": "Repeat that comparison using the same method.",
          "correct": true,
          "why": "That follows the evidence and the task."
        },
        {
          "label": "Promise that it will never break in production.",
          "correct": false,
          "why": "That goes beyond what the evidence can tell you."
        }
      ],
      "cta": "Continue"
    },
    {
      "id": "FS1-30",
      "kind": "chain",
      "speaker": "Kiran",
      "question": "Build a recommendation to Mei from the oat-snack handling results.",
      "feedback": "",
      "feedbackCta": "Continue",
      "skills": [
        "Persuasive Communication",
        "Professional Judgment"
      ],
      "progress": 0.9,
      "planLineIfFailed": "you decided before checking the evidence",
      "artifact": FS_ARTIFACTS.results,
      "steps": [
        {
          "label": "Question",
          "prompt": "What were we investigating?",
          "options": [
            {
              "label": "Reduce breakage during handling",
              "correct": true
            },
            {
              "label": "Prove the snack has a long shelf life",
              "correct": false
            }
          ]
        },
        {
          "label": "Evidence",
          "prompt": "What did this comparison show?",
          "options": [
            {
              "label": `${FS_BEST_TRIAL} had less breakage than A in this small test`,
              "correct": FS_BEST_TRIAL === "B"
            },
            {
              "label": "Everyone prefers the flavour of B",
              "correct": false
            }
          ]
        },
        {
          "label": "Next step",
          "prompt": "What can you recommend?",
          "options": [
            {
              "label": "Repeat B alongside A under the same method",
              "correct": true
            },
            {
              "label": "Launch B and stop checking",
              "correct": false
            }
          ]
        }
      ],
      "whenRight": "You connected the real question, the measured result and a proportionate next test.",
      "whenWrong": "Keep the recommendation within the handling evidence: less breakage in this trial, then a repeat comparison."
    },
    {
      "id": "FS1-31",
      "kind": "card",
      "variant": "chapter",
      "title": "Mei asks a harder question.",
      "body": "“Your handling test helps. Could we now promise that this snack stays safe for months?”",
      "speaker": "Mei",
      "system": false,
      "cta": "Continue"
    },
    {
      "id": "FS1-32",
      "kind": "card",
      "variant": "chapter",
      "title": "Each claim needs the right evidence.",
      "body": "Handling tests measure breakage. Sensory tests collect responses. Neither establishes a safe shelf life. Ask the quality team for a suitable study before making that claim.",
      "speaker": "System",
      "system": true,
      "cta": "Continue",
      "artifact": FS_ARTIFACTS.results
    },
    {
      "id": "FS1-33",
      "kind": "choice",
      "speaker": "Mei",
      "question": "Mei asks whether the handling results support a safe shelf-life claim. What do you recommend?",
      "feedback": "",
      "feedbackCta": "Continue",
      "skills": [
        "Professional Judgment",
        "Written Communication"
      ],
      "progress": 1.0,
      "planLineIfFailed": "you decided before checking the evidence",
      "layout": "options",
      "choices": [
        {
          "id": "a",
          "label": "Record that shelf life is unknown and ask the quality team to plan the required study",
          "tier": "best",
          "why": "The handling evidence does not answer the shelf-life question. A qualified team must define the appropriate work."
        },
        {
          "id": "b",
          "label": "Promise months of safe storage because B broke less",
          "tier": "wrong",
          "why": "Mechanical breakage is not evidence of safe storage life."
        },
        {
          "id": "c",
          "label": "Use the panel’s texture response as a safety certificate",
          "tier": "wrong",
          "why": "People’s texture responses do not establish product safety."
        }
      ]
    },
    {
      "id": "FS1-34",
      "kind": "card",
      "variant": "chapter",
      "title": "A result someone else can use.",
      "body": "“Keep the batch records, the measured comparison and its limits together. B is a candidate for another test, while C remains held. That is a useful first project.”",
      "speaker": "Mei",
      "system": false,
      "cta": "Continue",
      "artifact": FS_ARTIFACTS.handover
    },
    {
      "id": "FS1-35",
      "kind": "card",
      "variant": "chapter",
      "title": "You made the next test clearer.",
      "body": "“You asked a testable question, kept a comparison fair and named what we still do not know. That is how a food scientist makes progress.”",
      "speaker": "Kiran",
      "system": false,
      "cta": "Continue"
    },
    {
      "id": "FS1-REVIEW",
      "kind": "review",
      "title": "Your first food science project",
      "body": "The review considers your decisions, records and communication.",
      "pending": "Reviewing your project",
      "deciding": "Project review in progress",
      "decidingNote": "Evidence, quality and responsible next steps."
    }
  ],
  "endings": [
    {
      "min": 85,
      "band": "Trusted",
      "headline": "A recommendation worth testing",
      "message": "You used evidence, kept uncertainty visible and worked within your role.",
      "subline": "Level 1 complete. Later projects are planned, not built.",
      "primary": "Next project · planned",
      "advances": true
    },
    {
      "min": 0,
      "band": "At Risk",
      "headline": "Strengthen the evidence",
      "message": "Review the missed decisions, then try the project again. One attempt does not define your future.",
      "subline": "Connect each recommendation to a record and a check.",
      "primary": "Start over",
      "advances": false
    }
  ]
};
