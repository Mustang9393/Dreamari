"use client";

// DEMO-ONLY: Component Lab, Game UI part. The Glossary Game's Levels map
// (its own button + fixed, Portal-rendered modal) in all four background
// skins, using the real Investment Banking level data.

import { glossaryFor } from "@/components/glossary/data";
import { LevelsMenu } from "@/components/glossary/LevelsMenu";
import type { PlayBgVersion } from "@/components/play/PlayVersionChip";
import { ClippedStage, ProposedEmpty, ProposedError, ProposedLoading, Specimen, StateCell, StateGrid } from "../../kit";

const CAREER = glossaryFor("investment-banking");

const SKINS: { version: PlayBgVersion; label: string }[] = [
  { version: "v1", label: "v1 · board path" },
  { version: "v2", label: "v2 · CRT tiles" },
  { version: "v3", label: "v3 · dots constellation" },
  { version: "v4", label: "v4 · synthwave episodes" },
];

export function GlossaryLevelsGroup() {
  if (!CAREER) return null;
  return (
    <Specimen
      name="LevelsMenu"
      file="src/components/glossary/LevelsMenu.tsx"
      purpose="The Levels button and its full-path map: every level's name and company-value unlock, chapters grouped Beginner/Intermediate/Advanced, one layout per background skin."
      when="Inside the Glossary Game header, next to the sound controls. Full loading/error/empty for the map surface is States gallery #55."
    >
      <StateGrid min={320}>
        {SKINS.map((skin) => (
          <StateCell key={skin.version} label={skin.label} note="Click the icon to open the full-screen map (Portal-rendered, escapes this frame, expected, same as any modal here). Currently level 1 of 17; the rest are locked roadmap entries." minH={90}>
            <ClippedStage height={90}>
              <LevelsMenu career={CAREER} currentLesson={1} accent="var(--world-business-money-office)" bgVersion={skin.version} />
            </ClippedStage>
          </StateCell>
        ))}
        <StateCell label="All locked (currentLesson=9999)" note="Real prop-driven: currentLesson past the last level means nothing matches 'current', so every level not already completed in the real progress store reads locked. Click the icon to open." minH={90}>
          <ClippedStage height={90}>
            <LevelsMenu career={CAREER} currentLesson={9999} accent="var(--world-business-money-office)" bgVersion="v1" />
          </ClippedStage>
        </StateCell>
        <StateCell label="All done" kind="proposed" note="Every level's 'done' status comes only from the real progress store (glossaryProgress), which this lab never writes to, so this can't be forced through props without faking storage.">
          <ProposedEmpty tier={6} line="Every level complete: not forceable from props, see note." />
        </StateCell>
        <StateCell label="Empty (0 levels)" kind="proposed" note="Inventory: the real component renders nothing at all with an empty level list, no button, no map. Proposed default instead of silently disappearing.">
          <ProposedEmpty tier={1} heading="No levels yet" line="This career's path hasn't been authored yet." />
        </StateCell>
        <StateCell label="Loading" kind="proposed" note="Level data ships bundled today (synchronous), so this never happens in practice, proposed for when levels load from a server.">
          <ProposedLoading label="Loading levels" shape="list" />
        </StateCell>
        <StateCell label="Error" kind="proposed" note="No error path exists for a malformed or missing level list.">
          <ProposedError verb="load these levels" />
        </StateCell>
      </StateGrid>
    </Specimen>
  );
}
