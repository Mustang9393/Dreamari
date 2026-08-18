import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

type Variant = "primary" | "ghost";

const VARIANT_STYLE: Record<Variant, React.CSSProperties> = {
  primary: {
    background: "linear-gradient(180deg, #4a82ff, var(--primary))",
    color: "var(--primary-foreground)",
    boxShadow: "0 8px 24px -8px rgba(47,107,242,.7)",
  },
  ghost: {
    background: "var(--glass-surface-1)",
    border: "1px solid var(--border)",
    color: "var(--foreground)",
  },
};

// Size tiers rather than one fixed padding/font — per direct feedback the primary
// "Start Journey" CTA needed to be bigger, most of all in the final "You're ready."
// section: md is the original size (Nav overrides it smaller via className, Schools
// keeps it), lg steps the hero's CTA up, and xl is the closing section's — the last
// action on the page should be its most confident one.
type Size = "md" | "lg" | "xl";

const SIZE_CLASSES: Record<Size, string> = {
  md: "px-[22px] py-[14px] text-[14.5px]",
  lg: "px-[32px] py-[17px] text-[16.5px]",
  xl: "px-[44px] py-[20px] text-[18px]",
};

type MarketingButtonProps = {
  variant: Variant;
  size?: Size;
  href?: string;
} & ComponentPropsWithoutRef<"button">;

export function MarketingButton({ variant, size = "md", href, className = "", children, ...props }: MarketingButtonProps) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-full font-bold whitespace-nowrap transition-transform duration-150 hover:-translate-y-px active:scale-[0.97] ${SIZE_CLASSES[size]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes} style={VARIANT_STYLE[variant]}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} style={VARIANT_STYLE[variant]} {...props}>
      {children}
    </button>
  );
}
