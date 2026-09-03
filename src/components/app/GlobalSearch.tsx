"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, Briefcase, Building2, GraduationCap, MessagesSquare, Search, Users, X } from "lucide-react";
import { ALL_CATALOG_CAREERS } from "@/components/app/catalog";
import { careerSlug } from "@/components/career/slug";
import { COLLEGES, money } from "@/components/colleges/data";
import { COMMUNITIES, EVENTS, PROS } from "@/components/connect/data";
import { Avatar, CompanyChip } from "@/components/connect/primitives";

// PARKED (2026-09-03): first cut of sitewide search, pulled from the chrome
// after review ("heavy, busy, misaligned"). Not rendered anywhere. Kept so
// the grouped-results model and the doors idea survive for the next pass.
// Sitewide search. One box from anywhere; results grouped by what they are
// (careers, colleges, people, companies, communities), a scope row to
// narrow, and "See all" doors into each area's own search page. With
// nothing typed it is a set of doors, so a student who does not know what
// to type still gets somewhere. Design notes: docs/COLLEGE_LOOKUP_AUDIT.md §4.

type Scope = "all" | "careers" | "colleges" | "people" | "companies" | "communities";
const SCOPES: { key: Scope; label: string }[] = [
  { key: "all", label: "Everything" },
  { key: "careers", label: "Careers" },
  { key: "colleges", label: "Colleges" },
  { key: "people", label: "People" },
  { key: "companies", label: "Companies" },
  { key: "communities", label: "Communities" },
];

type Hit = { key: string; href: string; title: string; sub: string; media?: React.ReactNode };

function tokens(q: string) { return q.toLowerCase().split(/\s+/).filter(Boolean); }
function hit(hay: string, words: string[]) { const h = hay.toLowerCase(); return words.every((w) => h.includes(w)); }

function search(q: string) {
  const words = tokens(q);
  if (!words.length) return null;
  const careers: Hit[] = ALL_CATALOG_CAREERS.filter((c) => hit(`${c.title} ${c.world}`, words)).map((c) => ({ key: c.title, href: `/career/${careerSlug(c.title)}`, title: c.title, sub: c.world }));
  const colleges: Hit[] = COLLEGES.filter((c) => hit(`${c.name} ${c.city} ${c.stateName} ${c.state}`, words)).map((c) => ({ key: c.slug, href: `/colleges/${c.slug}`, title: c.name, sub: `${c.city}, ${c.stateName}${c.netPrice !== null ? ` · about ${money(Math.round(c.netPrice / 100) * 100)} a year` : ""}` }));
  const people: Hit[] = PROS.filter((p) => hit(`${p.name} ${p.role} ${p.org} ${p.field} ${(p.topics ?? []).join(" ")}`, words)).map((p) => ({ key: p.id, href: `/connect?pro=${p.id}`, title: p.name, sub: `${p.role} · ${p.org}`, media: <Avatar name={p.name} verified size={36} /> }));
  const companyNames = [...new Set(PROS.map((p) => p.org))].filter((o) => hit(o, words));
  const companies: Hit[] = companyNames.map((o) => {
    const pros = PROS.filter((p) => p.org === o);
    return { key: o, href: `/connect?pro=${pros[0].id}`, title: o, sub: pros.length === 1 ? `${pros[0].name} answers here` : `${pros.length} pros answer here`, media: <span className="flex size-[36px] items-center justify-center"><CompanyChip name={o} tone="surface" size="sm" /></span> };
  });
  const communities: Hit[] = [
    ...COMMUNITIES.filter((c) => hit(`${c.name} ${c.world}`, words)).map((c) => ({ key: c.id, href: `/connect?board=${c.id}`, title: c.name, sub: `Community · ${c.world}` })),
    ...EVENTS.filter((e) => hit(`${e.name} ${e.host} ${e.location}`, words)).map((e) => ({ key: e.id, href: `/connect?event=${e.id}`, title: e.name, sub: `Event · ${e.location}` })),
  ];
  return { careers, colleges, people, companies, communities };
}

