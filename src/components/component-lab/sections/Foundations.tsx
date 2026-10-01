"use client";

// DEMO-ONLY: Component Lab section, "Foundations". The design tokens and
// shared CSS utilities everything else in the app (and this lab) is built
// from: colour tokens, the type scale, spacing/radii, glass surfaces, the
// dm-* motion/nudge utilities, and the small motion/decor components that
// use them. Swatches paint `var(--x)` live and read their resolved value
// with getComputedStyle, re-reading whenever <html>'s class changes, so the
// header's light/dark toggle updates everything on this page in place.

import { useEffect, useRef, useState, type CSSProperties, type ComponentType, type ReactNode } from "react";
import { Section, SubHead, Specimen, StateGrid, StateCell, Reveal, noop, MONO } from "../kit";
import { PAGE_TITLE_CLASS, PAGE_TITLE_STYLE } from "@/components/app/chrome";
import { HoverBeam } from "@/components/app/HoverBeam";
import { ConfirmShimmer } from "@/components/flow/ConfirmShimmer";
import { PlayBurst } from "@/components/play/PlayBurst";
import { Confetti } from "@/components/flow/aurora/Confetti";
import { GestureHint } from "@/components/flow/GestureHint";
import { StreakFlame, ScoreBolt } from "@/components/app/ScoreIcons";
import { AppBackdrop } from "@/components/app/AppBackdrop";
import { PlayBackdrop } from "@/components/play/PlayBackdrop";
import { AuroraBackground } from "@/components/flow/aurora/AuroraBackground";
import { BackgroundSpace } from "@/components/flow/aurora/BackgroundSpace";
import { ThemeProvider } from "@/components/flow/theme/ThemeProvider";
import { StarsBackground } from "@/components/ui/stars";
import { FireworksBackground } from "@/components/ui/fireworks";
import { Vortex } from "@/components/ui/vortex";
import {
  BookIcon,
  GraduationCapIcon,
  BriefcaseIcon,
  DownloadIcon,
  ShareIcon,
  ChevronLeftIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  TargetIcon,
  PiggyBankIcon,
  ScaleIcon,
  HandIcon,
  HomeIcon,
  MapIcon,
  CompassIcon,
  GlobeIcon,
  CheckIcon,
  HeartIcon,
  XIcon,
  LightbulbIcon,
  StarIcon,
  ArrowLeftRightIcon,
  SunIcon,
  MoonIcon,
} from "@/components/flow/icons";

const CAPTION: CSSProperties = { color: "var(--muted-foreground)" };

// ---------------------------------------------------------------------------
// Live-token helpers: every swatch reads its ACTUAL computed value off a real
// DOM node instead of printing a value we typed by hand, and re-reads it
// whenever <html> gains/loses the `dark`/`light` class (the lab's own theme
// toggle), via a MutationObserver.

type StyleProp = "backgroundColor" | "width" | "borderRadius" | "fontFamily";

