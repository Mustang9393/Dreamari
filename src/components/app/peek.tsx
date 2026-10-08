"use client";

// Detail pages open as sheets across the student app (8 Oct 2026, Chandu:
// "Everything like a detail page in student app including career detail,
// school detail etc should also open like the cards in top 3"). One host per
// screen (AppBackdrop renders it, and every student screen renders exactly
// one AppBackdrop) does two things:
// - any same-site link to /career/<slug> or /colleges/<slug> opens the
//   matching sheet instead of the page (a modified click, a new-tab link or
//   anything inside [data-peek-skip], like the sheet's own Full page, still
//   navigates), so no call site has to change;
// - openCareerPeek / openSchoolPeek for buttons that used to router.push.
// The counselor app has its own counselor sheets, so the host stays inert
// under /counselor.

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion, useDragControls, useReducedMotion, type PanInfo } from "framer-motion";
import { CareerPeek } from "@/components/profile/CareerPeek";
import { ALL_PROFILE_CAREERS } from "@/components/profile/data";
import { collegeBySlug, type College } from "@/components/colleges/data";
import { loadDatasetCollege } from "@/components/colleges/dataset";
import { SchoolPeek } from "@/components/colleges/SchoolPeek";
import { LabLayer } from "@/components/actions-lab/labUi";
import { StudentCheckInHost } from "./WeeklyCheckIn";
import { peekOpenedFrom, peekSet, peekSnapshot, peekSubscribe, rememberAt, takeReturn } from "./peekStore";
import { useNarrowSheet } from "./PeekSheet";
import { IconTip } from "./IconTip";
import { InSheet } from "./inSheet";
import { CareerDetailLab } from "@/components/actions-lab/CareerDetailLab";
import { LiveProvider } from "@/components/actions-lab/labUi";
import { CollegeDetailExperience } from "@/components/colleges/CollegeDetailExperience";

const set = peekSet;

const CAREER_IDS = new Set(ALL_PROFILE_CAREERS.map((c) => c.id));
/** True when the career has a sheet (a written profile). */
export const hasCareerPeek = (id: string) => CAREER_IDS.has(id);

/** Opens a career's sheet; prev/next walks `row` (career ids) when given.
 *  Returns false when the career has no sheet, so the caller can navigate. */
export function openCareerPeek(id: string, row?: string[]): boolean {
  if (!CAREER_IDS.has(id)) return false;
  const ids = row ? row.filter((x) => CAREER_IDS.has(x)) : [id];
  set({ kind: "career", ids: ids.includes(id) ? ids : [id], index: Math.max(0, ids.indexOf(id)) });
  return true;
}

export function openSchoolPeek(c: College, row?: College[]): void {
  const list = row && row.some((x) => x.slug === c.slug) ? row : [c];
  set({ kind: "school", list, index: list.findIndex((x) => x.slug === c.slug) });
}

// one host renders and listens, however many AppBackdrops mount
let owner: object | null = null;
const ownerListeners = new Set<() => void>();
const subscribeOwner = (l: () => void) => { ownerListeners.add(l); return () => { ownerListeners.delete(l); }; };
const setOwner = (o: object | null) => { owner = o; ownerListeners.forEach((l) => l()); };

