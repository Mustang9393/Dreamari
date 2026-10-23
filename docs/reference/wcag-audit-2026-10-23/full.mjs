import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import fs from 'fs';
const axeSrc=fs.readFileSync(new URL('./node_modules/axe-core/axe.min.js',import.meta.url),'utf8');
const B=process.env.B||'http://localhost:3089';
const MODE=process.argv[2]; // desktop-dark | desktop-light | phone-dark
const ROUTES=process.argv.slice(3);
const vp=MODE.startsWith('phone')?{width:390,height:844}:{width:1366,height:768};
const light=MODE.endsWith('light');
const lum=([r,g,b])=>{const f=c=>{c/=255;return c<=.03928?c/12.92:((c+.055)/1.055)**2.4};return .2126*f(r)+.7152*f(g)+.0722*f(b)};
const cr=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
const SURF=['home','explore','match','play','connect','profile','opportunities','colleges','career','resume','build','glossary','counselor','leaderboard','report','flow','signup'];
const b=await chromium.launch();
for(const r of ROUTES){
 const out={route:r,mode:MODE};
 const ctx=await b.newContext({viewport:vp,deviceScaleFactor:1,isMobile:MODE.startsWith('phone'),hasTouch:MODE.startsWith('phone')});
 await ctx.addCookies([{name:'dm_gate_2',value:'granted',url:B}]);
 await ctx.addInitScript(([surf,light])=>{try{for(const s of surf){sessionStorage.setItem(`dreamari:welcome:${s}:session`,'1');localStorage.setItem(`dreamari:welcome:${s}`,'1')}
   if(light){for(const k of ['dreamari-theme','dreamari-theme:counselor','dreamari-theme:counselor:v4b','dreamari-theme:counselor:v5','dreamari-theme:counselor:v7'])localStorage.setItem(k,'light')}
   else{for(const k of ['dreamari-theme','dreamari-theme:counselor','dreamari-theme:counselor:v4b'])localStorage.setItem(k,'dark')}}catch{}},[SURF,light]);
 const p=await ctx.newPage();
 const errors=[];p.on('pageerror',e=>errors.push(String(e).slice(0,120)));
 try{await p.goto(B+r,{waitUntil:'networkidle',timeout:60000})}catch(e){out.nav=String(e).slice(0,80)}
 await p.waitForTimeout(2500);
 // close any leftover welcome dialog
 const splash=await p.$('[role=dialog][data-own-history]'); if(splash){await p.keyboard.press('Escape');await p.waitForTimeout(600)}
 out.final=p.url().replace(B,''); out.errors=errors;
 await p.addScriptTag({content:axeSrc});
 out.axe=await p.evaluate(async()=>{const res=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa','wcag2aaa','best-practice']},resultTypes:['violations']});
   return res.violations.map(v=>({id:v.id,impact:v.impact,tags:v.tags.filter(t=>/^wcag\d|best/.test(t)),help:v.help,n:v.nodes.length,ex:v.nodes.slice(0,3).map(n=>({t:n.target.join(' ').slice(0,80),h:n.html.slice(0,140),s:(n.failureSummary||'').replace(/\s+/g,' ').slice(0,200)}))}))});
 out.meta=await p.evaluate(()=>{
  const q=s=>[...document.querySelectorAll(s)];
  const vis=e=>{const r=e.getBoundingClientRect();const cs=getComputedStyle(e);return r.width>0&&r.height>0&&cs.visibility!=='hidden'&&cs.display!=='none'};
  const hs=q('h1,h2,h3,h4,h5,h6').filter(vis).map(h=>+h.tagName[1]);let skips=0;for(let i=1;i<hs.length;i++)if(hs[i]>hs[i-1]+1)skips++;
  // 1.4.8 prose
  const prose=q('p,li').filter(e=>vis(e)&&e.textContent.trim().length>120);
  const longLines=prose.filter(e=>{const fs=parseFloat(getComputedStyle(e).fontSize);return e.getBoundingClientRect().width/(fs*0.5)>80}).length;
  const justified=q('*').filter(e=>getComputedStyle(e).textAlign==='justify'&&e.textContent.trim().length>40).length;
  const tightLH=prose.filter(e=>{const cs=getComputedStyle(e);const lh=parseFloat(cs.lineHeight);return lh&&lh/parseFloat(cs.fontSize)<1.5}).length;
  // targets
  const inter=q('a[href],button,[role=button],input:not([type=hidden]),select,textarea,[role=tab],[role=checkbox],[role=switch],[role=radio],[role=option],[role=menuitem]').filter(vis).filter(e=>!(e.tagName==='A'&&e.closest('p,li')&&getComputedStyle(e).display==='inline'));
  const sz=e=>{const r=e.getBoundingClientRect();return [r.width,r.height]};
  const lt24=inter.filter(e=>{const [w,h]=sz(e);return w<24||h<24});
  const lt44=inter.filter(e=>{const [w,h]=sz(e);return w<44||h<44});
  // generic link/button names (2.4.9) and label-in-name (2.5.3)
  const name=e=>(e.getAttribute('aria-label')||e.textContent||'').trim().replace(/\s+/g,' ');
  const GEN=/^(view all|see all|learn more|more|see more|read more|open|click here|here|details|show more|view|go|next|continue)$/i;
  const generic=inter.filter(e=>GEN.test(name(e))).map(name);
  const genCount={};generic.forEach(n=>genCount[n]=(genCount[n]||0)+1);
  const lin=inter.filter(e=>{const al=e.getAttribute('aria-label');const vt=(e.innerText||'').trim().replace(/\s+/g,' ');return al&&vt.length>2&&vt.length<60&&!al.toLowerCase().includes(vt.toLowerCase().slice(0,Math.min(vt.length,25)))}).slice(0,6).map(e=>`"${e.getAttribute('aria-label').slice(0,40)}" vs visible "${e.innerText.trim().slice(0,30)}"`);
  const ids={};q('[id]').forEach(e=>ids[e.id]=(ids[e.id]||0)+1);const dupIds=Object.entries(ids).filter(([,n])=>n>1).map(([k])=>k).slice(0,6);
  const vids=q('video').map(v=>({src:(v.currentSrc||v.src||'').split('/').pop(),tracks:v.querySelectorAll('track').length,muted:v.muted,autoplay:v.autoplay,loop:v.loop,ariaHidden:v.getAttribute('aria-hidden')}));
  const iframes=q('iframe').map(f=>f.title||'(no title)');
  const canvas=q('canvas').filter(vis).map(c=>c.getAttribute('aria-label')||c.getAttribute('role')||'(unlabelled)');
  const imgs=q('img').filter(vis);const noAlt=imgs.filter(i=>!i.hasAttribute('alt')).length;
  const userSelectNone=q('p,h1,h2,h3,li,span').filter(e=>getComputedStyle(e).userSelect==='none'&&e.textContent.trim().length>20).length;
  return {title:document.title,lang:document.documentElement.lang,h1:hs.filter(h=>h===1).length,headingSkips:skips,headings:hs.length,
   main:q('main,[role=main]').filter(vis).length,landmarks:{nav:q('nav,[role=navigation]').length,header:q('header').length,footer:q('footer,[role=contentinfo]').length},
   prose:prose.length,longLines,justified,tightLH,interactive:inter.length,lt24:lt24.length,lt24ex:lt24.slice(0,4).map(e=>{const [w,h]=sz(e);return Math.round(w)+'x'+Math.round(h)+' '+name(e).slice(0,30)}),lt44:lt44.length,genericNames:genCount,labelInName:lin,dupIds,vids,iframes,canvas,imgs:imgs.length,noAlt,userSelectNone,
   bodyOverflowX:getComputedStyle(document.body).overflowX};
 });
 // focus walk: indicator + obscured
 await p.evaluate(()=>{document.activeElement?.blur();window.scrollTo(0,0)});await p.mouse.move(1,1);
 const walk=[];
 for(let i=0;i<45;i++){await p.keyboard.press('Tab');await p.waitForTimeout(40);
  const f=await p.evaluate(()=>{const e=document.activeElement;if(!e||e===document.body)return null;
   const cs=getComputedStyle(e);const r=e.getBoundingClientRect();
   const ow=cs.outlineStyle!=='none'?parseFloat(cs.outlineWidth):0; const bs=cs.boxShadow&&cs.boxShadow!=='none';
   const pts=[[r.left+2,r.top+2],[r.right-2,r.top+2],[r.left+2,r.bottom-2],[r.right-2,r.bottom-2],[r.left+r.width/2,r.top+r.height/2]].filter(([x,y])=>x>=0&&y>=0&&x<innerWidth&&y<innerHeight);
   const covered=pts.filter(([x,y])=>{const t=document.elementFromPoint(x,y);return t&&!e.contains(t)&&!t.contains(e)}).length;
   const off=r.bottom<0||r.top>innerHeight||r.right<0||r.left>innerWidth;
   return {name:(e.getAttribute('aria-label')||e.textContent||e.tagName).trim().slice(0,30),tag:e.tagName,ow,oc:cs.outlineColor,bs,covered,pts:pts.length,off,rect:[r.left,r.top,r.width,r.height]}});
  if(!f)break;walk.push(f);
 }
 // indicator contrast: screenshot focused vs unfocused for first 8 stops
 const shots=[];
 out.focus={stops:walk.length,noRing:walk.filter(w=>!w.ow&&!w.bs).map(w=>w.name).slice(0,6),thin:walk.filter(w=>w.ow>0&&w.ow<2&&!w.bs).map(w=>w.name).slice(0,6),
  fullyCovered:walk.filter(w=>w.pts&&w.covered===w.pts).map(w=>w.name).slice(0,6),partlyCovered:walk.filter(w=>w.covered>0&&w.covered<w.pts).map(w=>w.name).slice(0,6),offscreen:walk.filter(w=>w.off).map(w=>w.name).slice(0,6),
  colors:[...new Set(walk.filter(w=>w.ow).map(w=>w.oc))].slice(0,4)};
 // ring contrast vs page bg at element position
 // reflow 320 + zoom 200 (683 css px)
 for(const [k,w,h] of [['reflow320',320,640],['zoom200',683,384]]){
  if(MODE.startsWith('phone')&&k==='zoom200')continue;
  await p.setViewportSize({width:w,height:h});await p.waitForTimeout(900);
  out[k]=await p.evaluate(()=>({scrollW:document.documentElement.scrollWidth,clientW:document.documentElement.clientWidth,
   clipped:[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect();if(r.width<10||r.right<=innerWidth+2)return false;const cs=getComputedStyle(e);if(cs.position==='fixed')return false;let a=e.parentElement;while(a&&a!==document.body){const s=getComputedStyle(a);if(/(auto|scroll)/.test(s.overflowX))return false;a=a.parentElement}return e.innerText&&e.innerText.trim().length>2&&e.children.length===0}).slice(0,4).map(e=>e.innerText.trim().slice(0,30))}));
 }
 await p.setViewportSize(vp);await p.waitForTimeout(600);
 // contrast pixel pass (AA + AAA)
 const els=await p.evaluate(()=>{
  const cv=document.createElement('canvas');cv.width=cv.height=1;const cx=cv.getContext('2d',{willReadFrequently:true});
  const parse=s=>{cx.clearRect(0,0,1,1);cx.fillStyle='#000';cx.fillStyle=s;cx.fillRect(0,0,1,1);const d=cx.getImageData(0,0,1,1).data;return [d[0],d[1],d[2],d[3]/255]};
  const res=[];let i=0;
  for(const e of document.querySelectorAll('body *')){
   const own=[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim().length>1);if(!own)continue;
   const cs=getComputedStyle(e);if(cs.visibility==='hidden'||cs.display==='none')continue;
   if(e.closest('[aria-hidden=true],.sr-only,[inert]'))continue;
   if(cs.backgroundClip==='text'||cs.webkitBackgroundClip==='text')continue;
   const rc=e.getBoundingClientRect();const y=rc.top+scrollY;if(rc.width<4||rc.height<4||y>6000)continue;
   let op=1;for(let a=e;a;a=a.parentElement)op*=parseFloat(getComputedStyle(a).opacity);if(op<0.1)continue;
   const fg=parse(cs.color);fg[3]*=op;const fs=parseFloat(cs.fontSize),fw=parseInt(cs.fontWeight);
   res.push({x:rc.left+scrollX,y,w:rc.width,h:rc.height,fg,large:fs>=24||(fs>=18.66&&fw>=700),fs,fw,txt:[...e.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join('').trim().slice(0,40),disabled:!!e.closest('[disabled],[aria-disabled=true]'),cls:String(e.className).slice(0,50)});
  }
  const st=document.createElement('style');st.textContent='*{color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important;caret-color:transparent!important;text-decoration-color:transparent!important}';document.head.appendChild(st);
  return res;});
 await p.waitForTimeout(400);
 const png=PNG.sync.read(await p.screenshot({fullPage:true,animations:'disabled'}));
 const aa=[],aaa=[];
 for(const e of els){if(e.disabled)continue;
  const px=[];const x0=Math.max(0,Math.floor(e.x)),y0=Math.max(0,Math.floor(e.y)),x1=Math.min(png.width-1,Math.ceil(e.x+e.w)),y1=Math.min(png.height-1,Math.ceil(e.y+e.h));
  const step=Math.max(1,Math.floor((x1-x0)*(y1-y0)/300));let k=0;
  for(let yy=y0;yy<=y1;yy++)for(let xx=x0;xx<=x1;xx++){if((k++)%step)continue;const o=(png.width*yy+xx)*4;px.push([png.data[o],png.data[o+1],png.data[o+2]])}
  if(!px.length)continue;
  const rs=px.map(bg=>{const a=e.fg[3];return cr([0,1,2].map(c=>e.fg[c]*a+bg[c]*(1-a)),bg)}).sort((a,b)=>a-b);const med=+rs[Math.floor(rs.length/2)].toFixed(2);
  const rec={txt:e.txt,ratio:med,fs:e.fs,fw:e.fw,large:e.large,fg:'rgba('+e.fg.map(v=>+(+v).toFixed(2)).join(',')+')',cls:e.cls};
  if(med<(e.large?3:4.5))aa.push(rec); else if(med<(e.large?4.5:7))aaa.push(rec);
 }
 out.contrast={checked:els.length,aaFails:aa.length,aaaOnlyFails:aaa.length,aaEx:aa.sort((a,b)=>a.ratio-b.ratio).slice(0,10),aaaEx:aaa.sort((a,b)=>a.ratio-b.ratio).slice(0,6)};
 // text spacing 1.4.12
 await p.evaluate(()=>{document.querySelectorAll('style').forEach(s=>{if(s.textContent.includes('color:transparent!important'))s.remove()})});
 await p.addStyleTag({content:'*{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}p{margin-bottom:2em!important}'});await p.waitForTimeout(500);
 out.textSpacing=await p.evaluate(()=>[...document.querySelectorAll('body *')].filter(e=>{const cs=getComputedStyle(e);if(e.closest('[aria-hidden=true]'))return false;const clampy=cs.webkitLineClamp&&cs.webkitLineClamp!=='none';return !clampy&&(cs.overflow==='hidden'||cs.overflowY==='hidden')&&e.scrollHeight>e.clientHeight+4&&e.innerText&&e.innerText.trim().length>3&&e.children.length<3&&e.clientHeight>0}).slice(0,5).map(e=>e.innerText.trim().slice(0,35)));
 fs.writeFileSync(`full/${MODE}__${r.replace(/[^a-z0-9]+/gi,'_')}.json`,JSON.stringify(out));
 console.error('done',MODE,r,out.axe.length,out.contrast.aaFails);
 await ctx.close();
}
await b.close();
