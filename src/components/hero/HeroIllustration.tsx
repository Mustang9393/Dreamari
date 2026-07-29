import Image from "next/image";

export function HeroIllustration() {
  return (
    <div className="relative mx-auto aspect-[718/534] w-full max-w-3xl overflow-hidden">
      <Image
        src="/images/hero-cloud-mascot.png"
        alt="Dreamari mascot — a friendly cloud character"
        fill
        sizes="(min-width: 768px) 718px, 100vw"
        className="object-cover object-[center_30%]"
        priority
      />
    </div>
  );
}
