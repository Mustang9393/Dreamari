// Run with Node 24: node --test scripts/qa/career-search.test.mjs
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import test from "node:test";

// Resolve the app's extensionless TypeScript imports using Node's native
// type stripping, so regressions run against the real catalog and scorer.
registerHooks({
  resolve(specifier, context, nextResolve) {
    try { return nextResolve(specifier, context); }
    catch (error) {
      if (specifier.startsWith(".")) return nextResolve(`${specifier}.ts`, context);
      throw error;
    }
  },
});
const { searchCareers, relatedTerms } = await import("../../src/components/app/careerSearch.ts");
const { ALL_CATALOG_CAREERS } = await import("../../src/components/app/catalog.ts");
const titles = (query, world) => searchCareers(query, world).map(({ career }) => career.title).sort();
const aviation = ["Aerospace Engineer", "Air Traffic Controller", "Airline Pilot", "Aviation Maintenance Technician", "Commercial Pilot", "Drone Pilot", "Flight Attendant"].sort();

test("aviation excludes unrelated transport and animation careers", () => {
  assert.deepEqual(titles("aviation"), aviation);
  assert.equal(searchCareers("aviation")[0].career.title, "Aviation Maintenance Technician");
});
test("aviation typos and prefixes retain the relevant set", () => {
  for (const query of ["avaiation", "aviaton", "AVIA"]) assert.deepEqual(titles(query), aviation);
});
test("planes finds aircraft careers without ground or sea transport", () => {
  assert.deepEqual(titles("planes"), aviation.filter((title) => title !== "Drone Pilot"));
});
test("animation does not match animals through a shared stem", () => {
  assert.deepEqual(titles("animation"), ["Animator"]);
});
test("nurse and coding do not expand to their entire worlds", () => {
  assert.deepEqual(titles("nurse"), ["Licensed Practical Nurse", "Nurse Anesthetist", "Nurse Practitioner", "Registered Nurse"]);
  assert.deepEqual(titles("coding"), ["Quant", "Software Engineer"]);
});
test("multiword queries require every word", () => {
  assert.deepEqual(titles("software engineer"), ["Software Engineer"]);
  assert.deepEqual(titles("investment banking"), ["Investment Banking"]);
  assert.deepEqual(titles("air traffic"), ["Air Traffic Controller"]);
  assert.deepEqual(titles("pilot accountant"), []);
});
test("explicit categories and their typos still browse a whole world", () => {
  const finance = ALL_CATALOG_CAREERS.filter((career) => career.world === "Business & Finance").map((career) => career.title).sort();
  for (const query of ["finance", "finanace", "Business & Finance"]) assert.deepEqual(titles(query), finance);
  const arts = ALL_CATALOG_CAREERS.filter((career) => career.world === "Arts, Media & Sport").map((career) => career.title).sort();
  assert.deepEqual(titles("Arts, Media & Sport"), arts);
});
test("world filters constrain topic results and do not revive fuzzy noise", () => {
  assert.deepEqual(titles("aviation", "Fixing Machines & Engines"), ["Aviation Maintenance Technician"]);
  assert.deepEqual(titles("aviation", "Arts, Media & Sport"), []);
});
test("word forms and career typos still work", () => {
  assert.deepEqual(titles("plumbing"), ["Plumber"]);
  assert.deepEqual(titles("welding"), ["Welder"]);
  assert.deepEqual(titles("softwrae engineer"), ["Software Engineer"]);
});
test("empty and unknown queries return the existing no-match state", () => {
  for (const query of ["", "   ", "!!!", "zzzzzz"]) assert.deepEqual(titles(query), []);
  assert.ok(relatedTerms("aviation", searchCareers("aviation")).length > 0);
});
