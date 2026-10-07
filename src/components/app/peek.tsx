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

import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { CareerPeek } from "@/components/profile/CareerPeek";
import { ALL_PROFILE_CAREERS } from "@/components/profile/data";
import { collegeBySlug, type College } from "@/components/colleges/data";
import { loadDatasetCollege } from "@/components/colleges/dataset";
import { SchoolPeek } from "@/components/colleges/SchoolPeek";

type Open = { kind: "career"; ids: string[]; index: number } | { kind: "school"; list: College[]; index: number };
let current: Open | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
const set = (next: Open | null) => { current = next; emit(); };

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
  const open = useSyncExternalStore(subscribe, () => current, () => null);
  const [me] = useState(() => ({}));
  const isOwner = useSyncExternalStore(subscribeOwner, () => owner === me, () => false);
  const inert = pathname?.startsWith("/counselor") ?? false;

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

  // a route change closes whatever was open
  useEffect(() => { if (current) set(null); }, [pathname]);

  if (inert || !isOwner) return null;
  const close = () => set(null);
  return (
    <AnimatePresence>
      {open?.kind === "career" && (
        <CareerPeek key="career-peek" ids={open.ids} index={open.index} onIndex={(index) => set({ ...open, index })} onClose={close}
          onReport={(id) => { close(); router.push(`/career-report?picks=${encodeURIComponent(id)}`); }} />
      )}
      {open?.kind === "school" && (
        <SchoolPeek key="school-peek" list={open.list} index={open.index} onIndex={(index) => set({ ...open, index })} onClose={close} />
      )}
    </AnimatePresence>
  );
}
