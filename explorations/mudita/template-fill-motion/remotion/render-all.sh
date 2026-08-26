#!/usr/bin/env bash
# Re-render every cut. The .mp4 files committed in ../assets/ are copies of these.
set -e
cd "$(dirname "$0")"
for id in Cover-Stream Cover-Shimmer Cover-Stagger Cover-Sequence Cover-Glow \
          Opportunity-Stream Opportunity-Shimmer Opportunity-Stagger Opportunity-Sequence Opportunity-Glow; do
  echo "→ $id"
  npx remotion render "$id" "out/$(echo "$id" | tr 'A-Z' 'a-z').mp4" --crf 22 --log=error
done
echo "→ Reel (720p, it is 90s long)"
npx remotion render Reel out/reel.mp4 --crf 26 --scale 0.6667 --log=error
