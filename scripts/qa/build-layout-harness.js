// Build flow layout QA harness. Runs in the page. Walks every step, measuring
// the HUD, the centered middle block and the footer, and reports anything that
// moves between steps, overlaps, or lacks a Back button.
(async function run() {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const btns = () => [...document.querySelectorAll("button")];
  const byText = (t) => btns().find((b) => b.textContent.trim() === t);
  const footer = () => document.querySelector(".flow-sticky-footer");
  const rows = [];
  const measure = (label) => {
    const hud = [...document.querySelectorAll("span")].find((s) => s.textContent.trim() === "BUILD");
    const f = footer();
    const middle = f ? f.previousElementSibling : null;
    const kids = middle ? [...middle.children] : [];
    const first = kids[0]?.getBoundingClientRect();
    const last = kids[kids.length - 1]?.getBoundingClientRect();
    const mr = middle?.getBoundingClientRect();
    const fr = f?.getBoundingClientRect();
    rows.push({
      step: label,
      hudTop: hud ? Math.round(hud.getBoundingClientRect().top) : null,
      footerTop: fr ? Math.round(fr.top) : null,
      footerBottom: fr ? Math.round(fr.bottom) : null,
      gapAbove: first && mr ? Math.round(first.top - mr.top) : null,
      gapBelow: last && mr ? Math.round(mr.bottom - last.bottom) : null,
      contentBottomVsFooter: last && fr ? Math.round(last.bottom - fr.top) : null,
      middleScrolls: middle ? middle.scrollHeight > middle.clientHeight + 1 : null,
      hasPrev: !!byText("Previous"),
    });
  };
  const next = async () => {
    const f = footer();
    const b = f ? [...f.querySelectorAll("button")].pop() : null;
    if (!b || b.disabled) return false;
    b.click();
    await wait(800);
    return true;
  };
  const label = () => (document.body.innerText.split("\n").filter(Boolean)[2] || "").slice(0, 28);

  // Interests: two worlds
  btns().find((b) => /Arts, Media/.test(b.textContent))?.click(); await wait(150);
  btns().find((b) => /Business & Money/.test(b.textContent))?.click(); await wait(300);
  measure("interests"); if (!(await next())) return JSON.stringify({ stuck: "interests", rows });
  // Subjects: first two options inside the card
  const mid = footer()?.previousElementSibling; const opts = mid ? [...mid.querySelectorAll("button")] : [];
  opts[0]?.click(); await wait(120); opts[1]?.click(); await wait(300);
  measure("subjects"); if (!(await next())) return JSON.stringify({ stuck: "subjects", rows });
  byText("Fast pace")?.click(); await wait(120); byText("Solo")?.click(); await wait(300);
  measure("workVibe"); if (!(await next())) return JSON.stringify({ stuck: "workVibe", rows });
  measure("milestone"); if (!(await next())) return JSON.stringify({ stuck: "milestone", rows });
  btns().find((b) => /Work after HS/.test(b.textContent))?.click(); await wait(600);
  measure("education"); if (!(await next())) return JSON.stringify({ stuck: "education", rows });
  btns().find((b) => /\$50,000/.test(b.textContent))?.click(); await wait(300);
  measure("cost"); if (!(await next())) return JSON.stringify({ stuck: "cost", rows });
  document.querySelector('path[data-code="TX"]')?.dispatchEvent(new MouseEvent("click", { bubbles: true })); await wait(300);
  measure("location"); if (!(await next())) return JSON.stringify({ stuck: "location", rows });
  measure("profile");
  // Profile may need inputs; try filling any text inputs, then advance.
  [...document.querySelectorAll("input")].forEach((i) => { if (i.type === "text" || i.type === "email" || !i.type) { i.value = "Test"; i.dispatchEvent(new Event("input", { bubbles: true })); } });
  await wait(200);
  if (await next()) measure("complete");
  return JSON.stringify({ vh: innerHeight, vw: innerWidth, rows });
})();
