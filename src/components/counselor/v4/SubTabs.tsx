"use client";
import { Segmented } from "./viz";
export function SubTabs<K extends string>({options,value,onChange,ariaLabel}:{options:{key:K;label:string;count?:number}[];value:K;onChange:(key:K)=>void;ariaLabel:string}) {return <Segmented options={options.map(o=>({...o,badge:o.count}))} value={value} onChange={onChange} ariaLabel={ariaLabel}/>;}
