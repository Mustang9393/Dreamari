"use client";

// One screen size of one location, rendered the way the player renders it.
// The scene is laid out at the device's real pixel size (so every px value in
// the player's math means the same thing here) and scaled down to fit. The
// guides are drawn on top at display size so a 1px line stays visible.

import Image from "next/image";
import type { CharacterSlot, FocalPoint } from "@/components/play/art";
import { DESKTOP_PLATE_SCALE, focalForWidth, MOBILE_BREAKPOINT_PX, plateObjectPosition, spriteBox, spriteWidthPx } from "@/components/play/scenePlacement";
import { dialogueZone, type FrameSpec } from "./sceneReviewModel";

export type FrameSprite = { src: string; slot: CharacterSlot; ratio: number | undefined; face?: { x: number; y: number }; faceBad?: boolean; zIndex?: number };

export type Guides = { dialogue: boolean; thirds: boolean; centre: boolean };

export function SceneFrame({
  frame,
  displayHeight,
  plateSrc,
  plateAlt,
  plateMissing,
  location,
  sprites,
  guides,
}: {
  frame: FrameSpec;
  displayHeight: number;
  plateSrc: string;
  plateAlt: string;
  plateMissing?: boolean;
  location: { focal: FocalPoint; mobileFocal: FocalPoint };
  sprites: FrameSprite[];
  guides: Guides;
}) {
  const scale = displayHeight / frame.h;
  const desktop = frame.w >= MOBILE_BREAKPOINT_PX;
  const zone = dialogueZone(frame.w, frame.h);
  const pct = (v: number, of: number) => `${(v / of) * 100}%`;
  return (
    <div data-frame={frame.key} className="relative shrink-0 overflow-hidden rounded-[6px]" style={{ width: frame.w * scale, height: displayHeight, background: "var(--card)" }}>
      <div className="pointer-events-none absolute top-0 left-0 overflow-hidden" style={{ width: frame.w, height: frame.h, transform: `scale(${scale})`, transformOrigin: "0 0" }}>
        {!plateMissing && (
          <Image
            src={plateSrc}
            alt={plateAlt}
            fill
            unoptimized
            // The review probes every plate anyway; lazy would only delay it.
            loading="eager"
            sizes="100vw"
            className="object-cover"
            style={{
              objectPosition: plateObjectPosition(focalForWidth(location, frame.w)),
              transform: desktop ? `translate3d(0px, 0px, 0) scale(${DESKTOP_PLATE_SCALE})` : undefined,
            }}
          />
        )}
        {sprites.map((sprite) => {
          const box = spriteBox(sprite.slot, frame.h);
          return (
            <span
              key={`${sprite.src}-${sprite.slot.x}`}
              aria-hidden
              data-sprite={sprite.src}
              className="absolute"
              style={{ left: `${box.leftPct}%`, bottom: `${box.bottomPx}px`, height: `${box.heightPx}px`, zIndex: sprite.zIndex, transform: "translate3d(-50%, 0px, 0)" }}
            >
              {/* A plain img with the player's exact classes and size attributes.
                 next/image's dev check warns whenever one rendered side happens
                 to equal its attribute, which at five frame sizes it sometimes
                 does; the layout is identical either way. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={sprite.src}
                alt=""
                width={Math.round(spriteWidthPx(900, sprite.ratio))}
                height={900}
                decoding="async"
                className="h-full w-auto max-w-none object-contain drop-shadow-[0_18px_30px_rgba(0,0,0,0.45)]"
              />
            </span>
          );
        })}
      </div>

      {plateMissing && (
        <span className="absolute inset-0 flex items-center justify-center p-1 text-center text-[10.5px] font-bold" style={{ color: "var(--color-feedback-danger)" }}>
          No plate
        </span>
      )}

      {guides.dialogue && (
        <span
          aria-hidden
          className="pointer-events-none absolute rounded-[3px] border border-dashed"
          style={{
            left: pct(zone.left, frame.w),
            top: pct(zone.top, frame.h),
            width: pct(zone.width, frame.w),
            height: pct(zone.height, frame.h),
            borderColor: "color-mix(in srgb, var(--foreground) 55%, transparent)",
            background: "color-mix(in srgb, var(--background) 45%, transparent)",
          }}
        />
      )}
      {guides.thirds && <span aria-hidden className="pointer-events-none absolute inset-x-0 border-t border-dashed" style={{ top: "33.333%", borderColor: "color-mix(in srgb, var(--primary) 85%, transparent)" }} />}
      {guides.centre && <span aria-hidden className="pointer-events-none absolute inset-y-0 border-l border-dashed" style={{ left: "50%", borderColor: "color-mix(in srgb, var(--foreground) 40%, transparent)" }} />}
      {sprites.map((sprite) =>
        sprite.face ? (
          <span
            key={`face-${sprite.src}-${sprite.slot.x}`}
            aria-hidden
            className="pointer-events-none absolute size-[9px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
            style={{
              left: pct(sprite.face.x, frame.w),
              top: pct(sprite.face.y, frame.h),
              borderColor: sprite.faceBad ? "var(--color-feedback-danger)" : "var(--color-feedback-success)",
              background: "color-mix(in srgb, var(--background) 40%, transparent)",
            }}
          />
        ) : null,
      )}
      {/* Drawn over the scene rather than as a border, so the scene itself
         starts at the frame's true 0,0 like the player's full-bleed host. */}
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[6px] border" style={{ borderColor: "var(--glass-border)" }} />
    </div>
  );
}
