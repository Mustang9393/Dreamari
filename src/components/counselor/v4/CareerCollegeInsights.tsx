"use client";

// DEMO-ONLY v2 fork of ../CareerCollegeInsights.tsx (24 Sept 2026). v1 stays untouched so the
// two builds can be compared live via the bottom-center version chip
// (../version.tsx). Changes from the 24 Sept audit land here.

// 25 Sept 2026 pass under the v2 budget: recommendations are one stat and
// one action each; the four ranked lists are always bars (the Chart / List
// toggle only hid the bar), with no lede restating the title and no
// decorative emoji; the career-fair note is one line plus its chips. Data
// is the reference's, verbatim.

// Decluttered 2 Oct 2026, to Maisha's Replit (its recommendations are plain
// bullets in one banner). WHY: the user compared this screen with the
// Replit and found ours "so dense and hard to read". The audit: each
// recommendation was a bordered tile inside the section card with a big
// percent, a TRY FIRST chip, a caption ("2 more ideas") and a rule; the
// career-fair card held four more bordered tiles with icon boxes. Now:
//   - Recommendations are three flat columns in the one card, split by
//     hairlines: the share, what students did, the first idea. No tiles, no
//     chips, no captions. The other two ideas, the students behind the
//     number and the message to them are all still in the column's drill.
//   - The career-fair card is a title and one flat row of four pathway
//     links (name, student count), no boxes and no icon tiles.
//   - Add your own stays the only button in the banner; a note you add is
//     a column like the rest.
// Design budget (v2): blue plus status colors, glow only on the one hero
// card, gradient bars.

