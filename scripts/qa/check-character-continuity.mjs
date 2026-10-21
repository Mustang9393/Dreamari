// A changed image invalidates its recorded visual review. This does not infer
// ethnicity, measure a person's complexion, or replace the visual comparison.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const root=process.cwd(),career=process.argv[2];
if(!career)throw Error('Pass a career ID.');
const folder=career==='ui-ux-designer'?'ux-designer':career;
const base=path.join(root,'docs/handoff/career-scaling');
const ledger=JSON.parse(fs.readFileSync(path.join(base,folder,'cast-and-style-v6.json')));
const report=JSON.parse(fs.readFileSync(path.join(base,folder,'identity-reviews-v6.json')));
const coverage=JSON.parse(fs.readFileSync(path.join(base,'examples',career+'-coverage.json')));
const art=JSON.parse(fs.readFileSync(path.join(root,'src/components/play/art',career+'.json')));
const sha=src=>createHash('sha256').update(fs.readFileSync(path.join(root,'public',src))).digest('hex');
let checks=0;
for(const group of coverage.groups)for(const name of group.visibleCast){
 const character=ledger.cast[name],scene=art.locations[group.scene].src;
 const record=report.reviews.find(r=>r.character===name&&r.scene===scene);
 if(!character||!record||record.status!=='compared')throw Error(name+' / '+scene+': missing identity review');
 if(record.canonicalFace!==character.canonicalFace||record.canonicalFaceSha256!==sha(character.canonicalFace)||record.sceneSha256!==sha(scene))throw Error(name+' / '+scene+': image changed; repeat visual identity comparison');
 if(!character.iris||!character.complexion||!character.hair)throw Error(name+': incomplete identity');
 checks++;
}
console.log(JSON.stringify({career,checks,status:'Recorded identity reviews match current images',limitation:'Hashes preserve review provenance; they do not certify visual identity or pixel-perfect regeneration.'}));
