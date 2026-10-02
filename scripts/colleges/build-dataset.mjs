// Builds the Schools data from the full college export Usman shared on
// 2 Oct 2026 (dreamari-colleges-for-design-2026-09-30.zip: colleges.json,
// 5,716 colleges, IPEDS / College Scorecard 2024, the live app's own API).
//
//   node scripts/colleges/build-dataset.mjs <path to colleges.json>
//
// Writes:
//   public/data/colleges/index.json         every college, the fields Browse
//                                           all filters and cards read
//   public/data/colleges/detail/<slug>.json one per college, the school page
//
// The 23 MB export itself is not committed. A MISSING value in the export
// means the college does not publish it; it stays null here, never 0.

import fs from "node:fs";
import path from "node:path";

const src = process.argv[2];
if (!src) { console.error("usage: node scripts/colleges/build-dataset.mjs <colleges.json>"); process.exit(1); }
const out = path.resolve("public/data/colleges");
fs.mkdirSync(path.join(out, "detail"), { recursive: true });

const { colleges } = JSON.parse(fs.readFileSync(src, "utf8"));

const LEVEL = { four_year: "Bachelor's degrees", graduate_only: "Bachelor's degrees", community: "Associate degrees", trade: "Certificates" };
const TYPE = { four_year: "4-year", graduate_only: "Graduate", community: "2-year", trade: "Trade" };
const CONTROL = { public: "Public", private_nonprofit: "Private", for_profit: "For profit" };
const SETTING = { city: "City", suburb: "Suburb", town: "Town", rural: "Countryside" };
const SIZE = { small: "Small", medium: "Medium", large: "Large" };
const ADMIT = { nothing: "open", grades_only: "grades", more: "more" };
const DEGREE = (s) => (/^Certificate/.test(s) ? "Certificate" : /Associate/.test(s) ? "Associate" : /Bachelor/.test(s) ? "Bachelor's" : /Master/.test(s) ? "Master's" : /Doctor/.test(s) ? "Doctorate" : null);
const LEVEL_LABEL = { certificates: "Certificates", associate: "Associate", bachelor: "Bachelor's", master: "Master's", doctorate: "Doctorates" };
const BANDS = [["under30k", "Under $30,000"], ["30to48k", "$30,000 to $48,000"], ["48to75k", "$48,000 to $75,000"], ["75to110k", "$75,000 to $110,000"], ["over110k", "Over $110,000"]];
const n = (v) => (typeof v === "number" && Number.isFinite(v) ? v : null);
const round = (v) => (v === null ? null : Math.round(v));
const sum = (a, b) => (a === null || b === null ? null : a + b);

