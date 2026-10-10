"use client";

// What this screen answers: what are students interested in, what do they
// intend to do after graduation, and which institutions are they looking at.
//
// DEMO-ONLY v2 (2 Oct 2026). Implements NOTES.md 2.3 (Career + Postsecondary)
// and 3.6 (the whole screen is a shared placeholder at every school, so only
// the "enrolled students" figure in the definitions changes). The v2
// decisions still hold: one blue for interests (blue plus status colours
// only), intentions as parts of one whole, choices noted as not totalling
// 100, every (i) a drill that also lists head-counts (share x enrollment,
// derived, never invented), the cue is not inside a button.
//
// v4 rebuild (6 Oct 2026). WHY: this was a v2 grid of DrillCards (a hero
// glow card, extrabold percentages, chip boxes for emerging interests, a
// lone count card, an inset cue box). Direct instruction: make the leader
// roles "like this version" in every aspect. It is now the counselor's
// Career & college and Your impact, read for a school:
//   - Career interests and Postsecondary choices are the counselor's
//     interest explorer: one sheet, a Careers / Colleges style toggle
//     (Interest areas / Institutions), the selected item as a serif title
//     and an orb on the left, the ranked rows with a stem and dot on the
//     right. The two lists were already "what students lean toward", and
//     the toggle puts both one click apart instead of two stacked cards.
//     The header caption keeps each list's rule (one per student, totals
//     100% / a student can save several, does not total 100%).
//   - Postsecondary intentions are Your impact's "Life after graduation"
//     ring (v4-destination-chart), with Undecided in the neutral slice.
//   - Pathway discovery, Emerging interests and the Programming cue are one
//     Today-style island ("Signals this term"): the 292 as the light number,
//     the five emerging interests as numbered hairline rows instead of chip
//     boxes, the cue and its link at the foot. Same height as the ring sheet.
//   - Every title, subtitle, tooltip and value from v2 is still here: on the
//     face or in the drill each part opens.
//
// Maisha's v4 review (7 Oct 2026): she "loves the Explore cards art" on the
// counselor's Career & College and wants the leader views to "follow this
// direction aesthetically so I can share during demos". So the selected
// interest area carries the student app's career poster, faded behind the
// focus exactly as the counselor's focus card does (Technology, a software
// engineer; Healthcare, a nurse...; "Other" has no picture). The intentions
// ring steps through one hue (her Plans After Graduation note), with
// Undecided neutral. The discovery number counts up. Headers in Title Case.
//
// Glow pass (10 Oct 2026). WHY: Chandu, "i want all graphs to get these
// material updates and more creative visions", "why is everything a ring
// to you?", "I dont like bar graphs" and "i want them to be made of
// LIGHT". The two rings on this screen became the form their data has:
//   - The focus share is a light trail on a 0 to 100 scale ending in a lit
//     orb (charts/ldViz LightGauge), under the big number.
//   - Postsecondary intentions are a Sankey of light (PlanFlow): every
//     enrolled student flows from one column to their plan, ribbon width =
//     share, each part labelled with its share and head-count, so the key
//     list beside the ring is no longer needed. It still opens the drill.
//   - The ranking stems glow; the selected one is the lit point.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";
import { DrillPanel, type Drill } from "../../Drill";
import { num, schoolLine, useSchoolDetail } from "./schoolKit";
import { LightGauge, PlanFlow } from "../../charts/ldViz";
import { useChartColors } from "../../ChartColors";
import { Segmented } from "../../viz";
import { CountUp, INTEREST_ART, SectionHeading, TextAction, artPosition, step, titleCase, titled } from "../kit";

// The data stores this label in capitals ("NEW CAREERS DISCOVERED").
const sentence = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

type Mode = "interests" | "choices";

