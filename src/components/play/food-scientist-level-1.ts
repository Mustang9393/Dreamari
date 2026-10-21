import type { Level } from "./types";
import { FS_ARTIFACTS } from "./food-scientist-artifacts";
// IB flow with short, career-specific, one-step decisions.
export const FOOD_SCIENTIST_LEVEL_1: Level = {
  "id": "fs-l1",
  "n": 1,
  "role": "Junior Food Scientist",
  "title": "The LUMA tasting",
  "blurb": "Help a premium café team plan a fair drink trial.",
  "cover": "/images/play/fs/v7/arrival.png",
  "mood": "day",
  "hideBand": true,
  "directed": true,
  "cinematic": true,
  "worldTheme": true,
  "coreKit": true,
  "quietQuestions": true,
  "qaSkip": true,
  "saveSlot": 604,
  "cast": {
    "Ren": "/images/play/fs/face-ren-v7.webp",
    "Yuki": "/images/play/fs/face-yuki-v7.webp",
    "Imani": "/images/play/fs/face-imani-v7.webp",
    "Luis": "/images/play/fs/face-luis-v7.webp"
  },
  "preGame": {
    "startLabel": "Start my first day",
    "skipLabel": "Start the story",
    "handoffLine": "LUMA drink trial",
    "howToCta": "Start the project",
    "ladder": [
      "Junior Food Scientist",
      "Food Scientist",
      "Senior Food Scientist",
      "Lead Food Scientist"
    ],
    "skills": [
      "Critical Thinking",
      "Quality Control",
      "Professional Judgment"
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
          "body": "You record and compare. Ren guides lab work. Yuki approves tasting and checks safety claims.",
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
      "headline": "A trial worth repeating",
      "scoreNote": "Your project passes.",
      "message": "You helped the team choose a sound next test.",
      "subline": "Level 1 complete. Later projects are not built yet.",
      "primary": "Play the project again",
      "advances": true
    },
    {
      "min": 40,
      "headline": "Revise and retry",
      "scoreNote": "The evidence needs work.",
      "message": "Use the feedback to improve your next attempt.",
      "subline": "You can try again.",
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
  "scoreTip": "Start at 50. Each scored decision adds or removes 6. Reach 85 to pass.",
  "generationTemplate": "ib-narrative-v2",
  "beats": [
    {
      "kind": "card",
      "variant": "intro",
      "speaker": "Narrator",
      "title": "Welcome to Sprout Lab.",
      "body": "Ren, your mentor, welcomes you to a premium café’s drink-development team.",
      "cta": "Continue",
      "id": "FS1-01"
    },
    {
      "kind": "card",
      "variant": "intro",
      "speaker": "Narrator",
      "title": "A café launch is coming.",
      "body": "LUMA wants a strawberry drink that tastes the same in every cup. Your trial will guide the next batch.",
      "cta": "Continue",
      "id": "FS1-02",
      "artifact": FS_ARTIFACTS.note
    },
    {
      "kind": "card",
      "variant": "intro",
      "speaker": "Narrator",
      "title": "Yuki checks the next step.",
      "body": "She approves tasting and further tests. You prepare trials and record what happens.",
      "cta": "Continue",
      "id": "FS1-04"
    },
    {
      "kind": "card",
      "variant": "intro",
      "speaker": "Narrator",
      "title": "Work with the team.",
      "body": "Imani prepares the samples. Luis keeps the batch records. You help make the test fair.",
      "cta": "Continue",
      "id": "FS1-05"
    },
    {
      "kind": "choice",
      "speaker": "Narrator",
      "layout": "options",
      "question": "Some cups taste sweeter than others. What should the team do first?",
      "choices": [
        {
          "id": "a",
          "label": "Compare small batches made the same way.",
          "tier": "best",
          "why": "A controlled comparison can reveal a useful difference."
        },
        {
          "id": "b",
          "label": "Change the whole recipe immediately.",
          "tier": "wrong",
          "why": "You need a clear comparison before a large change."
        },
        {
          "id": "c",
          "label": "Choose the brightest cup.",
          "tier": "wrong",
          "why": "Appearance does not explain sweetness."
        }
      ],
      "feedback": "",
      "feedbackCta": "Continue",
      "skills": [
        "Critical Thinking",
        "Decision-Making"
      ],
      "id": "FS1-06",
      "progress": 0.14285714285714285,
      "planLineIfFailed": "you made a claim before checking what happened",
      "prompt": ""
    },
    {
      "kind": "card",
      "variant": "intro",
      "speaker": "Ren",
      "title": "Keep the test fair.",
      "body": "Change one ingredient amount. Keep the batch size and mixing method the same.",
      "cta": "Continue",
      "id": "FS1-07",
      "artifact": FS_ARTIFACTS.codes
    },
    {
      "kind": "slider",
      "speaker": "Narrator",
      "question": "A trial totals 100 g. Fruit is 15 g. How much base keeps the total at 100 g?",
      "steps": [
        {
          "label": "80 g",
          "tier": "wrong",
          "why": "80 plus 15 is only 95."
        },
        {
          "label": "85 g",
          "tier": "best",
          "why": "85 plus 15 is 100."
        },
        {
          "label": "90 g",
          "tier": "wrong",
          "why": "90 plus 15 is 105."
        },
        {
          "label": "95 g",
          "tier": "wrong",
          "why": "95 plus 15 is 110."
        }
      ],
      "feedback": "",
      "feedbackCta": "Continue",
      "skills": [
        "Problem-Solving",
        "Critical Thinking"
      ],
      "id": "FS1-09",
      "progress": 0.2857142857142857,
      "planLineIfFailed": "you made a claim before checking what happened",
      "prompt": ""
    },
    {
      "kind": "card",
      "variant": "intro",
      "speaker": "Narrator",
      "title": "Prepare two samples.",
      "body": "A uses 10 g of fruit. B uses 15 g. Each totals 100 g and uses the same mixing steps.",
      "cta": "Continue",
      "id": "FS1-10",
      "artifact": FS_ARTIFACTS.note
    },
    {
      "kind": "choice",
      "layout": "options",
      "speaker": "Narrator",
      "id": "FS1-11",
      "progress": 0.42857142857142855,
      "question": "You are testing more fruit in a drink. What should stay the same?",
      "prompt": "",
      "choices": [
        {
          "id": "a",
          "label": "Batch size and mixing time.",
          "tier": "best",
          "why": "Keeping other steps the same makes the fruit comparison fairer."
        },
        {
          "id": "b",
          "label": "Nothing. Change every step.",
          "tier": "wrong",
          "why": "You would not know which change affected the drink."
        },
        {
          "id": "c",
          "label": "Only the cup’s color.",
          "tier": "wrong",
          "why": "The preparation steps also affect the result."
        }
      ],
      "feedback": "",
      "feedbackCta": "Continue",
      "skills": [
        "Critical Thinking",
        "Decision-Making"
      ],
      "planLineIfFailed": "you changed several trial conditions"
    },
    {
      "kind": "card",
      "variant": "character",
      "speaker": "Yuki",
      "title": "Yuki joins the tasting plan.",
      "body": "She wants people to judge the drink, not the brand.",
      "cta": "Continue",
      "castMember": "Yuki",
      "id": "FS1-12"
    },
    {
      "kind": "flags",
      "speaker": "Narrator",
      "question": "Flag both tasting-plan choices that could sway people’s answers.",
      "whenRight": "Neutral labels and instructions keep the tasting fairer.",
      "whenWrong": "Flag the praise label and sharing your preference.",
      "feedback": "",
      "feedbackCta": "Continue",
      "skills": [
        "Critical Thinking",
        "Problem-Solving"
      ],
      "rows": [
        {
          "label": "Call one sample “the premium recipe.”",
          "flag": true,
          "why": "That name can affect expectations."
        },
        {
          "label": "Use matching coded cups.",
          "flag": false,
          "why": "Matching cups and codes make comparison fairer."
        },
        {
          "label": "Say which sample you prefer first.",
          "flag": true,
          "why": "Your preference can influence the taster."
        }
      ],
      "id": "FS1-15",
      "progress": 0.5714285714285714,
      "planLineIfFailed": "you made a claim before checking what happened",
      "prompt": ""
    },
    {
      "kind": "card",
      "variant": "act",
      "speaker": "System",
      "title": "Checkpoint reached.",
      "body": "",
      "cta": "Continue",
      "review": {
        "threshold": 68,
        "intro": {
          "kicker": "MID-PROJECT REVIEW",
          "line": "Ren and Yuki check your work."
        },
        "progressLine": "Checking your decisions...",
        "pass": {
          "title": "A strong first pass.",
          "body": "Keep going. The next task is ready."
        },
        "fail": {
          "title": "You can recover.",
          "body": "Use the feedback on your next task."
        }
      },
      "id": "FS1-MID"
    },
    {
      "kind": "card",
      "variant": "act",
      "speaker": "System",
      "title": "A surprise in the notes.",
      "body": "The first tasting is done. One result does not match the batch record.",
      "cta": "Continue",
      "id": "FS1-ACT2"
    },
    {
      "kind": "choice",
      "speaker": "Narrator",
      "layout": "options",
      "question": "Code 742 has no recipe record. Which result can you report?",
      "choices": [
        {
          "id": "a",
          "label": "The coded taste result, with the recipe unknown.",
          "tier": "best",
          "why": "Keep the observation and clearly mark what is missing."
        },
        {
          "id": "b",
          "label": "That recipe B won.",
          "tier": "wrong",
          "why": "You cannot link the code to recipe B yet."
        },
        {
          "id": "c",
          "label": "That the drink is safe to sell.",
          "tier": "wrong",
          "why": "A taste result does not establish release approval."
        }
      ],
      "feedback": "",
      "feedbackCta": "Continue",
      "skills": [
        "Critical Thinking",
        "Decision-Making"
      ],
      "id": "FS1-20",
      "progress": 0.7142857142857143,
      "planLineIfFailed": "you made a claim before checking what happened",
      "prompt": ""
    },
    {
      "kind": "card",
      "variant": "intro",
      "speaker": "Narrator",
      "title": "Ren sets the next check.",
      "body": "He asks you to separate what you know from what still needs testing.",
      "cta": "Continue",
      "id": "FS1-21",
      "artifact": FS_ARTIFACTS.message
    },
    {
      "kind": "rapid",
      "speaker": "Narrator",
      "question": "",
      "items": [
        {
          "question": "Six tasters preferred code 318. What do you know?",
          "options": [
            {
              "label": "Those six preferred 318.",
              "correct": true,
              "why": "That is what the tasting recorded."
            },
            {
              "label": "Everyone prefers 318.",
              "correct": false,
              "why": "Six tasters do not represent everyone."
            }
          ]
        },
        {
          "question": "Both mixes poured well today. What still needs a test?",
          "options": [
            {
              "label": "How they change during storage.",
              "correct": true,
              "why": "Today’s pour does not measure storage changes."
            },
            {
              "label": "Nothing else.",
              "correct": false,
              "why": "One test does not cover every product question."
            }
          ]
        }
      ],
      "whenPass": "Keep each claim tied to its test.",
      "whenFail": "Report what was measured. Leave the rest open.",
      "feedback": "",
      "feedbackCta": "Continue",
      "skills": [
        "Critical Thinking",
        "Professional Judgment"
      ],
      "id": "FS1-22",
      "progress": 0.8571428571428571,
      "planLineIfFailed": "you made a claim before checking what happened",
      "prompt": ""
    },
    {
      "kind": "card",
      "variant": "intro",
      "speaker": "Narrator",
      "title": "The record is found.",
      "body": "Luis links 742 to its original recipe. Yuki can now review the comparison.",
      "cta": "Continue",
      "id": "FS1-23"
    },
    {
      "kind": "choice",
      "speaker": "Narrator",
      "layout": "options",
      "question": "One small trial looks promising. What should you recommend?",
      "choices": [
        {
          "id": "a",
          "label": "Repeat it and check whether the result holds.",
          "tier": "best",
          "why": "A repeat checks whether the first result is reliable."
        },
        {
          "id": "b",
          "label": "Skip straight to a full launch.",
          "tier": "wrong",
          "why": "One small trial is not enough to approve a launch."
        },
        {
          "id": "c",
          "label": "Describe it as perfect.",
          "tier": "wrong",
          "why": "That claim goes beyond the evidence."
        }
      ],
      "feedback": "",
      "feedbackCta": "Continue",
      "skills": [
        "Critical Thinking",
        "Decision-Making"
      ],
      "id": "FS1-26",
      "progress": 1,
      "planLineIfFailed": "you made a claim before checking what happened",
      "prompt": ""
    },
    {
      "kind": "card",
      "variant": "intro",
      "speaker": "Narrator",
      "title": "Your trial made a difference.",
      "body": "Ren has a clear next step and a record the team can use.",
      "cta": "Continue",
      "id": "FS1-27"
    },
    {
      "kind": "card",
      "variant": "chapter",
      "speaker": "Narrator",
      "title": "A better batch starts here.",
      "body": "The review is ready. See how your choices shaped the trial.",
      "cta": "See my result",
      "id": "FS1-28"
    },
    {
      "kind": "review",
      "speaker": "System",
      "title": "Your first product trial.",
      "body": "See the result of your seven decisions.",
      "deciding": "Reviewing your work...",
      "decidingNote": "The team checks your trial decisions.",
      "id": "FS1-REVIEW"
    }
  ]
};
