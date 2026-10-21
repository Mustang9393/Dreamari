"use client";
import { useEffect, useEffectEvent, useState, type RefObject } from "react";

/** Focus and scroll containment for a portalled dialog: focus moves into it,
 *  Tab stays inside, Escape closes, and focus goes back to the control that
 *  opened it. Born in the counselor workspace; shared app-wide since the
 *  WCAG 2.2 audit (21 Oct 2026) found 77 of 85 dialogs left keyboard and
 *  screen-reader users behind the sheet (2.4.3, 2.1.2). The dialog element
 *  needs tabIndex={-1} so it can take focus itself. */
export function useDialogFocus(open:boolean, ref:RefObject<HTMLElement|null>, onClose:()=>void, mobileOnly=false){
 const close=useEffectEvent(onClose);
 // what had focus as the dialog first rendered: an autoFocus field inside it
 // (Search) takes focus before this effect runs, and focus must still go
 // back to the opener on close
 const [opener]=useState(()=>typeof document==="undefined"?null:document.activeElement as HTMLElement|null);
 useEffect(()=>{
  if(!open || (mobileOnly && window.matchMedia("(min-width: 1024px)").matches))return;
  ref.current?.setAttribute("data-focus-managed","");
  const active=document.activeElement as HTMLElement|null;
  const previous=active && !ref.current?.contains(active) ? active : opener;
  const overflow=document.body.style.overflow;
  document.body.style.overflow="hidden";
  // an autoFocus field inside keeps its focus; otherwise the dialog takes it
  // A client-only Portal mounts its children a frame later, so try again then.
  const focusIn=()=>{if(!ref.current?.contains(document.activeElement))ref.current?.focus();};
  focusIn();
  const frame=requestAnimationFrame(focusIn);
  const key=(e:KeyboardEvent)=>{
   if(e.key==="Escape"){e.stopPropagation();close();return;}
   if(e.key!=="Tab")return;
   const items=Array.from(ref.current?.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex="0"]')??[]).filter(el=>el.getClientRects().length);
   const first=items[0],last=items[items.length-1];
   if(!first){e.preventDefault();return;}
   if(e.shiftKey&&(document.activeElement===first||document.activeElement===ref.current)){e.preventDefault();last.focus();}
   else if(!e.shiftKey&&(document.activeElement===last||document.activeElement===ref.current)){e.preventDefault();first.focus();}
  };
  document.addEventListener("keydown",key);
  return ()=>{cancelAnimationFrame(frame);document.removeEventListener("keydown",key);document.body.style.overflow=overflow;previous?.focus();};
 },[open,ref,mobileOnly,opener]);
}
