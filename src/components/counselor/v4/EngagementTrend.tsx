"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";

type Point = { label: string; total: number; unique: number; avg: number };
type Coordinate = { x: number; y: number };

/** v4-only presentation of existing engagement data. One zero-based scale
 * for both series; point readout stays in flow instead of floating over
 * the graph. Period buttons support touch and keyboard as well as hover. */
export function EngagementTrend({ data, path }: { data: Point[]; path: (points: Coordinate[]) => string }) {
  const id = useId().replace(/:/g, "");
  const wrap = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [selected, setSelected] = useState(Math.max(0, data.length - 1));
  useLayoutEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (!data.length) return <p className="v4-source-note">No login activity in this period.</p>;
  const index = Math.min(selected, data.length - 1);
  const current = data[index];
  const height = width < 520 ? 220 : 300;
  const left = 36, right = 44, top = 20, bottom = 16;
  const plotW = Math.max(1, width - left - right);
  const plotH = height - top - bottom;
  const peak = Math.max(1, ...data.flatMap((p) => [p.total, p.unique]));
  const magnitude = 10 ** Math.floor(Math.log10(peak / 4));
  const step = Math.max(1, ([1, 2, 2.5, 5, 10].find((n) => n * magnitude >= peak / 4) ?? 10) * magnitude);
  const max = Math.ceil(peak / step) * step;
  const ticks = Array.from({ length: Math.round(max / step) + 1 }, (_, i) => i * step);
  const x = (i: number) => left + ((i + .5) / data.length) * plotW;
  const y = (n: number) => top + (1 - n / max) * plotH;
  const coordinates = (key: "total" | "unique") => data.map((p, i) => ({ x: x(i), y: y(p[key]) }));
  const totalPath = path(coordinates("total"));
  const total = "var(--primary)";
  const active = "color-mix(in srgb, var(--primary) 55%, var(--muted-foreground))";

  return <figure className="v4-trend">
    <figcaption className="v4-trend-readout" aria-live="polite" aria-atomic="true">
      <span className="v4-trend-date">{current.label}</span>
      <span className="v4-trend-series"><i style={{ background: total }} aria-hidden/><b>{current.total}</b> Total Logins</span>
      <span className="v4-trend-series"><i className="is-dashed" style={{ borderColor: active }} aria-hidden/><b>{current.unique}</b> Active students</span>
      <span className="v4-trend-average">{current.avg.toFixed(2)} logins each</span>
    </figcaption>
    <div ref={wrap} className="v4-trend-plot" style={{height}}>
      {width>0 && <svg width={width} height={height} aria-hidden="true" className="v4-trend-svg">
        <defs><linearGradient id={`trend-${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={total} stopOpacity=".12"/><stop offset="100%" stopColor={total} stopOpacity="0"/></linearGradient></defs>
        {ticks.map((tick)=><g key={tick}>
          <line x1={left} x2={width-right} y1={y(tick)} y2={y(tick)} stroke="var(--v4-line)" strokeWidth="1"/>
          <text x={left-12} y={y(tick)+4} textAnchor="end" fill="var(--muted-foreground)" fontSize="11">{tick}</text>
        </g>)}
        {data.length>1 && <>
          <path d={`${totalPath} L${x(data.length-1)} ${y(0)} L${x(0)} ${y(0)} Z`} fill={`url(#trend-${id})`}/>
          <path d={totalPath} fill="none" stroke={total} strokeWidth="3" strokeLinecap="round"/>
          <path d={path(coordinates("unique"))} fill="none" stroke={active} strokeWidth="2" strokeDasharray="5 5" strokeLinecap="round"/>
        </>}
        <line x1={x(index)} x2={x(index)} y1={top} y2={y(0)} stroke="var(--v4-line)" strokeDasharray="3 4"/>
        {data.map((p,i)=><g key={p.label}>
          {(["total","unique"] as const).map((key)=><circle key={key} cx={x(i)} cy={y(p[key])} r={index===i?5:2.5} fill={key==="total"?total:active} stroke="var(--background)" strokeWidth={index===i?2:0}/>) }
          <rect x={left+i*plotW/data.length} y={top} width={plotW/data.length} height={plotH} fill="transparent" onPointerEnter={()=>setSelected(i)} onPointerDown={()=>setSelected(i)}/>
        </g>)}
        {(["total","unique"] as const).map((key)=><text key={key} x={x(index)+10} y={key==="unique" && Math.abs(y(current.total)-y(current.unique))<24 ? Math.min(height-2,y(current[key])+16) : y(current[key])-10} fill={key==="total"?total:active} fontSize="12" fontWeight="600">{current[key]}</text>)}
      </svg>}
    </div>
    <div className="v4-trend-periods" role="group" aria-label="Login periods" style={{gridTemplateColumns:`repeat(${data.length},minmax(0,1fr))`}}>
      {data.map((p,i)=><button key={p.label} type="button" aria-pressed={i===index} aria-label={`${p.label}: ${p.total} total logins, ${p.unique} unique students, ${p.avg.toFixed(2)} logins each`} onClick={()=>setSelected(i)} onFocus={()=>setSelected(i)} className="dm-quiet"><span className="v4-period-full">{p.label}</span><span className="v4-period-short" aria-hidden>{/\d{4}$/.test(p.label)?p.label.split(" ")[0]:p.label.split(" ").at(-1)}</span></button>)}
    </div>
  </figure>;
}
