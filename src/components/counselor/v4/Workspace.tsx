"use client";

import Link from "next/link";
import { IconTip } from "@/components/app/IconTip";
import { SlidersHorizontal, Sun, Moon } from "lucide-react";
import type { CounselorView } from "../roles";

const areas: WorkspaceArea[] = [
  { label: "Today", views: ["overview"] },
  { label: "Students", views: ["students", "milestones", "review-queue", "academics", "applications", "financial-aid", "counselors", "team", "capacity"] },
  { label: "Workspace", views: ["connect", "productivity", "meetings", "time"] },
  { label: "Analytics", views: ["progress", "insights", "engagement", "impact", "school-impact", "readiness", "reports", "schools", "leader-progress", "postsecondary", "leader-reports", "school-performance", "outcomes", "district-reports"] },
];
// The leaders' own areas (6 Oct 2026): the counselor's four groups put a
// principal's Counseling Team under "Students" and every report under
// "Analytics", which is how a counselor files work, not how a leader reads a
// school. Same four-area shape as the counselor's, grouped by what a leader
// asks: how students are doing, who is doing the counseling, what to share.
export type WorkspaceArea = { label: string; views: CounselorView[] };
export const LEADER_AREAS: Record<"School Leader" | "District Leader", WorkspaceArea[]> = {
  "School Leader": [
    { label: "Today", views: ["overview"] },
    { label: "Students", views: ["leader-progress", "postsecondary"] },
    { label: "Team", views: ["team"] },
    { label: "Reports", views: ["leader-reports"] },
  ],
  "District Leader": [
    { label: "Today", views: ["overview"] },
    { label: "Schools", views: ["school-performance", "capacity"] },
    { label: "Students", views: ["outcomes"] },
    { label: "Reports", views: ["district-reports"] },
  ],
};
const names: Partial<Record<CounselorView,string>> = {overview:"Today",students:"Student directory",milestones:"Milestones","review-queue":"Review desk",connect:"Conversations",productivity:"Writing studio",progress:"Student progress",insights:"Career & college",engagement:"Engagement",impact:"Your impact",settings:"Preferences","leader-progress":"Student progress",postsecondary:"Career & postsecondary",team:"Counseling team","leader-reports":"Reports","school-performance":"School performance",outcomes:"Student outcomes",capacity:"Counseling capacity","district-reports":"Reports"};


export function Workspace({active,items,children,search,filters,account,org,theme,onTheme,showTitle=true,areaSet=areas}: {
 active:CounselorView;items:{view:CounselorView;label:string}[];children:React.ReactNode;search:React.ReactNode;filters:React.ReactNode;account:React.ReactNode;org:string;theme:string;onTheme:()=>void;showTitle?:boolean;areaSet?:WorkspaceArea[];
}) {
 const available=areaSet.map(a=>({...a,items:a.views.flatMap(view=>items.filter(i=>i.view===view))})).filter(a=>a.items.length);
 const area=available.find(a=>a.views.includes(active));
 const title=names[active]??items.find(i=>i.view===active)?.label??"Workspace";
 return <div className="v4-workspace">
  <header className="v4-navigation">
   <div className="v4-nav-main">
    {/* The real Dreamari mark and wordmark (4 Oct 2026, Chandu: "add the
           proper dreamari logo and wordmark instead of the generic thing"),
           built exactly like the app's own Wordmark (chrome.tsx): the
           logo-mark SVG as a currentColor mask, DREAMARI in the display face.
           "Counselor" stays as the quiet caption, as v2's "Command Center". */}
        <Link href="/counselor?view=overview&v=4" aria-label="Dreamari Counselor, Today" className="v4-brand dm-link" style={{ color: "var(--foreground)" }}>
          <span className="flex flex-col gap-[3px]">
            <span className="flex items-center gap-[var(--space-1)]">
              <span aria-hidden className="h-[13px] w-[23px] flex-none" style={{ background: "currentColor", maskImage: "url(/images/app/logo-mark.svg)", WebkitMaskImage: "url(/images/app/logo-mark.svg)", maskSize: "contain", WebkitMaskSize: "contain", maskRepeat: "no-repeat", WebkitMaskRepeat: "no-repeat" }} />
              <span className="text-[17px] leading-[22px] font-extrabold tracking-normal" style={{ fontFamily: "var(--font-display)" }}>DREAMARI</span>
            </span>
            <span className="v4-brand-caption" style={{ marginTop: 0 }}>COUNSELOR</span>
          </span>
        </Link>
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
