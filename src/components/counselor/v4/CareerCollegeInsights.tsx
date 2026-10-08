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

// 9 Oct 2026, Maisha's Insights consolidation (College & Career): the
// poster cards stay and gain a Schools view that mirrors them (Careers |
// Schools, "College" renamed to Schools as the student app says it); each
// card opens the students it counts; "Turn Interest Into Opportunity" is
// now "From Interest to Experience"; "Build My Outreach List" is gone as a
// section, since every number now opens its students with Message All.
// Everything reads the Insights filters (insightsScope.tsx).

import { Dreamy, WORLD_ART } from "./InsightCharts";
import { Segmented } from "./viz";
import { RankedPosterCard } from "@/components/app/PosterCard";
import { openCareer, openSchool } from "../v5/ExploreSheets";
import { RankedSchoolPoster } from "../v5/ExploreCards";
import { schoolStudents } from "../v5/exploreData";
import { COLLEGES, collegeImage, type College } from "@/components/colleges/data";
import { careerById, toV5 } from "@/lib/counselorV5";
import type { CounselorStudent } from "@/lib/counselorRoster";
import type { ProfileCareer } from "@/components/profile/data";
import "./insights.css";
import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { PenLine, Plus, X } from "lucide-react";
import { HoverBeam } from "@/components/app/HoverBeam";
import { IconTip } from "@/components/app/IconTip";
import { DrillTile } from "./Drill";
import { ShowAll } from "./Disclosure";
import { InsightStudentsPanel, type StudentsDrill } from "./InsightStudents";
import { doneBy, useInsightsScope } from "./insightsScope";
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

type Tile = { pct: number | null; count?: number; pathway?: string; subject: string; actions: string[]; mine?: boolean };
/** The poster for a recommendation's career world (entrepreneurs get their own). */
const artFor = (r: Tile) => r.subject.includes("entrepreneurs") ? WORLD_ART["Entrepreneurship"] : r.pathway ? WORLD_ART[r.pathway] : undefined;


// The recommendations' headlines, by pathway (they were inline before).
const IDEA_TITLE = (r: Tile) => r.pathway === "Health & Medicine" ? "Open a Door to Healthcare" : r.subject.includes("entrepreneurs") ? "Bring Business to Life" : "Meet the People in Finance";

type Ranked<T> = { item: T; students: CounselorStudent[] };

/** Careers | Schools, the student app's posters (9 Oct 2026, Maisha: "Keep
 *  the visual career cards from V4 ... Build the Schools view to mirror the
 *  Careers view ... school cards using the same visual approach as career
 *  cards and matching how schools look in the student app").
 *
 *  The titles say exactly what the number counts ("the language must match
 *  exactly what the number represents; check the data source"):
 *  - Careers count SAVES: each student's saved careers (counselorV5.ts
 *    toV5().dreamari.saved, the same list v5 Explore's career sheet reads),
 *    so "Most Saved Careers".
 *  - Schools count students LOOKING AT a school (exploreData.ts
 *    schoolStudents, v5 Explore's "Your Students Are Looking At"), not saves,
 *    so "Top Schools Students Are Exploring".
 *  The Replit's own ten colleges (UCLA, Howard, NYU ...) are not in the
 *  student app's school catalog, so no student could save or open them; the
 *  cards are the catalog's own schools, photo and all, as students see them.
 *  A card opens the students it counts; the sheet with the career's or
 *  school's details is one more click from there. */
