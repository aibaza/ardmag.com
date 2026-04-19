#!/usr/bin/env bash
# Image optimization pipeline for ardmag.com product catalog
# Generates AVIF/WebP/JPEG variants from source originals
#
# Source:  resources/images/[slug]/[stem].[ext]
# Output:  backend/static/images/[slug]/[stem].[ext]        (original copy)
#          backend/static/images/[slug]/[stem]/[variant].[fmt]  (variants)
#
# Variants: thumb(200w) card(400w) detail(800w) detail-2x(1600w) hero(1200w)
# Formats:  alpha images -> avif + webp + png
#           opaque images -> avif + webp + jpg

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SRC_DIR="$REPO_ROOT/resources/images"
DST_DIR="$REPO_ROOT/backend/static/images"

Q_AVIF=65
Q_WEBP=75
Q_JPEG=82
PNG_COMPRESS=9

# "name:width" pairs in order
VARIANTS=("thumb:200" "card:400" "detail:800" "detail-2x:1600" "hero:1200")

MAX_JOBS=$(nproc 2>/dev/null || sysctl -n hw.logicalcpu 2>/dev/null || echo 4)

TMP_DIR=$(mktemp -d)
trap 'rm -rf "$TMP_DIR"' EXIT

# ---- helpers ----------------------------------------------------------------

# Returns true only if image has actual transparent pixels (not just alpha channel declared)
has_alpha() {
  local channels
  channels=$(identify -format "%[channels]" "$1" 2>/dev/null | head -1)
  [[ "$channels" != *a* ]] && return 1  # no alpha channel
  local min_a
  min_a=$(magick "$1" -channel alpha -separate -format "%[fx:minima]\n" info: 2>/dev/null)
  awk "BEGIN{exit !($min_a < 1)}"
}

process_file() {
  local src="$1" slug="$2" stem="$3" src_ext="$4"

  local slug_dir="$DST_DIR/$slug"
  local variant_dir="$slug_dir/$stem"
  mkdir -p "$slug_dir" "$variant_dir"

  # Copy original (preserves all formats as-is)
  local dst_orig="$slug_dir/$stem.$src_ext"
  if [[ ! -f "$dst_orig" || "$src" -nt "$dst_orig" ]]; then
    cp "$src" "$dst_orig"
  fi

  # WebP originals: decode to temp PNG as working master
  local work="$src"
  local tmp_work=""
  if [[ "$src_ext" == "webp" ]]; then
    tmp_work=$(mktemp "$TMP_DIR/work_XXXXXX.png")
    magick "$src" "$tmp_work"
    work="$tmp_work"
  fi

  local transparent=false
  has_alpha "$work" && transparent=true

  local orig_w
  orig_w=$(identify -format "%w" "$work" 2>/dev/null | head -1)

  local n_gen=0 n_skip=0 n_err=0

  for vspec in "${VARIANTS[@]}"; do
    local vname="${vspec%%:*}"
    local target_w="${vspec##*:}"

    # Cap at original size -- no upscaling
    local resize_w="$target_w"
    (( orig_w < target_w )) && resize_w="$orig_w"
    local resize="${resize_w}x>"

    # Format list: always avif + webp; then png (alpha) or jpg (opaque)
    local fmts=("avif" "webp")
    $transparent && fmts+=("png") || fmts+=("jpg")

    for fmt in "${fmts[@]}"; do
      local out="$variant_dir/$vname.$fmt"

      # Idempotent: skip if output exists and is newer than source
      if [[ -f "$out" && "$out" -nt "$src" ]]; then
        (( n_skip++ )) || true
        continue
      fi

      local ok=true
      case "$fmt" in
        avif)
          magick "$work" -resize "$resize" -strip \
            -quality $Q_AVIF "$out" 2>/dev/null || ok=false
          ;;
        webp)
          magick "$work" -resize "$resize" -strip \
            -quality $Q_WEBP "$out" 2>/dev/null || ok=false
          ;;
        jpg)
          magick "$work" -resize "$resize" -strip \
            -quality $Q_JPEG -interlace Plane "$out" 2>/dev/null || ok=false
          ;;
        png)
          magick "$work" -resize "$resize" -strip \
            -define "png:compression-level=$PNG_COMPRESS" \
            "$out" 2>/dev/null || ok=false
          ;;
      esac

      if $ok; then
        (( n_gen++ )) || true
      else
        (( n_err++ )) || true
        echo "$slug/$stem/$vname.$fmt" >> "$TMP_DIR/errors"
      fi
    done
  done

  [[ -n "$tmp_work" ]] && rm -f "$tmp_work"

  # Append per-file stats (one number per line, aggregated at end)
  echo "$n_gen"  >> "$TMP_DIR/generated"
  echo "$n_skip" >> "$TMP_DIR/skipped"
  echo "$n_err"  >> "$TMP_DIR/errors_count"

  local alpha_label=""
  $transparent && alpha_label=" [alpha]"
  printf "  %-50s  +%d new  %d skip  %d err%s\n" \
    "$slug/$(basename "$src")" "$n_gen" "$n_skip" "$n_err" "$alpha_label"
}

