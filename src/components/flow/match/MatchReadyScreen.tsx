"use client";

import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";

// The reveal beat between "Finding your matches..." and the Match deck
// itself (direct feedback, 5 Sept 2026): matches are computed by the time
// this shows, so the CTA is a deliberate tap ("Reveal My Matches"), not
// another timed auto-advance stacked right after the loading screen.
export function MatchReadyScreen({ onReveal }: { onReveal: () => void }) {
  return (
    <div className="flex w-full flex-col items-center gap-5 text-center">
      <div className="relative aspect-[1366/768] w-40 shrink-0 sm:w-56 motion-safe:animate-[dreamy-celebrate_1.1s_ease-in-out_infinite]">
        <Image src="/images/dreamy/v2/dreamy-party.png" alt="Dreamy celebrating" fill sizes="224px" className="object-contain" priority />
      </div>
      <p className="text-sm font-bold tracking-[0.14em] uppercase text-[var(--color-brand-600)]">Congratulations!</p>
      <div className="flex flex-col gap-1">
        <p className="text-lg font-bold text-slate-900 dark:text-white">Your matches are ready.</p>
        <p className="max-w-xs text-sm font-medium text-slate-600 dark:text-slate-400">See the careers that fit you.</p>
      </div>
      <Button variant="primary" size="large" onClick={onReveal} type="button">
        Reveal My Matches <ArrowRight className="h-4 w-4" aria-hidden />
      </Button>
    </div>
  );
}
