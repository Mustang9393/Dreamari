"use client";
import type { ImpactView } from "./CounselorImpact";
import { Letterhead, PAGE_H, PAGE_W } from "./DocumentDesk";
import { PAPER_VARS } from "./DocumentPreview";
import { usePublicationStyle } from "./SchoolPublication";

export function ImpactPublication({ v, who, role, pageRef, kind = "impact" }: { v: ImpactView; who: string; role: string; pageRef: React.Ref<HTMLDivElement>; kind?: "impact" | "principal" }) {
  const { style } = usePublicationStyle();
  const pages = kind === "impact" ? 3 : 1;
  const section = (n: string, title: string) => <h2 className="publication-section"><span>{n}</span>{title}</h2>;
  const page = (n: number, children: React.ReactNode) => <article data-doc-page className="publication-report-page" style={{ ...PAPER_VARS, '--publication-ink': style.accent, width: PAGE_W, minHeight: PAGE_H } as React.CSSProperties}>
    <Letterhead/>{children}<footer className="publication-folio"><span>{who} · {v.label} · Historical demonstration data</span><span>{String(n).padStart(2,'0')} / {String(pages).padStart(2,'0')}</span></footer>
  </article>;
  const unanswered = v.answered[1] - v.answered[0];
  return <div ref={pageRef} className="publication-book">
    {page(1, <>
      <div className="publication-eyebrow">{kind === 'impact' ? 'Counseling impact report' : 'Principal / district brief'}<span>{v.year}</span></div>
      <h1 className="publication-title">Progress, with<br/><em>purpose.</em></h1>
      <div className="publication-byline"><div><strong>{who}</strong><span>{role}</span></div><div><strong>{v.range}</strong><span>Reporting period · Issued {v.issued}</span></div></div>
      {section('01','Executive summary')}
      <p className="publication-lede">{v.onTrack} of {v.caseload} students were on track during {v.label}. Senior plan completion reached {v.seniorPct}%, {v.seniorPct >= 80 ? 'meeting' : 'below'} the district’s 80% benchmark. The next focus is students without a declared plan and questions awaiting a response.</p>
      <div className="publication-key-figures">{[{value:`${v.onTrackPct}%`,label:'On track',note:`${v.onTrack} of ${v.caseload} students`},{value:`${v.seniorPct}%`,label:'Seniors with a plan',note:`${v.seniorsWithPlan} of 30 seniors`},{value:`${v.turnaround.toFixed(1)}`,label:'Days to review',note:'District standard: ≤ 5 days'}].map(f=><div key={f.label}><strong>{f.value}</strong><b>{f.label}</b><span>{f.note}</span></div>)}</div>
      {section('02','District measures')}
      <table className="publication-table"><thead><tr><th>Measure</th><th>Result</th><th>Target</th><th>Standing</th></tr></thead><tbody>{v.reportCompliance.map(r=><tr key={r.metric}><td>{r.metric}</td><td><strong>{r.result}</strong></td><td>{r.target}</td><td>{r.met ? '✓ Met' : '○ In progress'}</td></tr>)}</tbody></table>
      {section('03','Priorities for the next check-in')}
      <div className="publication-priorities"><div><b>{v.caseload-v.withPlan}</b><p><strong>Students undecided</strong>Support a concrete postsecondary next step.</p></div><div><b>{unanswered}</b><p><strong>Questions awaiting a reply</strong>Close the loop on student requests.</p></div><div><b>{v.pending}</b><p><strong>Reviews pending</strong>Keep decisions moving within the service standard.</p></div></div>
      <p className="publication-source">Source: Dreamari historical demonstration dataset; {v.caseload} students, 30 per grade. Measures describe recorded activity and progress, not causal evidence of counselor impact. {pages > 1 ? 'Supporting outcomes and service detail follow on pages 2–3.' : 'Full cohort and service detail is available in the Counseling Impact Report.'}</p>
    </>)}
    {kind === 'impact' && page(2, <>
      <div className="publication-eyebrow">Student outcomes<span>Evidence / 01</span></div>
      <h1 className="publication-title small">Student <em>outcomes.</em></h1>
      {section('04','Postsecondary destinations')}
      <p className="publication-intro">{v.withPlan} of {v.caseload} students ({v.withPlanPct}%) have a declared plan. Categories are mutually exclusive and include students who remain undecided.</p>
      <div className="publication-destination-strip" aria-hidden="true">{v.pathways.filter(p=>p.count>0).map((p,i)=><span key={p.label} style={{flex:p.count,background:style.accent,opacity:1-i*.2}}/>)}</div>
      <table className="publication-table"><thead><tr><th>Destination</th><th>Students</th><th>Share of caseload</th></tr></thead><tbody>{v.pathways.map(p=><tr key={p.label}><td>{p.label}</td><td>{p.count}</td><td>{Math.round(p.count/v.caseload*100)}%</td></tr>)}</tbody></table>
      {section('05','Progress across grades')}
      <table className="publication-table"><thead><tr><th>Grade</th><th>On track / students</th><th>Average plan completion</th></tr></thead><tbody>{v.grades.map(g=><tr key={g.grade}><td>Grade {g.grade}</td><td>{g.onTrack} / {g.total}</td><td><span className="publication-inline-meter"><i style={{width:`${g.avg}%`}}/></span>{g.avg}%</td></tr>)}</tbody></table>
      <p className="publication-caption">Overall average plan completion: {v.overallAvg}%. On-track status and plan completion are separate measures.</p>
      {section('06','Readiness milestones')}
      <div className="publication-readiness">{v.milestones.map(m=><div key={m.label}><b>{m.value}%</b><strong>{m.label}</strong><span>{m.extra}</span></div>)}</div>
      <p className="publication-source">{v.seniorsApplying} of 30 seniors have active college or postsecondary applications. Résumé completion is measured only for Grades 10–12 (90 students); senior measures use 30 students. Other readiness measures use the full caseload.</p>
    </>)}
    {kind === 'impact' && page(3, <>
      <div className="publication-eyebrow">Counseling delivery<span>Evidence / 02</span></div>
      <h1 className="publication-title small">Counseling <em>delivery.</em></h1>
      {section('07','Service & follow-through')}
      <div className="publication-service-grid">{[['Plans reviewed',v.reviewed],['Reviews pending',v.pending],['Questions answered',`${v.answered[0]} / ${v.answered[1]}`],['Announcements sent',v.announcements],['Active support flags',v.flags],['Students at risk',v.atRisk]].map(([label,value])=><div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
      {section('08','Student engagement')}
      <table className="publication-table"><thead><tr><th>Recorded activity</th><th>Count</th></tr></thead><tbody>{v.engagement.map(e=><tr key={e.label}><td>{e.label}</td><td><strong>{e.value.toLocaleString()}</strong></td></tr>)}</tbody></table>
      <p className="publication-caption">{v.touchpoints.toLocaleString()} touchpoints = simulations + saved careers + saved colleges. Counts are activity events, not unique students.</p>
      {section('09','ASCA alignment')}
      <div className="publication-asca">{v.asca.map((a,i)=><div key={a.title}><span>0{i+1}</span><h3>{a.title}</h3><ul>{a.full.map(item=><li key={item}>{item}</li>)}</ul></div>)}</div>
      <div className="publication-method"><strong>Reading this report</strong><p>Percentages are rounded to whole numbers. District targets are shown beside results; a met target is a threshold comparison, not an improvement over time. This historical sample does not include student-level evidence or a prior-period change calculation. </p></div>
    </>)}
  </div>;
}
