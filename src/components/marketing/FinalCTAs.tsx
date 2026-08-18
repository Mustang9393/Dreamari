"use client";

import { MarketingButton } from "./Button";
import { useRevealOnScroll } from "./scrollHooks";

type CTABlockProps = {
  eyebrow: string;
  heading: string;
  body: string;
  primary: { label: string; href: string };
  // Optional: the Schools view still shows a paired primary/secondary CTA, but the
  // student "You're ready" block was simplified to a single button per direct
  // feedback ("we don't need 'See How It Works'... one clear CTA").
  secondary?: { label: string; href: string };
};

export function CTABlock({ eyebrow, heading, body, primary, secondary }: CTABlockProps) {
  const [revealRef, revealed] = useRevealOnScroll<HTMLDivElement>();

  return (
    <div
      ref={revealRef}
      className="mx-6 rounded-[28px] border px-6 py-14 text-center transition-all duration-700 ease-out sm:mx-8 sm:py-16 lg:py-20"
      style={{
        background: "radial-gradient(ellipse at 50% 0%, rgba(47,107,242,.28), transparent 65%), var(--card)",
        borderColor: "var(--border)",
        opacity: revealed ? 1 : 0,
        transform: revealed ? "translateY(0) scale(1)" : "translateY(32px) scale(0.98)",
      }}
    >
      <div className="font-mono text-[11px] font-bold tracking-[0.14em] uppercase" style={{ color: "var(--primary-tint)" }}>
        {eyebrow}
      </div>
      <h2 className="mx-auto mt-3 max-w-[680px] text-[clamp(1.75rem,4vw,3rem)] font-extrabold" style={{ color: "var(--foreground)" }}>
        {heading}
      </h2>
      <p className="mx-auto mt-4 max-w-[560px] text-[clamp(16px,0.8vw+12px,19px)] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
        {body}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3.5">
        <MarketingButton variant="primary" href={primary.href}>
          {primary.label}
        </MarketingButton>
        {secondary && (
          <MarketingButton variant="ghost" href={secondary.href}>
            {secondary.label}
          </MarketingButton>
        )}
      </div>
    </div>
  );
}

export function StudentFinalCTA() {
  return (
    <div className="py-6 sm:py-8">
      <CTABlock
        eyebrow="Build. Match. Play. Explore. Connect."
        heading="You're ready."
        body="Let's build your future."
        primary={{ label: "Start Journey", href: "/flow" }}
      />
    </div>
  );
}

export function SchoolsFinalCTA() {
  return (
    <div className="py-6 sm:py-8">
      <CTABlock
        eyebrow="For schools"
        heading="One platform. Every student's path."
        body="Discovery, tools, and outcomes you can measure."
        primary={{ label: "Request a demo", href: "#" }}
        secondary={{ label: "Talk to our team", href: "#" }}
      />
    </div>
  );
}
