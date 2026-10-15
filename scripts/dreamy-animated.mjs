import sharp from 'sharp';
import { readFile, writeFile, mkdir, copyFile, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

const [command, manifestFile, packRoot] = process.argv.slice(2);
if (!['prepare', 'validate'].includes(command) || !manifestFile || !path.isAbsolute(packRoot ?? '')) throw new Error('Usage: prepare|validate <manifest> <absolute pack>');
const manifest = JSON.parse(await readFile(manifestFile, 'utf8'));
if (!/^[a-z0-9-]+$/.test(manifest.version)) throw new Error('Unsafe version');
const root = path.resolve('public/images/glossary', manifest.version);
const receiptFile = manifestFile.replace(/\.json$/, '-receipt.json');
const sha = b => createHash('sha256').update(b).digest('hex');
const exists = async p => { try { await access(p); return true; } catch { return false; } };
const themes = manifest.themes ?? ['drift','signal'];
const palette = ['101c4a', '3458b8', '579de6', '40d6ed', 'b8edf3', 'f5fff4', 'ffffff', 'ffcf63'].map(h => [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)));

// Largest connected alpha component registers the BODY, not a detached prop.
async function measure(bytes) {
  const { data, info } = await sharp(bytes).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let l = info.width, t = info.height, r = -1, b = -1;
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    if (data[(y * info.width + x) * 4 + 3] > 128) { l = Math.min(l, x); t = Math.min(t, y); r = Math.max(r, x); b = Math.max(b, y); }
  }
  if (r < l) throw new Error('Empty frame');
  const n = 192, probe = await sharp(bytes).resize(n, n, { fit: 'fill', kernel: 'nearest' }).ensureAlpha().raw().toBuffer();
  const seen = new Uint8Array(n * n); let body;
  for (let p = 0; p < n * n; p++) {
    if (seen[p] || probe[p * 4 + 3] < 128) continue;
    const queue = [p]; seen[p] = 1; let count = 0, x0 = n, y0 = n, x1 = 0, y1 = 0;
    while (queue.length) {
      const i = queue.pop(), x = i % n, y = Math.floor(i / n); count++;
      x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
      for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]]) {
        const xx = x + dx, yy = y + dy, j = yy * n + xx;
        if (xx < 0 || yy < 0 || xx >= n || yy >= n || seen[j] || probe[j * 4 + 3] < 128) continue;
        seen[j] = 1; queue.push(j);
      }
    }
    if (!body || count > body.count) body = { count, x: x0 / n * info.width, y: y0 / n * info.height, width: (x1 - x0 + 1) / n * info.width, height: (y1 - y0 + 1) / n * info.height };
  }
  return { alpha: { x: l, y: t, width: r-l+1, height: b-t+1 }, body };
}

async function normalize(bytes, logical, pixel) {
  const { alpha: a, body: b } = await measure(bytes);
  const cx = b.x + b.width / 2, cy = b.y + b.height / 2;
  let scale = logical * .72 / b.width;
  for (const [extent, room] of [[cx-a.x,.43*logical],[a.x+a.width-cx,.43*logical],[cy-a.y,.45*logical],[a.y+a.height-cy,.41*logical]]) if (extent > 0) scale = Math.min(scale, room / extent);
  const width = Math.max(1, Math.round(a.width * scale)), height = Math.max(1, Math.round(a.height * scale));
  let subject = await sharp(bytes).extract({ left: a.x, top: a.y, width: a.width, height: a.height }).resize(width, height, { kernel: pixel ? 'nearest' : 'lanczos3' }).ensureAlpha().raw().toBuffer();
  if (pixel) {
    // Export quantization, not a replacement for generating real pixel art.
    // One exact opaque eight-colour palette and binary alpha for ALL poses.
    subject = Buffer.from(subject);
    for (let i = 0; i < subject.length; i += 4) {
      subject[i+3] = subject[i+3] >= 128 ? 255 : 0;
      if (!subject[i+3]) { subject[i]=0;subject[i+1]=0;subject[i+2]=0;continue; }
      let chosen = palette[0], distance = Infinity;
      for (const c of palette) { const d = c.reduce((sum, v, k) => sum + (v-subject[i+k])**2, 0); if (d < distance) { distance = d; chosen = c; } }
      chosen.forEach((v,k) => subject[i+k]=v);
    }
  }
  const png = await sharp(subject, { raw: { width, height, channels: 4 } }).png().toBuffer();
  return sharp({ create: { width: logical, height: logical, channels: 4, background: '#00000000' } }).composite([{ input: png, left: Math.round(logical*.5-(cx-a.x)*scale), top: Math.round(logical*.52-(cy-a.y)*scale) }]).png().toBuffer();
}

