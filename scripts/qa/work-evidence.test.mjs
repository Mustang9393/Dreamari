// Structural validation for newly authored core-kit career data. It does not
// certify subject accuracy, aesthetic quality or browser behaviour.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';
const root=process.cwd(), req=createRequire(import.meta.url), cache=new Map();
function load(file){
 if(file.endsWith('.css'))return {__esModule:true,default:new Proxy({},{get:(_,key)=>String(key)})};
 if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));
 if(!path.extname(file))file+=fs.existsSync(file+'.ts')?'.ts':'.tsx';if(cache.has(file))return cache.get(file).exports;
 const loadedModule={exports:{}};cache.set(file,loadedModule);
 const js=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
 const localRequire=(id)=>id.startsWith('.')?load(path.resolve(path.dirname(file),id)):id.startsWith('@/')?load(path.resolve(root,'src',id.slice(2))):req(id);
 vm.runInThisContext('(function(exports,require,module,__filename,__dirname){'+js+'\n})',{filename:file})(loadedModule.exports,localRequire,loadedModule,file,path.dirname(file));return loadedModule.exports;
}


import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
const {artifactProblems}=load(path.join(root,'src/components/play/work-artifacts.ts'));
const {FS_ARTIFACTS,FS_PROJECT}=load(path.join(root,'src/components/play/food-scientist-artifacts.ts'));
const {UX_ARTIFACTS}=load(path.join(root,'src/components/play/ux-work-artifacts.ts'));
const {WorkArtifact}=load(path.join(root,'src/components/play/WorkArtifact.tsx'));
const ib=load(path.join(root,'src/components/play/ib-level-1-v2.ts')).IB_LEVEL_1_V2;
const levels=[load(path.join(root,'src/components/play/ux-level-1.ts')).UX_LEVEL_1,load(path.join(root,'src/components/play/food-scientist-level-1.ts')).FOOD_SCIENTIST_LEVEL_1];
const fixtures=JSON.parse(fs.readFileSync(path.join(root,'docs/handoff/career-scaling/examples/work-graphic-fixtures.json'))).fixtures;
const scored=b=>['choice','rapid','rank','match','bucket','flags','pick','chain','slider'].includes(b.kind)&&!b.practice;
const words=s=>(s??'').match(/[A-Za-z]+(?:['’][A-Za-z]+)?|\d+/g)??[];
for(const level of levels){
 test(level.id+': exact IB slot/practice/variant sequence and score policy',()=>{
  assert.equal(level.generationTemplate,'ib-l1-2026-10-21');assert.deepEqual(level.beats.map(b=>[b.kind,b.variant,Boolean(b.practice)]),ib.beats.map(b=>[b.kind,b.variant,Boolean(b.practice)]));
  assert.equal(level.points,ib.points);assert.equal(level.noStrikes,ib.noStrikes);assert.equal(level.beats.filter(scored).length,7);assert.equal(50+7*level.points,92);assert.equal(level.beats.findIndex(scored)+1,6);
  const at=level.beats.findIndex(b=>b.review);assert.equal(level.beats.slice(0,at).filter(scored).length,4);assert.equal(level.beats[at].review.threshold,68);assert(level.endings.some(e=>e.min===85&&e.advances));
  let i=0;for(const b of level.beats.filter(scored)){assert.equal(b.progress,++i/7);if(b.kind==='choice'){assert.equal(b.choices.filter(c=>c.tier==='best').length,1);assert(b.choices.every(c=>c.why));}if(b.kind==='rapid'){assert.equal(b.timer,ib.beats.find(x=>x.kind==='rapid').timer);assert(b.items.every(x=>x.options.filter(o=>o.correct).length===1));}}
 });
 test(level.id+': brief American eighth-grade copy budgets and no duplicated instruction',()=>{
  for(const b of level.beats){for(const [key,max] of [['title',12],['body',30],['setup',24],['question',24]])assert(words(b[key]).length<=max,b.id+' '+key);assert(!b.prompt,b.id+': duplicate operation prompt');if(b.choices)for(const c of b.choices){assert(words(c.label).length<=16,b.id+' option');assert(words(c.why).length<=24,b.id+' feedback');}}
  assert(level.preGame.lesson.title.startsWith('What Is a '));assert(level.preGame.ladder.length>=4);assert(!level.beats.some(b=>b.secondaryCta==='Finish Later'));
 });
}
test('all supporting graphics validate and render with no independent controls',()=>{
 for(const a of [...Object.values(FS_ARTIFACTS),...Object.values(UX_ARTIFACTS),...fixtures]){
  assert.deepEqual(artifactProblems(a),[],a.id);const html=renderToStaticMarkup(React.createElement(WorkArtifact,{artifact:a}));assert(!/<(?:button|input|select|textarea)\b|role="tab|tabindex="0"/i.test(html),a.id+': independent graphic control');assert(html.includes('data-readonly="true"'));
 }
});
test('canonical food counts and fixed 100 g plans remain accurate',()=>{
 assert.deepEqual(FS_ARTIFACTS.results.samples.map(x=>[x.broken,x.tested]),FS_PROJECT.batches.map(x=>[x.broken,x.tested]));assert.deepEqual(FS_ARTIFACTS.plan.batches.map(b=>b.ingredients.reduce((n,i)=>n+i.amount,0)),[100,100]);
});
test('old interactive demos and draft transfers are rejected as supporting graphics',()=>{
 assert(artifactProblems({...UX_ARTIFACTS.prototype,demo:{kind:'email-signup'}}).length);assert(artifactProblems({...FS_ARTIFACTS.plan,practice:{step:5}}).length);
});
