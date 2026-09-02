"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Bookmark, BookOpen, ChevronDown, ExternalLink, Gamepad2, Heart, Plus, ThumbsDown } from "lucide-react";
import { DesktopNavigation, MobileNav, QuickLinksMenu, Wordmark } from "@/components/app/chrome";
import { CARD_TEXT_SHADOW, CardProgressiveBlur, cardTopScrim } from "@/components/app/cardChrome";
import { PosterCard } from "@/components/app/PosterCard";
import { posterTitleFont, WORLD_COLORS } from "@/components/app/worlds";
import { hasGlossary } from "@/components/glossary/data";
import { simulationFor } from "@/components/play/games";
import { resolveCareer, similarCareers, type ResolvedCareer } from "./data";
import type { ProfileRung } from "./profiles";
import { careerSlug } from "./slug";

// Career Detail, rebuilt 2026-09-02 around the production page's information
// (dreamonna.com/explore/<slug>; copy and data transcribed in profiles.ts and
// never rewritten here) for readers who skim: US high schoolers.
//
// What the reader sees first, and only that:
//   the header card (title, one line on what it is, one line to imagine it),
//   four quick facts, pay by state as bars, and the career ladder as three
//   compact rows (title + pay). Everything below the ladder is folded behind
//   its heading and opens on tap. Nothing is hidden, but nothing is thrown at
//   the reader at once either.
//
// Type scale, five steps, strictly descending down the page and inside every
// block (a value never outsizes the heading above it; labels never masquerade
// as headings; sections open with their heading, not an eyebrow):
//   Large    career title       Bricolage 800, 40/44 -> clamp(56..72) from sm
//   Big      section heading    Bricolage 700, 22/26 -> 26/30 from sm
//   Medium   sub-heading, rung title/pay  18/24 semibold (figures in Bricolage)
//   Label    the name over a value        16/22 semibold  (facts, states, dt)
//   Small    body, values                 15/22
//   Tiny     dd under a Small dt          14/20
//   (Chrome such as tab labels stays at 13px and is not part of the scale.)
//
// Spacing uses the marketing token scale (tokens.css defines 1-6, 8, 10, 12,
// 13, 14 -- there is no --space-7, which is what silently zeroed the first
// pass of this layout) or explicit px where a step in between is needed.
const DISPLAY = { fontFamily: "var(--font-display)" } as const;
const BIG = "text-[22px] leading-[26px] font-bold tracking-[-0.01em] sm:text-[26px] sm:leading-[30px]";
const MEDIUM = "text-[18px] leading-[24px] font-semibold";
const FIGURE = "text-[18px] leading-[24px] font-bold tabular-nums";
const LABEL = "text-[16px] leading-[22px] font-semibold";
const SMALL = "text-[15px] leading-[22px]";
const TINY = "text-[14px] leading-[20px]";

// Per-career photo focal point for the header panel (most posters carry the
// subject in the upper half; the exceptions are listed here).
const HERO_FOCUS: Record<string, string> = {
  "asset-management": "center 68%",
};

function IconButton({ label, active = false, onClick, children }: { label: string; active?: boolean; onClick?: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className="dm-quiet flex size-11 flex-none cursor-pointer items-center justify-center rounded-full border"
      style={{ background: "rgba(12,16,35,0.45)", borderColor: active ? "var(--accent-subtle)" : "rgba(255,255,255,0.3)", color: active ? "var(--accent-subtle)" : "#fff" }}
    >
      {children}
    </button>
  );
}

