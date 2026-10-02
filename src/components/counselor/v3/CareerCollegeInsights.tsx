"use client";

// DEMO-ONLY v2 fork of ../CareerCollegeInsights.tsx (24 Sept 2026). v1 stays untouched so the
// two builds can be compared live via the bottom-center version chip
// (../version.tsx). Changes from the 24 Sept audit land here.

// 25 Sept 2026 pass under the v2 budget: recommendations are one stat and
// one action each; the four ranked lists are always bars (the Chart / List
// toggle only hid the bar), with no lede restating the title and no
// decorative emoji; the career-fair note is one line plus its chips. Data
// is the reference's, verbatim.

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Lightbulb, Megaphone, PenLine, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { Go } from "../chips";
import { HoverBeam } from "@/components/app/HoverBeam";
import { DrillPanel, DrillTile, type Drill } from "./Drill";
import { Ring, Segmented } from "@/components/connect/viz";
import { PRIMARY } from "../palette";
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
  { pct: 29, count: 35, pathway: "Health & Medicine", subject: "exploring nursing and healthcare", actions: ["Partner with a clinic for job shadows", "Explore CTE Health Sciences pathway options in your district", "Invite a panel of nurses, doctors, and allied health professionals"] },
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
export function RankedBars({ items, limit, all = true }: { items: { name: string; count: number }[]; /** rows to draw; the rest are cut */ limit?: number; /** false: rows past SHOWN hide below lg until "Show all" */ all?: boolean }) {
  const reduce = useReducedMotion();
  const rows = limit ? items.slice(0, limit) : items;
  const max = Math.ceil(Math.max(...items.map((i) => i.count)) / 10) * 10;
  return (
    <ol className="flex flex-col gap-[12px]">
      {rows.map((item, i) => {
        const lead = i === 0;
        const strength = lead ? 100 : Math.max(38, 78 - i * 6);
        return (
          // Keyed by rank so a lens switch morphs each bar in place.
          <li key={i} className={`flex-col gap-[6px] ${all || i < SHOWN ? "flex" : "hidden lg:flex"}`}>
            <span className="flex items-baseline justify-between gap-[12px] text-[13px]">
              <span className="flex min-w-0 items-baseline gap-[10px]">
                <span className="w-[16px] flex-none text-right text-[12px] font-bold tabular-nums" style={{ color: lead ? "var(--primary)" : "var(--muted-foreground)" }}>{i + 1}</span>
                <motion.span initial={reduce ? false : { opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: reduce ? 0 : i * 0.03 }} className="truncate font-semibold" style={{ color: "var(--foreground)" }}>{item.name}</motion.span>
              </span>
              <span className="flex-none font-bold tabular-nums" style={{ color: "var(--foreground)" }}>{item.count}</span>
            </span>
            <span className="relative ml-[26px] block h-[8px] rounded-full" style={{ background: "color-mix(in srgb, var(--foreground) 7%, transparent)" }} aria-hidden>
              <motion.span
                className="absolute inset-y-0 left-0 rounded-full"
                initial={reduce ? false : { width: "0%" }}
                animate={{ width: `${(item.count / max) * 100}%` }}
                transition={{ ...MORPH, delay: reduce ? 0 : i * 0.03 }}
                style={{
                  background: `linear-gradient(90deg, color-mix(in srgb, var(--primary) ${Math.round(strength * 0.4)}%, transparent), color-mix(in srgb, var(--primary) ${strength}%, transparent))`,
                  boxShadow: lead ? "0 0 10px color-mix(in srgb, var(--primary) 55%, transparent)" : undefined,
                }}
              />
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export { TOP_SAVED_CAREERS };

// Top five, one number each, a slim bar for the ranking, and the rest one
// click away (27 Sept 2026: a ten-row list with a rank badge and two numbers
// per row "is even more difficult to process than before"). "Show all 10"
// opens the rest in place.
// 2 Oct 2026 redundancy pass: the two top-10 cards (same chart, same
// "students who saved it" caption twice) are ONE card with a Careers /
// Colleges lens; switching morphs each bar to its new length (bars keyed
// by rank), the motion the user liked. Ranked bars stay the mark: a top-10
// of long names (UCLA's full name) is a ranking, not a share of a whole
// (students save several), and columns would truncate every label.
const SAVED_LENSES = {
  careers: { label: "Careers", items: TOP_SAVED_CAREERS },
  colleges: { label: "Colleges", items: TOP_COLLEGES.map(({ name, count }) => ({ name, count })) },
} as const;
function TopSaved() {
  const [lens, setLens] = useState<keyof typeof SAVED_LENSES>("careers");
  const [hover, setHover] = useState<number | null>(null);
  const reduce = useReducedMotion();
  const items = SAVED_LENSES[lens].items;
  const max = Math.ceil(Math.max(...items.map((i) => i.count)) / 10) * 10;
  // One hue, stepped by rank: the leader is the strongest blue, so rank
  // reads from color as well as height.
  const shade = (i: number) => `color-mix(in srgb, var(--primary) ${Math.round(100 - i * 6.5)}%, transparent)`;
  const dim = (i: number) => (hover !== null && hover !== i ? 0.35 : 1);
  return (
    <HoverBeam strength={0.6} className="h-full">
      <div className="flex h-full flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
        <div className="flex flex-wrap items-center justify-between gap-[8px]">
          <h2 className="text-[15px] font-bold" style={{ color: "var(--foreground)" }}>Top 10 saved</h2>
          <Segmented ariaLabel="Top 10 saved" value={lens} onChange={(k) => setLens(k)} options={(Object.keys(SAVED_LENSES) as (keyof typeof SAVED_LENSES)[]).map((k) => ({ key: k, label: SAVED_LENSES[k].label }))} />
        </div>
        {/* One chart for all ten, the names in a legend under it (2 Oct 2026,
           direct feedback: "the top 10. can we one graph with legends
           right?"). Ten title-and-bar rows became ten columns, numbered by
           rank, so the long names live in the legend instead of under the
           bars. Hovering a column or a legend entry lights the pair. Bars
           are keyed by rank, so switching lens morphs each one. */}
        <div className="flex h-[200px] items-end gap-[6px] sm:gap-[10px]" role="img" aria-label={items.map((it, i) => `${i + 1}. ${it.name}: ${it.count}`).join(", ")} onMouseLeave={() => setHover(null)}>
          {items.map((it, i) => (
            <span key={i} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-[6px]" onMouseEnter={() => setHover(i)} style={{ opacity: dim(i), transition: "opacity 150ms" }}>
              <span className="text-[12px] font-bold tabular-nums" style={{ color: "var(--foreground)" }}>{it.count}</span>
              <motion.span className="w-full max-w-[36px] rounded-t-[8px]" initial={reduce ? false : { height: "0%" }} animate={{ height: `${(it.count / max) * 78}%` }} transition={{ ...MORPH, delay: reduce ? 0 : i * 0.03 }} style={{ background: `linear-gradient(180deg, ${shade(i)}, color-mix(in srgb, var(--primary) ${Math.round((100 - i * 6.5) * 0.35)}%, transparent))`, boxShadow: i === 0 ? "0 0 10px color-mix(in srgb, var(--primary) 45%, transparent)" : undefined }} />
              <span className="text-[11.5px] font-bold tabular-nums" style={{ color: i === 0 ? "var(--primary)" : "var(--muted-foreground)" }}>{i + 1}</span>
            </span>
          ))}
        </div>
        <ol className="grid grid-cols-1 gap-x-[var(--space-5)] gap-y-[6px] border-t pt-[var(--space-3)] sm:grid-flow-col sm:grid-cols-2 sm:grid-rows-5" style={{ borderColor: "var(--glass-border)" }} onMouseLeave={() => setHover(null)}>
          {items.map((it, i) => (
            <li key={i} onMouseEnter={() => setHover(i)} className="flex min-w-0 items-center gap-[8px] text-[12.5px] font-semibold" style={{ color: hover === i ? "var(--foreground)" : "var(--muted-foreground)", transition: "color 150ms" }}>
              <span aria-hidden className="size-[9px] flex-none rounded-full" style={{ background: shade(i) }} />
              <span className="w-[16px] flex-none text-right tabular-nums">{i + 1}</span>
              <span className="truncate" style={{ color: "var(--foreground)" }}>{it.name}</span>
            </li>
          ))}
        </ol>
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
      // Computed, not a hard-coded "of 120" (2 Oct 2026 redundancy pass).
      subtitle: `${r.count} of ${roster.length} students`,
      items: r.actions,
      itemsLabel: "Ideas",
      students: list.map((st) => ({ id: st.id, name: st.name, grade: st.grade, avatarIndex: st.avatarIndex, note: st.careerTrack })),
      studentsLabel: `${list.length} students in ${r.pathway}`,
      action: { label: `Message the ${r.pathway} students`, onClick: () => { setDrill(null); router.push(`/counselor?view=connect&compose=1&pathway=${encodeURIComponent(r.pathway ?? "")}`); } },
    };
  };
  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      {/* What students saved, first: the two top-10 lists side by side,
         then the recommendations they lead to, full width underneath
         (27 Sept 2026, Maisha: "have top 10 saved careers + top 10 saved
         colleges at the top. Below that have 'Dreamari recommendations for
         you' like the replit. Side by side doesn't make sense"). The 26
         Sept layout put the recommendations beside one tabbed chart, which
         read as two unrelated columns. */}
      <TopSaved />

      <HoverBeam strength={0.7} className="h-full">
        <div className="relative overflow-hidden rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={GLASS_CARD_HERO}>
          <span aria-hidden className="pointer-events-none absolute inset-0" style={{ background: glowBackdrop("var(--primary)", 0.24) }} />
          <div className="relative flex flex-col gap-[var(--space-4)]">
            <div className="flex flex-wrap items-center justify-between gap-[8px]">
              <h2 className="flex items-center gap-[8px] text-[15px] font-bold" style={{ color: "var(--foreground)" }}>
                <Lightbulb className="h-[15px] w-[15px]" aria-hidden style={{ color: "var(--primary)" }} /> Dreamari recommendations for you
              </h2>
              {!adding && (
                <button type="button" onClick={() => setAdding(true)} className="flex cursor-pointer items-center gap-[4px] rounded-full border px-[11px] py-[5px] text-[12.5px] font-bold" style={{ color: "var(--foreground)", borderColor: "var(--glass-border)", background: "color-mix(in srgb, var(--foreground) 5%, transparent)" }}>
                  <PenLine className="h-[13px] w-[13px]" aria-hidden /> Add your own
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
               they did, and the one idea to try first (27 Sept 2026: "we
               can simplify the dreamari recommendation cards too. Make it
               much more beautiful and much easier to scan"). The other
               ideas, the students behind the number and a way to message
               them open in the card's drill. */}
            <div className="grid grid-cols-1 gap-[var(--space-3)] md:grid-cols-3">
              {tiles.map((r) => r.mine ? (
                <div key={r.subject} className="relative flex flex-col gap-[6px] rounded-[var(--radius-md)] border p-[var(--space-4)]" style={{ borderColor: "var(--inset-border)", background: "var(--inset-bg)" }}>
                  <span className="text-[11px] font-bold tracking-[0.04em] uppercase" style={{ color: "var(--muted-foreground)" }}>Your note</span>
                  <button type="button" aria-label="Remove" onClick={() => setTiles((t) => t.filter((x) => x !== r))} className="dm-quiet absolute top-[8px] right-[8px] flex size-6 cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}><X className="h-[13px] w-[13px]" aria-hidden /></button>
                  <span className="text-[14px] font-bold" style={{ color: "var(--foreground)" }}>{r.subject}</span>
                  <span className="text-[12.5px] leading-[18px]" style={{ color: "var(--muted-foreground)" }}>{r.actions[0]}</span>
                </div>
              ) : (
                <DrillTile key={r.subject} onOpen={() => setDrill(recDrill(r))} label={r.subject} className="h-full gap-[10px] rounded-[var(--radius-md)] border p-[var(--space-4)]" style={{ borderColor: "var(--inset-border)", background: "var(--inset-bg)" }}>
                  {/* 2 Oct 2026 redundancy pass: a share of the caseload is
                     progress to 100%, so a Ring, not a 34px number plus
                     "of students". The "N more ideas · the students" line
                     and the "Try first" label are cut; the drill (arrow on
                     hover) holds every idea and the students. */}
                  <span className="flex items-center gap-[12px]">
                    <Ring pct={r.pct ?? 0} size={56} stroke={6} accent={PRIMARY}>
                      <span className="text-[14px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{r.pct}%</span>
                    </Ring>
                    <span className="text-[14px] leading-[19px] font-bold" style={{ color: "var(--foreground)" }}>{r.subject.charAt(0).toUpperCase() + r.subject.slice(1)}</span>
                  </span>
                  <span className="pr-[20px] text-[12.5px] leading-[18px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{r.actions[0]}</span>
                </DrillTile>
              ))}
            </div>
          </div>
        </div>
      </HoverBeam>

      {/* The reference's career-fair note, its own card under the
         recommendations. Each interest is a real action: how many students
         are in that pathway, and a click opens a Counselor Connect
         announcement already addressed to them (Group message folded into
         Connect, 27 Sept 2026). */}
      <HoverBeam strength={0.6} className="h-full">
        <div className="flex flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
          {/* 2 Oct 2026 redundancy pass: the full-sentence title and the
             subtitle that restated it are one short heading. */}
          <h2 className="text-[15px] font-bold" style={{ color: "var(--foreground)" }}>Career fair</h2>
          <ul className="grid grid-cols-1 gap-[8px] sm:grid-cols-2 xl:grid-cols-4">
            {FAIR_CLUSTERS.map((c) => {
              const n = roster.filter((st) => st.careerTrack === c.pathway).length;
              return (
                <li key={c.label}>
                  <button type="button" onClick={() => router.push(`/counselor?view=connect&compose=1&pathway=${encodeURIComponent(c.pathway)}`)} className="dm-quiet group flex w-full cursor-pointer items-center gap-[10px] rounded-[var(--radius-md)] border px-[12px] py-[10px] text-left" style={{ borderColor: "var(--inset-border)", background: "var(--inset-bg)" }}>
                    <span className="flex size-[26px] flex-none items-center justify-center rounded-[7px]" style={{ background: "color-mix(in srgb, var(--primary) 16%, transparent)", color: "var(--primary)" }}><Megaphone className="h-[13px] w-[13px]" aria-hidden /></span>
                    <span className="flex min-w-0 flex-1 flex-col leading-tight">
                      <span className="truncate text-[12.5px] font-bold" style={{ color: "var(--foreground)" }}>{c.label}</span>
                      <span className="text-[11.5px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{n} student{n === 1 ? "" : "s"}</span>
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
