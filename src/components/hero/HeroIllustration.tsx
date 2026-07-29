import Image from "next/image";

export function HeroIllustration() {
  return (
    // Short, wide crop anchored to the top of the source image — reveals the
    // puffy head and eyes (the upper half of the face) while the mouth stays
    // just below the fold, as if the character is peeking up. Sits in normal
    // document flow after the hero copy/buttons, so — unlike a
    // fixed/absolute-positioned mascot — it can never overlap the content
    // above it, on any screen size.
    <div className="relative mx-auto aspect-[718/430] w-full max-w-3xl overflow-hidden">
      <div className="animate-[cloud-float_6s_ease-in-out_infinite]">
        <Image
          src="/images/hero-cloud-mascot.png"
          alt="Dreamari mascot — a friendly cloud character"
          width={718}
          height={718}
          sizes="(min-width: 768px) 718px, 100vw"
          className="h-auto w-full object-cover object-top"
          priority
        />
      </div>
    </div>
  );
}
