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
  "saveSlot": 211,
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
      "headline": "A trial worth repeating",
      "scoreNote": "Your project passes.",
      "message": "You helped the team choose a sound next test.",
      "subline": "Level 1 complete. Later projects are not built yet.",
      "primary": "Play the project again",
      "advances": true,
      "replayOnPass": true
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
      "variant": "character",
      "speaker": "Narrator",
      "title": "Your mentor, Ren.",
      "body": "Ren guides your first drink trial at Sprout Lab. He will help you make a fair comparison.",
      "cta": "Continue",
      "id": "FS1-01",
      "setup": "Ren • Senior Food Scientist",
      "castMember": "Ren"
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
      "speaker": "Ren",
      "title": "Make every cup consistent.",
      "body": "The café needs a drink the team can prepare the same way each time.",
      "cta": "Continue",
      "id": "FS1-03",
      "artifact": FS_ARTIFACTS.note
    },
    {
      "kind": "card",
      "variant": "intro",
      "speaker": "Ren",
      "title": "Your part in the trial.",
      "body": "You prepare small batches and record what happens. I’ll check the plan with you before the tasting.",
      "cta": "Continue",
      "id": "FS1-04"
    },
    {
      "kind": "card",
      "variant": "character",
      "speaker": "Narrator",
      "title": "Meet your trial partner.",
      "body": "Imani prepares the samples. You compare what happens when one ingredient changes.",
      "cta": "Continue",
      "id": "FS1-05",
      "setup": "Imani • Junior Food Scientist",
      "castMember": "Imani"
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
      "kind": "flips",
      "speaker": "Ren",
      "title": "Three words for a fair trial.",
      "cards": [
        { "term": "Batch", "def": "One prepared amount of a product." },
        { "term": "Variable", "def": "The one thing changed in a comparison." },
        { "term": "Repeat", "def": "Run the same test again to check a result." }
      ],
      "cta": "Continue",
      "id": "FS1-08"
    },
    {
      "kind": "match",
      "speaker": "Narrator",
      "question": "Match each trial note to its job.",
      "pairs": [
        { "term": "Fruit amount", "def": "The variable being changed" },
        { "term": "Batch size", "def": "A condition kept the same" },
        { "term": "Taste score", "def": "A result to record" },
        { "term": "Run the test again", "def": "Repeat the comparison" }
      ],
      "whenRight": "A clear record shows what changed and what the team measured.",
      "whenWrong": "Name the changed ingredient, the steady conditions, and the result separately.",
      "feedback": "",
      "feedbackCta": "Continue",
      "skills": ["Problem-Solving", "Critical Thinking"],
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
      "kind": "card",
      "variant": "intro",
      "speaker": "Imani",
      "title": "The samples are ready.",
      "body": "I’ve prepared the coded cups and recorded both recipes. Now we can compare the batches fairly.",
      "cta": "Continue",
      "castMember": "Imani",
      "id": "FS1-13",
      "artifact": FS_ARTIFACTS.codes
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
      "speaker": "Narrator",
      "title": "Yuki leads the tasting review.",
      "body": "She checks what the results really show. Your notes will help her choose the next test.",
      "cta": "Continue",
      "castMember": "Yuki",
      "id": "FS1-12",
      "setup": "Yuki • Senior Food Scientist",
      "artifact": FS_ARTIFACTS.named
    },
    {
      "kind": "card",
      "variant": "intro",
      "speaker": "Yuki",
      "title": "Keep the tasting neutral.",
      "body": "Yuki asks the team to use codes and avoid hints that could sway a taster.",
      "cta": "Continue",
      "castMember": "Yuki",
      "id": "FS1-14",
      "artifact": FS_ARTIFACTS.codes
    },
    {
      "kind": "rank",
      "speaker": "Narrator",
      "question": "Rank the tasting setups from fairest to least fair.",
      "order": [
        "Coded cups, same instructions, no hints.",
        "Coded cups, but share your own favorite.",
        "Call one sample “the premium recipe.”"
      ],
      "whenRight": "Neutral codes and instructions leave more room for an honest comparison.",
      "whenWrong": "A label or your preference can sway the tasting. Keep the setup neutral.",
      "feedback": "",
      "feedbackCta": "Continue",
      "skills": ["Critical Thinking", "Problem-Solving"],
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
      "variant": "intro",
      "speaker": "Narrator",
      "title": "The first tasting is logged.",
      "body": "Yuki checks the sample codes and notes. Ren reviews the early result with you before the next task.",
      "cta": "Continue",
      "id": "FS1-16",
      "artifact": FS_ARTIFACTS.note
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
      "kind": "card",
      "variant": "character",
      "speaker": "Narrator",
      "title": "Luis tracks the batch records.",
      "body": "He links each sample code to its recipe. One entry is missing, and he needs your help.",
      "cta": "Continue",
      "castMember": "Luis",
      "id": "FS1-18",
      "setup": "Luis • Lab Technician",
      "artifact": FS_ARTIFACTS.note
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
        },
        {
          "question": "One batch tastes sweeter today. What can you report?",
          "options": [
            {
              "label": "This batch tasted sweeter in today’s test.",
              "correct": true,
              "why": "That states the observation and its limit."
            },
            {
              "label": "Everyone will find it sweeter every time.",
              "correct": false,
              "why": "One batch and one tasting do not support that claim."
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
      "kind": "card",
      "variant": "intro",
      "speaker": "Yuki",
      "title": "The record clears up the result.",
      "body": "The code now matches its recipe. We can review what the tasting shows and what still needs a test.",
      "cta": "Continue",
      "castMember": "Yuki",
      "id": "FS1-24",
      "artifact": FS_ARTIFACTS.note
    },
    {
      "kind": "card",
      "variant": "intro",
      "speaker": "Ren",
      "title": "Recommend a careful next step.",
      "body": "The café schedules another prep run for tomorrow. Yuki asks what the team should put on its follow-up list.",
      "cta": "Continue",
      "id": "FS1-25",
      "artifact": FS_ARTIFACTS.note
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
