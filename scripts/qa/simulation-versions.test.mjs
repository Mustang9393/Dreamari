import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';
import test from 'node:test';
import assert from 'node:assert/strict';
const req=createRequire(import.meta.url),cache=new Map();
function load(file){
 if(!path.extname(file))file+='.ts';
 if(cache.has(file))return cache.get(file).exports;
 const loaded={exports:{}};cache.set(file,loaded);
 const js=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const localRequire=id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id)):id.startsWith('@/')?load(path.resolve('src',id.slice(2))):req(id);
 vm.runInThisContext('(function(exports,require,module){'+js+'\n})')(loaded.exports,localRequire,loaded);return loaded.exports;
}
const {SIMULATIONS,SIMULATION_V2,simulationFor,AVIATION_MAINTENANCE,AVIATION_FIRST_SHIFT}=load(path.resolve('src/components/play/games.ts'));
test('one aviation hub tile, default v1 is unchanged, new game only opts in at v2',()=>{
 assert.equal(SIMULATIONS.filter(s=>s.id.startsWith('aviation-maintenance-technician')).length,1);
 assert.equal(simulationFor('aviation-maintenance-technician'),AVIATION_MAINTENANCE);
 assert.equal(simulationFor('aviation-maintenance-technician','1'),AVIATION_MAINTENANCE);
 assert.equal(simulationFor('aviation-maintenance-technician','2'),AVIATION_FIRST_SHIFT);
 assert.equal(SIMULATION_V2['aviation-maintenance-technician'],AVIATION_FIRST_SHIFT);
 assert.notEqual(AVIATION_MAINTENANCE.levels[0].id,AVIATION_FIRST_SHIFT.levels[0].id);
 assert.equal(AVIATION_FIRST_SHIFT.levels[0].beats.length,29);
});
test('old first-shift review link resolves; other games and unknown versions retain defaults',()=>{
 assert.equal(simulationFor(AVIATION_FIRST_SHIFT.id),AVIATION_FIRST_SHIFT);
 assert.equal(simulationFor('registered-nurse','2'),simulationFor('registered-nurse'));
 assert.equal(simulationFor('investment-banking','2'),simulationFor('investment-banking'));
 assert.equal(simulationFor('aviation-maintenance-technician','unknown'),AVIATION_MAINTENANCE);
 assert.equal(simulationFor('not-a-career','2'),undefined);
});