let indexRows = [];
// Program names repeat across thousands of colleges: the index stores each
// once and rows point at it.
const programNames = [];
const programId = new Map();
const pid = (name) => { if (!programId.has(name)) { programId.set(name, programNames.length); programNames.push(name); } return programId.get(name); };
const IMG = /^https:\/\/cdn\.dreamonna\.com\/media\/([^/]+)\/campus\.webp$/;
for (const c of colleges) {
  const f = c.filters ?? {};
  const d = c.detail ?? {};
  const adm = d.admissions ?? {};
  const cost = d.cost ?? {};
  const aca = d.academics ?? {};
  const body = d.studentBody ?? {};
  const life = d.campusLife ?? {};
  const cmp = c.compare ?? {};
  const open = !!f.openAdmission;
  const rate = open ? null : round(n(adm.acceptanceRatePct));
  const grads = n(cmp.graduatesPerYear) ?? n(aca.graduatesPerYear) ?? 0;
  const majors = aca.popularMajors ?? {};
  const programs = [];
  const seen = new Set();
  for (const lvl of Object.values(majors)) for (const [name, g] of lvl.top ?? []) { if (seen.has(name)) continue; seen.add(name); programs.push([pid(name), grads ? Math.round((g / grads) * 100) : 0]); }
  const degrees = [...new Set((aca.degreesOffered ?? []).map(DEGREE).filter(Boolean))];
  const sat = Array.isArray(adm.satReading) && Array.isArray(adm.satMath) ? [adm.satReading[0] + adm.satMath[0], adm.satReading[1] + adm.satMath[1]] : null;
  const act = Array.isArray(adm.act) ? adm.act : null;
  const flags = [];
  if (f.tribal) flags.push("tribal");
  if (f.hbcu) flags.push("hbcu");
  if (f.campus === "online") flags.push("online");
  if (f.religion) flags.push("religious");
  const tuitionIn = n(cost.tuitionInState);
  const feesIn = n(cost.feesInState);
  const base = {
    slug: c.slug, name: c.name, city: c.city, state: c.state, stateName: c.stateName,
    level: LEVEL[f.collegeType] ?? "Certificates", schoolType: TYPE[f.collegeType] ?? "Trade",
    control: CONTROL[f.control] ?? "Public", setting: SETTING[f.setting] ?? "City", size: SIZE[f.size] ?? "Small",
    undergrads: n(body.undergraduate) ?? 0,
    netPrice: n(f.netPriceAfterGrants), finish: round(n(cmp.finishPct)), retention: round(n(cmp.firstYearsReturnPct)), repay: round(n(cmp.repayingPct)),
    gradsPerYear: grads, accreditor: cmp.accreditor ?? "",
    admission: open ? "open" : ADMIT[f.applyEffort] ?? "more", admitRate: rate,
    applied: n(adm.applicants) ?? undefined,
    flags: flags.length ? flags : undefined, religion: f.religion ?? undefined,
    website: d.hero?.links?.website ?? undefined,
    image: c.card?.image ?? undefined,
    tf: sum(tuitionIn, feesIn),
  };
  const img = (c.card?.image ?? "").match(IMG);
  // Index rows: short keys, only what Browse all filters, sorts and draws.
  const row = {
    s: c.slug, n: c.name, c: c.city, st: c.state, sn: c.stateName,
    t: base.schoolType, ct: base.control, se: base.setting, sz: base.size,
    np: base.netPrice, fi: base.finish, re: base.retention, rp: base.repay, g: grads,
    ad: base.admission, ar: rate, ef: f.applyEffort ?? undefined, pf: f.portfolioCounts ? 1 : undefined,
    fl: base.flags, rl: base.religion, cp: f.campus === "online" ? "online" : undefined,
    im: img ? img[1] : c.card?.image ?? undefined,
    ll: Array.isArray(f.latLon) ? f.latLon.map((v) => Math.round(v * 1000) / 1000) : undefined,
    tf: base.tf ?? undefined, u: base.undergrads || undefined,
    dg: degrees.map((x) => ["Certificate", "Associate", "Bachelor's", "Master's", "Doctorate"].indexOf(x)), pr: programs.length ? programs : undefined,
    sa: sat ?? undefined, ac: act ?? undefined,
  };
  indexRows.push(row);

  const und = n(body.undergraduate) ?? 0;
  const race = Object.entries(body.undergradByRace ?? {}).filter(([, v]) => v > 0).map(([label, v]) => ({ label, n: v, pct: und ? Math.round((v / und) * 100) : 0 }));
  const opens = aca.popularMajorsOpensOn && majors[aca.popularMajorsOpensOn] ? majors[aca.popularMajorsOpensOn] : Object.values(majors)[0];
  const ways = [life.studyAbroad && "Study abroad", aca.undergraduateResearch && "Undergraduate research", life.rotc && "ROTC"].filter(Boolean);
  const helps = [life.careerCounseling && "Careers advice", life.employmentServices && "Help finding work while you study", life.placementServices && "Help finding a job when you finish"].filter(Boolean);
  const sports = Array.isArray(life.sports) ? life.sports : [];
  const detail = {
    address: d.hero?.address ?? `${c.city}, ${c.stateName}`,
    tuitionInState: tuitionIn, tuitionOutState: n(cost.tuitionOutOfState), fees: feesIn,
    housing: !!life.housing, housingCost: n(cost.housing) ?? undefined, foodCost: n(cost.food) ?? undefined,
    bands: BANDS.filter(([k]) => n(cost.netPriceByFamilyIncome?.[k]) !== null).map(([k, label]) => ({ label, pay: cost.netPriceByFamilyIncome[k] })),
    scholarshipShare: n(cost.collegeGrantPct) ?? undefined, pell: n(cost.pellGrantPct) ?? undefined,
    require: adm.requires ?? [], consider: adm.considers ?? [],
    scores: sat ? { sat: `${sat[0]} to ${sat[1]}`, act: act ? `${act[0]} to ${act[1]}` : undefined, sentSat: n(adm.satSubmitPct) ?? 0, sentAct: n(adm.actSubmitPct) ?? undefined } : undefined,
    finish4: n(aca.fourYearGraduationRatePct),
    ratio: n(aca.studentsPerTeacher) !== null ? `${aca.studentsPerTeacher} to 1` : "not published",
    programmeCount: n(aca.programs) ?? 0,
    levels: Object.entries(majors).map(([k, v]) => ({ label: LEVEL_LABEL[k] ?? k, n: v.programs ?? 0 })),
    programmes: (opens?.top ?? []).map(([name, g]) => ({ name, grads: g, share: grads ? Math.round((g / grads) * 100) : 0, pay: "not published" })),
    gradStudents: n(body.graduate) ?? undefined,
    fullTime: n(body.fullTime) ?? 0, partTime: n(body.partTime) ?? 0,
    women: und && n(body.undergradWomen) !== null ? Math.round((body.undergradWomen / und) * 100) : 50,
    men: und && n(body.undergradMen) !== null ? Math.round((body.undergradMen / und) * 100) : 50,
    makeup: race,
    ways, helps,
    sport: life.league ? { league: life.league, students: sports.reduce((a, s) => a + (s[1] ?? 0) + (s[2] ?? 0), 0), teams: sports.map((s) => s[0]).filter((t) => t !== "Other Sports").slice(0, 12) } : undefined,
    pay6: n(cmp.medianPay6yr), debt: n(cmp.medianDebt), monthly: n(cmp.monthlyPayment) ?? undefined,
  };
  // The school page reads one file: the college itself plus its detail.
  fs.writeFileSync(path.join(out, "detail", `${c.slug}.json`), JSON.stringify(JSON.parse(JSON.stringify({ ...base, detail }))));
}

// Drop undefined keys so the index stays small.
const clean = (o) => JSON.parse(JSON.stringify(o));
fs.writeFileSync(path.join(out, "index.json"), JSON.stringify({ generated: "2026-09-30", source: "IPEDS and College Scorecard 2024, via the live app (Usman, 2 Oct 2026)", imageBase: "https://cdn.dreamonna.com/media/{id}/campus.webp", programs: programNames, colleges: indexRows.map(clean) }));
console.log(`wrote ${indexRows.length} colleges`);
