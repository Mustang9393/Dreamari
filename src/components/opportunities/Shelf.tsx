"use client";

// A shelf: one named, short row of opportunity cards (6 Oct 2026). Chandu:
// "the long lists are also too much to scan... It needs to be easy on the
// eyes, spaced enough so it's not clutter." So the tab opens on a handful
// of shelves that each answer one question (what fits me, what is due
// soon, what is big, what is near me) the way Explore's rows do, instead
// of one long list. Sideways scrolling is never the only way through
// (Explore's rule): the count sits by the title, View all opens the whole
// shelf as a list, and from md up there are arrow buttons, since a mouse
// on Windows has no sideways scroll.

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { IconTip } from "@/components/app/IconTip";
import { MUTED, type Enriched } from "./Card";

export function Shelf({ title, line, items, onViewAll, children }: { title: string; line: string; items: Enriched[]; onViewAll: () => void; children: (e: Enriched) => React.ReactNode }) {
  const ref = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () => setEdge({ start: el.scrollLeft < 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
    read();
    el.addEventListener("scroll", read, { passive: true });
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => { el.removeEventListener("scroll", read); ro.disconnect(); };
  }, [items.length]);
  const page = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.85, behavior: "smooth" });
  const arrow = (dir: 1 | -1, off: boolean) => (
    <IconTip label={dir === 1 ? "More" : "Back"}>
      <button type="button" aria-label={dir === 1 ? `More in ${title}` : `Back in ${title}`} disabled={off} onClick={() => page(dir)} className="dm-quiet flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-full border transition-opacity duration-200 disabled:cursor-default disabled:opacity-30" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)", color: "var(--foreground)" }}>
        {dir === 1 ? <ChevronRight className="h-4 w-4" aria-hidden /> : <ChevronLeft className="h-4 w-4" aria-hidden />}
      </button>
    </IconTip>
  );
  return (
    <section aria-label={title} className="flex flex-col gap-[14px]">
      <div className="flex items-end justify-between gap-[16px]">
        <div className="flex min-w-0 flex-col gap-[3px]">
          <h2 className="text-[19px] leading-[24px] font-bold sm:text-[21px] sm:leading-[26px]">
            {title}<span className="pl-[8px] text-[14px] font-semibold tabular-nums" style={MUTED}>{items.length}</span>
          </h2>
          <p className="text-[13px] leading-[18px]" style={MUTED}>{line}</p>
        </div>
        <div className="flex flex-none items-center gap-[8px]">
          <button type="button" onClick={onViewAll} className="dm-quiet flex cursor-pointer items-center gap-[2px] rounded-full px-[10px] py-[6px] text-[13.5px] font-bold" style={{ color: "var(--accent-subtle)" }}>View all <ChevronRight className="h-4 w-4" aria-hidden /></button>
          {!(edge.start && edge.end) && <span className="hidden items-center gap-[6px] md:flex">{arrow(-1, edge.start)}{arrow(1, edge.end)}</span>}
        </div>
      </div>
      <ul ref={ref} className="flow-scroll -mx-5 flex snap-x snap-mandatory scroll-px-5 gap-[14px] overflow-x-auto px-5 pt-[2px] pb-[10px] sm:-mx-[var(--space-14)] sm:scroll-px-[var(--space-14)] sm:px-[var(--space-14)] sm:gap-[16px]" style={{ touchAction: "pan-x pan-y" }}>
        {items.slice(0, 10).map((e) => <li key={e.item.id} className="w-[64vw] max-w-[270px] flex-none snap-start sm:w-[250px] lg:w-[264px]">{children(e)}</li>)}
      </ul>
    </section>
  );
}
