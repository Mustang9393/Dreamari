const BLOB_GRADIENT =
  "radial-gradient(circle at center, rgba(127,168,255,0.4), rgba(127,168,255,0) 70%)";

/**
 * Decorative ambient glows behind the hero content. Positions are
 * percentage-based approximations of the Figma layout (which placed them
 * with fixed pixel offsets against a non-responsive canvas) so they scale
 * sensibly across viewport sizes instead of clipping oddly.
 */
export function GradientBlobs() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div
        className="absolute -left-24 top-1/2 h-[422px] w-[422px] rounded-full"
        style={{ background: BLOB_GRADIENT, animation: "blob1 22s ease-in-out infinite" }}
      />
      <div
        className="absolute -right-40 top-12 h-[551px] w-[551px] rounded-full opacity-50"
        style={{ background: BLOB_GRADIENT, animation: "blob2 28s ease-in-out infinite" }}
      />
      <div
        className="absolute -left-32 -top-32 h-[629px] w-[629px] rounded-full opacity-80"
        style={{ background: BLOB_GRADIENT, animation: "blob3 32s ease-in-out infinite" }}
      />
      <div
        className="absolute right-1/3 -top-24 h-[386px] w-[386px] rounded-full opacity-40"
        style={{ background: BLOB_GRADIENT, animation: "blob4 26s ease-in-out infinite" }}
      />
      <div
        className="absolute -right-24 top-3/4 h-[476px] w-[476px] rounded-full opacity-50"
        style={{ background: BLOB_GRADIENT, animation: "blob5 30s ease-in-out infinite" }}
      />
      <div
        className="absolute right-1/4 top-1/4 h-[348px] w-[348px] rounded-full opacity-30"
        style={{ background: BLOB_GRADIENT, animation: "blob2 24s ease-in-out infinite reverse" }}
      />
    </div>
  );
}