export function SchoolPostsecondary() {
  const intentionColors = useChartColors();
  const router = useRouter();
  const detail = useSchoolDetail();
  const cp = detail.careerPostsecondary;
  const { school } = detail;
  const [drill, setDrill] = useState<Drill | null>(null);
  const [mode, setMode] = useState<Mode>("interests");
  const [selected, setSelected] = useState(0);
  const [all, setAll] = useState(false);
  const sub = schoolLine(detail);

  // Share x enrollment, so a leader can read a head-count.
  const count = (pct: number) => Math.round((school.enrollment * pct) / 100);
  const students = (pct: number) => `${num(count(pct))} students`;
  const distDrill = (title: string, lead: string, rows: readonly { label: string; value: number }[], note?: string): Drill => ({
    title,
    subtitle: sub,
    lead,
    rowsLabel: "Share of enrolled students",
    rows: rows.map((r) => ({ label: r.label, value: `${r.value}% · ${students(r.value)}`, pct: r.value })),
    ...(note ? { itemsLabel: "Reading this list", items: [note] } : {}),
  });

  const list = mode === "interests" ? cp.interests : cp.choices;
  const ranked = [...list.rows].sort((a, b) => b.value - a.value);
  const focus = ranked[Math.min(selected, ranked.length - 1)];
  const max = Math.max(10, Math.ceil(Math.max(...ranked.map((r) => r.value)) / 10) * 10);
  const listDrill = () => mode === "interests"
    ? distDrill(cp.interests.title, cp.tooltips.interests, cp.interests.rows, cp.interests.subtitle)
    : distDrill(cp.choices.title, cp.tooltips.choices, cp.choices.rows, `${cp.choices.subtitle} A student can explore several, so the shares do not total 100%.`);
  // Parts of one whole step through one hue by rank; Undecided is neutral.
  const intentionParts = [
    ...cp.intentions.rows.filter((r) => r.label !== "Undecided").sort((a, b) => b.value - a.value).map((r, i) => ({ label: r.label, value: r.value, color: step(i) })),
    ...cp.intentions.rows.filter((r) => r.label === "Undecided").map((r) => ({ label: r.label, value: r.value, color: "var(--v4-step-6)" })),
  ];

  return (
    <div className="v4-leader-page v4-sections">
      <section className="v4-interest-explorer v4-school-explorer">
        <header>
          <Segmented ariaLabel="What students lean toward" value={mode} onChange={(m) => { setMode(m); setSelected(0); setAll(false); }} options={[{ key: "interests", label: "Interest Areas" }, { key: "choices", label: "Institutions" }]} />
          <span>{mode === "interests" ? "One primary interest per student · totals 100%" : "Saved or explored · a student can save several"}</span>
        </header>
        <div className="v4-interest-explorer-body">
          <div className="v4-interest-focus">
            {mode === "interests" && INTEREST_ART[focus.label] && <span key={focus.label} className="v4-focus-art" aria-hidden style={{ backgroundImage: `url(${INTEREST_ART[focus.label]})`, backgroundPosition: artPosition(INTEREST_ART[focus.label]) }} />}
            <span className="v4-overline">{selected === 0 ? "Most Chosen" : `Rank ${selected + 1}`} / {mode === "interests" ? "Interest Area" : "Institution"}</span>
            <h2>{focus.label}</h2>
            <div className="v4-school-focus-field">
              <LightGauge value={focus.value} figure={<strong><CountUp value={focus.value} /><small>%</small></strong>} caption="of enrolled students" />
            </div>
            <p>About <b>{students(focus.value)}</b> of {num(school.enrollment)}</p>
          </div>
          <div className="v4-interest-ranking">
            <div className="v4-interest-ranking-title"><span>{mode === "interests" ? "Career Interests" : "Postsecondary Choices"}</span><TextAction onClick={() => setDrill(listDrill())}>Details</TextAction></div>
            <ol>
              {ranked.slice(0, all ? ranked.length : 5).map((item, i) => (
                <li key={item.label}>
                  <button type="button" aria-pressed={selected === i} onClick={() => setSelected(i)}>
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    <div><strong>{item.label}</strong><span className="v4-interest-stem" aria-hidden="true"><i style={{ width: `${(item.value / max) * 100}%` }} /><b style={{ left: `${(item.value / max) * 100}%` }} /></span></div>
                    <em>{item.value}%</em>
                  </button>
                </li>
              ))}
            </ol>
            {ranked.length > 5 && <button type="button" className="v4-plot-expand" aria-expanded={all} onClick={() => { setAll(!all); if (all && selected > 4) setSelected(0); }}>{all ? "Show top five" : `Explore all ${ranked.length}`}<span aria-hidden="true">{all ? "−" : "+"}</span></button>}
          </div>
        </div>
      </section>

      <SectionHeading index={1} label="Next Steps" title="Where Students Plan to Go" />
      <div className="v4-daily-grid">
        <section className="v4-focus-sheet flex flex-col pb-[24px]" {...intentionColors.attrs}>
          <header className="v4-section-head">
            <div><h2>{titleCase(cp.intentions.title)}</h2></div>
            <span className="v4-section-tools">{intentionColors.toggle}<TextAction onClick={() => setDrill(distDrill(cp.intentions.title, cp.tooltips.intentions, cp.intentions.rows, cp.intentions.subtitle))}>Details</TextAction></span>
          </header>
          <div className="pt-[14px]">
            <PlanFlow
              label={cp.intentions.title}
              source={`${num(school.enrollment)} students`}
              parts={intentionParts}
              note={(v) => `about ${students(v)}`}
              onOpen={() => setDrill(distDrill(cp.intentions.title, cp.tooltips.intentions, cp.intentions.rows, cp.intentions.subtitle))}
            />
          </div>
          <div className="v4-sheet-foot mt-[18px] !pb-0"><span>{cp.intentions.subtitle}</span></div>
        </section>

        <section className="v4-review-island">
          <header className="v4-section-head"><span className="v4-overline">Signals This Term</span><Sparkles size={20} aria-hidden /></header>
          <button type="button" className="v4-school-figure text-left" onClick={() => setDrill({ title: titleCase(cp.pathwayDiscovery.label), subtitle: sub, lead: cp.pathwayDiscovery.tooltip, stats: [{ value: num(cp.pathwayDiscovery.value), label: "New careers discovered this term" }], items: [cp.pathwayDiscovery.sub] })} aria-label={`${num(cp.pathwayDiscovery.value)} new careers discovered. Open the definition`}>
            <strong><CountUp value={num(cp.pathwayDiscovery.value)} /></strong>
            <span>{sentence(cp.pathwayDiscovery.label)}<br />this term</span>
          </button>
          <div className="flex items-center justify-between gap-[12px] border-t pt-[14px]" style={{ borderColor: "var(--v4-line)" }}>
            <span className="v4-overline">{titleCase(cp.emerging.title)}</span>
            <TextAction onClick={() => setDrill({ title: cp.emerging.title, subtitle: sub, lead: cp.emerging.tooltip, itemsLabel: cp.emerging.subtitle, items: [...cp.emerging.chips] })}>About</TextAction>
          </div>
          <ol className="v4-school-signal-list" aria-label={cp.emerging.subtitle}>
            {cp.emerging.chips.map((c, i) => <li key={c}><span className="v4-list-index">{String(i + 1).padStart(2, "0")}</span>{c}</li>)}
          </ol>
          <div className="v4-school-cue">
            <span className="v4-overline" style={{ color: "var(--primary)" }}>{titleCase(cp.emerging.cue.eyebrow)}</span>
            <p>{cp.emerging.cue.text}</p>
          </div>
          <button type="button" className="v4-island-action mt-[10px]" onClick={() => router.push("/counselor?view=leader-progress&v=4")}>{cp.emerging.cue.linkLabel.replace(" →", "")}<ArrowRight size={18} aria-hidden /></button>
        </section>
      </div>

      <p className="v4-data-note">{school.name} · {num(school.enrollment)} enrolled students · demo data. Interests and intentions are current shares of enrolled students, not outcomes, with no launch comparison. Head-counts in the details are share times enrollment.</p>
      <DrillPanel drill={titled(drill)} onClose={() => setDrill(null)} />
    </div>
  );
}
