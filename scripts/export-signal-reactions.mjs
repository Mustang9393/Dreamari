import sharp from 'sharp';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';

// Export reviewed assets only. Never regenerate or overwrite the canonical rig.
const source=process.argv[2];
if(!source)throw new Error('Usage: node scripts/export-signal-reactions.mjs <review-folder>');
const destination='public/images/glossary/dreamy-signal-animated-oct15';
const sha=b=>createHash('sha256').update(b).digest('hex');
const jobs=JSON.parse(await readFile(path.join(source,'animation-sources.json'),'utf8'));
await mkdir(destination,{recursive:true});
const assets=[];
for(const job of jobs){
 const sheet=await readFile(path.join(source,'animated',`${job.id}-atlas.webp`));
 const still=await readFile(path.join(source,'animated',`${job.id}-still.webp`));
 for(const [suffix,input,size] of [['sheet',sheet,1024],['320',still,320]]){
  const bytes=await sharp(input).resize(size,size,{fit:'fill',kernel:'nearest'}).webp({lossless:true,effort:6}).toBuffer();
  const file=`${destination}/${job.id}-${suffix}.webp`;
  const meta=await sharp(bytes).metadata();
  if(meta.width!==size||meta.height!==size||!meta.hasAlpha)throw new Error('Invalid sprite export '+file);
  await writeFile(file,bytes);assets.push({file,bytes:bytes.length,sha256:sha(bytes),width:size,height:size});
 }
}
await writeFile('docs/reference/dreamy-signal-animated-oct15.json',JSON.stringify({
 status:'Approved for selective integration on 15 October 2026',
 why:'Reuse existing success dialogue and mix canonical live reactions with the four reviewed animated poses.',
 method:'Built-in ImageGen facial frames, approved immutable cloud base, registered eye/mouth regions, lossless pixel-art export.',
 layout:{sheet:[1024,1024],cell:[512,512],order:['rest','blink','talk-a','talk-b'],actorAspect:'3:2'},
 keepCanonical:['welcome','explain','hint','case','correct','happy','idea'],
 jobs,assets,
},null,2)+'\n');
console.log(`Exported ${assets.length} Signal assets, ${assets.reduce((n,a)=>n+a.bytes,0)} bytes. Canonical live assets unchanged.`);
