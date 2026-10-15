import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {dreamyReaction,dreamyReactionAsset,questionReaction} from '../../src/components/glossary/dreamyReactions.ts';

const manifest=JSON.parse(await readFile('docs/reference/dreamy-drift-animated-oct15-v2.json','utf8'));
assert.equal(new Set(manifest.states.map(s=>s.id)).size,12);
for(const state of manifest.states) {
  for(const sheet of [false,true])await access('public'+dreamyReactionAsset(state.id,sheet));
}
for(const [pose,expected] of Object.entries({happy:'welcome',glasses:'calculate',idea:'hint',curious:'choose',party:'mastery',nervous:'retry',puzzle:'retry',heart:'retry'}))assert.equal(dreamyReaction(pose),expected);
for(const [question,expected,numeric] of [
  [{kind:'matchUp'},'match'],[{kind:'sortBuckets'},'sort'],
  [{kind:'profitBuilder'},'calculate'],[{kind:'typeTerm'},'recall'],
  [{kind:'chain'},'case'],[{kind:'chain'},'calculate',true],
  [{kind:'choice',type:'Reverse Recall'},'recall'],
  [{kind:'choice',sentence:'Example'},'recall'],
  [{kind:'choice',scene:{kind:'figures'}},'calculate'],
  [{kind:'choice',scene:{kind:'shares'}},'calculate'],
  [{kind:'choice',scene:{kind:'split'}},'calculate'],
  [{kind:'choice',visual:{kind:'profit'}},'calculate'],
  [{kind:'choice',scene:{kind:'story'}},'case'],
  [{kind:'choice'},'choose'],[{kind:'multiSelect'},'choose'],
])assert.equal(questionReaction(question,numeric),expected);
console.log('Dreamy mappings: 12 Drift poses, both runtime exports, 8 legacy aliases and 15 activity cases passed. Signal candidates are not routed.');
