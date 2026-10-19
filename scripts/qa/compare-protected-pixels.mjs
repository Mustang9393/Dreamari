// Read-only pixel gate: edits never pass on visual similarity alone.
import fs from 'node:fs';
import sharp from 'sharp';
const [base, candidate, regionFile, reportFile] = process.argv.slice(2);
if (!base || !candidate || !regionFile) throw Error('Usage: node scripts/qa/compare-protected-pixels.mjs base candidate regions.json [report.json]');
const regions = JSON.parse(fs.readFileSync(regionFile, 'utf8'));
if (!Array.isArray(regions) || regions.some(r => !['x','y','width','height'].every(k => Number.isInteger(r[k])) || r.width <= 0 || r.height <= 0 || r.x < 0 || r.y < 0)) throw Error('Regions must be nonnegative integer rectangles with positive width/height.');
const [a,b] = await Promise.all([base,candidate].map(p => sharp(p).ensureAlpha().raw().toBuffer({resolveWithObject:true})));
const dimensionsMatch = a.info.width === b.info.width && a.info.height === b.info.height;
if (regions.some(r => r.x+r.width > a.info.width || r.y+r.height > a.info.height)) throw Error('Edit region exceeds source dimensions.');
let protectedPixels=0,changedProtectedPixels=0,changedAllowedPixels=0,maxChannelDifference=0;
if(dimensionsMatch) for(let y=0;y<a.info.height;y++) for(let x=0;x<a.info.width;x++) {
 const allowed=regions.some(r=>x>=r.x&&x<r.x+r.width&&y>=r.y&&y<r.y+r.height);
 const i=(y*a.info.width+x)*4;let diff=0;
 for(let c=0;c<4;c++) diff=Math.max(diff,Math.abs(a.data[i+c]-b.data[i+c]));
 if(allowed){if(diff)changedAllowedPixels++;}else{protectedPixels++;if(diff)changedProtectedPixels++;maxChannelDifference=Math.max(maxChannelDifference,diff);}
}
const result={dimensionsMatch,sourceSize:[a.info.width,a.info.height],candidateSize:[b.info.width,b.info.height],allowedRegions:regions,protectedPixels,changedProtectedPixels,changedAllowedPixels,changedProtectedPercent:protectedPixels?+(100*changedProtectedPixels/protectedPixels).toFixed(4):null,maxChannelDifference,pass:dimensionsMatch&&protectedPixels>0&&changedProtectedPixels===0};
if(reportFile)fs.writeFileSync(reportFile,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));if(!result.pass)process.exitCode=1;
