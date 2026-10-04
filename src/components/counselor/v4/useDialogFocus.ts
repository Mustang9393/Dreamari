"use client";
import { useEffect, useEffectEvent, type RefObject } from "react";

/** Focus and scroll containment for the workspace's portalled dialogs. */
export function useDialogFocus(open:boolean, ref:RefObject<HTMLElement|null>, onClose:()=>void, mobileOnly=false){
 const close=useEffectEvent(onClose);
 useEffect(()=>{
  if(!open || (mobileOnly && window.matchMedia("(min-width: 1024px)").matches))return;
  const previous=document.activeElement as HTMLElement|null;
  const overflow=document.body.style.overflow;
  document.body.style.overflow="hidden";
  ref.current?.focus();
  const key=(e:KeyboardEvent)=>{
   if(e.key==="Escape"){e.stopPropagation();close();return;}
   if(e.key!=="Tab")return;
   const items=Array.from(ref.current?.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input:not(:disabled),textarea:not(:disabled),[tabindex="0"]')??[]).filter(el=>el.getClientRects().length);
   const first=items[0],last=items[items.length-1];
   if(!first){e.preventDefault();return;}
   if(e.shiftKey&&(document.activeElement===first||document.activeElement===ref.current)){e.preventDefault();last.focus();}
   else if(!e.shiftKey&&(document.activeElement===last||document.activeElement===ref.current)){e.preventDefault();first.focus();}
  };
  document.addEventListener("keydown",key);
  return ()=>{document.removeEventListener("keydown",key);document.body.style.overflow=overflow;previous?.focus();};
 },[open,ref,mobileOnly]);
}