function useResolvedStyleProp<T extends HTMLElement>(prop: StyleProp) {
  const ref = useRef<T>(null);
  const [value, setValue] = useState("");
  useEffect(() => {
    const read = () => {
      if (!ref.current) return;
      setValue(getComputedStyle(ref.current)[prop]);
    };
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, [prop]);
  return [ref, value] as const;
}

function useResolvedTypography() {
  const ref = useRef<HTMLSpanElement>(null);
  const [info, setInfo] = useState({ family: "", size: "", weight: "" });
  useEffect(() => {
    const read = () => {
      if (!ref.current) return;
      const cs = getComputedStyle(ref.current);
      setInfo({ family: cs.fontFamily, size: cs.fontSize, weight: cs.fontWeight });
    };
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  return [ref, info] as const;
}

/** One colour token: a live swatch, its name in MONO, and its resolved value. */
function TokenSwatch({ name }: { name: string }) {
  const [ref, resolved] = useResolvedStyleProp<HTMLDivElement>("backgroundColor");
  return (
    <div className="flex flex-col gap-[6px]">
      <div ref={ref} className="h-[36px] w-full rounded-[var(--radius-sm)] border" style={{ background: `var(${name})`, borderColor: "var(--glass-border)" }} />
      <code className="text-[10.5px] leading-[13px] break-all" style={MONO}>
        {name}
      </code>
      <span className="text-[10px] leading-[12px]" style={{ ...MONO, ...CAPTION }}>
        {resolved || "…"}
      </span>
    </div>
  );
}

function SwatchGrid({ names, min = 118 }: { names: string[]; min?: number }) {
  return (
    <div className="grid gap-[var(--space-3)]" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, ${min}px), 1fr))` }}>
      {names.map((n) => (
        <TokenSwatch key={n} name={n} />
      ))}
    </div>
  );
}

const SEMANTIC_TOKENS = ["--background", "--foreground", "--card", "--muted", "--muted-foreground", "--border", "--primary", "--accent", "--accent-subtle", "--secondary", "--destructive"];
const FEEDBACK_TOKENS = ["--color-feedback-danger", "--color-feedback-success", "--color-feedback-success-dark-surface"];
const WORLD_TOKENS = [
  "--world-arts-media-sport",
  "--world-building-construction",
  "--world-business-money-office",
  "--world-driving-flying-shipping",
  "--world-factories-making-things",
  "--world-farming-animals-nature",
  "--world-fixing-machines-engines",
  "--world-food-farming-nature",
  "--world-health-medicine",
  "--world-helping-human-services",
  "--world-law-safety-government",
  "--world-personal-care-community-services",
  "--world-science-research",
  "--world-teaching-learning",
  "--world-tech-engineering-design",
];
const GLASS_TOKENS = ["--glass-surface-1", "--glass-surface-2", "--glass-surface-3", "--glass-border"];

/** One font family token: a sample line set in it, plus its resolved stack. */
function FontLine({ name, sample }: { name: string; sample: string }) {
  const [ref, resolved] = useResolvedStyleProp<HTMLSpanElement>("fontFamily");
  return (
    <div className="flex flex-col gap-[4px]">
      <span ref={ref} className="text-[17px] font-bold" style={{ fontFamily: `var(${name})` }}>
        {sample}
      </span>
      <code className="text-[10.5px]" style={MONO}>
        {name}
      </code>
      <span className="text-[10px] break-all" style={{ ...MONO, ...CAPTION }}>
        {resolved || "…"}
      </span>
    </div>
  );
}

/** One level of the type hierarchy: a real sample rendered in the app's own
 *  class for that level, captioned with its resolved size/weight/family. */
function TypeSample({ tier, className, style, children }: { tier: string; className: string; style?: CSSProperties; children: ReactNode }) {
  const [ref, info] = useResolvedTypography();
  return (
    <div className="flex flex-col gap-[6px]">
      <span ref={ref} className={className} style={style}>
        {children}
      </span>
      <code className="text-[11px] leading-[15px]" style={{ ...MONO, ...CAPTION }}>
        {tier} · {info.size} · {info.weight} · {info.family.split(",")[0]}
      </code>
    </div>
  );
}

function SpaceBar({ name }: { name: string }) {
  const [ref, resolved] = useResolvedStyleProp<HTMLDivElement>("width");
  return (
    <div className="flex items-center gap-[10px]">
      <code className="w-[84px] shrink-0 text-[11px]" style={MONO}>
        {name}
      </code>
      <div ref={ref} className="h-[14px] rounded-[3px]" style={{ width: `var(${name})`, background: "var(--primary)" }} />
      <span className="shrink-0 text-[10.5px]" style={{ ...MONO, ...CAPTION }}>
        {resolved}
      </span>
    </div>
  );
}

const SPACE_TOKENS = ["--space-1", "--space-2", "--space-3", "--space-4", "--space-5", "--space-6", "--space-8", "--space-10", "--space-12", "--space-13", "--space-14"];

function RadiusBox({ name }: { name: string }) {
  const [ref, resolved] = useResolvedStyleProp<HTMLDivElement>("borderRadius");
  return (
    <div className="flex flex-col items-center gap-[6px]">
      <div ref={ref} className="size-[48px] border" style={{ borderRadius: `var(${name})`, borderColor: "var(--border)", background: "var(--card)" }} />
      <code className="text-[10px]" style={MONO}>
        {name}
      </code>
      <span className="text-[10px]" style={{ ...MONO, ...CAPTION }}>
        {resolved}
      </span>
    </div>
  );
}

const RADIUS_TOKENS = ["--radius-xs", "--radius-sm-alt", "--radius-sm", "--radius-md", "--radius-md-alt", "--radius-lg", "--radius-xl", "--radius-2xl", "--radius-full"];

/** One `dm-glass*` elevation, backdrop-blurred over a colourful field so the
 *  frost actually has something behind it to diffuse (see app.css's own note
 *  that a glass surface over flat page colour just looks like a tint). */
function GlassCard({ cls, blur }: { cls: string; blur: string }) {
  const surfaceVar = `--glass-surface-${cls.endsWith("-2") ? "2" : cls.endsWith("-3") ? "3" : "1"}`;
  return (
    <div className="relative h-[100px] overflow-hidden rounded-[var(--radius-lg)]">
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, var(--world-arts-media-sport), var(--world-tech-engineering-design), var(--world-business-money-office))" }} />
      <div className={`${cls} ${blur} absolute inset-[10px] flex items-center justify-center rounded-[var(--radius-md)] border`} style={{ background: `var(${surfaceVar})`, borderColor: "var(--glass-border)" }}>
        <div className="flex flex-col items-center gap-[2px]">
          <code className="text-[11px] font-bold" style={MONO}>
            .{cls}
          </code>
          <code className="text-[10px]" style={{ ...MONO, ...CAPTION }}>
            {surfaceVar}
          </code>
        </div>
      </div>
    </div>
  );
}

/** A one-shot CSS animation, replayed by remounting via `key`. */
function Replayable({ children }: { children: (nonce: number) => ReactNode }) {
  const [nonce, setNonce] = useState(0);
  return (
    <div className="flex flex-col items-center gap-[10px]">
      {children(nonce)}
      <button
        type="button"
        onClick={() => setNonce((n) => n + 1)}
        className="dm-quiet cursor-pointer rounded-full border px-[10px] py-[3px] text-[10.5px] font-bold"
        style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-2)" }}
      >
        Replay
      </button>
    </div>
  );
}

/** One `dm-*` utility: a live sample plus its class name in MONO. */
function UtilityCell({ label, cls, note, children }: { label: string; cls: string; note?: string; children: ReactNode }) {
  return (
    <StateCell label={label} kind="built" note={note}>
      <div className="flex flex-col items-center justify-center gap-[8px]">
        {children}
        <code className="text-[10.5px]" style={MONO}>
          .{cls}
        </code>
      </div>
    </StateCell>
  );
}

const LINE_ICONS: { name: string; Icon: ComponentType<{ className?: string }> }[] = [
  { name: "BookIcon", Icon: BookIcon },
  { name: "GraduationCapIcon", Icon: GraduationCapIcon },
  { name: "BriefcaseIcon", Icon: BriefcaseIcon },
  { name: "DownloadIcon", Icon: DownloadIcon },
  { name: "ShareIcon", Icon: ShareIcon },
  { name: "ChevronLeftIcon", Icon: ChevronLeftIcon },
  { name: "ChevronDownIcon", Icon: ChevronDownIcon },
  { name: "ChevronRightIcon", Icon: ChevronRightIcon },
  { name: "TargetIcon", Icon: TargetIcon },
  { name: "PiggyBankIcon", Icon: PiggyBankIcon },
  { name: "ScaleIcon", Icon: ScaleIcon },
  { name: "HandIcon", Icon: HandIcon },
  { name: "HomeIcon", Icon: HomeIcon },
  { name: "MapIcon", Icon: MapIcon },
  { name: "CompassIcon", Icon: CompassIcon },
  { name: "GlobeIcon", Icon: GlobeIcon },
  { name: "CheckIcon", Icon: CheckIcon },
  { name: "HeartIcon", Icon: HeartIcon },
  { name: "XIcon", Icon: XIcon },
  { name: "LightbulbIcon", Icon: LightbulbIcon },
  { name: "StarIcon", Icon: StarIcon },
  { name: "ArrowLeftRightIcon", Icon: ArrowLeftRightIcon },
  { name: "SunIcon", Icon: SunIcon },
  { name: "MoonIcon", Icon: MoonIcon },
];

export function FoundationsSection() {
  return (
    <Section id="foundations" title="Foundations" intro="The tokens and shared CSS utilities everything else in this lab (and the app) is built from. Toggle light and dark with the header switch above; every swatch below reads its live, resolved value and updates in place.">
      <div className="flex flex-col gap-[var(--space-3)]">
        <SubHead>Colour tokens</SubHead>
        <p className="max-w-[68ch] text-[13px] leading-[19px]" style={CAPTION}>
          Semantic tokens set background, text, card and border colours app-wide; feedback tokens colour success/danger states; the 15 world tokens colour each career category consistently across Explore, Career and Match.
        </p>
        <p className="text-[12px] font-bold tracking-[0.04em] uppercase" style={CAPTION}>
          Semantic
        </p>
        <SwatchGrid names={SEMANTIC_TOKENS} />
        <p className="mt-[var(--space-2)] text-[12px] font-bold tracking-[0.04em] uppercase" style={CAPTION}>
          Feedback
        </p>
        <SwatchGrid names={FEEDBACK_TOKENS} />
        <p className="mt-[var(--space-2)] text-[12px] font-bold tracking-[0.04em] uppercase" style={CAPTION}>
          Career worlds
        </p>
        <SwatchGrid names={WORLD_TOKENS} />
      </div>

      <div className="flex flex-col gap-[var(--space-3)]">
        <SubHead>Type scale and fonts</SubHead>
        <p className="max-w-[68ch] text-[13px] leading-[19px]" style={CAPTION}>
          Two font families and a strict top-down hierarchy: a page heading is always the biggest thing on the page, a section heading is next, then a subhead, then body copy. Nothing is sized by how important it feels.
        </p>
        <div className="grid gap-[var(--space-4)] sm:grid-cols-2">
          <FontLine name="--font-display" sample="Bricolage Grotesque" />
          <FontLine name="--font-body" sample="Inter, the app's body face" />
        </div>
        <div className="mt-[var(--space-2)] flex flex-col gap-[var(--space-4)]">
          <TypeSample tier="Heading (page title)" className={PAGE_TITLE_CLASS} style={PAGE_TITLE_STYLE}>
            Explore Careers
          </TypeSample>
          <TypeSample tier="Subheading (section)" className="text-[26px] leading-[1.1] font-extrabold sm:text-[30px]" style={{ fontFamily: "var(--font-display)" }}>
            Foundations
          </TypeSample>
          <TypeSample tier="Subheading (group)" className="text-[18px] leading-[24px] font-bold" style={{ fontFamily: "var(--font-display)" }}>
            Colour tokens
          </TypeSample>
          <TypeSample tier="Body" className="text-[13.5px] leading-[20px]">
            The app&apos;s base button, used for any in-app action that isn&apos;t a marketing CTA.
          </TypeSample>
        </div>
      </div>

      <div className="flex flex-col gap-[var(--space-3)]">
        <SubHead>Spacing and radii</SubHead>
        <p className="max-w-[68ch] text-[13px] leading-[19px]" style={CAPTION}>
          The spacing scale (bars sized to each token, in px) and the radius scale (boxes) that gaps, padding and rounded corners are built from everywhere else in the lab.
        </p>
        <div className="flex flex-col gap-[6px]">
          {SPACE_TOKENS.map((n) => (
            <SpaceBar key={n} name={n} />
          ))}
        </div>
        <div className="mt-[var(--space-2)] grid gap-[var(--space-3)]" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 80px), 1fr))" }}>
          {RADIUS_TOKENS.map((n) => (
            <RadiusBox key={n} name={n} />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-[var(--space-3)]">
        <SubHead>Glass surfaces</SubHead>
        <p className="max-w-[68ch] text-[13px] leading-[19px]" style={CAPTION}>
          Frosted elevation for stacked cards. The tint comes from a `--glass-surface-N` token; the actual frost comes from pairing the `dm-glass*` class with Tailwind&apos;s own backdrop-blur/backdrop-saturate utilities (a plain hand-written `backdrop-filter` gets stripped by the CSS pipeline). The extra inset highlight only shows in light mode; dark mode keeps its pre-existing look.
        </p>
        <SwatchGrid names={GLASS_TOKENS} />
        <div className="mt-[var(--space-2)] grid gap-[var(--space-3)] sm:grid-cols-3">
          <GlassCard cls="dm-glass" blur="backdrop-blur-[20px] backdrop-saturate-[1.5]" />
          <GlassCard cls="dm-glass-2" blur="backdrop-blur-[24px] backdrop-saturate-[1.65]" />
          <GlassCard cls="dm-glass-3" blur="backdrop-blur-[30px] backdrop-saturate-[1.8]" />
        </div>
      </div>

      <div className="flex flex-col gap-[var(--space-3)]">
        <SubHead>Motion and nudge utilities</SubHead>
        <p className="max-w-[68ch] text-[13px] leading-[19px]" style={CAPTION}>
          The shared `dm-*` classes (src/components/app/app.css) every interactive surface and first-view discovery nudge is built from. One-shot animations carry a Replay button; the rest loop or react to hover/focus/tap.
        </p>
        <StateGrid min={180}>
          <UtilityCell label="Solid button" cls="dm-solid">
            <button type="button" onClick={noop} className="dm-solid cursor-pointer rounded-full px-[16px] py-[8px] text-[13px] font-bold" style={{ background: "var(--primary)", color: "#fff" }}>
              Save
            </button>
          </UtilityCell>
          <UtilityCell label="Quiet chip" cls="dm-quiet">
            <button type="button" onClick={noop} className="dm-quiet cursor-pointer rounded-full border px-[12px] py-[6px] text-[12.5px] font-bold" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
              Filters
            </button>
          </UtilityCell>
          <UtilityCell label="Text link" cls="dm-link">
            <button type="button" onClick={noop} className="dm-link cursor-pointer text-[13px] font-semibold" style={{ color: "var(--primary)" }}>
              See all careers
            </button>
          </UtilityCell>
          <UtilityCell label="Nested chip" cls="dm-chip-hover">
            <button type="button" onClick={noop} className="dm-chip-hover cursor-pointer text-[13px] font-semibold" style={{ color: "var(--accent-subtle)" }}>
              Choose 2 more
            </button>
          </UtilityCell>
          <UtilityCell label="Tappable card" cls="dm-tap" note="Hover or Tab to it to see the lift.">
            <div tabIndex={0} className="dm-tap cursor-pointer rounded-[var(--radius-md)] border p-[var(--space-3)] text-center text-[13px] font-semibold" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
              Career card
            </div>
          </UtilityCell>
          <UtilityCell label="Search input" cls="dm-beam-input" note="The HoverBeam ring is the focus indicator; the input suppresses its own outline.">
            <HoverBeam active className="block">
              <div className="flex items-center rounded-full border px-[12px] py-[8px]" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-2)" }}>
                <input readOnly value="Software engineer" className="dm-beam-input min-w-0 flex-1 bg-transparent text-[13px] leading-[18px] outline-none" />
              </div>
            </HoverBeam>
          </UtilityCell>
          <UtilityCell label="Shimmering mark" cls="dm-logo-shimmer" note="Simplified stand-in for Connect's letter-mark lockup.">
            <span
              className="dm-logo-shimmer text-[24px] font-extrabold"
              style={{ backgroundImage: "linear-gradient(90deg, var(--primary), var(--accent-subtle), var(--primary))", backgroundClip: "text", WebkitTextFillColor: "transparent" }}
            >
              DM
            </span>
          </UtilityCell>
          <UtilityCell label="Title shimmer" cls="dm-title-shimmer" note="Decorative, one-shot on mount. Not a loading state.">
            <Replayable>
              {(n) => (
                <h4 key={n} className="dm-title-shimmer text-[17px] font-extrabold" style={{ "--shimmer-tint": "var(--primary)", fontFamily: "var(--font-display)" } as CSSProperties}>
                  Connect
                </h4>
              )}
            </Replayable>
          </UtilityCell>
          <UtilityCell label="Sweeping label" cls="dm-text-nudge">
            <span className="dm-text-nudge text-[13.5px] font-bold">For you</span>
          </UtilityCell>
          <UtilityCell label="Twinkle spark" cls="dm-nudge-spark">
            <span className="relative inline-block h-[24px] w-[24px]">
              <svg aria-hidden viewBox="0 0 12 12" className="dm-nudge-spark absolute top-[7px] left-[7px] h-[10px] w-[10px]">
                <path d="M6 0c.5 3.2 2.3 5 6 6-3.7 1-5.5 2.8-6 6-.5-3.2-2.3-5-6-6 3.7-1 5.5-2.8 6-6Z" fill="var(--foreground)" />
              </svg>
            </span>
          </UtilityCell>
          <UtilityCell label="Chip glow" cls="dm-nudge-glow">
            <Replayable>
              {(n) => (
                <span key={n} className="dm-nudge-glow rounded-full border px-[12px] py-[6px] text-[12.5px] font-bold" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-2)" }}>
                  Edit
                </span>
              )}
            </Replayable>
          </UtilityCell>
          <UtilityCell label="Tab discovery pulse" cls="dm-tab-nudge">
            <Replayable>{(n) => <span key={n} className="dm-tab-nudge text-[14px] font-bold uppercase">For You</span>}</Replayable>
          </UtilityCell>
          <UtilityCell label="Swipe tease" cls="dm-swipe-nudge">
            <Replayable>
              {(n) => (
                <div key={n} className="dm-swipe-nudge rounded-[var(--radius-md)] border px-[16px] py-[8px] text-center text-[13px] font-semibold" style={{ borderColor: "var(--border)" }}>
                  Swipe card
                </div>
              )}
            </Replayable>
          </UtilityCell>
          <UtilityCell label="Progress track" cls="dm-progress-fill">
            <Replayable>
              {(n) => (
                <span className="block h-[4px] w-[130px] overflow-hidden rounded-full" style={{ background: "var(--glass-surface-2)" }}>
                  <span key={n} className="dm-progress-fill block h-full rounded-full" style={{ background: "var(--primary)", animationDuration: "1600ms" }} />
                </span>
              )}
            </Replayable>
          </UtilityCell>
          <UtilityCell label="Staggered reveal" cls="seq-reveal">
            <Replayable>
              {(n) => (
                <div key={n} className="seq-reveal flex gap-[6px]">
                  {["A", "B", "C", "D"].map((l) => (
                    <span key={l} className="rounded-full border px-[9px] py-[4px] text-[11px] font-bold" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-2)" }}>
                      {l}
                    </span>
                  ))}
                </div>
              )}
            </Replayable>
          </UtilityCell>
        </StateGrid>
      </div>

      <div className="flex flex-col gap-[var(--space-6)]">
        <SubHead>Motion and decor components</SubHead>

        <Specimen name="HoverBeam" file="src/components/app/HoverBeam.tsx" purpose="Site-wide card hover treatment: a colourful border beam while a card is hovered or keyboard-focused." when="Any card-like surface that should read as hoverable app-wide (the default hover treatment for card surfaces).">
          <StateGrid min={180}>
            <StateCell label="Hover / focus" note="Hover or Tab to it to see the beam.">
              <HoverBeam className="block">
                <div className="rounded-[var(--radius-md)] border p-[var(--space-4)] text-center text-[13px] font-semibold" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
                  Career card
                </div>
              </HoverBeam>
            </StateCell>
            <StateCell label="Forced active" kind="built" note="Reduced motion (fixed 27 Sept 2026): HoverBeam now checks useReducedMotion (framer-motion) itself and swaps the spinning border-beam ring for a static drop-shadow glow, same active/hover/focus state, no rotation.">
              <HoverBeam active className="block">
                <div className="rounded-[var(--radius-md)] border p-[var(--space-4)] text-center text-[13px] font-semibold" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
                  Career card
                </div>
              </HoverBeam>
            </StateCell>
          </StateGrid>
        </Specimen>

        <Specimen name="ConfirmShimmer" file="src/components/flow/ConfirmShimmer.tsx" purpose="A one-shot white sweep across a row, confirming a pick was saved." when="Right after a selection is confirmed (Build's option rows).">
          <StateGrid min={180}>
            <StateCell label="Sweep" note="Reduced motion: the sweep is motion-safe:animate-[...], so it simply doesn't run under prefers-reduced-motion, no fallback needed for a one-shot decorative confirm.">
              <Replayable>
                {(n) => (
                  <div className="relative overflow-hidden rounded-[var(--radius-md)] border p-[var(--space-3)] text-center text-[13px] font-semibold" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
                    Saved
                    <ConfirmShimmer key={n} active />
                  </div>
                )}
              </Replayable>
            </StateCell>
          </StateGrid>
        </Specimen>

        <Specimen name="PlayBurst" file="src/components/play/PlayBurst.tsx" purpose="A particle burst behind a correct answer or unlock moment in Play." when="A rewarding in-game moment, nonce bumped on each occurrence.">
          <StateGrid min={180}>
            <StateCell label="Burst" note="Click Replay to fire it. Reduced motion: both animations are motion-safe:, so the burst is silently skipped rather than replaced with a static flash." minH={140}>
              <Replayable>
                {(n) => (
                  <div className="relative h-[110px] w-full overflow-hidden rounded-[var(--radius-md)] border" style={{ borderColor: "var(--border)", background: "#070914" }}>
                    <PlayBurst nonce={n} accent="#ffb81f" />
                  </div>
                )}
              </Replayable>
            </StateCell>
          </StateGrid>
        </Specimen>

        <Specimen name="Confetti" file="src/components/flow/aurora/Confetti.tsx" purpose="Canvas confetti behind a big milestone (Build/Match finales)." when="A finale or milestone screen, sparingly.">
          <StateGrid min={180}>
            <StateCell label="Active" minH={200} note="Colours are literal hex, copied from --primary/--accent-subtle/--color-feedback-success: this component's prop type only takes hex strings, not var(). Reduced motion: checks matchMedia('(prefers-reduced-motion: reduce)') itself and skips the canvas loop entirely, same real guard as AuroraBackground and Vortex below.">
              <Reveal label="Play" height={200}>
                <div className="relative h-full w-full" style={{ background: "var(--background)" }}>
                  <Confetti active colors={["#2f6bf2", "#3894ff", "#33c78c"]} />
                </div>
              </Reveal>
            </StateCell>
          </StateGrid>
        </Specimen>

        <Specimen name="GestureHint" file="src/components/flow/GestureHint.tsx" purpose="A small animated touch point that teaches a swipe or scroll direction by showing it, not describing it in a sentence." when="The first time a screen depends on a gesture the student might not try on their own.">
          <StateGrid min={140}>
            {/* GestureHint has no surface of its own -- it's always laid over
               a real card/photo in the app. A bare card-like block behind it
               here (added 27 Sept 2026: the cell read as empty without one)
               isn't inventing new markup, just giving the touch point
               something to sit on so it's visible. */}
            <StateCell label="Left">
              <div className="relative flex h-[100px] w-full items-center justify-center rounded-[var(--radius-md)] border" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
                <GestureHint direction="left" />
              </div>
            </StateCell>
            <StateCell label="Right">
              <div className="relative flex h-[100px] w-full items-center justify-center rounded-[var(--radius-md)] border" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
                <GestureHint direction="right" />
              </div>
            </StateCell>
            <StateCell label="Up (scroll)" note="Reduced motion: every direction's loop is motion-safe:, so the hint holds its resting position instead of looping, a static hint still points the right way, it just doesn't move.">
              <div className="relative flex h-[100px] w-full items-center justify-center rounded-[var(--radius-md)] border" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
                <GestureHint direction="up" />
              </div>
            </StateCell>
          </StateGrid>
        </Specimen>

        <Specimen name="Streak and score icons" file="src/components/app/ScoreIcons.tsx" purpose="Illustrated gradient marks for the streak and Dream Score chips, instead of flat single-colour icons." when="Anywhere a streak count or Dream Score value is shown.">
          <StateGrid min={120}>
            <StateCell label="StreakFlame">
              <StreakFlame size={30} />
            </StateCell>
            <StateCell label="ScoreBolt">
              <ScoreBolt size={30} />
            </StateCell>
          </StateGrid>
        </Specimen>

        <Specimen name="Line icons" file="src/components/flow/icons.tsx" purpose="24 shared line icons used across Build, Match and Career instead of Lucide, for one consistent stroke weight." when="Build/Match flow screens and career category marks.">
          <div className="grid grid-cols-4 gap-[var(--space-3)] sm:grid-cols-6">
            {LINE_ICONS.map(({ name, Icon }) => (
              <div key={name} className="flex flex-col items-center gap-[6px] rounded-[var(--radius-md)] border p-[var(--space-2)]" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
                <Icon className="h-[20px] w-[20px]" />
                <code className="text-center text-[9.5px] leading-[11px] break-all" style={MONO}>
                  {name}
                </code>
              </div>
            ))}
          </div>
        </Specimen>

        <Specimen
          name="Full-screen backgrounds and canvases"
          file="src/components/app/AppBackdrop.tsx, src/components/play/PlayBackdrop.tsx, src/components/ui/{stars,fireworks,vortex}.tsx, src/components/flow/aurora/{AuroraBackground,BackgroundSpace}.tsx"
          purpose="Fixed and/or CPU-heavy backdrops behind app chrome, Play and the Build/Match flow."
          when="One per surface: AppBackdrop behind every standard tab, PlayBackdrop behind gameplay, Aurora/BackgroundSpace behind Build and Match. Each mounts only on click, one at a time."
        >
          <StateGrid min={220}>
            <StateCell label="AppBackdrop" minH={200} note="Reduced motion: N/A. Purely static gradients plus one static SVG image, nothing here animates.">
              <Reveal label="Play" height={200}>
                <AppBackdrop />
              </Reveal>
            </StateCell>
            <StateCell label="PlayBackdrop" minH={200} note="Reduced motion: its one animation, the entrance bloom, is motion-safe: (the rest of the surface is static gradients).">
              <Reveal label="Play" height={200}>
                <PlayBackdrop />
              </Reveal>
            </StateCell>
            <StateCell label="StarsBackground" kind="built" minH={200} note="Reduced motion (fixed 27 Sept 2026): checks useReducedMotion and freezes each star layer's scroll loop on one still frame instead of animating y: [0, -2000] continuously.">
              <Reveal label="Play" height={200}>
                <StarsBackground starColor="#ffffff" />
              </Reveal>
            </StateCell>
            <StateCell label="FireworksBackground" kind="built" minH={200} note="Reduced motion (fixed 27 Sept 2026): checks useReducedMotion and draws one static burst instead of the continuous requestAnimationFrame launch loop, the same still-frame pattern as Vortex.">
              <Reveal label="Play" height={200}>
                <FireworksBackground population={0.6} />
              </Reveal>
            </StateCell>
            <StateCell label="Vortex" minH={200} note="Reduced motion: built correctly. Checks prefers-reduced-motion and, when set, renders one still canvas frame in the field's own colours and density instead of looping requestAnimationFrame, the pattern the other canvases above should follow.">
              <Reveal label="Play" height={200}>
                <Vortex containerClassName="h-full w-full" particleCount={250} />
              </Reveal>
            </StateCell>
            <StateCell label="AuroraBackground + BackgroundSpace" minH={200} note="Needs ThemeProvider; re-syncs <html>'s theme class from its own localStorage key on mount, which can momentarily override the lab's own unpersisted toggle while this is open. Reduced motion: AuroraBackground checks matchMedia itself (built); BackgroundSpace underneath it is static gradients, N/A.">
              <Reveal label="Play" height={200}>
                <ThemeProvider>
                  <BackgroundSpace />
                  <AuroraBackground accent="#2f6bf2" visitedAccents={["#2f6bf2", "#33c78c"]} />
                </ThemeProvider>
              </Reveal>
            </StateCell>
          </StateGrid>
        </Specimen>
      </div>
    </Section>
  );
}
