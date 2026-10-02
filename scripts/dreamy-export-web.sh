#!/usr/bin/env bash
# Rebuild the live 3D Dreamy for /dreamy-lab/3d from the Blender file.
# 1) Blender (background) bakes the web copy: body without boolean holes
#    (the page cuts them in the shader), face meshes with their shape keys,
#    props at full size, galaxy iris baked to iris_L/R.png.
# 2) gltf-transform compresses it (meshopt). Keep --join/--flatten off so
#    every part stays addressable, and --prune-attributes off so the iris
#    keeps its UVs.
set -euo pipefail
cd "$(dirname "$0")/.."
BLEND="${1:-$HOME/Documents/Dreamari/outputs/dreamy-refinement/dreamy-performance-anim.blend}"
OUT=public/models/dreamy
mkdir -p "$OUT"
/Applications/Blender.app/Contents/MacOS/Blender -b "$BLEND" --python scripts/dreamy-export-web.py -- "$PWD/$OUT"
npx -y @gltf-transform/cli@latest optimize "$OUT/dreamy.glb" "$OUT/dreamy.opt.glb" --compress meshopt \
  --texture-compress false --simplify false --join false --flatten false --instance false --palette false --prune-attributes false
rm -f "$OUT/dreamy.glb"
ls -la "$OUT"
