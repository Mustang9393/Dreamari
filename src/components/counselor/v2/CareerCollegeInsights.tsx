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
import { Lightbulb, PenLine, Plus, X } from "lucide-react";
import { HoverBeam } from "@/components/app/HoverBeam";
import { ShowAll } from "./Disclosure";
import { SubTabs } from "./SubTabs";
import { Ring } from "@/components/connect/viz";
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
  { pct: 43, subject: "saved Investment Banker", actions: ["Invite a banking professional for a career talk", "Schedule a visit to a financial district campus, trading floor, or investment firm", "Explore a CTE Finance & Business pathway or dual-enrollment finance course"] },
  { pct: 32, subject: "want to be entrepreneurs", actions: ["Host a local business-owner speaker series", "Connect students to DECA, FBLA, or local small business incubators", "Introduce a pitch competition or school-based enterprise activity"] },
  { pct: 29, subject: "exploring nursing and healthcare", actions: ["Partner with a clinic for job shadows", "Explore CTE Health Sciences pathway options in your district", "Invite a panel of nurses, doctors, and allied health professionals"] },
];

const TOP_SAVED_CAREERS = [
  { name: "Investment Banker", count: 52 }, { name: "Software Engineer", count: 47 }, { name: "Entrepreneur / Business Owner", count: 38 },
  { name: "Registered Nurse", count: 35 }, { name: "Psychologist", count: 31 }, { name: "Marketing Manager", count: 24 },
  { name: "Physician / Doctor", count: 22 }, { name: "Graphic Designer", count: 19 }, { name: "Electrician / Skilled Trade", count: 17 }, { name: "Teacher / Educator", count: 15 },
];
const TOP_SIMULATIONS = [
  { name: "Software Engineer", count: 89 }, { name: "Nurse / Nursing", count: 76 }, { name: "Entrepreneur", count: 68 },
  { name: "Criminal Justice / Law", count: 55 }, { name: "Graphic Designer", count: 52 }, { name: "Teacher / Educator", count: 48 },
  { name: "Investment Banker", count: 45 }, { name: "Physician / Doctor", count: 43 }, { name: "Social Worker", count: 41 }, { name: "Marketing Manager", count: 39 },
];
const TOP_MAJORS = [
  { name: "Computer Science", count: 41 }, { name: "Business Administration", count: 36 }, { name: "Nursing / Health Sciences", count: 33 },
  { name: "Psychology", count: 29 }, { name: "Criminal Justice", count: 24 }, { name: "Communications / Media", count: 22 },
  { name: "Engineering", count: 20 }, { name: "Education", count: 18 }, { name: "Finance", count: 16 }, { name: "Art & Design", count: 14 },
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
type Lens = "careers" | "simulations" | "majors" | "colleges";
const LENSES: { key: Lens; label: string; unit: string; items: { name: string; count: number }[] }[] = [
  { key: "careers", label: "Saved careers", unit: "students saved it", items: TOP_SAVED_CAREERS },
  { key: "simulations", label: "Simulations", unit: "students ran it", items: TOP_SIMULATIONS },
  { key: "majors", label: "Majors", unit: "students saved it", items: TOP_MAJORS },
  { key: "colleges", label: "Colleges", unit: "students saved it", items: TOP_COLLEGES },
];
const MORPH = { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const };
const SHOWN = 5;

function InterestChart() {
  const reduce = useReducedMotion();
  const [lens, setLens] = useState<Lens>("careers");
  const [all, setAll] = useState(false);
  const current = LENSES.find((l) => l.key === lens)!;
  // All ten on a wide screen, where the card stands beside the
  // recommendations and has the height; five plus Show all below that.
  const items = current.items;
  // A shared scale across lenses would flatten the smaller lists; each lens
  // scales to its own leader, rounded up so the top bar never touches the end.
  const max = Math.ceil(Math.max(...current.items.map((i) => i.count)) / 10) * 10;
  return (
    <HoverBeam strength={0.6} className="h-full">
      <div className="flex h-full flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
        <div className="flex flex-wrap items-baseline justify-between gap-[8px]">
          <h2 className="text-[15px] font-bold" style={{ color: "var(--foreground)" }}>What students are into</h2>
          <span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>top {current.items.length} · {current.unit}</span>
        </div>
        <SubTabs ariaLabel="Lens" value={lens} onChange={(k) => setLens(k)} options={LENSES.map((l) => ({ key: l.key, label: l.label }))} />
        <ol className="flex flex-col gap-[12px]">
          {items.map((item, i) => {
            const lead = i === 0;
            // Rank as brightness: the leader at full strength, the rest
            // stepping down to a quiet floor.
            const strength = lead ? 100 : Math.max(38, 78 - i * 6);
            return (
              <li key={i} className={`flex-col gap-[6px] ${all || i < SHOWN ? "flex" : "hidden lg:flex"}`}>
                <span className="flex items-baseline justify-between gap-[12px] text-[13px]">
                  <span className="flex min-w-0 items-baseline gap-[10px]">
                    <span className="w-[16px] flex-none text-right text-[12px] font-bold tabular-nums" style={{ color: lead ? "var(--primary)" : "var(--muted-foreground)" }}>{i + 1}</span>
                    <motion.span key={item.name} initial={reduce ? false : { opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: reduce ? 0 : i * 0.03 }} className="truncate font-semibold" style={{ color: "var(--foreground)" }}>{item.name}</motion.span>
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
        <div className="lg:hidden"><ShowAll total={current.items.length} shown={SHOWN} open={all} onToggle={() => setAll((v) => !v)} /></div>
      </div>
    </HoverBeam>
  );
}

type Tile = { pct: number | null; subject: string; actions: string[]; mine?: boolean };

export function CareerCollegeInsights() {
  // The three tiles are Dreamari's suggestions; a counselor can add their
  // own (direct instruction, 25 Sept 2026: a manual option wherever
  // something is AI generated). Session state until a backend stores it.
  const [tiles, setTiles] = useState<Tile[]>(() => RECOMMENDATION_TILES.map((t) => ({ ...t })));
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [adding, setAdding] = useState(false);
  const [subject, setSubject] = useState("");
  const [action, setAction] = useState("");
  const field = { background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" } as const;
  return (
    // Side by side on a wide screen: what to do (left), what students are
    // into (right), one glance each, instead of a report's long scroll.
    <div className="grid grid-cols-1 items-start gap-[var(--space-4)] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      {/* The screen's hero: what the data suggests doing. One stat, one
         action per column; the reference's two further actions per stat
         were a paragraph each on every visit. */}
      <HoverBeam strength={0.7} className="h-full">
        <div className="relative overflow-hidden rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={GLASS_CARD_HERO}>
          <span aria-hidden className="pointer-events-none absolute inset-0" style={{ background: glowBackdrop("var(--primary)", 0.24) }} />
          <div className="relative flex flex-col gap-[var(--space-4)]">
            <div className="flex flex-wrap items-center justify-between gap-[8px]">
              <h2 className="flex items-center gap-[8px] text-[15px] font-bold" style={{ color: "var(--foreground)" }}>
                <Lightbulb className="h-[15px] w-[15px]" aria-hidden style={{ color: "var(--primary)" }} /> Recommended this semester
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
            <div className="grid grid-cols-1 gap-[var(--space-3)] sm:grid-cols-3 lg:grid-cols-1">
              {/* One left edge for all three lines (direct feedback: the
                 number and its text "read like two different anchors"). */}
              {tiles.map((r) => (
                <div key={r.subject} className="relative flex flex-col gap-[4px] rounded-[var(--radius-md)] border p-[var(--space-4)]" style={{ borderColor: "var(--inset-border)", background: "var(--inset-bg)" }}>
                  {r.mine ? (
                    <>
                      <span className="text-[11px] font-bold tracking-[0.04em] uppercase" style={{ color: "var(--muted-foreground)" }}>Your note</span>
                      <button type="button" aria-label="Remove" onClick={() => setTiles((t) => t.filter((x) => x !== r))} className="dm-quiet absolute top-[8px] right-[8px] flex size-6 cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}><X className="h-[12px] w-[12px]" aria-hidden /></button>
                    </>
                  ) : (
                    <span className="flex items-center gap-[12px]">
                      <Ring pct={r.pct ?? 0} size={52} stroke={6} accent="var(--primary)">
                        <span className="text-[13px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{r.pct}%</span>
                      </Ring>
                      <span className="text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>of students {r.subject}</span>
                    </span>
                  )}
                  {r.mine && <span className="text-[12.5px] font-semibold" style={{ color: "var(--foreground)" }}>{r.subject}</span>}
                  <span className="mt-[6px] text-[13px] leading-[18px] font-bold" style={{ color: "var(--foreground)" }}>{r.actions[0]}</span>
                  {r.actions.length > 1 && (
                    expanded.has(r.subject) ? (
                      <ul className="mt-[4px] flex flex-col gap-[4px] pl-[14px] text-[12.5px] leading-[17px]" style={{ color: "var(--muted-foreground)", listStyleType: "disc" }}>
                        {r.actions.slice(1).map((a) => <li key={a}>{a}</li>)}
                      </ul>
                    ) : (
                      <button type="button" onClick={() => setExpanded((prev) => new Set(prev).add(r.subject))} className="dm-quiet mt-[2px] flex w-fit cursor-pointer items-center text-[11.5px] font-bold" style={{ color: "var(--primary)" }}>+{r.actions.length - 1} more</button>
                    )
                  )}
                </div>
              ))}
            </div>
            {/* The reference's career-fair note, as the card's closing
               suggestion rather than a card of its own: it is one more
               recommendation, drawn from the same interests. */}
            <div className="flex flex-col gap-[8px] border-t pt-[var(--space-4)]" style={{ borderColor: "var(--inset-border)" }}>
              <span className="text-[13px] font-bold" style={{ color: "var(--foreground)" }}>Plan a career fair or job shadows around your top interests</span>
              <span className="flex flex-wrap gap-[6px]">
                {["Technology & Engineering", "Business & Entrepreneurship", "Healthcare & Nursing", "Law & Criminal Justice"].map((t) => (
                  <span key={t} className="rounded-full border px-[10px] py-[4px] text-[12px] font-semibold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>{t}</span>
                ))}
              </span>
            </div>
          </div>
        </div>
      </HoverBeam>

      {/* Saved careers is the reference's own list, so it agrees with the
         "43% saved Investment Banker" headline above it. */}
      <InterestChart />

    </div>
  );
}
