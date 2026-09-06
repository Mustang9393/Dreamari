"use client";

import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { ArrowUpRight, BookOpen, Bookmark, Check, Compass, Gamepad2, Heart, Plus, ThumbsDown, ThumbsUp, X } from "lucide-react";
import { CARD_TEXT_SHADOW, CardProgressiveBlur } from "@/components/app/cardChrome";
import { MatchRing } from "@/components/app/MatchRing";
import { posterTitleFont, WORLD_COLORS } from "@/components/app/worlds";
import { CAREER_EXTRAS } from "@/components/career/data";
import { CompanyChip } from "@/components/connect/primitives";

// ---------------------------------------------------------------------------
// Composed product visuals for the Schools view.
//
// Rule for this page (7 Sept 2026): marketing imagery is never a cropped
// screenshot. Every visual here is a composition built from the product's own
// pieces (poster cards, the Match card, the Play console tile, the community
// card, the Profile bento, the career ladder), sized to whole components, set
// in its own frame with deliberate padding and one focal element.
//
// The product is dark; the Schools page is light. A device screen shows the
// product, so each focal card re-enters the app's own dark token scope by
// carrying the `marketing-v2` class (tokens.css defines the Semantic.Dark set
// on that class), the same way a dark-mode screen sits on a white product
// page. Nothing in here defines a colour of its own: every value is a token
// from that scope or the light page's.
//
// Sizing: each focal card is a container; `--mu` is its width over the 360px
// design width, so type and spacing scale with the card the way the student
// landing's chapter graphics do (animations.css, .mkt-graphic-scale).
// ---------------------------------------------------------------------------

const mu = (px: number) => `calc(var(--mu) * ${px}px)`;

