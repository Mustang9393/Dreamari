"use client";

import { useState } from "react";
import { Briefcase, Lightbulb } from "lucide-react";
import { Segmented } from "@/components/connect/viz";
import { HoverBeam } from "@/components/app/HoverBeam";
import { DEMO_SCHOOL } from "@/lib/counselorRoster";

import { GLASS_CARD as TINTED_CARD } from "./surfaces";

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

function RankedList({ items, view }: { items: { name: string; count: number; emoji?: string }[]; view: "chart" | "list" }) {
  const max = Math.max(...items.map((i) => i.count));
  return (
    <div className="flex flex-col gap-[10px]">
      {items.map((item, i) => (
        <div key={item.name} className="flex items-center gap-[12px]">
          <span className="w-[16px] flex-none text-[12px] font-bold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{i + 1}</span>
          {item.emoji && <span aria-hidden className="flex-none text-[16px]">{item.emoji}</span>}
          <span className="min-w-0 flex-1 truncate text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>{item.name}</span>
          {view === "chart" ? (
            <span className="relative h-[8px] w-[100px] flex-none overflow-hidden rounded-[4px]" style={{ background: "rgba(255,255,255,0.12)" }}>
              <span className="absolute inset-y-0 left-0 rounded-[4px]" style={{ width: `${(item.count / max) * 100}%`, background: "var(--primary)" }} />
            </span>
          ) : null}
          <span className="w-[28px] flex-none text-right text-[13px] font-bold tabular-nums" style={{ color: "var(--foreground)" }}>{item.count}</span>
        </div>
      ))}
    </div>
  );
}

function TrackChart({ title, lede, items }: { title: string; lede: string; items: { name: string; count: number }[] }) {
  const [view, setView] = useState<"chart" | "list">("chart");
  return (
    <HoverBeam strength={0.6} className="h-full">
      <div className="flex h-full flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
        <div className="flex flex-wrap items-start justify-between gap-[var(--space-3)]">
          <span className="flex flex-col gap-[2px]">
            <h2 className="text-[15px] font-bold" style={{ color: "var(--foreground)" }}>{title}</h2>
            <span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{lede}</span>
          </span>
          <Segmented ariaLabel={`${title} view`} value={view} onChange={setView} options={[{ key: "chart", label: "Chart" }, { key: "list", label: "List" }]} />
        </div>
        <RankedList items={items} view={view} />
      </div>
    </HoverBeam>
  );
}

export function CareerCollegeInsights() {
  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      <div className="relative overflow-hidden rounded-[var(--radius-lg)] border p-[var(--space-6)]" style={{ borderColor: "var(--glass-border)", background: "linear-gradient(135deg, color-mix(in srgb, var(--primary) 30%, var(--card)), color-mix(in srgb, #7C5CFA 24%, var(--card)))" }}>
        <span className="flex items-center gap-[8px] text-[12px] font-bold tracking-[0.05em] uppercase" style={{ color: "var(--primary)" }}>
          <Lightbulb className="h-[14px] w-[14px]" aria-hidden /> Dreamari Recommendations for You
        </span>
        <div className="mt-[var(--space-4)] grid grid-cols-1 gap-[var(--space-4)] md:grid-cols-3">
          {RECOMMENDATIONS.map((r) => (
            <div key={r.stat} className="flex flex-col gap-[8px] rounded-[var(--radius-md)] border p-[var(--space-4)]" style={{ borderColor: "var(--glass-border)", background: "color-mix(in srgb, var(--card) 70%, transparent)" }}>
              <span aria-hidden className="text-[22px]">{r.emoji}</span>
              <p className="text-[13.5px] font-bold" style={{ color: "var(--foreground)" }}>{r.stat}</p>
              <ul className="flex flex-col gap-[4px] text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>
                {r.actions.map((a) => <li key={a} className="flex gap-[6px]"><span aria-hidden>•</span>{a}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-2">
        <TrackChart title="Top 10 Saved Careers" lede="Careers most frequently saved to student profiles" items={TOP_SAVED_CAREERS} />
        <TrackChart title="Top 10 Careers Explored via Simulations" lede="Careers students engaged with through interactive career simulations" items={TOP_SIMULATIONS} />
        <TrackChart title="Top Saved Majors" lede="Most popular college majors saved by students" items={TOP_MAJORS} />
        <HoverBeam strength={0.6} className="h-full">
          <div className="flex h-full flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
            <span className="flex flex-col gap-[2px]">
              <h2 className="text-[15px] font-bold" style={{ color: "var(--foreground)" }}>Top Saved Colleges</h2>
              <span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Colleges most frequently saved to student profiles</span>
            </span>
            <RankedList items={TOP_COLLEGES} view="list" />
          </div>
        </HoverBeam>
      </div>

      <HoverBeam strength={0.6} className="h-full">
        <div className="flex flex-col gap-[10px] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
          <span className="flex items-center gap-[10px]">
            <span className="flex size-[30px] flex-none items-center justify-center rounded-[var(--radius-sm)]" style={{ background: "color-mix(in srgb, var(--primary) 18%, transparent)", color: "var(--primary)" }}>
              <Briefcase className="h-[15px] w-[15px]" aria-hidden />
            </span>
            <h2 className="text-[15px] font-bold" style={{ color: "var(--foreground)" }}>Career Fair Planning Opportunity</h2>
          </span>
          <p className="text-[13.5px] leading-[19px]" style={{ color: "var(--foreground)" }}>
            Based on this semester&apos;s data, your top 3 student career interest clusters are Technology, Entrepreneurship, and Healthcare. Consider organizing a career fair or job-shadow program that brings professionals from these fields directly to {DEMO_SCHOOL} — connecting students to real-world mentors aligned with their aspirations.
          </p>
          <span className="flex flex-wrap gap-[8px]">
            {["Technology & Engineering", "Business & Entrepreneurship", "Healthcare & Nursing", "Law & Criminal Justice"].map((t) => (
              <span key={t} className="rounded-full border px-[10px] py-[4px] text-[12px] font-semibold" style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}>{t}</span>
            ))}
          </span>
        </div>
      </HoverBeam>
    </div>
  );
}
