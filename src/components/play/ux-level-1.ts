import type { Level } from "./types";
import { UX_ARTIFACTS, UX_FORM_FINDINGS } from "./ux-work-artifacts";

// AI-authored fictional project, using the shared engine and read-only evidence.
export const UX_LEVEL_1: Level = {
  "id": "ux-l1",
  "n": 1,
  "role": "Junior UX Designer",
  "title": "Make the sign-up work",
  "blurb": "Help people join a volunteer event. Research, test and explain a clearer design.",
  "cover": "/images/play/ux/v4/arrival.png",
  "mood": "day",
  "hideBand": true,
  "directed": true,
  "cinematic": true,
  "worldTheme": true,
  "coreKit": true,
  "quietQuestions": true,
  "saveSlot": 501,
  "cast": {
    "Arjun": "/images/play/ux/face-arjun-v4.webp",
    "Noah": "/images/play/ux/face-noah-v4.webp",
    "Eleanor": "/images/play/ux/face-eleanor-v4.webp",
    "Samira": "/images/play/ux/face-samira-v4.webp"
  },
  "preGame": {
    "startLabel": "Start the project",
    "skipLabel": "Skip to the studio",
    "handoffLine": "Northline Studio · Your first project",
    "howToCta": "Start the project",
    "ladder": [
      "Junior UX Designer",
      "UX Designer",
      "Senior UX Designer",
      "Lead UX Designer",
      "Design Manager",
      "Design Director"
    ],
    "skills": [
      "Critical Thinking",
      "Active Listening",
      "Problem-Solving"
    ],
    "skillTotal": 15,
    "lesson": {
      "title": "UX in one minute",
      "screens": [
        {
          "kind": "say",
          "heading": "Help someone finish a task",
          "body": "UX means user experience. A good design helps someone do what they came to do.",
          "image": "/images/play/ux/v4/studio.png"
        },
        {
          "kind": "say",
          "heading": "Watch before you change",
          "body": "See what people try. Separate what happened from what you think caused it.",
          "image": "/images/play/ux/v4/research.png"
        },
        {
          "kind": "check",
          "heading": "Start with the goal",
          "question": "Which is a user goal?",
          "options": [
            {
              "label": "Join an event near home",
              "correct": true,
              "why": "It says what someone wants to do."
            },
            {
              "label": "Use a bright green button",
              "correct": false,
              "why": "That is a design idea."
            }
          ]
        }
      ]
    }
  },
  "beats": [
    {
      "id": "UX1-01",
      "kind": "card",
      "variant": "chapter",
      "title": "Your first project starts here.",
      "body": "Northline Studio is improving a volunteer sign-up site. People choose an event, but some leave before they finish.",
      "speaker": "Narrator",
      "system": false,
      "cta": "Continue"
    },
    {
      "id": "UX1-02",
      "kind": "card",
      "variant": "chapter",
      "title": "UX means user experience.",
      "body": "Your job is to help people complete a task. A beautiful page still fails if someone cannot use it.",
      "speaker": "System",
      "system": true,
      "cta": "Continue"
    },
    {
      "id": "UX1-03",
      "kind": "card",
      "variant": "character",
      "title": "Arjun is your mentor.",
      "body": "He helps you turn what you observe into a design decision. He will review your work before it reaches a client.",
      "speaker": "Narrator",
      "system": false,
      "cta": "Continue",
      "castMember": "Arjun",
      "setup": "Arjun • Senior UX Designer"
    },
    {
      "id": "UX1-04",
      "kind": "card",
      "variant": "chapter",
      "title": "You start as a Junior UX Designer.",
      "body": "Arjun reviews the work you hand in. Samira, the design lead, decides whether it is ready for the client.",
      "speaker": "System",
      "system": true,
      "cta": "Continue",
      "ladder": [
        {
          "label": "You · Junior UX Designer",
          "lit": true
        },
        {
          "label": "Arjun · Senior UX Designer",
          "lit": true
        }
      ]
    },
    {
      "id": "UX1-05",
      "kind": "card",
      "variant": "chapter",
      "title": "Start with the person and the task.",
      "body": "A user goal is what someone came to do. A design idea is one possible way to help.",
      "speaker": "System",
      "system": true,
      "cta": "Continue",
      "artifact": UX_ARTIFACTS.flow
    },
    {
      "id": "UX1-06",
      "kind": "card",
      "variant": "chapter",
      "title": "For example",
      "body": "A volunteer wants to find a nearby event and join it. A purple button is a design idea, not their goal.",
      "speaker": "System",
      "system": true,
      "cta": "Continue",
      "artifact": UX_ARTIFACTS.flow
    },
    {
      "id": "UX1-07",
      "kind": "check",
      "method": "tap",
      "speaker": "System",
      "question": "Which sentence describes a user goal?",
      "options": [
        {
          "label": "Join an event near home",
          "correct": true,
          "why": "It says what the person wants to achieve."
        },
        {
          "label": "Make the button purple",
          "correct": false,
          "why": "That is a design choice, not the person's goal."
        }
      ],
      "cta": "Continue"
    },
    {
      "id": "UX1-08",
      "kind": "choice",
      "speaker": "Arjun",
      "setup": "Arjun asks you to investigate why people leave the sign-up page.",
      "question": "What should you find out first?",
      "feedback": "",
      "feedbackCta": "Continue",
      "skills": [
        "Critical Thinking",
        "Active Listening"
      ],
      "progress": 0.1,
      "planLineIfFailed": "you chose a visual solution before understanding the problem",
      "layout": "options",
      "choices": [
        {
          "id": "a",
          "label": "What stops people from joining an event",
          "tier": "best",
          "why": "Start with the problem people face before choosing a design."
        },
        {
          "id": "b",
          "label": "Which new colours the team likes",
          "tier": "wrong",
          "why": "Colour preferences do not explain why people leave."
        },
        {
          "id": "c",
          "label": "Which animation will impress the client",
          "tier": "wrong",
          "why": "An impressive effect may leave the sign-up problem untouched."
        }
      ]
    },
    {
      "id": "UX1-09",
      "kind": "card",
      "variant": "chapter",
      "title": "Four tools for the work",
      "body": "These words will help you choose what to do next.",
      "speaker": "System",
      "system": true,
      "cta": "Continue",
      "artifact": UX_ARTIFACTS.wireframe
    },
    {
      "id": "UX1-10",
      "kind": "flips",
      "speaker": "System",
      "title": "Your UX toolkit",
      "cards": [
        {
          "term": "User flow",
          "def": "The steps someone takes to finish a task."
        },
        {
          "term": "Wireframe",
          "def": "A simple layout that shows what goes where."
        },
        {
          "term": "Prototype",
          "def": "A test version of how an experience will work."
        },
        {
          "term": "Usability test",
          "def": "Watching someone try a task to find where the design gets in their way."
        }
      ],
      "cta": "Try the tools"
    },
    {
      "id": "UX1-11",
      "kind": "match",
      "speaker": "Arjun",
      "setup": "",
      "question": "Match each tool to its purpose.",
      "feedback": "",
      "feedbackCta": "Continue",
      "skills": [
        "Reading Comprehension",
        "Active Learning"
      ],
      "progress": 0.2,
      "planLineIfFailed": "you chose a tool without checking what it was for",
      "pairs": [
        {
          "term": "User flow",
          "def": "Map the steps to join an event"
        },
        {
          "term": "Wireframe",
          "def": "Plan where the page content goes"
        },
        {
          "term": "Prototype",
          "def": "Try the sign-up before building it"
        },
        {
          "term": "Usability test",
          "def": "Watch someone attempt the sign-up"
        }
      ],
      "whenRight": "Each tool answers a different question about the experience.",
      "whenWrong": "A flow maps steps; a wireframe plans layout; a prototype lets people try it; a test reveals trouble."
    },
    {
      "id": "UX1-12",
      "kind": "card",
      "variant": "chapter",
      "title": "Write what happened, then what you think it means.",
      "body": "An observation records what you saw or heard. An assumption is an explanation you have not checked.",
      "speaker": "System",
      "system": true,
      "cta": "Continue",
      "artifact": UX_ARTIFACTS.notes
    },
    {
      "id": "UX1-13",
      "kind": "card",
      "variant": "chapter",
      "title": "For example",
      "body": "A person clicked the event title three times: observation. They dislike the colours: an assumption unless they told you.",
      "speaker": "System",
      "system": true,
      "cta": "Continue"
    },
    {
      "id": "UX1-14",
      "kind": "bucket",
      "speaker": "Arjun",
      "setup": "",
      "question": "Sort the research notes.",
      "feedback": "",
      "feedbackCta": "Continue",
      "skills": [
        "Critical Thinking",
        "Attention to Detail"
      ],
      "progress": 0.3,
      "planLineIfFailed": "you reported a guess as if it were observed evidence",
      "buckets": [
        "Observation",
        "Assumption"
      ],
      "items": [
        {
          "label": "Eleanor clicked the title three times.",
          "into": 0
        },
        {
          "label": "Everyone wants a brighter page.",
          "into": 1
        },
        {
          "label": "The button is probably too boring.",
          "into": 1
        },
        {
          "label": "Eleanor asked where to join.",
          "into": 0
        }
      ],
      "whenRight": "Record the behaviour clearly and keep possible explanations separate.",
      "whenWrong": "A click or a quote is evidence. A guessed reason still needs checking."
    },
    {
      "id": "UX1-15",
      "kind": "card",
      "variant": "chapter",
      "title": "Let the participant try.",
      "body": "Give a realistic task without naming the button. Observe before helping. You are testing the design, not the person.",
      "speaker": "Arjun",
      "system": false,
      "cta": "Continue"
    },
    {
      "id": "UX1-16",
      "kind": "card",
      "variant": "chapter",
      "title": "For example",
      "body": "Try: Find a Saturday event near home and join it. Avoid: Click the green Join button.",
      "speaker": "System",
      "system": true,
      "cta": "Continue"
    },
    {
      "id": "UX1-17",
      "kind": "card",
      "variant": "character",
      "title": "Eleanor is trying the sign-up.",
      "body": "She has used volunteer sites before. Arjun takes notes while Eleanor works at her own pace.",
      "speaker": "Narrator",
      "system": false,
      "cta": "Continue",
      "castMember": "Eleanor",
      "setup": "Eleanor • Research Participant"
    },
    {
      "id": "UX1-18",
      "kind": "rapid",
      "speaker": "Arjun",
      "setup": "",
      "question": "Choose the more useful research habit.",
      "feedback": "",
      "feedbackCta": "Continue",
      "skills": [
        "Active Listening",
        "Social Awareness"
      ],
      "progress": 0.4,
      "planLineIfFailed": "you steered a participant instead of learning from their attempt",
      "items": [
        {
          "question": "Which task avoids giving the answer away?",
          "options": [
            {
              "label": "Join an event you could attend.",
              "correct": true,
              "why": "It gives a goal while leaving the route to the participant."
            },
            {
              "label": "Press Join beside the event.",
              "correct": false,
              "why": "It names the action you wanted to observe them discover."
            }
          ]
        },
        {
          "question": "Eleanor pauses. What do you do first?",
          "options": [
            {
              "label": "Observe and give her time.",
              "correct": true,
              "why": "The pause may reveal something about the experience."
            },
            {
              "label": "Point at the correct button.",
              "correct": false,
              "why": "Helping immediately hides the difficulty you are studying."
            }
          ]
        },
        {
          "question": "Which question is neutral?",
          "options": [
            {
              "label": "What were you expecting there?",
              "correct": true,
              "why": "It lets Eleanor describe her expectation in her own words."
            },
            {
              "label": "That button was confusing, right?",
              "correct": false,
              "why": "It suggests the answer instead of listening for it."
            }
          ]
        },
        {
          "question": "What belongs in your notes?",
          "options": [
            {
              "label": "She asked where to join.",
              "correct": true,
              "why": "It records something you actually heard."
            },
            {
              "label": "She is bad with websites.",
              "correct": false,
              "why": "It judges the person and hides the design problem."
            }
          ]
        }
      ],
      "whenPass": "Give a goal, observe patiently and ask neutral questions.",
      "whenFail": "Avoid hints and judgments so the session reveals what the design needs."
    },
    {
      "id": "UX1-19",
      "kind": "card",
      "variant": "chapter",
      "title": "Turn evidence into a small test.",
      "body": "Name the difficulty, sketch a change, make a prototype, then watch another attempt. A sketch alone does not prove improvement.",
      "speaker": "Arjun",
      "system": false,
      "cta": "Continue",
      "artifact": UX_ARTIFACTS.iteration
    },
    {
      "id": "UX1-20",
      "kind": "rank",
      "speaker": "Arjun",
      "setup": "",
      "question": "Put the next steps in order.",
      "feedback": "",
      "feedbackCta": "Continue",
      "skills": [
        "Problem-Solving",
        "Time Management"
      ],
      "progress": 0.5,
      "planLineIfFailed": "you treated an untested sketch as a proven fix",
      "order": [
        "Name the problem in the notes",
        "Sketch a clearer route to join",
        "Make a prototype of the change",
        "Test whether people can finish"
      ],
      "whenRight": "The evidence gives the change a purpose, and the next test checks it.",
      "whenWrong": "Start with the observed problem and test the change before calling it a fix."
    },
    {
      "id": "UX1-MID",
      "kind": "card",
      "variant": "act",
      "speaker": "System",
      "title": "",
      "body": "",
      "review": {
        "threshold": 65,
        "intro": {
          "kicker": "Mid-project review",
          "line": "Arjun is reviewing how you approached the first half."
        },
        "progressLine": "Reviewing your research and iteration decisions...",
        "pass": {
          "title": "You have a solid starting point.",
          "body": "You connected a task to evidence and planned a test. Now check whether the design works for more people."
        },
        "fail": {
          "title": "There is still time to improve.",
          "body": "Use the next decisions to check the evidence and explain what the design still needs."
        }
      },
      "cta": "Continue the project"
    },
    {
      "id": "UX1-21",
      "kind": "card",
      "variant": "chapter",
      "title": "Keep the form clear for more people.",
      "body": "Use visible field labels and plain error messages. Do not rely on colour alone to show a problem.",
      "speaker": "System",
      "system": true,
      "cta": "Continue",
      "artifact": UX_ARTIFACTS.formExample
    },
    {
      "id": "UX1-22",
      "kind": "card",
      "variant": "chapter",
      "title": "For example",
      "body": "Label the field Email address. If it is incomplete, explain what to fix beside the field instead of showing only a red border.",
      "speaker": "System",
      "system": true,
      "cta": "Continue",
      "artifact": UX_ARTIFACTS.formExample
    },
    {
      "id": "UX1-23",
      "kind": "flags",
      "speaker": "Arjun",
      "setup": "",
      "question": "Find both problems in this draft form.",
      "feedback": "",
      "feedbackCta": "Continue",
      "skills": [
        "Attention to Detail",
        "Helping & Supporting Others"
      ],
      "progress": 0.6,
      "planLineIfFailed": "you handed over a form with unclear labels and errors",
      "rows": UX_FORM_FINDINGS,
      "whenRight": "People need clear labels and useful error messages, not colour clues alone.",
      "whenWrong": "The red-only marker and the vague error hide information people need.",
      "artifact": UX_ARTIFACTS.form
    },
    {
      "id": "UX1-24",
      "kind": "card",
      "variant": "character",
      "title": "Noah is working on the same project.",
      "body": "He has a cleaner-looking draft, but you have not seen evidence that people can finish it.",
      "speaker": "Narrator",
      "system": false,
      "cta": "Continue",
      "castMember": "Noah",
      "setup": "Noah • Junior UX Designer"
    },
    {
      "id": "UX1-25",
      "kind": "choice",
      "speaker": "Noah",
      "setup": "Noah says his draft looks cleaner than yours.",
      "question": "How do you respond to Noah?",
      "feedback": "",
      "feedbackCta": "Continue",
      "skills": [
        "Teamwork & Collaboration",
        "Verbal Communication"
      ],
      "progress": 0.7,
      "planLineIfFailed": "you made a design disagreement personal instead of checking the work",
      "layout": "options",
      "choices": [
        {
          "id": "a",
          "label": "Compare both drafts using the same user task",
          "tier": "best",
          "why": "A shared task lets the team compare the work without making it personal."
        },
        {
          "id": "b",
          "label": "Tell the team his version looks lazy",
          "tier": "wrong",
          "why": "A personal attack does not show which design helps users."
        },
        {
          "id": "c",
          "label": "Agree his version is better without testing",
          "tier": "wrong",
          "why": "Appearance alone does not show whether people can finish."
        }
      ],
      "artifact": UX_ARTIFACTS.iteration
    },
    {
      "id": "UX1-26",
      "kind": "card",
      "variant": "chapter",
      "title": "Explain the decision in three parts.",
      "body": "State the problem, point to evidence, then name the next check. Separate what you know from what you expect.",
      "speaker": "Arjun",
      "system": false,
      "cta": "Continue",
      "artifact": UX_ARTIFACTS.notes
    },
    {
      "id": "UX1-27",
      "kind": "card",
      "variant": "character",
      "title": "Samira leads the design team.",
      "body": "She asks what your evidence supports before she agrees to show the work to the client.",
      "speaker": "Narrator",
      "system": false,
      "cta": "Continue",
      "castMember": "Samira",
      "setup": "Samira • Design Lead"
    },
    {
      "id": "UX1-28",
      "kind": "card",
      "variant": "chapter",
      "title": "Samira reviews what leaves the studio.",
      "body": "Arjun helped you prepare. Now show Samira the problem, the evidence and the test you still need.",
      "speaker": "System",
      "system": true,
      "cta": "Continue",
      "ladder": [
        {
          "label": "You · Junior UX Designer",
          "lit": true
        },
        {
          "label": "Arjun · Senior UX Designer",
          "lit": true
        },
        {
          "label": "Samira · Design Lead",
          "lit": true
        }
      ]
    },
    {
      "id": "UX1-29",
      "kind": "chain",
      "speaker": "Samira",
      "setup": "",
      "question": "Build a clear explanation for Samira.",
      "feedback": "",
      "feedbackCta": "Continue",
      "skills": [
        "Written Communication",
        "Persuasive Communication"
      ],
      "progress": 0.8,
      "planLineIfFailed": "you claimed a design worked without evidence",
      "steps": [
        {
          "label": "Problem",
          "prompt": "What needs to improve?",
          "options": [
            {
              "label": "People cannot find how to join an event.",
              "correct": true
            },
            {
              "label": "The page needs to look more exciting.",
              "correct": false
            }
          ]
        },
        {
          "label": "Evidence",
          "prompt": "What supports that?",
          "options": [
            {
              "label": "Eleanor asked where to join after trying the title.",
              "correct": true
            },
            {
              "label": "The team prefers a bigger button.",
              "correct": false
            }
          ]
        },
        {
          "label": "Next check",
          "prompt": "What will you do next?",
          "options": [
            {
              "label": "Test whether people can finish using the prototype.",
              "correct": true
            },
            {
              "label": "Promise the new layout will work for everyone.",
              "correct": false
            }
          ]
        }
      ],
      "whenRight": "The explanation connects the problem, evidence and a testable next step.",
      "whenWrong": "A convincing explanation still needs evidence and an honest next check.",
      "artifact": UX_ARTIFACTS.notes
    },
    {
      "id": "UX1-30",
      "kind": "card",
      "variant": "chapter",
      "title": "Make the handover useful.",
      "body": "A developer needs the route, the important states and the reason for the change. Include errors and keyboard use, not just the best-looking screen.",
      "speaker": "Arjun",
      "system": false,
      "cta": "Continue",
      "artifact": UX_ARTIFACTS.handover
    },
    {
      "id": "UX1-31",
      "kind": "card",
      "variant": "chapter",
      "title": "For example",
      "body": "Send the prototype route, notes for errors and keyboard use, and the research finding behind the change. Flag what is still untested.",
      "speaker": "System",
      "system": true,
      "cta": "Continue"
    },
    {
      "id": "UX1-32",
      "kind": "pick",
      "speaker": "Arjun",
      "setup": "",
      "question": "Choose the three items for the handover.",
      "feedback": "",
      "feedbackCta": "Continue",
      "skills": [
        "Written Communication",
        "Teamwork & Collaboration"
      ],
      "progress": 0.9,
      "planLineIfFailed": "you sent a handover that left the developer guessing",
      "pick": 3,
      "cards": [
        {
          "label": "Prototype route with the join steps",
          "role": "pick"
        },
        {
          "label": "Only a polished screenshot of the first page",
          "role": "leave"
        },
        {
          "label": "Error and keyboard behaviour notes",
          "role": "pick"
        },
        {
          "label": "Research finding and remaining uncertainty",
          "role": "pick"
        },
        {
          "label": "A promise that no testing is needed",
          "role": "leave"
        }
      ],
      "whenRight": "The handover covers behaviour, reasons and what still needs checking.",
      "whenWrong": "A screenshot alone leaves important behaviour and evidence missing."
    },
    {
      "id": "UX1-33",
      "kind": "card",
      "variant": "chapter",
      "title": "A blocker is not a polish issue.",
      "body": "If someone cannot complete the task, explain the impact and agree a fix and retest. Do not hide it to meet a deadline.",
      "speaker": "Samira",
      "system": false,
      "cta": "Continue"
    },
    {
      "id": "UX1-34",
      "kind": "choice",
      "speaker": "Samira",
      "setup": "The latest test still shows that keyboard users cannot finish the join flow.",
      "question": "What do you recommend to Samira?",
      "feedback": "",
      "feedbackCta": "Continue",
      "skills": [
        "Decision-Making",
        "Professional Judgment"
      ],
      "progress": 1.0,
      "planLineIfFailed": "you hid a problem that stopped someone completing the task",
      "layout": "options",
      "choices": [
        {
          "id": "a",
          "label": "Flag the blocker and agree a fix and retest",
          "tier": "best",
          "why": "State the impact clearly so the team can fix and check it before claiming the flow is ready."
        },
        {
          "id": "b",
          "label": "Call it ready because the screenshots look finished",
          "tier": "wrong",
          "why": "A finished-looking screen does not remove a blocked task."
        },
        {
          "id": "c",
          "label": "Leave the issue out of the review notes",
          "tier": "wrong",
          "why": "Hiding the blocker makes the next person decide without important evidence."
        }
      ],
      "artifact": UX_ARTIFACTS.handover
    },
    {
      "id": "UX1-35",
      "kind": "card",
      "variant": "chapter",
      "title": "You have a clearer way to work.",
      "body": "You followed a real task, separated evidence from guesses and explained what still needs checking. Keep those habits on the next project.",
      "speaker": "Arjun",
      "system": false,
      "cta": "Continue"
    },
    {
      "id": "UX1-36",
      "kind": "review",
      "title": "Your first project review",
      "body": "Samira reviews the decisions you made, not how impressive the pictures looked.",
      "pending": "Reviewing your project",
      "deciding": "Project review in progress",
      "decidingNote": "Evidence, clarity and teamwork."
    }
  ],
  "endings": [
    {
      "min": 85,
      "band": "Trusted",
      "headline": "Ready for your next project",
      "message": "Your decisions show that you can use evidence, explain a design and work with the team.",
      "subline": "Level 1 complete. The next level is planned, not built.",
      "primary": "Play this project again",
      "advances": true
    },
    {
      "min": 0,
      "band": "At Risk",
      "headline": "Keep working on the project",
      "message": "Review the decisions you missed and connect the design to what people need.",
      "subline": "You can practice and try again.",
      "primary": "Start over",
      "advances": false
    }
  ]
};
