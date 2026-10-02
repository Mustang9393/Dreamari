"use client";

import Link from "next/link";
import { ArrowUpRight, SlidersHorizontal, Sun, Moon, Sparkles } from "lucide-react";
import type { CounselorView } from "../roles";

const areas = [
  { label: "Today", views: ["overview"] },
  { label: "Students", views: ["students", "milestones", "review-queue", "academics", "applications", "financial-aid", "counselors", "team", "capacity"] },
  { label: "Workspace", views: ["connect", "productivity", "meetings", "time"] },
  { label: "Analytics", views: ["progress", "insights", "engagement", "impact", "school-impact", "readiness", "reports", "schools", "leader-progress", "postsecondary", "leader-reports", "school-performance", "outcomes", "district-reports"] },
];
const names: Partial<Record<CounselorView,string>> = {overview:"Today",students:"Student directory",milestones:"Milestones","review-queue":"Review desk",connect:"Conversations",productivity:"Writing studio",progress:"Student progress",insights:"Career & college",engagement:"Engagement",impact:"Your impact",settings:"Preferences"};
const purposes: Partial<Record<CounselorView,string>> = {students:"Find a student. Understand their story. Plan the next conversation.",milestones:"See where each grade is moving forward and where support is needed.","review-queue":"One submission at a time. Your feedback moves students forward.",connect:"Questions, announcements, and the conversations that keep students moving.",productivity:"A focused place to turn student context into thoughtful guidance.",progress:"Explore progress across your caseload, then open the students behind it.",insights:"Use student interests to shape the opportunities you bring to them.",engagement:"Understand participation over time and spot who may need a check-in.",impact:"See your reach, outcomes, and the work behind them.",settings:"Make this workspace work for you."};

export function Workspace({active,items,children,search,filters,account,org,theme,onTheme,showTitle=true}: {
 active:CounselorView;items:{view:CounselorView;label:string}[];children:React.ReactNode;search:React.ReactNode;filters:React.ReactNode;account:React.ReactNode;org:string;theme:string;onTheme:()=>void;showTitle?:boolean;
}) {
 const available=areas.map(a=>({...a,items:a.views.flatMap(view=>items.filter(i=>i.view===view))})).filter(a=>a.items.length);
 const area=available.find(a=>a.views.includes(active));
 const title=names[active]??items.find(i=>i.view===active)?.label??"Workspace";
 return <div className="v4-workspace">
  <header className="v4-navigation">
   <div className="v4-nav-main">
    <Link href="/counselor?view=overview&v=4" className="v4-brand" aria-label="Dreamari Today"><span className="v4-brand-mark"><Sparkles size={21}/></span><span>dreamari<span className="v4-brand-caption">COUNSELOR</span></span></Link>
    <nav className="v4-primary-nav dm-scroll" aria-label="Workspace areas">{available.map(a=><Link key={a.label} href={`/counselor?view=${a.items[0].view}&v=4`} aria-current={area?.label===a.label?"page":undefined}>{a.label}</Link>)}</nav>
    <div className="v4-nav-tools"><button className="v4-round" onClick={onTheme} aria-label={`Switch to ${theme==="dark"?"light":"dark"} mode`}>{theme==="dark"?<Sun size={18}/>:<Moon size={18}/>}</button><Link className="v4-round" href="/counselor?view=settings&v=4" aria-label="Preferences"><SlidersHorizontal size={18}/></Link><div className="v4-account">{account}</div></div>
   </div>
   <div className="v4-nav-context"><nav className="v4-secondary-nav dm-scroll" aria-label="Tools in this area">{area && area.items.length>1?area.items.map(i=><Link key={i.view} href={`/counselor?view=${i.view}&v=4`} aria-current={active===i.view?"page":undefined}>{names[i.view]??i.label}</Link>):<span className="v4-org">{org}</span>}</nav><div className="v4-search">{search}</div></div>
  </header>
  <main id="main" className={`v4-main v4-view-${active}`}>
   {showTitle&&active!=="overview"&&<div className="v4-page-heading"><div><span className="v4-overline">{area?.label??"Your workspace"}<span aria-hidden> / </span>{org}</span><h1>{title}</h1><p>{purposes[active]??"Explore the detail and open any student or report to take the next step."}</p></div><div className="v4-page-controls">{filters}</div></div>}
   {active==="overview"&&<div className="v4-today-controls"><span className="v4-overline">Your daily workspace</span>{filters}</div>}
   <div className="v4-content">{children}</div>
   <footer className="v4-workspace-footer"><span>Dreamari · Counselor workspace</span><Link href="/counselor?view=students&v=4">Open student directory <ArrowUpRight size={13}/></Link></footer>
  </main>
 </div>;
}
