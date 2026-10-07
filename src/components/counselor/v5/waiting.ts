// What is waiting on the counselor from one student: their submissions to
// review, unanswered questions, letter requests and FAFSA. Shared by the
// meeting brief (Prepare) and the student page, so both say the same thing.

import type { ComponentType } from "react";
import { BadgeDollarSign, MessageSquare, Signature } from "lucide-react";
import { QUESTIONS } from "@/components/counselor/v4/CounselorConnect";
import { cv } from "@/lib/counselorBase";
import { fafsaRows } from "@/lib/counselorFafsa";
import { letterRequests } from "@/lib/counselorLetters";
import { MILESTONE_KEYS, type CounselorStudent } from "@/lib/counselorRoster";
import { MILESTONE_ICON } from "./milestoneIcons";

export type Waiting = { key: string; icon: ComponentType<{ className?: string }>; text: string; action: string; href: string };

export function waitingFor(row: CounselorStudent, roster: CounselorStudent[]): Waiting[] {
  return [
    ...MILESTONE_KEYS.filter((k) => row.milestones[k] === "Pending Review").map((k) => ({ key: `r-${k}`, icon: MILESTONE_ICON[k], text: `Review their ${k}`, action: "Review", href: cv("workspace", "&tab=reviews") })),
    ...QUESTIONS.filter((q) => q.name === row.name && q.status !== "responded" && q.status !== "resolved").map((q) => ({ key: q.id, icon: MessageSquare, text: `“${q.question.length > 70 ? `${q.question.slice(0, 68)}…` : q.question}”`, action: "Answer", href: cv("workspace", "&tab=messages") })),
    ...letterRequests(roster).filter((l) => l.studentId === row.id && l.status !== "sent").map((l) => ({ key: `l-${l.studentId}`, icon: Signature, text: `${l.type} letter, due ${new Date(`${l.due}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`, action: "Write", href: cv("workspace", "&tab=documents") })),
    ...(row.grade === 12 ? fafsaRows([row]).filter((r) => r.state === "not-submitted" || r.state === "incomplete").map(() => ({ key: "fafsa", icon: BadgeDollarSign, text: "FAFSA not filed yet", action: "Remind", href: cv("workspace", "&tab=messages") })) : []),
  ];
}
