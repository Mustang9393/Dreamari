// One icon per milestone, used everywhere a milestone is named (Maisha, 7
// Oct 2026: "recurring words like Academic Plan, Resume, Financial Aid could
// have icons so the eye gets a break"). Plan section 4, "Milestone icons".

import { BadgeDollarSign, ClipboardCheck, Compass, FileText, GraduationCap, Map as MapIcon, Route, ScrollText, Send, Signature, UserRound, type LucideIcon } from "lucide-react";
import type { MilestoneKey } from "@/lib/counselorRoster";

export const MILESTONE_ICON: Record<MilestoneKey, LucideIcon> = {
  "Career Assessment": Compass,
  "Career Report": FileText,
  "Academic Plan": MapIcon,
  "Career Pathway": Route,
  Resume: UserRound,
  "School Exploration": GraduationCap,
  "School List": ClipboardCheck,
  Applications: Send,
  "Financial Aid": BadgeDollarSign,
  "Recommendation Letter": Signature,
  "Transcript Submission": ScrollText,
};
