import json,glob,re,sys
from PIL import Image
def parse(c):
  m=re.match(r'rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)',c)
  if m: return [float(m.group(i)) for i in (1,2,3)], float(m.group(4) or 1)
  m=re.match(r'color\(srgb ([\d.e-]+) ([\d.e-]+) ([\d.e-]+)(?: / ([\d.]+))?\)',c)
  if m: return [float(m.group(i))*255 for i in (1,2,3)], float(m.group(4) or 1)
  m=re.match(r'#([0-9a-f]{6})',c)
  if m: h=m.group(1); return [int(h[i:i+2],16) for i in (0,2,4)],1
  return None,None
def lum(c):
  def ch(v):
    v/=255; return v/12.92 if v<=0.03928 else ((v+0.055)/1.055)**2.4
  r,g,b=c; return 0.2126*ch(r)+0.7152*ch(g)+0.0722*ch(b)
def ratio(a,b):
  la,lb=lum(a),lum(b); hi,lo=max(la,lb),min(la,lb); return (hi+0.05)/(lo+0.05)
rows=[]
for jf in sorted(glob.glob('wcag-lm/*.json')):
  if jf.endswith('results.json') or jf.endswith('fails.json'): continue
  img=Image.open(jf[:-5]+'.png').convert('RGB'); W,H=img.size
  for e in json.load(open(jf)):
    fg,a=parse(e['color'])
    if fg is None: continue
    a*=e['op']
    x0,y0=int(e['x']),int(e['y']); x1,y1=int(e['x']+e['w']),int(e['y']+e['h'])
    if x1<=x0 or y1<=y0 or x0<0 or y0<0 or x1>W or y1>H: continue
    pts=[]
    sx=max(1,(x1-x0)//8); sy=max(1,(y1-y0)//4)
    for x in range(x0,x1,sx):
      for y in range(y0,y1,sy): pts.append(img.getpixel((x,y)))
    rs=[]
    for bg in pts:
      blended=[a*fg[i]+(1-a)*bg[i] for i in range(3)]
      rs.append(ratio(blended,bg))
    rs.sort(); worst=rs[max(0,len(rs)//10)]  # 10th percentile
    large = e['fs']>=24 or (e['fs']>=18.66 and e['fw']>=700)
    need=3.0 if large else 4.5
    if worst<need:
      rows.append((jf.split('/')[-1][:-5], round(worst,2), need, e['fs'], e['fw'], e['txt'][:40], e['cls'][:70], e['color']))
import collections
print('FAILS:',len(rows))
by=collections.Counter((r[6],r[7]) for r in rows)
for (cls,col),n in by.most_common(45): 
  ex=[r for r in rows if r[6]==cls and r[7]==col][0]
  print(f"{n:4d} | {ex[1]} need {ex[2]} | {ex[3]}px w{ex[4]} | {col} | {cls} | e.g. '{ex[5]}' @ {ex[0]}")
json.dump(rows,open('wcag-lm/fails.json','w'))
