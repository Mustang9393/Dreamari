"use client";

// What this screen answers: what are students interested in, what do they
// intend to do after graduation, and which institutions are they looking at.
//
// DEMO-ONLY v2 (2 Oct 2026). Implements NOTES.md 2.3 (Career + Postsecondary)
// and 3.6 (the whole screen is a shared placeholder at every school, so only
// the "enrolled students" figure in the definitions changes).
//
// Deliberate deviations from the Replit, with why:
// - One blue instead of eight category colours on Career Interests: the
//   dashboard's rule is blue plus status colours, and the label already names
//   the category. Bars scale to the next ten above the largest share so the
//   longest bar is not a false 100%.
// - Postsecondary Intentions are four parts of one whole, so they are a ring
//   with its key (the same shape as My Impact's pathways ring) instead of four
//   bars; "Undecided" takes the neutral slice.
// - Postsecondary Choices are bars like the other lists (the Replit's plain
//   two-column list had no visual weight), in two columns on one shared scale
//   in the Replit's reading order; the percentages still do not total 100 and
//   the drill says so.
// - Layout: the cards are arranged so no row has a void (Interests beside
//   Intentions + Emerging; Pathway Discovery beside the cue; Choices full width).
//   Cards in one row are the same height (direct instruction, 2 Oct 2026: "cards
//   should always be the same height in rows"): the Pathway Discovery and cue
//   row stretches instead of top-aligning, so the shorter card is not left
//   floating beside a taller one.
// - Each card's (i) tooltip is the card's drill. The drill also lists
//   "students" per row (share times enrollment), derived in the component so
//   a principal can read a count; no figure is invented.
// - The Programming Cue is its own card, not inside the Emerging card: that
//   card is a drill target, and a button inside a button is invalid.
// - Pathway Discovery is a drill card too; the Replit's card is static.
// - Hero: Career Interests, the screen's lead question.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GLASS_INSET } from "@/components/counselor/surfaces";
import { CardLink } from "@/components/counselor/chips";
import { DrillPanel, type Drill } from "../../Drill";
import { Stat } from "../../overviewShared";
import { DrillCard, PctBars, LABEL, ShareRing, num, useSchoolDetail } from "./schoolKit";

// The data stores this label in capitals ("NEW CAREERS DISCOVERED").
const sentence = (s: string) => s.toLowerCase().replace(/(^|\s)\S/g, (m) => m.toUpperCase());

export function SchoolPostsecondary() {
  const router = useRouter();
  const detail = useSchoolDetail();
  const cp = detail.careerPostsecondary;
  const { school } = detail;
  const [drill, setDrill] = useState<Drill | null>(null);
  const sub = `${school.name} · ${num(school.enrollment)} students · 2026–27`;

  // Share x enrollment, so a leader can read a head-count.
  const students = (pct: number) => `${num(Math.round((school.enrollment * pct) / 100))} students`;
  const distDrill = (title: string, lead: string, rows: readonly { label: string; value: number }[]): Drill => ({
    title,
    subtitle: sub,
    lead,
    rowsLabel: "Share of enrolled students",
    rows: rows.map((r) => ({ label: r.label, value: `${r.value}% · ${students(r.value)}`, pct: r.value })),
  });

  const half = Math.ceil(cp.choices.rows.length / 2);

  return (
    <div className="flex flex-col gap-[var(--space-6)]">
      <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-12">
        <div className="lg:col-span-7">
          <DrillCard hero title={cp.interests.title} subtitle={cp.interests.subtitle} onOpen={() => setDrill(distDrill(cp.interests.title, cp.tooltips.interests, cp.interests.rows))}>
            <PctBars rows={cp.interests.rows} />
          </DrillCard>
        </div>
        <div className="flex flex-col gap-[var(--space-4)] lg:col-span-5">
          <DrillCard title={cp.intentions.title} subtitle={cp.intentions.subtitle} onOpen={() => setDrill(distDrill(cp.intentions.title, cp.tooltips.intentions, cp.intentions.rows))}>
            <ShareRing rows={cp.intentions.rows} centerLabel="plan 4-year" />
          </DrillCard>
          <DrillCard title={cp.emerging.title} subtitle={cp.emerging.subtitle} onOpen={() => setDrill({ title: cp.emerging.title, subtitle: sub, lead: cp.emerging.tooltip, itemsLabel: "Signals gaining attention this term", items: [...cp.emerging.chips] })}>
            <span className="flex flex-wrap gap-[8px]">
              {cp.emerging.chips.map((c) => (
                <span key={c} className="rounded-full border px-[12px] py-[5px] text-[12.5px] font-bold" style={{ ...GLASS_INSET, color: "var(--foreground)" }}>{c}</span>
              ))}
            </span>
          </DrillCard>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-12">
        <div className="lg:col-span-5">
          <DrillCard title={sentence(cp.pathwayDiscovery.label)} subtitle={cp.pathwayDiscovery.sub} onOpen={() => setDrill({ title: sentence(cp.pathwayDiscovery.label), subtitle: sub, lead: cp.pathwayDiscovery.tooltip, stats: [{ value: num(cp.pathwayDiscovery.value), label: "New careers discovered this term" }] })}>
            <Stat value={num(cp.pathwayDiscovery.value)} label="a count, not a percentage" />
          </DrillCard>
        </div>
        {/* Not a drill: it holds a link, and a link inside a button is invalid. */}
        <div className="flex flex-col justify-center gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-5)] lg:col-span-7" style={GLASS_INSET}>
          <span className="flex flex-col gap-[3px]">
            <span className={LABEL} style={{ color: "var(--primary)" }}>{cp.emerging.cue.eyebrow}</span>
            <span className="text-[13.5px] leading-[19px] font-bold" style={{ color: "var(--foreground)" }}>{cp.emerging.cue.text}</span>
          </span>
          <span><CardLink onClick={() => router.push("/counselor?view=leader-progress")}>{cp.emerging.cue.linkLabel.replace(" →", "")}</CardLink></span>
        </div>
      </div>

      <DrillCard title={cp.choices.title} subtitle={cp.choices.subtitle} onOpen={() => setDrill(distDrill(cp.choices.title, cp.tooltips.choices, cp.choices.rows))}>
        {/* Two columns in reading order (the Replit's list ran column by column), one shared scale. */}
        <span className="grid grid-cols-1 gap-x-[var(--space-8)] gap-y-[12px] md:grid-cols-2">
          <PctBars rows={cp.choices.rows.slice(0, half)} scaleRows={cp.choices.rows} />
          <PctBars rows={cp.choices.rows.slice(half)} scaleRows={cp.choices.rows} />
        </span>
      </DrillCard>

      <DrillPanel drill={drill} onClose={() => setDrill(null)} />
    </div>
  );
}