function InterestPosters() {
  const scope = useInsightsScope();
  const { roster, all, back, scopeLabel, year } = scope;
  const [mode, setMode] = useState<"careers" | "schools">("careers");
  const [drill, setDrill] = useState<StudentsDrill | null>(null);
  const when = back === 0 ? "" : ` · end of ${year.label}`;
  const sub = (s: string) => [s, scopeLabel].filter(Boolean).join(" · ") + when;

  const careers = useMemo(() => {
    const m = new Map<string, Ranked<ProfileCareer>>();
    for (const s of roster) {
      for (const id of toV5(s).dreamari.saved) {
        const c = careerById(id);
        if (!c || !doneBy(s, `save:${id}`, back)) continue;
        const hit = m.get(id) ?? { item: c, students: [] };
        hit.students.push(s);
        m.set(id, hit);
      }
    }
    return [...m.values()].sort((a, b) => b.students.length - a.students.length || a.item.title.localeCompare(b.item.title)).slice(0, 10);
  }, [roster, back]);

  // Who is looking at a school is seeded over the whole caseload (v5's own
  // rule), then narrowed to the filtered students, so a filter never changes
  // which students look at which school, only how many of them show.
  const schools = useMemo(() => {
    const ids = new Set(roster.map((s) => s.id));
    return COLLEGES.filter((c) => collegeImage(c))
      .map((c) => ({ item: c, students: schoolStudents(c, all).filter((s) => ids.has(s.id) && doneBy(s, `school:${c.slug}`, back)) }))
      .filter((x) => x.students.length > 0)
      .sort((a, b) => b.students.length - a.students.length || a.item.name.localeCompare(b.item.name))
      .slice(0, 10);
  }, [roster, all, back]);

  const careerRow = careers.map((c) => c.item);
  const schoolRow: College[] = schools.map((c) => c.item);
  const n = (k: number) => `${k} ${k === 1 ? "student" : "students"}`;
  const openCareerStudents = ({ item, students }: Ranked<ProfileCareer>) => setDrill({
    title: item.title,
    subtitle: sub(`${n(students.length)} saved it`),
    students: students.map((s) => ({ s, note: s.careerTrack })),
    extra: { label: "Career details", onClick: () => openCareer(item, careerRow) },
  });
  const openSchoolStudents = ({ item, students }: Ranked<College>) => setDrill({
    title: item.name,
    subtitle: sub(`${n(students.length)} exploring it`),
    students: students.map((s) => ({ s, note: s.postsecondaryIntent === "Undecided" ? "No plan yet" : s.postsecondaryIntent })),
    extra: { label: "School details", onClick: () => openSchool(item, schoolRow) },
  });
  const empty = mode === "careers" ? careers.length === 0 : schools.length === 0;

  return (
    <section className="v4-interest-explorer v4-interest-posters">
      <header>
        <div className="flex min-w-0 flex-col gap-[2px]">
          <h2 className="v4-posters-title">{mode === "careers" ? "Most Saved Careers" : "Top Schools Students Are Exploring"}</h2>
          <span className="v4-section-sub">{mode === "careers" ? "Students can save more than one. Select a card to see who saved it." : "Juniors and seniors looking at each school. Select a card to see who."}</span>
        </div>
        <Segmented ariaLabel="Careers or schools" value={mode} onChange={setMode} options={[{ key: "careers", label: "Careers" }, { key: "schools", label: "Schools" }]} />
      </header>
      {empty ? (
        <p className="v4-filter-empty px-[var(--space-5)] py-[var(--space-5)]">{mode === "careers" ? `No saved careers for ${scope.who} yet.` : `No one in ${scope.who} is looking at schools yet. Juniors and seniors start this step.`}</p>
      ) : (
        <div className="poster-row flow-scroll flex gap-[var(--space-5)] overflow-x-auto px-[var(--space-5)] py-[var(--space-4)]">
          {mode === "careers"
            ? careers.map((c, i) => <div key={c.item.id} className="relative flex-none"><RankedPosterCard career={c.item} rank={i + 1} chip={`${c.students.length} saved`} onClick={() => openCareerStudents(c)} /></div>)
            : schools.map((c, i) => <RankedSchoolPoster key={c.item.slug} c={c.item} rank={i + 1} chip={n(c.students.length)} onClick={() => openSchoolStudents(c)} />)}
        </div>
      )}
      <InsightStudentsPanel drill={drill} onClose={() => setDrill(null)} />
    </section>
  );
}

