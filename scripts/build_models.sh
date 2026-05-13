#!/usr/bin/env bash
# 自動把 models/**/*.scad 編譯成同位置的 .stl
# 用法：bash scripts/build_models.sh           # 全部編譯
#       bash scripts/build_models.sh orthographic   # 只編譯指定工具

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OPENSCAD="/Applications/OpenSCAD-2021.01.app/Contents/MacOS/OpenSCAD"

if [ ! -x "$OPENSCAD" ]; then
  echo "❌ OpenSCAD CLI not found at $OPENSCAD"
  exit 1
fi

TARGET="${1:-*}"
COUNT=0
FAILED=0

for scad in $(find "$ROOT/models/$TARGET" -name "*.scad" -not -name "._*" 2>/dev/null); do
  stl="${scad%.scad}.stl"
  if [ -f "$stl" ] && [ "$stl" -nt "$scad" ]; then
    echo "⏭  skip $stl (newer than source)"
    continue
  fi
  echo "🔨 $(basename "$scad")..."
  if "$OPENSCAD" -o "$stl" "$scad" 2>&1 | grep -E "ERROR|WARNING: " >&2; then
    FAILED=$((FAILED + 1))
  fi
  if [ -f "$stl" ]; then
    SIZE=$(stat -f%z "$stl")
    echo "   ✓ $stl ($SIZE bytes)"
    COUNT=$((COUNT + 1))
  fi
done

echo ""
echo "✅ Built $COUNT model(s). Failed: $FAILED"
