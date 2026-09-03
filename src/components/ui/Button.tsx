import type { ComponentPropsWithoutRef } from "react";
import Link from "next/link";

// The app's one text button. Rebuilt 2026-09-02 after the engineering review
// found button states inconsistent across the app (direct feedback):
//   - one shape everywhere: var(--radius-md), never a pill;
//   - one fill family: primary is the brand blue with white text, secondary is
//     bordered glass, quiet is text on transparent;
//   - one hover: a small lift and a slight brightening (dm-solid) or a faint
//     wash (dm-quiet) -- not a fill flip. The previous CTA flipped from a light
//     fill to dark glass on hover, which read as harsh ("the color changes too
//     much");
//   - two sizes: default 44px with 15/600 labels, compact 36px with 14/600.
// Label typography is the body face at semibold, matching every other control
// in the app; the display face is reserved for headings.
type Variant = "primary" | "secondary" | "quiet";
type Size = "default" | "compact" | "large";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "dm-solid bg-[var(--primary)] text-[var(--primary-foreground)] disabled:pointer-events-none disabled:opacity-40",
  secondary: "dm-quiet border border-[var(--glass-border)] bg-[var(--glass-surface-1)] text-[var(--foreground)] disabled:pointer-events-none disabled:opacity-40",
  quiet: "dm-quiet bg-transparent text-[var(--foreground)] disabled:pointer-events-none disabled:opacity-40",
};

const SIZE_CLASSES: Record<Size, string> = {
  compact: "min-h-[36px] px-[14px] text-[14px] leading-[18px] rounded-[var(--radius-md)]",
  default: "min-h-[44px] px-[var(--space-5)] text-[15px] leading-[20px] rounded-[var(--radius-md)]",
  large: "min-h-[52px] px-[var(--space-6)] text-[16px] leading-[22px] rounded-[var(--radius-md)]",
};

type ButtonProps = {
  variant?: Variant;
  size?: Size;
  href?: string;
} & ComponentPropsWithoutRef<"button">;

export function Button({ variant = "primary", size = "default", href, className = "", children, ...props }: ButtonProps) {
  const classes = `inline-flex cursor-pointer items-center justify-center gap-[6px] font-semibold ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`;
  const style = { fontFamily: "var(--font-body)" } as const;

  if (href) {
    return (
      <Link href={href} className={classes} style={style}>
        <span className="inline-flex items-center gap-[6px]">{children}</span>
      </Link>
    );
  }

  return (
    <button className={classes} style={style} {...props}>
      <span className="inline-flex items-center gap-[6px]">{children}</span>
    </button>
  );
}
