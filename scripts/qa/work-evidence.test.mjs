// Structural validation for newly authored core-kit career data. It does not
// certify subject accuracy, aesthetic quality or browser behaviour.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';
const root=process.cwd(), req=createRequire(import.meta.url), cache=new Map();
function load(file){
 if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));
 if(!path.extname(file))file+='.ts';if(cache.has(file))return cache.get(file).exports;
 const loadedModule={exports:{}};cache.set(file,loadedModule);
 const js=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText;
 const localRequire=(id)=>id.startsWith('.')?load(path.resolve(path.dirname(file),id)):id.startsWith('@/')?load(path.resolve(root,'src',id.slice(2))):req(id);
 vm.runInThisContext('(function(exports,require,module,__filename,__dirname){'+js+'\n})',{filename:file})(loadedModule.exports,localRequire,loadedModule,file,path.dirname(file));return loadedModule.exports;
}

import assert from 'node:assert/strict';
import test from 'node:test';
const {artifactProblems,decisionEvidenceProblems}=load(path.join(root,'src/components/play/work-artifacts.ts'));
const {FS_ARTIFACTS,FS_PROJECT}=load(path.join(root,'src/components/play/food-scientist-artifacts.ts'));
const {FOOD_SCIENTIST_LEVEL_1:level}=load(path.join(root,'src/components/play/food-scientist-level-1.ts'));
const fixtures=JSON.parse(fs.readFileSync(path.join(root,'docs/handoff/career-scaling/examples/work-graphic-fixtures.json'))).fixtures;
const before=JSON.parse(fs.readFileSync(path.join(root,'docs/handoff/career-scaling/food-scientist/scoring-baseline.json'),'utf8'));
const scored=new Set(['choice','match','bucket','flags','rank','pick','chain']);
test('all ten decisions retain tiers, keys, skills, progress, reasons and scoring policy',()=>{
 const current=level.beats.filter(b=>scored.has(b.kind)), original=before.beats.filter(b=>scored.has(b.kind));assert.equal(current.length,10);
 for(let i=0;i<current.length;i++){
  const a=current[i],b=original[i];assert.equal(a.id,b.id);for(const k of ['kind','skills','progress','points','strikes','noStrikes','whenRight','whenWrong'])assert.deepEqual(a[k],b[k]);
  if(a.choices)assert.deepEqual(a.choices.map(({id,tier,why})=>({id,tier,why})),b.choices.map(({id,tier,why})=>({id,tier,why})));
  if(a.rows)assert.deepEqual(a.rows.map(({flag,why})=>({flag,why})),b.rows.map(({flag,why})=>({flag,why})));
  if(a.pairs)assert.deepEqual(a.pairs.map(({term,def})=>({term,def})),b.pairs);
 }
});
test('all food artifacts and unrelated medium fixtures have complete data',()=>{
 for(const a of [...Object.values(FS_ARTIFACTS),...fixtures])assert.deepEqual(artifactProblems(a),[],a.id);
 assert(Object.values(FS_ARTIFACTS).every(a=>a.medium==='laboratory'));
 for(const kind of ['work-screen','register','panel-plan'])assert(fixtures.some(f=>f.kind===kind));
});
test('formulation practice transfers mass while retaining a 100 g batch and the canonical B recipe',()=>{
 const {practice:p,batches}=FS_ARTIFACTS.plan;const first=batches[0].ingredients;
 const draft=first.map(i=>({...i,amount:i.amount+(i.label===p.from?-p.step:i.label===p.to?p.step:0)}));
 assert.equal(draft.reduce((n,i)=>n+i.amount,0),100);assert.deepEqual(draft,batches[1].ingredients);
 assert.equal(p.max,p.step);assert.equal(FS_PROJECT.batches[0].oats,60);assert.equal(FS_PROJECT.batches[1].oats,55);
});
test('interactive sample records and the register use the same canonical fields and flag keys',()=>{
 const b=level.beats.find(b=>b.id==='FS1-20');for(let i=0;i<b.rows.length;i++){
  const record=FS_PROJECT.records[i],row=b.rows[i];assert.equal(row.flag,record.followup);assert.equal(row.evidence.code,record.id);
  assert.deepEqual(row.evidence.fields.map(f=>f.value),[record.ingredients,record.method,record.state]);assert.deepEqual(FS_ARTIFACTS.log.records[i].values,row.evidence.fields.map(f=>f.value));
 }
});
test('malformed records, duplicate panel codes, unusable transfers and empty choice evidence are rejected',()=>{
 assert(artifactProblems({...FS_ARTIFACTS.log,records:[{id:'A',values:[]}]}).length);
 assert(artifactProblems({...FS_ARTIFACTS.sensory,codes:['same','same']}).length);
 assert(artifactProblems({...FS_ARTIFACTS.plan,practice:{...FS_ARTIFACTS.plan.practice,from:'Unknown'}}).length);
 assert(decisionEvidenceProblems({code:'X',medium:'laboratory',fields:[]}).length);
});
