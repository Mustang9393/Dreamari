"use client";

// What this screen answers: what are students interested in, what do they
// intend to do after graduation, and which institutions are they looking at.
//
// DEMO-ONLY v3 (2 Oct 2026). Implements NOTES.md 2.3 (Career + Postsecondary)
// and 3.6 (the whole screen is a shared placeholder at every school, so only
// the "enrolled students" figure in the definitions changes).
//
// Deliberate deviations from the Replit, with why:
// - One blue instead of eight category colours: the dashboard's rule is blue
//   plus status colours, and each label already names its category.
// - Each card's (i) tooltip is its drill. The drill also lists "students"
//   per row (share times enrollment), derived here so a principal can read a
//   count; no figure is invented.
// - Hero: Career Interests, the screen's lead question.
//
// 2 Oct 2026 redundancy pass, with why (chart type picked from the metric):
// - Career Interests: eight ranked categories. ONE column chart (a donut in
//   one hue cannot tell eight slices apart); short labels under the columns,
//   full names in the drill. The separate Programming Cue card is now this
//   card's verdict, and its "Review student progress" link the drill action.
// - Postsecondary Intentions: four parts of one whole, so a donut with its
//   key. The centre no longer repeats the 58% the key shows.
// - Emerging Career Interests holds the new-careers count (292). It was on
//   screen three times (its own Pathway Discovery card, that card's label
//   and its "a count, not a percentage" stat); its definition is in the drill.
// - Postsecondary Choices: seven institutions with long names, so a ranked
//   horizontal bar chart, one line per row on one scale (names that long do
//   not fit under columns).
// - Card subtitles that restated the drill's lead are short units now.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart } from "@/components/connect/viz";
import { PRIMARY } from "@/components/counselor/palette";
import { CardLink } from "@/components/counselor/chips";
import { GLASS_INSET } from "@/components/counselor/surfaces";
import { DrillPanel, type Drill } from "../../Drill";
import { OverviewCard, Stat, Verdict } from "../../overviewShared";
import { DrillCard, PctBars, ShareRing, num, useSchoolDetail } from "./schoolKit";

/** Labels short enough to sit under a column; the full names are in the drill. */
const INTEREST_SHORT: Record<string, string> = {
  Healthcare: "Health",
  Technology: "Tech",
  "Business + Finance": "Business",
  "Creative Industries": "Creative",
  Engineering: "Engineering",
  "Skilled Trades": "Trades",
  "Public Service": "Public",
  Other: "Other",
};

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

  const interests = cp.interests.rows;
  // Quarter steps of a whole number, so the axis reads 6, 12, 18, 24.
  const interestMax = Math.ceil(Math.max(...interests.map((r) => r.value)) / 4) * 4;
  const cue = cp.emerging.cue;
  const interestsDrill: Drill = {
    ...distDrill(cp.interests.title, cp.tooltips.interests, interests),
    itemsLabel: "Programming cue",
    items: [cue.text],
    action: { label: cue.linkLabel.replace(" →", ""), onClick: () => router.push("/counselor?view=leader-progress") },
  };
  const discovery = cp.pathwayDiscovery;

  return (
    <div className="flex flex-col gap-[var(--space-6)]">
      <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-12">
        <div className="lg:col-span-7">
          <OverviewCard hero title={cp.interests.title} unit="% of students" aside={<CardLink onClick={() => setDrill(interestsDrill)}>Details</CardLink>}>
            <Verdict band="near">Tech interest outpaces exposure</Verdict>
            <BarChart
              barStyle="solid"
              height={210}
              maxBarWidth={28}
              max={interestMax}
              groups={interests.map((r) => INTEREST_SHORT[r.label] ?? r.label)}
              series={[{ label: cp.interests.title, accent: PRIMARY, values: interests.map((r) => r.value) }]}
            />
          </OverviewCard>
        </div>
        <div className="flex flex-col gap-[var(--space-4)] lg:col-span-5">
          <DrillCard title={cp.intentions.title} subtitle="intent, not enrollment" onOpen={() => setDrill(distDrill(cp.intentions.title, cp.tooltips.intentions, cp.intentions.rows))}>
            <ShareRing rows={cp.intentions.rows} />
          </DrillCard>
          <DrillCard
            title={cp.emerging.title}
            subtitle="this term"
            onOpen={() => setDrill({ title: cp.emerging.title, subtitle: sub, lead: `${cp.emerging.tooltip} ${discovery.tooltip}`, stats: [{ value: num(discovery.value), label: "New careers discovered this term" }], itemsLabel: "Signals gaining attention", items: [...cp.emerging.chips] })}
          >
            <Stat value={num(discovery.value)} label="new careers discovered" />
            <span className="flex flex-wrap gap-[8px]">
              {cp.emerging.chips.map((c) => (
                <span key={c} className="rounded-full border px-[12px] py-[5px] text-[12.5px] font-bold" style={{ ...GLASS_INSET, color: "var(--foreground)" }}>{c}</span>
              ))}
            </span>
          </DrillCard>
        </div>
      </div>

      <DrillCard title={cp.choices.title} subtitle="saved or explored, can overlap" onOpen={() => setDrill(distDrill(cp.choices.title, cp.tooltips.choices, cp.choices.rows))}>
        <PctBars rows={cp.choices.rows} />
      </DrillCard>

      <DrillPanel drill={drill} onClose={() => setDrill(null)} />
    </div>
  );
}
