"use client";

// DEMO-ONLY v2 fork of ../CareerCollegeInsights.tsx (24 Sept 2026). v1 stays untouched so the
// two builds can be compared live via the bottom-center version chip
// (../version.tsx). Changes from the 24 Sept audit land here.

// 25 Sept 2026 pass under the v2 budget: recommendations are one stat and
// one action each; the four ranked lists are always bars (the Chart / List
// toggle only hid the bar), with no lede restating the title and no
// decorative emoji; the career-fair note is one line plus its chips. Data
// is the reference's, verbatim.

import { Lightbulb } from "lucide-react";
import { HoverBeam } from "@/components/app/HoverBeam";
import { GLASS_CARD as TINTED_CARD, GLASS_CARD_HERO, glowBackdrop } from "../surfaces";

// Each recommendation as a number, a subject and one action; the
// reference's sentence-plus-three-bullets form is kept in `actions` for a
// later "more" affordance but is not rendered (direct feedback, 25 Sept
// 2026: "too text heavy. How can we simplify without losing value?").
const RECOMMENDATION_TILES = [
  { pct: 43, subject: "saved Investment Banker", action: "Invite a banking professional for a career talk" },
  { pct: 32, subject: "want to be entrepreneurs", action: "Host a local business-owner speaker series" },
  { pct: 29, subject: "exploring nursing and healthcare", action: "Partner with a clinic for job shadows" },
];
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- the reference's full copy, kept for a later "more" affordance
const RECOMMENDATIONS = [
  { emoji: "💼", stat: "43% of students have saved Investment Banker as a top career", actions: ["Invite an investment banking professional or Wall Street firm representative to your school for a career talk", "Schedule a visit to a financial district campus, trading floor, or investment firm", "Explore a CTE Finance & Business pathway or dual-enrollment finance course"] },
  { emoji: "💰", stat: "32% of students aspire to be Entrepreneurs or Business Owners", actions: ["Host a \"Young Entrepreneurs\" speaker series featuring local business owners", "Connect students to DECA, FBLA, or local small business incubators", "Introduce a pitch competition or school-based enterprise activity"] },
  { emoji: "🏥", stat: "29% of students are exploring Nursing & Healthcare careers", actions: ["Partner with a local hospital or clinic for a job shadow or career fair", "Explore CTE Health Sciences pathway options in your district", "Invite a panel of nurses, doctors, and allied health professionals"] },
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

function RankedList({ items }: { items: { name: string; count: number }[] }) {
  const max = Math.max(...items.map((i) => i.count));
  return (
    <ol className="flex flex-col gap-[8px]">
      {items.map((item, i) => (
        <li key={item.name} className="flex items-center gap-[12px]">
          <span className="w-[16px] flex-none text-[12px] font-bold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{i + 1}</span>
          <span className="min-w-0 flex-1 truncate text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>{item.name}</span>
          <span className="relative h-[6px] w-[90px] flex-none rounded-full" style={{ background: "rgba(255,255,255,0.08)" }} aria-hidden>
            <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${(item.count / max) * 100}%`, background: "linear-gradient(90deg, color-mix(in srgb, var(--primary) 35%, transparent), var(--primary))" }} />
          </span>
          <span className="w-[28px] flex-none text-right text-[13px] font-bold tabular-nums" style={{ color: "var(--foreground)" }}>{item.count}</span>
        </li>
      ))}
    </ol>
  );
}

function RankCard({ title, items }: { title: string; items: { name: string; count: number }[] }) {
  return (
    <HoverBeam strength={0.6} className="h-full">
      <div className="flex h-full flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
        <h2 className="text-[15px] font-bold" style={{ color: "var(--foreground)" }}>{title} <span className="ml-[4px] text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>top 10</span></h2>
        <RankedList items={items} />
      </div>
    </HoverBeam>
  );
}

export function CareerCollegeInsights() {
  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      {/* The screen's hero: what the data suggests doing. One stat, one
         action per column; the reference's two further actions per stat
         were a paragraph each on every visit. */}
      <HoverBeam strength={0.7} className="h-full">
        <div className="relative overflow-hidden rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={GLASS_CARD_HERO}>
          <span aria-hidden className="pointer-events-none absolute inset-0" style={{ background: glowBackdrop("var(--primary)", 0.24) }} />
          <div className="relative flex flex-col gap-[var(--space-4)]">
            <h2 className="flex items-center gap-[8px] text-[15px] font-bold" style={{ color: "var(--foreground)" }}>
              <Lightbulb className="h-[15px] w-[15px]" aria-hidden style={{ color: "var(--primary)" }} /> Recommended this semester
            </h2>
            <div className="grid grid-cols-1 gap-[var(--space-3)] sm:grid-cols-3">
              {RECOMMENDATION_TILES.map((r) => (
                <div key={r.subject} className="flex flex-col gap-[8px] rounded-[var(--radius-md)] border p-[var(--space-4)]" style={{ borderColor: "color-mix(in srgb, #FFFFFF 14%, transparent)", background: "color-mix(in srgb, #FFFFFF 7%, transparent)" }}>
                  <span className="flex items-baseline gap-[8px]">
                    <span className="text-[28px] leading-[1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{r.pct}%</span>
                    <span className="text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{r.subject}</span>
                  </span>
                  <span className="flex items-center gap-[6px] text-[13px] font-bold" style={{ color: "var(--foreground)" }}>
                    <span aria-hidden className="size-[6px] flex-none rounded-full" style={{ background: "var(--primary)" }} />{r.action}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </HoverBeam>

      <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-2">
        <RankCard title="Saved careers" items={TOP_SAVED_CAREERS} />
        <RankCard title="Careers explored in simulations" items={TOP_SIMULATIONS} />
        <RankCard title="Saved majors" items={TOP_MAJORS} />
        <RankCard title="Saved colleges" items={TOP_COLLEGES} />
      </div>

      <div className="flex flex-wrap items-center gap-x-[var(--space-4)] gap-y-[8px] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
        <span className="text-[13.5px] font-bold" style={{ color: "var(--foreground)" }}>Career fair clusters to invite</span>
        <span className="flex flex-wrap gap-[8px]">
          {["Technology & Engineering", "Business & Entrepreneurship", "Healthcare & Nursing", "Law & Criminal Justice"].map((t) => (
            <span key={t} className="rounded-full border px-[10px] py-[4px] text-[12px] font-semibold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>{t}</span>
          ))}
        </span>
      </div>
    </div>
  );
}
