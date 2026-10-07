// Student-app light-mode pixel contrast check (7 Oct 2026). Run from a scratch dir with the dev server on :3000:
//   node contrast-student.mjs && python3 analyze-lm.py
// The playwright import below points at this Mac's npx cache; change it to your own playwright install.
// Writes wcag-lm/<width>-<route>.png (text made transparent) + .json (text boxes); analyze-lm.py samples the real
// background behind every text box and reports anything under 4.5:1 (3:1 large). Same method as docs/WCAG_AA_AUDIT_V4.md.
import { chromium } from '/Users/chandump/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs';
import fs from 'fs';
const routes = ['home','explore','colleges','play','connect','opportunities','profile','opportunities/courage-to-grow-scholarship'];
const b = await chromium.launch({ channel: 'chrome' });
for (const [w,h] of [[1440,1000],[375,812]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await ctx.addCookies([{ name: 'dm_gate_2', value: 'granted', domain: 'localhost', path: '/' },{ name: 'dm_gate', value: 'granted', domain: 'localhost', path: '/' }]);
  await ctx.addInitScript(() => { localStorage.setItem('dreamari-theme','light'); for (const k of ['explore','play','profile','connect','home','opportunities','colleges']) { try{ sessionStorage.setItem(`dreamari:welcome:${k}`,'1'); sessionStorage.setItem(`dreamari:splash:${k}`,'1'); }catch{} } });
  const p = await ctx.newPage();
  for (const r of routes) {
    await p.goto(`http://localhost:3000/${r}`, { waitUntil: 'networkidle', timeout: 90000 }); await p.waitForTimeout(2200);
    const cta = p.locator('button:has-text("Start exploring"), button:has-text("Start"), button:has-text("Let\'s go"), button:has-text("View My Profile"), button:has-text("Start playing"), button:has-text("Start connecting")').first();
    if (await cta.isVisible().catch(()=>false)) { await cta.click().catch(()=>{}); await p.waitForTimeout(900); }
    const els = await p.evaluate(() => {
      const out=[]; const root=document.body;
      const w=document.createTreeWalker(root, NodeFilter.SHOW_TEXT); const seen=new Set();
      while (w.nextNode()) { const t=w.currentNode; const txt=t.textContent.trim(); if(!txt) continue; const el=t.parentElement; if(!el||seen.has(el)) continue; seen.add(el);
        const cs=getComputedStyle(el); if(cs.visibility==='hidden'||cs.display==='none') continue; if(el.checkVisibility && !el.checkVisibility({opacityProperty:true,visibilityProperty:true,contentVisibilityAuto:true})) continue; if(el.closest('[aria-hidden="true"],[inert],[hidden]')) continue;
        if (el.closest('button:disabled,[aria-disabled="true"]')) continue;
        const range=document.createRange(); range.selectNodeContents(t); const rects=[...range.getClientRects()].filter(r=>r.width>1&&r.height>1); if(!rects.length) continue;
        const r=rects[0]; let clipped=false; for(let e=el.parentElement;e&&e!==root;e=e.parentElement){const c=getComputedStyle(e); if(c.overflow!=='visible'||c.overflowX!=='visible'){const pr=e.getBoundingClientRect(); if(r.right<pr.left+1||r.left>pr.right-1||r.bottom<pr.top+1||r.top>pr.bottom-1){clipped=true;break;}} if(c.transform&&c.transform!=='none'&&/matrix\(0\.[0-4]/.test(c.transform)){clipped=true;break;}} if(clipped) continue; let op=1; for(let e=el;e;e=e.parentElement){ op*=parseFloat(getComputedStyle(e).opacity||'1'); }
        if (op<0.05) continue;
        const isSvg = el instanceof SVGElement; const color = isSvg ? cs.fill : cs.color;
        out.push({ txt: txt.slice(0,60), x:r.left+scrollX, y:r.top+scrollY, w:r.width, h:r.height, color, op, fs:parseFloat(cs.fontSize), fw:parseInt(cs.fontWeight)||400, cls:(el.getAttribute('class')||el.tagName).toString().slice(0,80), tag:el.tagName });
      }
      return out;
    });
    await p.addStyleTag({ content: '*{color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important;caret-color:transparent!important} svg text,svg tspan{fill:transparent!important} input::placeholder,textarea::placeholder{color:transparent!important}' });
    await p.waitForTimeout(300);
    const file = `wcag-lm/${w}-${r.replace(/\//g,'_')}`;
    await p.screenshot({ path: file+'.png', fullPage: true });
    fs.writeFileSync(file+'.json', JSON.stringify(els));
    console.log(w, r, els.length);
  }
  await ctx.close();
}
await b.close();
