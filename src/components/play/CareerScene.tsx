"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { V2Image } from "./ib-v2-scenes";
import styles from "./CareerScene.module.css";

export type CareerComposition = {
  id: string;
  location: string;
  timeClass: "dawn" | "day" | "midday" | "late" | "night";
  foreground?: string;
  scale: number;
  top: number;
  doorPatch: boolean;
};

/** Cover-crop one shared canvas, never the room and people independently.
 * Lighting constants reproduce the approved art preview, not UI colours. */
export function CareerScene({ scene, filter, onReady }: {
  scene: V2Image;
  filter?: string;
  onReady?: () => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    if (!host.current) return;
    const observer = new ResizeObserver(([entry]) => {
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(host.current);
    return () => observer.disconnect();
  }, []);
  const composition = scene.composition!;
  const width = Math.max(size.width, size.height * 1672 / 941);
  const height = width * 941 / 1672;
  const focal = size.width < 640 ? scene.mobileFocal : scene.focal;
  const canvas: CSSProperties = {
    width, height,
    left: (size.width - width) * focal.x,
    top: (size.height - height) * focal.y,
    "--cast-scale": composition.scale,
    "--cast-top": `${composition.top * 100}%`,
  } as CSSProperties;
  return (
    <div ref={host} className={styles.host} style={{ filter }} role="img" aria-label={scene.alt}
      data-career-scene={composition.id} data-location={composition.location} data-time={composition.timeClass}>
      {size.width > 0 && <div className={`${styles.canvas} ${styles[composition.timeClass] ?? ""} ${composition.location === "room12" ? styles.room12 : ""}`} style={canvas}>
        <Image src={scene.src} alt="" fill unoptimized priority className={styles.background} onLoad={composition.foreground ? undefined : onReady} />
        <div className={styles.wash} />
        {composition.foreground && <>
          <Image src={composition.foreground} alt="" fill unoptimized priority
            className={`${styles.foreground} ${composition.doorPatch ? styles.cart : ""}`} onLoad={onReady} />
          {composition.doorPatch && <Image src={composition.foreground} alt="" fill unoptimized priority className={`${styles.foreground} ${styles.door}`} />}
        </>}
        {(composition.timeClass === "dawn" || composition.timeClass === "late") && <div className={styles.rays} />}
        {composition.doorPatch && <div className={styles.callLights}>{[0, 1, 2, 3].map(i => <span key={i} />)}</div>}
      </div>}
    </div>
  );
}
