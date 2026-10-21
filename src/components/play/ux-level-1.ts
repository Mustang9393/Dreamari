import type { Level } from "./types";
import { UX_ARTIFACTS } from "./ux-work-artifacts";
// AI-authored fictional project. Order and score contract: vetted IB Level 1.
export const UX_LEVEL_1: Level = {
  "id": "ux-l1",
  "n": 1,
  "role": "Junior UX Designer",
  "title": "The VELO launch",
  "blurb": "Your studio has one day to fix a sportswear launch before the client demo.",
  "cover": "/images/play/ux/v6/arrival.png",
  "mood": "day",
  "hideBand": true,
  "directed": true,
  "cinematic": true,
  "worldTheme": true,
  "coreKit": true,
  "quietQuestions": true,
  "saveSlot": 502,
  "cast": {
    "Arjun": "/images/play/ux/face-arjun-v6.webp",
    "Noah": "/images/play/ux/face-noah-v6.webp",
    "Eleanor": "/images/play/ux/face-eleanor-v6.webp",
    "Samira": "/images/play/ux/face-samira-v6.webp",
    "Amina": "/images/play/ux/face-amina-v6.webp"
  },
  "preGame": {
    "startLabel": "Start the project",
    "skipLabel": "Skip to launch day",
    "handoffLine": "Northline Studio · VELO launch day",
    "howToCta": "Start the project",
    "ladder": [
      "Junior UX Designer",
      "UX Designer",
      "Senior UX Designer",
      "Lead / Principal UX Designer"
    ],
    "skills": [
      "Critical Thinking",
      "Active Listening",
      "Problem-Solving"
    ],
    "skillTotal": 15,
    "lesson": {
      "title": "What Is a UX Designer?",
      "screens": [
        {
          "kind": "say",
          "heading": "Help people finish a task.",
          "body": "UX means user experience. Designers study what people need, then test ways to help.",
          "image": "/images/play/ux/v6/arrival.png"
        },
        {
          "kind": "say",
          "heading": "Start rough. Learn fast.",
          "body": "A wireframe is a rough screen layout. A prototype is a test version of a design.",
          "image": "/images/play/ux/v6/work.png"
        },
        {
          "kind": "check",
          "heading": "Try it.",
          "question": "What should guide a design change?",
          "options": [
            {
              "label": "What people need and what tests show",
              "correct": true,
              "why": "Evidence helps the team choose what to improve."
            },
            {
              "label": "Which color the designer likes best",
              "correct": false,
              "why": "Personal taste does not show whether a task works."
            }
          ]
        }
      ]
    },
    "missionLine": "Build your skills. Design careers can follow different paths.",
    "ladderBranches": [
      {
        "label": "Craft path",
        "roles": "Lead / Principal UX Designer"
      },
      {
        "label": "Management path",
        "roles": "Design Manager → Director → VP of Design"
      }
    ],
    "ladderNote": "Titles vary by company. These are career paths, not promised promotions."
  },
  "beats": [
    {
      "kind": "card",
      "variant": "intro",
      "speaker": "Narrator",
      "title": "Launch day starts here.",
      "body": "You join Northline Studio as a junior UX designer.",
      "cta": "Continue",
      "id": "UX1-01"
    },
    {
      "kind": "card",
      "variant": "intro",
      "speaker": "Narrator",
      "title": "One client. One afternoon.",
      "body": "VELO, a top sportswear brand, demos its new shoe app at 4 p.m. Runners must be able to reserve a pair.",
      "cta": "Continue",
      "id": "UX1-02"
    },
    {
      "kind": "card",
      "variant": "character",
      "speaker": "Arjun",
      "title": "Meet Arjun.",
      "body": "Your senior designer guides the work. He needs a clear plan before the client arrives.",
      "cta": "Continue",
      "castMember": "Arjun",
      "id": "UX1-03"
    },
    {
      "kind": "card",
      "variant": "character",
      "speaker": "Narrator",
      "title": "Your place on the team.",
      "body": "Arjun reviews your draft. Design lead Samira decides what the client sees.",
      "cta": "Continue",
      "ladder": [
        {
          "label": "Junior · You",
          "lit": true
        },
        {
          "label": "UX Designer",
          "lit": false
        },
        {
          "label": "Senior · Arjun",
          "lit": true
        },
        {
          "label": "Lead / Principal",
          "lit": false
        }
      ],
      "id": "UX1-04"
    },
    {
      "kind": "card",
      "variant": "intro",
      "speaker": "Narrator",
      "title": "Meet your launch team.",
      "body": "Noah builds screens. Amina checks the mobile flow. You will test whether runners can reserve a pair.",
      "cta": "Continue",
      "castMembers": [
        "Arjun",
        "Noah",
        "Amina"
      ],
      "id": "UX1-05"
    },
    {
      "kind": "choice",
      "layout": "options",
      "speaker": "Arjun",
      "question": "Where do you start?",
      "choices": [
        {
          "id": "a",
          "label": "Watch a runner try to reserve a pair.",
          "tier": "best",
          "why": "You need to see where the task breaks before choosing a fix."
        },
        {
          "id": "b",
          "label": "Polish the launch screen first.",
          "tier": "wrong",
          "why": "You could polish the wrong part. First watch someone use it."
        },
        {
          "id": "c",
          "label": "Copy a rival brand’s app.",
          "tier": "wrong",
          "why": "Their design may solve a different problem."
        }
      ],
      "feedback": "",
      "feedbackCta": "Continue",
      "id": "UX1-06",
      "progress": 0.14285714285714285,
      "skills": [
        "Decision-Making",
        "Critical Thinking"
      ],
      "planLineIfFailed": "you made a choice before checking the evidence"
    },
    {
      "kind": "flips",
      "speaker": "Arjun",
      "setup": "These four terms will help you explain the test to Samira.",
      "title": "Prepare for the review.",
      "cards": [
        {
          "term": "User goal",
          "def": "What a person wants to do"
        },
        {
          "term": "Wireframe",
          "def": "A rough screen layout"
        },
        {
          "term": "Prototype",
          "def": "A test version of a design"
        },
        {
          "term": "Observation",
          "def": "Something you saw or heard"
        }
      ],
      "cta": "Continue",
      "id": "UX1-07"
    },
    {
      "kind": "match",
      "practice": true,
      "noVerdict": true,
      "speaker": "Arjun",
      "question": "Match each review note to its meaning.",
      "pairs": [
        {
          "term": "Reserve a pair",
          "def": "User goal"
        },
        {
          "term": "Rough screen layout",
          "def": "Wireframe"
        },
        {
          "term": "Test version",
          "def": "Prototype"
        },
        {
          "term": "Runner tapped “Details” three times",
          "def": "Observation"
        }
      ],
      "whenRight": "You can explain both the work and the evidence.",
      "whenWrong": "A goal is a task. A layout is a wireframe. A test version is a prototype.",
      "feedback": "",
      "feedbackCta": "Continue",
      "skills": [
        "Reading Comprehension",
        "Active Learning"
      ],
      "id": "UX1-08"
    },
    {
      "kind": "rapid",
      "timer": 45,
      "speaker": "Arjun",
      "question": "",
      "items": [
        {
          "question": "Eleanor wants to reserve size 8. What task do you give her?",
          "options": [
            {
              "label": "Reserve a size 8 pair.",
              "correct": true,
              "why": "The task names her goal without giving away the route."
            },
            {
              "label": "Tap the blue Reserve button.",
              "correct": false,
              "why": "That tells her which control to use. You would miss whether she can find it."
            },
            {
              "label": "Tell us if the app looks cool.",
              "correct": false,
              "why": "That does not test whether she can reserve shoes."
            }
          ]
        },
        {
          "question": "She taps “Details” three times. What belongs in your notes?",
          "options": [
            {
              "label": "She tapped Details three times.",
              "correct": true,
              "why": "That records what happened."
            },
            {
              "label": "She hates the design.",
              "correct": false,
              "why": "You have not asked her. That is a guess."
            },
            {
              "label": "The font caused the problem.",
              "correct": false,
              "why": "You have not tested that cause."
            }
          ]
        },
        {
          "question": "Arjun asks why she got stuck. You are unsure. What do you say?",
          "options": [
            {
              "label": "I saw repeated taps. I need to check why.",
              "correct": true,
              "why": "You separate what happened from a possible cause."
            },
            {
              "label": "The color must be wrong.",
              "correct": false,
              "why": "You have no evidence for that cause."
            },
            {
              "label": "She is bad at using apps.",
              "correct": false,
              "why": "The test checks the design, not the person."
            }
          ]
        },
        {
          "question": "Which update helps the team?",
          "options": [
            {
              "label": "The runner could not find Reserve. We need to test its placement.",
              "correct": true,
              "why": "It names a clear problem and a next check."
            },
            {
              "label": "The whole app is confusing.",
              "correct": false,
              "why": "That is too broad to guide a change."
            },
            {
              "label": "Everything looks great.",
              "correct": false,
              "why": "That hides the problem you observed."
            }
          ]
        }
      ],
      "whenPass": "Clear, honest answers. The team can act on them.",
      "whenFail": "Use the evidence. Say what you know and what needs checking.",
      "feedback": "",
      "feedbackCta": "Continue",
      "id": "UX1-09",
      "progress": 0.2857142857142857,
      "skills": [
        "Decision-Making",
        "Critical Thinking"
      ],
      "planLineIfFailed": "you made a choice before checking the evidence"
    },
    {
      "kind": "card",
      "variant": "intro",
      "speaker": "Arjun",
      "title": "One change. Same task.",
      "body": "Eleanor could not find Reserve. Move that action above the details, then test the same task.",
      "cta": "Continue",
      "id": "UX1-10"
    },
    {
      "kind": "choice",
      "layout": "options",
      "speaker": "Arjun",
      "question": "Which draft should you test next?",
      "choices": [
        {
          "id": "a",
          "label": "Keep the page. Move Reserve above the details.",
          "tier": "best",
          "why": "One planned change lets you test whether placement helps."
        },
        {
          "id": "b",
          "label": "Change the layout, labels and colors together.",
          "tier": "wrong",
          "why": "You could not tell which change helped."
        },
        {
          "id": "c",
          "label": "Keep Reserve hidden and add a new banner.",
          "tier": "wrong",
          "why": "That does not address the problem you saw."
        }
      ],
      "feedback": "",
      "feedbackCta": "Continue",
      "artifact": UX_ARTIFACTS.iteration,
      "id": "UX1-11",
      "progress": 0.42857142857142855,
      "skills": [
        "Decision-Making",
        "Critical Thinking"
      ],
      "planLineIfFailed": "you made a choice before checking the evidence"
    },
    {
      "kind": "card",
      "variant": "character",
      "speaker": "Samira",
      "title": "Samira joins the review.",
      "body": "She leads design for the VELO account. Bring evidence, not a sales pitch.",
      "cta": "Continue",
      "castMember": "Samira",
      "id": "UX1-12"
    },
    {
      "kind": "card",
      "variant": "character",
      "speaker": "Narrator",
      "title": "Her craft. Your next step.",
      "body": "Samira started in a junior role. She now guides designers and reviews major client work.",
      "cta": "Continue",
      "castMember": "Samira",
      "id": "UX1-13"
    },
    {
      "kind": "card",
      "variant": "character",
      "speaker": "Narrator",
      "title": "She owns the client demo.",
      "body": "A strong recommendation explains what the test shows and what still needs work.",
      "cta": "Continue",
      "ladder": [
        {
          "label": "Junior · You",
          "lit": true
        },
        {
          "label": "UX Designer",
          "lit": false
        },
        {
          "label": "Senior · Arjun",
          "lit": true
        },
        {
          "label": "Lead · Samira",
          "lit": true
        }
      ],
      "id": "UX1-14"
    },
    {
      "kind": "choice",
      "layout": "document",
      "speaker": "Samira",
      "question": "Which line needs to change before the client review?",
      "choices": [
        {
          "id": "a",
          "label": "One person finished, so every runner will succeed.",
          "tier": "best",
          "why": "One test does not prove the design works for everyone."
        },
        {
          "id": "b",
          "label": "Eleanor finished after Reserve moved up.",
          "tier": "wrong",
          "why": "That matches the recorded test."
        },
        {
          "id": "c",
          "label": "We still need to test with a keyboard.",
          "tier": "wrong",
          "why": "That states an open check honestly."
        }
      ],
      "feedback": "",
      "feedbackCta": "Continue",
      "doc": "VELO · test summary",
      "artifact": UX_ARTIFACTS.results,
      "id": "UX1-15",
      "progress": 0.5714285714285714,
      "skills": [
        "Decision-Making",
        "Critical Thinking"
      ],
      "planLineIfFailed": "you made a choice before checking the evidence"
    },
    {
      "kind": "card",
      "variant": "act",
      "speaker": "System",
      "title": "",
      "body": "",
      "cta": "Continue",
      "review": {
        "threshold": 68,
        "intro": {
          "kicker": "Mid-project review",
          "line": "Arjun and Samira check your progress."
        },
        "progressLine": "Reviewing your work...",
        "pass": {
          "title": "You are on track.",
          "note": "First checkpoint complete.",
          "body": "The client review is still ahead."
        },
        "fail": {
          "title": "You can still turn this around.",
          "body": "Use the feedback in the second half."
        }
      },
      "id": "UX1-MID"
    },
    {
      "kind": "card",
      "variant": "act",
      "speaker": "System",
      "title": "The final stretch.",
      "body": "Client demo · 4 p.m.",
      "cta": "Continue",
      "id": "UX1-ACT2"
    },
    {
      "kind": "card",
      "variant": "character",
      "speaker": "Noah",
      "title": "Noah wants the lead.",
      "body": "He wants to present the final design. You both need the team’s work to hold up.",
      "cta": "Continue",
      "castMember": "Noah",
      "id": "UX1-18"
    },
    {
      "kind": "card",
      "variant": "intro",
      "speaker": "Narrator",
      "title": "A claim gets ahead of the evidence.",
      "body": "Noah tells Samira the new screen is ready for everyone. The keyboard check has not happened yet.",
      "cta": "Continue",
      "castMember": "Noah",
      "id": "UX1-19"
    },
    {
      "kind": "choice",
      "layout": "options",
      "speaker": "Narrator",
      "question": "What do you do about Noah’s claim?",
      "choices": [
        {
          "id": "a",
          "label": "Show Arjun the test notes and open check privately.",
          "tier": "best",
          "why": "You correct the record with evidence and keep the team focused."
        },
        {
          "id": "b",
          "label": "Call Noah a liar in front of the client.",
          "tier": "wrong",
          "why": "An argument will not resolve the missing test."
        },
        {
          "id": "c",
          "label": "Say nothing so the demo goes smoothly.",
          "tier": "wrong",
          "why": "The team may present a claim it cannot support."
        }
      ],
      "feedback": "",
      "feedbackCta": "Continue",
      "pivotal": true,
      "id": "UX1-20",
      "progress": 0.7142857142857143,
      "skills": [
        "Decision-Making",
        "Critical Thinking"
      ],
      "planLineIfFailed": "you made a choice before checking the evidence"
    },
    {
      "kind": "card",
      "variant": "intro",
      "speaker": "Narrator",
      "title": "3 p.m. A blocker appears.",
      "body": "Amina finds that keyboard users cannot reach Reserve. The demo is in one hour.",
      "cta": "Continue",
      "artifact": UX_ARTIFACTS.releaseCheck,
      "id": "UX1-21"
    },
    {
      "kind": "choice",
      "layout": "chat",
      "speaker": "Arjun",
      "question": "What do you message Arjun?",
      "choices": [
        {
          "id": "a",
          "label": "Keyboard users are blocked. Can we fix and retest Reserve first?",
          "tier": "best",
          "why": "You name the impact and ask for a clear priority before the deadline."
        },
        {
          "id": "b",
          "label": "I’ll polish the animation before I mention it.",
          "tier": "wrong",
          "why": "The main task is still blocked. Report that first."
        },
        {
          "id": "c",
          "label": "I’ll tell the client testing is complete.",
          "tier": "wrong",
          "why": "That would hide a known problem."
        }
      ],
      "feedback": "",
      "feedbackCta": "Continue",
      "chatWith": {
        "name": "Arjun",
        "role": "Senior UX Designer"
      },
      "id": "UX1-22",
      "progress": 0.8571428571428571,
      "skills": [
        "Decision-Making",
        "Critical Thinking"
      ],
      "planLineIfFailed": "you made a choice before checking the evidence"
    },
    {
      "kind": "card",
      "variant": "intro",
      "speaker": "Narrator",
      "title": "3:30 p.m. The fix is in.",
      "body": "Amina retests with a keyboard and reserves a pair. Samira can show that tested route.",
      "cta": "Continue",
      "artifact": UX_ARTIFACTS.fixed,
      "id": "UX1-23"
    },
    {
      "kind": "card",
      "variant": "intro",
      "speaker": "Narrator",
      "title": "A teammate needs a hand.",
      "body": "Amina must send the test notes in ten minutes. Your handoff is not due until tomorrow.",
      "cta": "Continue",
      "castMember": "Amina",
      "id": "UX1-24"
    },
    {
      "kind": "card",
      "variant": "intro",
      "speaker": "Narrator",
      "title": "Help without making a new claim.",
      "body": "She needs the actual result and the next check, not a longer report.",
      "cta": "Continue",
      "id": "UX1-25"
    },
    {
      "kind": "rank",
      "speaker": "Narrator",
      "question": "Rank your next steps, best to worst.",
      "order": [
        "Offer to check the notes with Amina.",
        "Wish her luck and return to your draft.",
        "Send untested claims to make the report look complete."
      ],
      "whenRight": "You had time to help. Checking the notes protects the whole team.",
      "whenWrong": "Help with the real task first. Never fill a report with claims you did not test.",
      "feedback": "",
      "feedbackCta": "Continue",
      "skills": [
        "Teamwork & Collaboration",
        "Critical Thinking"
      ],
      "id": "UX1-26",
      "progress": 1.0,
      "planLineIfFailed": "you made a choice before checking the evidence"
    },
    {
      "kind": "card",
      "variant": "intro",
      "speaker": "Narrator",
      "title": "Arjun notices the teamwork.",
      "body": "Your choices shape whether people can trust your work.",
      "cta": "Continue",
      "castMember": "Arjun",
      "id": "UX1-27"
    },
    {
      "kind": "card",
      "variant": "chapter",
      "speaker": "Narrator",
      "title": "The client demo begins.",
      "body": "Your part is done. The team now reviews your decisions.",
      "cta": "Begin Final Review",
      "id": "UX1-28"
    },
    {
      "kind": "review",
      "speaker": "System",
      "title": "The team reviews your launch work.",
      "body": "Your reputation decides the result.",
      "deciding": "Reviewing your decisions...",
      "decidingNote": "Arjun and Samira check your work and teamwork.",
      "id": "UX1-REVIEW"
    }
  ],
  "endings": [
    {
      "min": 85,
      "headline": "Launch team trusted",
      "scoreNote": "Your project passes.",
      "message": "You used evidence, raised the blocker and helped the team deliver.",
      "subline": "Level 1 complete. Later projects are not built yet.",
      "primary": "Play the project again",
      "advances": true
    },
    {
      "min": 40,
      "headline": "Revise and retry",
      "scoreNote": "The project needs another pass.",
      "message": "Review the choices you missed. Use evidence before making a claim.",
      "subline": "You can try again.",
      "primary": "Try again",
      "advances": false
    },
    {
      "min": 0,
      "headline": "This attempt ends here",
      "scoreNote": "Restart the project.",
      "message": "The team cannot rely on this work yet. Use the feedback and start fresh.",
      "subline": "One attempt does not define your future.",
      "primary": "Start again",
      "advances": false
    }
  ],
  "points": 6,
  "noStrikes": true,
  "generationTemplate": "ib-l1-2026-10-21",
  "qaSkip": true,
  "scoreTip": "Start at 50. Each scored decision adds or removes 6. Reach 85 to pass."
};
