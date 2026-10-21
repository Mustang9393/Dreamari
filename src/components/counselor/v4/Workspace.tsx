"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Listbox } from "./Listbox";
import { createContext, useContext, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { IconTip } from "@/components/app/IconTip";
import { Search, SlidersHorizontal, Sun, Moon } from "lucide-react";
import type { CounselorView } from "../roles";
import "./visual-refresh.css";
import "./layout2.css";
import "./reinvent.css";
import { AvatarStylePicker, AvatarStyleProvider } from "./avatarStyle";
import { DesktopNavigation, QuickLinksMenu } from "@/components/app/chrome";

const areas: WorkspaceArea[] = [
  // "Rename the 'Today' tab to Home" (Maisha, 9 Oct 2026).
  { label: "Home", views: ["overview"] },
  // Maisha's consolidation (9 Oct 2026): Students is Directory and
  // Milestones; Review moved to Prepare; Check-ins left the demo.
  { label: "Students", views: ["students", "milestones", "progress", "academics", "applications", "financial-aid", "counselors", "team", "capacity"] },
  // Explore is its own area, v5's order (8 Oct 2026, Chandu: "explore
  // should be its own tab")
  { label: "Explore", views: ["explore"] },
  // "In v4 change 'Workspace' to 'Prepare.' This should be the place where
  // counselors go to review, communicate, prepare for meetings, and
  // complete their work" (Maisha, 9 Oct 2026).
  // Tab order is Maisha's (9 Oct 2026): Prepare "Meetings → Review →
  // Messages → Assist"; Insights "College & Career → Readiness →
  // Engagement → My Impact". roles.ts sorts the menu the same way.
  { label: "Prepare", views: ["meetings", "review-queue", "connect", "productivity", "time"] },
  { label: "Insights", views: ["insights", "readiness", "engagement", "impact", "school-impact", "reports", "schools", "leader-progress", "postsecondary", "leader-reports", "school-performance", "outcomes", "district-reports"] },
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
/** A page's own controls, drawn on the title's second row beside the
 *  shell's filters, so a page never stacks a second control row under
 *  them (20 Oct 2026 composition pass). Renders nothing until the row is
 *  there; falls back to rendering in place when the shell has no heading. */
export function HeadingControls({ children }: { children: React.ReactNode }) {
  // read the row after the frame it mounts in (it is drawn in the same
  // commit as the page), and null on the server so hydration matches
  const slot = useSyncExternalStore(subscribeNextFrame, headingSlot, () => undefined);
  if (slot === undefined) return null;
  // on the title row the page's own controls come first, the shell's grade
  // and group pickers after them
  return slot ? createPortal(<div className="v4-ph-own">{children}</div>, slot) : <>{children}</>;
}
const subscribeNextFrame = (cb: () => void) => { const id = requestAnimationFrame(cb); return () => cancelAnimationFrame(id); };
const headingSlot = () => document.getElementById("v4-page-controls");
export const LEADER_AREAS: Record<"School Leader" | "District Leader", WorkspaceArea[]> = {
  "School Leader": [
    { label: "Home", views: ["overview"] },
    { label: "Students", views: ["leader-progress", "postsecondary"] },
    { label: "Team", views: ["team"] },
    { label: "Reports", views: ["leader-reports"] },
  ],
  "District Leader": [
    { label: "Home", views: ["overview"] },
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
// 9 Oct 2026 (Maisha): "Directory", not "Student Directory" ("no need to
// repeat the word 'student' since that's already the name of the tab");
// Connect is Messages, the review desk is Review (her word, 9 Oct 2026:
// "Meetings → Review → Messages → Assist"), the first tab is Home and the
// career page is College & Career.
const names: Partial<Record<CounselorView,string>> = {overview:"Home",students:"Directory",milestones:"Milestones","review-queue":"Review",meetings:"Meetings",connect:"Messages",productivity:"Assist",progress:"Milestones",readiness:"Readiness",insights:"College & Career",explore:"Explore",engagement:"Engagement",impact:"My Impact","school-impact":"School Impact",counselors:"Counselors",settings:"Preferences","leader-progress":"Student Progress",postsecondary:"Career & Postsecondary",team:"Counseling Team","leader-reports":"Reports","school-performance":"School Performance",outcomes:"Student Outcomes",capacity:"Counseling Capacity","district-reports":"Reports"};

// One line under each page title that says what the page is for, in the
// counselor's own voice (Maisha: "When there is a new tab, there is usually
// a small description explaining what that tab actually does... a short
// line that explains the purpose of each area and uses language that
// compels them to actually use it." The Assist line is hers; its dash is a
// period, per the no-em-dash rule).
const purposes: Partial<Record<CounselorView,string>> = {
  students:"My caseload, at a glance.",
  milestones:"Milestones, progress, and next steps.",
  progress:"Milestones, progress, and next steps.",
  "review-queue":"Review, comment, and approve submissions.",
  meetings:"My week of meetings.",
  // Maisha's own line (9 Oct 2026): "Update the description to: 'Student
  // questions and announcements in one space.'"
  connect:"Student questions and announcements in one space.",
  readiness:"Readiness, gaps, and students needing support.",
  productivity:"Generate high-quality first drafts for routine counseling tasks. Review, edit, and approve before use.",
  insights:"Student interests. Ideas for speakers, visits, and programs.",
  // shortened to one line (20 Oct 2026 declutter); same three things
  explore:"What's in demand, what's rising, and what my students love.",
  engagement:"Student activity and who to reach out to.",
  impact:"The progress and impact of my work.",
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



// No page draws the "Students / Lincoln High School" overline above its
// title any more. Maisha removed it from Milestones first (9 Oct 2026:
// "Remove the 'Students / Lincoln High School' breadcrumb above
// Milestones"), then Chandu from every page the same day: "we can lose the
// whole Lincoln High School / Explore breadcrumb thing. Too much space is
// being wasted ... and the content is pushed down." The area is already
// the lit tab in the nav and the school sits in the nav's second row, so
// the overline only repeated both.

export function Workspace({active,items,children,search,filters,account,org,theme,onTheme,showTitle=true,areaSet=areas}: {
 active:CounselorView;items:{view:CounselorView;label:string}[];children:React.ReactNode;search:React.ReactNode;filters:React.ReactNode;account:React.ReactNode;org:string;theme:string;onTheme:()=>void;showTitle?:boolean;areaSet?:WorkspaceArea[];
}) {
 const available=areaSet.map(a=>({...a,items:a.views.flatMap(view=>items.filter(i=>i.view===view))})).filter(a=>a.items.length);
 const area=available.find(a=>a.views.includes(active));
 const title=names[active]??items.find(i=>i.view===active)?.label??"Workspace";
 const router=useRouter();
 // the pages of this area, de-duplicated by name ("progress" is Milestones'
 // By Student reading, so it lights Milestones rather than a second tab)
 const pages=(area?.items??[]).filter(i=>i.view!=="progress");
 const lit=active==="progress"?"milestones":active;
 const [searchOpen,setSearchOpen]=useState(false);
 const searchRef=useRef<HTMLDivElement>(null);
 const searchBtn=useRef<HTMLButtonElement>(null);
 // "/" opens the search wherever focus is not already in a field
 useEffect(()=>{const onKey=(e:KeyboardEvent)=>{const t=e.target as HTMLElement|null;if(e.key==="/"&&!(t&&(t.tagName==="INPUT"||t.tagName==="TEXTAREA"||t.isContentEditable))){e.preventDefault();setSearchOpen(true);}};window.addEventListener("keydown",onKey);return()=>window.removeEventListener("keydown",onKey);},[]);
 // focus the field on open; Escape or a click outside closes it
 useEffect(()=>{if(!searchOpen)return;searchRef.current?.querySelector("input")?.focus();const onDown=(e:PointerEvent)=>{const t=e.target as Node;if(!searchRef.current?.contains(t)&&!(t instanceof Element&&t.closest("[data-v4-search-toggle]")))setSearchOpen(false);};const onKey=(e:KeyboardEvent)=>{if(e.key==="Escape"){setSearchOpen(false);searchBtn.current?.focus();}};document.addEventListener("pointerdown",onDown);window.addEventListener("keydown",onKey);return()=>{document.removeEventListener("pointerdown",onDown);window.removeEventListener("keydown",onKey);};},[searchOpen]);
 const tools=<><IconTip label="Search (/)"><button type="button" data-v4-search-toggle ref={searchBtn} className="v4-round" aria-label="Search students or screens" aria-expanded={searchOpen} onClick={()=>setSearchOpen(o=>!o)}><Search size={18}/></button></IconTip><IconTip label={`Switch to ${theme==="dark"?"light":"dark"} mode`}><button className="v4-round" onClick={onTheme} aria-label={`Switch to ${theme==="dark"?"light":"dark"} mode`}>{theme==="dark"?<Sun size={18}/>:<Moon size={18}/>}</button></IconTip>{items.some(i=>i.view==="settings")&&<IconTip label="Preferences"><Link className="v4-round" href="/counselor?view=settings&v=4" aria-label="Preferences"><SlidersHorizontal size={18}/></Link></IconTip>}<div className="v4-account">{account}</div></>;
 return <div className="v4-workspace" data-visual-refresh="calm">
  {/* DEMO-ONLY: the nav tools end with the site-wide quick links
      hamburger, the way back to the rest of the demo (Chandu, 20 Oct
      2026: "When i get to there i cant naviagte back to other parts of
      the app"). Same as v5, v7 and shell.tsx. */}
  {/* The student app's top bar (20 Oct 2026, Chandu: "why is there a solid
      black header dont do that" and "the top navbar should be like what we
      have in the student section, same design and width etc."): the same
      DesktopNavigation v7 uses, the areas in its centred pill, transparent
      over the sky until scrolled, the tools in its right slot. Search is
      an icon there now (a 280px field made the band crowded); "/" still
      opens it. Phones and tablets keep v4's own bar below lg, now see-
      through too. */}
  <DesktopNavigation active={area?.label} items={available.map(a=>({label:a.label,href:`/counselor?view=${a.items[0].view}&v=4`}))} right={<div className="v4-nav-tools">{tools}</div>}/>
  <header className="v4-navigation v4-nav-compact">
   <div className="v4-nav-main">
        <Link href="/counselor?view=overview&v=4" aria-label="Dreamari Counselor, Home" className="v4-brand dm-link" style={{ color: "var(--foreground)" }}>
          <span className="flex items-center gap-[var(--space-1)]">
            <span aria-hidden className="h-[13px] w-[23px] flex-none" style={{ background: "currentColor", maskImage: "url(/images/app/logo-mark.svg)", WebkitMaskImage: "url(/images/app/logo-mark.svg)", maskSize: "contain", WebkitMaskSize: "contain", maskRepeat: "no-repeat", WebkitMaskRepeat: "no-repeat" }} />
            <span className="text-[17px] leading-[22px] font-extrabold tracking-normal" style={{ fontFamily: "var(--font-display)" }}>DREAMARI</span>
          </span>
        </Link>
    <nav className="v4-primary-nav dm-scroll" aria-label="Workspace areas">{available.map(a=><Link key={a.label} href={`/counselor?view=${a.items[0].view}&v=4`} aria-current={area?.label===a.label?"page":undefined}>{a.label}</Link>)}</nav>
    <div className="v4-nav-tools">{tools}<QuickLinksMenu /></div>
   </div>
   {org?<div className="v4-nav-context"><span className="v4-secondary-nav"><span className="v4-org">{org}</span></span></div>:null}
  </header>
  {/* one search field for both bars, under the bar's right edge */}
  {searchOpen&&<div ref={searchRef} className="v4-search-pop" role="dialog" aria-label="Search students or screens">{search}</div>}
  <main id="main" className={`v4-main v4-view-${active}`}>
   {/* The page title is the area's pages (20 Oct 2026): every page of the
      area at title size in a fixed order, this one in full ink with the
      blue underline, the others muted and one click away, so the pages are
      the first thing read instead of a 12px row nobody saw. The line under
      it carries the page's purpose on the left and its filters on the
      right. Phones get the same choice as a picker (tabs wider than the
      screen become a dropdown). */}
   {showTitle&&active!=="overview"&&<div className="v4-page-heading v4-ph">
    {pages.length>1
     ?<><nav className="v4-title-tabs" aria-label={`${area?.label??"This area"} pages`}>{pages.map(i=>i.view===lit
       ?<h1 key={i.view} className="v4-tt is-on" aria-current="page">{names[i.view]??i.label}</h1>
       :<Link key={i.view} href={`/counselor?view=${i.view}&v=4`} className="v4-tt">{names[i.view]??i.label}</Link>)}</nav>
      <div className="v4-title-pick"><Listbox ariaLabel={`${area?.label??"This area"} pages`} value={lit} onChange={(v)=>router.push(`/counselor?view=${v}&v=4`)} options={pages.map(i=>({value:i.view,label:names[i.view]??i.label}))} className="v4-title-select" panelStyle={{ background: "var(--card)", color: "var(--foreground)" }}/></div></>
     :<h1 className="v4-tt is-on is-solo">{title}</h1>}
    <div className="v4-ph-row">{purposes[active]?<p className="v4-page-purpose">{purposes[active]}</p>:<span/>}<div className="v4-page-controls" id="v4-page-controls">{filters}</div></div>
   </div>}
   <div className="v4-content"><AvatarStyleProvider><FiltersSlot.Provider value={active==="overview"?filters:null}>{children}</FiltersSlot.Provider></AvatarStyleProvider></div>
   {/* the avatar style, off the main UI until the faces are settled
      (20 Oct 2026, Chandu: "let the picker be there but somewhere off the
      main ui. and very subtle"): one small line in the footer, every page */}
   <footer className="v4-workspace-footer"><span>Dreamari</span><span className="v4-footer-avatar"><span aria-hidden>Faces</span><AvatarStylePicker subtle/></span></footer>
  </main>
 </div>;
}
