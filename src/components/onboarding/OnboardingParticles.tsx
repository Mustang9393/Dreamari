const PARTICLE_GRADIENT =
  "radial-gradient(circle at 35% 35%, #f2b01e, rgba(250,251,252,0) 70%)";

type Particle = {
  size: number;
  top: string;
  left: string;
};

// Positions are percentage-based approximations of the Figma layout (which
// scattered ~16 individual glow-dot SVGs at fixed pixel coordinates against
// a 1366px canvas) so the effect holds up across viewport sizes instead of
// clipping oddly on resize.
const PARTICLES: Particle[] = [
  { size: 31, top: "8%", left: "78%" },
  { size: 31, top: "70%", left: "8%" },
  { size: 10, top: "9%", left: "19%" },
  { size: 10, top: "13%", left: "5%" },
  { size: 10, top: "13%", left: "19%" },
  { size: 28, top: "5%", left: "24%" },
  { size: 28, top: "6%", left: "6%" },
  { size: 15, top: "15%", left: "69%" },
  { size: 17, top: "3%", left: "81%" },
  { size: 31, top: "51%", left: "88%" },
  { size: 31, top: "78%", left: "92%" },
  { size: 44, top: "28%", left: "90%" },
  { size: 44, top: "70%", left: "82%" },
  { size: 31, top: "42%", left: "81%" },
  { size: 31, top: "46%", left: "1%" },
  { size: 31, top: "25%", left: "10%" },
  { size: 31, top: "58%", left: "9%" },
];

export function OnboardingParticles() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {PARTICLES.map((particle, index) => (
        <div
          key={index}
          className="absolute rounded-full"
          style={{
            width: particle.size,
            height: particle.size,
            top: particle.top,
            left: particle.left,
            background: PARTICLE_GRADIENT,
          }}
        />
      ))}
    </div>
  );
}
