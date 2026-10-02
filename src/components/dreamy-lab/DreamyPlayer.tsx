"use client";

// DEMO-ONLY: the Dreamy Lab's frame player. Drives an <img> through the
// rendered sequence with requestAnimationFrame, so playback is one network
// pass (preload) and then zero layout work per frame. Idle loops; any other
// emotion plays its slice once and hands back to idle, which is the shape
// every in-app placement would want (react, then settle).

import { useCallback, useEffect, useRef, useState } from "react";
import { EMOTIONS, FPS, FRAME_COUNT, frameSrc, type Emotion } from "./sequence";

const IDLE = EMOTIONS[0];

export type PlayerHandle = {
  play: (id: string) => void;
  current: Emotion;
  frame: number;
  ready: number; // 0..1 preload progress
};

export function useDreamyPlayer(): PlayerHandle & { setFrame: (f: number) => void; paused: boolean; setPaused: (p: boolean) => void } {
  const [current, setCurrent] = useState<Emotion>(IDLE);
  const [frame, setFrameState] = useState(1);
  const [ready, setReady] = useState(0);
  const [paused, setPaused] = useState(false);
  const frameRef = useRef(1);
  const emotionRef = useRef<Emotion>(IDLE);
  const lastTick = useRef(0);

  // Preload every frame once; the browser cache does the rest.
  useEffect(() => {
    let done = 0;
    let cancelled = false;
    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image();
      img.onload = img.onerror = () => {
        done += 1;
        if (!cancelled) setReady(done / FRAME_COUNT);
      };
      img.src = frameSrc(i);
    }
    return () => {
      cancelled = true;
    };
  }, []);

  const play = useCallback((id: string) => {
    const e = EMOTIONS.find((x) => x.id === id) ?? IDLE;
    emotionRef.current = e;
    frameRef.current = e.from;
    setCurrent(e);
    setFrameState(e.from);
    setPaused(false);
  }, []);

  const setFrame = useCallback((f: number) => {
    frameRef.current = f;
    setFrameState(f);
  }, []);

  useEffect(() => {
    let raf = 0;
    const step = (t: number) => {
      raf = requestAnimationFrame(step);
      if (paused) return;
      if (t - lastTick.current < 1000 / FPS) return;
      lastTick.current = t;
      const e = emotionRef.current;
      let f = frameRef.current + 1;
      if (f > e.to) {
        if (e.loop) f = e.from;
        else {
          emotionRef.current = IDLE;
          setCurrent(IDLE);
          f = IDLE.from;
        }
      }
      frameRef.current = f;
      setFrameState(f);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [paused]);

  return { play, current, frame, ready, setFrame, paused, setPaused };
}

/** The sprite itself. Sized by its parent; keeps the 1:1 render aspect. */
export function DreamyFrame({ frame, className }: { frame: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- frame swaps every 33ms; next/image would re-run its loader each time
    <img src={frameSrc(frame)} alt="Dreamy" draggable={false} className={`block h-full w-full select-none object-contain ${className ?? ""}`} />
  );
}