export function PeekHost() {
  const router = useRouter();
  const pathname = usePathname();
  const open = useSyncExternalStore(peekSubscribe, peekSnapshot, () => null);
  const [me] = useState(() => ({}));
  const isOwner = useSyncExternalStore(subscribeOwner, () => owner === me, () => false);
  const inert = pathname?.startsWith("/counselor") ?? false;
  const narrow = useNarrowSheet();

  useEffect(() => {
    if (!owner) setOwner(me);
    return () => { if (owner === me) setOwner(null); };
  }, [me]);

  useEffect(() => {
    if (inert || !isOwner) return;
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank" || a.hasAttribute("download") || a.closest("[data-peek-skip]")) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      const career = url.pathname.match(/^\/career\/([a-z0-9-]+)\/?$/);
      if (career && CAREER_IDS.has(career[1])) {
        e.preventDefault();
        e.stopPropagation();
        openCareerPeek(career[1]);
        return;
      }
      const school = url.pathname.match(/^\/colleges\/([a-z0-9-]+)\/?$/);
      if (school) {
        e.preventDefault();
        e.stopPropagation();
        const known = collegeBySlug(school[1]);
        if (known) openSchoolPeek(known);
        else loadDatasetCollege(school[1]).then((c) => (c ? openSchoolPeek(c) : router.push(url.pathname + url.search))).catch(() => router.push(url.pathname + url.search));
      }
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [inert, isOwner, router]);

  // a route change closes whatever was open; coming back from a sheet's
  // full page, or from anywhere a sheet's button led (Play, a link), reopens
  // that sheet over the same scroll spot: one step back (8 Oct 2026)
  useEffect(() => {
    const was = peekSnapshot();
    const from = peekOpenedFrom();
    if (was && from && from.path !== window.location.pathname + window.location.search) rememberAt(from.path, from.y, was);
    if (was) set(null);
    if (inert || !isOwner) return;
    const back = takeReturn(window.location.pathname + window.location.search);
    if (!back) return;
    let t = 0;
    const until = performance.now() + 1500;
    // retried until the page is tall enough to reach the old spot
    const tick = () => {
      window.scrollTo(0, back.y);
      if (Math.abs(window.scrollY - back.y) > 2 && performance.now() < until) t = window.setTimeout(tick, 32);
      else if (back.open) set(back.open);
    };
    t = window.setTimeout(tick, 0);
    return () => window.clearTimeout(t);
  }, [pathname, inert, isOwner]);

  if (inert || !isOwner) return null;
  const close = () => set(null);
  const page = narrow && open ? (open.kind === "career" ? { key: `p-${open.ids[open.index]}`, label: "Career", body: <LiveProvider><CareerDetailLab slug={open.ids[open.index]} live /></LiveProvider> } : { key: `p-${open.list[open.index].slug}`, label: "School", body: <CollegeDetailExperience slug={open.list[open.index].slug} /> }) : null;
  return (
    <>
    {/* the career page's undo bar and Top 3 swap sheet, for screens that
       don't mount their own (LabLayer renders once however many mount) */}
    <LabLayer dock={false} host />
    {/* a counselor-sent check-in, opened from the bell (8 Oct 2026) */}
    <StudentCheckInHost />
    <AnimatePresence>
      {/* phones and tablets: the full page itself, in a sheet */}
      {page && <PageSheet key="page-sheet" label={page.label} onClose={close} pageKey={page.key}><div key={page.key}>{page.body}</div></PageSheet>}
      {!narrow && open?.kind === "career" && (
        <CareerPeek key="career-peek" ids={open.ids} index={open.index} onIndex={(index) => set({ ...open, index })} onClose={close}
          onReport={(id) => { close(); router.push(`/career-report?picks=${encodeURIComponent(id)}`); }} />
      )}
      {!narrow && open?.kind === "school" && (
        <SchoolPeek key="school-peek" list={open.list} index={open.index} onIndex={(index) => set({ ...open, index })} onClose={close} />
      )}
    </AnimatePresence>
    </>
  );
}

/** Phones and tablets: the detail page itself, in a sheet that slides up
 *  over everything to the top of the screen (8 Oct 2026, Chandu: "it can
 *  still look like a sheet but it can slide up till the actual full page
 *  version's height... basically just take the full page view and turn it
 *  into a sheet that opens all the way", after the 90% drawer was "really
 *  bad and tricky to scroll" and its buttons hid behind the tab bar). The
 *  page renders in sheet mode (InSheet: no backdrop, bars or back link),
 *  scrolls inside the sheet from its own top, and closes by X, Escape or
 *  dragging the top bar down. Nothing navigates, so the list under it
 *  keeps its exact scroll. */
function PageSheet({ label, onClose, pageKey, children }: { label: string; onClose: () => void; pageKey: string; children: ReactNode }) {
  const reduce = useReducedMotion();
  const drag = useDragControls();
  // a new career or school (Careers like this one) starts at its own top
  const scroller = useRef<HTMLDivElement>(null);
  useEffect(() => { scroller.current?.scrollTo({ top: 0 }); }, [pageKey]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [onClose]);
  return createPortal(
    <motion.div className="marketing-v2 themeable no-print fixed inset-0 z-[120]" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} style={{ background: "rgba(5,7,15,0.55)", fontFamily: "var(--font-body)", color: "var(--foreground)" }}>
      <motion.div role="dialog" aria-modal="true" aria-label={label}
        className="absolute inset-x-0 bottom-0 flex flex-col overflow-hidden rounded-t-[22px] border-t"
        style={{ top: "max(env(safe-area-inset-top), 10px)", background: "radial-gradient(90% 40% at 50% 0%, color-mix(in srgb, var(--primary) 10%, transparent), transparent 70%), var(--background)", borderColor: "var(--glass-border)", boxShadow: "0 -20px 60px -20px rgba(0,0,0,0.6)" }}
        initial={reduce ? false : { y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "tween", duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
        drag="y" dragControls={drag} dragListener={false} dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0, bottom: 0.7 }}
        onDragEnd={(_: unknown, info: PanInfo) => { if (info.offset.y > 120 || info.velocity.y > 700) onClose(); }}>
        {/* the top bar: a grabber to drag it closed, and Close */}
        <div className="relative flex h-[40px] flex-none cursor-grab items-start justify-center pt-[8px]" style={{ touchAction: "none" }} onPointerDown={(e) => drag.start(e)}>
          <span aria-hidden className="h-[5px] w-[40px] rounded-full" style={{ background: "color-mix(in srgb, var(--foreground) 45%, transparent)" }} />
          <span className="absolute top-[6px] right-[12px]">
            <IconTip label="Close"><button type="button" aria-label="Close" onPointerDown={(e) => e.stopPropagation()} onClick={onClose} className="cpk-ctl"><X className="h-4 w-4" aria-hidden /></button></IconTip>
          </span>
        </div>
        <div ref={scroller} className="dm-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <InSheet.Provider value={true}>{children}</InSheet.Provider>
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}
