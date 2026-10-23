import fs from 'fs';
const dir=new URL('./full/',import.meta.url).pathname;
const files=fs.readdirSync(dir).filter(f=>f.endsWith('.json')&&f.includes('__'));
const runs=files.map(f=>JSON.parse(fs.readFileSync(dir+f,'utf8')));
const byMode={};
for(const r of runs){(byMode[r.mode]??=[]).push(r)}
const out={};
for(const [mode,rs] of Object.entries(byMode)){
  const axe={};const aaFails=[],aaaFails=[];let lt24=0,lt44=0,inter=0,noRing=[],fullyCov=[],partly=[],offs=[],reflowBad=[],zoomBad=[],spacingBad=[],h1bad=[],mainBad=[],skips=[],errs=[],canvasUnl=[],generic={},tightLH=0,prose=0,jsErr=[];
  for(const r of rs){
    for(const v of r.axe||[]){const k=v.id;axe[k]??={impact:v.impact,n:0,routes:new Set(),help:v.help,tags:v.tags,ex:[]};axe[k].n+=v.n;axe[k].routes.add(r.route);if(axe[k].ex.length<3)axe[k].ex.push(...v.ex.slice(0,1).map(e=>({route:r.route,...e})))}
    const c=r.contrast||{};for(const e of c.aaEx||[])aaFails.push({route:r.route,...e});for(const e of c.aaaEx||[])aaaFails.push({route:r.route,...e});
    out[mode+'_contrastTotals']??={checked:0,aa:0,aaaOnly:0};out[mode+'_contrastTotals'].checked+=c.checked||0;out[mode+'_contrastTotals'].aa+=c.aaFails||0;out[mode+'_contrastTotals'].aaaOnly+=c.aaaOnlyFails||0;
    const m=r.meta||{};lt24+=m.lt24||0;lt44+=m.lt44||0;inter+=m.interactive||0;tightLH+=m.tightLH||0;prose+=m.prose||0;
    if(m.h1!==1)h1bad.push(r.route+':'+m.h1);if(m.main!==1)mainBad.push(r.route+':'+m.main);if(m.headingSkips)skips.push(r.route+':'+m.headingSkips);
    for(const [k,n] of Object.entries(m.generic||{}))generic[k]=(generic[k]||0)+n;
    if((m.canvas||[]).some(x=>x==='(unlabelled)'))canvasUnl.push(r.route);
    const f=r.focus||{};if(f.noRing?.length)noRing.push(r.route+': '+f.noRing.join(' | '));if(f.fullyCovered?.length)fullyCov.push(r.route+': '+f.fullyCovered.join(' | '));if(f.partlyCovered?.length)partly.push(r.route+': '+f.partlyCovered.join(' | '));if(f.offscreen?.length)offs.push(r.route+': '+f.offscreen.join(' | '));
    if(r.reflow320&&r.reflow320.scrollW>r.reflow320.clientW+2)reflowBad.push(r.route+': '+r.reflow320.scrollW+'>'+r.reflow320.clientW+' '+JSON.stringify((r.reflow320.clipped||[]).slice(0,2)));
    if(r.zoom200&&r.zoom200.scrollW>r.zoom200.clientW+2)zoomBad.push(r.route+': '+r.zoom200.scrollW+'>'+r.zoom200.clientW);
    if(Array.isArray(r.textSpacing)&&r.textSpacing.length)spacingBad.push(r.route+': '+r.textSpacing.length+' '+JSON.stringify(r.textSpacing.slice(0,2)));
    if(r.errors?.length)jsErr.push(r.route+': '+r.errors[0]);
  }
  const axeArr=Object.entries(axe).map(([id,v])=>({id,impact:v.impact,nodes:v.n,routes:v.routes.size,help:v.help,tags:v.tags.join(','),ex:v.ex})).sort((a,b)=>({critical:0,serious:1,moderate:2,minor:3}[a.impact]-{critical:0,serious:1,moderate:2,minor:3}[b.impact])||b.nodes-a.nodes);
  out[mode]={pages:rs.length,axe:axeArr,contrastAAworst:aaFails.sort((a,b)=>a.ratio-b.ratio).slice(0,25),contrastAAAworst:aaaFails.sort((a,b)=>a.ratio-b.ratio).slice(0,12),
    targets:{interactive:inter,lt24,lt44},focus:{noRing,fullyCov,partly:partly.slice(0,12),offs},reflowBad,zoomBad,spacingBad:spacingBad.slice(0,12),h1bad,mainBad,headingSkips:skips,generic,canvasUnlabelled:canvasUnl,prose:{prose,tightLH},jsErr:jsErr.slice(0,10)};
}
fs.writeFileSync(new URL('./summary.json',import.meta.url),JSON.stringify(out,null,1));
for(const mode of Object.keys(byMode)){const o=out[mode];console.log('\n===',mode,o.pages,'pages');console.log('axe:',o.axe.map(a=>`${a.id}[${a.impact}] ${a.nodes}n/${a.routes}r`).join('; '));console.log('contrast totals:',JSON.stringify(out[mode+'_contrastTotals']));console.log('targets:',JSON.stringify(o.targets));console.log('focus noRing:',o.focus.noRing.length,'fullyCov:',o.focus.fullyCov.length,'offs:',o.focus.offs.length);console.log('reflow bad:',o.reflowBad.length,'zoom bad:',o.zoomBad.length,'spacing bad:',o.spacingBad.length);console.log('h1 bad:',o.h1bad.join(','),'| main bad:',o.mainBad.join(','),'| skips:',o.headingSkips.join(','));console.log('generic:',JSON.stringify(o.generic));console.log('canvas unlabelled:',o.canvasUnlabelled.join(','));console.log('jsErr:',o.jsErr.slice(0,3).join(' || '))}
