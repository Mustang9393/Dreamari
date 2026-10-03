"use client";

import type { ComponentProps, CSSProperties, ReactNode } from "react";
import { ArrowUpRight, Check, Circle, Clock3, AlertTriangle, RotateCcw, Minus } from "lucide-react";
import { Avatar as Portrait } from "../chips";
import { Tip } from "@/components/app/IconTip";
import { MILESTONE_KEYS, milestonesForGrade, type CaseloadStatus, type MilestoneStatus, type MilestoneKey } from "@/lib/counselorRoster";
export { Go, initials, StudentLink, ScrollChips, DetailPane } from "../chips";

export const STATUS_COLORS:Record<CaseloadStatus,string>={"On Track":"var(--v4-positive)","Needs Attention":"var(--v4-caution)","At Risk":"var(--destructive)"};
export const MILESTONE_COLORS:Record<MilestoneStatus,string>={Approved:"var(--v4-positive)",Completed:"var(--v4-positive)","Pending Review":"var(--v4-review)","In Progress":"var(--v4-caution)","Changes Requested":"var(--destructive)",Overdue:"var(--destructive)","Not Started":"var(--muted-foreground)","Not Applicable":"var(--muted-foreground)"};
const statusIcon = {"On Track":Check,"Needs Attention":Clock3,"At Risk":AlertTriangle};
const milestoneIcon = {Approved:Check,Completed:Check,"Pending Review":Clock3,"In Progress":Circle,"Changes Requested":RotateCcw,Overdue:AlertTriangle,"Not Started":Circle,"Not Applicable":Minus};
export function StatusChip({status}:{status:CaseloadStatus}) {const Icon=statusIcon[status];return <span className="v4-status" style={{"--status-color":STATUS_COLORS[status]} as CSSProperties}><Icon size={13} aria-hidden/>{status}</span>;}
export function MilestoneChip({status}:{status:MilestoneStatus}) {const Icon=milestoneIcon[status];return <span className="v4-status v4-milestone-status" style={{"--status-color":MILESTONE_COLORS[status]} as CSSProperties}><Icon size={13} aria-hidden/>{status}</span>;}
export function Avatar(props:ComponentProps<typeof Portrait>){return <span className="v4-portrait" style={{width:props.size??38,height:props.size??38}}><Portrait {...props} size={props.size??38}/></span>;}
export function MilestonesMini({milestones,grade}:{milestones:Record<MilestoneKey,MilestoneStatus>;grade?:9|10|11|12}) {
 const keys=grade?milestonesForGrade(grade):MILESTONE_KEYS.filter(k=>milestones[k]!=="Not Applicable");
 const approved=keys.filter(k=>milestones[k]==="Approved"||milestones[k]==="Completed").length;
 return <span className="v4-mini-progress"><span className="v4-mini-progress-label"><strong>{approved}<small> / {keys.length}</small></strong><span>complete</span></span><span className="v4-mini-progress-track" aria-label={keys.map(k=>`${k}: ${milestones[k]}`).join("; ")}>{keys.map(k=><Tip key={k} label={`${k}: ${milestones[k]}`}><span className="v4-progress-segment" style={{background:MILESTONE_COLORS[milestones[k]],opacity:milestones[k]==="Not Started"?.18:1}}/></Tip>)}</span></span>;
}
export function CardLink({onClick,children}:{onClick:()=>void;children:ReactNode}){return <button type="button" onClick={onClick} className="v4-inline-link">{children}<span><ArrowUpRight size={14} aria-hidden/></span></button>;}
export function StatRow({label,value,color,onClick,active}:{label:string;value:number;color:string;onClick?:()=>void;active?:boolean}) {const content=<><span><i style={{background:color}}/>{label}</span><strong>{value}</strong>{onClick&&<ArrowUpRight size={14} aria-hidden/>}</>;return onClick?<button type="button" className="v4-stat-row" aria-pressed={active} onClick={onClick}>{content}</button>:<span className="v4-stat-row">{content}</span>;}
export function SelectBox({checked,label,onChange,disabled}:{checked:boolean;label:string;onChange:(on:boolean)=>void;disabled?:boolean}){return <button type="button" role="checkbox" aria-label={label} aria-checked={checked} disabled={disabled} onClick={()=>onChange(!checked)} className="v4-checkbox">{checked&&<Check size={14} aria-hidden/>}</button>;}
