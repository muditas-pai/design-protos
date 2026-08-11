#!/usr/bin/env bash
#
# Re-copy the atlas working set from a local agentic-atlas checkout into this
# folder. Idempotent — run it whenever atlas moves and you want the new one.
#
#   ./sync.sh                          # source: ../../agentic-atlas
#   ./sync.sh ~/code/agentic-atlas     # source: somewhere else
#   ATLAS_SRC=~/code/agentic-atlas ./sync.sh
#   ./sync.sh --full-assets            # also bring the 29 MB left out by default
#
# What it does NOT touch: your own designs/<slug>/ folders, README.md,
# SYNCED-FROM.md, CLAUDE.md, this script. Everything else under atlas/ is a
# verbatim copy and is replaced wholesale — see SYNCED-FROM.md.

set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

FULL_ASSETS=0
SRC=""
for arg in "$@"; do
  case "$arg" in
    --full-assets) FULL_ASSETS=1 ;;
    -h|--help) sed -n '3,13p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) SRC="$arg" ;;
  esac
done

SRC="${SRC:-${ATLAS_SRC:-$HERE/../../agentic-atlas}}"
SRC="$(cd "$SRC" 2>/dev/null && pwd || true)"

if [ -z "$SRC" ] || [ ! -f "$SRC/AGENTS.md" ]; then
  echo "sync: no agentic-atlas checkout found." >&2
  echo "      Clone it, then: ./sync.sh /path/to/agentic-atlas" >&2
  exit 1
fi

echo "sync: from $SRC"
echo "sync:   to $HERE"

# ── the verbatim set: replaced wholesale, never edited here ──────────────────
# No trailing slashes. A trailing slash makes rsync copy a directory's CONTENTS
# rather than the directory, which with --delete empties the destination root.
VERBATIM=(
  AGENTS.md
  templates
  docs
  design-system
  canonical
  tools/lint
  tools/render
  .claude/skills/atlas-riff
)

for path in "${VERBATIM[@]}"; do
  path="${path%/}"
  if [ ! -e "$SRC/$path" ]; then
    echo "sync: WARNING — $path is gone from atlas; leaving the local copy" >&2
    continue
  fi
  mkdir -p "$HERE/$(dirname "$path")"
  rsync -a --delete \
    --exclude '__pycache__/' --exclude '*.pyc' --exclude '.DS_Store' \
    "$SRC/$path" "$HERE/$(dirname "$path")/"
  echo "sync:   + $path"
done

# ── reference designs: the four folders that carry annotations.jsonl ─────────
# AGENTS.md step 2 says "read every designs/*/annotations.jsonl", so they keep
# that exact path. These four names are reserved — do not start your own work
# under one of them or the next sync will overwrite it.
REFERENCE_DESIGNS=(cancel-flow checkout-with-offer deck-ready-modal-expanded gold-50-off-modal)

mkdir -p "$HERE/designs"
rsync -a "$SRC/designs/README.md" "$HERE/designs/README.md"
for slug in "${REFERENCE_DESIGNS[@]}"; do
  [ -d "$SRC/designs/$slug" ] || continue
  rsync -a --delete --exclude '.DS_Store' "$SRC/designs/$slug" "$HERE/designs/"
  echo "sync:   + designs/$slug"
done

# ── assets: everything except the two heavy tiers ────────────────────────────
ASSET_EXCLUDES=(--exclude '.DS_Store')
if [ "$FULL_ASSETS" -eq 0 ]; then
  ASSET_EXCLUDES+=(--exclude 'decks/*/full/' --exclude 'features/*.mp4' --exclude 'features/*.webm')
fi
rsync -a --delete "${ASSET_EXCLUDES[@]}" "$SRC/assets" "$HERE/"
echo "sync:   + assets$([ "$FULL_ASSETS" -eq 1 ] && echo ' (full)' || echo ' (light)')"

# ── provenance ──────────────────────────────────────────────────────────────
COMMIT="$(git -C "$SRC" rev-parse HEAD 2>/dev/null || echo unknown)"
SUBJECT="$(git -C "$SRC" log -1 --format=%s 2>/dev/null || echo unknown)"
DATE="$(git -C "$SRC" log -1 --format='%ad' --date=format:'%-d %b %Y' 2>/dev/null || echo unknown)"
DIRTY=""
if [ -n "$(git -C "$SRC" status --porcelain 2>/dev/null)" ]; then DIRTY=" — source checkout was dirty at sync time"; fi
TODAY="$(date '+%-d %b %Y')"

STAMP="$HERE/SYNCED-FROM.md"
if [ -f "$STAMP" ]; then
  tmp="$(mktemp)"
  awk -v c="$COMMIT" -v s="$SUBJECT" -v d="$DATE" -v x="$DIRTY" -v t="$TODAY" '
    index($0, "| commit |")  == 1 { print "| commit | `" c "` |"; next }
    index($0, "| subject |") == 1 { print "| subject | " s " |"; next }
    index($0, "| dated |")   == 1 { print "| dated | " d x " |"; next }
    index($0, "| synced |")  == 1 { print "| synced | " t " |"; next }
    { print }
  ' "$STAMP" > "$tmp" && mv "$tmp" "$STAMP"
  echo "sync: stamped SYNCED-FROM.md → $COMMIT"
fi

echo "sync: done. $(du -sh "$HERE" | cut -f1) on disk."
echo "sync: review with  git -C \"$(dirname "$HERE")\" status --short atlas/"