import { ArtThumb, CAREER_ART, Dreamy, InterestExplorer, WORLD_ART } from "./InsightCharts";
import { RankedPosterCard } from "@/components/app/PosterCard";
import { ALL_CATALOG_CAREERS, type CatalogCareer } from "@/components/app/catalog";
import { openCareer } from "../v5/ExploreSheets";
import "./insights.css";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { PenLine, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { Go } from "./chips";
import { HoverBeam } from "@/components/app/HoverBeam";
import { IconTip } from "@/components/app/IconTip";
import { DrillPanel, DrillTile, type Drill } from "./Drill";
import { ShowAll } from "./Disclosure";
import { GLASS_CARD as TINTED_CARD, GLASS_CARD_HERO, glowBackdrop } from "../surfaces";

// Each recommendation as a number, a subject and its actions -- the
// reference gave each stat three bullet actions and an emoji, twelve
// lines of advice on every visit (direct feedback, 25 Sept 2026: "too
// text heavy. How can we simplify without losing value?"). The first
// action is always visible; the other two are a click away ("+N more"),
// not deleted -- Maisha, 25 Sept 2026: "don't adjust the content itself
// too much, that's important... open to you making it visually look
// better as long as content and comprehension isn't reduced."
const RECOMMENDATION_TILES = [
  { pct: 43, count: 52, pathway: "Business & Finance", subject: "saved Investment Banker", actions: ["Invite a banking professional for a career talk", "Schedule a visit to a financial district campus, trading floor, or investment firm", "Explore a CTE Finance & Business pathway or dual-enrollment finance course"] },
  { pct: 32, count: 38, pathway: "Business & Finance", subject: "want to be entrepreneurs", actions: ["Host a local business-owner speaker series", "Connect students to DECA, FBLA, or local small business incubators", "Introduce a pitch competition or school-based enterprise activity"] },
  { pct: 29, count: 35, pathway: "Health & Medicine", subject: "exploring nursing and healthcare", actions: ["Partner with a clinic for job shadows", "Explore CTE Health Sciences pathway options in my district", "Invite a panel of nurses, doctors, and allied health professionals"] },
];

const TOP_SAVED_CAREERS = [
  { name: "Investment Banker", count: 52 }, { name: "Software Engineer", count: 47 }, { name: "Entrepreneur / Business Owner", count: 38 },
  { name: "Registered Nurse", count: 35 }, { name: "Psychologist", count: 31 }, { name: "Marketing Manager", count: 24 },
  { name: "Physician / Doctor", count: 22 }, { name: "Graphic Designer", count: 19 }, { name: "Electrician / Skilled Trade", count: 17 }, { name: "Teacher / Educator", count: 15 },
];
const TOP_COLLEGES = [
  { emoji: "🏫", name: "University of California, Los Angeles (UCLA)", count: 28 }, { emoji: "🏛️", name: "Howard University", count: 24 },
  { emoji: "🗽", name: "New York University (NYU)", count: 22 }, { emoji: "🤘", name: "University of Texas at Austin", count: 19 },
  { emoji: "🌸", name: "Spelman College", count: 17 }, { emoji: "☀️", name: "Arizona State University", count: 16 },
  { emoji: "🌲", name: "Stanford University", count: 14 }, { emoji: "🟠", name: "Florida A&M University", count: 13 },
  { emoji: "💚", name: "Michigan State University", count: 12 }, { emoji: "🦅", name: "Georgia State University", count: 11 },
];

// The four ranked lists as ONE chart with four lenses (26 Sept 2026,
// direct feedback: "this page has the most ugliest bunch of graphs" and
// "seem like reports"). Four identical cards of fat blue bars were forty
// bars on one screen asking the same question four ways; one card with
// sub-tabs asks it once, and switching lens morphs each bar to its new
// length (bars keyed by rank, not name), the reference-style motion the
// user asked for ("i love how when i switch tabs the graphs animate into
// the next"). Brightness follows rank so the leader reads first without a
// second color. All ten per list stay one click away (Show all).
// Only what students can actually save in this version of the app: careers
// and colleges (27 Sept 2026, Maisha: "lets remove simulations and majors.
// They should only be able to see top 10 saved careers and colleges since
// at the current version of the app, those two are the main things
// students can save"). The reference's simulations and majors lists live on
// in v1's own copy of this screen.
const MORPH = { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const };
const SHOWN = 5;

/** A ranked list drawn as bars: rank, name, count, one bar per row, the
 *  leader lit. Shared with the Overview's Career Pathways snapshot so the
 *  snapshot and the full list read as the same chart. */
export function RankedBars({ items, limit, all = true, unit = "students" }: { items: { name: string; count: number }[]; unit?: string; /** rows to draw; the rest are cut */ limit?: number; /** false: rows past SHOWN hide below lg until "Show all" */ all?: boolean }) {
  const reduce = useReducedMotion();
  const rows = limit ? items.slice(0, limit) : items;
  const max = Math.ceil(Math.max(...items.map((i) => i.count)) / 10) * 10;
  return (
    <ol className="v4-ranked-tracks">
      {rows.map((item, i) => <li key={item.name} className={all || i < SHOWN ? "" : "hidden lg:block"}>
        <div className="v4-rank-label"><span className="v4-rank-index">{String(i + 1).padStart(2, "0")}</span><span>{item.name}</span><strong>{item.count}</strong></div>
        <div className="v4-rank-track" aria-hidden="true"><motion.div initial={reduce ? false : {width: "0%"}} animate={{width: `${max ? item.count / max * 100 : 0}%`}} transition={reduce ? {duration:0} : MORPH} style={{background: `var(--v4-cat-${i % 6 + 1})`}}/><i style={{left:"25%"}}/><i style={{left:"50%"}}/><i style={{left:"75%"}}/></div>
      </li>)}
      <li className="v4-rank-scale" aria-hidden="true"><span>0</span><span>{max / 2}</span><span>{max} {unit}</span></li>
    </ol>
  );
}

export { TOP_SAVED_CAREERS };

// TOP_SAVED_CAREERS as student-app posters: the catalog career whose title
// starts the same way ("Electrician / Skilled Trade" → Electrician), else
// the poster art InsightCharts already maps.
// the v4 sample's names that the catalog spells differently
const ALIAS: Record<string, string> = { "investment banker": "investment banking", physician: "family doctor", teacher: "elementary school teacher" };
const RANKED: CatalogCareer[] = TOP_SAVED_CAREERS.map(({ name }) => {
  const raw = name.split(" /")[0].toLowerCase();
  const head = ALIAS[raw] ?? raw;
  const hit = ALL_CATALOG_CAREERS.find((c) => c.title.toLowerCase() === head) ?? ALL_CATALOG_CAREERS.find((c) => c.title.toLowerCase().startsWith(head));
  return hit ?? { title: name.split(" /")[0], world: "Business & Finance", photo: CAREER_ART[name] ?? "/images/app/poster-entrepreneur.webp" };
});

// the sheet's "saved it" count matches the chip on the poster
const SAVES = Object.fromEntries(RANKED.map((c, i) => [c.title, TOP_SAVED_CAREERS[i].count]));

// Top five, one number each, a slim bar for the ranking, and the rest one
// click away (27 Sept 2026: a ten-row list with a rank badge and two numbers
// per row "is even more difficult to process than before"). Five rows read
// at a glance; the bar lets the eye rank them without reading the numbers;
// the count is the only figure. "Show all 10" opens the rest in place.
export function TopTen({ title, items }: { title: string; items: { name: string; count: number }[] }) {
  const [all, setAll] = useState(false);
  return (
    <HoverBeam strength={0.6} className="h-full">
      <div className="v4-surface flex h-full flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
        <div className="flex flex-wrap items-baseline justify-between gap-[8px]">
          <h2 className="text-[15px] font-bold" style={{ color: "var(--foreground)" }}>{title}</h2>
          <span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>students who saved it</span>
        </div>
        <RankedBars items={items} limit={all ? items.length : 5} />
        <ShowAll total={items.length} shown={5} open={all} onToggle={() => setAll((v) => !v)} />
      </div>
    </HoverBeam>
  );
}
const FAIR_CLUSTERS = [
  { label: "Technology & Engineering", pathway: "Tech & Engineering" },
  { label: "Business & Entrepreneurship", pathway: "Business & Finance" },
  { label: "Healthcare & Nursing", pathway: "Health & Medicine" },
  { label: "Law & Criminal Justice", pathway: "Law, Safety & Justice" },
];

type Tile = { pct: number | null; count?: number; pathway?: string; subject: string; actions: string[]; mine?: boolean };
/** The poster for a recommendation's career world (entrepreneurs get their own). */
const artFor = (r: Tile) => r.subject.includes("entrepreneurs") ? WORLD_ART["Entrepreneurship"] : r.pathway ? WORLD_ART[r.pathway] : undefined;

export function CareerCollegeInsights() {
  const roster = useReviewedRoster();
  const router = useRouter();
  // The three tiles are Dreamari's suggestions; a counselor can add their
  // own (direct instruction, 25 Sept 2026: a manual option wherever
  // something is AI generated). Session state until a backend stores it.
  const [tiles, setTiles] = useState<Tile[]>(() => RECOMMENDATION_TILES.map((t) => ({ ...t })));
  const [adding, setAdding] = useState(false);
  const [subject, setSubject] = useState("");
  const [action, setAction] = useState("");
  const field = { background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" } as const;
  const [drill, setDrill] = useState<Drill | null>(null);
  // A recommendation's drill: every idea, the students in the pathway it
  // is about, and a message to them.
  const recDrill = (r: Tile): Drill => {
    const list = roster.filter((st) => st.careerTrack === r.pathway);
    return {
      title: `${r.pct}% ${r.subject}`,
      subtitle: `${r.count} students saved it`,
      lead: "The pathway group below is a broader audience for outreach; it is not the exact list of students behind the saved-interest count.",
      items: r.actions,
      itemsLabel: "Ideas",
      students: list.map((st) => ({ id: st.id, name: st.name, grade: st.grade, avatarIndex: st.avatarIndex, note: st.careerTrack })),
      studentsLabel: `${list.length} students in ${r.pathway}`,
      action: { label: `Message the ${r.pathway} students`, onClick: () => { setDrill(null); router.push(`/counselor?view=connect&v=4&compose=1&pathway=${encodeURIComponent(r.pathway ?? "")}`); } },
    };
  };
  return (
    <div className="v4-page v4-insights flex flex-col gap-[var(--space-5)]">
      {/* Careers mode swaps its focus card and ranked list for the student
         app's ranked Top 10 posters (7 Oct 2026: "the new ones should swap
         in where appropriate in v4, not add more rows"); colleges unchanged. */}
      <InterestExplorer careers={TOP_SAVED_CAREERS} colleges={TOP_COLLEGES} careerCards={
        <div className="poster-row -mx-[var(--space-5)] flex gap-[var(--space-5)] overflow-x-auto px-[var(--space-5)] py-[var(--space-3)] [scrollbar-width:none]">
          {RANKED.map((c, i) => (
            <div key={c.title} className="relative flex-none">
              <RankedPosterCard career={c} rank={i + 1} onClick={() => openCareer(c, RANKED, { saves: SAVES })} />
              <span aria-hidden className={`pointer-events-none absolute top-[10px] z-[7] flex flex-col items-center rounded-[var(--radius-md)] px-[10px] py-[4px] ${i + 1 >= 10 ? "left-[128px]" : "left-[55px]"}`} style={{ background: "rgba(8,10,22,0.62)", color: "#fff", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}>
                <span className="text-[17px] leading-[20px] font-semibold tabular-nums" style={{ fontFamily: "var(--font-display)" }}>{TOP_SAVED_CAREERS[i].count}</span>
                <span className="text-[10.5px] leading-[13px] font-semibold">Saved</span>
              </span>
            </div>
          ))}
        </div>
      } />
      <HoverBeam strength={0.7} className="h-full">
        <div className="v4-recommendations v4-surface relative overflow-hidden rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={GLASS_CARD_HERO}>
          <span aria-hidden className="pointer-events-none absolute inset-0" style={{ background: glowBackdrop("var(--primary)", 0.24) }} />
          <div className="relative flex flex-col gap-[var(--space-4)]">
            <div className="flex flex-wrap items-center justify-between gap-[8px]">
              {/* Dreamy with an idea beside the recommendations, in place of the
                 lightbulb icon (Maisha's v4 review, 7 Oct 2026: bring in "the
                 extra kick of excitement" of the student app). It is the one
                 Dreamy on this screen, at the one place that offers ideas. */}
              <h2 className="v4-idea-title flex items-center gap-[10px] text-[15px] font-bold" style={{ color: "var(--foreground)" }}>
                <Dreamy mood="idea" size={52} /> Turn Interest Into Opportunity
              </h2>
              {!adding && (
                <button type="button" onClick={() => setAdding(true)} className="flex cursor-pointer items-center gap-[4px] rounded-full border px-[11px] py-[5px] text-[12.5px] font-bold" style={{ color: "var(--foreground)", borderColor: "var(--glass-border)", background: "color-mix(in srgb, var(--foreground) 5%, transparent)" }}>
                  <PenLine className="h-[13px] w-[13px]" aria-hidden /> Add my own
                </button>
              )}
            </div>
            {adding && (
              <div className="flex flex-col gap-[8px] rounded-[var(--radius-md)] border p-[12px]" style={{ background: "var(--inset-bg)", borderColor: "var(--inset-border)" }}>
                <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="What you noticed (e.g. 12 juniors asked about nursing)" aria-label="What you noticed" className="h-10 rounded-[var(--radius-sm)] border px-[12px] text-[13px] outline-none" style={field} />
                <input value={action} onChange={(e) => setAction(e.target.value)} placeholder="What to do about it" aria-label="Action" className="h-10 rounded-[var(--radius-sm)] border px-[12px] text-[13px] outline-none" style={field} />
                <div className="flex justify-end gap-[8px]">
                  <button type="button" onClick={() => { setAdding(false); setSubject(""); setAction(""); }} className="dm-quiet flex h-9 cursor-pointer items-center rounded-[var(--radius-sm)] border px-[14px] text-[13px] font-semibold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>Cancel</button>
                  <button type="button" disabled={!subject.trim() || !action.trim()} onClick={() => { setTiles((t) => [{ pct: null, subject: subject.trim(), actions: [action.trim()], mine: true }, ...t]); setAdding(false); setSubject(""); setAction(""); }} className="dm-solid bg-[var(--primary)] text-[var(--primary-foreground)] flex h-9 cursor-pointer items-center gap-[6px] rounded-[var(--radius-sm)] px-[14px] text-[13px] font-bold disabled:cursor-not-allowed disabled:opacity-50"><Plus className="h-[14px] w-[14px]" aria-hidden /> Add</button>
                </div>
              </div>
            )}
            {/* Each recommendation reads in two seconds: the share, what
               they did, and the one idea to try first, as flat columns (no
               tiles, chips or captions; 2 Oct 2026). The other ideas, the
               students behind the number and a way to message them open in
               the column's drill. */}
            <div className="v4-opportunity-grid">
              {tiles.map((r) => {
                const col = "border-t py-[var(--space-4)] first:border-t-0 first:pt-0 last:pb-0 md:border-t-0 md:border-l md:px-[var(--space-5)] md:py-0 md:first:border-l-0 md:first:pl-0 md:last:pr-0";
                return r.mine ? (
                  <div key={r.subject} className={`v4-opportunity-note flex min-w-0 flex-col gap-[6px] ${col}`} style={{ borderColor: "var(--glass-border)" }}>
                    <span className="flex items-start justify-between gap-[8px]">
                      <span className="text-[14px] leading-[19px] font-bold" style={{ color: "var(--foreground)" }}>{r.subject}</span>
                      <IconTip label="Remove" className="flex-none"><button type="button" aria-label="Remove" onClick={() => setTiles((t) => t.filter((x) => x !== r))} className="dm-quiet flex size-6 cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}><X className="h-[13px] w-[13px]" aria-hidden /></button></IconTip>
                    </span>
                    <span className="text-[12.5px] leading-[18px]" style={{ color: "var(--muted-foreground)" }}>{r.actions[0]}</span>
                  </div>
                ) : (
                  <div key={r.subject} className={`v4-opportunity-note v4-opportunity-art flex min-w-0 ${col}`} style={{ borderColor: "var(--glass-border)" }}>
                    {/* The student app's own poster for the career world this
                       idea is about, faded like the Career & College focus
                       card ("loves the Explore cards art"). */}
                    {artFor(r)&&<span aria-hidden="true" className="v4-opportunity-wash" style={{ backgroundImage: `url(${artFor(r)})` }}/>}
                    <DrillTile onOpen={() => setDrill(recDrill(r))} label={r.subject} className="h-full gap-[8px] rounded-[var(--radius-sm)]" style={{}}>
                      <span className="v4-overline">{r.pathway}</span>
                      <span className="text-[14px] leading-[19px] font-bold" style={{ color: "var(--foreground)" }}>{r.pathway === "Health & Medicine" ? "Open a Door to Healthcare" : r.subject.includes("entrepreneurs") ? "Bring Business to Life" : "Meet the People in Finance"}</span>
                      <span className="pr-[20px] text-[12.5px] leading-[18px]" style={{ color: "var(--muted-foreground)" }}>{r.actions[0]}</span>
                    </DrillTile>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </HoverBeam>

      {/* The reference's career-fair note: its title and one flat row of
         the four interests. Each is a real action: how many students are in
         that pathway, and a click opens a Counselor Connect announcement
         already addressed to them (Group message folded into Connect, 27
         Sept 2026). */}
      <HoverBeam strength={0.6} className="h-full">
        <div className="v4-surface flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
          <h2 className="text-[15px] font-bold" style={{ color: "var(--foreground)" }}>Build My Outreach List</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
            {FAIR_CLUSTERS.map((c) => {
              const n = roster.filter((st) => st.careerTrack === c.pathway).length;
              return (
                <li key={c.label} className="border-t first:border-t-0 sm:border-t-0 sm:[&:nth-child(n+3)]:border-t xl:[&:nth-child(n+3)]:border-t-0 xl:border-l xl:px-[var(--space-4)] xl:first:border-l-0 xl:first:pl-0 xl:last:pr-0" style={{ borderColor: "var(--glass-border)" }}>
                  <button type="button" onClick={() => router.push(`/counselor?view=connect&v=4&compose=1&pathway=${encodeURIComponent(c.pathway)}`)} className="dm-quiet group flex w-full cursor-pointer items-center justify-between gap-[10px] rounded-[var(--radius-sm)] px-[4px] py-[12px] text-left">
                    {WORLD_ART[c.pathway]&&<ArtThumb src={WORLD_ART[c.pathway]} size={36}/>}
                    <span className="flex min-w-0 flex-1 flex-col leading-tight">
                      <span className="text-[13.5px] font-bold" style={{ color: "var(--foreground)" }}>{c.label}</span>
                      <span className="text-[12px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{n} student{n === 1 ? "" : "s"}</span>
                    </span>
                    <Go />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </HoverBeam>
      <DrillPanel drill={drill} onClose={() => setDrill(null)} />
    </div>
  );
}
