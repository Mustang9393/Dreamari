import type { ComponentPropsWithoutRef } from "react";
import Link from "next/link";

type Variant = "nav" | "cta-solid" | "cta-outline";

const VARIANT_CLASSES: Record<Variant, string> = {
  nav: "rounded-xl bg-gradient-to-r from-brand-500 to-brand-400 px-6 py-3 text-sm font-extrabold text-white",
  "cta-solid":
    "rounded-2xl bg-gradient-to-r from-brand-400 to-accent-deep px-8 py-4 text-lg font-bold text-white shadow-lg shadow-brand-950/40",
  "cta-outline":
    "rounded-2xl border border-brand-300/40 bg-white/[0.06] px-8 py-4 text-lg font-bold text-[#eaf1ff]",
};

type ButtonProps = {
  variant: Variant;
  href?: string;
} & ComponentPropsWithoutRef<"button">;

export function Button({ variant, href, className = "", children, ...props }: ButtonProps) {
  const classes = `inline-flex items-center justify-center text-center transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] ${VARIANT_CLASSES[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
