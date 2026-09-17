// Walks Joshua's Connect update on Replit (dceeai.replit.app/community-boards,
// AT&T x Connected Learning Centers) through every view, tab and control, and
// saves a screenshot plus the visible text of each state, so the reference can
// be re-captured with one command instead of clicking through it by hand.
//
// Usage:  node walk.mjs <output-dir>
// Drives the locally installed Google Chrome (no browser download).

import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT = process.argv[2] ?? "./out";
const SCREENS = join(OUT, "screens");
mkdirSync(SCREENS, { recursive: true });

const URL = "https://dceeai.replit.app/community-boards";
const log = [];
let n = 0;

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });

async function settle() { await page.waitForTimeout(700); }

async function shot(name, note = "") {
  n += 1;
  // Stable names (no sequence prefix) so docs can link them even if a step
  // is skipped on a later run; walk-text.md keeps the capture order.
  const file = `${name}.jpg`;
  await settle();
  await page.screenshot({ path: join(SCREENS, file), fullPage: true, type: "jpeg", quality: 78 });
  const text = (await page.locator("main").innerText().catch(() => page.innerText("body")))
    .replace(/\n{3,}/g, "\n\n").trim();
  log.push({ file, name, note, text });
  console.log("shot", file);
}

page.setDefaultTimeout(8000);
// Replit apps rarely reach "networkidle" (analytics keep polling), so
// navigation waits for DOM + a beat instead, with its own longer budget.
page.setDefaultNavigationTimeout(60000);
async function open(url) { await page.goto(url, { waitUntil: "domcontentloaded" }); await page.waitForTimeout(2500); }

// Click by accessible name (button/tab), falling back to visible text. Uses
// Playwright's auto-wait so a view-switch fade doesn't read as "missing".
async function click(name, { role = "button", nth = 0, exact = false } = {}) {
  await page.waitForTimeout(350);
  const candidates = [page.getByRole(role, { name, exact }).nth(nth), page.getByText(name, { exact }).nth(nth)];
  for (const loc of candidates) {
    try { await loc.click({ timeout: 6000 }); return true; } catch { /* try next */ }
  }
  console.warn("not found:", name);
  log.push({ missing: name });
  return false;
}

async function step(label, fn) {
  try { await fn(); } catch (e) { console.warn("step failed:", label, e.message); log.push({ failed: label, error: e.message }); }
}

await open(URL);
await shot("connect-communities", "Connect landing: four official communities");

await step("people tab (top level)", async () => {
  await click("PEOPLE");
  await shot("connect-people-tab", "Top-level People tab on Connect");
  await click("COMMUNITIES");
});

await step("enter AT&T community", async () => {
  await page.getByRole("button", { name: "Enter Community" }).nth(3).click();
  await page.waitForTimeout(900);
});
await shot("student-home", "Student View > Home: 3 insight cards, This Week poll, opportunities strip");

await step("about this community", async () => { await click("About this community"); await shot("student-home-about", "Header info expanded"); });
await step("like", async () => { await click("Like"); await shot("student-home-liked", "Like toggled on the first insight (inline, no count)"); });
await step("comment", async () => { await click("Comment"); await shot("student-home-comment-box", "Comment opens an inline textarea + Post"); });
await step("poll", async () => { await click("Communication"); await shot("student-home-poll-answered", "Poll: 'Your response is saved.' No results shown"); });
await step("save", async () => { await click("Save"); await shot("student-home-saved", "Save toggles to Saved"); });
await step("carousel", async () => {
  const next = page.getByRole("button", { name: "Next cards" });
  const disabled = await next.isDisabled().catch(() => true);
  if (!disabled) await next.click();
  await shot("student-home-carousel-next", disabled ? "Insight carousel: Next is disabled at desktop width (all 3 cards already fit)" : "Insight carousel advanced");
});
await step("ask -> questions", async () => { await click("Ask"); await shot("student-questions", "Ask on a card jumps to the Questions tab"); });
await step("read answer", async () => { await click("Read answer"); await shot("student-questions-answer-open", "Read answer expands inline (Hide answer)"); });
await step("show more", async () => { await click("Show more"); await shot("student-questions-show-more", "Show more reveals a third recent answer"); });
await step("submit question", async () => {
  await page.getByRole("textbox", { name: /What would you like to know/i }).fill("What does a first year in network engineering look like?");
  await page.getByRole("button", { name: "Ask", exact: true }).click();
  await shot("student-questions-submitted", "'Question submitted for moderation' + Ask another");
});
await step("opportunities", async () => { await click("opportunities"); await shot("student-opportunities", "Opportunities: internships, programs, events, scholarships"); });
await step("people", async () => { await click("people"); await shot("student-people", "People: Recommended / Most Active / by field"); });
await step("follow", async () => { await click("Follow"); await shot("student-people-following", "Follow toggles to Following and syncs across lists"); });

