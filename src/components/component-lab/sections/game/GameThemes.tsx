"use client";

// DEMO-ONLY: Component Lab, Game UI part. The Glossary Game's three
// alternate background versions (CRT, Dots, Synthwave) -- each is a
// `.play-crt`/`.play-dots`/`.play-synth` token-override scope (globals.css)
// plus its own animated PlayBackdrop, applied to a small real sample (a
// question + an option) so the reskin is visible without mounting the
// whole game screen.

import { PlayBackdropV2Crt } from "@/components/play/PlayBackdropV2Crt";
import { PlayBackdropV3Dots } from "@/components/play/PlayBackdropV3Dots";
import { PlayBackdropV4Synthwave } from "@/components/play/PlayBackdropV4Synthwave";
import { OptionButton, Question } from "@/components/play/interactions";
import { ClippedStage, noop, Reveal, Specimen, StateCell, StateGrid } from "../../kit";

function ThemeSample({ scopeClass, children }: { scopeClass: string; children: React.ReactNode }) {
  return (
    <div className={`marketing-v2 themeable relative flex h-full w-full flex-col items-stretch justify-center gap-[10px] p-[16px] ${scopeClass}`} style={{ background: "#070914" }} data-game-hud>
      {children}
      <div className="relative z-[1] flex flex-col gap-[10px]" data-game-header>
        <Question>What does EOD mean?</Question>
        <OptionButton index={0} label="End of day" tier="best" picked onClick={noop} />
        <OptionButton index={1} label="Estimate of debt" onClick={noop} />
      </div>
    </div>
  );
}

export function GameThemesGroup() {
  return (
    <Specimen
      name="Game background versions"
      file="src/app/globals.css (.play-crt / .play-dots / .play-synth), src/components/play/PlayBackdropV2Crt.tsx, PlayBackdropV3Dots.tsx, PlayBackdropV4Synthwave.tsx"
      purpose="Three experimental full reskins of the Glossary Game: a terminal/VHS look, a quiet minimal dot field, and a neon synthwave scene. Each scopes token overrides (font, radius, glass) under one class, plus its own animated canvas backdrop."
      when="Behind the Glossary Game's version chip (PlayVersionChip), one experiment at a time. CPU/GPU animated, so each sits behind its own Play reveal."
    >
      <StateGrid min={280}>
        <StateCell label="v2 · CRT" note="Pixel font + magenta/cyan glitch scope. The backdrop injects a Google Font link on mount (real app behavior)." minH={220}>
          <Reveal label="Play" height={220}>
            <ClippedStage height={220}>
              <ThemeSample scopeClass="play-crt">
                <PlayBackdropV2Crt />
              </ThemeSample>
            </ClippedStage>
          </Reveal>
        </StateCell>
        <StateCell label="v3 · Dots" note="Loads the real Vanta.js DOTS library from a CDN on mount (real app behavior, same as production)." minH={220}>
          <Reveal label="Play" height={220}>
            <ClippedStage height={220}>
              <ThemeSample scopeClass="play-dots">
                <PlayBackdropV3Dots />
              </ThemeSample>
            </ClippedStage>
          </Reveal>
        </StateCell>
        <StateCell label="v4 · Synthwave" note="Violet glass, hot-pink neon rims, amber highlights." minH={220}>
          <Reveal label="Play" height={220}>
            <ClippedStage height={220}>
              <ThemeSample scopeClass="play-synth">
                <PlayBackdropV4Synthwave />
              </ThemeSample>
            </ClippedStage>
          </Reveal>
        </StateCell>
      </StateGrid>
    </Specimen>
  );
}
