"use client";

import { useEffect, useState } from "react";
import { ScrollHint } from "@/components/landing/ScrollHint";

export function ScrollNudge() {
  // Its only job is prompting the very first scroll, so it fades out almost as soon as
  // the user starts — no reason for it to linger once they're already scrolling.
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    function update() {
      const fadeDistance = 110;
      setOpacity(Math.max(0, Math.min(1, 1 - window.scrollY / fadeDistance)));
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return <ScrollHint opacity={opacity} className="absolute inset-x-0 bottom-0 pb-1" />;
}