// The soft light tile every focal card sits in: hero-mid fading to the page,
// a faint wash of the stage's own colour, a hairline, and one soft shadow
// under the card inside. Padding is the frame; nothing touches its edge.
export function Tile({ accent, children, className = "", pad = "p-6 sm:p-10" }: { accent: string; children: ReactNode; className?: string; pad?: string }) {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-[24px] border ${pad} ${className}`}
      style={{
        background: `radial-gradient(120% 90% at 20% 0%, color-mix(in srgb, ${accent} 12%, transparent), transparent 55%), linear-gradient(180deg, var(--hero-mid) 0%, color-mix(in srgb, var(--hero-mid) 40%, var(--background)) 100%)`,
        borderColor: "color-mix(in srgb, var(--foreground) 8%, transparent)",
      }}
    >
      {children}
    </div>
  );
}

// The focal card: a dark product surface (see the scope note above), a fixed
// 5:4 footprint so the five stages read as one set, a glass hairline and the
// page's one shadow. `label` names the composition for screen readers; the
// text inside is the product's own UI copy, so it is hidden from them.
// `aspect` is the card's ratio; pass null to set it with responsive classes
// instead (a card that wants to be squarer on phones). `floor` is the smallest
// --mu the content is allowed to shrink to.
function Screen({ label, aspect = "5 / 4", maxWidth = 420, base = 360, floor = 0.6, children, className = "" }: { label: string; aspect?: string | null; maxWidth?: number; base?: number; floor?: number; children: ReactNode; className?: string }) {
  return (
    <div
      role="img"
      aria-label={label}
      className={`marketing-v2 relative w-full overflow-hidden rounded-[20px] border ${className}`}
      style={{
        maxWidth,
        aspectRatio: aspect ?? undefined,
        containerType: "inline-size",
        borderColor: "var(--glass-border)",
        boxShadow: "0 32px 70px -34px rgba(5,7,15,0.55), 0 2px 6px -2px rgba(5,7,15,0.25)",
      }}
    >
      <div aria-hidden className="absolute inset-0 flex flex-col" style={{ ["--mu" as string]: `clamp(${floor}, calc(100cqw / ${base}px), 1.25)` }}>
        {children}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared product pieces, at --mu scale
// ---------------------------------------------------------------------------

const EYEBROW: CSSProperties = { fontFamily: "var(--font-body)", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" };

// Career Poster Card (app/PosterCard.tsx) at card scale: photo, the world's
// own title face, the world label in its colour, the poster scrim.
function Poster({ photo, title, world, salary, width, className = "" }: { photo: string; title: string; world: string; salary?: string; width: string; className?: string }) {
  return (
    <div className={`relative flex-none overflow-hidden rounded-[var(--radius-md)] border text-center uppercase ${className}`} style={{ width, aspectRatio: "210 / 297", borderColor: "var(--glass-border)" }}>
      <Image src={photo} alt="" fill sizes="260px" className="object-cover" draggable={false} />
      {salary && (
        <span className="absolute z-[1] rounded-[var(--radius-sm)] border backdrop-blur-[10px]" style={{ top: mu(6), right: mu(6), padding: `${mu(2)} ${mu(7)}`, background: "rgba(5,8,20,0.78)", borderColor: "rgba(255,255,255,0.16)" }}>
          <span className="font-extrabold" style={{ fontFamily: "var(--font-display)", fontSize: mu(11), color: "var(--foreground)" }}>{salary}</span>
        </span>
      )}
      <span className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-end" style={{ height: "48%", gap: mu(3), padding: `0 ${mu(6)} ${mu(10)}`, backgroundImage: "var(--poster-scrim)" }}>
        <span className="w-full [overflow-wrap:normal] [word-break:keep-all]" style={{ ...posterTitleFont(world), fontSize: mu(Math.max(...title.split(/[\s-]+/).map((w) => w.length)) >= 10 ? 10.5 : 13), lineHeight: 1.15, color: "var(--poster-title)" }}>{title}</span>
        <span className="w-full" style={{ ...EYEBROW, fontSize: mu(6.5), letterSpacing: "0.06em", color: WORLD_COLORS[world] }}>{world}</span>
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Hero: the Career Detail header inside a laptop
// ---------------------------------------------------------------------------

// A laptop drawn in CSS: ink body, screen inset, camera dot, a base with a
// lighter lip. No image of a device, so it sits on any colour and scales to
// the column. The screen is a Screen() at 16:10 with the app's dark scope.
export function HeroLaptop() {
  const accent = WORLD_COLORS["Business & Money"];
  const summary = "Helps companies raise money and buy or sell businesses.";
  const scenario = "Imagine a hospital company wants to build 100 new hospitals but does not have the money. You find the investors and put the deal together.";
  return (
    <div className="relative mx-auto w-full max-w-[640px]">
      <div className="relative rounded-[clamp(14px,2.4cqw,22px)] border" style={{ padding: "clamp(8px,1.4vw,12px)", background: "var(--foreground)", borderColor: "color-mix(in srgb, var(--foreground) 70%, var(--background))", boxShadow: "0 48px 90px -44px rgba(5,7,15,0.55), 0 4px 10px -4px rgba(5,7,15,0.3)" }}>
        <span aria-hidden className="absolute top-[4px] left-1/2 h-[4px] w-[4px] -translate-x-1/2 rounded-full" style={{ background: "color-mix(in srgb, var(--background) 30%, transparent)" }} />
        <Screen label="Career Detail for Investment Banking: title, world, one-line summary, Play Game and Glossary Game buttons, and the Typical degree and Typical pay facts" aspect="16 / 10" maxWidth={640} base={640} floor={0.5} className="rounded-[clamp(8px,1.2cqw,12px)]">
          <div className="flex h-full flex-col" style={{ padding: mu(18), gap: mu(10), background: "var(--background)" }}>
            {/* header card: photo on the right fading into the card, type on the frosted lower left */}
            {/* clip-path: Chrome does not clip backdrop-filter layers to an
               ancestor's rounded overflow (a square photo corner showed at
               the bottom right, in the app's own header too); the explicit
               clip does. */}
            <div className="relative flex-1 overflow-hidden rounded-[var(--radius-lg)] border" style={{ borderColor: "var(--glass-border)", background: "#0e0c20", textShadow: CARD_TEXT_SHADOW, clipPath: "inset(0 round var(--radius-lg))" }}>
              <span className="absolute inset-y-0 right-0 w-[52%] overflow-hidden rounded-[inherit]">
                <Image src="/images/app/poster-investment-banking-v3.png" alt="" fill sizes="520px" className="object-cover" style={{ objectPosition: "50% 12%" }} priority />
                <span className="absolute inset-0" style={{ background: "linear-gradient(90deg, #0e0c20 0%, rgba(14,12,32,0.45) 26%, transparent 58%)" }} />
              </span>
              <span className="absolute inset-0 overflow-hidden rounded-[inherit]"><CardProgressiveBlur size="52%" /></span>
              <span className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(12,16,35,0.86) 0%, rgba(12,16,35,0.5) 32%, rgba(12,16,35,0.1) 60%, transparent 100%), linear-gradient(to bottom, rgba(10,9,20,0.35) 0%, rgba(10,9,20,0.1) 40%, transparent 65%)" }} />
              <div className="absolute inset-x-0 bottom-0 flex flex-col" style={{ padding: mu(22), gap: mu(7), color: "#fff" }}>
                <p className="uppercase whitespace-nowrap" style={{ ...posterTitleFont("Business & Money"), fontSize: mu(34), lineHeight: 1 }}>Investment Banking</p>
                <p style={{ ...EYEBROW, fontSize: mu(8.5), letterSpacing: "0.6px", color: `color-mix(in srgb, ${accent} 70%, #ffffff)` }}>Business &amp; Money</p>
                <p className="font-semibold" style={{ fontSize: mu(11.5), lineHeight: 1.35, maxWidth: "min(64%, 40ch)" }}>{summary}</p>
                <div className="flex flex-nowrap items-center" style={{ gap: mu(8), marginTop: mu(4), textShadow: "none" }}>
                  <span className="flex items-center rounded-[var(--radius-md)] font-semibold" style={{ gap: mu(6), height: mu(30), padding: `0 ${mu(14)}`, fontSize: mu(10.5), background: "var(--primary)", color: "var(--primary-foreground)" }}>
                    <Gamepad2 style={{ width: mu(11), height: mu(11) }} aria-hidden /> Play Game
                  </span>
                  <span className="flex items-center rounded-[var(--radius-md)] border font-semibold" style={{ gap: mu(6), height: mu(30), padding: `0 ${mu(14)}`, fontSize: mu(10.5), borderColor: "rgba(255,255,255,0.3)", background: "rgba(12,16,35,0.55)", color: "#fff" }}>
                    <BookOpen style={{ width: mu(11), height: mu(11) }} aria-hidden /> Glossary Game
                  </span>
                  {[Plus, Heart, ThumbsDown, Bookmark].map((Icon, i) => (
                    <span key={i} className="flex items-center justify-center rounded-full border" style={{ width: mu(30), height: mu(30), borderColor: "rgba(255,255,255,0.3)", background: "rgba(12,16,35,0.55)", color: "#fff" }}>
                      <Icon style={{ width: mu(13), height: mu(13) }} aria-hidden />
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <p style={{ fontSize: mu(10), lineHeight: 1.45, color: "var(--muted-foreground)", maxWidth: "70ch" }}>{scenario}</p>
            {/* quick facts strip */}
            <div className="grid flex-none grid-cols-2 rounded-[var(--radius-lg)] border" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-2)" }}>
              {[
                { label: "Typical degree", value: "Bachelor's degree" },
                { label: "Typical pay", value: "$361,000/year" },
              ].map((fact, i) => (
                <div key={fact.label} className={`flex flex-col ${i === 1 ? "border-l" : ""}`} style={{ gap: mu(3), padding: `${mu(11)} ${mu(14)}`, borderColor: "var(--glass-border)" }}>
                  <span className="font-semibold" style={{ fontSize: mu(10.5), color: "var(--foreground)" }}>{fact.label}</span>
                  <span className="font-bold tabular-nums" style={{ fontFamily: "var(--font-display)", fontSize: mu(12), backgroundImage: `linear-gradient(135deg, color-mix(in srgb, ${accent} 55%, #ffffff) 0%, ${accent} 100%)`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{fact.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Screen>
      </div>
      {/* the base: a little wider than the lid, with a lighter lip where the hinge sits */}
      <div aria-hidden className="relative mx-auto -mt-px h-[clamp(9px,1.6vw,14px)] w-[106%] max-w-none rounded-b-[clamp(8px,1.4vw,14px)]" style={{ marginLeft: "-3%", background: "linear-gradient(180deg, color-mix(in srgb, var(--foreground) 62%, var(--background)) 0%, color-mix(in srgb, var(--foreground) 80%, var(--background)) 100%)", boxShadow: "0 30px 50px -30px rgba(5,7,15,0.45)" }}>
        <span className="absolute top-0 left-1/2 h-[35%] w-[14%] -translate-x-1/2 rounded-b-[6px]" style={{ background: "color-mix(in srgb, var(--foreground) 45%, var(--background))" }} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// The five stage cards
// ---------------------------------------------------------------------------

// Build: the interest question from the assessment, with the Build flow's
// aurora glow at the top of the screen and the picked world checked in.
export function BuildScreen() {
  const options = ["Tech & Engineering", "Business & Money", "Health & Medicine"];
  const picked = "Business & Money";
  return (
    <Screen label="Build step 3 of 10, Choose your interests: Tech and Engineering, Business and Money (chosen), Health and Medicine, with the progress bar">
      <div className="relative flex h-full flex-col overflow-hidden" style={{ padding: mu(22), gap: mu(14), background: "var(--background)" }}>
        <span className="pointer-events-none absolute -top-[30%] left-1/2 h-[70%] w-[120%] -translate-x-1/2 rounded-full blur-[40px]" style={{ background: `radial-gradient(ellipse at 50% 60%, color-mix(in srgb, var(--world-tech-engineering-design) 45%, transparent), color-mix(in srgb, var(--hero-accent-purple) 70%, transparent) 45%, transparent 75%)` }} />
        <div className="relative flex flex-col" style={{ gap: mu(6) }}>
          <p style={{ ...EYEBROW, fontSize: mu(9), color: "var(--muted-foreground)" }}>Question 3 of 10</p>
          <p className="font-bold" style={{ fontSize: mu(19), lineHeight: 1.2, color: "var(--foreground)" }}>Choose your interests</p>
          <p style={{ fontSize: mu(10.5), color: "var(--muted-foreground)" }}>Pick up to 2 career worlds that sound like you.</p>
        </div>
        <div className="relative flex flex-1 flex-col justify-center" style={{ gap: mu(8) }}>
          {options.map((o) => {
            const on = o === picked;
            return (
              <div key={o} className="flex items-center justify-between rounded-[var(--radius-md-alt)] border" style={{ padding: `${mu(11)} ${mu(14)}`, fontSize: mu(12.5), fontWeight: 600, background: on ? "color-mix(in srgb, var(--world-tech-engineering-design) 18%, var(--glass-surface-2))" : "var(--glass-surface-2)", borderColor: on ? "var(--world-tech-engineering-design)" : "var(--border)", color: on ? "var(--foreground)" : "var(--muted-foreground)" }}>
                {o}
                <span className="flex items-center justify-center rounded-full" style={{ width: mu(18), height: mu(18), background: on ? "var(--world-tech-engineering-design)" : "transparent", border: on ? "none" : "1.5px solid var(--border)", color: "#fff" }}>
                  {on && <Check style={{ width: mu(11), height: mu(11) }} strokeWidth={3} aria-hidden />}
                </span>
              </div>
            );
          })}
        </div>
        <div className="relative flex items-center" style={{ gap: mu(10) }}>
          <span className="h-[4px] flex-1 overflow-hidden rounded-full" style={{ background: "var(--glass-surface-2)" }}>
            <span className="block h-full rounded-full" style={{ width: "30%", background: "var(--accent-subtle)", boxShadow: "0 0 10px var(--accent-subtle)" }} />
          </span>
          <span className="font-semibold tabular-nums" style={{ fontSize: mu(9.5), color: "var(--muted-foreground)" }}>30%</span>
        </div>
      </div>
    </Screen>
  );
}

// Match: the swipe card (the student landing's Match chapter recipe) with the
// Top 3 slots above it and Pass / Like below.
export function MatchScreen() {
  const world = "Business & Money";
  return (
    <Screen label="Match: Find your Top 3 with one slot filled, an Investment Banking card showing a $361K median, and Pass and Like buttons">
      <div className="flex h-full flex-col items-center" style={{ padding: `${mu(16)} ${mu(20)}`, gap: mu(10), background: "var(--background)" }}>
        <div className="flex w-full items-center justify-between">
          <p className="font-bold" style={{ fontSize: mu(13), color: "var(--foreground)" }}>Find your Top 3</p>
          <span className="flex" style={{ gap: mu(5) }}>
            {[true, false, false].map((filled, i) => (
              <span key={i} className="rounded-full border" style={{ width: mu(14), height: mu(14), borderColor: filled ? WORLD_COLORS[world] : "var(--border)", background: filled ? WORLD_COLORS[world] : "transparent" }} />
            ))}
          </span>
        </div>
        <div className="relative flex min-h-0 flex-1 items-center justify-center" style={{ width: "100%" }}>
          {/* peeking card behind */}
          <span className="absolute h-full overflow-hidden rounded-[var(--radius-lg)] border" style={{ aspectRatio: "210 / 297", transform: `translateY(${mu(-10)}) scale(0.92)`, opacity: 0.55, borderColor: "var(--glass-border)", background: "var(--card)" }}>
            <Image src="/images/app/poster-private-equity.png" alt="" fill sizes="200px" className="object-cover" />
          </span>
          <div className="relative h-full overflow-hidden rounded-[var(--radius-lg)] border text-center uppercase" style={{ aspectRatio: "210 / 297", borderColor: "var(--glass-surface-2)", boxShadow: "0 18px 36px -18px rgba(0,0,0,0.7)", clipPath: "inset(0 round var(--radius-lg))" }}>
            <Image src="/images/app/poster-investment-banking-v3.png" alt="" fill sizes="260px" className="object-cover" style={{ objectPosition: "50% 12%" }} />
            <span className="absolute inset-0 overflow-hidden rounded-[inherit]"><CardProgressiveBlur size="46%" /></span>
            <span className="absolute inset-0" style={{ background: "linear-gradient(180deg, var(--scrim-transparent) 0%, var(--scrim-transparent) 55%, var(--scrim-medium) 78%, var(--background) 100%)" }} />
            <span className="absolute z-[1] rounded-[var(--radius-sm)] border backdrop-blur-[10px]" style={{ top: mu(7), right: mu(7), padding: `${mu(2)} ${mu(7)}`, background: "rgba(5,8,20,0.78)", borderColor: "rgba(255,255,255,0.16)" }}>
              <span className="font-extrabold" style={{ fontFamily: "var(--font-display)", fontSize: mu(11), color: "var(--foreground)" }}>$361K</span>
            </span>
            <span className="absolute inset-x-0 bottom-0 flex flex-col" style={{ padding: mu(10), gap: mu(3) }}>
              <span style={{ ...posterTitleFont(world), fontSize: mu(15), lineHeight: 1.1, color: "var(--foreground)", letterSpacing: "0.3px" }}>Investment Banking</span>
              <span style={{ ...EYEBROW, fontSize: mu(7), letterSpacing: "0.5px", color: WORLD_COLORS[world] }}>{world}</span>
            </span>
          </div>
        </div>
        <div className="flex items-center" style={{ gap: mu(16) }}>
          <span className="flex items-center justify-center rounded-full border" style={{ width: mu(38), height: mu(38), background: "var(--glass-surface-2)", borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
            <X style={{ width: mu(16), height: mu(16) }} aria-hidden />
          </span>
          <span className="flex items-center justify-center rounded-full" style={{ width: mu(38), height: mu(38), background: WORLD_COLORS[world], color: "#05070f" }}>
            <ThumbsUp style={{ width: mu(16), height: mu(16) }} aria-hidden />
          </span>
        </div>
      </div>
    </Screen>
  );
}

// Explore: the Browse page in miniature. World chips, then one rail of
// whole poster cards (never a card cut at the edge).
export function ExploreScreen() {
  const chips = ["All", "Business & Money", "Tech", "Health"];
  const posters = [
    { photo: "/images/app/poster-asset-manager.png", title: "Asset Manager", world: "Business & Money", salary: "$140K" },
    { photo: "/images/app/poster-quant.png", title: "Quant", world: "Business & Money", salary: "$150K" },
    { photo: "/images/app/poster-accountant.png", title: "Accountant", world: "Business & Money", salary: "$81K" },
  ];
  return (
    <Screen label="Explore: a filter row of career worlds and the rail 'Recommended because you liked Business and Money' with poster cards for Asset Manager, Quant and Accountant">
      <div className="flex h-full flex-col" style={{ padding: mu(20), gap: mu(12), background: "var(--background)" }}>
        <div className="flex items-center" style={{ gap: mu(6) }}>
          {chips.map((c, i) => (
            <span key={c} className="rounded-full border font-semibold whitespace-nowrap" style={{ padding: `${mu(4)} ${mu(10)}`, fontSize: mu(9), borderColor: i === 1 ? "var(--foreground)" : "var(--glass-border)", background: i === 1 ? "var(--foreground)" : "var(--glass-surface-1)", color: i === 1 ? "var(--background)" : "var(--muted-foreground)" }}>
              {c}
            </span>
          ))}
        </div>
        <p className="font-extrabold" style={{ fontFamily: "var(--font-body)", fontSize: mu(12.5), color: "var(--foreground)" }}>
          Recommended because you liked <span style={{ color: WORLD_COLORS["Business & Money"] }}>Business &amp; Money</span>
        </p>
        <div className="flex flex-1 items-center justify-between" style={{ gap: mu(10) }}>
          {posters.map((p) => (
            <Poster key={p.title} {...p} width="31%" />
          ))}
        </div>
      </div>
    </Screen>
  );
}

// Immerse: the Play console tile from the student landing, at rest. The
// scene fills the top, the HUD chip and dialogue sit on it, the question and
// the console menu below with the cursor on the best answer.
export function ImmerseScreen() {
  const gold = "var(--world-business-money-office)";
  const choices = [
    { label: "Ask for your role and deadline", best: true },
    { label: "Start changing slides", best: false },
    { label: "Wait for another analyst", best: false },
  ];
  return (
    <Screen label="Investment Banking simulation, Level 1 Intern: Christina says 'This is Marcus, our Vice President. We have a big pitch tomorrow, so I need you on it.' and the question 'What should you do first?' with three choices">
      <div className="flex h-full flex-col" style={{ background: "#0b0e1c" }}>
        <div className="relative w-full flex-none overflow-hidden" style={{ height: "56%" }}>
          <Image src="/images/sim-deal-kickoff.jpg" alt="" fill sizes="480px" className="object-cover" />
          <span className="absolute flex items-center rounded-[6px] font-bold uppercase" style={{ top: mu(12), left: mu(12), padding: `${mu(3)} ${mu(8)}`, fontSize: mu(8.5), letterSpacing: "0.1em", background: "rgba(8,10,22,0.72)", color: gold, backdropFilter: "blur(8px)" }}>Level 1 · Intern</span>
          <span className="absolute inset-x-0 bottom-0" style={{ height: "55%", background: "linear-gradient(180deg, transparent, rgba(11,14,28,0.6) 55%, #0b0e1c 100%)" }} />
          <div className="absolute rounded-[var(--radius-md-alt)] border" style={{ insetInline: mu(12), bottom: mu(8), padding: mu(9), background: "rgba(8,10,22,0.8)", borderColor: "rgba(255,255,255,0.14)", backdropFilter: "blur(8px)" }}>
            <p className="flex items-baseline font-bold uppercase" style={{ gap: mu(5), fontSize: mu(8.5), letterSpacing: "0.06em" }}>
              <span style={{ color: gold }}>Christina</span>
              <span style={{ color: "rgba(255,255,255,0.55)" }}>Associate</span>
            </p>
            <p className="font-medium" style={{ marginTop: mu(2), fontFamily: "var(--font-body)", fontSize: mu(10), lineHeight: 1.4, color: "rgba(255,255,255,0.94)" }}>
              {"“"}This is Marcus, our Vice President. We have a big pitch tomorrow, so I need you on it.{"”"}
            </p>
          </div>
        </div>
        <div className="flex flex-1 flex-col justify-center" style={{ padding: `${mu(4)} ${mu(12)} ${mu(12)}`, gap: mu(4) }}>
          <p className="font-extrabold" style={{ padding: `0 ${mu(10)}`, fontFamily: "var(--font-display)", fontSize: mu(12), lineHeight: 1.25, color: "var(--foreground)" }}>What should you do first?</p>
          {choices.map((c) => (
            <div key={c.label} className="relative flex items-center rounded-[8px] font-semibold" style={{ gap: mu(8), padding: `${mu(6)} ${mu(10)}`, fontSize: mu(10.5), background: c.best ? "rgba(255,255,255,0.055)" : "transparent", boxShadow: c.best ? "inset 0 0 0 1px rgba(255,255,255,0.07)" : undefined, color: "var(--foreground)" }}>
              <span className="absolute left-0 w-[3px] rounded-full" style={{ top: mu(5), bottom: mu(5), background: c.best ? "color-mix(in srgb, var(--world-driving-flying-shipping) 75%, #fff 10%)" : "transparent" }} />
              {c.label}
            </div>
          ))}
        </div>
      </div>
    </Screen>
  );
}

// Connect: a community board with a student's question and a verified
// professional's answer. Real firms, real marks (CompanyChip).
export function ConnectScreen() {
  const cyan = "var(--world-science-research)";
  return (
    <Screen label="Connect: the Finance community with 312 students, 61 professionals and 5 companies; Maya asks 'How do you get an internship at a bank?' and Marcus, a verified Goldman Sachs analyst, answers">
      <div className="flex h-full flex-col" style={{ padding: mu(18), gap: mu(10), background: "var(--background)" }}>
        <div className="flex items-end justify-between" style={{ gap: mu(10) }}>
          <div className="flex flex-col" style={{ gap: mu(3) }}>
            <p style={{ ...EYEBROW, fontSize: mu(8.5), color: cyan }}>Community Board</p>
            <p className="font-extrabold" style={{ fontSize: mu(18), lineHeight: 1.1, color: "var(--foreground)" }}>Finance</p>
          </div>
          <div className="flex" style={{ gap: mu(6) }}>
            {[
              { value: "312", label: "Students" },
              { value: "61", label: "Pros" },
              { value: "5", label: "Firms" },
            ].map((s) => (
              <span key={s.label} className="flex flex-col items-center rounded-[var(--radius-sm)]" style={{ padding: `${mu(5)} ${mu(8)}`, background: "var(--glass-surface-2)" }}>
                <span className="font-extrabold tabular-nums" style={{ fontSize: mu(11.5), color: "var(--foreground)" }}>{s.value}</span>
                <span style={{ ...EYEBROW, fontSize: mu(6.5), letterSpacing: "0.05em", color: "var(--muted-foreground)" }}>{s.label}</span>
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center" style={{ gap: mu(6) }}>
          <CompanyChip name="JPMorgan Chase" tone="surface" size="sm" />
          <CompanyChip name="Goldman Sachs" tone="surface" size="sm" />
          <CompanyChip name="EY" tone="surface" size="sm" />
          <span style={{ ...EYEBROW, fontSize: mu(7.5), letterSpacing: "0.06em", color: "var(--muted-foreground)" }}>+ more</span>
        </div>
        <div className="flex flex-1 flex-col justify-end" style={{ gap: mu(7) }}>
          <div className="rounded-[var(--radius-md)] border" style={{ padding: `${mu(9)} ${mu(11)}`, background: "var(--glass-surface-1)", borderColor: "var(--glass-border)" }}>
            <div className="flex items-center" style={{ gap: mu(7) }}>
              <span className="relative flex-none overflow-hidden rounded-full" style={{ width: mu(20), height: mu(20) }}>
                <Image src="/images/avatar-maya-howard.jpg" alt="" fill sizes="40px" className="object-cover" />
              </span>
              <span className="font-bold" style={{ fontSize: mu(10), color: "var(--foreground)" }}>Maya</span>
              <span className="font-semibold" style={{ fontSize: mu(8.5), color: "var(--muted-foreground)" }}>· Grade 11</span>
            </div>
            <p className="font-bold" style={{ marginTop: mu(5), fontSize: mu(12.5), lineHeight: 1.3, color: "var(--foreground)" }}>How do you get an internship at a bank?</p>
          </div>
          <div className="rounded-[var(--radius-md)]" style={{ marginLeft: mu(16), padding: `${mu(9)} ${mu(11)}`, background: "var(--glass-surface-2)" }}>
            <div className="flex items-center" style={{ gap: mu(6) }}>
              <span className="relative flex-none overflow-hidden rounded-full" style={{ width: mu(18), height: mu(18) }}>
                <Image src="/images/avatar-marcus.jpg" alt="" fill sizes="36px" className="object-cover" />
              </span>
              <span className="font-bold" style={{ fontSize: mu(10), color: cyan }}>Marcus</span>
              <span className="flex items-center justify-center rounded-full" style={{ width: mu(10), height: mu(10), background: cyan, color: "#05070f" }}>
                <Check style={{ width: mu(7), height: mu(7) }} strokeWidth={3.5} aria-hidden />
              </span>
              <span className="font-semibold" style={{ fontSize: mu(8.5), color: "var(--muted-foreground)" }}>· Goldman Sachs · Analyst</span>
            </div>
            <p style={{ marginTop: mu(4), fontSize: mu(10.5), lineHeight: 1.4, color: "var(--foreground)" }}>Join your school&apos;s finance club and apply junior year. GPA and networking both matter.</p>
          </div>
        </div>
      </div>
    </Screen>
  );
}

// ---------------------------------------------------------------------------
// Counselors: a student's Profile overview (the bento and Do this next)
// ---------------------------------------------------------------------------

export function ProgressScreen() {
  const tiles = [
    { title: "My Top Three", line: "2 of 3 chosen" },
    { title: "My Plan", line: "1 of 13 steps", pct: 8 },
    { title: "Career Report", line: "5 sections" },
  ];
  return (
    <Screen label="A student's Profile overview: My Top Three (2 of 3 chosen), My Plan (1 of 13 steps), Career Report (5 sections), and a 'Do this next' block with Explore and Play actions" aspect={null} className="aspect-[4/3] sm:aspect-[16/10]" maxWidth={560} base={480}>
      <div className="flex h-full flex-col" style={{ padding: mu(20), gap: mu(12), background: "var(--background)" }}>
        <div className="flex items-center justify-between" style={{ gap: mu(10) }}>
          <div className="flex items-center" style={{ gap: mu(10) }}>
            <span className="flex items-center justify-center rounded-full font-extrabold" style={{ width: mu(34), height: mu(34), fontSize: mu(12), background: "var(--glass-surface-2)", color: "var(--foreground)", fontFamily: "var(--font-display)" }}>JR</span>
            <span className="flex flex-col" style={{ gap: mu(2) }}>
              <span className="font-extrabold" style={{ fontSize: mu(14), fontFamily: "var(--font-display)", color: "var(--foreground)" }}>Jordan Rivera</span>
              <span className="font-semibold" style={{ fontSize: mu(9.5), color: "var(--muted-foreground)" }}>Class of 2027 · #1 Investment Banking</span>
            </span>
          </div>
          <MatchRing score={50} size={40} />
        </div>
        <div className="grid grid-cols-3" style={{ gap: mu(8) }}>
          {tiles.map((t) => (
            <div key={t.title} className="flex flex-col justify-between rounded-[var(--radius-lg)] border" style={{ gap: mu(10), padding: mu(11), background: "var(--inset-surface)", borderColor: "var(--inset-border)" }}>
              <span className="flex items-start justify-between" style={{ gap: mu(4) }}>
                <span className="font-extrabold" style={{ fontSize: mu(12), lineHeight: 1.2, fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{t.title}</span>
                <ArrowUpRight style={{ width: mu(11), height: mu(11), color: "var(--muted-foreground)" }} aria-hidden />
              </span>
              <span className="flex flex-col" style={{ gap: mu(5) }}>
                <span className="font-medium" style={{ fontSize: mu(10), color: "var(--muted-foreground)" }}>{t.line}</span>
                {t.pct !== undefined && (
                  <span className="h-[5px] overflow-hidden rounded-full" style={{ background: "var(--glass-surface-2)" }}>
                    <span className="block h-full rounded-full" style={{ width: `${t.pct}%`, background: "var(--accent-subtle)", boxShadow: "0 0 8px var(--accent-subtle)" }} />
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>
        <div className="flex flex-1 flex-col justify-center rounded-[var(--radius-lg)] border" style={{ gap: mu(7), padding: `${mu(11)} ${mu(13)}`, background: "var(--inset-surface)", borderColor: "var(--inset-border)" }}>
          <p className="font-bold uppercase" style={{ fontSize: mu(9), letterSpacing: "1.4px", color: "var(--accent-subtle)" }}>Do this next</p>
          {[
            { Icon: Compass, verb: "Explore", rest: "10 Finance Careers and save your Top 3" },
            { Icon: Gamepad2, verb: "Play", rest: "Day in the Life of an Investment Banker" },
          ].map((line) => (
            <p key={line.verb} className="flex items-center font-semibold" style={{ gap: mu(8), fontSize: mu(10.5), color: "var(--foreground)" }}>
              <span className="inline-flex flex-none items-center rounded-[var(--radius-md)] font-semibold" style={{ gap: mu(4), height: mu(24), padding: `0 ${mu(9)}`, fontSize: mu(9.5), background: "var(--primary)", color: "#FFFFFF" }}>
                <line.Icon style={{ width: mu(10), height: mu(10) }} aria-hidden /> {line.verb}
              </span>
              <span className="min-w-0 truncate">{line.rest}</span>
            </p>
          ))}
        </div>
      </div>
    </Screen>
  );
}

// ---------------------------------------------------------------------------
// Data credibility: the Investment Banking career ladder, from the app's own
// data (career/data.ts), with the report's source line under it. No chart.
// ---------------------------------------------------------------------------

export function LadderScreen() {
  const accent = WORLD_COLORS["Business & Money"];
  const rungs = (CAREER_EXTRAS["investment-banking"]?.ladder ?? []).filter((r) => r.salary !== "-");
  return (
    <Screen label="Career ladder for Investment Banking from the app: Summer Analyst about $85K, Analyst about $150K, Associate about $225K, Vice President about $350K; pay and growth from the U.S. Bureau of Labor Statistics" aspect="16 / 11" maxWidth={560} base={480}>
      <div className="flex h-full flex-col" style={{ padding: mu(20), gap: mu(10), background: "var(--background)" }}>
        <div className="flex items-baseline justify-between border-b" style={{ paddingBottom: mu(10), borderColor: "var(--glass-border)" }}>
          <p className="font-bold tracking-[-0.01em]" style={{ fontFamily: "var(--font-display)", fontSize: mu(17), color: "var(--foreground)" }}>Career ladder</p>
          <p style={{ ...EYEBROW, fontSize: mu(8), letterSpacing: "0.6px", color: accent }}>Investment Banking</p>
        </div>
        <ul className="flex flex-1 flex-col justify-center">
          {rungs.map((r, i) => (
            <li key={r.number} className={`grid items-center ${i > 0 ? "border-t" : ""}`} style={{ gridTemplateColumns: `${mu(26)} minmax(0,1fr) auto`, columnGap: mu(12), padding: `${mu(9)} 0`, borderColor: "var(--glass-border)" }}>
              <span className="text-center font-bold tabular-nums" style={{ fontFamily: "var(--font-display)", fontSize: mu(14), backgroundImage: `linear-gradient(180deg, ${accent}, color-mix(in srgb, ${accent} 60%, #000))`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{r.number}</span>
              <span className="min-w-0 truncate font-semibold" style={{ fontSize: mu(12), color: "var(--foreground)" }}>{r.jobTitle}</span>
              <span className="font-bold tabular-nums" style={{ fontFamily: "var(--font-display)", fontSize: mu(12), backgroundImage: `linear-gradient(135deg, color-mix(in srgb, ${accent} 55%, #ffffff) 0%, ${accent} 100%)`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{r.salary}</span>
            </li>
          ))}
        </ul>
        <p style={{ fontSize: mu(9), lineHeight: 1.4, color: "var(--muted-foreground)" }}>Pay and growth from the U.S. Bureau of Labor Statistics. Job description and skills from O*NET (USDOL/ETA).</p>
      </div>
    </Screen>
  );
}
