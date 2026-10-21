import Image from "next/image";
import type { CSSProperties } from "react";
import type { FocalPoint } from "./art/types";
import styles from "./FullScenePlate.module.css";
/** Keep the complete painting visible; a soft copy fills any aspect-ratio gaps. */
export function FullScenePlate({src,alt,focal,mobileFocal,filter,onReady}:{src:string;alt:string;focal:FocalPoint;mobileFocal:FocalPoint;filter?:string;onReady?:()=>void}) {
 return <div className={styles.frame} style={{"--scene-position":`${focal.x*100}% ${focal.y*100}%`,"--scene-phone-position":`${mobileFocal.x*100}% ${mobileFocal.y*100}%`,filter} as CSSProperties} data-full-scene="true"><Image src={src} alt="" aria-hidden fill sizes="100vw" className={styles.backdrop}/><Image src={src} alt={alt} fill priority sizes="(max-width:639px) 116svh,100vw" className={styles.image} onLoad={onReady}/></div>;
}
