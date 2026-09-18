import { bellTone, getAudioContext, whenRunning } from "@/components/flow/aurora/feedback";

// A new message: two soft bell notes, a fourth apart, quieter than the
// milestone chime. Once per incoming message, never for your own sends.
export function playMessageTone() {
  const ctx = getAudioContext();
  if (!ctx) return;
  whenRunning(ctx, (running) => {
    const now = running.currentTime;
    bellTone(running, 659.25, now, 0.18, 0.12);
    bellTone(running, 880, now + 0.11, 0.26, 0.13);
  });
}
