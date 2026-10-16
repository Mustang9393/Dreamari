import Link from "next/link";
import { GLOSSARY_HUB_RELEASED, glossaryIndustries } from "@/components/glossary/data";
import { worldSystem } from "@/components/glossary/industries";

// DEMO-ONLY QA index (16 Oct 2026). One row per industry glossary, one
// column per playable level, each cell linking to the level in Drift and
// Signal, plus the jumps the SOP review uses (the first question of each
// level and the Power Play). Reads the registry, so a new blueprint shows
// up here the moment it is registered.

const MODE_LABEL = { continuous_story: "Continuous story", scenario_thread: "Scenario thread", practice_world: "Practice world" } as const;

export function GlossaryQa() {
  const industries = glossaryIndustries();
  return (
    <main className="mx-auto w-full max-w-[1100px] px-5 py-10 text-[var(--foreground)]">
      <p className="text-[11px] font-extrabold uppercase tracking-[.14em] text-[var(--muted-foreground)]">Play tools</p>
      <h1 className="mt-1 text-[28px] font-extrabold leading-tight" style={{ fontFamily: "var(--font-display)" }}>Glossary QA</h1>
      <p className="mt-2 max-w-[70ch] text-[14px] leading-relaxed text-[var(--muted-foreground)]">
        Every glossary game and every playable level, in both themes. Finance is Joshua&apos;s and hand-authored; the rest are generated from blueprints by the Master Scaling Plan recipes (Level 1 recognize, 2 apply, 3 analyze, 4 decide). Only released industries ({GLOSSARY_HUB_RELEASED.join(", ")}) appear on the Play hub; the others play from here. The top bar&apos;s Skip steps through a level with every answer right.
      </p>

      <div className="mt-8 flex flex-col gap-6">
        {industries.map((g) => {
          const system = worldSystem(g.world);
          const released = GLOSSARY_HUB_RELEASED.includes(g.industrySlug);
          return (
            <section key={g.industrySlug} className="rounded-[var(--radius-lg)] border p-5" style={{ borderColor: "var(--glass-border)", background: "var(--card)" }}>
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <div>
                  <h2 className="text-[20px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>
                    <span className="mr-2 inline-block h-3 w-3 rounded-full align-middle" style={{ background: system?.accent ?? "var(--primary)" }} aria-hidden />
                    {g.industryTitle}
                  </h2>
                  <p className="mt-1 text-[13px] text-[var(--muted-foreground)]">
                    {g.world} · {MODE_LABEL[g.mode]} · {g.lessons[0]?.exampleCompany} · {g.lessons.length} of {g.levels.length} levels playable · {released ? "on the Play hub" : "QA only, not on the hub"}
                  </p>
                </div>
                <div className="flex gap-2 text-[13px] font-bold">
                  <Link className="rounded-full border px-3 py-1" style={{ borderColor: "var(--glass-border)" }} href={`/play/glossary/${g.industrySlug}?theme=drift`}>Open in Drift</Link>
                  <Link className="rounded-full border px-3 py-1" style={{ borderColor: "var(--glass-border)" }} href={`/play/glossary/${g.industrySlug}?theme=signal`}>Open in Signal</Link>
                </div>
              </div>

              <div className="mt-4 grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))" }}>
                {g.lessons.map((lesson) => {
                  const base = `/play/glossary/${g.industrySlug}?lesson=${lesson.lessonNumber}`;
                  return (
                    <div key={lesson.id} className="rounded-[var(--radius-md)] border p-3" style={{ borderColor: "var(--glass-border)" }}>
                      <p className="text-[11px] font-extrabold uppercase tracking-[.12em] text-[var(--muted-foreground)]">Level {lesson.lessonNumber} · {lesson.difficulty}</p>
                      <p className="mt-1 text-[15px] font-extrabold">{lesson.title}</p>
                      <p className="mt-1 text-[12px] text-[var(--muted-foreground)]">{lesson.terms.map((t) => t.term).join(" · ")}</p>
                      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[12.5px] font-bold">
                        <Link href={`${base}&theme=drift`}>Drift</Link>
                        <Link href={`${base}&theme=signal`}>Signal</Link>
                        <Link className="text-[var(--muted-foreground)]" href={`${base}&theme=drift&q=1`}>Q1</Link>
                        <Link className="text-[var(--muted-foreground)]" href={`${base}&theme=drift&q=2`}>Q2</Link>
                        <Link className="text-[var(--muted-foreground)]" href={`${base}&theme=drift&pp=1`}>Power Play</Link>
                      </div>
                    </div>
                  );
                })}
                {g.levels.filter((level) => !g.lessons.some((lesson) => lesson.lessonNumber === level.number)).map((level) => (
                  <div key={level.number} className="rounded-[var(--radius-md)] border border-dashed p-3 opacity-70" style={{ borderColor: "var(--glass-border)" }}>
                    <p className="text-[11px] font-extrabold uppercase tracking-[.12em] text-[var(--muted-foreground)]">Level {level.number} · roadmap</p>
                    <p className="mt-1 text-[15px] font-extrabold">{level.title}</p>
                    <p className="mt-1 text-[12px] text-[var(--muted-foreground)]">{level.words.join(" · ")}</p>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <p className="mt-8 text-[13px] text-[var(--muted-foreground)]">
        Also: <Link className="font-bold" href="/component-lab">Component library</Link> (group &quot;Glossary game, live engine&quot;, every piece in both themes with a World picker). The spec is docs/handoff/specs/glossary-system.md; the SOP for Usman is docs/reference/glossary-scaling-sop-usman-2026-10-16.md.
      </p>
    </main>
  );
}
