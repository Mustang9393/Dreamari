// Structural validation for newly authored core-kit career data. It does not
// certify subject accuracy, aesthetic quality or browser behaviour.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import ts from 'typescript';
import sharp from 'sharp';
const root=process.cwd(), req=createRequire(import.meta.url), cache=new Map();
function load(file){
 if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));
 if(!path.extname(file))file+='.ts';if(cache.has(file))return cache.get(file).exports;
 const loadedModule={exports:{}};cache.set(file,loadedModule);
 const js=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText;
 const localRequire=(id)=>id.startsWith('.')?load(path.resolve(path.dirname(file),id)):id.startsWith('@/')?load(path.resolve(root,'src',id.slice(2))):req(id);
 vm.runInThisContext('(function(exports,require,module,__filename,__dirname){'+js+'\n})',{filename:file})(loadedModule.exports,localRequire,loadedModule,file,path.dirname(file));return loadedModule.exports;
}
const career=process.argv[2];if(!career)throw Error('Pass a simulation/catalogue ID.');
const {SIMULATIONS}=load(path.join(root,'src/components/play/games.ts'));
const sim=SIMULATIONS.find(s=>s.id===career||s.careerId===career);if(!sim)throw Error('Unknown career: '+career);
const {bespokeIn}=load(path.join(root,'src/components/play/coreKit.ts'));
const {SKILL_MEANING}=load(path.join(root,'src/components/play/skills.ts'));
const {WORLD_COLORS}=load(path.join(root,'src/components/app/worlds.ts'));
const {PERFORMANCE_PLANS}=load(path.join(root,'src/components/play/performance-plan.ts'));
const art=JSON.parse(fs.readFileSync(path.join(root,'src/components/play/art',sim.careerId+'.json'),'utf8'));
const traceFile=process.argv[4]??path.join(root,'docs/handoff/career-scaling/examples',sim.careerId+'-trace.json');
const trace=fs.existsSync(traceFile)?JSON.parse(fs.readFileSync(traceFile,'utf8')).trace:[];
const errors=[];let count=0;
const check=(ok,message)=>{count++;if(!ok)errors.push(message);};
const allIds=SIMULATIONS.flatMap(s=>s.levels.flatMap(l=>l.beats.map(b=>b.id)));
const scoredKinds=new Set(['choice','match','rapid','chain','slider','flags','rank','pick','bucket']);
const isScored=b=>scoredKinds.has(b.kind)&&!b.practice;
const coreKinds=new Set(['card','flips','focus','reveal','check','review',...scoredKinds]);
const unique=(a)=>new Set(a).size===a.length;
const exists=src=>typeof src==='string'&&src.startsWith('/')&&fs.existsSync(path.join(root,'public',src));
const sha=b=>createHash('sha256').update(b).digest('hex');
check(sim.world in WORLD_COLORS,'Unknown career world');
check(art.spriteStandard==='full-scene','New career must use full-scene art');
const assets={};
for(const [id,loc] of Object.entries(art.locations)){
 check(!loc.characterAnchor&&!loc.characterAnchors,id+': runtime sprite anchors forbidden');
 check(loc.locked===true,id+': camera is not locked');check(exists(loc.src),id+': missing scene file');
 if(exists(loc.src)){
  const p=path.join(root,'public',loc.src),bytes=fs.readFileSync(p),im=sharp(bytes),meta=await im.metadata(),stats=await im.stats(),decoded=await im.ensureAlpha().raw().toBuffer();
  check(stats.isOpaque,id+': scene has transparency');
  assets[id]={src:loc.src,fileSha256:sha(bytes),pixelSha256:sha(decoded),width:meta.width,height:meta.height,opaque:stats.isOpaque};
 }
 for(const f of ['focal','mobileFocal'])check(loc[f]&&['x','y'].every(k=>loc[f][k]>=0&&loc[f][k]<=1),id+': invalid '+f);
}
for(const [name,cast] of Object.entries(art.cast)){
 check(!cast.default&&!cast.tiers&&!cast.poses,name+': full-scene cast must not supply runtime sprites');
 check(exists(cast.face),name+': face chip missing');check(cast.voicePitch>=200&&cast.voicePitch<=900,name+': voice pitch missing');
}
const levels=[];
for(const level of sim.levels){
 const scored=level.beats.filter(isScored);
 check(scored.length===10,level.id+': expected ten scored decisions');
 check(level.beats.at(-1)?.kind==='review',level.id+': final beat must be review');
 check(level.directed&&level.cinematic&&level.worldTheme&&level.coreKit,level.id+': shared presentation flags missing');
 check(bespokeIn(level).length===0,level.id+': bespoke gameplay found');
 check(level.endings.some(e=>e.min===0),level.id+': missing floor ending');check(level.endings.some(e=>e.min===85&&e.advances),level.id+': missing passing ending');
 if(!level.noStrikes)check(PERFORMANCE_PLANS[sim.id]?.[level.n]?.steps?.length===3,level.id+': missing recovery plan');
 let n=0;const taught=new Set();
 for(const b of level.beats){
  check(allIds.filter(id=>id===b.id).length===1,b.id+': duplicate global ID');
  check(coreKinds.has(b.kind),b.id+': unsupported kind');
  if(b.timer)check(['choice','rapid','flags','pick'].includes(b.kind)&&b.timer>0,b.id+': unsupported timer');
  if(b.kind!=='review')check(art.locations[art.beatLocations[b.id]],b.id+': unrouted scene');
  if(b.speaker&&!['Narrator','System'].includes(b.speaker))check(art.cast[b.speaker],b.id+': unknown speaker');
  check(!JSON.stringify(b).includes('—'),b.id+': student copy contains em dash');
  const tr=trace.find(t=>t.beat===b.id);
  for(const concept of tr?.uses??[])check(taught.has(concept),b.id+': not taught before test: '+concept);
  for(const concept of tr?.teaches??[])taught.add(concept);
  if(isScored(b)){
   n++;check(Math.abs(b.progress-n/10)<.00001,b.id+': progress metadata');
   check(b.skills?.length===2&&unique(b.skills)&&b.skills.every(s=>s in SKILL_MEANING),b.id+': invalid skills');
   check(Boolean(b.planLineIfFailed)&&Boolean(b.feedbackCta),b.id+': missing feedback/recovery fields');
   check((tr?.uses?.length??0)>0,b.id+': no teach/test trace');
  }
  if(b.kind==='choice'){
   check(b.choices?.length>=2,b.id+': empty choices');check(b.choices.filter(c=>c.tier==='best').length===1,b.id+': expected one Best');
   check(unique(b.choices.map(c=>c.id)),b.id+': duplicate choice IDs');check(unique(b.choices.map(c=>c.label)),b.id+': duplicate option labels');
   check(b.choices.every(c=>c.why),b.id+': missing option explanation');
   if(['blank','tiles'].includes(b.layout))check((b.question.match(/___/g)??[]).length===1,b.id+': blank count');
  }
  if(b.kind==='check'&&b.method!=='type')check(b.options?.filter(o=>o.correct).length===1,b.id+': practice answer key');
  if(b.kind==='match')check(b.pairs?.length>0&&unique(b.pairs.map(p=>p.term))&&unique(b.pairs.map(p=>p.def)),b.id+': match pairs');
  if(b.kind==='rank')check(b.order?.length>1&&unique(b.order),b.id+': rank sequence');
  if(b.kind==='bucket')check(b.buckets?.length===2&&b.items?.length>0&&b.items.every(i=>i.into===0||i.into===1),b.id+': bucket payload');
  if(b.kind==='flags')check(b.rows?.some(r=>r.flag)&&b.rows?.some(r=>!r.flag)&&b.rows.every(r=>r.why),b.id+': flags payload');
  if(b.kind==='pick')check(b.pick>0&&b.cards?.filter(c=>c.role==='pick').length===b.pick,b.id+': pick key');
  if(b.kind==='rapid')check(b.items?.length>0&&b.items.every(i=>i.options.filter(o=>o.correct).length===1&&i.options.every(o=>o.why)),b.id+': rapid payload');
  if(b.kind==='chain')check(b.steps?.length===3&&b.steps.every(s=>s.options.filter(o=>o.correct).length===1),b.id+': chain payload');
  if(b.kind==='slider')check(b.steps?.length===4&&b.steps.filter(s=>s.tier==='best').length===1&&!b.timer,b.id+': slider payload/timer');
  if(b.kind==='flips')check(b.cards?.length>0,b.id+': empty term cards');
 }
 check(scored[0]?.kind==='choice'&&!scored[0]?.timer,level.id+': first decision must be untimed easy-win choice');
 levels.push({id:level.id,screens:level.beats.length,scored:scored.length,questionTypes:[...new Set(scored.map(b=>b.kind))],bespoke:bespokeIn(level)});
}
const report={career:sim.id,status:errors.length?'failed':'structural checks passed; human and runtime review are separate',assertions:count,levels,sceneAssets:assets,routedBeats:Object.keys(art.beatLocations).length,errors,notCertified:['Subject-matter correctness','Aesthetic approval','All runtime branches','Windows/Chromebook hardware']};
const reportFile=process.argv[3];if(reportFile)fs.writeFileSync(reportFile,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));if(errors.length)process.exitCode=1;
