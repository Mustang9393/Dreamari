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
import { Lightbulb, PenLine, Plus, X } from "lucide-react";
import { HoverBeam } from "@/components/app/HoverBeam";
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

// A real horizontal bar chart: the bar spans the row, the label sits on
// it, the count is pinned right. Ten short bars beside a label column read
// as decoration; one bar per row reads as the chart it is.
function RankedList({ items }: { items: { name: string; count: number }[] }) {
  const max = Math.max(...items.map((i) => i.count));
  return (
    <ol className="flex flex-col gap-[6px]">
      {items.map((item, i) => (
        <li key={item.name} className="flex items-center gap-[10px]">
          <span className="w-[18px] flex-none text-right text-[12px] font-bold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{i + 1}</span>
          <span className="relative flex h-[28px] min-w-0 flex-1 items-center rounded-[6px]" style={{ background: "color-mix(in srgb, var(--foreground) 10%, transparent)" }}>
            <span aria-hidden className="absolute inset-y-0 left-0 rounded-[6px]" style={{ width: `${(item.count / max) * 100}%`, background: "linear-gradient(90deg, color-mix(in srgb, var(--primary) 30%, transparent), color-mix(in srgb, var(--primary) 85%, transparent))" }} />
            <span className="relative truncate px-[10px] text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>{item.name}</span>
          </span>
          <span className="w-[28px] flex-none text-right text-[13px] font-bold tabular-nums" style={{ color: "var(--foreground)" }}>{item.count}</span>
        </li>
      ))}
    </ol>
  );
}

// Five rows open, the rest behind "Show all" (progressive disclosure, 25
// Sept 2026): four cards of ten bars each was forty bars on one screen,
// and the question a counselor brings here is answered by the top few.
const SHOWN = 5;
function RankCard({ title, items }: { title: string; items: { name: string; count: number }[] }) {
  const [all, setAll] = useState(false);
  const visible = all ? items : items.slice(0, SHOWN);
  return (
    <HoverBeam strength={0.6} className="h-full">
      <div className="flex h-full flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
        <h2 className="text-[15px] font-bold" style={{ color: "var(--foreground)" }}>{title} <span className="ml-[4px] text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>top {visible.length}</span></h2>
        <RankedList items={visible} />
        <ShowAll total={items.length} shown={SHOWN} open={all} onToggle={() => setAll((v) => !v)} />
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
    <div className="flex flex-col gap-[var(--space-5)]">
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
            <div className="grid grid-cols-1 gap-[var(--space-3)] sm:grid-cols-3">
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
                    <span className="text-[28px] leading-[1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{r.pct}%</span>
                  )}
                  <span className="text-[12.5px] font-semibold" style={{ color: r.mine ? "var(--foreground)" : "var(--muted-foreground)" }}>{r.subject}</span>
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
          </div>
        </div>
      </HoverBeam>

      <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-2">
        {/* The reference's own list, so it agrees with the "43% saved
           Investment Banker" headline above it (a computed list from each
           student's top matches had Investment Banker nowhere in it). */}
        <RankCard title="Saved careers" items={TOP_SAVED_CAREERS} />
        <RankCard title="Careers explored in simulations" items={TOP_SIMULATIONS} />
        <RankCard title="Saved majors" items={TOP_MAJORS} />
        <RankCard title="Saved colleges" items={TOP_COLLEGES} />
      </div>

      <div className="flex flex-wrap items-center gap-x-[var(--space-4)] gap-y-[8px] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
        <span className="text-[13.5px] font-bold" style={{ color: "var(--foreground)" }}>Plan a career fair or job shadows around your top interests</span>
        <span className="flex flex-wrap gap-[8px]">
          {["Technology & Engineering", "Business & Entrepreneurship", "Healthcare & Nursing", "Law & Criminal Justice"].map((t) => (
            <span key={t} className="rounded-full border px-[10px] py-[4px] text-[12px] font-semibold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>{t}</span>
          ))}
        </span>
      </div>
    </div>
  );
}
