"use client";

// The app's one door to border-beam. Identical to the library's BorderBeam,
// except under the v2 look (DEMO-ONLY, src/app/look-v2.css): "colorful" is a
// rainbow (violet, pink, orange) sweeping card edges, the many-hue glow the
// black-and-blue direction removes. There it becomes "mono", a white light
// along the edge, so the hover effect stays and components stay monochrome;
// blue lives in the atmosphere only (19 Oct 2026). "ocean" was not an option:
// a third of its stops are violet.
import { BorderBeam as LibraryBeam } from "border-beam";
import type { ComponentProps } from "react";
import { useLookV2 } from "./look";

export function BorderBeam(props: ComponentProps<typeof LibraryBeam>) {
  const lookV2 = useLookV2();
  const colorVariant = lookV2 && (props.colorVariant ?? "colorful") === "colorful" ? "mono" : props.colorVariant;
  return <LibraryBeam {...props} colorVariant={colorVariant} />;
}
