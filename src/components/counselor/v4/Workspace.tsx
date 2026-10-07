"use client";

import Link from "next/link";
import { createContext, useContext } from "react";
import { IconTip } from "@/components/app/IconTip";
import { SlidersHorizontal, Sun, Moon } from "lucide-react";
import type { CounselorView } from "../roles";

const areas: WorkspaceArea[] = [
  { label: "Today", views: ["overview"] },
  { label: "Students", views: ["students", "milestones", "progress", "review-queue", "academics", "applications", "financial-aid", "counselors", "team", "capacity"] },
  // Explore is its own area, v5's order (8 Oct 2026, Chandu: "explore
  // should be its own tab")
  { label: "Explore", views: ["explore"] },
  { label: "Workspace", views: ["connect", "productivity", "meetings", "time"] },
  { label: "Insights", views: ["insights", "engagement", "impact", "school-impact", "readiness", "reports", "schools", "leader-progress", "postsecondary", "leader-reports", "school-performance", "outcomes", "district-reports"] },
];
// The leaders' own areas (6 Oct 2026): the counselor's four groups put a
// principal's Counseling Team under "Students" and every report under
// "Analytics", which is how a counselor files work, not how a leader reads a
// school. Same four-area shape as the counselor's, grouped by what a leader
// asks: how students are doing, who is doing the counseling, what to share.
export type WorkspaceArea = { label: string; views: CounselorView[] };
// Today places the grade picker in its own header row, beside Log time and
// Start reviewing, instead of on a line of its own (8 Oct 2026: "too
// cluttered in tablet mode").
const FiltersSlot = createContext<React.ReactNode>(null);
export const useTodayFilters = () => useContext(FiltersSlot);
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
// Student Progress sits beside Milestones under Students (7 Oct 2026, Maisha:
// "Student Progress fits more naturally under the Students tab").
// Title Case labels and counselor language (Maisha's v4 review, 7 Oct 2026):
// "Change Conversations to Connect", "Change Writing Studio to Assist",
// "Change Your Impact to My Impact", and "for any header with multiple
// words, please capitalize the first letter of each main word".
const names: Partial<Record<CounselorView,string>> = {overview:"Today",students:"Student Directory",milestones:"Milestones","review-queue":"Review Desk",connect:"Connect",productivity:"Assist",progress:"Student Progress",insights:"Career & College",explore:"Explore",engagement:"Engagement",impact:"My Impact","school-impact":"School Impact",counselors:"Counselors",settings:"Preferences","leader-progress":"Student Progress",postsecondary:"Career & Postsecondary",team:"Counseling Team","leader-reports":"Reports","school-performance":"School Performance",outcomes:"Student Outcomes",capacity:"Counseling Capacity","district-reports":"Reports"};

// One line under each page title that says what the page is for, in the
// counselor's own voice (Maisha: "When there is a new tab, there is usually
// a small description explaining what that tab actually does... a short
// line that explains the purpose of each area and uses language that
// compels them to actually use it." The Assist line is hers; its dash is a
// period, per the no-em-dash rule).
const purposes: Partial<Record<CounselorView,string>> = {
  students:"Every student on my caseload, and where each one stands right now.",
  milestones:"Every planning milestone across my caseload, so I can see who is behind.",
  "review-queue":"Student submissions waiting on me. Read, comment, and approve in one place.",
  connect:"Message students, answer their questions, and share news with my school.",
  productivity:"Generate high-quality first drafts for routine counseling tasks. Review, edit, and approve before use.",
  progress:"How far students have come on each milestone, and exactly who is behind each number.",
  insights:"What my students are saving, so I can plan speakers, visits, and programs they will care about.",
  explore:"What's in demand in my state, what's rising, and what my students love, so I can answer them on the spot.",
  engagement:"How often my students use Dreamari, and who I should check in with.",
  impact:"The difference my counseling is making, ready to share with my principal.",
  "school-impact":"The difference our counseling team is making, ready to share with leadership.",
  counselors:"How each counselor's caseload is moving, so I can rebalance before anyone falls behind.",
  settings:"My profile, signature, and how Dreamari reaches me.",
  "leader-progress":"Where students stand on planning milestones, and who needs support.",
  postsecondary:"What students are exploring and where they plan to go after graduation.",
  team:"How our counselors are reaching students and following up.",
  "leader-reports":"Reports I can open, print, or share with my staff and board.",
  "school-performance":"Every school's measures against its launch baseline, side by side.",
  outcomes:"Student outcomes across the district, by school or by grade.",
  capacity:"Student load and follow-up coverage at every school.",
  "district-reports":"District reports I can open, print, or share with my board.",
};



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
   {showTitle&&active!=="overview"&&<div className="v4-page-heading"><div><span className="v4-overline">{area?.label??"My Workspace"}<span aria-hidden> / </span>{org}</span><h1>{title}</h1>{purposes[active]&&<p className="v4-page-purpose">{purposes[active]}</p>}</div><div className="v4-page-controls">{filters}</div></div>}
   <div className="v4-content"><FiltersSlot.Provider value={active==="overview"?filters:null}>{children}</FiltersSlot.Provider></div>
   <footer className="v4-workspace-footer"><span>Dreamari · Demo workspace</span></footer>
  </main>
 </div>;
}