// ---- Key figure: production's gradient numeral, in the world accent -------
// Used sparingly (direct feedback): typical pay, pay by state, ladder pay.
// Same size tier as the body value it replaces, so it never outsizes the
// label above it; the gradient carries the emphasis, not the size.
function Figure({ children, accent }: { children: React.ReactNode; accent: string }) {
  return (
    <span
      className={`${SMALL} font-bold tabular-nums`}
      style={{ ...DISPLAY, backgroundImage: `linear-gradient(135deg, #ffffff 0%, color-mix(in srgb, ${accent} 55%, #ffffff) 50%, ${accent} 100%)`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}
    >
      {children}
    </span>
  );
}

// ---- Section shells -------------------------------------------------------

// Always-open section: heading row (with an optional control) over content.
function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="flex w-full flex-col gap-[var(--space-5)] border-t pt-[var(--space-6)]" style={{ borderColor: "var(--glass-border)" }}>
      <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
        <h2 className={BIG} style={DISPLAY}>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

// Folded section: the heading is the control. Collapsed, it is the heading
// alone (direct feedback: no caption under it); open, the content.
function Folded({ id, title, open, onToggle, children }: { id: string; title: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <section className="flex w-full flex-col border-t" style={{ borderColor: "var(--glass-border)" }}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        onClick={onToggle}
        className="dm-quiet -mx-[8px] flex w-[calc(100%+16px)] cursor-pointer items-start justify-between gap-[var(--space-4)] rounded-[var(--radius-md)] px-[8px] py-[var(--space-5)] text-left"
      >
        <h2 className={`${BIG} min-w-0`} style={DISPLAY}>{title}</h2>
        <ChevronDown className="mt-[4px] h-5 w-5 flex-none transition-transform duration-200" style={{ transform: open ? "rotate(180deg)" : undefined, color: "var(--muted-foreground)" }} aria-hidden />
      </button>
      <div id={`${id}-panel`} hidden={!open} className="pb-[var(--space-6)]">
        {children}
      </div>
    </section>
  );
}

// One marker, one line per item. The marker is the world accent so the list
// reads as this career's without a second color system.
function DotList({ items, accent, leading }: { items: string[]; accent: string; leading?: (item: string) => React.ReactNode }) {
  return (
    <ul className="flex flex-col gap-[var(--space-3)]">
      {items.map((item) => (
        <li key={item} className={`${SMALL} flex items-center gap-[var(--space-3)]`}>
          {leading ? leading(item) : <span aria-hidden className="h-[6px] w-[6px] flex-none rounded-full" style={{ background: accent }} />}
          <span className="min-w-0">{item}</span>
        </li>
      ))}
    </ul>
  );
}

// ---- Career ladder --------------------------------------------------------

// Three compact rows first: number, title, pay, and a bar under the title
// showing how far up the pay climb this rung sits. The paragraph and the
// "What you do" / "To get here" lines open per rung on tap.
function Rung({ rung, accent, open, onToggle }: { rung: ProfileRung; accent: string; open: boolean; onToggle: () => void }) {
  const hasDetail = !!rung.description || rung.whatYouDo.length > 0 || rung.toGetHere.length > 0;
  return (
    <li className="border-t first:border-t-0" style={{ borderColor: "var(--glass-border)" }}>
      <button
        type="button"
        onClick={hasDetail ? onToggle : undefined}
        aria-expanded={hasDetail ? open : undefined}
        className={`${hasDetail ? "dm-quiet cursor-pointer" : ""} -mx-[8px] grid w-[calc(100%+16px)] grid-cols-[32px_minmax(0,1fr)_auto] items-center gap-x-[var(--space-4)] rounded-[var(--radius-md)] px-[8px] py-[var(--space-4)] text-left`}
      >
        <span
          className={`${FIGURE} text-center`}
          style={{ ...DISPLAY, backgroundImage: `linear-gradient(180deg, ${accent}, color-mix(in srgb, ${accent} 60%, #000))`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}
        >
          {rung.number}
        </span>
        <span className={`${MEDIUM} min-w-0 truncate`}>{rung.jobTitle}</span>
        <span className="flex items-center gap-[var(--space-3)]">
          {rung.pay && <Figure accent={accent}>{rung.pay}</Figure>}
          {hasDetail && <ChevronDown className="h-5 w-5 flex-none transition-transform duration-200" style={{ transform: open ? "rotate(180deg)" : undefined, color: "var(--muted-foreground)" }} aria-hidden />}
        </span>
      </button>
      {hasDetail && open && (
        <div className="flex flex-col gap-[var(--space-3)] pb-[var(--space-5)] pl-[48px]">
          {rung.description && <p className="max-w-[62ch] text-[16px] leading-[24px]">{rung.description}</p>}
          {(rung.whatYouDo.length > 0 || rung.toGetHere.length > 0) && (
            <dl className="flex flex-col gap-[var(--space-2)]">
              {rung.whatYouDo.length > 0 && (
                <div className="flex flex-col gap-[2px] sm:flex-row sm:gap-[var(--space-4)]">
                  <dt className={`${SMALL} font-semibold sm:w-[112px] sm:flex-none`}>What you do</dt>
                  <dd className={`${TINY} min-w-0 sm:pt-[1px]`} style={{ color: "var(--muted-foreground)" }}>{rung.whatYouDo.join(" · ")}</dd>
                </div>
              )}
              {rung.toGetHere.length > 0 && (
                <div className="flex flex-col gap-[2px] sm:flex-row sm:gap-[var(--space-4)]">
                  <dt className={`${SMALL} font-semibold sm:w-[112px] sm:flex-none`}>To get here</dt>
                  <dd className={`${TINY} min-w-0 sm:pt-[1px]`} style={{ color: "var(--muted-foreground)" }}>{rung.toGetHere.join(" · ")}</dd>
                </div>
              )}
            </dl>
          )}
        </div>
      )}
    </li>
  );
}

// ---- Pay by state: production's tiles, no chart (direct feedback: fewer
// graphs). State on the left, the figure on the right; a label like "more
// than usual" stays plain text, a pay figure gets the accent gradient. ----

function PayRows({ rows, accent }: { rows: { state: string; pay: string }[]; accent: string }) {
  return (
    <ul className="grid gap-[8px] sm:grid-cols-3">
      {rows.map((row) => {
        const isFigure = /\d/.test(row.pay);
        return (
          <li key={row.state} className="flex min-w-0 items-center justify-between gap-[var(--space-3)] rounded-[var(--radius-sm)] border px-[14px] py-[10px]" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
            <span className={`${LABEL} min-w-0 truncate`}>{row.state}</span>
            {isFigure ? <Figure accent={accent}>{row.pay}</Figure> : <span className={`${SMALL} flex-none`} style={{ color: "var(--muted-foreground)" }}>{row.pay}</span>}
          </li>
        );
      })}
    </ul>
  );
}

// Every career gets the same page shape. Careers without a full profile map
// what the app already knows into it; sections with nothing to say are
// skipped, never rendered empty or as a placeholder.
const PLACEHOLDER = "Coming soon";
function viewModel(career: ResolvedCareer) {
  const p = career.profile;
  const facts = p?.facts ?? [
    { label: "Median salary", value: career.medianSalary },
    { label: "Degree required", value: career.degreeRequired },
    { label: "Common majors", value: career.commonMajors },
  ];
  const ladder: ProfileRung[] =
    p?.ladder ??
    (career.ladder ?? []).map((r) => ({ number: r.number, jobTitle: r.jobTitle, pay: r.salary, description: r.oneLiner, whatYouDo: r.skills, toGetHere: [] }));
  const whatTheyDo = !p && career.whatTheyActuallyDo && career.whatTheyActuallyDo !== PLACEHOLDER ? career.whatTheyActuallyDo : null;
  return {
    summary: p?.summary ?? career.description,
    scenario: p?.scenario ?? career.realLifeExample,
    whatTheyDo,
    facts: facts.filter((f) => f.value && f.value !== PLACEHOLDER),
    payByState: p?.payByState,
    typicalPay: p?.facts.find((f) => f.label === "Typical pay")?.value ?? null,
    knowAbout: p?.knowAbout ?? [],
    goodAt: p?.goodAt ?? [],
    software: career.software ?? [],
    ladder,
    education: p?.education,
    sources: p?.sources,
  };
}

export function CareerDetailExperience({ slug }: { slug: string }) {
  const router = useRouter();
  const career = resolveCareer(slug);
  const [payTab, setPayTab] = useState<"best" | "country">("best");
  const [openRung, setOpenRung] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<Set<string>>(() => new Set());
  const [saved, setSaved] = useState(false);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);

  const toggleSection = (id: string) =>
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  if (!career) {
    return (
      <div className="marketing-v2 themeable relative flex min-h-dvh w-full flex-col items-center justify-center gap-[var(--space-4)] overflow-hidden px-5 text-center" style={{ background: "radial-gradient(120% 85% at 85% -10%, color-mix(in srgb, var(--hero-accent-purple) 45%, transparent), transparent 60%), radial-gradient(95% 70% at -12% 30%, color-mix(in srgb, var(--primary) 15%, transparent), transparent 60%), var(--background)", color: "var(--foreground)" }}>
        <p className="relative z-10 text-[20px] font-bold">We don&apos;t have that career yet.</p>
        <Link href="/explore?tab=browse" className="dm-solid relative z-10 flex min-h-[44px] items-center rounded-[var(--radius-md)] px-[var(--space-5)] text-[15px] font-semibold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
          Back to Explore
        </Link>
      </div>
    );
  }

  const accent = WORLD_COLORS[career.world] ?? "var(--primary)";
  const similar = similarCareers(career);
  const hasSimulation = !!simulationFor(career.slug);
  const hasGlossaryGame = hasGlossary(career.slug);
  const vm = viewModel(career);

  return (
    <div className="marketing-v2 themeable relative min-h-dvh w-full" style={{ background: "radial-gradient(120% 85% at 85% -10%, color-mix(in srgb, var(--hero-accent-purple) 45%, transparent), transparent 60%), radial-gradient(95% 70% at -12% 30%, color-mix(in srgb, var(--primary) 15%, transparent), transparent 60%), var(--background)", color: "var(--foreground)", fontFamily: "var(--font-body)" }}>
      <div className="no-print">
        <DesktopNavigation active="Explore" />
      </div>
      <header className="no-print relative z-50 flex items-center justify-between px-5 pt-5 pb-2 md:hidden">
        <Wordmark />
        <QuickLinksMenu />
      </header>

      <main className="seq-reveal relative z-10 mx-auto flex w-full max-w-[1040px] flex-col gap-[var(--space-6)] px-5 pb-[120px] md:px-8 md:pt-[var(--space-4)]">
        <button
          type="button"
          onClick={() => router.back()}
          className={`dm-link ${SMALL} flex w-fit cursor-pointer items-center gap-[6px] font-semibold`}
          style={{ color: "var(--muted-foreground)" }}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden /> Explore
        </button>

        {/* Header card: the poster photo, full bleed, with the same legibility
           stack as the For You reel and the Connect cards (progressive blur up
           from the bottom, a soft vignette, a light top scrim) and nothing
           else: no color wash. Title, one line on what it is, one line to
           imagine it, and the actions all sit inside the card, on the frosted
           lower half. */}
        <section className="relative overflow-hidden rounded-[var(--radius-lg)] border" style={{ borderColor: "var(--glass-border)", background: "var(--card)", color: "#fff", textShadow: CARD_TEXT_SHADOW }}>
          {/* Faces stay in frame (direct feedback): the poster photos carry the
             subject in their upper part, so the crop anchors near the top. On
             phones the photo runs behind the whole card; from md up it sits on
             the right half at its natural framing and fades into the card's
             dark base toward the text, so nothing is cropped to fit a wide
             band. */}
          <div className="absolute inset-0" aria-hidden style={{ background: "#0e0c20" }}>
            <Image src={career.photo} alt="" fill sizes="100vw" className="object-cover md:hidden" style={{ objectPosition: HERO_FOCUS[career.slug] ?? "50% 12%" }} />
            <span className="absolute inset-y-0 right-0 hidden w-[50%] md:block">
              <Image src={career.photo} alt="" fill sizes="520px" className="object-cover" style={{ objectPosition: HERO_FOCUS[career.slug] ?? "50% 12%" }} />
              <span className="absolute inset-0" style={{ background: "linear-gradient(90deg, #0e0c20 0%, rgba(14,12,32,0.6) 30%, transparent 70%)" }} />
            </span>
            <CardProgressiveBlur size="60%" />
            <span className="absolute inset-0" style={{ background: `linear-gradient(to top, rgba(12,16,35,0.94) 0%, rgba(12,16,35,0.7) 34%, rgba(12,16,35,0.22) 62%, transparent 100%), ${cardTopScrim()}` }} />
          </div>
          <div className="relative flex min-h-[300px] flex-col justify-end gap-[var(--space-3)] p-[var(--space-6)] pt-[120px] sm:p-[var(--space-8)] sm:pt-[120px] md:min-h-[320px]">
            <div className="flex flex-col gap-[var(--space-3)] md:max-w-[62%]">
              {/* The career's own poster face (the browse card's approved per-world
                 font), not the display face: the title should look like the card
                 the student tapped to get here. */}
              <h1 className="w-full text-[36px] leading-[40px] uppercase sm:text-[clamp(48px,3.6vw,60px)] sm:leading-[1]" style={{ ...posterTitleFont(career.world), textWrap: "balance" }}>
                {career.title}
              </h1>
              {vm.summary && <p className={`${MEDIUM} max-w-[34ch]`}>{vm.summary}</p>}
              {/* Actions sit under the summary, left-aligned with the text
                 (direct feedback), not floated to the far corner. */}
              <div className="mt-[var(--space-2)] flex flex-wrap items-center gap-[var(--space-3)]" style={{ textShadow: "none" }}>
              {hasSimulation && (
                <button
                  type="button"
                  onClick={() => router.push(`/play/${career.slug}`)}
                  className="dm-solid flex min-h-[44px] cursor-pointer items-center gap-[8px] rounded-[var(--radius-md)] px-[var(--space-5)] text-[15px] font-semibold"
                  style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
                >
                  <Gamepad2 className="h-4 w-4" aria-hidden /> Play Game
                </button>
              )}
              {hasGlossaryGame && (
                <button
                  type="button"
                  onClick={() => router.push(`/play/glossary/${career.slug}`)}
                  className="dm-quiet flex min-h-[44px] cursor-pointer items-center gap-[8px] rounded-[var(--radius-md)] border px-[var(--space-5)] text-[15px] font-semibold"
                  style={{ borderColor: "rgba(255,255,255,0.3)", background: "rgba(12,16,35,0.4)", color: "#fff" }}
                >
                  <BookOpen className="h-4 w-4" aria-hidden /> Glossary Game
                </button>
              )}
              <div className="flex items-center gap-[var(--space-2)]">
                <IconButton label="Add to my list"><Plus className="h-5 w-5" aria-hidden /></IconButton>
                <IconButton label="Like this career" active={liked} onClick={() => { setLiked((v) => !v); if (!liked) setDisliked(false); }}>
                  <Heart className="h-5 w-5" fill={liked ? "currentColor" : "none"} aria-hidden />
                </IconButton>
                <IconButton label="Not for me" active={disliked} onClick={() => { setDisliked((v) => !v); if (!disliked) setLiked(false); }}>
                  <ThumbsDown className="h-5 w-5" fill={disliked ? "currentColor" : "none"} aria-hidden />
                </IconButton>
                <IconButton label={saved ? "Saved" : "Save for later"} active={saved} onClick={() => setSaved((v) => !v)}>
                  <Bookmark className="h-5 w-5" fill={saved ? "currentColor" : "none"} aria-hidden />
                </IconButton>
              </div>
              </div>
            </div>
          </div>
        </section>

        {/* The "imagine" line lives on the page, not in the header (direct
           feedback): one plain paragraph before the facts. */}
        {vm.scenario && <p className={`${SMALL} -mt-[var(--space-2)] max-w-[62ch]`} style={{ color: "var(--muted-foreground)" }}>{vm.scenario}</p>}

        {/* Quick facts: one strip, internal dividers, label over figure. */}
        {vm.facts.length > 0 && (
          <section aria-label="Quick facts" className={`grid grid-cols-2 overflow-hidden rounded-[var(--radius-lg)] border ${vm.facts.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-4"}`} style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
            {vm.facts.map((fact, i) => (
              <div
                key={fact.label}
                data-fact-cell
                className={`flex flex-col gap-[6px] p-[var(--space-4)] sm:px-[var(--space-5)] sm:py-[var(--space-5)] ${i % 2 === 1 ? "border-l" : ""} ${i >= 2 ? "border-t" : ""} ${vm.facts.length === 3 ? "sm:border-t-0 sm:[&:nth-child(n+2)]:border-l" : "sm:border-t-0 sm:[&:nth-child(n+2)]:border-l"}`}
                style={{ borderColor: "var(--glass-border)" }}
              >
                <span className={LABEL}>{fact.label}</span>
                <Figure accent={accent}>{fact.value}</Figure>
              </div>
            ))}
          </section>
        )}

        {vm.payByState && (
          <Section
            title={vm.payByState.title ?? "Pay by state"}
            action={
              <div role="tablist" aria-label="Pay by state view" className="flex items-center gap-[2px] rounded-[var(--radius-md)] border p-[3px]" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
                {([["best", "Your states"], ["country", "Whole country"]] as const).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={payTab === id}
                    onClick={() => setPayTab(id)}
                    className="dm-quiet min-h-[32px] cursor-pointer rounded-[var(--radius-md)] px-[14px] text-[13px] leading-[16px] font-semibold"
                    style={{ background: payTab === id ? "var(--foreground)" : "transparent", color: payTab === id ? "var(--background)" : "var(--foreground)" }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            }
          >
            {payTab === "best" ? (
              <div className="flex flex-col gap-[var(--space-5)]">
                {vm.payByState.yourStates && vm.payByState.yourStates.length > 0 && (
                  <div className="flex flex-col gap-[var(--space-3)]">
                    <h3 className={MEDIUM}>Your states</h3>
                    <PayRows rows={vm.payByState.yourStates} accent={accent} />
                  </div>
                )}
                <div className="flex flex-col gap-[var(--space-3)]">
                  {vm.payByState.yourStates && vm.payByState.yourStates.length > 0 && <h3 className={MEDIUM}>Best states</h3>}
                  <PayRows rows={vm.payByState.best} accent={accent} />
                </div>
              </div>
            ) : (
              <div className="flex items-baseline gap-[var(--space-4)]">
                <span className={LABEL}>Typical pay</span>
                <Figure accent={accent}>{vm.typicalPay}</Figure>
              </div>
            )}
          </Section>
        )}

        {vm.ladder.length > 0 && (
          <Section title="Career ladder">
            <ol className="flex flex-col">
              {vm.ladder.map((rung) => (
                <Rung key={rung.number} rung={rung} accent={accent} open={openRung === rung.number} onToggle={() => setOpenRung((v) => (v === rung.number ? null : rung.number))} />
              ))}
            </ol>
          </Section>
        )}

        {/* Folded from here down. */}
        {vm.whatTheyDo && (
          <Folded id="what-they-do" title="What they actually do" open={openSections.has("what-they-do")} onToggle={() => toggleSection("what-they-do")}>
            <p className={`${SMALL} max-w-[68ch]`}>{vm.whatTheyDo}</p>
          </Folded>
        )}

        {vm.knowAbout.length > 0 && (
          <Folded id="know-about" title="What you need to know about" open={openSections.has("know-about")} onToggle={() => toggleSection("know-about")}>
            <DotList items={vm.knowAbout} accent={accent} />
          </Folded>
        )}

        {vm.goodAt.length > 0 && (
          <Folded id="good-at" title="What you would need to be good at" open={openSections.has("good-at")} onToggle={() => toggleSection("good-at")}>
            <DotList items={vm.goodAt} accent={accent} />
          </Folded>
        )}

        {vm.software.length > 0 && (
          <Folded id="software" title="Software you would use" open={openSections.has("software")} onToggle={() => toggleSection("software")}>
            <DotList items={vm.software} accent={accent} />
          </Folded>
        )}

        {vm.education && (
          <Folded
            id="education"
            title="Education"
            open={openSections.has("education")}
            onToggle={() => toggleSection("education")}
          >
            <div className="grid gap-[var(--space-6)] sm:grid-cols-2">
              <div className="flex flex-col gap-[var(--space-3)]">
                <h3 className={MEDIUM}>What people study for it</h3>
                <ul className="flex flex-col gap-[var(--space-2)]">
                  {vm.education.studies.map((s) => (
                    <li key={s.name}>
                      {s.href ? (
                        <a href={s.href} target="_blank" rel="noreferrer" className={`dm-link ${SMALL} inline-flex items-center gap-[6px]`} style={{ color: "var(--accent-subtle)" }}>
                          {s.name} <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                        </a>
                      ) : (
                        <span className={`${SMALL} inline-flex items-center gap-[var(--space-3)]`}>
                          <span aria-hidden className="h-[6px] w-[6px] flex-none rounded-full" style={{ background: accent }} />
                          {s.name}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col gap-[var(--space-3)]">
                <h3 className={MEDIUM}>Where you would study it</h3>
                <ul className="flex flex-col">
                  {vm.education.where.map((w, i) => (
                    <li key={w.credential} className={`flex items-baseline gap-[var(--space-4)] py-[var(--space-2)] ${i > 0 ? "border-t" : ""}`} style={{ borderColor: "var(--glass-border)" }}>
                      <span className={`${SMALL} w-[48px] flex-none font-bold tabular-nums`} style={DISPLAY}>{w.count}</span>
                      {w.href ? (
                        <a href={w.href} target="_blank" rel="noreferrer" className={`dm-link ${SMALL} inline-flex items-center gap-[6px]`} style={{ color: "var(--accent-subtle)" }}>
                          {w.credential} <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                        </a>
                      ) : (
                        <span className={SMALL}>{w.credential}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Folded>
        )}

        {similar.length > 0 && (
          <Section title="Careers like this one">
            <div className="-mx-5 flex gap-[var(--space-4)] overflow-x-auto px-5 pt-1 pb-3 [scrollbar-width:none] md:mx-0 md:px-0" style={{ touchAction: "pan-x pan-y" }}>
              {similar.map((c) => (
                <PosterCard key={c.title} career={c} onClick={() => router.push(`/career/${careerSlug(c.title)}`)} />
              ))}
            </div>
          </Section>
        )}

        {vm.sources && (
          <p className="text-[13px] leading-[18px]" style={{ color: "var(--muted-foreground)" }}>{vm.sources}</p>
        )}
      </main>

      <MobileNav active="Explore" />
    </div>
  );
}
