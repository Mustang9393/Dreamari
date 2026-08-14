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

type MarketingButtonProps = {
  variant: Variant;
  href?: string;
} & ComponentPropsWithoutRef<"button">;

export function MarketingButton({ variant, href, className = "", children, ...props }: MarketingButtonProps) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-full px-[22px] py-[14px] text-[14.5px] font-bold whitespace-nowrap transition-transform duration-150 hover:-translate-y-px active:scale-[0.97] ${className}`;

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
