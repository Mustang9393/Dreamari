// Every registered glossary blueprint builds, and every generated level
// obeys the Master Scaling Plan SOP rules the generator promises
// (16 Oct 2026): seven scored questions plus one Power Play, never more
// than two of the same mechanic in a row, every term credited at least
// twice in the main loop, no question gives its own answer away, and the
// Power Play uses all five words once. Run: node scripts/qa/glossary-blueprints.test.mjs
import assert from 'node:assert/strict';
import {buildGlossaryCareer, validateBlueprint, focusFor} from '../../src/components/glossary/generate.ts';
import {NURSING_GLOSSARY} from '../../src/components/glossary/blueprints/health.ts';
import {SOFTWARE_GLOSSARY} from '../../src/components/glossary/blueprints/software.ts';
import {AVIATION_GLOSSARY} from '../../src/components/glossary/blueprints/aviation.ts';
import {CULINARY_GLOSSARY} from '../../src/components/glossary/blueprints/culinary.ts';

const blueprints=[NURSING_GLOSSARY,SOFTWARE_GLOSSARY,AVIATION_GLOSSARY,CULINARY_GLOSSARY];
const focuses=new Set();
for(const bp of blueprints){
  const problems=validateBlueprint(bp);
  assert.deepEqual(problems,[],`${bp.industry.slug}:\n- ${problems.join('\n- ')}`);
  const career=buildGlossaryCareer(bp);
  for(const lesson of career.lessons){
    const level=bp.levels.find(l=>l.number===lesson.lessonNumber);
    focuses.add(focusFor(level));
    const where=`${bp.industry.slug} L${lesson.lessonNumber} (${focusFor(level)})`;
    assert.equal(lesson.questions.length,7,`${where}: 7 scored questions`);
    // Interaction diversity: no three of the same mechanic in a row.
    const kinds=lesson.questions.map(q=>q.kind);
    for(let i=2;i<kinds.length;i++)assert.ok(!(kinds[i]===kinds[i-1]&&kinds[i-1]===kinds[i-2]),`${where}: three ${kinds[i]} questions in a row`);
    // Every term credited at least twice.
    const credits=Object.fromEntries(lesson.terms.map(t=>[t.id,0]));
    for(const q of lesson.questions){
      if(q.kind==='matchUp')for(const p of q.pairs)credits[p.termId]++;
      else if(q.kind==='sortBuckets')for(const it of q.items)credits[it.termId]++;
      else if(q.termId)credits[q.termId]++;
    }
    for(const [t,n] of Object.entries(credits))assert.ok(n>=2,`${where}: ${t} credited ${n} time(s)`);
    // Answer leakage: a scene line or a Which Word prompt never says the word it asks for.
    for(const q of lesson.questions){
      if(!q.termId)continue;
      const word=new RegExp(`\\b${q.termId.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}\\b`,'i');
      if(q.kind==='choice'&&q.scene?.kind==='story')assert.ok(!word.test(q.scene.text),`${where}: scene says ${q.termId}`);
      if(q.kind==='choice'&&q.sentence)assert.ok(!word.test(q.sentence),`${where}: sentence says ${q.termId}`);
      if(q.kind==='choice'&&q.type==='Reverse Recall')assert.ok(!word.test(q.prompt),`${where}: recall prompt says ${q.termId}`);
      if(q.kind==='typeTerm')assert.ok(!word.test(q.prompt),`${where}: type prompt says ${q.termId}`);
      if(q.kind==='choice')assert.ok(q.options.length===4&&q.options[q.correctIndex]!==undefined,`${where}: ${q.id} needs 4 options`);
    }
    // One Power Play, one paragraph, all five words.
    assert.equal(lesson.powerPlay.answers.length,5,`${where}: Power Play uses five words`);
    for(let i=1;i<=5;i++)assert.ok(lesson.powerPlay.paragraph.includes(`{${i}}`),`${where}: Power Play blank ${i}`);
  }
}
assert.deepEqual([...focuses].sort(),['analyze','apply','decide','recognize'],'all four recipes are exercised by the registered blueprints');
console.log(`glossary blueprints ok: ${blueprints.map(b=>`${b.industry.slug} (${b.mode}, ${b.levels.filter(l=>l.terms).length} playable)`).join(', ')}`);
