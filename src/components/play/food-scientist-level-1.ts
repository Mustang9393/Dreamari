import type { Level } from "./types";
// Mirrors the actual approved IB Level 1 semantic and interaction sequence.
export const FOOD_SCIENTIST_LEVEL_1: Level = {
  "id": "fs-l1",
  "n": 1,
  "role": "Junior Food Scientist",
  "title": "The LUMA brief",
  "blurb": "Your first week at Sprout Lab. Win trust, handle a rival, and deliver for LUMA.",
  "cover": "/images/play/fs/v9/building-exterior-v2.png",
  "mood": "day",
  "hideBand": true,
  "directed": true,
  "cinematic": true,
  "worldTheme": true,
  "coreKit": true,
  "quietQuestions": true,
  "qaSkip": true,
  "saveSlot": 212,
  "cast": {
    "Ren": "/images/play/fs/face-ren-v7.webp",
    "Yuki": "/images/play/fs/face-yuki-v7.webp",
    "Imani": "/images/play/fs/face-imani-v7.webp",
    "Luis": "/images/play/fs/face-luis-v7.webp"
  },
  "preGame": {
    "startLabel": "Start my first day",
    "skipLabel": "Start the story",
    "handoffLine": "Your first week at Sprout Lab starts now.",
    "howToCta": "Start the project",
    "ladder": [
      "Junior Food Scientist",
      "Food Scientist",
      "Senior Food Scientist",
      "Lead Food Scientist"
    ],
    "skills": [
      "Decision-Making",
      "Active Learning",
      "Critical Thinking"
    ],
    "skillTotal": 15,
    "lesson": {
      "title": "What Is a Food Scientist?",
      "screens": [
        {
          "kind": "say",
          "heading": "Test an idea about food.",
          "body": "Food scientists study how ingredients and processes affect food. Tests help them compare ideas.",
          "image": "/images/play/fs/v7/arrival.png"
        },
        {
          "kind": "say",
          "heading": "Keep records. Know your role.",
          "body": "You record and compare. Your mentor guides lab work. Senior staff review the results and decide the next tests.",
          "image": "/images/play/fs/v7/arrival.png"
        },
        {
          "kind": "check",
          "heading": "Evidence first.",
          "question": "Which supports a next test?",
          "options": [
            {
              "label": "A recorded comparison using the same method",
              "correct": true,
              "why": "The record shows what was changed and measured."
            },
            {
              "label": "A guess based on the nicer package",
              "correct": false,
              "why": "The package does not show how the food performed."
            }
          ]
        }
      ]
    },
    "missionLine": "Build your skills through new food projects.",
    "ladderBranches": [
      {
        "label": "Management path",
        "roles": "R&D Manager → R&D Director"
      }
    ],
    "ladderNote": "Titles vary by company. Later game projects are not built yet."
  },
  "endings": [
    {
      "min": 85,
      "headline": "Your next assignment is earned.",
      "scoreNote": "You earn a place on the next project.",
      "message": "Yuki wants you on the next client team. Ren stays your guide, and Imani will be working alongside you.",
      "subline": "Level 1 complete. The next chapter is planned, not playable yet.",
      "primary": "Play Level 1 again",
      "advances": true,
      "replayOnPass": true
    },
    {
      "min": 40,
      "headline": "Revise and retry",
      "scoreNote": "The evidence needs work.",
      "message": "Ren asks you to try again. Check the brief, use the evidence, and ask for help before the deadline.",
      "subline": "Replay Level 1 with what you learned.",
      "primary": "Try again",
      "advances": false
    },
    {
      "min": 0,
      "headline": "This attempt ends here",
      "scoreNote": "Restart the project.",
      "message": "Take a fresh run and use what you learned.",
      "subline": "One attempt does not define your future.",
      "primary": "Start again",
      "advances": false
    }
  ],
  "points": 6,
  "noStrikes": true,
  "scoreTip": "Start at 50. Seven scored decisions change reputation by 6. Matching practice does not change your score. Reach 85.",
  "generationTemplate": "ib-semantic-v3",
  "beats": [
    {
      "kind": "card",
      "id": "FS1-01",
      "speaker": "Narrator",
      "title": "Welcome to Food Science.",
      "body": "Your first week at Sprout Lab starts today. Your team builds a drink-trial report for LUMA.",
      "variant": "intro",
      "bodyLarge": true,
      "cta": "Continue"
    },
    {
      "kind": "card",
      "id": "FS1-02",
      "speaker": "Narrator",
      "title": "One week. One place on the next project.",
      "body": "LUMA reviews the work Friday. Both juniors want to join the next client team. Your decisions will shape who gets trusted.",
      "bodyLarge": true,
      "cta": "Continue",
      "variant": "intro"
    },
    {
      "kind": "card",
      "id": "FS1-03",
      "speaker": "Ren",
      "title": "Ren has your first assignment.",
      "body": "Ren is a senior food scientist. He guides your work and reviews it before it reaches the client.",
      "castMember": "Ren",
      "setup": "Ren • Senior Food Scientist",
      "variant": "character",
      "cta": "Continue"
    },
    {
      "kind": "card",
      "id": "FS1-04",
      "speaker": "Narrator",
      "title": "Your work goes through Ren.",
      "body": "Check the brief and access first. Ask him about priorities or problems. His feedback helps decide your next assignment.",
      "castMember": "Ren",
      "ladder": [
        {
          "label": "Junior Food Scientist • You",
          "lit": true
        },
        {
          "label": "Food Scientist",
          "lit": false
        },
        {
          "label": "Senior Food Scientist • Ren",
          "lit": true
        },
        {
          "label": "R&D Lead",
          "lit": false
        }
      ],
      "cta": "Continue",
      "variant": "character"
    },
    {
      "kind": "card",
      "id": "FS1-05",
      "speaker": "Narrator",
      "title": "Another junior starts beside you.",
      "body": "Imani is working on LUMA too. You exchange a quick hello before the first assignment.",
      "setup": "Imani • Junior Food Scientist",
      "castMember": "Imani",
      "cta": "Continue",
      "variant": "intro"
    },
    {
      "kind": "choice",
      "id": "FS1-06",
      "speaker": "Ren",
      "question": "Before working on the client project, what should you do first?",
      "choices": [
        {
          "id": "a",
          "label": "Read the brief and check approved access.",
          "tier": "best",
          "why": "You need the task and access before you can do useful work."
        },
        {
          "id": "b",
          "label": "Promise the client a finished product.",
          "tier": "wrong",
          "why": "You have not checked the work or your authority yet."
        },
        {
          "id": "c",
          "label": "Replace the team’s whole plan.",
          "tier": "wrong",
          "why": "First understand the plan and your role."
        }
      ],
      "layout": "options",
      "progress": 0.14285714285714285,
      "feedback": "",
      "feedbackCta": "Continue",
      "planLineIfFailed": "you missed a step the team needed",
      "skills": [
        "Decision-Making",
        "Critical Thinking"
      ]
    },
    {
      "kind": "flips",
      "id": "FS1-07",
      "speaker": "Ren",
      "castMember": "Ren",
      "title": "Four words for your first assignment.",
      "setup": "Before client work: learn these words. Keep updates short, flag mistakes, and confirm anything you do not know.",
      "cards": [
        {
          "term": "Trial",
          "def": "A small test of an idea"
        },
        {
          "term": "Variable",
          "def": "The one thing you change"
        },
        {
          "term": "Constant",
          "def": "A condition you keep the same"
        },
        {
          "term": "EOD",
          "def": "End of the day"
        }
      ],
      "cta": "Continue"
    },
    {
      "kind": "match",
      "id": "FS1-08",
      "speaker": "Ren",
      "castMember": "Ren",
      "practice": true,
      "noVerdict": true,
      "setup": "Ren sends your first task list.",
      "question": "Match each request to the action.",
      "pairs": [
        {
          "term": "Plan a trial.",
          "def": "Plan a small test"
        },
        {
          "term": "Name the variable.",
          "def": "Name the one thing being changed"
        },
        {
          "term": "Keep conditions constant.",
          "def": "Keep the other condition the same"
        },
        {
          "term": "Send it by EOD.",
          "def": "Send it by end of day"
        }
      ],
      "whenRight": "You can turn the team’s words into actions.",
      "whenWrong": "Use the four words you just learned.",
      "feedback": "",
      "feedbackCta": "Continue",
      "skills": [
        "Reading Comprehension",
        "Active Learning"
      ]
    },
    {
      "kind": "rapid",
      "id": "FS1-09",
      "speaker": "Ren",
      "setup": "LUMA is a major client. Check how you will communicate before its review.",
      "question": "",
      "timer": 45,
      "items": [
        {
          "question": "How should you update the project lead?",
          "options": [
            {
              "label": "Lead with the result in a short message.",
              "correct": true,
              "why": "A short result-first update is easy to act on."
            },
            {
              "label": "Send every note without a summary.",
              "correct": false,
              "why": "The lead needs the main point first."
            },
            {
              "label": "Wait until the client asks.",
              "correct": false,
              "why": "The team needs updates before the client review."
            }
          ]
        },
        {
          "question": "Ren asks about a result you have not checked. What do you say?",
          "options": [
            {
              "label": "I’ll check and follow up.",
              "correct": true,
              "why": "Confirm the fact instead of guessing."
            },
            {
              "label": "It is probably fine.",
              "correct": false,
              "why": "Probably is not a checked result."
            },
            {
              "label": "Ask someone else.",
              "correct": false,
              "why": "Take responsibility for closing the gap."
            }
          ]
        },
        {
          "question": "You find a mistake in the client report. What next?",
          "options": [
            {
              "label": "Correct it and tell the team.",
              "correct": true,
              "why": "Fix the record and flag which version changed."
            },
            {
              "label": "Wait until after the review.",
              "correct": false,
              "why": "The client could see the mistake first."
            },
            {
              "label": "Delete the whole project.",
              "correct": false,
              "why": "Correct the error instead of destroying useful work."
            }
          ]
        },
        {
          "question": "The brief says EOD. When is it due?",
          "options": [
            {
              "label": "By end of day.",
              "correct": true,
              "why": "EOD means end of day."
            },
            {
              "label": "Before the next test starts.",
              "correct": false,
              "why": "That is not what EOD means."
            },
            {
              "label": "Whenever the client replies.",
              "correct": false,
              "why": "EOD sets an end-of-day deadline."
            }
          ]
        }
      ],
      "whenPass": "Clear updates, checked facts, and early warnings earn trust.",
      "whenFail": "Keep updates short, check unknown facts, and flag errors early.",
      "progress": 0.2857142857142857,
      "feedback": "",
      "feedbackCta": "Continue",
      "planLineIfFailed": "you missed a step the team needed",
      "skills": [
        "Written Communication",
        "Decision-Making"
      ]
    },
    {
      "kind": "card",
      "id": "FS1-10",
      "speaker": "Ren",
      "title": "Client files stay in the approved team folder.",
      "body": "Use the project’s restricted access. Keep files off personal accounts and public chats.",
      "cta": "Continue",
      "variant": "intro"
    },
    {
      "kind": "choice",
      "id": "FS1-11",
      "speaker": "Narrator",
      "question": "Where should you save the client’s private project files?",
      "choices": [
        {
          "id": "a",
          "label": "Approved team folder with restricted access.",
          "tier": "best",
          "why": "Only the authorized project team should have access."
        },
        {
          "id": "b",
          "label": "Your personal cloud drive.",
          "tier": "wrong",
          "why": "A personal account is outside the team’s approved access."
        },
        {
          "id": "c",
          "label": "A public group chat.",
          "tier": "wrong",
          "why": "Public sharing exposes the client’s files."
        }
      ],
      "layout": "zones",
      "dragItem": "Client files",
      "progress": 0.42857142857142855,
      "feedback": "",
      "feedbackCta": "Continue",
      "planLineIfFailed": "you missed a step the team needed",
      "skills": [
        "Decision-Making",
        "Critical Thinking"
      ]
    },
    {
      "kind": "card",
      "id": "FS1-12",
      "speaker": "Yuki",
      "title": "Yuki arrives for the client review.",
      "body": "The R&D Lead needs a clear, accurate report before the client sees it.",
      "castMember": "Yuki",
      "setup": "Yuki • R&D Lead",
      "variant": "character",
      "cta": "Continue"
    },
    {
      "kind": "card",
      "id": "FS1-13",
      "speaker": "Narrator",
      "title": "Show what the test actually found.",
      "body": "A trial compares results. One batch changed the fruit amount. Your report must not say that several ingredients changed.",
      "castMember": "Yuki",
      "cta": "Continue",
      "variant": "character"
    },
    {
      "kind": "card",
      "id": "FS1-14",
      "speaker": "Narrator",
      "title": "Yuki chooses the next client team.",
      "body": "Ren reviews your work. Yuki looks for sound judgment and clear evidence before giving you more responsibility.",
      "castMember": "Yuki",
      "ladder": [
        {
          "label": "Junior Food Scientist • You",
          "lit": true
        },
        {
          "label": "Food Scientist",
          "lit": false
        },
        {
          "label": "Senior Food Scientist • Ren",
          "lit": true
        },
        {
          "label": "R&D Lead • Yuki",
          "lit": true
        }
      ],
      "cta": "Continue",
      "variant": "character"
    },
    {
      "kind": "choice",
      "id": "FS1-15",
      "speaker": "Yuki",
      "question": "Only the fruit amount changed in the trial. Which report line needs fixing?",
      "choices": [
        {
          "id": "a",
          "label": "We changed fruit, mixing time, and batch size.",
          "tier": "best",
          "why": "Only fruit changed. The other conditions stayed the same."
        },
        {
          "id": "b",
          "label": "We changed the fruit amount.",
          "tier": "wrong",
          "why": "That matches the stated trial."
        },
        {
          "id": "c",
          "label": "Mixing time stayed the same.",
          "tier": "wrong",
          "why": "That matches the stated trial."
        },
        {
          "id": "d",
          "label": "Next, repeat the comparison.",
          "tier": "wrong",
          "why": "A repeat is a proposed next step, not a result."
        }
      ],
      "layout": "document",
      "docStyle": "slide",
      "doc": "Trial Summary",
      "progress": 0.5714285714285714,
      "feedback": "",
      "feedbackCta": "Continue",
      "planLineIfFailed": "you missed a step the team needed",
      "skills": [
        "Reading Comprehension",
        "Critical Thinking"
      ]
    },
    {
      "kind": "card",
      "id": "FS1-MID",
      "speaker": "System",
      "title": "",
      "body": "",
      "variant": "act",
      "review": {
        "threshold": 68,
        "intro": {
          "kicker": "MID-PROJECT REVIEW",
          "line": "Ren and Yuki review your first decisions."
        },
        "progressLine": "Reviewing your work...",
        "pass": {
          "title": "You passed the first review.",
          "note": "Checkpoint saved.",
          "body": "The next client assignment is still yours to earn."
        },
        "fail": {
          "title": "You can still turn this around.",
          "body": "Use the feedback in the second half."
        }
      },
      "cta": "Continue project",
      "secondaryCta": "Finish Later",
      "secondaryHref": "/play"
    },
    {
      "kind": "card",
      "id": "FS1-ACT2",
      "speaker": "System",
      "title": "The second half of your first week.",
      "body": "The report is taking shape. Now the pressure shifts to the team.",
      "variant": "act",
      "cta": "Continue"
    },
    {
      "kind": "card",
      "id": "FS1-18",
      "speaker": "Imani",
      "title": "Imani wants that next assignment too.",
      "body": "Imani is quick and confident. The client review is a chance to stand out, and sharing credit is not the plan.",
      "castMember": "Imani",
      "setup": "Imani • Junior Food Scientist",
      "cta": "Continue",
      "variant": "character"
    },
    {
      "kind": "card",
      "id": "FS1-19",
      "speaker": "Narrator",
      "title": "The next morning, you hear your work claimed.",
      "body": "You wrote the trial notes. Now Imani tells Yuki, “I put that report together.” Your saved file shows your work.",
      "castMember": "Imani",
      "cta": "Continue",
      "variant": "intro"
    },
    {
      "kind": "choice",
      "id": "FS1-20",
      "speaker": "Narrator",
      "question": "Imani took credit for your report. What should you do?",
      "choices": [
        {
          "id": "a",
          "label": "Share the file history with Ren privately.",
          "tier": "best",
          "why": "Use the record and the right person without turning it into a public fight."
        },
        {
          "id": "b",
          "label": "Accuse Imani in front of the client.",
          "tier": "wrong",
          "why": "A client meeting is not the place to settle a team dispute."
        },
        {
          "id": "c",
          "label": "Post about it online.",
          "tier": "wrong",
          "why": "That exposes private work and makes the conflict public."
        },
        {
          "id": "d",
          "label": "Change the report to make the rival look bad.",
          "tier": "wrong",
          "why": "Sabotage damages the client’s work and your own trust."
        }
      ],
      "layout": "options",
      "pivotal": true,
      "keepScene": true,
      "progress": 0.7142857142857143,
      "feedback": "",
      "feedbackCta": "Continue",
      "planLineIfFailed": "you missed a step the team needed",
      "skills": [
        "Social Awareness",
        "Decision-Making"
      ]
    },
    {
      "kind": "card",
      "id": "FS1-21",
      "speaker": "Narrator",
      "title": "3:00 P.M. A teammate leaves the project.",
      "body": "Half the trial report is unfinished. The client review starts at 6:00 P.M.",
      "world": {
        "kind": "clock",
        "now": "3:00 PM",
        "deadline": "6:00 PM",
        "deadlineLabel": "Review due",
        "showNow": false
      },
      "cta": "Continue",
      "variant": "intro"
    },
    {
      "kind": "choice",
      "id": "FS1-22",
      "speaker": "Narrator",
      "question": "There is more work than you can finish by six. What do you message Ren?",
      "choices": [
        {
          "id": "a",
          "label": "Can you help me prioritize what is left?",
          "tier": "best",
          "why": "Flag the gap early so the team can protect the most important work."
        },
        {
          "id": "b",
          "label": "I’ll finish everything myself.",
          "tier": "wrong",
          "why": "That hides the workload problem until the deadline."
        },
        {
          "id": "c",
          "label": "We should cancel without telling the team.",
          "tier": "wrong",
          "why": "You need direction, not a decision made outside your role."
        }
      ],
      "layout": "chat",
      "chatWith": {
        "name": "Ren",
        "role": "Senior Food Scientist"
      },
      "world": {
        "kind": "clock",
        "now": "3:20 PM",
        "deadline": "6:00 PM",
        "deadlineLabel": "Review due",
        "showNow": false
      },
      "progress": 0.8571428571428571,
      "feedback": "",
      "feedbackCta": "Continue",
      "planLineIfFailed": "you missed a step the team needed",
      "skills": [
        "Time Management",
        "Verbal Communication"
      ]
    },
    {
      "kind": "card",
      "id": "FS1-23",
      "speaker": "Narrator",
      "title": "6:00 P.M. The review pack is ready.",
      "body": "Ren checks it before the client review. You finished the priority work without hiding what still needs testing.",
      "world": {
        "kind": "clock",
        "now": "6:00 PM",
        "status": "delivered",
        "deadlineLabel": "Review pack",
        "showNow": false
      },
      "cta": "Continue",
      "variant": "intro"
    },
    {
      "kind": "card",
      "id": "FS1-24",
      "speaker": "Narrator",
      "title": "Luis still needs a hand.",
      "body": "Luis, the lab technician, has sample records due at 6:40. You have finished your work for today.",
      "castMember": "Luis",
      "setup": "Luis • Lab Technician",
      "cta": "Continue",
      "variant": "intro"
    },
    {
      "kind": "card",
      "id": "FS1-25",
      "speaker": "Narrator",
      "title": "Their deadline is close. Yours is not.",
      "body": "You have time to help with the notes. The work stays with its owner for the final check.",
      "castMember": "Luis",
      "cta": "Continue",
      "variant": "intro"
    },
    {
      "kind": "rank",
      "id": "FS1-26",
      "speaker": "Narrator",
      "question": "Rank these responses from best to worst.",
      "order": [
        "Ask which notes you can help organize.",
        "Wish them luck and leave.",
        "Laugh at the delay and walk away."
      ],
      "whenRight": "You had time to help and left final checks with the person responsible.",
      "whenWrong": "A useful offer of help matters more than a polite goodbye.",
      "progress": 1,
      "feedback": "",
      "feedbackCta": "Continue",
      "planLineIfFailed": "you missed a step the team needed",
      "skills": [
        "Social Awareness",
        "Critical Thinking"
      ]
    },
    {
      "kind": "card",
      "id": "FS1-27",
      "speaker": "Narrator",
      "title": "Ren noticed how you handled it.",
      "body": "Your response under pressure matters, even when the client is not watching.",
      "castMember": "Ren",
      "reactsTo": "FS1-26",
      "cta": "Continue",
      "variant": "intro"
    },
    {
      "kind": "card",
      "id": "FS1-28",
      "speaker": "Narrator",
      "title": "Your first week is complete.",
      "body": "Ren sends your work to Yuki. The next assignment depends on the trust you built this week.",
      "castMember": "Ren",
      "variant": "chapter",
      "celebrate": true,
      "cta": "Begin final review"
    },
    {
      "kind": "review",
      "id": "FS1-REVIEW",
      "speaker": "System",
      "title": "Sprout Lab is choosing the next project team.",
      "body": "Your reputation helps decide what happens next.",
      "deciding": "Decision in progress...",
      "decidingNote": "The team reviews your work and how you handled pressure."
    }
  ]
};
