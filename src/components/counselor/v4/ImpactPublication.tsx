"use client";
import type { ImpactView } from "./CounselorImpact";
import { Letterhead, PAGE_H, PAGE_W } from "./DocumentDesk";
import { PAPER_VARS } from "./DocumentPreview";
import { usePublicationStyle } from "./SchoolPublication";
import { hoursLabel } from "@/lib/counselorTimeLog";

// The printed reports mirror the page's six sections (9 Oct 2026, Maisha's
// My Impact content reset): Student Progress, ASCA Alignment, Key Wins,
// District Goals & Reporting, Use of Time, then how to read it. The
// principal brief is one page: the summary, the wins and the goals table.
// Section titles in Title Case (Maisha's v4 review, 7 Oct 2026). The report
// stays third person: it is written for the principal.
export function ImpactPublication({ v, who, role, pageRef, kind = "impact" }: { v: ImpactView; who: string; role: string; pageRef: React.Ref<HTMLDivElement>; kind?: "impact" | "principal" }) {
  const { style } = usePublicationStyle();
  const pages = kind === "impact" ? 2 : 1;
  const section = (n: string, title: string) => <h2 className="publication-section"><span>{n}</span>{title}</h2>;
  const page = (n: number, children: React.ReactNode) => <article data-doc-page className="publication-report-page" style={{ ...PAPER_VARS, '--publication-ink': style.accent, width: PAGE_W, minHeight: PAGE_H } as React.CSSProperties}>
    <Letterhead/>{children}<footer className="publication-folio"><span>{who} · {v.label}</span><span>{String(n).padStart(2,'0')} / {String(pages).padStart(2,'0')}</span></footer>
  </article>;
  const met = v.goals.filter((g) => g.met).length;
  const goalsTable = <table className="publication-table"><thead><tr><th>Goal / Metric</th><th>Current Result</th><th>Target</th><th>Status</th></tr></thead><tbody>{v.goals.map(g=><tr key={g.key}><td>{g.metric}</td><td><strong>{g.result}</strong> <span>({g.note})</span></td><td>{g.target}</td><td>{g.met ? '✓ Met' : '○ In progress'}</td></tr>)}</tbody></table>;
  const wins = <ol className="publication-wins">{v.wins.map((w, i) => <li key={w.key}><span>{String(i + 1).padStart(2, '0')}</span>{w.text}</li>)}</ol>;
  return <div ref={pageRef} className="publication-book">
    {page(1, <>
      <div className="publication-eyebrow">{kind === 'impact' ? 'Counseling impact report' : 'Principal / district brief'}<span>{v.year}</span></div>
      <h1 className="publication-title">Progress, with<br/><em>purpose.</em></h1>
      <div className="publication-byline"><div><strong>{who}</strong><span>{role}</span></div><div><strong>{v.range}</strong><span>Reporting period · Issued {v.issued}</span></div></div>
      {section('01','Student Progress')}
      <p className="publication-lede">{v.onTrack} of {v.caseload} students are on track ({v.onTrackPct}%; the school comparison is 71%). {v.exploring} students are still exploring their next step. {met} of {v.goals.length} district goals are met this period.</p>
      <div className="publication-key-figures">{[{value:`${v.onTrackPct}%`,label:'On track',note:`${v.onTrack} of ${v.caseload} students`},{value:`${v.withPlanPct}%`,label:'With a direction',note:`${v.withPlan} of ${v.caseload} students`},{value:`${v.turnaround.toFixed(1)}`,label:'Days to review',note:'District standard: 5 days or less'}].map(f=><div key={f.label}><strong>{f.value}</strong><b>{f.label}</b><span>{f.note}</span></div>)}</div>
      {kind === 'impact' ? <>
        {section('02','ASCA Alignment')}
        <table className="publication-table"><thead><tr><th>Measure</th><th>Result</th><th>Since last semester</th></tr></thead><tbody>
          {v.asca.academic.map(a=><tr key={a.key}><td>Academic · {a.label}</td><td><strong>{a.pct}%</strong></td><td>+{a.delta} points</td></tr>)}
          {v.asca.career.map(a=><tr key={a.key}><td>Career · {a.label}</td><td><strong>{a.pct}%</strong></td><td>+{a.delta} points</td></tr>)}
        </tbody></table>
        {section('03','Key Wins')}
        {wins}
      </> : <>
        {section('02','Key Wins')}
        {wins}
        {section('03','District Goals & Reporting')}
        {goalsTable}
      </>}
      <p className="publication-source">Source: Dreamari student records; {v.caseload} students. Measures describe recorded activity and progress, not causal evidence of counselor impact. {pages > 1 ? 'District goals and use of time follow on page 2.' : 'The full report adds ASCA alignment and use of time.'}</p>
    </>)}
    {kind === 'impact' && page(2, <>
      <div className="publication-eyebrow">Goals and time<span>Evidence</span></div>
      <h1 className="publication-title small">Goals <em>and time.</em></h1>
      {section('04','District Goals & Reporting')}
      {goalsTable}
      <p className="publication-caption">{met} of {v.goals.length} targets met. A met target is a threshold comparison for this period, not an improvement over time.</p>
      {section('05','Use of Time')}
      <p className="publication-intro">{v.time.studentPct}% of logged time went to direct and indirect student services. The ASCA target is 80%.</p>
      <div className="publication-destination-strip" aria-hidden="true">{v.time.groups.filter(g=>g.minutes>0).map((g,i)=><span key={g.c} style={{flex:g.minutes,background:style.accent,opacity:1-i*.22}}/>)}</div>
      <table className="publication-table"><thead><tr><th>Category</th><th>Hours</th><th>Share</th></tr></thead><tbody>{v.time.groups.map(g=><tr key={g.c}><td>{g.c}</td><td>{hoursLabel(g.minutes)}</td><td>{g.pct}%</td></tr>)}</tbody></table>
      {section('06','Reading This Report')}
      <div className="publication-method"><strong>Reading This Report</strong><p>Percentages are rounded to whole numbers. District targets are shown beside results. The change since last semester compares the same measure at the end of the previous reporting period.</p></div>
    </>)}
  </div>;
}