const GROUPS: { key: Exclude<Scope, "all">; label: string; icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>; seeAll: (q: string) => string; seeAllLabel: string }[] = [
  { key: "careers", label: "Careers", icon: Briefcase, seeAll: (q) => `/explore?tab=browse&q=${encodeURIComponent(q)}`, seeAllLabel: "Explore" },
  { key: "colleges", label: "Colleges", icon: GraduationCap, seeAll: (q) => `/colleges?q=${encodeURIComponent(q)}`, seeAllLabel: "Find a college" },
  { key: "people", label: "People", icon: Users, seeAll: () => "/connect", seeAllLabel: "Connect" },
  { key: "companies", label: "Companies", icon: Building2, seeAll: () => "/connect", seeAllLabel: "Connect" },
  { key: "communities", label: "Communities and events", icon: MessagesSquare, seeAll: () => "/connect", seeAllLabel: "Connect" },
];

const DOORS = [
  { href: "/explore?tab=browse", icon: Briefcase, title: "Careers", sub: "Every career world, with pay and a day in the life" },
  { href: "/colleges", icon: GraduationCap, title: "Colleges", sub: "What a year costs, who gets in, who finishes" },
  { href: "/connect", icon: Users, title: "People", sub: "Verified professionals who answer questions" },
];
const TRY = ["Nursing", "Rutgers", "Goldman Sachs", "Investment banking", "Sioux Falls", "Software engineer"];

export function SearchTrigger() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    // Cmd/Ctrl+K from anywhere in the app
    const onKey = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen(true); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return (
    <>
      <button
        type="button"
        aria-label="Search Dreamari"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="dm-quiet flex size-10 cursor-pointer items-center justify-center rounded-[var(--radius-lg)] border backdrop-blur-[10px]"
        style={{ background: "var(--glass-surface-2)", borderColor: "var(--glass-border)", color: "var(--foreground)" }}
      >
        <Search className="h-5 w-5" aria-hidden />
      </button>
      {open && <GlobalSearch onClose={() => setOpen(false)} />}
    </>
  );
}

