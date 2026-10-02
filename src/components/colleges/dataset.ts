"use client";

// The full college dataset (2 Oct 2026, Chandu: "this is the dataset Usman
// gave me so we can have proper filters etc for the schools"): 5,716
// colleges from IPEDS and the College Scorecard, 2024, as the live app
// serves them. Built by scripts/colleges/build-dataset.mjs into
// public/data/colleges/: one index Browse all filters (fetched once, about
// 600 KB over the wire), and one file per school for its page.
//
// The colleges hand-built in data.ts win wherever a slug is in both: they
// carry the reviewed local photos, the reference detail and EXTRA, and For
// you is built on them (Chandu: "we dont need to change the for you schools
// content or order"). The dataset only adds the rest, plus real campus
// coordinates for distance.

import { useEffect, useState } from "react";
import { COLLEGES, type College, type Level } from "./data";

type Row = {
  s: string; n: string; c: string; st: string; sn: string;
  t: "4-year" | "2-year" | "Trade" | "Graduate"; ct: College["control"]; se: College["setting"]; sz: College["size"];
  np: number | null; fi: number | null; re: number | null; rp: number | null; g: number;
  ad: College["admission"]; ar: number | null; ef?: string; pf?: 1;
  fl?: NonNullable<College["flags"]>; rl?: string; cp?: "online";
  im?: string; ll?: [number, number]; tf?: number; u?: number;
  dg: number[]; pr?: [number, number][]; sa?: [number, number]; ac?: [number, number];
};
type Index = { imageBase: string; programs: string[]; colleges: Row[] };

const DEGREES = ["Certificate", "Associate", "Bachelor's", "Master's", "Doctorate"] as const;
const LEVEL: Record<Row["t"], Level> = { "4-year": "Bachelor's degrees", Graduate: "Bachelor's degrees", "2-year": "Associate degrees", Trade: "Certificates" };

function toCollege(r: Row, ix: Index): College {
  return {
    dataset: true,
    slug: r.s, name: r.n, city: r.c, state: r.st, stateName: r.sn,
    level: LEVEL[r.t], schoolType: r.t, control: r.ct, setting: r.se, size: r.sz,
    undergrads: r.u ?? 0, netPrice: r.np ?? null, finish: r.fi ?? null, retention: r.re ?? null, repay: r.rp ?? null,
    gradsPerYear: r.g, accreditor: "", admission: r.ad, admitRate: r.ar ?? null,
    flags: r.fl, religion: r.rl,
    image: r.im ? (r.im.startsWith("http") ? r.im : ix.imageBase.replace("{id}", r.im)) : undefined,
    latLon: r.ll, tf: r.tf ?? null, effort: r.ef ?? "unknown", faith: r.rl, portfolio: !!r.pf, campus: r.cp ?? "campus",
    degreesList: r.dg.map((i) => DEGREES[i]),
    programsList: (r.pr ?? []).map(([i, share]) => ({ name: ix.programs[i], share })),
    sat: r.sa, act: r.ac,
  };
}

let all: Promise<College[]> | null = null;

/** Every college: the dataset, with the hand-built ones in their place. */
export function loadAllColleges(): Promise<College[]> {
  all ??= fetch("/data/colleges/index.json")
    .then((r) => { if (!r.ok) throw new Error(`index ${r.status}`); return r.json() as Promise<Index>; })
    .then((ix) => {
      const mine = new Map(COLLEGES.map((c) => [c.slug, c]));
      const out: College[] = [];
      const seen = new Set<string>();
      for (const row of ix.colleges) {
        const own = mine.get(row.s);
        if (own) {
          // keep the hand-built college; borrow what it lacks for filtering
          const ds = toCollege(row, ix);
          const flags = [...new Set([...(own.flags ?? []), ...(ds.flags ?? [])])];
          out.push({ ...own, latLon: ds.latLon, schoolType: own.schoolType ?? ds.schoolType, effort: ds.effort, faith: ds.faith, portfolio: ds.portfolio, campus: ds.campus, flags: flags.length ? flags : undefined });
        } else out.push(toCollege(row, ix));
        seen.add(row.s);
      }
      for (const c of COLLEGES) if (!seen.has(c.slug)) out.push(c);
      return out;
    })
    .catch((e) => { all = null; throw e; });
  return all;
}

export function useAllColleges(): { colleges: College[] | null; error: boolean; retry: () => void } {
  const [colleges, setColleges] = useState<College[] | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let live = true;
    loadAllColleges().then((c) => { if (live) { setColleges(c); setError(false); } }).catch(() => { if (live) setError(true); });
    return () => { live = false; };
  }, [attempt]);
  return { colleges, error, retry: () => setAttempt((a) => a + 1) };
}

/** One school's page, for a college that is only in the dataset. */
export async function loadDatasetCollege(slug: string): Promise<College | null> {
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  const r = await fetch(`/data/colleges/detail/${slug}.json`);
  if (!r.ok) return null;
  const c = (await r.json()) as College;
  return { ...c, dataset: true };
}
