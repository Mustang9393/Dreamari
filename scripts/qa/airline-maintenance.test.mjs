import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import assert from 'node:assert/strict';
import test from 'node:test';
const source=fs.readFileSync('src/components/play/airline-maintenance-level-1.ts','utf8');
const levelModule={exports:{}};
vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:levelModule.exports,module:levelModule});
const level=JSON.parse(JSON.stringify(levelModule.exports.AIRLINE_MAINTENANCE_LEVEL_1));
const manifest=JSON.parse(fs.readFileSync('src/components/play/art/airline-maintenance-technician.json'));
const ledger=JSON.parse(fs.readFileSync('docs/handoff/airline-maintenance/continuity.json'));
const research=JSON.parse(fs.readFileSync('docs/handoff/airline-maintenance/research-and-task-contracts.json'));
const scored=b=>['choice','rapid','pick','rank'].includes(b.kind)&&!b.practice;
test('exact v2.6 narrative spine, varied job controls and checkpoint location',()=>{
 assert.equal(level.beats.length,29);
 assert.deepEqual(level.beats.flatMap((b,i)=>scored(b)?[i+1]:[]),[6,9,11,15,20,22,26]);
 assert.equal(level.beats[15].review.threshold,68);
 assert.equal(level.beats[21].layout,'chat');
 assert.equal(level.beats.at(-1).kind,'review');
 assert.equal(level.beats[7].practice,true);assert.equal(level.beats[7].noVerdict,true);
});
test('vocabulary teaches, practices and applies the same four concepts',()=>{
 const terms=level.beats[6].cards.map(c=>c.term);
 assert.deepEqual(terms,['Reported concern','Part history','Loose debris','Handoff']);
 assert.deepEqual(level.beats[7].pairs.map(p=>p.def),terms);
 assert.equal(level.beats[8].items.length,4);assert.equal(level.beats[8].timer,45);
 terms.forEach((term,i)=>assert(level.beats[8].items[i].question.toLowerCase().includes(term.toLowerCase())));
 level.beats[8].items.forEach(i=>assert.equal(i.options.filter(o=>o.correct).length,1));
});
test('all 128 scoring combinations respect pass and midpoint boundaries',()=>{
 assert.equal(level.points,6);assert.equal(level.noStrikes,true);
 for(let mask=0;mask<128;mask++){
  let rep=50,mid;
  for(let i=0;i<7;i++){rep+=mask&(1<<i)?6:-6;if(i===3)mid=rep;}
  const ending=[...level.endings].sort((a,b)=>b.min-a.min).find(e=>rep>=e.min);
  assert.equal(ending.advances,mask===127);
  assert.equal(mid>=level.beats[15].review.threshold,(mask&15)===15);
 }
 assert.equal(50+7*level.points,92);
});
test('no scene leaks an unintroduced cast member and every beat routes',()=>{
 for(let i=0;i<28;i++){
  const location=manifest.locations[manifest.beatLocations[level.beats[i].id]];assert(location);
  for(const name of location.visibleCast){const person=ledger.cast.find(c=>c.name===name);assert(person);assert(person.firstAppearance<=i+1);}
  if(i<2)assert.equal(location.visibleCast.length,0);
  assert(location.mobileSrc,'separate portrait composition');
 }
 assert.equal(manifest.spriteStandard,'full-scene');
 for(const c of Object.values(manifest.cast))assert(!c.default&&!c.poses&&!c.tiers);
});
test('every scored task has primary evidence, prior teaching, reviewer and bounded scope',()=>{
 assert.equal(research.taskContracts.length,7);
 const sources=new Set(research.sources.map(s=>s.id));
 for(const task of research.taskContracts){assert(scored(level.beats[task.slot-1]));assert(task.reviewOwner);assert(task.expectedOutput);assert(task.answerRationale);assert(task.priorTeachingSlots.every(n=>n<task.slot));task.sourceIds.forEach(id=>assert(sources.has(id)));}
 assert(research.roleContract.outsideRole.includes('return-to-service'));
 assert.equal(level.endings.filter(e=>e.min===85).length,1);
 assert(level.endings.find(e=>e.min===85).replayOnPass);
});
test('aviation stays silent for main, promotion, retry and unmute; IB keeps its own song',()=>{
 const code=ts.transpileModule(fs.readFileSync('src/components/play/music.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
 const musicModule={exports:{}};const assigned=[];let plays=0;
 class AudioMock {addEventListener(){} pause(){} play(){plays++;return Promise.resolve();}set src(value){assigned.push(value);}}
 const storage=new Map();
 vm.runInNewContext(code,{exports:musicModule.exports,module:musicModule,Audio:AudioMock,window:{localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},addEventListener(){},removeEventListener(){}}});
 const music=musicModule.exports;
 for(const id of ['airline-maintenance-technician','aviation-maintenance-technician']){music.playMusic('main',id);music.playMusic('promotion',id);music.setMusicMuted(true);music.setMusicMuted(false);music.retryMusic();}
 assert.equal(plays,0);assert.deepEqual(assigned,[]);
 music.playMusic('main','investment-banking');assert(assigned.includes('/audio/play/ib-main-song.mp3'));assert.equal(plays,1);
});
test('all authored decision outcomes use the fixed six-point scoring tiers',()=>{
 for(const beat of level.beats.filter(scored)){
  for(const choice of beat.choices??[])assert(['best','wrong'].includes(choice.tier));
  if(beat.kind==='pick')assert(beat.cards.every(c=>c.role==='pick'||c.role==='leave'),'harmful emits the shared risky tier, which is outside this SOP score contract');
  assert(!beat.points,'no per-beat score override');
 }
});
test('retry cannot expose the optional two-point repair mode or suggest an unbuilt level',()=>{
 assert.equal(level.noRepair,true);assert.equal(level.plainEndings,true);
 assert.equal(level.endings.find(e=>e.min===85).primary,'Replay this shift');
});
