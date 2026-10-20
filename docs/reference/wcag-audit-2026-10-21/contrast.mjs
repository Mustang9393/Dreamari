import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import fs from 'fs';
const B='https://dreamari.vercel.app';
const ROUTES=process.argv.slice(2);
const lum=([r,g,b])=>{const f=c=>{c/=255;return c<=.03928?c/12.92:((c+.055)/1.055)**2.4};return .2126*f(r)+.7152*f(g)+.0722*f(b)};
const cr=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
const b=await chromium.launch(); const out={};
for(const r of ROUTES){
 const ctx=await b.newContext({viewport:{width:1366,height:768},reducedMotion:'reduce'});
 await ctx.addCookies([{name:'dm_gate_2',value:'granted',url:B}]);
 const p=await ctx.newPage();
 try{await p.goto(B+r,{waitUntil:'networkidle',timeout:45000})}catch{}
 await p.waitForTimeout(3000);
 const els=await p.evaluate(()=>{
  const cv=document.createElement('canvas');cv.width=cv.height=1;const cx=cv.getContext('2d',{willReadFrequently:true});const parse=s=>{cx.clearRect(0,0,1,1);cx.fillStyle='#000';cx.fillStyle=s;cx.fillRect(0,0,1,1);const d=cx.getImageData(0,0,1,1).data;return [d[0],d[1],d[2],d[3]/255]};
  const res=[];let i=0;
  for(const e of document.querySelectorAll('body *')){
   const own=[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim().length>1); if(!own) continue;
   const cs=getComputedStyle(e); if(cs.visibility==='hidden'||cs.display==='none') continue;
   if(e.closest('[aria-hidden=true]')||e.closest('.sr-only')) continue;
   if(cs.backgroundClip==='text'||cs.webkitBackgroundClip==='text'||cs.webkitTextFillColor==='rgba(0, 0, 0, 0)') continue;
   const rc=e.getBoundingClientRect(); const y=rc.top+scrollY; if(rc.width<4||rc.height<4||y>5000) continue;
   let op=1; for(let a=e;a;a=a.parentElement){op*=parseFloat(getComputedStyle(a).opacity)} if(op<0.1) continue;
   const fg=parse(cs.color); fg[3]*=op;
   const fs=parseFloat(cs.fontSize), fw=parseInt(cs.fontWeight);
   const large= fs>=24 || (fs>=18.66&&fw>=700);
   e.setAttribute('data-cc',i);
   res.push({i:i++,x:rc.left+scrollX,y,w:rc.width,h:rc.height,fg,large,fs,fw,txt:[...e.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join('').trim().slice(0,50),tag:e.tagName.toLowerCase(),cls:String(e.className).slice(0,60),ctl:!!e.closest('button,a,[role=button],[role=tab]'),disabled:!!e.closest('[disabled],[aria-disabled=true]')});
  }
  const st=document.createElement('style');st.textContent='*{color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important;caret-color:transparent!important;text-decoration-color:transparent!important}';document.head.appendChild(st);
  return res;});
 await p.waitForTimeout(400);
 const buf=await p.screenshot({fullPage:true,animations:'disabled'});
 const png=PNG.sync.read(buf); const fails=[];
 for(const e of els){
  const px=[];const x0=Math.max(0,Math.floor(e.x)),y0=Math.max(0,Math.floor(e.y));
  const x1=Math.min(png.width-1,Math.ceil(e.x+e.w)),y1=Math.min(png.height-1,Math.ceil(e.y+e.h));
  const step=Math.max(1,Math.floor((x1-x0)*(y1-y0)/400));
  let k=0;for(let yy=y0;yy<=y1;yy++)for(let xx=x0;xx<=x1;xx++){if((k++)%step)continue;const o=(png.width*yy+xx)*4;px.push([png.data[o],png.data[o+1],png.data[o+2]])}
  if(!px.length) continue;
  const ratios=px.map(bg=>{const a=e.fg[3];const f=[0,1,2].map(c=>e.fg[c]*a+bg[c]*(1-a));return cr(f,bg)}).sort((a,b)=>a-b);
  const med=ratios[Math.floor(ratios.length/2)];
  const need=e.large?3:4.5;
  if(med<need && !e.disabled) fails.push({...e,ratio:+med.toFixed(2),need});
 }
 out[r]={checked:els.length,fails};
 console.error(r,'checked',els.length,'fails',fails.length);
 await ctx.close();
}
fs.writeFileSync('contrast-'+ROUTES.length+'-'+Date.now()+'.json',JSON.stringify(out));
await b.close();