// Volunteer View
await step("volunteer view", async () => { await click("Volunteer View"); await click("home"); await shot("volunteer-home", "Volunteer > Home: single 'What should I do right now?' card"); });
await step("volunteer answer prompt (home)", async () => { await click("Answer prompt"); await shot("volunteer-home-answer-form", "Inline textarea + Submit answer / Cancel"); });
await step("volunteer questions", async () => { await click("questions"); await shot("volunteer-questions", "Questions waiting: two to answer"); });
await step("volunteer answer", async () => { await click("Answer", { exact: true }); await shot("volunteer-questions-answer-form", "Answer opens an inline 'Share your experience' textarea + Send answer"); });
await step("volunteer view more", async () => { await click("View more questions"); await shot("volunteer-questions-more", "Two more questions revealed"); });
await step("volunteer share", async () => { await click("share"); await shot("volunteer-share", "Share: Insight or Opportunity"); });
await step("share insight", async () => { await page.getByText("Share insight", { exact: true }).first().click(); await shot("volunteer-share-insight", "Share an insight: 3 prompt chips prefill the textarea"); await click("What is changing in your industry?"); await shot("volunteer-share-insight-prefilled", "Chip prefilled the textarea"); await click("Back", { exact: true }); });
await step("share opportunity", async () => { await page.getByText("Share opportunity", { exact: true }).first().click(); await shot("volunteer-share-opportunity", "Share an opportunity: type select (Internship, Program, Virtual Panel, Office Visit, Event, Scholarship) + description"); await click("Back", { exact: true }); });
await step("year-round", async () => { await click("Year-Round Impact"); await shot("volunteer-year-round-biweekly", "Year-Round Impact, biweekly, Sep 1-15"); });
await step("year-round sep 16", async () => { await click("Sep 16"); await shot("volunteer-year-round-sep16", "Sep 16-30: Skills + Student Pulse"); });
await step("year-round oct 1", async () => { await click("Oct 1"); await shot("volunteer-year-round-oct1", "Oct 1-15: AI at Work, CTA is Share Insight"); });
await step("year-round monthly", async () => { await click("monthly"); await shot("volunteer-year-round-monthly", "Monthly: September, Back to School + Career Access"); });
await step("year-round answer prompt", async () => { await click("Answer Prompt"); await shot("volunteer-year-round-answer-form", "Answer Prompt form"); await page.getByRole("textbox").last().fill("Ask early and write things down."); await click("Submit"); await shot("volunteer-year-round-submitted", "'Submitted for moderation'"); });
await step("year-round full year", async () => { await click("View full year"); await shot("volunteer-year-round-full-year", "All 12 months, Sep to Aug"); });

// Enterprise View
await step("enterprise program", async () => { await click("Enterprise View"); await click("program", { role: "tab" }); await click("monthly"); await shot("enterprise-program-september", "Program, monthly, September: Dreamari suggestion"); });
await step("enterprise october", async () => { await click("October"); await shot("enterprise-program-october", "October: header AI & Future of Work, AT&T topic Careers Behind AT&T"); });
await step("enterprise november", async () => { await click("November"); await shot("enterprise-program-november", "November: School Partner topic, Approve / Edit"); });
await step("enterprise december", async () => { await click("December"); await shot("enterprise-program-december", "December: Dreamari suggestion Skills That Matter"); });
await step("enterprise biweekly", async () => { await click("biweekly"); await shot("enterprise-program-biweekly", "Biweekly, Sep 1-15: Use This Topic / Suggest Another"); });
await step("enterprise topic source AT&T", async () => { await page.getByText("Your team chooses").click(); await shot("enterprise-program-source-att", "Topic Source = AT&T"); });
await step("enterprise topic source school", async () => { await page.getByText("Educators choose").click(); await shot("enterprise-program-source-school", "Topic Source = School Partner"); });
await step("enterprise topic source dreamari", async () => { await page.getByText("Suggested automatically").click(); await shot("enterprise-program-source-dreamari", "Topic Source = Dreamari"); });
await step("enterprise suggest another", async () => { await click("Suggest Another"); await shot("enterprise-program-suggest-another", "Suggest Another"); });
await step("enterprise autopilot off", async () => {
  // The switch is the one text-less button in the Program panel.
  const sw = page.locator("main button").filter({ hasNotText: /\S/ }).last();
  await sw.click(); await shot("enterprise-program-autopilot-off", "Auto-pilot switched off (no other visible change)"); await sw.click();
});
await step("enterprise impact", async () => { await click("impact", { role: "tab" }); await shot("enterprise-impact-month", "Impact, This Month"); });
await step("enterprise impact year", async () => { await click("This Year"); await shot("enterprise-impact-year", "Impact, This Year (same numbers as This Month)"); });
await step("enterprise impact trend", async () => {
  // The trend metric is a native <select>, not tabs.
  const sel = page.locator("main select").first();
  await sel.selectOption({ label: "Views" }); await shot("enterprise-impact-trend-views", "Trend metric: Views");
  await sel.selectOption({ label: "Engagements" }); await shot("enterprise-impact-trend-engagements", "Trend metric: Engagements");
});
await step("enterprise view team impact", async () => { await click("View Team Impact"); await shot("enterprise-team-via-impact", "View Team Impact lands on Team"); });
await step("enterprise team", async () => { await click("team", { role: "tab" }); await shot("enterprise-team", "Team: top contributors + roster"); });
await step("enterprise team most active", async () => { await click("Most Active"); await shot("enterprise-team-most-active", "Roster filter: Most Active"); });
await step("enterprise team needs engagement", async () => { await click("Needs Engagement"); await shot("enterprise-team-needs-engagement", "Roster filter: Needs Engagement"); });

// Related route linked from the top nav
await step("volunteer dashboard route", async () => { await open("https://dceeai.replit.app/volunteer/dashboard"); await shot("nav-volunteer-dashboard", "/volunteer/dashboard (top-nav link)"); });

writeFileSync(join(OUT, "walk-log.json"), JSON.stringify(log, null, 2));
const md = log.filter((e) => e.file).map((e) => `## ${e.file}\n${e.note}\n\n\`\`\`\n${e.text}\n\`\`\`\n`).join("\n");
writeFileSync(join(OUT, "walk-text.md"), `# Text captured per screenshot\n\nGenerated by walk.mjs on ${new Date().toISOString().slice(0, 10)}.\n\n${md}`);
await browser.close();
console.log("done:", n, "screenshots; misses:", log.filter((e) => e.missing || e.failed).length);
