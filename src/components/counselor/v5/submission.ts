// What came with a submission, for the review desk (Chandu, 7 Oct 2026: "the
// student's notes or message should be visible along with the document
// rather than just showing a doc and having an input field. What's the
// context? Counselor needs to know that").
// DEMO-ONLY: submissions don't carry a note or history yet. Notes are
// seeded per milestone in a student's voice (8th-grade, positive), and the
// dates and second tries are seeded per student, until the student app
// sends a note with each submission and the review store keeps history.

import type { CounselorStudent, MilestoneKey } from "@/lib/counselorRoster";

const NOTES: Record<MilestoneKey, string[]> = {
  "Career Assessment": ["I took it twice. The second time felt more like me.", "Some questions were hard. I went with my first answer."],
  "Career Report": ["I picked this career because I like helping people. Not sure about the pay part?", "I added the part about my summer job. Is that the right place for it?"],
  "Academic Plan": ["I added AP Bio for junior year. Is that too much with soccer?", "I moved Spanish to next year so I can take the welding class."],
  "Career Pathway": ["I chose this pathway because my aunt does it and I want to shadow her.", "I switched pathways after the simulation. This one fits me better."],
  "Resume": ["First resume ever! I wasn't sure what to put under skills.", "I added my volunteer hours. Should my job at the store go first?"],
  "College Exploration": ["I looked at three schools online. I liked the campus tours.", "I added two trade schools too. My dad says they're a good deal."],
  "College List": ["Here are my schools. Two are reaches, I know.", "I kept it to five. Can we talk about which one is my safety?"],
  "Applications": ["I sent my first application. Can you check the essay part?", "Two are in. The last one is due Nov 15."],
  "Financial Aid": ["My mom helped with the FAFSA. We weren't sure about one tax question.", "I found two scholarships too. Can you look at them?"],
  "Recommendation Letter": ["Thank you for writing this! The first deadline is Nov 1.", "I listed my clubs and my job so you have them."],
  "Transcript Submission": ["Please send my transcript to these schools.", "I added one more school this week."],
};

const LAST_FEEDBACK: Partial<Record<MilestoneKey, string>> = {
  "Career Report": "Say more about why this career fits you.",
  "Academic Plan": "Check you still have room for a math class senior year.",
  "Resume": "Add dates to each job and one more skill.",
  "College List": "Add one more safety school.",
  "Financial Aid": "Two fields were blank. Ask your parent about line 4.",
};

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export type Submission = { note: string; asks: boolean; sentDaysAgo: number; dueInDays: number; secondTry: boolean; lastFeedback?: string };

export function submissionFor(s: CounselorStudent, m: MilestoneKey): Submission {
  const h = hash(`${s.id}:${m}`);
  const pool = NOTES[m];
  const note = pool[h % pool.length];
  const lastFeedback = LAST_FEEDBACK[m];
  const secondTry = !!lastFeedback && h % 3 === 0;
  return { note, asks: note.includes("?"), sentDaysAgo: 1 + (h % 6), dueInDays: (h % 14) - 2, secondTry, lastFeedback: secondTry ? lastFeedback : undefined };
}
