// A diagonal band of light sweeping once across whatever it's placed inside --
// the "your choice registered" emphasis used on selected answers in the Build
// flow (see confirm-shimmer-sweep in globals.css). Lives here, not in
// build/ui.tsx, so Play and Glossary can use the same moment without pulling
// Build's whole module graph into their bundles. The parent needs
// `position: relative`; the sweep clips to the parent's border radius.
export function ConfirmShimmer({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
      <span
        className="absolute inset-y-0 left-0 w-1/3 motion-safe:animate-[confirm-shimmer-sweep_0.42s_ease-out_forwards]"
        style={{ background: "linear-gradient(100deg, transparent 0%, rgba(255,255,255,0.6) 45%, transparent 90%)" }}
      />
    </span>
  );
}
