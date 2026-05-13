#!/usr/bin/env bash
# 自動把 models/**/*.scad 編譯成同位置的 .stl 與 .png
# 用法：bash scripts/build_models.sh           # 全部編譯
#       bash scripts/build_models.sh orthographic   # 只編譯指定工具
#       bash scripts/build_models.sh orthographic --png-only  # 只重新出 PNG

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OPENSCAD="/Applications/OpenSCAD-2021.01.app/Contents/MacOS/OpenSCAD"

if [ ! -x "$OPENSCAD" ]; then
  echo "❌ OpenSCAD CLI not found at $OPENSCAD"
  exit 1
fi

TARGET="${1:-*}"
MODE="${2:-all}"
COLOR_SCHEME="Tomorrow Night"   # 深色配色與平台 UI 一致
IMG_SIZE="240,240"               # 等角預覽圖標準尺寸

COUNT_STL=0
COUNT_PNG=0
FAILED=0

for scad in $(find "$ROOT/models/$TARGET" -name "*.scad" -not -name "_*" -not -name "._*" 2>/dev/null); do
  base="${scad%.scad}"
  stl="${base}.stl"
  png="${base}-iso.png"

  if [ "$MODE" != "--png-only" ]; then
    if [ -f "$stl" ] && [ "$stl" -nt "$scad" ]; then
      echo "⏭  skip $(basename "$stl")"
    else
      echo "🔨 STL  $(basename "$scad")..."
      if "$OPENSCAD" -o "$stl" "$scad" 2>&1 | grep -E "^ERROR" >&2; then
        FAILED=$((FAILED + 1))
      fi
      [ -f "$stl" ] && COUNT_STL=$((COUNT_STL + 1))
    fi
  fi

  if [ ! -f "$png" ] || [ "$scad" -nt "$png" ] || [ "$MODE" = "--png-only" ]; then
    echo "🖼  PNG  $(basename "$scad")..."
    "$OPENSCAD" --imgsize="$IMG_SIZE" --autocenter --viewall \
      --colorscheme="$COLOR_SCHEME" -o "$png" "$scad" 2>&1 | grep -E "^ERROR" >&2 || true
    [ -f "$png" ] && COUNT_PNG=$((COUNT_PNG + 1))
  fi
done

echo ""
echo "✅ Built $COUNT_STL STL + $COUNT_PNG PNG. Failed: $FAILED"