export function CareerCollegeInsights() {
  const { roster, scopeLabel } = useInsightsScope();
  // The three tiles are Dreamari's suggestions; a counselor can add their
  // own (direct instruction, 25 Sept 2026: a manual option wherever
  // something is AI generated). Session state until a backend stores it.
  const [tiles, setTiles] = useState<Tile[]>(() => RECOMMENDATION_TILES.map((t) => ({ ...t })));
  const [adding, setAdding] = useState(false);
  const [subject, setSubject] = useState("");
  const [action, setAction] = useState("");
  const field = { background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" } as const;
  const [drill, setDrill] = useState<StudentsDrill | null>(null);
  // An idea's drill: every idea, and the filtered students exploring the
  // field it is about, the same count Top Career Fields shows for it (the
  // Replit's "43% saved Investment Banker" figures counted a different list
  // than the one shown, so the drill now names the list it shows).
  const recDrill = (r: Tile): StudentsDrill => {
    const list = roster.filter((st) => st.careerTrack === r.pathway);
    return {
      title: IDEA_TITLE(r),
      subtitle: [`${list.length} ${list.length === 1 ? "student" : "students"} exploring ${r.pathway}`, scopeLabel].filter(Boolean).join(" · "),
      items: r.actions,
      itemsLabel: "Ideas",
      students: list.map((st) => ({ s: st, note: st.postsecondaryIntent === "Undecided" ? "No plan yet" : st.postsecondaryIntent })),
    };
  };
  return (
    <div className="v4-page v4-insights flex flex-col gap-[var(--space-5)]">
      <InterestPosters />
      <HoverBeam strength={0.7} className="h-full">
        <div className="v4-recommendations v4-surface relative overflow-hidden rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={GLASS_CARD_HERO}>
          <span aria-hidden className="pointer-events-none absolute inset-0" style={{ background: glowBackdrop("var(--primary)", 0.24) }} />
          <div className="relative flex flex-col gap-[var(--space-4)]">
            <div className="flex flex-wrap items-center justify-between gap-[8px]">
              {/* Dreamy with an idea beside the recommendations (Maisha's v4
                 review, 7 Oct 2026). Renamed 9 Oct 2026, Maisha: "Rename
                 'Turn Interest Into Opportunity' to 'From Interest to
                 Experience'." */}
              <h2 className="v4-idea-title flex items-center gap-[10px] text-[15px] font-bold" style={{ color: "var(--foreground)" }}>
                <Dreamy mood="idea" size={52} /> From Interest to Experience
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
            {/* Each idea reads in two seconds: its field, a headline and the
               one idea to try first, as flat columns (2 Oct 2026). The other
               ideas and the students exploring the field open in its drill. */}
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
                    {artFor(r)&&<span aria-hidden="true" className="v4-opportunity-wash" style={{ backgroundImage: `url(${artFor(r)})` }}/>}
                    <DrillTile onOpen={() => setDrill(recDrill(r))} label={IDEA_TITLE(r)} className="h-full gap-[8px] rounded-[var(--radius-sm)]" style={{}}>
                      <span className="v4-overline">{r.pathway}</span>
                      <span className="text-[14px] leading-[19px] font-bold" style={{ color: "var(--foreground)" }}>{IDEA_TITLE(r)}</span>
                      <span className="pr-[20px] text-[12.5px] leading-[18px]" style={{ color: "var(--muted-foreground)" }}>{r.actions[0]}</span>
                    </DrillTile>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </HoverBeam>
      {/* "Remove 'Build My Outreach List' as a standalone section" (Maisha,
         9 Oct 2026): every field, card and idea above now opens its students
         with Message All, which is what that list did. */}
      <InsightStudentsPanel drill={drill} onClose={() => setDrill(null)} />
    </div>
  );
}
