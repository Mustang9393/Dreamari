"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

type Reminder = { title: string; detail: string; go: () => void };
const reducedSnapshot = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const reducedServerSnapshot = () => true;
function subscribeReduced(notify: () => void) {
 const query = window.matchMedia("(prefers-reduced-motion: reduce)");
 query.addEventListener("change", notify);
 return () => query.removeEventListener("change", notify);
}

/** One update per slide; pause rotation while someone is interacting. */
export function ReminderCarousel({ items }: { items: Reminder[] }) {
 const [index, setIndex] = useState(0);
 const [paused, setPaused] = useState(false);
 const [hovered, setHovered] = useState(false);
 const [focused, setFocused] = useState(false);
 const reduced = useSyncExternalStore(subscribeReduced, reducedSnapshot, reducedServerSnapshot);
 const count = items.length;
 const current = count ? index % count : 0;
 const stopped = paused || hovered || focused || reduced;
 useEffect(() => {
  if (stopped || count < 2) return;
  const timer = window.setInterval(() => {
   if (document.visibilityState === "visible") setIndex(i => (i + 1) % count);
  }, 8000);
  return () => window.clearInterval(timer);
 }, [stopped, count]);
 if (!count) return null;
 const item = items[current];
 const move = (direction: number) => setIndex(i => (i + direction + count) % count);
 return <section className="v4-reminder-stack" aria-label="Reminders" aria-roledescription="carousel"
  onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
  onFocusCapture={() => setFocused(true)} onBlurCapture={e => { if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false); }}>
  <div className="v4-reminder-slide" role="group" aria-roledescription="slide" aria-label={`${current + 1} of ${count}`} aria-live={focused ? "polite" : "off"}>
   <button type="button" className="v4-reminder-row dm-quiet" onClick={item.go}><span><strong>{item.title}<ArrowUpRight size={14} aria-hidden/></strong><small>{item.detail}</small></span></button>
  </div>
  {count > 1 && <div className="v4-reminder-controls" role="group" aria-label="Reminder controls">
   <button type="button" className="dm-quiet" aria-label="Previous reminder" onClick={() => move(-1)}><ChevronLeft size={14} aria-hidden/></button>
   <span className="v4-reminder-position" aria-live="off">{current + 1} / {count}</span>
   <button type="button" className="dm-quiet" aria-label="Next reminder" onClick={() => move(1)}><ChevronRight size={14} aria-hidden/></button>
   {!reduced && <button type="button" className="dm-quiet" aria-label={paused ? "Resume reminder rotation" : "Pause reminder rotation"} aria-pressed={paused} onClick={() => setPaused(!paused)}>{paused ? <Play size={12} aria-hidden/> : <Pause size={12} aria-hidden/>}</button>}
  </div>}
 </section>;
}