process_slug() {
  local slug_dir="$1"
  local slug
  slug=$(basename "$slug_dir")

  # Only top-level files; subfolders are already variant outputs
  while IFS= read -r -d '' src; do
    local base ext stem
    base=$(basename "$src")
    ext="${base##*.}"
    ext="${ext,,}"   # normalize to lowercase
    # Normalize jpeg -> jpg
    [[ "$ext" == "jpeg" ]] && ext="jpg"
    stem="${base%.*}"
    process_file "$src" "$slug" "$stem" "$ext"
  done < <(find "$slug_dir" -maxdepth 1 -type f \
    \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.webp" \) \
    -print0)
}

# ---- main -------------------------------------------------------------------

echo "=== ardmag image optimizer ==="
echo "Source:      $SRC_DIR"
echo "Destination: $DST_DIR"
echo "Variants:    ${VARIANTS[*]}"
echo "Jobs:        $MAX_JOBS parallel"
echo ""

total_src=$(find "$SRC_DIR" -maxdepth 2 -type f \
  \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.webp" \) | wc -l)
echo "Source images: $total_src"
echo ""

src_bytes=$(du -sb "$SRC_DIR" 2>/dev/null | cut -f1)

t_start=$(date +%s)

# Slug-level parallelism
jobs_running=0
for slug_dir in "$SRC_DIR"/*/; do
  [[ -d "$slug_dir" ]] || continue
  process_slug "$slug_dir" &
  (( jobs_running++ )) || true
  if (( jobs_running >= MAX_JOBS )); then
    wait -n 2>/dev/null || wait
    (( jobs_running-- )) || true
  fi
done
wait

t_end=$(date +%s)
elapsed=$(( t_end - t_start ))

total_gen=$(awk '{s+=$1} END{print s+0}' "$TMP_DIR/generated"    2>/dev/null || echo 0)
total_skip=$(awk '{s+=$1} END{print s+0}' "$TMP_DIR/skipped"     2>/dev/null || echo 0)
total_err=$(awk '{s+=$1} END{print s+0}' "$TMP_DIR/errors_count" 2>/dev/null || echo 0)

dst_bytes=$(du -sb "$DST_DIR" 2>/dev/null | cut -f1 || echo 0)
src_mb=$(( src_bytes / 1048576 ))
dst_mb=$(( dst_bytes / 1048576 ))

echo ""
echo "=== Results ==="
printf "Time:       %ds\n" "$elapsed"
printf "Generated:  %d files\n" "$total_gen"
printf "Skipped:    %d files (up to date)\n" "$total_skip"
printf "Errors:     %d\n" "$total_err"
printf "Source:     %dMB -> Variants: %dMB\n" "$src_mb" "$dst_mb"

if (( total_err > 0 )); then
  echo ""
  echo "Failed files:"
  sort -u "$TMP_DIR/errors" 2>/dev/null || true
fi
