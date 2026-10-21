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
  assert.equal(level.generationTemplate,'ib-narrative-v2');
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
   assert(!b.artifact,b.id+': scored answer must not depend on optional supporting art');
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
  assert(location.src.includes('/rebuild-2026-10-21/'),beat.id+': outdated art');
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