const receipt = { version: manifest.version, method: 'built-in ImageGen, four generated facial frames per pose', assets: [] };
if (command === 'prepare' && await exists(receiptFile)) throw new Error('Version exists. Use a new version.');
for (const state of manifest.states) for (const theme of themes) {
  const source = state.animationSources[theme], bytes = await readFile(source);
  const outputs = [];
  if (command === 'prepare') {
    const meta = await sharp(bytes).metadata();
    if (!meta.hasAlpha) throw new Error('Sheet needs true alpha');
    // Transparent generation can crop a single edge pixel from its sheet.
    // Ignore the spare row/column, never distort a cell to make it even.
    const w = Math.floor(meta.width / 2), h = Math.floor(meta.height / 2), logical = theme === 'signal' ? 64 : 384;
    const frames = [];
    for (let frame = 0; frame < 4; frame++) {
      const cell = await sharp(bytes).extract({ left: frame%2*w, top: Math.floor(frame/2)*h, width:w,height:h }).png().toBuffer();
      frames.push(await normalize(cell, logical, theme === 'signal'));
    }
    await mkdir(path.join(root,theme), { recursive:true });
    await mkdir(path.join(packRoot,theme), { recursive:true });
    await mkdir(path.join(packRoot,'source-png'), { recursive:true });
    const layers = frames.map((input,i)=>({input,left:i%2*logical,top:Math.floor(i/2)*logical}));
    const atlas = await sharp({create:{width:logical*2,height:logical*2,channels:4,background:'#00000000'}}).composite(layers).webp({lossless:theme==='signal',quality:84,alphaQuality:100,effort:6}).toBuffer();
    await writeFile(path.join(root,theme,state.id+'-sheet.webp'),atlas,{flag:'wx'});
    for (const size of [768,256]) {
      const out = await sharp(frames[0]).resize(size,size,{kernel:theme==='signal'?'nearest':'lanczos3'}).webp({lossless:theme==='signal',quality:86,alphaQuality:100,effort:6}).toBuffer();
      await writeFile(path.join(root,theme,state.id+(size===256?'-256':'')+'.webp'),out,{flag:'wx'});
    }
    await copyFile(source,path.join(packRoot,'source-png',theme+'-'+state.id+'-sheet.png'));
  }
  for (const suffix of ['','-256','-sheet']) {
    const file = path.join(root,theme,state.id+suffix+'.webp'), out=await readFile(file), meta=await sharp(out).metadata();
    const expected=suffix==='-sheet'?(theme==='signal'?128:768):suffix==='-256'?256:768;
    if(!meta.hasAlpha||meta.width!==expected||meta.height!==expected||out.length>(suffix==='-sheet'?180000:130000))throw new Error('Asset failed geometry/alpha/budget '+file);
    if(suffix==='-sheet'){
      const cell=expected/2, centers=[];
      for(let i=0;i<4;i++){
        const frame=await sharp(out).extract({left:i%2*cell,top:Math.floor(i/2)*cell,width:cell,height:cell}).png().toBuffer();
        const {body}=await measure(frame);
        centers.push([body.x+body.width/2,body.y+body.height/2]);
      }
      const spread=[0,1].map(axis=>Math.max(...centers.map(p=>p[axis]))-Math.min(...centers.map(p=>p[axis])));
      if(spread.some(v=>v>cell*.012))throw new Error('Unstable body registration: '+file+' '+spread);
      console.log(theme+'/'+state.id+' frame centre spread: '+spread.join(', ')+' px');
    }
    if(theme==='signal'){
      const raw=await sharp(out).ensureAlpha().raw().toBuffer(), colors=new Set();
      for(let i=0;i<raw.length;i+=4){if(raw[i+3]!==0&&raw[i+3]!==255)throw new Error('Signal soft alpha');if(raw[i+3])colors.add(raw.subarray(i,i+3).toString('hex'));}
      if(colors.size>8)throw new Error('Signal palette drift');
    }
    if(command==='prepare')await copyFile(file,path.join(packRoot,theme,path.basename(file)));
    outputs.push({file:path.relative(process.cwd(),file),bytes:out.length,sha256:sha(out),size:expected});
  }
  receipt.assets.push({theme,id:state.id,sourceSha256:sha(bytes),outputs});
}
if(command==='prepare')await writeFile(receiptFile,JSON.stringify(receipt,null,2)+'\n',{flag:'wx'});
else if(JSON.stringify(receipt)!==JSON.stringify(JSON.parse(await readFile(receiptFile,'utf8'))))throw new Error('Receipt mismatch');
console.log('Validated '+receipt.assets.length+' poses, '+receipt.assets.length*4+' facial frames, '+receipt.assets.length*3+' WebPs, geometry, alpha, hashes and budgets.');
