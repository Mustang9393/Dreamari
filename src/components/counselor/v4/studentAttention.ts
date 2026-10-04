import { milestonesForGrade, type CounselorStudent, type AttentionSeverity } from "@/lib/counselorRoster";

/** Describe only milestones that apply to the student's grade. Status itself
 * remains the stored counselor status; this is evidence, not a risk model. */
function signal(s:CounselorStudent):{reason:string;severity:AttentionSeverity}{
 const keys=milestonesForGrade(s.grade).filter(k=>s.milestones[k]!=="Not Applicable");
 const overdue=keys.filter(k=>s.milestones[k]==="Overdue");
 if(overdue.length)return {reason:`${overdue[0]} overdue`,severity:"Critical"};
 const changes=keys.filter(k=>s.milestones[k]==="Changes Requested");
 if(changes.length)return {reason:`${changes[0]} needs changes`,severity:"Critical"};
 const unstarted=keys.filter(k=>s.milestones[k]==="Not Started");
 if(unstarted.length>=3)return {reason:`${unstarted.length} milestones not started`,severity:"High"};
 if(unstarted.length)return {reason:`${unstarted.join(" and ")} not started`,severity:"Medium"};
 if(s.supportFlagReason)return {reason:s.supportFlagReason,severity:"Medium"};
 return {reason:s.status==="On Track"?"On track for this grade":"Counselor follow-up needed",severity:"Medium"};
}
export const attentionReason=(s:CounselorStudent)=>signal(s).reason;
export const attentionSeverity=(s:CounselorStudent)=>signal(s).severity;
const rank={Critical:3,High:2,Medium:1};
export const attentionRank=(a:CounselorStudent,b:CounselorStudent)=>rank[attentionSeverity(b)]-rank[attentionSeverity(a)]||a.roadmapPct-b.roadmapPct;
