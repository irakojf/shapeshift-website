#!/usr/bin/env bash
# optimize-videos.sh
# Re-encodes video assets for web: smaller MP4s, WebM alternatives, poster frames.
# Requires: ffmpeg
#
# Usage: ./scripts/optimize-videos.sh
#
# What it does:
#   1. Re-encodes each MP4 with H.264 CRF 28, strips audio, adds faststart
#   2. Caps width at 960px (no upscaling)
#   3. Creates VP9 WebM versions for browsers that support it
#   4. Extracts a JPEG poster frame from the first second of each video
#
# Originals are backed up to src/assets/videos/originals/

set -euo pipefail

VIDEOS_DIR="$(cd "$(dirname "$0")/../src/assets/videos" && pwd)"
POSTERS_DIR="$(cd "$(dirname "$0")/../src/assets/videos" && pwd)/posters"
ORIGINALS_DIR="$VIDEOS_DIR/originals"

MAX_WIDTH=960
CRF_H264=28
CRF_VP9=35

mkdir -p "$POSTERS_DIR"
mkdir -p "$ORIGINALS_DIR"

for src in "$VIDEOS_DIR"/*.mp4; do
  [ -f "$src" ] || continue
  name="$(basename "$src" .mp4)"

  echo "=== Processing: $name.mp4 ==="

  # Back up original
  if [ ! -f "$ORIGINALS_DIR/$name.mp4" ]; then
    cp "$src" "$ORIGINALS_DIR/$name.mp4"
    echo "  Backed up original to originals/$name.mp4"
  fi

  # Get current width
  width=$(ffprobe -v quiet -select_streams v:0 \
    -show_entries stream=width -of csv=p=0 "$ORIGINALS_DIR/$name.mp4")

  # Build scale filter: cap at MAX_WIDTH, no upscaling, divisible by 2
  if [ "$width" -gt "$MAX_WIDTH" ]; then
    scale_filter="-vf scale=${MAX_WIDTH}:-2"
  else
    scale_filter="-vf scale=trunc(iw/2)*2:trunc(ih/2)*2"
  fi

  # 1) Optimized MP4 (H.264 + faststart, no audio)
  echo "  Encoding optimized MP4..."
  ffmpeg -y -i "$ORIGINALS_DIR/$name.mp4" \
    $scale_filter \
    -c:v libx264 -crf $CRF_H264 -preset slow \
    -movflags +faststart \
    -an \
    "$VIDEOS_DIR/$name.mp4" 2>/dev/null

  # 2) WebM (VP9, no audio)
  echo "  Encoding WebM..."
  ffmpeg -y -i "$ORIGINALS_DIR/$name.mp4" \
    $scale_filter \
    -c:v libvpx-vp9 -crf $CRF_VP9 -b:v 0 \
    -an \
    "$VIDEOS_DIR/$name.webm" 2>/dev/null

  # 3) Poster frame (JPEG from 1s in)
  echo "  Extracting poster frame..."
  ffmpeg -y -i "$ORIGINALS_DIR/$name.mp4" \
    -ss 1 -frames:v 1 -q:v 3 \
    $scale_filter \
    "$POSTERS_DIR/$name.jpg" 2>/dev/null

  # Report sizes
  orig_size=$(stat -c%s "$ORIGINALS_DIR/$name.mp4")
  mp4_size=$(stat -c%s "$VIDEOS_DIR/$name.mp4")
  webm_size=$(stat -c%s "$VIDEOS_DIR/$name.webm")
  poster_size=$(stat -c%s "$POSTERS_DIR/$name.jpg")

  orig_kb=$((orig_size / 1024))
  mp4_kb=$((mp4_size / 1024))
  webm_kb=$((webm_size / 1024))
  poster_kb=$((poster_size / 1024))
  savings=$(( (orig_size - mp4_size) * 100 / orig_size ))

  echo "  Original:  ${orig_kb}K"
  echo "  MP4:       ${mp4_kb}K (${savings}% smaller)"
  echo "  WebM:      ${webm_kb}K"
  echo "  Poster:    ${poster_kb}K"
  echo ""
done

echo "Done! Originals preserved in: $ORIGINALS_DIR"
echo ""
echo "Summary:"
orig_total=$(du -sb "$ORIGINALS_DIR" | cut -f1)
mp4_total=0
webm_total=0
for f in "$VIDEOS_DIR"/*.mp4; do
  [ -f "$f" ] && mp4_total=$((mp4_total + $(stat -c%s "$f")))
done
for f in "$VIDEOS_DIR"/*.webm; do
  [ -f "$f" ] && webm_total=$((webm_total + $(stat -c%s "$f")))
done
echo "  Originals total: $((orig_total / 1024 / 1024))M"
echo "  Optimized MP4s:  $((mp4_total / 1024 / 1024))M"
echo "  WebM files:      $((webm_total / 1024 / 1024))M"
