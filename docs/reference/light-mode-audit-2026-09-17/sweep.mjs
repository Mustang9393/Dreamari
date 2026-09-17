// Light-mode sweep: forces the app's light theme (localStorage dreamari-theme)
// and screenshots every route at desktop and phone widths, plus the modals we
// can open with a click. Output: <out>/<route>--<width>.jpg
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const OUT = process.argv[2] ?? "./screens";
mkdirSync(OUT, { recursive: true });
const BASE = "http://localhost:3000";

// [name, path, optional actions after load]
const ROUTES = [
  ["landing", "/"],
  ["home", "/home"],
  ["explore", "/explore"],
  ["career-detail", "/career/investment-banking"],
  ["career-detail-connect-modal", "/career/investment-banking", async (p) => { await p.getByRole("button", { name: "Connect", exact: true }).first().click(); }],
  ["career-detail-connect-people", "/career/investment-banking", async (p) => { await p.getByRole("button", { name: "Connect", exact: true }).first().click(); await p.waitForTimeout(600); await p.getByText("Find professionals to follow").click(); }],
  ["career-detail-video", "/career/investment-banking", async (p) => { await p.getByText(/Watch Corporate Office Tour/i).first().click(); }],
  ["career-report", "/career-report"],
  ["colleges", "/colleges"],
  ["college-detail", "/colleges/rutgers-university-new-brunswick"],
  ["connect", "/connect"],
  ["connect-board", "/connect?board=business-money"],
  ["connect-people", "/connect", async (p) => { await p.getByRole("button", { name: /^people$/i }).first().click(); }],
  ["connect-events", "/connect", async (p) => { await p.getByRole("button", { name: /^events$/i }).first().click(); }],
  ["connect-pro-dashboard", "/connect?dashboard=pro-okafor"],
  ["play-hub", "/play"],
  ["play-level1", "/play/investment-banking?level=1"],
  ["play-connect-interstitial", "/play/investment-banking?level=1", async (p) => { await p.getByRole("button", { name: /Demo: jump to Connect/i }).click(); await p.waitForTimeout(600); await p.getByText("React to advice from a professional").click(); }],
  ["play-glossary", "/play/glossary/investment-banking"],
  ["profile-overview", "/profile?tab=overview"],
  ["profile-plan", "/profile?tab=plan"],
  ["profile-report", "/profile?tab=report"],
  ["profile-resume", "/profile?tab=resume"],
  ["profile-routes", "/profile?tab=routes"],
  ["profile-locker", "/profile?tab=locker"],
  ["profile-settings", "/profile?tab=settings"],
  ["resume-builder", "/resume-builder"],
  ["signup", "/signup"],
  ["gate", "/gate"],
  ["flow-build", "/flow"],
  ["flow-cinematic", "/flow/cinematic"],
  ["match-grid", "/match-grid"],
  ["match-lab", "/match-lab"],
  ["progress-lab", "/progress-lab"],
];
const WIDTHS = [[1280, 900], [390, 844]];

const browser = await chromium.launch({ channel: "chrome", headless: true });
const ctx = await browser.newContext({ colorScheme: "light" });
// The preview gate (src/middleware.ts) wants this cookie; without it every
// route redirects to /gate.
await ctx.addCookies([{ name: "dm_gate", value: "granted", domain: "localhost", path: "/" }]);
await ctx.addInitScript(() => { try { localStorage.setItem("dreamari-theme", "light"); localStorage.setItem("dreamari-welcome-seen", "1"); } catch {} });
const page = await ctx.newPage();
page.setDefaultTimeout(8000);
page.setDefaultNavigationTimeout(60000);
const problems = [];

for (const [w, h] of WIDTHS) {
  await page.setViewportSize({ width: w, height: h });
  for (const [name, path, act] of ROUTES) {
    try {
      await page.goto(BASE + path, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(1800);
      if (act) { try { await act(page); await page.waitForTimeout(900); } catch (e) { problems.push(`${name}@${w}: action failed: ${e.message.split("\n")[0]}`); } }
      const cls = await page.evaluate(() => document.documentElement.className);
      if (!/\blight\b/.test(cls)) problems.push(`${name}@${w}: html class is "${cls}" (not light)`);
      await page.screenshot({ path: join(OUT, `${name}--${w}.jpg`), fullPage: true, type: "jpeg", quality: 72 });
      console.log("ok", name, w);
    } catch (e) {
      problems.push(`${name}@${w}: ${e.message.split("\n")[0]}`);
    }
  }
}
await browser.close();
console.log("\nPROBLEMS:\n" + (problems.join("\n") || "none"));