export function GlobalSearch({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState("");
  const [scope, setScope] = useState<Scope>("all");
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useMemo(() => search(q.trim()), [q]);
  const total = results ? Object.values(results).reduce((a, g) => a + g.length, 0) : 0;

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  if (typeof document === "undefined") return null;
  const visible = GROUPS.filter((g) => scope === "all" || g.key === scope);
  return createPortal(
    <div className="marketing-v2 themeable fixed inset-0 z-[130] flex flex-col" role="dialog" aria-modal="true" aria-label="Search Dreamari" style={{ fontFamily: "var(--font-body)", color: "var(--foreground)", background: "transparent" }}>
      {/* the page stays visible behind, dimmed and softened */}
      <button type="button" aria-label="Close search" onClick={onClose} className="absolute inset-0 cursor-default" style={{ background: "rgba(8,7,16,0.55)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }} />
      <div className="relative z-[1] mx-auto flex h-full w-full max-w-[720px] flex-col px-5 pt-[var(--space-4)] pb-[var(--space-6)] md:pt-[72px]">
        <div className="flex flex-col overflow-hidden rounded-[var(--radius-xl)] border" style={{ background: "color-mix(in srgb, var(--background) 94%, var(--foreground))", borderColor: "rgba(255,255,255,0.16)", boxShadow: "0 30px 80px -30px rgba(0,0,0,0.85)", maxHeight: "calc(100dvh - 40px)" }}>
          <label className="flex min-h-[60px] items-center gap-[var(--space-3)] border-b px-[var(--space-5)]" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
            <Search className="h-5 w-5 flex-none" aria-hidden style={{ color: q ? "var(--accent-subtle)" : "var(--muted-foreground)" }} />
            <span className="sr-only">Search careers, colleges, people, companies and communities</span>
            <input ref={inputRef} type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search Dreamari" autoComplete="off" enterKeyHint="search" className="min-w-0 flex-1 bg-transparent text-[16px] leading-[22px] font-semibold outline-none" style={{ color: "var(--foreground)" }} />
            <button type="button" onClick={q ? () => { setQ(""); inputRef.current?.focus(); } : onClose} aria-label={q ? "Clear" : "Close"} className="dm-quiet flex size-[40px] flex-none cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}><X className="h-5 w-5" aria-hidden /></button>
          </label>

          <div className="flex items-center gap-[8px] overflow-x-auto border-b px-[var(--space-4)] py-[10px] [scrollbar-width:none]" role="tablist" aria-label="Search in" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
            {SCOPES.map((s) => (
              <button key={s.key} type="button" role="tab" aria-selected={scope === s.key} onClick={() => setScope(s.key)} className="dm-quiet flex min-h-[34px] flex-none cursor-pointer items-center rounded-full border px-[13px] text-[13px] leading-[18px] font-semibold whitespace-nowrap" style={scope === s.key ? { background: "var(--primary)", borderColor: "var(--primary)", color: "#fff" } : { background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
                {s.label}
              </button>
            ))}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-[var(--space-4)] py-[var(--space-4)]">
            {!results ? (
              <div className="flex flex-col gap-[var(--space-5)]">
                <div className="flex flex-col gap-[8px]">
                  {(scope === "all" ? DOORS : DOORS.filter((d) => d.title.toLowerCase() === scope || (scope === "companies" || scope === "communities") && d.title === "People")).map((d) => (
                    <Link key={d.href} href={d.href} onClick={onClose} className="dm-tap flex items-center gap-[12px] rounded-[var(--radius-md)] border p-[var(--space-4)]" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
                      <span className="flex size-[40px] flex-none items-center justify-center rounded-[var(--radius-sm)]" style={{ background: "color-mix(in srgb, var(--primary) 18%, transparent)", color: "var(--accent-subtle)" }}><d.icon className="h-5 w-5" aria-hidden /></span>
                      <span className="flex min-w-0 flex-1 flex-col"><span className="text-[15px] leading-[20px] font-bold">{d.title}</span><span className="truncate text-[13px] leading-[17px]" style={{ color: "var(--muted-foreground)" }}>{d.sub}</span></span>
                      <ArrowRight className="h-4 w-4 flex-none" aria-hidden style={{ color: "var(--muted-foreground)" }} />
                    </Link>
                  ))}
                </div>
                <div className="flex flex-col gap-[8px]">
                  <span className="text-[13px] leading-[17px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Try</span>
                  <div className="flex flex-wrap gap-[8px]">
                    {TRY.map((t) => <button key={t} type="button" onClick={() => setQ(t)} className="dm-quiet flex min-h-[34px] cursor-pointer items-center rounded-full border px-[13px] text-[13px] leading-[18px] font-semibold" style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)" }}>{t}</button>)}
                  </div>
                </div>
              </div>
            ) : total === 0 ? (
              <p className="px-[var(--space-2)] py-[var(--space-4)] text-[15px] leading-[21px]" style={{ color: "var(--muted-foreground)" }}>Nothing matches &ldquo;{q.trim()}&rdquo;. Try a shorter word, a city, or a company.</p>
            ) : (
              <div className="flex flex-col gap-[var(--space-5)]" aria-live="polite">
                {visible.map((g) => {
                  const hits = results[g.key];
                  if (!hits.length) return null;
                  const shown = hits.slice(0, scope === "all" ? 4 : 12);
                  return (
                    <section key={g.key} className="flex flex-col gap-[6px]" aria-labelledby={`gs-${g.key}`}>
                      <div className="flex items-center justify-between gap-[var(--space-3)] px-[var(--space-2)]">
                        <h2 id={`gs-${g.key}`} className="flex items-center gap-[6px] text-[13px] leading-[17px] font-bold tracking-[0.04em] uppercase" style={{ color: "var(--muted-foreground)" }}><g.icon className="h-[14px] w-[14px]" aria-hidden /> {g.label} · {hits.length}</h2>
                        {hits.length > shown.length && <Link href={g.seeAll(q.trim())} onClick={onClose} className="dm-link flex items-center gap-[4px] text-[13px] leading-[17px] font-bold" style={{ color: "var(--accent-subtle)" }}>All in {g.seeAllLabel} <ArrowRight className="h-3.5 w-3.5" aria-hidden /></Link>}
                      </div>
                      <ul className="flex flex-col">
                        {shown.map((h) => (
                          <li key={h.key}>
                            <Link href={h.href} onClick={onClose} className="dm-quiet flex items-center gap-[12px] rounded-[var(--radius-md)] px-[var(--space-2)] py-[9px]">
                              {h.media ?? <span className="flex size-[36px] flex-none items-center justify-center rounded-[var(--radius-sm)]" style={{ background: "color-mix(in srgb, var(--primary) 16%, transparent)", color: "var(--accent-subtle)" }}><g.icon className="h-[18px] w-[18px]" aria-hidden /></span>}
                              <span className="flex min-w-0 flex-1 flex-col"><span className="truncate text-[15px] leading-[20px] font-bold">{h.title}</span><span className="truncate text-[13px] leading-[17px]" style={{ color: "var(--muted-foreground)" }}>{h.sub}</span></span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </section>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
