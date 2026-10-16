// Every registered glossary blueprint builds, and every generated level
// obeys the Master Scaling Plan SOP rules the generator promises
// (16 Oct 2026, tightened 17 Oct 2026 after Chandu: "the games are
// repeating the same questions again and again"): seven to ten scored
// screens plus one Power Play, never three of the same screen shape in a
// row, every term credited at least twice in the main loop, no screen gives
// its own answer away, no line of copy shown twice in a lesson, the Power
// Play uses all five words once and its blanks never run in teaching order,
// and the review questions use a form the main loop did not.
// Run: node --import ./scripts/qa/ts-resolve.mjs scripts/qa/glossary-blueprints.test.mjs
import assert from 'node:assert/strict';
import {buildGlossaryCareer, validateBlueprint, focusFor, mechanic} from '../../src/components/glossary/generate.ts';
import {NURSING_GLOSSARY} from '../../src/components/glossary/blueprints/health.ts';
import {SOFTWARE_GLOSSARY} from '../../src/components/glossary/blueprints/software.ts';
import {AVIATION_GLOSSARY} from '../../src/components/glossary/blueprints/aviation.ts';
import {CULINARY_GLOSSARY} from '../../src/components/glossary/blueprints/culinary.ts';

const blueprints=[NURSING_GLOSSARY,SOFTWARE_GLOSSARY,AVIATION_GLOSSARY,CULINARY_GLOSSARY];
const focuses=new Set();
const esc=(s)=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const says=(text,word)=>new RegExp(`\\b${esc(word)}s?\\b`,'i').test(text);
let screens=0, cases=0, sorts=0, selects=0;
for(const bp of blueprints){
  const problems=validateBlueprint(bp);
  assert.deepEqual(problems,[],`${bp.industry.slug}:\n- ${problems.join('\n- ')}`);
  const career=buildGlossaryCareer(bp);
  for(const lesson of career.lessons){
    const level=bp.levels.find(l=>l.number===lesson.lessonNumber);
    focuses.add(focusFor(level));
    const where=`${bp.industry.slug} L${lesson.lessonNumber} (${focusFor(level)})`;
    assert.ok(lesson.questions.length>=7&&lesson.questions.length<=10,`${where}: ${lesson.questions.length} scored screens; the SOP says 7 to 10`);
    screens+=lesson.questions.length;
    cases+=lesson.questions.filter(q=>q.kind==='chain').length;
    sorts+=lesson.questions.filter(q=>q.kind==='sortBuckets').length;
    selects+=lesson.questions.filter(q=>q.kind==='multiSelect').length;
    // Interaction diversity: no three of the same screen shape in a row.
    const shapes=lesson.questions.map(mechanic);
    for(let i=2;i<shapes.length;i++)assert.ok(!(shapes[i]===shapes[i-1]&&shapes[i-1]===shapes[i-2]),`${where}: three ${shapes[i]} screens in a row`);
    // At least four different screen shapes per level.
    assert.ok(new Set(shapes).size>=4,`${where}: only ${new Set(shapes).size} screen shapes`);
    // Every term credited at least twice (one credit per term per screen).
    const credits=Object.fromEntries(lesson.terms.map(t=>[t.id,0]));
    for(const q of lesson.questions){
      const ids=new Set();
      if(q.kind==='matchUp')for(const p of q.pairs)ids.add(p.termId);
      else if(q.kind==='sortBuckets')for(const it of q.items)ids.add(it.termId);
      else if(q.kind==='chain')for(const t of q.termIds??[])ids.add(t);
      else if(q.termId)ids.add(q.termId);
      for(const t of ids)credits[t]++;
    }
    for(const [t,n] of Object.entries(credits))assert.ok(n>=2,`${where}: ${t} credited ${n} time(s)`);
    // Answer leakage: nothing a screen shows says the word it asks for.
    for(const q of lesson.questions){
      if(q.kind==='choice'){
        assert.ok(q.options.length===4&&q.options[q.correctIndex]!==undefined,`${where}: ${q.id} needs 4 options`);
        if(!q.termId)continue;
        if(q.scene?.kind==='story')assert.ok(!says(q.scene.text,q.termId),`${where}: ${q.id} scene says ${q.termId}`);
        if(q.sentence)assert.ok(!says(q.sentence,q.termId),`${where}: ${q.id} sentence says ${q.termId}`);
        if(q.type!=='Catch the Misuse'&&q.type!=='Definition')assert.ok(!says(q.prompt.replace(/ Which one is that\?$/,''),q.termId),`${where}: ${q.id} prompt says ${q.termId}`);
      }
      if(q.kind==='typeTerm')assert.ok(!says(q.prompt,q.termId),`${where}: ${q.id} type prompt says ${q.termId}`);
      if(q.kind==='multiSelect')for(const o of q.options)assert.ok(!says(o,q.termId),`${where}: ${q.id} option says ${q.termId}`);
      if(q.kind==='chain')for(const step of q.steps){const a=step.options[step.correctIndex];assert.ok(!says(step.prompt,a),`${where}: ${q.id} step says its answer "${a}"`);}
    }
    // No line of copy shown twice in one lesson (main loop + review).
    const seen=new Map();
    const note=(text,id)=>{const k=text.trim().toLowerCase();if(seen.has(k))assert.fail(`${where}: "${text}" is shown twice (${seen.get(k)} and ${id})`);seen.set(k,id);};
    for(const q of [...lesson.questions,...lesson.reviewQuestions]){
      if(q.kind==='choice'&&q.scene?.kind==='story')note(q.scene.text,q.id);
      if(q.kind==='choice'&&q.scene?.kind==='compare')note(q.prompt.replace(/ Which one is that\?$/,''),q.id);
      if(q.kind==='choice'&&q.sentence)note(q.sentence.replace(/ That is ___\.$/,''),q.id);
      if(q.kind==='choice'&&q.type==='Reverse Recall')note(q.prompt,q.id);
      if(q.kind==='typeTerm')note(q.prompt.replace(/ Type the word\.$/,''),q.id);
      if(q.kind==='multiSelect')for(const o of q.options)note(o,q.id);
      if(q.kind==='sortBuckets')for(const it of q.items)note(it.text,q.id);
      if(q.kind==='matchUp')for(const p of q.pairs)note(p.right,q.id);
      if(q.kind==='chain'){if(q.scene?.kind==='story')note(q.scene.text,q.id);for(const s of q.steps)note(s.prompt,q.id);}
    }
    // Review: one Reverse Recall per word, a form the main loop never used.
    assert.equal(lesson.reviewQuestions.length,5,`${where}: five review questions`);
    assert.ok(lesson.questions.every(q=>!(q.kind==='choice'&&q.type==='Reverse Recall')),`${where}: Reverse Recall belongs to the review only`);
    // One Power Play, one paragraph, all five words, blanks not in order.
    assert.equal(lesson.powerPlay.answers.length,5,`${where}: Power Play uses five words`);
    const order=[...lesson.powerPlay.paragraph.matchAll(/\{(\d)\}/g)].map(m=>Number(m[1]));
    assert.deepEqual([...order].sort(),[1,2,3,4,5],`${where}: Power Play uses each blank once`);
    assert.ok(!order.every((n,i)=>n===i+1),`${where}: Power Play blanks run 1 to 5 in teaching order`);
    for(const a of lesson.powerPlay.answers)assert.ok(!says(lesson.powerPlay.paragraph,a),`${where}: Power Play paragraph says "${a}"`);
  }
}
assert.deepEqual([...focuses].sort(),['analyze','apply','decide','recognize'],'all four recipes are exercised by the registered blueprints');
console.log(`glossary blueprints ok: ${blueprints.map(b=>`${b.industry.slug} (${b.mode}, ${b.levels.filter(l=>l.terms).length} playable)`).join(', ')}`);
console.log(`${screens} scored screens across ${blueprints.reduce((n,b)=>n+b.levels.filter(l=>l.terms).length,0)} levels: ${cases} cases, ${sorts} sorts, ${selects} select-alls; no line is shown twice in any lesson; no Power Play runs in order`);
