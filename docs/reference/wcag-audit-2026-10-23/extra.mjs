import { chromium } from 'playwright';
import fs from 'fs';
const B=process.env.B||'http://localhost:3089';
const SURF=['home','explore','match','play','connect','profile','opportunities','colleges','career','resume','build','glossary','counselor','leaderboard','report','flow','signup'];
const b=await chromium.launch();
const mk=async(opts)=>{const c=await b.newContext({viewport:{width:1366,height:768},...opts});await c.addCookies([{name:'dm_gate_2',value:'granted',url:B}]);await c.addInitScript((surf)=>{try{for(const s of surf){sessionStorage.setItem(`dreamari:welcome:${s}:session`,'1');localStorage.setItem(`dreamari:welcome:${s}`,'1')}}catch{}},SURF);return c.newPage()};
const go=async(p,r)=>{try{await p.goto(B+r,{waitUntil:'networkidle',timeout:60000})}catch{};await p.waitForTimeout(3000)};
const out={};
// reduced motion: running animations after settle, with reduce vs not
for(const r of ['/','/home','/explore','/play','/opportunities','/profile','/connect','/counselor?view=overview&v=4','/play/investment-banking','/flow']){
  const p1=await mk({reducedMotion:'reduce'});await go(p1,r);
  const red=await p1.evaluate(async()=>{const a=document.getAnimations().filter(x=>x.playState==='running');
    // framer/JS motion: sample transforms of all elements twice
    const els=[...document.querySelectorAll('body *')].slice(0,4000);const snap=()=>els.map(e=>getComputedStyle(e).transform+getComputedStyle(e).opacity);const s1=snap();await new Promise(r=>setTimeout(r,1200));const s2=snap();
    const moving=els.filter((e,i)=>s1[i]!==s2[i]&&e.getBoundingClientRect().width>8);
    return {cssAnims:a.length,cssNames:[...new Set(a.map(x=>x.animationName||x.id||'waapi'))].slice(0,8),jsMoving:moving.length,jsEx:moving.slice(0,5).map(e=>e.tagName+'.'+String(e.className).slice(0,40))}});
  out['motion '+r]=red; await p1.context().close();
}
// forced colors screenshots
for(const r of ['/home','/opportunities','/signup','/counselor?view=students&v=4','/play/investment-banking']){
  const p=await mk({forcedColors:'active',colorScheme:'dark'});await go(p,r);await p.screenshot({path:`shots/forced_${r.replace(/[^a-z0-9]+/gi,'_')}.png`});
  // do focusable controls have visible boundaries? count buttons whose border is none and background only
  out['forced '+r]=await p.evaluate(()=>{const bs=[...document.querySelectorAll('button,a[href],[role=tab]')].filter(e=>e.getBoundingClientRect().width>0);const noEdge=bs.filter(e=>{const cs=getComputedStyle(e);return cs.borderStyle==='none'&&!e.textContent.trim()&&!e.querySelector('svg')}).length;return {controls:bs.length,iconlessNoEdge:noEdge}});
  await p.context().close();
}
// accessibility tree (screen reader approximation) for a few pages
for(const r of ['/home','/play/investment-banking','/signup']){
  const p=await mk({});await go(p,r);
  const snap=await p.accessibility.snapshot({interestingOnly:true});
  const lines=[];const walk=(n,d)=>{if(!n)return;if(d<9)lines.push('  '.repeat(d)+n.role+(n.name?` "${n.name.slice(0,70)}"`:'')+(n.level?` L${n.level}`:'')+(n.checked!==undefined?` checked=${n.checked}`:'')+(n.selected?' selected':''));(n.children||[]).forEach(c=>walk(c,d+1))};walk(snap,0);
  fs.writeFileSync(`full/axtree_${r.replace(/[^a-z0-9]+/gi,'_')}.txt`,lines.join('\n'));
  await p.context().close();
}
fs.writeFileSync('full/extra.json',JSON.stringify(out,null,1));
await b.close();
