"use client";

import { useRef, type ComponentProps, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { useDialogFocus } from "./useDialogFocus";
import { ArrowUpRight, Check, Circle, Clock3, AlertTriangle, RotateCcw, Minus } from "lucide-react";
import { Avatar as Portrait } from "../chips";
import { Tip } from "@/components/app/IconTip";
import { MILESTONE_KEYS, milestonesForGrade, type CaseloadStatus, type MilestoneStatus, type MilestoneKey } from "@/lib/counselorRoster";
export { Go, initials, ScrollChips } from "../chips";

export const STATUS_COLORS:Record<CaseloadStatus,string>={"On Track":"var(--v4-positive)","Needs Attention":"var(--v4-caution)","At Risk":"var(--destructive)"};
export const MILESTONE_COLORS:Record<MilestoneStatus,string>={Approved:"var(--v4-positive)",Completed:"var(--v4-positive)","Pending Review":"var(--v4-review)","In Progress":"var(--v4-caution)","Changes Requested":"var(--destructive)",Overdue:"var(--destructive)","Not Started":"var(--muted-foreground)","Not Applicable":"var(--muted-foreground)"};
// Fills for dots, bars and segments (Maisha's v4 review, 7 Oct 2026: "At
// Risk red, On Track green, Needs Attention yellow"), kept apart from the
// text inks above so each passes its own contrast bar (v4.css tokens).
export const STATUS_FILLS:Record<CaseloadStatus,string>={"On Track":"var(--v4-ok)","Needs Attention":"var(--v4-warn)","At Risk":"var(--v4-risk)"};
export const MILESTONE_FILLS:Record<MilestoneStatus,string>={Approved:"var(--v4-ok)",Completed:"var(--v4-ok)","Pending Review":"var(--v4-review)","In Progress":"var(--v4-warn)","Changes Requested":"var(--v4-risk)",Overdue:"var(--v4-risk)","Not Started":"var(--muted-foreground)","Not Applicable":"var(--muted-foreground)"};
const statusIcon = {"On Track":Check,"Needs Attention":Clock3,"At Risk":AlertTriangle};
const milestoneIcon = {Approved:Check,Completed:Check,"Pending Review":Clock3,"In Progress":Circle,"Changes Requested":RotateCcw,Overdue:AlertTriangle,"Not Started":Circle,"Not Applicable":Minus};
export function StatusChip({status}:{status:CaseloadStatus}) {const Icon=statusIcon[status];return <span className="v4-status" style={{"--status-color":STATUS_COLORS[status]} as CSSProperties}><Icon size={13} aria-hidden/>{status}</span>;}
export function MilestoneChip({status}:{status:MilestoneStatus}) {const Icon=milestoneIcon[status];return <span className="v4-status v4-milestone-status" style={{"--status-color":MILESTONE_COLORS[status]} as CSSProperties}><Icon size={13} aria-hidden/>{status}</span>;}
export function Avatar(props:ComponentProps<typeof Portrait>){return <span className="v4-portrait" style={{width:props.size??38,height:props.size??38}}><Portrait {...props} size={props.size??38}/></span>;}
export function MilestonesMini({milestones,grade}:{milestones:Record<MilestoneKey,MilestoneStatus>;grade?:number}) {
 const keys=grade?milestonesForGrade(grade):MILESTONE_KEYS.filter(k=>milestones[k]!=="Not Applicable");
 const approved=keys.filter(k=>milestones[k]==="Approved"||milestones[k]==="Completed").length;
 return <span className="v4-mini-progress"><span className="v4-mini-progress-label"><strong>{approved}<small> / {keys.length}</small></strong><span>complete</span></span><span className="v4-mini-progress-track" role="img" aria-label={keys.map(k=>`${k}: ${milestones[k]}`).join("; ")}>{keys.map(k=><Tip key={k} label={`${k}: ${milestones[k]}`}><span className="v4-progress-segment" style={{background:MILESTONE_FILLS[milestones[k]],opacity:milestones[k]==="Not Started"?.18:1}}/></Tip>)}</span></span>;
}
export function CardLink({onClick,children}:{onClick:()=>void;children:ReactNode}){return <button type="button" onClick={onClick} className="v4-inline-link">{children}<span><ArrowUpRight size={14} aria-hidden/></span></button>;}
export function StatRow({label,value,color,onClick,active}:{label:string;value:number;color:string;onClick?:()=>void;active?:boolean}) {const content=<><span><i style={{background:color}}/>{label}</span><strong>{value}</strong>{onClick&&<ArrowUpRight size={14} aria-hidden/>}</>;return onClick?<button type="button" className="v4-stat-row" aria-pressed={active} onClick={onClick}>{content}</button>:<span className="v4-stat-row">{content}</span>;}
export function SelectBox({checked,label,onChange,disabled}:{checked:boolean;label:string;onChange:(on:boolean)=>void;disabled?:boolean}){return <button type="button" role="checkbox" aria-label={label} aria-checked={checked} disabled={disabled} onClick={()=>onChange(!checked)} className="v4-checkbox">{checked&&<Check size={14} aria-hidden/>}</button>;}

export function StudentLink({id,name,index,size=44,children}:{id?:string;name:string;index?:number;size?:number;children?:ReactNode}){
 const content=<><Avatar name={name} index={index} size={size}/><span className="v4-student-link-copy"><strong>{name}{id&&<ArrowUpRight size={14} aria-hidden/>}</strong>{children}</span></>;
 return id?<Link href={`/counselor?view=students&studentId=${encodeURIComponent(id)}&v=4`} className="v4-student-link">{content}</Link>:<span className="v4-student-link">{content}</span>;
}
export function DetailPane({open,onClose,children}:{open:boolean;onClose:()=>void;children:ReactNode}){
 const ref=useRef<HTMLDivElement>(null);
 useDialogFocus(open,ref,onClose,true);
 return <>{open&&<button type="button" aria-label="Close details" onClick={onClose} className="v4-mobile-scrim lg:hidden"/>}<div ref={ref} tabIndex={-1} className={`v4-master-detail dm-scroll ${open?"is-open":""}`}><div className="v4-mobile-detail-bar lg:hidden"><span>Details</span><button type="button" onClick={onClose}>Done</button></div><div className="v4-master-detail-content">{children}</div></div></>;
}
