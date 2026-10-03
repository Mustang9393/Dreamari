"use client";

import Link from "next/link";
import { IconTip } from "@/components/app/IconTip";
import { SlidersHorizontal, Sun, Moon, Sparkles } from "lucide-react";
import type { CounselorView } from "../roles";

const areas = [
  { label: "Today", views: ["overview"] },
  { label: "Students", views: ["students", "milestones", "review-queue", "academics", "applications", "financial-aid", "counselors", "team", "capacity"] },
  { label: "Workspace", views: ["connect", "productivity", "meetings", "time"] },
  { label: "Analytics", views: ["progress", "insights", "engagement", "impact", "school-impact", "readiness", "reports", "schools", "leader-progress", "postsecondary", "leader-reports", "school-performance", "outcomes", "district-reports"] },
];
const names: Partial<Record<CounselorView,string>> = {overview:"Today",students:"Student directory",milestones:"Milestones","review-queue":"Review desk",connect:"Conversations",productivity:"Writing studio",progress:"Student progress",insights:"Career & college",engagement:"Engagement",impact:"Your impact",settings:"Preferences"};


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
    <div className="v4-nav-tools"><IconTip label={`Switch to ${theme==="dark"?"light":"dark"} mode`}><button className="v4-round" onClick={onTheme} aria-label={`Switch to ${theme==="dark"?"light":"dark"} mode`}>{theme==="dark"?<Sun size={18}/>:<Moon size={18}/>}</button></IconTip>{items.some(i=>i.view==="settings")&&<IconTip label="Preferences"><Link className="v4-round" href="/counselor?view=settings&v=4" aria-label="Preferences"><SlidersHorizontal size={18}/></Link></IconTip>}<div className="v4-account">{account}</div></div>
   </div>
   <div className="v4-nav-context"><nav className="v4-secondary-nav dm-scroll" aria-label="Tools in this area">{area && area.items.length>1?area.items.map(i=><Link key={i.view} href={`/counselor?view=${i.view}&v=4`} aria-current={active===i.view?"page":undefined}>{names[i.view]??i.label}</Link>):<span className="v4-org">{org}</span>}</nav><div className="v4-search">{search}</div></div>
  </header>
  <main id="main" className={`v4-main v4-view-${active}`}>
   {showTitle&&active!=="overview"&&<div className="v4-page-heading"><div><span className="v4-overline">{area?.label??"Your workspace"}<span aria-hidden> / </span>{org}</span><h1>{title}</h1></div><div className="v4-page-controls">{filters}</div></div>}
   {active==="overview"&&<div className="v4-today-controls">{filters}</div>}
   <div className="v4-content">{children}</div>
   <footer className="v4-workspace-footer"><span>Dreamari · Demo workspace</span></footer>
  </main>
 </div>;
}
