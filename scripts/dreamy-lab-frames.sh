#!/usr/bin/env bash
# Convert the Blender sprite render (blender/dreamy/renders/lab_frames/f_####.png)
# into the Dreamy Lab's WebP frames at public/images/dreamy/lab/. Keeps alpha,
# downsizes to 384px (FRAME_SIZE in src/components/dreamy-lab/sequence.ts).
# Uses cwebp (brew install webp); the Homebrew ffmpeg here has no WebP encoder.
set -euo pipefail
cd "$(dirname "$0")/.."
src=blender/dreamy/renders/lab_frames
dst=public/images/dreamy/lab
mkdir -p "$dst"
for f in "$src"/f_*.png; do
  n=$(basename "$f" .png)
  cwebp -quiet -q 82 -alpha_q 90 -resize 384 384 "$f" -o "$dst/$n.webp"
done
echo "frames: $(ls "$dst" | wc -l), size: $(du -sh "$dst" | cut -f1)"
