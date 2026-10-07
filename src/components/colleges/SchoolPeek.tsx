"use client";

// A school opens as a sheet, like a Top 3 career (8 Oct 2026, Chandu:
// "Everything like a detail page in student app including career detail,
// school detail etc should also open like the cards in top 3"). The school
// page's own numbers, in the student's words: what it costs your family,
// how to get in, how students do. Save and the full page are the two ways on.

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Bookmark, BookmarkCheck } from "lucide-react";
import { PeekLine, PeekList, PeekSheet, type PeekFact, type PeekTab } from "@/components/app/PeekSheet";
import type { College } from "./data";
import { CollegePicture, useSaved } from "./shared";

type Tab = "cost" | "in" | "results";
const KIND: Record<College["level"], string> = { "Certificates": "Trade school", "Associate degrees": "2-year college", "Bachelor's degrees": "4-year college" };
const pct = (n: number | null | undefined) => (n === null || n === undefined ? "Not listed" : `${n}%`);
// a negative band (grants beyond the cost) reads as paying nothing
const usd = (n: number | null | undefined) => (n === null || n === undefined ? "Not listed" : `$${Math.max(0, n).toLocaleString()}`);
const short = (n: number) => (n < 1000 ? `$${Math.max(0, Math.round(n))}` : n < 10000 ? `$${(n / 1000).toFixed(1)}K` : `$${Math.round(n / 1000)}K`);

export function SchoolPeek({ list, index, onIndex, onClose }: { list: College[]; index: number; onIndex: (i: number) => void; onClose: () => void }) {
  const c = list[index];
  const [saved, toggle] = useSaved();
  const [tab, setTab] = useState<Tab>("cost");
  const d = c.detail;
  const on = saved.has(c.slug);
  const facts: PeekFact[] = [
    { label: "Cost after aid", value: c.netPrice === null ? "Not listed" : `${short(c.netPrice)}/yr` },
    { label: "Finish", value: pct(c.finish) },
    { label: "Get in", value: c.admitRate === null ? "Open" : `${c.admitRate}%` },
  ];
  const tabs: PeekTab<Tab>[] = [{ key: "cost", label: "Cost" }, { key: "in", label: "Getting In" }, { key: "results", label: "Results" }];
  return (
    <PeekSheet<Tab>
      id={c.slug} accent="var(--primary)" chip={`${KIND[c.level]} · ${c.city}, ${c.state}`} title={c.name} titleStyle={{ fontFamily: "var(--font-display)", fontWeight: 700, textTransform: "none" }}
      art={<CollegePicture c={c} sizes="420px" className="h-full w-full" />}
      lede={`${c.control} school. ${c.undergrads.toLocaleString()} students. ${c.setting} campus.`}
      facts={facts} tabs={tabs} tab={tab} onTab={setTab}
      count={list.length} index={index} onIndex={(i) => { setTab("cost"); onIndex(i); }} onClose={onClose}
      footer={
        <>
          <button type="button" aria-pressed={on} onClick={() => toggle(c.slug)} className="cpk-cta dm-solid">
            {on ? <BookmarkCheck className="h-4 w-4" aria-hidden /> : <Bookmark className="h-4 w-4" aria-hidden />}{on ? "Saved" : "Save School"}
          </button>
          <Link href={`/colleges/${c.slug}`} data-peek-skip className="cpk-quiet dm-tap">Full page <ArrowUpRight className="h-4 w-4" aria-hidden /></Link>
        </>
      }
      body={
        <>
          {tab === "cost" && (
            <>
              <section className="cpk-section">
                <h3 className="cpk-section-title">What families pay</h3>
                <ul className="flex flex-col">
                  <PeekLine label="Most families, after grants" value={c.netPrice === null ? "Not listed" : `${usd(c.netPrice)} a year`} strong />
                  {d?.bands.map((b) => <PeekLine key={b.label} label={`Family income ${b.label}`} value={`${usd(b.pay)} a year`} />)}
                </ul>
                <p className="cpk-note">Grants are money you do not pay back.</p>
              </section>
              {d && (
                <section className="cpk-section">
                  <h3 className="cpk-section-title">Price before aid</h3>
                  <ul className="flex flex-col">
                    <PeekLine label="Tuition, in state" value={usd(d.tuitionInState)} />
                    {d.tuitionOutState !== d.tuitionInState && <PeekLine label="Tuition, out of state" value={usd(d.tuitionOutState)} />}
                    {d.housingCost ? <PeekLine label="Housing" value={usd(d.housingCost)} /> : null}
                  </ul>
                </section>
              )}
            </>
          )}
          {tab === "in" && (
            <>
              <section className="cpk-section">
                <h3 className="cpk-section-title">{c.admitRate === null ? "Anyone can enroll" : `${c.admitRate} of 100 get in`}</h3>
                <p className="cpk-body">{c.admission === "open" ? "You need a diploma or a GED. That's it." : c.admission === "grades" ? "Your grades matter most." : c.admission === "portfolio" ? "Your portfolio or audition counts." : "They look at grades, essays and more."}</p>
              </section>
              {d && d.require.length > 0 && <section className="cpk-section"><h3 className="cpk-section-title">You need</h3><PeekList items={d.require} /></section>}
              {d && d.consider.length > 0 && <section className="cpk-section"><h3 className="cpk-section-title">They also look at</h3><PeekList items={d.consider} /></section>}
              {d?.scores && <section className="cpk-section"><h3 className="cpk-section-title">Test scores</h3><ul className="flex flex-col"><PeekLine label="SAT, middle half" value={d.scores.sat} />{d.scores.act && <PeekLine label="ACT, middle half" value={d.scores.act} />}</ul></section>}
            </>
          )}
          {tab === "results" && (
            <>
              <section className="cpk-section">
                <h3 className="cpk-section-title">How students do</h3>
                <ul className="flex flex-col">
                  <PeekLine label="Finish in six years" value={pct(c.finish)} strong />
                  <PeekLine label="Come back for year two" value={pct(c.retention)} />
                  <PeekLine label="Pay back their loans" value={pct(c.repay)} />
                </ul>
              </section>
              {d && d.programmes.length > 0 && (
                <section className="cpk-section">
                  <h3 className="cpk-section-title">Biggest programs</h3>
                  <ul className="flex flex-col">{[...d.programmes].sort((a, b) => b.grads - a.grads).slice(0, 5).map((p) => <PeekLine key={p.name} label={p.name} value={p.pay} />)}</ul>
                  <p className="cpk-note">Typical pay a few years after school.</p>
                </section>
              )}
            </>
          )}
        </>
      }
    />
  );
}
