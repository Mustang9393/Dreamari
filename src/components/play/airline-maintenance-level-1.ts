import type { Level } from "./types";
// SOP v2.6: supervised first-week airline support work. See docs/handoff/airline-maintenance.
export const AIRLINE_MAINTENANCE_LEVEL_1: Level = {
  "id": "airline-maintenance-l1",
  "n": 1,
  "role": "Aircraft Support Mechanic",
  "title": "The First Airline Shift",
  "blurb": "A passenger aircraft. An open finding. Your first shift with the airline team.",
  "cover": "/images/play/airline-maintenance/exterior-v2.png",
  "mood": "day",
  "hideBand": true,
  "directed": true,
  "cinematic": true,
  "worldTheme": true,
  "coreKit": true,
  "quietQuestions": true,
  "qaSkip": false,
  "saveSlot": 427,
  "cast": {
    "Sora": "/images/play/airline-maintenance/face-sora-v2.webp",
    "Caleb": "/images/play/airline-maintenance/face-caleb-v2.webp",
    "Elena": "/images/play/airline-maintenance/face-elena-v2.webp",
    "Priya": "/images/play/airline-maintenance/face-priya-v2.webp"
  },
  "points": 6,
  "noStrikes": true,
  "generationTemplate": "ib-narrative-v2",
  "scoreTip": "Start at 50. Seven decisions change reputation by +6 or -6. Reach 85. Practice is unscored.",
  "preGame": {
    "startLabel": "Start my shift",
    "skipLabel": "Start the story",
    "handoffLine": "Your first shift starts now.",
    "howToCta": "Enter the hangar",
    "ladder": [
      "Aircraft Support Mechanic",
      "Aircraft Maintenance Technician",
      "Lead Technician",
      "Maintenance Supervisor"
    ],
    "skills": [
      "Critical Thinking",
      "Decision-Making",
      "Verbal Communication"
    ],
    "skillTotal": 15,
    "ladderNote": "Paths vary by employer. Only Level 1 is playable."
  },
  "beats": [
    {
      "kind": "card",
      "variant": "intro",
      "speaker": "Narrator",
      "title": "Before the next flight",
      "body": "Your first week at fictional Gannet Regional Airlines starts in its coastal maintenance hangar.",
      "cta": "Continue",
      "id": "AL1-01"
    },
    {
      "kind": "card",
      "variant": "intro",
      "speaker": "Narrator",
      "title": "The next team needs facts",
      "body": "A passenger aircraft needs review. Prepare a finding brief: a short note listing concerns and unfinished work.",
      "cta": "Continue",
      "id": "AL1-02"
    },
    {
      "kind": "card",
      "variant": "intro",
      "speaker": "Sora",
      "title": "Sora has your first assignment",
      "body": "“I’m Sora, your mechanic mentor. You’ll help me observe and record concerns. I’ll review your work.”",
      "cta": "Continue",
      "castMember": "Sora",
      "setup": "Sora · Mechanic mentor",
      "id": "AL1-03"
    },
    {
      "kind": "card",
      "variant": "intro",
      "speaker": "Sora",
      "title": "Learn under supervision",
      "body": "“Use our current instructions for this aircraft and task. Trained, authorized staff decide when it can fly again.”",
      "cta": "Continue",
      "castMember": "Sora",
      "id": "AL1-04"
    },
    {
      "kind": "card",
      "variant": "intro",
      "speaker": "Caleb",
      "title": "Caleb is setting up",
      "body": "Caleb, another support mechanic, brings the check packet. He hopes to earn the next training assignment.",
      "cta": "Continue",
      "castMember": "Caleb",
      "setup": "Caleb · Junior technician",
      "id": "AL1-05"
    },
    {
      "kind": "choice",
      "speaker": "Narrator",
      "question": "Sora asks you to help with a visual check. Which instructions should you open first?",
      "feedback": "",
      "feedbackCta": "Continue",
      "skills": [
        "Critical Thinking",
        "Decision-Making"
      ],
      "planLineIfFailed": "use the supplied facts and ask your supervisor before continuing",
      "layout": "options",
      "choices": [
        {
          "id": "b",
          "label": "A procedure remembered from another aircraft",
          "tier": "wrong",
          "why": "A familiar procedure may not apply to this aircraft."
        },
        {
          "id": "a",
          "label": "Current airline instructions for this aircraft and task",
          "tier": "best",
          "why": "The reference must match the aircraft and the assigned work."
        },
        {
          "id": "c",
          "label": "An online clip showing a similar check",
          "tier": "wrong",
          "why": "A similar-looking check does not establish the applicable procedure."
        }
      ],
      "id": "AL1-06",
      "progress": 0.14285714285714285
    },
    {
      "kind": "flips",
      "speaker": "Sora",
      "castMember": "Sora",
      "title": "Four words on the floor",
      "cta": "Continue",
      "cards": [
        {
          "term": "Reported concern",
          "def": "Something that needs checking. Example: a rub mark on a cable cover."
        },
        {
          "term": "Part history",
          "def": "Records linking a part to its source. Example: a supplier record."
        },
        {
          "term": "Loose debris",
          "def": "An item out of place that could cause harm. Example: a metal clipping."
        },
        {
          "term": "Handoff",
          "def": "Passing work and its status to another person. Example: naming an unfinished check."
        }
      ],
      "id": "AL1-07"
    },
    {
      "kind": "match",
      "speaker": "Sora",
      "castMember": "Sora",
      "question": "Match each work situation to the term.",
      "prompt": "Tap a situation, then its term.",
      "practice": true,
      "noVerdict": true,
      "inlineCorrectionFeedback": true,
      "pairs": [
        {
          "term": "A rub mark needs assessment",
          "def": "Reported concern"
        },
        {
          "term": "A part’s paperwork links it to its source",
          "def": "Part history"
        },
        {
          "term": "A loose metal clipping near the aircraft",
          "def": "Loose debris"
        },
        {
          "term": "The next shift receives the unfinished check",
          "def": "Handoff"
        }
      ],
      "whenRight": "You connected the terms to real work.",
      "whenWrong": "Use the situation and the meaning of each term.",
      "feedback": "",
      "feedbackCta": "Continue",
      "skills": [
        "Active Learning",
        "Reading Comprehension"
      ],
      "id": "AL1-08"
    },
    {
      "kind": "rapid",
      "speaker": "Narrator",
      "question": "Check four situations from the hangar.",
      "feedback": "",
      "feedbackCta": "Continue",
      "skills": [
        "Critical Thinking",
        "Decision-Making"
      ],
      "planLineIfFailed": "use the supplied facts and ask your supervisor before continuing",
      "timer": 45,
      "items": [
        {
          "question": "A reported concern needs checking. A cable cover has a rub mark. Which note records what you saw?",
          "options": [
            {
              "label": "Rub mark observed; assessment needed",
              "correct": true,
              "why": "That states an observation without inventing a diagnosis."
            },
            {
              "label": "Electrical system has failed",
              "correct": false,
              "why": "A rub mark alone does not prove a system failure."
            }
          ]
        },
        {
          "question": "Part history links a part to its source. The label and paperwork differ. What should you do?",
          "options": [
            {
              "label": "Assume a similar appearance is enough",
              "correct": false,
              "why": "Appearance does not resolve a documentation mismatch."
            },
            {
              "label": "Ask the mentor to resolve the mismatch",
              "correct": true,
              "why": "The mismatch needs review before the part is used."
            }
          ]
        },
        {
          "question": "Loose debris can cause harm. Which item should you flag?",
          "options": [
            {
              "label": "A metal clipping on the work-area floor",
              "correct": true,
              "why": "Loose material can become foreign object debris."
            },
            {
              "label": "A closed, secured storage case",
              "correct": false,
              "why": "The secured case is in its assigned place."
            }
          ]
        },
        {
          "question": "A handoff shares work status. One check is unfinished. What should the next shift hear?",
          "options": [
            {
              "label": "All checks are complete",
              "correct": false,
              "why": "That hides unfinished work."
            },
            {
              "label": "Which check remains open and who reviews it next",
              "correct": true,
              "why": "The next team needs an accurate starting point."
            }
          ]
        }
      ],
      "id": "AL1-09",
      "progress": 0.2857142857142857,
      "whenPass": "You kept observations, parts records, debris, and open work clear.",
      "showRoundSummary": true,
      "whenTimeout": "Time ran out. Unanswered items count as incorrect.",
      "whenFail": "Review the terms and corrections before the next hangar task."
    },
    {
      "kind": "card",
      "variant": "intro",
      "speaker": "Sora",
      "title": "Observe. Record. Flag.",
      "body": "“Describe what you see and where. Flag concerns for review. Don’t guess the cause or choose a repair.”",
      "cta": "Continue",
      "castMember": "Sora",
      "id": "AL1-10"
    },
    {
      "kind": "choice",
      "speaker": "Narrator",
      "question": "During Sora’s check, you see a rub mark on the left cable cover. Its cause is unknown. What do you record?",
      "feedback": "",
      "feedbackCta": "Continue",
      "skills": [
        "Critical Thinking",
        "Decision-Making"
      ],
      "planLineIfFailed": "use the supplied facts and ask your supervisor before continuing",
      "layout": "options",
      "choices": [
        {
          "id": "b",
          "label": "A confirmed electrical failure",
          "tier": "wrong",
          "why": "You have not established an electrical failure."
        },
        {
          "id": "c",
          "label": "Nothing, because no warning appeared",
          "tier": "wrong",
          "why": "A visible concern still needs review even without a warning."
        },
        {
          "id": "a",
          "label": "Rub mark on left cable cover; ask Sora to review",
          "tier": "best",
          "why": "The note gives the concern and location without guessing its cause."
        }
      ],
      "id": "AL1-11",
      "progress": 0.42857142857142855
    },
    {
      "kind": "card",
      "variant": "intro",
      "speaker": "Elena",
      "title": "Elena checks the evidence",
      "body": "Elena, the maintenance supervisor, reviews your draft note and a replacement kit’s paperwork.",
      "cta": "Continue",
      "castMember": "Elena",
      "setup": "Elena · Maintenance supervisor",
      "id": "AL1-12"
    },
    {
      "kind": "card",
      "variant": "intro",
      "speaker": "Elena",
      "title": "Looks are not enough",
      "body": "“Compare the kit label with its records. If they differ, ask for review. Don’t guess why they differ.”",
      "cta": "Continue",
      "castMember": "Elena",
      "id": "AL1-13"
    },
    {
      "kind": "card",
      "variant": "intro",
      "speaker": "Elena",
      "title": "Keep your authority clear",
      "body": "“Flag concerns for Sora. With training, you can become a technician, then a lead. Approval needs the right authority.”",
      "cta": "Continue",
      "castMember": "Elena",
      "id": "AL1-14",
      "ladder": [
        {
          "label": "Aircraft Support Mechanic",
          "lit": true
        },
        {
          "label": "Aircraft Maintenance Technician",
          "lit": false
        },
        {
          "label": "Lead Technician",
          "lit": false
        },
        {
          "label": "Maintenance Supervisor",
          "lit": false
        }
      ]
    },
    {
      "kind": "pick",
      "speaker": "Narrator",
      "question": "The kit label says K-42; its paperwork says K-24. Gannet rules say hold mismatched kits for review. Choose two actions.",
      "feedback": "",
      "feedbackCta": "Continue",
      "skills": [
        "Critical Thinking",
        "Decision-Making"
      ],
      "planLineIfFailed": "use the supplied facts and ask your supervisor before continuing",
      "pick": 2,
      "cards": [
        {
          "label": "Change the paperwork to match the kit",
          "role": "leave"
        },
        {
          "label": "Put the kit in the marked hold area",
          "role": "pick"
        },
        {
          "label": "Claim the supplier sent a fake part",
          "role": "leave"
        },
        {
          "label": "Tell Sora: label K-42, paperwork K-24",
          "role": "pick"
        },
        {
          "label": "Install it because the shape looks right",
          "role": "leave"
        }
      ],
      "whenRight": "You kept the kit out of use and gave the reviewer the exact mismatch.",
      "whenWrong": "Keep the kit out of use and report the mismatch. Do not alter records or install it.",
      "id": "AL1-15",
      "progress": 0.5714285714285714
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
          "kicker": "Midpoint review",
          "line": "Sora reviews your first four decisions."
        },
        "progressLine": "Reviewing your first checks...",
        "fail": {
          "title": "There is more to practice",
          "body": "Use the corrections as you prepare the finding brief."
        },
        "pass": {
          "title": "Your first checks are on track",
          "note": "Checkpoint saved",
          "body": "You used the instructions, recorded a concern, and kept an uncertain kit out of use."
        }
      },
      "secondaryCta": "Finish later",
      "secondaryHref": "/play",
      "id": "AL1-16"
    },
    {
      "kind": "card",
      "variant": "act",
      "speaker": "Narrator",
      "title": "The brief moves forward",
      "body": "Your draft is ready. The kit stays on hold while authorized staff review the mismatch.",
      "cta": "Continue",
      "id": "AL1-17"
    },
    {
      "kind": "card",
      "variant": "intro",
      "speaker": "Caleb",
      "title": "Caleb wants to be noticed",
      "body": "Caleb returns from setup. He hopes today’s effort will earn him another supervised assignment.",
      "cta": "Continue",
      "castMember": "Caleb",
      "id": "AL1-18"
    },
    {
      "kind": "card",
      "variant": "intro",
      "speaker": "Caleb",
      "title": "Your work. His claim.",
      "body": "Caleb calls your finding brief his own. The saved draft history shows your work.",
      "cta": "Continue",
      "castMember": "Caleb",
      "id": "AL1-19"
    },
    {
      "kind": "choice",
      "speaker": "Narrator",
      "question": "Caleb claims your finding brief. The draft history shows you prepared it. How should you raise the issue?",
      "feedback": "",
      "feedbackCta": "Continue",
      "skills": [
        "Verbal Communication",
        "Decision-Making"
      ],
      "planLineIfFailed": "use the supplied facts and ask your supervisor before continuing",
      "layout": "options",
      "choices": [
        {
          "id": "b",
          "label": "Accuse Caleb over the hangar radio",
          "tier": "wrong",
          "why": "A public accusation interrupts work and escalates the conflict."
        },
        {
          "id": "a",
          "label": "Speak privately with Sora and show the draft history",
          "tier": "best",
          "why": "A calm private conversation gives the mentor facts without disrupting the team."
        },
        {
          "id": "c",
          "label": "Remove Caleb’s inspection notes",
          "tier": "wrong",
          "why": "Removing work harms the record the team needs."
        }
      ],
      "id": "AL1-20",
      "progress": 0.7142857142857143
    },
    {
      "kind": "card",
      "variant": "intro",
      "speaker": "Narrator",
      "title": "One person is reassigned",
      "body": "A technician moves to another job. Your brief is due this shift. One check remains unfinished.",
      "cta": "Continue",
      "id": "AL1-21"
    },
    {
      "kind": "choice",
      "speaker": "Sora",
      "question": "One check remains unfinished after a technician leaves. Your brief is due this shift. What do you message Sora?",
      "feedback": "",
      "feedbackCta": "Continue",
      "skills": [
        "Time Management",
        "Verbal Communication"
      ],
      "planLineIfFailed": "use the supplied facts and ask your supervisor before continuing",
      "layout": "chat",
      "choices": [
        {
          "id": "b",
          "label": "“I’ll mark the check complete to meet the deadline.”",
          "tier": "wrong",
          "why": "A deadline does not make incomplete work complete."
        },
        {
          "id": "c",
          "label": "“I’ll take over the check without supervision.”",
          "tier": "wrong",
          "why": "The assignment and supervision still belong to the qualified team."
        },
        {
          "id": "a",
          "label": "“Can you reset priorities? I’ll list the open check and next owner.”",
          "tier": "best",
          "why": "Sora can organize the work while your note keeps its unfinished status clear."
        }
      ],
      "castMember": "Sora",
      "chatWith": {
        "name": "Sora",
        "role": "Mechanic mentor"
      },
      "id": "AL1-22",
      "progress": 0.8571428571428571
    },
    {
      "kind": "card",
      "variant": "intro",
      "speaker": "Sora",
      "title": "Facts reach the reviewer",
      "body": "You send Sora the brief. It lists the rub mark, kit hold, and unfinished check for review.",
      "cta": "Continue",
      "castMember": "Sora",
      "id": "AL1-23"
    },
    {
      "kind": "card",
      "variant": "intro",
      "speaker": "Priya",
      "title": "Priya needs a hand",
      "body": "Priya, a support mechanic on the next shift, asks how to record an unfinished check.",
      "cta": "Continue",
      "castMember": "Priya",
      "setup": "Priya · Aircraft support mechanic",
      "id": "AL1-24"
    },
    {
      "kind": "card",
      "variant": "intro",
      "speaker": "Priya",
      "title": "You have time to help",
      "body": "Your brief is submitted. Priya’s handoff is due next. She needs the open check, status, and reviewer.",
      "cta": "Continue",
      "castMember": "Priya",
      "id": "AL1-25"
    },
    {
      "kind": "rank",
      "speaker": "Narrator",
      "question": "Priya needs help recording an unfinished check. You have time. Rank these responses from most to least supportive.",
      "feedback": "",
      "feedbackCta": "Continue",
      "skills": [
        "Helping & Supporting Others",
        "Teamwork & Collaboration"
      ],
      "planLineIfFailed": "use the supplied facts and ask your supervisor before continuing",
      "order": [
        "Record the status with Priya and notify Sora together",
        "Share the handoff guide and remain available",
        "Leave Priya to guess without support",
        "Sign the unfinished check complete for Priya"
      ],
      "whenRight": "You help your teammate while preserving the actual status and the supervisor’s role.",
      "whenWrong": "Direct support comes first; signing unfinished work complete comes last.",
      "id": "AL1-26",
      "progress": 1.0
    },
    {
      "kind": "card",
      "variant": "intro",
      "speaker": "Sora",
      "title": "Sora notices the difference",
      "body": "“Clear notes help the next team. They show what still needs review and who to ask.”",
      "cta": "Continue",
      "castMember": "Sora",
      "id": "AL1-27"
    },
    {
      "kind": "card",
      "variant": "intro",
      "speaker": "Sora",
      "title": "First shift complete",
      "body": "Your brief is delivered. Authorized staff assess the concerns and decide when the aircraft can fly again.",
      "cta": "Continue",
      "castMember": "Sora",
      "id": "AL1-28"
    },
    {
      "kind": "review",
      "speaker": "System",
      "title": "Your first airline shift",
      "body": "You used current instructions, recorded concerns, checked part records, and supported the next shift.",
      "deciding": "Reviewing your shift...",
      "decidingNote": "Career exploration only. This result is not a maintenance qualification or aircraft release.",
      "id": "AL1-29"
    }
  ],
  "endings": [
    {
      "min": 85,
      "headline": "A clear brief. A stronger team.",
      "scoreNote": "Level 1 complete",
      "message": "Your clear observations gave the airline team a useful starting point.",
      "subline": "You completed this fictional supervised airline shift.",
      "primary": "Replay this shift",
      "advances": true,
      "replayOnPass": true
    },
    {
      "min": 0,
      "headline": "Review and try again",
      "scoreNote": "More practice will help",
      "message": "Use the corrections to check facts, keep open work visible, and stay within your supervised role.",
      "subline": "Restart with what you learned.",
      "primary": "Try again",
      "advances": false
    }
  ],
  "plainEndings": true,
  "noRepair": true
};
