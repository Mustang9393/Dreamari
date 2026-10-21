import { chromium } from 'playwright';
import fs from 'fs';
const axeSrc=fs.readFileSync(new URL('./node_modules/axe-core/axe.min.js',import.meta.url),'utf8');
const B='https://dreamari.vercel.app';
const ROUTES=process.argv.slice(2);
const b=await chromium.launch();
const out={};
for (const r of ROUTES){
  const ctx=await b.newContext({viewport:{width:1366,height:768}});
  if(r!=='/gate') await ctx.addCookies([{name:'dm_gate_2',value:'granted',url:B}]);
  const p=await ctx.newPage();
  const res={route:r};
  try{ await p.goto(B+r,{waitUntil:'networkidle',timeout:45000}); }catch(e){ res.navErr=String(e).slice(0,100); }
  await p.waitForTimeout(2500);
  res.finalUrl=p.url();
  await p.addScriptTag({content:axeSrc});
  const axe=await p.evaluate(async()=>{const r=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa','best-practice']},resultTypes:['violations','incomplete']});
    const m=v=>({id:v.id,impact:v.impact,tags:v.tags.filter(t=>/^wcag\d/.test(t)),help:v.help,n:v.nodes.length,ex:v.nodes.slice(0,4).map(n=>({t:n.target.join(' '),h:n.html.slice(0,160),s:(n.failureSummary||'').slice(0,220)}))});
    return {v:r.violations.map(m),inc:r.incomplete.filter(x=>x.id==='color-contrast').map(m)};});
  res.axe=axe;
  res.meta=await p.evaluate(()=>{
    const q=s=>document.querySelectorAll(s).length;
    const firstFocusable=[...document.querySelectorAll('a[href],button,input,select,textarea,[tabindex]')].find(e=>e.tabIndex>=0);
    return {lang:document.documentElement.lang,title:document.title,h1:q('h1'),main:q('main,[role=main]'),nav:q('nav,[role=navigation]'),
     skip:!!(firstFocusable&&/skip/i.test(firstFocusable.textContent||'')),firstFocusable:firstFocusable?(firstFocusable.outerHTML.slice(0,120)):null,
     videos:q('video'),autoplayVideos:[...document.querySelectorAll('video')].filter(v=>v.autoplay||!v.paused).length,videoTracks:q('video track'),audio:q('audio'),
     clickDivs:[...document.querySelectorAll('div,span,li,img,article,section')].filter(e=>{const c=getComputedStyle(e).cursor;return c==='pointer'&&!e.closest('a,button,[role=button],[role=link],[role=tab],[role=option],[role=menuitem],label,[tabindex],summary,input,select')&&e.tabIndex<0}).length,
     clickDivEx:[...document.querySelectorAll('div,span,li,img,article,section')].filter(e=>{const c=getComputedStyle(e).cursor;return c==='pointer'&&!e.closest('a,button,[role=button],[role=link],[role=tab],[role=option],[role=menuitem],label,[tabindex],summary,input,select')&&e.tabIndex<0&&!e.parentElement?.closest('[style*=cursor]')}).slice(0,3).map(e=>e.outerHTML.slice(0,140)),
     viewportMeta:document.querySelector('meta[name=viewport]')?.content};
  });
  // target size (2.5.8): interactive elements under 24x24
  res.small=await p.evaluate(()=>{const els=[...document.querySelectorAll('a[href],button,[role=button],input,select,[role=tab],[role=checkbox],[role=switch]')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&(r.width<24||r.height<24)&&getComputedStyle(e).visibility!=='hidden'&&!(e.tagName==='A'&&e.closest('p'))});return {n:els.length,ex:els.slice(0,5).map(e=>{const r=e.getBoundingClientRect();return Math.round(r.width)+'x'+Math.round(r.height)+' '+e.outerHTML.slice(0,110)})};});
  // keyboard walk
  const walk=[];
  await p.mouse.click(2,2).catch(()=>{});
  await p.evaluate(()=>{document.activeElement?.blur(); window.scrollTo(0,0)});
  for(let i=0;i<35;i++){
    await p.keyboard.press('Tab'); await p.waitForTimeout(60);
    const info=await p.evaluate(()=>{const e=document.activeElement; if(!e||e===document.body) return null;
      const cs=getComputedStyle(e); const r=e.getBoundingClientRect();
      const ring=(cs.outlineStyle!=='none'&&parseFloat(cs.outlineWidth)>0)||(cs.boxShadow&&cs.boxShadow!=='none');
      const cx=r.left+r.width/2, cy=r.top+r.height/2; const top=document.elementFromPoint(Math.min(Math.max(cx,0),innerWidth-1),Math.min(Math.max(cy,0),innerHeight-1));
      const obscured = r.bottom<0||r.top>innerHeight ? 'offscreen' : (top&&!e.contains(top)&&!top.contains(e)?'covered':'');
      const name=(e.getAttribute('aria-label')||e.textContent||e.getAttribute('title')||e.getAttribute('alt')||'').trim().slice(0,40);
      return {tag:e.tagName.toLowerCase(),role:e.getAttribute('role'),name,ring,obscured,w:Math.round(r.width),h:Math.round(r.height)}});
    walk.push(info); if(!info) break;
  }
  res.walk=walk;
  // reflow 320
  await p.setViewportSize({width:320,height:640}); await p.waitForTimeout(1200);
  res.reflow=await p.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,offenders:[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect();return r.right>innerWidth+2&&r.width<2000&&getComputedStyle(e).position!=='fixed'&&!e.closest('[class*=overflow-x],[style*=overflow]')}).slice(0,4).map(e=>e.tagName+'.'+String(e.className).slice(0,60))}));
  // text spacing 1.4.12
  await p.setViewportSize({width:1366,height:768}); await p.waitForTimeout(500);
  await p.addStyleTag({content:'*{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}p{margin-bottom:2em!important}'});
  await p.waitForTimeout(500);
  res.spacing=await p.evaluate(()=>[...document.querySelectorAll('body *')].filter(e=>{const cs=getComputedStyle(e);return (cs.overflow==='hidden'||cs.overflowY==='hidden'||cs.webkitLineClamp!=='none')&&e.scrollHeight>e.clientHeight+3&&e.textContent.trim().length>3&&e.children.length<4&&e.clientHeight>0}).slice(0,5).map(e=>e.tagName+' "'+e.textContent.trim().slice(0,40)+'"'));
  out[r]=res; console.error('done',r,res.axe.v.length);
  await ctx.close();
}
fs.writeFileSync(new URL('./out-'+Date.now()+'.json',import.meta.url),JSON.stringify(out,null,1));
await b.close();
