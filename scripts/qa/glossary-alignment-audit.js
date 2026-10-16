// Glossary alignment audit (17 Oct 2026, Chandu: "Lets make sure there is
// symmetry and proper alignment everywhere"). Paste into the browser console
// on any /play/glossary/<slug>?lesson=N&q=M page (or run it through a
// browser automation tool) at 1440x900 and at 375x812, in ?theme=drift and
// ?theme=signal. It returns the screen's tile groups and every issue it can
// measure: tiles in one row with different heights or widths, a short last
// row that is not centred, stacked blocks whose edges do not line up, a
// bubble or HUD that does not share the column's edges, a button off centre.
// An empty `issues` list is the bar. It does not see colour, clipping inside
// a tile, or a digit sitting low in its box; look at those by eye.
(() => {
  const SEL = ['.glossary-option', '.glossary-document-option', '.glossary-match-tile', '.glossary-sort-token', '.glossary-sort-bucket', '.glossary-word-chip', '.glossary-path-option', '.glossary-power-chip'];
  const vis = (e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 4 && r.height > 4 && cs.visibility !== 'hidden' && cs.display !== 'none' && !e.closest('[aria-hidden="true"]'); };
  const issues = [];
  const groups = new Map();
  for (const s of SEL) for (const e of document.querySelectorAll(s)) { if (!vis(e) || e.classList.contains('glossary-power-ghost')) continue; const p = e.parentElement; if (!groups.has(p)) groups.set(p, { sel: s, els: [] }); groups.get(p).els.push(e); }
  for (const [p, g] of groups) {
    if (g.els.length < 2) continue;
    const rects = g.els.map((e) => e.getBoundingClientRect());
    const rows = [];
    rects.forEach((r) => { const row = rows.find((x) => Math.abs(x.top - r.top) < 6); if (row) row.items.push(r); else rows.push({ top: r.top, items: [r] }); });
    const chip = g.sel.includes('power-chip') || g.sel.includes('word-chip');
    rows.forEach((row, i) => {
      const hs = row.items.map((r) => r.height), ws = row.items.map((r) => r.width);
      if (row.items.length > 1 && Math.max(...hs) - Math.min(...hs) > 3 && !chip) issues.push(`${g.sel} row ${i + 1}: heights differ by ${Math.round(Math.max(...hs) - Math.min(...hs))}px`);
      if (row.items.length > 1 && Math.max(...ws) - Math.min(...ws) > 3 && !chip) issues.push(`${g.sel} row ${i + 1}: widths differ by ${Math.round(Math.max(...ws) - Math.min(...ws))}px`);
    });
    if (rows.length > 1) {
      const last = rows[rows.length - 1], first = rows[0];
      if (last.items.length < first.items.length) {
        const pr = p.getBoundingClientRect();
        const left = Math.min(...last.items.map((r) => r.left)) - pr.left, right = pr.right - Math.max(...last.items.map((r) => r.right));
        if (Math.abs(left - right) > 8) issues.push(`${g.sel}: last row of ${last.items.length} (rows of ${first.items.length}) is not centred (${Math.round(left)} vs ${Math.round(right)}px)`);
      }
    }
  }
  const blocks = [...document.querySelectorAll('.glossary-scene, .glossary-sentence-card, .glossary-chain, .glossary-profit-builder, .glossary-option-list, .glossary-document-list, .glossary-sort-tray, .glossary-sort-grid, .glossary-match-up, .glossary-multi-select, .glossary-type-term, .glossary-power-bank, .glossary-power-paragraph')].filter(vis);
  const er = blocks.map((b) => b.getBoundingClientRect());
  const name = (b) => b.className.split(' ').find((x) => x.startsWith('glossary-'));
  for (let i = 1; i < er.length; i++) if (Math.abs(er[0].left - er[i].left) > 6 || Math.abs(er[0].right - er[i].right) > 6) issues.push(`edge: ${name(blocks[i])} [${Math.round(er[i].left)}-${Math.round(er[i].right)}] vs ${name(blocks[0])} [${Math.round(er[0].left)}-${Math.round(er[0].right)}]`);
  const col = document.querySelector('.glossary-question-screen');
  const guide = document.querySelector('.glossary-question-guide');
  const hud = document.querySelector('.glossary-mastery-hud');
  if (col && guide) { const gr = guide.getBoundingClientRect(), cr = col.getBoundingClientRect(); if (Math.abs(gr.right - cr.right) > 6) issues.push(`bubble right ${Math.round(gr.right)} vs column right ${Math.round(cr.right)}`); }
  if (col && hud) { const hr = hud.getBoundingClientRect(), cr = col.getBoundingClientRect(); if (Math.abs(hr.left - cr.left) > 6 || Math.abs(hr.right - cr.right) > 6) issues.push(`HUD ${Math.round(hr.left)}-${Math.round(hr.right)} vs column ${Math.round(cr.left)}-${Math.round(cr.right)}`); }
  for (const b of document.querySelectorAll('.glossary-qa-check')) { if (!vis(b) || !er[0]) continue; const br = b.getBoundingClientRect(); const c = (er[0].left + er[0].right) / 2, bc = (br.left + br.right) / 2; if (Math.abs(c - bc) > 6 && br.width < er[0].right - er[0].left - 12) issues.push(`button off centre by ${Math.round(bc - c)}px`); }
  return { screen: location.search, groups: [...groups.values()].map((g) => `${g.sel} x${g.els.length}`), issues };
})();
