// Glossary contrast audit (17 Oct 2026, the light-mode pass). Paste into the
// browser console on any glossary game screen, in light mode and in dark.
// It walks every visible text line in the game, composites its background up
// the tree (stopping at gradients and images, which it skips), and returns
// the lines under WCAG AA: 4.5:1 for body text, 3:1 for 24px+ or bold
// 18.5px+. Disabled buttons show up too; contrast rules exempt them.
// Returns { url, n, low: [{ text, cls, cr, need, size }] }. low must be
// empty apart from disabled buttons. See SOP section 10.3.
(() => {
  const parse = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) { const n = c.match(/color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)(?: \/ ([\d.]+))?\)/); if (n) return [n[1] * 255, n[2] * 255, n[3] * 255, n[4] === undefined ? 1 : +n[4]]; return null; } const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return [p[0], p[1], p[2], p[3] === undefined ? 1 : p[3]]; };
  const lum = ([r, g, b]) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const over = (top, bot) => { const a = top[3]; return [top[0] * a + bot[0] * (1 - a), top[1] * a + bot[1] * (1 - a), top[2] * a + bot[2] * (1 - a), 1]; };
  const bgOf = (el) => { const stack = []; let e = el; while (e && e.nodeType === 1) { const cs = getComputedStyle(e); const c = parse(cs.backgroundColor); if (cs.backgroundImage !== 'none' && e !== document.body && e !== document.documentElement && !(c && c[3] >= 0.5)) return null; if (c && c[3] > 0) { stack.push(c); if (c[3] >= 0.99) break; } e = e.parentElement; } let base = document.documentElement.classList.contains('light') ? [240, 244, 252, 1] : [10, 14, 30, 1]; for (let i = stack.length - 1; i >= 0; i--) base = over(stack[i], base); return base; };
  const out = [];
  const root = document.querySelector('.glossary-game-shell') || document.body;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const seen = new Set();
  while (walker.nextNode()) {
    const t = walker.currentNode; if (!t.textContent.trim()) continue; const el = t.parentElement; if (seen.has(el)) continue; seen.add(el);
    const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2 || r.bottom < 0 || r.top > innerHeight * 3) continue; const cs = getComputedStyle(el); if (cs.visibility === 'hidden') continue;
    let op = 1, p = el; while (p) { op *= +getComputedStyle(p).opacity; p = p.parentElement; } if (op < 0.3) continue;
    const fg = parse(cs.color); const bg = bgOf(el); if (!fg || !bg) continue;
    const f = over([fg[0], fg[1], fg[2], fg[3] * op], bg); const cr = ratio(f, bg); const size = parseFloat(cs.fontSize); const bold = +cs.fontWeight >= 700; const need = size >= 24 || (size >= 18.5 && bold) ? 3 : 4.5;
    if (cr < need) out.push({ text: t.textContent.trim().slice(0, 40), cls: el.className.toString().slice(0, 50), cr: +cr.toFixed(2), need, size });
  }
  return { url: location.pathname + location.search, n: seen.size, low: out.slice(0, 15) };
})();
