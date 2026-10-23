#!/bin/zsh
# the 21 Oct 2026 harness, re-run against the dev build on :3089
cd "$(dirname "$0")"
ROUTES=(${(f)"$(grep -v '^#' routes.txt)"})
for MODE in desktop-dark desktop-light phone-dark; do
  node full.mjs $MODE "${ROUTES[@]}" 2>>run.log
done
node extra.mjs 2>>run.log
echo ALL-DONE >> run.log
