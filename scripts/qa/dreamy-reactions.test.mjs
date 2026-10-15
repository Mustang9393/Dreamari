import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {dreamyReaction,dreamyReactionAsset,questionReaction} from '../../src/components/glossary/dreamyReactions.ts';
import {signalReaction,signalReactionAsset} from '../../src/components/glossary/signalReactions.ts';
import sharp from 'sharp';

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
for(const pose of ['welcome','explain','hint','case','correct','happy','idea'])assert.equal(signalReaction(pose),null,`${pose} must retain the canonical Signal rig`);
for(const [pose,expected] of Object.entries({choose:'curious',match:'curious',sort:'curious',recall:'curious',curious:'curious',calculate:'calculate',glasses:'calculate',retry:'reassure',nervous:'reassure',puzzle:'reassure',heart:'reassure',mastery:'celebrate',party:'celebrate'}))assert.equal(signalReaction(pose),expected);
let totalSignalBytes=0;
for(const reaction of ['curious','calculate','reassure','celebrate'])for(const sheet of [false,true]){
 const bytes=await readFile('public'+signalReactionAsset(reaction,sheet));
 totalSignalBytes+=bytes.length;
 const meta=await sharp(bytes).metadata();
 assert.equal(meta.hasAlpha,true);assert.equal(meta.width,sheet?1024:320);assert.equal(meta.height,meta.width);
 if(sheet){
  const frames=await Promise.all([0,1,2,3].map(i=>sharp(bytes).extract({left:i%2*512,top:Math.floor(i/2)*512,width:512,height:512}).ensureAlpha().raw().toBuffer()));
  for(const frame of frames.slice(1))for(let p=3;p<frame.length;p+=4)assert.equal(frame[p],frames[0][p],`${reaction} silhouette must stay registered`);
 }
}
assert.ok(totalSignalBytes<1100000,'Keep the selective Signal set under 1.1 MB');
const component=await readFile('src/components/glossary/GlossaryLabGameExperience.tsx','utf8');
const feedback=component.slice(component.indexOf('function FeedbackPanel('),component.indexOf('function FeedbackPanel(')+6000);
assert.ok(feedback.includes('useTypewriter(text)'));
assert.ok(feedback.includes('glossary-signal-coins'));
assert.ok(!feedback.includes('<DreamyFace'),'the feedback card has no Dreamy of its own: one Dreamy per screen (Joshua, 15 Oct 2026)');
console.log('Passed: 12 Drift poses, activity mapping, selective Signal routing, 8 lossless exports, stable silhouettes, asset budget and existing success dialogue contracts.');
