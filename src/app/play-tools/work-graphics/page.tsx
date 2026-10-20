import { WorkGraphicQA } from "@/components/play/WorkGraphicQA";
import { UX_LEVEL_1 } from "@/components/play/ux-level-1";
import { FOOD_SCIENTIST_LEVEL_1 } from "@/components/play/food-scientist-level-1";
import { FS_ARTIFACTS } from "@/components/play/food-scientist-artifacts";
import { UX_ARTIFACTS } from "@/components/play/ux-work-artifacts";
import { artifactProblems, type WorkArtifact } from "@/components/play/work-artifacts";
import crossCareer from "../../../../docs/handoff/career-scaling/examples/work-graphic-fixtures.json";
import "@/components/marketing/tokens.css";
import "@/components/app/app.css";
export default async function WorkGraphicsPage({ searchParams }: { searchParams: Promise<{ score?: string; career?:string }> }) {
  const query = await searchParams;
  const milestone = query.career === "food-scientist" ? FOOD_SCIENTIST_LEVEL_1.beats.find(b=>b.id === "FS1-MID") : UX_LEVEL_1.beats.find(b => b.id === "UX1-MID");
  if (!milestone || milestone.kind !== "card") throw new Error("Missing review fixture");
  const fixtures = [...Object.values(query.career === "food-scientist" ? FS_ARTIFACTS : UX_ARTIFACTS), ...crossCareer.fixtures as WorkArtifact[]];
  for (const fixture of fixtures) if (artifactProblems(fixture).length) throw new Error("Invalid graphic fixture: " + fixture.id);
  return <main className="marketing-v2 themeable min-h-screen"><WorkGraphicQA key={query.score} fixtures={fixtures} milestone={milestone} score={query.score === "75" ? 75 : 50} /></main>;
}
