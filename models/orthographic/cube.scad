// 立方體（60×60×60，邊緣做小導角）
include <_common.scad>

module chamfered_cube(size, chamfer = CHAMFER) {
  s = size;
  c = chamfer;
  hull() {
    // 8 個內縮的小立方體用 hull 包起來就會有導角效果
    for (x = [c, s - c]) for (y = [c, s - c]) for (z = [c, s - c])
      translate([x, y, z]) sphere(r = c, $fn = 16);
  }
}

translate([-30, -30, -30]) chamfered_cube(60);
