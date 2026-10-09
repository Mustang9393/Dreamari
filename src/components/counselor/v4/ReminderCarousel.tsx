"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { IconTip } from "@/components/app/IconTip";

type Reminder = { title: string; detail: string; go: () => void };
const reducedSnapshot = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const reducedServerSnapshot = () => true;
function subscribeReduced(notify: () => void) {
 const query = window.matchMedia("(prefers-reduced-motion: reduce)");
 query.addEventListener("change", notify);
 return () => query.removeEventListener("change", notify);
}

/** One update per slide; pause rotation while someone is interacting.
 *  9 Oct 2026 (Chandu: the top band "might look a little cluttered ...
 *  just improve the design a bit so it doesn't read like clutter"): the
 *  previous / "2 / 3" / next / pause strip was four controls under one
 *  line of text. It is now one dot per reminder (each jumps to its slide,
 *  the current one a short bar), and the pause button shows on hover and
 *  keyboard focus, which is also when rotation already stops. Pause stays
 *  reachable, so moving content still has its stop control (WCAG 2.2.2).
 *  Slides cross-fade instead of swapping.
 *  10 Oct 2026 (Chandu: "the dots arent intuitive to click on to run
 *  through the reminders ... Can we add arrows?"): Previous and Next
 *  arrows flank the dots; the dots still jump straight to a slide. */
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
 return <section className="v4-reminder-stack" aria-label="Reminders" aria-roledescription="carousel"
  onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
  onFocusCapture={() => setFocused(true)} onBlurCapture={e => { if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false); }}>
  <div key={current} className="v4-reminder-slide" role="group" aria-roledescription="slide" aria-label={`${current + 1} of ${count}`} aria-live={focused ? "polite" : "off"}>
   <button type="button" className="v4-reminder-row dm-quiet" onClick={item.go}><span><strong>{item.title}<ArrowUpRight size={14} aria-hidden/></strong><small>{item.detail}</small></span></button>
  </div>
  {count > 1 && <div className="v4-reminder-controls" role="group" aria-label="Reminder controls">
   <IconTip label="Previous"><button type="button" className="v4-carousel-arrow dm-quiet" aria-label="Previous reminder" onClick={() => setIndex((current - 1 + count) % count)}><ChevronLeft size={15} aria-hidden/></button></IconTip>
   {items.map((r, n) => <button key={r.title} type="button" className="v4-reminder-dot" aria-label={`Reminder ${n + 1} of ${count}: ${r.title}`} aria-current={n === current ? "true" : undefined} onClick={() => setIndex(n)}><span aria-hidden/></button>)}
   <IconTip label="Next"><button type="button" className="v4-carousel-arrow dm-quiet" aria-label="Next reminder" onClick={() => setIndex((current + 1) % count)}><ChevronRight size={15} aria-hidden/></button></IconTip>
   {!reduced && <button type="button" className="v4-reminder-pause dm-quiet" aria-label={paused ? "Resume reminder rotation" : "Pause reminder rotation"} aria-pressed={paused} onClick={() => setPaused(!paused)}>{paused ? <Play size={11} aria-hidden/> : <Pause size={11} aria-hidden/>}</button>}
  </div>}
 </section>;
}
