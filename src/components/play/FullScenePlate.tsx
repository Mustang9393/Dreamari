import Image from "next/image";
import type { CSSProperties } from "react";
import type { FocalPoint } from "./art/types";
import { portraitFor } from "./locations";
import styles from "./FullScenePlate.module.css";
/** A sharp full-bleed painting; portrait companions are independently composed. */
export function FullScenePlate({src,alt,focal,mobileFocal,filter,onReady}:{src:string;alt:string;focal:FocalPoint;mobileFocal:FocalPoint;filter?:string;onReady?:()=>void}) {
 const mobileSrc=portraitFor(src);
 return <div className={styles.frame} style={{"--scene-position":`${focal.x*100}% ${focal.y*100}%`,"--scene-phone-position":`${mobileFocal.x*100}% ${mobileFocal.y*100}%`,filter:filter?.replace(/blur\([^)]*\)\s*/g,"")} as CSSProperties} data-full-scene="true">
  <picture className={styles.picture}>{mobileSrc&&<source media="(max-width:639px)" srcSet={mobileSrc}/>}<Image src={src} alt={alt} fill priority sizes="100vw" className={styles.image} onLoad={onReady}/></picture>
 </div>;
}
