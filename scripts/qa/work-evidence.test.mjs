// Structural contracts for career-game pacing and read-only work context.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import ts from 'typescript';
import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';

const root=process.cwd(), req=createRequire(import.meta.url), cache=new Map();
function load(file){
 if(file.endsWith('.css'))return {__esModule:true,default:new Proxy({},{get:(_,key)=>String(key)})};
 if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));
 if(!path.extname(file))file+=fs.existsSync(file+'.ts')?'.ts':'.tsx';
 if(cache.has(file))return cache.get(file).exports;
 const m={exports:{}};cache.set(file,m);
 const js=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
 const localRequire=id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id)):id.startsWith('@/')?load(path.resolve(root,'src',id.slice(2))):req(id);
 vm.runInThisContext('(function(exports,require,module,__filename,__dirname){'+js+'\n})',{filename:file})(m.exports,localRequire,m,file,path.dirname(file));return m.exports;
}
const {artifactProblems}=load(path.join(root,'src/components/play/work-artifacts.ts'));
const {FS_ARTIFACTS}=load(path.join(root,'src/components/play/food-scientist-artifacts.ts'));
const {UX_ARTIFACTS}=load(path.join(root,'src/components/play/ux-work-artifacts.ts'));
const {WorkArtifact}=load(path.join(root,'src/components/play/WorkArtifact.tsx'));
const {IB_LEVEL_1_V2:ib}=load(path.join(root,'src/components/play/ib-level-1-v2.ts'));
const levels=[
 load(path.join(root,'src/components/play/ux-level-1.ts')).UX_LEVEL_1,
 load(path.join(root,'src/components/play/food-scientist-level-1.ts')).FOOD_SCIENTIST_LEVEL_1,
];
const fixtures=JSON.parse(fs.readFileSync(path.join(root,'docs/handoff/career-scaling/examples/work-graphic-fixtures.json'))).fixtures;
const scored=b=>['choice','rapid','rank','match','bucket','flags','pick','chain','slider'].includes(b.kind)&&!b.practice;
const words=s=>(s??'').match(/[A-Za-z]+(?:['’][A-Za-z]+)?|\d+/g)??[];

for(const level of levels){
 test(level.id+': seven scored decisions, midpoint, first choice and passing score',()=>{
  assert.equal(level.generationTemplate,'ib-career-tasks-v4');
  assert.deepEqual(level.beats.map((b,i)=>scored(b)?i:null).filter(i=>i!==null),ib.beats.map((b,i)=>scored(b)?i:null).filter(i=>i!==null),'IB scored decision positions');
  assert.equal(level.beats[6].cards.length,4);assert.equal(level.beats[7].pairs.length,4);assert(level.beats[7].practice&&level.beats[7].noVerdict);
  assert.equal(level.beats[8].items.length,4);assert.equal(level.beats[8].timer,45);
  // Story and scored slots are shared; the job determines the answer surface.
  for(let i=0;i<ib.beats.length;i++)if(ib.beats[i].kind==='card')assert.equal(level.beats[i].variant,ib.beats[i].variant,'IB card treatment at '+(i+1));
  assert.equal(level.beats[13].ladder.length,4);
  assert.equal(level.beats.length,ib.beats.length,'new careers match IB beat count');
  for(const kind of ['choice','flips','match','rapid','rank'])assert(level.beats.some(b=>b.kind===kind),kind+' variety');
  const art=load(path.join(root,'src/components/play/art/'+(level.id.startsWith('ux')?'ui-ux-designer':'food-scientist')+'.json'));
  level.beats.forEach(b=>assert(art.locations[art.beatLocations[b.id]],b.id+': missing scene'));
  assert.equal(level.points,ib.points);assert.equal(level.noStrikes,true);
  const decisions=level.beats.filter(scored);assert.equal(decisions.length,7);
  assert(level.beats.findIndex(scored)+1<=6,'first scored choice should arrive by beat six');
  const mid=level.beats.findIndex(b=>b.review);assert(mid>=0);
  assert.equal(level.beats.slice(0,mid).filter(scored).length,4);
  assert.equal(level.beats[mid].review.threshold,68);
  assert.equal(level.beats.at(-1).kind,'review');
  assert(level.endings.some(e=>e.min===85&&e.advances));
  assert.equal(50+7*level.points,92);
  assert.equal(decisions[0].kind,'choice');assert(!decisions[0].timer);
  decisions.forEach((b,i)=>{
   assert(Math.abs(b.progress-(i+1)/7)<1e-7,b.id+': score progress');
   if(b.artifact){assert.deepEqual(artifactProblems(b.artifact),[]);assert(b.question,'question remains self-contained');}
   if(b.kind==='choice'){assert.equal(b.choices.filter(c=>c.tier==='best').length,1);assert(b.choices.every(c=>c.why));}
   if(b.kind==='pick')assert(b.pick>0&&b.cards.filter(c=>c.role==='pick').length===b.pick,b.id+': pick answer key');
   if(b.kind==='flags')assert(b.rows.some(r=>r.flag)&&b.rows.some(r=>!r.flag)&&b.rows.every(r=>r.why),b.id+': flags answer key');
   if(b.kind==='slider')assert.equal(b.steps.filter(s=>s.tier==='best').length,1,b.id+': slider answer key');
   if(b.kind==='rapid')assert(b.items.every(x=>x.options.filter(o=>o.correct).length===1));
  });
 });
 test(level.id+': concise copy and no duplicate instruction',()=>{
  for(const b of level.beats){for(const [key,max] of [['title',12],['body',30],['setup',24],['question',24]])assert(words(b[key]).length<=max,b.id+' '+key);assert(!b.prompt,b.id+': duplicate operation prompt');if(b.choices)for(const c of b.choices){assert(words(c.label).length<=16,b.id+' option');assert(words(c.why).length<=24,b.id+' feedback');}}
  assert(level.preGame.lesson.title.startsWith('What Is a '));assert(level.preGame.ladder.length>=4);
 });
}
test('approved Nursing gameplay survives image-only updates',()=>{
 const approved=load(path.join(root,'src/components/play/rn-level-1-v2.ts')).RN_LEVEL_1_V2;
 const legacy=load(path.join(root,'src/components/play/rn-level-1.ts')).RN_LEVEL_1;
 const simulation=load(path.join(root,'src/components/play/games.ts')).REGISTERED_NURSE;
 const live=simulation.levels[0];
 assert.equal(simulation.trailer.length,7);
 assert.equal(simulation.upcoming.length,5);
 const art=load(path.join(root,'src/components/play/art/registered-nurse.json'));
 const withoutImage=b=>{const {art, ...content}=b;return content;};
 assert.equal(live.beats.length,36);
 assert.deepEqual(live.beats.map(withoutImage),approved.beats.map(withoutImage),'no missing/reordered/rewritten nursing beats');
 assert.equal(live.beats.filter(scored).length,10);
 for(const field of ['points','endings','noStrikes','noRepair','plainEndings'])assert.deepEqual(live[field],approved[field],field);
 assert.equal(live.coreKit,undefined,'bespoke instruments must stay enabled');
 assert.deepEqual(live.expressSource.beats.map(withoutImage),legacy.beats.map(withoutImage));
 assert.deepEqual(live.expressCut,legacy.expressCut);
 for(const kind of ['badge','monitor','lights','wristband','record','sheet'])assert(live.beats.some(b=>b.world?.kind===kind),kind+' restored');
 for(const beat of [...live.beats,...live.expressSource.beats]){
  const location=art.locations[art.beatLocations[beat.id]];
  assert(location,beat.id+': missing new painting');
  assert(/\/(rebuild-2026-10-21|scene-state-v8|v9)\//.test(location.src),beat.id+': outdated art');
  assert(!location.characterAnchor&&!location.characterAnchors,beat.id+': runtime sprite');
  assert(fs.existsSync(path.join(root,'public',location.src)),beat.id+': image missing');
  assert(!beat.art,beat.id+': legacy hero picture overrides new painting');
 }
 assert.notEqual(live.saveSlot,208,'shortened rebuild progress must not skip restored beats');
});
test('supporting graphics validate and render as read-only scene context',()=>{
 for(const a of [...Object.values(FS_ARTIFACTS),...Object.values(UX_ARTIFACTS),...fixtures]){
  assert.deepEqual(artifactProblems(a),[],a.id);
  const html=renderToStaticMarkup(React.createElement(WorkArtifact,{artifact:a}));
  assert(!/<(?:button|input|select|textarea)\b|role="tab|tabindex="0"/i.test(html),a.id+': scene context must not add controls');
  assert(html.includes('data-readonly="true"'));
 }
});
test('supporting artifact contracts reject embedded answer keys and interactive demos',()=>{
 assert(artifactProblems({...UX_ARTIFACTS.prototype,demo:{kind:'email-signup'}}).length);
 assert(artifactProblems({...FS_ARTIFACTS.plan,practice:{step:5}}).length);
});

test('UX visibly distinguishes buried and improved Save without extra controls',()=>{
 const bad=renderToStaticMarkup(React.createElement(WorkArtifact,{artifact:UX_ARTIFACTS.bad}));
 const good=renderToStaticMarkup(React.createElement(WorkArtifact,{artifact:UX_ARTIFACTS.improved}));
 assert(bad.includes('data-scene-state="buried"')&&bad.includes('Long description above Save'));
 assert(good.includes('data-scene-state="clear"')&&!good.includes('Long description above Save'));
 assert(bad.indexOf('Long description above Save')<bad.indexOf('Save set'));
 const q=levels[0].beats.find(b=>b.id==='UX1-11');
 assert(q.question.includes('Save'));assert.equal(q.artifact.state,'buried');
 assert.equal(q.feedbackArtifacts.best.state,'clear');assert.equal(q.feedbackArtifacts.wrong.state,'buried');
});
test('critical nursing art follows cast presence and has a sharp portrait composition',()=>{
 const art=load(path.join(root,'src/components/play/art/registered-nurse.json'));
 for(const id of ['RN2-23','RN2-24','RN2-43','RN2-44','RN2-45']){
  const l=art.locations[art.beatLocations[id]];
  assert.deepEqual(l.visibleCast,['Room 12 patient']);assert(l.mobileSrc);
  assert(fs.existsSync(path.join(root,'public',l.mobileSrc)));
  assert.equal(l.emotion,id==='RN2-23'||id==='RN2-24'?'anxious':'alarm');
 }
});

test('completion starts empty and advances regardless of answer reputation',()=>{
 const {completionPercent}=load(path.join(root,'src/components/play/scoring.ts'));
 for(const total of [7,10]){assert.equal(completionPercent(0,total),0);assert.equal(completionPercent(total,total),100);assert(Math.abs(completionPercent(1,total)-100/total)<1e-10);}
 assert.equal(completionPercent(1,0),0);assert.equal(completionPercent(11,10),100);
});

test('colleagues enter through story events, with work between introductions',()=>{
 for(const [i,career] of ['ui-ux-designer','food-scientist'].entries()){
  const level=levels[i], art=load(path.join(root,'src/components/play/art',career+'.json'));
  const ledger=load(path.join(root,'docs/handoff/career-scaling',career+'-introduction-ledger.json'));
  const firsts=Object.entries(ledger.cast).map(([name,c])=>({name,...c,index:level.beats.findIndex(b=>b.id===c.first)})).sort((a,b)=>a.index-b.index);
  assert.equal(firsts[0].name,ledger.mentor);
  firsts.forEach((c,j)=>{
   assert(c.index>=0,c.name+' introduction exists');
   const expected=[2,4,11,23];assert.equal(c.index,expected[j],c.name+' introduction follows the IB role sequence');
   const b=level.beats[c.index];assert(JSON.stringify(b).includes(c.name),c.name+' is named at introduction');
   assert((b.setup??b.title??'').includes(c.name),c.name+' introduction label');
   assert.deepEqual(art.locations[art.beatLocations[b.id]].visibleCast,[c.name],c.name+' solo first appearance');
  });
  level.beats.forEach((b,index)=>{
   for(const name of art.locations[art.beatLocations[b.id]].visibleCast??[]){
    const c=firsts.find(c=>c.name===name);assert(c&&c.index<=index,b.id+': unrevealed '+name);
   }
   for(const c of firsts)if(index<c.index)assert(!new RegExp('\\b'+c.name+'\\b').test(JSON.stringify(b)),b.id+': early name '+c.name);
   if(index<2)assert.deepEqual(art.locations[art.beatLocations[b.id]].visibleCast,[],'establish place and stakes before mentor');
  });
  assert(level.endings.some(e=>e.advances&&e.replayOnPass),'passing game can be replayed');
 }
});

test('each tested concept is learned first, and the rival remains in the story',()=>{
 for(const [i,career] of ['ui-ux-designer','food-scientist'].entries()){
  const level=levels[i], trace=load(path.join(root,'docs/handoff/career-scaling/examples',career+'-trace.json')).trace;
  const seen=new Set();
  for(const b of level.beats){const row=trace.find(t=>t.beat===b.id);assert(row,b.id+' trace');for(const concept of row.uses){assert(seen.has(concept),b.id+' untaught concept '+concept);const ref=row.lessonReferences.find(r=>r.concept===concept);assert(ref,b.id+' missing lesson passage');const source=level.beats.find(s=>s.id===ref.beat);assert(level.beats.indexOf(source)<level.beats.indexOf(b));assert(JSON.stringify(source).includes(ref.quote),b.id+' lesson passage drift');}row.teaches.forEach(t=>seen.add(t));if(scored(b))assert(row.uses.length,b.id+' tested concept');}
  const c=load(path.join(root,'docs/handoff/career-scaling',career+'-continuity.json'));
  for(const index of [4,17,18,19])assert(JSON.stringify(level.beats[index]).includes(c.rival),'rival has a causal return at slot '+(index+1));
  assert.equal(c.builtLevels.length,1);assert.equal(c.futurePlan.playable,false);
  assert(!level.beats[0].title.toLowerCase().includes('mentor'));
 }
});

test('arrival establishes each building outside before the interior',()=>{
 for(const [career,prefix] of [['ui-ux-designer','UX1'],['food-scientist','FS1'],['registered-nurse','RN2']]){
  const art=load(path.join(root,'src/components/play/art',career+'.json'));
  const outside=art.locations[art.beatLocations[prefix+'-01']],inside=art.locations[art.beatLocations[prefix+'-02']];
  assert.equal(outside.role,'arrival');assert(outside.src.endsWith('/building-exterior-v2.png'));assert.deepEqual(outside.visibleCast,[]);
  assert.notEqual(outside.src,inside.src);assert(fs.existsSync(path.join(root,'public',outside.src)));
 }
});

// The regression was a career-name substitution in IB questions. Preserve the
// narrative spine while checking actual task contracts and concrete UI states.
test('career tasks have researched scope and do not duplicate each other',()=>{
 const contracts=load(path.join(root,'docs/handoff/career-scaling/career-task-contracts.json')).careers;
 const sources=load(path.join(root,'docs/handoff/career-scaling/career-task-research.json')).sources;
 for(const [i,career] of ['ui-ux-designer','food-scientist'].entries()){
  const c=contracts[career],l=levels[i];assert.equal(c.level,l.n);assert(c.stage&&c.authorityLimit);
  assert.equal(c.tasks.length,l.beats.filter(scored).length);
  assert(c.tasks.filter(t=>t.category==='career-work').length>=4);
  for(const t of c.tasks){const b=l.beats[t.slot-1];assert.equal(b.id,t.beat);assert.equal(b.layout??b.kind,t.layout);assert(t.objective&&t.answerBasis);if(t.category==='career-work')assert(t.sources.length&&t.sources.every(id=>sources[id]?.url));}
 }
 const stems=l=>l.beats.flatMap(b=>b.items?.map(i=>i.question)??(b.question?[b.question]:[]));
 const ux=stems(levels[0]);assert(stems(levels[1]).every(q=>!ux.includes(q)),'identical question stems across careers');
 for(const l of levels)assert(!JSON.stringify(l).includes('Where should you save the client’s private project files?'));
 const label=levels[1].beats.find(b=>b.id==='FS1-11');assert.equal(label.artifact.state,'named');assert.equal(label.feedbackArtifacts.best.state,'coded');
 const testTask=levels[0].beats.find(b=>b.id==='UX1-15');assert.equal(testTask.artifact.state,'clear');assert(!testTask.feedbackArtifacts,'a wrong test instruction must not undo the layout');
});
